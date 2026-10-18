import { AUTHOR, SITE_URL } from "./config";
import { de } from "./i18n/de";
import { EXPLAIN } from "./i18n/explain";
import { FAQ } from "./i18n/faq";

/**
 * Static HTML for search engines and link previews, made at build time (see vite.config.ts).
 * The app renders all text with JavaScript. Crawlers without JavaScript see only this content.
 * Content is German, the same as the lang attribute and the meta tags of the HTML files.
 */

export type Page = "app" | "calc" | "faq" | "privacy" | "imprint";

const NOSCRIPT_HINT = "Diese Seite benötigt JavaScript. / This page needs JavaScript.";

export function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** JSON-LD block. "<" is escaped, so text cannot close the script element. */
export function jsonLd(data: object): string {
  const json = JSON.stringify(data).replaceAll("<", "\\u003c");
  return `<script type="application/ld+json">${json}</script>`;
}

const p = (s: string) => `<p>${escapeHtml(s)}</p>`;
const ul = (items: string[]) =>
  `<ul>${items.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul>`;

const LINKS: [string, string][] = [
  ["/", de["app.title"]],
  ["/berechnung.html", de["footer.calc"]],
  ["/faq.html", de["footer.faq"]],
  ["/datenschutz.html", de["footer.privacy"]],
  ["/impressum.html", de["footer.imprint"]],
];
const NAV = `<nav>${LINKS.map(([href, label]) => `<a href="${href}">${escapeHtml(label)}</a>`).join(" · ")}</nav>`;

function appContent(): string {
  return `<h1>${escapeHtml(de["app.title"])}</h1>${p(de["app.subtitle"])}${p(de["app.privacyBadge"])}${ul(
    [de["source.wienernetze"], de["source.atformat"], de["source.econtrol"]],
  )}${p(de["source.allAustria"])}`;
}

function calcContent(): string {
  const e = EXPLAIN.de;
  const sections = e.sections
    .map(
      (s) =>
        `<section><h2>${escapeHtml(s.title)}</h2>${s.paragraphs.map(p).join("")}${
          s.formula ? p(s.formula) : ""
        }</section>`,
    )
    .join("");
  return `<h1>${escapeHtml(e.title)}</h1>${p(e.intro)}${sections}`;
}

function faqContent(): string {
  const f = FAQ.de;
  const timeline = f.timeline
    .map((s) => `<li>${escapeHtml(`${s.date}: ${s.title}`)}${ul(s.points)}</li>`)
    .join("");
  const items = f.items
    .map(
      (q) =>
        `<section id="${escapeHtml(q.id)}"><h2>${escapeHtml(q.q)}</h2>${q.a.map(p).join("")}${
          q.list ? ul(q.list) : ""
        }${q.ref ? p(`${f.sourceLabel}: SNE-G-V ${q.ref}`) : ""}</section>`,
    )
    .join("");
  return `<h1>${escapeHtml(f.title)}</h1>${p(f.intro)}<h2>${escapeHtml(f.timelineTitle)}</h2><ol>${timeline}</ol>${items}`;
}

/** Content of the noscript element of a page. */
export function noscriptHtml(page: Page): string {
  const content =
    page === "app"
      ? appContent()
      : page === "calc"
        ? calcContent()
        : page === "faq"
          ? faqContent()
          : "";
  return `${NOSCRIPT_HINT}${content ? `<main>${content}</main>` : ""}${NAV}`;
}

/** Answer of a FAQ item as plain text, for structured data. */
function answerText(q: (typeof FAQ.de.items)[number]): string {
  return [...q.a, ...(q.list ?? [])].join(" ");
}

/** schema.org data of a page, or undefined. */
export function structuredData(page: Page): object | undefined {
  if (page === "app") {
    return {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: de["app.title"],
      url: `${SITE_URL}/`,
      description: de["app.subtitle"],
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript",
      inLanguage: ["de", "en"],
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
      author: { "@type": "Person", name: AUTHOR.name, url: AUTHOR.github },
    };
  }
  if (page === "faq") {
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: "de",
      mainEntity: FAQ.de.items.map((q) => ({
        "@type": "Question",
        name: q.q,
        acceptedAnswer: { "@type": "Answer", text: answerText(q) },
      })),
    };
  }
  return undefined;
}

const PAGES: readonly Page[] = ["app", "calc", "faq", "privacy", "imprint"];

/** Adds the static content and the structured data to an HTML file with a data-page attribute. */
export function injectSeo(html: string): string {
  const page = html.match(/<body data-page="([a-z]+)"/)?.[1] as Page | undefined;
  if (!page || !PAGES.includes(page)) return html;
  const data = structuredData(page);
  let out = html.replace(
    /<noscript>[\s\S]*?<\/noscript>/,
    `<noscript>${noscriptHtml(page)}</noscript>`,
  );
  if (data) out = out.replace("</head>", `${jsonLd(data)}\n  </head>`);
  return out;
}
