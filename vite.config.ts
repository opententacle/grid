import { defineConfig } from "vitest/config";

export default defineConfig({
  base: "/",
  build: {
    target: "es2022",
    sourcemap: true,
    rollupOptions: {
      input: {
        main: "index.html",
        datenschutz: "datenschutz.html",
        impressum: "impressum.html",
        berechnung: "berechnung.html",
      },
    },
  },
  test: {
    include: ["src/**/*.test.ts"],
    environment: "happy-dom",
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts", "src/core/test-utils.ts", "src/ui/test-helpers.ts"],
      reporter: ["text-summary", "lcov"],
      reportsDirectory: "coverage",
      // Quality gate: same 80 % target as Codecov (.github/codecov.yml)
      thresholds: { statements: 80, branches: 80, functions: 80, lines: 80 },
    },
  },
});
