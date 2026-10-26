import { ScrollTrigger } from "gsap/ScrollTrigger";

// Muted looping videos marked [data-inview-video] play only while they are on
// screen and never with reduced motion (their poster, the first frame, stays).
export function initInviewVideos() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const triggers = [...document.querySelectorAll("[data-inview-video]")].map((video) => {
    // A video inside a pinned section is measured through the pin spacer.
    const pinned = video.closest(".pin-spacer");
    return ScrollTrigger.create({
      trigger: pinned || video,
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) => {
        if (self.isActive && !reduceMotion) video.play().catch(() => {});
        else video.pause();
      },
    });
  });

  return () => triggers.forEach((trigger) => trigger.kill());
}
