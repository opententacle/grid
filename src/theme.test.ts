import { afterEach, describe, expect, it, vi } from "vitest";
import { getTheme, initTheme, onThemeChange, setTheme } from "./theme";

afterEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.theme;
});

describe("theme", () => {
  it("initTheme applies a theme to <html>", () => {
    initTheme();
    expect(["light", "dark"]).toContain(document.documentElement.dataset.theme);
  });

  it("uses the stored theme", () => {
    localStorage.setItem("gc.theme", "dark");
    expect(getTheme()).toBe("dark");
  });

  it("setTheme stores the choice and notifies listeners", () => {
    const fn = vi.fn();
    const off = onThemeChange(fn);
    setTheme("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem("gc.theme")).toBe("dark");
    setTheme("light");
    expect(getTheme()).toBe("light");
    expect(fn).toHaveBeenCalledTimes(2);
    off();
    setTheme("dark");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("works when storage is blocked", () => {
    const set = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const get = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    setTheme("dark");
    expect(getTheme()).toBe("dark");
    set.mockRestore();
    get.mockRestore();
  });
});
