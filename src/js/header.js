import { ScrollTrigger } from "gsap/ScrollTrigger";

// Fixed header (Figma 1611:6986): always in view, transparent and inverting
// what lies behind it, as on leoparpeix.com (user decision; it used to hide on
// scroll down and over the dark sections). While the Work menu is open it is
// drawn normally, with white text (proposal, approved) while its middle line
// is over a section with data-header-theme="dark". It slides away over the
// pinned Services and Motto (data-header-hide) while they are held, in both
// directions, as it did before (user decision); not while a link in it has
// keyboard focus or the Work menu is open.

export function initHeader() {
  const header = document.querySelector("[data-header]");
  if (!header) return () => {};

  // A pinned section is measured through its pin spacer so the dark version
  // lasts for the whole pinned scroll.
  const middle = () => `top ${header.offsetHeight / 2}px`;
  const middleEnd = () => `bottom ${header.offsetHeight / 2}px`;
  const over = (selector, className, end = middleEnd) => {
    const active = new Set();
    return [...document.querySelectorAll(selector)].map((section) => {
      const area = section.parentElement?.classList.contains("pin-spacer") ? section.parentElement : section;
      return ScrollTrigger.create({
        trigger: area,
        start: middle,
        end,
        onToggle: (self) => {
          if (self.isActive) active.add(section);
          else active.delete(section);
          header.classList.toggle(className, active.size > 0);
        },
      });
    });
  };
  // Hidden until the section lets go of the screen (its bottom at the
  // screen's bottom): Motto runs on behind the footer to the end of the page,
  // and the header would not have come back there.
  const triggers = [...over("[data-header-theme='dark']", "is-dark"), ...over("[data-header-hide]", "is-hidden", "bottom bottom")];

  return () => {
    triggers.forEach((trigger) => trigger.kill());
    header.classList.remove("is-dark", "is-hidden");
  };
}
