import gsap from "gsap";

// Work page hero collage (WorkHero.astro): the wheel moves a card at a time,
// after outstandingbranding.co's hero. It rests, then every card glides on
// by one place on its own, the top one first and each below a moment later,
// so the cards bunch and spread as they go, and settles to rest again.
// Each card turns on its arm's `rotate` (--turn, _work.scss), apart from
// the arm's place and the wheel's entrance roll (work-intro.js). After one
// round of the pictures (--loop cards) every card shows the picture of the
// one it reached, so the loop starts again with no seam. Still with reduced
// motion; paused while the collage is out of view or not shown.
// Fitted to the reference, measured frame by frame (change per frame): a
// move shows for about 1.8s, at 10% of its top speed or more for 1.2s, the
// lead card about 0.25s before the last in view, then it is still about
// 1.2s. An expo glide has long, all but still ends (part of that rest),
// so the rest between moves is short.
const REST = 0.1; // s the wheel waits between moves
const GLIDE = 2.3; // s a card takes to move one place
const GAP = 0.05; // s between one card and the next below
const EASE = "expo.inOut"; // all but still at both ends
// Places on the arc, in cards from the top (0 = the card at the wheel's 0°,
// higher is further up): the ones in view (1440 wide: +3 to -2) and the one
// coming in below. Cards above the top start with it, those below with the
// bottom.
const TOP = 4;
const BOTTOM = -3;
// The first move waits for the entrance (work-intro.js: the wheel rolls in
// for about 2s once the page is ready, is-work-ready): starting this long
// after it, the first move comes after the roll has settled.
const AFTER_READY = 1.5;

export function initWorkCollage() {
  const wheel = document.querySelector(".work-collage__wheel");
  if (!wheel || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  const arms = [...wheel.querySelectorAll(".work-collage__arm")];
  const count = arms.length;
  const loop = Number(getComputedStyle(wheel).getPropertyValue("--loop")) || count;
  const step = 360 / count;
  const span = GLIDE + (TOP - BOTTOM) * GAP; // a move, first card to last
  // A card's place on the arc after k moves (as WorkHero.astro's rank).
  const placeOf = (i, k) => {
    const place = k - i;
    const wrapped = ((place % count) + count) % count;
    return wrapped > count / 2 ? wrapped - count : wrapped;
  };

  gsap.set(arms, { "--turn": "0deg" });
  const tl = gsap.timeline({ repeat: -1, paused: true });
  for (let k = 0; k < loop; k++) {
    const at = k * (REST + span) + REST;
    arms.forEach((arm, i) => {
      const place = Math.min(TOP, Math.max(BOTTOM, placeOf(i, k)));
      tl.to(arm, { "--turn": `${(k + 1) * step}deg`, duration: GLIDE, ease: EASE }, at + (TOP - place) * GAP);
    });
  }
  tl.set({}, {}, loop * (REST + span)); // the last move's rest is the next round's first

  // Only while it can be seen (hidden below the laptop layout, _work.scss),
  // and from a moment after the entrance has started.
  const root = document.documentElement;
  let started = false;
  let inView = false;
  const update = () => (started && inView ? tl.play() : tl.pause());
  const collage = wheel.closest(".work-collage");
  const observer = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    update();
  });
  observer.observe(collage);
  let start = null;
  const begin = () => {
    start = gsap.delayedCall(AFTER_READY, () => {
      started = true;
      update();
    });
  };
  const watch = new MutationObserver(() => {
    if (!root.classList.contains("is-work-ready")) return;
    watch.disconnect();
    begin();
  });
  if (root.classList.contains("is-work-ready")) begin();
  else watch.observe(root, { attributes: true, attributeFilter: ["class"] });

  return () => {
    watch.disconnect();
    start?.kill();
    observer.disconnect();
    tl.kill();
    gsap.set(arms, { clearProps: "--turn" });
  };
}
