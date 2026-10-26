// Fixed header (Figma 1611:6986): its soft shadow fades in once the page is
// scrolled away from the top (user decision; timing is a proposal).
export function initHeader() {
  const header = document.querySelector("[data-header]");
  if (!header) return () => {};

  const update = () => header.classList.toggle("is-scrolled", window.scrollY > 0);
  update();
  window.addEventListener("scroll", update, { passive: true });

  return () => {
    window.removeEventListener("scroll", update);
    header.classList.remove("is-scrolled");
  };
}
