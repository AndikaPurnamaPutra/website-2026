import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { designPx } from "./design-px.js";
import { getSmoothScroll } from "./smooth-scroll.js";

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

// The exit: over the last 0.4 of a screen the content rises faster and
// faster until it moves with the page as the section releases. The page
// turns light as it starts (src/js/page-theme.js).
export const EXIT = 0.4; // of the screen height

// One gesture, one step (see the wheel steps below).
const QUIET = 180; // ms without wheel events that ends a gesture
const FLIP_GLIDE = 0.65; // s for a flip (1.1 as sstr.tech, then 0.8, felt slow; user)
const HIGHLIGHT_GLIDE = 0.4; // s for a step to a highlight
// The next gesture counts once a step is this far through (waiting for its
// very end, a gesture near it was lost and Motto felt long; user).
const READY = 0.8;

export function initMottoScroll() {
  const section = document.querySelector("[data-motto]");
  if (!section) return () => {};

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wrapper = section.closest("[data-tone-shift]");
  const milestone = wrapper?.querySelector(".milestone__inner");
  const backdrop = section.querySelector(".motto__backdrop");
  const label = section.querySelector(".motto__label");
  const lines = [...section.querySelectorAll(".motto__line")];
  const ellipse = section.querySelector(".motto__ellipse");
  const labelTexts = [...section.querySelectorAll(".motto__label-text")];
  const diagonal = section.querySelector(".motto__bg--diagonal");
  const cta = section.querySelector(".cta");
  // 5 Figma steps; the final hold (a sixth step, 1.2 screens with nothing
  // changing) was removed (user decision).
  const steps = 5;
  // Timeline time is screens of scrolling. Each change takes about one
  // ordinary scroll gesture, with a calm stretch around it where nothing
  // changes, both ways (user decision; no snap, the scroll stays free):
  //   motto 1 → highlight → flip → highlight → flip + CTA → highlight → hold.
  // At 900px high: DWELL ≈200px of stillness before and after each change,
  // a flip over FLIP ≈340px, a highlight fired at a point (it plays on its
  // own clock, ≈0.6s).
  const DWELL = 0.22;
  const FLIP = 0.38;
  // Motto 3 comes with the new label, the diagonal background and the CTA,
  // so its highlight waits a little longer (user: it came at once).
  const DWELL_MOTTO3 = 0.35;
  // A highlight played on the way down only reverses once the scroll is back
  // this far above its point, so a small scroll up does not undo it at once.
  const HYSTERESIS = 0.1;
  // After the last highlight ("One Week Wonders Studio™") the frame holds for
  // about one scroll (0.3 of a screen) before the exit (user decision).
  const HOLD = 0.3; // of the screen height
  const highlight1 = DWELL;
  const flip1 = highlight1 + DWELL;
  const highlight2 = flip1 + FLIP + DWELL;
  const flip2 = highlight2 + DWELL;
  const highlight3 = flip2 + FLIP + DWELL_MOTTO3;
  // Timeline length: the steps, the hold and the exit.
  const length = highlight3 + DWELL + HOLD + EXIT;
  // Calm points (resize keeps the reader on the nearest one): before and
  // after each change.
  const calm = [highlight1 / 2, highlight1 + DWELL / 2, flip1 + FLIP + DWELL / 2, highlight2 + DWELL / 2, flip2 + FLIP + DWELL_MOTTO3 / 2, highlight3 + DWELL / 2];
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

    // The pin sets where the timeline should be (target); the ticker (below,
    // with the highlights) moves it there softly, and holds a flip until the
    // highlight next to it has finished (user: a flip started while the
    // highlight was still running, both ways). On a refresh (load, resize, a
    // reload further down) it is placed there at once.
    let target = 0;
    const pin = ScrollTrigger.create({
      id: "motto", // the page turns light again at its end (src/js/page-theme.js)
      trigger: section,
      start: "top top",
      end: () => `+=${window.innerHeight * length}`,
      pin: true,
      // The section's page position is fractional (fluid sizes), and GSAP
      // pins it where it was, up to 1px below the top of the screen; on some
      // GPUs that leaves a light seam above it. Pinned exactly at 0 instead.
      onToggle: (self) => {
        if (self.isActive) section.style.top = "0px";
      },
      onRefresh: (self) => {
        if (self.isActive) section.style.top = "0px";
        target = self.progress * length;
        // Back to the start before re-reading the start values, so they are
        // not read from a later step.
        timeline.time(0).invalidate().time(target);
      },
      onUpdate: (self) => {
        target = self.progress * length;
        if (reduceMotion) timeline.time(target);
        if (resizing) return;
        driveLight(self.progress);
        const time = target;
        const step = calm.reduce((best, point, k) => (Math.abs(point - time) < Math.abs(calm[best] - time) ? k : best), 0);
        inside = self.scroll() >= self.start - 2 && self.scroll() <= self.end + 2;
        // Inside a calm stretch.
        if (Math.abs(time - calm[step]) <= DWELL / 2) settledStep = step;
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
      if (keepStep !== null) window.scrollTo(0, pin.start + (timeline.labels[`step${keepStep}`] / length) * (pin.end - pin.start));
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
    // right. Unlike the flips, this plays on its own clock (≈0.6s) once the
    // scroll passes its point, and plays back when scrolling up past it (less
    // HYSTERESIS), so the wave has the same tempo however one scrolls.
    const gradients = [];
    // before/after: where the flips next to it end and start (the timeline
    // waits there while the wave runs, see follow below).
    const toGradient = (i, at, before, after) => {
      // ≈0.6s in all (0.8 felt long; user).
      const each = { duration: 0.3, ease: "power1.out", stagger: { amount: 0.3 } };
      const wave = gsap
        .timeline({ paused: true })
        .to(charGradient[i], { opacity: 1, ...each }, 0)
        .to(charText[i], { opacity: 0, ...each }, 0);
      gradients.push({ wave, at, before, after, on: null });
    };
    const syncGradients = () => {
      // During a refresh/resize the timeline is briefly reverted; ignore that.
      if (ScrollTrigger.isRefreshing || resizing) return;
      const time = timeline.time();
      gradients.forEach((g) => {
        const on = g.on ? time >= g.at - HYSTERESIS : time >= g.at;
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

    // The CTA opens (frame, arrow, caption, as on hover) as it has come in
    // with motto 3, and closes again going back up (user). A little before
    // the step's end: the timeline eases towards it and never quite reaches
    // it.
    const ctaOpenAt = flip2 + 0.8 * FLIP;
    timeline.eventCallback("onUpdate", () => {
      syncGradients();
      cta.classList.toggle("is-open", timeline.time() >= ctaOpenAt);
    });

    // The whole line turns like one flip-clock card: out to the top, in from
    // below. Sine curves spread the turn over the whole move; the power3
    // curves packed it into its middle, where it shot through (user).
    const flip = (from, to, at) => {
      timeline.to(lines[from], { rotationX: 90, y: () => -10 * designPx(), autoAlpha: 0, duration: 0.45 * FLIP, ease: reduceMotion ? "steps(1)" : "sine.in" }, at);
      timeline.to(lines[to], { rotationX: 0, y: 0, autoAlpha: 1, duration: 0.55 * FLIP, ease: reduceMotion ? "steps(1)" : "sine.out" }, at + 0.45 * FLIP);
    };

    // Step labels at the calm points (step 0 inside the pin, so it is pinned
    // at 0 too, see onToggle above).
    calm.forEach((point, k) => timeline.addLabel(`step${k}`, point));

    toGradient(0, highlight1, -Infinity, flip1);

    flip(0, 1, flip1);

    toGradient(1, highlight2, flip1 + FLIP, flip2);

    flip(1, 2, flip2);
    // The label changes with motto 3 (Figma 1527:4219), like the lines.
    timeline.to(labelTexts[0], { autoAlpha: 0, y: () => -6 * designPx(), duration: 0.45 * FLIP, ease: reduceMotion ? "steps(1)" : "sine.in" }, flip2);
    timeline.to(labelTexts[1], { autoAlpha: 1, y: 0, duration: 0.55 * FLIP, ease: reduceMotion ? "steps(1)" : "sine.out" }, flip2 + 0.45 * FLIP);
    timeline.to(diagonal, { autoAlpha: 1, duration: FLIP }, flip2);
    timeline.to(cta, { autoAlpha: 1, y: 0, duration: 0.6 * FLIP }, flip2 + 0.4 * FLIP);

    toGradient(2, highlight3, flip2 + FLIP, length - EXIT);

    // The calm after the last highlight, the hold and the exit run to the end
    // of the pin (the exit is below).
    timeline.to({}, { duration: length - highlight3 }, highlight3);

    // Moves the timeline towards the scroll, softly (like a 0.7s scrub; 1.2s
    // felt heavy, user), but
    // not into a flip while the highlight before it is still playing, nor
    // back into a flip while the highlight after it is still reversing.
    const FOLLOW = 5; // per second
    const follow = (time, deltaMs) => {
      const now = timeline.time();
      let low = -Infinity;
      let high = Infinity;
      gradients.forEach((g) => {
        const progress = g.wave.progress();
        if (g.on && progress < 1) high = Math.min(high, g.after);
        if (g.on === false && progress > 0) low = Math.max(low, g.before);
      });
      // Never pulled back past where it already is.
      const goal = gsap.utils.clamp(Math.min(low, now), Math.max(high, now), target);
      const gap = goal - now;
      if (Math.abs(gap) < 0.0005) return;
      const dt = Math.min(deltaMs / 1000, 0.1);
      timeline.time(now + gap * Math.min(1, dt * FOLLOW));
    };
    if (!reduceMotion) gsap.ticker.add(follow);


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
    }

    // One gesture, one step (user; as sstr.tech's section_webgl and About
    // Principles, src/js/principles-scroll.js): on the wheel, inside the pin,
    // each new gesture glides the page to the next stop, so a highlight or a
    // flip always plays in full on its own clock, however small or strong the
    // scroll (following the scroll, a small one left a flip half done, a
    // quick one ran past the next step). The stops lie just before and after
    // each change; the last one at the start of the exit, past the hold.
    // Touch screens and the keyboard scroll freely.
    // A gesture during a glide or a highlight is swallowed, as on sstr.tech,
    // so each step needs a gesture of its own (user: kept and played after,
    // a flip sometimes followed a highlight on its own, inconsistent); the
    // steps ease in and out (sine, as sstr.tech's).
    // In and out is the reader's own scroll, as everywhere else (user: a
    // glide of its own there, into the first stop and on to the footer, felt
    // odd): a swipe into the section is carried on by the smooth scroll and
    // held softly at the first stop (from above) or the last (from below), as
    // in About Principles; after the last stop the page scrolls on freely, the
    // content rising with it.
    if (!reduceMotion) {
      const stops = [calm[0], flip1, flip1 + FLIP, flip2, flip2 + FLIP, length - EXIT];
      const placeOf = (time) => pin.start + (time / length) * (pin.end - pin.start);
      const sineInOut = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
      let glideEnd = 0;
      let stepped = false;
      let lastWheel = 0;
      let lastStrength = 0;
      let entry = null; // { target, limit, direction } while scrolling into the section
      const glide = (top, duration, easing) => {
        const lenis = getSmoothScroll();
        entry = null;
        // Timed here rather than by Lenis' onComplete, which an interrupted
        // glide may never call.
        glideEnd = performance.now() + duration * 1000 * READY;
        if (lenis) lenis.scrollTo(top, { duration, easing, force: true });
        else window.scrollTo({ top, behavior: "smooth" });
      };
      const busy = () =>
        performance.now() < glideEnd || gradients.some((g) => g.wave.isActive() && (g.wave.reversed() ? 1 - g.wave.progress() : g.wave.progress()) < READY);
      const scrollNow = () => getSmoothScroll()?.targetScroll ?? window.scrollY;

      // The step from the current place in that direction; false above the
      // first stop going up and past the last going down (the page scrolls on
      // freely).
      const step = (direction) => {
        const from = scrollNow();
        const places = stops.map(placeOf);
        // The next stop that way (the current one if between two).
        const near = places.findIndex((place) => Math.abs(place - from) < 2);
        const next =
          near >= 0
            ? near + direction
            : direction > 0
              ? places.findIndex((place) => place > from)
              : places.findLastIndex((place) => place < from);
        if (next < 0 || next >= stops.length) return false;
        // Between stops 1 and 2, and 3 and 4, lies a flip; the other steps are
        // a short move past a highlight's point (the wave plays on its own
        // clock).
        const before = near >= 0 ? near : next - direction;
        glide(places[next], Math.min(before, next) % 2 === 1 ? FLIP_GLIDE : HIGHLIGHT_GLIDE, sineInOut);
        return true;
      };
      // The wheel's own scroll, held back at the entry's limit.
      const carry = (delta) => {
        const lenis = getSmoothScroll();
        const distance = delta * (lenis?.options.wheelMultiplier ?? 1);
        entry.target = entry.direction > 0 ? Math.min(entry.target + distance, entry.limit) : Math.max(entry.target + distance, entry.limit);
        if (lenis) lenis.scrollTo(entry.target, { force: true });
        else window.scrollTo(0, entry.target);
      };

      const onWheel = (event) => {
        if (event.ctrlKey || !event.deltaY) return; // pinch zoom
        const now = performance.now();
        const strength = Math.abs(event.deltaY);
        const quiet = now - lastWheel >= QUIET;
        const stronger = strength > 8 && strength > lastStrength * 1.5;
        lastWheel = now;
        lastStrength = strength;
        const swallow = () => {
          event.preventDefault();
          event.stopImmediatePropagation();
        };
        const sameGesture = !quiet && !stronger;
        const direction = Math.sign(event.deltaY);
        if (busy()) {
          stepped = true;
          return swallow();
        }
        // The rest of the swipe that came into the section.
        if (entry && sameGesture && direction === entry.direction) {
          swallow();
          return carry(event.deltaY);
        }
        if (stepped && sameGesture) return swallow();
        stepped = false;
        entry = null;

        const from = scrollNow();
        const to = from + event.deltaY * (getSmoothScroll()?.options.wheelMultiplier ?? 1);
        if (from >= pin.start && from <= pin.end) {
          if (!step(direction)) return;
          swallow();
          stepped = true;
        } else if ((from < pin.start && to >= pin.start) || (from > pin.end && to <= pin.end)) {
          // Into the section: held at the first stop (from above) or the last
          // (from below).
          swallow();
          stepped = true;
          const places = stops.map(placeOf);
          entry = { target: from, limit: direction > 0 ? places[0] : places.at(-1), direction };
          carry(event.deltaY);
        }
      };
      window.addEventListener("wheel", onWheel, { passive: false, capture: true });
      const cleanupResize = cleanupListeners;
      cleanupListeners = () => {
        cleanupResize();
        window.removeEventListener("wheel", onWheel, { capture: true });
      };
    }

    // Entry (before the pin). The wrapper turns dark with the page theme, at
    // once as Motto comes in (src/js/page-theme.js), its texture with it
    // (_motto.scss); here, with the scroll, Milestone leaves, the section's
    // backdrop comes in and motto 1 blurs in.
    // Start values are set here, not with fromTo: ScrollTrigger's refresh
    // reverts fromTo starts that lie ahead of the playhead. Motto 1 blurs in on
    // the lines box, so no line is driven by two timelines (the flips own them).
    if (!reduceMotion && wrapper) {
      wrapper.classList.add("is-toned");
      // The wrapper darkens with the scroll here, over the screen left empty
      // by Milestone (user: the page theme's switch, 0.35s on its own clock,
      // turned the whole empty screen from white to black at once, a
      // flicker); the page theme switches behind it meanwhile, unseen.
      const tokens = getComputedStyle(document.documentElement);
      gsap.set(wrapper, { backgroundColor: tokens.getPropertyValue("--color-white").trim() });
      gsap.set(backdrop, { autoAlpha: 0 });
      gsap.set(linesBox, { autoAlpha: 0, y: () => 12 * designPx(), filter: "blur(6px)" });
      gsap.set(label, { autoAlpha: 0, y: () => 8 * designPx() });
      gsap
        .timeline({
          defaults: { ease: "sine.inOut" },
          // From Motto's top at 75% of the screen to the pin. Motto no longer
          // overlaps Milestone (_motto.scss), so Milestone's content is fully
          // in view, then centred, before this starts (user: no chance to read
          // it). The darkening runs over ≈70% of the stretch (≈470px at 900px;
          // it was squeezed into ≈120px).
          scrollTrigger: { trigger: section, start: "top 75%", end: "top top", scrub: 1, invalidateOnRefresh: true },
        })
        // Hand-over: Milestone fades out first while the background is still
        // light (no dark text over grey), the background darkens slowly, and
        // motto 1 comes in while it does, so the space never reads as empty.
        .to(milestone, { autoAlpha: 0, y: () => -40 * designPx(), duration: 0.45, ease: "sine.inOut" }, 0.05)
        .to(wrapper, { backgroundColor: tokens.getPropertyValue("--color-ink").trim(), duration: 0.35 }, 0.4)
        .to(backdrop, { autoAlpha: 1, duration: 0.15 }, 0.85)
        // Motto 1 blurs in while the section scrolls in (it is complete before
        // the pin), once the page has turned dark (Motto's top at 37%,
        // src/js/page-theme.js; timeline time t is Motto's top at 75% − t ×
        // 75%): white on the light page, it was unseen, then popped into view
        // at the switch (user: a flicker).
        .to(linesBox, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.45, ease: "power2.out" }, 0.52);

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
    gsap.set(content, { clearProps: "transform" });
    section.classList.remove("is-enhanced");
    cta.classList.remove("is-open");
    wrapper?.classList.remove("is-toned");
  };
}
