# Netzkosten-Rechner (grid-calc)

Web app that estimates Austrian electricity grid costs (Netzentgelte) from smart meter quarter-hour data:

- with the tariff that is valid today (2026: energy price + flat fee), and
- with the new capacity-based tariff from 2027 (SNE-G-V: monthly peak, double price above 10 kW), phased until 2030.

Live: <https://grid.opententacle.com>

All data processing happens in the browser. No backend.

> **Disclaimer:** All values are rough estimates and can contain mistakes. Tariffs from 2027 are E-Control model values, not official prices. No liability.

## Stack

Vite · TypeScript · Lit · d3 (modules) · Font Awesome · Biome · Vitest · PostHog (cookieless, optional)

## Development

```bash
npm ci
npm run dev        # http://localhost:5173
npm run lint       # biome check
npm run format     # biome check --write
npm test           # vitest
npm run build      # type-check + production build to dist/
```

Put real exports in `exports/` for local tests. The folder is in `.gitignore`, because exports contain personal data (address, Zählpunkt).

## Project structure

| Path | Content |
|---|---|
| `src/core/` | CSV parsers, monthly analysis, tariffs, cost calculation (with unit tests) |
| `src/core/tariffs.ts` | **All tariff values with sources.** Update this file when new prices are published. |
| `src/sources.ts` | Data sources (export formats) for the dropdown |
| `src/i18n/` | German and English texts |
| `src/ui/` | Lit components and d3 charts |
| `src/config.ts` | Author links and Impressum data |
| `.claude/specs/` | Requirements, tech design, plan |

## Configuration

| Variable | Where | Purpose |
|---|---|---|
| `VITE_POSTHOG_KEY` | GitHub repository **variable** `POSTHOG_KEY` | PostHog project key. Empty = analytics off. |
| `VITE_POSTHOG_HOST` | GitHub repository variable `POSTHOG_HOST` (optional) | Default `https://eu.i.posthog.com` |
| `VITE_APP_VERSION` | set by the release workflow | Version in the footer |

In the PostHog project settings, enable **"Discard client IP data"** so that the privacy page statement stays correct.

Before the first release, fill in `src/config.ts` (Impressum, LinkedIn URL).

## Release and hosting

1. GitHub → Settings → Pages → Source: **GitHub Actions**. Custom domain: `grid.opententacle.com` (also in `public/CNAME`). Enable "Enforce HTTPS".
2. DNS: `CNAME grid → opententacle.github.io`.
3. Create a GitHub release with a tag like `1.0.0` (no `v` prefix). `release.yml` checks the tag, runs the full CI (`ci.yml`: install → lint → test → build) and deploys `dist/` to GitHub Pages.

## Tariff model (summary)

| | 2026 | 2027 | 2028 | 2029 | 2030 |
|---|---|---|---|---|---|
| Netznutzung ct/kWh | 6.98 | 7.36 | 6.42 | 5.47 | 4.53 |
| Pauschale €/year | 54 | – | – | – | – |
| Capacity ≤ 10 kW €/kW/year | – | 19.00 | 23.94 | 28.88 | 33.82 |
| Capacity > 10 kW €/kW/year | – | 38.00 | 47.88 | 57.76 | 67.64 |

2026: Wiener Netze, Netzebene 7. 2027 and 2030: E-Control model (start and final stage, July 2026). 2028/2029: linear interpolation. Details and all other components: `src/core/tariffs.ts` and `.claude/specs/01-requirements.md`.
