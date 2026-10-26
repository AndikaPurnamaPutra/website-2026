import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Pinned Motto + CTA section (Figma storyboard 1527:4259, flow from the user):
// entry: background fades from light to dark and motto 1 blurs in;
// step 1: "Trendsetting Design" turns gradient, the ellipse rises from below;
// step 2: flip (per word) to motto 2;   step 3: "believers." turns gradient;
// step 4: flip to motto 3, ellipse → left light, Get a Quote appears;
// step 5: the whole motto turns gradient, the light moves to the center.
// Timing and easing are not in Figma (approved proposal).

// Same clamp as --px in _tokens.scss.
const designPx = () => Math.min(Math.max(window.innerWidth, 1280), 1920) / 1440;

export function initMottoScroll() {
  const section = document.querySelector("[data-motto]");
  if (!section) return () => {};

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lines = [...section.querySelectorAll(".motto__line")];
  const words = lines.map((line) => [...line.querySelectorAll(".motto__word")]);
  const accentText = lines.map((line) => line.querySelectorAll(".is-accent .motto__word-text"));
  const accentGradient = lines.map((line) => line.querySelectorAll(".motto__word-gradient"));
  const veil = section.querySelector(".motto__veil");
  const ellipse = section.querySelector(".motto__ellipse");
  const lightLeft = section.querySelector(".motto__light--left");
  const lightCenter = section.querySelector(".motto__light--center");
  const diagonal = section.querySelector(".motto__bg--diagonal");
  const cta = section.querySelector(".cta");
  const steps = 5;

  // Like Figma, the gradient box is the whole motto line: each accent word
  // shows its slice of a gradient sized to the line.
  const alignGradients = () => {
    lines.forEach((line) => {
      const all = [...line.querySelectorAll(".motto__word")];
      const left = all[0].offsetLeft;
      const last = all[all.length - 1];
      const width = last.offsetLeft + last.offsetWidth - left;
      line.querySelectorAll(".motto__word.is-accent").forEach((word) => {
        word.style.setProperty("--pw", `${width}px`);
        word.style.setProperty("--wx", `${word.offsetLeft - left}px`);
      });
    });
  };

  section.classList.add("is-enhanced");
  alignGradients();
  ScrollTrigger.addEventListener("refresh", alignGradients);

  // Ellipse offsets from its CSS position (bottom -602, left -115 in Figma px).
  const ellipseHidden = () => 322 * designPx(); // fully below the frame
  const ellipseHigh = () => -155 * designPx(); // frame 1527:4201: y 802 → 647
  const ellipseShift = () => -9 * designPx(); // x -15 → -24

  const ctx = gsap.context(() => {
    // Start state (frame 1527:4134).
    // Each word turns around its own axis (own perspective), like a flip-clock card.
    gsap.set(words.flat(), { transformOrigin: "50% 50% -20px", transformPerspective: 500 });
    gsap.set([...words[1], ...words[2]], { autoAlpha: 0, rotationX: -90 });
    gsap.set(accentText.flatMap((list) => [...list]), { opacity: 1 });
    gsap.set(accentGradient.flatMap((list) => [...list]), { opacity: 0 });
    gsap.set(ellipse, { autoAlpha: 0, y: ellipseHidden });
    gsap.set([lightCenter, diagonal], { autoAlpha: 0 });
    gsap.set(cta, { autoAlpha: 0, y: () => 12 * designPx() });

    const timeline = gsap.timeline({
      defaults: { duration: 1, ease: reduceMotion ? "steps(1)" : "power2.inOut" },
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => `+=${window.innerHeight * steps}`,
        pin: true,
        scrub: reduceMotion ? true : 0.6,
        snap: { snapTo: "labelsDirectional", inertia: false, duration: { min: 0.2, max: 0.6 }, ease: "power1.inOut" },
        invalidateOnRefresh: true,
      },
    });

    const toGradient = (i, at) => {
      timeline.to(accentGradient[i], { opacity: 1 }, at);
      timeline.to(accentText[i], { opacity: 0 }, at);
    };

    // Flip-clock change, word by word: the old words roll up and away, the new
    // ones roll in from below.
    const flip = (from, to, at) => {
      const outEase = reduceMotion ? "steps(1)" : "power2.in";
      const inEase = reduceMotion ? "steps(1)" : "power2.out";
      timeline.to(words[from], { rotationX: 90, autoAlpha: 0, duration: 0.4, ease: outEase, stagger: { amount: 0.12 } }, at);
      timeline.to(words[to], { rotationX: 0, autoAlpha: 1, duration: 0.45, ease: inEase, stagger: { amount: 0.12 } }, at + 0.43);
    };

    timeline.addLabel("step0", 0);

    toGradient(0, 0);
    timeline.to(ellipse, { autoAlpha: 1, y: 0 }, 0);
    timeline.addLabel("step1", 1);

    flip(0, 1, 1);
    timeline.addLabel("step2", 2);

    toGradient(1, 2);
    timeline.to(ellipse, { y: ellipseHigh, x: ellipseShift }, 2);
    timeline.addLabel("step3", 3);

    flip(1, 2, 3);
    timeline.to(ellipse, { autoAlpha: 0 }, 3);
    timeline.to([lightLeft, diagonal], { autoAlpha: 1 }, 3);
    timeline.to(cta, { autoAlpha: 1, y: 0, duration: 0.6 }, 3.4);
    timeline.addLabel("step4", 4);

    toGradient(2, 4);
    timeline.fromTo(lightLeft, { x: 0 }, { x: () => 60 * designPx(), autoAlpha: 0 }, 4);
    timeline.fromTo(lightCenter, { x: () => -60 * designPx() }, { x: 0, autoAlpha: 1 }, 4);
    timeline.addLabel("step5", 5);

    // Entry (before the pin): the white veil fades out and motto 1 blurs in.
    if (!reduceMotion) {
      gsap
        .timeline({
          scrollTrigger: { trigger: section, start: "top bottom", end: "top top", scrub: 0.6 },
        })
        .fromTo(veil, { autoAlpha: 1 }, { autoAlpha: 0, duration: 1, ease: "none" }, 0)
        .from(
          words[0],
          { autoAlpha: 0, y: () => 12 * designPx(), filter: "blur(6px)", duration: 0.45, ease: "power2.out", stagger: 0.03 },
          0.55,
        );
    }
  }, section);

  return () => {
    ScrollTrigger.removeEventListener("refresh", alignGradients);
    ctx.revert();
    section.classList.remove("is-enhanced");
  };
}
