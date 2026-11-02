import { ScrollTrigger } from "gsap/ScrollTrigger";

// Fixed header (Figma 1611:6986): always in view, transparent and inverting
// what lies behind it, as on leoparpeix.com (user decision; it used to hide on
// scroll down and over the dark sections). While the Work menu is open it is
// drawn normally, with white text (proposal, approved) while its middle line
// is over a section with data-header-theme="dark".

export function initHeader() {
  const header = document.querySelector("[data-header]");
  if (!header) return () => {};

  // A pinned section is measured through its pin spacer so the dark version
  // lasts for the whole pinned scroll.
  const middle = () => `top ${header.offsetHeight / 2}px`;
  const middleEnd = () => `bottom ${header.offsetHeight / 2}px`;
  const activeDark = new Set();
  const triggers = [...document.querySelectorAll("[data-header-theme='dark']")].map((section) => {
    const area = section.parentElement?.classList.contains("pin-spacer") ? section.parentElement : section;
    return ScrollTrigger.create({
      trigger: area,
      start: middle,
      end: middleEnd,
      onToggle: (self) => {
        if (self.isActive) activeDark.add(section);
        else activeDark.delete(section);
        header.classList.toggle("is-dark", activeDark.size > 0);
      },
    });
  });

  return () => {
    triggers.forEach((trigger) => trigger.kill());
    header.classList.remove("is-dark");
  };
}
