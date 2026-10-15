import { describe, expect, it } from "vitest";
import { analyze, inSnapWindow, isComplete } from "./analyze";
import { parseWienerNetze } from "./parse-wienernetze";
import { buildCsv } from "./test-utils";

describe("analyze", () => {
  it("aggregates per month with peak as kW (kWh × 4)", () => {
    const csv = buildCsv(new Date(2026, 0, 30), 3, (d) =>
      d.getDate() === 31 && d.getHours() === 18 && d.getMinutes() === 0 ? 2.5 : 0.1,
    );
    const a = analyze(parseWienerNetze(csv));
    expect(a.months.map((m) => m.key)).toEqual(["2026-01", "2026-02"]);
    const [jan, feb] = a.months;
    expect(jan.readings).toBe(192);
    expect(jan.kwh).toBeCloseTo(191 * 0.1 + 2.5);
    expect(jan.peakKw).toBe(10);
    expect(new Date(jan.peakAt).getHours()).toBe(18);
    expect(feb.peakKw).toBe(0.4);
    expect(feb.start).toBe(192);
    expect(feb.end).toBe(288);
    expect(a.totalKwh).toBeCloseTo(jan.kwh + feb.kwh);
  });

  it("rounds the peak to 2 decimals", () => {
    const a = analyze([{ t: new Date(2026, 0, 1).getTime(), kwh: 0.12345 }]);
    expect(a.months[0].peakKw).toBe(0.49);
  });

  it("counts SNAP consumption only in summer 10–16 h", () => {
    expect(inSnapWindow(new Date(2026, 5, 1, 10, 0))).toBe(true);
    expect(inSnapWindow(new Date(2026, 5, 1, 15, 45))).toBe(true);
    expect(inSnapWindow(new Date(2026, 5, 1, 16, 0))).toBe(false);
    expect(inSnapWindow(new Date(2026, 2, 31, 12, 0))).toBe(false);
    expect(inSnapWindow(new Date(2026, 9, 1, 12, 0))).toBe(false);
    const a = analyze(parseWienerNetze(buildCsv(new Date(2026, 5, 1), 1, () => 1)));
    expect(a.months[0].snapKwh).toBe(24);
  });

  it("marks incomplete months", () => {
    const a = analyze(parseWienerNetze(buildCsv(new Date(2026, 5, 1), 10, () => 1)));
    expect(isComplete(a.months[0])).toBe(false);
    const b = analyze(parseWienerNetze(buildCsv(new Date(2026, 5, 1), 30, () => 1)));
    expect(isComplete(b.months[0])).toBe(true);
  });
});
