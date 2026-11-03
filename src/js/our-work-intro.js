import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

// Our Work coming in (docs/implementation/23-our-work-intro.md; user): the
// page is light again after the dark Services, "the room lights come back
// on". In the site's words: text rises into view as the hero text
// (src/js/hero-intro.js) and lines are drawn from the left as on the Services
// cards. The project cards come in one after another from the left: each
// picture opens from the bottom within its frame while the picture itself
// settles up into place (as the Services images), then its title rises a
// little (user: the full curtain was right, made a touch calmer). Each part plays on its own clock as it comes up the screen and goes
// back when scrolled back up. Not with
// reduced motion: all is in place.
// Option 2 (branch our-work/v2): no drift of the rows with the scroll (it is
// on our-work/v1); the rows stay in place.
const RISE = 200; // % of its height text rises from
const DESCENT = 25; // % of its height its window reaches below it (g, p, y)
const CARD_GAP = 0.08; // s between the cards, left to right
const CARD_IN = 1.1; // s a card picture takes to open (1.6 felt too slow)
const CARD_SETTLE = 8; // % the picture rises from within its frame as it opens
const TITLE_RISE = 100; // % of its height a card title rises from (shorter than the headline's)
const START = "top 85%";

export function initOurWorkIntro() {
  const section = document.querySelector(".our-work");
  if (!section || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  // Up from below in a window of its own: a clip whose bottom edge comes up
  // as much as the element does, so no wrapper is needed.
  const rise = (els, vars, from = RISE) =>
    gsap.fromTo(
      els,
      { yPercent: from, clipPath: `inset(-20% -20% ${from - DESCENT}% -20%)` },
      { yPercent: 0, clipPath: `inset(-20% -20% ${-DESCENT}% -20%)`, duration: 1, ease: "power3.out", ...vars },
    );
  const draw = (line) =>
    gsap.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: "power3.inOut", transformOrigin: "0% 50%" });

  // The headline's lines, each rising on its own (no mask: it would cut the
  // descenders; the rise has its own window).
  const heading = section.querySelector(".our-work__heading h2");
  const split = heading && SplitText.create(heading, { type: "lines", linesClass: "our-work__line" });

  const parts = [];
  const play = (trigger, timeline) => {
    timeline.pause();
    parts.push({
      timeline,
      trigger: ScrollTrigger.create({
        trigger,
        start: START,
        onEnter: () => timeline.play(),
        onLeaveBack: () => timeline.reverse(),
        // Opened or reloaded further down: in place at once.
        onRefresh: (self) => timeline.progress(self.progress > 0 ? 1 : 0).pause(),
      }),
    });
  };

  // The head: eyebrow, the headline's lines, then the categories.
  const header = section.querySelector(".our-work__header");
  play(
    header,
    gsap
      .timeline()
      .add(rise(section.querySelector(".our-work__eyebrow")), 0)
      .add(rise(split?.lines ?? [], { stagger: 0.12 }), 0.1)
      .add(rise(section.querySelectorAll(".our-work__category"), { stagger: 0.05 }), 0.25),
  );

  // The lines between the parts.
  section.querySelectorAll(".divider").forEach((line) => play(line, gsap.timeline().add(draw(line))));

  // Each carousel: its title and arrows.
  // Each carousel: its title and arrows, then its cards (translate, so the
  // scroll snap is left alone).
  section.querySelectorAll("[data-work-carousel]").forEach((carousel) => {
    const head = carousel.querySelectorAll(".work-carousel__title, .work-carousel__arrow");
    play(
      carousel,
      gsap
        .timeline()
        .add(rise(head, { stagger: 0.06 }), 0)
        .fromTo(
          carousel.querySelectorAll(".work-card__media"),
          { clipPath: "inset(100% 0% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: CARD_IN, ease: "power2.inOut", stagger: CARD_GAP },
          0.15,
        )
        // translate, apart from the picture's hover scale (transform).
        .fromTo(
          carousel.querySelectorAll(".work-card__image"),
          { translate: `0 ${CARD_SETTLE}%` },
          { translate: "0 0%", duration: CARD_IN, ease: "power2.inOut", stagger: CARD_GAP },
          0.15,
        )
        .add(rise(carousel.querySelectorAll(".work-card__title"), { stagger: CARD_GAP }, TITLE_RISE), 0.6),
    );
  });

  // The "More Work" button.
  const button = section.querySelector(".button");
  if (button) play(button, gsap.timeline().add(rise(button)));

  return () => {
    parts.forEach(({ timeline, trigger }) => {
      trigger.kill();
      timeline.progress(1).kill();
    });
    gsap.set(section.querySelectorAll(".our-work__eyebrow, .our-work__category, .divider, .work-carousel__title, .work-carousel__arrow, .work-card__media, .work-card__title, .work-card__image, .button"), {
      clearProps: "transform,clipPath,translate",
    });
    split?.revert();
  };
}
