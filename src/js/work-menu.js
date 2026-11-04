import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

// Work mega menu (Figma "Dropdown - Expand" 1596:442; plan:
// docs/implementation/18-work-mega-menu.md). Opens on hover over "Work", on a
// click, or from the keyboard (Enter / Space; Esc closes). It drops in softly
// and its content follows one part after another (not in Figma, approved
// proposal). The featured cards change set every few seconds while it is
// open, and on a click on their dots; they hold while the pointer is over
// them. It closes when the menu bar hides.
// It grows from small to large under "Work" (user; plan:
// docs/implementation/27-work-menu-motion.md), as a popover: its background,
// a layer of its own with the panel's shadow (a clip on the panel cut it
// off), fades in as a small box at the top of the panel under Work and grows
// to the left and down to the whole panel; the content keeps its size and
// shows only inside that shape (it came in outside it, over the page). As the
// box has nearly grown the content comes in as elsewhere on the site: the title
// lines, the categories and the line below rise in their windows (as the
// hero text), the cards open from the bottom while their pictures settle (as
// the Our Work cards). Closing, the content fades and the panel shrinks back
// into the small box, fading out as it ends. (Tried: a pill round Work, and
// a plain drop and fade; user.)
// The small box is the panel at START of its size, against Work (a 100px box
// widening to the whole panel read as a sideways sweep), so it reads as
// growing from that corner; eased out, as it fades in.
const GROW = 0.5; // s, the small box to the whole panel (0.7 felt slow; user)
const SHRINK = 0.3; // s, back into the small box
const START = 0.3; // share of the panel's size the small box has
const IN = 0.9; // s, the content coming in
// The content comes in once the box has nearly grown (from 20% of the growth
// its movement was mostly over behind the box's edge, unseen; user).
const CONTENT_AT = 0.15; // s (0.25 came a little late; user)
const RISE = 200; // % of its height text rises from, as the hero text
const DESCENT = 25; // % of its height its window reaches below it (g, p, y)
const CLOSE_DELAY = 150; // ms, so the pointer can cross small gaps
const EVERY = 4000; // ms per card set

