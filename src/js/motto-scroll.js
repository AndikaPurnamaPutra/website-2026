import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Pinned Motto + CTA section (Figma storyboard 1527:4259, flow from the user):
// entry: the Milestone + Motto wrapper turns from light to dark across the whole
//        screen, Milestone fades out, motto 1 blurs in;
// step 1: "Trendsetting Design" turns gradient letter by letter, the ellipse rises;
// step 2: the line flips to motto 2;   step 3: "believers." turns gradient;
// step 4: flip to motto 3, the ellipse gives way to the light, Get a Quote appears;
// step 5: the whole motto turns gradient, the light turns and glides to the center.
// Timing and easing are not in Figma (approved proposal).

// Same clamp as --px in _tokens.scss.
const designPx = () => Math.min(Math.max(window.innerWidth, 1280), 1920) / 1440;

export function initMottoScroll() {
  const section = document.querySelector("[data-motto]");
  if (!section) return () => {};

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wrapper = section.closest("[data-tone-shift]");
  const milestone = wrapper?.querySelector(".milestone__inner");
  const backdrop = section.querySelector(".motto__backdrop");
  const lines = [...section.querySelectorAll(".motto__line")];
  const ellipse = section.querySelector(".motto__ellipse");
  const light = section.querySelector(".motto__light");
  const diagonal = section.querySelector(".motto__bg--diagonal");
  const cta = section.querySelector(".cta");
  const steps = 5;
  const smooth = reduceMotion ? "steps(1)" : "sine.inOut";

  // Per-letter copies over the accent text, placed at the measured letter
  // positions in em so they follow the fluid scale. The gradient box is the
  // whole line, as in Figma.
  const glyphs = [];
  lines.forEach((line) => {
    line.querySelectorAll(".motto__accent").forEach((accent) => {
      [...accent.textContent].forEach((char, i) => {
        if (char === " ") return;
        const glyph = document.createElement("span");
        glyph.className = "motto__glyph";
        glyph.setAttribute("aria-hidden", "true");
        glyph.innerHTML = `<span class="motto__glyph-text">${char}</span><span class="motto__glyph-gradient">${char}</span>`;
        glyph.dataset.index = i;
        glyph.accent = accent;
        line.append(glyph);
        glyphs.push(glyph);
      });
    });
  });

  // Measured without the line's current transform; repeated once the web font
  // has loaded (a fallback font would give other letter positions).
  const measure = () => {
    const range = document.createRange();
    lines.forEach((line) => {
      const transform = line.style.transform;
      line.style.transform = "none";
      const lineBox = line.getBoundingClientRect();
      const em = parseFloat(getComputedStyle(line).fontSize);
      line.style.setProperty("--pw", `${lineBox.width / em}em`);
      line.querySelectorAll(".motto__glyph").forEach((glyph) => {
        const node = glyph.accent.firstChild;
        const i = Number(glyph.dataset.index);
        range.setStart(node, i);
        range.setEnd(node, i + 1);
        glyph.style.setProperty("--x", `${(range.getBoundingClientRect().left - lineBox.left) / em}em`);
      });
      line.style.transform = transform;
    });
  };
  measure();
  document.fonts?.ready.then(measure);

  const charText = lines.map((line) => line.querySelectorAll(".motto__glyph-text"));
  const charGradient = lines.map((line) => line.querySelectorAll(".motto__glyph-gradient"));
  section.classList.add("is-enhanced");

  // Ellipse offsets from its CSS position (bottom -602, left -115 in Figma px).
  const ellipseHidden = () => 322 * designPx(); // fully below the frame
  const ellipseHigh = () => -155 * designPx(); // frame 1527:4201: y 802 → 647
  const ellipseShift = () => -9 * designPx(); // x -15 → -24

  const ctx = gsap.context(() => {
    // Start state (frame 1527:4134).
    // A long perspective keeps the wide line flat while it turns (no keystone tilt).
    gsap.set(lines, { transformPerspective: 4000, transformOrigin: "50% 50% -25px" });
    gsap.set([lines[1], lines[2]], { autoAlpha: 0, rotationX: -90 });
    gsap.set(charText.flatMap((list) => [...list]), { opacity: 1 });
    gsap.set(charGradient.flatMap((list) => [...list]), { opacity: 0 });
    gsap.set(ellipse, { autoAlpha: 0, y: ellipseHidden });
    gsap.set(light, { autoAlpha: 0, x: () => -80 * designPx(), y: 0, rotation: 0, scale: 1, transformOrigin: "6.015% 7.259%" });
    gsap.set(diagonal, { autoAlpha: 0 });
    gsap.set(cta, { autoAlpha: 0, y: () => 12 * designPx() });

    const timeline = gsap.timeline({
      defaults: { duration: 1, ease: smooth },
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => `+=${window.innerHeight * steps}`,
        pin: true,
        scrub: reduceMotion ? true : 0.8,
        snap: { snapTo: "labelsDirectional", inertia: false, duration: { min: 0.3, max: 0.8 }, ease: "sine.inOut" },
        invalidateOnRefresh: true,
      },
    });

    // Letters change from white to the gradient one after another, left to right.
    const toGradient = (i, at) => {
      const each = { duration: 0.45, ease: smooth, stagger: { amount: 0.55 } };
      timeline.to(charGradient[i], { opacity: 1, ...each }, at);
      timeline.to(charText[i], { opacity: 0, ...each }, at);
    };

    // The whole line turns like one flip-clock card: out to the top, in from below.
    const flip = (from, to, at) => {
      timeline.to(lines[from], { rotationX: 90, autoAlpha: 0, duration: 0.45, ease: reduceMotion ? "steps(1)" : "power2.in" }, at);
      timeline.to(lines[to], { rotationX: 0, autoAlpha: 1, duration: 0.5, ease: reduceMotion ? "steps(1)" : "power2.out" }, at + 0.45);
    };

    timeline.addLabel("step0", 0);

    toGradient(0, 0);
    timeline.to(ellipse, { autoAlpha: 1, y: 0 }, 0);
    timeline.addLabel("step1", 1);

    flip(0, 1, 1);
    timeline.addLabel("step2", 2);

    toGradient(1, 2);
    timeline.to(ellipse, { y: ellipseHigh, x: ellipseShift }, 2);
    timeline.addLabel("step3", 3);

    flip(1, 2, 3);
    timeline.to(ellipse, { autoAlpha: 0 }, 3);
    timeline.to(light, { autoAlpha: 1, x: 0 }, 3);
    timeline.to(diagonal, { autoAlpha: 1 }, 3);
    timeline.to(cta, { autoAlpha: 1, y: 0, duration: 0.6 }, 3.4);
    timeline.addLabel("step4", 4);

    toGradient(2, 4);
    // Same shape, turned around its tip and glided to the center-light position.
    timeline.to(light, { x: () => 716.5 * designPx(), y: () => -365.5 * designPx(), rotation: 47.3, scale: 0.83 }, 4);
    timeline.addLabel("step5", 5);

    // Entry (before the pin): full-screen light → dark on the wrapper.
    // Start values are set here, not with fromTo: ScrollTrigger's refresh
    // reverts fromTo starts that lie ahead of the playhead.
    if (!reduceMotion && wrapper) {
      gsap.set(wrapper, { backgroundColor: "#ffffff" });
      gsap.set(backdrop, { autoAlpha: 0 });
      gsap.set(lines[0], { autoAlpha: 0, y: () => 12 * designPx(), filter: "blur(6px)" });
      gsap
        .timeline({
          defaults: { ease: "sine.inOut" },
          scrollTrigger: { trigger: section, start: "top bottom", end: "top top", scrub: 0.8 },
        })
        .to(milestone, { autoAlpha: 0, y: () => -40 * designPx(), duration: 0.5, ease: "power1.in" }, 0)
        .to(wrapper, { backgroundColor: "#111111", duration: 0.7 }, 0.1)
        .to(backdrop, { autoAlpha: 1, duration: 0.4 }, 0.6)
        .to(lines[0], { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.4, ease: "power2.out" }, 0.6);
    }
  }, section);

  return () => {
    ctx.revert();
    glyphs.forEach((glyph) => glyph.remove());
    section.classList.remove("is-enhanced");
  };
}
