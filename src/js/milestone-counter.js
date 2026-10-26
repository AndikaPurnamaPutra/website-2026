import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Milestone stats count up once when they scroll into view; afterwards the
// gradient fades in on the first value (designer's intent, timing proposed).
// Without JS or with reduced motion the final Figma state is shown.
export function initMilestoneCounter() {
  const root = document.querySelector("[data-milestone]");
  if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  const values = [...root.querySelectorAll("[data-count]")];
  const gradient = root.querySelector(".milestone__gradient");
  const format = (el, n) => `${el.dataset.prefix}${n}${el.dataset.suffix}`;
  const setNumber = (el, n) => {
    el.querySelector(".milestone__number").textContent = format(el, n);
  };

  const counters = values.map((el) => ({ el, n: 0 }));
  values.forEach((el) => {
    el.classList.add("is-counting");
    setNumber(el, 0);
  });
  gsap.set(gradient, { autoAlpha: 0 });

  const timeline = gsap.timeline({ paused: true });
  timeline
    .to(counters, {
      n: (i) => Number(values[i].dataset.count),
      duration: 1.6,
      ease: "power2.out",
      onUpdate: () => counters.forEach(({ el, n }) => setNumber(el, Math.round(n))),
    })
    // Gradient fades in over the solid number, then the solid one is hidden.
    .to(gradient, { autoAlpha: 1, duration: 0.6, ease: "power1.inOut" })
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
    gsap.set(gradient, { clearProps: "opacity,visibility" });
  };
}
