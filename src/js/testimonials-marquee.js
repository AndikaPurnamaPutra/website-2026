import gsap from "gsap";

// Trusted Clients testimonials: endless marquee to the left (approved proposal,
// not in Figma). ~40 Figma px per second, slows to a stop on hover, and stays
// static (Figma layout) with reduced motion.
const SPEED = 40; // Figma px per second

const designPx = () => Math.min(Math.max(window.innerWidth, 1280), 1920) / 1440;

export function initTestimonialsMarquee() {
  const marquee = document.querySelector("[data-marquee]");
  if (!marquee || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  const track = marquee.querySelector("[data-marquee-track]");
  const originals = [...track.children];

  // A second copy of the cards makes the loop seamless.
  originals.forEach((card) => {
    const clone = card.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    clone.querySelectorAll("a").forEach((link) => link.setAttribute("tabindex", "-1"));
    track.append(clone);
  });

  // Distance from the first card to its copy (one set including the gap).
  const loopWidth = () => track.children[originals.length].offsetLeft - track.children[0].offsetLeft;

  let tween;
  const build = () => {
    const progress = tween ? tween.progress() : 0;
    tween?.kill();
    const distance = loopWidth();
    tween = gsap.fromTo(
      track,
      { x: 0 },
      { x: -distance, duration: distance / (SPEED * designPx()), ease: "none", repeat: -1 },
    );
    tween.progress(progress);
  };

  const slowDown = () => gsap.to(tween, { timeScale: 0, duration: 0.4, overwrite: true });
  const speedUp = () => gsap.to(tween, { timeScale: 1, duration: 0.4, overwrite: true });

  build();
  marquee.addEventListener("mouseenter", slowDown);
  marquee.addEventListener("mouseleave", speedUp);
  window.addEventListener("resize", build);

  return () => {
    marquee.removeEventListener("mouseenter", slowDown);
    marquee.removeEventListener("mouseleave", speedUp);
    window.removeEventListener("resize", build);
    tween?.kill();
    gsap.set(track, { clearProps: "transform" });
    track.querySelectorAll("[aria-hidden='true']").forEach((clone) => clone.remove());
  };
}
