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
// Illustrations 01 ("Task Manager") and 02 (the tools joining OWW) play
// their storyboards on a seamless loop while their principle is shown (user
// decisions), resting while it is not. With reduced motion the changes are
// instant and they show one step, still.
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
// (_about.scss), and each storyboard plays once as it comes into view
// (flow below). gsap.matchMedia switches as the width crosses 1024.
export function initPrinciplesScroll() {
  const section = document.querySelector("[data-principles]");
  if (!section) return () => {};
  const media = gsap.matchMedia();
  media.add("(min-width: 1024px) and (hover: hover)", () => setup(section));
  media.add("(max-width: 1023.98px), (hover: none)", () => flow(section));
  return () => media.revert();
}

// The illustrations that play a storyboard (data-story in about.pug).
const STORIES = { tasks: createBoardStory, integrations: createIntegrationsStory };
const createStory = (figure) => STORIES[figure.dataset.story]?.(figure) ?? null;

// Each storyboard plays once as its illustration comes into view.
function flow(section) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cleanups = [...section.querySelectorAll("[data-story]")].map((figure) => {
    const story = createStory(figure);
    if (!story) return () => {};
    if (reduceMotion) {
      story.finish();
      return () => story.revert();
    }
    // A looping one plays while in view and rests out of view; the others
    // play once.
    const trigger = story.loop
      ? ScrollTrigger.create({ trigger: figure, start: "top 75%", end: "bottom 10%", onToggle: (self) => (self.isActive ? story.resume() : story.pause()) })
      : ScrollTrigger.create({ trigger: figure, start: "top 75%", once: true, onEnter: () => story.play() });
    return () => {
      trigger.kill();
      story.revert();
    };
  });
  return () => cleanups.forEach((cleanup) => cleanup());
}

