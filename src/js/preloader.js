import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { SplitText } from "gsap/SplitText";
import { stopSmoothScroll, startSmoothScroll } from "./smooth-scroll.js";
import { designPx } from "./design-px.js";
import { coinMotion } from "./coin-motion.js";

gsap.registerPlugin(DrawSVGPlugin, SplitText);

// Preloader v2 (docs/implementation/20-preloader.md; Figma 1860:244 →
// 1880:663 → 1880:803 → 1880:759 → 1880:836), on the homepage:
// 1. white (Figma: black; user), with the logo in the middle drawn as an
//    outline as the page loads (at least MIN_DRAW seconds, so it never just
//    flashes), then filled,
// 2. "2026" rises into view below it, letter by letter,
// 3. both go as in the earlier "One Week · Wonders Studio" preloader (user):
//    the letters drop away one by one, and the logo drops away too,
// 4. the layer lifts off the top of the screen, uncovering the hero;
//    "preloader:reveal" is sent on document as it starts, so the hero text
//    rises (src/js/hero-intro.js). The coin shows lower than its place,
//    The navbar comes down from the top as the curtain leaves it,
// 5. right behind it, the showreel comes up from below the screen; the coin
//    hangs, whole, just above the bottom of the screen until the showreel
//    reaches it, and is pushed up with it to its own place (user; the 3D coin
//    follows the coin picture, src/js/coin-scene.js). It fades in as the
//    curtain lifts.
// The scroll is held meanwhile. Only while <html> has is-preloading (set in
// <head>, not with reduced motion).
const MIN_DRAW = 0.9; // s
// One rhythm for the whole entrance (user: smooth, seamless, enjoyable):
// the big movements (curtain, showreel) start and settle gently (MOVE),
// what appears (logo, year, navbar, and the hero text in
// src/js/hero-intro.js) eases out softly (SHOW); each step starts before the
// last one ends.
const MOVE = "power3.inOut";
const SHOW = "power3.out";
const LIFT = 1.5; // s, the curtain off the screen
const PUSH = 1.6; // s, the showreel up to its place
const PUSH_AT = 0.35; // s into the lift, the showreel right behind the curtain (user: no delay)
const HEADER_AT = 1.15; // s into the lift, as the curtain leaves the top
const HEADER = 1.2; // s, the navbar down to its place
// The coin's lower edge in its picture box (448 × 420: centre at 208, edge
// 0.47 × 420 below it, as in src/js/coin-scene.js).
const COIN_EDGE = (208 + 0.47 * 420) / 420;
const HANG_GAP = 40; // Figma px from the coin to the bottom of the screen
const COIN_WAIT = 6; // s at most for the 3D coin
// The coin fades in once the showreel is in its place (user), slowly and
// evenly so it is seen.
const COIN_AT = PUSH_AT + PUSH; // s into the lift
const COIN_IN = 1.2; // s
const SCROLL_KEYS = new Set(["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "]);

