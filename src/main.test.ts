import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("./analytics", () => ({ initAnalytics: vi.fn(), track: vi.fn() }));

afterEach(() => {
  document.body.innerHTML = "";
  delete document.body.dataset.page;
  vi.resetModules();
});

describe("main", () => {
  it("starts the calculator on the main page", async () => {
    document.body.dataset.page = "app";
    await import("./main");
    expect(document.querySelector("gc-app")).toBeTruthy();
    expect(["light", "dark"]).toContain(document.documentElement.dataset.theme);
    const { initAnalytics } = await import("./analytics");
    expect(initAnalytics).toHaveBeenCalled();
  });

  it.each(["privacy", "imprint", "calc"])("shows the %s page", async (page) => {
    document.body.dataset.page = page;
    await import("./main");
    expect(document.querySelector("gc-legal")?.getAttribute("page")).toBe(page);
  });
});
