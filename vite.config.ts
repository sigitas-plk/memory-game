/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        sw: path.resolve(__dirname, "src/service-worker.ts"),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          // Output the service worker as sw.js at the root of the dist folder
          if (chunkInfo.name === "sw") return "sw.js";
          // Default naming for other entry points
          return "assets/[name].[hash].js";
        },
      },
    },
  },
  base: "./",
  test: {
    // Use happy-dom for all tests (provides DOM, Shadow DOM, custom elements, etc.)
    environment: "happy-dom",
    // Global setup/teardown can be added later if needed
    globals: true,
    // Clear mocks between tests to avoid cross‑test contamination
    clearMocks: true,
    // Enable watch mode by default for local development
    watch: false,
  },
});
