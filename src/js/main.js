import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import barba from "@barba/core";
import { initHeroClock } from "./hero-clock.js";
import { initHeroHighlight } from "./hero-highlight.js";
import { initHeroShowreel } from "./hero-showreel.js";
import { initStatementInk } from "./statement-ink.js";
import { initCoin3d } from "./coin-3d.js";
import { initServicesScroll } from "./services-scroll.js";
import { initInviewVideos } from "./inview-videos.js";
import { initWorkCarousels } from "./work-carousel.js";
import { initMarquees } from "./marquee.js";
import { initMilestoneCounter } from "./milestone-counter.js";
import { initMottoScroll } from "./motto-scroll.js";
import { initPrinciplesScroll } from "./principles-scroll.js";
import { initAboutGallery } from "./about-gallery.js";
import { initHeader } from "./header.js";
import { initWorkMenu } from "./work-menu.js";
import { initFooterForm } from "./footer-form.js";
import { initFooterReveal } from "./footer-reveal.js";
import { initSmoothScroll } from "./smooth-scroll.js";
import { initBackLink } from "./back-link.js";
import { initContactForm } from "./contact-form.js";
import { initScrollMemory } from "./scroll-memory.js";

gsap.registerPlugin(ScrollTrigger);

let cleanups = [];

function initPage() {
  // Initialize page-specific animations here.
  cleanups.push(initSmoothScroll());
  cleanups.push(initHeroClock());
  cleanups.push(initHeroHighlight());
  cleanups.push(initHeroShowreel());
  cleanups.push(initCoin3d());
  cleanups.push(initStatementInk());
  cleanups.push(initServicesScroll());
  cleanups.push(initWorkCarousels());
  cleanups.push(initMarquees());
  cleanups.push(initMilestoneCounter());
  cleanups.push(initMottoScroll());
  cleanups.push(initPrinciplesScroll());
  // After the Principles pin, so its pin spacer is measured.
  cleanups.push(initAboutGallery());
  // After the pinned sections so their pin spacers exist.
  cleanups.push(initInviewVideos());
  // After the services pin so its pin spacer can be measured.
  cleanups.push(initHeader());
  cleanups.push(initWorkMenu());
  cleanups.push(initFooterForm());
  cleanups.push(initFooterReveal());
  cleanups.push(initBackLink());
  cleanups.push(initContactForm());
  // Last, so every pin spacer exists before the scroll position is restored.
  cleanups.push(initScrollMemory());
}

function destroyPage() {
  // Clean up page-specific animations here.
  cleanups.forEach((cleanup) => cleanup());
  cleanups = [];
}

initPage();
