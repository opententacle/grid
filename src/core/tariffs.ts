import type { Levies, Tariff } from "./types";

/**
 * Tariff data. All values are net.
 *
 * Sources:
 * - Wiener Netze 2026 (Netzebene 7, not measured): SNE-V 2018 idF BGBl. II Nr. 305/2025;
 *   https://www.wienernetze.at/o/document/wn_ex0105-netznutzungs-und-netzverlustentgelt_2026_geschutzt
 * - New structure from 2027: SNE-G-V, BGBl. II Nr. 299/2026 (structure only, no prices).
 * - 2027 / 2030 values: E-Control model values ("Der Weg zu einer neuen Netzentgeltstruktur",
 *   14.07.2026, start stage and final stage, Austria-wide). Not Wiener Netze prices.
 * - 2028 / 2029: linear interpolation between start and final stage.
 * - Levies 2026: https://www.wienernetze.at/o/document/wn_ex0106_steuernundabgaben_2026_geschutzt
 *   and a Wien Energie bill (2026 prices per line, checked line by line).
 *
 * Update this file when the SNE-T-V (expected December 2026) is published.
 */

export const TARIFF_DATA_DATE = "2026-10-15";

const LEVIES_2026: Levies = {
  electricityTaxCt: 0.1,
  // Bill 2026: 0.583 ct/kWh on 6.98 ct, 3.796 €/year on 54 €/year, 0.037 ct/kWh on 0.70 ct.
  // From 2027 the same shares are assumed; the capacity price takes the share of the flat fee.
  eagContribution: { energyRate: 0.583 / 6.98, capacityRate: 3.796 / 54, lossRate: 0.037 / 0.7 },
  eagFlatYear: 19.02,
  usageTaxRate: 0.07,
  vatRate: 0.2,
};

const COMMON = {
  lossCt: 0.7,
  meterEurMonth: 2.18,
  snapReduction: 0.2,
  levies: LEVIES_2026,
};

const START = { energyCt: 7.36, low: 19 };
const FINAL = { energyCt: 4.53, low: 33.82 };

function newModel(year: number, step: number): Tariff {
  const f = step / 3;
  const lerp = (a: number, b: number) => Math.round((a + (b - a) * f) * 100) / 100;
  const low = lerp(START.low, FINAL.low);
  return {
    year,
    estimate: true,
    energyCt: lerp(START.energyCt, FINAL.energyCt),
    flatFeeYear: 0,
    capacity: {
      lowEurKwYear: low,
      highEurKwYear: Math.round(low * 200) / 100,
      thresholdKw: 10,
      minKw: 2,
    },
    ...COMMON,
  };
}

export const WIENER_NETZE_TARIFFS: Tariff[] = [
  { year: 2026, estimate: false, energyCt: 6.98, flatFeeYear: 54, ...COMMON },
  newModel(2027, 0),
  newModel(2028, 1),
  newModel(2029, 2),
  newModel(2030, 3),
];

export const YEARS = WIENER_NETZE_TARIFFS.map((t) => t.year);

/** Tariff that applies at `date`: same year, else the closest earlier year, else the first one. */
export function tariffAt(tariffs: Tariff[], date: Date): Tariff {
  const y = date.getFullYear();
  const sorted = [...tariffs].sort((a, b) => a.year - b.year);
  return sorted.filter((t) => t.year <= y).at(-1) ?? sorted[0];
}

export function tariffFor(tariffs: Tariff[], year: number): Tariff {
  const t = tariffs.find((x) => x.year === year);
  if (!t) throw new Error(`No tariff for ${year}`);
  return t;
}
