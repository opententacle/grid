# Netzkosten-Rechner (grid)

[![Build](https://github.com/opententacle/grid/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/opententacle/grid/actions/workflows/ci.yml)
[![Release](https://github.com/opententacle/grid/actions/workflows/release.yml/badge.svg)](https://github.com/opententacle/grid/actions/workflows/release.yml)
[![Latest release](https://img.shields.io/github/v/release/opententacle/grid?label=release&sort=semver)](https://github.com/opententacle/grid/releases/latest)
[![Coverage](https://codecov.io/gh/opententacle/grid/graph/badge.svg)](https://codecov.io/gh/opententacle/grid)
[![Quality gate (coverage ≥ 80 %)](https://img.shields.io/github/checks-status/opententacle/grid/main?label=quality%20gate%20%E2%89%A5%2080%25)](https://app.codecov.io/gh/opententacle/grid)

Web app that estimates Austrian electricity grid costs (Netzentgelte) from smart meter quarter-hour data:

- with the tariff that is valid today (2026: energy price + flat fee), and
- with the new capacity-based tariff from 2027 (SNE-G-V: monthly peak, double price above 10 kW), phased until the final stage in 2029.

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
npm run coverage   # vitest with coverage (coverage/lcov.info)
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
| `src/seo.ts` | Static HTML and schema.org data for search engines, added to the pages at build time |
| `.claude/specs/` | Requirements, tech design, plan |

## Configuration

| Variable | Where | Purpose |
|---|---|---|
| `VITE_POSTHOG_KEY` | GitHub repository **variable** `POSTHOG_KEY` | PostHog project key. Empty = analytics off. |
| `VITE_POSTHOG_HOST` | GitHub repository variable `POSTHOG_HOST` (optional) | Default `https://eu.i.posthog.com` |
| `VITE_APP_VERSION` | set by the release workflow | Version in the footer |

**Quality gate:** test coverage must be at least 80 % (statements, branches, functions, lines). CI fails below that (`thresholds` in `vite.config.ts`), and Codecov reports the `codecov/project` status with the same 80 % target. The "quality gate" badge shows the combined check status of `main` (CI + Codecov).

Coverage is uploaded to [Codecov](https://codecov.io/gh/opententacle/grid) after every CI build with OIDC, so no `CODECOV_TOKEN` secret is necessary. The repository must be activated in Codecov (Codecov GitHub app installed for the `opententacle` organization). Configuration: `.github/codecov.yml`.

In the PostHog project settings, enable **"Discard client IP data"** so that the privacy page statement stays correct.

Before the first release, fill in `src/config.ts` (Impressum, LinkedIn URL).

## Release and hosting

1. GitHub → Settings → Pages → Source: **GitHub Actions**. Custom domain: `grid.opententacle.com` (also in `public/CNAME`). Enable "Enforce HTTPS".
2. DNS: `CNAME grid → opententacle.github.io`.
3. Create a GitHub release with a tag like `1.0.0` (no `v` prefix). `release.yml` checks the tag, runs the full CI (`ci.yml`: install → lint → test → build) and deploys `dist/` to GitHub Pages.

## Tariff model (summary)

Wiener Netze, Netzebene 7, not measured, net. Other grid areas: `src/core/tariffs.ts`.

| | 2026 | Jan–Nov 2027 | Dec 2027 | 2028 | 2029 | 2030 |
|---|---|---|---|---|---|---|
| Netznutzung ct/kWh | 6.98 | 6.49 | 5.47 | 4.84 | 4.20 | 4.20 |
| Pauschale €/year | 54 | 82.80 | – | – | – | – |
| Messentgelt €/month | 2.18 | – | – | – | – | – |
| Capacity ≤ 10 kW €/kW/year | – | – | 29.52 | 30.45 | 31.38 | 31.38 |
| Capacity > 10 kW €/kW/year | – | – | 44.28 | 45.68 | 47.07 | 47.07 |

- 2026: SNE-V 2018 idF BGBl. II Nr. 305/2025.
- 2027: draft SNE-T-V 2027 (29.10.2026, not final). The draft text is not online. Values per grid area are calculated from the E-Control tables (3,500 kWh, old and new structure) and the E-Control comparison charts. Wien: capacity price 246 / 369 ct/kW per month as in the draft. Above 10 kW: 1.5 × the price up to 10 kW.
- Transition (SNE-G-V § 6 Abs. 3a, § 7 Abs. 4a): January to November 2027 flat fee and separate energy price, capacity price from 1 December 2027 in all grid areas. Each grid area can move this date until 30 June 2028 (not modelled).
- 2029: final stage, same change as the E-Control model (14.07.2026). 2028: midpoint. 2030: same as 2029.

Details: `src/core/tariffs.ts` and `.claude/specs/01-requirements.md`.
