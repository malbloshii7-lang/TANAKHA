/**
 * STANDARD — Glossary Review Console · Frontend
 *
 * Loads terms.json + protocol.json, renders each entry as an editable card:
 *  - English (read-only) / Arabic (editable, RTL)
 *  - Approve / Un-approve with reviewer name recorded
 *  - Editing the Arabic of a confirmed entry reverts it to unconfirmed (server rule)
 */

let DATA = null;

document.addEventListener("DOMContentLoaded", loadAll);

async function loadAll() {
  try {
    const res = await fetch("/api/glossary");
    if (!res.ok) throw new Error("Failed to load glossaries");
    DATA = await res.json();
    render();
  } catch (e) {
    document.getElementById("gateBanner").textContent = "✗ " + e.message;
  }
}

function counts(data) {
  const c = data.entries.filter((e) => e.status === "confirmed").length;
  return { confirmed: c, total: data.entries.length };
}

function updateBanner() {
  const t = counts(DATA.terms);
  const p = counts(DATA.protocol);
  const banner = document.getElementById("gateBanner");
  const allDone = t.confirmed === t.total && p.confirmed === p.total;
  banner.className = "gate-banner " + (allDone ? "gate-open" : "gate-closed");
  banner.textContent = allDone
    ? `✓ GATE OPEN — all ${t.total} terms and ${p.total} protocol titles confirmed. Reply "Glossary approved" to proceed to Phase B.`
    : `⛔ GATE CLOSED — terms ${t.confirmed}/${t.total} · protocol ${p.confirmed}/${p.total} confirmed. Arabic rendering stays blocked until all are approved.`;
}

function render() {
  renderList("protocolList", "protocol", DATA.protocol.entries);
  renderList("termsList", "terms", DATA.terms.entries);
  updateBanner();
}

function renderList(containerId, file, entries) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  entries.forEach((entry) => container.appendChild(card(file, entry)));
}

function card(file, entry) {
  const div = document.createElement("div");
  div.className = "entry-card " + (entry.status === "confirmed" ? "entry-confirmed" : "entry-pending");

  const meta = entry.status === "confirmed"
    ? `Confirmed by ${entry.approved_by} on ${entry.approved_date}`
    : "Unconfirmed — review the Arabic, then approve";

  div.innerHTML = `
    <div class="entry-top">
      <span class="entry-id">${entry.id}</span>
      <span class="entry-badge">${entry.status === "confirmed" ? "✓ CONFIRMED" : "PENDING"}</span>
    </div>
    <div class="entry-en">${escapeHtml(entry.en)}</div>
    ${entry.context || entry.note ? `<div class="entry-context">${escapeHtml(entry.context || entry.note)}</div>` : ""}
    <textarea class="entry-ar" dir="rtl" spellcheck="false">${escapeHtml(entry.ar)}</textarea>
    <div class="entry-actions">
      <button type="button" class="btn-primary btn-approve">${entry.status === "confirmed" ? "Save correction (re-approve after)" : "Approve"}</button>
      ${entry.status === "confirmed" ? '<button type="button" class="btn-secondary btn-unapprove">Un-approve</button>' : '<button type="button" class="btn-secondary btn-save">Save Arabic only</button>'}
      <span class="entry-meta">${meta}</span>
    </div>
  `;

  const arBox = div.querySelector(".entry-ar");
  div.querySelector(".btn-approve").addEventListener("click", () =>
    update(file, entry.id, { ar: arBox.value, action: entry.status === "confirmed" ? "save" : "approve" })
  );
  const un = div.querySelector(".btn-unapprove");
  if (un) un.addEventListener("click", () => update(file, entry.id, { action: "unapprove" }));
  const sv = div.querySelector(".btn-save");
  if (sv) sv.addEventListener("click", () => update(file, entry.id, { ar: arBox.value, action: "save" }));

  return div;
}

async function update(file, id, fields) {
  const status = document.getElementById("status");
  try {
    const approved_by = document.getElementById("reviewer").value.trim();
    if (fields.action === "approve" && !approved_by) {
      throw new Error("Enter your reviewer name first — every approval is recorded.");
    }
    const res = await fetch("/api/glossary/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file, id, approved_by, ...fields }),
    });
    const j = await res.json();
    if (!res.ok) throw new Error(j.error || "Update failed");

    status.className = "status success";
    status.textContent = `✓ ${id} updated (${j.confirmed}/${j.total} confirmed in ${file}.json)`;
    await loadAll();
  } catch (e) {
    status.className = "status error";
    status.textContent = "✗ " + e.message;
  }
}

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
