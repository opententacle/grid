import { ParseError } from "./parse-error";
import type { Reading } from "./types";

const DE_DATE = /^(\d{1,2})\.(\d{1,2})\.(\d{4}|\d{2})(?:[ T,]+(\d{1,2}):(\d{2})(?::\d{2})?)?$/;
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?)?$/;
const TIME = /^(\d{1,2}):(\d{2})(?::\d{2})?$/;
const NUMBER = /^-?\d+(?:[.,]\d+)?$/;

interface DateParts {
  y: number;
  mo: number;
  d: number;
  h?: number;
  mi?: number;
}

function parseDate(cell: string): DateParts | undefined {
  const de = DE_DATE.exec(cell);
  if (de) {
    // Some portals (Linz Netz) write 2-digit years: "01.09.26".
    const y = +de[3];
    return {
      y: y < 100 ? 2000 + y : y,
      mo: +de[2],
      d: +de[1],
      h: de[4] ? +de[4] : undefined,
      mi: de[5] ? +de[5] : undefined,
    };
  }
  const iso = ISO_DATE.exec(cell);
  if (iso) {
    return {
      y: +iso[1],
      mo: +iso[2],
      d: +iso[3],
      h: iso[4] ? +iso[4] : undefined,
      mi: iso[5] ? +iso[5] : undefined,
    };
  }
  return undefined;
}

const unquote = (s: string) =>
  s
    .trim()
    .replace(/^"(.*)"$/, "$1")
    .trim();

function detectSeparator(line: string): string {
  const counts = [";", "\t", ","].map((c) => [c, line.split(c).length] as const);
  counts.sort((a, b) => b[1] - a[1]);
  return counts[0][0];
}

/**
 * Tolerant parser for quarter-hour CSV exports (ebUtilities AT-Format, E-Control load profile,
 * other grid operator portals). It finds the date/time and the kWh column on its own.
 * Power values (kW) are changed to kWh per quarter hour.
 */
export function parseGeneric(text: string): Reading[] {
  const lines = text
    .replace(/^﻿/, "")
    .split(/\r?\n/)
    .filter((l) => l.trim() !== "");
  if (lines.length === 0) throw new ParseError("empty");

  // First line with a date cell is the first data row. Lines before it are header lines.
  const sep = detectSeparator(lines.find((l) => /\d/.test(l)) ?? lines[0]);
  const rows = lines.map((l) => l.split(sep).map(unquote));
  const first = rows.findIndex((r) => r.some((c) => parseDate(c)));
  if (first < 0) throw new ParseError("header");
  const header = first > 0 ? rows[first - 1].map((h) => h.toLowerCase()) : [];
  const sample = rows.slice(first, first + 200);

  const dateCol = sample[0].findIndex((c) => parseDate(c));
  const hasTimeInDate = parseDate(sample[0][dateCol])?.h !== undefined;
  const timeCol = hasTimeInDate ? -1 : sample[0].findIndex((c, i) => i > dateCol && TIME.test(c));

  const numericShare = (i: number) =>
    sample.filter((r) => r[i] !== undefined && NUMBER.test(r[i])).length / sample.length;
  const candidates = sample[0]
    .map((_, i) => i)
    .filter((i) => i !== dateCol && i !== timeCol && numericShare(i) > 0.5);
  if (candidates.length === 0) throw new ParseError("header");
  const score = (i: number) => {
    const h = header[i] ?? "";
    let s = 0;
    if (h.includes("kwh")) s += 4;
    else if (unitToKwh(h) === 1 / 4) s += 3;
    if (/verbrauch|bezug|1\.8\.0|1-1:1\.9\.0|energiewert|wert|value|consumption/.test(h)) s += 2;
    if (/einspeis|2\.8\.0|2\.9\.0|qualit|status/.test(h)) s -= 5;
    // Energy community columns (Restnetzbezug) hold only the part not covered by the community.
    // Grid fees use the full metered value.
    if (/energiegemeinschaft|restnetz/.test(h)) s -= 5;
    return s;
  };
  const valueCol = [...candidates].sort((a, b) => score(b) - score(a) || a - b)[0];
  const unitCol = header.findIndex((h) => /^(einheit|maßeinheit|unit)$/.test(h));
  const factor =
    (unitCol >= 0 ? unitToKwh(sample[0][unitCol] ?? "") : undefined) ??
    unitToKwh(header[valueCol] ?? "") ??
    1;

  const readings: Reading[] = [];
  for (let i = first; i < rows.length; i++) {
    const r = rows[i];
    const dp = parseDate(r[dateCol] ?? "");
    if (!dp) continue;
    let h = dp.h;
    let mi = dp.mi;
    if (timeCol >= 0) {
      const tm = TIME.exec(r[timeCol] ?? "");
      if (!tm) continue;
      h = +tm[1];
      mi = +tm[2];
    }
    const raw = r[valueCol] ?? "";
    if (!NUMBER.test(raw)) continue;
    const kwh = Number(raw.replace(",", ".")) * factor;
    readings.push({ t: new Date(dp.y, dp.mo - 1, dp.d, h ?? 0, mi ?? 0).getTime(), kwh });
  }
  if (readings.length === 0) throw new ParseError("noData");
  assertQuarterHourly(readings);
  return readings;
}

/**
 * Factor that converts one quarter-hour value to kWh, from a unit text like "[kWh]", "Wh" or "kW".
 * A power value (kW) is the average over the quarter hour, so the energy is kW × 0.25 h.
 */
export function unitToKwh(text: string): number | undefined {
  const s = text.trim().toLowerCase();
  const unit = (u: string) => new RegExp(`(^|[^a-z])${u}([^a-z]|$)`).test(s);
  if (unit("kwh")) return 1;
  if (unit("wh")) return 1 / 1000;
  if (unit("kw") || s.includes("leistung")) return 1 / 4;
  if (s === "w") return 1 / 4000;
  return undefined;
}

/** Throws when the typical step between readings is not 15 minutes. */
export function assertQuarterHourly(readings: Reading[]): void {
  if (readings.length < 4) return;
  const steps: number[] = [];
  for (let i = 1; i < Math.min(readings.length, 500); i++)
    steps.push(readings[i].t - readings[i - 1].t);
  steps.sort((a, b) => a - b);
  if (steps[Math.floor(steps.length / 2)] !== 15 * 60_000) throw new ParseError("granularity");
}
