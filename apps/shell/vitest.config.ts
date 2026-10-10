import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@marketscope/ui": path.resolve(__dirname, "../../packages/ui/src/index.ts"),
      "@marketscope/types": path.resolve(__dirname, "../../packages/types/src/index.ts"),
    },
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.tsx"],
  },
});
