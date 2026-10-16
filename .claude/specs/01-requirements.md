# Requirements — Grid Fee Calculator (grid.opententacle.com)

Status: draft 1 (2026-10-15)

## 1. Purpose

The web app shows Austrian electricity customers their grid costs (Netzkosten):

- with the tariff model that applies today (2026), and
- with the new tariff model from the ElWG / SNE-G-V (BGBl. II Nr. 299/2026), from 1.1.2027.

The new model adds a monthly capacity price (Leistungspreis). The monthly peak is the highest quarter-hour value of the month. The part of the peak above 10 kW costs two times more. The share of the capacity price increases in steps until the final stage (target: 50 % energy, 50 % capacity).

## 2. Users

- Private households in Austria with a smart meter.
- Version 1 supports Wiener Netze customers only.

## 3. Functional requirements

### FR-1 Data source selection
- The app shows a dropdown with data sources (export formats). Each source has a parser and export instructions.
- Options in version 1:
  - "Wiener Netze – Smart Meter Webportal" (preselected, exact parser).
  - "Österreich-Format (ebUtilities AT-Format, Viertelstundenwerte)": `Startdatum;Enddatum;Zählpunktbezeichnung;…;OBIS;OBIS Kurzbeschreibung;Wert;Einheit;Qualität;…`, only OBIS `1-1:1.9.0 G.01` rows, `-` for missing values.
  - "E-Control Tarifkalkulator (Lastprofil)": `Ende Ablesezeitraum;Messintervall;Abrechnungsmaßeinheit;…[kWh]`, ISO time with offset = interval END.
- The parser detects the format from the header line (the dropdown only selects the instructions). Unknown formats use a tolerant fallback parser.
- All three formats were verified with real exports: identical monthly kWh, peaks and SNAP kWh.
- Only quarter-hour data is accepted. Daily data gives an error that explains why (no peak possible).
- The tariff is Wiener Netze in version 1 (the grid area of the data). The data model must allow more grid operators later.

### FR-2 Export instructions
- For the selected operator, the app shows short steps to export the data.
- Wiener Netze: deeplink to https://smartmeter-web.wienernetze.at/, menu path "Verbrauchsdaten → Datenexport", select "Viertelstundenwerte" and a period (12 months recommended), file type CSV.
- Requirements shown: smart meter installed, portal account, quarter-hour interval activated ("Anlagen & Verträge → Anlagedaten → Viertelstunden-Intervall"). Data is available only from the activation date.

### FR-3 CSV upload
- The user selects or drops a CSV file.
- The app reads the file in the browser only. The app sends no file data to a server.
- Format (Wiener Netze): UTF-8 with BOM, separator `;`, columns `Datum;Zeit von;Zeit bis;<meter> - Verbrauch [kWh]`, date `DD.MM.YYYY`, decimal comma.
- Rows during DST change: duplicate hour (October) and missing hour (March) must not cause errors.
- Empty values are skipped. Invalid files show a clear error message.

### FR-4 Analysis
For each calendar month in the data:
- consumption (kWh, sum),
- peak power (kW) = highest quarter-hour kWh × 4, rounded to 2 decimals, with date and time,
- consumption in the SNAP window (1 Apr–30 Sep, 10:00–16:00).
- The app shows the data period and a warning if a month is incomplete.

### FR-5 Year slider
- Values: 2026, 2027, 2028, 2029, 2030.
- 2026: current tariff (energy price per kWh + flat fee Pauschale, no capacity price).
- 2027–2030: new tariff with phased values (see section 6).
- The app applies the tariff of the selected year to the uploaded consumption profile.

### FR-6 Chart 1 — monthly consumption and peak
- Bars: kWh per month (left axis).
- Line/points: kW peak per month (right axis).
- Horizontal reference line at 10 kW if the scale reaches it.
- For 2026 the peak series is hidden (not relevant for the cost).

