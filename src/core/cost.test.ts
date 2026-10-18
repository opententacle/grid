import { describe, expect, it } from "vitest";
import { capacityChargeMonth, monthCost, yearCost, yearWindow } from "./cost";
import {
  EAG_2026,
  GRID_AREAS,
  gridAreaById,
  tariffAt,
  tariffFor,
  WIENER_NETZE_TARIFFS,
} from "./tariffs";
import type { MonthStats } from "./types";

const t2026 = tariffFor(WIENER_NETZE_TARIFFS, 2026);
const t2027 = tariffFor(WIENER_NETZE_TARIFFS, 2027);
const t2030 = tariffFor(WIENER_NETZE_TARIFFS, 2030);

function month(over: Partial<MonthStats> = {}): MonthStats {
  return {
    key: "2026-01",
    year: 2026,
    month: 1,
    kwh: 300,
    snapKwh: 0,
    peakKw: 4,
    peakAt: 0,
    readings: 2976,
    expectedReadings: 2976,
    start: 0,
    end: 2976,
    ...over,
  };
}

const NO_ENERGY = { priceCt: 0, baseFeeMonth: 0 };

describe("tariffs", () => {
  it("has a phased model from 2027 to the final stage 2029", () => {
    const years = WIENER_NETZE_TARIFFS.map((t) => [t.year, t.energyCt, t.capacity?.lowEurKwYear]);
    expect(years).toEqual([
      [2026, 6.98, undefined],
      [2027, 7.36, 19],
      [2028, 5.95, 26.41],
      [2029, 4.53, 33.82],
      [2030, 4.53, 33.82],
    ]);
    expect(t2030.capacity?.highEurKwYear).toBe(67.64);
  });

  it("has no metering fee and no flat fee from 2027 (SNE-G-V § 5 Abs. 1)", () => {
    for (const t of WIENER_NETZE_TARIFFS.filter((x) => x.year >= 2027)) {
      expect(t.meterEurMonth).toBe(0);
      expect(t.flatFeeYear).toBe(0);
    }
    expect(t2026.meterEurMonth).toBe(2.18);
  });

  it("selects the tariff valid at a date", () => {
    expect(tariffAt(WIENER_NETZE_TARIFFS, new Date(2026, 9, 15)).year).toBe(2026);
    expect(tariffAt(WIENER_NETZE_TARIFFS, new Date(2031, 0, 1)).year).toBe(2030);
    expect(tariffAt(WIENER_NETZE_TARIFFS, new Date(2020, 0, 1)).year).toBe(2026);
  });
});

