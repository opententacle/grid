import type { Locale } from "./i18n";

/**
 * Open questions on the main page: points the legal texts do not answer yet,
 * the assumption the app uses, and who can answer them.
 */
export type Body = "econtrol" | "wienernetze" | "ministry";

export const BODY_URLS: Record<Body, string> = {
  econtrol: "https://www.e-control.at/",
  wienernetze: "https://www.wienernetze.at/",
  ministry: "https://www.bmwet.gv.at/",
};

export interface OpenQuestion {
  id: string;
  q: string;
  /** What the app assumes until the question is answered */
  assumption: string;
  /** Effect when the assumption is wrong (optional) */
  impact?: string;
  who: Body[];
  ref?: string;
}

export interface OpenText {
  title: string;
  intro: string;
  assumptionLabel: string;
  impactLabel: string;
  whoLabel: string;
  sourceLabel: string;
  bodies: Record<Body, string>;
  help: string;
  helpIssue: string;
  helpMail: string;
  items: OpenQuestion[];
}

const de: OpenText = {
  title: "Offene Fragen",
  intro:
    "Diese Punkte sind noch nicht klar geregelt. Die App rechnet mit einer Annahme. Die zuständigen Stellen können die Fragen beantworten.",
  assumptionLabel: "Annahme der App",
  impactLabel: "Wenn die Annahme falsch ist",
  whoLabel: "Zuständig",
  sourceLabel: "Quelle",
  bodies: {
    econtrol: "E-Control (Regulierungsbehörde)",
    wienernetze: "Wiener Netze (Netzbetreiber)",
    ministry: "Energieministerium (BMWET)",
  },
  help: "Sie kennen die Antwort oder sind zuständig? Bitte melden Sie sich.",
  helpIssue: "Issue auf GitHub öffnen",
  helpMail: "E-Mail schreiben",
  items: [
    {
      id: "existing",
      q: "Gilt die 10-kW-Regel für bestehende Anschlüsse auch für den monatlichen Leistungspreis?",
      assumption:
        "Nein. Die Regel legt nur die Leistung des Anschlusses fest. Verrechnet wird die Monatsspitze, mindestens 2 kW.",
      impact:
        "Dann zählen jeden Monat mindestens 10 kW. Für die meisten Haushalte steigen die Kosten deutlich.",
      who: ["econtrol", "wienernetze"],
      ref: "SNE-G-V § 34 Abs. 1, § 6 Abs. 3",
    },
    {
      id: "prices",
      q: "Wie hoch sind die Preise ab 2027 bei Wiener Netze?",
      assumption:
        "Werte aus dem Entwurf der SNE-T-V 2027 (29. Oktober 2026): Leistungspreis 2,46 € je kW und Monat bis 10 kW, 3,69 € darüber. Arbeitspreis aus den Tabellen der E-Control berechnet.",
      impact: "Die endgültigen Preise können nach der Begutachtung anders sein.",
      who: ["econtrol"],
      ref: "Tarifverordnung SNE-T-V 2027 (erwartet im Dezember 2026)",
    },
    {
      id: "transition",
      q: "Gilt der alte Tarif mit Pauschale von Jänner bis November 2027 auch für Haushalte mit Smart Meter?",
      assumption:
        "Ja. Haushalte ohne Leistungsmessung zahlen die Pauschale (82,80 € je Jahr) und den eigenen Arbeitspreis.",
      impact:
        "Gilt für Smart-Meter-Haushalte der einheitliche Preis je kW, zählt die Spitze schon ab Jänner.",
      who: ["econtrol", "wienernetze"],
      ref: "SNE-G-V § 6 Abs. 3a, § 7 Abs. 4a",
    },
    {
      id: "start",
      q: "Ab wann verrechnet Wiener Netze den Leistungspreis?",
      assumption: "Ab 1. Dezember 2027. Bis dahin gilt die Pauschale.",
      impact:
        "Der Übergang kann sich bis 30. Juni 2028 verschieben. Dann gelten länger andere Preise.",
      who: ["wienernetze", "econtrol"],
      ref: "SNE-G-V § 6 Abs. 3b",
    },
    {
      id: "stages",
      q: "Wann kommt die Endstufe 50 : 50, und wie sieht die Stufe dazwischen aus?",
      assumption: "Endstufe ab 2029 (Ankündigung der E-Control). 2028 liegt genau in der Mitte.",
      who: ["econtrol"],
      ref: "SNE-G-V § 5 Abs. 1",
    },
    {
      id: "winap",
      q: "Wie hoch ist der Winter-Niedrigpreis (WiNAP) ab Oktober 2027?",
      assumption: "Nicht berücksichtigt.",
      impact: "Verbrauch in der Nacht (23–5 Uhr, Oktober–März) wird günstiger als berechnet.",
      who: ["econtrol"],
      ref: "SNE-G-V § 7 Abs. 4, § 32 Abs. 4",
    },
    {
      id: "snap",
      q: "Bleibt der Sommer-Abschlag (SNAP) bei −20 %?",
      assumption: "Ja, wie 2026.",
      who: ["econtrol"],
      ref: "SNE-G-V § 7 Abs. 3",
    },
    {
      id: "eag",
      q: "Wie werden Erneuerbaren-Förderbeitrag und -pauschale ab 2027 berechnet?",
      assumption:
        "Gleiche Anteile wie 2026. Der Anteil der Pauschale gilt für den Leistungspreis. Pauschale 19,02 € je Jahr, auch nach 2027.",
      who: ["ministry"],
      ref: "EAG § 73, § 75",
    },
  ],
};

