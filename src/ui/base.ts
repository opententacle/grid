import { config, type IconDefinition, icon } from "@fortawesome/fontawesome-svg-core";
import { css, LitElement } from "lit";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { onLocaleChange } from "../i18n/i18n";
import { onThemeChange } from "../theme";

config.autoAddCss = false;

/** Renders a Font Awesome icon as inline SVG (trusted library markup only). */
export const fa = (def: IconDefinition, title?: string) =>
  unsafeSVG(icon(def, title ? { title } : {}).html.join(""));

/** LitElement that re-renders on language and theme changes. */
export class BaseElement extends LitElement {
  private unsubs: (() => void)[] = [];

  connectedCallback(): void {
    super.connectedCallback();
    this.unsubs = [
      onLocaleChange(() => this.onEnvChange()),
      onThemeChange(() => this.onEnvChange()),
    ];
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    for (const u of this.unsubs) u();
  }

  protected onEnvChange(): void {
    this.requestUpdate();
  }
}

export const sharedStyles = css`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
  :host {
    font-family: var(--font);
    color: var(--text);
  }
  .svg-inline--fa {
    display: inline-block;
    height: 1em;
    width: auto;
    overflow: visible;
    vertical-align: -0.125em;
  }
  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    padding: 24px;
  }
  @media (max-width: 480px) {
    .card {
      padding: 16px;
    }
  }
  .card-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 4px;
  }
  h2,
  h3 {
    margin: 0;
    font-weight: 650;
    letter-spacing: -0.01em;
  }
  h2 {
    font-size: 1.15rem;
  }
  h3 {
    font-size: 1rem;
  }
  .desc {
    color: var(--text-2);
    font-size: 0.9rem;
    margin: 4px 0 16px;
  }
  .muted {
    color: var(--text-muted);
  }
  button,
  select,
  input {
    font: inherit;
    color: inherit;
  }
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border: 1px solid var(--border);
    background: var(--surface);
    border-radius: var(--radius-sm);
    padding: 8px 14px;
    cursor: pointer;
    font-weight: 550;
    text-decoration: none;
    color: var(--text);
    transition: background 0.15s, border-color 0.15s;
  }
  .btn:hover {
    background: var(--surface-2);
  }
  .btn.primary {
    background: var(--accent);
    border-color: var(--accent);
    color: var(--accent-ink);
  }
  .btn.primary:hover {
    filter: brightness(1.08);
  }
  .btn.icon {
    padding: 8px;
    width: 38px;
    height: 38px;
    justify-content: center;
  }
  .btn:disabled {
    opacity: 0.45;
    cursor: default;
  }
  :focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: var(--radius-sm);
    background: var(--accent-soft);
    color: var(--accent);
    white-space: nowrap;
  }
  .badge.warn {
    background: var(--warn-bg);
    color: var(--warn-text);
  }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
`;
