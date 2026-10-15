import { ParseError } from "./parse-error";
import { assertQuarterHourly, parseGeneric } from "./parse-generic";
import { parseWienerNetze } from "./parse-wienernetze";
import type { Reading } from "./types";

const QH = 15 * 60_000;
const DE_DATETIME = /^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2})/;

const lines = (text: string) => text.replace(/^﻿/, "").split(/\r?\n/);
const num = (s: string | undefined) => {
  const v = (s ?? "").trim();
  return /^-?\d+(?:,\d+|\.\d+)?$/.test(v) ? Number(v.replace(",", ".")) : Number.NaN;
};

function done(readings: Reading[]): Reading[] {
  if (readings.length === 0) throw new ParseError("noData");
  assertQuarterHourly(readings);
  return readings;
}

/**
 * Austrian uniform format (ebUtilities "AT-Format", granularity QH):
 * `Startdatum;Enddatum;Zählpunktbezeichnung;…;OBIS;OBIS Kurzbeschreibung;Wert;Einheit;Qualität;…`
 * Only consumption rows (OBIS 1-1:1.9.0 G.01) are used. Missing values are "-".
 */
export function parseAtFormat(text: string): Reading[] {
  const ls = lines(text);
  const head = ls[0].split(";").map((h) => h.trim().toLowerCase());
  const iStart = head.indexOf("startdatum");
  const iValue = head.indexOf("wert");
  const iObis = head.indexOf("obis");
  const iUnit = head.indexOf("einheit");
  if (iStart < 0 || iValue < 0) throw new ParseError("header");

  const readings: Reading[] = [];
  for (let i = 1; i < ls.length; i++) {
    const c = ls[i].split(";");
    if (c.length <= iValue) continue;
    if (iObis >= 0 && !/1\.9\.0 G\.01/.test(c[iObis])) continue;
    const d = DE_DATETIME.exec(c[iStart].trim());
    let kwh = num(c[iValue]);
    if (!d || Number.isNaN(kwh)) continue;
    if (iUnit >= 0 && c[iUnit].trim().toLowerCase() === "wh") kwh /= 1000;
    readings.push({ t: new Date(+d[3], +d[2] - 1, +d[1], +d[4], +d[5]).getTime(), kwh });
  }
  return done(readings);
}

/**
 * Load profile for the E-Control tariff calculator:
 * `Ende Ablesezeitraum;Messintervall;Abrechnungsmaßeinheit;<…> Verbrauch [kWh];;`
 * The timestamp is the END of the interval as ISO time with offset (2025-06-01T00:15+02:00).
 */
export function parseEControl(text: string): Reading[] {
  const ls = lines(text);
  const head = ls[0].split(";").map((h) => h.trim().toLowerCase());
  if (!head[0]?.startsWith("ende")) throw new ParseError("header");
  const iValue = head.findIndex((h, i) => i > 0 && h.includes("kwh"));
  const iInterval = head.indexOf("messintervall");
  if (iValue < 0) throw new ParseError("header");

  const readings: Reading[] = [];
  for (let i = 1; i < ls.length; i++) {
    const c = ls[i].split(";");
    if (c.length <= iValue) continue;
    if (iInterval >= 0 && c[iInterval].trim().toUpperCase() !== "QH")
      throw new ParseError("granularity");
    const end = Date.parse(c[0].trim());
    const kwh = num(c[iValue]);
    if (Number.isNaN(end) || Number.isNaN(kwh)) continue;
    readings.push({ t: end - QH, kwh });
  }
  return done(readings);
}

export type FormatId = "wienernetze" | "at-format" | "e-control" | "generic";

/** Detects the export format from the header line. */
export function detectFormat(text: string): FormatId {
  const head = lines(text)[0]?.toLowerCase() ?? "";
  if (head.startsWith("datum;zeit von;zeit bis;")) return "wienernetze";
  if (head.startsWith("startdatum;") && head.includes("wert")) return "at-format";
  if (head.startsWith("ende ablesezeitraum;")) return "e-control";
  return "generic";
}

const PARSERS: Record<FormatId, (text: string) => Reading[]> = {
  wienernetze: parseWienerNetze,
  "at-format": parseAtFormat,
  "e-control": parseEControl,
  generic: parseGeneric,
};

/** Parses any supported export. The format is detected from the file, not from the dropdown. */
export function parseAny(text: string): { format: FormatId; readings: Reading[] } {
  const format = detectFormat(text);
  return { format, readings: PARSERS[format](text) };
}
