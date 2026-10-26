# Design System — OWW Website

Source: Figma `WEBSITE-2026` (`plgHei2CRPFohXrt3OLhGk`), page **Phase - 4**, frame **Homepage** `1523:3214` (desktop 1440px).
Code: `src/scss/base/_tokens.scss`, `_typography.scss`, `_fonts.scss`, `_reset.scss`. Visual check: `dist/styleguide.html`.

Legend: **[T]** read from Figma layers · **[D]** derived from positions/sizes · **[U]** provided by the user from Figma.

The Figma file has no variables, no local styles, and no linked libraries. All values below were collected from the layers themselves.

## Scaling
All sizes in this document are **Figma pixels** at the 1440px frame. In code they scale with the viewport:

- `--px` (in `_tokens.scss`) = one Figma pixel: `clamp(1280px/1440, 100vw/1440, 2560px/1440)`.
  - 1440px viewport → 1×, exactly as in Figma.
  - 2560px and wider → 1.778× (capped; covers 2K at 100% and 4K at 150% display scaling). Content is 2560px wide and centered; section backgrounds stay full width.
  - 1280px and narrower → 0.889× (floor). Below 1280px the layout flexes to the viewport until tablet/mobile designs exist.
- Write sizes with `fluid(<figma px>)` from `src/scss/abstracts/_functions.scss`, e.g. `font-size: fluid(80)`. Tokens already include it.
- Not scaled: 1px borders, unitless line-heights (follow font-size), `em` letter-spacing (follows font-size), `--radius-pill`.
- JS uses the same clamp from `src/js/design-px.js` (`designPx()`); keep both in sync.
- Decision: user, 23 Oct 2026 (Option B, cap 1920px, floor 1280px); cap raised to 2560px on 27 Oct 2026. Plan: `docs/implementation/03-fluid-scale.md`.

## Fonts
| Family | Weights | Role | Source |
|---|---|---|---|
| General Sans | 400, 500 | Headings, display, footer links | Fontshare, self-hosted `.woff2` [T] |
| Inter | 400, 500 | Body, labels, nav, buttons | rsms/inter v4.1, self-hosted `.woff2` [T] |

## Colors
| Token | Value | Use | |
|---|---|---|---|
| `--color-ink` | `#111111` | Primary text, dark surfaces, buttons | [T] |
| `--color-ink-2` | `#1f1f1f` | End of dark CTA gradient | [T] |
| `--color-white` | `#ffffff` | Light surfaces, text on dark | [T] |
| `--color-surface-muted` | `#f6f6f6` | Clients section background | [T] |
| `--color-surface-soft` | `#eeeeee` | Social icon tiles | [T] |
| `--color-divider` | `#e7e7e7` | Dividers on light | [T] |
| `--color-border` | `#ededed` | Testimonial card border | [T] |
| `--color-border-row` | `#f0f0f0` | Milestone row border | [T] |
| `--color-border-strong` | `#d9d9d9` | Time pill border | [T] |
| `--color-border-dark` | `#3d3d3d` | Tag border on dark | [T] |
| `--color-link` | `#3e78ff` | Inline link in testimonial | [T] |
| `--color-glass` | `rgba(255,255,255,.04)` | Glass cards (with `--blur-glass`) | [T] |
| `--color-glass-button` | `rgba(255,255,255,.1)` | Showreel button | [T] |
| `--color-divider-dark` | `rgba(255,255,255,.1)` | Dividers on dark (0.5px) | [T] |

- Muted text uses `opacity: .5` (`.text-muted`), not a grey color. Exception: Milestone paragraph uses `rgba(0,0,0,.4)`. [T]
- Brand gradient: `--gradient-brand-stops` = `#0B1550` 18.9% → `#496AF8` 52.4% → `#81C4FB` 80.9% (revised to blue in Figma `1574:796`, 26 Oct 2026; was blue → yellow → red). Used by the hero accent, the Statement decorative icon and "$139M+". The angle differs per element (≈185–207deg), so it is set where used. `.text-gradient` reads `--gradient-angle` (default 201deg). [T]
- Motto "believers." (on dark): Figma still shows the old `#457BF9` → `#FFDC7B` → `#FD1D1D`, but the user decided (26 Oct 2026) to use the latest blue gradient there too. `--gradient-brand-stops-dark` will be switched to the blue stops when the Motto section is built. [U]

