import { ScrollTrigger } from "gsap/ScrollTrigger";

// Fixed header (Figma 1611:6986): hides on scroll down and shows on scroll up;
// its soft shadow fades in once the page is scrolled away from the top, and it switches to a dark version (proposal,
// approved) while its middle line is over a section with
// data-header-theme="dark". Timing is a proposal. It stays hidden in both
// directions while over the pinned What we do and Motto sections (user
// decisions).

export function initHeader() {
  const header = document.querySelector("[data-header]");
  if (!header) return () => {};

  // Hides while scrolling down, shows again on scroll up (user decision);
  // always visible near the top and while a header link has keyboard focus.
  let lastY = window.scrollY;
  let scrollHidden = false;
  const activeDark = new Set();
  const setHidden = () => {
    const focused = header.querySelector(":focus-visible");
    header.classList.toggle("is-hidden", !focused && (scrollHidden || activeDark.size > 0));
  };
  const update = () => {
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 0);
    if (Math.abs(y - lastY) < 4) return;
    scrollHidden = y > lastY && y > header.offsetHeight;
    lastY = y;
    setHidden();
  };
  update();
  window.addEventListener("scroll", update, { passive: true });

  // A pinned section is measured through its pin spacer so the dark version
  // lasts for the whole pinned scroll.
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
        setHidden();
      },
    });
  });

  return () => {
    window.removeEventListener("scroll", update);
    triggers.forEach((trigger) => trigger.kill());
    header.classList.remove("is-scrolled", "is-hidden", "is-dark");
  };
}
