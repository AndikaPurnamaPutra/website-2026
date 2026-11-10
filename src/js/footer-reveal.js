import gsap from "gsap";

// The footer is uncovered from behind the section above it, like a curtain
// going up (user decision, reference sstr.tech): tucked behind that section
// (Motto / .policy / .contact paint above it), it moves up at half the
// scroll speed, as measured on sstr.tech (not still, not pulled).
const LAG = 0.5; // share of the scroll the footer stays behind
// A dark layer over it fades as it comes up, from dark to light (as on
// sstr.tech; src/scss/components/_footer.scss).
const SHADE = 0.5;

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
  // Over the footer's height, or over one screen for a footer taller than
  // the screen (phones and tablets: 816 of 699 on an iPhone 13). Over its
  // whole height its top would still be behind the section above when it
  // left the screen, so its logo and form were never seen (user report; it
  // then just scrolled with the page, user: "add the animation there too").
  // Over one screen it is uncovered just as its top reaches the top of the
  // screen. Checked on every refresh.
  const reach = () => Math.min(footer.offsetHeight, window.innerHeight);

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

  const tween = gsap.fromTo(
    footer,
    { y: () => -LAG * reach(), "--footer-shade": SHADE },
    {
      y: 0,
      "--footer-shade": 0,
      ease: "none",
      scrollTrigger: {
        trigger: above,
        start: "bottom bottom",
        end: () => `+=${reach()}`,
        scrub: true,
        invalidateOnRefresh: true,
        // Measured after the pins above (Services, Motto, the showreel), which
        // lengthen the page: measured before them, it ended about 7,500px too
        // early and the footer no longer came up from behind.
        refreshPriority: -1,
      },
    },
  );

  return () => {
    tween.scrollTrigger?.kill();
    tween.kill();
    gsap.set(footer, { clearProps: "transform,--footer-shade" });
  };
}
