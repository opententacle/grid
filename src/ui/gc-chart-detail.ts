import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons/faChevronRight";
import { bisector, max } from "d3-array";
import { axisBottom, axisLeft } from "d3-axis";
import { scaleLinear, scaleTime } from "d3-scale";
import { select } from "d3-selection";
import { area, line } from "d3-shape";
import { css, html } from "lit";
import { fmtDateTime, fmtMonth, fmtNum } from "../core/format";
import type { MonthStats, Reading } from "../core/types";
import { t } from "../i18n/i18n";
import { define, fa } from "./base";
import { ChartElement, cssVar, esc, tipRow } from "./chart-base";
import { pointer } from "./gc-chart-monthly";

const M = { top: 22, right: 12, bottom: 28, left: 44 };
const H = 260;

/** Chart 3: quarter-hour power of one month with the monthly peak line. */
export class GcChartDetail extends ChartElement {
  static properties = {
    ...ChartElement.properties,
    readings: { attribute: false },
    months: { attribute: false },
    index: { type: Number },
    showThreshold: { type: Boolean },
    thresholdKw: { type: Number },
  };
  declare readings: Reading[];
  declare months: MonthStats[];
  declare index: number;
  declare showThreshold: boolean;
  declare thresholdKw: number;

  static styles = [
    ...ChartElement.styles,
    css`
      .nav {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
        flex-wrap: wrap;
      }
      select {
        border: 1px solid var(--border);
        background: var(--surface);
        border-radius: var(--radius-sm);
        padding: 8px 10px;
        min-width: 160px;
      }
      .peak {
        margin-left: auto;
        font-size: 0.85rem;
        color: var(--text-2);
      }
      @media (max-width: 560px) {
        .peak {
          margin-left: 0;
          width: 100%;
        }
      }
    `,
  ];

  constructor() {
    super();
    this.readings = [];
    this.months = [];
    this.index = 0;
    this.showThreshold = true;
    this.thresholdKw = 10;
  }

  private get month(): MonthStats | undefined {
    return this.months[Math.min(this.index, this.months.length - 1)];
  }

  private go(i: number) {
    this.index = Math.max(0, Math.min(this.months.length - 1, i));
    this.dispatchEvent(new CustomEvent("month-change", { detail: this.index }));
  }

  render() {
    const m = this.month;
    const nav = html`<div class="nav">
      <button class="btn icon" ?disabled=${this.index <= 0} @click=${() => this.go(this.index - 1)}
        aria-label=${t("chart.detail.prev")} title=${t("chart.detail.prev")}>${fa(faChevronLeft)}</button>
      <select aria-label=${t("col.month")} @change=${(e: Event) => this.go(+(e.target as HTMLSelectElement).value)}>
        ${this.months.map(
          (mm, i) =>
            html`<option value=${i} ?selected=${i === this.index}>${fmtMonth(mm.year, mm.month, "long")}</option>`,
        )}
      </select>
      <button class="btn icon" ?disabled=${this.index >= this.months.length - 1} @click=${() => this.go(this.index + 1)}
        aria-label=${t("chart.detail.next")} title=${t("chart.detail.next")}>${fa(faChevronRight)}</button>
      ${m ? html`<span class="peak">${t("chart.detail.peakAt", { kw: `${fmtNum(m.peakKw, 2)} kW`, date: fmtDateTime(m.peakAt) })}</span>` : null}
    </div>`;
    const legend = html`${nav}<ul class="legend">
      <li><span class="sw" style="background:var(--s1)"></span>${t("series.power")} (kW)</li>
      <li><span class="sw line" style="background:var(--s2)"></span>${t("series.peak")}</li>
      ${this.showThreshold ? html`<li><span class="sw dash" style="border-color:var(--threshold)"></span>${t("series.threshold")}</li>` : null}
    </ul>`;
    return this.renderPlot(legend, t("chart.detail.title"));
  }

  protected renderTable() {
    const m = this.month;
    if (!m) return null;
    // Daily maximum as compact table (a full month has ~3000 rows)
    const days = new Map<string, { kw: number; at: number; kwh: number }>();
    for (const r of this.readings.slice(m.start, m.end)) {
      const k = new Date(r.t).toDateString();
      const d = days.get(k) ?? { kw: 0, at: r.t, kwh: 0 };
      d.kwh += r.kwh;
      if (r.kwh * 4 > d.kw) {
        d.kw = r.kwh * 4;
        d.at = r.t;
      }
      days.set(k, d);
    }
    return html`<table>
      <thead><tr><th>${t("series.peak")}</th><th>kW</th><th>kWh</th></tr></thead>
      <tbody>${[...days.values()].map(
        (d) =>
          html`<tr><td>${fmtDateTime(d.at)}</td><td>${fmtNum(d.kw, 2)}</td><td>${fmtNum(d.kwh, 2)}</td></tr>`,
      )}</tbody>
    </table>`;
  }

