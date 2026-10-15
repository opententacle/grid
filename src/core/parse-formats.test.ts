import { describe, expect, it } from "vitest";
import { detectFormat, parseAny, parseAtFormat, parseEControl } from "./parse-formats";
import { buildCsv, errorCode } from "./test-utils";

const AT_HEAD =
  "﻿Startdatum;Enddatum;Zählpunktbezeichnung;Name der Energiegemeinschaft;ID der Energiegemeinschaft;OBIS;OBIS Kurzbeschreibung;Wert;Einheit;Qualität;Qualitätbeschreibung;";
const atRow = (start: string, end: string, value: string, obis = "OBIS Code 1-1:1.9.0 G.01") =>
  `${start};${end};AT0000000000000000000000000000000; - ; - ;${obis};Verbrauch laut Messung;${value};kWh;L1;Echtwert gemessen`;

const EC_HEAD =
  "﻿Ende Ablesezeitraum;Messintervall;Abrechnungsmaßeinheit;Teststrasse - AT000 (1) - Verbrauch [kWh];;";

const local = (t: number) => {
  const d = new Date(t);
  return [d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes()];
};

describe("parseAtFormat", () => {
  const csv = [
    AT_HEAD,
    atRow("01.06.2025 00:00:00", "01.06.2025 00:15:00", "0,028"),
    atRow("01.06.2025 00:15:00", "01.06.2025 00:30:00", "0,039"),
    atRow("01.06.2025 00:15:00", "01.06.2025 00:30:00", "9,999", "OBIS Code 1-1:2.9.0 G.01"),
    atRow("01.06.2025 00:30:00", "01.06.2025 00:45:00", "-"),
    atRow("01.06.2025 00:45:00", "01.06.2025 01:00:00", "0,031"),
    atRow("01.06.2025 01:00:00", "01.06.2025 01:15:00", "0,036"),
  ].join("\n");

  it("reads consumption rows with the interval start", () => {
    const r = parseAtFormat(csv);
    expect(r.map((x) => x.kwh)).toEqual([0.028, 0.039, 0.031, 0.036]);
    expect(local(r[0].t)).toEqual([6, 1, 0, 0]);
  });

  it("is detected from the header", () => {
    expect(detectFormat(csv)).toBe("at-format");
  });
});

describe("parseEControl", () => {
  const csv = [
    EC_HEAD,
    "2026-01-01T00:15+01:00;QH;KWH;0,1;;",
    "2026-01-01T00:30+01:00;QH;KWH;0,2;;",
    "2026-01-01T00:45+01:00;QH;KWH;0,3;;",
    "2026-01-01T01:00+01:00;QH;KWH;0,4;;",
  ].join("\n");

  it("converts the interval end to the start", () => {
    const r = parseEControl(csv);
    expect(r).toHaveLength(4);
    expect(r[0].t).toBe(Date.parse("2026-01-01T00:00+01:00"));
    expect(r[3].kwh).toBe(0.4);
  });

  it("rejects daily values", () => {
    expect(errorCode(() => parseEControl(`${EC_HEAD}\n2026-01-02T00:00+01:00;D;KWH;5;;`))).toBe(
      "granularity",
    );
  });

  it("is detected from the header", () => {
    expect(detectFormat(csv)).toBe("e-control");
  });
});

describe("parseAny", () => {
  it("detects the Wiener Netze portal export", () => {
    const { format, readings } = parseAny(buildCsv(new Date(2026, 0, 1), 1, () => 0.1));
    expect(format).toBe("wienernetze");
    expect(readings).toHaveLength(96);
  });
});