export function initWorkMenu() {
  const item = document.querySelector("[data-work-menu]");
  if (!item) return () => {};

  const trigger = item.querySelector(".site-nav__link");
  const panel = item.querySelector(".work-menu");
  const title = SplitText.create(panel.querySelector(".work-menu__title"), { type: "lines" });
  const texts = [...title.lines, ...panel.querySelectorAll(".work-menu__links li, .work-menu__copy")];
  const dotsBox = panel.querySelector(".work-menu__dots");
  const background = panel.querySelector(".work-menu__bg");
  const content = panel.querySelector(".work-menu__content");
  const sets = [...panel.querySelectorAll(".work-menu__set")];
  const dots = [...panel.querySelectorAll(".work-menu__dot")];
  const featured = panel.querySelector(".work-menu__featured");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const events = new AbortController();
  const on = (target, type, handler) => target.addEventListener(type, handler, { signal: events.signal });

  let open = false;
  let openedAt = 0;
  let closeTimer = 0;
  let animation;

  // Card sets
  let current = 0;
  let timer = 0;
  let held = false;
  const show = (next) => {
    if (next === current) return;
    const from = sets[current];
    const to = sets[next];
    current = next;
    dots.forEach((dot, k) => dot.setAttribute("aria-selected", String(k === next)));
    sets.forEach((set, k) => {
      set.setAttribute("aria-hidden", String(k !== next));
      set.querySelectorAll("a").forEach((link) => (k === next ? link.removeAttribute("tabindex") : link.setAttribute("tabindex", "-1")));
    });
    if (reduceMotion) {
      from.classList.remove("is-active");
      to.classList.add("is-active");
      return;
    }
    gsap.killTweensOf([from, to, ...to.children]);
    gsap.to(from, { autoAlpha: 0, duration: 0.35, ease: "power2.out", onComplete: () => from.classList.remove("is-active") });
    to.classList.add("is-active");
    gsap.set(to, { autoAlpha: 1 });
    gsap.fromTo(to.children, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out", stagger: 0.06 });
  };
  const schedule = () => {
    clearTimeout(timer);
    if (open && !held) timer = setTimeout(() => {
      show((current + 1) % sets.length);
      schedule();
    }, EVERY);
  };
  dots.forEach((dot, k) =>
    on(dot, "click", () => {
      show(k);
      schedule();
    }),
  );
  on(featured, "pointerenter", () => {
    held = true;
    clearTimeout(timer);
  });
  on(featured, "pointerleave", () => {
    held = false;
    schedule();
  });

  // Opening and closing
  // The background's shape: its distances from the panel's edges and its
  // corners, kept here and written out. The small box: the panel at START of
  // its size, at its top, its right edge a little past Work's. The content shows only inside that
  // shape: the same shape as a clip, from the content's box, inside the
  // panel's padding.
  const clip = { top: 0, right: 0, bottom: 0, left: 0, radius: 8 };
  const whole = { top: 0, right: 0, bottom: 0, left: 0, radius: 8 };
  const small = () => {
    const box = panel.getBoundingClientRect();
    const work = trigger.getBoundingClientRect();
    const right = Math.max(0, box.right - work.right - 24);
    return {
      top: 0,
      right,
      bottom: box.height * (1 - START),
      left: Math.max(0, box.width - right - box.width * START),
      radius: 8,
    };
  };
  let shaped = false; // the background is not its CSS shape (the whole panel)
  const writeClip = () => {
    shaped = true;
    const pad = parseFloat(getComputedStyle(panel).paddingTop);
    background.style.inset = `${clip.top}px ${clip.right}px ${clip.bottom}px ${clip.left}px`;
    background.style.borderRadius = `${clip.radius}px`;
    content.style.clipPath = `inset(${clip.top - pad}px ${clip.right - pad}px ${clip.bottom - pad}px ${clip.left - pad}px round ${clip.radius}px)`;
  };
  const unshape = () => {
    shaped = false;
    background.style.inset = "";
    background.style.borderRadius = "";
    content.style.clipPath = "";
  };
  const clipTo = (to, vars) => gsap.to(clip, { ...to, ...vars, onUpdate: writeClip });
  const setOpen = (next) => {
    clearTimeout(closeTimer);
    if (next === open) return;
    open = next;
    openedAt = window.scrollY;
    trigger.setAttribute("aria-expanded", String(open));
    item.classList.toggle("is-open", open);
    // is-shown lasts until the panel has faded out: the bar is drawn
    // normally while it shows (_header.scss).
    const hidden = () => {
      if (!open) item.classList.remove("is-shown");
    };
    if (open) item.classList.add("is-shown");
    animation?.kill();
    if (reduceMotion) {
      gsap.set(panel, { autoAlpha: open ? 1 : 0 });
      hidden();
    } else if (open) {
      const cards = [...sets[current].querySelectorAll(".work-menu__card")];
      const pictures = cards.map((card) => card.querySelector("img"));
      const badges = cards.map((card) => card.querySelector(".work-menu__badge"));
      // From the small box, fading in, or from where a closing left it.
      if (getComputedStyle(panel).visibility === "hidden") {
        Object.assign(clip, small());
        gsap.set(panel, { autoAlpha: 1 });
        gsap.set(background, { opacity: 0 });
      } else if (!shaped) Object.assign(clip, whole);
      writeClip();
      animation = gsap
        .timeline({ onComplete: unshape })
        .add(clipTo(whole, { duration: GROW, ease: "power3.out" }))
        .to(background, { opacity: 1, duration: 0.15, ease: "power1.out" }, 0)
        .fromTo(
          texts,
          { autoAlpha: 1, yPercent: RISE, clipPath: `inset(-20% -20% ${RISE - DESCENT}% -20%)` },
          { yPercent: 0, clipPath: `inset(-20% -20% ${-DESCENT}% -20%)`, duration: IN, ease: "power3.out", stagger: 0.05 },
          CONTENT_AT,
        )
        .fromTo(
          cards,
          { autoAlpha: 1, clipPath: "inset(100% 0% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: IN, ease: "power3.out", stagger: 0.08 },
          CONTENT_AT,
        )
        .fromTo(pictures, { scale: 1.15 }, { scale: 1, duration: IN + 0.2, ease: "power3.out", stagger: 0.08 }, "<")
        .fromTo([...badges, dotsBox], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: "power1.out", stagger: 0.04 }, "<+=0.3");
    } else {
      // The content fades, and the panel shrinks back into the small box,
      // fading out as it ends (it vanished as a small box).
      if (!shaped) Object.assign(clip, whole);
      animation = gsap
        .timeline({
          onComplete: () => {
            gsap.set(panel, { autoAlpha: 0 });
            unshape();
            hidden();
          },
        })
        .to([...texts, ...sets.flatMap((set) => [...set.children]), dotsBox], { autoAlpha: 0, duration: 0.12, ease: "power1.in" })
        .add(clipTo(small(), { duration: SHRINK, ease: "power3.in" }), 0)
        .to(background, { opacity: 0, duration: 0.12, ease: "power1.in" }, SHRINK - 0.12);
    }
    schedule();
  };
  const closeSoon = () => {
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => setOpen(false), CLOSE_DELAY);
  };

  on(item, "pointerenter", (event) => {
    if (event.pointerType === "mouse") setOpen(true);
  });
  on(item, "pointerleave", (event) => {
    if (event.pointerType === "mouse") closeSoon();
  });
  on(trigger, "click", (event) => {
    event.preventDefault();
    setOpen(!open);
  });
  on(trigger, "keydown", (event) => {
    if (event.key === " ") {
      event.preventDefault();
      setOpen(!open);
    }
  });
  on(document, "keydown", (event) => {
    if (event.key === "Escape" && open) {
      setOpen(false);
      trigger.focus();
    }
  });
  on(document, "pointerdown", (event) => {
    if (open && !item.contains(event.target)) setOpen(false);
  });
  on(item, "focusout", (event) => {
    if (event.relatedTarget && !item.contains(event.relatedTarget)) setOpen(false);
  });

  // Closed when the page is scrolled on.
  on(window, "scroll", () => {
    if (open && Math.abs(window.scrollY - openedAt) > 40) setOpen(false);
  });

  return () => {
    events.abort();
    clearTimeout(timer);
    clearTimeout(closeTimer);
    animation?.kill();
    item.classList.remove("is-open", "is-shown");
    title.revert();
    unshape();
    gsap.set(background, { clearProps: "opacity" });
    const cards = sets.flatMap((set) => [...set.children]);
    gsap.set([panel, ...texts, dotsBox, ...sets, ...cards, ...cards.flatMap((card) => [...card.children])], { clearProps: "all" });
  };
}
