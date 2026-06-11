(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);

  const state = { leads: [], q: "", style: "all", loadedAt: null };

  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );
  }

  // created_at is stored as naive UTC ISO ("2026-06-11T05:30:00").
  function parseUtc(s) {
    if (!s) return null;
    return new Date(/[Zz]|[+-]\d\d:\d\d$/.test(s) ? s : s + "Z");
  }

  function timeAgo(d) {
    if (!d) return "—";
    const mins = Math.floor((Date.now() - d.getTime()) / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} d ago`;
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  }

  // ---- data ----
  async function load() {
    try {
      const res = await fetch("/api/leads");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = await res.json();
      state.leads = body.leads || [];
      state.loadedAt = new Date();
      hide("errorState");
      renderStyleFilter();
      render();
    } catch (err) {
      hide("tableWrap");
      hide("emptyState");
      show("errorState");
      $("countLabel").textContent = "";
    }
  }

  function filtered() {
    const q = state.q.trim().toLowerCase();
    return state.leads.filter((l) => {
      if (state.style !== "all" && (l.style || "") !== state.style) return false;
      if (!q) return true;
      return [l.name, l.email, l.zip, l.address]
        .some((v) => v && String(v).toLowerCase().includes(q));
    });
  }

  // ---- rendering ----
  function render() {
    renderKpis();
    const rows = filtered();

    $("countLabel").textContent =
      `${rows.length} of ${state.leads.length} leads · updated ` +
      state.loadedAt.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

    if (!rows.length) {
      hide("tableWrap");
      $("emptyMsg").textContent = state.leads.length
        ? "No leads match your filters."
        : "No leads yet — share the visualizer and watch them sprout.";
      show("emptyState");
      return;
    }
    hide("emptyState");
    show("tableWrap");
    $("leadsBody").innerHTML = rows.map((l) => rowHtml(l) + detailHtml(l)).join("");
  }

  function renderKpis() {
    const now = Date.now();
    const within = (l, ms) => {
      const d = parseUtc(l.created_at);
      return d && now - d.getTime() <= ms;
    };
    $("kpiTotal").textContent = state.leads.length;
    $("kpiDay").textContent = state.leads.filter((l) => within(l, 24 * 3600e3)).length;
    $("kpiWeek").textContent = state.leads.filter((l) => within(l, 7 * 24 * 3600e3)).length;

    const counts = {};
    state.leads.forEach((l) => { if (l.style) counts[l.style] = (counts[l.style] || 0) + 1; });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    $("kpiStyle").textContent = top ? top[0] : "—";
    $("kpiStyleHint").textContent = top ? `${top[1]} request${top[1] === 1 ? "" : "s"}` : "most requested";
  }

  function renderStyleFilter() {
    const sel = $("styleFilter");
    const styles = [...new Set(state.leads.map((l) => l.style).filter(Boolean))].sort();
    const current = state.style;
    sel.innerHTML =
      `<option value="all">All styles</option>` +
      styles.map((s) => `<option value="${esc(s)}">${esc(s)}</option>`).join("");
    sel.value = styles.includes(current) ? current : "all";
    state.style = sel.value;
  }

  function rowHtml(l) {
    const d = parseUtc(l.created_at);
    return `
      <tr class="lead-row" data-id="${l.id}">
        <td>
          <span class="lead-name">${esc(l.name || "—")}</span>
          <a class="lead-email" href="mailto:${esc(l.email)}">${esc(l.email)}</a>
        </td>
        <td class="lead-when" title="${d ? esc(d.toLocaleString()) : ""}">${esc(timeAgo(d))}</td>
        <td>${l.style ? `<span class="style-tag">${esc(l.style)}</span>` : "—"}</td>
        <td>${esc(l.zip || "—")}</td>
        <td>${esc(l.brief?.est_budget_range || "—")}</td>
        <td><span class="pill ${esc(l.status || "")}">${esc(l.status || "—")}</span></td>
        <td><span class="chev">▸</span></td>
      </tr>`;
  }

  function detailHtml(l) {
    const b = l.brief;
    const briefHtml = b
      ? `
        <p class="summary">${esc(b.summary || "")}</p>
        ${(b.features || []).length ? `<ul>${b.features.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>` : ""}
        ${(b.suggested_plants || []).length
          ? `<div class="chips">${b.suggested_plants.map((p) => `<span class="chip">${esc(p)}</span>`).join("")}</div>`
          : ""}`
      : `<p class="none">No design brief attached.</p>`;

    const thumb = (url, tag) =>
      `<a href="${esc(url)}" target="_blank" rel="noopener"><img src="${esc(url)}" alt="${tag}" loading="lazy" /><span class="tag">${tag}</span></a>`;
    const mediaHtml = (l.before_url || l.after_url)
      ? `<div class="thumbs">
          ${l.before_url ? thumb(l.before_url, "Before") : ""}
          ${l.after_url ? thumb(l.after_url, "After") : ""}
        </div>`
      : `<p class="none">No renders attached.</p>`;

    return `
      <tr class="detail-row">
        <td colspan="7"><div class="inner detail">
          <div><h4>Design brief</h4>${briefHtml}</div>
          <div>
            <h4>Before / After</h4>${mediaHtml}
            ${l.address ? `<div class="contact">📍 ${esc(l.address)}</div>` : ""}
          </div>
        </div></td>
      </tr>`;
  }

  // ---- CSV export (respects current filters) ----
  function exportCsv() {
    const cols = ["id", "created_at", "name", "email", "zip", "address", "style", "status", "est_budget", "before_url", "after_url"];
    const abs = (u) => (u ? new URL(u, location.origin).href : "");
    const lines = [cols.join(",")].concat(
      filtered().map((l) =>
        [l.id, l.created_at, l.name, l.email, l.zip, l.address, l.style, l.status,
         l.brief?.est_budget_range, abs(l.before_url), abs(l.after_url)]
          .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
    );
    const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `tanakha-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // ---- events ----
  $("leadsBody").addEventListener("click", (ev) => {
    if (ev.target.closest("a")) return; // let mailto / image links work
    const tr = ev.target.closest("tr.lead-row");
    if (!tr) return;
    tr.classList.toggle("open");
    tr.nextElementSibling?.classList.toggle("open");
  });

  $("searchInput").addEventListener("input", (ev) => { state.q = ev.target.value; render(); });
  $("styleFilter").addEventListener("change", (ev) => { state.style = ev.target.value; render(); });
  $("refreshBtn").addEventListener("click", load);
  $("retryBtn").addEventListener("click", load);
  $("exportBtn").addEventListener("click", exportCsv);

  function show(id) { $(id).classList.remove("hidden"); }
  function hide(id) { $(id).classList.add("hidden"); }

  load();
})();
