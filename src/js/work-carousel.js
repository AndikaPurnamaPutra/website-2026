// Arrow buttons for the Our Work carousels. Scrolling itself is native
// (trackpad/swipe) with CSS scroll snap; arrows move one card and dim at the ends.
export function initWorkCarousels() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const cleanups = [...document.querySelectorAll("[data-work-carousel]")].map((carousel) => {
    const viewport = carousel.querySelector("[data-work-viewport]");
    const prev = carousel.querySelector("[data-work-prev]");
    const next = carousel.querySelector("[data-work-next]");

    // One card plus the gap, measured so it follows the fluid scale.
    const step = () => {
      const [first, second] = viewport.querySelectorAll(".work-card");
      return second ? second.offsetLeft - first.offsetLeft : first?.offsetWidth ?? 0;
    };

    const update = () => {
      const max = viewport.scrollWidth - viewport.clientWidth;
      prev.disabled = viewport.scrollLeft <= 1;
      next.disabled = viewport.scrollLeft >= max - 1;
    };

    const scrollBy = (direction) => () =>
      viewport.scrollBy({ left: direction * step(), behavior: reduceMotion ? "auto" : "smooth" });

    const onPrev = scrollBy(-1);
    const onNext = scrollBy(1);

    prev.addEventListener("click", onPrev);
    next.addEventListener("click", onNext);
    viewport.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();

    return () => {
      prev.removeEventListener("click", onPrev);
      next.removeEventListener("click", onNext);
      viewport.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  });

  return () => cleanups.forEach((cleanup) => cleanup());
}
