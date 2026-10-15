import { css, html, type PropertyValues } from "lit";
import { t } from "../i18n/i18n";
import { BaseElement, sharedStyles } from "./base";

/** Reads a CSS custom property from the document (theme-aware chart colors). */
export const cssVar = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

/**
 * Base for d3 charts: owns an <svg>, a tooltip and a table toggle.
 * Subclasses implement `draw(width)` and `renderTable()`.
 */
export abstract class ChartElement extends BaseElement {
  static properties = { showTable: { state: true } };
  declare showTable: boolean;
  protected width = 0;
  private ro?: ResizeObserver;

  constructor() {
    super();
    this.showTable = false;
  }

  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
      }
      .plot {
        position: relative;
        width: 100%;
      }
      svg {
        display: block;
        width: 100%;
        overflow: visible;
        font-size: 11px;
        font-variant-numeric: tabular-nums;
      }
      .tick text {
        fill: var(--text-muted);
      }
      .tick line,
      .grid line {
        stroke: var(--grid);
      }
      .domain {
        stroke: var(--axis);
      }
      .tooltip {
        position: absolute;
        pointer-events: none;
        background: var(--surface);
        border: 1px solid var(--border);
        box-shadow: var(--shadow);
        border-radius: 10px;
        padding: 8px 10px;
        font-size: 0.8rem;
        line-height: 1.4;
        white-space: nowrap;
        opacity: 0;
        transition: opacity 0.1s;
        z-index: 2;
      }
      .tooltip.show {
        opacity: 1;
      }
      .tooltip .row {
        display: flex;
        align-items: center;
        gap: 8px;
        justify-content: space-between;
      }
      .tooltip .key {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: var(--text-2);
      }
      .tooltip .val {
        font-weight: 600;
        font-variant-numeric: tabular-nums;
      }
      .tooltip .title {
        font-weight: 650;
        margin-bottom: 4px;
      }
      .sw {
        display: inline-block;
        width: 10px;
        height: 10px;
        border-radius: 3px;
      }
      .sw.line {
        height: 2px;
        width: 14px;
        border-radius: 1px;
      }
      .sw.dash {
        height: 0;
        width: 14px;
        border-top: 2px dashed;
        border-radius: 0;
      }
      .legend {
        display: flex;
        flex-wrap: wrap;
        gap: 6px 16px;
        font-size: 0.8rem;
        color: var(--text-2);
        margin: 0 0 12px;
        padding: 0;
        list-style: none;
      }
      .legend li {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .foot {
        display: flex;
        justify-content: flex-end;
        margin-top: 8px;
      }
      .linkbtn {
        background: none;
        border: none;
        color: var(--accent);
        cursor: pointer;
        font-size: 0.8rem;
        padding: 4px;
      }
      .table-wrap {
        overflow-x: auto;
        margin-top: 8px;
      }
      table {
        border-collapse: collapse;
        width: 100%;
        font-size: 0.8rem;
        font-variant-numeric: tabular-nums;
      }
      th,
      td {
        padding: 6px 8px;
        border-bottom: 1px solid var(--border);
        text-align: right;
        white-space: nowrap;
      }
      th:first-child,
      td:first-child {
        text-align: left;
      }
      th {
        color: var(--text-2);
        font-weight: 600;
      }
      .note {
        font-size: 0.8rem;
        color: var(--text-muted);
        margin: 0 0 8px;
      }
    `,
  ];

  connectedCallback(): void {
    super.connectedCallback();
    this.ro = new ResizeObserver((entries) => {
      const w = Math.floor(entries[0].contentRect.width);
      if (w !== this.width && w > 0) {
        this.width = w;
        this.redraw();
      }
    });
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.ro?.disconnect();
  }

  protected firstUpdated(): void {
    const plot = this.renderRoot.querySelector(".plot");
    if (plot) this.ro?.observe(plot);
  }

  protected updated(_changed: PropertyValues): void {
    this.redraw();
  }

  protected get svg(): SVGSVGElement | null {
    return this.renderRoot.querySelector(".plot > svg");
  }

  protected get tooltip(): HTMLDivElement | null {
    return this.renderRoot.querySelector(".tooltip");
  }

  protected showTooltip(content: string, x: number, y: number): void {
    const tip = this.tooltip;
    if (!tip) return;
    tip.innerHTML = content;
    tip.classList.add("show");
    const w = tip.offsetWidth;
    const left = Math.min(Math.max(0, x + 12), Math.max(0, this.width - w));
    const flip = x + 12 + w > this.width;
    tip.style.left = `${flip ? Math.max(0, x - w - 12) : left}px`;
    tip.style.top = `${Math.max(0, y - 10)}px`;
  }

  protected hideTooltip(): void {
    this.tooltip?.classList.remove("show");
  }

  private redraw(): void {
    if (this.width > 0) this.draw(this.width);
  }

  protected abstract draw(width: number): void;
  protected abstract renderTable(): unknown;

  protected renderPlot(legend: unknown, ariaLabel: string) {
    return html`
      ${legend}
      <div class="plot">
        <svg role="img" aria-label=${ariaLabel}></svg>
        <div class="tooltip" role="status"></div>
      </div>
      <div class="foot">
        <button class="linkbtn" @click=${() => {
          this.showTable = !this.showTable;
        }} aria-expanded=${this.showTable}>
          ${this.showTable ? t("chart.hideTable") : t("chart.table")}
        </button>
      </div>
      ${this.showTable ? html`<div class="table-wrap">${this.renderTable()}</div>` : null}
    `;
  }
}

/** Escapes text for tooltip HTML (tooltips contain only app-generated strings). */
export const esc = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] ?? c);

export const tipRow = (
  color: string,
  label: string,
  value: string,
  kind: "box" | "line" | "dash" = "box",
) =>
  `<div class="row"><span class="key"><span class="sw ${kind === "box" ? "" : kind}" style="${
    kind === "dash" ? `border-color:${color}` : `background:${color}`
  }"></span>${esc(label)}</span><span class="val">${esc(value)}</span></div>`;
