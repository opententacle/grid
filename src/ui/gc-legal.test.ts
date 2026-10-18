import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { AUTHOR, IMPRESSUM } from "../config";
import { FAQ } from "../i18n/faq";
import { setLocale } from "../i18n/i18n";
import { GcFooter, releaseUrl } from "./gc-footer";
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
    expect(header).toEqual(["Position", "2027*", "2028*", "2029*", "2030*"]);
    const areas = $$(el, "#today tbody tr").map((tr) =>
      [...tr.querySelectorAll("td")].map((td) => td.textContent?.replace(/\s+/g, " ").trim()),
    );
    expect(areas).toHaveLength(14);
    expect(areas[0]).toEqual(["Wien (Wiener Netze)", "6,98", "54,00", "0,700", "2,18", "7 %"]);
    expect(areas[5][4]).toBe("2,40*");
    expect(areas[6]).toEqual(["Linz (Linz Netz)", "5,57", "54,00", "0,487", "2,38", "–"]);
    expect(areas[7][5]).toBe("0,3789 ct/kWh");
    expect($(el, "#today .muted").textContent).toContain("§ 10");
    expect($(el, "#more table").textContent).toContain("0,583");
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

  it("renders the FAQ with a closed timeline and one accordion per question", async () => {
    const el = await page("faq");
    expect($(el, "h1").textContent).toBe(FAQ.de.title);
    expect(document.title).toContain("FAQ");
    const tl = $<HTMLDetailsElement>(el, "details#timeline");
    expect(tl.open).toBe(false);
    expect($$(el, "ol.tl > li")).toHaveLength(FAQ.de.timeline.length);
    expect($$(el, "ol.tl > li.plan").length).toBeGreaterThan(0);
    expect($$(el, "details.acc:not(#timeline)")).toHaveLength(FAQ.de.items.length);
    expect($(el, "details#minimum .ref").textContent).toContain("SNE-G-V § 6 Abs. 3");
    expect($(el, "a.nav[href='./faq.html']").getAttribute("aria-current")).toBe("page");
  });

  it("lists the supported grid operators and asks for sample exports", async () => {
    const el = await page("faq");
    expect($$(el, "details#operators li")).toHaveLength(FAQ.de.items[0].list?.length ?? 0);
    const a = $<HTMLAnchorElement>(el, "details#operators a");
    expect(a.href).toBe(`${AUTHOR.repo}/issues/new`);
  });

  it("opens the FAQ entry in the URL", async () => {
    history.replaceState(null, "", "#timeline");
    const el = await page("faq");
    expect($<HTMLDetailsElement>(el, "details#timeline").open).toBe(true);
  });

  it("has the same FAQ structure in German and English", () => {
    expect(FAQ.en.items.map((i) => i.id)).toEqual(FAQ.de.items.map((i) => i.id));
    expect(FAQ.en.timeline.map((s) => s.plan ?? false)).toEqual(
      FAQ.de.timeline.map((s) => s.plan ?? false),
    );
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
  it("links author, source, calculation, FAQ, privacy, imprint and release notes", async () => {
    const el = await mount(new GcFooter());
    const links = $$<HTMLAnchorElement>(el, "a").map((a) => a.getAttribute("href"));
    expect(links).toEqual([
      AUTHOR.linkedin,
      AUTHOR.github,
      AUTHOR.repo,
      "./berechnung.html",
      "./faq.html",
      "./datenschutz.html",
      "./impressum.html",
      `${AUTHOR.repo}/releases`,
    ]);
    expect($(el, ".author").textContent).toContain(AUTHOR.name);
    expect($(el, "nav a:last-child").textContent).toBe("Version dev");
  });

  it("links a release version to its GitHub release", () => {
    expect(releaseUrl("1.2.0")).toBe(`${AUTHOR.repo}/releases/tag/1.2.0`);
    expect(releaseUrl("dev")).toBe(`${AUTHOR.repo}/releases`);
  });
});
