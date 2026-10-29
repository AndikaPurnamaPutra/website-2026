import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Smooth scrolling for the whole site (user decision, like the references
// thewatch.60fps.fr and drone.riotters.com): the page glides with a little
// inertia, and everything tied to the scroll (pins, the 3D coin, the footer
// reveal) glides with it, so nothing moves in steps of the mouse wheel.
// Driven by GSAP's ticker so ScrollTrigger and Lenis share one frame.
// Off with reduced motion and on touch screens (native scrolling there).
let lenis = null;

// Other modules can take over wheel events (e.g. Motto: one swipe moves at
// most one step). A filter returning false swallows the event: Lenis ignores
// it and the browser does not scroll either.
const wheelFilters = new Set();
export function addWheelFilter(filter) {
  wheelFilters.add(filter);
  return () => wheelFilters.delete(filter);
}
const virtualScroll = (data) => {
  for (const filter of wheelFilters) {
    if (filter(data) === false) {
      if (data.event.cancelable) data.event.preventDefault();
      return false;
    }
  }
  return true;
};

export function initSmoothScroll() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  // First matched to the references (drone.riotters.com, leoparpeix.com:
  // lerp 0.085, wheelMultiplier 0.9). Made a little heavier (user decision,
  // 0.6 felt too heavy): one wheel tick moves a sixth less and glides a
  // touch longer, so the scroll-tied animations are easier to follow
  // without scrolling in small steps.
  lenis = new Lenis({ lerp: 0.08, wheelMultiplier: 0.75, virtualScroll });
  // For checking in the browser console: window.lenis.
  window.lenis = lenis;
  lenis.on("scroll", ScrollTrigger.update);
  const tick = (time) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  return () => {
    gsap.ticker.remove(tick);
    lenis.destroy();
    lenis = null;
    delete window.lenis;
  };
}

// The Lenis instance (null when off: reduced motion).
export const getSmoothScroll = () => lenis;

// Pauses and resumes the smooth scroll (e.g. while a pop-up is open).
export const stopSmoothScroll = () => lenis?.stop();
export const startSmoothScroll = () => lenis?.start();
