import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import barba from "@barba/core";
import { initHeroClock } from "./hero-clock.js";
import { initServicesScroll } from "./services-scroll.js";
import { initWorkCarousels } from "./work-carousel.js";
import { initTestimonialsMarquee } from "./testimonials-marquee.js";
import { initMilestoneCounter } from "./milestone-counter.js";

gsap.registerPlugin(ScrollTrigger);

let cleanups = [];

function initPage() {
  // Initialize page-specific animations here.
  cleanups.push(initHeroClock());
  cleanups.push(initServicesScroll());
  cleanups.push(initWorkCarousels());
  cleanups.push(initTestimonialsMarquee());
  cleanups.push(initMilestoneCounter());
}

function destroyPage() {
  // Clean up page-specific animations here.
  cleanups.forEach((cleanup) => cleanup());
  cleanups = [];
}

initPage();
