import type { Locale } from "./i18n";

/**
 * Text for the calculation page ("So rechnen wir"). Simple words, short sentences.
 * Numbers in tables come from src/core/tariffs.ts, so they stay correct.
 */
export interface ExplainSection {
  id: string;
  title: string;
  paragraphs: string[];
  /** Name of a generated table, rendered after the paragraphs */
  table?: "areas" | "tariffs" | "levies";
  formula?: string;
}

export interface ExplainText {
  title: string;
  intro: string;
  sections: ExplainSection[];
  tables: {
    item: string;
    years: string;
    energy: string;
    loss: string;
    flat: string;
    capLow: string;
    capHigh: string;
    meter: string;
    snap: string;
    elTax: string;
    eagFlat: string;
    eag2026: string;
    eagShare: string;
    usage: string;
    vat: string;
    model: string;
    area: string;
    meterMax: string;
  };
}

const de: ExplainText = {
  title: "So rechnet der Netzkosten-Rechner",
  intro:
    "Diese Seite erklärt jeden Schritt der Berechnung. Alle Werte sind Schätzungen. Maßgeblich ist nur Ihre Rechnung.",
  sections: [
    {
      id: "data",
      title: "1. Ihre Daten",
      paragraphs: [
        "Ihr Smart Meter misst den Verbrauch alle 15 Minuten. Das ist ein Viertelstundenwert in kWh.",
        "Ein Jahr hat rund 35.000 solche Werte. Die App liest sie aus Ihrer CSV-Datei. Die Datei bleibt in Ihrem Browser.",
        "Die App erkennt das Format selbst: Export von Wiener Netze, Österreich-Format (AT-Format) oder Lastprofil für den E-Control Tarifkalkulator. Sie erkennt auch die Einheit: Leistungswerte (kW) rechnet sie in Energie je Viertelstunde (kWh) um.",
      ],
    },
    {
      id: "peak",
      title: "2. Die Monatsspitze",
      paragraphs: [
        "Ein Viertelstundenwert ist Energie (kWh). Für die Leistung (kW) multiplizieren wir mit 4. Denn eine Stunde hat vier Viertelstunden.",
        "Beispiel: 0,9 kWh in einer Viertelstunde sind 3,6 kW.",
        "Die Monatsspitze ist der höchste dieser Werte im Monat. Wir runden auf zwei Nachkommastellen. Jeder Monat beginnt wieder bei null.",
        "Das ist die durchschnittliche Leistung über 15 Minuten, wie in der Verordnung (SNE-G-V § 2 Abs. 1 Z 17). Es gibt keinen Mittelwert über eine Stunde.",
        "Für den Leistungspreis zählen mindestens 2 kW, auch wenn Ihre Spitze kleiner ist. Ausnahme: Jänner bis November 2027 (siehe Abschnitt 4).",
      ],
      formula: "Leistung (kW) = Viertelstundenwert (kWh) × 4",
    },
    {
      id: "today",
      title: "3. Der Tarif heute (2026)",
      paragraphs: [
        "Heute zahlen Haushalte für das Netz einen Arbeitspreis je kWh und eine feste Pauschale je Jahr. Die Spitze spielt keine Rolle.",
        "Dazu kommen das Netzverlustentgelt je kWh und das Messentgelt je Monat.",
        "Von April bis September gilt zwischen 10 und 16 Uhr ein billigerer Arbeitspreis (Sommer-Niedrigpreisfenster, minus 20 %). Die App berechnet das mit Ihren Viertelstundenwerten.",
        "Die Preise für 2026 hängen vom Netzbereich ab. Quelle ist die SNE-V 2018 (BGBl. II Nr. 305/2025, § 5 Abs. 1 Z 6 und § 6). Das Messentgelt steht im Preisblatt des Netzbetreibers.",
        "Die Werte von Wiener Netze haben wir Zeile für Zeile mit einer echten Jahresabrechnung geprüft. Die Netzkosten stimmen auf den Cent.",
      ],
      table: "areas",
    },
    {
      id: "new",
      title: "4. Der neue Tarif ab 2027",
      paragraphs: [
        "Ab 2027 gibt es einen Leistungspreis. Er ersetzt die Pauschale und das Messentgelt. Grundlage ist die SNE-G-V (BGBl. II Nr. 299/2026).",
        "Sie zahlen jeden Monat für Ihre Monatsspitze. Der Preis ist in Euro je kW und Jahr angegeben. Pro Monat zahlen Sie ein Zwölftel davon.",
        "Bis 10 kW gilt der normale Preis. Für jedes kW über 10 kW zahlen Sie den doppelten Preis.",
        "Übergang Jänner bis November 2027: ein Preis je kW für die ganze Spitze, ohne 10-kW-Staffel und ohne Minimum von 2 kW (§ 6 Abs. 3a). Ab Dezember 2027 gilt die Staffel.",
        "Der Arbeitspreis je kWh sinkt dafür. Ab 2029 soll das Verhältnis von Arbeitspreis zu Leistungspreis 50 : 50 sein.",
      ],
      formula:
        "Leistungspreis pro Monat = (min(Spitze, 10) × Preis bis 10 kW + max(Spitze − 10, 0) × Preis über 10 kW) ÷ 12",
    },
    {
      id: "example",
      title: "5. Ein Beispiel",
      paragraphs: [
        "Ihre Spitze im Jänner ist 4,4 kW. Der Preis ist 33,82 € je kW und Jahr (Endstufe ab 2029).",
        "Rechnung: 4,4 × 33,82 € ÷ 12 = 12,40 € netto für Jänner.",
        "Eine Wallbox lädt mit 11 kW. Dann ist die Spitze mindestens 11 kW: 10 × 33,82 € + 1 × 67,64 € = 405,84 € pro Jahr, also 33,82 € pro Monat.",
        "Laden Sie langsamer (z. B. 3,7 kW), sinkt die Spitze. Dann sinken auch die Kosten.",
      ],
    },
    {
      id: "prices",
      title: "6. Die Preise je Jahr",
      paragraphs: [
        "Die offiziellen Preise ab 2027 gibt es noch nicht. Sie kommen mit der SNE-T-V (erwartet im Dezember 2026).",
        "Darum nutzen wir die Modellwerte der E-Control für 2027 (Anfangsstufe) und 2029 (Endstufe, laut E-Control ab 1. Jänner 2029). 2028 liegt genau dazwischen. 2030 bleibt auf der Endstufe.",
        "Die Modellwerte gelten für ganz Österreich. Die offiziellen Preise Ihres Netzbetreibers können anders sein.",
        "Das Netzverlustentgelt ändert sich nicht. Die App nimmt den Wert von 2026 Ihres Netzbereichs.",
      ],
      table: "tariffs",
    },
    {
      id: "more",
      title: "7. Energie, Abgaben und Steuern",
      paragraphs: [
        "Energie: Preis je kWh und Grundgebühr Ihres Lieferanten. Diese Werte geben Sie selbst ein. Tipp: Nehmen Sie den Preis von Ihrer Rechnung und ziehen Sie Rabatte ab.",
        "Erneuerbaren-Förderbeitrag: 2026 ein fester Betrag. Er ist in ganz Österreich gleich (BGBl. II Nr. 301/2025). Ab 2027 nehmen wir einen festen Anteil an den Netzentgelten an. Der Anteil der Pauschale gilt dann für den Leistungspreis.",
        "Örtliche Abgaben: In Wien gilt die Gebrauchsabgabe, 7 % auf Energie und Netzentgelte. In Salzburg gilt eine Gebrauchsabgabe je kWh, in Klagenfurt eine Benützungsabgabe je kWh. Die Tabelle in Abschnitt 3 zeigt die Werte.",
        "Kleinwalsertal: Dort gelten die deutsche Stromsteuer (2,05 ct/kWh) und 19 % Umsatzsteuer. Die Elektrizitätsabgabe gilt dort nicht.",
        "Umsatzsteuer: 20 % auf alles. Mit dem Schalter „Netto“ sehen Sie die Werte ohne Umsatzsteuer.",
      ],
      table: "levies",
    },
    {
      id: "year",
      title: "8. Vom Monat zum Jahr",
      paragraphs: [
        "Die App rechnet jeden Monat einzeln. Dann zählt sie die letzten 12 Monate zusammen.",
        "Hat Ihre Datei weniger als 12 Monate, rechnet die App auf ein Jahr hoch. Ein unvollständiger Monat zählt nur anteilig.",
        "Für alle Tarifjahre nutzt die App denselben Verbrauch. So sehen Sie nur den Unterschied durch den Tarif.",
        "„Heute“ ist der Tarif, der am heutigen Tag gilt.",
      ],
    },
    {
      id: "limits",
      title: "9. Was die App nicht berücksichtigt",
      paragraphs: [
        "Winter-Niedrigpreisfenster ab Oktober 2027 (der Wert ist noch nicht bekannt).",
        "Rabatt für flexible Netzanschlüsse (z. B. steuerbare Wallbox oder Wärmepumpe).",
        "Einspeisung aus einer PV-Anlage und Energiegemeinschaften.",
        "Den Starttermin Ihres Netzbetreibers. Die Übergangszeit kann sich bis 30. Juni 2028 verschieben.",
        "Rabatte und Boni Ihres Lieferanten.",
      ],
    },
  ],
  tables: {
    item: "Position",
    years: "Jahr",
    energy: "Netz-Arbeitspreis (ct/kWh)",
    loss: "Netzverlustentgelt (ct/kWh)",
    flat: "Pauschale (€/Jahr)",
    capLow: "Leistungspreis bis 10 kW (€/kW/Jahr)",
    capHigh: "Leistungspreis über 10 kW (€/kW/Jahr)",
    meter: "Messentgelt (€/Monat)",
    snap: "Sommer-Niedrigpreis (Abschlag)",
    elTax: "Elektrizitätsabgabe (ct/kWh)",
    eagFlat: "Erneuerbaren-Förderpauschale (€/Jahr)",
    eag2026:
      "Erneuerbaren-Förderbeitrag 2026 (Arbeitspreis ct/kWh / Pauschale €/Jahr / Netzverlust ct/kWh)",
    eagShare: "Erneuerbaren-Förderbeitrag ab 2027 (Anteil Arbeitspreis / Leistungspreis)",
    usage: "Örtliche Abgabe",
    vat: "Umsatzsteuer",
    model: "Modellwert",
    area: "Netzbereich",
    meterMax: "Höchstpreis laut SNE-V 2018 § 10. Der Netzbetreiber veröffentlicht keinen Wert.",
  },
};

