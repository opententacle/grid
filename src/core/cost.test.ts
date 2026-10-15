import { describe, expect, it } from "vitest";
import { capacityChargeMonth, monthCost, yearCost, yearWindow } from "./cost";
import { tariffAt, tariffFor, WIENER_NETZE_TARIFFS } from "./tariffs";
import type { MonthStats } from "./types";

const t2026 = tariffFor(WIENER_NETZE_TARIFFS, 2026);
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
  it("has a phased model from 2027 to 2030", () => {
    const years = WIENER_NETZE_TARIFFS.map((t) => [t.year, t.energyCt, t.capacity?.lowEurKwYear]);
    expect(years).toEqual([
      [2026, 6.98, undefined],
      [2027, 7.36, 19],
      [2028, 6.42, 23.94],
      [2029, 5.47, 28.88],
      [2030, 4.53, 33.82],
    ]);
    expect(t2030.capacity?.highEurKwYear).toBe(67.64);
  });

  it("selects the tariff valid at a date", () => {
    expect(tariffAt(WIENER_NETZE_TARIFFS, new Date(2026, 9, 15)).year).toBe(2026);
    expect(tariffAt(WIENER_NETZE_TARIFFS, new Date(2031, 0, 1)).year).toBe(2030);
    expect(tariffAt(WIENER_NETZE_TARIFFS, new Date(2020, 0, 1)).year).toBe(2026);
  });
});

describe("capacityChargeMonth", () => {
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
