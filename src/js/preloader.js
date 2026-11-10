import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { stopSmoothScroll, startSmoothScroll } from "./smooth-scroll.js";
import { designPx } from "./design-px.js";
import { coinMotion, COIN_IN, COIN_EASE, NO_COIN } from "./coin-motion.js";

gsap.registerPlugin(DrawSVGPlugin);

// Preloader v2 (docs/implementation/20-preloader.md; Figma 1860:244 →
// 1880:663 → 1880:803 → 1880:759 → 1880:836), on the homepage:
// 1. white (Figma: black; user), with the logo in the middle drawn as an
//    outline as the page loads (at least MIN_DRAW seconds, so it never just
//    flashes), then filled,
// 2. "©2026 / One Week Wonders Studio" rises into view below it, whole, as
//    the hero text,
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
// The outline is drawn at a pace that changes smoothly (user: following the
// loading progress, it rushed, stopped, jumped and stopped again as assets
// came in one by one): while loading it follows a curve of time that slows
// down but never stops, up to DRAW_HOLD of the logo; once everything is in
// it speeds up to the end. Never faster than the whole logo in MIN_DRAW; its
// speed eases up and down (DRAW_EASE per second).
const DRAW_HOLD = 0.9;
const CREEP = 2; // s, the curve's time constant (57% in 2s, 78% in 4s)
const DRAW_PULL = 2.5; // per second, how strongly it heads for its goal
const DRAW_EASE = 4; // per second, how quickly its speed follows
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
const RISE = 200; // % of its height the line below the logo rises from, as the hero text
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
// The page opens MAX_WAIT seconds after it was opened even if an asset is
// still loading (user decision); sooner on touch screens (phones on mobile
// data), now that only the first screen is waited for.
const MAX_WAIT = 20; // s
const MAX_WAIT_TOUCH = 8; // s
// The coin fades in after the showreel has shown (user), as it settles, so
// it is not a step of its own; slowly and evenly, never at once (user: a
// quick ease-out looked harsh).
const COIN_AT = PUSH_AT + PUSH * 0.6; // s into the lift
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
  // The line below the logo rises whole in its window (.preloader__year,
  // overflow: clip), as the hero text and every other text on the site
  // (user: letter by letter, it was out of step with them).
  const header = document.querySelector("[data-header]");
  const showreel = document.querySelector(".hero__showreel");
  // No coin on phones and tablets (NO_COIN): nothing to wait for or move.
  const coin = window.matchMedia(NO_COIN).matches ? null : document.querySelector(".hero__coin");

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

  // Loading progress: what the first screen shows (user decision, 9 Nov
  // 2026; before, every image and video of the page, ≈16 MB on the homepage,
  // which took 13 s and more on mobile data): the images of the header and
  // the hero; the hero's showreel preview until it can play through (not
  // fully downloaded; user decision), on touch screens until its first frame
  // (iOS may load no more before playing); the web fonts; the window load;
  // and the 3D coin (it loads after the window load and must be in before it
  // is pushed up: "coin:ready", src/js/coin-scene.js and src/js/coin-3d.js).
  // The rest of the page loads as usual, the lazy images when they come
  // near. An asset that fails counts as in, and after MAX_WAIT seconds the
  // page opens anyway.
  let loaded = 0;
  const once = (target, events) => {
    let counted = false;
    const count = () => {
      if (counted) return;
      counted = true;
      loaded += 1;
    };
    events.forEach((type) => target.addEventListener(type, count, { once: true }));
    return count;
  };
  // Not the lazy ones among them (the Work menu's cards, ≈1 MB, hidden until
  // it opens): they load when the menu shows, and would otherwise never be
  // counted.
  const images = [...document.querySelectorAll(".site-header img, .hero img")].filter((img) => img.loading !== "lazy");
  const pending = images.filter((img) => !img.complete);
  const touch = window.matchMedia("(pointer: coarse)").matches;
  const videoReady = touch ? 2 : 4; // HAVE_CURRENT_DATA / HAVE_ENOUGH_DATA
  const videos = [...document.querySelectorAll(".hero video[data-inview-video]")].filter((video) => video.readyState < videoReady);
  const total = pending.length + videos.length + 2 + (coin ? 1 : 0);
  pending.forEach((img) => once(img, ["load", "error"]));
  videos.forEach((video) => {
    const count = once(video, [touch ? "loadeddata" : "canplaythrough", "error"]);
    // A source that fails reports it on the <source>, not on the video.
    video.querySelectorAll("source").forEach((source) => source.addEventListener("error", count, { once: true }));
    video.preload = "auto";
  });
  const pageLoaded = once(window, ["load"]);
  if (document.readyState === "complete") pageLoaded();
  (document.fonts?.ready ?? Promise.resolve()).then(once(document, []));
  const coinDone = coin ? once(document, ["coin:ready"]) : null;
  // Counted from the opening of the page (performance.now), not from this
  // script, which may itself come in late on a slow connection.
  const maxWait = gsap.delayedCall(Math.max(0, (touch ? MAX_WAIT_TOUCH : MAX_WAIT) - performance.now() / 1000), () => (loaded = total));

  // The outline heads for the progress at a smoothly changing pace (see
  // DRAW_HOLD above).
  const draw = gsap.fromTo(
    outline,
    { drawSVG: "0%" },
    { drawSVG: "100%", duration: 1, ease: "none", stagger: 0.12, paused: true },
  );
  gsap.set(preloader.querySelector(".preloader__outline"), { visibility: "visible" });
  const start = performance.now();
  let shown = 0;
  let speed = 0; // share of the logo per second
  const follow = (time, deltaMs) => {
    const dt = Math.min(deltaMs / 1000, 0.1);
    const elapsed = (performance.now() - start) / 1000;
    const goal = loaded >= total ? 1 : DRAW_HOLD * (1 - Math.exp(-elapsed / CREEP));
    const wanted = gsap.utils.clamp(0, 1 / MIN_DRAW, (goal - shown) * DRAW_PULL);
    speed += (wanted - speed) * Math.min(1, dt * DRAW_EASE);
    // Not held at the goal (a stop at once); a little past it, it slows down.
    shown = Math.min(1, shown + speed * dt);
    if (loaded >= total && shown > 0.995) {
      shown = 1;
      gsap.ticker.remove(follow);
      placeForPush();
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
  // Only with the page at its top: reloaded further down (the scroll is kept,
  // src/js/scroll-memory.js) the showreel was pushed up from a screen below,
  // and its growth (src/js/hero-showreel.js), measured while it was pushed,
  // jumped as it was measured again (user: the showreel jerked). Placed as
  // the curtain is about to lift, once the scroll is back where it was (the
  // curtain hides it until then).
  let hang = 0;
  let overlap = 0;
  const placeForPush = () => {
    if (window.scrollY > 0) return;
    const reel = showreel?.getBoundingClientRect();
    const below = reel ? Math.max(0, window.innerHeight - reel.top) : 0;
    const box = coin?.getBoundingClientRect();
    const coinEdge = box ? box.top + box.height * COIN_EDGE : 0;
    hang = box ? Math.min(below, Math.max(0, window.innerHeight - HANG_GAP * designPx() - coinEdge)) : 0;
    overlap = reel ? Math.max(0, coinEdge - reel.top) : 0; // in the design
    gsap.set(showreel, { y: below });
    if (coin) gsap.set(coin, { y: hang });
  };
  const carryCoin = () => {
    const pushedBy = gsap.getProperty(showreel, "y");
    if (coin) gsap.set(coin, { y: Math.min(hang, (pushedBy * hang) / (hang + overlap || 1)) });
  };
  gsap.set(year, { yPercent: RISE });
  gsap.set(year, { visibility: "visible" });
  gsap.set(header, { yPercent: -100 });
  // The coin fades in as the curtain lifts (user); the 3D coin takes its fade
  // from src/js/coin-motion.js.
  coinMotion.fade = 0;
  if (coin) gsap.set(coin, { opacity: 0 });

  const intro = gsap
    .timeline({ paused: true, onComplete: finish })
    // Outline → solid, then the year, and a breath with both.
    .to(solid, { opacity: 1, duration: 0.6, ease: "power2.out" })
    .to(preloader.querySelector(".preloader__outline"), { opacity: 0, duration: 0.6, ease: "power2.out" }, "<")
    .to(year, { yPercent: 0, duration: REVEAL, ease: SHOW }, 0.35)
    // The curtain lifts off the screen.
    .addLabel("lift", 1.8)
    .add(() => document.dispatchEvent(new CustomEvent("preloader:reveal")), "lift")
    // On the year's box: its window would cut the blur.
    .to([logo, year.parentElement], { ...BLUR_OUT, y: () => -BLUR_SHIFT * designPx() }, "lift")
    .to(preloader, { yPercent: -100, duration: LIFT, ease: MOVE }, "lift")
    .to(coinMotion, { fade: 1, duration: COIN_IN, ease: COIN_EASE }, `lift+=${COIN_AT}`)
    .to(coin ?? {}, { ...(coin && { opacity: 1 }), duration: COIN_IN, ease: COIN_EASE }, "<")
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
    gsap.set([preloader, logo, year, year.parentElement, showreel].filter(Boolean), { clearProps: "transform,opacity,visibility,filter" });
    // The scroll animations of the showreel (and the coin) were measured with
    // it still pushed down: measured again, only those. A refresh of every
    // scroll animation took 100–250ms right here, while the hero text, the
    // navbar and the coin were still moving, which then jerked (user).
    const moved = [showreel, coin].filter(Boolean);
    ScrollTrigger.getAll().forEach((trigger) => {
      if (moved.some((el) => el === trigger.trigger || el.contains(trigger.trigger))) trigger.refresh();
    });
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
    maxWait.kill();
    if (coinDone) document.removeEventListener("coin:ready", coinDone);
    draw.kill();
    intro.kill();
    finish();
  };
}
