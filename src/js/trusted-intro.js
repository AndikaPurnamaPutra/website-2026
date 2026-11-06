import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

// Trusted Clients coming in (docs/implementation/24-trusted-intro.md; user:
// simple but elegant): the eyebrow and the headline's lines rise as the hero
// text (src/js/hero-intro.js), the client logos only fade in one after
// another, left to right and row by row, "and hundred more..." rises after
// them, the line draws from the left and the testimonials fade in (their
// marquee moves as before, src/js/marquee.js). Each part plays on its own
// clock as it comes up the screen, once (as About and Contact; user). Not
// with reduced motion: all is in place.
// Nothing more (user: calm, as a pause after Services and Our Work; a
// spotlight over the logos and a lit middle testimonial were tried).
const RISE = 200; // % of its height text rises from
const DESCENT = 25; // % of its height its window reaches below it (g, p, y)
const LOGO_GAP = 0.05; // s between the logos
const START = "top 85%";

export function initTrustedIntro() {
  const section = document.querySelector(".trusted");
  if (!section || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  // Up from below in a window of its own: a clip whose bottom edge comes up
  // as much as the element does, so no wrapper is needed.
  const rise = (els, vars) =>
    gsap.fromTo(
      els,
      { yPercent: RISE, clipPath: `inset(-20% -20% ${RISE - DESCENT}% -20%)` },
      { yPercent: 0, clipPath: `inset(-20% -20% ${-DESCENT}% -20%)`, duration: 1, ease: "power3.out", ...vars },
    );
  const fade = (els, vars) => gsap.fromTo(els, { opacity: 0 }, { opacity: 1, duration: 1, ease: "power2.out", ...vars });

  // The headline's lines, each rising on its own (no mask: it would cut the
  // descenders; the rise has its own window).
  const heading = section.querySelector(".trusted__header h2");
  const split = heading && SplitText.create(heading, { type: "lines", linesClass: "trusted__line" });

  const parts = [];
  const play = (trigger, timeline) => {
    timeline.pause();
    parts.push({
      timeline,
      trigger: ScrollTrigger.create({
        trigger,
        start: START,
        // Once (as About and Contact; user): it stays when scrolled back up.
        once: true,
        onEnter: () => timeline.play(),
        // Opened or reloaded further down: in place at once.
        onRefresh: (self) => self.progress > 0 && timeline.progress(1),
      }),
    });
  };

  play(
    section.querySelector(".trusted__header"),
    gsap
      .timeline()
      .add(rise(section.querySelector(".trusted__eyebrow")), 0)
      .add(rise(split?.lines ?? [], { stagger: 0.12 }), 0.1),
  );

  const logos = section.querySelectorAll(".trusted__logo");
  play(
    section.querySelector(".trusted__logos"),
    gsap
      .timeline()
      .add(fade(logos, { stagger: LOGO_GAP }), 0)
      .add(rise(section.querySelector(".trusted__more")), logos.length * LOGO_GAP),
  );

  const line = section.querySelector(".divider");
  if (line) {
    play(
      line,
      gsap
        .timeline()
        .fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: "power3.inOut", transformOrigin: "0% 50%" }),
    );
  }

  const marquee = section.querySelector(".trusted__marquee");
  if (marquee) play(marquee, gsap.timeline().add(fade(marquee, { duration: 1.2 })));

  return () => {
    parts.forEach(({ timeline, trigger }) => {
      trigger.kill();
      timeline.progress(1).kill();
    });
    gsap.set(section.querySelectorAll(".trusted__eyebrow, .trusted__logo, .trusted__more, .divider, .trusted__marquee"), {
      clearProps: "transform,clipPath,opacity",
    });
    split?.revert();
  };
}
