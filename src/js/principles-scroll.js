import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import { getSmoothScroll } from "./smooth-scroll.js";

gsap.registerPlugin(SplitText, CustomEase);

// Motion-design curves for illustration 01 (user: too stiff, too "AI"):
// moves set off boldly and settle over a long tail; the camera eases in
// and settles softly.
CustomEase.create("oww-move", "M0,0 C0.62,0 0.12,1 1,1");
CustomEase.create("oww-settle", "M0,0 C0.18,0.9 0.3,1 1,1");
CustomEase.create("oww-cam", "M0,0 C0.5,0 0.12,1 1,1");

// A camera over an illustration, worked out from its story's time (so a
// loop always finds it where it should be): from the frame as it is
// (looking at 335, 210, Figma px, at 1×), each shot moves it to a point
// and a closeness over its time; a shot with `cut` puts it straight back
// (hidden by something). Drawn on --kfx, --kfy, --kz (.tm-camera, and the
// dots behind it, which follow less).
const FRAME = { fx: 335, fy: 210, z: 1 };
function cameraPath(shots) {
  const ease = gsap.parseEase("oww-cam");
  return (t) => {
    let s = FRAME;
    for (const shot of shots) {
      if (t <= shot.at) break;
      if (shot.cut) {
        s = FRAME;
        continue;
      }
      const k = ease(Math.min(1, (t - shot.at) / shot.time));
      s = { fx: s.fx + (shot.fx - s.fx) * k, fy: s.fy + (shot.fy - s.fy) * k, z: s.z + (shot.z - s.z) * k };
    }
    return s;
  };
}
const aim = (els, s) =>
  els.forEach((el) => {
    el.style.setProperty("--kfx", s.fx);
    el.style.setProperty("--kfy", s.fy);
    el.style.setProperty("--kz", s.z);
  });
// A pointer moved by a person: it speeds up quickly and slows down over
// longer (its peak early).
const HUMAN_PACE = (t) => gsap.parseEase("power2.inOut")(t ** 0.72);

