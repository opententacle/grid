import { afterEach, describe, expect, it } from "vitest";
import { setLocale } from "../i18n/i18n";
import { fmtDate, fmtDateTime, fmtEur, fmtMonth, fmtNum, fmtPct } from "./format";

// Intl output can contain narrow no-break spaces; normalize them for the assertions.
const n = (s: string) => s.replace(/[  ]/g, " ");

afterEach(() => setLocale("de"));

describe("format", () => {
  it("formats German numbers, currency and dates", () => {
    setLocale("de");
    // The de-AT group separator depends on the ICU version (space or dot).
    expect(n(fmtNum(1234.5, 1))).toMatch(/^1[ .]234,5$/);
    expect(n(fmtEur(1234.567, 2))).toMatch(/^€ 1[ .]234,57$/);
    expect(fmtPct(0.025)).toBe("+2,5 %".replace(" ", " "));
    expect(fmtDate(new Date(2026, 9, 15))).toBe("15.10.2026");
    expect(fmtMonth(2026, 1, "long")).toBe("Jänner 2026");
    expect(fmtDateTime(new Date(2026, 9, 15, 16, 45))).toContain("16:45");
  });

  it("formats English values", () => {
    setLocale("en");
    expect(fmtNum(1234.5, 1)).toBe("1,234.5");
    expect(fmtEur(10)).toBe("€10");
    expect(fmtPct(-0.1)).toBe("-10%");
    expect(fmtMonth(2026, 1)).toBe("Jan 26");
  });
});
