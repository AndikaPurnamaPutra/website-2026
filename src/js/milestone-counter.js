import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Milestone reveal (designer's intent, timing proposed and approved):
// 1. values rise in from a soft blur and count up, staggered top to bottom;
// 2. "$139M+" crossfades from ink into the blue gradient while the gradient
//    drifts slowly inside the letters and settles at its Figma position;
// 3. the lead sentence turns from the paragraph grey to ink, all at once.
// Without JS or with reduced motion the final Figma state is shown.
export function initMilestoneCounter() {
  const root = document.querySelector("[data-milestone]");
  if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  const values = [...root.querySelectorAll("[data-count]")];
  const gradientValue = root.querySelector(".milestone__value--gradient");
  const gradient = gradientValue.querySelector(".milestone__gradient");
  const solid = gradientValue.querySelector(".milestone__number");
  const lead = root.querySelector(".milestone__text-lead");

  const setNumber = (el, n) => {
    el.querySelector(".milestone__number").textContent = `${el.dataset.prefix}${n}${el.dataset.suffix}`;
  };

  const counters = values.map((el) => ({ el, n: 0 }));
  values.forEach((el) => {
    el.classList.add("is-counting");
    setNumber(el, 0);
  });
  gsap.set(values, { autoAlpha: 0, y: 12, filter: "blur(6px)" });
  // Gradient starts stretched (shifted) and invisible; it ends at 100% size,
  // which is exactly the Figma gradient.
  gsap.set(gradient, { autoAlpha: 0, backgroundSize: "220% 100%", backgroundPosition: "100% 50%" });
  gsap.set(lead, { color: "rgba(0, 0, 0, 0.4)" });

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
    .to(gradient, { autoAlpha: 1, duration: 2, ease: "sine.inOut" }, 1.8)
    .to(solid, { opacity: 0, duration: 2, ease: "sine.inOut" }, 1.8)
    .to(gradient, { backgroundSize: "100% 100%", backgroundPosition: "0% 50%", duration: 2.6, ease: "power3.out" }, 1.8)
    .to(lead, { color: "#111", duration: 1.2, ease: "sine.inOut" }, 3.2)
    .add(() => {
      values.forEach((el) => el.classList.remove("is-counting"));
      gsap.set(solid, { clearProps: "opacity" });
    });

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
    gsap.set([gradient, solid, lead], { clearProps: "opacity,visibility,backgroundSize,backgroundPosition,color" });
  };
}
