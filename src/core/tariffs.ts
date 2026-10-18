import type { Levies, Tariff } from "./types";

/**
 * Tariff data. All values are net.
 *
 * Sources:
 * - 2026, Netzebene 7, not measured: SNE-V 2018 idF BGBl. II Nr. 305/2025, valid from 1.1.2026
 *   (unchanged by the amendment from 1.4.2026). Energy price and flat fee: § 5 Abs. 1 Z 6,
 *   grid loss fee: § 6 lit. b. https://ris.bka.gv.at/Dokumente/BgblAuth/BGBLA_2025_II_305/BGBLA_2025_II_305.pdfsig
 * - Metering fee: price sheet of each operator (see GRID_AREAS). Legal maximum for a direct
 *   three-phase meter: 2.40 €/month (SNE-V 2018 § 10 Abs. 1 Z 1).
 * - Erneuerbaren-Förderbeitrag 2026: same amounts in all of Austria, Netzebene 7 not measured:
 *   0.583 ct/kWh, 3.796 €/year, grid loss 0.037 ct/kWh (BGBl. II Nr. 301/2025 § 2).
 *   Erneuerbaren-Förderpauschale: 19.02 €/year.
 * - Gebrauchsabgabe: only in Vienna, 7 % on energy and grid fees. Wiener Netze:
 *   https://www.wienernetze.at/o/document/wn_ex0106_steuernundabgaben_2026_geschutzt
 *   Netz NÖ and Linz Netz list no Gebrauchsabgabe on their 2026 price sheets.
 * - Wiener Netze 2026 was checked line by line against a Wien Energie bill.
 * - New structure from 2027: SNE-G-V, BGBl. II Nr. 299/2026 (structure only, no prices).
 * - 2027 / 2029 values: E-Control model values ("Der Weg zu einer neuen Netzentgeltstruktur",
 *   14.07.2026, start stage and final stage, Austria-wide). The same values apply to all grid areas.
 *   E-Control announces the final stage for 1 January 2029 (OTS, 12.10.2026).
 * - 2028: linear interpolation between start and final stage. 2030: same as the final stage.
 * - From 2027 there is no Messentgelt and no Pauschale (SNE-G-V § 2 Abs. 1 Z 11, § 5 Abs. 1).
 *   The E-Control start value (about 19 €/kW) already contains both.
 * - January to November 2027: one capacity price per kW, no 10 kW threshold, no 2 kW minimum
 *   (SNE-G-V § 6 Abs. 3a). The model start value is used as that price.
 * - From 2027 each grid area keeps its 2026 grid loss fee and levies.
 *
 * Update this file when the SNE-T-V (expected December 2026) is published.
 */

export const TARIFF_DATA_DATE = "2026-10-18";

/** Erneuerbaren-Förderbeitrag 2026, Netzebene 7 not measured (BGBl. II Nr. 301/2025 § 2). */
export const EAG_2026 = { energyCt: 0.583, flatYear: 3.796, lossCt: 0.037 };

const FLAT_FEE_2026 = 54;
const SNAP_REDUCTION = 0.2;

/**
 * From 2027 the contribution is assumed to keep its 2026 share of the grid fees. The energy share
 * uses the Wiener Netze price (6.98 ct/kWh), as in earlier versions of this app. The capacity
 * price takes the share of the flat fee.
 */
const MODEL_EAG_ENERGY_RATE = EAG_2026.energyCt / 6.98;

const START = { energyCt: 7.36, low: 19 };
const FINAL = { energyCt: 4.53, low: 33.82 };

/** Values of one grid area for 2026 (Netzebene 7, not measured). */
interface Area2026 {
  energyCt: number;
  lossCt: number;
  meterEurMonth: number;
  usageTaxRate: number;
  localLevyCt?: number;
  /** Only for Kleinwalsertal: German Stromsteuer and VAT apply there. */
  electricityTaxCt?: number;
  vatRate?: number;
}

function levies(area: Area2026, energyRate: number): Levies {
  return {
    electricityTaxCt: area.electricityTaxCt ?? 0.1,
    eagContribution: {
      energyRate,
      capacityRate: EAG_2026.flatYear / FLAT_FEE_2026,
      lossCt: EAG_2026.lossCt,
    },
    eagFlatYear: 19.02,
    usageTaxRate: area.usageTaxRate,
    ...(area.localLevyCt ? { localLevyCt: area.localLevyCt } : {}),
    vatRate: area.vatRate ?? 0.2,
  };
}