function setup(section) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const numbers = [...section.querySelectorAll(".principles__number")];
  const items = [...section.querySelectorAll(".principles__item")];
  const figures = [...section.querySelectorAll(".principles__figure")];
  // Each illustration's storyboard (01, 02), by its index; with reduced
  // motion they only ever show their last step.
  const stories = figures.map(createStory);
  if (reduceMotion) stories.forEach((s) => s && (s.play = s.reset = s.resume = s.finish));
  // A looping storyboard rests while its illustration is not shown.
  const rest = (shown) => stories.forEach((s, i) => i !== shown && s?.loop && s.pause());
  const story = stories[0];
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
      // Shown at once (a reload further down, a resize): a looping story
      // goes on (or starts), the others show their last step (01 has its
      // own trigger, below).
      rest(next);
      if (next > 0) stories[next]?.[stories[next].loop ? "resume" : "finish"]();
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
          rest(next);
        },
      },
    );
    // Its storyboard starts again from the beginning each time.
    stories[next]?.play();
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
  // to its first step when scrolled back above that point.
  const storyTrigger =
    story &&
    ScrollTrigger.create({
      trigger: section,
      start: "top 60%",
      onEnter: () => current === 0 && story.play(),
      onLeaveBack: () => story.reset(),
      // Opened further down: it plays on if 01 is shown (it loops).
      onRefresh: (self) => (self.progress > 0 ? (current === 0 ? story.resume() : story.pause()) : story.reset()),
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
    stories.forEach((s) => s?.revert());
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
// 1. the pointer glides to "Finalize homepage design…" in In Progress, which
//    turns black and shows its mark (P-2), and presses it as it arrives;
// 2.–3. in one move it is picked up (tilted, lifted, the board dims, a
//    dashed place is left; P-3) and carried to the top of Completed, its
//    progress filling (between P-3 and P-4, not in Figma; user decision:
//    option a);
// 4. the board narrows to a phone with only Completed, "Build product
//    listing…" joins it, every card shows its mark (P-4);
// 5. the ticks appear, one after another (P-5);
// then it holds, runs back to the full board, the cards fade back to how
// they began, and it starts again (user: seamless, on repeat). With reduced
// motion it shows P-5, still.
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
  // The carried card in P-3: its centre at 380.5, 285.75, turned -13°.
  const LIFT = { cx: 380.5, cy: 285.75, rotation: -13 };
  const DONE_TOP = { x: 425.33, y: 146 }; // the first card's place in Completed

  // The story, and the loop that plays it (below).
  let timeline;
  let loop;
  let moveCard = () => {};
  const carry = { p: 0 }; // the carried card along its way
  const PACE = 1.25; // the story plays this much faster (user: too slow)
  const HOLD = 1.2; // s on P-5
  const TICKS = 4.45; // s (story time): before the ticks
  const BOARD = 3.3; // s (story time): the card is in Completed, the board still full
  ctx.add(() => {
    const from = place(chosen);
    const lifted = { x: LIFT.cx - 156.667 / 2, y: LIFT.cy - from.h / 2 };
    gsap.set(float, { "--fx": from.x, "--fy": from.y, rotation: 0, transformOrigin: "50% 50%" });
    gsap.set(cursor, { "--cx": 520, "--cy": 420 });
    gsap.set(grab, { transformOrigin: "50% 50%" });

    const writeLabel = () => (label.textContent = `${Math.round(percent.value)}%`);
    // The carried card's way: from its place, through its lifted place
    // (turned), to the top of Completed, as one smooth move (carry.p); it
    // rises a little towards us on the way and settles as it lands. The
    // hand stays where the pointer pressed the card, turning with it.
    const W = 156.667; // the card's width
    const way = smoothPath([[from.x, from.y, 0], [lifted.x, lifted.y, LIFT.rotation], [DONE_TOP.x, DONE_TOP.y, 0]]);
    const PRESS = { x: 368.5, y: 336.6 }; // where the pointer presses
    const grip = { x: PRESS.x - (from.x + W / 2), y: PRESS.y - (from.y + from.h / 2) };
    moveCard = () => {
      const [x, y, r] = way(carry.p);
      const lift = 1 + 0.04 * Math.sin(Math.PI * carry.p);
      float.style.setProperty("--fx", x);
      float.style.setProperty("--fy", y);
      gsap.set(float, { rotation: r, scale: lift });
      const a = (r * Math.PI) / 180;
      const gx = x + W / 2 + lift * (grip.x * Math.cos(a) - grip.y * Math.sin(a));
      const gy = y + from.h / 2 + lift * (grip.x * Math.sin(a) + grip.y * Math.cos(a));
      // The hand's centre on that point (its image is 13.2 × 12.6).
      grab.style.setProperty("--gx", gx - 6.6);
      grab.style.setProperty("--gy", gy - 6.3);
    };
    const fill = float.querySelector(".tm-progress__fill");
    const doneMarks = done.querySelectorAll(".tm-mark");
    const doneChecks = done.querySelectorAll(".tm-mark__check");
    const doneCircles = done.querySelectorAll(".tm-mark__circle");
    const insert = (key) => done.querySelector(`[data-insert="${key}"]`);

    // Not lazy: jumped straight to its end (reduced motion, a reload further
    // down), every step must be drawn before the next one reads its start.
    // Every step overlaps the next and eases in and out gently (user:
    // seamless, not stepped).
    timeline = gsap.timeline({ paused: true, defaults: { ease: "power2.inOut", lazy: false } });
    timeline
      // 1. The pointer curves in (its two axes eased apart), the card
      // lighting up as it nears (P-2), and presses it as it settles.
      .to(cursor, { autoAlpha: 1, duration: 0.35, ease: "sine.out" }, 0.15)
      .to(cursor, { "--cx": PRESS.x, duration: 1, ease: "power2.inOut" }, 0.15)
      .to(cursor, { "--cy": PRESS.y, duration: 1, ease: "power3.out" }, 0.15)
      .to(chosen, { backgroundColor: "#000", borderColor: "#191919", "--ring": 1, duration: 0.35, ease: "sine.inOut" }, 0.8)
      .to(chosen.querySelector(".tm-mark"), { opacity: 1, duration: 0.35, ease: "sine.inOut" }, 0.8)
      .to(cursor, { scale: 0.88, duration: 0.15, ease: "sine.out" }, 1.05)
      // The arrow becomes the hand on the same spot: one shrinks away as the
      // other grows in.
      .call(moveCard, null, 1.1)
      .to(cursor, { autoAlpha: 0, scale: 0.7, duration: 0.2, ease: "sine.in" }, 1.15)
      .fromTo(grab, { scale: 0.7 }, { scale: 1, duration: 0.3, ease: "power2.out" }, 1.15)
      .to(grab, { autoAlpha: 1, duration: 0.2, ease: "sine.out" }, 1.15)
      // 2.–3. The card goes in one move: lifted and turned (P-3) on its way
      // to the top of Completed, the board dimming and brightening again;
      // its place closes behind it, Completed makes room, the progress fills.
      .set(chosen, { display: "none" }, 1.2)
      .set(slot, { display: "block", height: () => from.h * em(), borderWidth: () => em() }, 1.2)
      .set(float, { autoAlpha: 1 }, 1.2)
      .fromTo(carry, { p: 0 }, { p: 1, duration: 1.75, ease: "power2.inOut" }, 1.2)
      .to(win, { backgroundColor: "#0f0f0f", opacity: 0.6, duration: 0.5, ease: "sine.inOut" }, 1.2)
      .to(frame, { "--ring": 0, duration: 0.5, ease: "sine.inOut" }, 1.2)
      .to([head, cols], { opacity: 0.6, duration: 0.5, ease: "sine.inOut" }, 1.2)
      .to(slot, { height: 0, borderWidth: 0, duration: 0.6, ease: "sine.inOut" }, 1.9)
      .set(slot, { display: "none" }, 2.5)
      .set(insert("finalize"), { display: "block" }, 1.9)
      .to(insert("finalize"), { height: "auto", duration: 0.6, ease: "sine.inOut" }, 1.9)
      .to(percent, { value: 100, duration: 0.8, ease: "sine.inOut", onUpdate: writeLabel }, 1.9)
      .to(fill, { "--fill": 100, duration: 0.8, ease: "sine.inOut" }, 1.9)
      .to(win, { backgroundColor: "#000", opacity: 1, duration: 0.5, ease: "sine.inOut" }, 2.45)
      .to(frame, { "--ring": 1, duration: 0.5, ease: "sine.inOut" }, 2.45)
      .to([head, cols], { opacity: 1, duration: 0.5, ease: "sine.inOut" }, 2.45)
      // Put down: the card is in its place (the carried copy gives way to
      // it); the hand lets go.
      .to(float, { autoAlpha: 0, duration: 0.2, ease: "sine.inOut" }, 2.9)
      .to(grab, { autoAlpha: 0, scale: 0.8, duration: 0.35, ease: "sine.in" }, 2.9)
      // 4. The phone (P-4): the window narrows, only Completed stays.
      .to(frame, { "--wl": 181, "--ww": 308, duration: 1.1, ease: "power2.inOut" }, 3.3)
      .to(head, { "--hw": 260, duration: 1.1, ease: "power2.inOut" }, 3.3)
      .to([q(".tm-new"), q('[data-col="backlog"]'), q('[data-col="progress"]')], { autoAlpha: 0, duration: 0.45, ease: "sine.inOut" }, 3.3)
      // "New Task" folds away, so the menu button keeps to the right edge.
      .to(q(".tm-new"), { width: 0, paddingLeft: 0, paddingRight: 0, borderWidth: 0, marginRight: () => -4 * em(), duration: 1.1, ease: "power2.inOut" }, 3.3)
      .to(done, { "--x": 0, "--w": 260, duration: 1.1, ease: "power2.inOut" }, 3.3)
      .set(insert("build"), { display: "block" }, 3.6)
      .to(insert("build"), { height: "auto", duration: 0.6, ease: "sine.inOut" }, 3.6)
      .to(q(".tm-light"), { opacity: 0, duration: 0.8, ease: "sine.inOut" }, 3.3)
      .to(q(".tm-glow"), { opacity: 1, duration: 1, ease: "sine.inOut" }, 3.5)
      .to(doneMarks, { opacity: 1, duration: 0.4, ease: "sine.inOut" }, 4.1)
      // 5. The ticks (P-5), one after another, growing in softly.
      .to(doneChecks, { opacity: 1, duration: 0.35, ease: "sine.out", stagger: 0.18 }, 4.5)
      .fromTo(doneChecks, { scale: 0.6 }, { scale: 1, duration: 0.5, ease: "back.out(1.3)", stagger: 0.18, immediateRender: false }, 4.5)
      .to(doneCircles, { opacity: 0, duration: 0.3, ease: "sine.inOut", stagger: 0.18 }, 4.6);

    // The loop (user: seamless, on repeat): the story runs, holds on P-5,
    // runs back to the full board (the ticks go, the phone widens), the
    // cards fade out and back in as they were (the story's start), and it
    // begins again. The story is played by its time, so going back is the
    // exact reverse of going forward.
    const end = timeline.duration();
    const forward = end / PACE; // s the story takes going forward
    const back = forward + HOLD + 2.5; // s: back at the full board
    // The cards fade, not the columns (the story fades those itself).
    const cards = board.querySelectorAll(".tm-col__cards");
    loop = gsap
      .timeline({
        paused: true,
        repeat: -1,
        onUpdate: () => {
          writeLabel();
          moveCard();
        },
      })
      .to(timeline, { time: end, duration: forward, ease: "none" })
      // Back, calmly: first the ticks go, then the phone widens to the board.
      .to(timeline, { time: TICKS, duration: 0.7, ease: "sine.inOut" }, forward + HOLD)
      .to(timeline, { time: BOARD, duration: 1.8, ease: "sine.inOut" }, forward + HOLD + 0.7)
      .to(cards, { opacity: 0, duration: 0.4, ease: "sine.inOut" }, back + 0.2)
      .to(timeline, { time: 0, duration: 0.01 }, back + 0.65)
      .to(cards, { opacity: 1, duration: 0.5, ease: "sine.inOut" }, back + 0.7)
      .set({}, {}, back + 1.4);
  });

  return {
    loop: true,
    play: () => loop.restart(),
    resume: () => loop.play(),
    pause: () => loop.pause(),
    reset: () => loop.pause(0),
    finish: () => loop.pause(timeline.duration() / PACE),
    revert: () => {
      loop.kill();
      timeline.kill();
      ctx.revert();
      label.textContent = "88%";
    },
  };
}

// The "Frictionless Infrastructure" storyboard (Figma P-1 … P-7, 1950:6117 →
// 1950:6293 → 1950:6470 → 1950:6647 → 1950:6821 → 1957:7691 → 1957:7774;
// docs/implementation/34-principles-02-integrations.md), in Figma pixels
// (the custom properties in _about.scss). It loops, about 12.5s a round;
// each step grows out of the one before and every move eases in and out
// gently (user: smooth, even, on repeat, natural transitions):
// 1. the last round's dark lifts as the light comes up from below and the
//    dots settle, and Figma, Webflow and ClickUp rise with the particles,
//    streaks shooting up past them, along one smooth path through P-1 and P-2 into line at the top (P-3);
// 2. the lines run down from the tools and OWW rises to meet them; light in
//    each tool's colour keeps flowing all the way along its line into OWW;
// 3. the pointer comes round to OWW and presses it (user decision): OWW
//    turns solid and the tools slide down their lines into it, the lines
//    rolling up behind them;
// 4. OWW rises to the middle and the grid spreads out from behind it (P-4);
// 5. the grid narrows, its outer tiles and the faded edges come in, the
//    ticks appear (P-5);
// 6. OWW grows through P-6 while the grid moves towards us and fades, until
//    OWW fills the frame (P-7): the dark the next round starts from.
// With reduced motion it shows P-5, the whole system, still.
function createIntegrationsStory(figure) {
  const q = (selector) => figure.querySelector(selector);
  const qa = (selector) => [...figure.querySelectorAll(selector)];
  const ctx = gsap.context(() => {}, figure);
  const tools = qa(".int-tool");
  const oww = q(".int-oww");
  const cells = qa(".int-cell");
  // How far a grid tile is from OWW, in tiles: the order it comes in.
  const away = (cell) => Math.hypot(+cell.style.getPropertyValue("--i"), +cell.style.getPropertyValue("--j"));
  const fromCentre = (step) => (_, cell) => (away(cell.closest(".int-cell")) - 1) * step;
  // Each tool's way up (centre and turn): below the frame, P-1, P-2, P-3;
  // and its way down its line into OWW.
  const UP = {
    figma: [[178, 520, -38], [173, 398.68, -29.42], [170.17, 313.57, -14], [155, 119, 0]],
    webflow: [[335, 500, 0], [335, 275.58, 0], [335.17, 131.79, 0], [335, 119, 0]],
    clickup: [[524, 520, 26], [518.84, 398.68, 18.72], [500.17, 247.94, 12], [515, 119, 0]],
  };
  const DOWN = {
    figma: [[155, 119, 0], [151, 215, 0], [153, 285, 0], [185, 312, 0], [295, 309, 0]],
    webflow: [[335, 119, 0], [335, 215, 0], [335, 300, 0]],
    clickup: [[515, 119, 0], [519, 215, 0], [517, 285, 0], [485, 312, 0], [375, 309, 0]],
  };
  const STILL = 10.1; // s: P-5, shown with reduced motion
  const SPEED = 230; // Figma px a second the coloured light flows at
  const TAIL = 82.47; // its length (Figma's "Vector 3268")
  const GAP = 150; // Figma px from one light to the next on a line

  let timeline;
  // The tools follow their ways by a progress each: up (0 below, 1 in
  // line), then down into OWW.
  // Its line is drawn from the tool along its way (d: 0 → 1).
  const ways = tools.map((tool) => ({
    tool,
    up: smoothPath(UP[tool.dataset.tool]),
    down: smoothPath(DOWN[tool.dataset.tool]),
    p: 0,
    m: 0,
    d: 0,
  }));
  // Each tool's line and the mask of its light (the same path).
  const wires = Object.fromEntries(
    qa(".int-wire").map((path) => [
      path.dataset.wire,
      { paths: [path, q(`mask [data-wire="${path.dataset.wire}"]`)], length: path.getTotalLength() },
    ]),
  );
  const place = () => {
    ways.forEach(({ tool, up, down, p, m, d }) => {
      const [x, y, r] = m > 0 ? down(m) : up(p);
      tool.style.setProperty("--tx", x);
      tool.style.setProperty("--ty", y);
      // The turn through GSAP, which holds the tile's transform (it also
      // floats and shrinks it).
      gsap.set(tool, { rotation: r });
      // Its line shows from where it is drawn to (d) and, on the tool's way
      // down, from right behind it (the line starts 35 below the tile's
      // centre in line): one dash along the path.
      const wire = wires[tool.dataset.tool];
      const behind = gsap.utils.clamp(0, wire.length, m * down.total - 35);
      const shown = Math.max(0, d * wire.length - behind);
      wire.paths.forEach((path) => {
        path.setAttribute("stroke-dasharray", `${shown} ${2 * wire.length + 10}`);
        path.setAttribute("stroke-dashoffset", -behind);
      });
    });
  };

  ctx.add(() => {
    const cursor = q(".tm-cursor");
    const cover = q(".int-cover");
    const links = q(".int-links");
    gsap.set(links, { clipPath: "none" }); // drawn by its lines instead (place)
    const particles = q(".int-particles");
    const glow = q(".int-glow");
    const grid = q(".int-grid");
    const logo = oww.querySelector("img");
    const inner = cells.filter((cell) => !cell.matches(".int-cell--outer"));
    const outer = cells.filter((cell) => cell.matches(".int-cell--outer"));
    const ticks = qa(".int-cell img");
    const streams = qa(".int-stream");
    gsap.set(cursor, { transformOrigin: "36.6% 27.2%" });
    // Each stream: a few dashes of falling length over each other, their
    // heads together, so the light fades out behind it as in Figma; the
    // pattern repeats every GAP along the line, so a line carries one
    // light after another.
    const dashOf = (k, all) => (TAIL * (all.length - k)) / all.length;
    streams.forEach((stream) =>
      stream.querySelectorAll("path").forEach((path, k, all) => {
        const dash = dashOf(k, all);
        gsap.set(path, { attr: { "stroke-dasharray": `${dash} ${GAP - dash}` } });
      }),
    );
    // The lights flow down every line into OWW at one even speed, from
    // `from` for `time` seconds (each line a little after the last).
    const flow = (from, time) =>
      streams.forEach((stream, i) =>
        stream.querySelectorAll("path").forEach((path, k, all) => {
          const dash = dashOf(k, all);
          timeline.fromTo(path, { attr: { "stroke-dashoffset": dash + i * 40 } }, { attr: { "stroke-dashoffset": dash + i * 40 - SPEED * time }, duration: time, ease: "none" }, from);
        }),
      );

    timeline = gsap.timeline({
      paused: true,
      repeat: -1,
      defaults: { ease: "power2.inOut", lazy: false, immediateRender: false },
      onUpdate: place,
    });
    timeline
      // 1. The dark lifts (held by a tween of its own: a set at 0 is not
      // redrawn as it loops) as the light comes up and the dots settle; the
      // tools and the particles rise.
      .fromTo(cover, { opacity: 1 }, { opacity: 1, duration: 0.3 }, 0)
      .fromTo(cover, { opacity: 1 }, { opacity: 0, duration: 1.3, ease: "sine.inOut" }, 0.3)
      .fromTo(glow, { opacity: 1 }, { opacity: 1, duration: 0.01 }, 0)
      .fromTo(glow.querySelector("img"), { yPercent: -7 }, { yPercent: 0, duration: 2.4, ease: "power2.out" }, 0.3)
      .fromTo(q(".tm-dots"), { "--z": 1.05 }, { "--z": 1, duration: 2.6, ease: "power2.out" }, 0.3);
    ways.forEach((way, i) =>
      timeline
        .fromTo(way, { p: 0 }, { p: 1, duration: 2.9, ease: "power2.inOut" }, 0.4 + [0.08, 0, 0.16][i])
        // Its line runs down along its way at one pace, as the tool settles.
        .fromTo(way, { d: 0 }, { d: 1, duration: wires[way.tool.dataset.tool].length / 240, ease: "sine.inOut" }, 3.0 + [0.06, 0, 0.12][i])
        .fromTo(way, { m: 0 }, { m: 1, duration: 1, ease: "power2.inOut" }, 6.25 + [0, 0.06, 0.03][i]),
    );
    timeline
      .fromTo(tools, { autoAlpha: 1, scale: 1 }, { autoAlpha: 1, scale: 1, duration: 0.01 }, 0)
      .fromTo(links, { autoAlpha: 0 }, { autoAlpha: 0, duration: 0.01 }, 0)
      .fromTo(particles, { "--py": 340 }, { "--py": 10, duration: 3.2, ease: "power2.inOut" }, 0.4)
      .fromTo(particles, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: "sine.inOut" }, 0.4)
      .fromTo(particles, { opacity: 1 }, { opacity: 0, duration: 1, ease: "sine.inOut" }, 2.6)
      // While they wait, the tools float a little, one after another.
      .fromTo(tools, { yPercent: 0 }, { yPercent: -4, duration: 1.1, ease: "sine.inOut", yoyo: true, repeat: 1, stagger: 0.2 }, 3.5)
      // 2. The lines run down; OWW rises to meet them; the light, twice.
      // (autoAlpha on both ends: a value only in the start is not set again
      // when the story starts over from the middle; user: the lines were
      // gone after coming back to 02)
      .fromTo(links, { autoAlpha: 1 }, { autoAlpha: 1, duration: 0.01 }, 3.0)
      .fromTo(
        oww,
        { autoAlpha: 0, scale: 0.94, "--ox": 335, "--oy": 345, "--s": 116, "--r": 32, "--b": 1.5, "--l": 63.359, "--sa": 0.25, backgroundColor: "rgba(0, 0, 0, 0.25)" },
        { autoAlpha: 1, scale: 1, "--ox": 335, "--oy": 305, "--s": 116, "--r": 32, "--b": 1.5, "--l": 63.359, "--sa": 0.25, backgroundColor: "rgba(0, 0, 0, 0.25)", duration: 1.1, ease: "power2.out" },
        3.3,
      )
      .fromTo(logo, { autoAlpha: 1 }, { autoAlpha: 1, duration: 0.01 }, 3.3);
    // The dots and streaks glide up, each on its own beat and pace, a
    // little faster than the tools, fading in and out (P-2; user).
    const sparks = qa(".int-spark");
    timeline.fromTo(sparks, { opacity: 0 }, { opacity: 0, duration: 0.01 }, 0);
    sparks.forEach((spark, n) => {
      const time = 1.1 + (n % 3) * 0.15;
      const rise = 150 + (n % 4) * 25;
      for (let at = 0.45 + ((n * 0.37) % 1); at < 3.1; at += 1.05)
        timeline
          .fromTo(spark, { "--sy": 60 }, { "--sy": -rise, duration: time, ease: "power1.inOut" }, at)
          .fromTo(spark, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "sine.out" }, at)
          .fromTo(spark, { opacity: 1 }, { opacity: 0, duration: 0.4, ease: "sine.in" }, at + time - 0.4);
    });
    // The light flows down every line from the moment the lines are drawn
    // while OWW waits (P-3), so each line always carries its colour; it
    // goes as the tools slide in.
    flow(3.0, 3.6);
    timeline
      .fromTo(streams, { opacity: 1 }, { opacity: 1, duration: 0.01 }, 0)
      .to(streams, { opacity: 0, duration: 0.35, ease: "sine.in" }, 6.2);
    timeline
      // 3. The pointer curves in (its two axes eased apart) and presses OWW,
      // which turns solid; the tools slide down their lines into it, the
      // lines rolling up behind them.
      .fromTo(cursor, { autoAlpha: 0, scale: 1 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "sine.out" }, 4.75)
      .fromTo(cursor, { "--cx": 480 }, { "--cx": 375, duration: 1.2, ease: "power2.inOut" }, 4.75)
      .fromTo(cursor, { "--cy": 455 }, { "--cy": 351, duration: 1.2, ease: "power1.out" }, 4.75)
      .to(cursor, { scale: 0.88, duration: 0.15, ease: "sine.out" }, 6.0)
      .to(oww, { scale: 0.95, duration: 0.15, ease: "sine.out" }, 6.0)
      .to([cursor, oww], { scale: 1, duration: 0.5, ease: "power2.out" }, 6.15)
      .to(oww, { backgroundColor: "#0f0f0f", duration: 0.45, ease: "sine.out" }, 6.05)
      .to(tools, { scale: 0.45, duration: 1, ease: "power2.inOut" }, 6.25)
      .to(tools, { autoAlpha: 0, duration: 0.35, ease: "sine.in" }, 6.95)
      .to(links, { autoAlpha: 0, duration: 0.3, ease: "sine.in" }, 6.95)
      .to(cursor, { autoAlpha: 0, "--cx": 395, "--cy": 380, duration: 0.6, ease: "sine.out" }, 6.35)
      .to(glow, { opacity: 0, duration: 1.4, ease: "sine.inOut" }, 6.6)
      // 4. OWW to the middle; the grid spreads out from behind it (P-4).
      .to(oww, { "--oy": 210, duration: 1.1, ease: "power2.inOut" }, 7.15)
      .fromTo(grid, { "--k": 0, "--s": 116, "--p": 132, opacity: 1, scale: 1 }, { "--k": 1, "--s": 116, "--p": 132, opacity: 1, scale: 1, duration: 1.3, ease: "power3.out" }, 7.95)
      .fromTo(inner, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "sine.out", stagger: fromCentre(0.06) }, 7.95)
      // 5. Narrower, the outer tiles and the edges, the ticks (P-5).
      .to(grid, { "--s": 90, "--p": 106, duration: 1.2, ease: "power2.inOut" }, 8.9)
      .to(oww, { "--s": 90, "--r": 24, "--b": 1.14, "--l": 48.168, "--sa": 0.5, duration: 1.2, ease: "power2.inOut" }, 8.9)
      .fromTo(outer, { opacity: 0 }, { opacity: 1, duration: 0.9, ease: "sine.inOut" }, 9.1)
      .fromTo(q(".int-fade"), { opacity: 0 }, { opacity: 1, duration: 0.9, ease: "sine.inOut" }, 9.0)
      .fromTo(ticks, { opacity: 0 }, { opacity: 0.1, duration: 0.4, ease: "sine.out", stagger: fromCentre(0.1) }, 9.5)
      // 6. OWW grows through P-6 and fills the frame (P-7), all one move
      // (the ends are chosen so that it passes P-6: 174.18, corners 46.448,
      // stroke 2.207, logo 93.22); the grid comes towards us and fades.
      .to(oww, { "--s": 900, "--r": 240, "--b": 11.4, "--l": 481.7, duration: 2.1, ease: "power2.inOut" }, 10.6)
      .to(logo, { autoAlpha: 0, duration: 0.4, ease: "sine.inOut" }, 10.75)
      .to(grid, { scale: 1.3, opacity: 0, duration: 1.4, ease: "power2.in" }, 11.1)
      // The dark the next round lifts from.
      .set(cover, { opacity: 1 }, 12.7)
      .set({}, {}, 12.8);
  });

  return {
    loop: true,
    play: () => timeline.restart(),
    resume: () => timeline.play(),
    pause: () => timeline.pause(),
    reset: () => {
      timeline.pause(0);
      place();
    },
    finish: () => {
      timeline.pause(STILL);
      place();
    },
    revert: () => {
      timeline.kill();
      ctx.revert();
      Object.values(wires).forEach(({ paths }) => paths.forEach((path) => ["stroke-dasharray", "stroke-dashoffset"].forEach((name) => path.removeAttribute(name))));
      tools.forEach((tool) => {
        ["--tx", "--ty"].forEach((name) => tool.style.removeProperty(name));
        gsap.set(tool, { clearProps: "transform" });
      });
    },
  };
}

