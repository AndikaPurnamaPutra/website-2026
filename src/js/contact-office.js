// The Office HQ link on Contact (user): its arrow flies out and back in as
// the pointer comes onto it, and the other way round as it leaves
// (_contact.scss: is-going / is-coming). Classes, so each plays in full and
// starts again on the next hover; keyboard focus too.
export function initContactOffice() {
  const link = document.querySelector("[data-office-link]");
  if (!link || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  const play = (name) => {
    link.classList.remove("is-going", "is-coming");
    void link.offsetWidth; // restart the animation
    link.classList.add(name);
  };
  const go = () => play("is-going");
  const back = () => play("is-coming");
  const events = new AbortController();
  const on = (type, handler) => link.addEventListener(type, handler, { signal: events.signal });
  on("pointerenter", go);
  on("pointerleave", back);
  on("focus", go);
  on("blur", back);

  return () => {
    events.abort();
    link.classList.remove("is-going", "is-coming");
  };
}
