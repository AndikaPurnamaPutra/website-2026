import gsap from "gsap";
import { createGradientWave } from "./gradient-wave.js";

// Hero headline accent "Elite digital" (reference from the user: the
// highlight on manual.studio). Black at rest like the rest of the headline; a
// brand-gradient wave runs through it shortly after load and again whenever
// the pointer enters the headline (src/js/gradient-wave.js).
const LOAD_DELAY = 0.8;

export function initHeroHighlight() {
  const title = document.querySelector(".hero__title");
  const accent = title?.querySelector(".hero__title-accent");
  if (!accent || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  const wave = createGradientWave(accent, "linear-gradient(201deg, var(--gradient-brand-stops))");
  const onLoad = gsap.delayedCall(LOAD_DELAY, wave.play);
  title.addEventListener("mouseenter", wave.play);

  return () => {
    onLoad.kill();
    title.removeEventListener("mouseenter", wave.play);
    wave.destroy();
  };
}
