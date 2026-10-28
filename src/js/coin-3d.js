// Loads the 3D coin journey (src/js/coin-scene.js, with three.js) as its own
// chunk once the page has loaded, so it never delays the first paint. The
// coin pictures (hero and footer) are hidden meanwhile and come back if the
// 3D coin fails. Skipped with reduced motion (the pictures stay).
export function initCoin3d() {
  const anchors = {
    hero: document.querySelector("img.hero__coin"),
    footer: document.querySelector("img.site-footer__coin"),
  };
  const pictures = Object.values(anchors).filter(Boolean);
  if (!pictures.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  const fallback = () => pictures.forEach((picture) => picture.classList.add("is-fallback"));
  let cleanup = () => {};
  let cancelled = false;
  const load = () =>
    import("./coin-scene.js")
      .then(({ mountCoin }) => {
        if (!cancelled) cleanup = mountCoin(anchors, fallback);
      })
      .catch(fallback);
  if (document.readyState === "complete") load();
  else window.addEventListener("load", load, { once: true });

  return () => {
    cancelled = true;
    window.removeEventListener("load", load);
    pictures.forEach((picture) => picture.classList.remove("is-fallback"));
    cleanup();
  };
}