## Typography
Letter-spacing is in `em`: -0.02em in most places, -0.03em for 42px and larger.

| Class | Font | Size / line-height / tracking | Example | |
|---|---|---|---|---|
| `.text-display-80` | General Sans 400 | 80 / 1.1 / -0.03em | Hero headline (live text) | [U] |
| `.text-display-48` | General Sans 400 | 48 / 1.1 / -0.03em | Milestone numbers | [T] |
| `.text-heading-42` | General Sans 400 | 42 / 57px (Figma "normal") / -0.03em | Section titles | [T] |
| `.text-heading-28` | General Sans 400 | 28 / 1 / -0.02em | "Recently Added", card titles | [T] |
| `.text-title-22` | General Sans 400 | 22 / 1 / -0.02em | Stacked service card | [T] |
| `.text-title-20` | General Sans 400 | 20 / normal / -0.02em | Footer links and tagline | [T] |
| `.text-20` | Inter 500 | 20 / 1.4 / -0.02em | Milestone paragraph | [T] |
| `.text-18` | Inter 500 | 18 / normal / -0.02em | Button labels | [T] |
| `.text-16` | Inter 500 | 16 / 1 / -0.02em | Eyebrows "( Our Work )", filters | [T] |
| `.text-14` | Inter 400 | 14 / 1.5 / -0.02em | Body, tags, footer meta | [T] |
| `.text-13` | Inter 500 | 13 / 1 / -0.02em | Project captions | [T] |
| `.text-12` | Inter 400 | 12 / 1.4 / -0.02em | Testimonial name/role | [T] |

Modifiers: `.text-regular`, `.text-medium`, `.text-muted`, `.text-gradient`.

**Figma "normal" line-height vs browsers:** Figma renders "normal" slightly taller than browsers do (General Sans 42px: 57px vs 56px; Inter 18px: 22px vs 21px). Where Figma uses "normal", write Figma's measured text-box height explicitly (`.text-heading-42`, `.cta__label`/`.button`).

Variants handled at section level (same size, different line-height or tracking in Figma):
- Statement "We specialize…": 42 / 1.6 / -0.04em
- Motto "Design to advocates…": 42 / 1.1
- Eyebrow on dark sections: 16 / 1.7
- 14px text: line-height 1.4 (quote), 1.6 (hero description), 1.7 (date/time), normal (nav)
- `.text-14` defaults to 1.5 (one of the observed values) and weight 400. Nav and hero copy add `.text-medium`.

## Spacing and layout
- Spacing tokens: `--space-4 / 8 / 16 / 20 / 24 / 32 / 40 / 60 / 80` [T]. One-off values (11, 22, 45, 110, 254) stay in section styles.
- Page gutter `40px`, container `1360px` [T]. Narrow containers `1050px` (Statement, CTA) and `1130px` (Clients) [T]. All scale with `--px`.
- Section vertical padding: 180 / 200 / 220px (set per section) [T].
- Grid: **12 columns, 20px gutter**, inside the 1360px container (column ≈95px) [D]. Not read from Figma layout grids.

## Radius, borders, effects
- `--radius-sm` 4px (default for images, buttons, tags, cards), `--radius-md` 8px (CTA outer frame), `--radius-pill` 1000px [T]
- Borders 1px solid; footer divider 0.5px [T]
- `--shadow-coin`: `0 4px 4px rgba(0,0,0,.25)` [T]
- `--blur-glass`: 100px [T]
- CTA texture: `mix-blend-mode: screen`, opacity .1 [T]

## Breakpoints
Not defined yet. The designer will deliver mobile designs, and breakpoints will be added (`src/scss/abstracts/_breakpoints.scss`) when they arrive.

## Header
- Figma `1611:6986`: fixed, solid white, padding 24px 40px (72px tall), shadow `0 4px 10px rgba(0,0,0,.04)`. Same height at the top and while scrolling. [T]
- Logo, nav text and paddings use Figma px at every width (not fluid); side edges follow `.container`. `main` keeps a `fluid(104)` top offset so section positions match the homepage frame. [T]/[U]
- Always ink text on white (no dark-section theme). [T]

## Decisions
- `1523:3214` is the final Homepage (confirmed by the user, 23 Oct 2026). Other Homepage frames in Phase 4 are not used.
- Client logos will be exported by the designer as single SVG files (one per logo).
