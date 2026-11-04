import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { createGradientWave } from "./gradient-wave.js";

gsap.registerPlugin(SplitText);

// Milestone reveal (designer's intent, timing proposed and approved):
// 1. each value turns like an odometer as its row comes up the screen (as
//    revelatio.studio's metrics, measured; user): every digit rolls up a
//    column of 0–9 in a window of its own and lands on its figure, all digits
//    landing together (the right ones roll further, so faster); the prefix
//    and suffix rise; then the value is plain text again;
// 2. a brand-gradient wave runs through "$139M+", which stays black at rest
//    like the hero accent (user decision; src/js/gradient-wave.js), and again
//    whenever the pointer enters its row;
// 3. ink flows through the lead sentence from left to right with a soft edge,
//    from the paragraph grey, with the scroll (reference from the user:
//    drone.riotters.com; like the Statement text), back to grey going up.
// Around it, in the site's words (user): the eyebrow and the headline's lines
// rise as the hero text (src/js/hero-intro.js), back when scrolled back up;
// with the odometer, each row's line draws from the left and its label rises.
// Without JS or with reduced motion the final values are shown, in black.
const RISE = 200; // % of its height text rises from
const DESCENT = 25; // % of its height its window reaches below it (g, p, y)
const ROLL = 1.8; // s for a value to turn and land
export function initMilestoneCounter() {
  const root = document.querySelector("[data-milestone]");
  if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  const values = [...root.querySelectorAll("[data-count]")];
  const waveNumber = root.querySelector("[data-wave] .milestone__number");
  const waveRow = waveNumber?.closest(".milestone__row");
  const lead = root.querySelector(".milestone__text-lead");
  let wave;

  const setNumber = (el, n) => {
    el.querySelector(".milestone__number").textContent = `${el.dataset.prefix}${n}${el.dataset.suffix}`;
  };

  // Up from below in a window of its own: a clip whose bottom edge comes up
  // as much as the element does, so no wrapper is needed.
  const rise = (els, vars) =>
    gsap.fromTo(
      els,
      { yPercent: RISE, clipPath: `inset(-20% -20% ${RISE - DESCENT}% -20%)` },
      { yPercent: 0, clipPath: `inset(-20% -20% ${-DESCENT}% -20%)`, duration: 1, ease: "power3.out", ...vars },
    );

  // The heading: eyebrow, then the headline's lines.
  const section = root.closest(".milestone");
  const eyebrow = section.querySelector(".milestone__eyebrow");
  const heading = section.querySelector(".milestone__intro h2");
  const split = heading && SplitText.create(heading, { type: "lines", linesClass: "milestone__line" });
  const intro = gsap
    .timeline({ paused: true })
    .add(rise(eyebrow), 0)
    .add(rise(split?.lines ?? [], { stagger: 0.12 }), 0.1);
  const introTrigger = ScrollTrigger.create({
    trigger: section.querySelector(".milestone__intro"),
    start: "top 85%",
    onEnter: () => intro.play(),
    onLeaveBack: () => intro.reverse(),
    // Opened or reloaded further down: in place at once.
    onRefresh: (self) => intro.progress(self.progress > 0 ? 1 : 0).pause(),
  });

  const rows = [...root.querySelectorAll(".milestone__row")];
  const labels = root.querySelectorAll(".milestone__label");
  gsap.set(rows, { "--line": 0 });

  // Each value as an odometer: the prefix, one window per digit holding a
  // column of 0–9 (once more for each digit further right, so it rolls
  // further), and the suffix. Each part is one line tall (the text's own line
  // height) and as wide as its characters in the text, so the value takes
  // exactly the room of its text and nothing moves when it is text again; a
  // window clips top and bottom only, so a wider digit passing through is not
  // cut at the sides.
  // Built as its row comes in, once the web font is in (measured then).
  const build = (el) => {
    const number = el.querySelector(".milestone__number");
    const line = parseFloat(getComputedStyle(el).lineHeight) || parseFloat(getComputedStyle(el).fontSize) * 1.1;
    const prefix = el.dataset.prefix;
    const digits = [...el.dataset.count];
    const suffix = el.dataset.suffix;
    // Each character's width in the text as set (kerning and spacing
    // included), so the parts take exactly the text's room.
    const text = number.firstChild;
    const range = document.createRange();
    const widths = [...text.textContent].map((_, k) => {
      range.setStart(text, k);
      range.setEnd(text, k + 1);
      return range.getBoundingClientRect().width;
    });
    const sum = (from, count) => widths.slice(from, from + count).reduce((total, w) => total + w, 0);
    const box = (width) => {
      const span = document.createElement("span");
      span.style.cssText = `display: inline-block; vertical-align: top; width: ${width}px; height: ${line}px; line-height: ${line}px; letter-spacing: inherit; white-space: nowrap;`;
      return span;
    };
    number.textContent = "";
    const ends = [];
    const end = (value, width) => {
      if (!value) return;
      const span = box(width);
      span.textContent = value;
      number.append(span);
      ends.push(span);
    };
    end(prefix, sum(0, prefix.length));
    const rollers = digits.map((digit, i) => {
      const loops = digits.length - i; // the leftmost turns once, the rightmost most
      const mask = box(widths[prefix.length + i]);
      mask.style.clipPath = "inset(0 -50%)"; // clipped top and bottom only
      const roller = document.createElement("span");
      roller.style.cssText = `display: block; text-align: center; line-height: ${line}px;`;
      // 0–9 once per loop and once more, so it lands on its digit within it.
      roller.innerHTML = Array.from({ length: (loops + 1) * 10 }, (_, k) => `<span style="display: block">${k % 10}</span>`).join("");
      mask.append(roller);
      number.append(mask);
      return { roller, to: -(loops * 10 + Number(digit)) * line };
    });
    end(suffix, sum(prefix.length + digits.length, suffix.length));
    return { ends, rollers };
  };
  // Hidden until then.
  const numbers = values.map((el) => el.querySelector(".milestone__number"));
  gsap.set(numbers, { autoAlpha: 0 });

  // One timeline per row, as it comes up the screen: its value turns, its
  // line draws and its label rises; then the value is text again (the wave on
  // "$139M+" needs its plain text).
  const turn = (el, i) => {
    const row = rows[i];
    const { ends, rollers } = build(el);
    gsap.set(numbers[i], { autoAlpha: 1 });
    gsap
      .timeline()
      .add(rise(ends), 0)
      .to(
        rollers.map(({ roller }) => roller),
        { y: (k) => rollers[k].to, duration: ROLL, ease: "expo.out" },
        0,
      )
      .to(row, { "--line": 1, duration: 1.2, ease: "power3.inOut" }, 0)
      .add(rise(row.querySelector(".milestone__label")), 0.1)
      .add(() => {
        setNumber(el, el.dataset.count);
        if (el.contains(waveNumber)) {
          wave = createGradientWave(waveNumber, "linear-gradient(207.35deg, var(--gradient-brand-stops))");
          wave.play();
          waveRow.addEventListener("mouseenter", wave.play);
        }
      }, ROLL);
  };
  const turns = values.map((el, i) =>
    ScrollTrigger.create({
      trigger: rows[i],
      start: "top 80%",
      once: true,
      onEnter: () => document.fonts.ready.then(() => turn(el, i)),
    }),
  );

  // The ink follows the scroll (user decision, like the Statement text):
  // from the paragraph coming in at the bottom of the screen to its centre at
  // 65% of the screen, just before the hand-over to Motto starts, so it is
  // all black while Milestone is still fully in view; back to grey when
  // scrolling up. It catches up softly (0.6s) so a fast scroll does not make
  // it jump. It was played once on its own clock (1.3s).
  const ink = { progress: 0 };
  const paint = () => gsap.set(lead, { backgroundPosition: `${(1 - ink.progress) * 100}% 0%` });
  const follow = gsap.quickTo(ink, "progress", { duration: 0.6, ease: "power3.out", onUpdate: paint });
  const sweepTrigger = ScrollTrigger.create({
    trigger: lead.closest(".milestone__text"),
    start: "top 95%",
    end: "center 65%",
    onUpdate: (self) => follow(self.progress),
    onRefresh: (self) => {
      ink.progress = self.progress;
      follow(self.progress, self.progress);
      paint();
    },
  });


  return () => {
    introTrigger.kill();
    intro.progress(1).kill();
    gsap.set([eyebrow, ...labels].filter(Boolean), { clearProps: "transform,clipPath" });
    gsap.set(rows, { clearProps: "--line" });
    split?.revert();
    turns.forEach((turn) => turn.kill());
    sweepTrigger.kill();
    gsap.killTweensOf(ink);
    if (wave) {
      waveRow.removeEventListener("mouseenter", wave.play);
      wave.destroy();
    }
    values.forEach((el) => setNumber(el, el.dataset.count));
    gsap.set(numbers, { clearProps: "opacity,visibility" });
    lead.classList.remove("is-sweeping");
    gsap.set(lead, { clearProps: "backgroundPosition" });
  };
}
