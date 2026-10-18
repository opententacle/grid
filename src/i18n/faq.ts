import { AUTHOR } from "../config";
import type { Locale } from "./i18n";

const NEW_ISSUE = `${AUTHOR.repo}/issues/new`;

/**
 * Text for the FAQ page: fine points of the new grid fee rules and a timeline to 2030.
 * Simple words, short sentences. Each answer names its legal source.
 * Source: SNE-G-V, BGBl. II Nr. 299/2026, unless named otherwise.
 */
export interface FaqItem {
  id: string;
  q: string;
  a: string[];
  /** Optional bullet list after the answer */
  list?: string[];
  /** Optional link after the answer */
  link?: { href: string; label: string };
  /** Legal source, e.g. "SNE-G-V § 6 Abs. 3" */
  ref?: string;
}

export interface TimelineStep {
  /** Short date label, e.g. "1.1.2027" */
  date: string;
  title: string;
  /** Short keywords, no prose */
  points: string[];
  /** true for plans and announcements (not in a legal text) */
  plan?: boolean;
}

export interface FaqText {
  title: string;
  intro: string;
  timelineTitle: string;
  timelineHint: string;
  planLabel: string;
  sourceLabel: string;
  timeline: TimelineStep[];
  items: FaqItem[];
}

const de: FaqText = {
  title: "FAQ: Details zum neuen Netztarif",
  intro:
    "Hier stehen die Feinheiten der neuen Regeln. Jede Antwort nennt ihre Quelle. Quelle ist die SNE-G-V (BGBl. II Nr. 299/2026), wenn nicht anders angegeben.",
  timelineTitle: "Zeitleiste bis 2030",
  timelineHint: "Was sich wann ändert",
  planLabel: "Plan",
  sourceLabel: "Quelle",
  timeline: [
    {
      date: "12.10.2026",
      title: "SNE-G-V kundgemacht",
      points: ["BGBl. II Nr. 299/2026", "Struktur, keine Preise"],
    },
    {
      date: "11.11.2026",
      title: "Netzbetreiber melden Bereitschaft",
      points: ["Leistungspreis auf Netzebene 7 (§ 6 Abs. 3b)"],
    },
    {
      date: "Dez. 2026",
      title: "Tarifverordnung (SNE-T-V) erwartet",
      points: ["Preise je Netzbereich", "Bis dahin: Modellwerte der E-Control"],
      plan: true,
    },
    {
      date: "1.1.2027",
      title: "Neue Struktur in Kraft",
      points: [
        "Leistungspreis + Arbeitspreis (§ 5 Abs. 1)",
        "Pauschale entfällt",
        "Messentgelt entfällt",
        "Spitze = höchster Viertelstundenwert im Monat (§ 3 Abs. 1)",
      ],
    },
    {
      date: "1.1.–30.11.2027",
      title: "Übergang Netzebene 7",
      points: ["Ein Preis je kW (§ 6 Abs. 3a)", "Keine 10-kW-Staffel", "Kein 2-kW-Minimum"],
    },
    {
      date: "1.10.2027",
      title: "Winter-Niedrigpreis (WiNAP)",
      points: [
        "Oktober–März, 23–5 Uhr (§ 7 Abs. 4, § 32 Abs. 4)",
        "Höhe noch offen",
        "Flexible Entnahme spätestens ab jetzt (§ 32 Abs. 5)",
      ],
    },
    {
      date: "1.12.2027",
      title: "Reguläres Modell",
      points: [
        "Eigener Preis über 10 kW (§ 6 Abs. 2), Modell: doppelt",
        "Mindestens 2 kW (§ 6 Abs. 3)",
      ],
    },
    {
      date: "31.12.2027",
      title: "Erneuerbaren-Förderpauschale",
      points: ["19,02 €/Jahr bis Ende 2027 (Verordnung 2025)", "Wert ab 2028 offen"],
    },
    {
      date: "bis 30.6.2028",
      title: "Spätester Start im Netzbereich",
      points: ["Übergangszeit je Netzbereich verschiebbar (§ 6 Abs. 3b)"],
    },
    {
      date: "2028",
      title: "Nächste Stufe",
      points: ["Mehr Leistungspreis, weniger Arbeitspreis (§ 5 Abs. 1)", "App: Zwischenwert"],
      plan: true,
    },
    {
      date: "1.1.2029",
      title: "Endstufe 50 : 50",
      points: ["Ankündigung der E-Control", "App: Endstufe ab 2029"],
      plan: true,
    },
    {
      date: "1.1.2030",
      title: "Unterbrechbare Tarife enden",
      points: ["Reguläres Netznutzungsentgelt (§ 34 Abs. 4)"],
    },
    {
      date: "31.12.2030",
      title: "Speicher-Befreiung endet",
      points: ["Für neue systemdienliche Speicher (§ 33 Abs. 1)"],
    },
  ],
  items: [
    {
      id: "operators",
      q: "Funktioniert der Rechner für ganz Österreich?",
      a: [
        "Ja. Die neuen Regeln gelten für alle Netzbetreiber in Österreich. Die Preise ab 2027 sind Modellwerte der E-Control für ganz Österreich.",
        "Die Preise für 2026 („heute“) hängen vom Netzbereich ab. Wählen Sie Ihren Netzbereich in Schritt 3. Die App kennt diese Netzbereiche: Wien, Niederösterreich, Oberösterreich und Linz.",
        "Ihr Netzbereich fehlt? Dann wählen Sie einen Netzbereich mit ähnlichen Preisen. Der Vergleich ist dann nur eine grobe Schätzung.",
        "Die App erkennt das Format aus der Datei. Diese Exporte haben wir mit echten Dateien geprüft:",
      ],
      list: [
        "Wiener Netze – Smart Meter-Webportal (Viertelstundenwerte)",
        "Linz Netz – Viertelstundenwerte, auch mit Daten der Energiegemeinschaft",
        "Österreich-Format (ebUtilities, AT-Format, Viertelstundenwerte)",
        "Lastprofil für den E-Control Tarifkalkulator",
      ],
      link: {
        href: NEW_ISSUE,
        label:
          "Ihr Netzbetreiber fehlt oder die Datei geht nicht? Schicken Sie uns einen Beispiel-Export auf GitHub. Bitte entfernen Sie vorher Ihre Zählpunktnummer.",
      },
      ref: "Preise 2026: SNE-V 2018 § 5 Abs. 1 Z 6 und § 6 (BGBl. II Nr. 305/2025)",
    },
    {
      id: "peak",
      q: "Wie berechnet die App die Monatsspitze?",
      a: [
        "Die App nimmt den höchsten Viertelstundenwert (kWh) des Monats und multipliziert ihn mit 4.",
        "Das Ergebnis ist die durchschnittliche Leistung über 15 Minuten. So definiert die Verordnung den „Viertelstundenleistungswert“.",
        "Es gibt keinen Mittelwert über eine Stunde. Ein Mittelwert über vier Viertelstunden würde die Spitze zu niedrig zeigen.",
        "Beispiel: 0,9 kWh in 15 Minuten sind 3,6 kW.",
      ],
      ref: "§ 2 Abs. 1 Z 17, § 3 Abs. 1",
    },
    {
      id: "minimum",
      q: "Zahle ich mindestens 20 % meiner vereinbarten Leistung?",
      a: [
        "Nein. Die 20-%-Regel gilt nur auf den Netzebenen 1 bis 6.",
        "Haushalte sind auf Netzebene 7. Dort zählen mindestens 2 kW.",
        "Ausnahme: Kleinstanschlüsse (bis 16 A einphasig oder 6 A dreiphasig).",
      ],
      ref: "§ 6 Abs. 3, § 2 Abs. 1 Z 7",
    },
    {
      id: "fees",
      q: "Fallen Pauschale und Messentgelt weg?",
      a: [
        "Ja, ab 2027. Das Netznutzungsentgelt hat dann nur einen Leistungspreis und einen Arbeitspreis.",
        "Ein Messentgelt kommt in der Verordnung nicht mehr vor.",
        "Die Kosten stecken im Leistungspreis. Die E-Control rechnet 54 € Pauschale und 28,80 € Messentgelt in den Startwert von rund 19 €/kW ein.",
        "Das Netzverlustentgelt bleibt (ct/kWh).",
      ],
      ref: "§ 2 Abs. 1 Z 11, § 5 Abs. 1, § 12",
    },
    {
      id: "transition",
      q: "Was gilt von Jänner bis November 2027?",
      a: [
        "Ein Übergang für Netzebene 7: ein einheitlicher Preis je kW für die ganze Spitze.",
        "Es gibt keine 10-kW-Staffel und kein Minimum von 2 kW.",
        "Ab Dezember 2027 gilt das reguläre Modell.",
        "Die App rechnet so. Als Preis nimmt sie den Startwert der E-Control.",
      ],
      ref: "§ 6 Abs. 3a",
    },
    {
      id: "start",
      q: "Wann beginnt der Leistungspreis bei meinem Netzbetreiber?",
      a: [
        "Grundsätzlich am 1. Jänner 2027.",
        "Die Übergangszeit kann je Netzbereich verschoben werden, bis spätestens 30. Juni 2028.",
        "Die Netzbetreiber melden ihre Bereitschaft bis 11. November 2026.",
        "Die App nimmt den Start am 1. Jänner 2027 an.",
      ],
      ref: "§ 6 Abs. 3b",
    },
    {
      id: "existing",
      q: "Was bedeuten „10 kW“ und „Mittelwert der zwei höchsten Werte 2026“?",
      a: [
        "Diese Regel gilt für Anschlüsse auf Netzebene 7, die vor 2027 bestehen.",
        "Es zählt der höchste Wert aus: 10 kW, der vereinbarten Leistung per 31.12.2026 und dem Mittelwert der zwei höchsten Monatsspitzen 2026.",
        "Nach unserem Verständnis legt das die netzwirksame Leistung Ihres Anschlusses fest. Für den monatlichen Leistungspreis zählt die Monatsspitze, mindestens 2 kW.",
        "Diese Frage ist noch offen. Sie steht unter „Offene Fragen“ auf der Startseite.",
      ],
      ref: "§ 34 Abs. 1, § 6 Abs. 3",
    },
    {
      id: "lowprice",
      q: "Gibt es günstigere Zeiten?",
      a: [
        "Sommer (SNAP): 1. April bis 30. September, 10–16 Uhr. Die App rechnet mit −20 % wie 2026.",
        "Winter (WiNAP): 1. Oktober bis 31. März, 23–5 Uhr, erstmals ab 1. Oktober 2027. Die Höhe ist noch offen. Die App rechnet ihn noch nicht.",
        "Beide gelten nur mit Viertelstundenwerten.",
      ],
      ref: "§ 7 Abs. 3–5, § 32 Abs. 4",
    },
    {
      id: "flex",
      q: "Was ist eine flexible Entnahme?",
      a: [
        "Der Netzbetreiber darf Ihre Leistung begrenzen: zwei Zeitfenster zu je zwei Stunden pro Tag.",
        "Netzebene 7: mindestens 4 kW begrenzbar, mindestens 4 kW bleiben frei (außer die ganze Leistung ist begrenzbar).",
        "Dafür gibt es einen eigenen Leistungspreis. Die Vereinbarung gilt grundsätzlich 10 Jahre.",
        "Die App rechnet das nicht.",
      ],
      ref: "§ 10",
    },
    {
      id: "pv",
      q: "Zahle ich für PV-Einspeisung ein Netzentgelt?",
      a: [
        "Nein. Das Netznutzungsentgelt zahlen nur Entnehmer.",
        "Das Netzverlustentgelt für Einspeiser gilt erst ab 5 MW.",
        "Die App rechnet nur mit dem Bezug aus dem Netz.",
      ],
      ref: "§ 5 Abs. 1, § 12 Abs. 1",
    },
    {
      id: "prices",
      q: "Warum sind die Preise ab 2027 nur Schätzungen?",
      a: [
        "Die SNE-G-V regelt nur die Struktur.",
        "Die Preise kommen mit der Tarifverordnung (SNE-T-V), erwartet im Dezember 2026.",
        "Bis dahin nutzt die App die Modellwerte der E-Control. Sie gelten für ganz Österreich.",
      ],
      ref: "§ 1 Abs. 1, § 6 Abs. 2",
    },
    {
      id: "stages",
      q: "Wann ist die Endstufe erreicht?",
      a: [
        "Die Verordnung sagt nur: Der Anteil des Leistungspreises steigt stufenweise.",
        "Die E-Control kündigt die Endstufe 50 : 50 für 1. Jänner 2029 an.",
        "Die App folgt dieser Ankündigung: Endstufe ab 2029, 2028 ist ein Zwischenwert.",
      ],
      ref: "§ 5 Abs. 1",
    },
  ],
};

