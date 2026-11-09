import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { setLocale } from "../i18n/i18n";
import { currentNews, NEWS, NEWS_MAX_AGE_DAYS } from "../i18n/news";
import { GcNews, NEWS_KEY } from "./gc-news";
import { $, $$, mount, shadow } from "./test-helpers";

const latest = NEWS[0];
const releaseDay = new Date(`${latest.date}T00:00:00`);
const dayAfter = new Date(releaseDay.getTime() + 86_400_000);

let el: GcNews | undefined;
beforeEach(() => {
  localStorage.clear();
  setLocale("de");
});
afterEach(() => {
  el?.remove();
  el = undefined;
});

describe("news data", () => {
  it("has unique ids and the same points in German and English", () => {
    expect(new Set(NEWS.map((n) => n.id)).size).toBe(NEWS.length);
    for (const n of NEWS) {
      expect(n.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(n.text.de.points.length).toBe(n.text.en.points.length);
      expect(!!n.text.de.link).toBe(!!n.text.en.link);
    }
  });

  it("returns the newest entry only while it is recent", () => {
    expect(currentNews(dayAfter)).toBe(latest);
    const late = new Date(releaseDay.getTime() + (NEWS_MAX_AGE_DAYS + 1) * 86_400_000);
    expect(currentNews(late)).toBeUndefined();
    expect(currentNews(dayAfter, [])).toBeUndefined();
  });
});

describe("gc-news", () => {
  it("shows the newest changes with a link to the details", async () => {
    el = await mount(new GcNews(dayAfter));
    expect($(el, "h2").textContent).toContain(latest.text.de.title);
    expect($$(el, "li")).toHaveLength(latest.text.de.points.length);
    expect($$(el, ".links a").map((a) => a.getAttribute("href"))).toEqual([
      latest.href,
      "https://github.com/opententacle/grid/releases",
    ]);
  });

  it("follows the language", async () => {
    el = await mount(new GcNews(dayAfter));
    setLocale("en");
    await el.updateComplete;
    expect($(el, "h2").textContent).toContain(latest.text.en.title);
  });

  it("stays closed after the user closes it", async () => {
    el = await mount(new GcNews(dayAfter));
    $(el, "button.close").click();
    await el.updateComplete;
    expect(shadow(el).querySelector(".news")).toBeNull();
    expect(localStorage.getItem(NEWS_KEY)).toBe(latest.id);
    el.remove();
    el = await mount(new GcNews(dayAfter));
    expect(shadow(el).querySelector(".news")).toBeNull();
  });

  it("shows again for a newer entry", async () => {
    localStorage.setItem(NEWS_KEY, "older-entry");
    el = await mount(new GcNews(dayAfter));
    expect(shadow(el).querySelector(".news")).not.toBeNull();
  });

  it("does not show old news", async () => {
    const late = new Date(releaseDay.getTime() + (NEWS_MAX_AGE_DAYS + 1) * 86_400_000);
    el = await mount(new GcNews(late));
    expect(shadow(el).querySelector(".news")).toBeNull();
  });
});
