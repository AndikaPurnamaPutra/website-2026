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

export function initSmoothScroll() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  // Matched to the references (measured: one wheel tick glides ±35 frames,
  // first step 7–8px on drone.riotters.com and leoparpeix.com).
  lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
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
