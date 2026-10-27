import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { designPx } from "./design-px.js";

// Pinned Motto + CTA section (Figma storyboard 1527:4259, flow from the user):
// entry: the Milestone + Motto wrapper turns from light to dark across the whole
//        screen, Milestone fades out, motto 1 blurs in;
// step 1: "Trendsetting Design" turns gradient letter by letter (on its own
//         clock once the step is reached), the ellipse rises;
// step 2: the line flips to motto 2;   step 3: "believers." turns gradient;
// step 4: flip to motto 3 and to the CTA label, the glow gives way to the
//         left stage light, Get a Quote appears;
// step 5: the whole motto turns gradient, the left light goes off as the
//         center light comes on;
// step 6: hold before the section releases.
// The glow from below follows one smoothed journey (see lightPath); the stage
// lights switch like a lighting cue on their own clock (see cue).
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
  const beamLeft = section.querySelector(".motto__beam--left");
  const beamCenter = section.querySelector(".motto__beam--center");
  const labelTexts = [...section.querySelectorAll(".motto__label-text")];
  const diagonal = section.querySelector(".motto__bg--diagonal");
  const cta = section.querySelector(".cta");
  const steps = 6; // 5 Figma steps + a final hold before the footer
  // No snap (user decision): each step has a rest zone where the frame holds
  // while the scroll goes on, so the scroll stays free and smooth yet a step
  // is easy to stop on. Transitions keep a length of 1; REST is added between
  // them (half before the first, half after the last), ≈40% of each step.
  const REST = 0.6;
  const stepTime = (p) => Math.floor(p) * (1 + REST) + REST / 2 + (p - Math.floor(p));
  const restTime = (k) => (k === 0 ? REST / 4 : k === steps ? steps * (1 + REST) - REST / 4 : k * (1 + REST));
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
    gsap.set(labelTexts[0], { autoAlpha: 1, y: 0 });
    gsap.set(labelTexts[1], { autoAlpha: 0, y: () => 6 * designPx() });
    gsap.set(diagonal, { autoAlpha: 0 });
    gsap.set(cta, { autoAlpha: 0, y: () => 12 * designPx() });

    // Set up with the lights below; called with the pin's scroll progress.
    let driveLight = () => {};
    const timeline = gsap.timeline({
      defaults: { duration: 1, ease: smooth },
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => `+=${window.innerHeight * steps}`,
        pin: true,
        scrub: reduceMotion ? true : 0.8,
        invalidateOnRefresh: true,
        // The section's page position is fractional (fluid sizes), and GSAP
        // pins it where it was, up to 1px below the top of the screen; on some
        // GPUs that leaves a light seam above it. Pinned exactly at 0 instead.
        onToggle: (self) => {
          if (self.isActive) section.style.top = "0px";
        },
        onRefresh: (self) => {
          if (self.isActive) section.style.top = "0px";
        },
        onUpdate: (self) => {
          if (resizing) return;
          driveLight(self.progress);
          const time = self.progress * steps * (1 + REST);
          const step = Math.round(time / (1 + REST));
          inside = self.scroll() >= self.start - 2 && self.scroll() <= self.end + 2;
          // Inside a step's rest zone.
          if (Math.abs(time - step * (1 + REST)) <= REST / 2) settledStep = step;
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
    // right. Unlike the flips, this plays on its own clock
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
    // Glow from below (1527:4169 / 4201) on one smoothed journey that follows
    // the scroll (trails ≈0.6s), so it never stops in the rest zones. Time =
    // screens of scrolling: 0.2–1 it comes up, 1–3 it rises slowly, 3.2–4 it
    // fades as the stage lights take over. A CSS-drawn layer that is only
    // moved (no redraw). fromTo with explicit starts, so a refresh
    // (invalidate) can re-render it.
    const flow = { ease: "sine.inOut", immediateRender: false };
    const glowLow = { x: 0, y: 0 };
    // Frame 1527:4201: y 802 → 647, x -15 → -24.
    const glowHigh = { x: () => -9 * designPx(), y: () => -155 * designPx() };
    gsap.set(ellipse, { autoAlpha: 0, y: ellipseHidden, x: 0 });
    const lightPath = gsap
      .timeline({ paused: true })
      .fromTo(ellipse, { autoAlpha: 0, x: 0, y: ellipseHidden }, { autoAlpha: 1, ...glowLow, duration: 0.8, ...flow }, 0.2)
      .fromTo(ellipse, { ...glowLow }, { ...glowHigh, duration: 2, ...flow }, 1)
      .fromTo(ellipse, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.8, ...flow }, 3.2)
      .to({}, { duration: 2 }, 4);

    // Stage lights (approved option A, like a lighting cue): two lights stay
    // at their Figma places and never move; each comes on by opening its iris
    // (the beam widens from a slit and reaches out while it brightens) and
    // goes off by closing it. Step 4: the left light comes on; step 5: it
    // goes off while the center light comes on over the title. They play on
    // their own clock when the scroll passes the middle of a step, and back
    // when scrolling up.
    const closed = (scale) => ({ autoAlpha: 0, scaleX: scale * 0.12, scaleY: scale * 0.7 });
    const open = (scale) => ({ autoAlpha: 1, scaleX: scale, scaleY: scale });
    gsap.set(beamLeft, { rotation: -46.4, ...closed(1.205) });
    gsap.set(beamCenter, { rotation: 0.9, ...closed(1) });
    const cue = gsap
      .timeline({ paused: true })
      .addLabel("off", 0)
      .fromTo(beamLeft, closed(1.205), { ...open(1.205), duration: 1.4, ease: "power2.inOut", immediateRender: false }, 0)
      .addLabel("left")
      .fromTo(beamLeft, open(1.205), { ...closed(1.205), duration: 1.1, ease: "power2.inOut", immediateRender: false }, "left")
      .fromTo(beamCenter, closed(1), { ...open(1), duration: 1.4, ease: "power2.inOut", immediateRender: false }, "left+=0.4")
      .addLabel("center");
    const cueStates = [
      ["left", stepTime(3) + 0.5],
      ["center", stepTime(4) + 0.5],
    ];
    let cueState = null;
    const syncCue = () => {
      if (ScrollTrigger.isRefreshing || resizing) return;
      const time = timeline.time();
      const state = cueStates.reduce((current, [name, at]) => (time >= at ? name : current), "off");
      if (state === cueState) return;
      // First sync (page load, possibly mid-section) and reduced motion jump;
      // a jump over both cues is done in 1.5s.
      if (cueState === null || reduceMotion) cue.seek(state);
      else cue.tweenTo(state, { duration: Math.min(Math.abs(cue.labels[state] - cue.time()), 1.5), ease: "none" });
      cueState = state;
    };

    const lightClock = { time: 0 };
    const toLightTime = gsap.quickTo(lightClock, "time", {
      duration: 0.6,
      ease: "power2.out",
      onUpdate: () => lightPath.time(lightClock.time),
    });
    let lightStarted = false;
    driveLight = (progress) => {
      const time = progress * steps;
      // First update (page load, possibly mid-section) and reduced motion jump.
      if (!lightStarted || reduceMotion) {
        lightClock.time = time;
        lightPath.time(time);
        toLightTime(time, time);
        lightStarted = true;
      } else toLightTime(time);
    };
    // Sizes follow the screen: re-read them after a refresh.
    const refreshLight = () => lightPath.invalidate().time(lightClock.time);
    ScrollTrigger.addEventListener("refresh", refreshLight);
    const cleanupTimers = cleanupListeners;
    cleanupListeners = () => {
      cleanupTimers();
      ScrollTrigger.removeEventListener("refresh", refreshLight);
    };

    timeline.eventCallback("onUpdate", () => {
      syncGradients();
      syncCue();
    });

    // The whole line turns like one flip-clock card: out to the top, in from below.
    const flip = (from, to, at) => {
      timeline.to(lines[from], { rotationX: 90, y: () => -10 * designPx(), autoAlpha: 0, duration: 0.45, ease: reduceMotion ? "steps(1)" : "power3.in" }, at);
      timeline.to(lines[to], { rotationX: 0, y: 0, autoAlpha: 1, duration: 0.55, ease: reduceMotion ? "steps(1)" : "power3.out" }, at + 0.45);
    };

    // Step labels sit in the middle of each rest zone (step 0 and the last
    // one inside the pin, so they are pinned at 0 too, see onToggle above).
    for (let k = 0; k <= steps; k++) timeline.addLabel(`step${k}`, restTime(k));

    toGradient(0, stepTime(0));

    flip(0, 1, stepTime(1));

    toGradient(1, stepTime(2));

    flip(1, 2, stepTime(3));
    // The label changes with motto 3 (Figma 1527:4219), like the lines.
    timeline.to(labelTexts[0], { autoAlpha: 0, y: () => -6 * designPx(), duration: 0.45, ease: reduceMotion ? "steps(1)" : "power3.in" }, stepTime(3));
    timeline.to(labelTexts[1], { autoAlpha: 1, y: 0, duration: 0.55, ease: reduceMotion ? "steps(1)" : "power3.out" }, stepTime(3) + 0.45);
    timeline.to(diagonal, { autoAlpha: 1 }, stepTime(3));
    timeline.to(cta, { autoAlpha: 1, y: 0, duration: 0.6 }, stepTime(3.4));

    toGradient(2, stepTime(4));

    // The last rest zone runs to the end of the pin.
    timeline.to({}, { duration: REST / 2 }, stepTime(steps - 1) + 1);

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
