import gsap from "gsap";

// Work mega menu (Figma "Dropdown - Expand" 1596:442; plan:
// docs/implementation/18-work-mega-menu.md). Opens on hover over "Work", on a
// click, or from the keyboard (Enter / Space; Esc closes). It drops in softly
// and its content follows one part after another (not in Figma, approved
// proposal). The featured cards change set every few seconds while it is
// open, and on a click on their dots; they hold while the pointer is over
// them. It closes when the menu bar hides.
const OPEN = 0.3; // s
const CLOSE = 0.2; // s
const CLOSE_DELAY = 150; // ms, so the pointer can cross small gaps
const EVERY = 4000; // ms per card set

export function initWorkMenu() {
  const item = document.querySelector("[data-work-menu]");
  if (!item) return () => {};

  const trigger = item.querySelector(".site-nav__link");
  const panel = item.querySelector(".work-menu");
  const parts = [...panel.querySelectorAll(".work-menu__brand, .work-menu__links li, .work-menu__featured")];
  const sets = [...panel.querySelectorAll(".work-menu__set")];
  const dots = [...panel.querySelectorAll(".work-menu__dot")];
  const featured = panel.querySelector(".work-menu__featured");
  const header = item.closest("[data-header]");
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
  const setOpen = (next) => {
    clearTimeout(closeTimer);
    if (next === open) return;
    open = next;
    openedAt = window.scrollY;
    trigger.setAttribute("aria-expanded", String(open));
    item.classList.toggle("is-open", open);
    animation?.kill();
    if (reduceMotion) {
      gsap.set(panel, { autoAlpha: open ? 1 : 0 });
    } else if (open) {
      animation = gsap
        .timeline()
        .fromTo(panel, { autoAlpha: 0, y: -8 }, { autoAlpha: 1, y: 0, duration: OPEN, ease: "power2.out" })
        .fromTo(parts, { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power3.out", stagger: 0.05 }, 0.08);
    } else {
      animation = gsap.to(panel, { autoAlpha: 0, y: -4, duration: CLOSE, ease: "power1.in" });
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

  // Closed when the menu bar hides, and when the page is scrolled on (the bar
  // stays while a header link has keyboard focus).
  const watch = new MutationObserver(() => {
    if (header.classList.contains("is-hidden")) setOpen(false);
  });
  if (header) watch.observe(header, { attributes: true, attributeFilter: ["class"] });
  on(window, "scroll", () => {
    if (open && Math.abs(window.scrollY - openedAt) > 40) setOpen(false);
  });

  return () => {
    events.abort();
    watch.disconnect();
    clearTimeout(timer);
    clearTimeout(closeTimer);
    animation?.kill();
    gsap.set([panel, ...parts, ...sets, ...sets.flatMap((set) => [...set.children])], { clearProps: "all" });
  };
}
