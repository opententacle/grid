import { describe, expect, it } from "vitest";
import { capacityChargeMonth, monthCost, yearCost, yearWindow } from "./cost";
import {
  areaForCode,
  EAG_2026,
  FLAT_FEE_2027,
  finalStage,
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
  it("has the Wien draft values for 2027 and a phased path to the final stage 2029", () => {
    const years = WIENER_NETZE_TARIFFS.map((t) => [t.year, t.energyCt, t.capacity?.lowEurKwYear]);
    expect(years).toEqual([
      [2026, 6.98, undefined],
      [2027, 5.47, 29.52],
      [2028, 4.84, 30.45],
      [2029, 4.2, 31.38],
      [2030, 4.2, 31.38],
    ]);
    // SNE-T-V 2027 draft, Netzbereich Wien: 246 and 369 ct/kW per month
    expect(t2027.capacity?.lowEurKwYear).toBeCloseTo((246 * 12) / 100);
    expect(t2027.capacity?.highEurKwYear).toBeCloseTo((369 * 12) / 100);
    expect(t2030.capacity?.highEurKwYear).toBe(47.07);
  });

  it("uses the old structure from January to November 2027 (SNE-G-V § 6 Abs. 3a)", () => {
    expect(t2027.oldSystem).toEqual({ untilMonth: 11, energyCt: 6.49, flatFeeYear: FLAT_FEE_2027 });
    expect(FLAT_FEE_2027).toBe(54 + 12 * 2.4);
    for (const t of WIENER_NETZE_TARIFFS.filter((x) => x.year >= 2028)) {
      expect(t.oldSystem).toBeUndefined();
    }
  });

  it("has no metering fee and no flat fee in the new structure (SNE-G-V § 5 Abs. 1)", () => {
    for (const t of WIENER_NETZE_TARIFFS.filter((x) => x.year >= 2027)) {
      expect(t.meterEurMonth).toBe(0);
      expect(t.flatFeeYear).toBe(0);
    }
    expect(t2026.meterEurMonth).toBe(2.18);
  });

  it("moves to the final stage like the E-Control model", () => {
    // The model start stage itself must give the model final stage.
    expect(finalStage(7.36, 19)).toEqual({ energyCt: 4.53, low: 33.82 });
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
      ["burgenland", 2026, 8.46, 54, 0, 2.4, 0],
      ["kaernten", 2026, 9.67, 54, 0.368, 2.4, 0],
      ["klagenfurt", 2026, 6.9, 54, 0.578, 2.4, 0],
      ["noe", 2026, 8.79, 54, 0.384, 2.18, 0],
      ["ooe", 2026, 6.29, 54, 0.528, 2.4, 0],
      ["linz", 2026, 5.57, 54, 0.487, 2.38, 0],
      ["salzburg", 2026, 6.59, 54, 0.357, 2.3, 0],
      ["steiermark", 2026, 8.82, 54, 0.336, 2.4, 0],
      ["graz", 2026, 5.17, 54, 0.658, 2.1, 0],
      ["tirol", 2026, 6.81, 54, 0.293, 2.4, 0],
      ["innsbruck", 2026, 8.03, 54, 0.453, 2.4, 0],
      ["vorarlberg", 2026, 4.96, 54, 0.393, 1.6, 0],
      ["kleinwalsertal", 2026, 17.73, 54, 0.401, 2.4, 0],
    ]);
    expect(GRID_AREAS.filter((a) => a.meterIsMaximum).map((a) => a.id)).toEqual(["ooe"]);
  });

  it("reproduces the E-Control tables for 3,500 kWh (press release 29.10.2026)", () => {
    // ct/kWh net, grid use + grid loss; old structure / new structure with 4 kW
    const table: Record<string, [number, number]> = {
      wien: [9.56, 9.54],
      burgenland: [10.81, 11.0],
      kaernten: [13.6, 12.98],
      klagenfurt: [9.27, 9.53],
      noe: [10.16, 9.71],
      ooe: [9.36, 9.06],
      linz: [8.66, 8.91],
      salzburg: [9.28, 8.36],
      steiermark: [11.01, 11.06],
      graz: [8.47, 8.8],
      tirol: [9.56, 8.65],
      innsbruck: [11.31, 11.56],
      vorarlberg: [7.06, 6.86],
      kleinwalsertal: [19.39, 19.0],
    };
    expect(Object.keys(table)).toEqual(GRID_AREAS.map((a) => a.id));
    for (const a of GRID_AREAS) {
      const t = tariffFor(a.tariffs, 2027);
      const old = t.oldSystem;
      if (!old || !t.capacity) throw new Error(a.id);
      const oldCt = old.energyCt + t.lossCt + (old.flatFeeYear / 3500) * 100;
      const newCt = t.energyCt + t.lossCt + ((4 * t.capacity.lowEurKwYear) / 3500) * 100;
      expect(Math.abs(oldCt - table[a.id][0]), a.id).toBeLessThan(0.006);
      expect(Math.abs(newCt - table[a.id][1]), a.id).toBeLessThan(0.012);
    }
  });

  it("uses 1.5 times the price above 10 kW in all areas", () => {
    for (const a of GRID_AREAS) {
      for (const t of a.tariffs.filter((x) => x.capacity)) {
        const c = t.capacity;
        expect(c && c.highEurKwYear / c.lowEurKwYear, `${a.id} ${t.year}`).toBeCloseTo(1.5, 2);
      }
    }
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
      const eag = c.levies - (300 * a.tariffs[0].levies.electricityTaxCt) / 100 - 19.02 / 12;
      expect(eag).toBeCloseTo(
        (300 * (EAG_2026.energyCt + EAG_2026.lossCt)) / 100 + EAG_2026.flatYear / 12,
      );
    }
  });

  it("charges the local levies of Vienna, Salzburg, Klagenfurt and Kleinwalsertal", () => {
    const m = month({ kwh: 300 });
    const usage = (id: string) => monthCost(m, gridAreaById(id).tariffs[0], NO_ENERGY).usageTax;
    const wien = monthCost(m, gridAreaById("wien").tariffs[0], NO_ENERGY);
    expect(wien.usageTax).toBeCloseTo(
      (wien.gridEnergy + wien.gridCapacity + wien.gridOther) * 0.07,
    );
    expect(usage("salzburg")).toBeCloseTo((300 * 0.3789) / 100);
    expect(usage("klagenfurt")).toBeCloseTo((300 * 1.637) / 100);
    expect(usage("kleinwalsertal")).toBeCloseTo((300 * 0.0137) / 100);
    const withLevy = ["wien", "salzburg", "klagenfurt", "kleinwalsertal"];
    for (const a of GRID_AREAS.filter((x) => !withLevy.includes(x.id))) expect(usage(a.id)).toBe(0);
  });

  it("uses German electricity tax and VAT in Kleinwalsertal", () => {
    const l = gridAreaById("kleinwalsertal").tariffs[0].levies;
    expect([l.electricityTaxCt, l.vatRate]).toEqual([2.05, 0.19]);
    const c = monthCost(month(), gridAreaById("kleinwalsertal").tariffs[0], NO_ENERGY);
    expect(c.vat).toBeCloseTo(c.net * 0.19);
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

  it("finds the grid area for an operator code", () => {
    const m = (code: string) => {
      const r = areaForCode(code);
      return r && [r.area.id, r.operator?.name];
    };
    expect(m("AT003100")).toEqual(["linz", "Linz Netz"]);
    expect(m("AT008100")).toEqual(["graz", "Stromnetz Graz"]);
    expect(m("AT006230")).toEqual(["kleinwalsertal", "Energieversorgung Kleinwalsertal"]);
    // Small operator: prices of its grid area
    expect(m("AT003300")).toEqual(["ooe", "eww ag"]);
    // Unknown operator: grid area of the federal state (first digit of the operator number)
    expect(m("AT005999")).toEqual(["tirol", undefined]);
    expect(m("AT000000")).toBe(undefined);
  });

  it("falls back to Wiener Netze for an unknown id", () => {
    expect(gridAreaById("unknown").id).toBe("wien");
    expect(WIENER_NETZE_TARIFFS).toBe(gridAreaById("wien").tariffs);
  });
});

