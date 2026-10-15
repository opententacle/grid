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
    environment: "node",
  },
});
