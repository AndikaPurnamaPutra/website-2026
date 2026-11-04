# Work mega menu: motion

## Goal

The mega menu opens with a plain fade and small shifts. The user wants it
"not ordinary", in the same motion language as the rest of the site.

## Chosen (user): a small box under Work, growing as a popover

- The background, a layer of its own (`.work-menu__bg`) with the panel's
  shadow, fades in (0.15s) as a small box at the top of the panel under
  Work: the panel at 30% of its size, 8px corners, its right edge 24px past
  Work. A 100px box widening to the whole panel read as a sideways sweep.
- It grows to the left and down to the whole panel in 0.5s, `power3.out`.
- The content (`.work-menu__content`) keeps its size and shows only inside
  that shape (a clip). At 0.15s, as the box has mostly grown (earlier,
  its movement was mostly over behind the box's edge, unseen):
  - the title lines, the categories and the line below rise in their windows
    (0.9s, 0.05s apart);
  - the cards open from the bottom while their pictures settle (1.15 → 1),
    0.08s apart.
- Closing: the content fades (0.12s), and the box shrinks back (0.3s) and
  fades out as it ends.
- The hover bridge over the gap is on the Work item, only while the panel
  shows.
- Tried and dropped:
  - a pill at the top of the panel (too far from Work);
  - a pill round Work dropping into the panel (odd);
  - a plain drop and fade (the user preferred the box).

## First proposal (replaced)

**Open (≈0.9s in all):**
- The panel unfolds from the bar downwards: a clip from its top edge to its
  full height (`inset(0 0 100% 0)` → `inset(0)`, rounded 8px), 0.6s
  `power3.out`. It is not a fade.
- "Digital / Expertise" rises line by line from 200% in its window, as the
  hero text. The categories rise one after another, and their counts with
  them. The ©2026 line rises last.
- The three cards open from the bottom while their pictures settle (8% → 0),
  one after another, as the Our Work cards (v2). The "New" badges fade in
  after them.

**Card sets (every 4s or a dot):** the next set opens with the same wipe
from the bottom, card by card, over the one before. It is not a crossfade.

**Close:** the panel folds back up (clip to its top edge), 0.3s
`power2.in`. The content does not move on its own. The bar stays drawn
normally until the panel is folded (the fix for the black panel stays).

**Reduced motion:** shown and hidden at once, as now.

## Files

- `src/js/work-menu.js`: open, close and the set change.
- `src/scss/components/_header.scss`: masks for the rising text, if needed.

## Checks

- [x] Opening, closing, re-opening while it closes, and quick hovers in and
      out: no flicker, no black panel.
- [ ] The card sets change cleanly; the dots and keyboard still work.
- [ ] Descenders (g, p, y) are not cut.
- [x] Build, no errors.
