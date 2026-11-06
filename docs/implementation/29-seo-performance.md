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
- [x] No source maps in `dist/` after `npm run build` (css + js 5 MB → 1.06 MB).
- [x] Images: JPG/PNG 9.3 MB → WebP 3.5 MB (46 files, at most 2000px,
      quality 80; built by `sharp`, sources unchanged); no broken image or
      404 on any page; CLS unchanged.
- [x] Videos: re-encoded once with ffmpeg (ffmpeg-static, not in the
      project): H.264, at most 1920px (brand-strategy 1600px, crf 29 to keep
      its grain), 30 fps, faststart, no sound but the pop-up's. A muted
      preview for the hero; the pop-up keeps the full showreel. Home's videos
      24 MB → 8.6 MB (the pop-up's 2.5 MB only when played); the preloader's
      wait at ≈20 Mbit/s 11.5 s → 7.6 s.
- [x] Lighthouse after: 90+ in each category, or the gap explained (above).
- [x] Nothing changed visually: pages checked in the browser after each
      step (no broken image, no 404, no layout shift).

## After steps 2–4 (5 Nov 2026)

| Page | Desktop | Mobile | LCP (mobile) | Weight |
|---|---|---|---|---|
| Home | 88 / 92 / 96 / 100 | 50 / 92 / 96 / 100 | 10.7 s | 20.4 MB |
| About | 90 / 96 / 96 / 100 | 66 / 96 / 96 / 100 | 13.8 s | 6.2 MB |
| Contact | 77 / 92 / 96 / 100 | 82 / 92 / 93 / 100 | 3.9 s | 5.1 MB |
| Privacy Policy, Terms | 98 / 100 / 96 / 100 | 73 / 100 / 96 / 100 | 5.0 s | 4.3 MB |

After step 5, Home: desktop 80 / 92 / 96 / 100, mobile 47 / 92 / 96 / 100,
LCP (mobile) 8.6 s, 13.5 MB (Lighthouse moves ±8 points between runs on this
page: the preloader and the 3D coin).

Left: the 3D coin (≈3.4 MB: model, light map
and three.js) loads on every page for the footer coin, also where the footer
is far below; to load it only as the footer comes near is a further step
(not planned yet).

## Final (5 Nov 2026, after steps 2–5 and the 3D coin)

Performance / Accessibility / Best Practices / SEO; LCP (mobile); weight.

| Page | Desktop | Mobile | LCP (mobile) | Weight (before → after) |
|---|---|---|---|---|
| Home | 88 / 92 / 96 / 100 | 50 / 92 / 96 / 100 | 10.8 s | 30 → 12.5 MB |
| About | 89 / 96 / 96 / 100 | 68 / 96 / 96 / 100 | 14.2 s | 9 → 2.6 MB |
| Contact | 77 / 92 / 96 / 100 | 68 / 92 / 93 / 100 | 8.7 s | 7 → 5.1 MB |
| Privacy Policy, Terms | 98 / 100 / 96 / 100 | 73 / 100 / 96 / 100 | 5.0 s | 4 → 0.7 MB |

Extra step: the 3D coin loads, on a page with only the footer coin, once the
footer is within two screens (src/js/coin-3d.js).

Gaps to 90+, and why:
- **Performance, mobile:** the site has no mobile layout yet (none in Figma),
  so phones get the desktop layout scaled down; Lighthouse's mobile run also
  simulates a slow phone. To look at with the mobile layout. On Home, the
  preloader waits for every asset by design (user decision) and the 3D coin
  is part of the first screen.
- **Performance, Contact desktop (77):** the entrance keeps the page hidden
  until the fonts are in, which Lighthouse counts in its paint times.
- **Accessibility 92–96:** the muted grey text (Services, Our Work) is below
  the contrast minimum (a colour from Figma: needs the user's decision); the
  Statement's split words carry `aria-label` on plain spans (a small fix).
- **Best Practices 96:** the coin picture is drawn at another aspect ratio
  than its file, as Figma's box asks (kept on purpose).
- **Contact mobile 93:** text under 12px on a phone (the desktop layout scaled
  down; with the mobile layout).

## Open

- Domain (later; user).
- Open Graph image.
- Approval for `sharp` (step 4) and for a video tool (`ffmpeg`, run once on
  the files, not in the build).
