import barba from "@barba/core";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getSmoothScroll, startSmoothScroll, stopSmoothScroll } from "./smooth-scroll.js";

// Page transitions (docs/implementation/31-page-transitions.md; user: moving
// between pages should feel as if it never leaves the page). The pages stay
// separate files; Barba fetches the next one and swaps <main> only, so the
// navbar and the footer stay. A fade with the site's blur (user's pick over a
// full panel or a page rising over the other; a curtain of columns was tried
// and dropped): the old content rises a little and blurs away, as the
// preloader's year; the page is set up anew at the top behind it; the new
// content rises into place and comes into focus, as motto 1. Back and
// forward return to where the page was left. With reduced motion it only
// fades.
const OUT = 0.5; // s
const IN = 1; // s
const SHIFT_OUT = 16; // px the old content rises as it goes
const SHIFT = 40; // px the new content rises into place
const BLUR = 8; // px

// Whether a page has been shown by a transition (the Back link on the
// Privacy and Terms bars goes back then: src/js/back-link.js).
let moved = false;
export const movedWithinSite = () => moved;

// Work that would make a transition stutter waits until the new page has
// shown (at once when no transition is running).
let showing = false;
let waiting = [];
export function afterPageShown(work) {
  if (showing) waiting.push(work);
  else work();
}
const shown = () => {
  showing = false;
  const work = waiting;
  waiting = [];
  work.forEach((run) => run());
};

export function initPageTransitions({ setUp, tearDown }) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Scroll position of each page left, for back and forward.
  const positions = new Map();

  barba.init({
    // Links that stay ordinary: placeholders ("#"), downloads, and links
    // marked data-barba-prevent (mailto:, tel:, new tabs and other sites
    // are left to the browser by Barba itself).
    prevent: ({ el }) => el.getAttribute("href") === "#" || el.hasAttribute("download"),
    // The pages are small; no prefetch on hover for now.
    prefetchIgnore: true,
    transitions: [
      {
        name: "quiet",
        async leave({ current }) {
          positions.set(current.url.href, window.scrollY);
          stopSmoothScroll();
          // The page turns light as it fades, in one move (left from a dark
          // section, it faded out and only then turned light; user: rough).
          document.body.classList.remove("is-dark");
          // The 3D coin is drawn on its own layer over the page (src/js/
          // coin-scene.js), so it goes with it (it stayed until the page was
          // gone; user). Its canvas: the layer's opacity is set each frame.
          await gsap.to([...leaving(current.container), ...document.querySelectorAll(".coin-stage canvas")], {
            opacity: 0,
            y: reduceMotion ? 0 : -SHIFT_OUT,
            filter: reduceMotion ? "none" : `blur(${BLUR}px)`,
            duration: reduceMotion ? 0.2 : OUT,
            ease: "power2.in",
          });
          tearDown();
        },
        async enter({ current, next, trigger }) {
          moved = true;
          showing = true;
          // Gone before the new page is set up: Barba removes it only after
          // this, and its parts were found and set up again.
          current.container.remove();
          const page = new DOMParser().parseFromString(next.html, "text/html");
          updateHead(page);
          swapHeader(page);
          // Back and forward: where the page was; otherwise the top.
          const back = trigger === "back" || trigger === "forward" || trigger === "popstate";
          const top = back ? positions.get(next.url.href) ?? 0 : 0;
          // Hidden by opacity, not visibility (hidden so, the page was laid
          // out and painted only as it showed: a long frame as the fade
          // began).
          gsap.set(next.container, { opacity: 0 });
          scrollTo(0);
          setUp();
          ScrollTrigger.refresh();
          if (top) scrollTo(top);
          // Shown once the heavy first frames of the new page are over (its
          // set-up, the pictures in view decoded): animated while they ran,
          // the fade in stuttered (user).
          await settle(next.container);
          // Only what is on screen moves (the whole page moved, a layer the
          // page's full height was drawn: long frames as it began).
          const parts = inView(next.container);
          gsap.set(parts, { opacity: 0 });
          gsap.set(next.container, { clearProps: "opacity" });
          // The hero text rises with it (src/js/hero-intro.js).
          document.dispatchEvent(new CustomEvent("page:reveal"));
          await gsap.fromTo(
            parts,
            { opacity: 0, y: reduceMotion ? 0 : SHIFT, filter: reduceMotion ? "none" : `blur(${BLUR}px)` },
            {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              duration: reduceMotion ? 0.2 : IN,
              ease: "power3.out",
              clearProps: "transform,opacity,filter",
            },
          );
          startSmoothScroll();
          // Measured again once the new page's fonts and pictures are in.
          ScrollTrigger.refresh();
          shown();
        },
      },
    ],
  });
}

