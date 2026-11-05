import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

// Contact page entrance (docs/implementation/28-contact-motion.md), in the
// homepage's motion language: on load the heading's lines rise in their
// windows as the hero text (src/js/hero-intro.js), then the lead's lines, the
// button and its caption; alongside, the form card comes up and fades in,
// empty, its title rises in it as the heading does (user), then all the rest
// fades in together (user's pick; opened by a clip it flickered, and field
// after field was busy and odd; user). The office picture opens from the bottom as the Our
// Work cards (src/js/our-work-intro.js), then its text rises. The gallery's
// pictures open from the bottom one after another as it comes up the screen.
// Hidden by the CSS until it is set up (_contact.scss: is-contact-ready).
// Nothing moves with reduced motion.
const RISE = 200; // % of its height text rises from
const DESCENT = 25; // % of its height its window reaches below it (g, p, y)
const OPEN = 1.1; // s a picture takes to open
const LINE_GAP = 0.12; // s between the heading's lines
const PART_GAP = 0.07; // s between the other parts
const CARD_IN = 0.9; // s the form card takes to come up
const TITLE_AT = 0.35; // s into it, its title rises
const CONTENT_AT = 0.65; // s into it, the rest fades in

export function initContactIntro() {
  const page = document.querySelector(".contact");
  if (!page || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  // Set up once the web fonts are in: the lines are split as they are set,
  // and with the fallback font they broke elsewhere (user saw "from / you.").
  let cleanup = () => {};
  let cancelled = false;
  (document.fonts?.ready ?? Promise.resolve()).then(() => {
    if (!cancelled) cleanup = setUp(page);
  });
  return () => {
    cancelled = true;
    cleanup();
  };
}

function setUp(page) {
  const rise = (els, vars) =>
    gsap.fromTo(
      els,
      { yPercent: RISE, clipPath: `inset(-20% -20% ${RISE - DESCENT}% -20%)` },
      { yPercent: 0, clipPath: `inset(-20% -20% ${-DESCENT}% -20%)`, duration: 1, ease: "power3.out", ...vars },
    );
  const open = (els, vars) =>
    gsap.fromTo(
      els,
      { clipPath: "inset(100% 0% 0% 0%)" },
      { clipPath: "inset(0% 0% 0% 0%)", duration: OPEN, ease: "power2.inOut", ...vars },
    );

  const heading = SplitText.create(page.querySelector(".contact__heading h1"), { type: "lines" });
  const lead = SplitText.create(page.querySelector(".contact__lead"), { type: "lines" });
  const cta = [...page.querySelectorAll(".contact__cta > *")];
  const card = page.querySelector(".contact-form");
  // Its title, and the rest of its content but what is hidden.
  const title = card.querySelector(".contact-form__title");
  const content = [...card.children].filter((child) => !child.hidden && child !== title);
  const officeImage = page.querySelector(".contact__office-image");
  const officeText = [...page.querySelectorAll(".contact__office-link, .contact__address, .contact__note")];
  const headingEnd = (heading.lines.length - 1) * LINE_GAP;

  const intro = gsap
    .timeline({ delay: 0.1 })
    .add(rise(heading.lines, { stagger: LINE_GAP }), 0)
    .add(rise([...lead.lines, ...cta], { stagger: PART_GAP }), headingEnd + LINE_GAP)
    .fromTo(card, { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: CARD_IN, ease: "power3.out" }, 0.1)
    .add(rise(title), 0.1 + TITLE_AT)
    .fromTo(content, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, ease: "power1.out" }, 0.1 + CONTENT_AT)
    .add(open(officeImage), headingEnd + 0.3)
    .add(rise(officeText, { stagger: PART_GAP }), headingEnd + 0.6);
  // Set up (its parts at their start): shown.
  document.documentElement.classList.add("is-contact-ready");

  // The gallery, as it comes into the screen at the bottom; its pictures open
  // at once and settle softly (at 85% of the screen, eased in and out, they
  // stayed empty until mid-screen; user), and settle as they open
  // (translate, so the hover zoom on the same picture is left alone).
  const gallery = page.closest("main")?.querySelector(".contact-gallery") ?? document.querySelector(".contact-gallery");
  const media = gallery ? [...gallery.querySelectorAll(".contact-gallery__media")] : [];
  const pictures = media.map((item) => item.querySelector("img"));
  // One after another from the left of the screen, wherever the moving
  // gallery is (in their order in the page, those in view waited for the
  // ones scrolled out to the left; user); those out of view at once.
  let galleryIn = null;
  const playGallery = () => {
    const visible = media
      .map((item, index) => ({ index, rect: item.getBoundingClientRect() }))
      .filter(({ rect }) => rect.right > 0 && rect.left < window.innerWidth)
      .sort((a, b) => a.rect.left - b.rect.left)
      .map(({ index }) => index);
    const delay = (k) => {
      const order = visible.indexOf(k);
      return order < 0 ? 0 : order * 0.08;
    };
    galleryIn = gsap
      .timeline()
      .add(open(media, { duration: 1, ease: "power3.out", delay }), 0)
      .fromTo(pictures, { translate: "0 8%" }, { translate: "0 0%", duration: 1, ease: "power3.out", delay }, 0);
  };
  gsap.set(media, { clipPath: "inset(100% 0% 0% 0%)" });
  const galleryTrigger =
    gallery &&
    ScrollTrigger.create({
      trigger: gallery,
      start: "top 95%",
      once: true,
      onEnter: playGallery,
    });

  return () => {
    document.documentElement.classList.remove("is-contact-ready");
    intro.kill();
    galleryIn?.kill();
    galleryTrigger?.kill();
    heading.revert();
    lead.revert();
    gsap.set([...cta, card, title, ...content, officeImage, ...officeText, ...media, ...pictures].filter(Boolean), {
      clearProps: "transform,clipPath,translate,opacity,visibility",
    });
  };
}
