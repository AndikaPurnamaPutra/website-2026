import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { designPx, typePx } from "./design-px.js";

// Pinned "What we do" section (Figma storyboard 1516:2229).
// Each scroll step makes the next service card active and swaps the image;
// the last step expands the image to fill the section.
// Timing, easing and scroll distance are not in Figma (approved proposal).

// Card geometry in Figma pixels (1440px frame).
const FIRST_TOP = 98; // active card top in frame 1
const LATER_TOP = 88; // active card top from frame 2 on
const PREVIOUS_GAP = 12; // card that moved up ends 12px above the active card (Figma: 76 → 88)
// Deck cards are scaled from their top edge and placed so their visible strip
// (the clipped title area) always ends `peek` px below the active card, as in
// Figma (16px and 32px), whatever the cards' heights. Text-sized: type scale.
const DECK = [
  { scale: 317 / 345, peek: 16, clip: 67.5 },
  { scale: 285 / 345, peek: 32, clip: 72.6 },
];


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
    // Cards that moved up stay in front, so the outgoing card slides away over
    // the incoming one instead of the incoming card popping in front of it.
    // Placed by its bottom edge so the gap stays 12px whatever its height (type
    // scale, like the card's text); with Figma's 283px card this is y -207.
    if (offset < 0) {
      return {
        y: (activeTop(active) - FIRST_TOP) * px - PREVIOUS_GAP * typePx() - height,
        scale: 1,
        clipPath: fullClip,
        autoAlpha: offset === -1 ? 1 : 0,
        zIndex: 5,
      };
    }
    const deck = DECK[Math.min(offset, DECK.length) - 1];
    const t = typePx();
    const activeBottom = activeTop(active) * px + cards[active].offsetHeight;
    return {
      y: activeBottom + (deck.peek - deck.clip * deck.scale) * t - FIRST_TOP * px,
      scale: deck.scale,
      // The visible strip shows the card title, so it follows the type scale.
      clipPath: `inset(0px 0px ${height - deck.clip * t}px 0px)`,
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
    cards.forEach((card, i) =>
      gsap.set(card, { ...stateVars(i, 0), zIndex: cardState(i, 0).zIndex, transformOrigin: "50% 0%" }),
    );

    const timeline = gsap.timeline({
      defaults: { duration: 1, ease: reduceMotion ? "steps(1)" : "power2.inOut" },
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => `+=${window.innerHeight * steps}`,
        pin: true,
        scrub: reduceMotion ? true : 0.5,
        // Snap to the next step in the scroll direction. inertia: false keeps a
        // fast flick from projecting past several steps. The snap starts right
        // away and eases out (fast start, soft landing), so there is no pause
        // after the scroll stops (same feel as the Motto section).
        snap: {
          snapTo: "labelsDirectional",
          inertia: false,
          delay: 0,
          duration: { min: 0.6, max: 0.9 },
          ease: "power3.out",
        },
        invalidateOnRefresh: true,
        onRefresh: (self) => {
          if (self.animation.time() < steps - 1) clearMedia();
        },
      },
    });

    // From 2px before the pin (step 0 sits right at its start) until it ends,
    // a 2px dark edge above the section (_services.scss) covers the sub-pixel seam
    // its fractional page position can leave at the top of the screen.
    ScrollTrigger.create({
      trigger: section.parentElement,
      start: "top top+=2",
      end: "bottom bottom",
      toggleClass: { targets: section, className: "is-pinned" },
    });

    // Step 0 lives in the timeline too, so it is re-measured on refresh (card
    // heights change once the web fonts have loaded or the type scale changes).
    cards.forEach((card, i) => timeline.set(card, stateVars(i, 0), 0));
    timeline.addLabel("step0", 0);

    for (let active = 1; active < cards.length; active++) {
      const at = active - 1;
      // Stacking order switches just after a step starts so the incoming card
      // is in front while it moves (a set exactly at 0 would apply on load).
      cards.forEach((card, i) => {
        timeline.set(card, { zIndex: cardState(i, active).zIndex }, at + 0.001);
        timeline.to(card, stateVars(i, active), at);
      });
      // The new image is revealed from the bottom like a curtain, settling from
      // a slight zoom, over the previous image (no half-transparent overlap).
      timeline.fromTo(
        images[active],
        { autoAlpha: 1, clipPath: "inset(100% 0% 0% 0%)", scale: 1.08 },
        { clipPath: "inset(0% 0% 0% 0%)", scale: 1, ease: reduceMotion ? "steps(1)" : "power3.inOut" },
        at,
      );
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

  // Card heights depend on the web fonts; re-measure once they are ready.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());

  return () => {
    window.removeEventListener("load", refresh);
    ctx.revert();
    section.classList.remove("is-enhanced");
  };
}
