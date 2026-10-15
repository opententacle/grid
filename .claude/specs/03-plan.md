# Implementation plan

1. Scaffold: `package.json`, Vite, TS config, Biome config, `.gitignore` (excludes `exports/`, `dist/`, `node_modules/`), `index.html`, `public/CNAME`, favicon.
2. Core logic with tests (test first where practical):
   - `parse-wienernetze.ts` + tests (BOM, decimal comma, DST rows, empty values, bad header).
   - `analyze.ts` + tests (sums, peak × 4, SNAP window, incomplete month).
   - `tariffs.ts` (data + sources) + `cost.ts` + tests (flat fee vs capacity, threshold 10 kW, min 2 kW, annualization, net/gross).
3. i18n (de/en), theme, analytics wrapper, config (author, impressum).
4. UI components: app shell, header, operator step, upload, settings, KPIs, three charts, footer with disclaimer, impressum and privacy dialogs.
5. GitHub workflows `ci.yml`, `release.yml`. `README.md` with setup, DNS, release steps, how to update tariffs.
6. Verify: `npm run lint`, `npm test`, `npm run build`. Run dev server, load the sample CSV, check both themes, both languages, phone width.
