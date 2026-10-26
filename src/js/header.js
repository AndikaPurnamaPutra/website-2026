import { ScrollTrigger } from "gsap/ScrollTrigger";

// Sticky header (option C, approved): hides on scroll down, shows on scroll up,
// always visible near the top, and switches to the light theme while its
// middle line is over a section with data-header-theme="dark".
export function initHeader() {
  const header = document.querySelector("[data-header]");
  if (!header) return () => {};

  const triggers = [];

  triggers.push(
    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        const nearTop = self.scroll() <= header.offsetHeight;
        // Keep it visible while a header link has keyboard focus (e.g. the Work dropdown).
        const hide = !nearTop && self.direction === 1 && !header.querySelector(":focus-visible");
        header.classList.toggle("is-hidden", hide);
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
    header.classList.remove("is-hidden", "is-dark");
  };
}
