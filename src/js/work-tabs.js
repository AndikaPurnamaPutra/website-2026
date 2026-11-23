import { getSmoothScroll } from "./smooth-scroll.js";

// The Work page's bar (plan 42, step 4; src/components/work/WorkTabs.astro):
// the tab of the section under the bar is lit (the first one until a
// section reaches it, as in Figma); a tab scrolls to its section, which then
// starts just under the bar (smoothly with Lenis, at once with reduced
// motion). Phones: the lit tab is kept in view in its sideways row.
export function initWorkTabs() {
  const bar = document.querySelector("[data-work-tabs]");
  if (!bar) return () => {};
  const tabs = [...bar.querySelectorAll(".work-tabs__tab")];
  const sections = tabs.map((tab) => document.getElementById(tab.hash.slice(1)));
  const nav = bar.querySelector(".work-tabs__nav");
  const events = new AbortController();
  let current = -1;

  const light = (index) => {
    if (index === current) return;
    current = index;
    tabs.forEach((tab, i) => {
      tab.classList.toggle("is-active", i === index);
      if (i === index) tab.setAttribute("aria-current", "true");
      else tab.removeAttribute("aria-current");
    });
    // Only the row itself scrolls, not the page.
    const tab = tabs[index];
    if (nav.scrollWidth > nav.clientWidth) {
      nav.scrollTo({ left: tab.offsetLeft - (nav.clientWidth - tab.offsetWidth) / 2, behavior: "smooth" });
    }
  };

  // The bar's bottom edge, where it sits once stuck.
  const line = () => bar.getBoundingClientRect().bottom;
  const update = () => {
    const edge = line() + 1;
    let index = 0;
    sections.forEach((section, i) => {
      if (section && section.getBoundingClientRect().top <= edge) index = i;
    });
    light(index);
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener(
      "click",
      (event) => {
        const section = sections[i];
        if (!section) return;
        event.preventDefault();
        // Where the bar will be once stuck: under the header, its own height.
        const offset = parseFloat(getComputedStyle(bar).top) + bar.offsetHeight;
        const top = section.getBoundingClientRect().top + window.scrollY - offset + 1;
        const lenis = getSmoothScroll();
        if (lenis) lenis.scrollTo(top, { duration: 1.2 });
        else window.scrollTo({ top, behavior: "instant" });
        history.replaceState(history.state, "", tab.hash);
        light(i);
      },
      { signal: events.signal },
    );
  });

  window.addEventListener("scroll", update, { passive: true, signal: events.signal });
  window.addEventListener("resize", update, { passive: true, signal: events.signal });
  update();

  return () => events.abort();
}
