import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

// Statement (user: after the hero it felt empty and plain; reference
// revelatio.studio, whose list of cities is held while its words light up):
// - the eyebrow rises into view as the hero text does (src/js/hero-intro.js),
//   as it comes up the screen;
// - once the text is centred, the section is held there for LENGTH screens
//   of scrolling, and its words light up one by one with the scroll, grey to
//   black (each eases over 0.35s, src/scss/sections/_statement.scss);
// - the blue icon and the folder come to life as the word before each lights
//   up, each on its own clock (icon: ring drawn, dot pops up, the two split
//   apart; folder: pocket opens, folder rises out with a small bounce);
// - once every word is lit, the "Schedule a call" button rises as the hero
//   text, then the section moves on.
// All of it goes back when scrolled back up. Without JS or with reduced
// motion the text stays black, and the icon, folder and button as in Figma.
const RISE = 200; // % of its height the eyebrow and the button rise from
// % of its height their window reaches below them, so descenders (g, p, y)
// are not cut (user report).
const DESCENT = 25;
const LENGTH = 1.2; // screens of scrolling the section is held for
const WORDS = 0.8; // share of the hold over which the words light up
const BUTTON_AT = WORDS; // the button rises as the last word lights up (user)

export function initStatementInk() {
  const text = document.querySelector(".statement__text");
  if (!text || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};
  const statement = text.closest(".statement");

  // The text pieces in reading order: the text parts of lines that also hold
  // the icon or the folder, or the whole text of a line, put in a span first
  // (a line is a flex box: its words split straight into it lost the spaces
  // between them); split into words.
  const wrapped = [];
  const pieces = [...text.querySelectorAll(".statement__line")].flatMap((line) => {
    const parts = [...line.querySelectorAll(":scope > span:not(.statement__folder)")];
    if (parts.length) return parts;
    const inner = document.createElement("span");
    inner.append(...line.childNodes);
    line.append(inner);
    wrapped.push(inner);
    return [inner];
  });
  const splits = pieces.map((piece) => SplitText.create(piece, { type: "words", wordsClass: "statement__word" }));
  const words = splits.flatMap((split) => split.words);
  text.classList.add("is-lighting");

  // Rising into a window of their own: a clip whose bottom edge comes up as
  // much as the element does, so it stays at the element's own place and no
  // wrapper is needed (the button is shared with Motto). 1s, power3.out, as
  // the hero text.
  const riseOf = (el) =>
    el &&
    gsap.fromTo(
      el,
      { yPercent: RISE, clipPath: `inset(-20% -20% ${RISE - DESCENT}% -20%)` },
      { yPercent: 0, clipPath: `inset(-20% -20% ${-DESCENT}% -20%)`, duration: 1, ease: "power3.out", paused: true },
    );
  const eyebrow = statement.querySelector(".statement__eyebrow");
  const eyebrowRise = riseOf(eyebrow);
  const eyebrowTrigger =
    eyebrowRise &&
    ScrollTrigger.create({
      trigger: eyebrow,
      start: "top 85%",
      onEnter: () => eyebrowRise.play(),
      onLeaveBack: () => eyebrowRise.reverse(),
      // Opened or reloaded further down: in place at once.
      onRefresh: (self) => eyebrowRise.progress(self.progress > 0 ? 1 : 0).pause(),
    });
  const button = statement.querySelector(".cta__button");
  const buttonRise = riseOf(button);

  // The icon and the folder, each cued by the last word before it.
  const cued = [
    [text.querySelector(".statement__icon"), createIcon],
    [text.querySelector(".statement__folder"), createFolder],
  ].flatMap(([el, create]) => {
    const piece = el && create(el);
    if (!piece) return [];
    const before = splits[pieces.indexOf(el.previousElementSibling)];
    return [{ piece, after: before ? words.indexOf(before.words.at(-1)) + 1 : 0, on: false }];
  });
  let buttonOn = false;

  // Where the hold is: words lit, the icon and folder cued, the button.
  // `instant` places them at once (a refresh, or a reload further down).
  const place = (progress, instant) => {
    const lit = Math.round(Math.min(1, progress / WORDS) * words.length);
    words.forEach((word, i) => word.classList.toggle("is-lit", i < lit));
    cued.forEach((item) => {
      const on = lit >= item.after;
      if (instant) item.piece.progress(on ? 1 : 0);
      else if (on !== item.on) on ? item.piece.play() : item.piece.reverse();
      item.on = on;
    });
    const on = progress >= BUTTON_AT;
    if (buttonRise) {
      if (instant) buttonRise.progress(on ? 1 : 0).pause();
      else if (on !== buttonOn) on ? buttonRise.play() : buttonRise.reverse();
    }
    buttonOn = on;
  };

  // Held from the text centred on the screen.
  const hold = ScrollTrigger.create({
    trigger: text,
    start: "center center",
    end: () => `+=${LENGTH * window.innerHeight}`,
    pin: statement,
    onUpdate: (self) => place(self.progress, false),
    onRefresh: (self) => place(self.progress, true),
  });

  return () => {
    hold.kill();
    eyebrowTrigger?.kill();
    [eyebrowRise, buttonRise].forEach((rise) => rise?.kill());
    gsap.set([eyebrow, button].filter(Boolean), { clearProps: "transform,clipPath" });
    cued.forEach(({ piece }) => piece.revert());
    text.classList.remove("is-lighting");
    splits.forEach((split) => split.revert());
    wrapped.forEach((inner) => inner.replaceWith(...inner.childNodes));
  };
}

