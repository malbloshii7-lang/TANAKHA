(() => {
  "use strict";

  const API = "/api/climate";
  const NEW_ITEM_MS = 5000;
  const ALERT_CYCLE_MS = 6000;

  const SOURCES = [
    { key: "all", label: "All Sources" },
    { key: "WMO", label: "WMO & Leaders" },
    { key: "NHMS", label: "NHMS Worldwide" },
    { key: "UN", label: "UN Agencies" },
    { key: "Climate", label: "Climate Science" },
    { key: "Finance", label: "Climate Finance" },
  ];

  const PLATFORM_ICONS = {
    twitter: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 100-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 11-2.882 0 1.441 1.441 0 012.882 0z"/></svg>',
    rss: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="19" r="2.2"/><path d="M3 10.4a10.6 10.6 0 0 1 10.6 10.6h-3.2A7.4 7.4 0 0 0 3 13.6z"/><path d="M3 3.4A17.6 17.6 0 0 1 20.6 21h-3.2A14.4 14.4 0 0 0 3 6.6z"/></svg>',
  };

  const els = {
    searchInput: document.getElementById("searchInput"),
    sourceFilters: document.getElementById("sourceFilters"),
    calendarList: document.getElementById("calendarList"),
    mobileToggle: document.getElementById("mobileToggle"),
    sidebar: document.getElementById("sidebar"),
    mobileOverlay: document.getElementById("mobileOverlay"),
    headerTitle: document.getElementById("headerTitle"),
    headerSubText: document.getElementById("headerSubText"),
    layoutToggle: document.getElementById("layoutToggle"),
    themeToggle: document.getElementById("themeToggle"),
    stats: document.getElementById("stats"),
    alertWrap: document.getElementById("alertWrap"),
    alertBanner: document.getElementById("alertBanner"),
    feed: document.getElementById("feed"),
    emptyState: document.getElementById("emptyState"),
    loadMore: document.getElementById("loadMore"),
  };

  const state = {
    layout: localStorage.getItem("cp_layout") || "card",
    theme: localStorage.getItem("cp_theme") || "warm",
    activeSource: "all",
    search: "",
    items: [],
    counts: { all: 0 },
    nextCursor: null,
    lastUpdated: Date.now(),
    alerts: [],
    alertIdx: 0,
    events: [],
  };

  // ── Fetch helpers ──
  async function fetchJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${url} -> ${res.status}`);
    return res.json();
  }

  function feedUrl(cursor) {
    const params = new URLSearchParams();
    if (state.activeSource !== "all") params.set("source", state.activeSource);
    if (state.search) params.set("search", state.search);
    if (cursor) params.set("cursor", cursor);
    return `${API}/feed?${params.toString()}`;
  }

  // ── Rendering ──
  function escapeHtml(s) {
    return String(s ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  function cardHtml(item, isNew) {
    const media = item.hasImage
      ? `<div class="cp-card-media"><span>${escapeHtml(item.imageLabel || "Attached media")}</span></div>`
      : "";
    const breaking = item.isBreaking
      ? `<span class="cp-breaking"><span class="dot"></span>Breaking</span>`
      : "";
    const icon = PLATFORM_ICONS[item.platform] || PLATFORM_ICONS.rss;
    return `
      <article class="cp-card${isNew ? " cp-new" : ""}" data-id="${escapeHtml(item.id)}">
        <span class="cp-card-new-tag"><span class="dot"></span>New</span>
        <div class="cp-card-author">
          <div class="cp-avatar">${escapeHtml(item.avatar)}</div>
          <div class="cp-card-author-meta">
            <div class="cp-card-author-line">
              <span class="cp-card-author-name">${escapeHtml(item.author)}</span>
              <span class="cp-badge" data-source="${escapeHtml(item.source)}">${escapeHtml(item.source)}</span>
            </div>
            <div class="cp-card-sub">
              ${icon}
              <span class="cp-card-handle">${escapeHtml(item.handle)}</span>
              <span class="cp-card-dot">·</span>
              <span class="cp-card-time" data-timestamp="${escapeHtml(item.timestamp)}">${escapeHtml(item.time)}</span>
            </div>
          </div>
        </div>
        <div class="cp-card-content">
          <p class="cp-card-text">${escapeHtml(item.text)}</p>
          ${media}
          <div class="cp-card-footer">
            ${breaking}
            <span class="cp-card-engagement">${escapeHtml(item.engagement || "")}</span>
          </div>
        </div>
      </article>`;
  }

  function renderFeed() {
    els.feed.dataset.layout = state.layout;
    els.feed.innerHTML = state.items.map((it) => cardHtml(it, it._isNew)).join("");
    els.emptyState.hidden = state.items.length > 0;
    els.loadMore.hidden = !state.nextCursor;
  }

  function renderSourceFilters() {
    els.sourceFilters.innerHTML = SOURCES.map((s) => {
      const active = s.key === state.activeSource;
      const count = state.counts[s.key] ?? 0;
      return `
        <button class="cp-source-btn${active ? " active" : ""}" data-key="${s.key}">
          <span class="cp-label">${s.label}</span>
          <span class="cp-count">${count}</span>
        </button>`;
    }).join("");
    els.headerTitle.textContent = SOURCES.find((s) => s.key === state.activeSource)?.label || "All Sources";
  }

  function eventHtml(ev, isNew) {
    return `
      <div class="cp-event${isNew ? " cp-new" : ""}" data-id="${escapeHtml(ev.id)}">
        <div class="cp-event-date">
          <span class="cp-event-day">${escapeHtml(ev.day)}</span>
          <span class="cp-event-month">${escapeHtml(ev.month)}</span>
        </div>
        <div class="cp-event-body">
          <div class="cp-event-title-row">
            <div class="cp-event-title">${escapeHtml(ev.title)}</div>
            ${isNew ? '<span class="cp-event-new-tag">New</span>' : ""}
          </div>
          <div class="cp-event-location">${escapeHtml(ev.location || "")}</div>
        </div>
      </div>`;
  }

  function renderCalendar() {
    els.calendarList.innerHTML = state.events.slice(0, 4).map((ev) => eventHtml(ev, ev._isNew)).join("");
  }

  function trendHtml(value) {
    if (value === null || value === undefined) return "";
    const up = value >= 0;
    return `<div class="cp-stat-trend ${up ? "up" : "down"}">${up ? "+" : ""}${value}% this week</div>`;
  }

  function renderStats(stats) {
    els.stats.innerHTML = `
      <div class="cp-stat">
        <div class="cp-stat-label">Posts Today</div>
        <div class="cp-stat-value">${stats.posts_today}</div>
        ${trendHtml(stats.posts_today_trend)}
      </div>
      <div class="cp-stat">
        <div class="cp-stat-label">Alerts</div>
        <div class="cp-stat-value">${stats.alerts}</div>
        ${trendHtml(stats.alerts_trend)}
      </div>
      <div class="cp-stat">
        <div class="cp-stat-label">Active Sources</div>
        <div class="cp-stat-value">${stats.active_sources}</div>
        ${trendHtml(stats.active_sources_trend)}
      </div>
      <div class="cp-stat">
        <div class="cp-stat-label">Engagement</div>
        <div class="cp-stat-value">${stats.engagement}</div>
        ${trendHtml(stats.engagement_trend)}
      </div>`;
    state.alerts = stats.recent_alerts || [];
    state.alertIdx = 0;
    renderAlert();
  }

  function renderAlert() {
    if (!state.alerts.length) {
      els.alertWrap.hidden = true;
      return;
    }
    els.alertWrap.hidden = false;
    const a = state.alerts[state.alertIdx % state.alerts.length];
    const counter = state.alerts.length > 1
      ? `<span class="cp-alert-count">${(state.alertIdx % state.alerts.length) + 1} / ${state.alerts.length}</span>`
      : "";
    els.alertBanner.innerHTML = `
      <span class="cp-alert-dot"></span>
      <div class="cp-alert-body">
        <span class="cp-alert-tag">Alert</span>
        ${escapeHtml(a.text)}
        <span class="cp-alert-time">${escapeHtml(a.time)}</span>
      </div>
      ${counter}`;
  }

  function updateHeaderSub() {
    const secsAgo = Math.max(0, Math.round((Date.now() - state.lastUpdated) / 1000));
    const label = secsAgo < 2 ? "just now" : secsAgo < 60 ? `${secsAgo}s ago` : `${Math.round(secsAgo / 60)} min ago`;
    els.headerSubText.textContent = `${state.items.length} posts shown · updated ${label}`;
  }

  function refreshRelativeTimes() {
    document.querySelectorAll(".cp-card-time[data-timestamp]").forEach((el) => {
      el.textContent = relativeTime(el.dataset.timestamp);
    });
  }

  function relativeTime(iso) {
    const ts = new Date(iso).getTime();
    if (Number.isNaN(ts)) return "";
    const deltaS = Math.max(0, (Date.now() - ts) / 1000);
    if (deltaS < 90) return "just now";
    if (deltaS < 3600) return `${Math.floor(deltaS / 60)}m ago`;
    if (deltaS < 86400) return `${Math.floor(deltaS / 3600)}h ago`;
    return `${Math.floor(deltaS / 86400)}d ago`;
  }

  // ── Data loading ──
  async function loadFeed() {
    const data = await fetchJSON(feedUrl());
    state.items = data.items;
    state.nextCursor = data.next_cursor;
    state.counts = data.counts;
    renderFeed();
    renderSourceFilters();
    updateHeaderSub();
  }

  async function loadMore() {
    if (!state.nextCursor) return;
    const data = await fetchJSON(feedUrl(state.nextCursor));
    state.items = state.items.concat(data.items);
    state.nextCursor = data.next_cursor;
    renderFeed();
  }

  async function loadEvents() {
    const data = await fetchJSON(`${API}/events`);
    state.events = data.events;
    renderCalendar();
  }

  async function loadStats() {
    const data = await fetchJSON(`${API}/stats`);
    renderStats(data);
  }

  // ── SSE live updates ──
  function connectStream() {
    const source = new EventSource(`${API}/feed/stream`);
    source.addEventListener("item", (evt) => {
      const item = JSON.parse(evt.data);
      state.lastUpdated = Date.now();
      state.counts.all = (state.counts.all || 0) + 1;
      state.counts[item.source] = (state.counts[item.source] || 0) + 1;
      renderSourceFilters();

      const matchesSource = state.activeSource === "all" || item.source === state.activeSource;
      const q = state.search.toLowerCase();
      const matchesSearch = !q || item.text.toLowerCase().includes(q) || item.author.toLowerCase().includes(q);
      if (matchesSource && matchesSearch) {
        item._isNew = true;
        state.items = [item, ...state.items];
        renderFeed();
        updateHeaderSub();
        setTimeout(() => {
          item._isNew = false;
          const card = els.feed.querySelector(`.cp-card[data-id="${CSS.escape(item.id)}"]`);
          if (card) card.classList.remove("cp-new");
        }, NEW_ITEM_MS);
      } else {
        updateHeaderSub();
      }
    });
    source.addEventListener("calendar_event", (evt) => {
      const ev = JSON.parse(evt.data);
      ev._isNew = true;
      state.events = [ev, ...state.events];
      renderCalendar();
      setTimeout(() => {
        ev._isNew = false;
        const row = els.calendarList.querySelector(`.cp-event[data-id="${CSS.escape(ev.id)}"]`);
        if (row) row.classList.remove("cp-new");
      }, NEW_ITEM_MS);
    });
    source.onerror = () => {
      // EventSource auto-reconnects; nothing to do here beyond letting it retry.
    };
  }

  // ── Interaction wiring ──
  let searchDebounce;
  els.searchInput.addEventListener("input", (e) => {
    clearTimeout(searchDebounce);
    const value = e.target.value;
    searchDebounce = setTimeout(() => {
      state.search = value.trim();
      loadFeed().catch(console.error);
    }, 300);
  });

  els.sourceFilters.addEventListener("click", (e) => {
    const btn = e.target.closest(".cp-source-btn");
    if (!btn) return;
    state.activeSource = btn.dataset.key;
    loadFeed().catch(console.error);
  });

  els.layoutToggle.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-layout]");
    if (!btn) return;
    state.layout = btn.dataset.layout;
    localStorage.setItem("cp_layout", state.layout);
    [...els.layoutToggle.children].forEach((b) => b.classList.toggle("active", b === btn));
    renderFeed();
  });

  els.themeToggle.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-theme]");
    if (!btn) return;
    state.theme = btn.dataset.theme;
    localStorage.setItem("cp_theme", state.theme);
    document.body.setAttribute("data-theme", state.theme);
    [...els.themeToggle.children].forEach((b) => b.classList.toggle("active", b === btn));
  });

  els.loadMore.addEventListener("click", () => loadMore().catch(console.error));

  els.mobileToggle.addEventListener("click", () => {
    els.sidebar.classList.add("open");
    els.mobileOverlay.hidden = false;
  });
  els.mobileOverlay.addEventListener("click", () => {
    els.sidebar.classList.remove("open");
    els.mobileOverlay.hidden = true;
  });

  // ── Boot ──
  function applyStoredPrefs() {
    document.body.setAttribute("data-theme", state.theme);
    [...els.themeToggle.children].forEach((b) => b.classList.toggle("active", b.dataset.theme === state.theme));
    [...els.layoutToggle.children].forEach((b) => b.classList.toggle("active", b.dataset.layout === state.layout));
  }

  async function boot() {
    applyStoredPrefs();
    renderSourceFilters();
    await Promise.all([loadFeed(), loadEvents(), loadStats()]);
    connectStream();
    setInterval(updateHeaderSub, 1000);
    setInterval(refreshRelativeTimes, 30000);
    setInterval(() => {
      if (state.alerts.length > 1) {
        state.alertIdx += 1;
        renderAlert();
      }
    }, ALERT_CYCLE_MS);
    setInterval(() => loadStats().catch(console.error), 60000);
  }

  boot().catch((err) => {
    console.error("climate pulse: failed to boot", err);
  });
})();
