import { afterEach, describe, expect, it, vi } from "vitest";

const init = vi.fn();
const capture = vi.fn();
vi.mock("posthog-js", () => ({ default: { init, capture } }));

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
  init.mockClear();
  capture.mockClear();
});

describe("analytics", () => {
  it("does nothing without a key", async () => {
    vi.stubEnv("VITE_POSTHOG_KEY", "");
    const a = await import("./analytics");
    a.track("x");
    await a.initAnalytics();
    expect(init).not.toHaveBeenCalled();
    expect(capture).not.toHaveBeenCalled();
  });

  it("initializes cookieless PostHog on the EU host and sends queued events", async () => {
    vi.stubEnv("VITE_POSTHOG_KEY", "phc_test");
    const a = await import("./analytics");
    a.track("early", { n: 1 });
    await a.initAnalytics();
    expect(init).toHaveBeenCalledWith(
      "phc_test",
      expect.objectContaining({
        api_host: "https://eu.i.posthog.com",
        persistence: "memory",
        autocapture: false,
        disable_session_recording: true,
      }),
    );
    expect(capture).toHaveBeenCalledWith("early", { n: 1 });
    a.track("late");
    expect(capture).toHaveBeenLastCalledWith("late", undefined);
  });

  it("uses a custom host", async () => {
    vi.stubEnv("VITE_POSTHOG_KEY", "phc_test");
    vi.stubEnv("VITE_POSTHOG_HOST", "https://ph.example.com");
    const a = await import("./analytics");
    await a.initAnalytics();
    expect(init.mock.calls[0][1].api_host).toBe("https://ph.example.com");
  });
});
