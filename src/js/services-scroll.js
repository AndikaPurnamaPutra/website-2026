import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Pinned "What we do" section (Figma storyboard 1516:2229).
// Each scroll step makes the next service card active and swaps the image;
// the last step expands the image to fill the section.
// Timing, easing and scroll distance are not in Figma (approved proposal).

// Card geometry in Figma pixels (1440px frame).
const FIRST_TOP = 98; // active card top in frame 1
const LATER_TOP = 88; // active card top from frame 2 on
const PREVIOUS_TOP = -207; // card that moved up
const DECK = [
  { scale: 317 / 345, top: -46, clip: 67.5 }, // relative to active card bottom
  { scale: 285 / 345, top: -28, clip: 72.6 },
];

// Same clamp as --px in _tokens.scss.
const designPx = () => Math.min(Math.max(window.innerWidth, 1280), 1920) / 1440;

export function initServicesScroll() {
  const section = document.querySelector("[data-services]");
  if (!section) return () => {};

  const cards = [...section.querySelectorAll(".services__card")];
  const images = [...section.querySelectorAll(".services__image")];
  const media = section.querySelector(".services__media");
  const fade = section.querySelector(".services__fade");
  const label = section.querySelector(".services__label");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const steps = cards.length; // service changes + final fullscreen step

  section.classList.add("is-enhanced");

  const activeTop = (active) => (active === 0 ? FIRST_TOP : LATER_TOP);

  // Position of card `i` while card `active` is in front. Values are px offsets
  // from the card's CSS anchor (top: FIRST_TOP).
  const cardState = (i, active) => {
    const px = designPx();
    const offset = i - active;
    const height = cards[i].offsetHeight;
    const fullClip = "inset(0px 0px 0px 0px)";

    if (offset === 0) {
      return { y: (activeTop(active) - FIRST_TOP) * px, scale: 1, clipPath: fullClip, autoAlpha: 1, zIndex: 4 };
    }
    if (offset < 0) {
      return {
        y: (PREVIOUS_TOP - FIRST_TOP) * px,
        scale: 1,
        clipPath: fullClip,
        autoAlpha: offset === -1 ? 1 : 0,
        zIndex: 3,
      };
    }
    const deck = DECK[Math.min(offset, DECK.length) - 1];
    const activeBottom = activeTop(active) * px + cards[active].offsetHeight;
    return {
      y: activeBottom + deck.top * px - FIRST_TOP * px,
      scale: deck.scale,
      clipPath: `inset(0px 0px ${height - deck.clip * px}px 0px)`,
      autoAlpha: offset <= DECK.length ? 1 : 0,
      zIndex: offset <= DECK.length ? 3 - offset : 0,
    };
  };

  // Function values are re-read on resize (invalidateOnRefresh).
  const stateVars = (i, active) =>
    Object.fromEntries(
      ["y", "scale", "clipPath", "autoAlpha"].map((key) => [key, () => cardState(i, active)[key]]),
    );

  const clearMedia = () => gsap.set(media, { clearProps: "inset,top,right,bottom,left,borderRadius" });

  const ctx = gsap.context(() => {
    cards.forEach((card, i) => gsap.set(card, { ...stateVars(i, 0), zIndex: cardState(i, 0).zIndex }));

    const timeline = gsap.timeline({
      defaults: { duration: 1, ease: reduceMotion ? "steps(1)" : "power2.inOut" },
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => `+=${window.innerHeight * steps}`,
        pin: true,
        scrub: reduceMotion ? true : 0.6,
        // Snap to the next step in the scroll direction. inertia: false keeps a
        // fast flick from projecting past several steps.
        snap: { snapTo: "labelsDirectional", inertia: false, duration: { min: 0.2, max: 0.6 }, ease: "power1.inOut" },
        invalidateOnRefresh: true,
        onRefresh: (self) => {
          if (self.animation.time() < steps - 1) clearMedia();
        },
      },
    });

    timeline.addLabel("step0", 0);

    for (let active = 1; active < cards.length; active++) {
      const at = active - 1;
      // Stacking order switches just after a step starts so the incoming card
      // is in front while it moves (a set exactly at 0 would apply on load).
      cards.forEach((card, i) => {
        timeline.set(card, { zIndex: cardState(i, active).zIndex }, at + 0.001);
        timeline.to(card, stateVars(i, active), at);
      });
      timeline.fromTo(images[active], { autoAlpha: 0, scale: 1.05 }, { autoAlpha: 1, scale: 1 }, at);
      if (active === 1) {
        timeline.to(fade, { autoAlpha: 1 }, at);
        timeline.to(label, { autoAlpha: 0 }, at);
      }
      timeline.addLabel(`step${active}`, active);
    }

    // Final step: the last image grows to fill the section (storyboard "Fullscreen").
    // Before this step the inline values are cleared so the scaled CSS inset
    // applies again (GSAP would otherwise keep px values from the last size).
    timeline.to(
      media,
      { top: 0, right: 0, bottom: 0, left: 0, borderRadius: 0, onReverseComplete: clearMedia },
      steps - 1,
    );
    timeline.addLabel("fullscreen", steps);
  }, section);

  const refresh = () => ScrollTrigger.refresh();
  window.addEventListener("load", refresh, { once: true });

  return () => {
    window.removeEventListener("load", refresh);
    ctx.revert();
    section.classList.remove("is-enhanced");
  };
}
