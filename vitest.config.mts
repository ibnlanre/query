import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    exclude: ["node_modules", "tests"],
    environment: "jsdom",
    globals: true,
  },
});
