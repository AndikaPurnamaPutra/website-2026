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
  // Not for a footer taller than the screen (phones: 816 of 699 on an
  // iPhone 13): its top was still behind the section above while it rose,
  // and had left the screen by the time it was uncovered, so its logo, the
  // form's label and the coin were never seen (user report). It scrolls
  // with the page there. Checked on every refresh.
  const tall = () => footer.offsetHeight > window.innerHeight;
  const tween = gsap.fromTo(
    footer,
    { y: () => (tall() ? 0 : -LAG * footer.offsetHeight), "--footer-shade": () => (tall() ? 0 : SHADE) },
    {
      y: 0,
      "--footer-shade": 0,
      ease: "none",
      scrollTrigger: {
        trigger: above,
        start: "bottom bottom",
        end: () => `+=${footer.offsetHeight}`,
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
