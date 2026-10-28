import gsap from "gsap";

// The footer is uncovered from behind the section above it (reference from
// the user: sstr.tech): it starts a quarter of a screen higher, tucked behind
// that section (Motto / .policy paint above it), and moves slower than the
// page until it sits in place at the end of the page.
const SHIFT = 0.25; // of the screen height

export function initFooterReveal() {
  const footer = document.querySelector(".site-footer");
  if (!footer || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  const tween = gsap.fromTo(
    footer,
    { y: () => -SHIFT * window.innerHeight },
    {
      y: 0,
      ease: "none",
      scrollTrigger: {
        trigger: footer,
        start: "top bottom",
        end: "bottom bottom",
        scrub: true,
        invalidateOnRefresh: true,
      },
    },
  );

  return () => {
    tween.scrollTrigger?.kill();
    tween.kill();
    gsap.set(footer, { clearProps: "transform" });
  };
}
