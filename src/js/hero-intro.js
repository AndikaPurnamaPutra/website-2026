import gsap from "gsap";
import { designPx } from "./design-px.js";

// Hero text rising after the preloader (user decision: all the hero text,
// coming up from below as on fluid.glass, whose lines rise from 200% of their
// height in a clipping mask, power3.out). One after another, in reading
// order, so each part is seen arriving (user): the headline lines, the
// description lines, the date, the time zone, then the social links. Starts
// on "preloader:reveal" (src/js/preloader.js), as the black box comes down
// over the page, so each part rises as it is uncovered; sends
// "hero:introduced" once the headline is up, for its gradient wave. Besides
// rising in their masks, the headline as a whole comes up from lower down,
// against the box going down, and the other parts a little (user). The masks
// clip only while the text rises. Only on a page load with the preloader.
const DELAY = 0.5; // s after the box starts down, as it passes the headline
const RISE = { yPercent: 200, duration: 1.3, ease: "power3.out" };
const LINE_GAP = 0.2; // s between the headline lines
const PART_GAP = 0.15; // s between the other parts
const TITLE_LIFT = 120; // Figma px the headline comes up from
const PART_LIFT = 40; // Figma px the other parts come up from
const LIFT = { duration: 1.6, ease: "power3.out" };

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
  // The blocks that come up: the headline, the right column, the social
  // links (in their mask).
  const title = hero.querySelector(".hero__title");
  const others = [hero.querySelector(".hero__info"), wrapped[2].parentElement];

  const finish = () => {
    lines.forEach((line) => line.classList.remove("hero-intro-mask"));
    wrapped.forEach((part) => part.parentElement.replaceWith(part));
    gsap.set([...parts, title, others[0]], { clearProps: "transform" });
  };

  const { yPercent, ...rise } = RISE;
  const titleEnd = (titleTexts.length - 1) * LINE_GAP;
  const timeline = gsap
    .timeline({ paused: true, onComplete: finish })
    .from(title, { y: () => TITLE_LIFT * designPx(), ...LIFT }, DELAY)
    .to(titleTexts, { yPercent: 0, ...rise, stagger: LINE_GAP }, DELAY)
    .from(others, { y: () => PART_LIFT * designPx(), ...LIFT }, DELAY + titleEnd + LINE_GAP)
    .add(() => document.dispatchEvent(new CustomEvent("hero:introduced")), DELAY + titleEnd + 1)
    .to([...descriptionTexts, ...wrapped], { yPercent: 0, ...rise, stagger: PART_GAP }, DELAY + titleEnd + LINE_GAP);
  const play = () => timeline.play();
  document.addEventListener("preloader:reveal", play, { once: true });

  return () => {
    document.removeEventListener("preloader:reveal", play);
    timeline.kill();
    if (wrapped[0].parentElement.classList.contains("hero-intro-mask")) finish();
  };
}
