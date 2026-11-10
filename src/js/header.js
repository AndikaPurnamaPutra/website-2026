import { ScrollTrigger } from "gsap/ScrollTrigger";

// Fixed header (Figma 1611:6986): always in view, transparent and inverting
// what lies behind it, as on leoparpeix.com (user decision; it used to hide on
// scroll down and over the dark sections). While the Work menu is open it is
// drawn normally, with white text (proposal, approved) while its middle line
// is over a section with data-header-theme="dark". It slides away over the
// pinned Services and Motto (data-header-hide) while they are held, in both
// directions, as it did before (user decision); not while a link in it has
// keyboard focus or the Work menu is open. While the menu shows, the white
// text follows what is really behind the bar (below).

export function initHeader() {
  const header = document.querySelector("[data-header]");
  if (!header) return () => {};

  // A pinned section is measured through its pin spacer so the dark version
  // lasts for the whole pinned scroll.
  const middle = () => `top ${header.offsetHeight / 2}px`;
  const middleEnd = () => `bottom ${header.offsetHeight / 2}px`;
  // One set of reasons per class, shared by every trigger that sets it.
  const reasons = {};
  const mark = (className, reason, on) => {
    const active = (reasons[className] ??= new Set());
    if (on) active.add(reason);
    else active.delete(reason);
    if (className === "is-dark") refreshDark();
    else header.classList.toggle(className, active.size > 0);
  };

  // White or dark text while the Work menu shows (the bar is drawn normally
  // then, not inverted): by what is really behind it, read under the bar's
  // middle at its logo, its middle and its links. The dark sections alone
  // missed the page theme's dark (homepage: dark before Services' top came
  // under the bar, light again while it was still there; user: the links and
  // the logo vanished). Over a picture or a video, which cannot be read, the
  // dark sections decide, as before.
  const workItem = header.querySelector(".site-nav__item--work");
  const behind = () => {
    const y = header.getBoundingClientRect().top + header.offsetHeight / 2;
    const levels = [];
    for (const x of [0.08, 0.5, 0.9].map((f) => window.innerWidth * f)) {
      for (const el of document.elementsFromPoint(x, y)) {
        if (header.contains(el)) continue;
        if (/^(IMG|VIDEO|CANVAS|PICTURE)$/.test(el.tagName)) return null;
        const rgba = getComputedStyle(el).backgroundColor.match(/[\d.]+/g);
        if (rgba && (rgba.length < 4 || +rgba[3] > 0.5)) {
          levels.push(0.2126 * rgba[0] + 0.7152 * rgba[1] + 0.0722 * rgba[2]);
          break;
        }
      }
    }
    return levels.length ? levels.reduce((a, b) => a + b) / levels.length : null;
  };
  const refreshDark = () => {
    const level = workItem?.classList.contains("is-shown") ? behind() : null;
    const dark = level === null ? (reasons["is-dark"]?.size ?? 0) > 0 : level < 128;
    header.classList.toggle("is-dark", dark);
  };
  // As the menu shows, as the page moves under it while it shows, and once
  // the page theme has eased to its new colours (0.35s; read at its start,
  // the background was still the old one).
  let settle = 0;
  const check = () => {
    if (!workItem?.classList.contains("is-shown")) return;
    refreshDark();
    clearTimeout(settle);
    settle = setTimeout(refreshDark, 400);
  };
  const watch = new MutationObserver(refreshDark);
  if (workItem) watch.observe(workItem, { attributes: true, attributeFilter: ["class"] });
  const themeWatch = new MutationObserver(check);
  themeWatch.observe(document.body, { attributes: true, attributeFilter: ["class"] });
  const onScroll = check;
  window.addEventListener("scroll", onScroll, { passive: true });
  const over = (selector, className, end = middleEnd) => {
    return [...document.querySelectorAll(selector)].map((section) => {
      const area = section.parentElement?.classList.contains("pin-spacer") ? section.parentElement : section;
      return ScrollTrigger.create({
        trigger: area,
        start: middle,
        end,
        onToggle: (self) => mark(className, section, self.isActive),
      });
    });
  };
  // Hidden until the section lets go of the screen (its bottom at the
  // screen's bottom): Motto runs on behind the footer to the end of the page,
  // and the header would not have come back there.
  const triggers = [...over("[data-header-theme='dark']", "is-dark"), ...over("[data-header-hide]", "is-hidden", "bottom bottom")];

  // Also hidden over the footer (user decision, 10 Nov 2026: its logo right
  // above the footer's own read as doubled, and the footer has the whole
  // navigation): from when the footer's edge (the bottom of the content
  // above it, which it comes up from behind) passes the middle of the
  // screen, to the end of the page; back on the way up.
  const footer = document.querySelector(".site-footer");
  const above = footer?.previousElementSibling;
  if (above) {
    triggers.push(
      ScrollTrigger.create({
        trigger: above,
        start: "bottom 50%",
        end: "max",
        // Measured after the pins above (Services, Motto), which lengthen
        // the page; measured before them it began far too early.
        refreshPriority: -1,
        // By progress: at the very end of the page the trigger counts as
        // left, and the header came back there.
        onUpdate: (self) => mark("is-hidden", footer, self.progress > 0),
        onRefresh: (self) => mark("is-hidden", footer, self.progress > 0),
      }),
    );
  }

  return () => {
    watch.disconnect();
    themeWatch.disconnect();
    clearTimeout(settle);
    window.removeEventListener("scroll", onScroll);
    triggers.forEach((trigger) => trigger.kill());
    header.classList.remove("is-dark", "is-hidden");
  };
}
