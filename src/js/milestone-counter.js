import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Milestone reveal (designer's intent, timing proposed and approved):
// 1. values rise in from a soft blur and count up, staggered top to bottom;
// 2. the blue gradient sweeps across "$139M+" from left to right;
// 3. the lead sentence turns from the paragraph grey to ink, word by word.
// Without JS or with reduced motion the final Figma state is shown.
export function initMilestoneCounter() {
  const root = document.querySelector("[data-milestone]");
  if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  const values = [...root.querySelectorAll("[data-count]")];
  const gradientValue = root.querySelector(".milestone__value--gradient");
  const lead = root.querySelector(".milestone__text-lead");
  const leadText = lead.textContent;

  const setNumber = (el, n) => {
    el.querySelector(".milestone__number").textContent = `${el.dataset.prefix}${n}${el.dataset.suffix}`;
  };

  // Split the lead sentence into words so each can change colour on its own.
  lead.innerHTML = leadText
    .split(" ")
    .map((word) => `<span class="milestone__word">${word}</span>`)
    .join(" ");
  const words = lead.querySelectorAll(".milestone__word");

  const counters = values.map((el) => ({ el, n: 0 }));
  values.forEach((el) => {
    el.classList.add("is-counting");
    setNumber(el, 0);
  });
  gsap.set(values, { autoAlpha: 0, y: 12, filter: "blur(6px)" });
  gsap.set(gradientValue, { "--sweep": "-30%" });
  gsap.set(words, { color: "rgba(0, 0, 0, 0.4)" });

  const timeline = gsap.timeline({ paused: true });
  timeline
    .to(values, {
      autoAlpha: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 1.4,
      ease: "expo.out",
      stagger: 0.15,
    })
    .to(
      counters,
      {
        n: (i) => Number(values[i].dataset.count),
        duration: 2.2,
        ease: "expo.out",
        stagger: 0.15,
        onUpdate: () => counters.forEach(({ el, n }) => setNumber(el, Math.round(n))),
      },
      0,
    )
    // Soft-edged sweep: the gradient copy is revealed while the solid copy hides.
    .to(gradientValue, { "--sweep": "130%", duration: 1, ease: "power2.inOut" }, 2)
    .to(words, { color: "#111", duration: 0.5, ease: "power1.out", stagger: 0.06 }, 2.4)
    .add(() => values.forEach((el) => el.classList.remove("is-counting")));

  const trigger = ScrollTrigger.create({
    trigger: root,
    start: "top 80%",
    once: true,
    onEnter: () => timeline.play(),
  });

  return () => {
    trigger.kill();
    timeline.kill();
    values.forEach((el) => {
      el.classList.remove("is-counting");
      setNumber(el, el.dataset.count);
    });
    gsap.set(values, { clearProps: "opacity,visibility,transform,filter" });
    gsap.set(gradientValue, { clearProps: "--sweep" });
    lead.textContent = leadText;
  };
}
