export const de = {
  "app.title": "Netzkosten-Rechner",
  "app.subtitle":
    "Was kosten Sie die Stromnetzentgelte heute – und mit dem neuen Leistungspreis ab 2027?",
  "app.privacyBadge": "Ihre Daten bleiben im Browser",
  "header.language": "Sprache",
  "header.theme.dark": "Dunkles Design",
  "header.theme.light": "Helles Design",
  "header.faq": "FAQ",

  "step.source": "Datenquelle wählen",
  "step.upload": "Viertelstundenwerte hochladen",
  "step.settings": "Annahmen",
  "step.results": "Ergebnis",

  "source.label": "Datenquelle / Exportformat",
  "source.wienernetze": "Wiener Netze – Smart Meter-Webportal",
  "source.atformat": "Österreich-Format (ebUtilities, Viertelstundenwerte)",
  "source.econtrol": "E-Control Tarifkalkulator (Lastprofil)",
  "source.requirements": "Voraussetzungen",
  "source.steps": "So exportieren Sie Ihre Daten",
  "source.openPortal": "Portal öffnen",

  "wn.req.1": "Smart Meter von Wiener Netze und ein Konto im Smart Meter-Webportal",
  "wn.req.2":
    "Viertelstundenwerte aktiviert („Anlagen & Verträge“ → „Anlagedaten“ → Zähler bearbeiten → „Viertelstunden-Intervall“). Daten gibt es erst ab dem Tag nach der Aktivierung.",
  "wn.step.1": "Melden Sie sich im Smart Meter-Webportal an.",
  "wn.step.2": "Öffnen Sie „Verbrauchsdaten“ → „Datenexport“.",
  "wn.step.3":
    "Wählen Sie Ihren Zählpunkt, „Viertelstundenwerte“ und einen Zeitraum von 12 Monaten.",
  "wn.step.4": "Klicken Sie auf „Exportieren“ und laden Sie die CSV-Datei hier hoch.",

  "at.req.1": "Smart Meter mit aktivierten Viertelstundenwerten",
  "at.req.2": "Webportal Ihres Netzbetreibers mit Download im Österreich-Format (AT-Format)",
  "at.step.1": "Melden Sie sich im Webportal Ihres Netzbetreibers an.",
  "at.step.2": "Öffnen Sie die Ansicht der Energiewerte bzw. Verbrauchsdaten.",
  "at.step.3":
    "Wählen Sie die Granularität „Viertelstundenwerte“ (QH) und einen Zeitraum von 12 Monaten.",
  "at.step.4": "Laden Sie die Datei „…-AT-Format-…-QH.csv“ herunter und laden Sie sie hier hoch.",

  "ec.req.1": "Smart Meter mit aktivierten Viertelstundenwerten",
  "ec.req.2": "Lastprofil-Datei für den E-Control Tarifkalkulator (ein Jahr, Viertelstunden)",
  "ec.step.1":
    "Exportieren Sie im Portal Ihres Netzbetreibers das Lastprofil im Format für den E-Control Tarifkalkulator.",
  "ec.step.2": "Laden Sie die CSV-Datei hier hoch.",

  "upload.drop": "CSV-Datei hierher ziehen",
  "results.empty":
    "Noch keine Daten. Laden Sie in Schritt 2 Ihre CSV-Datei hoch. Dann sehen Sie hier Ihre Kosten.",
  "upload.or": "oder",
  "upload.choose": "Datei auswählen",
  "upload.hint": "Die Datei wird nur in Ihrem Browser gelesen und nicht hochgeladen.",
  "upload.loaded": "{rows} Viertelstundenwerte · {from} – {to} · {kwh} kWh",
  "upload.replace": "Andere Datei",
  "upload.reading": "Datei wird gelesen …",

  "error.empty": "Die Datei ist leer.",
  "error.header":
    "Das Dateiformat wird nicht erkannt. Prüfen Sie die gewählte Datenquelle und den Export.",
  "error.noData": "Die Datei enthält keine gültigen Messwerte.",
  "error.granularity":
    "Die Datei enthält keine Viertelstundenwerte (z. B. nur Tageswerte). Für die Leistungsspitze sind Viertelstundenwerte nötig.",
  "error.unknown": "Die Datei konnte nicht gelesen werden.",

  "settings.year": "Tarifjahr",
  "settings.yearHint.2026": "Aktueller Tarif: Arbeitspreis + Pauschale, kein Leistungspreis.",
  "settings.yearHint.new":
    "Neues Modell: Arbeitspreis + Leistungspreis je Monatsspitze (über 10 kW doppelter Preis).",
  "settings.estimate": "Schätzung",
  "settings.energyPrice": "Energiepreis Lieferant",
  "settings.energyPriceUnit": "ct/kWh netto",
  "settings.baseFee": "Grundgebühr Lieferant",
  "settings.baseFeeUnit": "€/Monat netto",
  "settings.gross": "Brutto",
  "settings.grossHint": "Inklusive 20 % Umsatzsteuer",
  "settings.net": "Netto",
  "settings.netHint": "Ohne Umsatzsteuer",
  "settings.display": "Anzeige",

  "kpi.today": "Jahreskosten mit heutigem Tarif",
  "kpi.todayDate": "Stand: {date} (Tarif {year})",
  "kpi.selected": "Jahreskosten mit Tarif {year}",
  "kpi.diff": "{sign}{amount} ({pct}) gegenüber heute",
  "kpi.same": "Entspricht dem heutigen Tarif",
  "kpi.grid": "davon Netzentgelte",
  "kpi.scaled": "Hochgerechnet auf 12 Monate (Daten für {months} Monate).",
  "kpi.maxPeak": "Höchste Monatsspitze",
  "kpi.avgPeak": "Ø Monatsspitze",
  "kpi.consumption": "Verbrauch / Jahr",

  "chart.monthly.title": "Verbrauch und Leistungsspitze pro Monat",
  "chart.monthly.desc":
    "Oben: Energie (kWh) je Monat. Unten: höchster Viertelstundenwert als Leistung (kW).",
  "chart.monthly.peakHidden": "Leistungsspitzen sind für den Tarif 2026 nicht kostenrelevant.",
  "chart.costs.title": "Kosten pro Monat",
  "chart.costs.desc": "Aufteilung der Kosten je Monat mit dem Tarif {year} ({mode}).",
  "chart.transitionNote":
    "Tarifjahr {year}: Die 10-kW-Grenze gilt erst ab Dezember. Jänner bis November gilt ein Preis je kW für die ganze Spitze, ohne Staffel und ohne Minimum (SNE-G-V § 6 Abs. 3a).",
  "chart.detail.title": "Viertelstundenwerte im Detail",
  "chart.detail.desc": "Leistung je Viertelstunde (kW). Die Linie zeigt die Monatsspitze.",
  "chart.detail.prev": "Vorheriger Monat",
  "chart.detail.next": "Nächster Monat",
  "chart.detail.peakAt": "Spitze {kw} am {date}",
  "chart.table": "Als Tabelle anzeigen",
  "chart.hideTable": "Tabelle ausblenden",

  "series.kwh": "Verbrauch",
  "series.peak": "Monatsspitze",
  "series.threshold": "10-kW-Schwelle",
  "series.energy": "Energie (Lieferant)",
  "series.gridEnergy": "Netz – Arbeitspreis & Verluste",
  "series.gridCapacity": "Netz – Leistungspreis/Pauschale & Messentgelt",
  "series.gridOther": "Messentgelt",
  "series.taxes": "Abgaben & Steuern",
  "series.power": "Leistung",
  "col.month": "Monat",
  "col.total": "Summe",
  incomplete: "unvollständig",

  "disclaimer.title": "Haftungsausschluss",
  "disclaimer.text":
    "Alle Werte sind grobe Schätzungen und können Fehler enthalten. Die Tarife ab 2027 sind Modellwerte der E-Control (Stand Juli 2026), keine offiziellen Preise von Wiener Netze. Es wird keine Haftung für die Richtigkeit, Vollständigkeit oder Aktualität übernommen. Maßgeblich ist allein Ihre Rechnung.",
  "assumptions.title": "Annahmen und Quellen",
  "assumptions.text":
    "Tarif 2026: Wiener Netze, Netzebene 7 (SNE-V 2018 idF 2026). Ab 2027: Struktur laut SNE-G-V (BGBl. II Nr. 299/2026); Preise laut E-Control-Modell (Anfangsstufe 2027, Endstufe ab 2029 laut E-Control), 2028 linear interpoliert. Monatsspitze = höchster Viertelstundenwert × 4 (Durchschnitt über 15 Minuten), auf 2 Nachkommastellen gerundet, mindestens 2 kW. Ab 2027 keine Pauschale und kein Messentgelt. Jänner–November 2027: ein Preis je kW, ohne 10-kW-Staffel und ohne Minimum (§ 6 Abs. 3a). Netzverlustentgelt, Sommer-Niedrigpreisfenster (−20 %, April–September 10–16 Uhr), Abgaben (Elektrizitätsabgabe, Erneuerbaren-Förderbeitrag und -pauschale, Gebrauchsabgabe Wien 7 %) und USt. 20 % wie 2026. Nicht berücksichtigt: Winter-Niedrigpreisfenster, flexible Netzanschlüsse, Einspeisung, späterer Start beim Netzbetreiber (bis 30. Juni 2028).",
  "assumptions.updated": "Tarifdaten Stand {date}",

  "calc.title": "So rechnen wir",
  "calc.link": "So rechnen wir: die Berechnung einfach erklärt",
  "faq.title": "FAQ",
  "faq.link": "FAQ: Details zum neuen Tarif",
  "faq.timelineLink": "Zeitleiste bis 2030",
  "open.link": "Offene Fragen und zuständige Stellen",
  "footer.madeBy": "Ein Projekt von",
  "footer.source": "Quellcode",
  "footer.calc": "So rechnen wir",
  "footer.faq": "FAQ",
  "footer.privacy": "Datenschutz",
  "footer.imprint": "Impressum",
  "footer.back": "Zurück zum Rechner",
  "footer.version": "Version {version}",

  "privacy.title": "Datenschutz",
  "privacy.intro":
    "Diese Website speichert keine personenbezogenen Daten. Wir verwenden keine Cookies.",
  "privacy.csv.title": "Ihre Messdaten",
  "privacy.csv.text":
    "Die CSV-Datei wird ausschließlich lokal in Ihrem Browser verarbeitet. Sie wird nicht an einen Server übertragen und nicht gespeichert. Nach dem Schließen oder Neuladen der Seite sind die Daten weg.",
  "privacy.analytics.title": "Anonyme Nutzungsstatistik",
  "privacy.analytics.text":
    "Für eine anonyme Nutzungsstatistik verwenden wir PostHog (PostHog Inc., Server in der EU, Frankfurt). PostHog läuft ohne Cookies und ohne Speicherung auf Ihrem Gerät; jeder Seitenaufruf wird als neuer, anonymer Besuch gezählt. Erfasst werden nur Seitenaufrufe und Bedienschritte (z. B. „Datei gelesen“, „Tarifjahr geändert“) mit groben Kennzahlen wie Anzahl der Monate. Keine Verbrauchswerte, keine Zählpunktnummern, keine Dateinamen. IP-Adressen werden nicht gespeichert.",
  "privacy.storage.title": "Lokale Einstellungen",
  "privacy.storage.text":
    "Ihre Wahl von Sprache und Farbschema wird im lokalen Speicher Ihres Browsers (localStorage) abgelegt, damit sie beim nächsten Besuch erhalten bleibt. Diese Daten verlassen Ihr Gerät nicht.",
  "privacy.hosting.title": "Hosting",
  "privacy.hosting.text":
    "Die Website wird über GitHub Pages (GitHub Inc.) ausgeliefert. Beim Aufruf verarbeitet GitHub technisch notwendige Verbindungsdaten (z. B. IP-Adresse) zur Auslieferung und Absicherung der Website.",
  "privacy.rights.title": "Ihre Rechte",
  "privacy.rights.text":
    "Da wir keine personenbezogenen Daten speichern, können wir Ihnen auch keine zuordnen. Bei Fragen erreichen Sie uns über die Kontaktdaten im Impressum. Sie haben das Recht auf Beschwerde bei der Österreichischen Datenschutzbehörde.",

  "imprint.title": "Impressum",
  "imprint.law": "Informationen gemäß § 5 ECG und § 25 MedienG",
  "imprint.owner": "Medieninhaber und Betreiber",
  "imprint.contact": "Kontakt",
  "imprint.purpose": "Blattlinie",
  "imprint.liability": "Haftung",
} as const;

export type MessageKey = keyof typeof de;