const en: OpenText = {
  title: "Open questions",
  intro:
    "These points are not clearly set yet. The app uses an assumption. The responsible bodies can answer the questions.",
  assumptionLabel: "App assumption",
  impactLabel: "If the assumption is wrong",
  whoLabel: "Responsible",
  sourceLabel: "Source",
  bodies: {
    econtrol: "E-Control (regulator)",
    wienernetze: "Wiener Netze (grid operator)",
    ministry: "Energy ministry (BMWET)",
  },
  help: "Do you know the answer, or are you responsible? Please contact us.",
  helpIssue: "Open an issue on GitHub",
  helpMail: "Send an e-mail",
  items: [
    {
      id: "existing",
      q: "Does the 10 kW rule for existing connections also apply to the monthly capacity price?",
      assumption:
        "No. The rule sets only the capacity of the connection. The monthly peak is billed, at least 2 kW.",
      impact: "Then at least 10 kW count each month. For most households, the cost goes up a lot.",
      who: ["econtrol", "wienernetze"],
      ref: "SNE-G-V § 34 (1), § 6 (3)",
    },
    {
      id: "prices",
      q: "What are the Wiener Netze prices from 2027?",
      assumption:
        "Values from the draft SNE-T-V 2027 (29 October 2026): capacity price €2.46 per kW and month up to 10 kW, €3.69 above. Energy price calculated from the E-Control tables.",
      impact: "The final prices can be different after the review.",
      who: ["econtrol"],
      ref: "Tariff regulation SNE-T-V 2027 (expected in December 2026)",
    },
    {
      id: "transition",
      q: "Does the old tariff with flat fee from January to November 2027 also apply to households with a smart meter?",
      assumption:
        "Yes. Households without power metering pay the flat fee (€82.80 per year) and the separate energy price.",
      impact:
        "If the single price per kW applies to smart meter households, the peak counts from January.",
      who: ["econtrol", "wienernetze"],
      ref: "SNE-G-V § 6 (3a), § 7 (4a)",
    },
    {
      id: "start",
      q: "From when does Wiener Netze bill the capacity price?",
      assumption: "From 1 December 2027. Until then, the flat fee applies.",
      impact: "The transition can move until 30 June 2028. Then other prices apply for longer.",
      who: ["wienernetze", "econtrol"],
      ref: "SNE-G-V § 6 (3b)",
    },
    {
      id: "stages",
      q: "When does the final stage 50 : 50 come, and what does the stage in between look like?",
      assumption: "Final stage from 2029 (E-Control announcement). 2028 is exactly in the middle.",
      who: ["econtrol"],
      ref: "SNE-G-V § 5 (1)",
    },
    {
      id: "winap",
      q: "What is the winter low price (WiNAP) from October 2027?",
      assumption: "Not included.",
      impact: "Use at night (23:00–05:00, October–March) is cheaper than calculated.",
      who: ["econtrol"],
      ref: "SNE-G-V § 7 (4), § 32 (4)",
    },
    {
      id: "snap",
      q: "Does the summer reduction (SNAP) stay at −20 %?",
      assumption: "Yes, as in 2026.",
      who: ["econtrol"],
      ref: "SNE-G-V § 7 (3)",
    },
    {
      id: "eag",
      q: "How are the renewable energy contribution and flat fee calculated from 2027?",
      assumption:
        "Same shares as in 2026. The share of the flat fee applies to the capacity price. Flat fee €19.02 per year, also after 2027.",
      who: ["ministry"],
      ref: "EAG § 73, § 75",
    },
  ],
};

export const OPEN: Record<Locale, OpenText> = { de, en };
