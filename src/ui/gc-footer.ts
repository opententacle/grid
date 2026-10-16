import { faGithub } from "@fortawesome/free-brands-svg-icons/faGithub";
import { faLinkedin } from "@fortawesome/free-brands-svg-icons/faLinkedin";
import { css, html } from "lit";
import { AUTHOR } from "../config";
import { t } from "../i18n/i18n";
import { BaseElement, define, fa, sharedStyles } from "./base";

const VERSION = (import.meta.env.VITE_APP_VERSION as string | undefined) || "dev";

/** Release notes of this version on GitHub; all releases for a dev build. */
export const releaseUrl = (version: string) =>
  version === "dev"
    ? `${AUTHOR.repo}/releases`
    : `${AUTHOR.repo}/releases/tag/${encodeURIComponent(version)}`;

export class GcFooter extends BaseElement {
  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
        border-top: 1px solid var(--border);
        background: var(--surface);
        margin-top: 24px;
      }
      .wrap {
        max-width: 1120px;
        margin: 0 auto;
        padding: 24px 16px;
        display: flex;
        flex-wrap: wrap;
        gap: 12px 24px;
        align-items: center;
        font-size: 0.85rem;
        color: var(--text-muted);
      }
      .author {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .author a.social {
        color: var(--text-muted);
        display: inline-flex;
        font-size: 1rem;
        transition: color 0.15s;
      }
      .author a.social:hover {
        color: var(--text);
      }
      .spacer {
        flex: 1;
      }
      nav {
        display: flex;
        gap: 18px;
        flex-wrap: wrap;
      }
      nav a {
        color: var(--text-2);
        text-decoration: none;
      }
      nav a:hover {
        color: var(--text);
        text-decoration: underline;
      }
    `,
  ];

  render() {
    return html`<footer class="wrap">
      <div class="author">
        <span>${t("footer.madeBy")} ${AUTHOR.name}</span>
        <a class="social" href=${AUTHOR.linkedin} target="_blank" rel="noopener noreferrer me" aria-label="LinkedIn" title="LinkedIn">${fa(faLinkedin)}</a>
        <a class="social" href=${AUTHOR.github} target="_blank" rel="noopener noreferrer me" aria-label="GitHub" title="GitHub">${fa(faGithub)}</a>
      </div>
      <span class="spacer"></span>
      <nav>
        <a href=${AUTHOR.repo} target="_blank" rel="noopener noreferrer">${t("footer.source")}</a>
        <a href="./berechnung.html">${t("footer.calc")}</a>
        <a href="./faq.html">${t("footer.faq")}</a>
        <a href="./datenschutz.html">${t("footer.privacy")}</a>
        <a href="./impressum.html">${t("footer.imprint")}</a>
        <a href=${releaseUrl(VERSION)} target="_blank" rel="noopener noreferrer"
          title=${t("footer.releaseNotes")}>${t("footer.version", { version: VERSION })}</a>
      </nav>
    </footer>`;
  }
}

define("gc-footer", GcFooter);
