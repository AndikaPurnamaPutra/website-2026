import { ScrollTrigger } from "gsap/ScrollTrigger";

// Fixed header (Figma 1611:6986): its soft shadow fades in once the page is
// scrolled away from the top, and it switches to a dark version (proposal,
// approved) while its middle line is over a section with
// data-header-theme="dark". Timing is a proposal.
export function initHeader() {
  const header = document.querySelector("[data-header]");
  if (!header) return () => {};

  const update = () => header.classList.toggle("is-scrolled", window.scrollY > 0);
  update();
  window.addEventListener("scroll", update, { passive: true });

  // A pinned section is measured through its pin spacer so the dark version
  // lasts for the whole pinned scroll.
  const activeDark = new Set();
  const middle = () => `top ${header.offsetHeight / 2}px`;
  const middleEnd = () => `bottom ${header.offsetHeight / 2}px`;
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
    window.removeEventListener("scroll", update);
    triggers.forEach((trigger) => trigger.kill());
    header.classList.remove("is-scrolled", "is-dark");
  };
}
