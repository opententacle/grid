# Tech design

## Stack

| Concern | Choice | Reason |
|---|---|---|
| Build | Vite 8 | Static output, fast dev server |
| Language | TypeScript (no decorators) | Type safety; static `properties` avoids decorator config |
| UI | Lit 3 web components | Small, standard, no framework runtime |
| Charts | `d3-scale`, `d3-selection`, `d3-axis`, `d3-shape`, `d3-array` | Only the modules we use; no wrapper library |
| Icons | `@fortawesome/fontawesome-svg-core` + free solid/brands | Tree-shaken SVG icons |
| Analytics | `posthog-js` | Owner requirement |
| Lint/format | Biome 2 | One tool |
| Test | Vitest | Same config as Vite |

No CSS framework. Design tokens as CSS custom properties. System font stack (no external font requests).

## Structure

```
index.html
datenschutz.html                 privacy page (static, DE + EN)
impressum.html                   imprint page (filled from config at build/run time)
public/CNAME                     grid.opententacle.com
public/favicon.svg
src/
  main.ts                        bootstrap: theme, i18n, analytics, <gc-app>
  config.ts                      author, links, impressum data (owner fills in)
  styles/tokens.css              colors light/dark, spacing, typography
  core/
    types.ts                     Reading, MonthStats, Tariff, CostBreakdown
    parse-wienernetze.ts         Wiener Netze CSV → Reading[] (exact)
    parse-generic.ts             auto-detect CSV (AT-Format, E-Control) → Reading[]
    analyze.ts                   Reading[] → MonthStats[]
    tariffs.ts                   tariff data per operator and year (with sources)
    cost.ts                      MonthStats × Tariff × EnergyPrice → CostBreakdown
    format.ts                    number/currency/date formatting per locale
  sources.ts                     registry: data source id, parser, instruction i18n keys, portal link
  i18n/
    i18n.ts                      tiny store: locale, t(key), subscribe
    de.ts, en.ts                 message maps
  analytics.ts                   PostHog wrapper (no-op without key)
  ui/
    gc-app.ts                    page layout, state owner
    gc-header.ts                 title, language switch, theme toggle
    gc-operator-step.ts          dropdown + instructions
    gc-upload.ts                 file input + drag-and-drop
    gc-settings.ts               year slider, energy price, net/gross
    gc-kpis.ts                   value A (today) / value B (selected year)
    gc-chart-monthly.ts          chart 1
    gc-chart-costs.ts            chart 2
    gc-chart-detail.ts           chart 3
    gc-footer.ts                 disclaimer, author, links, impressum, privacy
    icons.ts                     FA icon → Lit SVG template helper
    shared-styles.ts             card, button, form styles
tests/ (co-located *.test.ts in src/core)
```

## Data model

```ts
interface Reading { t: number /* epoch ms, local start */; kwh: number }
interface MonthStats {
  key: string            // "2025-06"
  year: number; month: number // 1..12
  kwh: number; snapKwh: number
  peakKw: number; peakAt: number
  readings: number; expectedReadings: number
  start: number; end: number   // index range into readings array
}
interface Tariff {
  year: number; estimate: boolean
  energyCt: number            // Netznutzung ct/kWh
  lossCt: number              // Netzverlust ct/kWh
  flatFeeYear: number         // Pauschale €/year (0 from 2027)
  capacity?: { lowEurKwYear: number; highEurKwYear: number; thresholdKw: number; minKw: number }
  meterEurMonth: number
  snapReduction: number       // 0.2
  levies: { electricityTaxCt: number; eagContributionCt: number; eagFlatYear: number; usageTaxRate: number; vatRate: number }
  sources: string[]
}
interface CostBreakdown { energy; gridEnergy; gridCapacity; gridOther; levies; usageTax; vat; net; gross }
```

## Parsing

- Strip BOM. Split lines. Skip header and empty lines.
- Date `DD.MM.YYYY` + `Zeit von` `HH:MM:SS` → local timestamp (`new Date(y, m-1, d, h, min)`). Duplicate DST hour gives equal timestamps; this is fine for sums and peaks. Chart 3 uses the row index for the x position in the month, so no gap or overlap.
- Value: replace `,` with `.`, `Number()`. Skip empty or NaN.
- Header check: column 4 must contain `[kWh]`. Otherwise throw `ParseError` with i18n key.