const en: FaqText = {
  title: "FAQ: details of the new grid tariff",
  intro:
    "This page gives the fine points of the new rules. Each answer names its source. The source is the SNE-G-V (BGBl. II No. 299/2026), unless named otherwise.",
  timelineTitle: "Timeline to 2030",
  timelineHint: "What changes when",
  planLabel: "Plan",
  sourceLabel: "Source",
  timeline: [
    {
      date: "12 Oct 2026",
      title: "SNE-G-V published",
      points: ["BGBl. II No. 299/2026", "Structure, no prices"],
    },
    {
      date: "11 Nov 2026",
      title: "Grid operators report readiness",
      points: ["Capacity price on grid level 7 (§ 6 (3b))"],
    },
    {
      date: "Dec 2026",
      title: "Tariff regulation (SNE-T-V) expected",
      points: ["Prices per grid area", "Until then: E-Control model values"],
      plan: true,
    },
    {
      date: "1 Jan 2027",
      title: "New structure in force",
      points: [
        "Capacity price + energy price (§ 5 (1))",
        "No flat fee",
        "No metering fee",
        "Peak = highest quarter-hour value in the month (§ 3 (1))",
      ],
    },
    {
      date: "1 Jan – 30 Nov 2027",
      title: "Transition on grid level 7",
      points: ["One price per kW (§ 6 (3a))", "No 10 kW threshold", "No 2 kW minimum"],
    },
    {
      date: "1 Oct 2027",
      title: "Winter low price (WiNAP)",
      points: [
        "October–March, 23:00–05:00 (§ 7 (4), § 32 (4))",
        "Value not known yet",
        "Flexible use: at the latest from now (§ 32 (5))",
      ],
    },
    {
      date: "1 Dec 2027",
      title: "Regular model",
      points: ["Own price above 10 kW (§ 6 (2)), model: double", "At least 2 kW (§ 6 (3))"],
    },
    {
      date: "31 Dec 2027",
      title: "Renewable energy flat fee",
      points: ["€19.02/year until end of 2027 (regulation 2025)", "Value from 2028 not known"],
    },
    {
      date: "by 30 Jun 2028",
      title: "Latest start in a grid area",
      points: ["Transition period can move per grid area (§ 6 (3b))"],
    },
    {
      date: "2028",
      title: "Next stage",
      points: ["More capacity price, less energy price (§ 5 (1))", "App: value in between"],
      plan: true,
    },
    {
      date: "1 Jan 2029",
      title: "Final stage 50 : 50",
      points: ["Announced by E-Control", "App: final stage from 2029"],
      plan: true,
    },
    {
      date: "1 Jan 2030",
      title: "Interruptible tariffs end",
      points: ["Regular grid fee (§ 34 (4))"],
    },
    {
      date: "31 Dec 2030",
      title: "Storage exemption ends",
      points: ["For new grid-supporting storage (§ 33 (1))"],
    },
  ],
  items: [
    {
      id: "operators",
      q: "Does the calculator work for all of Austria?",
      a: [
        "Yes. The new rules apply to all grid operators in Austria. The prices from 2027 are E-Control model values for all of Austria.",
        "The prices for 2026 (“today”) depend on the grid area. Select your grid area in step 3. The app knows these grid areas: Vienna, Lower Austria, Upper Austria and Linz.",
        "Is your grid area missing? Then select a grid area with similar prices. The comparison is then only a rough estimate.",
        "The app finds the format in the file. We checked these exports with real files:",
      ],
      list: [
        "Wiener Netze – Smart Meter web portal (quarter-hour values)",
        "Linz Netz – quarter-hour values, also with energy community data",
        "Austrian format (ebUtilities, AT-Format, quarter-hour values)",
        "Load profile for the E-Control tariff calculator",
      ],
      link: {
        href: NEW_ISSUE,
        label:
          "Your grid operator is missing or the file does not work? Send us a sample export on GitHub. Please remove your metering point number first.",
      },
      ref: "Prices 2026: SNE-V 2018 § 5 (1) no. 6 and § 6 (BGBl. II No. 305/2025)",
    },
    {
      id: "peak",
      q: "How does the app calculate the monthly peak?",
      a: [
        "The app takes the highest quarter-hour value (kWh) of the month and multiplies it by 4.",
        "The result is the average power over 15 minutes. This is how the regulation defines the “quarter-hour power value”.",
        "There is no average over one hour. An average over four quarter-hours would show a peak that is too low.",
        "Example: 0.9 kWh in 15 minutes is 3.6 kW.",
      ],
      ref: "§ 2 (1) no. 17, § 3 (1)",
    },
    {
      id: "minimum",
      q: "Do I pay at least 20 % of my contracted capacity?",
      a: [
        "No. The 20 % rule applies only on grid levels 1 to 6.",
        "Households are on grid level 7. There, at least 2 kW count.",
        "Exception: very small connections (up to 16 A single-phase or 6 A three-phase).",
      ],
      ref: "§ 6 (3), § 2 (1) no. 7",
    },
    {
      id: "fees",
      q: "Do the flat fee and the metering fee end?",
      a: [
        "Yes, from 2027. The grid usage fee then has only a capacity price and an energy price.",
        "The regulation has no metering fee any more.",
        "The costs are part of the capacity price. E-Control puts the €54 flat fee and the €28.80 metering fee into the start value of about €19/kW.",
        "The grid loss fee stays (ct/kWh).",
      ],
      ref: "§ 2 (1) no. 11, § 5 (1), § 12",
    },
    {
      id: "transition",
      q: "What applies from January to November 2027?",
      a: [
        "A transition for grid level 7: one price per kW for the whole peak.",
        "There is no 10 kW threshold and no 2 kW minimum.",
        "From December 2027, the regular model applies.",
        "The app calculates this. As the price, it uses the E-Control start value.",
      ],
      ref: "§ 6 (3a)",
    },
    {
      id: "start",
      q: "When does the capacity price start at my grid operator?",
      a: [
        "In principle on 1 January 2027.",
        "The transition period can move per grid area, until 30 June 2028 at the latest.",
        "The grid operators report their readiness by 11 November 2026.",
        "The app uses 1 January 2027 as the start.",
      ],
      ref: "§ 6 (3b)",
    },
    {
      id: "existing",
      q: "What do “10 kW” and “average of the two highest values in 2026” mean?",
      a: [
        "This rule applies to grid level 7 connections that exist before 2027.",
        "The highest of these values counts: 10 kW, the contracted capacity on 31 Dec 2026, and the average of the two highest monthly peaks in 2026.",
        "As we understand it, this sets the capacity of your connection. For the monthly capacity price, the monthly peak counts, at least 2 kW.",
        "This question is still open. It is listed under “Open questions” on the main page.",
      ],
      ref: "§ 34 (1), § 6 (3)",
    },
    {
      id: "lowprice",
      q: "Are there cheaper times?",
      a: [
        "Summer (SNAP): 1 April to 30 September, 10:00–16:00. The app uses −20 % as in 2026.",
        "Winter (WiNAP): 1 October to 31 March, 23:00–05:00, first from 1 October 2027. The value is not known yet. The app does not include it yet.",
        "Both apply only with quarter-hour values.",
      ],
      ref: "§ 7 (3)–(5), § 32 (4)",
    },
    {
      id: "flex",
      q: "What is flexible use (flexible Entnahme)?",
      a: [
        "The grid operator can limit your power: two time windows of two hours each per day.",
        "Grid level 7: at least 4 kW can be limited, at least 4 kW stay free (unless all power can be limited).",
        "For this, there is a separate capacity price. The agreement is normally for 10 years.",
        "The app does not include this.",
      ],
      ref: "§ 10",
    },
    {
      id: "pv",
      q: "Do I pay a grid fee for PV feed-in?",
      a: [
        "No. Only consumers pay the grid usage fee.",
        "The grid loss fee for feed-in applies only from 5 MW.",
        "The app uses only the energy taken from the grid.",
      ],
      ref: "§ 5 (1), § 12 (1)",
    },
    {
      id: "prices",
      q: "Why are the prices from 2027 only estimates?",
      a: [
        "The SNE-G-V sets only the structure.",
        "The prices come with the tariff regulation (SNE-T-V), expected in December 2026.",
        "Until then, the app uses the E-Control model values. They apply to all of Austria.",
      ],
      ref: "§ 1 (1), § 6 (2)",
    },
    {
      id: "stages",
      q: "When is the final stage reached?",
      a: [
        "The regulation says only: the share of the capacity price goes up in steps.",
        "E-Control announces the final stage 50 : 50 for 1 January 2029.",
        "The app follows this announcement: final stage from 2029, 2028 is a value in between.",
      ],
      ref: "§ 5 (1)",
    },
  ],
};

export const FAQ: Record<Locale, FaqText> = { de, en };
