export type Theme = "light" | "dark";

const STORAGE_KEY = "gc.theme";
const listeners = new Set<() => void>();
const media = window.matchMedia("(prefers-color-scheme: dark)");

function stored(): Theme | undefined {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "light" || v === "dark" ? v : undefined;
  } catch {
    return undefined;
  }
}

export const getTheme = (): Theme =>
  (document.documentElement.dataset.theme as Theme | undefined) ??
  stored() ??
  (media.matches ? "dark" : "light");

function apply(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  for (const l of listeners) l();
}

export function setTheme(theme: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // storage blocked
  }
  apply(theme);
}

export function initTheme(): void {
  apply(getTheme());
  media.addEventListener("change", (e) => {
    if (!stored()) apply(e.matches ? "dark" : "light");
  });
}

export function onThemeChange(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
