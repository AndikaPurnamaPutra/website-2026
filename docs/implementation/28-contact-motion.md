# 28 — Contact: motion

Branch `contact/v1`, made from `homepage-draf`. The page itself matches Figma
`1611:1042` (checked 5 Nov 2026); this adds the homepage's motion language.

## 1. Entrance (on load; the Contact page has no preloader)

- The heading's lines rise from 200% of their height in their windows,
  1s `power3.out`, 0.12s apart, as the hero text (`hero-intro.js`).
- Then the lead's lines (0.07s apart), the "Schedule a call" button and its
  caption.
- The form card comes up 24px and fades in (1s `power3.out`), its title
  rising in it, alongside the heading.
- The office block, below on the left: its picture opens from the bottom
  while it settles (as the Our Work cards), then "Office HQ", the address and
  the note rise.
- The gallery: as it comes up the screen, its pictures open from the bottom
  one after another.
- Reduced motion: no entrance, all in place.
- Not done: "reloaded further down, in place at once" (the entrance is at the
  top of the page and plays on every load).

## 2. Form interactions

- An input's underline draws from the left on focus.
- A chosen chip changes colour with a transition.
- The Turnaround dropdown opens with a short drop and fade.

## Files

- `src/js/contact-intro.js` (new), called from `src/js/main.js`.
- `src/scss/pages/_contact.scss` for part 2.

## Checks

- [x] Entrance plays once on load; nothing flashes (hidden by the CSS until
      set up, shown after 3s if the script never comes).
- [x] Form: chips, Turnaround (open, choose, close), errors (red line) work.
- [x] Build, no errors.
- [ ] The user checks the feel.

## Notes

- The drawn line: both lines are background layers, as a border paints over
  the background and hid the dark line; the border stays clear, for the
  error's red.
- The dropdown's open and close use `@starting-style` and `display`
  `allow-discrete` (Chrome 117+, Safari 17.4+); older browsers show it at
  once.
