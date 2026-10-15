import { max } from "d3-array";
import { axisBottom, axisLeft } from "d3-axis";
import { scaleBand, scaleLinear } from "d3-scale";
import { select } from "d3-selection";
import { line } from "d3-shape";
import { html } from "lit";
import { isComplete } from "../core/analyze";
import { fmtDateTime, fmtMonth, fmtNum } from "../core/format";
import type { MonthStats } from "../core/types";
import { t } from "../i18n/i18n";
import { define } from "./base";
import { ChartElement, cssVar, esc, tipRow } from "./chart-base";

const M = { top: 22, right: 12, bottom: 28, left: 48 };
const TOP_H = 180;
const GAP = 40;
const BOTTOM_H = 140;

/** Chart 1: kWh per month (top panel) and monthly peak kW (bottom panel), shared month axis. */
export class GcChartMonthly extends ChartElement {
  static properties = {
    ...ChartElement.properties,
    months: { attribute: false },
    showPeak: { type: Boolean },
    thresholdKw: { type: Number },
  };
  declare months: MonthStats[];
  declare showPeak: boolean;
  declare thresholdKw: number;

  constructor() {
    super();
    this.months = [];
    this.showPeak = true;
    this.thresholdKw = 10;
  }

  render() {
    const legend = html`<ul class="legend">
      <li><span class="sw" style="background:var(--s1)"></span>${t("series.kwh")} (kWh)</li>
      ${
        this.showPeak
          ? html`<li><span class="sw line" style="background:var(--s2)"></span>${t("series.peak")} (kW)</li>
              <li><span class="sw dash" style="border-color:var(--threshold)"></span>${t("series.threshold")}</li>`
          : null
      }
    </ul>
    ${this.showPeak ? null : html`<p class="note">${t("chart.monthly.peakHidden")}</p>`}`;
    return this.renderPlot(legend, t("chart.monthly.title"));
  }

  protected renderTable() {
    return html`<table>
      <thead><tr><th>${t("col.month")}</th><th>kWh</th>${this.showPeak ? html`<th>kW</th><th></th>` : null}</tr></thead>
      <tbody>
        ${this.months.map(
          (m) => html`<tr>
            <td>${fmtMonth(m.year, m.month, "long")}${isComplete(m) ? "" : ` (${t("incomplete")})`}</td>
            <td>${fmtNum(m.kwh, 1)}</td>
            ${this.showPeak ? html`<td>${fmtNum(m.peakKw, 2)}</td><td>${fmtDateTime(m.peakAt)}</td>` : null}
          </tr>`,
        )}
      </tbody>
    </table>`;
  }

