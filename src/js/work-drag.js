import gsap from "gsap";

// Endless rows dragged by hand ([data-drag]: Work page, Selected Work; plan
// 42). The row's cards are copied around the originals (the copies hidden
// from screen readers and the keyboard) and the row moves by transform,
// wrapping by one set's width, so it never ends. It follows the pointer
// (mouse or finger) a touch behind, eased, and once let go glides on and
// slows down, landing with a card's start at the row's start (user's
// choice: card by card, a quick throw passes several); a trackpad's sideways
// swipe (landing so too once it stops) and the arrow keys (row focused, a
// card) move it too; a vertical swipe or wheel still scrolls the page.
// A drag is not a click. With the mouse, the pointer becomes a glass circle
// "← Drag →" over the row, smaller while pressed (user's choice). Reduced
// motion: no easing or glide, no circle (a grab hand instead).
const THRESHOLD = 6; // px before a press becomes a drag
const FOLLOW = 0.2; // share of the way to the target per frame while dragged
const SETTLE = 0.075; // … while gliding
const THROW = 320; // ms of the release speed the glide carries on
const MAX_SPEED = 6; // px per ms
const NUDGE = 0.2; // share of a card a drag needs to land on the next one
const SWIPE_END = 140; // ms without sideways wheel events that ends a swipe

