import { getSmoothScroll } from "./smooth-scroll.js";

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
const RECENT_KEY = "oww-work-recent";
const VIEW_KEY = "oww-work-view";
const RECENT_MAX = 4;

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
  const browse = [...document.querySelectorAll("[data-work-browse]")];
  const index = JSON.parse(results.querySelector("[data-search-index]").textContent).map((item) => ({ ...item, words: words(item.words) }));
  const cards = [...results.querySelectorAll("[data-results-grid] [data-result]")];
  const rows = [...results.querySelectorAll("[data-results-list] [data-result]")];
  const groups = [...results.querySelectorAll("[data-results-group]")];
  const gridView = results.querySelector("[data-results-grid]");
  const listView = results.querySelector("[data-results-list]");
  const empty = results.querySelector("[data-results-empty]");
  const select = results.querySelector("[data-results-view]");
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

  const view = () => (select.value === "list" ? "list" : "grid");

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

    cards.forEach((card) => (card.hidden = !found.has(+card.dataset.result)));
    groups.forEach((group) => (group.hidden = counts[group.dataset.resultsGroup] === 0));
    const firstRow = {};
    rows.forEach((row) => {
      const shown = found.has(+row.dataset.result);
      row.hidden = !shown;
      row.removeAttribute("id");
      if (shown && !firstRow[row.dataset.kind]) firstRow[row.dataset.kind] = row;
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

  const go = (url, { save } = {}) => {
    const next = new URL(url, location.href);
    const query = (next.searchParams.get("q") ?? "").trim();
    if (save && query) remember(query);
    history.pushState(history.state, "", `${next.pathname}${next.search}`);
    render();
    showChips();
    const lenis = getSmoothScroll();
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo(0, 0);
  };

  document.querySelectorAll(".work-search__form, .work-tabs__search").forEach((form) => {
    on(form, "submit", (event) => {
      event.preventDefault();
      const query = form.querySelector(".work-search__input").value.trim();
      go(query ? `/work?q=${encodeURIComponent(query)}` : "/work", { save: true });
    });
  });
  // Suggestions and "See all" (also the chips written later).
  on(document, "click", (event) => {
    const link = event.target.closest("[data-search-link]");
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey) return;
    event.preventDefault();
    go(link.href, { save: link.classList.contains("work-search__chip") });
  });
  clears.forEach((button) => on(button, "click", () => go("/work")));
  on(select, "change", () => {
    write(VIEW_KEY, view());
    render();
  });
  on(window, "popstate", () => {
    render();
    showChips();
  });

  const saved = read(VIEW_KEY);
  if (saved === "list" || saved === "grid") select.value = saved;
  showChips();
  render();

  return () => {
    events.abort();
    root.classList.remove("is-work-results", "is-results-ready");
  };
}
