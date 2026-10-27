import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createGradientWave } from "./gradient-wave.js";

// Milestone reveal (designer's intent, timing proposed and approved):
// 1. values rise in from a soft blur and count up, staggered top to bottom;
// 2. a brand-gradient wave runs through "$139M+", which stays black at rest
//    like the hero accent (user decision; src/js/gradient-wave.js), and again
//    whenever the pointer enters its row;
// 3. ink flows through the lead sentence from left to right with a soft edge,
//    from the paragraph grey (reference from the user: drone.riotters.com,
//    played on its own clock instead of the scroll; once, no replay).
// Without JS or with reduced motion the final values are shown, in black.
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

  const counters = values.map((el) => ({ el, n: 0 }));
  values.forEach((el) => setNumber(el, 0));
  gsap.set(values, { autoAlpha: 0, y: 12, filter: "blur(6px)" });
  // A gradient (ink | soft edge | grey) clipped to the text is moved across
  // it, so the text is not split and keeps its kerning (_milestone.scss).
  lead.classList.add("is-sweeping");
  gsap.set(lead, { backgroundPosition: "100% 0%" });

  const timeline = gsap.timeline({ paused: true });
  timeline
    .to(values, {
      autoAlpha: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 0.8,
      ease: "expo.out",
      stagger: 0.1,
    })
    .to(
      counters,
      {
        n: (i) => Number(values[i].dataset.count),
        duration: 1.3,
        ease: "expo.out",
        stagger: 0.1,
        onUpdate: () => counters.forEach(({ el, n }) => setNumber(el, Math.round(n))),
      },
      0,
    )
    // The wave needs the final text: set up once every count has landed (the
    // count rewrites all numbers until the last one ends).
    .add(() => {
      if (!waveNumber) return;
      wave = createGradientWave(waveNumber, "linear-gradient(207.35deg, var(--gradient-brand-stops))");
      wave.play();
      waveRow.addEventListener("mouseenter", wave.play);
    });

  // The sweep has its own trigger: the paragraph sits below the numbers and is
  // often still off screen when they start, and this way it does not run at
  // the same time as the "$139M+" wave. A short pause first lets the grey text
  // register.
  const sweep = gsap.to(lead, { backgroundPosition: "0% 0%", duration: 1.3, delay: 0.2, ease: "power2.inOut", paused: true });
  const sweepTrigger = ScrollTrigger.create({
    trigger: lead.closest(".milestone__text"),
    start: "top 85%",
    once: true,
    onEnter: () => sweep.play(),
  });

  const trigger = ScrollTrigger.create({
    trigger: root,
    start: "top 80%",
    once: true,
    onEnter: () => timeline.play(),
  });

  return () => {
    trigger.kill();
    sweepTrigger.kill();
    timeline.kill();
    sweep.kill();
    if (wave) {
      waveRow.removeEventListener("mouseenter", wave.play);
      wave.destroy();
    }
    values.forEach((el) => setNumber(el, el.dataset.count));
    gsap.set(values, { clearProps: "opacity,visibility,transform,filter" });
    lead.classList.remove("is-sweeping");
    gsap.set(lead, { clearProps: "backgroundPosition" });
  };
}
