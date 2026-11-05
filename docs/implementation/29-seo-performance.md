# 29 — SEO and performance

Rules: AGENTS.md §15. This plan brings the existing pages (Home, About,
Contact, Privacy Policy, Terms of Service) up to them.

## Decisions

- **Domain:** not known yet (the site is in progress; user). The site URL is
  set in one place (a Pug variable in the layout); canonical, Open Graph URLs
  and the sitemap use it. Until it is set they are left out, not filled with a
  guess. When the domain is known: set the variable, build, done.
- **Meta descriptions:** drafted from each page's own text, for the user to
  check.
- **Open Graph image:** to decide (from the logo, or a frame from Figma).

## Current state (checked 5 Nov 2026)

- SEO: `lang`, a `<title>` per page, one `h1`, `alt` on all 65 images.
  Missing: meta description, Open Graph / Twitter Card, canonical, favicon,
  `robots.txt`, `sitemap.xml`, structured data.
- Performance: JS minified (esbuild), the 3D coin loaded on its own, fonts
  WOFF2 with `swap`. To do: 33 MB of JPG/PNG with no WebP/AVIF or `srcset`
  (some over 1 MB); 24 MB of video, which the preloader now waits for;
  source maps (≈4 MB) shipped; first-screen fonts not preloaded.

## Baseline (5 Nov 2026, Lighthouse 12.2.1, local build)

Performance / Accessibility / Best Practices / SEO; LCP; page weight. Served
locally without compression (Vercel compresses text), so text weight counts
higher here than live.

| Page | Desktop | Mobile | LCP (mobile) | Weight |
|---|---|---|---|---|
| Home | 55 / 92 / 93 / 91 | 35 / 92 / 93 / 91 | 16.2 s | 30 MB |
| About | 81 / 96 / 93 / 91 | 62 / 96 / 93 / 91 | 12.9 s | 9 MB |
| Contact | 75 / 92 / 93 / 91 | 61 / 92 / 89 / 91 | 14.0 s | 7 MB |
| Privacy Policy | 97 / 100 / 93 / 91 | 66 / 100 / 93 / 91 | 6.1 s | 4 MB |
| Terms of Service | 97 / 100 / 93 / 91 | 66 / 100 / 93 / 91 | 6.1 s | 4 MB |

Found:
- Performance (Home, mobile): off-screen images (≈6.1 s), image sizes
  (≈6.0 s), image formats (≈6.0 s), text compression (≈1.6 s, local only),
  unused JS (≈0.6 s). CLS ≈ 0 everywhere.
- SEO: no meta description (every page).
- Best Practices: a 404 in the console (the favicon); `coin.png` drawn at
  another aspect ratio than its file; on mobile, text under 12px (Contact).
- Accessibility: `aria-label` on plain spans (the Statement's ink split);
  colour contrast of the muted text (Services, Our Work).

## Steps (in order, each its own commit)

1. **Baseline.** Lighthouse on each page (desktop and mobile); scores in this
   plan.
2. **SEO basics.**
   - Layout: `block description`, Open Graph / Twitter Card tags, canonical
     (once the domain is set), favicon (from the logo), theme colour.
   - A meta description per page (drafts for the user).
   - `robots.txt`; `sitemap.xml` built from the pages (once the domain is
     set).
   - JSON-LD Organization (name, logo, email, address, social links from the
     footer).
3. **Build.** No source maps in the production build (kept for `gulp`
   development); preload the first-screen fonts.
4. **Images.** A build step (sharp, already common with Gulp; to approve as a
   dependency) that writes WebP (and AVIF if worth it) at 1×/2× widths;
   `<picture>` / `srcset` in a Pug mixin; `width` / `height` everywhere;
   `loading="lazy"` below the first screen (the preloader keeps loading the
   homepage's own).
5. **Videos.** Re-encode (H.264, lower bitrate, 1080p at most); a light
   preview for the Services and hero loops; posters as WebP.
6. **Check again.** Lighthouse on each page; scores and remaining gaps here.

## Checks

- [x] Baseline scores recorded.
- [x] SEO basics on every page; descriptions approved by the user (SEO 100,
      Best Practices 96 on every page, desktop).
- [ ] No source maps in `dist/` after `npm run build`.
- [ ] Images: total weight and largest file before / after; no layout shift.
- [ ] Videos: weight before / after; the preloader's wait on an ordinary
      connection before / after.
- [ ] Lighthouse after: 90+ in each category, or the gap explained.
- [ ] Nothing changed visually (screenshots before / after).

## Open

- Domain (later; user).
- Open Graph image.
- Approval for `sharp` (step 4) and for a video tool (`ffmpeg`, run once on
  the files, not in the build).
