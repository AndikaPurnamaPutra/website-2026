import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { stopSmoothScroll, startSmoothScroll } from "./smooth-scroll.js";
import { designPx } from "./design-px.js";

gsap.registerPlugin(DrawSVGPlugin);

// Preloader (docs/implementation/20-preloader.md, revision 5; Figma 1860:244
// → 1876:346 → 1876:533 → 1876:589), on every page load:
// 1. a black screen with the logo in the middle, drawn as an outline as the
//    page loads (at least MIN_DRAW seconds, so it never just flashes), then
//    filled solid (no gradient; user),
// 2. the box becomes the showreel (user): the showreel's own video moves into
//    it, under the black and the logo, and the box comes down and shrinks, in
//    one movement, onto the showreel's place, uncovering the page above it.
//    Its corners round to the showreel's as soon as it moves; the black and
//    the logo fade on the way, so the video shows in the moving box.
//    "preloader:reveal" is sent on document as it starts, so the hero text
//    rises as it is uncovered (src/js/hero-intro.js),
// 3. landed, the video goes back into the showreel, at the very same size
//    and place, and the box is gone.
// Pages without a showreel in view (other pages, a reload further down): the
// box lifts off the top of the screen instead.
// The scroll is held meanwhile. Only while <html> has is-preloading (set in
// <head>, not with reduced motion).
const MIN_DRAW = 1; // s
const TRAVEL = 1.6; // s, the box down onto the showreel
const SCROLL_KEYS = new Set(["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "]);

export function initPreloader() {
  const root = document.documentElement;
  const preloader = document.querySelector("[data-preloader]");
  if (!preloader || !root.classList.contains("is-preloading")) return () => {};

  const logo = preloader.querySelector(".preloader__logo");
  const outline = preloader.querySelectorAll(".preloader__outline path");
  const solid = preloader.querySelector(".preloader__solid");
  const veil = preloader.querySelector(".preloader__veil");

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

  // Loading progress: the images loaded with the page, the web fonts and
  // the window load (lazy images load later, on their own).
  const pending = [...document.images].filter((img) => img.loading !== "lazy" && !img.complete);
  const total = pending.length + 2;
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

  // Where the box ends: the showreel's box as laid out now, or off the top
  // of the screen when it is not in view.
  const target = () => {
    const showreel = document.querySelector(".hero__showreel");
    const width = root.clientWidth;
    const height = root.clientHeight;
    const box = showreel?.getBoundingClientRect();
    if (!box || box.top >= height || box.bottom <= 0) return { bottom: height, onShowreel: false };
    return {
      top: box.top,
      right: width - box.right,
      bottom: height - box.bottom,
      left: box.left,
      // The showreel's corners are drawn by its clip (src/js/hero-showreel.js),
      // so its own border-radius reads 0: --radius-sm, 4 Figma px.
      borderRadius: 4 * designPx(),
      onShowreel: true,
    };
  };

  let move;
  let video;
  // The showreel's video, moved into the box and back (moving it keeps it
  // playing).
  const carry = (into) => {
    const home = document.querySelector(".hero__showreel");
    if (into) {
      video = home.querySelector(".hero__showreel-image");
      preloader.prepend(video);
    } else if (video) {
      home.prepend(video);
      video = null;
    }
  };

  const travel = () => {
    const { onShowreel, borderRadius, ...edges } = target();
    if (onShowreel) carry(true);
    document.dispatchEvent(new CustomEvent("preloader:reveal"));
    move = gsap.timeline({ onComplete: finish }).to(preloader, { ...edges, duration: TRAVEL, ease: "power3.inOut" });
    if (!onShowreel) return;
    move
      .to(preloader, { borderRadius, duration: 0.4, ease: "power2.out" }, 0.1)
      .to([veil, logo], { opacity: 0, duration: TRAVEL * 0.55, ease: "power1.inOut" }, TRAVEL * 0.35);
  };

  const intro = gsap
    .timeline({ paused: true })
    // Outline → solid.
    .to(solid, { opacity: 1, duration: 0.5, ease: "power2.out" })
    .to(preloader.querySelector(".preloader__outline"), { opacity: 0, duration: 0.5, ease: "power2.out" }, "<")
    .add(travel, "+=0.3");

  function finish() {
    const landed = Boolean(video);
    carry(false);
    root.classList.remove("is-preloading");
    if (landed) gsap.from(".hero__showreel-button", { opacity: 0, duration: 0.5, ease: "power1.out", clearProps: "opacity" });
    gsap.set([preloader, veil, logo], { clearProps: "all" });
    release();
  }

  return () => {
    gsap.ticker.remove(follow);
    draw.kill();
    intro.kill();
    move?.kill();
    if (root.classList.contains("is-preloading")) finish();
  };
}
