import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildCsv } from "../core/test-utils";
import { setLocale } from "../i18n/i18n";
import { BODY_URLS, OPEN } from "../i18n/open";
import { setTheme } from "../theme";
import { GcApp } from "./gc-app";
import type { GcChartMonthly } from "./gc-chart-monthly";
import { $, $$, mount, settle } from "./test-helpers";

/** Twelve months of synthetic data: 0.1 kWh per quarter-hour, one 12 kW peak in January. */
const CSV = buildCsv(new Date(2025, 6, 1), 365, (d) =>
  d.getMonth() === 0 && d.getDate() === 15 && d.getHours() === 18 && d.getMinutes() === 0 ? 3 : 0.1,
);

async function upload(app: GcApp, text: string, how: "input" | "drop" = "input") {
  const file = new File([text], "export.csv", { type: "text/csv" });
  if (how === "input") {
    const input = $<HTMLInputElement>(app, "input[type=file]");
    Object.defineProperty(input, "files", { value: [file], configurable: true });
    input.dispatchEvent(new Event("change"));
  } else {
    const drop = $(app, ".drop");
    const ev = new Event("drop", { bubbles: true, cancelable: true });
    Object.defineProperty(ev, "dataTransfer", { value: { files: [file] } });
    drop.dispatchEvent(ev);
  }
  await settle(app);
}

const kpis = (app: GcApp) =>
  $$(app, ".kpis:not(.grid-kpis) .kpi .value").map((e) => e.textContent?.trim());

let app: GcApp;
beforeEach(async () => {
  setLocale("de");
  setTheme("light");
  app = await mount(new GcApp());
});
afterEach(() => app.remove());

