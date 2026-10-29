import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { designPx } from "./design-px.js";

// Pinned Motto + CTA section (Figma storyboard 1527:4259, flow from the user):
// entry: the Milestone + Motto wrapper turns from light to dark across the whole
//        screen, Milestone fades out, motto 1 blurs in;
// step 1: "Trendsetting Design" turns gradient letter by letter (on its own
//         clock once the step is reached), the ellipse rises;
// step 2: the line flips to motto 2;   step 3: "believers." turns gradient;
// step 4: flip to motto 3 and to the CTA label, the glow fades out, Get a
//         Quote appears;
// step 5: the whole motto turns gradient; in the short rest after it the
//         content starts to rise, faster and faster, so it is already moving
//         with the page when the section releases (user: the long hold before
//         the footer felt stuck, then let go all at once).
// The glow from below follows one smoothed journey (see lightPath).
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
  const labelTexts = [...section.querySelectorAll(".motto__label-text")];
  const diagonal = section.querySelector(".motto__bg--diagonal");
  const cta = section.querySelector(".cta");
  // 5 Figma steps; the final hold (a sixth step, 1.2 screens with nothing
  // changing) was removed (user decision).
  const steps = 5;
  // No snap (user decision): each step has a short rest zone where the frame
  // holds while the scroll goes on. Transitions keep a length of 1; REST is
  // added between them (half before the first, half after the last). At ≈40%
  // of each step, a scroll and a half went by before anything moved (user);
  // now ≈15%, as in What we do.
  const REST = 0.18;
  // Each step takes 1.1 screens of scrolling; U is the timeline time of one
  // screen of scrolling.
  const STEP_SCREENS = 1.1;
  const U = (1 + REST) / STEP_SCREENS;
  // The steps follow the (already smooth) Lenis scroll closely, and a very
  // fast scroll meets a speed limit: one move (1 of timeline time) in 0.6s at
  // the fastest (user: too fast; as in What we do), so a flip takes at least
  // ≈0.5s, close to the letter highlight's ≈0.9s.
  const MAX_SPEED = 1 / 0.6; // timeline time per second
  const FOLLOW = 14; // how fast they close the gap (per second)
  // The entry: the pin starts with the section ENTRY of a screen below the
  // top, and over the next 2 × ENTRY of scrolling it glides up into place,
  // slowing from the page's speed to a stop (user: as in What we do).
  const ENTRY = 0.15; // of the screen height
  const entryTime = 2 * ENTRY * U;
  const entryPx = () => Math.round(ENTRY * window.innerHeight); // whole px: no seam
  // The exit: over the last 0.4 of a screen the content rises faster and
  // faster until it moves with the page as the section releases.
  const EXIT = 0.4; // of the screen height
  // The last rest zone (after step 5) holds half a rest, then the exit.
  const lastRest = REST / 2 + EXIT * U;
  // Length of each move. The letter highlights (steps 1, 3, 5) play on their
  // own clock as soon as their move starts, so a full-length move left most
  // of it with nothing happening (user: the scroll hung); they get 0.35. The
  // flips (steps 2 and 4) keep 1.
  const moves = [0.35, 1, 0.35, 1, 0.35];
  const moveStart = moves.map((_, k) => entryTime + REST / 2 + moves.slice(0, k).reduce((sum, m) => sum + m + REST, 0));
  // Time at step p (a fraction runs into that step's move).
  const stepTime = (p) => moveStart[Math.floor(p)] + (p - Math.floor(p)) * moves[Math.floor(p)];
  // Middle of each rest zone (step 0 and the last one inside the pin).
  const restTime = (k) => (k === 0 ? entryTime + REST / 4 : k === steps ? moveStart[steps - 1] + moves[steps - 1] + REST / 4 : moveStart[k] - REST / 2);
  // Timeline length: the entry, the steps, then the last rest zone with the exit.
  const length = stepTime(steps - 1) + moves[steps - 1] + lastRest;
  const smooth = reduceMotion ? "steps(1)" : "power2.inOut";
  const linesBox = section.querySelector(".motto__lines");
  const content = section.querySelector(".motto__inner");

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
    const timeline = gsap.timeline({ paused: true, defaults: { duration: 1, ease: smooth } });

    // The pin sets where the timeline should be (target); the ticker below
    // moves it there, with the speed limit. On a refresh (load, resize, a
    // reload further down) it is placed there at once.
    let target = 0;
    const pin = ScrollTrigger.create({
      trigger: section,
      start: () => `top top+=${entryPx()}`,
      end: () => `+=${window.innerHeight * (length / U)}`,
      pin: true,
      // The section's page position is fractional (fluid sizes), and GSAP
      // pins it where it was, up to 1px off; on some GPUs that leaves a light
      // seam above it. Pinned at the whole-px entry offset instead.
      onToggle: (self) => {
        if (self.isActive) section.style.top = `${entryPx()}px`;
      },
      onRefresh: (self) => {
        if (self.isActive) section.style.top = `${entryPx()}px`;
        target = self.progress * length;
        // Back to the start before re-reading the start values: read where the
        // timeline was (e.g. a line already flipped away), they were wrong, and
        // scrolling back up left the first line hidden (user report).
        timeline.time(0).invalidate().time(target);
      },
      onUpdate: (self) => {
        target = self.progress * length;
        if (reduceMotion) timeline.time(target);
        if (resizing) return;
        driveLight(self.progress);
        const time = target;
        // Nearest rest zone.
        const rests = [...Array(steps + 1).keys()];
        const step = rests.reduce((best, k) => (Math.abs(restTime(k) - time) < Math.abs(restTime(best) - time) ? k : best), 0);
        inside = self.scroll() >= self.start - 2 && self.scroll() <= self.end + 2;
        // Inside a step's rest zone.
        if (Math.abs(time - restTime(step)) <= REST / 2) settledStep = step;
      },
    });
    const follow = (time, deltaMs) => {
      const now = timeline.time();
      const gap = target - now;
      if (Math.abs(gap) < 0.0005) return;
      const dt = Math.min(deltaMs / 1000, 0.1);
      const limit = MAX_SPEED * dt;
      timeline.time(now + gsap.utils.clamp(-limit, limit, gap * Math.min(1, dt * FOLLOW)));
    };
    if (!reduceMotion) gsap.ticker.add(follow);
    const labelScroll = (name) => pin.start + (timeline.labels[name] / length) * (pin.end - pin.start);

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
      if (keepStep !== null) window.scrollTo(0, labelScroll(`step${keepStep}`));
      keepStep = null;
      // Re-sync the gradient waves once the timeline shows the right step again.
      gsap.delayedCall(0.1, syncGradients);
    };
    window.addEventListener("resize", onResize);
    ScrollTrigger.addEventListener("refreshInit", rememberStep);
    ScrollTrigger.addEventListener("refresh", restoreStep);
    cleanupListeners = () => {
      gsap.ticker.remove(follow);
      window.removeEventListener("resize", onResize);
      ScrollTrigger.removeEventListener("refreshInit", rememberStep);
      ScrollTrigger.removeEventListener("refresh", restoreStep);
    };

    // Letters change from white to the gradient one after another, left to
    // right. Unlike the flips, this plays on its own clock
    // (≈0.9s) once the scroll enters its step, and plays back
    // when scrolling up, so the wave has the same tempo however one scrolls.
    const gradients = [];
    const toGradient = (i, at) => {
      // ≈0.9s, in tempo with the flips (≈0.8s at first, ≈1.2s felt slow; user).
      const each = { duration: 0.4, ease: "power1.out", stagger: { amount: 0.5 } };
      const wave = gsap
        .timeline({ paused: true })
        .to(charGradient[i], { opacity: 1, ...each }, 0)
        .to(charText[i], { opacity: 0, ...each }, 0);
      // Starts as soon as the scroll enters the move (it waited for the
      // middle, ≈0.4 of a screen with nothing happening; user: it hung).
      gradients.push({ wave, at: at + 0.05, on: null });
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
    // fades out (Figma has no glow from step 4 on; the light beams of
    // 1527:4219 / 4241 were removed at the user's request). A CSS-drawn layer that is only
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

    timeline.eventCallback("onUpdate", syncGradients);

    // The whole line turns like one flip-clock card: out to the top, in from below.
    // FLIP: share of the move the flip takes, centred in it. 1 felt too slow
    // with the longer steps, 0.65 too quick next to the letter highlight
    // (user); 0.85.
    const FLIP = 0.85;
    const flipOut = 0.45 * FLIP;
    const flipIn = 0.55 * FLIP;
    const flipAt = (at) => at + (1 - FLIP) / 2;
    const flip = (from, to, at) => {
      timeline.to(lines[from], { rotationX: 90, y: () => -10 * designPx(), autoAlpha: 0, duration: flipOut, ease: reduceMotion ? "steps(1)" : "power3.in" }, flipAt(at));
      timeline.to(lines[to], { rotationX: 0, y: 0, autoAlpha: 1, duration: flipIn, ease: reduceMotion ? "steps(1)" : "power3.out" }, flipAt(at) + flipOut);
    };

    // Step labels sit in the middle of each rest zone (step 0 and the last
    // one inside the pin, so they are pinned at 0 too, see onToggle above).
    for (let k = 0; k <= steps; k++) timeline.addLabel(`step${k}`, restTime(k));

    toGradient(0, stepTime(0));

    flip(0, 1, stepTime(1));

    toGradient(1, stepTime(2));

    flip(1, 2, stepTime(3));
    // The label changes with motto 3 (Figma 1527:4219), like the lines.
    timeline.to(labelTexts[0], { autoAlpha: 0, y: () => -6 * designPx(), duration: flipOut, ease: reduceMotion ? "steps(1)" : "power3.in" }, flipAt(stepTime(3)));
    timeline.to(labelTexts[1], { autoAlpha: 1, y: 0, duration: flipIn, ease: reduceMotion ? "steps(1)" : "power3.out" }, flipAt(stepTime(3)) + flipOut);
    timeline.to(diagonal, { autoAlpha: 1 }, stepTime(3));
    timeline.to(cta, { autoAlpha: 1, y: 0, duration: 0.6 }, stepTime(3.4));

    toGradient(2, stepTime(4));

    // The last rest zone runs to the end of the pin (the exit is below).
    timeline.to({}, { duration: lastRest }, stepTime(steps - 1) + moves[steps - 1]);
    // The pin may have measured before the steps were added: place the
    // timeline for the current scroll now that it is complete.
    target = pin.progress * length;
    timeline.time(target);

    // The exit, tied straight to the scroll (a scrub delay here made the
    // content overshoot as the section let go): over the last EXIT of a
    // screen of the pin the content rises by half that distance, easing in
    // (t²), so its speed reaches the page's just as the section releases.
    if (!reduceMotion) {
      const setY = gsap.quickSetter(content, "y", "px");
      const exit = (self) => setY(-0.5 * EXIT * window.innerHeight * self.progress ** 2);
      ScrollTrigger.create({
        start: () => pin.end - EXIT * window.innerHeight,
        end: () => pin.end,
        onUpdate: exit,
        onRefresh: exit,
      });

      // The entry glide, tied straight to the scroll: the section rises by
      // the entry offset, easing out (its speed falls from the page's to 0).
      // Once released it stays up; it is taller by as much (_motto.scss), so its
      // backdrop covers the strip below it (the wrapper's showed there).
      const glide = (self) => {
        section.style.translate = `0 ${-entryPx() * (1 - (1 - self.progress) ** 2)}px`;
      };
      const resetGlide = () => {
        section.style.translate = "";
        section.style.setProperty("--motto-entry", `${entryPx()}px`);
      };
      resetGlide();
      ScrollTrigger.addEventListener("refreshInit", resetGlide);
      // The extra height takes no room in the page: the pin spacer (in the
      // flow in place of the section) ends that much earlier. Set after each
      // refresh, as ScrollTrigger rewrites the spacer's styles.
      const spacerMargin = () => {
        const spacer = section.parentElement;
        if (spacer?.classList.contains("pin-spacer")) spacer.style.marginBottom = `${-entryPx()}px`;
      };
      spacerMargin();
      ScrollTrigger.addEventListener("refresh", spacerMargin);
      const entryTrigger = ScrollTrigger.create({
        start: () => pin.start,
        end: () => pin.start + 2 * ENTRY * window.innerHeight,
        onUpdate: glide,
        onRefresh: glide,
      });
      const cleanupBefore = cleanupListeners;
      cleanupListeners = () => {
        cleanupBefore();
        ScrollTrigger.removeEventListener("refreshInit", resetGlide);
        ScrollTrigger.removeEventListener("refresh", spacerMargin);
        entryTrigger.kill();
        section.style.translate = "";
        section.style.removeProperty("--motto-entry");
      };
    }

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
          // From Motto's top at 85% of the screen to the pin. The darkening
          // was squeezed into ≈120px of scrolling and hit like a flash (user);
          // it now runs over ≈70% of this stretch (≈440px at 900px high).
          scrollTrigger: { trigger: section, start: "top 85%", end: () => `top top+=${entryPx()}`, scrub: 1, invalidateOnRefresh: true },
        })
        // Hand-over: Milestone fades out first while the background is still
        // light (no dark text over grey), the background darkens slowly, and
        // motto 1 comes in while it does, so the space never reads as empty.
        .to(milestone, { autoAlpha: 0, y: () => -40 * designPx(), duration: 0.45, ease: "sine.inOut" }, 0.05)
        .to(wrapper, { backgroundColor: "#111111", duration: 0.7 }, 0.25)
        .to(wrapperTexture, { opacity: 0.1, duration: 0.7 }, 0.25)
        .to(backdrop, { autoAlpha: 1, duration: 0.15 }, 0.85)
        // Motto 1 blurs in while the section scrolls in (it is complete before
        // the pin), as the background turns dark.
        .to(linesBox, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.5, ease: "power2.out" }, 0.38);

      // The label follows once motto 1 has settled in the center, i.e. when the
      // section pins. It plays on its own clock (the reader rests on step 0
      // there) and reverses when scrolling back up past that point.
      const labelIn = gsap.to(label, { autoAlpha: 0.5, y: 0, duration: 0.6, ease: "power2.out", paused: true });
      ScrollTrigger.create({
        // Just before the pin (24px), so a scroll that stops right at it counts;
        // motto 1 is close to the centre there.
        start: () => pin.start - 24,
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
    gsap.set(content, { clearProps: "transform" });
    section.classList.remove("is-enhanced");
    wrapper?.classList.remove("is-toned");
  };
}
