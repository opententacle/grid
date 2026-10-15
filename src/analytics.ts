import type { PostHog } from "posthog-js";

type Props = Record<string, string | number | boolean>;

let client: PostHog | undefined;
const queue: [string, Props | undefined][] = [];

/**
 * Cookieless PostHog (EU). Nothing is stored on the device (`persistence: "memory"`),
 * no autocapture, no session recording. Without VITE_POSTHOG_KEY analytics stays off.
 */
export async function initAnalytics(): Promise<void> {
  const key = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
  if (!key) return;
  const host =
    (import.meta.env.VITE_POSTHOG_HOST as string | undefined) || "https://eu.i.posthog.com";
  const { default: posthog } = await import("posthog-js");
  posthog.init(key, {
    api_host: host,
    persistence: "memory",
    disable_persistence: true,
    autocapture: false,
    capture_pageview: true,
    capture_pageleave: false,
    disable_session_recording: true,
    disable_surveys: true,
    advanced_disable_decide: true,
    ip: false,
    person_profiles: "never",
    mask_all_text: true,
    mask_all_element_attributes: true,
  } as Parameters<typeof posthog.init>[1]);
  client = posthog;
  for (const [e, p] of queue.splice(0)) client.capture(e, p);
}

export function track(event: string, props?: Props): void {
  if (client) client.capture(event, props);
  else if (queue.length < 50) queue.push([event, props]);
}
