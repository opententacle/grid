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

| | 2026 | 2027 | 2028 | 2029 | 2030 |
|---|---|---|---|---|---|
| Netznutzung ct/kWh | 6.98 | 7.36 | 5.95 | 4.53 | 4.53 |
| Pauschale €/year | 54 | – | – | – | – |
| Capacity ≤ 10 kW €/kW/year | – | 19.00 | 26.41 | 33.82 | 33.82 |
| Capacity > 10 kW €/kW/year | – | 38.00 | 52.82 | 67.64 | 67.64 |

2026: Wiener Netze, Netzebene 7. 2027 and 2029: E-Control model (start and final stage, July 2026; final stage from 1 January 2029 as announced by E-Control). 2028: linear interpolation. 2030: final stage. From 2027 no Pauschale and no Messentgelt; January–November 2027 one price per kW without threshold and minimum (SNE-G-V § 6 Abs. 3a). Details and all other components: `src/core/tariffs.ts` and `.claude/specs/01-requirements.md`.
