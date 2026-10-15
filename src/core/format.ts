import { intlLocale } from "../i18n/i18n";

export const fmtEur = (v: number, digits = 0) =>
  new Intl.NumberFormat(intlLocale(), {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(v);

export const fmtNum = (v: number, digits = 0) =>
  new Intl.NumberFormat(intlLocale(), {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(v);

export const fmtPct = (v: number) =>
  new Intl.NumberFormat(intlLocale(), {
    style: "percent",
    maximumFractionDigits: 1,
    signDisplay: "exceptZero",
  }).format(v);

export const fmtDate = (t: number | Date) =>
  new Intl.DateTimeFormat(intlLocale(), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(t);

export const fmtDateTime = (t: number | Date) =>
  new Intl.DateTimeFormat(intlLocale(), {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(t);

export const fmtMonth = (year: number, month: number, style: "short" | "long" = "short") =>
  new Intl.DateTimeFormat(intlLocale(), {
    month: style,
    year: style === "short" ? "2-digit" : "numeric",
  }).format(new Date(year, month - 1, 1));
