import type { Locale } from "./i18n";

/**
 * Release notes for the "What is new" banner. Newest entry first.
 * The banner shows only the newest entry. Add a new entry with a new `id` for each release
 * that changes the results. A new `id` shows the banner again to people who closed it.
 */
export interface NewsEntry {
  /** Stable id, stored when the banner is closed. Use the release date. */
  id: string;
  /** Release date (YYYY-MM-DD) */
  date: string;
  /** Optional link to more details, relative to the site root */
  href?: string;
  text: Record<Locale, { title: string; points: string[]; link?: string }>;
}

export const NEWS: NewsEntry[] = [
  {
    id: "2026-11-09",
    date: "2026-11-09",
    href: "./berechnung.html#prices",
    text: {
      de: {
        title: "Preise 2027 aus dem Entwurf der Tarifverordnung",
        points: [
          "Preise 2027 für alle 14 Netzbereiche aus dem Entwurf der SNE-T-V 2027 (29. Oktober 2026). Bisher galt ein Modellwert für ganz Österreich.",
          "Jänner bis November 2027: Pauschale (82,80 € je Jahr) und eigener Arbeitspreis. Der Leistungspreis gilt ab Dezember 2027.",
          "Über 10 kW gilt der 1,5-fache Leistungspreis (bisher der doppelte).",
          "2028 bis 2030: Schätzung je Netzbereich nach dem Modell der E-Control.",
        ],
        link: "Alle Preise je Netzbereich",
      },
      en: {
        title: "2027 prices from the draft tariff ordinance",
        points: [
          "2027 prices for all 14 grid areas from the draft SNE-T-V 2027 (29 October 2026). Before, one model value applied to all of Austria.",
          "January to November 2027: flat fee (€82.80 per year) and a separate energy price. The capacity price applies from December 2027.",
          "Above 10 kW, 1.5 times the capacity price applies (before: double).",
          "2028 to 2030: estimate per grid area based on the E-Control model.",
        ],
        link: "All prices per grid area",
      },
    },
  },
];

/** Days after the release date during which the banner shows. */
export const NEWS_MAX_AGE_DAYS = 60;

/** Newest entry, if it is not older than NEWS_MAX_AGE_DAYS at `today`. */
export function currentNews(today: Date, news: NewsEntry[] = NEWS): NewsEntry | undefined {
  const entry = news[0];
  if (!entry) return undefined;
  const ageDays = (today.getTime() - new Date(`${entry.date}T00:00:00`).getTime()) / 86_400_000;
  return ageDays <= NEWS_MAX_AGE_DAYS ? entry : undefined;
}
