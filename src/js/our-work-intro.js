import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { designPx } from "./design-px.js";

gsap.registerPlugin(SplitText);

// Our Work coming in (docs/implementation/23-our-work-intro.md; user): the
// page is light again after the dark Services, "the room lights come back
// on". In the site's words: text rises into view as the hero text
// (src/js/hero-intro.js) and lines are drawn from the left as on the Services
// cards. The project cards have no entrance of their own: the rows drifting
// with the scroll (below) is their moment (user: they moved too much at
// once). Each part plays on its own clock as it comes up the screen and goes
// back when scrolled back up. Not with
// reduced motion: all is in place.
// While the rows cross the screen they drift with the scroll, the first to
// the left and the second to the right, as walking past two walls of a
// gallery (user; a pull by the scroll speed went back and forth).
const RISE = 200; // % of its height text rises from
const DESCENT = 25; // % of its height its window reaches below it (g, p, y)
const START = "top 85%";
const DRIFT = 240; // Figma px each row drifts while it crosses the screen (≈20% of the scroll)
const SMOOTH = 0.5; // s the drift eases to where it should be

export function initOurWorkIntro() {
  const section = document.querySelector(".our-work");
  if (!section || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  // Up from below in a window of its own: a clip whose bottom edge comes up
  // as much as the element does, so no wrapper is needed.
  const rise = (els, vars) =>
    gsap.fromTo(
      els,
      { yPercent: RISE, clipPath: `inset(-20% -20% ${RISE - DESCENT}% -20%)` },
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
  section.querySelectorAll("[data-work-carousel]").forEach((carousel) => {
    const head = carousel.querySelectorAll(".work-carousel__title, .work-carousel__arrow");
    play(carousel, gsap.timeline().add(rise(head, { stagger: 0.06 })));
  });

  // The rows drifting with the scroll position, DRIFT/2 each side of their
  // place (in place when the row is in the middle of the screen): the first
  // to the left, the second to the right. Never further left than the cards
  // left beyond the right edge, so no empty end shows, also once the row is
  // browsed with the arrows (user). On the cards' content, so the scroll snap
  // (which reads the cards themselves) does not scroll it back.
  const drifts = [...section.querySelectorAll("[data-work-carousel]")].map((carousel, i) => {
    const viewport = carousel.querySelector("[data-work-viewport]");
    const links = carousel.querySelectorAll(".work-card__link");
    // Eased, so the limit taking over while the arrows scroll the row does
    // not stop the cards dead (user report: a jolt on Selected Work).
    const toX = gsap.quickTo(links, "x", { duration: SMOOTH, ease: "power3.out" });
    let progress = 0;
    const place = () => {
      const side = i % 2 ? -1 : 1;
      const wanted = side * (0.5 - progress) * DRIFT * designPx();
      const room = viewport.scrollWidth - viewport.clientWidth - viewport.scrollLeft;
      toX(Math.max(wanted, -room));
    };
    const trigger = ScrollTrigger.create({
      trigger: carousel,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        progress = self.progress;
        place();
      },
      onRefresh: (self) => {
        progress = self.progress;
        place();
      },
    });
    viewport.addEventListener("scroll", place, { passive: true });
    return { trigger, links, cancel: () => viewport.removeEventListener("scroll", place) };
  });

  // The "More Work" button.
  const button = section.querySelector(".button");
  if (button) play(button, gsap.timeline().add(rise(button)));

  return () => {
    drifts.forEach(({ trigger, links, cancel }) => {
      trigger.kill();
      cancel();
      gsap.killTweensOf(links);
      gsap.set(links, { clearProps: "transform" });
    });
    parts.forEach(({ timeline, trigger }) => {
      trigger.kill();
      timeline.progress(1).kill();
    });
    gsap.set(section.querySelectorAll(".our-work__eyebrow, .our-work__category, .divider, .work-carousel__title, .work-carousel__arrow, .button"), {
      clearProps: "transform,clipPath",
    });
    split?.revert();
  };
}