## Generic parser (auto-detect)

- Detect separator from the header line (`;`, tab, `,`).
- Find a date-time column: `DD.MM.YYYY[ HH:MM[:SS]]` or ISO `YYYY-MM-DD[THH:MM[:SS]]`. If the time is in a separate column, use the first time-like column after the date (interval start).
- Value column: header that contains `kWh` (prefer "Verbrauch"/"1.8.0"/"Energiewert"), else the first column with numbers in most rows. Decimal comma or point. `-` and empty are missing values.
- If the median step between rows is not 15 min, throw `ParseError("granularity")`.

## Calculation

Per month m and tariff T:
- `gridEnergy = kWh × energyCt/100 − snapKwh × energyCt/100 × snapReduction + kWh × lossCt/100`
- `gridCapacity = T.capacity ? (min(p,thr)×low + max(p−thr,0)×high)/12 with p = max(peak, minKw) : flatFeeYear/12`
- `gridOther = meterEurMonth`
- `energy = kWh × energyPriceCt/100 + baseFeeMonth`
- `levies = kWh × (electricityTaxCt + eagContributionCt)/100 + eagFlatYear/12`
- `usageTax = (energy + gridEnergy + gridCapacity + gridOther) × usageTaxRate`
- `vat = (all above) × vatRate`
- Year total = sum over months × (365 / covered days) when data covers less or more than one year. Only the last 12 full months are used when more data is present.

"Today" tariff = tariff whose year equals the current date year (fallback: latest year ≤ today).

## State and flow

`gc-app` owns state: `operatorId, readings, months, year, energyPriceCt, baseFeeMonth, gross, detailMonthIndex`. Child components get properties and send `CustomEvent`s. No global store besides i18n and theme.

## Charts

- One shared pattern: a Lit component with a `<svg>` in shadow DOM. `updated()` calls a d3 render function. A `ResizeObserver` sets the width.
- Colors from CSS custom properties (read with `getComputedStyle`), so dark mode works.
- Tooltips: an absolutely positioned `div` in the component.
- Chart 3 draws up to ~3,000 points as one `path` (area + line), not as single elements.

## i18n

- `i18n.ts` holds `locale` and a listener set. Components call `t("key", params)` and subscribe in `connectedCallback` to request an update.
- `Intl.NumberFormat` / `Intl.DateTimeFormat` with `de-AT` or `en-GB`.
- `<html lang>` updates on change.

## Theme

- `data-theme="light|dark"` on `<html>`. Initial value from `localStorage`, else `prefers-color-scheme`. Inline script in `index.html` sets it before paint (no flash).

## Analytics

- `initAnalytics()` reads `import.meta.env.VITE_POSTHOG_KEY` and `VITE_POSTHOG_HOST` (default `https://eu.i.posthog.com`).
- Options: `persistence: "memory"`, `autocapture: false`, `disable_session_recording: true`, `capture_pageview: true`, `ip: false` equivalent via project settings (documented).
- `track(event, props)` is a no-op when not initialized. Dynamic import, so PostHog is not in the main chunk when the key is absent.

## CI/CD

- `ci.yml`: `on: [push, pull_request, workflow_call]`. Node 24, `npm ci`, `npm run lint`, `npm test`, `npm run build`, upload `dist` artifact (only on `workflow_call`, used by release).
- `release.yml`: `on: release: types: [published]`. Job `check-tag` (regex `^[0-9]+\.[0-9]+\.[0-9]+$`), job `ci` (`uses: ./.github/workflows/ci.yml`, `secrets: inherit`), job `deploy` (needs both; `actions/configure-pages`, build with `VITE_POSTHOG_KEY` from `vars`, `VITE_APP_VERSION` from tag, `upload-pages-artifact`, `deploy-pages`).
- Custom domain through `public/CNAME`. Owner sets DNS `CNAME grid-calc → <user>.github.io` and Pages source "GitHub Actions".

## Security / privacy

- No `innerHTML` with user data. File content is never rendered as HTML.
- Content-Security-Policy meta tag allowing self + PostHog EU host.