function newModel(area: Area2026, year: number, step: number): Tariff {
  const f = step / 2;
  const lerp = (a: number, b: number) => Math.round((a + (b - a) * f) * 100) / 100;
  const low = lerp(START.low, FINAL.low);
  return {
    year,
    estimate: true,
    energyCt: lerp(START.energyCt, FINAL.energyCt),
    lossCt: area.lossCt,
    flatFeeYear: 0,
    meterEurMonth: 0,
    capacity: {
      lowEurKwYear: low,
      highEurKwYear: Math.round(low * 200) / 100,
      thresholdKw: 10,
      minKw: 2,
      ...(year === 2027 ? { uniformUntilMonth: 11 } : {}),
    },
    snapReduction: SNAP_REDUCTION,
    levies: levies(area, MODEL_EAG_ENERGY_RATE),
  };
}

/** Tariffs 2026 to 2030 for one grid area. Only 2026 differs between areas (and the loss fee and levies). */
export function tariffsFor(area: Area2026): Tariff[] {
  return [
    {
      year: 2026,
      estimate: false,
      energyCt: area.energyCt,
      lossCt: area.lossCt,
      flatFeeYear: FLAT_FEE_2026,
      meterEurMonth: area.meterEurMonth,
      snapReduction: SNAP_REDUCTION,
      // The contribution is a fixed amount in all of Austria. As a share it reproduces that amount.
      levies: levies(area, EAG_2026.energyCt / area.energyCt),
    },
    newModel(area, 2027, 0),
    newModel(area, 2028, 1),
    newModel(area, 2029, 2),
    newModel(area, 2030, 2),
  ];
}

export interface GridArea {
  id: string;
  /** Name of the grid operator (proper name, not translated) */
  operator: string;
  /** Netzbereich in SNE-V 2018 */
  area: string;
  /** Price sheet with the metering fee and levies */
  priceSheet: string;
  /** true when the operator does not publish its metering fee and the legal maximum is used */
  meterIsMaximum?: boolean;
  tariffs: Tariff[];
}

