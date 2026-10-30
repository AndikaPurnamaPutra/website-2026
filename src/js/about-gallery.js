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
const OPEN_AT = "30%"; // 45% felt a little fast (user)
const ZOOM_FROM = 1.35;
// Kept larger than its frame, to leave room for the picture to move.
const ZOOM = 1.2;
// rise: frame, Figma pixels up and down from its place; sink: picture, % of
// the frame up and down from the middle (the reference's 80px of an 834px
// card and 48px of a 427px one, about a tenth).
const LARGE = { rise: 96, sink: 9 };
const SMALL = { rise: 150, sink: 9 };
const PHOTOS = [LARGE, SMALL, LARGE, SMALL, LARGE];

export function initAboutGallery() {
  const photos = [...document.querySelectorAll(".about-gallery__photo")];
  if (!photos.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  const ctx = gsap.context(() => {
    photos.forEach((photo, i) => {
      const image = photo.querySelector(":scope > img");
      const { rise, sink } = PHOTOS[i % PHOTOS.length];
      gsap
        .timeline({
          scrollTrigger: { trigger: photo, start: "top bottom", end: "bottom top", scrub: LAG, invalidateOnRefresh: true },
          defaults: { ease: "none" },
        })
        .fromTo(photo, { y: () => rise * designPx() }, { y: () => -rise * designPx() }, 0)
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

  return () => ctx.revert();
}
