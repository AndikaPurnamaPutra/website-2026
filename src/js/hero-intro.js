import gsap from "gsap";

// Hero text rising after the preloader (user decision: all the hero text,
// coming up from below as on fluid.glass, whose lines rise from 200% of their
// height in a clipping mask, power3.out). One after another, in reading
// order, so each part is seen arriving (user): the headline lines, the
// description lines, the date, the time zone, then the social links. Starts
// on "preloader:reveal" (src/js/preloader.js), as the black layer lifts off
// the page, so each part rises as it is uncovered; sends
// "hero:introduced" once the headline is up, for its gradient wave. The masks
// clip only while the text rises. Only on a page load with the preloader.
const DELAY = 0.5; // s after the layer starts up, as it uncovers the headline
const RISE = { yPercent: 200, duration: 1.15, ease: "power3.out" };
const LINE_GAP = 0.16; // s between the headline lines
const PART_GAP = 0.12; // s between the other parts

export function initHeroIntro() {
  const hero = document.querySelector(".hero");
  if (!hero || !document.documentElement.classList.contains("is-preloading")) return () => {};

  // The lines of the headline and the description (set in hero.pug, as
  // in Figma) rise in their own masks.
  const lines = [...hero.querySelectorAll(".hero__line")];
  const [titleTexts, descriptionTexts] = [".hero__title", ".hero__description"].map((selector) => [
    ...hero.querySelectorAll(`${selector} .hero__line-text`),
  ]);
  // One-line parts rise whole, each in a mask of its own.
  const wrapped = [".hero__date", ".hero__timezone", ".hero__social"].map((selector) => {
    const part = hero.querySelector(selector);
    const mask = document.createElement("div");
    mask.className = "hero-intro-mask";
    part.replaceWith(mask);
    mask.append(part);
    return part;
  });
  lines.forEach((line) => line.classList.add("hero-intro-mask"));

  const parts = [...titleTexts, ...descriptionTexts, ...wrapped];
  gsap.set(parts, { yPercent: RISE.yPercent });

  const finish = () => {
    lines.forEach((line) => line.classList.remove("hero-intro-mask"));
    wrapped.forEach((part) => part.parentElement.replaceWith(part));
    gsap.set(parts, { clearProps: "transform" });
  };

  const { yPercent, ...rise } = RISE;
  const titleEnd = (titleTexts.length - 1) * LINE_GAP;
  const timeline = gsap
    .timeline({ paused: true, onComplete: finish })
    .to(titleTexts, { yPercent: 0, ...rise, stagger: LINE_GAP }, DELAY)
    .add(() => document.dispatchEvent(new CustomEvent("hero:introduced")), DELAY + titleEnd + RISE.duration * 0.8)
    .to([...descriptionTexts, ...wrapped], { yPercent: 0, ...rise, stagger: PART_GAP }, DELAY + titleEnd + LINE_GAP);
  const play = () => timeline.play();
  document.addEventListener("preloader:reveal", play, { once: true });

  return () => {
    document.removeEventListener("preloader:reveal", play);
    timeline.kill();
    if (wrapped[0].parentElement.classList.contains("hero-intro-mask")) finish();
  };
}
