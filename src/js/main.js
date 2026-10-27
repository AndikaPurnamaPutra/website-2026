import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import barba from "@barba/core";
import { initHeroClock } from "./hero-clock.js";
import { initHeroHighlight } from "./hero-highlight.js";
import { initHeroShowreel } from "./hero-showreel.js";
import { initServicesScroll } from "./services-scroll.js";
import { initInviewVideos } from "./inview-videos.js";
import { initWorkCarousels } from "./work-carousel.js";
import { initTestimonialsMarquee } from "./testimonials-marquee.js";
import { initMilestoneCounter } from "./milestone-counter.js";
import { initMottoScroll } from "./motto-scroll.js";
import { initHeader } from "./header.js";
import { initFooterForm } from "./footer-form.js";

gsap.registerPlugin(ScrollTrigger);

let cleanups = [];

function initPage() {
  // Initialize page-specific animations here.
  cleanups.push(initHeroClock());
  cleanups.push(initHeroHighlight());
  cleanups.push(initHeroShowreel());
  cleanups.push(initServicesScroll());
  cleanups.push(initWorkCarousels());
  cleanups.push(initTestimonialsMarquee());
  cleanups.push(initMilestoneCounter());
  cleanups.push(initMottoScroll());
  // After the pinned sections so their pin spacers exist.
  cleanups.push(initInviewVideos());
  // After the services pin so its pin spacer can be measured.
  cleanups.push(initHeader());
  cleanups.push(initFooterForm());
}

function destroyPage() {
  // Clean up page-specific animations here.
  cleanups.forEach((cleanup) => cleanup());
  cleanups = [];
}

initPage();
