import { afterEach, describe, expect, it, vi } from "vitest";
import { de } from "./de";
import { en } from "./en";
import { EXPLAIN } from "./explain";
import { detectLocale, getLocale, intlLocale, onLocaleChange, setLocale, t } from "./i18n";

afterEach(() => setLocale("de"));

describe("detectLocale", () => {
  it("uses the first German or English browser language", () => {
    expect(detectLocale(["de-AT", "en"])).toBe("de");
    expect(detectLocale(["fr", "en-US", "de"])).toBe("en");
    expect(detectLocale(["DE-de"])).toBe("de");
  });
  it("falls back to English", () => {
    expect(detectLocale(["fr", "it"])).toBe("en");
    expect(detectLocale([])).toBe("en");
  });
});

describe("t", () => {
  it("replaces all parameters", () => {
    setLocale("en");
    expect(t("kpi.selected", { year: 2027 })).toBe("Yearly cost with tariff 2027");
    expect(t("upload.loaded", { rows: 1, from: "a", to: "b", kwh: 2 })).toBe(
      "1 quarter-hour values · a – b · 2 kWh",
    );
  });
  it("returns the text of the active language", () => {
    setLocale("de");
    expect(t("app.title")).toBe("Netzkosten-Rechner");
    expect(intlLocale()).toBe("de-AT");
    setLocale("en");
    expect(t("app.title")).toBe("Grid Fee Calculator");
    expect(intlLocale()).toBe("en-GB");
  });
});

describe("setLocale", () => {
  it("stores the choice, sets <html lang> and notifies listeners", () => {
    setLocale("de");
    const fn = vi.fn();
    const off = onLocaleChange(fn);
    setLocale("en");
    expect(getLocale()).toBe("en");
    expect(document.documentElement.lang).toBe("en");
    expect(localStorage.getItem("gc.locale")).toBe("en");
    expect(fn).toHaveBeenCalledTimes(1);
    setLocale("en");
    expect(fn).toHaveBeenCalledTimes(1);
    off();
    setLocale("de");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("works when storage is blocked", () => {
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    setLocale("en");
    expect(getLocale()).toBe("en");
    spy.mockRestore();
  });
});

describe("messages", () => {
  it("German and English have the same keys and no empty texts", () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(de).sort());
    for (const v of [...Object.values(de), ...Object.values(en)]) expect(v.trim()).not.toBe("");
  });
  it("the calculation page has the same sections in both languages", () => {
    expect(EXPLAIN.en.sections.map((s) => s.id)).toEqual(EXPLAIN.de.sections.map((s) => s.id));
    expect(Object.keys(EXPLAIN.en.tables)).toEqual(Object.keys(EXPLAIN.de.tables));
  });
});