const ARROW = (d) => `<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="${d}" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export function initWorkDrag() {
  const rows = [...document.querySelectorAll("[data-drag]")];
  if (!rows.length) return () => {};
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const cleanups = rows.map((row) => setUpRow(row, still));
  if (fine && !still) cleanups.push(setUpCursor(rows));
  return () => cleanups.forEach((cleanup) => cleanup());
}

function setUpRow(row, still) {
  const track = row.querySelector("[data-drag-track]");
  const originals = [...track.children];
  const events = new AbortController();
  const on = (target, type, handler, options = {}) => target.addEventListener(type, handler, { ...options, signal: events.signal });
  let width = 0; // one set, gap included
  let stops = []; // where a card's start meets the row's start, in one set
  let before = 0; // sets copied in front of the originals
  let x = 0; // shown position (px the row has moved left)
  let target = 0;
  let ease = SETTLE;
  let running = false;

  const build = () => {
    track.querySelectorAll("[data-drag-copy]").forEach((copy) => copy.remove());
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const first = originals[0];
    const last = originals[originals.length - 1];
    width = last.offsetLeft + last.offsetWidth + gap - first.offsetLeft;
    if (!width) return;
    stops = originals.map((card) => card.offsetLeft - first.offsetLeft);
    // One set in front (its end shows at the left edge, as in Figma), and
    // enough after to fill the row twice over.
    before = 1;
    const after = Math.ceil(row.clientWidth / width) + 1;
    const copy = () =>
      originals.map((card) => {
        const clone = card.cloneNode(true);
        clone.dataset.dragCopy = "";
        clone.setAttribute("aria-hidden", "true");
        clone.inert = true;
        return clone;
      });
    for (let k = 0; k < before; k++) track.prepend(...copy());
    for (let k = 0; k < after; k++) track.append(...copy());
    draw();
  };

  const draw = () => {
    const offset = ((x % width) + width) % width;
    track.style.transform = `translate3d(${-(before * width + offset)}px, 0, 0)`;
  };

  const tick = (_, delta) => {
    const step = still ? 1 : 1 - (1 - ease) ** (delta / 16.7);
    x += (target - x) * step;
    if (Math.abs(target - x) < 0.1) {
      x = target;
      stop();
    }
    draw();
  };
  const start = () => {
    if (running) return;
    running = true;
    gsap.ticker.add(tick);
  };
  const stop = () => {
    running = false;
    gsap.ticker.remove(tick);
  };
  const moveTo = (value, how = SETTLE) => {
    target = value;
    ease = how;
    start();
  };
  // The card stops around a position, in all the sets (it never ends).
  const stopsNear = (value) => {
    const set = Math.floor(value / width);
    return [-1, 0, 1].flatMap((k) => stops.map((stop) => (set + k) * width + stop));
  };
  const nearest = (value) => stopsNear(value).reduce((best, stop) => (Math.abs(stop - value) < Math.abs(best - value) ? stop : best));
  // The next stop past a position, forward (1) or back (-1).
  const next = (value, way) => {
    const ahead = stopsNear(value).filter((stop) => (way > 0 ? stop > value + 0.5 : stop < value - 0.5));
    return way > 0 ? Math.min(...ahead) : Math.max(...ahead);
  };
  // Lands on the stop nearest where the glide would end; a drag of a fifth
  // of a card or more goes on at least to the next one its way.
  const land = (from, to) => {
    let stop = nearest(to);
    const way = Math.sign(to - from);
    const card = stops[1] ?? width;
    if (way && Math.abs(to - from) >= card * NUDGE && (stop - from) * way <= 0.5) stop = next(from, way);
    return stop;
  };

  // Pointer (mouse and touch). Touch: the page keeps its vertical scroll
  // (touch-action: pan-y); a mostly sideways move drags the row.
  let press = null;
  let suppressClick = false;
  on(row, "pointerdown", (event) => {
    if (event.button !== 0) return;
    // Caught while gliding: it stops where it is seen, not where the glide
    // was heading (that was the jump).
    stop();
    target = x;
    press = { id: event.pointerId, x: event.clientX, y: event.clientY, from: x, moved: false, samples: [[event.timeStamp, event.clientX]] };
    row.classList.add("is-pressed");
  });
  on(row, "pointermove", (event) => {
    if (!press || event.pointerId !== press.id) return;
    const dx = event.clientX - press.x;
    const dy = event.clientY - press.y;
    if (!press.moved) {
      if (Math.abs(dx) < THRESHOLD) {
        if (Math.abs(dy) > THRESHOLD) end(event); // the page is being scrolled
        return;
      }
      press.moved = true;
      row.setPointerCapture(event.pointerId);
      row.classList.add("is-dragging");
    }
    moveTo(press.from - dx, FOLLOW);
    press.samples.push([event.timeStamp, event.clientX]);
    while (press.samples.length > 2 && event.timeStamp - press.samples[0][0] > 100) press.samples.shift();
  });
  const end = (event) => {
    if (!press || event.pointerId !== press.id) return;
    const { moved, samples, from: press0 } = press;
    press = null;
    row.classList.remove("is-pressed", "is-dragging");
    if (!moved) return;
    suppressClick = true;
    setTimeout(() => (suppressClick = false), 0);
    const [t0, x0] = samples[0];
    const [t1, x1] = samples[samples.length - 1];
    const speed = t1 > t0 ? Math.max(-MAX_SPEED, Math.min(MAX_SPEED, (x0 - x1) / (t1 - t0))) : 0;
    moveTo(land(press0, target + (still ? 0 : speed * THROW)), SETTLE);
  };
  on(row, "pointerup", end);
  on(row, "pointercancel", end);
  on(row, "lostpointercapture", end);
  on(row, "click", (event) => {
    if (!suppressClick) return;
    event.preventDefault();
    event.stopPropagation();
  }, { capture: true });
  on(row, "dragstart", (event) => event.preventDefault());

  // A trackpad's sideways swipe (or shift + wheel); up and down stays the
  // page's. Once it stops, the row lands on a card.
  let swipe = null;
  on(row, "wheel", (event) => {
    const sideways = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.shiftKey ? event.deltaY : 0;
    if (!sideways) return;
    event.preventDefault();
    if (!swipe) swipe = { from: target };
    moveTo(target + sideways, FOLLOW);
    clearTimeout(swipe.timer);
    swipe.timer = setTimeout(() => {
      moveTo(land(swipe.from, target), SETTLE);
      swipe = null;
    }, SWIPE_END);
  }, { passive: false });

  // Arrow keys: one card.
  on(row, "keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    moveTo(next(target, event.key === "ArrowRight" ? 1 : -1), SETTLE);
  });

  // Rebuilt only when the row's width changes (the fluid sizes), keeping
  // the same place in the loop.
  let rowWidth = row.clientWidth;
  const resize = new ResizeObserver(() => {
    if (row.clientWidth === rowWidth) return;
    rowWidth = row.clientWidth;
    const share = width ? x / width : 0;
    build();
    x = target = width ? nearest(share * width) : 0;
    draw();
  });
  resize.observe(row);
  // All its pictures load now, so no copy comes into view still empty (at
  // most 10, 800px; the copies use the same files).
  originals.forEach((card) => card.querySelectorAll("img").forEach((img) => (img.loading = "eager")));
  build();

  return () => {
    events.abort();
    resize.disconnect();
    clearTimeout(swipe?.timer);
    stop();
    track.querySelectorAll("[data-drag-copy]").forEach((copy) => copy.remove());
    track.style.transform = "";
  };
}

// The "← Drag →" circle in place of the pointer over the rows.
function setUpCursor(rows) {
  const root = document.documentElement;
  const circle = document.createElement("span");
  circle.className = "drag-cursor";
  circle.setAttribute("aria-hidden", "true");
  circle.innerHTML = `<span class="drag-cursor__inner">${ARROW("M6.5 1.5 3 5l3.5 3.5")}<span>Drag</span>${ARROW("M3.5 1.5 7 5 3.5 8.5")}</span>`;
  document.body.append(circle);
  root.classList.add("has-drag-cursor");
  gsap.set(circle, { xPercent: -50, yPercent: -50, scale: 0, autoAlpha: 0 });
  const toX = gsap.quickTo(circle, "x", { duration: 0.35, ease: "power3.out" });
  const toY = gsap.quickTo(circle, "y", { duration: 0.35, ease: "power3.out" });
  let shown = false;
  let pressed = false;
  const size = () => (!shown ? 0 : pressed ? 0.8 : 1);
  const update = () => gsap.to(circle, { scale: size(), autoAlpha: shown ? 1 : 0, duration: shown ? 0.35 : 0.2, ease: "power3.out", overwrite: "auto" });

  const events = new AbortController();
  const on = (target, type, handler) => target.addEventListener(type, handler, { passive: true, signal: events.signal });
  rows.forEach((row) => {
    on(row, "pointerenter", (event) => {
      if (event.pointerType !== "mouse") return;
      toX(event.clientX, event.clientX);
      toY(event.clientY, event.clientY);
      shown = true;
      update();
    });
    on(row, "pointerleave", (event) => {
      if (event.pointerType !== "mouse" || row.classList.contains("is-dragging")) return;
      shown = false;
      update();
    });
    on(row, "pointerdown", () => {
      pressed = true;
      update();
    });
  });
  on(window, "pointerup", (event) => {
    pressed = false;
    // Let go outside the row after a drag.
    if (!event.target.closest?.("[data-drag]")) shown = false;
    update();
  });
  on(window, "pointermove", (event) => {
    if (event.pointerType !== "mouse") return;
    toX(event.clientX);
    toY(event.clientY);
  });

  return () => {
    events.abort();
    gsap.killTweensOf(circle);
    circle.remove();
    root.classList.remove("has-drag-cursor");
  };
}
