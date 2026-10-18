import { ParseError } from "./parse-error";
import { assertQuarterHourly, parseGeneric, unitToKwh } from "./parse-generic";
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
    const kwh = num(c[iValue]) * ((iUnit >= 0 && unitToKwh(c[iUnit] ?? "")) || 1);
    if (!d || Number.isNaN(kwh)) continue;
    readings.push({ t: new Date(+d[3], +d[2] - 1, +d[1], +d[4], +d[5]).getTime(), kwh });
  }
  return done(readings);
}

/**
 * Load profile for the E-Control tariff calculator:
 * `Ende Ablesezeitraum;Messintervall;Abrechnungsmaßeinheit;<…> Verbrauch [kWh];;`
 * The timestamp is the END of the interval as ISO time with offset (2025-06-01T00:15+02:00).
 * Some portals export power (`… [kW]`, unit `KW`): these values are changed to kWh.
 */
export function parseEControl(text: string): Reading[] {
  const ls = lines(text);
  const head = ls[0].split(";").map((h) => h.trim().toLowerCase());
  if (!head[0]?.startsWith("ende")) throw new ParseError("header");
  const iValue = head.findIndex((h, i) => i > 2 && unitToKwh(h) !== undefined);
  const iInterval = head.indexOf("messintervall");
  const iUnit = head.indexOf("abrechnungsmaßeinheit");
  if (iValue < 0) throw new ParseError("header");
  const headFactor = unitToKwh(head[iValue]) ?? 1;

  const readings: Reading[] = [];
  for (let i = 1; i < ls.length; i++) {
    const c = ls[i].split(";");
    if (c.length <= iValue) continue;
    if (iInterval >= 0 && c[iInterval].trim().toUpperCase() !== "QH")
      throw new ParseError("granularity");
    const end = Date.parse(c[0].trim());
    const kwh = num(c[iValue]) * ((iUnit >= 0 && unitToKwh(c[iUnit])) || headFactor);
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

/**
 * Metering point number (Zählpunktnummer): "AT", 6-digit operator number, 5-digit postal code,
 * 20 more characters (33 in total).
 */
const METERING_POINT = /AT(\d{6})\d{5}[0-9A-Z]{20}/i;

/**
 * Operator code ("AT003100") from the first metering point number in the file.
 * Wiener Netze, AT-Format and E-Control exports contain the number. Some exports do not.
 * Only the first lines are searched: the number is in the header or in each row.
 */
export function detectOperatorCode(text: string): string | undefined {
  const m = METERING_POINT.exec(lines(text).slice(0, 20).join("\n"));
  return m ? `AT${m[1]}` : undefined;
}

/** Parses any supported export. The format is detected from the file, not from the dropdown. */
export function parseAny(text: string): {
  format: FormatId;
  readings: Reading[];
  operatorCode?: string;
} {
  const format = detectFormat(text);
  return { format, readings: PARSERS[format](text), operatorCode: detectOperatorCode(text) };
}
