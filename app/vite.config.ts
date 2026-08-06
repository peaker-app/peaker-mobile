import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { moduleAliases } from "./aliases.ts";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: moduleAliases,
  },
  build: {
    rollupOptions: {
      onwarn: (warning, warn) => {
        if (warning.code === "MODULE_LEVEL_DIRECTIVE") {
          return;
        }

        warn(warning);
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
});
