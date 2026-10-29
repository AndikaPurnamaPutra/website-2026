import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Statement text: grey that turns black with the scroll, flowing from left to
// right through the lines like ink with a soft edge (reference from the user:
// drone.riotters.com; same gradient technique as the Milestone sentence, but
// tied to the scroll and back to grey when scrolling up). The icon and the
// folder keep their colours.
// Once the blue icon and the folder are well in view, each comes to life on
// its own clock (user decisions), and plays backwards when scrolled back
// above that point:
// - icon: its ring is drawn, the solid dot pops up on it in the middle, then
//   the two split apart in a straight line to their Figma places;
// - folder: its pocket opens from the middle, then the folder rises out of
//   it and settles with a small bounce.
// Without JS or with reduced motion the text stays black and the icon and
// folder as in Figma.
export function initStatementInk() {
  const text = document.querySelector(".statement__text");
  if (!text || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  // The text pieces in reading order: lines with only text, or the text
  // parts of lines that also hold the icon or the folder.
  const pieces = [...text.querySelectorAll(".statement__line")].flatMap((line) => {
    const parts = [...line.querySelectorAll(":scope > span:not(.statement__folder)")];
    return parts.length ? parts : [line];
  });
  pieces.forEach((piece) => piece.classList.add("is-inked"));

  // Each piece takes its share of the scroll by its width, so the ink moves
  // at an even pace across all the lines.
  let widths = [];
  let total = 1;
  const measure = () => {
    widths = pieces.map((piece) => piece.offsetWidth);
    total = widths.reduce((sum, width) => sum + width, 0) || 1;
  };
  const paint = (progress) => {
    let start = 0;
    pieces.forEach((piece, i) => {
      const local = Math.min(1, Math.max(0, (progress * total - start) / widths[i]));
      piece.style.backgroundPositionX = `${(1 - local) * 100}%`;
      start += widths[i];
    });
  };

  // The icon and the folder start on their own cue, once each is well up in
  // view (its centre at 70% of the screen; the text before it is ink by
  // then): cued by the ink, the icon ran while the text was still near the
  // bottom, and its ring was drawn before anyone looked (user report).
  const pieceTriggers = [
    [text.querySelector(".statement__icon"), createIcon],
    [text.querySelector(".statement__folder"), createFolder],
  ].flatMap(([el, create]) => {
    const piece = el && create(el);
    if (!piece) return [];
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "center 70%",
      onEnter: () => piece.play(),
      onLeaveBack: () => piece.reverse(),
      // Opened or reloaded further down: shown as in Figma at once.
      onRefresh: (self) => piece.progress(self.progress > 0 ? 1 : 0),
    });
    return [{ piece, trigger }];
  });

  // The ink follows the scroll softly (like the reference, where every
  // letter fades on its own), so a fast scroll does not make it jump.
  const ink = { progress: 0 };
  const follow = gsap.quickTo(ink, "progress", {
    duration: 0.6,
    ease: "power3.out",
    onUpdate: () => paint(ink.progress),
  });

  // From the text coming in near the bottom of the screen to the text
  // centred, so it reads all black where it is read (user decision). About
  // 510px of scrolling at 1440 x 900, close to the reference (530px).
  const trigger = ScrollTrigger.create({
    trigger: text,
    start: "top 90%",
    end: "center center",
    onRefresh: (self) => {
      measure();
      ink.progress = self.progress;
      follow(self.progress, self.progress);
      paint(self.progress);
    },
    onUpdate: (self) => follow(self.progress),
  });

  return () => {
    trigger.kill();
    gsap.killTweensOf(ink);
    pieceTriggers.forEach(({ piece, trigger: pieceTrigger }) => {
      pieceTrigger.kill();
      piece.revert();
    });
    pieces.forEach((piece) => {
      piece.classList.remove("is-inked");
      piece.style.backgroundPositionX = "";
    });
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
    // Slower than first made (user decision): about 2.7s in all.
    .to(state, { draw: 1, duration: 1.1, ease: "power2.inOut" }, 0)
    .to(state, { pop: 1, duration: 0.7, ease: "back.out(1.4)" }, 0.85)
    .to(state, { apart: 1, duration: 1.1, ease: "power3.inOut" }, 1.6);

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
      { scaleX: 1, autoAlpha: 1, duration: 0.7, ease: "power3.out", transformOrigin: "50% 50%" },
      0,
    )
    // 55% of the 120px image: its top (6px above the crop) starts below the
    // pocket's opening, so nothing shows before it rises.
    // Paced like the icon (user decision): about 1.75s in all.
    .fromTo(images, { yPercent: 55 }, { yPercent: 0, duration: 1.3, ease: "back.out(1.2)" }, 0.45)
    .fromTo(top, { clipPath: "inset(0% 0% 20% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, ease: "power2.out" }, 0.45);

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