### FR-7 Chart 2 — monthly costs
- Stacked bars per month: energy (supplier), grid energy part, grid capacity part / flat fee, taxes and levies.
- Values follow the year slider.

### FR-8 Chart 3 — quarter-hour detail
- The user steps through the months (previous / next, or select).
- The chart shows all quarter-hour values of the month as kW.
- Horizontal lines: monthly peak, and the 10 kW threshold.

### FR-9 Key figures
- Value A: yearly cost with the tariff valid today, with the date shown ("Stand: 15.10.2026").
- Value B: yearly cost with the tariff of the selected year.
- Difference A → B in € and %.
- If the data does not cover 12 months, the app scales to one year and shows a note.

### FR-10 Energy price input
- The user can set the supplier energy price (ct/kWh, net) and the supplier base fee (€/month, net).
- Defaults are given. The values are used in all years.

### FR-11 Net / gross
- Default: gross (incl. levies, Gebrauchsabgabe, VAT).
- A toggle switches to net values.

### FR-12 Language
- German and English. Default from the browser locale (`de*` → German, else English).
- A language switch in the header (top of the page) changes the language without reload. The choice is stored in `localStorage`.

### FR-13 Dark mode
- Default from `prefers-color-scheme`. A toggle overrides it. The choice is stored in `localStorage`.

### FR-14 Disclaimer
- Visible on the page (near the results and in the footer): values can contain mistakes, they are rough estimates, no liability for correctness. Future prices are model values, not official prices.

### FR-14a Calculation page
- A separate page (`/berechnung.html`, DE + EN) explains the calculation in simple words and short paragraphs. Linked from the hero, the assumptions box and the footer.
- A FAQ page (`/faq.html`, DE + EN) explains the fine points of the SNE-G-V, each answer with its legal source (§). Each question is an accordion. On top: a timeline to 2030 in an accordion (vertical line, short keywords, plans marked as "Plan"). Linked from the header (all pages), the hero (FAQ and `faq.html#timeline`), the assumptions box and the footer. A URL hash opens that accordion.
- The version in the footer links to its GitHub release (`/releases/tag/X.Y.Z`); a dev build links to `/releases`.
- Tables on this page are generated from `src/core/tariffs.ts`.

### FR-15 Author and legal
- Footer: author name, subtle links to LinkedIn and GitHub.
- Impressum page/section with placeholders the owner fills in (config file).
- A separate privacy page (`/datenschutz.html`, footer link "Datenschutz / Privacy"): the app stores no personal data; the CSV stays in the browser; only anonymous, cookieless usage statistics (PostHog EU) are collected; no cookies, no local storage except language and theme preference (strictly necessary, ePrivacy exemption).
- The Impressum is a separate page too (`/impressum.html`), filled from the config file.

### FR-16 Analytics
- PostHog, EU host, no cookies (`persistence: "memory"`), no autocapture of input values, no session recording.
- Events: page view, operator selected, file parsed (row count, month count; no consumption values), year changed, language changed, theme changed, error.
- The key comes from a build-time variable. Without a key, analytics is off.

## 4. Non-functional requirements

- NFR-1 One page, static hosting on GitHub Pages under `grid.opententacle.com`.
- NFR-2 Stack: Vite, Vitest, Lit, Font Awesome, Biome. Charts with d3 modules (no wrapper). Minimal dependencies.
- NFR-3 Professional look, responsive (phone to desktop), accessible (labels, contrast, keyboard).
- NFR-4 Performance: parse 35,000 rows in under 1 s on a normal laptop.
- NFR-5 Privacy: no user data leaves the browser except anonymous analytics events.
- NFR-6 Tariff values in one data file with source and date per value.

## 5. CI / release

- `ci.yml`: on push and pull request: install → lint → test → build.
- `release.yml`: on GitHub release "published" with tag `X.Y.Z` (no `v` prefix): validate tag, run CI (reusable), then deploy to GitHub Pages.

## 6. Tariff assumptions (Wiener Netze, Netzebene 7, net)

