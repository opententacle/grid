import { describe, expect, it } from "vitest";
import { parseGeneric } from "./parse-generic";
import { buildCsv, errorCode } from "./test-utils";

const hm = (t: number) => {
  const d = new Date(t);
  return [d.getDate(), d.getHours(), d.getMinutes()];
};

describe("parseGeneric", () => {
  it("reads the Wiener Netze format too", () => {
    const r = parseGeneric(buildCsv(new Date(2026, 0, 1), 1, () => 0.25));
    expect(r).toHaveLength(96);
    expect(r[0].kwh).toBe(0.25);
  });

  it("reads combined date-time cells, quotes and '-' as missing value", () => {
    const csv = [
      '"Zählpunkt";"Datum von";"Datum bis";"Energiewert [kWh]";"Granularität";"Qualität Beschreibung"',
      '"AT001";"01.01.2026 00:00";"01.01.2026 00:15";"0,100";"QH";"Messwert"',
      '"AT001";"01.01.2026 00:15";"01.01.2026 00:30";"0,200";"QH";"Messwert"',
      '"AT001";"01.01.2026 00:30";"01.01.2026 00:45";"-";"-";"Wert noch nicht vorhanden"',
      '"AT001";"01.01.2026 00:45";"01.01.2026 01:00";"0,300";"QH";"Messwert"',
    ].join("\n");
    const r = parseGeneric(csv);
    expect(r.map((x) => x.kwh)).toEqual([0.1, 0.2, 0.3]);
    expect(hm(r[2].t)).toEqual([1, 0, 45]);
  });

  it("reads ISO timestamps with comma separator and decimal point", () => {
    const rows = ["timestamp,value_kwh"];
    for (let q = 0; q < 8; q++) {
      const m = q * 15;
      rows.push(
        `2026-03-01T${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}:00,0.5`,
      );
    }
    const r = parseGeneric(rows.join("\n"));
    expect(r).toHaveLength(8);
    expect(hm(r[7].t)).toEqual([1, 1, 45]);
  });

  it("prefers the consumption column over feed-in", () => {
    const csv = [
      "Datum;Zeit;Einspeisung [kWh];Verbrauch [kWh]",
      "01.01.2026;00:00;9;1",
      "01.01.2026;00:15;9;2",
      "01.01.2026;00:30;9;3",
      "01.01.2026;00:45;9;4",
    ].join("\n");
    expect(parseGeneric(csv).map((x) => x.kwh)).toEqual([1, 2, 3, 4]);
  });

  it("rejects daily values", () => {
    const csv = [
      "Datum;Verbrauch [kWh]",
      "01.01.2026;5",
      "02.01.2026;6",
      "03.01.2026;7",
      "04.01.2026;8",
      "05.01.2026;9",
    ].join("\n");
    expect(errorCode(() => parseGeneric(csv))).toBe("granularity");
  });

  it("rejects files without dates", () => {
    expect(errorCode(() => parseGeneric("a;b\nx;y"))).toBe("header");
    expect(errorCode(() => parseGeneric(""))).toBe("empty");
  });
});
