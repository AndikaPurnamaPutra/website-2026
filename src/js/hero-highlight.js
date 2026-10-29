import gsap from "gsap";
import { createGradientWave } from "./gradient-wave.js";

// Hero headline accent "Elite digital" (reference from the user: the
// highlight on manual.studio). Black at rest like the rest of the headline; a
// brand-gradient wave runs through it shortly after load, again when the
// pointer enters the headline and each time it moves onto the other word;
// waves follow one another (src/js/gradient-wave.js).
const LOAD_DELAY = 0.8;

export function initHeroHighlight() {
  const title = document.querySelector(".hero__title");
  const accent = title?.querySelector(".hero__title-accent");
  if (!accent || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  const wave = createGradientWave(accent, "linear-gradient(201deg, var(--gradient-brand-stops))");
  const onLoad = gsap.delayedCall(LOAD_DELAY, wave.play);
  // A new wave when the pointer comes onto the headline and again each time
  // it moves onto the other word of the accent, so moving across "Elite
  // digital" sends one wave after another (as on manual.studio; user).
  let word = null;
  const onEnter = (event) => {
    word = wave.wordAt(event.clientX);
    wave.play();
  };
  const onMove = (event) => {
    const now = wave.wordAt(event.clientX);
    if (now === -1 || now === word) return;
    if (word !== -1) wave.play();
    word = now;
  };
  title.addEventListener("mouseenter", onEnter);
  accent.addEventListener("mousemove", onMove);

  return () => {
    onLoad.kill();
    title.removeEventListener("mouseenter", onEnter);
    accent.removeEventListener("mousemove", onMove);
    wave.destroy();
  };
}
