import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons/faArrowUpRightFromSquare";
import { faBolt } from "@fortawesome/free-solid-svg-icons/faBolt";
import { faCalculator } from "@fortawesome/free-solid-svg-icons/faCalculator";
import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons/faCircleExclamation";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons/faCircleInfo";
import { faFileCsv } from "@fortawesome/free-solid-svg-icons/faFileCsv";
import { faLock } from "@fortawesome/free-solid-svg-icons/faLock";
import { faMoon } from "@fortawesome/free-solid-svg-icons/faMoon";
import { faSun } from "@fortawesome/free-solid-svg-icons/faSun";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons/faTriangleExclamation";
import { faUpload } from "@fortawesome/free-solid-svg-icons/faUpload";
import { css, html, nothing } from "lit";
import { track } from "../analytics";
import { analyze } from "../core/analyze";
import { gridTotal, type YearCost, yearCost } from "../core/cost";
import { fmtDate, fmtEur, fmtNum, fmtPct } from "../core/format";
import { ParseError } from "../core/parse-error";
import { parseAny } from "../core/parse-formats";
import { TARIFF_DATA_DATE, tariffAt, tariffFor } from "../core/tariffs";
import type { Analysis, EnergyContract } from "../core/types";
import { getLocale, type Locale, setLocale, t } from "../i18n/i18n";
import { SOURCES, sourceById } from "../sources";
import { getTheme, setTheme } from "../theme";
import { BaseElement, fa, sharedStyles } from "./base";
import "./gc-chart-costs";
import "./gc-chart-detail";
import "./gc-chart-monthly";
import "./gc-footer";

const DEFAULT_CONTRACT: EnergyContract = { priceCt: 12, baseFeeMonth: 3 };

export class GcApp extends BaseElement {
  static properties = {
    sourceId: { state: true },
    analysis: { state: true },
    error: { state: true },
    loading: { state: true },
    year: { state: true },
    contract: { state: true },
    gross: { state: true },
    detailIndex: { state: true },
    dragging: { state: true },
  };
  declare sourceId: string;
  declare analysis: Analysis | undefined;
  declare error: string | undefined;
  declare loading: boolean;
  declare year: number;
  declare contract: EnergyContract;
  declare gross: boolean;
  declare detailIndex: number;
  declare dragging: boolean;

  private readonly today = new Date();

  constructor() {
    super();
    this.sourceId = SOURCES[0].id;
    this.loading = false;
    this.year = 2027;
    this.contract = { ...DEFAULT_CONTRACT };
    this.gross = true;
    this.detailIndex = 0;
    this.dragging = false;
  }

  private get source() {
    return sourceById(this.sourceId);
  }

  // ---------- actions ----------

  private async readFile(file: File) {
    this.loading = true;
    this.error = undefined;
    try {
      const text = await file.text();
      const { format, readings } = parseAny(text);
      const a = analyze(readings);
      this.analysis = a;
      this.detailIndex = a.months.reduce(
        (best, m, i, arr) => (m.peakKw > arr[best].peakKw ? i : best),
        0,
      );
      track("file_parsed", {
        source: this.sourceId,
        format,
        rows: readings.length,
        months: a.months.length,
        size_kb: Math.round(file.size / 1024),
      });
    } catch (e) {
      const code = e instanceof ParseError ? e.code : "unknown";
      this.error = t(`error.${code}` as Parameters<typeof t>[0]);
      track("file_error", { source: this.sourceId, code });
    } finally {
      this.loading = false;
    }
  }

