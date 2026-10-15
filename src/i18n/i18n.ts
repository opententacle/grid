import { de, type MessageKey } from "./de";
import { en } from "./en";

export type Locale = "de" | "en";
export type { MessageKey };

const MESSAGES: Record<Locale, Record<MessageKey, string>> = { de, en };
const STORAGE_KEY = "gc.locale";
const listeners = new Set<() => void>();

function readStored(): Locale | undefined {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "de" || v === "en" ? v : undefined;
  } catch {
    return undefined;
  }
}

export function detectLocale(languages: readonly string[] = navigator.languages ?? []): Locale {
  for (const l of languages) {
    const base = l.toLowerCase().slice(0, 2);
    if (base === "de") return "de";
    if (base === "en") return "en";
  }
  return "en";
}

let locale: Locale = readStored() ?? detectLocale();

export const getLocale = () => locale;
export const intlLocale = () => (locale === "de" ? "de-AT" : "en-GB");

export function setLocale(next: Locale): void {
  if (next === locale) return;
  locale = next;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // storage blocked: keep the choice for this page view only
  }
  document.documentElement.lang = next;
  for (const l of listeners) l();
}

export function onLocaleChange(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function t(key: MessageKey, params?: Record<string, string | number>): string {
  let s = MESSAGES[locale][key] ?? key;
  if (params) for (const [k, v] of Object.entries(params)) s = s.replaceAll(`{${k}}`, String(v));
  return s;
}
