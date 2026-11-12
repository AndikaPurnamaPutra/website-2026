// Astro (docs/implementation/41-cms-migration.md, AGENTS.md §3): static
// HTML pages, no UI framework, no ClientRouter (page transitions are Barba's,
// src/js/page-transition.js).
import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  outDir: "dist",
  build: {
    // about.html, not about/index.html: links and Barba use .html.
    format: "file",
    // One stylesheet, not inlined into the page.
    inlineStylesheets: "never",
  },
  // Production: no source maps (AGENTS.md §15).
  vite: {
    build: { sourcemap: false },
  },
});
