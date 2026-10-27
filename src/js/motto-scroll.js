import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { designPx } from "./design-px.js";

// Pinned Motto + CTA section (Figma storyboard 1527:4259, flow from the user):
// entry: the Milestone + Motto wrapper turns from light to dark across the whole
//        screen, Milestone fades out, motto 1 blurs in;
// step 1: "Trendsetting Design" turns gradient letter by letter (on its own
//         clock once the step is reached), the ellipse rises;
// step 2: the line flips to motto 2;   step 3: "believers." turns gradient;
// step 4: flip to motto 3, the ellipse gives way to the light, Get a Quote appears;
// step 5: the whole motto turns gradient, the light turns and glides to the center;
// step 6: hold, the light breathes a little before the section releases.
// Timing and easing are not in Figma (approved proposal).


export function initMottoScroll() {
  const section = document.querySelector("[data-motto]");
  if (!section) return () => {};

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wrapper = section.closest("[data-tone-shift]");
  const milestone = wrapper?.querySelector(".milestone__inner");
  const backdrop = section.querySelector(".motto__backdrop");
  const label = section.querySelector(".motto__label");
  const wrapperTexture = wrapper?.querySelector(".tone-shift__texture");
  const lines = [...section.querySelectorAll(".motto__line")];
  const ellipse = section.querySelector(".motto__ellipse");
  const light = section.querySelector(".motto__light");
  const diagonal = section.querySelector(".motto__bg--diagonal");
  const cta = section.querySelector(".cta");
  const steps = 6; // 5 Figma steps + a final hold before the footer
  const smooth = reduceMotion ? "steps(1)" : "power2.inOut";
  const linesBox = section.querySelector(".motto__lines");

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

  let cleanupListeners = () => {};
  // Last step the reader settled on (see the resize handling below).
  let settledStep = null;
  let inside = false;
  let resizing = false;
  const ctx = gsap.context(() => {
    // Start state (frame 1527:4134).
    // A long perspective keeps the wide line flat while it turns (no keystone tilt).
    gsap.set(lines, { transformPerspective: 4000, transformOrigin: "50% 50% -25px" });
    gsap.set([lines[1], lines[2]], { autoAlpha: 0, rotationX: -90, y: () => 10 * designPx() });
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
        scrub: reduceMotion ? true : 0.5,
        // Same snap as the What we do section: starts at once, soft landing.
        snap: {
          snapTo: "labelsDirectional",
          inertia: false,
          delay: 0,
          duration: { min: 0.6, max: 0.9 },
          ease: "power3.out",
        },
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (resizing) return;
          const at = self.progress * steps;
          inside = self.scroll() >= self.start - 2 && self.scroll() <= self.end + 2;
          if (Math.abs(at - Math.round(at)) < 0.002) settledStep = Math.round(at);
        },
      },
    });

    // A resize changes the pin length; keep the reader on the same step instead
    // of leaving the timeline between two steps. The step is recorded while
    // scrolling and frozen during a resize (reading the scroll then is
    // unreliable: the browser may already have clamped it).
    let keepStep = null;
    const onResize = () => {
      resizing = true;
    };
    const rememberStep = () => {
      keepStep = inside ? settledStep : null;
    };
    const restoreStep = () => {
      resizing = false;
      if (keepStep !== null) window.scrollTo(0, timeline.scrollTrigger.labelToScroll(`step${keepStep}`));
      keepStep = null;
      // Re-sync the gradient waves once the timeline shows the right step again.
      gsap.delayedCall(0.1, syncGradients);
    };
    window.addEventListener("resize", onResize);
    ScrollTrigger.addEventListener("refreshInit", rememberStep);
    ScrollTrigger.addEventListener("refresh", restoreStep);
    cleanupListeners = () => {
      window.removeEventListener("resize", onResize);
      ScrollTrigger.removeEventListener("refreshInit", rememberStep);
      ScrollTrigger.removeEventListener("refresh", restoreStep);
    };

    // Letters change from white to the gradient one after another, left to
    // right. Unlike the flips and the light, this plays on its own clock
    // (≈0.8s) once the scroll passes the middle of its step, and plays back
    // when scrolling up, so the wave has the same tempo however one scrolls.
    const gradients = [];
    const toGradient = (i, at) => {
      const each = { duration: 0.35, ease: "power1.out", stagger: { amount: 0.45 } };
      const wave = gsap
        .timeline({ paused: true })
        .to(charGradient[i], { opacity: 1, ...each }, 0)
        .to(charText[i], { opacity: 0, ...each }, 0);
      gradients.push({ wave, at: at + 0.5, on: null });
    };
    const syncGradients = () => {
      // During a refresh/resize the timeline is briefly reverted; ignore that.
      if (ScrollTrigger.isRefreshing || resizing) return;
      const time = timeline.time();
      gradients.forEach((g) => {
        const on = time >= g.at;
        if (on === g.on) return;
        // First sync (page load, possibly mid-section) and reduced motion jump.
        if (g.on === null || reduceMotion) g.wave.progress(on ? 1 : 0);
        else if (on) g.wave.play();
        else g.wave.reverse();
        g.on = on;
      });
    };
    timeline.eventCallback("onUpdate", syncGradients);

    // The whole line turns like one flip-clock card: out to the top, in from below.
    const flip = (from, to, at) => {
      timeline.to(lines[from], { rotationX: 90, y: () => -10 * designPx(), autoAlpha: 0, duration: 0.45, ease: reduceMotion ? "steps(1)" : "power3.in" }, at);
      timeline.to(lines[to], { rotationX: 0, y: 0, autoAlpha: 1, duration: 0.55, ease: reduceMotion ? "steps(1)" : "power3.out" }, at + 0.45);
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

    // Hold (approved proposal): one more scroll before the footer so the final
    // frame and Get a Quote can be read. Only the light breathes a little
    // (slightly wider and further), so the scroll still answers; text and
    // button stay as in Figma 1527:4241.
    timeline.to(
      light,
      { x: () => 736.5 * designPx(), y: () => -355.5 * designPx(), scale: 0.87, ease: reduceMotion ? "steps(1)" : "sine.inOut" },
      5,
    );
    timeline.addLabel("step6", 6);

    // Entry (before the pin): full-screen light → dark on the wrapper.
    // Start values are set here, not with fromTo: ScrollTrigger's refresh
    // reverts fromTo starts that lie ahead of the playhead. Motto 1 blurs in on
    // the lines box, so no line is driven by two timelines (the flips own them).
    if (!reduceMotion && wrapper) {
      wrapper.classList.add("is-toned");
      gsap.set(wrapper, { backgroundColor: "#ffffff" });
      gsap.set(wrapperTexture, { opacity: 0 });
      gsap.set(backdrop, { autoAlpha: 0 });
      gsap.set(linesBox, { autoAlpha: 0, y: () => 12 * designPx(), filter: "blur(6px)" });
      gsap.set(label, { autoAlpha: 0, y: () => 8 * designPx() });
      gsap
        .timeline({
          defaults: { ease: "sine.inOut" },
          // Starts once Motto is halfway into the screen (user decision), so
          // the change happens close to Motto. Motto top: 50% → 0% of the screen.
          scrollTrigger: { trigger: section, start: "top 50%", end: "top top", scrub: 1, invalidateOnRefresh: true },
        })
        // Hand-over: Milestone fades out first while the background is still
        // white (no dark text over grey), the background darkens, and motto 1,
        // already in the lower part of the screen, comes in as Milestone goes,
        // so the space between them never reads as empty.
        .to(milestone, { autoAlpha: 0, y: () => -40 * designPx(), duration: 0.3, ease: "power1.inOut" }, 0)
        .to(wrapper, { backgroundColor: "#111111", duration: 0.5 }, 0.2)
        .to(wrapperTexture, { opacity: 0.1, duration: 0.5 }, 0.2)
        .to(backdrop, { autoAlpha: 1, duration: 0.3 }, 0.7)
        // Motto 1 blurs in while the section scrolls in (it is complete before
        // the pin), as the background turns dark.
        .to(linesBox, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.4, ease: "power2.out" }, 0.4);

      // The label follows once motto 1 has settled in the center, i.e. when the
      // section pins. It plays on its own clock (the reader rests on step 0
      // there) and reverses when scrolling back up past that point.
      const labelIn = gsap.to(label, { autoAlpha: 0.5, y: 0, duration: 0.6, ease: "power2.out", paused: true });
      ScrollTrigger.create({
        trigger: section,
        // Just before the pin (24px), so a scroll that stops right at it counts;
        // motto 1 is already centered there.
        start: "top top+=24",
        onEnter: () => labelIn.play(),
        onLeaveBack: () => labelIn.reverse(),
        // Page loaded or restored below this point: show it at once.
        onRefresh: (self) => {
          if (self.progress > 0 || self.scroll() >= self.start) labelIn.progress(1);
        },
      });
    }
  }, section);

  return () => {
    cleanupListeners();
    ctx.revert();
    glyphs.forEach((glyph) => glyph.remove());
    section.classList.remove("is-enhanced");
    wrapper?.classList.remove("is-toned");
  };
}