describe("gc-app", () => {
  it("shows the steps and an empty result area", () => {
    expect($$(app, ".step-title h2").map((h) => h.textContent)).toEqual([
      "Datenquelle wählen",
      "Viertelstundenwerte hochladen",
      "Annahmen",
    ]);
    expect($(app, ".empty-results").textContent).toContain("Noch keine Daten");
    expect($(app, ".disclaimer").textContent).toContain("Haftungsausschluss");
    expect($(app, "a.badge.link").getAttribute("href")).toBe("./berechnung.html");
  });

  it("lists the open questions with the responsible bodies", () => {
    const items = $$<HTMLDetailsElement>(app, "#open-questions details");
    expect(items).toHaveLength(OPEN.de.items.length);
    expect(items.every((d) => !d.open)).toBe(true);
    const existing = $(app, "#open-existing");
    expect(existing.textContent).toContain("§ 34 Abs. 1");
    const hrefs = [...existing.querySelectorAll("a")].map((a) => a.getAttribute("href"));
    expect(hrefs).toEqual([BODY_URLS.econtrol, BODY_URLS.wienernetze]);
    expect($(app, "#open-questions .help a").getAttribute("href")).toMatch(/\/issues$/);
    expect($(app, "header.top a.nav").getAttribute("href")).toBe("./faq.html");
  });

  it("opens the open question in the URL", async () => {
    history.replaceState(null, "", "#open-existing");
    const other = await mount(new GcApp());
    expect($<HTMLDetailsElement>(other, "#open-existing").open).toBe(true);
    other.remove();
    history.replaceState(null, "", "/");
  });

  it("marks the 10 kW line with a footnote only for the 2027 transition year", async () => {
    await upload(app, CSV);
    const years = $$(app, ".years button");
    years[1].click();
    await app.updateComplete;
    expect($$(app, ".footnote")).toHaveLength(2);
    expect($(app, ".footnote").textContent).toContain("§ 6 Abs. 3a");
    expect($<GcChartMonthly>(app, "gc-chart-monthly").thresholdMark).toBe("¹");
    years[2].click();
    await app.updateComplete;
    expect($$(app, ".footnote")).toHaveLength(0);
    expect($<GcChartMonthly>(app, "gc-chart-monthly").thresholdMark).toBe("");
  });

  it("changes the instructions with the data source", async () => {
    const select = $<HTMLSelectElement>(app, "select.input");
    expect(select.options).toHaveLength(3);
    expect(select.value).toBe("e-control");
    expect($(app, ".instr a.btn").getAttribute("href")).toContain("e-control");
    select.value = "at-format";
    select.dispatchEvent(new Event("change"));
    await app.updateComplete;
    expect($(app, ".instr").textContent).toContain("AT-Format");
    expect($$(app, ".instr a.btn")).toHaveLength(0);
  });

  it("calculates today's tariff with the selected grid area", async () => {
    await upload(app, CSV);
    const select = $<HTMLSelectElement>(app, "select[name=area]");
    expect(select.options).toHaveLength(14);
    expect(select.value).toBe("wien");

    const todayGrid = () => $(app, ".grid-kpis .kpi .value").textContent;
    const wien = todayGrid();
    const selected = $(app, ".grid-kpis .kpi.selected .value").textContent;
    expect($(app, ".kpis .kpi").textContent).toContain("Netzbereich Wien");
    select.value = "linz";
    select.dispatchEvent(new Event("change"));
    await app.updateComplete;
    expect(todayGrid()).not.toBe(wien);
    expect($(app, ".kpis .kpi").textContent).toContain("Netzbereich Linz");
    // The 2027 model price is the same; only the grid loss fee and levies change.
    expect($(app, ".grid-kpis .kpi.selected .value").textContent).not.toBe(selected);
    expect(localStorage.getItem("gc.gridArea")).toBe("linz");
    const other = await mount(new GcApp());
    // jsdom does not update select.value from the selected attribute, so test the attribute.
    expect($(other, "select[name=area] option[selected]").getAttribute("value")).toBe("linz");
    other.remove();
    localStorage.removeItem("gc.gridArea");
  });

  it("selects the grid area from the metering point number in the file", async () => {
    const linz = CSV.replace(
      "AT0000000000000000000000000000000",
      "AT0031000402000000000000000123456",
    );
    await upload(app, linz);
    expect($(app, "select[name=area] option[selected]").getAttribute("value")).toBe("linz");
    expect($(app, ".area-note.ok").textContent).toContain("AT003100");
    expect($(app, ".kpis .kpi").textContent).toContain("Netzbereich Linz");
    // The test CSV has the operator code AT000000, which the app does not know.
    await upload(app, CSV);
    expect($(app, ".area-note.warn").textContent).toContain("AT000000");
    expect($(app, "select[name=area] option[selected]").getAttribute("value")).toBe("linz");
    localStorage.removeItem("gc.gridArea");
  });

  it("uses the grid area for small and unknown operators", async () => {
    const zp = (code: string) =>
      CSV.replace("AT0000000000000000000000000000000", `${code}4600000000000000000000123`);
    await upload(app, zp("AT003300"));
    expect($(app, "select[name=area] option[selected]").getAttribute("value")).toBe("ooe");
    expect($(app, ".area-note.ok").textContent).toContain("eww ag");
    expect($(app, ".area-note.ok").textContent).toContain("Messentgelt");
    await upload(app, zp("AT005999"));
    expect($(app, "select[name=area] option[selected]").getAttribute("value")).toBe("tirol");
    expect($(app, ".area-note.warn").textContent).toContain("Bundesland");
    localStorage.removeItem("gc.gridArea");
  });

  it("asks to check the grid area when the file has no metering point number", async () => {
    await upload(app, CSV.replace("AT0000000000000000000000000000000", "AT000"));
    expect($(app, ".area-note.warn").textContent).toContain("keine Zählpunktnummer");
    $<HTMLSelectElement>(app, "select[name=area]").dispatchEvent(new Event("change"));
    await app.updateComplete;
    expect($$(app, ".area-note")).toHaveLength(0);
    localStorage.removeItem("gc.gridArea");
  });

  it("reads a file and shows the results", async () => {
    await upload(app, CSV);
    expect($(app, ".loaded").textContent).toContain("Viertelstundenwerte");
    expect(kpis(app)).toHaveLength(2);
    expect($$(app, ".grid-kpis .kpi")).toHaveLength(2);
    expect($$(app, ".grid-kpis .part")).toHaveLength(6);
    expect($$(app, "gc-chart-monthly, gc-chart-costs, gc-chart-detail")).toHaveLength(3);
    // Highest peak: 3 kWh × 4 = 12 kW
    expect($$(app, ".fact .value").map((e) => e.textContent)).toContain("12,00 kW");
  });

  it("accepts a dropped file", async () => {
    $(app, ".drop").dispatchEvent(new Event("dragover", { cancelable: true }));
    await app.updateComplete;
    expect($(app, ".drop").classList.contains("over")).toBe(true);
    $(app, ".drop").dispatchEvent(new Event("dragleave"));
    await upload(app, CSV, "drop");
    expect($(app, ".drop").classList.contains("over")).toBe(false);
    expect(kpis(app)).toHaveLength(2);
  });

  it("shows an error for a wrong file", async () => {
    await upload(app, "no;csv;here\n1;2;3");
    expect($(app, ".error").textContent).toContain("Dateiformat");
    await upload(app, "");
    expect($(app, ".error").textContent).toContain("leer");
  });

  it("recalculates with the tariff year, prices and net/gross", async () => {
    await upload(app, CSV);
    const first = kpis(app)[1];
    const years = $$(app, ".years button");
    years[4].click();
    await app.updateComplete;
    expect(years[4].getAttribute("aria-checked")).toBe("true");
    expect(kpis(app)[1]).not.toBe(first);

    const range = $<HTMLInputElement>(app, "input[type=range]");
    range.value = "0";
    range.dispatchEvent(new Event("input"));
    await app.updateComplete;
    expect($(app, ".kpi.selected .label").textContent).toContain("2026");
    expect($(app, ".kpi.selected .delta").textContent).toContain("heutigen");
    expect($(app, ".grid-kpis .kpi.selected .delta").textContent).toContain("heutigen");

    const [price, fee] = $$<HTMLInputElement>(app, ".settings input.input");
    const before = kpis(app)[0];
    price.value = "30";
    price.dispatchEvent(new Event("change"));
    fee.value = "-5";
    fee.dispatchEvent(new Event("change"));
    await app.updateComplete;
    expect(kpis(app)[0]).not.toBe(before);

    const gross = kpis(app)[0];
    const toggles = $$(app, ".settings .seg button");
    toggles[1].click();
    await app.updateComplete;
    expect(toggles[1].getAttribute("aria-pressed")).toBe("true");
    expect(kpis(app)[0]).not.toBe(gross);
    toggles[0].click();
    await app.updateComplete;
    expect(kpis(app)[0]).toBe(gross);
  });

  it("scales a short period to one year", async () => {
    await upload(
      app,
      buildCsv(new Date(2026, 0, 1), 59, () => 0.1),
    );
    expect($(app, "main").textContent).toContain("Hochgerechnet auf 12 Monate");
  });

  it("switches language and theme from the header", async () => {
    const [de, en] = $$(app, "header .seg button");
    en.click();
    await app.updateComplete;
    expect($(app, ".hero h1").textContent).toBe("Grid Fee Calculator");
    de.click();
    await app.updateComplete;
    expect($(app, ".hero h1").textContent).toBe("Netzkosten-Rechner");

    $(app, "header .btn.icon").click();
    await app.updateComplete;
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("follows the month selected in the detail chart", async () => {
    await upload(app, CSV);
    const detail = $(app, "gc-chart-detail");
    detail.dispatchEvent(new CustomEvent("month-change", { detail: 2 }));
    await app.updateComplete;
    expect((detail as unknown as { index: number }).index).toBe(2);
  });
});
