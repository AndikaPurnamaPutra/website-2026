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

// The pin and its steps on hover-capable screens from the laptop width up
// (plan 32, step 4b, as Services). Below that width and on every touch
// screen the principles flow, each one followed by its illustration
// (_about.scss), and the board plays its storyboard once as it comes into
// view (flow below). gsap.matchMedia switches as the width crosses 1024.
export function initPrinciplesScroll() {
  const section = document.querySelector("[data-principles]");
  if (!section) return () => {};
  const media = gsap.matchMedia();
  media.add("(min-width: 1024px) and (hover: hover)", () => setup(section));
  media.add("(max-width: 1023.98px), (hover: none)", () => flow(section));
  return () => media.revert();
}

function flow(section) {
  const board = section.querySelector("[data-board]");
  if (!board) return () => {};
  const story = createBoardStory(board);
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    story.finish();
    return () => story.revert();
  }
  const trigger = ScrollTrigger.create({ trigger: board, start: "top 75%", once: true, onEnter: () => story.play() });
  return () => {
    trigger.kill();
    story.revert();
  };
}

function setup(section) {
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
    // Started by the intro itself coming up the screen (by the section's top,
    // the intro was still below the screen and its rise was missed; user).
    entranceTrigger = ScrollTrigger.create({
      trigger: section.querySelector(".principles__intro"),
      start: "top 85%",
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

// The "Task Manager" storyboard (Figma P-1 … P-5, 1950:5090 → 1950:5267 →
// 2169:1649 → 2169:1931 → 2169:2256; docs/implementation/
// 33-principles-01-task-manager.md), about 5s, in Figma pixels on the board
// (its custom properties in _about.scss):
// 1. the pointer comes to "Finalize homepage design…" in In Progress, which
//    turns black and shows its mark (P-2);
// 2. it is picked up: tilted, lifted, the board dims and a dashed place is
//    left (P-3);
// 3. it is carried to the top of Completed and put down, its progress full
//    (between P-3 and P-4, not in Figma; user decision: option a);
// 4. the board narrows to a phone with only Completed, "Build product
//    listing…" joins it, every card shows its mark (P-4);
// 5. the ticks appear, one after another (P-5). It stops there.
function createBoardStory(board) {
  const q = (selector) => board.querySelector(selector);
  const ctx = gsap.context(() => {}, board);
  const frame = q(".tm-frame");
  const win = q(".tm-window");
  const head = q(".tm-head");
  const cols = q(".tm-cols");
  const done = q('[data-col="done"]');
  const chosen = q('[data-card="finalize"]');
  const slot = q("[data-slot]");
  const float = q(".tm-float");
  const floatCard = float.querySelector(".tm-card");
  const cursor = q(".tm-cursor");
  const grab = q(".tm-grab");
  const label = float.querySelector(".tm-progress__value");
  const percent = { value: 88 };

  // Where the chosen card sits on the board, in Figma pixels (measured: the
  // board's own layout puts it there).
  const em = () => board.getBoundingClientRect().width / 670;
  const place = (el) => {
    const b = board.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return { x: (r.left - b.left) / em(), y: (r.top - b.top) / em(), h: r.height / em() };
  };
  // The carried card in P-3: its centre at 380.5, 285.75, turned -13°; the
  // hand at 425, 318.
  const LIFT = { cx: 380.5, cy: 285.75, rotation: -13 };
  const HAND = { x: 425, y: 318 };
  const DONE_TOP = { x: 425.33, y: 146 }; // the first card's place in Completed

  let timeline;
  ctx.add(() => {
    const from = place(chosen);
    const lifted = { x: LIFT.cx - 156.667 / 2, y: LIFT.cy - from.h / 2 };
    const handOff = { x: HAND.x - lifted.x, y: HAND.y - lifted.y };
    gsap.set(float, { "--fx": from.x, "--fy": from.y, rotation: 0, transformOrigin: "50% 50%" });
    gsap.set(cursor, { "--cx": 520, "--cy": 420 });
    gsap.set(grab, { "--gx": from.x + handOff.x - 45.5, "--gy": from.y + handOff.y + 6.75 });

    const writeLabel = () => (label.textContent = `${Math.round(percent.value)}%`);
    const fill = float.querySelector(".tm-progress__fill");
    const doneMarks = done.querySelectorAll(".tm-mark");
    const doneChecks = done.querySelectorAll(".tm-mark__check");
    const doneCircles = done.querySelectorAll(".tm-mark__circle");

    // Not lazy: jumped straight to its end (reduced motion, a reload further
    // down), every step must be drawn before the next one reads its start.
    timeline = gsap.timeline({ paused: true, defaults: { ease: "power2.inOut", lazy: false } });
    timeline
      // 1. The pointer comes in; the card turns black with its mark (P-2).
      .to(cursor, { autoAlpha: 1, duration: 0.3, ease: "power1.out" }, 0.2)
      .to(cursor, { "--cx": 368.5, "--cy": 336.6, duration: 0.8 }, 0.2)
      .to(chosen, { backgroundColor: "#000", borderColor: "#191919", "--ring": 1, duration: 0.25, ease: "power1.out" }, 0.95)
      .to(chosen.querySelector(".tm-mark"), { opacity: 1, duration: 0.25, ease: "power1.out" }, 0.95)
      // 2. Pressed, the hand takes over; the card is lifted, the board dims (P-3).
      .to(cursor, { scale: 0.9, duration: 0.12, ease: "power2.out" }, 1.3)
      .to(cursor, { autoAlpha: 0, duration: 0.12 }, 1.42)
      .to(grab, { autoAlpha: 1, duration: 0.12 }, 1.42)
      .set(chosen, { display: "none" }, 1.45)
      .set(slot, { display: "block", height: () => from.h * em(), borderWidth: () => em() }, 1.45)
      .set(float, { autoAlpha: 1 }, 1.45)
      .to(float, { "--fx": lifted.x, "--fy": lifted.y, rotation: LIFT.rotation, duration: 0.45, ease: "power2.out" }, 1.45)
      .to(grab, { "--gx": HAND.x, "--gy": HAND.y, duration: 0.45, ease: "power2.out" }, 1.45)
      .to(win, { backgroundColor: "#0f0f0f", opacity: 0.6, duration: 0.4, ease: "power1.out" }, 1.45)
      .to(frame, { "--ring": 0, duration: 0.4, ease: "power1.out" }, 1.45)
      .to([head, cols], { opacity: 0.6, duration: 0.4, ease: "power1.out" }, 1.45)
      // 3. Carried to the top of Completed, which makes room; its progress fills.
      .to(float, { "--fx": DONE_TOP.x, "--fy": DONE_TOP.y, rotation: 0, duration: 0.75 }, 2.1)
      .to(grab, { "--gx": DONE_TOP.x + handOff.x, "--gy": DONE_TOP.y + handOff.y, duration: 0.75 }, 2.1)
      .set(done.querySelector('[data-insert="finalize"]'), { display: "block" }, 2.3)
      .to(done.querySelector('[data-insert="finalize"]'), { height: "auto", duration: 0.5 }, 2.3)
      .to(percent, { value: 100, duration: 0.6, ease: "power1.inOut", onUpdate: writeLabel }, 2.2)
      .to(fill, { "--fill": 100, duration: 0.6, ease: "power1.inOut" }, 2.2)
      .to(win, { backgroundColor: "#000", opacity: 1, duration: 0.4, ease: "power1.inOut" }, 2.55)
      .to(frame, { "--ring": 1, duration: 0.4, ease: "power1.inOut" }, 2.55)
      .to([head, cols], { opacity: 1, duration: 0.4, ease: "power1.inOut" }, 2.55)
      // Put down: the card is in its place; the hand goes; the gap closes.
      .to(float, { autoAlpha: 0, duration: 0.15 }, 2.85)
      .to(grab, { autoAlpha: 0, duration: 0.3, ease: "power1.in" }, 2.85)
      .to(slot, { height: 0, borderWidth: 0, duration: 0.4 }, 2.9)
      .set(slot, { display: "none" }, 3.3)
      // 4. The phone (P-4): the window narrows, only Completed stays.
      .to(frame, { "--wl": 181, "--ww": 308, duration: 0.8, ease: "power3.inOut" }, 3.2)
      .to(head, { "--hw": 260, duration: 0.8, ease: "power3.inOut" }, 3.2)
      .to([q(".tm-new"), q('[data-col="backlog"]'), q('[data-col="progress"]')], { autoAlpha: 0, duration: 0.3, ease: "power1.out" }, 3.2)
      // "New Task" folds away, so the menu button keeps to the right edge.
      .to(q(".tm-new"), { width: 0, paddingLeft: 0, paddingRight: 0, borderWidth: 0, marginRight: () => -4 * em(), duration: 0.8, ease: "power3.inOut" }, 3.2)
      .to(done, { "--x": 0, "--w": 260, duration: 0.8, ease: "power3.inOut" }, 3.2)
      .set(done.querySelector('[data-insert="build"]'), { display: "block" }, 3.45)
      .to(done.querySelector('[data-insert="build"]'), { height: "auto", duration: 0.5 }, 3.45)
      .to(q(".tm-light"), { opacity: 0, duration: 0.6, ease: "power1.out" }, 3.2)
      .to(q(".tm-glow"), { opacity: 1, duration: 0.8, ease: "power1.out" }, 3.4)
      .to(doneMarks, { opacity: 1, duration: 0.3, ease: "power1.out" }, 3.9)
      // 5. The ticks (P-5).
      .to(doneChecks, { opacity: 1, duration: 0.3, ease: "power1.out", stagger: 0.15 }, 4.3)
      .fromTo(doneChecks, { scale: 0.4 }, { scale: 1, duration: 0.4, ease: "back.out(2)", stagger: 0.15, immediateRender: false }, 4.3)
      .to(doneCircles, { opacity: 0, duration: 0.2, stagger: 0.15 }, 4.4);
  });

  return {
    play: () => timeline.restart(),
    reset: () => timeline.pause(0),
    finish: () => timeline.pause().progress(1),
    revert: () => {
      timeline.kill();
      ctx.revert();
      label.textContent = "88%";
    },
  };
}
