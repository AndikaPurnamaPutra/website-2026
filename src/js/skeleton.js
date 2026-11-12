// Skeleton while large pictures load (src/scss/components/_skeleton.scss).
// Only the photographs in frames, where an empty box shows: Our Work cards,
// Services, the About photos, the Contact gallery, the navbar's work menu.
// Not the hero showreel (under the preloader, and its picture is clipped
// by its own animation), the illustrations, textures, logos or avatars.
// FADE: pictures that also fade in once loaded; the others (KEEP) have an
// animation of their own on their opacity, so they only lose the grey.
const FADE = [".work-card__image", ".about-gallery__photo img", ".contact-gallery__media img", ".work-menu__card img"];
const KEEP = [".services__image", ".about-intro__photo img"];

// Whether the picture (for a video, its poster) is in.
function whenLoaded(el, done) {
  if (el.tagName === "VIDEO") {
    const poster = el.getAttribute("poster");
    if (!poster) {
      if (el.readyState >= 2) return done(false);
      el.addEventListener("loadeddata", () => done(true), { once: true });
      return () => {};
    }
    const probe = new Image();
    probe.src = poster;
    if (probe.complete) return done(false);
    probe.onload = probe.onerror = () => done(true);
    return () => {
      probe.onload = probe.onerror = null;
    };
  }
  if (el.complete) return done(false);
  const finish = () => done(true);
  el.addEventListener("load", finish, { once: true });
  el.addEventListener("error", finish, { once: true });
  return () => {
    el.removeEventListener("load", finish);
    el.removeEventListener("error", finish);
  };
}

export function initSkeleton() {
  const items = [
    ...[...document.querySelectorAll(FADE.join(","))].map((el) => [el, true]),
    ...[...document.querySelectorAll(KEEP.join(","))].map((el) => [el, false]),
  ];
  const cleanups = items.map(([el, fade]) => {
    // Already in (cached): nothing shown, no fade.
    let waiting = true;
    const stop = whenLoaded(el, (late) => {
      waiting = false;
      el.classList.remove("is-skeleton");
      if (!late || !fade) return;
      el.classList.add("is-skeleton-in");
      el.addEventListener("animationend", () => el.classList.remove("is-skeleton-in"), { once: true });
    });
    if (waiting) el.classList.add("is-skeleton");
    return () => {
      stop?.();
      el.classList.remove("is-skeleton", "is-skeleton-in");
    };
  });
  return () => cleanups.forEach((cleanup) => cleanup());
}