// A smooth way through points ([x, y, turn]): a centripetal Catmull-Rom
// curve, walked at an even pace along its length, so a move through several
// places neither stops nor speeds up at the places it passes. Returns the
// point at a progress from 0 to 1, with the way's length as .total.
function smoothPath(points) {
  const ends = [points[0].map((v, i) => 2 * v - points[1][i]), points.at(-1).map((v, i) => 2 * v - points.at(-2)[i])];
  const all = [ends[0], ...points, ends[1]];
  const gap = (a, b) => Math.max(Math.hypot(b[0] - a[0], b[1] - a[1]) ** 0.5, 1e-4);
  const curve = (p0, p1, p2, p3, t) => {
    const t1 = gap(p0, p1);
    const t2 = t1 + gap(p1, p2);
    const t3 = t2 + gap(p2, p3);
    const u = t1 + (t2 - t1) * t;
    const mix = (a, b, ta, tb) => a.map((v, i) => ((tb - u) * v + (u - ta) * b[i]) / (tb - ta));
    const a1 = mix(p0, p1, 0, t1);
    const a2 = mix(p1, p2, t1, t2);
    const a3 = mix(p2, p3, t2, t3);
    return mix(mix(a1, a2, 0, t2), mix(a2, a3, t1, t3), t1, t2);
  };
  const samples = [];
  for (let s = 1; s < all.length - 2; s++) for (let k = 0; k < 60; k++) samples.push(curve(all[s - 1], all[s], all[s + 1], all[s + 2], k / 60));
  samples.push(points.at(-1));
  const lengths = [0];
  for (let k = 1; k < samples.length; k++) lengths.push(lengths[k - 1] + Math.hypot(samples[k][0] - samples[k - 1][0], samples[k][1] - samples[k - 1][1]));
  const total = lengths.at(-1);
  const at = (progress) => {
    const target = gsap.utils.clamp(0, 1, progress) * total;
    let k = 1;
    while (k < lengths.length - 1 && lengths[k] < target) k++;
    const f = (target - lengths[k - 1]) / (lengths[k] - lengths[k - 1] || 1);
    return samples[k].map((v, i) => samples[k - 1][i] + (v - samples[k - 1][i]) * f);
  };
  at.total = total;
  return at;
}
