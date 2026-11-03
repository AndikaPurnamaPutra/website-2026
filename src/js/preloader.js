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
// 2. "©2026 / One Week Wonders Studio" rises into view below it, letter by
//    letter,
// 3. as the curtain starts up, both fade out and blur away, as motto 1 blurs
//    in (src/js/motto-scroll.js, reversed; user),
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
// What appears takes REVEAL seconds (the line below the logo, the hero text
// in src/js/hero-intro.js), so all of it moves alike.
const REVEAL = 1;
const HEADER_AT = 1.1; // s into the lift, as the curtain leaves the top
const HEADER = 1.2; // s, the navbar down to its place
// The logo and the year blur away as the curtain starts up: motto 1's blur in
// (src/js/motto-scroll.js: autoAlpha, 12 Figma px, blur 6px), reversed.
const BLUR_OUT = { autoAlpha: 0, filter: "blur(6px)", duration: 0.6, ease: "power2.in" };
const BLUR_SHIFT = 12; // Figma px, up with the curtain
// The coin's lower edge in its picture box (448 × 420: centre at 208, edge
// 0.47 × 420 below it, as in src/js/coin-scene.js).
const COIN_EDGE = (208 + 0.47 * 420) / 420;
const HANG_GAP = 40; // Figma px from the coin to the bottom of the screen
const COIN_WAIT = 6; // s at most for the 3D coin
// The coin fades in after the showreel has shown (user), as it settles, so
// it is not a step of its own; slowly and evenly, never at once (user: a
// quick ease-out looked harsh).
const COIN_AT = PUSH_AT + PUSH * 0.6; // s into the lift
const COIN_IN = 1.4; // s
const COIN_EASE = "sine.inOut";
// The page is free to scroll once the showreel is in its place; the last
// reveals (navbar, coin, hero text) carry on.
const SETTLED = PUSH_AT + PUSH; // s into the lift
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
  // reduceWhiteSpace off keeps the double spaces round the slash.
  const split = SplitText.create(year, { type: "chars", mask: "chars", reduceWhiteSpace: false });
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
    // Outline → solid, then the year, and a breath with both.
    .to(solid, { opacity: 1, duration: 0.6, ease: "power2.out" })
    .to(preloader.querySelector(".preloader__outline"), { opacity: 0, duration: 0.6, ease: "power2.out" }, "<")
    .to(split.chars, { yPercent: 0, duration: REVEAL, stagger: 0.012, ease: SHOW }, 0.35)
    // The curtain lifts off the screen.
    .addLabel("lift", 1.8)
    .add(() => document.dispatchEvent(new CustomEvent("preloader:reveal")), "lift")
    // On the year's box: its window would cut the blur.
    .to([logo, year.parentElement], { ...BLUR_OUT, y: () => -BLUR_SHIFT * designPx() }, "lift")
    .to(preloader, { yPercent: -100, duration: LIFT, ease: MOVE }, "lift")
    .to(coinMotion, { fade: 1, duration: COIN_IN, ease: COIN_EASE }, `lift+=${COIN_AT}`)
    .to(coin, { opacity: 1, duration: COIN_IN, ease: COIN_EASE }, "<")
    .add(settle, `lift+=${SETTLED}`)
    // The showreel comes up from below right behind it, with no delay (user),
    // pushing the coin.
    .to(showreel, { y: 0, duration: PUSH, ease: MOVE, onUpdate: carryCoin }, `lift+=${PUSH_AT}`)
    // The navbar comes down from the top, whole, as the curtain leaves it
    // (the last part it uncovers; user, after trying it word by word and
    // blurring in).
    .to(header, { yPercent: 0, duration: HEADER, ease: SHOW }, `lift+=${HEADER_AT}`);

  // The showreel is in its place: the preloader goes and the page scrolls.
  let settled = false;
  function settle() {
    if (settled) return;
    settled = true;
    root.classList.remove("is-preloading");
    split.revert();
    gsap.set([preloader, logo, year.parentElement, showreel].filter(Boolean), { clearProps: "transform,opacity,visibility,filter" });
    // What waits for the showreel to be in its place (its hold,
    // src/js/hero-showreel.js), then the scroll animations, measured with the
    // showreel still pushed down, are measured again.
    document.dispatchEvent(new CustomEvent("preloader:settled"));
    ScrollTrigger.refresh();
    release();
  }

  // Every reveal is done.
  function finish() {
    settle();
    gsap.set(header, { clearProps: "transform" });
    if (coin) gsap.set(coin, { clearProps: "transform,opacity" });
    coinMotion.fade = 1;
  }

  return () => {
    gsap.ticker.remove(follow);
    coinWait?.kill();
    document.removeEventListener("coin:ready", coinDone);
    draw.kill();
    intro.kill();
    finish();
  };
}
