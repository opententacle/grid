import { beforeAll, describe, expect, it } from "vitest";
import { analyze } from "../core/analyze";
import { yearCost } from "../core/cost";
import { parseWienerNetze } from "../core/parse-wienernetze";
import { tariffFor, WIENER_NETZE_TARIFFS } from "../core/tariffs";
import { buildCsv } from "../core/test-utils";
import type { Analysis } from "../core/types";
import { setLocale } from "../i18n/i18n";
import { GcChartCosts } from "./gc-chart-costs";
import { GcChartDetail } from "./gc-chart-detail";
import { GcChartMonthly, roundedTopBar } from "./gc-chart-monthly";
import { $, $$, drawChart, mount, mouse } from "./test-helpers";

let a: Analysis;
beforeAll(() => {
  setLocale("en");
  // 3 months, with a 12 kW peak on 10 February 08:00 and a partial last month
  const csv = buildCsv(new Date(2026, 0, 1), 70, (d) =>
    d.getMonth() === 1 && d.getDate() === 10 && d.getHours() === 8 && d.getMinutes() === 0
      ? 3
      : 0.1,
  );
  a = analyze(parseWienerNetze(csv));
});

const tooltip = (el: Element) => $(el, ".tooltip");

describe("roundedTopBar", () => {
  it("draws nothing for zero height and clamps the radius", () => {
    expect(roundedTopBar(0, 0, 10, 0, 2)).toBe("");
    expect(roundedTopBar(0, 0, 10, 20, 2)).toMatch(/^M0,20V2Q0,0 2,0H8Q10,0 10,2V20Z$/);
  });
});

describe("gc-chart-monthly", () => {
  it("draws bars, peaks and the 10 kW line, with tooltip and table", async () => {
    const el = await mount(Object.assign(new GcChartMonthly(), { months: a.months }));
    await drawChart(el);
    const svg = $(el, ".plot > svg");
    expect(svg.getAttribute("viewBox")).toMatch(/^0 0 640 \d+$/);
    expect($$(el, ".plot > svg circle")).toHaveLength(3);
    expect(svg.textContent).toContain("10 kW");

    mouse($$(el, "rect.hit")[1], "mousemove");
    expect(tooltip(el).classList.contains("show")).toBe(true);
    expect(tooltip(el).textContent).toContain("February 2026");
    expect(tooltip(el).textContent).toContain("12.00 kW");
    mouse($$(el, "rect.hit")[2], "mousemove");
    expect(tooltip(el).textContent).toContain("incomplete");
    mouse($$(el, "rect.hit")[1], "mouseleave");
    expect(tooltip(el).classList.contains("show")).toBe(false);

    $(el, ".linkbtn").click();
    await el.updateComplete;
    expect($$(el, "tbody tr")).toHaveLength(3);
    el.remove();
  });

  it("hides the peak panel for the 2026 tariff", async () => {
    const el = await mount(
      Object.assign(new GcChartMonthly(), { months: a.months, showPeak: false }),
    );
    await drawChart(el, 320);
    expect($$(el, ".plot > svg circle")).toHaveLength(0);
    expect($(el, ".note").textContent).toContain("2026");
    mouse($$(el, "rect.hit")[0], "mousemove");
    expect(tooltip(el).textContent).not.toContain("peak");
    el.remove();
  });
});

describe("gc-chart-costs", () => {
  const rows = () =>
    yearCost(a.months, tariffFor(WIENER_NETZE_TARIFFS, 2030), { priceCt: 10, baseFeeMonth: 2 })
      .months;

  it("draws one stacked bar per month with tooltip and table", async () => {
    const el = await mount(Object.assign(new GcChartCosts(), { rows: rows() }));
    await drawChart(el);
    // 3 months × 4 segments
    expect($$(el, ".plot > svg > g > path")).toHaveLength(12);
    mouse($$(el, "rect.hit")[0], "mousemove");
    expect(tooltip(el).textContent).toContain("Total");
    mouse($$(el, "rect.hit")[0], "mouseleave");
    expect(tooltip(el).classList.contains("show")).toBe(false);
    $(el, ".linkbtn").click();
    await el.updateComplete;
    expect($$(el, "tbody tr")).toHaveLength(3);
    el.remove();
  });

  it("shows smaller totals for net values", async () => {
    const el = await mount(Object.assign(new GcChartCosts(), { rows: rows() }));
    $(el, ".linkbtn").click();
    await el.updateComplete;
    const total = () => $(el, "tbody tr td:last-child").textContent;
    const gross = total();
    el.gross = false;
    await el.updateComplete;
    expect(total()).not.toBe(gross);
    el.remove();
  });
});

describe("gc-chart-detail", () => {
  it("draws the month, the peak line and a crosshair", async () => {
    const el = await mount(
      Object.assign(new GcChartDetail(), { readings: a.readings, months: a.months, index: 1 }),
    );
    await drawChart(el);
    const svg = $(el, ".plot > svg");
    expect(svg.textContent).toContain("Monthly peak 12.00 kW");
    expect(svg.textContent).toContain("10 kW");
    expect($(el, ".peak").textContent).toContain("12.00 kW");

    const area = $$(el, ".plot > svg rect").at(-1) as Element;
    mouse(area, "mousemove", 200);
    expect(tooltip(el).textContent).toContain("kWh");
    mouse(area, "mouseleave");
    expect(tooltip(el).classList.contains("show")).toBe(false);

    $(el, ".linkbtn").click();
    await el.updateComplete;
    expect($$(el, "tbody tr")).toHaveLength(28);
    el.remove();
  });

  it("steps through the months and reports the change", async () => {
    const el = await mount(
      Object.assign(new GcChartDetail(), {
        readings: a.readings,
        months: a.months,
        index: 0,
        showThreshold: false,
      }),
    );
    await drawChart(el);
    const seen: number[] = [];
    el.addEventListener("month-change", (e) => seen.push((e as CustomEvent<number>).detail));
    const [prev, next] = $$<HTMLButtonElement>(el, ".nav .btn");
    expect(prev.disabled).toBe(true);
    next.click();
    await el.updateComplete;
    next.click();
    await el.updateComplete;
    expect(next.disabled).toBe(true);
    prev.click();
    const select = $<HTMLSelectElement>(el, ".nav select");
    select.value = "0";
    select.dispatchEvent(new Event("change"));
    expect(seen).toEqual([1, 2, 1, 0]);
    expect($(el, ".plot > svg").textContent).not.toContain("10 kW");
    el.remove();
  });
});
