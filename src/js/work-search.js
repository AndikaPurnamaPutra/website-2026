import gsap from "gsap";
import { getSmoothScroll } from "./smooth-scroll.js";
import { PART_RISE, rise, openCards, clearCards, rowsOf } from "./work-motion.js";

// Work page search and "See all" (plan 42, step 6;
// src/components/work/WorkResults.astro). /work?q=… shows the projects
// matching the words, /work?type=case-study (etc.) all of one kind; the hero,
// Selected Work and the sections give way to the results, the tabs count the
// results and lead to their groups. Searching, a suggestion, "See all",
// "Clear search" and ✕ change the address without loading the page; Back and
// Forward go through them. The last searches (4) are kept in this browser
// and shown as the hero's chips; until there are some, the Studio's
// suggestions. Grid or List is kept too.
//
// Matching: every word typed must start a word of the project (title,
// categories, format, keywords, kind, year) — "bank" finds "banking" and
// "banking" finds the keyword "bank" — and if no project has them all, the
// projects with any of them are shown.
//
// Changing view (a search, a chip, "See all", Clear search, Back and
// Forward, Grid or List) is not a cut (user: too abrupt): what shows fades
// out, the page goes to the top while nothing shows, then the results come
// in in the page's motion language (work-motion.js), quicker: their bar
// rises, then the group titles and the cards in view open row by row (the
// list's rows rise); back to the whole page, it rises into place. With
// reduced motion, a cut as before. Enter or the search icon first presses
// the field's search button (user's pick): it goes down and springs back,
// its magnifier nudging up and to the right and back.
//
// Each kind shows PAGE results at first; "Load more" below them (in the
// grid under the group, in the list after its rows) adds PAGE more, which
// open as the cards do (the list's rows rise) without the page moving
// (user, 25 Nov 2026: a catalogue of hundreds). The count is kept while the
// address stays (Grid ↔ List), and starts again for a new search.
const RECENT_KEY = "oww-work-recent";
const VIEW_KEY = "oww-work-view";
const RECENT_MAX = 4;
const OUT = 0.25; // s what shows takes to fade out
const PACE = 1.4; // the entrance, quicker than the page's (one waits on it)
const ROW_GAP = 0.12; // s between rows of cards (at the page's pace)
const PRESS = 0.12; // s the search button goes down; what shows fades after it
const PAGE = 24; // results of a kind shown at first and added by "Load more" (3 and 4 columns)

const words = (text) =>
  text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
const fits = (token, word) => word.startsWith(token) || (word.length >= 4 && token.startsWith(word));

const read = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
};
const write = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private window or storage off: nothing kept, nothing breaks.
  }
};

