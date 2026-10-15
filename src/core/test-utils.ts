import type { ParseError } from "./parse-error";

const pad = (n: number) => String(n).padStart(2, "0");

/** Builds a synthetic Wiener Netze CSV. `value(date)` returns kWh or null for an empty cell. */
export function buildCsv(from: Date, days: number, value: (d: Date) => number | null): string {
  const lines = [
    "﻿Datum;Zeit von;Zeit bis;Teststrasse - AT0000000000000000000000000000000 (1) - Verbrauch [kWh];;",
  ];
  for (let day = 0; day < days; day++) {
    for (let q = 0; q < 96; q++) {
      const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + day, 0, q * 15);
      const e = new Date(d.getTime() + 15 * 60_000);
      const v = value(d);
      const date = `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
      const cell = v === null ? "" : String(v).replace(".", ",");
      lines.push(
        `${date};${pad(d.getHours())}:${pad(d.getMinutes())}:00;${pad(e.getHours())}:${pad(e.getMinutes())}:00;${cell};;`,
      );
    }
  }
  return lines.join("\r\n");
}

/** Returns the ParseError code thrown by `fn`, or undefined. */
export function errorCode(fn: () => unknown): string | undefined {
  try {
    fn();
  } catch (e) {
    return (e as ParseError).code;
  }
  return undefined;
}
