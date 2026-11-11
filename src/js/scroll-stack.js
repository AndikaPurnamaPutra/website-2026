// A stack on phones, tablets and touch screens (user, 11 Nov 2026; plans 39
// and 40): pairs of elements (a card and its picture, a principle and its
// illustration) joined into panels that stick each a step lower than the
// last, so the top edges of those behind stay in view as a pile, while the
// one being covered steps back (smaller, darker). The script only builds
// the panels and names the scroll timelines; the sticking and the stepping
// back are CSS (src/scss/components/_scroll-stack.scss), run by the browser
// with the scroll: moved by script they were a frame behind the page.
// Classes: <block>__stack, <block>__panel, <block>__mark; the section gets
// is-stacked. Returns a function that puts everything back.
export function buildStack({ section, block, scope, after, pairs }) {
  if (!pairs.length) return () => {};
  // Where each element was, to put it back (undone in reverse order).
  const moves = [];
  const move = (el, into) => {
    moves.push([el, el.parentNode, el.nextSibling]);
    into.append(el);
  };

  // The panels in a box of their own that ends with the last one: they let
  // go of the screen together as the last one sticks, and what follows
  // comes up below them instead of running under the stuck pile.
  const pile = document.createElement("div");
  pile.className = `${block}__stack`;
  after.after(pile);
  const names = [];
  const panels = [];
  pairs.forEach((pair, i) => {
    // A mark in the flow right above the panel, where the panel's top would
    // be without sticking: the panel before it steps back while it comes up
    // (a stuck panel's own view of the scroll stands still).
    if (i > 0) {
      const mark = document.createElement("div");
      mark.className = `${block}__mark`;
      mark.setAttribute("aria-hidden", "true");
      const name = `--${block}-panel-${i}`;
      mark.style.setProperty("view-timeline-name", name);
      names.push(name);
      panels[i - 1].classList.add("is-covered");
      pile.append(mark);
    }
    const panel = document.createElement("div");
    panel.className = `${block}__panel`;
    panel.style.setProperty("--panel", i);
    pair.forEach((el) => move(el, panel));
    pile.append(panel);
    panels.push(panel);
  });
  scope.style.setProperty("timeline-scope", names.join(", "));
  section.classList.add("is-stacked");

  // Each panel that comes over steps back every panel under it one more
  // step (user: they all ended the same size but the last, a flat pile):
  // one animation per panel above, on that panel's mark, added together
  // (animation-composition: add), each from that panel's top meeting the
  // bottom of the one it covers (it stepped back while still moving up when
  // this began at the screen's bottom) to its sticking. Only where the
  // browser runs them on the scroll, and not with reduced motion: without
  // a scroll timeline they would jump to their end at once.
  const stepBack =
    CSS.supports("animation-timeline: view()") && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const deepen = (end) => {
    const top = (panel) => parseFloat(getComputedStyle(panel).top);
    const ranges = panels.slice(1).map(
      (panel, k) => `cover max(0px, calc(100% - ${end(panels[k])}px)) cover calc(100% - ${top(panel)}px)`,
    );
    panels.slice(0, -1).forEach((panel, i) => {
      const above = names.slice(i);
      panel.style.setProperty("animation-name", above.map(() => "stack-step-back").join(", "));
      panel.style.setProperty("animation-timeline", above.join(", "));
      panel.style.setProperty("animation-range", ranges.slice(i).join(", "));
    });
  };

  // Released together: a stuck panel is pushed off only once its margin box
  // meets the box's end (the last panel's bottom), so the panels higher in
  // the pile or shorter than the last stayed while the others went, out of
  // order (a title showed above the pile). Each panel's bottom margin
  // reaches down to where the last one's bottom sticks.
  const measure = () => {
    panels.forEach((panel) => panel.style.removeProperty("margin-bottom"));
    const end = (panel) => parseFloat(getComputedStyle(panel).top) + panel.offsetHeight;
    const last = end(panels[panels.length - 1]);
    panels.slice(0, -1).forEach((panel) => {
      const base = parseFloat(getComputedStyle(panel).marginBottom);
      panel.style.marginBottom = `${base + last - end(panel)}px`;
    });
    if (stepBack) deepen(end);
  };
  measure();
  const resize = new ResizeObserver(measure);
  panels.forEach((panel) => resize.observe(panel));

  return () => {
    resize.disconnect();
    panels.forEach((panel) =>
      ["animation-name", "animation-timeline", "animation-range", "margin-bottom"].forEach((name) => panel.style.removeProperty(name)),
    );
    section.classList.remove("is-stacked");
    scope.style.removeProperty("timeline-scope");
    moves.reverse().forEach(([el, parent, next]) => parent.insertBefore(el, next));
    pile.remove();
  };
}