// Where a pointer is at a story's time (so a loop always finds it right):
// from `start`, each move takes it to x, y over its time, along a gentle
// curve (bow: how far it bends, a share of the way, to its left) at a
// person's pace unless an ease is given.
function pointerTrack(start, moves) {
  return (t) => {
    let [x, y] = start;
    for (const move of moves) {
      if (t <= move.at) break;
      const ease = typeof move.ease === "string" ? gsap.parseEase(move.ease) : move.ease || HUMAN_PACE;
      const k = ease(Math.min(1, (t - move.at) / move.time));
      const dx = move.x - x;
      const dy = move.y - y;
      const bow = move.bow ?? 0.14;
      const cx = x + dx / 2 + dy * bow;
      const cy = y + dy / 2 - dx * bow;
      const u = 1 - k;
      [x, y] = [u * u * x + 2 * u * k * cx + k * k * move.x, u * u * y + 2 * u * k * cy + k * k * move.y];
    }
    return [x, y];
  };
}

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
// Illustrations 01 ("Task Manager"), 02 (the tools joining OWW), 03
// (wireframe to approved design), 04 (a client's comment done), 05 (a
// project's task done) and 06 (a design system handed over) play their storyboards on a seamless loop
// while their principle is shown (user decisions), resting while it is not. With reduced motion the changes are
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
const STORIES = {
  tasks: createBoardStory,
  integrations: createIntegrationsStory,
  design: createDesignStory,
  feedback: createFeedbackStory,
  progress: createProgressStory,
  handoff: createHandoffStory,
};
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
  let placeCursor = () => {};
  let settleLoop = () => {};
  // The carried card along its way (t: 0 → 1 in even time; its ease is
  // applied when it is placed, so its speed is known), and its feel: how
  // much it is pressed, lifted or squashed (s).
  const carry = { t: 0 };
  const feel = { s: 1 };
  const PACE = 1.25; // the story plays this much faster (user: too slow)
  const HOLD = 1.4; // s on P-5
  const NARROW = 3.7; // s (story time): the card is in, the board turns into the phone
  const TICKS = 4.55; // s (story time): before the ticks
  const PHONE = 4.9; // s (story time): the phone has formed (NARROW + 1.2)
  const CARRY = 1.75; // s (story time) the card is carried for
  const CARRY_EASE = gsap.parseEase("oww-move");
  // Where the pointer rests after letting go, beside the phone (P-4, P-5).
  const REST = { x: 531, y: 322 };
  // Where it comes in from: below the board's edge (it clips), so it glides
  // in instead of showing up on the board (user).
  const START = { x: 552, y: 478 };
  // A hand's pace: it speeds up quickly and slows down over longer, as a
  // pointer moved by a person (its peak early, not in the middle).
  const HUMAN = (t) => gsap.parseEase("power2.inOut")(t ** 0.72);
  const IN = { at: 0.18, time: 1.2 }; // s (story time): the pointer's way in
  const OUT = { at: 3.62, time: 1.05 }; // and its way aside after letting go
  // The camera (user: alive, as motion, not as a program running): the
  // board comes a little closer to the card as the pointer nears it,
  // follows it to Completed, and draws back as the phone forms; the dots
  // behind move less (_about.scss, .tm-camera and .tm-dots). A point to
  // look at, in Figma px, and how close.
  const camera = q(".tm-camera");
  const lens = [camera, q(".tm-dots")];
  // It stays on the middle and barely comes closer (it does not follow the
  // pointer: going in to it cut the board off; user).
  const SHOTS = [
    { at: 0.1, time: 1.5, fx: 335, fy: 214, z: 1.015 },
    { at: 1.7, time: 1.9, fx: 338, fy: 212, z: 1.02 },
    { at: 3.5, time: 1.8, fx: 335, fy: 210, z: 1 },
  ];
  ctx.add(() => {
    const from = place(chosen);
    const lifted = { x: LIFT.cx - 156.667 / 2, y: LIFT.cy - from.h / 2 };
    gsap.set(float, { "--fx": from.x, "--fy": from.y, rotation: 0, transformOrigin: "50% 50%" });
    // Pressed and scaled at its tip.
    gsap.set(cursor, { "--cx": START.x, "--cy": START.y, transformOrigin: "36.6% 27.2%" });
    gsap.set(grab, { transformOrigin: "50% 50%" });
    gsap.set(chosen, { transformOrigin: "50% 50%" });
    gsap.set(lens, { "--kfx": 335, "--kfy": 210, "--kz": 1 });

    const writeLabel = () => (label.textContent = `${Math.round(percent.value)}%`);
    // The carried card's way: from its place, through its lifted place
    // (turned), to the top of Completed, as one smooth move; it rises a
    // little towards us on the way. It has some weight: it leans into the
    // way it goes, the faster the more, trails the hand a little and blurs
    // a touch at its fastest. The hand holds it where the pointer pressed.
    const W = 156.667; // the card's width
    const way = smoothPath([[from.x, from.y, 0], [lifted.x, lifted.y, LIFT.rotation], [DONE_TOP.x, DONE_TOP.y, 0]]);
    const PRESS = { x: 368.5, y: 336.6 }; // where the pointer presses
    const grip = { x: PRESS.x - (from.x + W / 2), y: PRESS.y - (from.y + from.h / 2) };
    const LEAN = 0.022; // degrees per Figma px/s sideways
    const TRAIL = 0.03; // s the card trails the hand by
    const handAt = (x, y, r, scale) => {
      const a = (r * Math.PI) / 180;
      return [x + W / 2 + scale * (grip.x * Math.cos(a) - grip.y * Math.sin(a)), y + from.h / 2 + scale * (grip.x * Math.sin(a) + grip.y * Math.cos(a))];
    };
    moveCard = () => {
      const t = carry.t;
      const p = CARRY_EASE(t);
      // Its speed along the way (Figma px a second).
      const h = 0.004;
      const t0 = Math.max(0, t - h);
      const t1 = Math.min(1, t + h);
      const [xa, ya] = way(CARRY_EASE(t0));
      const [xb, yb] = way(CARRY_EASE(t1));
      const dt = (t1 - t0) * CARRY || 1;
      const vx = (xb - xa) / dt;
      const vy = (yb - ya) / dt;
      const [x, y, r] = way(p);
      const lean = gsap.utils.clamp(-6, 6, vx * LEAN);
      const scale = feel.s * (1 + 0.04 * Math.sin(Math.PI * p));
      float.style.setProperty("--fx", x - vx * TRAIL);
      float.style.setProperty("--fy", y - vy * TRAIL);
      float.style.setProperty("--mb", gsap.utils.clamp(0, 0.9, (Math.hypot(vx, vy) - 120) * 0.004));
      gsap.set(float, { rotation: r + lean, scale });
      const [gx, gy] = handAt(x, y, r + lean, scale);
      // The hand's centre on that point (its image is 13.2 × 12.6).
      grab.style.setProperty("--gx", gx - 6.6);
      grab.style.setProperty("--gy", gy - 6.3);
    };
    // Where the hand lets go: the card in its place in Completed.
    const [letGoX, letGoY] = handAt(DONE_TOP.x, DONE_TOP.y, 0, 1);
    // The pointer's two ways, each one smooth curve: in from below the
    // board to the card, and from where the hand let go aside to beside the
    // phone. Placed by the story's time (so going back or jumping places it
    // right too).
    const wayIn = smoothPath([[START.x, START.y], [462, 404], [PRESS.x, PRESS.y]]);
    const wayOut = smoothPath([[letGoX, letGoY], [letGoX + 26, letGoY + 74], [REST.x, REST.y]]);
    placeCursor = () => {
      const now = timeline.time();
      const along = (span) => HUMAN(gsap.utils.clamp(0, 1, (now - span.at) / span.time));
      const [x, y] = now < OUT.at - 0.2 ? wayIn(along(IN)) : wayOut(along(OUT));
      cursor.style.setProperty("--cx", x);
      cursor.style.setProperty("--cy", y);
    };
    const fill = float.querySelector(".tm-progress__fill");
    const doneMarks = done.querySelectorAll(".tm-mark");
    const doneChecks = done.querySelectorAll(".tm-mark__check");
    const doneCircles = done.querySelectorAll(".tm-mark__circle");
    const insert = (key) => done.querySelector(`[data-insert="${key}"]`);
    const landed = insert("finalize").firstElementChild; // the card in Completed
    // The ticks come one after another, not on an even beat.
    const tickAt = (i) => [0, 0.17, 0.38, 0.52][i] ?? i * 0.17;

    // Not lazy: jumped straight to its end (reduced motion, a reload further
    // down), every step must be drawn before the next one reads its start.
    // Each step starts while the one before still settles (user: seamless,
    // as motion).
    timeline = gsap.timeline({ paused: true, defaults: { ease: "oww-move", lazy: false }, onUpdate: () => placeCursor() });
    timeline
      // 1. The pointer comes in along one curve (IN, placed by
      // placeCursor), quickly and then slowing down as it nears the card,
      // which lights up (P-2); it rests a moment and presses: the card
      // gives a little.
      .to(cursor, { autoAlpha: 1, duration: 0.3, ease: "sine.out" }, 0.15)
      .to(chosen, { backgroundColor: "#000", borderColor: "#191919", "--ring": 1, duration: 0.3, ease: "power1.out" }, 0.98)
      .to(chosen.querySelector(".tm-mark"), { opacity: 1, duration: 0.4, ease: "power1.out" }, 1.04)
      // Its way is drawn as the story's time runs (a tween to keep it long
      // enough).
      .set({}, {}, IN.at + IN.time)
      .to(cursor, { scale: 0.9, duration: 0.14, ease: "power2.out" }, 1.6)
      .to(chosen, { scale: 0.985, duration: 0.14, ease: "power2.out" }, 1.6)
      .set(feel, { s: 0.985 }, 1.6)
      // The arrow becomes the hand on the same spot: one shrinks away as the
      // other grows in.
      .call(moveCard, null, 1.65)
      .to(cursor, { autoAlpha: 0, scale: 0.7, duration: 0.18, ease: "sine.in" }, 1.68)
      .fromTo(grab, { scale: 0.85 }, { scale: 1, duration: 0.4, ease: "oww-settle" }, 1.68)
      .to(grab, { autoAlpha: 1, duration: 0.18, ease: "sine.out" }, 1.68)
      // 2.–3. The card is lifted (it comes up a little past its size and
      // settles) and goes in one move, turned (P-3), to the top of
      // Completed; the board dims a beat before it goes and brightens as it
      // nears; its place closes after it, the progress fills.
      .set(chosen, { display: "none" }, 1.75)
      .set(slot, { display: "block", height: () => from.h * em(), borderWidth: () => em() }, 1.75)
      .set(float, { autoAlpha: 1 }, 1.75)
      .to(feel, { s: 1.03, duration: 0.4, ease: "oww-settle" }, 1.75)
      .to(feel, { s: 1, duration: 0.7, ease: "sine.inOut" }, 2.05)
      .fromTo(carry, { t: 0 }, { t: 1, duration: CARRY, ease: "none" }, 1.8)
      .to(win, { backgroundColor: "#0f0f0f", opacity: 0.6, duration: 0.45, ease: "power1.out" }, 1.7)
      .to(frame, { "--ring": 0, duration: 0.45, ease: "power1.out" }, 1.7)
      .to([head, cols], { opacity: 0.6, duration: 0.45, ease: "power1.out" }, 1.7)
      .to(slot, { height: 0, borderWidth: 0, duration: 0.6 }, 2.35)
      .set(slot, { display: "none" }, 2.95)
      // Completed opens an empty place as the card nears it; the card in
      // it shows only as the carried one lands (user: it showed in
      // Completed while still being carried).
      .fromTo(landed, { opacity: 0 }, { opacity: 0, duration: 0.01 }, 0)
      .set(insert("finalize"), { display: "block" }, 2.75)
      .to(insert("finalize"), { height: "auto", duration: 0.75 }, 2.75)
      .to(percent, { value: 100, duration: 0.95, ease: "oww-settle", onUpdate: writeLabel }, 2.5)
      .to(fill, { "--fill": 100, duration: 0.95, ease: "oww-settle" }, 2.5)
      .to(win, { backgroundColor: "#000", opacity: 1, duration: 0.6, ease: "power2.out" }, 3.05)
      .to(frame, { "--ring": 1, duration: 0.6, ease: "power2.out" }, 3.05)
      .to([head, cols], { opacity: 1, duration: 0.6, ease: "power2.out" }, 3.05)
      // Put down: the card in its place takes over from the carried one
      // (the same picture there), gives a little and settles; the hand lets
      // go and turns back into the arrow, which then moves aside along one
      // curve (OUT) to wait beside the phone.
      .set(float, { autoAlpha: 0 }, 3.55)
      .set(landed, { opacity: 1 }, 3.55)
      .fromTo(landed, { scale: 1 }, { scale: 0.99, duration: 0.12, ease: "power2.out", transformOrigin: "50% 50%" }, 3.55)
      .to(landed, { scale: 1, duration: 0.5, ease: "oww-settle" }, 3.67)
      .to(grab, { autoAlpha: 0, scale: 0.8, duration: 0.2, ease: "sine.in" }, 3.48)
      .set(cursor, { scale: 0.8 }, 3.5)
      .to(cursor, { autoAlpha: 1, scale: 1, duration: 0.25, ease: "power2.out" }, 3.5)
      // 4. The phone (P-4), while the card still settles: the window
      // narrows, the other columns slide out to the left one after the
      // other, only Completed stays.
      .to(frame, { "--wl": 181, "--ww": 308, duration: 1.2 }, NARROW)
      .to(head, { "--hw": 260, duration: 1.2 }, NARROW)
      .to([q('[data-col="backlog"]'), q('[data-col="progress"]')], { x: () => -28 * em(), autoAlpha: 0, duration: 0.55, ease: "power2.in", stagger: 0.07 }, NARROW)
      .to(q(".tm-new"), { autoAlpha: 0, duration: 0.3, ease: "power1.out" }, NARROW)
      // "New Task" folds away, so the menu button keeps to the right edge.
      .to(q(".tm-new"), { width: 0, paddingLeft: 0, paddingRight: 0, borderWidth: 0, marginRight: () => -4 * em(), duration: 1.2 }, NARROW)
      .to(done, { "--x": 0, "--w": 260, duration: 1.2 }, NARROW)
      .set(insert("build"), { display: "block" }, NARROW + 0.3)
      .to(insert("build"), { height: "auto", duration: 0.6, ease: "oww-settle" }, NARROW + 0.3)
      .to(q(".tm-light"), { opacity: 0, duration: 0.8, ease: "sine.inOut" }, NARROW)
      .to(q(".tm-glow"), { opacity: 1, duration: 1.1, ease: "sine.out" }, NARROW + 0.2)
      .to(doneMarks, { opacity: 1, duration: 0.4, ease: "power1.out", stagger: 0.05 }, NARROW + 0.6)
      // 5. The ticks (P-5), as the phone settles: each drawn round its
      // circle (a sweep, _about.scss), one after another on an uneven beat.
      .fromTo(doneChecks, { opacity: 1, "--sweep": 0, scale: 0.9 }, { opacity: 1, "--sweep": 1, scale: 1, duration: 0.5, ease: "power2.inOut", stagger: tickAt, immediateRender: false }, TICKS + 0.05)
      .to(doneCircles, { opacity: 0, duration: 0.3, ease: "sine.inOut", stagger: tickAt }, TICKS + 0.25);

    // The loop (user: seamless, on repeat): the story runs and holds on
    // P-5, the pointer barely moving and the camera drifting a little
    // closer, then the pointer leaves down off the board (where it comes in
    // from next time). It does not run the story back (user: from P-5 to
    // P-1 looked odd, as rewound): the cards fade, the phone widens to the
    // board with its columns empty, and the cards come back in their first
    // places, one column after another. The pointer's own moves here go on
    // --ax/--ay/--ao (in _about.scss), not on the story's; the camera is
    // moved by the loop, on the story's beats.
    const end = timeline.duration();
    const forward = end / PACE; // s the story takes going forward
    const H = forward + HOLD; // s: the way back starts
    const cards = board.querySelectorAll(".tm-col__cards");
    const sideCols = [q('[data-col="backlog"]'), q('[data-col="progress"]')];
    // The pointer's own moves at the end of a round (idling, leaving down
    // off the board, back in place for the next) and Backlog and In
    // Progress kept hidden while the phone widens: worked out from the
    // loop's time on every frame, not tweened (as tweens they were not set
    // back when the loop began again: the pointer and both columns stayed
    // hidden in the next rounds).
    const ramp = (now, at, time, ease) => gsap.parseEase(ease)(gsap.utils.clamp(0, 1, (now - at) / time));
    const loopBits = () => {
      const now = loop.time();
      const back = now >= H + 2.07;
      const idle = back ? 0 : ramp(now, forward, HOLD * 0.75, "sine.inOut");
      const away = back ? 0 : ramp(now, H - 0.35, 0.85, "power2.in");
      cursor.style.setProperty("--ax", 2.5 * idle + 13.5 * away);
      cursor.style.setProperty("--ay", -1.5 * idle + 171.5 * away);
      cursor.style.setProperty("--ao", back ? 1 : 1 - ramp(now, H + 0.35, 0.2, "sine.in"));
      sideCols.forEach((col, i) => {
        const shown = now < H + 0.46 ? 1 : ramp(now, H + 2.1 + 0.09 * i, 0.6, "oww-settle");
        col.style.setProperty("--co", shown);
      });
    };
    loop = gsap.timeline({
      paused: true,
      repeat: -1,
      onUpdate: () => {
        writeLabel();
        moveCard();
        placeCursor();
        loopBits();
      },
    });
    settleLoop = loopBits;
    loop.to(timeline, { time: end, duration: forward, ease: "none" });
    SHOTS.forEach((shot, i) => {
      const to = { "--kfx": shot.fx, "--kfy": shot.fy, "--kz": shot.z, duration: shot.time / PACE, ease: "oww-cam" };
      if (i === 0) loop.fromTo(lens, { "--kfx": 335, "--kfy": 210, "--kz": 1 }, { ...to, immediateRender: false }, shot.at / PACE);
      else loop.to(lens, to, shot.at / PACE);
    });
    loop
      .to(lens, { "--kz": 1.012, duration: HOLD + 0.6, ease: "sine.inOut" }, forward - 0.2)
      .to(lens, { "--kz": 1, duration: 1.6, ease: "sine.inOut" }, H + 0.5)
      .to(cards, { opacity: 0, duration: 0.45, ease: "power1.in" }, H)
      // Back to where the phone has just formed (the ticks are hidden with
      // the cards; before it the phone was still narrowing and its width
      // jumped: user), then widened by the story's own curves alone (an
      // ease over them made it start slow and end abruptly).
      // Backlog and In Progress stay hidden while it widens (user: they
      // ran into Completed on its way) and come in with the cards
      // (loopBits).
      .to(timeline, { time: PHONE, duration: 0 }, H + 0.47)
      .to(timeline, { time: NARROW, duration: 1.5, ease: "none" }, H + 0.5)
      .to(timeline, { time: 0, duration: 0 }, H + 2.05)
      .fromTo(cards, { opacity: 0, y: () => 6 * em() }, { opacity: 1, y: 0, duration: 0.6, ease: "oww-settle", stagger: 0.09, immediateRender: false }, H + 2.1)
      .set({}, {}, H + 3.2);
  });

  return {
    loop: true,
    play: () => loop.restart(),
    resume: () => loop.play(),
    pause: () => loop.pause(),
    reset: () => {
      loop.pause(0);
      settleLoop();
    },
    // P-5 as in Figma: without the pointer.
    finish: () => {
      loop.pause(timeline.duration() / PACE);
      settleLoop();
      gsap.set(cursor, { autoAlpha: 0 });
      gsap.set(lens, { "--kfx": 335, "--kfy": 210, "--kz": 1 });
    },
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
  // When each tool sets off down its line into OWW (Figma, Webflow,
  // ClickUp: not together), and so when it reaches it.
  const SLIDE = [6.25, 6.43, 6.34];
  const REACH = SLIDE.map((at) => at + 0.85);
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
  // The camera (user: alive, as motion): it stays on the middle and only
  // drifts a little closer, never following the pointer (going in to it
  // cut the tools off; user); it comes in more only as OWW fills the
  // frame, and is put back under the dark the next round lifts from.
  const lens = [q(".tm-camera"), q(".tm-dots")];
  const camera = cameraPath([
    { at: 0.4, time: 2.6, fx: 335, fy: 206, z: 1.015 },
    { at: 3.0, time: 2.4, fx: 335, fy: 214, z: 1.02 },
    { at: 7.0, time: 1.6, fx: 335, fy: 210, z: 1 },
    { at: 8.9, time: 1.4, fx: 335, fy: 210, z: 1 },
    { at: 10.6, time: 2.0, fx: 335, fy: 210, z: 1.06 },
    { at: 12.7, cut: true },
  ]);
  // The pointer: in from below the board's edge (it clips) along one curve
  // at a person's pace, a moment's rest, the press, and out down off the
  // board along another.
  const cursor = q(".tm-cursor");
  const POINT = { x: 375, y: 351 }; // where it presses OWW
  const IN = { at: 4.65, time: 1.2 };
  const OUT = { at: 6.4, time: 0.95 };
  const wayIn = smoothPath([[470, 482], [432, 418], [POINT.x, POINT.y]]);
  const wayOut = smoothPath([[POINT.x, POINT.y], [404, 404], [446, 492]]);
  const place = () => {
    const now = timeline?.time() ?? 0;
    aim(lens, camera(now));
    const along = (span, ease) => ease(gsap.utils.clamp(0, 1, (now - span.at) / span.time));
    const [cx, cy] = now < OUT.at ? wayIn(along(IN, HUMAN_PACE)) : wayOut(along(OUT, gsap.parseEase("power2.in")));
    cursor.style.setProperty("--cx", cx);
    cursor.style.setProperty("--cy", cy);
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
      defaults: { ease: "oww-move", lazy: false, immediateRender: false },
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
        .fromTo(way, { p: 0 }, { p: 1, duration: 2.9, ease: "oww-move" }, 0.4 + [0.08, 0, 0.16][i])
        // Its line runs down along its way at one pace, as the tool settles.
        .fromTo(way, { d: 0 }, { d: 1, duration: wires[way.tool.dataset.tool].length / 240, ease: "sine.inOut" }, 3.0 + [0.06, 0, 0.12][i])
        // Pulled into OWW, faster and faster.
        .fromTo(way, { m: 0 }, { m: 1, duration: 0.85, ease: "power3.in" }, SLIDE[i]),
    );
    timeline
      .fromTo(tools, { autoAlpha: 1, scale: 1 }, { autoAlpha: 1, scale: 1, duration: 0.01 }, 0)
      .fromTo(links, { autoAlpha: 0 }, { autoAlpha: 0, duration: 0.01 }, 0)
      .fromTo(particles, { "--py": 340 }, { "--py": 10, duration: 3.2, ease: "power2.inOut" }, 0.4)
      .fromTo(particles, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: "sine.inOut" }, 0.4)
      .fromTo(particles, { opacity: 1 }, { opacity: 0, duration: 1, ease: "sine.inOut" }, 2.6)
      // They come up a little past their places and settle; while they
      // wait each floats at its own pace, barely.
      .fromTo(tools, { yPercent: 0 }, { yPercent: -6, duration: 0.35, ease: "power2.out", stagger: { each: 0.08, from: "center" } }, 3.05)
      .fromTo(tools, { yPercent: -6 }, { yPercent: 0, duration: 0.7, ease: "power2.inOut", stagger: { each: 0.08, from: "center" } }, 3.4)
      // 2. The lines run down; OWW rises to meet them; the light, twice.
      // (autoAlpha on both ends: a value only in the start is not set again
      // when the story starts over from the middle; user: the lines were
      // gone after coming back to 02)
      .fromTo(links, { autoAlpha: 1 }, { autoAlpha: 1, duration: 0.01 }, 3.0)
      .fromTo(
        oww,
        { autoAlpha: 0, scale: 0.94, "--ox": 335, "--oy": 345, "--s": 116, "--r": 32, "--b": 1.5, "--l": 63.359, "--sa": 0.25, backgroundColor: "rgba(0, 0, 0, 0.25)" },
        { autoAlpha: 1, scale: 1, "--ox": 335, "--oy": 305, "--s": 116, "--r": 32, "--b": 1.5, "--l": 63.359, "--sa": 0.25, backgroundColor: "rgba(0, 0, 0, 0.25)", duration: 1.1, ease: "oww-settle" },
        3.3,
      )
      .fromTo(logo, { autoAlpha: 1 }, { autoAlpha: 1, duration: 0.01 }, 3.3);
    tools.forEach((tool, i) =>
      timeline.fromTo(tool, { yPercent: 0 }, { yPercent: [-3, -2, -3.5][i], duration: [0.9, 1.0, 0.85][i], ease: "sine.inOut", yoyo: true, repeat: 1 }, [4.35, 4.2, 4.45][i]),
    );
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
      // 3. The pointer comes in (IN, placed by place()), rests a moment
      // and presses OWW, which gives and turns solid; it leaves down off
      // the board (OUT). The tools are pulled down their lines into OWW one
      // after another, the lines rolling up behind them, and OWW gives a
      // little pulse as each comes in, each a little different.
      .fromTo(cursor, { autoAlpha: 0, scale: 1 }, { autoAlpha: 1, scale: 1, duration: 0.01 }, IN.at)
      .to(cursor, { scale: 0.9, duration: 0.14, ease: "power2.out" }, 6.0)
      .to(oww, { scale: 0.97, duration: 0.14, ease: "power2.out" }, 6.0)
      .to(cursor, { scale: 1, duration: 0.45, ease: "oww-settle" }, 6.14)
      .to(oww, { scale: 1, duration: 0.5, ease: "oww-settle" }, 6.14)
      .to(oww, { backgroundColor: "#0f0f0f", duration: 0.45, ease: "sine.out" }, 6.05)
      .fromTo(cursor, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.01 }, OUT.at + OUT.time);
    tools.forEach((tool, i) =>
      timeline
        .to(tool, { scale: 0.45, duration: 0.85, ease: "power2.in" }, SLIDE[i])
        .to(tool, { autoAlpha: 0, duration: 0.15, ease: "sine.in" }, REACH[i] - 0.12)
        .to(oww, { scale: [1.03, 1.02, 1.025][i], duration: 0.12, ease: "power2.out" }, REACH[i])
        .to(oww, { scale: 1, duration: 0.5, ease: "oww-settle" }, REACH[i] + 0.12),
    );
    timeline
      .to(links, { autoAlpha: 0, duration: 0.3, ease: "sine.in" }, 7.05)
      .to(glow, { opacity: 0, duration: 1.4, ease: "sine.inOut" }, 6.6)
      // 4. OWW to the middle as the last tool is in; the grid spreads out
      // from behind it before it has settled (P-4).
      .to(oww, { "--oy": 210, duration: 1.1 }, 7.3)
      .fromTo(grid, { "--k": 0, "--s": 116, "--p": 132, opacity: 1, scale: 1 }, { "--k": 1, "--s": 116, "--p": 132, opacity: 1, scale: 1, duration: 1.3, ease: "oww-settle" }, 7.8)
      .fromTo(inner, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "sine.out", stagger: fromCentre(0.06) }, 7.8)
      // 5. Narrower, the outer tiles and the edges, the ticks (P-5).
      .to(grid, { "--s": 90, "--p": 106, duration: 1.2 }, 8.9)
      .to(oww, { "--s": 90, "--r": 24, "--b": 1.14, "--l": 48.168, "--sa": 0.5, duration: 1.2 }, 8.9)
      .fromTo(outer, { opacity: 0 }, { opacity: 1, duration: 0.9, ease: "sine.inOut" }, 9.1)
      .fromTo(q(".int-fade"), { opacity: 0 }, { opacity: 1, duration: 0.9, ease: "sine.inOut" }, 9.0)
      // The ticks drawn round their circles (a sweep, _about.scss), from the
      // middle out, while the grid still settles.
      .fromTo(ticks, { opacity: 0, "--sweep": 0 }, { opacity: 0.1, "--sweep": 1, duration: 0.5, ease: "power2.inOut", stagger: fromCentre(0.1) }, 9.3)
      // 6. OWW grows through P-6 and fills the frame (P-7), all one move
      // (the ends are chosen so that it passes P-6: 174.18, corners 46.448,
      // stroke 2.207, logo 93.22); the grid comes towards us and fades.
      .to(oww, { "--s": 900, "--r": 240, "--b": 11.4, "--l": 481.7, duration: 2.1 }, 10.6)
      .to(logo, { autoAlpha: 0, duration: 0.4, ease: "sine.inOut" }, 10.75)
      .to(grid, { scale: 1.3, opacity: 0, duration: 1.4, ease: "power2.in" }, 11.1)
      // The dark the next round lifts from.
      .set(cover, { opacity: 1 }, 12.7)
      .set({}, {}, 12.8);
  
    // Shown at its first step at once (the stylesheet shows P-1 as it
    // stands; without this, that showed for a frame before the story began).
    timeline.time(0.02).pause(0);
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
      aim(lens, FRAME);
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