describe("grid areas", () => {
  it("has the 2026 prices of SNE-V 2018 idF BGBl. II Nr. 305/2025 for Netzebene 7", () => {
    const rows = GRID_AREAS.map((a) => {
      const t = a.tariffs[0];
      return [
        a.id,
        t.year,
        t.energyCt,
        t.flatFeeYear,
        t.lossCt,
        t.meterEurMonth,
        t.levies.usageTaxRate,
      ];
    });
    expect(rows).toEqual([
      ["wien", 2026, 6.98, 54, 0.7, 2.18, 0.07],
      ["noe", 2026, 8.79, 54, 0.384, 2.18, 0],
      ["ooe", 2026, 6.29, 54, 0.528, 2.4, 0],
      ["linz", 2026, 5.57, 54, 0.487, 2.38, 0],
    ]);
    expect(GRID_AREAS.filter((a) => a.meterIsMaximum).map((a) => a.id)).toEqual(["ooe"]);
  });

  it("uses the same E-Control model values from 2027 in all areas", () => {
    const model = (id: string) =>
      gridAreaById(id)
        .tariffs.slice(1)
        .map((t) => [t.year, t.energyCt, t.capacity, t.flatFeeYear, t.meterEurMonth]);
    for (const a of GRID_AREAS) expect(model(a.id)).toEqual(model("wien"));
  });

  it("keeps the grid loss fee and levies of the area from 2027", () => {
    for (const a of GRID_AREAS) {
      for (const t of a.tariffs) {
        expect(t.lossCt).toBe(a.tariffs[0].lossCt);
        expect(t.levies.usageTaxRate).toBe(a.tariffs[0].levies.usageTaxRate);
      }
    }
  });

  it("charges the same renewable energy contribution in all areas in 2026", () => {
    const m = month({ kwh: 300, snapKwh: 40 });
    for (const a of GRID_AREAS) {
      const c = monthCost(m, a.tariffs[0], NO_ENERGY);
      const eag = c.levies - (300 * 0.1) / 100 - 19.02 / 12;
      expect(eag).toBeCloseTo(
        (300 * (EAG_2026.energyCt + EAG_2026.lossCt)) / 100 + EAG_2026.flatYear / 12,
      );
    }
  });

  it("charges the Gebrauchsabgabe only in Vienna", () => {
    const m = month();
    expect(monthCost(m, gridAreaById("wien").tariffs[0], NO_ENERGY).usageTax).toBeGreaterThan(0);
    for (const id of ["noe", "ooe", "linz"]) {
      expect(monthCost(m, gridAreaById(id).tariffs[0], NO_ENERGY).usageTax).toBe(0);
    }
  });

  it("calculates the 2026 grid fees of Linz Netz", () => {
    // 300 kWh, 40 kWh in the SNAP window: energy 300 × 5.57 − 40 × 5.57 × 0.2, loss 300 × 0.487
    const c = monthCost(
      month({ kwh: 300, snapKwh: 40 }),
      gridAreaById("linz").tariffs[0],
      NO_ENERGY,
    );
    expect(c.gridEnergy).toBeCloseTo((300 * 5.57 - 40 * 5.57 * 0.2 + 300 * 0.487) / 100);
    expect(c.gridCapacity).toBeCloseTo(54 / 12);
    expect(c.gridOther).toBeCloseTo(2.38);
  });

  it("falls back to Wiener Netze for an unknown id", () => {
    expect(gridAreaById("unknown").id).toBe("wien");
    expect(WIENER_NETZE_TARIFFS).toBe(gridAreaById("wien").tariffs);
  });
});

describe("capacityChargeMonth", () => {
  it("uses one price without threshold and minimum from January to November 2027", () => {
    expect(capacityChargeMonth(12, t2027, 1)).toBeCloseTo((12 * 19) / 12);
    expect(capacityChargeMonth(0.5, t2027, 11)).toBeCloseTo((0.5 * 19) / 12);
    expect(capacityChargeMonth(0, t2027, 6)).toBe(0);
  });

  it("uses threshold and minimum again from December 2027", () => {
    expect(capacityChargeMonth(12, t2027, 12)).toBeCloseTo((10 * 19 + 2 * 38) / 12);
    expect(capacityChargeMonth(0.5, t2027, 12)).toBeCloseTo((2 * 19) / 12);
  });

  it("uses the flat fee before 2027", () => {
    expect(capacityChargeMonth(12, t2026)).toBeCloseTo(54 / 12);
  });
  it("bills at least 2 kW", () => {
    expect(capacityChargeMonth(0.5, t2030)).toBeCloseTo((2 * 33.82) / 12);
  });
  it("doubles the price above 10 kW", () => {
    expect(capacityChargeMonth(12, t2030)).toBeCloseTo((10 * 33.82 + 2 * 67.64) / 12);
  });
});

describe("monthCost", () => {
  it("computes grid energy with SNAP reduction and losses", () => {
    const c = monthCost(month({ kwh: 100, snapKwh: 50 }), t2026, NO_ENERGY);
    expect(c.gridEnergy).toBeCloseTo((100 * 6.98 - 50 * 6.98 * 0.2 + 100 * 0.7) / 100);
  });

  it("adds levies, usage tax and VAT", () => {
    const c = monthCost(month({ kwh: 100 }), t2026, { priceCt: 10, baseFeeMonth: 2 });
    expect(c.energy).toBeCloseTo(12);
    expect(c.levies).toBeCloseTo((100 * (0.1 + 0.583 + 0.037)) / 100 + 3.796 / 12 + 19.02 / 12);
    const base = c.energy + c.gridEnergy + c.gridCapacity + c.gridOther;
    expect(c.usageTax).toBeCloseTo(base * 0.07);
    expect(c.net).toBeCloseTo(base + c.levies + c.usageTax);
    expect(c.gross).toBeCloseTo(c.net * 1.2);
  });

  it("bills no metering fee from 2027", () => {
    expect(monthCost(month(), t2030, NO_ENERGY).gridOther).toBe(0);
  });

  it("uses the calendar month of the data for the 2027 transition rule", () => {
    const jan = monthCost(month({ month: 1, peakKw: 12 }), t2027, NO_ENERGY);
    const dec = monthCost(month({ month: 12, peakKw: 12 }), t2027, NO_ENERGY);
    expect(jan.gridCapacity).toBeCloseTo(19);
    expect(dec.gridCapacity).toBeCloseTo((10 * 19 + 2 * 38) / 12);
  });

  it("prorates fixed fees for partial months", () => {
    const c = monthCost(month({ readings: 1488 }), t2026, NO_ENERGY);
    expect(c.gridOther).toBeCloseTo(2.18 / 2);
  });
});

