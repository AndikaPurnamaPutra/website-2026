// Loads the 3D hero coin (src/js/hero-coin-scene.js, with three.js) as its own
// chunk once the page has loaded, so it never delays the first paint. coin.png
// is hidden meanwhile (only one coin ever shows) and comes back if the 3D coin
// fails. Skipped with reduced motion (coin.png stays).
export function initHeroCoin3d() {
  const image = document.querySelector(".hero__coin");
  const hero = image?.closest(".hero");
  if (!image || !hero || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  let cleanup = () => {};
  let cancelled = false;
  const load = () =>
    import("./hero-coin-scene.js")
      .then(({ mountHeroCoin }) => {
        if (!cancelled) cleanup = mountHeroCoin(image, hero);
      })
      .catch(() => image.classList.add("is-fallback"));
  if (document.readyState === "complete") load();
  else window.addEventListener("load", load, { once: true });

  return () => {
    cancelled = true;
    image.classList.remove("is-fallback");
    window.removeEventListener("load", load);
    cleanup();
  };
}
