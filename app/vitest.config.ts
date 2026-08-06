import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import { moduleAliases } from "./aliases.ts";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: moduleAliases,
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.test.{ts,tsx}",
        "src/test/**",
        "src/types/**",
        "src/shims/**",
        "src/components/ui/**",
        "src/app/dev/**",
        "src/main.tsx",
        "src/vite-env.d.ts",
      ],
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
    },
  },
});
