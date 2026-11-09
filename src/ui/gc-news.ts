import { faBullhorn } from "@fortawesome/free-solid-svg-icons/faBullhorn";
import { faXmark } from "@fortawesome/free-solid-svg-icons/faXmark";
import { css, html, nothing } from "lit";
import { track } from "../analytics";
import { AUTHOR } from "../config";
import { fmtDate } from "../core/format";
import { getLocale, t } from "../i18n/i18n";
import { currentNews, type NewsEntry } from "../i18n/news";
import { BaseElement, define, fa, sharedStyles } from "./base";

export const NEWS_KEY = "gc.newsSeen";

function readSeen(): string | null {
  try {
    return localStorage.getItem(NEWS_KEY);
  } catch {
    return null;
  }
}

/** Banner with the changes of the latest release. It stays closed until the next entry. */
export class GcNews extends BaseElement {
  static properties = { entry: { state: true } };
  declare entry: NewsEntry | undefined;

  constructor(today = new Date()) {
    super();
    const entry = currentNews(today);
    this.entry = entry && readSeen() !== entry.id ? entry : undefined;
  }

  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
      }
      .news {
        display: flex;
        gap: 12px;
        align-items: flex-start;
        background: var(--accent-soft);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        padding: 14px 16px;
        margin: 16px 0 0;
      }
      .icon {
        color: var(--accent);
        padding-top: 2px;
      }
      .body {
        flex: 1;
        min-width: 0;
      }
      h2 {
        font-size: 0.95rem;
        margin: 0 0 6px;
      }
      .date {
        font-weight: 400;
        color: var(--text-muted);
        font-size: 0.8rem;
        margin-left: 6px;
      }
      ul {
        margin: 0;
        padding-left: 18px;
        font-size: 0.875rem;
      }
      li + li {
        margin-top: 2px;
      }
      .links {
        display: flex;
        flex-wrap: wrap;
        gap: 6px 16px;
        margin-top: 8px;
        font-size: 0.85rem;
      }
      .links a {
        color: var(--accent);
      }
      .close {
        flex: none;
        background: none;
        border: 0;
        color: var(--text-2);
        cursor: pointer;
        padding: 4px;
        border-radius: var(--radius-sm);
        line-height: 0;
      }
      .close:hover {
        color: var(--text);
      }
    `,
  ];

  private close() {
    const entry = this.entry;
    if (!entry) return;
    try {
      localStorage.setItem(NEWS_KEY, entry.id);
    } catch {
      // storage blocked: hide for this page view only
    }
    this.entry = undefined;
    track("news_closed", { id: entry.id });
  }

  render() {
    const entry = this.entry;
    if (!entry) return nothing;
    const text = entry.text[getLocale()];
    return html`<aside class="news" aria-labelledby="news-title">
      <span class="icon" aria-hidden="true">${fa(faBullhorn)}</span>
      <div class="body">
        <h2 id="news-title">${t("news.title")}: ${text.title}
          <span class="date">${fmtDate(new Date(`${entry.date}T00:00:00`))}</span></h2>
        <ul>${text.points.map((p) => html`<li>${p}</li>`)}</ul>
        <div class="links">
          ${entry.href && text.link ? html`<a href=${entry.href}>${text.link}</a>` : nothing}
          <a href=${`${AUTHOR.repo}/releases`} target="_blank" rel="noopener noreferrer">${t("news.all")}</a>
        </div>
      </div>
      <button class="close" @click=${() => this.close()} aria-label=${t("news.close")}
        title=${t("news.close")}>${fa(faXmark)}</button>
    </aside>`;
  }
}

define("gc-news", GcNews);