  protected draw(width: number): void {
    const svgEl = this.svg;
    const m = this.month;
    if (!svgEl || !m) return;
    const data = this.readings.slice(m.start, m.end);
    const height = M.top + H + M.bottom;
    const svg = select(svgEl).attr("viewBox", `0 0 ${width} ${height}`).attr("height", height);
    svg.selectAll("*").remove();
    const innerW = width - M.left - M.right;
    const c1 = cssVar("--s1");
    const c2 = cssVar("--s2");
    const cThr = cssVar("--threshold");
    const muted = cssVar("--text-muted");

    const x = scaleTime()
      .domain([new Date(m.year, m.month - 1, 1), new Date(m.year, m.month, 1)])
      .range([0, innerW]);
    const yMax = Math.max(
      (max(data, (d) => d.kwh * 4) ?? 1) * 1.1,
      this.showThreshold ? this.thresholdKw * 1.08 : 0,
    );
    const y = scaleLinear().domain([0, yMax]).nice().range([H, 0]);

    const g = svg.append("g").attr("transform", `translate(${M.left},${M.top})`);
    g.append("g")
      .attr("class", "grid")
      .call(
        axisLeft(y)
          .ticks(5)
          .tickSize(-innerW)
          .tickFormat(() => ""),
      )
      .call((s) => s.select(".domain").remove());
    g.append("g")
      .call(
        axisLeft(y)
          .ticks(5)
          .tickFormat((v) => fmtNum(+v)),
      )
      .call((s) => s.select(".domain").remove())
      .call((s) => s.selectAll(".tick line").remove());
    g.append("text").attr("x", -M.left).attr("y", -12).attr("fill", muted).text("kW");
    g.append("g")
      .attr("transform", `translate(0,${H})`)
      .call(
        axisBottom(x)
          .ticks(Math.max(2, Math.floor(innerW / 70)))
          .tickSizeOuter(0)
          .tickFormat((d) => `${(d as Date).getDate()}.`),
      );

    const px = (d: Reading) => x(new Date(d.t));
    const py = (d: Reading) => y(d.kwh * 4);
    g.append("path")
      .datum(data)
      .attr("fill", c1)
      .attr("fill-opacity", 0.18)
      .attr("d", area<Reading>().x(px).y0(H).y1(py));
    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", c1)
      .attr("stroke-width", 1)
      .attr("stroke-linejoin", "round")
      .attr("d", line<Reading>().x(px).y(py));

    const hline = (v: number, color: string, label: string, dash?: string) => {
      g.append("line")
        .attr("x1", 0)
        .attr("x2", innerW)
        .attr("y1", y(v))
        .attr("y2", y(v))
        .attr("stroke", color)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", dash ?? null);
      g.append("text")
        .attr("x", innerW)
        .attr("y", y(v))
        .attr("dy", "-0.45em")
        .attr("text-anchor", "end")
        .attr("fill", cssVar("--text-2"))
        .attr("font-weight", 600)
        .text(label);
    };
    if (this.showThreshold) hline(this.thresholdKw, cThr, `${fmtNum(this.thresholdKw)} kW`, "5 4");
    hline(m.peakKw, c2, `${t("series.peak")} ${fmtNum(m.peakKw, 2)} kW`);
    g.append("circle")
      .attr("cx", x(new Date(m.peakAt)))
      .attr("cy", y(m.peakKw))
      .attr("r", 5)
      .attr("fill", c2)
      .attr("stroke", cssVar("--chart-surface"))
      .attr("stroke-width", 2);

    // crosshair
    const cross = g.append("g").attr("pointer-events", "none").attr("opacity", 0);
    cross.append("line").attr("y1", 0).attr("y2", H).attr("stroke", muted).attr("stroke-width", 1);
    const dot = cross
      .append("circle")
      .attr("r", 4.5)
      .attr("fill", c1)
      .attr("stroke", cssVar("--chart-surface"))
      .attr("stroke-width", 2);
    const bis = bisector<Reading, number>((d) => d.t).center;
    g.append("rect")
      .attr("width", innerW)
      .attr("height", H)
      .attr("fill", "transparent")
      .on("mousemove", (ev: MouseEvent) => {
        const [mx, my] = pointer(ev, svgEl);
        const tm = x.invert(mx - M.left).getTime();
        const d = data[bis(data, tm)];
        if (!d) return;
        cross.attr("opacity", 1);
        cross.select("line").attr("x1", px(d)).attr("x2", px(d));
        dot.attr("cx", px(d)).attr("cy", py(d));
        this.showTooltip(
          `<div class="title">${esc(fmtDateTime(d.t))}</div>${tipRow(c1, t("series.power"), `${fmtNum(d.kwh * 4, 2)} kW`)}${tipRow(
            c1,
            t("series.kwh"),
            `${fmtNum(d.kwh, 3)} kWh`,
          )}`,
          mx,
          my,
        );
      })
      .on("mouseleave", () => {
        cross.attr("opacity", 0);
        this.hideTooltip();
      });
  }
}

define("gc-chart-detail", GcChartDetail);