// The page's sections (and the footer) on screen.
function inView(container) {
  const parts = [...container.children, document.querySelector(".site-footer")].filter(Boolean);
  return parts.filter((part) => {
    const box = part.getBoundingClientRect();
    return box.bottom > 0 && box.top < window.innerHeight && box.height > 0;
  });
}

// What goes as the page leaves: the parts on screen, but a section pinned to
// the screen (Services, Motto) by its pinned element itself: moved or blurred
// through a part around it, it lost its place on the screen and jumped away.
function leaving(container) {
  return inView(container).flatMap((part) => {
    const pinned = [...part.querySelectorAll(".pin-spacer > *")].filter(
      (el) => getComputedStyle(el).position === "fixed",
    );
    return pinned.length ? pinned : [part];
  });
}

// Straight to a position, the smooth scroll too.
function scrollTo(top) {
  const lenis = getSmoothScroll();
  if (lenis) lenis.scrollTo(top, { immediate: true, force: true });
  window.scrollTo(0, top);
}

// The title is set by Barba; the description, Open Graph, Twitter Card and
// canonical tags are taken from the new page too.
const HEAD_TAGS = 'meta[name="description"], meta[property^="og:"], meta[name^="twitter:"], link[rel="canonical"]';
function updateHead(next) {
  document.head.querySelectorAll(HEAD_TAGS).forEach((tag) => tag.remove());
  const anchor = document.head.querySelector("title");
  next.head.querySelectorAll(HEAD_TAGS).forEach((tag) => anchor.after(tag));
}

// Privacy Policy and Terms have their own bar (a Back link); the bar is
// swapped when the new page's differs.
function swapHeader(next) {
  const header = document.querySelector("[data-header]");
  const incoming = next.querySelector("[data-header]");
  // Its own classes, without the states set by scripts (is-…).
  const kind = (el) => [...el.classList].filter((name) => !name.startsWith("is-")).sort().join(" ");
  if (header && incoming && kind(header) !== kind(incoming)) header.replaceWith(document.importNode(incoming, true));
}

// The pictures in view decoded, then calm: CALM_FRAMES frames in a row
// that each took less than CALM_MS (the new page's own set-up that runs a
// moment later: the 3D coin, videos, split text). At most SETTLE_MAX.
const SETTLE_MAX = 1000; // ms
const CALM_FRAMES = 3;
const CALM_MS = 25;
function settle(container) {
  const start = performance.now();
  const inView = [...container.querySelectorAll("img")].filter((img) => {
    const box = img.getBoundingClientRect();
    return box.bottom > 0 && box.top < window.innerHeight && box.width > 0;
  });
  const decoded = Promise.all(inView.map((img) => img.decode().catch(() => {})));
  const limit = new Promise((resolve) => setTimeout(resolve, SETTLE_MAX));
  const calm = () =>
    new Promise((resolve) => {
      let last = performance.now();
      let quiet = 0;
      const frame = (time) => {
        quiet = time - last < CALM_MS ? quiet + 1 : 0;
        last = time;
        if (quiet >= CALM_FRAMES || time - start > SETTLE_MAX) resolve();
        else requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    });
  return Promise.race([decoded, limit]).then(calm);
}
