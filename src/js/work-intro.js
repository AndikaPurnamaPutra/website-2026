import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

// Work page entrance, the hero (docs/implementation/42-work-page.md,
// animation step 1), in the site's motion language (About, Contact: src/js/
// about-intro.js): on load the title's lines rise in their windows, then the
// intro's lines, the search title, the field and the suggestions part by
// part; alongside, the collage fades in as its wheel rolls in along its
// arc and slows into its usual turn (CSS). Hidden by the CSS until it is
// set up (_work.scss: is-work-ready). Not on a search address (the hero is
// hidden there; work-search.js) and nothing moves with reduced motion.
const RISE = 200; // % of its height text rises from
const PART_RISE = 100; // % for the field and the chips (taller than a line)
const DESCENT = 25; // % of its height its window reaches below it (g, p, y)
const LINE_GAP = 0.15; // s between the title's lines
const PART_GAP = 0.07; // s between the other parts
const TEXT_IN = 1.25; // s text takes to rise (as About)
const TEXT_AT = 0.3; // s after the title starts, the intro rises
const SEARCH_AT = 0.5; // s, the search block
const COLLAGE_AT = 0.15; // s, the collage opens
const COLLAGE_IN = 1.8; // s the wheel takes to roll in
const COLLAGE_TURN = 36; // ° it rolls in from (about 2 pictures, 15° apart)
const COLLAGE_FADE = 0.9; // s the collage takes to fade in
const WAIT = 1500; // ms at most for the collage's pictures before it plays

export function initWorkIntro() {
  const hero = document.querySelector(".work-hero");
  if (!hero) return () => {};
  const ready = () => document.documentElement.classList.add("is-work-ready");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // A search address shows the results, not the hero: nothing to play.
  if (reduce || document.documentElement.classList.contains("is-work-results")) {
    ready();
    return () => document.documentElement.classList.remove("is-work-ready");
  }

  // Split once the web fonts are in, so the lines break where they are set;
  // started once the first pictures of the collage are decoded (as About's
  // photo), not waiting longer than WAIT.
  let cleanup = () => {};
  let cancelled = false;
  const pictures = [...hero.querySelectorAll(".work-collage__card")].slice(0, 6);
  const decoded = Promise.all(pictures.map((img) => img.decode?.().catch(() => {})));
  const picturesReady = Promise.race([decoded, new Promise((resolve) => setTimeout(resolve, WAIT))]);
  Promise.all([document.fonts?.ready, picturesReady]).then(() => {
    if (!cancelled) cleanup = setUp(hero, ready);
  });
  return () => {
    cancelled = true;
    cleanup();
    document.documentElement.classList.remove("is-work-ready");
  };
}

function setUp(hero, ready) {
  // Up from below in a window of its own: a clip whose bottom edge comes up
  // as much as the element does, so no wrapper is needed. Fully shut at the
  // start also for a short rise (120% with the window's 20% above).
  const rise = (els, vars, from = RISE) =>
    gsap.fromTo(
      els,
      { yPercent: from, clipPath: `inset(-20% -20% ${Math.max(from - DESCENT, 120)}% -20%)` },
      { yPercent: 0, clipPath: `inset(-20% -20% ${-DESCENT}% -20%)`, duration: TEXT_IN, ease: "power3.out", ...vars },
    );

  const title = SplitText.create(hero.querySelector(".work-hero__title"), { type: "lines", aria: "none" });
  const text = SplitText.create(hero.querySelector(".work-hero__text"), { type: "lines", aria: "none" });
  const searchTitle = hero.querySelector(".work-search__title");
  const field = hero.querySelector(".work-search__field");
  const recent = [...hero.querySelectorAll(".work-search__recent-label, .work-search__chips > li")];
  const collage = hero.querySelector(".work-collage");
  // Only when it shows (desktop); hidden below it (_work.scss).
  const collageShown = collage && getComputedStyle(collage).display !== "none";

  const tl = gsap
    .timeline({ delay: 0.1 })
    .add(rise(title.lines, { stagger: LINE_GAP }), 0)
    .add(rise(text.lines, { stagger: PART_GAP }), TEXT_AT)
    .add(rise(searchTitle), SEARCH_AT)
    .add(rise(field, {}, PART_RISE), SEARCH_AT + PART_GAP)
    .add(rise(recent, { stagger: PART_GAP / 2 }, PART_RISE), SEARCH_AT + PART_GAP * 2);
  if (collageShown) {
    // Rolls in (user's pick; opened by a straight edge from the bottom it
    // fought the turning, odd): it fades in while the wheel turns ahead,
    // the way it always turns, quickly, slowing into its own slow turn. On
    // the wheel's `rotate` (--work-wheel-in, _work.scss), apart from its
    // turning (transform, CSS).
    const wheel = collage.querySelector(".work-collage__wheel");
    tl.fromTo(collage, { opacity: 0 }, { opacity: 1, duration: COLLAGE_FADE, ease: "power1.out" }, COLLAGE_AT).fromTo(
      wheel,
      { "--work-wheel-in": `${-COLLAGE_TURN}deg` },
      { "--work-wheel-in": "0deg", duration: COLLAGE_IN, ease: "power3.out" },
      COLLAGE_AT,
    );
  }
  // Done: no clip left on the field and the chips (their focus ring, hover).
  tl.eventCallback("onComplete", () => gsap.set([searchTitle, field, ...recent, collage].filter(Boolean), { clearProps: "transform,clipPath,opacity" }));
  // Set up (its parts at their start): shown.
  ready();

  return () => {
    tl.kill();
    title.revert();
    text.revert();
    gsap.set([searchTitle, field, ...recent, collage].filter(Boolean), { clearProps: "transform,clipPath,opacity" });
    collage?.querySelector(".work-collage__wheel")?.style.removeProperty("--work-wheel-in");
  };
}
