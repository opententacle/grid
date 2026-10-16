import { faArrowLeft } from "@fortawesome/free-solid-svg-icons/faArrowLeft";
import { faBolt } from "@fortawesome/free-solid-svg-icons/faBolt";
import { faCircleQuestion } from "@fortawesome/free-solid-svg-icons/faCircleQuestion";
import { faMoon } from "@fortawesome/free-solid-svg-icons/faMoon";
import { faSun } from "@fortawesome/free-solid-svg-icons/faSun";
import { css, html } from "lit";
import { IMPRESSUM } from "../config";
import { fmtDate, fmtNum } from "../core/format";
import { TARIFF_DATA_DATE, WIENER_NETZE_TARIFFS } from "../core/tariffs";
import { EXPLAIN } from "../i18n/explain";
import { FAQ } from "../i18n/faq";
import { getLocale, type Locale, type MessageKey, setLocale, t } from "../i18n/i18n";
import { getTheme, setTheme } from "../theme";
import { BaseElement, define, fa, sharedStyles } from "./base";
import "./gc-footer";

const PRIVACY_SECTIONS: [MessageKey, MessageKey][] = [
  ["privacy.csv.title", "privacy.csv.text"],
  ["privacy.analytics.title", "privacy.analytics.text"],
  ["privacy.storage.title", "privacy.storage.text"],
  ["privacy.hosting.title", "privacy.hosting.text"],
  ["privacy.rights.title", "privacy.rights.text"],
];

const TITLES = {
  privacy: "privacy.title",
  imprint: "imprint.title",
  calc: "calc.title",
  faq: "faq.title",
} as const satisfies Record<string, MessageKey>;

