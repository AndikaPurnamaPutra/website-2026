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

  // Matched to the references (user decision; 0.08 / 0.75 felt too heavy):
  // leoparpeix.com lerp 0.085, drone.riotters.com 0.1 with wheelMultiplier
  // 0.8, sstr.tech 0.1 with 1, jasminegunarto.com a fast-starting 3s glide
  // with 1. Here as sstr.tech, in the middle of them.
  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
  // For checking in the browser console: window.lenis.
  window.lenis = lenis;
  lenis.on("scroll", ScrollTrigger.update);
  const tick = (time) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  // The page's length as ScrollTrigger leaves it (pins add their scroll
  // length on every refresh): measured again at once, not 250 ms later as
  // Lenis would, so it never stops short of the end of the page (user: on a
  // first load the footer's dark layer hung and its content did not show).
  const resize = () => lenis?.resize();
  ScrollTrigger.addEventListener("refresh", resize);

  return () => {
    ScrollTrigger.removeEventListener("refresh", resize);
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
