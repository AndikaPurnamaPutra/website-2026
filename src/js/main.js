import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initPreloader } from "./preloader.js";
import { initHeroIntro } from "./hero-intro.js";
import { initHeroClock } from "./hero-clock.js";
import { initHeroHighlight } from "./hero-highlight.js";
import { initHeroShowreel } from "./hero-showreel.js";
import { initStatementInk } from "./statement-ink.js";
import { initPageTheme } from "./page-theme.js";
import { initCoin3d } from "./coin-3d.js";
import { initServicesScroll } from "./services-scroll.js";
import { initInviewVideos } from "./inview-videos.js";
import { initWorkCarousels } from "./work-carousel.js";
import { initOurWorkIntro } from "./our-work-intro.js";
import { initWorkCursor } from "./work-cursor.js";
import { initMarquees } from "./marquee.js";
import { initTrustedIntro } from "./trusted-intro.js";
import { initMilestoneCounter } from "./milestone-counter.js";
import { initMottoScroll } from "./motto-scroll.js";
import { initPrinciplesScroll } from "./principles-scroll.js";
import { initAboutGallery } from "./about-gallery.js";
import { initAboutIntro } from "./about-intro.js";
import { initAboutTeam } from "./about-team.js";
import { initHeader } from "./header.js";
import { initWorkMenu } from "./work-menu.js";
import { initMobileMenu } from "./mobile-menu.js";
import { initFooterForm } from "./footer-form.js";
import { initFooterReveal } from "./footer-reveal.js";
import { initSmoothScroll } from "./smooth-scroll.js";
import { initBackLink } from "./back-link.js";
import { initContactForm } from "./contact-form.js";
import { initContactIntro } from "./contact-intro.js";
import { initContactOffice } from "./contact-office.js";
import { initScrollMemory } from "./scroll-memory.js";
import { initPageTransitions } from "./page-transition.js";

gsap.registerPlugin(ScrollTrigger);

let cleanups = [];

// Set up again for each page shown by a page transition (src/js/page-
// transition.js), and torn down before it leaves. The smooth scroll stays for
// the whole visit; the preloader and the scroll memory are for the first
// page only (`first`).
function initPage(first) {
  // After the smooth scroll, which it holds while it plays.
  if (first) cleanups.push(initPreloader());
  cleanups.push(initHeroIntro());
  cleanups.push(initHeroClock());
  cleanups.push(initHeroHighlight());
  cleanups.push(initHeroShowreel());
  cleanups.push(initCoin3d());
  cleanups.push(initStatementInk());
  cleanups.push(initServicesScroll());
  cleanups.push(initWorkCarousels());
  cleanups.push(initOurWorkIntro());
  cleanups.push(initWorkCursor());
  cleanups.push(initMarquees());
  cleanups.push(initTrustedIntro());
  cleanups.push(initMilestoneCounter());
  cleanups.push(initMottoScroll());
  cleanups.push(initPrinciplesScroll());
  // After the Principles pin, so its pin spacer is measured.
  cleanups.push(initAboutGallery());
  cleanups.push(initAboutIntro());
  cleanups.push(initAboutTeam());
  // After the pinned sections so their pin spacers exist.
  cleanups.push(initInviewVideos());
  // After the services pin so its pin spacer can be measured.
  cleanups.push(initHeader());
  // After the pins above Our Work (Services), which move it down.
  cleanups.push(initPageTheme());
  cleanups.push(initWorkMenu());
  cleanups.push(initMobileMenu());
  cleanups.push(initFooterForm());
  cleanups.push(initFooterReveal());
  cleanups.push(initBackLink());
  cleanups.push(initContactForm());
  cleanups.push(initContactIntro());
  cleanups.push(initContactOffice());
  // Last, so every pin spacer exists before the scroll position is restored.
  if (first) cleanups.push(initScrollMemory());
}

function destroyPage() {
  // Clean up page-specific animations here.
  cleanups.forEach((cleanup) => cleanup());
  cleanups = [];
}

initSmoothScroll();
initPage(true);
initPageTransitions({ setUp: () => initPage(false), tearDown: destroyPage });
