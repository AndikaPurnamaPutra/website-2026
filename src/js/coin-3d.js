import { afterPageShown } from "./page-transition.js";

// Loads the 3D coin journey (src/js/coin-scene.js, with three.js) as its own
// chunk once the page has loaded, so it never delays the first paint. On a
// page with only the footer coin it waits until the footer is within two
// screens (AGENTS.md §15: it is ≈3.4 MB, and was loaded on every page however
// far below the footer was), early enough to be ready as the footer shows.
// The coin pictures (hero and footer) are hidden meanwhile and come back if
// the 3D coin fails. After a page transition it waits until the new page has
// shown: its first frame (shaders, textures) takes ≈120ms and made the
// transition stutter (src/js/page-transition.js). Skipped with reduced
// motion (the pictures stay).
export function initCoin3d() {
  const anchors = {
    hero: document.querySelector("img.hero__coin"),
    footer: document.querySelector("img.site-footer__coin"),
  };
  const pictures = Object.values(anchors).filter(Boolean);
  if (!pictures.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  // The pictures instead; the preloader stops waiting for the coin.
  const fallback = () => {
    pictures.forEach((picture) => picture.classList.add("is-fallback"));
    document.dispatchEvent(new CustomEvent("coin:ready"));
  };
  let cleanup = () => {};
  let cancelled = false;
  const load = () =>
    import("./coin-scene.js")
      .then(({ mountCoin }) => {
        if (!cancelled) cleanup = mountCoin(anchors, fallback);
      })
      .catch(fallback);
  let observer = null;
  const start = () => {
    if (anchors.hero || !anchors.footer) return load();
    observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        load();
      },
      { rootMargin: "200% 0px" },
    );
    observer.observe(anchors.footer.closest(".site-footer") ?? anchors.footer);
  };
  const begin = () => afterPageShown(() => !cancelled && start());
  if (document.readyState === "complete") begin();
  else window.addEventListener("load", begin, { once: true });

  return () => {
    cancelled = true;
    observer?.disconnect();
    window.removeEventListener("load", begin);
    pictures.forEach((picture) => picture.classList.remove("is-fallback"));
    cleanup();
  };
}