  private onFileInput(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) void this.readFile(file);
    input.value = "";
  }

  private onDrop(e: DragEvent) {
    e.preventDefault();
    this.dragging = false;
    const file = e.dataTransfer?.files?.[0];
    if (file) void this.readFile(file);
  }

  private setYear(y: number) {
    if (y === this.year) return;
    this.year = y;
    track("year_changed", { year: y });
  }

  private setContract(patch: Partial<EnergyContract>) {
    this.contract = { ...this.contract, ...patch };
  }

  // ---------- render ----------

  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
      }
      .wrap {
        max-width: 1120px;
        margin: 0 auto;
        padding: 0 16px;
      }
      header.top {
        border-bottom: 1px solid var(--border);
        background: var(--surface);
        position: sticky;
        top: 0;
        z-index: 10;
        backdrop-filter: saturate(1.4) blur(8px);
      }
      header.top .wrap {
        display: flex;
        align-items: center;
        gap: 12px;
        height: 60px;
      }
      .brand {
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 700;
        letter-spacing: -0.01em;
        font-size: 1.05rem;
      }
      .logo {
        width: 32px;
        height: 32px;
        border-radius: var(--radius-sm);
        display: grid;
        place-items: center;
        background: var(--accent);
        color: var(--accent-ink);
      }
      .spacer {
        flex: 1;
      }
      @media (max-width: 480px) {
        .brand .name {
          display: none;
        }
      }
      .seg {
        display: inline-flex;
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        overflow: hidden;
      }
      .seg button {
        border: none;
        background: transparent;
        padding: 6px 10px;
        font-weight: 600;
        font-size: 0.85rem;
        cursor: pointer;
        color: var(--text-2);
      }
      .seg button {
        white-space: nowrap;
      }
      .seg button[aria-pressed="true"] {
        background: var(--accent-soft);
        color: var(--accent);
      }
      .hero {
        padding: 40px 0 24px;
      }
      .hero h1 {
        font-size: clamp(1.6rem, 3.5vw, 2.3rem);
        line-height: 1.15;
        margin: 0 0 10px;
        letter-spacing: -0.02em;
      }
      .hero p {
        margin: 0 0 14px;
        color: var(--text-2);
        max-width: 720px;
        font-size: 1.05rem;
      }
      .hero-links {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .badge.link {
        text-decoration: none;
        background: var(--surface);
        border: 1px solid var(--border);
        color: var(--text-2);
      }
      .badge.link:hover {
        color: var(--accent);
        border-color: var(--accent);
      }
      main {
        display: grid;
        gap: 20px;
        padding-bottom: 40px;
      }
      .steps {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
      }
      @media (max-width: 860px) {
        .steps {
          grid-template-columns: 1fr;
        }
      }
      .num {
        display: inline-grid;
        place-items: center;
        width: 26px;
        height: 26px;
        border-radius: 50%;
        background: var(--accent-soft);
        color: var(--accent);
        font-weight: 700;
        font-size: 0.85rem;
        margin-right: 10px;
        flex: none;
      }
      .step-title {
        display: flex;
        align-items: center;
        margin-bottom: 16px;
      }
      .field {
        display: grid;
        gap: 6px;
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--text-2);
      }
      select.input,
      input.input {
        border: 1px solid var(--border);
        background: var(--surface);
        border-radius: var(--radius-sm);
        padding: 10px 12px;
        width: 100%;
        font-size: 0.95rem;
        color: var(--text);
      }
      .instr {
        margin-top: 16px;
        font-size: 0.9rem;
        color: var(--text-2);
      }
      .instr h3 {
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--text-muted);
        margin: 14px 0 6px;
      }
      .instr ul,
      .instr ol {
        margin: 0;
        padding-left: 20px;
      }
      .instr li {
        margin: 3px 0;
      }
      .instr .btn {
        margin-top: 14px;
      }
      .drop {
        border: 2px dashed var(--border);
        border-radius: var(--radius-sm);
        padding: 28px 16px;
        text-align: center;
        display: grid;
        gap: 10px;
        justify-items: center;
        transition: border-color 0.15s, background 0.15s;
      }
      .drop.over {
        border-color: var(--accent);
        background: var(--accent-soft);
      }
      .drop .big {
        font-size: 2rem;
        color: var(--accent);
      }
      .hint {
        font-size: 0.8rem;
        color: var(--text-muted);
        display: flex;
        gap: 6px;
        align-items: center;
        justify-content: center;
      }
      .loaded {
        display: flex;
        gap: 12px;
        align-items: center;
        padding: 12px 14px;
        border-radius: var(--radius-sm);
        background: var(--surface-2);
        margin-top: 14px;
        font-size: 0.9rem;
      }
      .loaded .grow {
        flex: 1;
      }
      .error {
        display: flex;
        gap: 10px;
        align-items: flex-start;
        margin-top: 14px;
        padding: 12px 14px;
        border-radius: var(--radius-sm);
        background: var(--warn-bg);
        border: 1px solid var(--warn-border);
        color: var(--warn-text);
        font-size: 0.9rem;
      }
      .settings {
        display: grid;
        grid-template-columns: minmax(260px, 2fr) 1fr 1fr 1fr;
        gap: 20px;
        align-items: start;
      }
      @media (max-width: 960px) {
        .settings {
          grid-template-columns: 1fr 1fr;
        }
        .settings .year {
          grid-column: 1 / -1;
        }
      }
      @media (max-width: 520px) {
        .settings {
          grid-template-columns: 1fr;
        }
      }
      .years {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 0;
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        overflow: hidden;
      }
      .years button {
        border: none;
        border-right: 1px solid var(--border);
        background: var(--surface);
        padding: 10px 0;
        font-weight: 650;
        cursor: pointer;
        color: var(--text-2);
        font-variant-numeric: tabular-nums;
      }
      .years button:last-child {
        border-right: none;
      }
      .years button[aria-checked="true"] {
        background: var(--accent);
        color: var(--accent-ink);
      }
      input[type="range"] {
        width: 100%;
        accent-color: var(--accent);
        margin: 10px 0 0;
      }
      .yearhint {
        font-size: 0.8rem;
        color: var(--text-muted);
        margin-top: 8px;
        display: flex;
        gap: 6px;
        align-items: baseline;
        flex-wrap: wrap;
      }
      .unit {
        position: relative;
        display: block;
      }
      .settings > * {
        min-width: 0;
      }
      .unit span {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--text-muted);
        font-size: 0.8rem;
        pointer-events: none;
      }
      .unit input {
        padding-right: 92px;
      }
      .kpis {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
      }
      @media (max-width: 760px) {
        .kpis {
          grid-template-columns: 1fr;
        }
      }
      .kpi .label {
        font-size: 0.9rem;
        color: var(--text-2);
        font-weight: 600;
      }
      .kpi .value {
        font-size: clamp(2rem, 5vw, 2.8rem);
        font-weight: 700;
        letter-spacing: -0.02em;
        margin: 6px 0 2px;
        line-height: 1.1;
      }
      .kpi .sub {
        font-size: 0.85rem;
        color: var(--text-muted);
      }
      .kpi .delta {
        font-weight: 650;
        font-size: 0.95rem;
        margin-top: 8px;
      }
      .delta.up {
        color: var(--bad);
      }
      .delta.down {
        color: var(--good);
      }
      .kpi.selected {
        border-color: var(--accent);
        box-shadow: 0 0 0 1px var(--accent), var(--shadow);
      }
      .facts {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
      }
      .fact {
        padding: 16px 20px;
      }
      .fact .label {
        font-size: 0.8rem;
        color: var(--text-muted);
        font-weight: 600;
      }
      .fact .value {
        font-size: 1.35rem;
        font-weight: 700;
        margin-top: 2px;
      }
      @media (max-width: 640px) {
        .facts {
          grid-template-columns: 1fr;
        }
      }
      .note {
        font-size: 0.85rem;
        color: var(--text-muted);
        display: flex;
        gap: 8px;
        align-items: baseline;
      }
      .disclaimer {
        display: flex;
        gap: 12px;
        background: var(--warn-bg);
        border: 1px solid var(--warn-border);
        color: var(--warn-text);
        border-radius: var(--radius);
        padding: 16px 20px;
        font-size: 0.9rem;
      }
      .disclaimer strong {
        display: block;
        margin-bottom: 2px;
      }
      details.assumptions {
        font-size: 0.85rem;
        color: var(--text-2);
      }
      details.assumptions summary {
        cursor: pointer;
        font-weight: 600;
        color: var(--text);
      }
      details.assumptions p {
        margin: 10px 0 0;
      }
      .empty-results {
        text-align: center;
        color: var(--text-muted);
        padding: 36px 16px;
      }
      .empty-results .big {
        font-size: 2rem;
        margin-bottom: 8px;
        opacity: 0.6;
      }
    `,
  ];

  render() {
    return html`
      ${this.renderHeader()}
      <div class="wrap">
        <section class="hero">
          <h1>${t("app.title")}</h1>
          <p>${t("app.subtitle")}</p>
          <div class="hero-links">
            <span class="badge">${fa(faLock)} ${t("app.privacyBadge")}</span>
            <a class="badge link" href="./berechnung.html">${fa(faCalculator)} ${t("calc.link")}</a>
          </div>
        </section>
        <main>
          <div class="steps">${this.renderSourceStep()} ${this.renderUploadStep()}</div>
          ${this.renderSettings()}
          ${this.analysis ? this.renderResults(this.analysis) : this.renderEmpty()}
          ${this.renderDisclaimer()}
        </main>
      </div>
      <gc-footer></gc-footer>
    `;
  }

  private renderHeader() {
    const locale = getLocale();
    const theme = getTheme();
    const lang = (l: Locale, label: string) =>
      html`<button aria-pressed=${locale === l} @click=${() => {
        setLocale(l);
        track("language_changed", { locale: l });
      }} lang=${l}>${label}</button>`;
    const next = theme === "dark" ? "light" : "dark";
    return html`<header class="top">
      <div class="wrap">
        <div class="brand"><span class="logo">${fa(faBolt)}</span><span class="name">${t("app.title")}</span></div>
        <span class="spacer"></span>
        <div class="seg" role="group" aria-label=${t("header.language")}>${lang("de", "DE")}${lang("en", "EN")}</div>
        <button class="btn icon" @click=${() => {
          setTheme(next);
          track("theme_changed", { theme: next });
        }}
          aria-label=${t(next === "dark" ? "header.theme.dark" : "header.theme.light")}
          title=${t(next === "dark" ? "header.theme.dark" : "header.theme.light")}>
          ${fa(theme === "dark" ? faSun : faMoon)}
        </button>
      </div>
    </header>`;
  }

  private renderSourceStep() {
    const s = this.source;
    return html`<section class="card" aria-labelledby="s1">
      <div class="step-title"><span class="num">1</span><h2 id="s1">${t("step.source")}</h2></div>
      <label class="field">${t("source.label")}
        <select class="input" @change=${(e: Event) => {
          this.sourceId = (e.target as HTMLSelectElement).value;
          this.error = undefined;
          track("source_selected", { source: this.sourceId });
        }}>
          ${SOURCES.map(
            (o) =>
              html`<option value=${o.id} ?selected=${o.id === this.sourceId}>${t(o.label)}</option>`,
          )}
        </select>
      </label>
      <div class="instr">
        <h3>${t("source.requirements")}</h3>
        <ul>${s.requirements.map((k) => html`<li>${t(k)}</li>`)}</ul>
        <h3>${t("source.steps")}</h3>
        <ol>${s.steps.map((k) => html`<li>${t(k)}</li>`)}</ol>
        ${
          s.portal
            ? html`<a class="btn" href=${s.portal} target="_blank" rel="noopener noreferrer"
                @click=${() => track("portal_opened", { source: s.id })}>
                ${t("source.openPortal")} ${fa(faArrowUpRightFromSquare)}</a>`
            : nothing
        }
      </div>
    </section>`;
  }

  private renderUploadStep() {
    const a = this.analysis;
    return html`<section class="card" aria-labelledby="s2">
      <div class="step-title"><span class="num">2</span><h2 id="s2">${t("step.upload")}</h2></div>
      <div class="drop ${this.dragging ? "over" : ""}"
        @dragover=${(e: DragEvent) => {
          e.preventDefault();
          this.dragging = true;
        }}
        @dragleave=${() => {
          this.dragging = false;
        }}
        @drop=${this.onDrop}>
        <div class="big">${fa(faFileCsv)}</div>
        <div>${this.loading ? t("upload.reading") : t("upload.drop")}</div>
        <div class="muted">${t("upload.or")}</div>
        <label class="btn primary">
          ${fa(faUpload)} ${t("upload.choose")}
          <input class="sr-only" type="file" accept=".csv,text/csv,text/plain" @change=${this.onFileInput} />
        </label>
      </div>
      <p class="hint">${fa(faLock)} ${t("upload.hint")}</p>
      ${
        this.error
          ? html`<div class="error" role="alert">${fa(faCircleExclamation)}<span>${this.error}</span></div>`
          : nothing
      }
      ${
        a && !this.error
          ? html`<div class="loaded">${fa(faFileCsv)}
              <span class="grow">${t("upload.loaded", {
                rows: fmtNum(a.readings.length),
                from: fmtDate(a.from),
                to: fmtDate(a.to),
                kwh: fmtNum(a.totalKwh),
              })}</span></div>`
          : nothing
      }
    </section>`;
  }

  private renderSettings() {
    const years = this.source.tariffs.map((x) => x.year);
    const tariff = tariffFor(this.source.tariffs, this.year);
    const idx = years.indexOf(this.year);
    return html`<section class="card" aria-labelledby="s3">
      <div class="step-title"><span class="num">3</span><h2 id="s3">${t("step.settings")}</h2></div>
      <div class="settings">
        <div class="year">
          <label class="field" id="yl">${t("settings.year")}</label>
          <div class="years" role="radiogroup" aria-labelledby="yl">
            ${years.map(
              (y) =>
                html`<button role="radio" aria-checked=${y === this.year} @click=${() => this.setYear(y)}>${y}</button>`,
            )}
          </div>
          <input type="range" min="0" max=${years.length - 1} step="1" .value=${String(idx)}
            aria-label=${t("settings.year")} aria-valuetext=${String(this.year)}
            @input=${(e: Event) => this.setYear(years[+(e.target as HTMLInputElement).value])} />
          <div class="yearhint">
            ${tariff.estimate ? html`<span class="badge warn">${t("settings.estimate")}</span>` : nothing}
            <span>${t(tariff.capacity ? "settings.yearHint.new" : "settings.yearHint.2026")}</span>
          </div>
        </div>
        <label class="field">${t("settings.energyPrice")}
          <span class="unit"><input class="input" type="number" min="0" max="200" step="0.1" inputmode="decimal"
            .value=${String(this.contract.priceCt)}
            @change=${(e: Event) => this.setContract({ priceCt: Math.max(0, +(e.target as HTMLInputElement).value || 0) })} />
            <span>${t("settings.energyPriceUnit")}</span></span>
        </label>
        <label class="field">${t("settings.baseFee")}
          <span class="unit"><input class="input" type="number" min="0" max="100" step="0.1" inputmode="decimal"
            .value=${String(this.contract.baseFeeMonth)}
            @change=${(e: Event) => this.setContract({ baseFeeMonth: Math.max(0, +(e.target as HTMLInputElement).value || 0) })} />
            <span>${t("settings.baseFeeUnit")}</span></span>
        </label>
        <div class="field">
          <span>${t("settings.display")}</span>
          <div class="seg" role="group" aria-label=${t("settings.display")}>
            <button aria-pressed=${this.gross} @click=${() => {
              this.gross = true;
              track("vat_mode", { gross: true });
            }} title=${t("settings.grossHint")}>${t("settings.gross")}</button>
            <button aria-pressed=${!this.gross} @click=${() => {
              this.gross = false;
              track("vat_mode", { gross: false });
            }} title=${t("settings.netHint")}>${t("settings.net")}</button>
          </div>
        </div>
      </div>
    </section>`;
  }

  private renderEmpty() {
    return html`<section class="card empty-results">
      <div class="big">${fa(faFileCsv)}</div>
      <div>${t("upload.drop")} – ${t("step.results")}</div>
    </section>`;
  }

  private renderResults(a: Analysis) {
    const tariffs = this.source.tariffs;
    const todayTariff = tariffAt(tariffs, this.today);
    const selTariff = tariffFor(tariffs, this.year);
    const today = yearCost(a.months, todayTariff, this.contract);
    const sel = yearCost(a.months, selTariff, this.contract);
    const v = (y: YearCost) => (this.gross ? y.total.gross : y.total.net);
    const g = (y: YearCost) =>
      gridTotal(y.total) * (this.gross ? 1 + y.total.vat / y.total.net : 1);
    const diff = v(sel) - v(today);
    const pct = v(today) ? diff / v(today) : 0;
    const window = sel.months.map((r) => r.month);
    const peaks = window.map((m) => m.peakKw);
    const maxPeak = Math.max(...peaks);
    const avgPeak = peaks.reduce((s, p) => s + p, 0) / Math.max(1, peaks.length);
    const yearKwh = window.reduce((s, m) => s + m.kwh, 0) * sel.scale;
    const thr = selTariff.capacity?.thresholdKw ?? 10;
    const mode = this.gross ? t("settings.gross") : t("settings.net");

    return html`
      <section aria-labelledby="s4">
        <div class="step-title"><span class="num">4</span><h2 id="s4">${t("step.results")}</h2></div>
        <div class="kpis">
          <div class="card kpi">
            <div class="label">${t("kpi.today")}</div>
            <div class="value">${fmtEur(v(today))}</div>
            <div class="sub">${t("kpi.todayDate", { date: fmtDate(this.today), year: todayTariff.year })}</div>
            <div class="sub">${t("kpi.grid")}: ${fmtEur(g(today))}</div>
          </div>
          <div class="card kpi selected">
            <div class="label">${t("kpi.selected", { year: this.year })}
              ${selTariff.estimate ? html`<span class="badge warn">${t("settings.estimate")}</span>` : nothing}</div>
            <div class="value">${fmtEur(v(sel))}</div>
            <div class="sub">${t("kpi.grid")}: ${fmtEur(g(sel))}</div>
            ${
              Math.abs(diff) < 0.5
                ? html`<div class="delta">${t("kpi.same")}</div>`
                : html`<div class="delta ${diff > 0 ? "up" : "down"}">${t("kpi.diff", {
                    sign: diff > 0 ? "+" : "−",
                    amount: fmtEur(Math.abs(diff)),
                    pct: fmtPct(pct),
                  })}</div>`
            }
          </div>
        </div>
      </section>
      <div class="facts">
        <div class="card fact"><div class="label">${t("kpi.consumption")}</div><div class="value">${fmtNum(yearKwh)} kWh</div></div>
        <div class="card fact"><div class="label">${t("kpi.maxPeak")}</div><div class="value">${fmtNum(maxPeak, 2)} kW</div></div>
        <div class="card fact"><div class="label">${t("kpi.avgPeak")}</div><div class="value">${fmtNum(avgPeak, 2)} kW</div></div>
      </div>
      ${
        Math.abs(sel.scale - 1) > 0.03
          ? html`<p class="note">${fa(faCircleInfo)} ${t("kpi.scaled", { months: fmtNum(12 / sel.scale, 1) })}</p>`
          : nothing
      }
      <section class="card">
        <div class="card-head"><h2>${t("chart.monthly.title")}</h2></div>
        <p class="desc">${t("chart.monthly.desc")}</p>
        <gc-chart-monthly .months=${a.months} ?showPeak=${!!selTariff.capacity} .thresholdKw=${thr}></gc-chart-monthly>
      </section>
      <section class="card">
        <div class="card-head"><h2>${t("chart.costs.title")}</h2>
          ${selTariff.estimate ? html`<span class="badge warn">${t("settings.estimate")}</span>` : nothing}</div>
        <p class="desc">${t("chart.costs.desc", { year: this.year, mode })}</p>
        <gc-chart-costs .rows=${sel.months} ?gross=${this.gross}></gc-chart-costs>
      </section>
      <section class="card">
        <div class="card-head"><h2>${t("chart.detail.title")}</h2></div>
        <p class="desc">${t("chart.detail.desc")}</p>
        <gc-chart-detail .readings=${a.readings} .months=${a.months} .index=${this.detailIndex}
          ?showThreshold=${!!selTariff.capacity} .thresholdKw=${thr}
          @month-change=${(e: CustomEvent<number>) => {
            this.detailIndex = e.detail;
          }}></gc-chart-detail>
      </section>
    `;
  }

  private renderDisclaimer() {
    return html`
      <aside class="disclaimer" role="note">
        ${fa(faTriangleExclamation)}
        <div><strong>${t("disclaimer.title")}</strong>${t("disclaimer.text")}</div>
      </aside>
      <details class="card assumptions">
        <summary>${t("assumptions.title")}</summary>
        <p>${t("assumptions.text")}</p>
        <p><a href="./berechnung.html">${fa(faCalculator)} ${t("calc.link")}</a></p>
        <p class="muted">${t("assumptions.updated", { date: fmtDate(new Date(TARIFF_DATA_DATE)) })}</p>
      </details>
    `;
  }
}

customElements.define("gc-app", GcApp);
