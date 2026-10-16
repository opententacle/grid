import { describe, expect, it } from "vitest";
import { parseWienerNetze } from "./parse-wienernetze";
import { buildCsv, errorCode } from "./test-utils";

const HEADER = "﻿Datum;Zeit von;Zeit bis;X - Verbrauch [kWh];;";

describe("parseWienerNetze", () => {
  it("reads BOM, decimal comma and local time", () => {
    const r = parseWienerNetze(`${HEADER}\n01.06.2025;00:15:00;00:30:00;0,039;;\n`);
    expect(r).toHaveLength(1);
    expect(r[0].kwh).toBeCloseTo(0.039);
    const d = new Date(r[0].t);
    expect([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes()]).toEqual([
      2025, 5, 1, 0, 15,
    ]);
  });

  it("changes a power column (kW) to kWh per quarter hour", () => {
    const r = parseWienerNetze(
      `${HEADER.replace("[kWh]", "[kW]")}\n01.06.2025;00:15:00;00:30:00;13;;\n`,
    );
    expect(r[0].kwh).toBe(3.25);
  });

  it("accepts integer values and CRLF", () => {
    const r = parseWienerNetze(`${HEADER}\r\n01.06.2025;00:00:00;00:15:00;1;;\r\n`);
    expect(r[0].kwh).toBe(1);
  });

  it("skips empty and invalid values", () => {
    const csv = [
      HEADER,
      "01.06.2025;00:00:00;00:15:00;;;",
      "01.06.2025;00:15:00;00:30:00;abc;;",
      "garbage",
      "01.06.2025;00:30:00;00:45:00;0,5;;",
    ].join("\n");
    expect(parseWienerNetze(csv)).toHaveLength(1);
  });

  it("keeps duplicate DST rows (October)", () => {
    const csv = [
      HEADER,
      "26.10.2025;02:45:00;02:00:00;0,035;;",
      "26.10.2025;02:00:00;02:15:00;0,036;;",
    ].join("\n");
    expect(parseWienerNetze(csv)).toHaveLength(2);
  });

  it("parses a full synthetic day", () => {
    const r = parseWienerNetze(buildCsv(new Date(2026, 0, 1), 1, () => 0.25));
    expect(r).toHaveLength(96);
    expect(r.reduce((a, x) => a + x.kwh, 0)).toBeCloseTo(24);
  });

  it("rejects wrong header, empty file and files without data", () => {
    expect(errorCode(() => parseWienerNetze(""))).toBe("empty");
    expect(errorCode(() => parseWienerNetze("a,b,c\n1,2,3"))).toBe("header");
    expect(errorCode(() => parseWienerNetze(HEADER))).toBe("noData");
  });
});
