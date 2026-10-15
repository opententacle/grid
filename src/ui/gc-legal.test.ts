import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { AUTHOR, IMPRESSUM } from "../config";
import { setLocale } from "../i18n/i18n";
import { GcFooter } from "./gc-footer";
import { GcLegal } from "./gc-legal";
import { $, $$, mount } from "./test-helpers";

const page = (p: GcLegal["page"]) => mount(Object.assign(new GcLegal(), { page: p }));

beforeEach(() => setLocale("de"));
afterEach(() => {
  document.body.innerHTML = "";
  history.replaceState(null, "", "/");
});

describe("gc-legal", () => {
  it("renders the privacy page", async () => {
    const el = await page("privacy");
    expect($(el, "h1").textContent).toBe("Datenschutz");
    expect($$(el, "main h2").length).toBe(5);
    expect(document.title).toContain("Datenschutz");
  });

  it("renders the imprint from the config", async () => {
    const el = await page("imprint");
    expect($(el, "address").textContent).toContain(IMPRESSUM.street);
    expect($(el, "main a[href^='mailto:']").textContent).toBe(IMPRESSUM.email);
  });

  it("renders the calculation page with generated tables", async () => {
    const el = await page("calc");
    expect($(el, "h1").textContent).toBe("So rechnet der Netzkosten-Rechner");
    expect($$(el, "section")).toHaveLength(9);
    const header = $$(el, "#prices thead th").map((th) => th.textContent);
    expect(header).toEqual(["Position", "2026", "2027*", "2028*", "2029*", "2030*"]);
    expect($(el, "#more table").textContent).toContain("7 %");
    expect($$(el, ".formula")).toHaveLength(2);
  });

  it("jumps to a section from the table of contents", async () => {
    const el = await page("calc");
    $<HTMLAnchorElement>(el, "nav.toc a[href='#example']").click();
    expect(location.hash).toBe("#example");
  });

  it("opens at the section in the URL", async () => {
    history.replaceState(null, "", "#prices");
    const el = await page("calc");
    expect($(el, "#prices")).toBeTruthy();
  });

  it("switches language and theme", async () => {
    const el = await page("calc");
    $$(el, ".seg button")[1].click();
    await el.updateComplete;
    expect($(el, "h1").textContent).toBe("How the calculator works");
    const before = document.documentElement.dataset.theme;
    $(el, "header .btn.icon").click();
    expect(document.documentElement.dataset.theme).not.toBe(before);
  });
});

describe("gc-footer", () => {
  it("links author, source, calculation, privacy and imprint", async () => {
    const el = await mount(new GcFooter());
    const links = $$<HTMLAnchorElement>(el, "a").map((a) => a.getAttribute("href"));
    expect(links).toEqual([
      AUTHOR.linkedin,
      AUTHOR.github,
      AUTHOR.repo,
      "./berechnung.html",
      "./datenschutz.html",
      "./impressum.html",
    ]);
    expect($(el, ".author").textContent).toContain(AUTHOR.name);
    expect($(el, "nav").textContent).toContain("Version dev");
  });
});
