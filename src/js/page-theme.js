import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EXIT } from "./services-scroll.js";

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
const LIGHT_AT = "top 50%"; // Our Work's top, if Services is not pinned

export function initPageTheme() {
  const services = document.querySelector("[data-services]");
  const ourWork = document.querySelector(".our-work");
  if (!services || !ourWork) return () => {};

  let dark;
  let light;
  const update = () => {
    if (!dark || !light) return;
    document.body.classList.toggle("is-dark", dark.progress > 0 && light.progress === 0);
  };
  const mark = (trigger, start) =>
    ScrollTrigger.create({ trigger, start, end: "max", onToggle: update, onRefresh: update });
  dark = mark(services, DARK_AT);
  const pin = ScrollTrigger.getById("services");
  light = pin
    ? ScrollTrigger.create({
        start: () => pin.end - EXIT * window.innerHeight,
        end: "max",
        onToggle: update,
        onRefresh: update,
      })
    : mark(ourWork, LIGHT_AT);
  update();

  return () => {
    dark.kill();
    light.kill();
    document.body.classList.remove("is-dark");
  };
}