/** Grid areas with 2026 prices. SNE-V 2018 § 5 Abs. 1 Z 6 and § 6 lit. b (BGBl. II Nr. 305/2025). */
export const GRID_AREAS: GridArea[] = [
  {
    id: "wien",
    operator: "Wiener Netze",
    area: "Wien",
    priceSheet:
      "https://www.wienernetze.at/o/document/wn_ex0105-netznutzungs-und-netzverlustentgelt_2026_geschutzt",
    // § 5 Abs. 1 Z 6 lit. m, § 6 lit. b Z 14
    tariffs: tariffsFor({ energyCt: 6.98, lossCt: 0.7, meterEurMonth: 2.18, usageTaxRate: 0.07 }),
  },
  {
    id: "burgenland",
    operator: "Netz Burgenland",
    area: "Burgenland",
    priceSheet:
      "https://assets.netzburgenland.at/Tarifblatt_Strom_gueltig_ab_1_1_2026_ebfae30e42.pdf",
    // § 5 Abs. 1 Z 6 lit. a, § 6 lit. b Z 2 (no grid loss fee on NE 7)
    tariffs: tariffsFor({ energyCt: 8.46, lossCt: 0, meterEurMonth: 2.4, usageTaxRate: 0 }),
  },
  {
    id: "kaernten",
    operator: "KNG-Kärnten Netz",
    area: "Kärnten",
    priceSheet: "https://kaerntennetz.at/dokumente/Strom/Preisblatt_Strom_2026.pdf",
    // § 5 Abs. 1 Z 6 lit. b, § 6 lit. b Z 3
    tariffs: tariffsFor({ energyCt: 9.67, lossCt: 0.368, meterEurMonth: 2.4, usageTaxRate: 0 }),
  },
  {
    id: "klagenfurt",
    operator: "Energie Klagenfurt",
    area: "Klagenfurt",
    priceSheet: "https://www.stw.at/wp-content/uploads/2026/07/260720_preisblatt_stromnetz.pdf",
    // § 5 Abs. 1 Z 6 lit. c, § 6 lit. b Z 4. Benützungsabgabe der Stadt Klagenfurt 1.637 ct/kWh
    // (price sheet valid from 1.7.2026; the sheets from January 2026 are no longer online).
    tariffs: tariffsFor({
      energyCt: 6.9,
      lossCt: 0.578,
      meterEurMonth: 2.4,
      usageTaxRate: 0,
      localLevyCt: 1.637,
    }),
  },
  {
    id: "noe",
    operator: "Netz Niederösterreich",
    area: "Niederösterreich",
    priceSheet: "https://netz-noe.at/wissen/downloads",
    // § 5 Abs. 1 Z 6 lit. d, § 6 lit. b Z 5; metering fee: Netz NÖ price sheet B406
    tariffs: tariffsFor({ energyCt: 8.79, lossCt: 0.384, meterEurMonth: 2.18, usageTaxRate: 0 }),
  },
  {
    id: "ooe",
    operator: "Netz Oberösterreich",
    area: "Oberösterreich",
    priceSheet:
      "https://www.ris.bka.gv.at/GeltendeFassung.wxe?Abfrage=Bundesnormen&Gesetzesnummer=20010107",
    meterIsMaximum: true,
    // § 5 Abs. 1 Z 6 lit. e, § 6 lit. b Z 6; metering fee: legal maximum (§ 10 Abs. 1 Z 1)
    tariffs: tariffsFor({ energyCt: 6.29, lossCt: 0.528, meterEurMonth: 2.4, usageTaxRate: 0 }),
  },
  {
    id: "linz",
    operator: "Linz Netz",
    area: "Linz",
    priceSheet:
      "https://www.linznetz.at/media/linz_netz_website/netz_dokumente/Strom-Netzentgelte-Abgaben-2026.pdf",
    // § 5 Abs. 1 Z 6 lit. f, § 6 lit. b Z 7; metering fee: Linz Netz price sheet 2026
    tariffs: tariffsFor({ energyCt: 5.57, lossCt: 0.487, meterEurMonth: 2.38, usageTaxRate: 0 }),
  },
  {
    id: "salzburg",
    operator: "Salzburg Netz",
    area: "Salzburg",
    priceSheet:
      "https://www.salzburgnetz.at/content/dam/salzburgnetz/dokumente/stromnetz/Strom-Zuschlaege-Systemnnutzung.pdf",
    // § 5 Abs. 1 Z 6 lit. g, § 6 lit. b Z 8. Gebrauchsabgabe (state law) 0.3789 ct/kWh on NE 7.
    // Metering fee: Strom-Messentgelte.pdf (Direkt-Drehstromzählung)
    tariffs: tariffsFor({
      energyCt: 6.59,
      lossCt: 0.357,
      meterEurMonth: 2.3,
      usageTaxRate: 0,
      localLevyCt: 0.3789,
    }),
  },
  {
    id: "steiermark",
    operator: "Energienetze Steiermark",
    area: "Steiermark",
    priceSheet:
      "https://www.e-netze.at/downloads-data/pdf.aspx?pdf=EN_03-2026_Preisblatt_Strom_20260101_barrierefrei.pdf",
    // § 5 Abs. 1 Z 6 lit. h, § 6 lit. b Z 9
    tariffs: tariffsFor({ energyCt: 8.82, lossCt: 0.336, meterEurMonth: 2.4, usageTaxRate: 0 }),
  },
  {
    id: "graz",
    operator: "Stromnetz Graz",
    area: "Graz",
    priceSheet:
      "https://www.stromnetz-graz.at/media/wysiwyg/SGG/Preisblatt_Entgelte_Messleistungen.pdf",
    // § 5 Abs. 1 Z 6 lit. i, § 6 lit. b Z 10
    tariffs: tariffsFor({ energyCt: 5.17, lossCt: 0.658, meterEurMonth: 2.1, usageTaxRate: 0 }),
  },
  {
    id: "tirol",
    operator: "TINETZ-Tiroler Netze",
    area: "Tirol",
    priceSheet: "https://www.tinetz.at/uploads/tx_bh/769/tinetz_preisblatt_netz_2026.pdf",
    // § 5 Abs. 1 Z 6 lit. j, § 6 lit. b Z 11. Metering fee 28.80 €/year (sheet valid from 1.4.2026)
    tariffs: tariffsFor({ energyCt: 6.81, lossCt: 0.293, meterEurMonth: 2.4, usageTaxRate: 0 }),
  },
  {
    id: "innsbruck",
    operator: "Innsbrucker Kommunalbetriebe",
    area: "Innsbruck",
    priceSheet:
      "https://www.ikb.at/fileadmin/user_upload/Dokumente/Energie/Strom_Netz/SN_Dokumente/Preisblatt_Netzebene_7.pdf",
    // § 5 Abs. 1 Z 6 lit. k, § 6 lit. b Z 12
    tariffs: tariffsFor({ energyCt: 8.03, lossCt: 0.453, meterEurMonth: 2.4, usageTaxRate: 0 }),
  },
  {
    id: "vorarlberg",
    operator: "Vorarlberger Energienetze",
    area: "Vorarlberg",
    priceSheet:
      "https://www.vorarlbergnetz.at/media/Preisblatt_Messpreise_und_Blindarbeit_2026.pdf",
    // § 5 Abs. 1 Z 6 lit. l, § 6 lit. b Z 13. Metering fee: three-phase meter without control functions
    tariffs: tariffsFor({ energyCt: 4.96, lossCt: 0.393, meterEurMonth: 1.6, usageTaxRate: 0 }),
  },
  {
    id: "kleinwalsertal",
    operator: "Energieversorgung Kleinwalsertal",
    area: "Kleinwalsertal",
    priceSheet: "https://www.evk.at/media/preisblatt_evk_2026_01012026.pdf",
    // § 5 Abs. 1 Z 6 lit. n, § 6 lit. b Z 15. German taxes apply: Stromsteuer 2.05 ct/kWh and
    // 19 % VAT, no Elektrizitätsabgabe. Finanzierungsbeitrag (§ 10 Abs. 2 Ökostromgesetz) 0.0137 ct/kWh.
    tariffs: tariffsFor({
      energyCt: 17.73,
      lossCt: 0.401,
      meterEurMonth: 2.4,
      usageTaxRate: 0,
      localLevyCt: 0.0137,
      electricityTaxCt: 2.05,
      vatRate: 0.19,
    }),
  },
];

