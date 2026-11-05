import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { getSmoothScroll } from "./smooth-scroll.js";

gsap.registerPlugin(SplitText);

// About: Principles (Figma 1734:383; plans: docs/implementation/19-about.md,
// 30-about-motion.md). In step with Services on the homepage (user: the
// swipe-per-principle hold felt heavy, long and stuck): the section is pinned
// and scrolls freely, and each part of that scroll shows one principle. As
// one is reached, on its own clock: its number lights up, the old title and
// text rise out and the new ones rise in line by line (as the Services
// cards), and its illustration is revealed over the last one like a curtain
// from the bottom (from the top when scrolling back), settling from a little
// larger. As the section comes up, its text rises and illustration 01 opens
// (as Services' entrance). Over the last EXIT of a screen the section rises, faster and
// faster, so it already moves with the page when it is released (as
// Services). A number click glides to its principle.
// Illustration 01 plays the Motion-01 storyboard once (Figma 1781:1671,
// about 4.5s) whenever principle 01 comes into view, and stops on its last
// step (user decision). With reduced motion the changes are instant and the
// board shows its last step.
const STEP = 0.8; // screen heights of scrolling per principle (0.7, held, felt long; free: 0.5 and 0.75 a little too fast, 0.85 a little heavy; user)
const EXIT = 0.4; // of the screen height, as Services
const RISE = 200; // % of its height text rises from (as the hero text)
const DESCENT = 25; // % of its height its window reaches below it (g, p, y)
const TEXT_IN = 1.15; // s (1, as the Services cards' text, a little too fast; 1.3 a little heavy; user)
const TEXT_OUT = 0.4; // s the old text takes to rise out
const CURTAIN = 1.1; // s an illustration takes to be revealed (0.9 a little too fast, 1.25 a little heavy; user)

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
  const cleanups = [];
  let current = 0;
  // The entrance (below), once the text is split.
  let entrance = null;
  let entranceTrigger = null;
  // Each item's title and text in lines (once the web fonts are in, below).
  let lines = items.map(() => []);

  // Each line in a window that reaches a little below it, as the hero text.
  const lineIn = (els, direction) =>
    gsap.fromTo(
      els,
      { yPercent: RISE * direction, clipPath: `inset(-20% -20% ${RISE - DESCENT}% -20%)` },
      {
        yPercent: 0,
        clipPath: `inset(-20% -20% ${-DESCENT}% -20%)`,
        duration: TEXT_IN,
        ease: "power3.out",
        stagger: 0.07,
        overwrite: true,
      },
    );
  const lineOut = (els, direction) =>
    gsap.to(els, {
      yPercent: -RISE * direction,
      clipPath: `inset(${RISE - DESCENT}% -20% -20% -20%)`,
      duration: TEXT_OUT,
      ease: "power2.in",
      overwrite: true,
    });

  // Shows principle `next`: at once, or with the rises and the curtain.
  const show = (next, animate) => {
    const direction = next >= current ? 1 : -1;
    const previous = current;
    const changed = next !== current;
    current = next;
    numbers.forEach((number, i) => {
      number.classList.toggle("is-active", i === next);
      number.setAttribute("aria-current", String(i === next));
    });
    items.forEach((item, i) => item.setAttribute("aria-hidden", String(i !== next)));
    if (!animate || reduceMotion) {
      gsap.killTweensOf(items);
      gsap.set(items, { autoAlpha: (i) => (i === next ? 1 : 0) });
      // Not while the entrance is still to play (it holds 01's lines and
      // illustration at their start, and its tweens are kept).
      if (entrance && entrance.progress() < 1) {
        gsap.set(figures, { autoAlpha: (i) => (i === next ? 1 : 0), zIndex: 0 });
        return;
      }
      gsap.killTweensOf([...figures, ...lines.flat()]);
      gsap.set(lines.flat(), { clearProps: "transform,clipPath" });
      gsap.set(figures, { autoAlpha: (i) => (i === next ? 1 : 0), zIndex: 0, clearProps: "clipPath,scale" });
      return;
    }
    if (!changed) return;

    // The text: the old lines rise out, then the new ones rise in.
    const old = items[previous];
    gsap.killTweensOf(items);
    if (lines[previous].length) {
      lineOut(lines[previous], direction);
      gsap.set(old, { autoAlpha: 0, delay: TEXT_OUT });
    } else gsap.set(old, { autoAlpha: 0 });
    gsap.set(items.filter((_, i) => i !== next && i !== previous), { autoAlpha: 0 });
    gsap.set(items[next], { autoAlpha: 1 });
    if (lines[next].length) lineIn(lines[next], direction).delay(TEXT_OUT * 0.6);

    // The illustration: revealed over the one in view, the others hidden.
    figures.forEach((figure, i) => {
      if (i === next || i === previous) return;
      gsap.killTweensOf(figure);
      gsap.set(figure, { autoAlpha: 0, zIndex: 0 });
    });
    gsap.set(figures[previous], { zIndex: 1 });
    const from = direction > 0 ? "inset(100% 0% 0% 0%)" : "inset(0% 0% 100% 0%)";
    gsap.fromTo(
      figures[next],
      { autoAlpha: 1, zIndex: 2, clipPath: from, scale: 1.06 },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        scale: 1,
        duration: CURTAIN,
        ease: "power3.out",
        overwrite: true,
        onComplete: () => {
          if (current !== next) return;
          gsap.set(figures.filter((_, i) => i !== next), { autoAlpha: 0, zIndex: 0 });
        },
      },
    );
    if (next === 0) story?.play();
  };

  const indexAt = (progress) => gsap.utils.clamp(0, count - 1, Math.floor(progress * count));
  // The part of the pin that shows the principles (before the exit).
  const showLength = () => count * STEP * window.innerHeight;

  // Centred on screen (the section is at least a screen tall), then held for
  // one STEP of scrolling per principle and the exit.
  const pin = ScrollTrigger.create({
    trigger: section,
    pin: true,
    start: "center center",
    end: () => `+=${showLength() + EXIT * window.innerHeight}`,
    invalidateOnRefresh: true,
    onUpdate: (self) => show(indexAt((self.scroll() - self.start) / showLength()), true),
    onRefresh: (self) => show(indexAt((self.scroll() - self.start) / showLength()), false),
  });

  // Split once the web fonts are in, so the lines break where they are set.
  let cancelled = false;
  let splits = [];
  if (!reduceMotion) {
    (document.fonts?.ready ?? Promise.resolve()).then(() => {
      if (cancelled) return;
      splits = items.map((item) =>
        SplitText.create(item.querySelectorAll(".principles__title, .principles__description"), {
          type: "lines",
          aria: "none",
        }),
      );
      lines = splits.map((split) => split.lines);
      const introSplit = SplitText.create(section.querySelector(".principles__intro"), { type: "lines", aria: "none" });
      splits.push(introSplit);
      setUpEntrance(introSplit.lines);
    });
  }

  // The entrance, as Services (user: it had none): as the section comes up,
  // the intro's lines rise, then the numbers and principle 01's title and
  // text, and its illustration opens from the bottom. Once, as the About
  // intro and Contact (user); shown at once when opened further down.
  const setUpEntrance = (introLines) => {
    entrance = gsap
      .timeline({ paused: true })
      .add(lineIn(introLines, 1), 0)
      .add(lineIn(numbers, 1), 0.3)
      .add(lineIn(lines[0], 1), 0.4)
      .fromTo(
        figures[0],
        { clipPath: "inset(100% 0% 0% 0%)", scale: 1.06 },
        { clipPath: "inset(0% 0% 0% 0%)", scale: 1, duration: CURTAIN, ease: "power3.out" },
        0.2,
      );
    entranceTrigger = ScrollTrigger.create({
      trigger: section,
      start: "top 70%",
      once: true,
      onEnter: () => entrance.play(),
      onRefresh: (self) => self.progress > 0 && entrance.progress(1),
    });
    if (entranceTrigger.progress > 0 || entranceTrigger.scroll() > entranceTrigger.start) entrance.progress(1);
  };

  // The exit, as Services: over the last EXIT of a screen the section rises
  // by half of it, faster and faster (from 0 up to the page's speed). CSS
  // translate, apart from the pin's own styles; the next section is pulled up
  // by as much, so the space between them stays as in Figma.
  if (!reduceMotion) {
    const leave = (self) => {
      section.style.translate = `0 ${-0.5 * EXIT * window.innerHeight * self.progress ** 2}px`;
    };
    const exit = ScrollTrigger.create({
      start: () => pin.end - EXIT * window.innerHeight,
      end: () => pin.end,
      onUpdate: leave,
      onRefresh: leave,
    });
    const next = () => section.parentElement?.nextElementSibling;
    const reset = () => {
      section.style.translate = "";
      const below = next();
      if (below) below.style.marginTop = `${-0.5 * EXIT * window.innerHeight}px`;
    };
    reset();
    ScrollTrigger.addEventListener("refreshInit", reset);
    cleanups.push(() => {
      ScrollTrigger.removeEventListener("refreshInit", reset);
      exit.kill();
      section.style.translate = "";
      next()?.style.removeProperty("margin-top");
    });
  }

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

  // A number glides to the middle of its principle's part of the pin.
  numbers.forEach((number, i) =>
    number.addEventListener(
      "click",
      () => {
        const top = pin.start + (i + 0.5) * STEP * window.innerHeight;
        const lenis = getSmoothScroll();
        if (lenis) lenis.scrollTo(top, { duration: reduceMotion ? 0 : 1.2 });
        else window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
      },
      { signal: listeners.signal },
    ),
  );

  return () => {
    cancelled = true;
    listeners.abort();
    cleanups.forEach((cleanup) => cleanup());
    pin.kill();
    entrance?.kill();
    entranceTrigger?.kill();
    storyTrigger?.kill();
    story?.revert();
    gsap.killTweensOf([...items, ...figures, ...lines.flat()]);
    gsap.set(numbers, { clearProps: "transform,clipPath" });
    splits.forEach((split) => split.revert());
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
