import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getSmoothScroll } from "./smooth-scroll.js";

// About: Principles (Figma 1734:383; plan: docs/implementation/19-about.md).
// The section is pinned while the page scrolls on, and each part of that
// scroll shows one principle: its number lights up, its title and text
// change (fading and moving a little in the scroll direction) and its
// illustration fades in. The changes run on their own clock, so they do not
// stutter with the scroll. One swipe moves one principle, and the numbers
// glide to theirs.
// Illustration 01 plays the Motion-01 storyboard once (Figma 1781:1671,
// about 4.5s) whenever principle 01 comes into view, and stops on its last
// step (user decision). With reduced motion the changes are instant and the
// board shows its last step.
const STEP = 0.7; // screen heights of scrolling per principle
const GLIDE = 0.9; // s, from one principle to the next
const QUIET = 180; // ms without wheel events that ends a gesture
const ENTRY_RUN = 0.06; // screen heights a swipe may carry on into the hold

export function initPrinciplesScroll() {
  const section = document.querySelector("[data-principles]");
  if (!section) return () => {};

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const numbers = [...section.querySelectorAll(".principles__number")];
  const items = [...section.querySelectorAll(".principles__item")];
  const figures = [...section.querySelectorAll(".principles__figure")];
  const board = section.querySelector("[data-board]");
  const story = board && createBoardStory(board);
  // With reduced motion the board only ever shows its last step.
  if (story && reduceMotion) story.play = story.reset = story.finish;
  const count = items.length;
  const listeners = new AbortController();
  let current = 0;

  // Shows principle `next`: at once, or with the fades.
  const show = (next, animate) => {
    const direction = next >= current ? 1 : -1;
    const changed = next !== current;
    current = next;
    numbers.forEach((number, i) => {
      number.classList.toggle("is-active", i === next);
      number.setAttribute("aria-current", String(i === next));
    });
    items.forEach((item, i) => item.setAttribute("aria-hidden", String(i !== next)));
    if (!animate || reduceMotion) {
      gsap.killTweensOf([...items, ...figures]);
      gsap.set(items, { autoAlpha: (i) => (i === next ? 1 : 0), y: 0 });
      gsap.set(figures, { autoAlpha: (i) => (i === next ? 1 : 0) });
      return;
    }
    if (!changed) return;
    const others = (list) => list.filter((_, i) => i !== next);
    gsap.to(others(items), { autoAlpha: 0, y: -12 * direction, duration: 0.3, ease: "power2.in", overwrite: true });
    gsap.set(items[next], { autoAlpha: 0, y: 12 * direction, overwrite: true });
    gsap.to(items[next], { autoAlpha: 1, y: 0, duration: 0.5, delay: 0.2, ease: "power3.out" });
    gsap.to(others(figures), { autoAlpha: 0, duration: 0.4, ease: "power1.out", overwrite: true });
    gsap.to(figures[next], { autoAlpha: 1, duration: 0.5, ease: "power1.out", overwrite: true });
    if (next === 0) story?.play();
  };

  const indexAt = (progress) => Math.min(count - 1, Math.floor(progress * count));

  // Centred on screen (the section is at least a screen tall), then held for
  // one STEP of scrolling per principle.
  const pin = ScrollTrigger.create({
    trigger: section,
    pin: true,
    start: "center center",
    end: () => `+=${count * STEP * window.innerHeight}`,
    onUpdate: (self) => show(indexAt(self.progress), true),
    onRefresh: (self) => show(indexAt(self.progress), false),
  });

  // The storyboard starts once the section is well in view, and is set back
  // to its first step when scrolled back above that point. Opened or
  // reloaded further down, the board shows its last step.
  const storyTrigger =
    story &&
    ScrollTrigger.create({
      trigger: section,
      start: "top 60%",
      onEnter: () => current === 0 && story.play(),
      onLeaveBack: () => story.reset(),
      onRefresh: (self) => (self.progress > 0 ? story.finish() : story.reset()),
    });

  // One swipe or turn of the wheel moves exactly one principle (user
  // decision: a free scroll often skipped one). While the section is held,
  // wheel events are caught before Lenis: the first one of a gesture glides
  // the page to the middle of the next principle's part of the pin.
  // Everything waits during the glide; after it, the rest of that gesture is
  // ignored: a trackpad's inertia (events that keep coming, weaker and
  // weaker) or a wheel kept turning. A new gesture is a wheel that was still
  // for QUIET, or events that suddenly grow stronger (a new swipe during the
  // inertia, which can last 1–2s: waiting for it to end blocked every new
  // swipe, user report). Scrolling on from 06, or back from 01, leaves the
  // section as usual.
  // Scrolling into the section is the wheel's own smooth scroll, which may
  // carry on ENTRY_RUN into the hold (where nothing moves): the section
  // slows a little as it arrives and is held while still moving gently.
  // Tried before (user reports): a glide on entry (the speed changed at
  // once), stopping exactly at the hold (braked, "too soft"), and the swipe
  // carrying on up to 90% of 01's part (held at full speed, "a little
  // rough").
  // Touch screens and the keyboard scroll freely.
  const part = () => (pin.end - pin.start) / count;
  const placeOf = (i) => pin.start + (i + 0.5) * part();
  let glideEnd = 0;
  let stepped = false;
  let lastWheel = 0;
  let lastStrength = 0;
  let entry = null; // { target, limit, direction } while scrolling into the section
  const goTo = (i, duration = GLIDE) => {
    const top = placeOf(i);
    const lenis = getSmoothScroll();
    entry = null;
    // Timed here rather than by Lenis' onComplete, which a stopped or
    // interrupted glide may never call (and everything would wait forever).
    glideEnd = performance.now() + (reduceMotion ? 0 : duration * 1000);
    if (lenis) lenis.scrollTo(top, { duration, force: true });
    else window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
  };
  // The wheel's own scroll (Lenis' easing and wheel multiplier), held back
  // at the entry's limit.
  const carry = (delta) => {
    const lenis = getSmoothScroll();
    const step = delta * (lenis?.options.wheelMultiplier ?? 1);
    entry.target = entry.direction > 0 ? Math.min(entry.target + step, entry.limit) : Math.max(entry.target + step, entry.limit);
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
    if (now < glideEnd) return swallow();
    const sameGesture = !quiet && !stronger;
    // The rest of the swipe that came into the section.
    if (entry && sameGesture && Math.sign(event.deltaY) === entry.direction) {
      swallow();
      return carry(event.deltaY);
    }
    if (stepped && sameGesture) return swallow();
    stepped = false;
    entry = null;

    const lenis = getSmoothScroll();
    const from = lenis ? lenis.targetScroll : window.scrollY;
    const to = from + event.deltaY * (lenis?.options.wheelMultiplier ?? 1);
    const direction = Math.sign(event.deltaY);
    if (from >= pin.start && from <= pin.end) {
      const i = indexAt((from - pin.start) / (pin.end - pin.start)) + direction;
      if (i < 0 || i >= count) return;
      swallow();
      stepped = true;
      goTo(i);
    } else if ((from < pin.start && to >= pin.start) || (from > pin.end && to <= pin.end)) {
      swallow();
      stepped = true;
      const run = ENTRY_RUN * window.innerHeight;
      const limit = direction > 0 ? pin.start + run : pin.end - run;
      entry = { target: from, limit, direction };
      carry(event.deltaY);
    }
  };
  window.addEventListener("wheel", onWheel, { passive: false, capture: true, signal: listeners.signal });

  // A number glides to its principle.
  numbers.forEach((number, i) =>
    number.addEventListener("click", () => goTo(i, 1.2), { signal: listeners.signal }),
  );

  return () => {
    listeners.abort();
    pin.kill();
    storyTrigger?.kill();
    story?.revert();
    gsap.killTweensOf([...items, ...figures]);
    gsap.set([...items, ...figures], { clearProps: "all" });
    numbers.forEach((number) => number.removeAttribute("aria-current"));
  };
}

