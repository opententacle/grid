import { ParseError } from "./parse-error";
import { assertQuarterHourly, unitToKwh } from "./parse-generic";
import type { Reading } from "./types";

const DATE = /^(\d{2})\.(\d{2})\.(\d{4})$/;
const TIME = /^(\d{2}):(\d{2})/;

/**
 * Parses a Wiener Netze "Viertelstundenwerte" CSV export.
 * Format: `Datum;Zeit von;Zeit bis;<Zählpunkt> - Verbrauch [kWh];;`
 * with date DD.MM.YYYY, time HH:MM:SS and decimal comma. A `[kW]` column is changed to kWh.
 */
export function parseWienerNetze(text: string): Reading[] {
  const lines = text.replace(/^﻿/, "").split(/\r?\n/);
  const header = lines.findIndex((l) => l.trim() !== "");
  if (header < 0) throw new ParseError("empty");
  const cols = lines[header].split(";");
  const factor = cols.length >= 4 ? unitToKwh(cols[3]) : undefined;
  if (!factor || !/^datum$/i.test(cols[0].trim())) throw new ParseError("header");

  const readings: Reading[] = [];
  for (let i = header + 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const parts = line.split(";");
    if (parts.length < 4) continue;
    const d = DATE.exec(parts[0].trim());
    const tm = TIME.exec(parts[1].trim());
    const raw = parts[3].trim();
    if (!d || !tm || raw === "") continue;
    const kwh = Number(raw.replace(",", ".")) * factor;
    if (!Number.isFinite(kwh)) continue;
    const t = new Date(+d[3], +d[2] - 1, +d[1], +tm[1], +tm[2]).getTime();
    readings.push({ t, kwh });
  }
  if (readings.length === 0) throw new ParseError("noData");
  assertQuarterHourly(readings);
  return readings;
}