// The icon's timeline (Figma 1523:3270): ring centred at (21, 31), dot at
// (45, 21); together they start in the middle of the box, (33, 26).

function createIcon(svg) {
  if (!svg) return null;
  const ring = svg.querySelector(".statement__icon-ring");
  const ringPath = ring.querySelector("path");
  const dot = svg.querySelector(".statement__icon-dot");
  const star = svg.querySelector(".statement__icon-star");
  const length = ringPath.getTotalLength();
  ringPath.style.strokeDasharray = length;

  // Offset of each part from the middle once apart (its Figma place).
  const parts = [
    { el: ring, x: -12, y: 5, extra: () => "" },
    // The dot also grows from its own centre (45, 21).
    { el: dot, x: 12, y: -5, extra: () => ` translate(45 21) scale(${state.pop}) translate(-45 -21)` },
  ];
  const state = { draw: 0, pop: 0, apart: 0 };
  const apply = () => {
    ringPath.style.strokeDashoffset = length * (1 - state.draw);
    // Apart in a straight line, no turning (user decision).
    parts.forEach((part) => {
      const x = part.x * state.apart;
      const y = part.y * state.apart;
      // SVG transforms set directly: GSAP's svgOrigin shifts x/y to keep
      // the element in place, which added up over the frames.
      part.el.setAttribute("transform", `translate(${x - part.x} ${y - part.y})${part.extra()}`);
    });
    star.setAttribute("transform", `rotate(${-90 * (1 - state.pop)} 44.6 22.5)`);
  };
  apply();

  const timeline = gsap.timeline({ paused: true, onUpdate: apply });
  timeline
    // About 1.9s in all (2.7s felt a little long; user).
    .to(state, { draw: 1, duration: 0.8, ease: "power2.inOut" }, 0)
    .to(state, { pop: 1, duration: 0.5, ease: "back.out(1.4)" }, 0.6)
    .to(state, { apart: 1, duration: 0.8, ease: "power3.inOut" }, 1.1);

  return {
    play: () => timeline.play(),
    reverse: () => timeline.reverse(),
    progress: (value) => {
      timeline.pause().progress(value);
      apply();
    },
    revert: () => {
      timeline.kill();
      [ring, dot, star].forEach((el) => el.removeAttribute("transform"));
      ringPath.style.strokeDasharray = "";
      ringPath.style.strokeDashoffset = "";
    },
  };
}

// The folder's timeline (Figma 1523:3275, "in a pocket": the pocket holds
// the lower part of the folder, the top crop shows the rest above it).
function createFolder(folder) {
  const pocket = folder.querySelector(".statement__folder-pocket");
  const top = folder.querySelector(".statement__folder-crop--top");
  const images = folder.querySelectorAll(".statement__folder-crop img");

  // While it rises, the top crop is cut at the pocket's opening (56 of its
  // 70px), so the folder comes out of the pocket rather than over it.
  const timeline = gsap.timeline({ paused: true });
  timeline
    .fromTo(
      pocket,
      { scaleX: 0.3, autoAlpha: 0 },
      { scaleX: 1, autoAlpha: 1, duration: 0.5, ease: "power3.out", transformOrigin: "50% 50%" },
      0,
    )
    // 55% of the 120px image: its top (6px above the crop) starts below the
    // pocket's opening, so nothing shows before it rises.
    // Paced like the icon: about 1.3s in all (1.75s felt a little long; user).
    .fromTo(images, { yPercent: 55 }, { yPercent: 0, duration: 1, ease: "back.out(1.2)" }, 0.3)
    .fromTo(top, { clipPath: "inset(0% 0% 20% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "power2.out" }, 0.3);

  return {
    play: () => timeline.play(),
    reverse: () => timeline.reverse(),
    progress: (value) => timeline.pause().progress(value),
    revert: () => {
      timeline.kill();
      gsap.set([pocket, top, ...images], { clearProps: "all" });
    },
  };
}