const en: ExplainText = {
  title: "How the calculator works",
  intro:
    "This page explains each step of the calculation. All values are estimates. Only your bill is binding.",
  sections: [
    {
      id: "data",
      title: "1. Your data",
      paragraphs: [
        "Your smart meter measures the consumption every 15 minutes. This is a quarter-hour value in kWh.",
        "One year has about 35,000 of these values. The app reads them from your CSV file. The file stays in your browser.",
        "The app finds the format itself: Wiener Netze export, Austrian format (AT-Format) or load profile for the E-Control tariff calculator. It also finds the unit: it changes power values (kW) to energy per quarter hour (kWh).",
      ],
    },
    {
      id: "peak",
      title: "2. The monthly peak",
      paragraphs: [
        "A quarter-hour value is energy (kWh). To get power (kW), we multiply by 4, because one hour has four quarter-hours.",
        "Example: 0.9 kWh in one quarter-hour is 3.6 kW.",
        "The monthly peak is the highest of these values in the month. We round it to two decimals. Each month starts again at zero.",
        "This is the average power over 15 minutes, as in the regulation (SNE-G-V § 2 (1) no. 17). There is no average over one hour.",
        "For the capacity price, at least 2 kW count, also when your peak is lower. Exception: January to November 2027 (see section 4).",
      ],
      formula: "Power (kW) = quarter-hour value (kWh) × 4",
    },
    {
      id: "today",
      title: "3. The tariff today (2026)",
      paragraphs: [
        "Today, households pay for the grid an energy price per kWh and a fixed flat fee per year. The peak has no effect.",
        "There is also a grid loss fee per kWh and a metering fee per month.",
        "From April to September, a lower energy price applies between 10:00 and 16:00 (summer low-price window, minus 20 %). The app calculates this with your quarter-hour values.",
        "The 2026 prices depend on the grid area. The source is the SNE-V 2018 (BGBl. II No. 305/2025, § 5 (1) no. 6 and § 6). The metering fee is in the price sheet of the grid operator.",
        "We checked the Wiener Netze values line by line against a real annual bill. The grid costs are correct to the cent.",
      ],
      table: "areas",
    },
    {
      id: "new",
      title: "4. The new tariff from 2027",
      paragraphs: [
        "From 2027, there is a capacity price. It replaces the flat fee and the metering fee. The legal basis is the SNE-G-V (BGBl. II No. 299/2026).",
        "Each month you pay for your monthly peak. The price is given in euro per kW and year. Per month you pay one twelfth of it.",
        "Up to 10 kW, the normal price applies. For each kW above 10 kW, you pay double the price.",
        "Transition from January to November 2027: one price per kW for the whole peak, without 10 kW threshold and without 2 kW minimum (§ 6 (3a)). From December 2027, the threshold applies.",
        "In return, the energy price per kWh goes down. From 2029, the ratio of energy price to capacity price is to be 50 : 50.",
      ],
      formula:
        "Capacity price per month = (min(peak, 10) × price up to 10 kW + max(peak − 10, 0) × price above 10 kW) ÷ 12",
    },
    {
      id: "example",
      title: "5. An example",
      paragraphs: [
        "Your peak in January is 4.4 kW. The price is €33.82 per kW and year (final stage from 2029).",
        "Calculation: 4.4 × €33.82 ÷ 12 = €12.40 net for January.",
        "A wallbox charges with 11 kW. Then the peak is at least 11 kW: 10 × €33.82 + 1 × €67.64 = €405.84 per year, or €33.82 per month.",
        "If you charge more slowly (e.g. 3.7 kW), the peak goes down. Then the cost goes down too.",
      ],
    },
    {
      id: "prices",
      title: "6. The prices per year",
      paragraphs: [
        "The official prices from 2027 are not published yet. They come with the SNE-T-V (expected in December 2026).",
        "So we use the E-Control model values for 2027 (start stage) and 2029 (final stage, from 1 January 2029 as announced by E-Control). 2028 is exactly in between. 2030 stays at the final stage.",
        "The model values apply to all of Austria. The official prices of your grid operator can be different.",
        "The grid loss fee does not change. The app uses the 2026 value of your grid area.",
      ],
      table: "tariffs",
    },
    {
      id: "more",
      title: "7. Energy, levies and taxes",
      paragraphs: [
        "Energy: price per kWh and base fee of your supplier. You enter these values yourself. Tip: take the price from your bill and subtract discounts.",
        "Renewable energy contribution (Erneuerbaren-Förderbeitrag): in 2026 a fixed amount. It is the same in all of Austria (BGBl. II No. 301/2025). From 2027 we assume a fixed share of the grid fees. The share of the flat fee then applies to the capacity price.",
        "Local levies: Vienna has a usage tax (Gebrauchsabgabe) of 7 % on energy and grid fees. Salzburg has a usage tax per kWh, Klagenfurt a Benützungsabgabe per kWh. The table in section 3 shows the values.",
        "Kleinwalsertal: the German electricity tax (2.05 ct/kWh) and 19 % VAT apply there. The Austrian electricity tax does not apply there.",
        "VAT: 20 % on everything. With the “Net” switch you see the values without VAT.",
      ],
      table: "levies",
    },
    {
      id: "year",
      title: "8. From month to year",
      paragraphs: [
        "The app calculates each month on its own. Then it adds up the last 12 months.",
        "If your file has fewer than 12 months, the app scales the result to one year. An incomplete month counts only partly.",
        "For all tariff years, the app uses the same consumption. So you see only the difference that comes from the tariff.",
        "“Today” is the tariff that applies on the current day.",
      ],
    },
    {
      id: "limits",
      title: "9. What the app does not include",
      paragraphs: [
        "Winter low-price window from October 2027 (the value is not known yet).",
        "Discount for flexible grid connections (e.g. a controllable wallbox or heat pump).",
        "Feed-in from a PV system and energy communities.",
        "The start date of your grid operator. The transition period can move until 30 June 2028.",
        "Discounts and bonuses of your supplier.",
      ],
    },
  ],
  tables: {
    item: "Item",
    years: "Year",
    energy: "Grid energy price (ct/kWh)",
    loss: "Grid loss fee (ct/kWh)",
    flat: "Flat fee (€/year)",
    capLow: "Capacity price up to 10 kW (€/kW/year)",
    capHigh: "Capacity price above 10 kW (€/kW/year)",
    meter: "Metering fee (€/month)",
    snap: "Summer low price (reduction)",
    elTax: "Electricity tax (ct/kWh)",
    eagFlat: "Renewable energy flat fee (€/year)",
    eag2026:
      "Renewable energy contribution 2026 (energy ct/kWh / flat fee €/year / grid loss ct/kWh)",
    eagShare: "Renewable energy contribution from 2027 (share of energy price / capacity price)",
    usage: "Local levy",
    vat: "VAT",
    model: "Model value",
    area: "Grid area",
    meterMax: "Maximum price per SNE-V 2018 § 10. The grid operator does not publish a value.",
  },
};

export const EXPLAIN: Record<Locale, ExplainText> = { de, en };
