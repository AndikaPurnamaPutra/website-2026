import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Statement text: grey that turns black with the scroll, flowing from left to
// right through the lines like ink with a soft edge (reference from the user:
// drone.riotters.com; same gradient technique as the Milestone sentence, but
// tied to the scroll and back to grey when scrolling up). The icon and the
// folder keep their colours. Without JS or with reduced motion the text stays
// black.
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
    pieces.forEach((piece) => {
      piece.classList.remove("is-inked");
      piece.style.backgroundPositionX = "";
    });
  };
}
