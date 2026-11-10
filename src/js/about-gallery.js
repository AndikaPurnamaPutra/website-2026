import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { designPx } from "./design-px.js";

// About gallery (Figma 1734:399; not animated in Figma). Follows the
// portfolio cards of art-yakushev.com (user decision): while a photo crosses
// the screen its frame rises, the small photos faster than the large ones,
// and the picture inside moves the other way, a little down, so the photos
// seem to float at different depths. No opening effect: the photos are
// simply there and only the scroll moves them. As there, the movement
// follows the scroll with a short lag (scrub 0.5), on top of the smooth
// scroll.
// The reference's small cards rise four times as far (±400px), beside the
// large ones; here the small photos sit 80px below a large one, so they rise
// only as far as keeps them clear of it (±150px: at least 26px apart on
// screens 720–1100px tall; user decision). More room around them for a
// longer rise (+150px for ±290px, +300px for ±400px) left wide empty gaps,
// and was put back (user).
// Each photo also opens like a curtain lifting from its bottom edge as it
// comes up the screen, while its picture settles from a closer zoom; fully
// open once its top is at OPEN_AT of the screen (user decision; it replaces
// a picture coming into colour, and before that a blur coming into focus).
// The layout stays as in Figma. With reduced motion the photos stay still.
const LAG = 0.5; // s
const OPEN_AT = "40%"; // 45% felt a little fast, 30% too long (user)
const ZOOM_FROM = 1.28; // 1.35 settled too long (user)
// Kept larger than its frame, to leave room for the picture to move.
const ZOOM = 1.2;
// The photos (their frames) follow the mouse a little, the small ones
// further, as nearer (user: the photos moving as the mouse moves, not the
// pictures in them; a picture following the pointer, as telhaclarke.com.au's
// All Work, was dropped): Figma pixels, from the middle of the screen to its
// edge; on the CSS `translate`, apart from the scroll's transform.
const MOUSE = { large: [22, 14], small: [38, 24] }; // half of it was too faint (user)
const MOUSE_FOLLOW = 1.2; // s
const PLAY_FOLLOW = 0.6; // s, as the showreel button
// rise: frame, Figma pixels up and down from its place; sink: picture, % of
// the frame up and down from the middle (the reference's 80px of an 834px
// card and 48px of a 427px one, about a tenth).
const LARGE = { rise: 96, sink: 9 };
const SMALL = { rise: 150, sink: 9 };
const PHOTOS = [LARGE, SMALL, LARGE, SMALL, LARGE];

export function initAboutGallery() {
  const photos = [...document.querySelectorAll(".about-gallery__photo")];
  if (!photos.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  // The rise in the gallery's own scale (its width over Figma's 1360), so it
  // keeps the same share of the gaps when the composition is scaled down on
  // tablets (plan 32, step 4c; the same as designPx() from the laptop up).
  // On phones the photos are one column, 16 apart: all rise alike there, or
  // a small photo rising past a large one would cover it.
  const canvas = photos[0].parentElement;
  const scale = () => canvas.offsetWidth / 1360;
  const column = window.matchMedia("(max-width: 743.98px)").matches;
  const ctx = gsap.context(() => {
    photos.forEach((photo, i) => {
      const image = photo.querySelector(":scope > img");
      const { sink } = PHOTOS[i % PHOTOS.length];
      const rise = column ? LARGE.rise : PHOTOS[i % PHOTOS.length].rise;
      gsap
        .timeline({
          scrollTrigger: { trigger: photo, start: "top bottom", end: "bottom top", scrub: LAG, invalidateOnRefresh: true },
          defaults: { ease: "none" },
        })
        .fromTo(photo, { y: () => rise * scale() }, { y: () => -rise * scale() }, 0)
        .fromTo(image, { yPercent: -sink }, { yPercent: sink }, 0);

      // The curtain.
      gsap
        .timeline({
          scrollTrigger: { trigger: photo, start: "top bottom", end: `top ${OPEN_AT}`, scrub: LAG },
          defaults: { ease: "power2.out", duration: 1 },
        })
        .fromTo(photo, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)" }, 0)
        .fromTo(image, { scale: ZOOM_FROM }, { scale: ZOOM }, 0);
    });
  });

  // The mouse, on all the photos at once; mouse only. shift: -1 to 1.
  const depths = photos.map((_, i) => (PHOTOS[i % PHOTOS.length] === SMALL ? MOUSE.small : MOUSE.large));
  const shift = { x: 0, y: 0 };
  const draw = () => {
    const px = designPx();
    photos.forEach((photo, i) => {
      const [dx, dy] = depths[i];
      photo.style.translate = `${shift.x * dx * px}px ${shift.y * dy * px}px`;
    });
  };
  const toX = gsap.quickTo(shift, "x", { duration: MOUSE_FOLLOW, ease: "power3.out", onUpdate: draw });
  const toY = gsap.quickTo(shift, "y", { duration: MOUSE_FOLLOW, ease: "power3.out", onUpdate: draw });
  const events = new AbortController();
  window.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType !== "mouse") return;
      toX(-((event.clientX / window.innerWidth) * 2 - 1));
      toY(-((event.clientY / window.innerHeight) * 2 - 1));
    },
    { passive: true, signal: events.signal },
  );

  // "Play Video" follows the cursor over its photo, which hides the system
  // cursor, and glides back to the centre as the cursor leaves, as the hero
  // showreel's button (src/js/hero-showreel.js; user). Kept inside the photo.
  const play = document.querySelector(".about-gallery__play");
  const playPhoto = play?.closest(".about-gallery__photo");
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (play && fine) {
    gsap.set(play, { xPercent: -50, yPercent: -50, x: 0, y: 0 });
    const playX = gsap.quickTo(play, "x", { duration: PLAY_FOLLOW, ease: "power3.out" });
    const playY = gsap.quickTo(play, "y", { duration: PLAY_FOLLOW, ease: "power3.out" });
    const cursor = { x: -1, y: -1 };
    const place = () => {
      const box = playPhoto.getBoundingClientRect();
      const over = cursor.x >= box.left && cursor.x <= box.right && cursor.y >= box.top && cursor.y <= box.bottom;
      playPhoto.classList.toggle("is-following", over);
      if (!over) {
        playX(0);
        playY(0);
        return;
      }
      const halfW = play.offsetWidth / 2;
      const halfH = play.offsetHeight / 2;
      playX(gsap.utils.clamp(box.left + halfW, box.right - halfW, cursor.x) - (box.left + box.width / 2));
      playY(gsap.utils.clamp(box.top + halfH, box.bottom - halfH, cursor.y) - (box.top + box.height / 2));
    };
    window.addEventListener(
      "pointermove",
      (event) => {
        if (event.pointerType !== "mouse") return;
        cursor.x = event.clientX;
        cursor.y = event.clientY;
        place();
      },
      { passive: true, signal: events.signal },
    );
    window.addEventListener("scroll", place, { passive: true, signal: events.signal });
    document.addEventListener(
      "pointerout",
      (event) => {
        if (event.relatedTarget) return;
        cursor.x = cursor.y = -1;
        place();
      },
      { signal: events.signal },
    );
  }

  return () => {
    events.abort();
    if (play) {
      gsap.killTweensOf(play);
      gsap.set(play, { clearProps: "transform" });
      playPhoto.classList.remove("is-following");
    }
    gsap.killTweensOf(shift);
    photos.forEach((photo) => (photo.style.translate = ""));
    ctx.revert();
  };
}