describe("capacityChargeMonth", () => {
  it("uses the flat fee from January to November 2027, whatever the peak", () => {
    expect(capacityChargeMonth(12, t2027, 1)).toBeCloseTo(82.8 / 12);
    expect(capacityChargeMonth(0.5, t2027, 11)).toBeCloseTo(82.8 / 12);
  });

  it("uses the capacity price with threshold and minimum from December 2027", () => {
    expect(capacityChargeMonth(12, t2027, 12)).toBeCloseTo((10 * 29.52 + 2 * 44.28) / 12);
    expect(capacityChargeMonth(0.5, t2027, 12)).toBeCloseTo((2 * 29.52) / 12);
  });

  it("uses the flat fee before 2027", () => {
    expect(capacityChargeMonth(12, t2026)).toBeCloseTo(54 / 12);
  });
  it("bills at least 2 kW", () => {
    expect(capacityChargeMonth(0.5, t2030)).toBeCloseTo((2 * 31.38) / 12);
  });
  it("uses the higher price above 10 kW", () => {
    expect(capacityChargeMonth(12, t2030)).toBeCloseTo((10 * 31.38 + 2 * 47.07) / 12);
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
    const jan = monthCost(month({ month: 1, kwh: 100, peakKw: 12 }), t2027, NO_ENERGY);
    const dec = monthCost(month({ month: 12, kwh: 100, peakKw: 12 }), t2027, NO_ENERGY);
    expect(jan.gridCapacity).toBeCloseTo(82.8 / 12);
    expect(jan.gridEnergy).toBeCloseTo((100 * (6.49 + 0.7)) / 100);
    expect(dec.gridCapacity).toBeCloseTo((10 * 29.52 + 2 * 44.28) / 12);
    expect(dec.gridEnergy).toBeCloseTo((100 * (5.47 + 0.7)) / 100);
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
    expect(low).toBeCloseTo(4 * 31.38);
    expect(high).toBeCloseTo(10 * 31.38 + 47.07);
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
