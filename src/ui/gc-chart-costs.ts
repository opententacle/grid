import { max } from "d3-array";
import { axisBottom, axisLeft } from "d3-axis";
import { scaleBand, scaleLinear } from "d3-scale";
import { select } from "d3-selection";
import { html } from "lit";
import { fmtEur, fmtMonth, fmtNum } from "../core/format";
import type { CostBreakdown, MonthStats } from "../core/types";
import { type MessageKey, t } from "../i18n/i18n";
import { ChartElement, cssVar, esc, tipRow } from "./chart-base";
import { pointer, roundedTopBar } from "./gc-chart-monthly";

const M = { top: 22, right: 12, bottom: 28, left: 52 };
const H = 240;

interface Series {
  key: MessageKey;
  color: string;
  value: (c: CostBreakdown, gross: boolean) => number;
}

const vatF = (c: CostBreakdown, gross: boolean) => (gross ? 1 + c.vat / Math.max(c.net, 1e-9) : 1);

/** Cost series; with `gross` each part includes its share of VAT so the stack sums to the gross total. */
export const COST_SERIES: Series[] = [
  { key: "series.energy", color: "--s1", value: (c, g) => c.energy * vatF(c, g) },
  { key: "series.gridEnergy", color: "--s2", value: (c, g) => c.gridEnergy * vatF(c, g) },
  {
    key: "series.gridCapacity",
    color: "--s3",
    value: (c, g) => (c.gridCapacity + c.gridOther) * vatF(c, g),
  },
  { key: "series.taxes", color: "--s4", value: (c, g) => (c.levies + c.usageTax) * vatF(c, g) },
];

/** Chart 2: stacked cost per month for the selected tariff year. */
export class GcChartCosts extends ChartElement {
  static properties = {
    ...ChartElement.properties,
    rows: { attribute: false },
    gross: { type: Boolean },
  };
  declare rows: { month: MonthStats; cost: CostBreakdown }[];
  declare gross: boolean;

  constructor() {
    super();
    this.rows = [];
    this.gross = true;
  }

  render() {
    const legend = html`<ul class="legend">
      ${COST_SERIES.map((s) => html`<li><span class="sw" style="background:var(${s.color})"></span>${t(s.key)}</li>`)}
    </ul>`;
    return this.renderPlot(legend, t("chart.costs.title"));
  }

  private total(c: CostBreakdown) {
    return this.gross ? c.gross : c.net;
  }

  protected renderTable() {
    return html`<table>
      <thead><tr><th>${t("col.month")}</th>${COST_SERIES.map((s) => html`<th>${t(s.key)}</th>`)}<th>${t("col.total")}</th></tr></thead>
      <tbody>
        ${this.rows.map(
          (r) => html`<tr>
            <td>${fmtMonth(r.month.year, r.month.month, "long")}</td>
            ${COST_SERIES.map((s) => html`<td>${fmtEur(s.value(r.cost, this.gross), 2)}</td>`)}
            <td><strong>${fmtEur(this.total(r.cost), 2)}</strong></td>
          </tr>`,
        )}
      </tbody>
    </table>`;
  }

  protected draw(width: number): void {
    const svgEl = this.svg;
    if (!svgEl) return;
    const rows = this.rows;
    const gross = this.gross;
    const height = M.top + H + M.bottom;
    const svg = select(svgEl).attr("viewBox", `0 0 ${width} ${height}`).attr("height", height);
    svg.selectAll("*").remove();
    const innerW = width - M.left - M.right;
    const colors = COST_SERIES.map((s) => cssVar(s.color));

    const x = scaleBand<string>()
      .domain(rows.map((r) => r.month.key))
      .range([0, innerW])
      .paddingInner(0.28)
      .paddingOuter(0.14);
    const y = scaleLinear()
      .domain([0, (max(rows, (r) => this.total(r.cost)) ?? 1) * 1.08])
      .nice()
      .range([H, 0]);
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
          .tickFormat((v) => `${fmtNum(+v)} €`),
      )
      .call((s) => s.select(".domain").remove())
      .call((s) => s.selectAll(".tick line").remove());
    const tickEvery = innerW / Math.max(1, rows.length) < 34 ? 2 : 1;
    g.append("g")
      .attr("transform", `translate(0,${H})`)
      .call(
        axisBottom(x)
          .tickSizeOuter(0)
          .tickFormat((k, i) => {
            if (i % tickEvery) return "";
            const r = rows.find((d) => d.month.key === k);
            return r ? fmtMonth(r.month.year, r.month.month) : "";
          }),
      );

    const bw = x.bandwidth();
    for (const r of rows) {
      let acc = 0;
      const x0 = x(r.month.key) ?? 0;
      const vals = COST_SERIES.map((s) => s.value(r.cost, gross));
      const lastIdx = vals.reduce((li, v, i) => (v > 0 ? i : li), -1);
      vals.forEach((v, i) => {
        if (v <= 0) return;
        const y0 = y(acc);
        const y1 = y(acc + v);
        acc += v;
        const h = Math.max(0, y0 - y1 - (i === lastIdx ? 0 : 2));
        const top = y0 - h;
        g.append("path")
          .attr("fill", colors[i])
          .attr(
            "d",
            i === lastIdx
              ? roundedTopBar(x0, top, bw, h, Math.min(1, bw / 2))
              : `M${x0},${top}h${bw}v${h}h${-bw}Z`,
          );
      });
    }

    const step = x.step();
    const hl = g
      .append("rect")
      .attr("height", H)
      .attr("width", step)
      .attr("fill", cssVar("--text"))
      .attr("opacity", 0)
      .attr("pointer-events", "none");
    g.selectAll("rect.hit")
      .data(rows)
      .join("rect")
      .attr("class", "hit")
      .attr("x", (r) => (x(r.month.key) ?? 0) - (step - bw) / 2)
      .attr("width", step)
      .attr("height", H)
      .attr("fill", "transparent")
      .on("mousemove", (ev: MouseEvent, r) => {
        hl.attr("x", (x(r.month.key) ?? 0) - (step - bw) / 2).attr("opacity", 0.05);
        const [px, py] = pointer(ev, svgEl);
        const content =
          `<div class="title">${esc(fmtMonth(r.month.year, r.month.month, "long"))}</div>` +
          COST_SERIES.map((s, i) => tipRow(colors[i], t(s.key), fmtEur(s.value(r.cost, gross), 2)))
            .reverse()
            .join("") +
          `<div class="row" style="margin-top:4px"><span class="key">${esc(t("col.total"))}</span><span class="val">${esc(
            fmtEur(this.total(r.cost), 2),
          )}</span></div>`;
        this.showTooltip(content, px, py);
      })
      .on("mouseleave", () => {
        hl.attr("opacity", 0);
        this.hideTooltip();
      });
  }
}

customElements.define("gc-chart-costs", GcChartCosts);
