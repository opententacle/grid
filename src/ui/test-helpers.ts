import type { LitElement } from "lit";

/** Adds an element to the document and waits for the first render. */
export async function mount<T extends LitElement>(el: T): Promise<T> {
  document.body.append(el);
  await el.updateComplete;
  return el;
}

export const shadow = (el: Element) => el.shadowRoot as ShadowRoot;

export function $<E extends Element = HTMLElement>(el: Element, selector: string): E {
  const found = shadow(el).querySelector<E>(selector);
  if (!found) throw new Error(`Not found: ${selector}`);
  return found;
}

export const $$ = <E extends Element = HTMLElement>(el: Element, selector: string): E[] => [
  ...shadow(el).querySelectorAll<E>(selector),
];

/** Waits until all pending promises and Lit updates are done. */
export async function settle(el: LitElement): Promise<void> {
  for (let i = 0; i < 3; i++) {
    await new Promise((r) => setTimeout(r, 0));
    await el.updateComplete;
  }
}

/** Charts draw only with a known width (normally from a ResizeObserver). */
export async function drawChart(el: LitElement, width = 640): Promise<void> {
  (el as unknown as { width: number }).width = width;
  el.requestUpdate();
  await el.updateComplete;
}

export const mouse = (target: Element, type: "mousemove" | "mouseleave", clientX = 100) =>
  target.dispatchEvent(new MouseEvent(type, { bubbles: true, clientX, clientY: 50 }));
