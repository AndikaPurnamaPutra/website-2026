// Astro (docs/implementation/41-cms-migration.md, AGENTS.md §3): static
// HTML pages, no UI framework, no ClientRouter (page transitions are Barba's,
// src/js/page-transition.js).
import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  outDir: "dist",
  // Keep the markup's whitespace as written: Astro would collapse runs of
  // spaces (the "©2026  /  One Week Wonders Studio" lines are white-space:
  // pre) and the gaps between inline elements, which Pug kept.
  compressHTML: false,
  // The dev server on every address of this machine, as BrowserSync was:
  // localhost, 127.0.0.1, and the network address for checking on a phone
  // (shown as "Network" when it starts).
  server: { host: true },
  build: {
    // dist/about.html, not about/index.html: Vercel serves it at /about
    // (vercel.json cleanUrls; /about.html redirects there), and links use
    // /about. No trailing slash: at /about/ the pages' relative asset paths
    // (assets/…) would point into /about/assets/.
    format: "file",
    // One stylesheet, not inlined into the page.
    inlineStylesheets: "never",
  },
  vite: {
    // The CSS is compressed by Sass itself, as Gulp did, and left as it is:
    // Vite's own minifier rewrote it (rounded numbers, merged rules), which
    // moved lines of text by a pixel on wide screens (pixel check, 12 Nov
    // 2026). Production: no source maps (AGENTS.md §15).
    css: { preprocessorOptions: { scss: { style: "compressed" } } },
    build: { sourcemap: false, cssMinify: false },
  },
});