/** Content pages: calculation explained, FAQ, privacy and imprint. */
export class GcLegal extends BaseElement {
  static properties = { page: { type: String } };
  declare page: keyof typeof TITLES;

  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
      }
      header {
        border-bottom: 1px solid var(--border);
        background: var(--surface);
      }
      .bar,
      main {
        max-width: 760px;
        margin: 0 auto;
        padding: 0 16px;
      }
      .bar {
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
        color: var(--text);
        text-decoration: none;
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
      .seg button[aria-pressed="true"] {
        background: var(--accent-soft);
        color: var(--accent);
      }
      main {
        padding-top: 32px;
        padding-bottom: 32px;
      }
      h1 {
        font-size: 1.9rem;
        letter-spacing: -0.02em;
        margin: 16px 0;
      }
      h2 {
        margin-top: 24px;
        margin-bottom: 6px;
      }
      p {
        color: var(--text-2);
        margin: 0 0 8px;
      }
      address {
        font-style: normal;
        color: var(--text-2);
      }
      .lead {
        font-size: 1.05rem;
      }
      nav.toc {
        margin: 16px 0 8px;
        padding: 12px 16px;
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        background: var(--surface);
        font-size: 0.9rem;
      }
      nav.toc ol {
        margin: 0;
        padding-left: 0;
        list-style: none;
        columns: 2;
        column-gap: 24px;
      }
      @media (max-width: 560px) {
        nav.toc ol {
          columns: 1;
        }
      }
      nav.toc a {
        color: var(--text-2);
        text-decoration: none;
        line-height: 1.9;
      }
      nav.toc a:hover {
        color: var(--accent);
      }
      section {
        scroll-margin-top: 16px;
      }
      .formula {
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
        font-size: 0.85rem;
        background: var(--surface-2);
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        padding: 10px 12px;
        margin: 8px 0 12px;
        overflow-x: auto;
      }
      .table-wrap {
        overflow-x: auto;
        margin: 8px 0 12px;
      }
      table {
        border-collapse: collapse;
        width: 100%;
        font-size: 0.85rem;
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
        white-space: normal;
      }
      th {
        color: var(--text-2);
        font-weight: 600;
      }
      .model {
        color: var(--warn-text);
      }
      .bar a.nav {
        color: var(--text-2);
        font-weight: 600;
        font-size: 0.9rem;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .bar a.nav:hover,
      .bar a.nav[aria-current="page"] {
        color: var(--accent);
      }
      @media (max-width: 480px) {
        .bar a.nav .label {
          display: none;
        }
      }
      details.acc {
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        background: var(--surface);
        margin: 0 0 8px;
        scroll-margin-top: 16px;
      }
      details.acc > summary {
        cursor: pointer;
        padding: 12px 16px;
        font-weight: 600;
        list-style: none;
        display: flex;
        align-items: baseline;
        gap: 8px;
      }
      details.acc > summary::-webkit-details-marker {
        display: none;
      }
      details.acc > summary::before {
        content: "›";
        display: inline-block;
        width: 1em;
        color: var(--text-muted);
        transition: transform 0.15s;
      }
      details.acc[open] > summary::before {
        transform: rotate(90deg);
      }
      details.acc > summary .hint {
        font-weight: 400;
        color: var(--text-muted);
        font-size: 0.85rem;
      }
      details.acc > .body {
        padding: 0 16px 12px 40px;
      }
      details.timeline {
        margin: 16px 0 24px;
      }
      ol.tl {
        list-style: none;
        margin: 4px 0 4px;
        padding: 0 0 0 20px;
        border-left: 2px solid var(--border);
      }
      ol.tl > li {
        position: relative;
        padding: 0 0 14px 4px;
      }
      ol.tl > li::before {
        content: "";
        position: absolute;
        left: -26px;
        top: 5px;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: var(--accent);
        border: 2px solid var(--surface);
      }
      ol.tl > li.plan::before {
        background: var(--surface);
        border: 2px dashed var(--accent);
      }
      ol.tl .date {
        display: block;
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--accent);
        font-variant-numeric: tabular-nums;
      }
      ol.tl .title {
        font-weight: 600;
      }
      ol.tl .tag {
        margin-left: 6px;
        font-size: 0.7rem;
        font-weight: 600;
        padding: 1px 6px;
        border-radius: 999px;
        border: 1px dashed var(--border);
        color: var(--text-muted);
      }
      ol.tl ul {
        margin: 2px 0 0;
        padding-left: 18px;
        color: var(--text-2);
        font-size: 0.9rem;
      }
      .ref {
        font-size: 0.8rem;
        color: var(--text-muted);
      }
    `,
  ];

  render() {
    const locale = getLocale();
    const theme = getTheme();
    const next = theme === "dark" ? "light" : "dark";
    const lang = (l: Locale, label: string) =>
      html`<button aria-pressed=${locale === l} @click=${() => setLocale(l)} lang=${l}>${label}</button>`;
    document.title = `${t(TITLES[this.page] ?? "imprint.title")} · ${t("app.title")}`;
    return html`<header>
        <div class="bar">
          <a class="brand" href="./"><span class="logo">${fa(faBolt)}</span>${t("app.title")}</a>
          <span class="spacer"></span>
          <a class="nav" href="./faq.html" aria-label=${t("header.faq")} title=${t("header.faq")} aria-current=${this.page === "faq" ? "page" : "false"}>${fa(faCircleQuestion)} <span class="label">${t("header.faq")}</span></a>
          <div class="seg" role="group" aria-label=${t("header.language")}>${lang("de", "DE")}${lang("en", "EN")}</div>
          <button class="btn icon" @click=${() => setTheme(next)}
            aria-label=${t(next === "dark" ? "header.theme.dark" : "header.theme.light")}>${fa(theme === "dark" ? faSun : faMoon)}</button>
        </div>
      </header>
      <main>
        <a class="btn" href="./">${fa(faArrowLeft)} ${t("footer.back")}</a>
        ${
          this.page === "privacy"
            ? this.renderPrivacy()
            : this.page === "calc"
              ? this.renderCalc()
              : this.page === "faq"
                ? this.renderFaq()
                : this.renderImprint()
        }
      </main>
      <gc-footer></gc-footer>`;
  }

  private renderPrivacy() {
    return html`<h1>${t("privacy.title")}</h1>
      <p><strong>${t("privacy.intro")}</strong></p>
      ${PRIVACY_SECTIONS.map(([h, p]) => html`<h2>${t(h)}</h2><p>${t(p)}</p>`)}`;
  }

  private renderCalc() {
    const x = EXPLAIN[getLocale()];
    return html`<h1>${x.title}</h1>
      <p class="lead">${x.intro}</p>
      <nav class="toc" aria-label=${x.title}>
        <ol>${x.sections.map((s) => html`<li><a href=${`#${s.id}`} @click=${(e: Event) => this.jump(e, s.id)}>${s.title}</a></li>`)}</ol>
      </nav>
      ${x.sections.map(
        (s) => html`<section id=${s.id}>
          <h2>${s.title}</h2>
          ${s.paragraphs.map((p) => html`<p>${p}</p>`)}
          ${s.formula ? html`<div class="formula">${s.formula}</div>` : null}
          ${s.table === "tariffs" ? this.tariffTable() : null}
          ${s.table === "levies" ? this.leviesTable() : null}
        </section>`,
      )}
      <p class="muted">${t("assumptions.updated", { date: fmtDate(new Date(TARIFF_DATA_DATE)) })}</p>`;
  }

  private renderFaq() {
    const f = FAQ[getLocale()];
    return html`<h1>${f.title}</h1>
      <p class="lead">${f.intro}</p>
      <details class="acc timeline" id="timeline">
        <summary>${f.timelineTitle} <span class="hint">${f.timelineHint}</span></summary>
        <div class="body">
          <ol class="tl">
            ${f.timeline.map(
              (s) => html`<li class=${s.plan ? "plan" : ""}>
                <span class="date">${s.date}</span>
                <span class="title">${s.title}</span>${s.plan ? html`<span class="tag">${f.planLabel}</span>` : null}
                <ul>${s.points.map((p) => html`<li>${p}</li>`)}</ul>
              </li>`,
            )}
          </ol>
        </div>
      </details>
      ${f.items.map(
        (q) => html`<details class="acc" id=${q.id}>
          <summary>${q.q}</summary>
          <div class="body">
            ${q.a.map((p) => html`<p>${p}</p>`)}
            ${q.ref ? html`<p class="ref">${f.sourceLabel}: SNE-G-V ${q.ref}</p>` : null}
          </div>
        </details>`,
      )}
      <p class="muted">${t("assumptions.updated", { date: fmtDate(new Date(TARIFF_DATA_DATE)) })}</p>`;
  }

  /** Anchor links inside the shadow DOM do not scroll on their own. */
  private jump(e: Event, id: string) {
    e.preventDefault();
    this.renderRoot.querySelector(`#${id}`)?.scrollIntoView({ behavior: "smooth" });
    history.replaceState(null, "", `#${id}`);
  }

  protected firstUpdated(): void {
    const id = location.hash.slice(1);
    const target = id ? this.renderRoot.querySelector(`#${CSS.escape(id)}`) : null;
    if (target instanceof HTMLDetailsElement) target.open = true;
    target?.scrollIntoView();
  }

  private tariffTable() {
    const x = EXPLAIN[getLocale()].tables;
    const ts = WIENER_NETZE_TARIFFS;
    const n = (v: number | undefined, d = 2) => (v === undefined || v === 0 ? "–" : fmtNum(v, d));
    const row = (label: string, f: (tt: (typeof ts)[number]) => string) =>
      html`<tr><td>${label}</td>${ts.map((tt) => html`<td class=${tt.estimate ? "model" : ""}>${f(tt)}</td>`)}</tr>`;
    return html`<div class="table-wrap"><table>
      <thead><tr><th>${x.item}</th>${ts.map((tt) => html`<th>${tt.year}${tt.estimate ? "*" : ""}</th>`)}</tr></thead>
      <tbody>
        ${row(x.energy, (tt) => n(tt.energyCt))}
        ${row(x.flat, (tt) => n(tt.flatFeeYear))}
        ${row(x.capLow, (tt) => n(tt.capacity?.lowEurKwYear))}
        ${row(x.capHigh, (tt) => n(tt.capacity?.highEurKwYear))}
        ${row(x.loss, (tt) => n(tt.lossCt))}
        ${row(x.meter, (tt) => n(tt.meterEurMonth))}
        ${row(x.snap, (tt) => `−${fmtNum(tt.snapReduction * 100)} %`)}
      </tbody>
    </table></div>
    <p class="muted">* ${x.model}</p>`;
  }

  private leviesTable() {
    const x = EXPLAIN[getLocale()].tables;
    const l = WIENER_NETZE_TARIFFS[0].levies;
    const pct = (v: number, d = 1) => `${fmtNum(v * 100, d)} %`;
    const e = l.eagContribution;
    return html`<div class="table-wrap"><table>
      <tbody>
        <tr><td>${x.elTax}</td><td>${fmtNum(l.electricityTaxCt, 2)}</td></tr>
        <tr><td>${x.eagFlat}</td><td>${fmtNum(l.eagFlatYear, 2)}</td></tr>
        <tr><td>${x.eagShare}</td><td>${pct(e.energyRate)} / ${pct(e.capacityRate)} / ${pct(e.lossRate)}</td></tr>
        <tr><td>${x.usage}</td><td>${pct(l.usageTaxRate, 0)}</td></tr>
        <tr><td>${x.vat}</td><td>${pct(l.vatRate, 0)}</td></tr>
      </tbody>
    </table></div>`;
  }

  private renderImprint() {
    const i = IMPRESSUM;
    return html`<h1>${t("imprint.title")}</h1>
      <p>${t("imprint.law")}</p>
      <h2>${t("imprint.owner")}</h2>
      <address>${i.name}<br />${i.street}<br />${i.city}<br />${i.country}</address>
      <h2>${t("imprint.contact")}</h2>
      <p><a href=${`mailto:${i.email}`}>${i.email}</a></p>
      <h2>${t("imprint.purpose")}</h2>
      <p>${i.purpose}</p>
      <h2>${t("imprint.liability")}</h2>
      <p>${t("disclaimer.text")}</p>`;
  }
}

define("gc-legal", GcLegal);
