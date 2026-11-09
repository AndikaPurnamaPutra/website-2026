import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { designPx, typePx } from "./design-px.js";

// Pinned "What we do" section (Figma storyboard 1516:2229).
// Each scroll step makes the next service card active and swaps the image;
// the last step expands the image to fill the section.
// Timing, easing and scroll distance are not in Figma (approved proposal).
// Text comes in as the hero text (src/js/hero-intro.js; user): as the section
// arrives, the first image, dimmed since the page turned dark, lights up
// ("lights off, then the stage lights up"; user: no blur), the cards rise
// into place and their text and the label rise; at each step, the card
// coming to the front draws its line, then its tags and text rise. On their
// own clock (1s, power3.out); the arrival once (as About and Contact; user),
// each step's back when scrolled back up. The images open as
// a curtain from the bottom with depth, after floema.com's collections (user;
// a zoom with every curtain was too much: that version is kept on the branch
// services-media/zoom).

// Card geometry in Figma pixels (1440px frame).
const FIRST_TOP = 98; // active card top in frame 1
const LATER_TOP = 88; // active card top from frame 2 on
const PREVIOUS_GAP = 12; // card that moved up ends 12px above the active card (Figma: 76 → 88)
const RADIUS = 4; // --radius-sm (Figma 4px, layout scale)
const RISE = 200; // % of its height the text rises from (as the hero text)
const DESCENT = 25; // % of its height its window reaches below it, for descenders
const CARD_RISE = 40; // Figma px the cards rise from as the section arrives
// Images (as floema.com's collections, measured; user): straight with the
// scroll, linear, one curtain running into the next with no pause; a new one
// is revealed from the bottom while its picture rises from RAISE % below, more
// slowly than the curtain's edge, and the one it covers keeps rising, by
// LEAVE %, growing by GROW. No dimming. See
// docs/implementation/22-services-images.md.
const RAISE = 15;
const LEAVE = 10;
const GROW = 0.03;
// The exit, the same the other way (as in Motto): over the last EXIT of a
// screen of the pin the section rises faster and faster, by half that
// distance, so it already moves with the page when it is released. The page
// turns light as it starts (src/js/page-theme.js).
export const EXIT = 0.4; // of the screen height
// Deck cards are scaled from their top edge and placed so their visible strip
// (the clipped title area) always ends `peek` px below the active card, as in
// Figma (16px and 32px), whatever the cards' heights. Text-sized: type scale.
const DECK = [
  { scale: 317 / 345, peek: 16, clip: 67.5 },
  { scale: 285 / 345, peek: 32, clip: 72.6 },
];


// Only from the laptop width up (plan 32, step 3c): below it the section
// flows, cards and pictures one after another (_services.scss), with no pin
// and no steps. gsap.matchMedia sets the pin up and takes it down as the
// width crosses 1024 (an iPad turned round).
export function initServicesScroll() {
  const section = document.querySelector("[data-services]");
  if (!section) return () => {};
  const media = gsap.matchMedia();
  media.add("(min-width: 1024px)", () => setup(section));
  return () => media.revert();
}

