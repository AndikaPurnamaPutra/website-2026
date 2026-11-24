import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

// Work page entrance (docs/implementation/42-work-page.md, animation steps
// 1–2). The hero, in the site's motion language (About, Contact: src/js/
// about-intro.js): on load the title's lines rise in their windows, then the
// intro's lines, the search title, the field and the suggestions part by
// part; alongside, the collage fades in as its wheel rolls in along its
// arc and slows into its usual turn (CSS). Hidden by the CSS until it is
// set up (_work.scss: is-work-ready). Not on a search address (the hero is
// hidden there; work-search.js) and nothing moves with reduced motion.
// Selected Work, as it comes up the screen, once (as Our Work on the
// homepage, src/js/our-work-intro.js): its title and text rise, then the
// cards in view open from the bottom one after another, left to right, each
// picture settling up in its frame, then their title and line rise. In the
// first screen already, it starts a little after the hero; scrolled past
// (opened further down), it is in place at once.
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
const CARD_GAP = 0.08; // s between the cards, left to right (as Our Work)
const CARD_IN = 1.1; // s a card picture takes to open (as Our Work)
const CARD_SETTLE = 8; // % the picture rises from within its frame as it opens
const SELECTED_AFTER = 0.6; // s after the hero starts, at the earliest
const START = "top 85%";

// Up from below in a window of its own: a clip whose bottom edge comes up
// as much as the element does, so no wrapper is needed. Fully shut at the
// start also for a short rise (120% with the window's 20% above).
const rise = (els, vars, from = RISE) =>
  gsap.fromTo(
    els,
    { yPercent: from, clipPath: `inset(-20% -20% ${Math.max(from - DESCENT, 120)}% -20%)` },
    { yPercent: 0, clipPath: `inset(-20% -20% ${-DESCENT}% -20%)`, duration: TEXT_IN, ease: "power3.out", ...vars },
  );

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
  const started = performance.now();
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
  const selected = setUpSelected(started);
  // Set up (its parts at their start): shown.
  ready();

  return () => {
    selected();
    tl.kill();
    title.revert();
    text.revert();
    gsap.set([searchTitle, field, ...recent, collage].filter(Boolean), { clearProps: "transform,clipPath,opacity" });
    collage?.querySelector(".work-collage__wheel")?.style.removeProperty("--work-wheel-in");
  };
}

function setUpSelected(started) {
  const section = document.querySelector(".work-selected");
  if (!section) return () => {};
  const heading = SplitText.create(section.querySelector(".work-section-title"), { type: "lines", aria: "none" });
  const textEl = section.querySelector(".work-section-text");
  const text = textEl && SplitText.create(textEl, { type: "lines", aria: "none" });

  // The cards in view now (the endless row's copies too: one peeks at the
  // left edge), left to right; the others are left as they are.
  const box = section.querySelector(".work-selected__viewport").getBoundingClientRect();
  const left = (el) => el.getBoundingClientRect().left;
  const items = [...section.querySelectorAll(".work-selected__item")]
    .filter((item) => {
      const r = item.getBoundingClientRect();
      return r.right > box.left && r.left < box.right;
    })
    .sort((a, b) => left(a) - left(b));
  const pick = (selector) => items.map((item) => item.querySelector(selector)).filter(Boolean);

  // The head and the row, each as it comes up the screen (in the first
  // screen at 1440 × 900 the head is, the row not: it played unseen).
  const head = gsap.timeline({ paused: true }).add(rise([...heading.lines, ...(text?.lines ?? [])], { stagger: PART_GAP }), 0);
  const row = gsap
    .timeline({ paused: true })
    .fromTo(
      pick(".project-card__media"),
      { clipPath: "inset(100% 0% 0% 0%)" },
      { clipPath: "inset(0% 0% 0% 0%)", duration: CARD_IN, ease: "power2.inOut", stagger: CARD_GAP },
      0,
    )
    // translate, apart from the picture's hover scale (transform).
    .fromTo(
      pick(".project-card__image"),
      { translate: `0 ${CARD_SETTLE}%` },
      { translate: "0 0%", duration: CARD_IN, ease: "power2.inOut", stagger: CARD_GAP },
      0,
    )
    .add(rise(pick(".project-card__text"), { stagger: CARD_GAP }, PART_RISE), 0.45);
  // Done: nothing left on any card, copies made meanwhile (a resize
  // rebuilds them, src/js/work-drag.js) included.
  const clear = () =>
    gsap.set(section.querySelectorAll(".project-card__media, .project-card__image, .project-card__text"), {
      clearProps: "transform,clipPath,translate",
    });
  row.eventCallback("onComplete", clear);

  const waits = [];
  const play = (trigger, timeline, after) =>
    ScrollTrigger.create({
      trigger,
      start: START,
      once: true,
      onEnter: () => {
        // Scrolled past (opened further down): in place at once.
        if (trigger.getBoundingClientRect().bottom < 0) return timeline.progress(1);
        const wait = after - (performance.now() - started) / 1000;
        waits.push(gsap.delayedCall(Math.max(0, wait), () => timeline.play()));
      },
    });
  const triggers = [
    play(section.querySelector(".work-section-header"), head, SELECTED_AFTER),
    play(section.querySelector(".work-selected__viewport"), row, SELECTED_AFTER + 0.15),
  ];

  return () => {
    triggers.forEach((trigger) => trigger.kill());
    waits.forEach((wait) => wait.kill());
    head.kill();
    row.kill();
    clear();
    heading.revert();
    text?.revert();
  };
}
