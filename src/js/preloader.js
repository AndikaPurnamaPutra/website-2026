import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { stopSmoothScroll, startSmoothScroll } from "./smooth-scroll.js";
import { designPx } from "./design-px.js";

gsap.registerPlugin(DrawSVGPlugin);

// Preloader v2 (docs/implementation/20-preloader.md; Figma 1860:244 →
// 1880:663 → 1880:803 → 1880:759 → 1880:836), on the homepage:
// 1. black, with the logo in the middle drawn as an outline as the page loads
//    (at least MIN_DRAW seconds, so it never just flashes), then filled,
// 2. "2026" rises into view below it,
// 3. the black layer lifts off the top of the screen, uncovering the hero;
//    "preloader:reveal" is sent on document as it starts, so the hero text
//    rises (src/js/hero-intro.js). The coin shows lower than its place, with
//    no showreel yet,
// 4. then the showreel comes up from below the screen to its place; the coin
//    hangs, whole, just above the bottom of the screen until the showreel
//    reaches it, and is pushed up with it to its own place (user; the 3D coin
//    follows the coin picture, src/js/coin-scene.js).
// The scroll is held meanwhile. Only while <html> has is-preloading (set in
// <head>, not with reduced motion).
const MIN_DRAW = 0.9; // s
const LIFT = 1.25; // s, the black layer off the screen
const PUSH = 1.25; // s, the showreel up to its place
const PUSH_AT = 0.85; // of the lift, when the showreel starts up (user: not too late)
// The coin's lower edge in its picture box (448 × 420: centre at 208, edge
// 0.47 × 420 below it, as in src/js/coin-scene.js).
const COIN_EDGE = (208 + 0.47 * 420) / 420;
const HANG_GAP = 40; // Figma px from the coin to the bottom of the screen
const COIN_WAIT = 6; // s at most for the 3D coin
const SCROLL_KEYS = new Set(["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "]);

export function initPreloader() {
  const root = document.documentElement;
  const preloader = document.querySelector("[data-preloader]");
  if (!preloader || !root.classList.contains("is-preloading")) return () => {};

  const outline = preloader.querySelectorAll(".preloader__outline path");
  const solid = preloader.querySelector(".preloader__solid");
  const year = preloader.querySelector(".preloader__year span");
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
    gsap.set(coin, { y: Math.min(hang, (pushedBy * hang) / (hang + overlap || 1)) });
  };
  gsap.set(year, { yPercent: 110 });
  gsap.set(showreel, { y: below });
  gsap.set(coin, { y: hang });

  const intro = gsap
    .timeline({ paused: true, onComplete: finish })
    // Outline → solid, then the year.
    .to(solid, { opacity: 1, duration: 0.45, ease: "power2.out" })
    .to(preloader.querySelector(".preloader__outline"), { opacity: 0, duration: 0.45, ease: "power2.out" }, "<")
    .to(year, { yPercent: 0, duration: 0.55, ease: "power3.out" }, ">-0.2")
    // Off the screen, then the showreel pushes the coin up.
    .addLabel("lift", "+=0.3")
    .add(() => document.dispatchEvent(new CustomEvent("preloader:reveal")), "lift")
    .to(preloader, { yPercent: -100, duration: LIFT, ease: "power3.inOut" }, "lift")
    // As it is nearly off (the coin alone for a moment, no showreel yet, user),
    // the showreel comes up from below.
    .to(showreel, { y: 0, duration: PUSH, ease: "power2.inOut", onUpdate: coin ? carryCoin : null }, `lift+=${LIFT * PUSH_AT}`);

  function finish() {
    root.classList.remove("is-preloading");
    gsap.set([preloader, year, showreel, coin].filter(Boolean), { clearProps: "transform" });
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
