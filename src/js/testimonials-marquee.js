import gsap from "gsap";
import { designPx } from "./design-px.js";

// Trusted Clients testimonials: endless marquee to the left (approved proposal,
// not in Figma). ~40 Figma px per second, keeps moving on hover (user
// decision), and stays static (Figma layout) with reduced motion.
const SPEED = 40; // Figma px per second


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

  build();
  window.addEventListener("resize", build);

  return () => {
    window.removeEventListener("resize", build);
    tween?.kill();
    gsap.set(track, { clearProps: "transform" });
    track.querySelectorAll("[aria-hidden='true']").forEach((clone) => clone.remove());
  };
}
