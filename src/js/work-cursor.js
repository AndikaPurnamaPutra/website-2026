import gsap from "gsap";

// Our Work cards (user): over a card a "View Project" label follows the
// pointer, beside it at the bottom right (the cursor stays), in the showreel
// button's glass style and glide (src/js/hero-showreel.js); it grows in as
// the pointer comes onto a card and shrinks away as it leaves. Crossing the
// gap to the next card it stays (it went and came back, a flicker; user).
// Checked again while the page scrolls under a still pointer. Mouse only, not
// with reduced motion.
const FOLLOW = 0.6; // s, as the showreel button
const OFFSET = 18; // px from the pointer, right and down
const LINGER = 80; // ms off a card before it goes (150 and a slow fade felt late; user)

export function initWorkCursor() {
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!fine || reduceMotion || !document.querySelector(".work-card__link")) return () => {};

  const label = document.createElement("span");
  label.className = "work-cursor glass-button";
  label.setAttribute("aria-hidden", "true");
  label.innerHTML = "<span>View Project</span>";
  document.body.append(label);

  gsap.set(label, { autoAlpha: 0, scale: 0.6, transformOrigin: "0% 0%" });
  const toX = gsap.quickTo(label, "x", { duration: FOLLOW, ease: "power3.out" });
  const toY = gsap.quickTo(label, "y", { duration: FOLLOW, ease: "power3.out" });

  const pointer = { x: -1, y: -1 };
  let shown = false;
  let hideTimer = 0;
  const show = (on) => {
    if (on) {
      clearTimeout(hideTimer);
      hideTimer = 0;
    }
    if (on === shown) return;
    if (!on) {
      // Not at once: the pointer may be crossing to the next card. Started
      // once, not again on every scroll or move off the cards (restarted, it
      // stayed while the page scrolled on past the section; user).
      if (!hideTimer) {
        hideTimer = setTimeout(() => {
          hideTimer = 0;
          fade(false);
        }, LINGER);
      }
      return;
    }
    fade(true);
  };
  const fade = (on) => {
    shown = on;
    // Shown from where the pointer is, not gliding over from where it left.
    if (on) {
      toX(pointer.x + OFFSET, pointer.x + OFFSET);
      toY(pointer.y + OFFSET, pointer.y + OFFSET);
    }
    gsap.to(label, {
      autoAlpha: on ? 1 : 0,
      scale: on ? 1 : 0.6,
      duration: on ? 0.35 : 0.2,
      ease: on ? "power3.out" : "power2.out",
      overwrite: "auto",
    });
  };
  // The label takes no pointer, so the card below it is found.
  const check = () => {
    if (pointer.x < 0) return;
    show(Boolean(document.elementFromPoint(pointer.x, pointer.y)?.closest(".work-card__link")));
  };

  const events = new AbortController();
  const on = (target, type, handler) => target.addEventListener(type, handler, { passive: true, signal: events.signal });
  on(window, "pointermove", (event) => {
    if (event.pointerType !== "mouse") return;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    toX(pointer.x + OFFSET);
    toY(pointer.y + OFFSET);
    check();
  });
  on(window, "scroll", check);
  on(document.documentElement, "pointerleave", () => show(false));

  return () => {
    events.abort();
    clearTimeout(hideTimer);
    gsap.killTweensOf(label);
    label.remove();
  };
}
