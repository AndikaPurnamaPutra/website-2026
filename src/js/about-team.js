import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

// About: Team (docs/implementation/30-about-motion.md), in the site's words:
// as it comes up the screen, the lead's lines rise as the hero text; then
// the rows, a few at a time as they come in: each row's line draws from the
// left (as Milestone's rows) and its name and role rise. Once, as the other
// entrances. Nothing moves with reduced motion.
const RISE = 200; // % of its height text rises from
const DESCENT = 25; // % of its height its window reaches below it (g, p, y)

export function initAboutTeam() {
  const section = document.querySelector(".about-team");
  if (!section || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  const rows = [...section.querySelectorAll(".about-team__member")];
  const texts = rows.flatMap((row) => [...row.querySelectorAll("span")]);
  const hidden = { yPercent: RISE, clipPath: `inset(-20% -20% ${RISE - DESCENT}% -20%)` };
  const shown = { yPercent: 0, clipPath: `inset(-20% -20% ${-DESCENT}% -20%)` };
  gsap.set(rows, { "--line": 0 });
  gsap.set(texts, hidden);

  const triggers = [];
  let lead = null;
  let cancelled = false;
  // The lead split once the web fonts are in, so its lines break as set.
  (document.fonts?.ready ?? Promise.resolve()).then(() => {
    if (cancelled) return;
    lead = SplitText.create(section.querySelector(".about-team__lead"), { type: "lines", aria: "none" });
    const leadIn = gsap.fromTo(lead.lines, hidden, { ...shown, duration: 1.15, ease: "power3.out", stagger: 0.09, paused: true });
    triggers.push(
      ScrollTrigger.create({
        trigger: lead.lines[0],
        start: "top 90%",
        once: true,
        onEnter: () => leadIn.play(),
        onRefresh: (self) => self.progress > 0 && leadIn.progress(1),
      }),
    );
  });

  triggers.push(
    ...ScrollTrigger.batch(rows, {
      start: "top 92%",
      once: true,
      onEnter: (batch) => {
        gsap.to(batch, { "--line": 1, duration: 1.2, ease: "power3.inOut", stagger: 0.06 });
        gsap.to(
          batch.flatMap((row) => [...row.querySelectorAll("span")]),
          { ...shown, duration: 1, ease: "power3.out", stagger: 0.03, delay: 0.1 },
        );
      },
    }),
  );

  return () => {
    cancelled = true;
    triggers.forEach((trigger) => trigger.kill());
    gsap.killTweensOf([...rows, ...texts]);
    gsap.set(rows, { clearProps: "--line" });
    gsap.set(texts, { clearProps: "transform,clipPath" });
    lead?.revert();
  };
}
