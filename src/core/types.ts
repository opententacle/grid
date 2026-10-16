/** One quarter-hour reading. `t` is the local start time (epoch ms). */
export interface Reading {
  t: number;
  kwh: number;
}

export interface MonthStats {
  /** "YYYY-MM" */
  key: string;
  year: number;
  /** 1..12 */
  month: number;
  kwh: number;
  /** kWh inside the summer reduction window (SNAP). */
  snapKwh: number;
  /** Highest quarter-hour value as average power in kW, rounded to 2 decimals. */
  peakKw: number;
  peakAt: number;
  readings: number;
  expectedReadings: number;
  /** Index range [start, end) into the readings array. */
  start: number;
  end: number;
}

export interface Analysis {
  readings: Reading[];
  months: MonthStats[];
  from: number;
  to: number;
  totalKwh: number;
}

export interface CapacityPrice {
  /** €/kW/year up to the threshold */
  lowEurKwYear: number;
  /** €/kW/year for the part above the threshold */
  highEurKwYear: number;
  thresholdKw: number;
  /** Lowest billed peak in kW */
  minKw: number;
  /**
   * Transition rule (SNE-G-V § 6 Abs. 3a): in months 1 to this month, one price
   * (lowEurKwYear) applies to the whole peak, without threshold and without minimum.
   */
  uniformUntilMonth?: number;
}

export interface Levies {
  /** Elektrizitätsabgabe ct/kWh */
  electricityTaxCt: number;
  /**
   * Erneuerbaren-Förderbeitrag as a share of each grid fee (EAG § 75).
   * It is charged on the normal energy price (no SNAP reduction).
   */
  eagContribution: { energyRate: number; capacityRate: number; lossRate: number };
  /** Erneuerbaren-Förderpauschale €/year */
  eagFlatYear: number;
  /** Gebrauchsabgabe (share, on energy + grid) */
  usageTaxRate: number;
  vatRate: number;
}

export interface Tariff {
  year: number;
  /** true when values are model values or assumptions, not official prices */
  estimate: boolean;
  /** Netznutzungsentgelt energy part ct/kWh */
  energyCt: number;
  /** Netzverlustentgelt ct/kWh */
  lossCt: number;
  /** Pauschale €/year (used when no capacity price applies) */
  flatFeeYear: number;
  capacity?: CapacityPrice;
  /** Messentgelt €/month */
  meterEurMonth: number;
  /** Share of energyCt removed inside the SNAP window */
  snapReduction: number;
  levies: Levies;
}

export interface EnergyContract {
  /** Supplier energy price, net ct/kWh */
  priceCt: number;
  /** Supplier base fee, net €/month */
  baseFeeMonth: number;
}

/** All values in € (net unless named otherwise). */
export interface CostBreakdown {
  energy: number;
  gridEnergy: number;
  gridCapacity: number;
  gridOther: number;
  levies: number;
  usageTax: number;
  vat: number;
  net: number;
  gross: number;
}
