import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

// About: Team (docs/implementation/30-about-motion.md), in the site's words:
// as it comes up the screen, the lead's lines rise as the hero text; then
// the rows, a few at a time as they come in: each row's line draws from the
// left (as Milestone's rows) and its name and role rise. Once, as the other
// entrances. Nothing moves with reduced motion.
const RISE = 200; // % of its height text rises from
const DESCENT = 25; // % of its height its window reaches below it (g, p, y)

export function initAboutTeam() {
  const section = document.querySelector(".about-team");
  if (!section || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  const rows = [...section.querySelectorAll(".about-team__member")];
  const texts = rows.flatMap((row) => [...row.querySelectorAll("span")]);
  const hidden = { yPercent: RISE, clipPath: `inset(-20% -20% ${RISE - DESCENT}% -20%)` };
  const shown = { yPercent: 0, clipPath: `inset(-20% -20% ${-DESCENT}% -20%)` };
  gsap.set(rows, { "--line": 0 });
  gsap.set(texts, hidden);

  const triggers = [];
  let lead = null;
  let cancelled = false;
  // The lead split once the web fonts are in, so its lines break as set.
  (document.fonts?.ready ?? Promise.resolve()).then(() => {
    if (cancelled) return;
    lead = SplitText.create(section.querySelector(".about-team__lead"), { type: "lines", aria: "none" });
    const leadIn = gsap.fromTo(lead.lines, hidden, { ...shown, duration: 1.15, ease: "power3.out", stagger: 0.09, paused: true });
    triggers.push(
      ScrollTrigger.create({
        trigger: lead.lines[0],
        start: "top 90%",
        once: true,
        onEnter: () => leadIn.play(),
        onRefresh: (self) => self.progress > 0 && leadIn.progress(1),
      }),
    );
  });

  triggers.push(
    ...ScrollTrigger.batch(rows, {
      start: "top 92%",
      once: true,
      onEnter: (batch) => {
        gsap.to(batch, { "--line": 1, duration: 1.2, ease: "power3.inOut", stagger: 0.06 });
        gsap.to(
          batch.flatMap((row) => [...row.querySelectorAll("span")]),
          { ...shown, duration: 1, ease: "power3.out", stagger: 0.03, delay: 0.1 },
        );
      },
    }),
  );

  const stopPreview = initPreview(section, rows);

  return () => {
    stopPreview();
    cancelled = true;
    triggers.forEach((trigger) => trigger.kill());
    gsap.killTweensOf([...rows, ...texts]);
    gsap.set(rows, { clearProps: "--line" });
    gsap.set(texts, { clearProps: "transform,clipPath" });
    lead?.revert();
  };
}

// Over a row, a photo shows beside the cursor and follows it, changing as the
// cursor moves from row to row (user's pick; set in the empty space right of
// the list instead, it was dropped: user).
// Placeholders until each member has a photo (user): the About photos in
// turn. It opens from the bottom as it comes and closes as the cursor leaves
// the list; it glides as the Our Work label (src/js/work-cursor.js). Mouse
// only (the reduced-motion check is above).
const PLACEHOLDERS = ["team", "gallery-1", "gallery-2", "gallery-3", "gallery-4", "gallery-5"];
const FOLLOW = 0.6; // s, as the Our Work label
const OFFSET = 32; // px right of the cursor
const LINGER = 80; // ms off the list before it goes, as the Our Work label

function initPreview(section, rows) {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return () => {};
  const list = section.querySelector(".about-team__list");
  const preview = document.createElement("div");
  preview.className = "about-team__preview";
  preview.setAttribute("aria-hidden", "true");
  const pictures = PLACEHOLDERS.map((name) => {
    const picture = document.createElement("img");
    picture.src = `assets/images/about/${name}.webp`;
    picture.alt = "";
    picture.decoding = "async";
    picture.loading = "lazy";
    preview.append(picture);
    return picture;
  });
  document.body.append(preview);

  gsap.set(preview, { clipPath: "inset(100% 0% 0% 0%)", yPercent: -50 });
  const toX = gsap.quickTo(preview, "x", { duration: FOLLOW, ease: "power3.out" });
  const toY = gsap.quickTo(preview, "y", { duration: FOLLOW, ease: "power3.out" });
  let shown = false;
  let current = -1;
  let hideTimer = 0;

  const show = (on) => {
    if (on === shown) return;
    shown = on;
    gsap.to(preview, {
      clipPath: on ? "inset(0% 0% 0% 0%)" : "inset(0% 0% 100% 0%)",
      duration: on ? 0.6 : 0.35,
      ease: on ? "power3.out" : "power2.in",
      overwrite: "auto",
      onComplete: () => !on && gsap.set(preview, { clipPath: "inset(100% 0% 0% 0%)" }),
    });
  };
  const pick = (i) => {
    if (i === current) return;
    current = i;
    const k = i % pictures.length;
    pictures.forEach((picture, j) => picture.classList.toggle("is-shown", j === k));
    // The new photo settles from a little larger.
    gsap.fromTo(pictures[k], { scale: 1.12 }, { scale: 1, duration: 0.6, ease: "power3.out", overwrite: true });
  };

  const events = new AbortController();
  const on = (target, type, handler) => target.addEventListener(type, handler, { passive: true, signal: events.signal });
  on(window, "pointermove", (event) => {
    if (event.pointerType !== "mouse") return;
    const x = event.clientX + OFFSET;
    const y = event.clientY;
    if (!shown) {
      toX(x, x);
      toY(y, y);
    }
    toX(x);
    toY(y);
    const row = event.target.closest?.(".about-team__member");
    if (row && list.contains(row)) {
      clearTimeout(hideTimer);
      hideTimer = 0;
      pick(rows.indexOf(row));
      show(true);
    } else if (shown && !hideTimer && !list.contains(event.target)) {
      hideTimer = setTimeout(() => {
        hideTimer = 0;
        current = -1;
        show(false);
      }, LINGER);
    }
  });
  on(list, "pointerleave", () => {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      hideTimer = 0;
      current = -1;
      show(false);
    }, LINGER);
  });

  return () => {
    events.abort();
    clearTimeout(hideTimer);
    gsap.killTweensOf([preview, ...pictures]);
    preview.remove();
  };
}