// The "design" storyboard of illustration 03 (Figma P-1 … P-6, 2161:80 →
// 2161:254 → 2161:337 → 2194:2389 → 2202:2465 → 2167:519;
// docs/implementation/35-principles-03-design.md), in Figma pixels (the
// custom properties in _about.scss). It loops, about 20s a round, each step
// set off by a pointer so the story reads (user decisions):
// 1. the UI designer comes in and clicks the layout grid on; the
//    wireframe's blocks light up a little, snap to its columns and fade,
//    leaving the grid and its note (P-2);
// 2. the brand designer comes in and clicks: the window opens up to a
//    design, the snapped picture growing into its photo (P-3);
// 3. the designers rework the layout twice and back: one takes the photo
//    by its corner and drags it into its new shape, the other photo and
//    the words moving to theirs (P-4, P-5, P-3);
// 4. it dims, the lead's pointer comes and "Approved by Lead" appears as it
//    clicks (P-6);
// 5. the design folds back into the wireframe, and it begins again.
// With reduced motion it shows P-6, still.
function createDesignStory(figure) {
  const q = (selector) => figure.querySelector(selector);
  const qa = (selector) => [...figure.querySelectorAll(selector)];
  const ctx = gsap.context(() => {}, figure);
  const STILL = 17; // s: P-6, shown with reduced motion
  // The wireframe's blocks and picture snap to the grid's columns (32.667
  // wide, 10 apart, from 18.68): the blocks to 6, 4, 6, 5 and 3 columns from
  // the first, the picture to the last 6 (where the design's photo will be).
  const BAR_W = [226, 140, 226, 199, 103];
  const BAR_SNAP = [246, 160.67, 246, 203.33, 118];
  // The first photo frame: the wireframe's picture, snapped, then in each
  // design (P-3, P-4, P-5); the second frame in P-3, P-4 (folded into the
  // wide photo's left half, hidden) and P-5.
  const WIRE = { "--sx": 308.68, "--sy": 68.68, "--sw": 200, "--sh": 190, "--sf": 0.1, "--sp": 0, "--si": 1 };
  const SNAP = { "--sx": 274.68, "--sw": 246 };
  const ONE = {
    spaces: { "--sx": 274.68, "--sy": 92.68, "--sw": 246, "--sh": 222 },
    ideas: { "--sx": 18.68, "--sy": 166.68, "--sw": 502, "--sh": 148 },
    victory: { "--sx": 315.67, "--sy": 104.68, "--sw": 108, "--sh": 155 },
  };
  const TWO = {
    spaces: { "--bx": 146.68, "--by": 196.68, "--bw": 96, "--bh": 118 },
    ideas: { "--bx": 18.68, "--by": 166.68, "--bw": 251, "--bh": 148 },
    victory: { "--bx": 174.68, "--by": 104.68, "--bw": 133, "--bh": 210 },
  };
  // Where a pointer's tip takes the first frame (its top left corner), in
  // the frame: the window's inside starts at 65.321, 43.321 in the designs.
  const corner = (name) => ({ x: 65.321 + ONE[name]["--sx"] - 1.73, y: 43.321 + ONE[name]["--sy"] - 1.73 });
  // Where the UI designer clicks the layout grid on: on the wireframe, well
  // inside the window (a button for it looked odd; on its edge the pointer
  // read as outside; user).
  const GRID_CLICK = { x: 228, y: 196 };
  const MORPH = 1.2; // s a designer drags a layout into the next
  // Where the pointers are (their tips' corners, Figma px on the board):
  // each comes in from beyond the board's edge (it clips) and leaves past
  // it; the drags go with the photo's corner, on its curve.
  const drag = (from, to, at) => [
    { at: at - 1.05, time: 0.85, ...corner(from) },
    { at, time: MORPH, ...corner(to), ease: "oww-move", bow: 0 },
  ];
  const uiAt = pointerTrack([545, 470], [
    { at: 0.3, time: 1.15, ...GRID_CLICK, bow: 0.18 },
    { at: 2.0, time: 1.3, x: 452, y: 292 },
    { at: 5.7, time: 1, x: 480, y: 330 },
    ...drag("spaces", "ideas", 8.4),
    { at: 9.9, time: 1, x: 470, y: 318 },
    ...drag("victory", "spaces", 13.8),
    { at: 15.1, time: 0.85, x: 600, y: 480, ease: "power2.in", bow: 0.05 },
  ]);
  const brandAt = pointerTrack([243, -70], [
    { at: 4.55, time: 0.95, x: 412, y: 150, bow: 0.1 },
    { at: 6.9, time: 1.1, x: 300, y: 118 },
    ...drag("ideas", "victory", 11.1),
    { at: 12.6, time: 1, x: 232, y: 214 },
    { at: 15.0, time: 0.85, x: 170, y: -80, ease: "power2.in", bow: 0.05 },
  ]);
  const leadAt = pointerTrack([470, 482], [
    { at: 15.6, time: 1.05, x: 377, y: 226, bow: 0.16 },
    { at: 18.4, time: 0.85, x: 430, y: 490, ease: "power2.in", bow: 0.06 },
  ]);
  // The camera barely comes closer, on the middle (it never follows a
  // pointer: going in cut the frame off; user).
  const camera = cameraPath([
    { at: 0.3, time: 3, fx: 335, fy: 212, z: 1.015 },
    { at: 5.6, time: 2, fx: 335, fy: 210, z: 1.02 },
    { at: 18.4, time: 1.9, fx: 335, fy: 210, z: 1 },
  ]);

  let timeline;
  let place = () => {};
  ctx.add(() => {
    const win = q(".ds-window");
    const screen = q(".ds-screen");
    const light = q(".ds-light");
    const bars = qa(".ds-bar");
    const grid = q(".ds-grid");
    const cols = qa(".ds-col");
    const note = q(".ds-note");
    const page = (name) => q(`[data-page="${name}"]`);
    const spaces = page("spaces");
    const others = [page("ideas"), page("victory")];
    const parts = [...spaces.children];
    const shot = q(".ds-shot");
    const shot2 = q(".ds-shot2");
    const pic = (name) => q(`[data-pic="${name}"]`);
    const brand = q('[data-pointer="brand"]');
    const ui = q('[data-pointer="ui"]');
    const cursor = q(".tm-cursor");
    const badge = q(".ds-badge");
    const glow = q(".ds-glow");
    const lens = [q(".tm-camera"), q(".tm-dots")];
    gsap.set(cursor, { transformOrigin: "36.6% 27.2%" });
    gsap.set(badge, { transformOrigin: "50% 50%" });
    gsap.set([brand, ui], { transformOrigin: "11% 11%" });

    // The pointers and the camera, by the story's time.
    place = () => {
      const now = timeline.time();
      const set = (el, [x, y], kx = "--x", ky = "--y") => {
        el.style.setProperty(kx, x);
        el.style.setProperty(ky, y);
      };
      set(ui, uiAt(now));
      set(brand, brandAt(now));
      set(cursor, leadAt(now), "--cx", "--cy");
      aim(lens, camera(now));
    };
    timeline = gsap.timeline({ paused: true, repeat: -1, defaults: { ease: "oww-move", lazy: false, immediateRender: false }, onUpdate: () => place() });
    // A pointer clicks: it presses in and lets go.
    const click = (pointer, at) =>
      timeline
        .to(pointer, { scale: 0.82, duration: 0.11, ease: "power2.out" }, at)
        .to(pointer, { scale: 1, duration: 0.35, ease: "back.out(2)" }, at + 0.11);
    // The layout changes from one design to the next: a designer drags the
    // first photo by its corner into its new shape, the second photo moves
    // with it, the photos change inside them, and the words of the old
    // design move up and out as the new one's come up in.
    // The photo's corner comes a beat after the pointer (it has some
    // weight) and settles; the second photo follows a little later still;
    // the old words go up as the new ones come in, overlapping.
    const rework = (from, to, pointer, at, two) => {
      timeline
        .to(pointer, { scale: 0.82, duration: 0.11, ease: "power2.out" }, at - 0.15)
        .to(pointer, { scale: 1, duration: 0.35, ease: "back.out(2)" }, at + MORPH)
        .to(shot, { ...ONE[to], duration: MORPH + 0.1 }, at + 0.04)
        .to(pic(two.out1), { opacity: 0, duration: 0.6, ease: "sine.inOut" }, at + 0.35)
        .to(pic(two.in1), { opacity: 1, duration: 0.6, ease: "sine.inOut" }, at + 0.2)
        .to(shot2, { ...TWO[to], duration: MORPH + 0.15 }, at + 0.1)
        .to(page(from), { opacity: 0, y: -5, duration: 0.45, ease: "power2.in" }, at)
        .fromTo(page(to), { y: 8 }, { opacity: 1, y: 0, duration: 0.75, ease: "oww-settle" }, at + 0.32);
      if (two.hide) timeline.to(shot2, { opacity: 0, duration: 0.5, ease: "sine.inOut" }, at + 0.2);
      if (two.show) timeline.to(shot2, { opacity: 0.4, duration: 0.6, ease: "sine.inOut" }, at + 0.4);
      if (two.swap) timeline.to(pic(two.swap[0]), { opacity: 0, duration: 0.6, ease: "sine.inOut" }, at + 0.35).to(pic(two.swap[1]), { opacity: 1, duration: 0.6, ease: "sine.inOut" }, at + 0.2);
    };

    // Every round starts from P-1 (a tween of its own each: a set at 0 is not
    // redrawn as it loops).
    const start = (targets, vars) => timeline.fromTo(targets, vars, { ...vars, duration: 0.01 }, 0);
    start(win, { "--wh": 284, "--ra": 60, "--ring": 0.75, backgroundColor: "#000000" });
    start(screen, { opacity: 1 });
    start(light, { opacity: 1, "--lx": 0 });
    start(bars, { opacity: 1, "--x": 30.68, "--w": (i) => BAR_W[i], "--bo": 0.1 });
    start(grid, { opacity: 0 });
    start(cols, { opacity: 0, scaleX: 0.4 });
    start(note, { opacity: 0, x: 0, y: 0, scale: 1 });
    start(shot, WIRE);
    start(shot2, { ...TWO.spaces, opacity: 0 });
    start([pic("spaces"), pic("stairs")], { opacity: 1 });
    start([pic("desk"), pic("lift"), pic("run")], { opacity: 0 });
    start(parts, { opacity: 0, y: 0 });
    start(spaces, { opacity: 1, y: 0 });
    start(others, { opacity: 0, y: 0 });
    // The designers stay shown: they come in from beyond the board's edge.
    start([brand, ui], { opacity: 1, scale: 1 });
    start(cursor, { autoAlpha: 0, scale: 1 });
    start(badge, { opacity: 0, scale: 1.25, rotation: -6 });
    start(glow, { opacity: 0 });

    // 1. The UI designer comes in and clicks the layout grid on; the
    // columns grow from the middle, the
    // wireframe lights up a little and snaps to them, block after block on
    // an uneven beat, settling with a little give, and fades, leaving the
    // grid and its note (P-2).
    const fromMiddle = (_, col) => Math.abs(cols.indexOf(col) - 5.5) * 0.035;
    const snapAt = [0, 0.07, 0.16, 0.21, 0.3];
    click(ui, 1.6);
    timeline
      .to(light, { "--lx": -8, duration: 3.4, ease: "sine.inOut" }, 0.4)
      .to(grid, { opacity: 1, duration: 0.01 }, 1.75)
      .to(cols, { opacity: 1, scaleX: 1, duration: 0.7, ease: "oww-settle", stagger: fromMiddle }, 1.75)
      .to(bars, { "--bo": 0.24, duration: 0.4, ease: "sine.out" }, 2.2)
      .to(shot, { "--sf": 0.2, duration: 0.4, ease: "sine.out" }, 2.2)
      .to(bars, { "--x": 18.68, "--w": (i) => BAR_SNAP[i], duration: 0.85, ease: "back.out(1.5)", stagger: (i) => snapAt[i] }, 2.35)
      .to(shot, { ...SNAP, duration: 0.9, ease: "back.out(1.3)" }, 2.55)
      .fromTo(note, { x: 8, y: 6, scale: 0.94 }, { opacity: 1, x: 0, y: 0, scale: 1, duration: 0.5, ease: "power2.out" }, 3.4)
      .to(bars, { "--bo": 0.1, duration: 0.4, ease: "sine.inOut" }, 3.6)
      .to(bars, { opacity: 0, duration: 0.7, ease: "sine.inOut" }, 3.95)
      .to(shot, { "--sf": 0, "--si": 0, duration: 0.7, ease: "sine.inOut" }, 3.95);
    // 2. The brand designer comes and clicks: the grid goes off, the window opens up to the design, its photo growing out of
    // the snapped picture, the parts coming in one after another (P-3).
    click(brand, 5.5);
    timeline
      .to(grid, { opacity: 0, duration: 0.5, ease: "sine.inOut" }, 5.6)
      .to(win, { "--wh": 336, "--ra": 200, "--ring": 1, duration: 1.05 }, 5.62)
      .to(light, { opacity: 0, duration: 0.8, ease: "sine.inOut" }, 5.65)
      .fromTo(shot, { ...WIRE, ...SNAP, "--sf": 0, "--si": 0 }, { ...ONE.spaces, "--sp": 0.4, duration: 1.15 }, 5.68)
      .fromTo(parts, { y: 8 }, { opacity: 1, y: 0, duration: 0.8, ease: "oww-settle", stagger: (i) => [0, 0.1, 0.26, 0.35, 0.47][i] ?? i * 0.11 }, 5.9)
      .to(shot2, { opacity: 0.4, duration: 0.7, ease: "sine.inOut" }, 6.3);
    // 3. Reworked twice, then back (P-4, P-5, P-3).
    rework("spaces", "ideas", ui, 8.4, { out1: "spaces", in1: "desk", hide: true });
    rework("ideas", "victory", brand, 11.1, { out1: "desk", in1: "lift", show: true, swap: ["stairs", "run"] });
    rework("victory", "spaces", ui, 13.8, { out1: "lift", in1: "spaces", swap: ["run", "stairs"] });
    // (the designers then leave past the board's edges: uiAt, brandAt)
    // 4. It dims; the lead's pointer comes and clicks: approved (P-6).
    timeline
      .to(win, { "--wh": 314, "--ring": 0, backgroundColor: "#0f0f0f", duration: 0.95 }, 15.4)
      .to(screen, { opacity: 0.1, duration: 0.9, ease: "sine.inOut" }, 15.4)
      // (the photo at 40% of the screen's 10% would be 4%; Figma has 10%)
      .to(shot, { "--sp": 1, duration: 0.9, ease: "sine.inOut" }, 15.4)
      .to(glow, { opacity: 1, duration: 1, ease: "sine.inOut" }, 15.5)
      // The lead comes in from below the board (leadAt), rests a moment and
      // clicks; "Approved by Lead" comes down on it like a stamp.
      .to(cursor, { autoAlpha: 1, duration: 0.01 }, 15.6)
      .to(cursor, { scale: 0.86, duration: 0.11, ease: "power2.out" }, 16.8)
      .to(cursor, { scale: 1, duration: 0.35, ease: "back.out(2)" }, 16.91)
      .to(badge, { opacity: 1, duration: 0.15, ease: "sine.out" }, 16.85)
      .to(badge, { scale: 1, rotation: 0, duration: 0.55, ease: "back.out(2.2)" }, 16.85)
      // 5. Back to the wireframe in one move: the badge goes, the lead
      // leaves down off the board, the design's parts go down and out one
      // after another as the window folds back, and the wireframe's blocks
      // come up in their first places.
      .to(badge, { opacity: 0, scale: 0.94, duration: 0.4, ease: "power2.in" }, 18.4)
      .to(cursor, { autoAlpha: 0, duration: 0.01 }, 19.3)
      .to(glow, { opacity: 0, duration: 1, ease: "sine.inOut" }, 18.5)
      .to(parts, { opacity: 0, y: 6, duration: 0.4, ease: "power2.in", stagger: 0.05 }, 18.55)
      .to(shot2, { opacity: 0, duration: 0.4, ease: "power2.in" }, 18.6)
      .to(win, { "--wh": 284, "--ra": 60, "--ring": 0.75, backgroundColor: "#000000", duration: 1.15 }, 18.7)
      .to(screen, { opacity: 1, duration: 1.1, ease: "sine.inOut" }, 18.7)
      .to(shot, { ...WIRE, duration: 1.15 }, 18.7)
      .to(light, { opacity: 1, "--lx": 0, duration: 1.1, ease: "sine.inOut" }, 18.7)
      .set(bars, { "--x": 30.68, "--w": (i) => BAR_W[i], y: 5 }, 18.7)
      .to(bars, { opacity: 1, y: 0, duration: 0.6, ease: "oww-settle", stagger: 0.06 }, 19.2)
      .set({}, {}, 20.4);
  
    // Shown at its first step at once (the stylesheet shows P-1 as it
    // stands; without this, that showed for a frame before the story began).
    timeline.time(0.02).pause(0);
    place();
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
      aim([figure.querySelector(".tm-camera"), figure.querySelector(".tm-dots")], FRAME);
    },
    revert: () => {
      timeline.kill();
      ctx.revert();
    },
  };
}

