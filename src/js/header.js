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
  // One set of reasons per class, shared by every trigger that sets it.
  const reasons = {};
  const mark = (className, reason, on) => {
    const active = (reasons[className] ??= new Set());
    if (on) active.add(reason);
    else active.delete(reason);
    header.classList.toggle(className, active.size > 0);
  };
  const over = (selector, className, end = middleEnd) => {
    return [...document.querySelectorAll(selector)].map((section) => {
      const area = section.parentElement?.classList.contains("pin-spacer") ? section.parentElement : section;
      return ScrollTrigger.create({
        trigger: area,
        start: middle,
        end,
        onToggle: (self) => mark(className, section, self.isActive),
      });
    });
  };
  // Hidden until the section lets go of the screen (its bottom at the
  // screen's bottom): Motto runs on behind the footer to the end of the page,
  // and the header would not have come back there.
  const triggers = [...over("[data-header-theme='dark']", "is-dark"), ...over("[data-header-hide]", "is-hidden", "bottom bottom")];

  // Also hidden over the footer (user decision, 10 Nov 2026: its logo right
  // above the footer's own read as doubled, and the footer has the whole
  // navigation): from when the footer's edge (the bottom of the content
  // above it, which it comes up from behind) passes the middle of the
  // screen, to the end of the page; back on the way up.
  const footer = document.querySelector(".site-footer");
  const above = footer?.previousElementSibling;
  if (above) {
    triggers.push(
      ScrollTrigger.create({
        trigger: above,
        start: "bottom 50%",
        end: "max",
        // Measured after the pins above (Services, Motto), which lengthen
        // the page; measured before them it began far too early.
        refreshPriority: -1,
        // By progress: at the very end of the page the trigger counts as
        // left, and the header came back there.
        onUpdate: (self) => mark("is-hidden", footer, self.progress > 0),
        onRefresh: (self) => mark("is-hidden", footer, self.progress > 0),
      }),
    );
  }

  return () => {
    triggers.forEach((trigger) => trigger.kill());
    header.classList.remove("is-dark", "is-hidden");
  };
}
