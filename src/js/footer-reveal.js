import gsap from "gsap";
import { getSmoothScroll } from "./smooth-scroll.js";

// The footer is uncovered from behind the section above it, like a curtain
// going up (user decision, reference sstr.tech): tucked behind that section
// (Motto / .policy / .contact paint above it), it moves up at half the
// scroll speed, as measured on sstr.tech (not still, not pulled).
const LAG = 0.5; // share of the scroll the footer stays behind
// A dark layer over it fades as it comes up, from dark to light (as on
// sstr.tech; src/scss/components/_footer.scss).
const SHADE = 0.5;
// Share of the screen over which a footer taller than it comes up.
const TALL_REACH = 0.5;

export function initFooterReveal() {
  const footer = document.querySelector(".site-footer");
  if (!footer || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  // Shifted up by half its height when its top reaches the screen's bottom,
  // and back to 0 at the end of the page, so on screen it rises at half the
  // speed of the page. Measured from the end of the content
  // above (main), not from the footer itself: the footer's own position
  // includes the shift, which made the range start too early and the footer
  // move with the page for most of it.
  const above = footer.previousElementSibling;
  // Over the footer's height, or, for a footer taller than the screen
  // (phones: 816 of 699 on an iPhone 13), over half a screen: uncovered as
  // its top reaches the middle of the screen. Over its whole height its top
  // was still behind the section above when it left the screen, so its logo
  // and form were never seen (user report); over a whole screen they were
  // covered again as soon as one scrolled up a little from the bottom
  // (user). Checked on every refresh.
  const reach = () =>
    footer.offsetHeight > window.innerHeight ? window.innerHeight * TALL_REACH : footer.offsetHeight;

  // Touch screens scroll natively, on their own thread: moved by script, the
  // footer was a frame behind the page and caught up, which read as jerky on
  // phones (user). There the browser runs it itself, with the scroll
  // (scroll-driven animation on the section above's view timeline,
  // src/scss/components/_footer.scss); the script only measures the range.
  if (window.matchMedia("(hover: none)").matches && CSS.supports("animation-timeline: view()") && above) {
    above.style.setProperty("view-timeline-name", "--footer-above");
    const measure = () => footer.style.setProperty("--footer-reach", `${reach()}px`);
    measure();
    footer.classList.add("is-scroll-driven");
    const resize = new ResizeObserver(measure);
    resize.observe(footer);
    window.addEventListener("resize", measure);
    return () => {
      resize.disconnect();
      window.removeEventListener("resize", measure);
      above.style.removeProperty("view-timeline-name");
      footer.classList.remove("is-scroll-driven");
      footer.style.removeProperty("--footer-reach");
    };
  }

  // Read from where the section above actually ends on screen, every frame,
  // not from a scroll position worked out at the last refresh: the page's
  // length changes after it (pictures and videos loading, pins measured
  // again, a page shown by a transition), and a stale start left the footer
  // short of its place at the end of the page, its content still behind the
  // section above and the dark layer still over it (user: sometimes the
  // footer's content did not show, the dark layer hung). Measured so, the
  // footer is always fully up and clear at the bottom of the page.
  let height = reach();
  const measure = () => {
    height = reach();
  };
  const resize = new ResizeObserver(measure);
  resize.observe(footer);
  window.addEventListener("resize", measure);

  // Written straight to the style, not through GSAP: at its start the
  // footer sits exactly half its height up, and GSAP, reading a transform
  // back (src/js/coin-scene.js asked it for the footer's y), takes a shift of
  // half the height for "yPercent: -50" and kept it under every later y:
  // the footer stayed half its height behind the section above, its content
  // hidden and the dark layer over it (user found translate(0%, -50%) on it,
  // desktop Chrome, first load).
  const setY = (y) => {
    footer.style.transform = y ? `translate3d(0, ${y}px, 0)` : "";
  };
  let last = -1;
  const update = () => {
    if (!above || !height) return;
    const passed = window.innerHeight - above.getBoundingClientRect().bottom;
    // A pixel short of the end counts as the end: the smooth scroll eases
    // out and may stop a fraction of a pixel early, which left a trace of
    // the dark layer.
    const raw = Math.min(Math.max(passed / height, 0), 1);
    const progress = raw > 1 - 1 / height ? 1 : raw;
    if (progress === last) return;
    last = progress;
    setY(-LAG * height * (1 - progress));
    footer.style.setProperty("--footer-shade", String(SHADE * (1 - progress)));
  };
  // Updated with every move of the page, from more than one source, so it
  // never depends on one alone (user, desktop Chrome: on a first load the
  // dark layer hung and the footer's content did not show): GSAP's ticker
  // (after ScrollTrigger and the smooth scroll have moved the page) runs its
  // listeners one after the other with no guard, so an error in one added
  // earlier stops the later ones for that frame; the smooth scroll's own
  // scroll event and the browser's scroll event come on their own.
  const safeUpdate = () => {
    try {
      update();
    } catch {
      // Measured again on the next move.
    }
  };
  update();
  gsap.ticker.add(safeUpdate);
  const lenis = getSmoothScroll();
  lenis?.on("scroll", safeUpdate);
  window.addEventListener("scroll", safeUpdate, { passive: true });
  // The section above changing length (pictures, pins) without a scroll.
  const aboveResize = above ? new ResizeObserver(safeUpdate) : null;
  aboveResize?.observe(above);

  return () => {
    gsap.ticker.remove(safeUpdate);
    lenis?.off("scroll", safeUpdate);
    window.removeEventListener("scroll", safeUpdate);
    aboveResize?.disconnect();
    resize.disconnect();
    window.removeEventListener("resize", measure);
    footer.style.removeProperty("transform");
    footer.style.removeProperty("--footer-shade");
  };
}
