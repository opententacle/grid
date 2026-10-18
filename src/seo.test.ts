import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { FAQ } from "./i18n/faq";
import { escapeHtml, injectSeo, jsonLd, noscriptHtml, structuredData } from "./seo";

const page = (name: string) => readFileSync(resolve(process.cwd(), name), "utf8");

describe("seo", () => {
  it("escapes HTML", () => {
    expect(escapeHtml(`<a href="x">&</a>`)).toBe("&lt;a href=&quot;x&quot;&gt;&amp;&lt;/a&gt;");
  });

  it("keeps JSON-LD text from closing the script element", () => {
    const out = jsonLd({ text: "</script><b>" });
    expect(out).not.toContain("</script><b>");
    expect(JSON.parse(out.replace(/^<script[^>]*>|<\/script>$/g, ""))).toEqual({
      text: "</script><b>",
    });
  });

  it("writes static content for the app, calculation and FAQ pages", () => {
    expect(noscriptHtml("app")).toContain("<h1>Netzkosten-Rechner</h1>");
    expect(noscriptHtml("calc")).toContain("<h1>So rechnet der Netzkosten-Rechner</h1>");
    const faq = noscriptHtml("faq");
    for (const q of FAQ.de.items) expect(faq).toContain(`<h2>${escapeHtml(q.q)}</h2>`);
    expect(noscriptHtml("privacy")).not.toContain("<main>");
    expect(noscriptHtml("imprint")).toContain('<a href="/faq.html">');
  });

  it("gives structured data for the app and FAQ pages only", () => {
    expect(structuredData("app")).toMatchObject({ "@type": "WebApplication" });
    const faq = structuredData("faq") as { mainEntity: unknown[] };
    expect(faq).toMatchObject({ "@type": "FAQPage" });
    expect(faq.mainEntity).toHaveLength(FAQ.de.items.length);
    expect(structuredData("calc")).toBeUndefined();
  });

  it.each([
    ["index.html", "WebApplication"],
    ["faq.html", "FAQPage"],
  ])("adds content and structured data to %s", (file, type) => {
    const out = injectSeo(page(file));
    expect(out).toContain("<noscript>Diese Seite benötigt JavaScript.");
    expect(out).toContain("<main><h1>");
    expect(out).toMatch(
      new RegExp(`application/ld\\+json">[^<]*"@type":"${type}"[\\s\\S]*</head>`),
    );
  });

  it("adds only content to pages without structured data", () => {
    const out = injectSeo(page("datenschutz.html"));
    expect(out).toContain("<nav>");
    expect(out).not.toContain("application/ld+json");
  });

  it("does not change HTML without a known page", () => {
    const html = "<html><body><noscript>x</noscript></body></html>";
    expect(injectSeo(html)).toBe(html);
    expect(injectSeo('<body data-page="other">')).toBe('<body data-page="other">');
  });
});
