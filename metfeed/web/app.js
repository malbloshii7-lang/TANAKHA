"use strict";

const SECTOR_COLORS = {
  Governance: "var(--c-governance)",
  Operations: "var(--c-operations)",
  Science: "var(--c-science)",
  Climate: "var(--c-climate)",
  Water: "var(--c-water)",
};

const state = {
  items: [],
  filter: "All",
  query: "",
  generatedAt: null,
};

const els = {
  feed: document.getElementById("feed"),
  filters: document.getElementById("filters"),
  search: document.getElementById("search"),
  empty: document.getElementById("empty"),
  count: document.getElementById("result-count"),
  freshness: document.getElementById("freshness"),
  themeToggle: document.getElementById("theme-toggle"),
};

/* ---------- Theme ---------- */
const savedTheme = localStorage.getItem("metfeed-theme");
if (savedTheme) document.documentElement.dataset.theme = savedTheme;
els.themeToggle.addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  localStorage.setItem("metfeed-theme", next);
});

/* ---------- Helpers ---------- */
function relativeTime(iso) {
  if (!iso) return "";
  const then = new Date(iso);
  if (isNaN(then)) return "";
  const secs = Math.round((Date.now() - then) / 1000);
  const mins = Math.round(secs / 60);
  const hrs = Math.round(mins / 60);
  const days = Math.round(hrs / 24);
  if (secs < 60) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  if (days < 7) return `${days}d ago`;
  return then.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function escapeHTML(s) {
  const d = document.createElement("div");
  d.textContent = s ?? "";
  return d.innerHTML;
}

/* ---------- Render ---------- */
function buildFilters() {
  const cats = ["All", ...Array.from(new Set(state.items.map((i) => i.category)))];
  els.filters.innerHTML = cats
    .map(
      (c) =>
        `<button class="chip${c === state.filter ? " active" : ""}" data-cat="${escapeHTML(c)}">${escapeHTML(c)}</button>`
    )
    .join("");
  els.filters.querySelectorAll(".chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.filter = btn.dataset.cat;
      buildFilters();
      render();
    });
  });
}

function visibleItems() {
  const q = state.query.trim().toLowerCase();
  return state.items.filter((it) => {
    if (state.filter !== "All" && it.category !== state.filter) return false;
    if (q) {
      const hay = `${it.title} ${it.summary} ${it.source} ${it.source_full}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function cardHTML(it, idx) {
  const color = SECTOR_COLORS[it.category] || "var(--brand)";
  const tier1 = it.tier === 1 ? `<span class="tier1-dot">Official source</span>` : "";
  const link = it.link ? escapeHTML(it.link) : "#";
  return `
    <article class="card" style="--accent-bar:${color}; animation-delay:${Math.min(idx * 35, 350)}ms">
      <div class="card-top">
        <span class="badge" style="background:${color}">${escapeHTML(it.source)}</span>
        <span class="sector-tag">${escapeHTML(it.category)}</span>
        ${tier1}
        <span class="time">${relativeTime(it.published)}</span>
      </div>
      <h2><a href="${link}" target="_blank" rel="noopener">${escapeHTML(it.title)}</a></h2>
      ${it.summary ? `<p class="summary">${escapeHTML(it.summary)}</p>` : ""}
      <div class="card-foot">
        <a class="read-link" href="${link}" target="_blank" rel="noopener">
          Read at ${escapeHTML(it.source_full || it.source)}
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </a>
      </div>
    </article>`;
}

function render() {
  const items = visibleItems();
  els.empty.hidden = items.length > 0;
  els.feed.innerHTML = items.map(cardHTML).join("");
  els.count.textContent = `${items.length} update${items.length === 1 ? "" : "s"}`;
  if (state.generatedAt) {
    els.freshness.textContent = `Updated ${relativeTime(state.generatedAt)}`;
  }
}

function showSkeletons() {
  els.feed.innerHTML = Array.from({ length: 5 }, () => `<div class="skeleton"></div>`).join("");
}

/* ---------- Load ---------- */
async function load() {
  showSkeletons();
  try {
    const res = await fetch("feed.json", { cache: "no-store" });
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    state.items = data.items || [];
    state.generatedAt = data.generated_at || null;
  } catch (err) {
    els.feed.innerHTML = "";
    els.empty.hidden = false;
    els.empty.querySelector("p").textContent =
      "Couldn't load the feed. Run `python -m metfeed.fetch` to generate feed.json.";
    return;
  }
  buildFilters();
  render();
}

els.search.addEventListener("input", (e) => {
  state.query = e.target.value;
  render();
});

load();
