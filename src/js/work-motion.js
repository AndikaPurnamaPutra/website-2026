import gsap from "gsap";

// The Work page's motion language, shared by its entrance (work-intro.js)
// and the search's change of view (work-search.js): text rising in a window
// of its own, and project cards opening from the bottom of their frames.
const RISE = 200; // % of its height text rises from
export const PART_RISE = 100; // % for parts taller than a line (field, chips, card text)
const DESCENT = 25; // % of its height its window reaches below it (g, p, y)
const TEXT_IN = 1.25; // s text takes to rise (as About)
const CARD_GAP = 0.08; // s between the cards, left to right (as Our Work)
const CARD_IN = 1.1; // s a card picture takes to open (as Our Work)
const CARD_SETTLE = 8; // % the picture rises from within its frame as it opens

// Up from below in a window of its own: a clip whose bottom edge comes up
// as much as the element does, so no wrapper is needed. Fully shut at the
// start also for a short rise (120% with the window's 20% above).
export const rise = (els, vars, from = RISE) =>
  gsap.fromTo(
    els,
    { yPercent: from, clipPath: `inset(-20% -20% ${Math.max(from - DESCENT, 120)}% -20%)` },
    { yPercent: 0, clipPath: `inset(-20% -20% ${-DESCENT}% -20%)`, duration: TEXT_IN, ease: "power3.out", ...vars },
  );

// Cards opening one after another, left to right (as Our Work on the
// homepage): each picture opens from the bottom of its frame while it
// settles up in it (translate, apart from the hover scale: transform), then
// its title and line rise.
export function openCards(items) {
  const pick = (selector) => items.map((item) => item.querySelector(selector)).filter(Boolean);
  return gsap
    .timeline({ paused: true })
    .fromTo(
      pick(".project-card__media"),
      { clipPath: "inset(100% 0% 0% 0%)" },
      { clipPath: "inset(0% 0% 0% 0%)", duration: CARD_IN, ease: "power2.inOut", stagger: CARD_GAP },
      0,
    )
    .fromTo(
      pick(".project-card__image"),
      { translate: `0 ${CARD_SETTLE}%` },
      { translate: "0 0%", duration: CARD_IN, ease: "power2.inOut", stagger: CARD_GAP },
      0,
    )
    .add(rise(pick(".project-card__text"), { stagger: CARD_GAP }, PART_RISE), 0.45);
}

export const clearCards = (scope) =>
  gsap.set(scope.querySelectorAll(".project-card__media, .project-card__image, .project-card__text"), {
    clearProps: "transform,clipPath,translate",
  });

// Items in rows (the same top, give or take), each row left to right.
export function rowsOf(items) {
  const rows = [];
  items
    .map((item) => ({ item, box: item.getBoundingClientRect() }))
    .sort((a, b) => a.box.top - b.box.top || a.box.left - b.box.left)
    .forEach(({ item, box }) => {
      const row = rows.at(-1);
      if (row && Math.abs(row.top - box.top) <= 4) row.items.push(item);
      else rows.push({ top: box.top, items: [item] });
    });
  return rows;
}
