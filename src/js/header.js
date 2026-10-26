import { ScrollTrigger } from "gsap/ScrollTrigger";

// Fixed header (user decision, 27 Oct 2026): always visible, slimmer once the
// page is scrolled, and switches to the light theme while its middle line is
// over a section with data-header-theme="dark".
export function initHeader() {
  const header = document.querySelector("[data-header]");
  if (!header) return () => {};

  const triggers = [];

  triggers.push(
    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        // Always visible; the bar gets slimmer once the page leaves the top.
        header.classList.toggle("is-scrolled", self.scroll() > 10);
      },
    }),
  );

  // Dark sections; a pinned section is measured through its pin spacer so the
  // light theme lasts for the whole pinned scroll.
  const darkSections = [...document.querySelectorAll("[data-header-theme='dark']")];
  const activeDark = new Set();
  const middle = () => `top ${header.offsetHeight / 2}px`;
  const middleEnd = () => `bottom ${header.offsetHeight / 2}px`;

  darkSections.forEach((section) => {
    const area = section.parentElement?.classList.contains("pin-spacer") ? section.parentElement : section;
    triggers.push(
      ScrollTrigger.create({
        trigger: area,
        start: middle,
        end: middleEnd,
        onToggle: (self) => {
          if (self.isActive) activeDark.add(section);
          else activeDark.delete(section);
          header.classList.toggle("is-dark", activeDark.size > 0);
        },
      }),
    );
  });

  return () => {
    triggers.forEach((trigger) => trigger.kill());
    header.classList.remove("is-scrolled", "is-dark");
  };
}
