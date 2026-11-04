import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EXIT } from "./services-scroll.js";
import { EXIT as MOTTO_EXIT } from "./motto-scroll.js";

// Page theme (docs/implementation/21-page-theme.md; reference from the user:
// revelatio.studio): the page, every section with it (Services is light as
// it comes up), turns dark as soon as Services shows at the bottom of the
// screen, so it is hardly seen light and the Statement is what turns over
// (user), and
// light again as soon as Services moves on from its last, full picture to the
// next section (its exit starts; user), both ways with the scroll. The switch
// eases in CSS as on revelatio.studio (0.35s, ease: body,
// src/scss/base/_reset.scss).
// Two marks rather than one range: a range starting above the Services pin
// would not take that pin's length into its end.
const DARK_AT = "top 85%"; // the Services' top
// Motto overlaps Milestone's bottom, so at 85% Milestone was still being
// read; the page turns dark once Milestone has quite faded out (it fades
// while Motto's top goes from about 71% to 37% of the screen,
// src/js/motto-scroll.js; user): at 40% its last trace turned over too, a
// flicker.
const MOTTO_DARK_AT = "top 37%";
const LIGHT_AT = "top 50%"; // Our Work's top, if Services is not pinned

export function initPageTheme() {
  const services = document.querySelector("[data-services]");
  const ourWork = document.querySelector(".our-work");
  const motto = document.querySelector("[data-motto]");
  const toned = motto?.closest(".tone-shift");

  // Dark stretches: each from one mark to another.
  const ranges = [];
  let night;
  const update = () => {
    const dark = ranges.some(({ from, to }) => from.progress > 0 && to.progress === 0);
    document.body.classList.toggle("is-dark", dark);
    // The Motto wrapper stays dark from its switch on (src/scss/sections/_motto.scss).
    if (night) toned.classList.toggle("is-night", night.progress > 0);
  };
  const mark = (vars) => ScrollTrigger.create({ end: "max", onToggle: update, onRefresh: update, ...vars });

  if (services && ourWork) {
    const pin = ScrollTrigger.getById("services");
    ranges.push({
      from: mark({ trigger: services, start: DARK_AT }),
      to: pin ? mark({ start: () => pin.end - EXIT * window.innerHeight }) : mark({ trigger: ourWork, start: LIGHT_AT }),
    });
  }
  // Milestone → Motto (user): Milestone stays on light and fades out, then
  // the page turns dark and motto 1 blurs in; light again as Motto's exit
  // starts, while Motto still covers the whole screen, so the footer comes up
  // light. Turned as Motto's pin ended, the footer showed dark at first and
  // then turned light under the scroll (and dark again going up; user: it
  // jerked). Motto keeps its own dark backdrop, so it stays dark meanwhile.
  if (motto && toned) {
    const mottoPin = ScrollTrigger.getById("motto");
    night = mark({ trigger: motto, start: MOTTO_DARK_AT });
    ranges.push({
      from: night,
      to: mottoPin
        ? mark({ start: () => mottoPin.end - MOTTO_EXIT * window.innerHeight })
        : mark({ trigger: toned, start: "bottom bottom" }),
    });
  }
  update();

  return () => {
    ranges.forEach(({ from, to }) => {
      from.kill();
      to.kill();
    });
    document.body.classList.remove("is-dark");
    toned?.classList.remove("is-night");
  };
}
