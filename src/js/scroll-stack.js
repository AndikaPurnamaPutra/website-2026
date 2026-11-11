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

  // One at a time, released together, always on the screen (user: on a
  // tall screen the next one already showed below the one stuck, as if
  // leaking; on a short one, 1024 × 600, a panel was taller than the screen
  // and the next covered its picture before it was seen):
  // - --room (from where a panel sticks to the screen's bottom, less GAP) and
  //   --lead (its first part's height) let the section's CSS fit it on the
  //   screen (a shorter picture, a smaller illustration);
  // - each panel's bottom margin reaches the screen's bottom when it is
  //   stuck, so the next one comes up from below the screen as it sticks;
  // - that is the same line for every panel (a stuck panel is pushed off
  //   once its margin box meets the box's end, the last panel's), so they
  //   let go together, as the last one sticks (a panel whose margin ended
  //   higher stayed while the others went, its title showing above).
  // The screen's height without the browser's bars (svh), so the room does
  // not change as they show and hide while scrolling.
  const GAP = 16;
  const probe = document.createElement("div");
  probe.style.cssText = "position:absolute;top:0;left:0;width:0;height:100svh;visibility:hidden;pointer-events:none";
  pile.append(probe);
  // On tablets and up the pile is held in the middle of the screen (user:
  // on a tall screen, iPad Pro, a large empty space showed below the stuck
  // panel): --stack-shift lowers it by half the room left (phones keep it
  // at the top).
  const centred = window.matchMedia("(min-width: 744px)");
  const measure = () => {
    const screen = probe.offsetHeight || window.innerHeight;
    const top = (panel) => parseFloat(getComputedStyle(panel).top);
    const fit = () =>
      panels.forEach((panel) => {
        panel.style.removeProperty("margin-bottom");
        panel.style.setProperty("--room", `${screen - top(panel) - GAP}px`);
        panel.style.setProperty("--lead", `${panel.firstElementChild.offsetHeight}px`);
      });
    pile.style.setProperty("--stack-shift", "0px");
    fit();
    if (centred.matches) {
      const pileEnd = Math.max(...panels.map((panel) => top(panel) + panel.offsetHeight));
      const shift = Math.max(0, (screen - pileEnd - GAP) / 2);
      if (shift > 1) {
        pile.style.setProperty("--stack-shift", `${shift}px`);
        fit();
      }
    }
    const end = (panel) => top(panel) + panel.offsetHeight;
    const base = parseFloat(getComputedStyle(panels[0]).marginBottom);
    const line = Math.max(screen, ...panels.map((panel) => end(panel) + base));
    panels.forEach((panel) => (panel.style.marginBottom = `${line - end(panel)}px`));
    // What follows the stack comes as close as before: it is pulled up by
    // the room added below the last panel (it then shows below the last one
    // while the pile is still held, and moves on with it).
    const last = panels[panels.length - 1];
    pile.style.marginBottom = `${-(line - end(last) - base)}px`;
    if (stepBack) deepen(end);
  };
  measure();
  const resize = new ResizeObserver(measure);
  panels.forEach((panel) => resize.observe(panel));
  resize.observe(probe);

  return () => {
    resize.disconnect();
    panels.forEach((panel) =>
      ["animation-name", "animation-timeline", "animation-range", "margin-bottom", "--room", "--lead"].forEach((name) => panel.style.removeProperty(name)),
    );
    section.classList.remove("is-stacked");
    scope.style.removeProperty("timeline-scope");
    pile.style.removeProperty("margin-bottom");
    pile.style.removeProperty("--stack-shift");
    moves.reverse().forEach(([el, parent, next]) => parent.insertBefore(el, next));
    pile.remove();
  };
}