describe("yearCost", () => {
  const twelve = Array.from({ length: 12 }, (_, i) =>
    month({ key: `2026-${i + 1}`, month: i + 1 }),
  );

  it("sums 12 complete months without scaling", () => {
    const y = yearCost(twelve, t2026, NO_ENERGY);
    expect(y.scale).toBe(1);
    expect(y.months).toHaveLength(12);
    expect(y.total.gridOther).toBeCloseTo(12 * 2.18);
  });

  it("scales 6 months to one year", () => {
    const y = yearCost(twelve.slice(0, 6), t2026, NO_ENERGY);
    expect(y.scale).toBe(2);
    expect(y.total.gridOther).toBeCloseTo(12 * 2.18);
  });

  it("uses the last 12 complete months", () => {
    const partial = month({ key: "2025-12", readings: 100 });
    const extra = month({ key: "2027-01" });
    expect(yearWindow([partial, ...twelve, extra]).map((m) => m.key)).toEqual([
      ...twelve.slice(1).map((m) => m.key),
      "2027-01",
    ]);
  });

  it("charges more with a high peak under the new model", () => {
    const low = yearCost(twelve, t2030, NO_ENERGY).total.gridCapacity;
    const high = yearCost(
      twelve.map((m) => ({ ...m, peakKw: 11 })),
      t2030,
      NO_ENERGY,
    ).total.gridCapacity;
    expect(low).toBeCloseTo(4 * 33.82);
    expect(high).toBeCloseTo(10 * 33.82 + 67.64);
  });
});

/**
 * Reference values from a real Wien Energie / Wiener Netze bill
 * (01.04.2026–29.09.2026: 182 days, 690 kWh, 192 kWh in the SNAP window, 2026 prices).
 */
describe("bill reconciliation 2026", () => {
  const months = Array.from({ length: 6 }, (_, i) =>
    month({ key: `2026-0${i + 4}`, month: i + 4, kwh: 115, snapKwh: 32 }),
  );
  const costs = months.map((m) => monthCost(m, t2026, NO_ENERGY));
  const sum = (f: (c: (typeof costs)[number]) => number) => costs.reduce((a, c) => a + f(c), 0);

  it("matches the grid fees line by line", () => {
    // Arbeitspreis 34.76 + SNAP 10.71 + Netzverlust 4.83
    expect(sum((c) => c.gridEnergy)).toBeCloseTo(34.76 + 10.71 + 4.83, 1);
    // Grundpreis 26.93 for 182 days; the app bills 6 full months (27.00)
    expect(sum((c) => c.gridCapacity)).toBeCloseTo(26.93, 0);
    // Messentgelt 13.04 for 182 days
    expect(sum((c) => c.gridOther)).toBeCloseTo(13.04, 0);
  });

  it("matches Gebrauchsabgabe Netznutzung (7 %)", () => {
    expect(sum((c) => c.usageTax)).toBeCloseTo(6.32, 1);
  });

  it("matches Erneuerbaren-Förderbeitrag", () => {
    // 1.89 (Grundpreis) + 4.02 (Arbeitspreis) + 0.26 (Netzverlust)
    const eag = sum((c) => c.levies) - (690 * 0.1) / 100 - 19.02 / 2;
    expect(eag).toBeCloseTo(1.89 + 4.02 + 0.26, 1);
  });
});
