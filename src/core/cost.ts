import { isComplete } from "./analyze";
import type { CostBreakdown, EnergyContract, MonthStats, Tariff } from "./types";

export const ZERO_COST: CostBreakdown = {
  energy: 0,
  gridEnergy: 0,
  gridCapacity: 0,
  gridOther: 0,
  levies: 0,
  usageTax: 0,
  vat: 0,
  net: 0,
  gross: 0,
};

/** Capacity charge in € for the peak (kW) of one calendar month (1..12). */
export function capacityChargeMonth(peakKw: number, t: Tariff, month = 12): number {
  if (!t.capacity) return t.flatFeeYear / 12;
  const c = t.capacity;
  if (c.uniformUntilMonth && month <= c.uniformUntilMonth) return (peakKw * c.lowEurKwYear) / 12;
  const p = Math.max(peakKw, c.minKw);
  const low = Math.min(p, c.thresholdKw) * c.lowEurKwYear;
  const high = Math.max(p - c.thresholdKw, 0) * c.highEurKwYear;
  return (low + high) / 12;
}

/** Cost of one month. A partial month is billed with its share of the fixed monthly fees. */
export function monthCost(m: MonthStats, t: Tariff, contract: EnergyContract): CostBreakdown {
  const share = Math.min(1, m.readings / m.expectedReadings);
  const energy = (m.kwh * contract.priceCt) / 100 + contract.baseFeeMonth * share;
  const gridEnergy =
    (m.kwh * t.energyCt - m.snapKwh * t.energyCt * t.snapReduction + m.kwh * t.lossCt) / 100;
  const gridCapacity = capacityChargeMonth(m.peakKw, t, m.month) * share;
  const gridOther = t.meterEurMonth * share;
  const l = t.levies;
  const eag = l.eagContribution;
  const eagContribution =
    (m.kwh * (t.energyCt * eag.energyRate + eag.lossCt)) / 100 + gridCapacity * eag.capacityRate;
  const levies =
    (m.kwh * l.electricityTaxCt) / 100 + eagContribution + (l.eagFlatYear / 12) * share;
  const usageTax =
    (energy + gridEnergy + gridCapacity + gridOther) * l.usageTaxRate +
    (m.kwh * (l.localLevyCt ?? 0)) / 100;
  const net = energy + gridEnergy + gridCapacity + gridOther + levies + usageTax;
  const vat = net * l.vatRate;
  return {
    energy,
    gridEnergy,
    gridCapacity,
    gridOther,
    levies,
    usageTax,
    vat,
    net,
    gross: net + vat,
  };
}

export function addCost(a: CostBreakdown, b: CostBreakdown): CostBreakdown {
  const out = { ...a };
  for (const k of Object.keys(out) as (keyof CostBreakdown)[]) out[k] = a[k] + b[k];
  return out;
}

export function scaleCost(a: CostBreakdown, f: number): CostBreakdown {
  const out = { ...a };
  for (const k of Object.keys(out) as (keyof CostBreakdown)[]) out[k] = a[k] * f;
  return out;
}

/**
 * Months used for the yearly figure: the last 12 months of data
 * (an incomplete first or last month is dropped when enough complete months exist).
 */
export function yearWindow(months: MonthStats[]): MonthStats[] {
  let list = months;
  const complete = months.filter(isComplete);
  if (complete.length >= 12) list = complete;
  return list.slice(-12);
}

export interface YearCost {
  total: CostBreakdown;
  /** Factor used to scale the data to one year (1 = exactly 12 months) */
  scale: number;
  months: { month: MonthStats; cost: CostBreakdown }[];
}

export function yearCost(months: MonthStats[], t: Tariff, contract: EnergyContract): YearCost {
  const window = yearWindow(months);
  const rows = window.map((m) => ({ month: m, cost: monthCost(m, t, contract) }));
  const sum = rows.reduce((acc, r) => addCost(acc, r.cost), ZERO_COST);
  const covered = window.reduce((acc, m) => acc + Math.min(1, m.readings / m.expectedReadings), 0);
  const scale = covered > 0 ? 12 / covered : 0;
  return { total: scaleCost(sum, scale), scale, months: rows };
}

/** Grid part of a cost (Netzentgelte only). */
export const gridTotal = (c: CostBreakdown) => c.gridEnergy + c.gridCapacity + c.gridOther;