  protected draw(width: number): void {
    const svgEl = this.svg;
    if (!svgEl) return;
    const data = this.months;
    const showPeak = this.showPeak;
    const height = M.top + TOP_H + (showPeak ? GAP + BOTTOM_H : 0) + M.bottom;
    const svg = select(svgEl).attr("viewBox", `0 0 ${width} ${height}`).attr("height", height);
    svg.selectAll("*").remove();
    const innerW = width - M.left - M.right;

    const c1 = cssVar("--s1");
    const c2 = cssVar("--s2");
    const cThr = cssVar("--threshold");
    const muted = cssVar("--text-muted");

    const x = scaleBand<string>()
      .domain(data.map((d) => d.key))
      .range([0, innerW])
      .paddingInner(0.28)
      .paddingOuter(0.14);
    const tickEvery = innerW / Math.max(1, data.length) < 34 ? 2 : 1;
    const xAxis = axisBottom(x)
      .tickSizeOuter(0)
      .tickFormat((k, i) => {
        if (i % tickEvery) return "";
        const m = data.find((d) => d.key === k);
        return m ? fmtMonth(m.year, m.month) : "";
      });

    // Top panel: kWh
    const yK = scaleLinear()
      .domain([0, (max(data, (d) => d.kwh) ?? 1) * 1.1])
      .nice()
      .range([TOP_H, 0]);
    const top = svg.append("g").attr("transform", `translate(${M.left},${M.top})`);
    top
      .append("g")
      .attr("class", "grid")
      .call(
        axisLeft(yK)
          .ticks(4)
          .tickSize(-innerW)
          .tickFormat(() => ""),
      )
      .call((g) => g.select(".domain").remove());
    top
      .append("g")
      .call(
        axisLeft(yK)
          .ticks(4)
          .tickFormat((v) => fmtNum(+v)),
      )
      .call((g) => g.select(".domain").remove())
      .call((g) => g.selectAll(".tick line").remove());
    top.append("text").attr("x", -M.left).attr("y", -12).attr("fill", muted).text("kWh");
    const bw = x.bandwidth();
    const r = Math.min(1, bw / 2);
    top
      .append("g")
      .selectAll("path")
      .data(data)
      .join("path")
      .attr("fill", c1)
      .attr("opacity", (d) => (isComplete(d) ? 1 : 0.45))
      .attr("d", (d) => roundedTopBar(x(d.key) ?? 0, yK(d.kwh), bw, TOP_H - yK(d.kwh), r));
    if (!showPeak) {
      top.append("g").attr("transform", `translate(0,${TOP_H})`).call(xAxis);
    } else {
      top
        .append("line")
        .attr("x1", 0)
        .attr("x2", innerW)
        .attr("y1", TOP_H)
        .attr("y2", TOP_H)
        .attr("stroke", cssVar("--axis"));
    }

    // Bottom panel: peak kW
    let yP: ReturnType<typeof scaleLinear<number, number>> | undefined;
    if (showPeak) {
      const maxPeak = max(data, (d) => d.peakKw) ?? 1;
      yP = scaleLinear()
        .domain([0, Math.max(maxPeak * 1.15, this.thresholdKw * 1.08)])
        .nice()
        .range([BOTTOM_H, 0]);
      const bot = svg.append("g").attr("transform", `translate(${M.left},${M.top + TOP_H + GAP})`);
      bot
        .append("g")
        .attr("class", "grid")
        .call(
          axisLeft(yP)
            .ticks(4)
            .tickSize(-innerW)
            .tickFormat(() => ""),
        )
        .call((g) => g.select(".domain").remove());
      bot
        .append("g")
        .call(
          axisLeft(yP)
            .ticks(4)
            .tickFormat((v) => fmtNum(+v)),
        )
        .call((g) => g.select(".domain").remove())
        .call((g) => g.selectAll(".tick line").remove());
      bot.append("text").attr("x", -M.left).attr("y", -12).attr("fill", muted).text("kW");
      bot
        .append("line")
        .attr("x1", 0)
        .attr("x2", innerW)
        .attr("y1", yP(this.thresholdKw))
        .attr("y2", yP(this.thresholdKw))
        .attr("stroke", cThr)
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "5 4");
      bot
        .append("text")
        .attr("x", innerW)
        .attr("y", yP(this.thresholdKw))
        .attr("dy", "-0.4em")
        .attr("text-anchor", "end")
        .attr("fill", muted)
        .text(`${fmtNum(this.thresholdKw)} kW`);
      const cx = (d: MonthStats) => (x(d.key) ?? 0) + bw / 2;
      const ys = yP;
      bot
        .append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", c2)
        .attr("stroke-width", 2)
        .attr("stroke-linejoin", "round")
        .attr(
          "d",
          line<MonthStats>()
            .x(cx)
            .y((d) => ys(d.peakKw)),
        );
      bot
        .append("g")
        .selectAll("circle")
        .data(data)
        .join("circle")
        .attr("cx", cx)
        .attr("cy", (d) => ys(d.peakKw))
        .attr("r", 4.5)
        .attr("fill", c2)
        .attr("stroke", cssVar("--chart-surface"))
        .attr("stroke-width", 2);
      bot.append("g").attr("transform", `translate(0,${BOTTOM_H})`).call(xAxis);
    }

    // Hover: one hit target per month over both panels
    const hoverH = TOP_H + (showPeak ? GAP + BOTTOM_H : 0);
    const hover = svg.append("g").attr("transform", `translate(${M.left},${M.top})`);
    const step = x.step();
    const hl = hover
      .append("rect")
      .attr("y", 0)
      .attr("height", hoverH)
      .attr("width", step)
      .attr("fill", cssVar("--text"))
      .attr("opacity", 0)
      .attr("pointer-events", "none");
    hover
      .selectAll("rect.hit")
      .data(data)
      .join("rect")
      .attr("class", "hit")
      .attr("x", (d) => (x(d.key) ?? 0) - (step - bw) / 2)
      .attr("y", 0)
      .attr("width", step)
      .attr("height", hoverH)
      .attr("fill", "transparent")
      .on("mousemove", (ev: MouseEvent, d) => {
        hl.attr("x", (x(d.key) ?? 0) - (step - bw) / 2).attr("opacity", 0.05);
        const [px, py] = pointer(ev, svgEl);
        let content = `<div class="title">${esc(fmtMonth(d.year, d.month, "long"))}${
          isComplete(d) ? "" : ` · ${esc(t("incomplete"))}`
        }</div>${tipRow(c1, t("series.kwh"), `${fmtNum(d.kwh, 1)} kWh`)}`;
        if (showPeak) {
          content += tipRow(c2, t("series.peak"), `${fmtNum(d.peakKw, 2)} kW`, "line");
          content += `<div class="row"><span class="key">${esc(fmtDateTime(d.peakAt))}</span></div>`;
        }
        this.showTooltip(content, px, py);
      })
      .on("mouseleave", () => {
        hl.attr("opacity", 0);
        this.hideTooltip();
      });
  }
}

/** Mouse position relative to the SVG in CSS pixels. */
export function pointer(ev: MouseEvent, el: SVGSVGElement): [number, number] {
  const r = el.getBoundingClientRect();
  return [ev.clientX - r.left, ev.clientY - r.top];
}

/** Bar path with rounded top corners, anchored to the baseline. */
export function roundedTopBar(x: number, y: number, w: number, h: number, r: number): string {
  if (h <= 0) return "";
  const rr = Math.min(r, h, w / 2);
  return `M${x},${y + h}V${y + rr}Q${x},${y} ${x + rr},${y}H${x + w - rr}Q${x + w},${y} ${x + w},${y + rr}V${y + h}Z`;
}

define("gc-chart-monthly", GcChartMonthly);
