import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

// About page entrance (docs/implementation/30-about-motion.md), as Contact's
// (src/js/contact-intro.js): on load the title's lines rise in their windows
// and, right with them, the team photo opens from the bottom, quickly, its
// picture rising in it (user: it came too late and too slowly, odd); the
// text below it (lead, note,
// button and its caption) rises part by part as it comes into the screen,
// with the rest if it is there already. Hidden by the CSS until it is set up
// (_about.scss: is-about-ready). As the page scrolls, the picture moves in its
// frame, slower than the page (as telhaclarke.com.au; user). Nothing moves
// with reduced motion.
const RISE = 200; // % of its height text rises from
const DESCENT = 25; // % of its height its window reaches below it (g, p, y)
const LINE_GAP = 0.15; // s between the title's lines
const PART_GAP = 0.09; // s between the other parts
const TEXT_IN = 1.25; // s text takes to rise (1 was a little too fast; user)
const PHOTO_AT = 0.2; // s after the title starts, the photo opens
const PHOTO_IN = 1.2; // s it takes (0.9 was a little too fast; user)
const WAIT = 1500; // ms at most for the photo before it plays

export function initAboutIntro() {
  const intro = document.querySelector(".about-intro");
  if (!intro || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  // Split once the web fonts are in, so the lines break where they are set;
  // and started once the team photo is loaded and decoded, so the browser
  // is not still drawing it while it opens (it stuttered; user). Not waiting
  // longer than WAIT for the photo.
  let cleanup = () => {};
  let cancelled = false;
  const picture = intro.querySelector(".about-intro__photo img");
  const decoded = picture?.decode?.().catch(() => {}) ?? Promise.resolve();
  const photoReady = Promise.race([decoded, new Promise((resolve) => setTimeout(resolve, WAIT))]);
  Promise.all([document.fonts?.ready, photoReady]).then(() => {
    if (!cancelled) cleanup = setUp(intro);
  });
  return () => {
    cancelled = true;
    cleanup();
  };
}

function setUp(intro) {
  const rise = (els, vars) =>
    gsap.fromTo(
      els,
      { yPercent: RISE, clipPath: `inset(-20% -20% ${RISE - DESCENT}% -20%)` },
      { yPercent: 0, clipPath: `inset(-20% -20% ${-DESCENT}% -20%)`, duration: TEXT_IN, ease: "power3.out", ...vars },
    );

  const title = SplitText.create(intro.querySelector(".about-intro__title"), { type: "lines", aria: "none" });
  const lead = SplitText.create(intro.querySelector(".about-intro__lead"), { type: "lines", aria: "none" });
  const note = SplitText.create(intro.querySelector(".about-intro__note"), { type: "lines", aria: "none" });
  const cta = [...intro.querySelectorAll(".about-intro__cta > *")];
  const photo = intro.querySelector(".about-intro__photo");
  const picture = photo.querySelector("img");
  const body = intro.querySelector(".about-intro__body");
  const bodyParts = [...lead.lines, ...note.lines, ...cta];

  const tl = gsap
    .timeline({ delay: 0.1 })
    .add(rise(title.lines, { stagger: LINE_GAP }), 0)
    .fromTo(
      photo,
      { clipPath: "inset(100% 0% 0% 0%)" },
      { clipPath: "inset(0% 0% 0% 0%)", duration: PHOTO_IN, ease: "power3.out" },
      PHOTO_AT,
    )
    .fromTo(picture, { yPercent: 12 }, { yPercent: 0, duration: PHOTO_IN, ease: "power3.out" }, PHOTO_AT);
  const bodyIn = rise(bodyParts, { stagger: PART_GAP, paused: true });
  // The picture is 30% taller than its frame, not cropped at the sides
  // (_about.scss; cropped, it was too close; user): it goes down in
  // it, from its bottom edge as the frame comes up from the bottom of the
  // screen to its top edge as it leaves at the top, so it lags behind the
  // page (12% and 15% hardly showed, 20% with a zoom was too close, a frame
  // growing with the scroll was odd; user), and zooms out a little, 6%
  // (user: a little zoom). `y` adds
  // to the entrance's yPercent.
  const drift = gsap.fromTo(
    picture,
    { y: () => photo.offsetHeight - picture.offsetHeight, scale: 1.06 },
    {
      y: 0,
      scale: 1,
      ease: "none",
      scrollTrigger: { trigger: photo, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true },
    },
  );
  // Set up (its parts at their start): shown.
  document.documentElement.classList.add("is-about-ready");

  // The text below the photo: with the rest when it is in the first screen,
  // otherwise as it comes up into it.
  let wait = null;
  const trigger = ScrollTrigger.create({
    trigger: body,
    start: "top 90%",
    once: true,
    onEnter: () => {
      const after = PHOTO_AT + 0.5 - tl.time();
      wait = gsap.delayedCall(Math.max(0, after), () => bodyIn.play());
    },
  });

  return () => {
    document.documentElement.classList.remove("is-about-ready");
    tl.kill();
    bodyIn.kill();
    drift.scrollTrigger.kill();
    drift.kill();
    trigger.kill();
    wait?.kill();
    title.revert();
    lead.revert();
    note.revert();
    gsap.set([...cta, photo, picture], { clearProps: "transform,clipPath" });
  };
}
