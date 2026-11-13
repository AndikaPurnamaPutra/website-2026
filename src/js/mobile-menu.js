import gsap from "gsap";
import { startSmoothScroll, stopSmoothScroll } from "./smooth-scroll.js";

// The phone menu (docs/implementation/32-responsive.md; references
// bramvanvugt.com, telhaclarke.com.au, art-yakushev.com): "Menu" in the bar
// opens a dark panel that comes down from the top as a curtain (as the
// preloader, the other way); its links rise one after another in their
// windows, as the hero text, and the contact and social links fade in below.
// It goes back up on Close, Esc or a link (a link's page transition then
// carries on, src/js/page-transition.js). The page does not scroll meanwhile.
// Only on phones (the toggle shows below 744px, _header.scss); with reduced
// motion it opens and closes at once.
const CURTAIN = 0.8; // s
const RISE = 110; // % of its height a link rises from

export function initMobileMenu() {
  const header = document.querySelector("[data-header]");
  const toggle = header?.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-mobile-menu]");
  if (!toggle || !menu) return () => {};

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const links = [...menu.querySelectorAll(".mobile-menu__link span")];
  const info = menu.querySelector(".mobile-menu__info");
  let open = false;
  let motion = null;

  // The page you are on (set for each page shown; the menu stays between
  // page transitions).
  // Clean URLs (/about; vercel.json cleanUrls): /about.html and /index
  // read as /about and /.
  const here = location.pathname.replace(/\.html$/, "").replace(/\/index$/, "/") || "/";
  menu.querySelectorAll(".mobile-menu__link").forEach((link) => {
    if (link.getAttribute("href") === here) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });

  const set = (next) => {
    if (next === open) return;
    open = next;
    toggle.setAttribute("aria-expanded", String(open));
    header.classList.toggle("is-menu-open", open);
    document.documentElement.style.overflow = open ? "hidden" : "";
    motion?.kill();
    if (open) {
      stopSmoothScroll();
      menu.hidden = false;
      if (reduceMotion) return;
      motion = gsap
        .timeline()
        .fromTo(menu, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: CURTAIN, ease: "power3.inOut" })
        .fromTo(links, { yPercent: RISE }, { yPercent: 0, duration: 1, ease: "power3.out", stagger: 0.06 }, CURTAIN * 0.45)
        .fromTo(info, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" }, CURTAIN * 0.8);
      menu.querySelector("a")?.focus({ preventScroll: true });
    } else {
      startSmoothScroll();
      const done = () => {
        menu.hidden = true;
        gsap.set([menu, info, ...links], { clearProps: "all" });
      };
      if (reduceMotion) return done();
      motion = gsap
        .timeline({ onComplete: done })
        .to(links, { yPercent: -RISE, duration: 0.4, ease: "power2.in", stagger: 0.03 }, 0)
        .to(info, { autoAlpha: 0, duration: 0.3 }, 0)
        .to(menu, { clipPath: "inset(0% 0% 100% 0%)", duration: CURTAIN * 0.85, ease: "power3.inOut" }, 0.15);
    }
  };

  const events = new AbortController();
  const on = (target, type, handler) => target.addEventListener(type, handler, { signal: events.signal });
  on(toggle, "click", () => set(!open));
  on(document, "keydown", (event) => {
    if (event.key !== "Escape" || !open) return;
    set(false);
    toggle.focus();
  });
  // A link closes it (the page transition, if any, runs meanwhile).
  on(menu, "click", (event) => {
    if (event.target.closest("a")) set(false);
  });
  // Back to the bar's links on a wider screen.
  const wide = window.matchMedia("(min-width: 744px)");
  on(wide, "change", () => wide.matches && set(false));

  // Torn down as a page transition leaves (the menu stays, outside <main>):
  // a closing menu finishes closing; an open one closes at once.
  return () => {
    events.abort();
    if (open) {
      motion?.kill();
      open = false;
      header.classList.remove("is-menu-open");
      toggle.setAttribute("aria-expanded", "false");
      document.documentElement.style.overflow = "";
      menu.hidden = true;
      startSmoothScroll();
      gsap.set([menu, info, ...links], { clearProps: "all" });
    }
  };
}