export function initWorkSearch() {
  const results = document.querySelector("[data-work-results]");
  if (!results) return () => {};
  const root = document.documentElement;
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const browse = [...document.querySelectorAll("[data-work-browse]")];
  const index = JSON.parse(results.querySelector("[data-search-index]").textContent).map((item) => ({ ...item, words: words(item.words) }));
  const cards = [...results.querySelectorAll("[data-results-grid] [data-result]")];
  const rows = [...results.querySelectorAll("[data-results-list] [data-result]")];
  const groups = [...results.querySelectorAll("[data-results-group]")];
  const mores = [...results.querySelectorAll("[data-results-more]")];
  const gridView = results.querySelector("[data-results-grid]");
  const listView = results.querySelector("[data-results-list]");
  const empty = results.querySelector("[data-results-empty]");
  const viewBox = results.querySelector("[data-results-view]");
  const viewButton = viewBox.querySelector(".work-view__button");
  const viewValue = viewBox.querySelector("[data-view-value]");
  const viewList = viewBox.querySelector('[role="listbox"]');
  const viewOptions = [...viewList.children];
  const tabs = [...document.querySelectorAll(".work-tabs__tab")];
  const tabsInput = document.querySelector(".work-tabs__search .work-search__input");
  const submit = document.querySelector("[data-search-submit]");
  const clears = [...document.querySelectorAll("[data-search-clear]")];
  const chips = document.querySelector("[data-search-chips]");
  const kindTitle = Object.fromEntries(groups.map((group) => [group.dataset.resultsGroup, group.querySelector(".work-section-title").textContent]));
  // Each tab: its section id, its count and the count of the whole page.
  const tabInfo = tabs.map((tab) => ({ tab, id: tab.hash.slice(1), count: tab.querySelector(".work-tabs__count"), total: tab.querySelector(".work-tabs__count").textContent }));
  const groupKind = Object.fromEntries(groups.map((group) => [group.id.replace(/^results-/, ""), group.dataset.resultsGroup]));
  const events = new AbortController();
  const on = (target, type, handler, options = {}) => target?.addEventListener(type, handler, { ...options, signal: events.signal });

  const match = (query) => {
    const tokens = words(query);
    if (!tokens.length) return [];
    const hits = index.map((item) => tokens.filter((token) => item.words.some((word) => fits(token, word))).length);
    const all = hits.map((n, i) => (n === tokens.length ? i : -1)).filter((i) => i >= 0);
    return all.length ? all : hits.map((n, i) => (n > 0 ? i : -1)).filter((i) => i >= 0);
  };

  // View mode: a dropdown of our own (as Contact's Turnaround).
  let current = "grid";
  let pointed = 0;
  const view = () => current;
  const setView = (value) => {
    current = value === "list" ? "list" : "grid";
    viewOptions.forEach((option) => {
      const on = option.dataset.value === current;
      option.setAttribute("aria-selected", String(on));
      if (on) viewValue.textContent = option.textContent.trim();
    });
  };
  const point = (index) => {
    pointed = (index + viewOptions.length) % viewOptions.length;
    viewOptions.forEach((option, i) => option.classList.toggle("is-active", i === pointed));
    viewList.setAttribute("aria-activedescendant", viewOptions[pointed].id);
  };
  const openView = () => {
    viewList.hidden = false;
    viewButton.setAttribute("aria-expanded", "true");
    point(viewOptions.findIndex((option) => option.dataset.value === current));
    viewList.focus({ preventScroll: true });
  };
  const closeView = (focusButton) => {
    if (viewList.hidden) return;
    viewList.hidden = true;
    viewButton.setAttribute("aria-expanded", "false");
    viewOptions.forEach((option) => option.classList.remove("is-active"));
    if (focusButton) viewButton.focus({ preventScroll: true });
  };

  const showChips = () => {
    if (!chips) return;
    const recent = read(RECENT_KEY);
    const list = Array.isArray(recent) && recent.length ? recent : JSON.parse(chips.dataset.suggestions || "[]");
    chips.replaceChildren(
      ...list.map((word) => {
        const item = document.createElement("li");
        const link = document.createElement("a");
        link.className = "work-search__chip";
        link.href = `/work?q=${encodeURIComponent(word)}`;
        link.dataset.barbaPrevent = "";
        link.dataset.searchLink = "";
        link.textContent = word;
        item.append(link);
        return item;
      }),
    );
  };

  const remember = (query) => {
    const recent = (read(RECENT_KEY) ?? []).filter((word) => typeof word === "string" && word.toLowerCase() !== query.toLowerCase());
    write(RECENT_KEY, [query, ...recent].slice(0, RECENT_MAX));
  };

  // The tabs lead to the results' groups (grid) or first rows (list); a kind
  // without results is dimmed and does nothing.
  const pointTabs = (counts) => {
    tabInfo.forEach(({ tab, id, count, total }) => {
      const kind = groupKind[id];
      const n = counts ? counts[kind] : null;
      count.textContent = counts ? n : total;
      const off = counts !== null && n === 0;
      tab.classList.toggle("is-empty", off);
      if (off) tab.setAttribute("aria-disabled", "true");
      else tab.removeAttribute("aria-disabled");
      tab.dataset.target = counts ? (view() === "list" ? `results-list-${id}` : `results-${id}`) : id;
    });
  };

  // The results found, PAGE (or more, after "Load more") of each kind.
  let shown = { found: new Set(), counts: {} };
  let limit = {};
  let limitFor = null;
  const limitOf = (kind) => limit[kind] ?? PAGE;
  const showLimited = () => {
    const { found, counts } = shown;
    [cards, rows].forEach((items) => {
      const seen = {};
      items.forEach((item) => {
        const i = +item.dataset.result;
        const kind = index[i].kind;
        if (!found.has(i)) return (item.hidden = true);
        seen[kind] = (seen[kind] ?? 0) + 1;
        item.hidden = seen[kind] > limitOf(kind);
      });
    });
    mores.forEach((more) => {
      const kind = more.dataset.resultsMore;
      const all = counts[kind] ?? 0;
      more.hidden = all <= limitOf(kind);
      more.querySelector("[data-more-count]").textContent = `${Math.min(limitOf(kind), all)} of ${all}`;
    });
  };

  const render = () => {
    const params = new URLSearchParams(location.search);
    const query = (params.get("q") ?? "").trim();
    const type = params.get("type");
    const typeKind = type && groupKind[type];
    const active = Boolean(query || typeKind);
    root.classList.toggle("is-work-results", active);
    results.hidden = !active;
    browse.forEach((part) => (part.hidden = active));
    clears.forEach((button) => (button.hidden = !active));
    if (submit) submit.hidden = active;
    if (tabsInput) tabsInput.value = query;
    document.querySelectorAll(".work-search__form .work-search__input").forEach((input) => (input.value = query));
    if (!active) {
      pointTabs(null);
      root.classList.add("is-results-ready");
      return;
    }

    const found = new Set(query ? match(query) : index.map((item, i) => (item.kind === typeKind ? i : -1)).filter((i) => i >= 0));
    if (query && typeKind) for (const i of [...found]) if (index[i].kind !== typeKind) found.delete(i);
    const counts = Object.fromEntries(Object.keys(kindTitle).map((kind) => [kind, 0]));
    found.forEach((i) => counts[index[i].kind]++);

    if (limitFor !== location.search) {
      limitFor = location.search;
      limit = {};
    }
    shown = { found, counts };
    showLimited();
    groups.forEach((group) => (group.hidden = counts[group.dataset.resultsGroup] === 0));
    const firstRow = {};
    rows.forEach((row) => {
      row.removeAttribute("id");
      if (!row.hidden && !firstRow[row.dataset.kind]) firstRow[row.dataset.kind] = row;
    });
    Object.entries(firstRow).forEach(([kind, row]) => {
      const id = Object.keys(groupKind).find((key) => groupKind[key] === kind);
      row.id = `results-list-${id}`;
    });

    const total = found.size;
    results.querySelector("[data-results-count]").textContent = `${total} ${total === 1 ? "Result" : "Results"}`;
    results.querySelector("[data-results-summary]").textContent = `${Object.entries(counts)
      .filter(([kind, n]) => !typeKind || kind === typeKind || n > 0)
      .map(([kind, n]) => `${n} ${kindTitle[kind]}`)
      .join(", ")}.`;
    results.querySelector("[data-results-query]").textContent = query || kindTitle[typeKind];
    empty.hidden = total > 0;
    gridView.hidden = total === 0 || view() !== "grid";
    listView.hidden = total === 0 || view() !== "list";
    pointTabs(counts);
    root.classList.add("is-results-ready");
  };

  const toTop = () => {
    const lenis = getSmoothScroll();
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo(0, 0);
  };

  // The new view coming in (see the top of this file). Only what is in the
  // first screen moves; below it, it is in place.
  const inView = (el) => el.getBoundingClientRect().top < window.innerHeight;
  const enter = () => {
    const moved = [];
    const opened = [];
    const tl = gsap.timeline({
      onComplete: () => {
        clearCards(opened);
        gsap.set(moved, { clearProps: "transform,clipPath,opacity,visibility" });
        entering = null;
      },
    });
    if (!root.classList.contains("is-work-results")) {
      const page = browse.filter((part) => !part.hidden);
      moved.push(...page);
      tl.fromTo(page, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 1, ease: "power3.out" });
    } else {
      const bar = [...results.querySelectorAll(".work-results__summary, .work-results__view")];
      moved.push(...bar);
      tl.add(rise(bar, { stagger: 0.07 }, PART_RISE), 0);
      if (!empty.hidden) {
        moved.push(empty);
        tl.fromTo(empty, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out" }, 0.1);
      } else if (!listView.hidden) {
        const shown = rows.filter((row) => !row.hidden && inView(row));
        moved.push(...shown);
        tl.add(rise(shown, { stagger: 0.05 }, PART_RISE), 0.15);
      } else {
        const titles = groups.filter((group) => !group.hidden).map((group) => group.querySelector(".work-section-title")).filter(inView);
        moved.push(...titles);
        if (titles.length) tl.add(rise(titles, { stagger: 0.1 }), 0.1);
        rowsOf(cards.filter((card) => !card.hidden && inView(card))).forEach(({ items }, i) => {
          opened.push(...items);
          tl.add(openCards(items).paused(false), 0.2 + i * ROW_GAP);
        });
      }
    }
    tl.timeScale(PACE);
    entering = tl;
  };

  // Out, the change (address, results, chips), to the top, in.
  let leaving = null;
  let entering = null;
  const swap = (change, { top = true, after = 0 } = {}) => {
    entering?.progress(1);
    const finish = () => {
      change();
      if (top) toTop();
    };
    if (still) return finish();
    leaving?.kill();
    const out = [...browse, results].filter((part) => !part.hidden);
    leaving = gsap.to(out, {
      autoAlpha: 0,
      duration: OUT,
      delay: after,
      ease: "power1.in",
      onComplete: () => {
        leaving = null;
        finish();
        gsap.set(out, { clearProps: "opacity,visibility" });
        enter();
      },
    });
  };

  const go = (url, { save, after } = {}) => {
    const next = new URL(url, location.href);
    const query = (next.searchParams.get("q") ?? "").trim();
    if (save && query) remember(query);
    swap(
      () => {
        history.pushState(history.state, "", `${next.pathname}${next.search}`);
        render();
        showChips();
      },
      { after },
    );
  };

  // The search button pressed (see the top of this file); false if there is
  // none to press (the bar's, while results show, gives way to ✕).
  // A white button pressed: down and back with a spring; the magnifier
  // also nudges up and right (the ✕ only goes down, user: as the search).
  const pressButton = (button, { nudge = false } = {}) => {
    if (still || !button) return false;
    const icon = button.querySelector("img");
    gsap.killTweensOf([button, icon]);
    const tl = gsap
      .timeline({ onComplete: () => gsap.set([button, icon], { clearProps: "transform" }) })
      .to(button, { scale: 0.86, duration: PRESS, ease: "power2.out" }, 0)
      .to(button, { scale: 1, duration: 0.5, ease: "back.out(3)" }, PRESS);
    if (nudge) {
      tl.to(icon, { x: 3, y: -3, duration: PRESS, ease: "power2.out" }, 0).to(icon, { x: 0, y: 0, duration: 0.5, ease: "back.out(3)" }, PRESS);
    }
    return true;
  };
  const press = (form) => pressButton(form.querySelector('.work-search__submit[type="submit"]:not([hidden])'), { nudge: true });

  document.querySelectorAll(".work-search__form, .work-tabs__search").forEach((form) => {
    on(form, "submit", (event) => {
      event.preventDefault();
      const query = form.querySelector(".work-search__input").value.trim();
      const after = press(form) ? PRESS : 0;
      go(query ? `/work?q=${encodeURIComponent(query)}` : "/work", { save: true, after });
    });
  });
  // Suggestions and "See all" (also the chips written later).
  on(document, "click", (event) => {
    const link = event.target.closest("[data-search-link]");
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey) return;
    event.preventDefault();
    go(link.href, { save: link.classList.contains("work-search__chip") });
  });
  clears.forEach((button) =>
    on(button, "click", () => {
      // The ✕ (a white button) presses as the search does; "Clear search" (text) does not.
      const after = button.classList.contains("work-search__submit") && pressButton(button) ? PRESS : 0;
      go("/work", { after });
    }),
  );
  // "Load more": PAGE more of its kind, in place; the first new one takes
  // the focus (keyboard: on to them, not back through the old ones).
  on(results, "click", (event) => {
    const button = event.target.closest("[data-results-more] button");
    if (!button) return;
    const kind = button.closest("[data-results-more]").dataset.resultsMore;
    const items = listView.hidden ? cards : rows;
    const before = new Set(items.filter((item) => !item.hidden));
    limit[kind] = limitOf(kind) + PAGE;
    showLimited();
    const fresh = items.filter((item) => !item.hidden && !before.has(item));
    fresh[0]?.querySelector("a")?.focus({ preventScroll: true });
    if (still || !fresh.length) return;
    const near = fresh.filter(inView);
    if (!listView.hidden) {
      rise(near, { stagger: 0.05, onComplete: () => gsap.set(near, { clearProps: "transform,clipPath" }) }, PART_RISE).timeScale(PACE);
      return;
    }
    const tl = gsap.timeline({ onComplete: () => clearCards(near) });
    rowsOf(near).forEach(({ items: row }, i) => tl.add(openCards(row, { ease: "power3.out" }).paused(false), i * ROW_GAP));
    tl.timeScale(PACE);
  });
  const chooseView = (index) => {
    const value = viewOptions[index].dataset.value;
    closeView(true);
    if (value === current) return;
    setView(value);
    write(VIEW_KEY, current);
    swap(render, { top: false });
  };
  on(viewButton, "click", () => (viewList.hidden ? openView() : closeView(false)));
  on(viewButton, "keydown", (event) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    openView();
  });
  on(viewList, "click", (event) => {
    const option = event.target.closest('[role="option"]');
    if (option) chooseView(viewOptions.indexOf(option));
  });
  on(viewList, "pointermove", (event) => {
    const option = event.target.closest('[role="option"]');
    if (option) point(viewOptions.indexOf(option));
  });
  on(viewList, "keydown", (event) => {
    if (event.key === "ArrowDown") point(pointed + 1);
    else if (event.key === "ArrowUp") point(pointed - 1);
    else if (event.key === "Home") point(0);
    else if (event.key === "End") point(viewOptions.length - 1);
    else if (event.key === "Enter" || event.key === " ") chooseView(pointed);
    else if (event.key === "Escape") closeView(true);
    else if (event.key === "Tab") closeView(false);
    else return;
    event.preventDefault();
  });
  on(document, "pointerdown", (event) => {
    if (!viewBox.contains(event.target)) closeView(false);
  });
  on(viewBox, "focusout", (event) => {
    if (event.relatedTarget && !viewBox.contains(event.relatedTarget)) closeView(false);
  });
  on(window, "popstate", () =>
    swap(() => {
      render();
      showChips();
    }),
  );

  const saved = read(VIEW_KEY);
  if (saved === "list" || saved === "grid") setView(saved);
  showChips();
  render();

  return () => {
    events.abort();
    leaving?.kill();
    entering?.kill();
    root.classList.remove("is-work-results", "is-results-ready");
  };
}