| Item | 2026 (valid) | 2027 | 2028 | 2029 | 2030 |
|---|---|---|---|---|---|
| Netznutzung energy price ct/kWh | 6.98 | 7.36* | 5.95* | 4.53* | 4.53* |
| Pauschale €/year | 54.00 | – | – | – | – |
| Capacity price ≤ 10 kW €/kW/year | – | 19.00* | 26.41* | 33.82* | 33.82* |
| Capacity price > 10 kW €/kW/year | – | 38.00* | 52.82* | 67.64* | 67.64* |
| Netzverlust ct/kWh | 0.700 | 0.700† | 0.700† | 0.700† | 0.700† |
| Messentgelt €/month | 2.18 | – | – | – | – |
| SNAP reduction (Apr–Sep, 10–16 h) | −20 % | −20 %† | −20 %† | −20 %† | −20 %† |

`*` E-Control model values (presentation 14.07.2026, Austria-wide, not Wiener Netze-specific). 2028 is the midpoint (linear interpolation), 2030 equals the final stage 2029. `†` assumption: unchanged from 2026.

Capacity price per month = (min(peak, 10) × P₁ + max(peak − 10, 0) × P₂) / 12, minimum billed peak 2 kW.

From 2027 there is no Pauschale and no Messentgelt (SNE-G-V § 2 Abs. 1 Z 11, § 5 Abs. 1). The E-Control start value (about 19 €/kW) already contains both (54 € + 28.80 € per year).

Transition January to November 2027 (SNE-G-V § 6 Abs. 3a): capacity price per month = peak × P₁ / 12, without the 10 kW threshold and without the 2 kW minimum. P₁ is the model start value. From December 2027 the regular formula applies.

Levies (assumed unchanged): Elektrizitätsabgabe 0.1 ct/kWh (H0 household 2026), Erneuerbaren-Förderbeitrag as share of each grid fee (2026: 0.583 ct/kWh on Arbeitspreis, 3.796 €/year on Pauschale, 0.037 ct/kWh on Netzverlust; from 2027 the Pauschale share applies to the capacity price), Erneuerbaren-Förderpauschale 19.02 €/year, Gebrauchsabgabe Wien 7 % on energy + all grid fees, VAT 20 %.

Verification: the 2026 model was checked line by line against a real Wien Energie annual bill (23.09.2025–29.09.2026). Grid costs match to the cent (`src/core/cost.test.ts`, "bill reconciliation").

Minimum billed power (checked against BGBl. II Nr. 299/2026, § 6 Abs. 3): the 20 % rule (20 % of the contracted grid capacity in Bezugsrichtung) applies only on Netzebenen 1 to 6. On Netzebene 7 the minimum is 2 kW (Kleinstanschlüsse excepted). The app models Netzebene 7, so the 2 kW minimum is correct and the 20 % rule does not apply.

Not modelled in version 1: WiNAP (winter reduction from 1.10.2027, value not known), flexible connection discount, operator-specific start date (transition can move until 30.6.2028, § 6 Abs. 3b), feed-in (PV).

## 7. Decisions

- D-1 (owner) Tariffs 2027–2030: E-Control model values + linear interpolation. Final stage from 2029 (E-Control announcement, 12.10.2026); 2028 is the midpoint, 2030 equals 2029. The calculation follows the SNE-G-V rules as close as possible (monthly highest quarter-hour, 2 decimals, minimum 2 kW, 10 kW threshold, double price above).
- D-2 (owner) Cost scope: gross all-in by default, net toggle.
- D-3 (owner) PostHog: cookieless, EU host, no consent banner. Separate privacy page.
- D-5 (owner) Footer: author name, subtle LinkedIn and GitHub links. Disclaimer: rough estimate, values can contain mistakes, no liability.
- D-4 The sample CSV in `exports/` contains personal data. It is not committed (`.gitignore`). Tests use synthetic data.
