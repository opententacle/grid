import type { MessageKey } from "./de";

export const en: Record<MessageKey, string> = {
  "app.title": "Grid Fee Calculator",
  "app.subtitle":
    "What do you pay for the electricity grid today – and with the new capacity price from 2027?",
  "app.privacyBadge": "Your data stays in your browser",
  "header.language": "Language",
  "header.theme.dark": "Dark theme",
  "header.theme.light": "Light theme",

  "step.source": "Select data source",
  "step.upload": "Upload quarter-hour values",
  "step.settings": "Assumptions",
  "step.results": "Results",

  "source.label": "Data source / export format",
  "source.wienernetze": "Wiener Netze – Smart Meter web portal",
  "source.atformat": "Austrian format (ebUtilities, quarter-hour values)",
  "source.econtrol": "E-Control tariff calculator (load profile)",
  "source.requirements": "Requirements",
  "source.steps": "How to export your data",
  "source.openPortal": "Open portal",

  "wn.req.1": "A Wiener Netze smart meter and an account in the Smart Meter web portal",
  "wn.req.2":
    "Quarter-hour values activated (“Anlagen & Verträge” → “Anlagedaten” → edit meter → “Viertelstunden-Intervall”). Data is available from the day after activation.",
  "wn.step.1": "Log in to the Smart Meter web portal.",
  "wn.step.2": "Open “Verbrauchsdaten” → “Datenexport”.",
  "wn.step.3": "Select your metering point, “Viertelstundenwerte” and a period of 12 months.",
  "wn.step.4": "Click “Exportieren” and upload the CSV file here.",

  "at.req.1": "A smart meter with quarter-hour values activated",
  "at.req.2": "Your grid operator's web portal with download in the Austrian format (AT-Format)",
  "at.step.1": "Log in to the web portal of your grid operator.",
  "at.step.2": "Open the energy values or consumption data view.",
  "at.step.3": "Select the granularity “quarter-hour values” (QH) and a period of 12 months.",
  "at.step.4": "Download the file “…-AT-Format-…-QH.csv” and upload it here.",

  "ec.req.1": "A smart meter with quarter-hour values activated",
  "ec.req.2": "A load profile file for the E-Control tariff calculator (one year, quarter-hours)",
  "ec.step.1":
    "In your grid operator's portal, export the load profile in the format for the E-Control tariff calculator.",
  "ec.step.2": "Upload the CSV file here.",

  "upload.drop": "Drop the CSV file here",
  "upload.or": "or",
  "upload.choose": "Choose file",
  "upload.hint": "The file is read in your browser only. It is not uploaded.",
  "upload.loaded": "{rows} quarter-hour values · {from} – {to} · {kwh} kWh",
  "upload.replace": "Other file",
  "upload.reading": "Reading file …",

  "error.empty": "The file is empty.",
  "error.header":
    "The file format is not recognized. Check the selected data source and the export.",
  "error.noData": "The file contains no valid readings.",
  "error.granularity":
    "The file contains no quarter-hour values (e.g. only daily values). Quarter-hour values are necessary for the peak.",
  "error.unknown": "The file could not be read.",

  "settings.year": "Tariff year",
  "settings.yearHint.2026": "Current tariff: energy price + flat fee, no capacity price.",
  "settings.yearHint.new":
    "New model: energy price + capacity price per monthly peak (double price above 10 kW).",
  "settings.estimate": "Estimate",
  "settings.energyPrice": "Supplier energy price",
  "settings.energyPriceUnit": "ct/kWh net",
  "settings.baseFee": "Supplier base fee",
  "settings.baseFeeUnit": "€/month net",
  "settings.gross": "Gross",
  "settings.grossHint": "Including 20 % VAT",
  "settings.net": "Net",
  "settings.netHint": "Without VAT",
  "settings.display": "Display",

  "kpi.today": "Yearly cost with today's tariff",
  "kpi.todayDate": "As of {date} (tariff {year})",
  "kpi.selected": "Yearly cost with tariff {year}",
  "kpi.diff": "{sign}{amount} ({pct}) compared to today",
  "kpi.same": "Same as today's tariff",
  "kpi.grid": "of which grid fees",
  "kpi.scaled": "Scaled to 12 months (data for {months} months).",
  "kpi.maxPeak": "Highest monthly peak",
  "kpi.avgPeak": "Avg. monthly peak",
  "kpi.consumption": "Consumption / year",

  "chart.monthly.title": "Consumption and peak per month",
  "chart.monthly.desc":
    "Top: energy (kWh) per month. Bottom: highest quarter-hour value as power (kW).",
  "chart.monthly.peakHidden": "Peaks do not affect the cost with the 2026 tariff.",
  "chart.costs.title": "Cost per month",
  "chart.costs.desc": "Cost split per month with the {year} tariff ({mode}).",
  "chart.detail.title": "Quarter-hour values in detail",
  "chart.detail.desc": "Power per quarter-hour (kW). The line shows the monthly peak.",
  "chart.detail.prev": "Previous month",
  "chart.detail.next": "Next month",
  "chart.detail.peakAt": "Peak {kw} on {date}",
  "chart.table": "Show as table",
  "chart.hideTable": "Hide table",

  "series.kwh": "Consumption",
  "series.peak": "Monthly peak",
  "series.threshold": "10 kW threshold",
  "series.energy": "Energy (supplier)",
  "series.gridEnergy": "Grid – energy price & losses",
  "series.gridCapacity": "Grid – capacity price/flat fee & metering",
  "series.gridOther": "Metering fee",
  "series.taxes": "Levies & taxes",
  "series.power": "Power",
  "col.month": "Month",
  "col.total": "Total",
  incomplete: "incomplete",

  "disclaimer.title": "Disclaimer",
  "disclaimer.text":
    "All values are rough estimates and can contain mistakes. The tariffs from 2027 are E-Control model values (July 2026), not official Wiener Netze prices. No liability is accepted for correctness, completeness or timeliness. Only your bill is binding.",
  "assumptions.title": "Assumptions and sources",
  "assumptions.text":
    "Tariff 2026: Wiener Netze, grid level 7 (SNE-V 2018 as amended 2026). From 2027: structure per SNE-G-V (BGBl. II No. 299/2026); prices per E-Control model (start stage 2027, final stage 2030), 2028 and 2029 linearly interpolated. Monthly peak = highest quarter-hour value × 4, rounded to 2 decimals, at least 2 kW. Grid loss fee, metering fee, summer low-price window (−20 %, April–September 10:00–16:00), levies (electricity tax, renewable energy contribution and flat fee, Vienna usage tax 7 %) and VAT 20 % as in 2026. Not included: winter low-price window, flexible grid connections, feed-in, 2027 transition rules.",
  "assumptions.updated": "Tariff data as of {date}",

  "calc.title": "How we calculate",
  "calc.link": "How we calculate: the calculation in simple words",
  "footer.madeBy": "A project by",
  "footer.source": "Source code",
  "footer.calc": "How we calculate",
  "footer.privacy": "Privacy",
  "footer.imprint": "Imprint",
  "footer.back": "Back to the calculator",
  "footer.version": "Version {version}",

  "privacy.title": "Privacy",
  "privacy.intro": "This website stores no personal data. We use no cookies.",
  "privacy.csv.title": "Your metering data",
  "privacy.csv.text":
    "The CSV file is processed only locally in your browser. It is not sent to a server and not stored. When you close or reload the page, the data is gone.",
  "privacy.analytics.title": "Anonymous usage statistics",
  "privacy.analytics.text":
    "For anonymous usage statistics we use PostHog (PostHog Inc., servers in the EU, Frankfurt). PostHog runs without cookies and without storage on your device; each page view counts as a new, anonymous visit. We record only page views and interactions (e.g. “file read”, “tariff year changed”) with rough figures such as the number of months. No consumption values, no metering point numbers, no file names. IP addresses are not stored.",
  "privacy.storage.title": "Local settings",
  "privacy.storage.text":
    "Your choice of language and color scheme is kept in your browser's local storage (localStorage), so it stays for your next visit. This data does not leave your device.",
  "privacy.hosting.title": "Hosting",
  "privacy.hosting.text":
    "The website is served by GitHub Pages (GitHub Inc.). When you open it, GitHub processes technically necessary connection data (e.g. IP address) to deliver and protect the website.",
  "privacy.rights.title": "Your rights",
  "privacy.rights.text":
    "As we store no personal data, we cannot link any data to you. For questions, use the contact data in the imprint. You have the right to lodge a complaint with the Austrian Data Protection Authority.",

  "imprint.title": "Imprint",
  "imprint.law": "Information according to § 5 ECG and § 25 MedienG (Austria)",
  "imprint.owner": "Media owner and operator",
  "imprint.contact": "Contact",
  "imprint.purpose": "Purpose",
  "imprint.liability": "Liability",
};