// The "feedback" storyboard of illustration 04 (Figma P-1 … P-4, 2095:5591 →
// 2117:5738 → 2129:5935 → 2129:6457;
// docs/implementation/36-principles-04-feedback.md), in Figma pixels (the
// custom properties in _about.scss). It loops, about 15s a round; each step
// grows out of the last, set off by a person (user decisions):
// 1. the team forms round the client, the arcs drawing out to each (P-1);
// 2. the arcs draw back to the client, the people become their pointers,
//    the thread opens and the client's face flies into the first comment,
//    which comes in; the PMO's face flies into the answer; someone is
//    typing the third (P-2);
// 3. the thread grows into Figma, where the designer drags the copy down
//    until the gap is 64 (P-3);
// 4. it dims, the comment comes up as a card and the designer clicks it
//    resolved (P-4);
// 5. the card goes back into the client, alone again: the next round
//    begins from there.
// With reduced motion it shows P-4, still.
function createFeedbackStory(figure) {
  const q = (selector) => figure.querySelector(selector);
  const qa = (selector) => [...figure.querySelectorAll(selector)];
  const ctx = gsap.context(() => {}, figure);
  const STILL = 12.6; // s: P-4, shown with reduced motion
  // The window as the thread (P-2) and as Figma (P-3).
  const THREAD = { "--x": 218, "--y": 76, "--w": 234, "--h": 267 };
  const FIGMA = { "--x": 64, "--y": 50, "--w": 542, "--h": 446 };
  // Where the client's and the PMO's faces fly to (the comments' faces:
  // centres 254, 174 and 254, 235; 32 across).
  const TO_COMMENT = {
    client: { "--dx": -81, "--dy": 56, "--k": 0.32 },
  };
  const gap = { value: 32 };

  let timeline;
  ctx.add(() => {
    const member = (name) => q(`[data-member="${name}"]`);
    const members = qa(".cm-member");
    const tags = qa(".cm-tag");
    const arcs = qa("[data-arc-mask]");
    const box = q(".cm-box");
    const thread = q(".cm-thread");
    // The thread's title and search come in once it is open (they would be
    // cut while it opens round the client).
    const chrome = [q(".cm-title"), q(".cm-search")];
    const figma = q(".cm-figma");
    const comment = (name) => q(`[data-comment="${name}"]`);
    const faces = qa(".cm-thread .cm-face");
    const heads = qa(".cm-thread .cm-comment__head, .cm-thread .cm-skeleton");
    const texts = qa(".cm-thread .cm-comment__text, .cm-thread .cm-bars");
    const canvas = q(".cm-pane--canvas");
    const value = q(".cm-gap__value");
    const card = q(".cm-card");
    const check = q(".cm-check");
    const pointer = (name) => q(`[data-pointer="${name}"]`);
    const glow = q(".cm-glow");
    const light = q(".cm-light");
    const writeGap = () => (value.textContent = String(Math.round(gap.value)));
    gsap.set(qa(".ds-pointer", figure), { transformOrigin: "11% 11%" });
    gsap.set(card, { transformOrigin: "50% 50%" });
    gsap.set(check, { transformOrigin: "50% 50%" });
    // Each arc is drawn from the client by its mask (one dash along it).
    arcs.forEach((path) => {
      const length = path.getTotalLength();
      path.dataset.length = length;
      path.setAttribute("stroke-dasharray", `${length} ${length}`);
    });
    const arcLength = (_, path) => +path.dataset.length;
    // The light flowing along each arc, from the client out to its person
    // (user: the lines to the team should move): a few dashes of falling
    // length with their heads together (the tail fades), one after another
    // every GAP along the arc, at an even pace; and the dashes of the arc
    // itself moving slowly the same way.
    const pulses = qa(".cm-pulse");
    const lines = qa(".cm-arc");
    const PULSE = { speed: 170, gap: 170, tail: 34 };
    const dashOf = (k) => (PULSE.tail * (k + 1)) / 3;
    pulses.forEach((pulse) =>
      pulse.querySelectorAll("path").forEach((path, k) => {
        const dash = dashOf(2 - k);
        path.setAttribute("stroke-dasharray", `${dash} ${PULSE.gap - dash}`);
      }),
    );

    timeline = gsap.timeline({
      paused: true,
      repeat: -1,
      defaults: { ease: "power2.inOut", lazy: false, immediateRender: false },
      onUpdate: writeGap,
    });
    const glide = (el, at, x, y, duration = 0.9) =>
      timeline
        .to(el, { "--x": x, duration, ease: "power2.inOut" }, at)
        .to(el, { "--y": y, duration, ease: "sine.inOut" }, at);
    const click = (el, at) =>
      timeline
        .to(el, { scale: 0.82, duration: 0.12, ease: "sine.out" }, at)
        .to(el, { scale: 1, duration: 0.3, ease: "power2.out" }, at + 0.12);
    // Every round starts from P-1 (a tween of its own each).
    const start = (targets, vars) => timeline.fromTo(targets, vars, { ...vars, duration: 0.01 }, 0);
    start(members, { opacity: (i, el) => (el === member("client") ? 1 : 0), "--dx": 0, "--dy": 0, "--k": (i, el) => (el === member("client") ? 1 : 0.6) });
    start(tags, { opacity: (i, el) => (el.dataset.tag === "client" ? 1 : 0), y: 0 });
    start(arcs, { attr: { "stroke-dashoffset": arcLength } });
    start(pulses, { opacity: 1 });
    start(box, { ...THREAD, opacity: 0, backgroundColor: "#000000", "--ring": 1 });
    start(thread, { opacity: 1 });
    start(chrome, { opacity: 0, y: 0 });
    start(figma, { opacity: 0 });
    start(light, { opacity: 1 });
    start([...faces, comment("typing")], { opacity: 0, scale: 1 });
    start(heads, { opacity: 0, y: 0 });
    start(texts, { opacity: 0, y: 0 });
    start(canvas, { "--gap": 32 });
    start(gap, { value: 32 });
    start(card, { opacity: 0, y: 0, scale: 1 });
    start(check, { opacity: 0.35, scale: 1 });
    start(pointer("client"), { opacity: 0, scale: 1, "--x": 335, "--y": 118 });
    start(pointer("pmo"), { opacity: 0, scale: 1, "--x": 514, "--y": 242 });
    start(pointer("designer"), { opacity: 0, scale: 1, "--x": 427, "--y": 322 });
    start(glow, { opacity: 1 });

    // 1. The team forms round the client: each arc draws out from it and
    // its person comes up where it ends, then the names (P-1; user: P-1
    // builds up rather than starting formed).
    const others = ["lead", "designer-a", "designer-b", "pmo"];
    timeline
      .to(arcs, { attr: { "stroke-dashoffset": 0 }, duration: 0.8, ease: "power2.out", stagger: 0.1 }, 0.3)
      .fromTo(lines, { attr: { "stroke-dashoffset": 0 } }, { attr: { "stroke-dashoffset": -36 }, duration: 3, ease: "none" }, 0.3)
      .to(pulses, { opacity: 0, duration: 0.35, ease: "sine.in" }, 2.55)
      .to(others.map(member), { opacity: 1, "--k": 1, duration: 0.55, ease: "back.out(1.5)", stagger: 0.1 }, 0.75)
      .fromTo(tags.filter((tag) => tag.dataset.tag !== "client"), { y: 4 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", stagger: 0.08 }, 1.2);

    pulses.forEach((pulse, i) =>
      pulse.querySelectorAll("path").forEach((path, k) => {
        const dash = dashOf(2 - k);
        const from = dash - i * 47;
        timeline.fromTo(path, { attr: { "stroke-dashoffset": from } }, { attr: { "stroke-dashoffset": from - PULSE.speed * 2.6 }, duration: 2.6, ease: "none" }, 0.3);
      }),
    );

    // 2. The team becomes the people at work: the arcs draw back into the
    // client, the PMO and a designer shrink into their pointers, the others
    // go; the client flies into the thread, which opens round it from where
    // it lands, and its pointer comes out after it (P-2).
    timeline
      .to(arcs, { attr: { "stroke-dashoffset": arcLength }, duration: 0.7, ease: "power2.in" }, 2.6)
      .to(tags, { opacity: 0, duration: 0.4, ease: "sine.in" }, 2.6)
      .to([member("lead"), member("designer-a")], { opacity: 0, "--k": 0.6, duration: 0.5, ease: "sine.in" }, 2.75)
      .to([member("pmo"), member("designer-b")], { opacity: 0, "--k": 0.3, duration: 0.45, ease: "sine.in" }, 2.85)
      .to([pointer("pmo"), pointer("designer")], { opacity: 1, duration: 0.35, ease: "sine.out" }, 2.95)
      .to(member("client"), { ...TO_COMMENT.client, duration: 0.85, ease: "power3.inOut" }, 2.95)
      // (its size and its fading in one tween: apart, it showed full size
      // for a moment before it opened)
      .fromTo(box, { "--x": 238, "--y": 158, "--w": 32, "--h": 32, opacity: 0 }, { ...THREAD, opacity: 1, duration: 0.85, ease: "power3.out" }, 3.68)
      // The landed face stays until the thread is open (the comment's own
      // face sits by the thread's corner, which moves while it opens).
      .set(faces[0], { opacity: 1 }, 4.55)
      .fromTo(chrome, { y: 4 }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out", stagger: 0.08 }, 4.25)
      .set(member("client"), { opacity: 0 }, 4.55)
      .to(pointer("client"), { opacity: 1, duration: 0.35, ease: "sine.out" }, 3.2);
    glide(pointer("pmo"), 2.95, 180, 248, 1.1);
    glide(pointer("designer"), 2.95, 473, 238, 1.1);
    glide(pointer("client"), 3.2, 129, 121, 1.0);
    timeline
      // The client's comment comes in, as if typed.
      .fromTo(heads[0], { y: 4 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, 4.35)
      .fromTo(texts[0], { y: 4 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, 4.5)
      // The PMO answers.
      .fromTo(faces[1], { scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(1.6)" }, 5.2)
      .fromTo(heads[1], { y: 4 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, 5.35)
      .fromTo(texts[1], { y: 4 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, 5.5)
      // Someone is typing.
      .to([comment("typing"), faces[2], heads[2]], { opacity: 1, duration: 0.4, ease: "sine.out" }, 6.4)
      .to(texts[2], { opacity: 1, duration: 0.5, ease: "sine.out" }, 6.5)
      .fromTo(comment("typing"), { opacity: 1 }, { opacity: 0.45, duration: 0.45, ease: "sine.inOut", yoyo: true, repeat: 1 }, 6.95);
    // (beside the thread, not over the PMO's face in it)
    glide(pointer("pmo"), 4.6, 172, 238, 1);
    glide(pointer("client"), 5.6, 150, 160, 1);
    // 3. The thread grows into Figma; the designer drags the copy down to a
    // 64 gap (P-3).
    timeline
      .to([pointer("client"), pointer("pmo")], { opacity: 0, duration: 0.45, ease: "sine.in" }, 7.9)
      .to(box, { ...FIGMA, duration: 1.1, ease: "power3.inOut" }, 8)
      .to(thread, { opacity: 0, duration: 0.4, ease: "sine.in" }, 8)
      .to(figma, { opacity: 1, duration: 0.6, ease: "sine.out" }, 8.35)
      .to(glow, { opacity: 0, duration: 1, ease: "sine.inOut" }, 8);
    glide(pointer("designer"), 8.4, 300, 245.3, 0.9);
    timeline
      .to(pointer("designer"), { scale: 0.82, duration: 0.12, ease: "sine.out" }, 9.35)
      .to(pointer("designer"), { "--y": 277.3, duration: 1, ease: "power2.inOut" }, 9.5)
      .to(canvas, { "--gap": 64, duration: 1, ease: "power2.inOut" }, 9.5)
      .to(gap, { value: 64, duration: 1, ease: "power2.inOut" }, 9.5)
      .to(pointer("designer"), { scale: 1, duration: 0.3, ease: "power2.out" }, 10.5);
    glide(pointer("designer"), 10.7, 489, 303, 0.8);
    // 4. It dims; the comment comes up and is resolved (P-4).
    timeline
      .to(box, { backgroundColor: "#0f0f0f", "--ring": 0, duration: 0.8, ease: "sine.inOut" }, 11)
      .to(figma, { opacity: 0.2, duration: 0.8, ease: "sine.inOut" }, 11)
      .to(light, { opacity: 0, duration: 0.8, ease: "sine.inOut" }, 11)
      .fromTo(card, { y: 10, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "power2.out" }, 11.2);
    glide(pointer("designer"), 11.4, 436, 208.5, 0.8);
    click(pointer("designer"), 12.25);
    timeline
      .to(check, { opacity: 1, duration: 0.2, ease: "sine.out" }, 12.3)
      .fromTo(check, { scale: 1.25 }, { scale: 1, duration: 0.45, ease: "back.out(2)" }, 12.3)
      // 5. The card goes back into the client, alone again (the next round
      // forms the team).
      .to(pointer("designer"), { opacity: 0, duration: 0.4, ease: "sine.in" }, 13.4)
      .to(card, { y: -92, scale: 0.37, duration: 0.8, ease: "power2.inOut" }, 13.4)
      .to(card, { opacity: 0, duration: 0.3, ease: "sine.in" }, 13.75)
      .to(box, { opacity: 0, duration: 0.6, ease: "sine.inOut" }, 13.45)
      .set(member("client"), { "--dx": 0, "--dy": 0, "--k": 0.5 }, 13.5)
      .to(member("client"), { opacity: 1, "--k": 1, duration: 0.6, ease: "power2.out" }, 14.05)
      .to(glow, { opacity: 1, duration: 0.8, ease: "sine.inOut" }, 13.6)
      .set(member("pmo"), { "--k": 0.6 }, 13.5)
      .to(tags.filter((tag) => tag.dataset.tag === "client"), { opacity: 1, duration: 0.4, ease: "sine.out" }, 14.3)
      .set({}, {}, 15.0);
  
    // Shown at its first step at once (the stylesheet shows P-1 as it
    // stands; without this, that showed for a frame before the story began).
    timeline.time(0.02).pause(0);
  });
  return {
    loop: true,
    play: () => timeline.restart(),
    resume: () => timeline.play(),
    pause: () => timeline.pause(),
    reset: () => timeline.pause(0),
    finish: () => {
      timeline.pause(STILL);
      q(".cm-gap__value").textContent = "64";
    },
    revert: () => {
      timeline.kill();
      ctx.revert();
      q(".cm-gap__value").textContent = "64";
      qa("[data-arc-mask]").forEach((path) => ["stroke-dasharray", "stroke-dashoffset"].forEach((name) => path.removeAttribute(name)));
    },
  };
}

// The "progress" storyboard of illustration 05 (Figma P-1 … P-6, 2034:2093 →
// 2034:2338 → 2044:2407 → 2095:3658 → 2095:2965 → 2095:4031;
// docs/implementation/37-principles-05-progress.md), in Figma pixels (the
// custom properties in _about.scss). It loops, about 14s a round; each step
// grows out of the last, set off by the pointer (user decisions):
// 1. the pointer comes to Finova in the quarter's projects, which lifts
//    (P-2), and clicks it;
// 2. the card opens into the project's timeline: today's line drops, the
//    tasks' bars grow in (P-3);
// 3. the view closes in on Frontend Development, the rest fading round it,
//    and the pointer clicks it (P-4);
// 4. its bar opens downwards into the task, its title staying put (P-5);
// 5. its steps are ticked one by one, to 100% (P-6);
// 6. back the same way to the quarter's projects, and again.
// With reduced motion it shows P-6, still.
function createProgressStory(figure) {
  const q = (selector) => figure.querySelector(selector);
  const qa = (selector) => [...figure.querySelectorAll(selector)];
  const ctx = gsap.context(() => {}, figure);
  const STILL = 10.3; // s: P-6, shown with reduced motion
  // The window: the lifted card (P-2), then the timeline (P-3).
  const CARD = { "--x": 212, "--y": 136.21, "--w": 246, "--h": 53.58, "--r": 14.614, backgroundColor: "#1a1a1a" };
  const WIN = { "--x": 60, "--y": 60, "--w": 550, "--h": 370, "--r": 20, backgroundColor: "#000000" };
  // P-4: closer (×1.1737, Figma's) on Frontend Development.
  const CLOSE = { "--zx": -47.77, "--zy": -147, "--zs": 1.1737 };
  const FAR = { "--zx": 0, "--zy": 0, "--zs": 1 };
  const PRESS = { x: 404, y: 172 }; // where the pointer takes the card
  const ON_CARD = 1.15; // s: the pointer gets onto the card (its foot, 189)
  const BAR = { top: 188.82, height: 45.78 }; // Frontend's bar in P-4
  const done = { p: 0 };

  let timeline;
  ctx.add(() => {
    const em = () => figure.getBoundingClientRect().width / 670;
    const list = q(".tl-list");
    const finova = q('[data-project="finova"]');
    const open = q(".tl-project__open");
    const view = q(".tl-view");
    const box = q(".tl-box");
    const chip = q(".tl-chip");
    const timelineLayer = q(".tl-timeline");
    const bars = qa(".tl-bar");
    const frontend = q('[data-bar="frontend"]');
    const today = q(".tl-today");
    const task = q(".tl-task");
    const checks = qa(".tl-check__done");
    const texts = qa(".tl-step__text");
    const progress = q(".tl-progress");
    const value = q(".tl-progress__value");
    const cursor = q(".tm-cursor");
    const writeValue = () => (value.textContent = `${Math.round(done.p)}%`);
    gsap.set(cursor, { transformOrigin: "36.6% 27.2%" });
    // The task's height and its ticks' centres, in Figma pixels (laid out
    // where it ends, in P-5).
    const F = figure.getBoundingClientRect();
    const taskHeight = task.getBoundingClientRect().height / em();
    const ticks = qa(".tl-check").map((check) => {
      const r = check.getBoundingClientRect();
      return { x: (r.left + r.width / 2 - F.left) / em(), y: (r.top + r.height / 2 - F.top) / em() + BAR.top - 137 };
    });
    // It opens downwards from the bar's place (its title stays put).
    const DROP = BAR.top - 137;
    const IN_BAR = { "--ty": DROP, "--cut": taskHeight - BAR.height };
    const OPEN = { "--ty": DROP, "--cut": 0 };

    timeline = gsap.timeline({
      paused: true,
      repeat: -1,
      defaults: { ease: "oww-move", lazy: false, immediateRender: false },
      onUpdate: writeValue,
    });
    // The pointer glides at a person's pace (both axes together: one
    // smooth move, not two eased apart); a click is a small press and a
    // settling release (user: too rough, stuttering).
    const glide = (at, x, y, duration = 0.8) => timeline.to(cursor, { "--cx": x, "--cy": y, duration, ease: HUMAN_PACE }, at);
    const click = (el, at) =>
      timeline
        .to(el, { scale: 0.9, duration: 0.14, ease: "power2.out" }, at)
        .to(el, { scale: 1, duration: 0.45, ease: "oww-settle" }, at + 0.14);
    // Every round starts from P-1 (a tween of its own each).
    const start = (targets, vars) => timeline.fromTo(targets, vars, { ...vars, duration: 0.01 }, 0);
    start(list, { opacity: 1 });
    start(q(".tl-glow"), { opacity: 1 });
    start(finova, { opacity: 1, "--hk": 1, "--hs": 0, backgroundColor: "rgba(26, 26, 26, 0.2)" });
    start(open, { opacity: 0 });
    start(view, { "--mr": 1 });
    start(box, { ...CARD, ...FAR, opacity: 0 });
    start(chip, { opacity: 1 });
    start(timelineLayer, { opacity: 0 });
    start(bars, { opacity: 1, clipPath: "inset(0% 100% 0% 0%)" });
    start(today, { clipPath: "inset(0% 0% 100% 0%)" });
    start(task, { opacity: 0, ...IN_BAR });
    start(checks, { opacity: 0, scale: 1 });
    start(texts, { "--s": 0 });
    start(progress, { "--p": 0 });
    start(done, { p: 0 });
    // (it comes in from below the board's edge, which clips it)
    start(cursor, { autoAlpha: 1, scale: 1, "--cx": 540, "--cy": 475 });

    // 1. The pointer comes to Finova, which lifts as it gets onto it (P-2),
    // and clicks it (the arrow: it clicks, it does not grab; user).
    glide(0.2, PRESS.x, PRESS.y, 1.15);
    timeline
      .to(finova, { "--hk": 1.2178, "--hs": 1, backgroundColor: "#1a1a1a", duration: 0.45, ease: "power2.out" }, ON_CARD)
      .to(open, { opacity: 1, duration: 0.3, ease: "sine.out" }, ON_CARD + 0.1);
    click(cursor, 1.75);
    // 2. The card opens into the timeline (P-3).
    timeline
      .set(box, { opacity: 1 }, 2.1)
      .set(finova, { opacity: 0 }, 2.1)
      .to(list, { opacity: 0, duration: 0.4, ease: "sine.inOut" }, 2.1)
      // (the light from below is only round the projects, P-1 and P-2)
      .to(q(".tl-glow"), { opacity: 0, duration: 1, ease: "sine.inOut" }, 2.1)
      .to(box, { ...WIN, duration: 1.1 }, 2.1)
      .to(chip, { opacity: 0, duration: 0.3, ease: "sine.in" }, 2.1)
      .to(timelineLayer, { opacity: 1, duration: 0.5, ease: "sine.out" }, 2.32)
      .to(today, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.7, ease: "oww-settle" }, 2.95)
      .to(bars, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.7, ease: "oww-settle", stagger: (i) => [0, 0.07, 0.17, 0.22, 0.31, 0.37][i] ?? i * 0.07 }, 3.0)
      // 3. Closer on Frontend Development; the pointer comes back in from
      // below and clicks it (P-4).
      .to(box, { ...CLOSE, duration: 1.2 }, 4.4)
      .to(view, { "--mr": 0, duration: 1.2 }, 4.4)
      .set(cursor, { "--cx": 520, "--cy": 475 }, 4.7);
    glide(4.75, 418, 229, 1.05);
    // The pointer leaves down off the board as the card opens.
    timeline.to(cursor, { "--cx": 560, "--cy": 480, duration: 0.6, ease: "power2.in" }, 2.0);
    click(cursor, 5.8);
    // 4. Its bar opens into the task (P-5).
    timeline
      .set(task, { opacity: 1 }, 5.95)
      .set(frontend, { opacity: 0 }, 5.95)
      .to(task, { ...OPEN, duration: 0.85 }, 5.95);
    // 5. Its steps ticked one by one, on a person's uneven beat, to 100%
    // (P-6); each tick comes in softly.
    const tickAt = [7.0, 7.6, 8.27, 8.82];
    ticks.forEach((tick, k) => {
      const at = tickAt[k] ?? 7 + k * 0.6;
      glide(at - 0.5, tick.x, tick.y, 0.44);
      click(cursor, at);
      timeline
        .to(checks[k], { opacity: 1, duration: 0.2, ease: "sine.out" }, at + 0.05)
        .fromTo(checks[k], { scale: 0.7 }, { scale: 1, duration: 0.45, ease: "oww-settle" }, at + 0.05)
        .to(progress, { "--p": (k + 1) * 25, duration: 0.5, ease: "oww-settle" }, at + 0.05)
        .to(done, { p: (k + 1) * 25, duration: 0.5, ease: "oww-settle" }, at + 0.05);
      if (texts[k]) timeline.to(texts[k], { "--s": 1, duration: 0.35, ease: "oww-settle" }, at + 0.1);
    });
    // (Figma's P-6 has no pointer: it leaves down off the board once the
    // last step is ticked)
    timeline.to(cursor, { "--cx": 470, "--cy": 480, duration: 0.7, ease: "power2.in" }, 9.4);
    // 6. Back to the quarter's projects, and again.
    timeline
      .to(task, { ...IN_BAR, duration: 0.65 }, 10.55)
      .set(frontend, { opacity: 1 }, 11.2)
      .set(task, { opacity: 0 }, 11.2)
      .set(checks, { opacity: 0 }, 11.3)
      .set(texts, { "--s": 0 }, 11.3)
      .set(progress, { "--p": 0 }, 11.3)
      .set(done, { p: 0 }, 11.3)
      .to(box, { ...FAR, duration: 1 }, 11.2)
      .to(view, { "--mr": 1, duration: 1 }, 11.2)
      .to(timelineLayer, { opacity: 0, duration: 0.3, ease: "sine.in" }, 12.0)
      .to(chip, { opacity: 1, duration: 0.3, ease: "sine.out" }, 12.4)
      .to(box, { ...CARD, duration: 0.95 }, 12.1)
      .to(list, { opacity: 1, duration: 0.5, ease: "sine.inOut" }, 12.4)
      .to(q(".tl-glow"), { opacity: 1, duration: 1, ease: "sine.inOut" }, 12.2)
      .set(finova, { opacity: 1 }, 13.0)
      .set(box, { opacity: 0 }, 13.0)
      .to(finova, { "--hk": 1, "--hs": 0, backgroundColor: "rgba(26, 26, 26, 0.2)", duration: 0.55, ease: "oww-settle" }, 13.05)
      .to(open, { opacity: 0, duration: 0.3, ease: "sine.in" }, 13.05)
      .set({}, {}, 13.8);

    // Shown at its first step at once (as the other stories).
    timeline.time(0.02).pause(0);
  });

  return {
    loop: true,
    play: () => timeline.restart(),
    resume: () => timeline.play(),
    pause: () => timeline.pause(),
    reset: () => timeline.pause(0),
    finish: () => {
      timeline.pause(STILL);
      q(".tl-progress__value").textContent = "100%";
    },
    revert: () => {
      timeline.kill();
      ctx.revert();
      q(".tl-progress__value").textContent = "0%";
    },
  };
}

// The "handoff" storyboard of illustration 06 (Figma P-1 … P-4, 1942:119 →
// 1948:857 → 1988:1267 → 1988:1621;
// docs/implementation/38-principles-06-handoff.md), in Figma pixels (the
// custom properties in _about.scss). It loops, about 13s a round; each step
// grows out of the last, set off by the pointer (user decisions):
// 1. the pointer picks the phone in the design system's devices, then
//    clicks Apply (P-1);
// 2. the panel turns into the app it is applied to, built top to bottom;
//    its parts are tied to their tokens by dashed lines (P-2);
// 3. the app moves aside and dims, the developer's view comes up and its
//    code is typed in, line by line (P-3);
// 4. it all comes down to "Ready to develop", which the pointer clicks
//    (P-4);
// 5. the badge opens back into the design system, and again.
// With reduced motion it shows P-4, still.
function createHandoffStory(figure) {
  const q = (selector) => figure.querySelector(selector);
  const qa = (selector) => [...figure.querySelectorAll(selector)];
  const ctx = gsap.context(() => {}, figure);
  const STILL = 10.9; // s: P-4, shown with reduced motion
  // The window as the design system (P-1), the app (P-2), the app aside
  // (P-3), and the badge's place (where it opens back from).
  const PANEL = { "--x": 143, "--y": 56, "--w": 383, "--h": 309, "--r": 20 };
  const APP = { "--x": 267, "--y": 46, "--w": 160, "--h": 327, "--r": 12 };
  const BADGE = { "--x": 249, "--y": 188, "--w": 172, "--h": 44, "--r": 16 };

  let timeline;
  ctx.add(() => {
    const em = () => figure.getBoundingClientRect().width / 670;
    const F = figure.getBoundingClientRect();
    const centre = (el) => {
      const r = el.getBoundingClientRect();
      return { x: (r.left + r.width / 2 - F.left) / em(), y: (r.top + r.height / 2 - F.top) / em() };
    };
    const box = q(".sy-box");
    const panel = q(".sy-panel");
    const app = q(".sy-app");
    const parts = qa(".sy-brand, .sy-app-rule, .sy-search, .sy-nav > *, .sy-foot");
    const mark = q(".sy-pill--device");
    const phone = centre(q('[data-device="mobile"]'));
    const apply = centre(q(".sy-apply"));
    const masks = qa("[data-link-mask]");
    const dots = qa(".sy-dot");
    const tokens = qa(".sy-token");
    const dev = q(".sy-dev");
    const lines = qa(".sy-line");
    const codeFoot = q(".sy-code__foot");
    const badge = q(".sy-badge");
    const check = badge.querySelector("img");
    const cursor = q(".tm-cursor");
    const glow = q(".sy-glow");
    gsap.set(cursor, { transformOrigin: "36.6% 27.2%" });
    gsap.set([badge, check, dev, ...tokens, ...dots], { transformOrigin: "50% 50%" });
    // Each line is drawn along by its mask (one dash along it).
    masks.forEach((path) => {
      const length = path.getTotalLength();
      path.dataset.length = length;
      path.setAttribute("stroke-dasharray", `${length} ${length}`);
    });
    const lengthOf = (_, path) => +path.dataset.length;

    timeline = gsap.timeline({ paused: true, repeat: -1, defaults: { ease: "power2.inOut", lazy: false, immediateRender: false } });
    const glide = (at, x, y, duration = 0.8) =>
      timeline
        .to(cursor, { "--cx": x, duration, ease: "power2.inOut" }, at)
        .to(cursor, { "--cy": y, duration, ease: "sine.inOut" }, at);
    const click = (el, at) =>
      timeline
        .to(el, { scale: 0.85, duration: 0.12, ease: "sine.out" }, at)
        .to(el, { scale: 1, duration: 0.3, ease: "power2.out" }, at + 0.12);
    // Every round starts from P-1 (a tween of its own each).
    const start = (targets, vars) => timeline.fromTo(targets, vars, { ...vars, duration: 0.01 }, 0);
    start(box, { ...PANEL, opacity: 1, backgroundColor: "#000000", "--ring": 1 });
    start(panel, { opacity: 1 });
    start(app, { opacity: 0 });
    start(parts, { opacity: 0, y: 0 });
    start(mark, { "--dm": 0 });
    start(masks, { attr: { "stroke-dashoffset": lengthOf } });
    start(dots, { opacity: 0, scale: 1 });
    start(tokens, { opacity: 0, scale: 1 });
    start(dev, { opacity: 0, y: 0, scale: 1 });
    start(lines, { "--t": 0 });
    start(codeFoot, { opacity: 0 });
    start(badge, { opacity: 0, scale: 1 });
    start(check, { opacity: 0.35, scale: 1 });
    start(cursor, { autoAlpha: 0, scale: 1, "--cx": 540, "--cy": 400 });
    start(glow, { opacity: 1 });

    // 1. The phone, then Apply (P-1).
    timeline.to(cursor, { autoAlpha: 1, duration: 0.3, ease: "sine.out" }, 0.3);
    glide(0.3, phone.x, phone.y, 0.85);
    click(cursor, 1.15);
    timeline.to(mark, { "--dm": 44, duration: 0.4, ease: "power2.inOut" }, 1.2);
    glide(1.55, apply.x, apply.y, 0.7);
    click(cursor, 2.3);
    // 2. The panel turns into the app, built top to bottom; its parts tied to
    // their tokens (P-2).
    timeline
      .to(cursor, { autoAlpha: 0, duration: 0.3, ease: "sine.in" }, 2.5)
      .to(box, { ...APP, duration: 0.95, ease: "power3.inOut" }, 2.45)
      .to(panel, { opacity: 0, duration: 0.25, ease: "sine.in" }, 2.45)
      .to(app, { opacity: 1, duration: 0.01 }, 2.55)
      // (each to its own strength: Daily tasks and its three at 40%; they
      // come in while the window still changes, so it is never empty)
      .fromTo(parts, { y: 5 }, { opacity: (_, el) => (el.matches(".sy-item--dim") ? 0.4 : 1), y: 0, duration: 0.4, ease: "power2.out", stagger: 0.05 }, 2.6)
      .to(masks, { attr: { "stroke-dashoffset": 0 }, duration: 0.7, ease: "power2.inOut", stagger: 0.15 }, 3.95)
      .fromTo(dots, { scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2)", stagger: 0.1 }, 3.95)
      .fromTo(tokens, { scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(1.6)", stagger: 0.25 }, 4.35)
      // 3. Aside and dim; the developer's view, its code typed in (P-3).
      .to([...tokens, ...dots], { opacity: 0, duration: 0.4, ease: "sine.in" }, 5.6)
      .to(masks, { attr: { "stroke-dashoffset": lengthOf }, duration: 0.4, ease: "sine.in" }, 5.6)
      .to(box, { "--x": 169, backgroundColor: "#0f0f0f", "--ring": 0, duration: 0.8, ease: "power2.inOut" }, 5.7)
      .to(app, { opacity: 0.2, duration: 0.8, ease: "sine.inOut" }, 5.7)
      .fromTo(dev, { y: 14, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "power2.out" }, 5.95)
      .to(lines, { "--t": 1, duration: 0.22, ease: "power1.out", stagger: 0.16 }, 6.5)
      .to(codeFoot, { opacity: 1, duration: 0.3, ease: "sine.out" }, 8.15)
      // 4. Ready to develop, clicked (P-4).
      .to(dev, { opacity: 0, scale: 0.7, duration: 0.5, ease: "power2.in" }, 9.0)
      .to(box, { opacity: 0, duration: 0.45, ease: "sine.in" }, 9.0)
      .to(glow, { opacity: 0, duration: 1, ease: "sine.inOut" }, 9.0)
      .fromTo(badge, { scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.4)" }, 9.35)
      .set(cursor, { "--cx": 520, "--cy": 330 }, 9.35)
      .to(cursor, { autoAlpha: 1, duration: 0.3, ease: "sine.out" }, 9.4);
    glide(9.4, 377, 226, 0.9);
    click(cursor, 10.4);
    timeline
      .to(check, { opacity: 1, duration: 0.2, ease: "sine.out" }, 10.45)
      .fromTo(check, { scale: 1.3 }, { scale: 1, duration: 0.45, ease: "back.out(2)" }, 10.45)
      // 5. Back into the design system, and again.
      .to(cursor, { autoAlpha: 0, duration: 0.3, ease: "sine.in" }, 11.5)
      .to(badge, { opacity: 0, scale: 0.96, duration: 0.3, ease: "sine.in" }, 11.5)
      .set(panel, { opacity: 0 }, 11.5)
      .set(app, { opacity: 0 }, 11.5)
      .set(parts, { opacity: 0 }, 11.5)
      .set(mark, { "--dm": 0 }, 11.5)
      .set([dev, codeFoot], { opacity: 0 }, 11.5)
      .set(lines, { "--t": 0 }, 11.5)
      .set(box, { ...BADGE, backgroundColor: "#000000", "--ring": 1 }, 11.5)
      .to(box, { opacity: 1, duration: 0.2, ease: "sine.out" }, 11.55)
      .to(box, { ...PANEL, duration: 0.9, ease: "power3.inOut" }, 11.55)
      .to(panel, { opacity: 1, duration: 0.4, ease: "sine.out" }, 11.8)
      .to(glow, { opacity: 1, duration: 1, ease: "sine.inOut" }, 11.6)
      .set({}, {}, 13.2);

    // Shown at its first step at once (as the other stories).
    timeline.time(0.02).pause(0);
  });

  return {
    loop: true,
    play: () => timeline.restart(),
    resume: () => timeline.play(),
    pause: () => timeline.pause(),
    reset: () => timeline.pause(0),
    finish: () => timeline.pause(STILL),
    revert: () => {
      timeline.kill();
      ctx.revert();
      qa("[data-link-mask]").forEach((path) => ["stroke-dasharray", "stroke-dashoffset"].forEach((name) => path.removeAttribute(name)));
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