// Motion-01 (Figma 1781:1671, frames P-1 … P-1.5), in Figma pixels inside the
// board's window (the custom properties of .p-board in _about.scss):
// 1. the cursor goes to the middle card of the first column and picks it up
//    (it tilts and lights up; a dashed place is left behind);
// 2. it is moved to the second column and dropped there;
// 3. the board narrows to two columns and the progress reaches 100%;
// 4. it becomes a phone screen with three lit cards;
// 5. a green tick appears on each card.
// The storyboard's frames are not fully consistent with each other (cards
// appear and disappear between frames), so the in-between steps are
// smoothed: the cards that are not in the next frame fade out.
function createBoardStory(board) {
  const q = (selector) => board.querySelector(selector);
  const card = (key) => q(`[data-card="${key}"]`);
  const lit = (key) => card(key).querySelector(".p-board__card-lit");
  const add = (key) => q(`[data-add="${key}"]`);
  const win = q(".p-board__window");
  const barTop = q(".p-board__bar-top");
  const line = q(".p-board__line");
  const dividers = board.querySelectorAll(".p-board__divider");
  const slot = q(".p-board__slot");
  const fill = q(".p-board__progress-fill");
  const progress = q(".p-board__progress");
  const percent = q(".p-board__percent");
  const cursor = q(".p-board__cursor");
  const cards = ["a", "b", "c", "d", "e", "f"].map(card);
  const adds = ["1", "2", "3"].map(add);
  const shadow = (alpha) => `drop-shadow(0em ${4 * alpha}em ${4.85 * alpha}em rgba(0, 0, 0, ${0.25 * alpha}))`;
  const touched = [win, line, slot, fill, progress, percent, cursor, ...dividers, ...cards, ...adds, ...cards.map((c) => c.querySelector(".p-board__card-lit")), ...board.querySelectorAll(".p-board__check, .p-board__card-lit .p-board__avatar img")];
  // Their own style attributes hold the "P-1.3" places, restored on revert.
  const styles = [barTop, ...touched].map((el) => el.getAttribute("style"));
  const label = { value: 40 };
  const writeLabel = () => (percent.textContent = `${Math.round(label.value)}%`);

  // First step (P-1, with the second column as in P-1.2, so the moved card
  // fills its empty place).
  const start = () => {
    gsap.set(win, { "--bx": 130, "--by": 41, "--bw": 410, "--bh": 338 });
    gsap.set(barTop, { "--tl": 19, "--tw": 370, autoAlpha: 1 });
    gsap.set(line, { "--lw": 410, autoAlpha: 1 });
    gsap.set([...dividers, ...cards, ...adds], { autoAlpha: 1 });
    gsap.set(slot, { autoAlpha: 0 });
    const places = { a: [9, 63], b: [9, 136], c: [9, 209], d: [145, 63], e: [283, 63], f: [283, 136] };
    cards.forEach((el, i) => {
      const [x, y] = Object.values(places)[i];
      gsap.set(el, { "--x": x, "--y": y, "--w": 117, rotation: 0, filter: shadow(0) });
    });
    gsap.set(cards.map((c) => c.querySelector(".p-board__card-lit")), { opacity: 0 });
    gsap.set(board.querySelectorAll(".p-board__check"), { opacity: 0, scale: 0.4 });
    gsap.set(board.querySelectorAll(".p-board__card-lit .p-board__avatar img:first-child"), { opacity: 1 });
    [[9, 282], [145, 136], [283, 209]].forEach(([x, y], i) => gsap.set(adds[i], { "--x": x, "--y": y, "--w": 117 }));
    gsap.set(progress, { "--py": 309, "--pw": 391 });
    gsap.set(fill, { "--fw": 162, backgroundColor: "#79816d" });
    gsap.set(percent, { "--tx": 382, "--ty": 313 });
    label.value = 40;
    writeLabel();
    gsap.set(cursor, { "--cx": 371.5, "--cy": 160.5, scale: 11 / 7, autoAlpha: 1 });
  };
  start();

  const fade = (targets, at, alpha = 0) => timeline.to(targets, { autoAlpha: alpha, duration: 0.3, ease: "power1.out" }, at);
  // Not lazy: jumped straight to its end (reduced motion, a reload further
  // down), every step must be drawn before the next one reads its start.
  const timeline = gsap.timeline({ paused: true, defaults: { ease: "power2.inOut", lazy: false } });

  // 1. To the card, press, pick it up.
  timeline
    .to(cursor, { "--cx": 214, "--cy": 234, duration: 0.7 }, 0.2)
    .to(cursor, { scale: 1, duration: 0.2, ease: "power2.out" }, 0.75)
    .to(card("b"), { "--x": 9.35, "--y": 134.5, rotation: -6.6, filter: shadow(1), duration: 0.35, ease: "power2.out" }, 1)
    .to(lit("b"), { opacity: 1, duration: 0.35, ease: "power1.out" }, 1)
    .to(slot, { autoAlpha: 1, duration: 0.3, ease: "power1.out" }, 1.05)
    // 2. Across to the second column (P-1.3), and down into its place.
    .to(card("b"), { "--x": 148.35, "--y": 109.5, duration: 0.7 }, 1.35)
    .to(cursor, { "--cx": 353, "--cy": 209, duration: 0.7 }, 1.35)
    .to(card("b"), { "--x": 145, "--y": 136, rotation: 0, duration: 0.35, ease: "power2.out" }, 2.05)
    .to(cursor, { "--cx": 349.65, "--cy": 235.5, duration: 0.35, ease: "power2.out" }, 2.05)
    .to(add("2"), { "--y": 209, duration: 0.35, ease: "power2.out" }, 2.05)
    .to(cursor, { "--cx": 380, "--cy": 262, autoAlpha: 0, duration: 0.4, ease: "power1.in" }, 2.45)
    .to(card("b"), { filter: shadow(0), duration: 0.4 }, 2.4);
  fade([slot, card("c"), card("d"), add("1"), ...dividers], 2.4);

  // 3. Two columns (P-1.5, first frame); the progress fills up.
  const MERGE = { duration: 0.75, ease: "power3.inOut" };
  timeline
    .to(win, { "--bx": 188, "--bw": 285, ...MERGE }, 2.5)
    .to(barTop, { "--tl": 15, "--tw": 259, ...MERGE }, 2.5)
    .to(line, { "--lw": 285, ...MERGE }, 2.5)
    .to(card("a"), { "--w": 127.5, ...MERGE }, 2.5)
    .to(card("b"), { "--x": 9, "--w": 127.5, ...MERGE }, 2.5)
    .to([card("e"), card("f")], { "--x": 146.5, "--w": 127.5, ...MERGE }, 2.5)
    .to(add("2"), { "--x": 9, "--w": 127.5, ...MERGE }, 2.5)
    .to(add("3"), { "--x": 146.5, "--w": 127.5, ...MERGE }, 2.5)
    .to(progress, { "--pw": 265, ...MERGE }, 2.5)
    .to(fill, { "--fw": 231, backgroundColor: "#9fb67d", ...MERGE }, 2.5)
    .to(percent, { "--tx": 253, ...MERGE }, 2.5)
    .to(label, { value: 100, onUpdate: writeLabel, ...MERGE }, 2.5);

  // 4. A phone screen (P-1.5, second frame): three lit cards.
  const PHONE = { duration: 0.75, ease: "power3.inOut" };
  timeline
    .to(win, { "--bx": 261, "--by": 66, "--bw": 148, "--bh": 288, ...PHONE }, 3.4)
    .to(card("a"), { "--y": 13, ...PHONE }, 3.4)
    .to(card("b"), { "--y": 86, ...PHONE }, 3.4)
    .to(card("e"), { "--x": 9, "--y": 159, ...PHONE }, 3.4)
    .to(progress, { "--py": 259, "--pw": 128, ...PHONE }, 3.4)
    .to(fill, { "--fw": 94, ...PHONE }, 3.4)
    .to(percent, { "--tx": 116, "--ty": 263, ...PHONE }, 3.4)
    .to([lit("a"), lit("e")], { opacity: 1, duration: 0.5, ease: "power1.out" }, 3.8)
    .to([card("a"), card("b"), card("e")], { filter: shadow(1), duration: 0.5 }, 3.8);
  fade([barTop, line, card("f"), add("2"), add("3")], 3.4);

  // 5. The ticks (P-1.5, third frame).
  ["a", "b", "e"].forEach((key, i) => {
    const at = 4.3 + i * 0.12;
    timeline
      .to(lit(key).querySelector(".p-board__check"), { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" }, at)
      .to(lit(key).querySelector(".p-board__avatar img:first-child"), { opacity: 0, duration: 0.2, ease: "power1.out" }, at);
  });

  return {
    play: () => timeline.restart(),
    reset: () => timeline.pause(0),
    finish: () => timeline.pause().progress(1),
    revert: () => {
      timeline.kill();
      [barTop, ...touched].forEach((el, i) => (styles[i] === null ? el.removeAttribute("style") : el.setAttribute("style", styles[i])));
      percent.textContent = "40%";
    },
  };
}