export const gridAreaById = (id: string) => GRID_AREAS.find((a) => a.id === id) ?? GRID_AREAS[0];

/** Grid operator with its code in the metering point number (Zählpunktnummer). */
export interface GridOperator {
  /** "AT" + 6 digits: the first 8 characters of the metering point number */
  code: string;
  name: string;
  /** Grid area (SNE-V 2018) with the prices for this operator */
  areaId: string;
}

/**
 * Operator codes of the large grid operators.
 * Source: https://wissen.neoom.com/netzbetreiberliste (ebUtilities market partners).
 * Small operators use the prices of their grid area. Their metering fee can be different.
 */
export const OPERATORS: GridOperator[] = [
  { code: "AT001000", name: "Wiener Netze", areaId: "wien" },
  { code: "AT002000", name: "Netz Niederösterreich", areaId: "noe" },
  { code: "AT003000", name: "Netz Oberösterreich", areaId: "ooe" },
  { code: "AT003100", name: "Linz Netz", areaId: "linz" },
  { code: "AT003300", name: "eww ag", areaId: "ooe" },
  { code: "AT004000", name: "Salzburg Netz", areaId: "salzburg" },
  { code: "AT005000", name: "TINETZ-Tiroler Netze", areaId: "tirol" },
  { code: "AT005100", name: "Innsbrucker Kommunalbetriebe", areaId: "innsbruck" },
  { code: "AT005120", name: "HALLAG Kommunale", areaId: "tirol" },
  { code: "AT006000", name: "Vorarlberger Energienetze", areaId: "vorarlberg" },
  // Not in the list above. Source: EVK Kommunikationsdatenblatt
  // https://www.evk.at/media/kommunikationsdatenblatt_evk_netz_01052026.pdf
  { code: "AT006230", name: "Energieversorgung Kleinwalsertal", areaId: "kleinwalsertal" },
  { code: "AT007000", name: "KNG-Kärnten Netz", areaId: "kaernten" },
  { code: "AT007100", name: "Energie Klagenfurt", areaId: "klagenfurt" },
  { code: "AT008000", name: "Energienetze Steiermark", areaId: "steiermark" },
  { code: "AT008100", name: "Stromnetz Graz", areaId: "graz" },
  { code: "AT008870", name: "Feistritzwerke-STEWEAG", areaId: "steiermark" },
  { code: "AT009000", name: "Netz Burgenland", areaId: "burgenland" },
];

/** The first digit of the operator number is the federal state. Each state has a main grid area. */
const STATE_AREAS: Record<string, string> = {
  "1": "wien",
  "2": "noe",
  "3": "ooe",
  "4": "salzburg",
  "5": "tirol",
  "6": "vorarlberg",
  "7": "kaernten",
  "8": "steiermark",
  "9": "burgenland",
};

export interface AreaMatch {
  area: GridArea;
  /** Undefined when the code is not in OPERATORS and the area comes from the federal state */
  operator?: GridOperator;
}

/** Grid area for an operator code ("AT003100"), or undefined when the app has no prices for it. */
export function areaForCode(code: string): AreaMatch | undefined {
  const operator = OPERATORS.find((o) => o.code === code);
  const find = (id: string | undefined) => GRID_AREAS.find((a) => a.id === id);
  const area = find(operator?.areaId);
  if (area) return { area, operator };
  const byState = find(STATE_AREAS[code.charAt(4)]);
  return byState ? { area: byState, operator } : undefined;
}

export const WIENER_NETZE_TARIFFS = gridAreaById("wien").tariffs;

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