export function initPreloader() {
  const root = document.documentElement;
  const preloader = document.querySelector("[data-preloader]");
  if (!preloader || !root.classList.contains("is-preloading")) return () => {};

  const outline = preloader.querySelectorAll(".preloader__outline path");
  const solid = preloader.querySelector(".preloader__solid");
  const logo = preloader.querySelector(".preloader__logo");
  const year = preloader.querySelector(".preloader__year span");
  // The year's letters rise and drop one by one, each in its own window.
  const split = SplitText.create(year, { type: "chars", mask: "chars" });
  const header = document.querySelector("[data-header]");
  const showreel = document.querySelector(".hero__showreel");
  const coin = document.querySelector(".hero__coin");

  // Scroll held: the smooth scroll stops, and the native scroll (touch,
  // keys) is blocked without hiding the scrollbar, so nothing shifts.
  stopSmoothScroll();
  const block = (event) => event.preventDefault();
  const blockKeys = (event) => {
    if (SCROLL_KEYS.has(event.key)) event.preventDefault();
  };
  window.addEventListener("wheel", block, { passive: false });
  window.addEventListener("touchmove", block, { passive: false });
  window.addEventListener("keydown", blockKeys);
  const release = () => {
    window.removeEventListener("wheel", block);
    window.removeEventListener("touchmove", block);
    window.removeEventListener("keydown", blockKeys);
    startSmoothScroll();
  };

  // Loading progress: the images loaded with the page, the web fonts, the
  // window load and the 3D coin (it loads after the window load and must be
  // in before it is pushed up: "coin:ready", src/js/coin-scene.js and
  // src/js/coin-3d.js; at most COIN_WAIT seconds). Lazy images load later,
  // on their own.
  const pending = [...document.images].filter((img) => img.loading !== "lazy" && !img.complete);
  const total = pending.length + 2 + (coin ? 1 : 0);
  let loaded = 0;
  const done = () => {
    loaded += 1;
  };
  pending.forEach((img) => {
    img.addEventListener("load", done, { once: true });
    img.addEventListener("error", done, { once: true });
  });
  (document.fonts?.ready ?? Promise.resolve()).then(done);
  if (document.readyState === "complete") done();
  else window.addEventListener("load", done, { once: true });
  let coinIn = false;
  const coinDone = () => {
    if (coinIn) return;
    coinIn = true;
    done();
  };
  const coinWait = coin ? gsap.delayedCall(COIN_WAIT, coinDone) : null;
  if (coin) document.addEventListener("coin:ready", coinDone, { once: true });

  // The outline follows the progress, eased, and never faster than MIN_DRAW.
  const draw = gsap.fromTo(
    outline,
    { drawSVG: "0%" },
    { drawSVG: "100%", duration: 1, ease: "none", stagger: 0.12, paused: true },
  );
  gsap.set(preloader.querySelector(".preloader__outline"), { visibility: "visible" });
  const start = performance.now();
  let shown = 0;
  const follow = () => {
    const elapsed = (performance.now() - start) / 1000;
    const target = Math.min(loaded / total, elapsed / MIN_DRAW);
    shown += (target - shown) * Math.min(1, 0.12 * gsap.ticker.deltaRatio());
    if (target >= 1 && shown > 0.995) {
      shown = 1;
      gsap.ticker.remove(follow);
      intro.play();
    }
    draw.progress(shown);
  };
  gsap.ticker.add(follow);

  // The showreel starts just below the screen; the coin hangs lower than its
  // place, whole on screen. It moves from the moment the showreel's top edge
  // touches its lower edge, a little slower than the showreel, so that edge
  // slides over the coin's lower part (behind the showreel in the design) as
  // both reach their places.
  const reel = showreel?.getBoundingClientRect();
  const below = reel ? Math.max(0, window.innerHeight - reel.top) : 0;
  const box = coin?.getBoundingClientRect();
  const coinEdge = box ? box.top + box.height * COIN_EDGE : 0;
  const hang = box ? Math.min(below, Math.max(0, window.innerHeight - HANG_GAP * designPx() - coinEdge)) : 0;
  const overlap = reel ? Math.max(0, coinEdge - reel.top) : 0; // in the design
  const carryCoin = () => {
    const pushedBy = gsap.getProperty(showreel, "y");
    if (coin) gsap.set(coin, { y: Math.min(hang, (pushedBy * hang) / (hang + overlap || 1)) });
  };
  gsap.set(split.chars, { yPercent: 110 });
  gsap.set(year, { visibility: "visible" });
  gsap.set(header, { yPercent: -100 });
  gsap.set(showreel, { y: below });
  gsap.set(coin, { y: hang });
  // The coin fades in as the curtain lifts (user); the 3D coin takes its fade
  // from src/js/coin-motion.js.
  coinMotion.fade = 0;
  gsap.set(coin, { opacity: 0 });

  const intro = gsap
    .timeline({ paused: true, onComplete: finish })
    // Outline → solid, then the year, a breath with both, and both go.
    .to(solid, { opacity: 1, duration: 0.6, ease: "power2.out" })
    .to(preloader.querySelector(".preloader__outline"), { opacity: 0, duration: 0.6, ease: "power2.out" }, "<")
    .to(split.chars, { yPercent: 0, duration: 0.8, stagger: 0.05, ease: SHOW }, 0.35)
    .to(split.chars, { yPercent: 110, duration: 0.5, stagger: 0.03, ease: "power2.in" }, 1.45)
    .to(logo, { yPercent: 110, duration: 0.55, ease: "power2.in" }, 1.5)
    // The curtain lifts off the screen.
    .addLabel("lift", 2)
    .add(() => document.dispatchEvent(new CustomEvent("preloader:reveal")), "lift")
    .to(preloader, { yPercent: -100, duration: LIFT, ease: MOVE }, "lift")
    .to(coinMotion, { fade: 1, duration: COIN_IN, ease: "sine.inOut" }, `lift+=${COIN_AT}`)
    .to(coin, { opacity: 1, duration: COIN_IN, ease: "sine.inOut" }, "<")
    // The showreel comes up from below right behind it, with no delay (user),
    // pushing the coin.
    .to(showreel, { y: 0, duration: PUSH, ease: MOVE, onUpdate: carryCoin }, `lift+=${PUSH_AT}`)
    // The navbar comes down from the top as the curtain leaves it (user; the
    // top of the screen is the last part it uncovers).
    .to(header, { yPercent: 0, duration: HEADER, ease: SHOW }, `lift+=${HEADER_AT}`);

  function finish() {
    root.classList.remove("is-preloading");
    split.revert();
    gsap.set([preloader, logo, header, showreel, coin].filter(Boolean), { clearProps: "transform,opacity" });
    coinMotion.fade = 1;
    // The scroll animations were measured with the showreel still pushed
    // down.
    ScrollTrigger.refresh();
    release();
  }

  return () => {
    gsap.ticker.remove(follow);
    coinWait?.kill();
    document.removeEventListener("coin:ready", coinDone);
    draw.kill();
    intro.kill();
    if (root.classList.contains("is-preloading")) finish();
  };
}
