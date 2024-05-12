import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  test: {
    exclude: ["node_modules", "tests"],
    environment: "jsdom",
  },
});
