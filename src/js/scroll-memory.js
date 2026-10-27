import { ScrollTrigger } from "gsap/ScrollTrigger";

// Keeps the scroll position on reload and back/forward. The browser's own
// restoration runs before the pinned sections have added their scroll length
// (and before ScrollTrigger's load refresh), so the page could land at the
// top. The position is saved when leaving the page and set again once the
// pins exist, and once more after the load, the web fonts and a refresh.
// A link to the page (a new navigation) still starts at the top.
export function initScrollMemory() {
  if (!("scrollRestoration" in history)) return () => {};
  history.scrollRestoration = "manual";

  const key = `scroll:${location.pathname}`;
  const save = () => {
    try {
      sessionStorage.setItem(key, String(window.scrollY));
    } catch {
      // Storage unavailable (private mode): nothing to keep.
    }
  };
  window.addEventListener("pagehide", save);

  const navigation = performance.getEntriesByType("navigation")[0];
  const returning = navigation && (navigation.type === "reload" || navigation.type === "back_forward");
  let saved = null;
  try {
    saved = returning && !location.hash ? sessionStorage.getItem(key) : null;
  } catch {
    saved = null;
  }

  if (saved !== null) {
    const restore = () => {
      window.scrollTo(0, Number(saved));
      ScrollTrigger.update();
    };
    restore();
    const loaded = new Promise((resolve) => {
      if (document.readyState === "complete") resolve();
      else window.addEventListener("load", resolve, { once: true });
    });
    Promise.all([loaded, document.fonts?.ready]).then(() => {
      ScrollTrigger.refresh();
      restore();
    });
  }

  return () => window.removeEventListener("pagehide", save);
}
