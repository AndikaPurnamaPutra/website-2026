// Rows dragged with the mouse ([data-drag]: Work page, Selected Work; plan
// 42, step 3). Touch and trackpads scroll them natively; the mouse drags
// them: the row follows the pointer and, let go, glides on and slows down.
// A drag is not a click (a link under the pointer is not followed). The
// "Drag" label at the pointer is src/js/work-cursor.js. Not with reduced
// motion: no glide (the drag still works).
const THRESHOLD = 5; // px moved before a press becomes a drag
const FRICTION = 0.95; // speed kept per frame (60 fps) while gliding
const STOP = 0.02; // px/ms: the glide ends below this

export function initWorkDrag() {
  const rows = [...document.querySelectorAll("[data-drag]")];
  if (!rows.length) return () => {};
  const glide = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const cleanups = rows.map((row) => {
    const events = new AbortController();
    const on = (type, handler, options = {}) => row.addEventListener(type, handler, { ...options, signal: events.signal });
    let press = null; // { x, scroll, moved, samples }
    let frame = 0;
    let suppressClick = false;

    const stopGlide = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    on("pointerdown", (event) => {
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      stopGlide();
      press = { id: event.pointerId, x: event.clientX, scroll: row.scrollLeft, moved: false, samples: [[event.timeStamp, event.clientX]] };
    });

    on("pointermove", (event) => {
      if (!press || event.pointerId !== press.id) return;
      const dx = event.clientX - press.x;
      if (!press.moved && Math.abs(dx) < THRESHOLD) return;
      if (!press.moved) {
        press.moved = true;
        row.setPointerCapture(event.pointerId);
        row.classList.add("is-dragging");
      }
      row.scrollLeft = press.scroll - dx;
      press.samples.push([event.timeStamp, event.clientX]);
      if (press.samples.length > 5) press.samples.shift();
    });

    const release = (event) => {
      if (!press || event.pointerId !== press.id) return;
      const { moved, samples } = press;
      press = null;
      if (!moved) return;
      row.classList.remove("is-dragging");
      suppressClick = true;
      setTimeout(() => (suppressClick = false), 0);
      // Speed over the last moves, in px per ms (positive: content moves left).
      const [[t0, x0], [t1, x1]] = [samples[0], samples[samples.length - 1]];
      let speed = t1 > t0 ? (x0 - x1) / (t1 - t0) : 0;
      if (!glide || Math.abs(speed) < STOP) return;
      let last = performance.now();
      const step = (now) => {
        const dt = Math.min(now - last, 50);
        last = now;
        const before = row.scrollLeft;
        row.scrollLeft += speed * dt;
        speed *= FRICTION ** (dt / 16.7);
        // Stops at the ends, or once slow.
        frame = Math.abs(speed) > STOP && row.scrollLeft !== before ? requestAnimationFrame(step) : 0;
      };
      frame = requestAnimationFrame(step);
    };
    on("pointerup", release);
    on("pointercancel", release);
    // A drag ending over a link would follow it.
    on("click", (event) => {
      if (!suppressClick) return;
      event.preventDefault();
      event.stopPropagation();
    }, { capture: true });
    // A wheel or touch scroll takes over from the glide.
    on("wheel", stopGlide, { passive: true });
    on("touchstart", stopGlide, { passive: true });

    return () => {
      events.abort();
      stopGlide();
    };
  });

  return () => cleanups.forEach((cleanup) => cleanup());
}