function setup(section) {

  const cards = [...section.querySelectorAll(".services__card")];
  const images = [...section.querySelectorAll(".services__image")];
  const media = section.querySelector(".services__media");
  const fade = section.querySelector(".services__fade");
  const label = section.querySelector(".services__label");
  // The link over the pictures goes to the service in view.
  const link = section.querySelector("[data-services-link]");
  const targets = link ? JSON.parse(link.dataset.servicesLink) : [];
  const pointLink = (index) => {
    const [href, title] = targets[index] ?? [];
    if (!href || link.getAttribute("href") === href && link.dataset.index === String(index)) return;
    link.dataset.index = index;
    link.setAttribute("href", href);
    link.setAttribute("aria-label", `View ${title}`);
  };
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const steps = cards.length; // service changes + final fullscreen step
  // No snap (user decision): each step has a short rest zone where the frame
  // holds while the scroll goes on. Transitions keep a length of 1; REST is
  // added between them (half before the first, half after the last). It was
  // ≈40% of each step, which felt like stop-and-jerk next to the other
  // seamless scroll effects (user); now ≈15%, so the cards keep moving.
  const REST = 0.18;
  // Each step takes one screen of scrolling; U is the timeline time of one
  // screen of scrolling.
  const STEP_SCREENS = 1.1; // per step (user: 1.5 took too much scrolling, 0.8 left too little time to read the card; floema: ±2.3)
  const U = (1 + REST) / STEP_SCREENS;
  // The cards follow the (already smooth) Lenis scroll closely, and only a
  // very fast scroll meets the speed limit: one move (1 of timeline time) in
  // 0.35s at the fastest (user decision, option A). At 0.8s it held them back
  // at a normal scroll too, and they lagged behind the page (user).
  const MAX_SPEED = 1 / 0.35; // timeline time per second
  const FOLLOW = 14; // how fast they close the gap (per second)
  // The entry: the pin starts with the section ENTRY of a screen below the
  // top, and over the next 2 × ENTRY of scrolling it glides up into place,
  // slowing from the page's speed to a stop. Off for now (0): with the page
  // turning dark as it comes up, the slowing read as being pushed up (user,
  // 3 Nov 2026); it had been added as arriving at the pin felt abrupt.
  // The steps come after that stretch.
  const ENTRY = 0; // of the screen height (was 0.15)
  const entryTime = 2 * ENTRY * U; // timeline time of the entry
  const stepTime = (n) => entryTime + n * (1 + REST) + REST / 2;
  const restTime = (k) => entryTime + (k === 0 ? REST / 4 : k === steps ? steps * (1 + REST) - REST / 4 : k * (1 + REST));

  section.classList.add("is-enhanced");
  const cleanups = [];

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
    // Plays the card text at the steps reached (set further down).
    let cue = () => {};
    cards.forEach((card, i) => {
      gsap.set(card, { ...stateVars(i, 0), zIndex: cardState(i, 0).zIndex, transformOrigin: "50% 0%" });
      gsap.set(clips[i], clipVars(i, 0));
    });
    drawClips();

    const timeline = gsap.timeline({
      paused: true,
      // sine.inOut: a gentle curve, so the middle of each move does not rush.
      defaults: { duration: 1, ease: reduceMotion ? "steps(1)" : "sine.inOut" },
      onUpdate: () => {
        drawClips();
        cue(false);
        // The service in view: the last whose step is halfway through.
        const time = timeline.time();
        pointLink(cards.reduce((active, _, k) => (k > 0 && time >= stepTime(k - 1) + 0.5 ? k : active), 0));
      },
    });

    // The images, on their own timeline with the same clock, set straight
    // from the scroll (linear: as floema.com).
    const flow = gsap.timeline({ paused: true, defaults: { ease: reduceMotion ? "steps(1)" : "none" } });

    // The pin sets where the timeline should be (target); the ticker below
    // moves it there, with the speed limit. On a refresh (load, resize, a
    // reload further down) it is placed there at once.
    let target = 0;
    const pin = ScrollTrigger.create({
      id: "services",
      trigger: section,
      start: () => `top top+=${ENTRY * window.innerHeight}`,
      end: () => `+=${window.innerHeight * (steps * STEP_SCREENS + 2 * ENTRY + EXIT)}`,
      pin: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        target = self.progress * timeline.duration();
        if (reduceMotion) timeline.time(target);
        // The images straight with the scroll (no speed limit, no delay).
        flow.time(target);
      },
      onRefresh: (self) => {
        target = self.progress * timeline.duration();
        // Back to the start before re-reading the start values: read where the
        // timeline was (e.g. a line already flipped away), they were wrong, and
        // scrolling back up left the first line hidden (user report).
        timeline.time(0).invalidate().time(target);
        flow.time(0).invalidate().time(target);
        if (timeline.time() < stepTime(steps - 1)) clearMedia();
        cue(true);
      },
    });
    const follow = (time, deltaMs) => {
      const now = timeline.time();
      const gap = target - now;
      if (Math.abs(gap) < 0.0005) return;
      const dt = Math.min(deltaMs / 1000, 0.1);
      const limit = MAX_SPEED * dt;
      timeline.time(now + gsap.utils.clamp(-limit, limit, gap * Math.min(1, dt * FOLLOW)));
    };
    if (!reduceMotion) {
      gsap.ticker.add(follow);
      cleanups.push(() => gsap.ticker.remove(follow));
    }

    // The entry glide and the exit, tied straight to the scroll (no scrub
    // delay): the section rises by ENTRY of a screen easing out (its speed
    // falls from the page's to 0), and at the end by half of EXIT easing in
    // (from 0 up to the page's speed). CSS translate, apart from the pin's own
    // styles; cleared while ScrollTrigger measures, so the pin is measured
    // from the layout.
    if (!reduceMotion) {
      let entered = 0;
      let leaving = 0;
      const place = () => {
        const height = window.innerHeight;
        const y = -ENTRY * height * (1 - (1 - entered) ** 2) - 0.5 * EXIT * height * leaving ** 2;
        section.style.translate = `0 ${y}px`;
      };
      const glide = (self) => {
        entered = self.progress;
        place();
      };
      const leave = (self) => {
        leaving = self.progress;
        place();
      };
      const entry = ScrollTrigger.create({
        start: () => pin.start,
        end: () => pin.start + 2 * ENTRY * window.innerHeight,
        onUpdate: glide,
        onRefresh: glide,
      });
      const exit = ScrollTrigger.create({
        start: () => pin.end - EXIT * window.innerHeight,
        end: () => pin.end,
        onUpdate: leave,
        onRefresh: leave,
      });
      // The section ends up higher than its place in the layout (the entry and
      // the exit), so the next section is pulled up by as much: the space
      // between them stays as in Figma. Set while ScrollTrigger measures.
      const next = () => section.parentElement?.nextElementSibling;
      const resetGlide = () => {
        section.style.translate = "";
        const below = next();
        if (below) below.style.marginTop = `${-(ENTRY + 0.5 * EXIT) * window.innerHeight}px`;
      };
      resetGlide();
      ScrollTrigger.addEventListener("refreshInit", resetGlide);
      cleanups.push(() => {
        ScrollTrigger.removeEventListener("refreshInit", resetGlide);
        entry.kill();
        exit.kill();
        section.style.translate = "";
        next()?.style.removeProperty("margin-top");
      });
    }

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
      // The new image is revealed from the bottom like a curtain over the
      // previous one (no half-transparent overlap), on the image timeline
      // (flow): from the end of the last curtain to the start of the next, so
      // one runs into the other; its picture comes up more slowly than the
      // curtain's edge, and the previous one keeps rising and grows a little.
      const from = at - REST / 2;
      const span = 1 + REST;
      flow.fromTo(
        images[active],
        { autoAlpha: 1, yPercent: RAISE, clipPath: "inset(100% 0% 0% 0%)" },
        { yPercent: 0, clipPath: "inset(0% 0% 0% 0%)", duration: span },
        from,
      );
      flow.fromTo(
        images[active - 1],
        { yPercent: 0, scale: 1 },
        { yPercent: -LEAVE, scale: 1 + GROW, duration: span, immediateRender: false },
        from,
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
    // The last rest zone runs to the end of the pin, the exit included.
    timeline.to({}, { duration: REST / 2 + EXIT * U }, stepTime(steps - 1) + 1);
    // The text coming in (not with reduced motion: it stays in place).
    if (!reduceMotion) {
      // Up from 200% below in a window of its own: a clip whose bottom edge
      // comes up as much as the element does, so no wrapper is needed. The
      // window reaches DESCENT below the box, so descenders (g, p, y) are not
      // cut (user report).
      const rise = (els, vars) =>
        gsap.fromTo(
          els,
          { yPercent: RISE, clipPath: `inset(-20% -20% ${RISE - DESCENT}% -20%)` },
          { yPercent: 0, clipPath: `inset(-20% -20% ${-DESCENT}% -20%)`, duration: 1, ease: "power3.out", ...vars },
        );
      const parts = cards.map((card) => ({
        title: card.querySelector(".services__card-title"),
        divider: card.querySelector(".services__card-divider"),
        tags: [...card.querySelectorAll(".services__tag")],
        text: card.querySelector(".services__card-text"),
      }));
      // A card's line drawn from the left, then its tags, then its text.
      const reveal = ({ divider, tags, text }) =>
        gsap
          .timeline({ paused: true })
          .fromTo(divider, { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: "power3.out", transformOrigin: "0% 50%" }, 0)
          .add(rise(tags, { stagger: 0.05 }), 0.05)
          .add(rise(text), 0.15);
      const reveals = parts.map(reveal);

      // As the section arrives (its top at 60% of the screen; the page turned
      // dark at 85%, src/js/page-theme.js).
      const entry = gsap
        .timeline({ paused: true })
        // The first image lights up, as a light turned up slowly: brightness
        // only (user: a blur looked odd). The step images come in as on
        // floema.com (above).
        .fromTo(images[0], { filter: "brightness(0.3)" }, { filter: "brightness(1)", duration: 1.4, ease: "sine.inOut" }, 0)
        // The card and the deck behind it rise into place. translate and
        // filter, as the step timeline owns their transform and opacity.
        .fromTo(
          cards.slice(0, 3),
          { translate: () => `0 ${CARD_RISE * designPx()}px`, filter: "opacity(0)" },
          { translate: "0 0px", filter: "opacity(1)", duration: 1, ease: "power3.out", stagger: 0.08 },
          0.05,
        )
        .add(rise(label), 0.15)
        // The first card's title and those peeking from the deck behind it.
        .add(rise(parts.slice(0, 3).map(({ title }) => title), { stagger: 0.06 }), 0.25)
        .add(reveals[0].paused(false), 0.4);
      ScrollTrigger.create({
        trigger: section,
        start: "top 60%",
        // Once (as About and Contact; user): it stays when scrolled back up.
        once: true,
        onEnter: () => entry.play(),
        // Opened or reloaded further down: in place at once.
        onRefresh: (self) => self.progress > 0 && entry.progress(1),
      });

      // At each step, once its card is halfway to the front.
      const shown = cards.map(() => false);
      cue = (instant) => {
        const time = timeline.time();
        for (let k = 1; k < cards.length; k++) {
          const want = time >= stepTime(k - 1) + 0.5;
          if (instant) reveals[k].progress(want ? 1 : 0).pause();
          else if (want !== shown[k]) want ? reveals[k].play() : reveals[k].reverse();
          shown[k] = want;
        }
      };
    }

    // Same length as the step timeline, so the same time fits both.
    flow.set({}, {}, timeline.duration());
    // The pin may have measured before the steps were added: place the
    // timeline for the current scroll now that it is complete.
    target = pin.progress * timeline.duration();
    timeline.time(target);
    flow.time(target);
    cue(true);
  }, section);

  const refresh = () => ScrollTrigger.refresh();
  window.addEventListener("load", refresh, { once: true });

  // Card heights depend on the web fonts; re-measure once they are ready.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());

  return () => {
    window.removeEventListener("load", refresh);
    cleanups.forEach((cleanup) => cleanup());
    ctx.revert();
    cards.forEach((card) => card.style.removeProperty("clip-path"));
    section.classList.remove("is-enhanced");
  };
}
