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
const RADIUS = 4; // --radius-sm (Figma 4px, layout scale)
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
  // No snap (user decision): each step has a rest zone where the frame holds
  // while the scroll goes on, so the scroll stays free and smooth yet a step
  // is easy to stop on. Transitions keep a length of 1; REST is added between
  // them (half before the first, half after the last), ≈40% of each step.
  const REST = 0.6;
  const stepTime = (n) => n * (1 + REST) + REST / 2;
  const restTime = (k) => (k === 0 ? REST / 4 : k === steps ? steps * (1 + REST) - REST / 4 : k * (1 + REST));

  section.classList.add("is-enhanced");

  const activeTop = (active) => (active === 0 ? FIRST_TOP : LATER_TOP);

  // Position of card `i` while card `active` is in front. Values are px offsets
  // from the card's CSS anchor (top: FIRST_TOP).
  // Corners: the clip carries the card's radius (--radius-sm, 4px in Figma)
  // divided by the card's scale, so on screen every corner stays 4px: scaled
  // deck cards and their clipped strips no longer show other corners (the
  // card's own, scaled-down radius is always within the clip).
  // The clip is tweened as two numbers (bottom inset, corner) and written out
  // on every update: tweening the clip-path string itself starts from the
  // browser's shortened form ("inset(0px round 4px)"), whose numbers do not
  // line up with the target, and made the card width jump.
  const corner = (scale) => (RADIUS * designPx()) / scale;
  const cardState = (i, active) => {
    const px = designPx();
    const offset = i - active;
    const height = cards[i].offsetHeight;

    if (offset === 0) {
      return { y: (activeTop(active) - FIRST_TOP) * px, scale: 1, clipBottom: 0, clipRound: corner(1), autoAlpha: 1, zIndex: 4 };
    }
    // Cards that moved up stay in front, so the outgoing card slides away over
    // the incoming one instead of the incoming card popping in front of it.
    // Placed by its bottom edge so the gap stays 12px whatever its height (type
    // scale, like the card's text); with Figma's 283px card this is y -207.
    if (offset < 0) {
      return {
        y: (activeTop(active) - FIRST_TOP) * px - PREVIOUS_GAP * typePx() - height,
        scale: 1,
        clipBottom: 0,
        clipRound: corner(1),
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
      clipBottom: height - deck.clip * t,
      clipRound: corner(deck.scale),
      autoAlpha: offset <= DECK.length ? 1 : 0,
      zIndex: offset <= DECK.length ? 3 - offset : 0,
    };
  };

  // Function values are re-read on resize (invalidateOnRefresh).
  const stateVars = (i, active) =>
    Object.fromEntries(["y", "scale", "autoAlpha"].map((key) => [key, () => cardState(i, active)[key]]));
  const clips = cards.map((card) => ({ card, bottom: 0, round: 0 }));
  const drawClips = () =>
    clips.forEach(({ card, bottom, round }) => {
      card.style.clipPath = `inset(0px 0px ${bottom}px 0px round ${round}px)`;
    });
  const clipVars = (i, active) => ({
    bottom: () => cardState(i, active).clipBottom,
    round: () => cardState(i, active).clipRound,
  });

  const clearMedia = () => gsap.set(media, { clearProps: "inset,top,right,bottom,left,borderRadius" });

  const ctx = gsap.context(() => {
    cards.forEach((card, i) => {
      gsap.set(card, { ...stateVars(i, 0), zIndex: cardState(i, 0).zIndex, transformOrigin: "50% 0%" });
      gsap.set(clips[i], clipVars(i, 0));
    });
    drawClips();

    const timeline = gsap.timeline({
      defaults: { duration: 1, ease: reduceMotion ? "steps(1)" : "power2.inOut" },
      onUpdate: drawClips,
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => `+=${window.innerHeight * steps}`,
        pin: true,
        scrub: reduceMotion ? true : 0.8,
        invalidateOnRefresh: true,
        onRefresh: (self) => {
          if (self.animation.time() < stepTime(steps - 1)) clearMedia();
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
    cards.forEach((card, i) => {
      timeline.set(card, stateVars(i, 0), 0);
      timeline.set(clips[i], clipVars(i, 0), 0);
    });
    for (let k = 0; k < steps; k++) timeline.addLabel(`step${k}`, restTime(k));

    for (let active = 1; active < cards.length; active++) {
      const at = stepTime(active - 1);
      // Stacking order switches just after a step starts so the incoming card
      // is in front while it moves (a set exactly at 0 would apply on load).
      cards.forEach((card, i) => {
        timeline.set(card, { zIndex: cardState(i, active).zIndex }, at + 0.001);
        timeline.to(card, stateVars(i, active), at);
        timeline.to(clips[i], clipVars(i, active), at);
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
    }

    // Final step: the last image grows to fill the section (storyboard "Fullscreen").
    // Before this step the inline values are cleared so the scaled CSS inset
    // applies again (GSAP would otherwise keep px values from the last size).
    timeline.to(
      media,
      { top: 0, right: 0, bottom: 0, left: 0, borderRadius: 0, onReverseComplete: clearMedia },
      stepTime(steps - 1),
    );
    timeline.addLabel("fullscreen", restTime(steps));
    // The last rest zone runs to the end of the pin.
    timeline.to({}, { duration: REST / 2 }, stepTime(steps - 1) + 1);
  }, section);

  const refresh = () => ScrollTrigger.refresh();
  window.addEventListener("load", refresh, { once: true });

  // Card heights depend on the web fonts; re-measure once they are ready.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());

  return () => {
    window.removeEventListener("load", refresh);
    ctx.revert();
    cards.forEach((card) => card.style.removeProperty("clip-path"));
    section.classList.remove("is-enhanced");
  };
}
