import gsap from "gsap";
import { designPx } from "./design-px.js";

// Endless marquees moved on GSAP's ticker, 40 Figma px per second unless
// data-marquee-speed sets another speed:
// - Trusted Clients testimonials (approved proposal, not in Figma): to the
//   left, keep moving on hover (user decision).
// - Contact gallery, data-marquee="pause scroll", 60 px/s (user decisions):
//   - "pause": its own movement stops while hovered or keyboard-focused;
//     the scroll still pushes it (user decision).
//   - "scroll": the page scroll pushes it: down → to the left, up → to the
//     right, faster with faster scrolling; afterwards it keeps going the way
//     of the last scroll.
// Static (Figma layout) with reduced motion.
const SPEED = 40; // Figma px per second
const SCROLL_PUSH = 1; // marquee px per scrolled px
const EASE = 6; // how fast the speed follows a change (per second)
// Larger steps are jumps (scroll restored after a reload, anchors), not a
// scroll gesture: they do not push the marquee.
const MAX_STEP = 120;

function initMarquee(marquee) {
  const options = (marquee.dataset.marquee || "").split(" ");
  const baseSpeed = Number(marquee.dataset.marqueeSpeed) || SPEED;
  const track = marquee.querySelector("[data-marquee-track]");
  const originals = [...track.children];

  // A second copy of the items makes the loop seamless.
  originals.forEach((item) => {
    const clone = item.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    clone.querySelectorAll("a").forEach((link) => link.setAttribute("tabindex", "-1"));
    if (clone.matches("a")) clone.setAttribute("tabindex", "-1");
    track.append(clone);
  });

  // Distance from the first item to its copy (one set including the gap).
  const loopWidth = () => track.children[originals.length].offsetLeft - track.children[0].offsetLeft;

  let loop = loopWidth();
  let x = 0;
  let speed = 0; // px per second, negative = to the left
  let direction = -1;
  let held = false;
  let lastScroll = window.scrollY;
  const setX = gsap.quickSetter(track, "x", "px");

  const tick = (time, deltaMs) => {
    const dt = Math.min(deltaMs / 1000, 0.1);
    const scroll = window.scrollY;
    const scrolled = scroll - lastScroll;
    lastScroll = scroll;
    // Held: no movement of its own, only the push of the scroll.
    const own = () => (held ? 0 : direction * baseSpeed * designPx());
    let target = own();
    if (options.includes("scroll") && scrolled !== 0 && Math.abs(scrolled) < MAX_STEP && dt > 0) {
      direction = scrolled > 0 ? -1 : 1;
      target = own() - (scrolled / dt) * SCROLL_PUSH;
    }
    speed += (target - speed) * Math.min(1, dt * EASE);
    x = gsap.utils.wrap(-loop, 0, x + speed * dt);
    setX(x);
  };

  const onResize = () => {
    const next = loopWidth();
    x *= next / loop;
    loop = next;
  };

  const events = new AbortController();
  const on = (type, handler) => marquee.addEventListener(type, handler, { signal: events.signal });
  if (options.includes("pause")) {
    // Keyboard focus also holds it; focus left by a click does not.
    const keyboardFocus = () => marquee.querySelector(":focus-visible") !== null;
    on("pointerenter", () => (held = true));
    on("pointerleave", () => (held = keyboardFocus()));
    on("focusin", (event) => (held = event.target.matches(":focus-visible") || marquee.matches(":hover")));
    on("focusout", () => requestAnimationFrame(() => (held = keyboardFocus() || marquee.matches(":hover"))));
  }

  gsap.ticker.add(tick);
  window.addEventListener("resize", onResize, { signal: events.signal });

  return () => {
    events.abort();
    gsap.ticker.remove(tick);
    gsap.set(track, { clearProps: "transform" });
    track.querySelectorAll("[aria-hidden='true']").forEach((clone) => clone.remove());
  };
}

export function initMarquees() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};
  const cleanups = [...document.querySelectorAll("[data-marquee]")].map(initMarquee);
  return () => cleanups.forEach((cleanup) => cleanup());
}
