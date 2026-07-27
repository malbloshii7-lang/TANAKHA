/* PrimeAI Situation Room front-end.
 * Talks to /api/intel/* and /api/analysis/*. All rendering uses textContent /
 * createElement — source text is untrusted and must never be injected as HTML.
 */
"use strict";

const $ = (id) => document.getElementById(id);
const state = {
  briefId: null,
  sources: [],
  selected: new Set(),
  run: null,          // last analysis response
  runId: null,
};

const el = (tag, cls, text) => {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
};

async function api(path, opts = {}) {
  const res = await fetch(path, opts);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = typeof body.detail === "string"
      ? body.detail
      : JSON.stringify(body.detail || body);
    throw new Error(detail);
  }
  return body;
}

/* ───────────────────────── briefs + sources ───────────────────────── */

async function loadBriefs() {
  const { briefs } = await api("/api/intel/briefs");
  const sel = $("brief-select");
  sel.replaceChildren();
  const none = el("option", null, "— no brief (ad hoc) —");
  none.value = "";
  sel.appendChild(none);
  for (const b of briefs) {
    const o = el("option", null, b.title);
    o.value = b.brief_id;
    o.dataset.question = b.strategic_question || "";
    sel.appendChild(o);
  }
  if (briefs.length) {
    sel.value = briefs[0].brief_id;
    state.briefId = briefs[0].brief_id;
    $("brief-question").textContent = briefs[0].strategic_question || "";
    $("run-question").value = briefs[0].strategic_question || "";
  }
  sel.onchange = () => {
    state.briefId = sel.value || null;
    const opt = sel.selectedOptions[0];
    $("brief-question").textContent = opt?.dataset.question || "";
    $("run-question").value = opt?.dataset.question || "";
    loadSources();
  };
}

async function loadSources() {
  const qs = state.briefId ? `?brief_id=${encodeURIComponent(state.briefId)}` : "";
  const { sources } = await api(`/api/intel/sources${qs}`);
  state.sources = sources;
  state.selected = new Set(sources.map((s) => s.source_id));
  const list = $("src-list");
  list.replaceChildren();
  $("src-count").textContent = String(sources.length);
  for (const s of sources) {
    const li = el("li", "selected");
    li.id = `src-item-${s.source_id}`;
    const title = el("div", null, s.title || s.source_id);
    title.dir = "auto";
    const lang = el("span", "lang-tag", (s.language || "?").toUpperCase());
    title.appendChild(lang);
    const meta = el("div", "meta",
      `${s.publisher || "unknown publisher"} · ${s.publication_date || "no date"}` +
      ` · ${s.reliability} · ${s.source_id}`);
    li.append(title, meta);
    li.onclick = () => {
      if (state.selected.has(s.source_id)) {
        state.selected.delete(s.source_id);
        li.classList.remove("selected");
      } else {
        state.selected.add(s.source_id);
        li.classList.add("selected");
      }
    };
    list.appendChild(li);
  }
}

async function addPastedSource() {
  $("src-error").textContent = "";
  try {
    const body = {
      text: $("src-text").value,
      publisher: $("src-publisher").value || null,
      publication_date: $("src-pubdate").value || null,
      source_type: $("src-type").value,
      reliability: $("src-reliability").value,
      brief_id: state.briefId,
    };
    const out = await api("/api/intel/sources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    $("src-text").value = "";
    if (out.duplicate) $("src-error").textContent =
      `Duplicate content — already ingested as ${out.source_id}.`;
    await loadSources();
  } catch (e) {
    $("src-error").textContent = e.message;
  }
}

async function uploadFile(file) {
  $("src-error").textContent = "";
  try {
    const form = new FormData();
    form.append("file", file);
    if (state.briefId) form.append("brief_id", state.briefId);
    form.append("reliability", $("src-reliability").value);
    form.append("source_type", $("src-type").value);
    if ($("src-publisher").value) form.append("publisher", $("src-publisher").value);
    if ($("src-pubdate").value) form.append("publication_date", $("src-pubdate").value);
    await api("/api/intel/sources/upload", { method: "POST", body: form });
    await loadSources();
  } catch (e) {
    $("src-error").textContent = e.message;
  }
}

/* ───────────────────────── analysis run ───────────────────────── */

async function runAnalysis() {
  $("run-error").textContent = "";
  $("run-btn").disabled = true;
  $("run-btn").textContent = "Analyzing…";
  try {
    const body = {
      brief_id: state.briefId,
      source_ids: [...state.selected],
      strategic_question: $("run-question").value || null,
      knowledge_cutoff: $("run-cutoff").value || null,
      provider: $("run-provider").value,
    };
    const run = await api("/api/analysis/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    state.run = run;
    state.runId = run.analysis_run_id;
    renderRun(run);
  } catch (e) {
    $("run-error").textContent = e.message;
  } finally {
    $("run-btn").disabled = false;
    $("run-btn").textContent = "Run intelligence analysis";
  }
}

/* ───────────────────────── rendering ───────────────────────── */

function renderRun(run) {
  $("empty-state").classList.add("hidden");
  $("briefing").classList.remove("hidden");
  const b = run.briefing || {};

  $("run-meta").textContent =
    `${run.analysis_run_id} · ${run.provider.provider}` +
    (run.provider.model_id ? ` (${run.provider.model_id})` : "");

  // Provider strip: provider, model, cutoff, evidence count, confidence.
  const strip = $("provider-strip");
  strip.replaceChildren();
  const bits = [
    ["Provider", run.provider.provider],
    ["Model", run.provider.model_id || "—"],
    ["Knowledge cutoff", b.knowledge_cutoff || "not set"],
    ["Evidence", `${(b.counts && b.counts.sources) || 0} sources`],
    ["Events", String((b.counts && b.counts.events) || 0)],
    ["Claims",
      `${b.counts?.observed_claims ?? 0} observed / ` +
      `${b.counts?.inferred_claims ?? 0} inferred / ` +
      `${b.counts?.forecasts ?? 0} forecast`],
    ["Contradictions", String(b.counts?.contradictions ?? 0)],
  ];
  for (const [k, v] of bits) {
    const span = el("span", null, `${k}: `);
    span.appendChild(el("b", null, v));
    strip.appendChild(span);
  }

  // Warnings — includes blocked unsupported claims.
  const warn = $("warnings");
  warn.replaceChildren();
  for (const w of run.warnings || []) {
    warn.appendChild(el("div", "warning", `⚠ ${w}`));
  }
  if ((run.rejected_claims || []).length) {
    warn.appendChild(el("div", "warning",
      `⚠ ${run.rejected_claims.length} claim(s) were blocked by validation ` +
      `and excluded from this briefing.`));
  }

  const wc = $("what-changed");
  wc.textContent = b.what_changed || "";
  $("judgement").textContent = b.executive_judgement || "";

  // Confidence explanation.
  const conf = b.confidence || {};
  const box = $("confbox");
  box.replaceChildren();
  box.appendChild(el("div", null,
    `Analytical confidence: ${(conf.score ?? 0).toFixed(2)} — ${conf.explanation || ""}`));
  const bar = el("div", "confbar");
  const fill = el("span");
  fill.style.width = `${Math.round((conf.score || 0) * 100)}%`;
  bar.appendChild(fill);
  box.appendChild(bar);
  const factors = el("div", "factors");
  for (const [k, v] of Object.entries(conf.factors || {})) {
    factors.appendChild(el("span", null, `${k}: ${v}`));
  }
  box.appendChild(factors);

  // Why it matters, with claim navigation.
  const why = $("why-matters");
  why.replaceChildren();
  for (const item of b.why_it_matters || []) {
    const li = el("li", null, item.point);
    for (const cid of item.claim_ids || []) {
      const a = el("span", "claimref", cid);
      a.onclick = () => focusClaim(cid);
      li.appendChild(a);
    }
    why.appendChild(li);
  }

  // Implications.
  const imps = $("implications");
  imps.replaceChildren();
  for (const imp of run.uae_implications || []) {
    const div = el("div", `impl ${imp.direction}`);
    div.appendChild(el("div", "dim",
      `${imp.dimension} · ${imp.direction} · ${imp.time_horizon} · ` +
      `confidence ${imp.confidence} · ${imp.stakeholder}`));
    const st = el("div", null, imp.statement);
    for (const cid of imp.supporting_claim_ids || []) {
      const a = el("span", "claimref", cid);
      a.onclick = () => focusClaim(cid);
      st.appendChild(a);
    }
    div.appendChild(st);
    div.appendChild(el("div", "ind", `Watch: ${imp.monitoring_indicator}`));
    imps.appendChild(div);
  }
  if (!(run.uae_implications || []).length) {
    imps.appendChild(el("p", "hint",
      "No dimension produced a material, claim-backed implication."));
  }

  // Scenarios.
  $("scenario-note").textContent = b.scenario_note || "";
  const scen = $("scenarios");
  scen.replaceChildren();
  for (const sc of run.scenarios || []) {
    const div = el("div", `scenario ${sc.scenario_type}`);
    div.appendChild(el("div", "prob", `${sc.probability}%`));
    div.appendChild(el("h3", null,
      `${sc.scenario_type.toUpperCase()} — ${sc.title}`));
    div.appendChild(el("div", null, sc.summary));
    div.appendChild(el("h4", null, `Horizon ${sc.time_horizon} · assumptions`));
    div.appendChild(ulOf(sc.assumptions));
    div.appendChild(el("h4", null, "Confirming indicators"));
    div.appendChild(ulOf(sc.confirming_indicators));
    div.appendChild(el("h4", null, "Weakening indicators"));
    div.appendChild(ulOf(sc.weakening_indicators));
    div.appendChild(el("h4", null, "UAE opportunity"));
    div.appendChild(el("div", null, sc.uae_opportunity));
    div.appendChild(el("h4", null, "UAE risk"));
    div.appendChild(el("div", null, sc.uae_risk));
    scen.appendChild(div);
  }

  // Indicators.
  const inds = $("indicators");
  inds.replaceChildren();
  for (const ind of b.indicators_to_watch || []) {
    inds.appendChild(el("li", null, ind));
  }

  $("takeaway").textContent = b.leadership_takeaway || "";

  // Contradictions.
  const ctr = $("contradictions");
  ctr.replaceChildren();
  $("ctr-count").textContent = String((run.contradictions || []).length);
  for (const c of run.contradictions || []) {
    const div = el("div", "ctr");
    div.appendChild(el("div", "kind",
      `${c.kind}${c.material ? " · material · in review queue" : ""}`));
    div.appendChild(el("div", null, c.description));
    const sides = el("div", "sides");
    sides.appendChild(sideBox("Side A", c.side_a));
    sides.appendChild(sideBox("Side B", c.side_b));
    div.appendChild(sides);
    ctr.appendChild(div);
  }
  if (!(run.contradictions || []).length) {
    ctr.appendChild(el("p", "hint", "No contradictions detected across sources."));
  }

  renderClaims(run.claims || []);

  // Events.
  const evs = $("events");
  evs.replaceChildren();
  for (const ev of run.events || []) {
    const row = el("div", "event-row");
    row.appendChild(el("span", "date", ev.event_date ||
      (ev.event_period ? `${ev.event_period}` : "undated")));
    if (!ev.event_date && ev.event_period) {
      row.appendChild(el("span", "period-tag", "period"));
    }
    row.appendChild(el("span", null, ev.actor_name));
    row.appendChild(el("span", "arrow", `— ${ev.action} →`));
    const tgt = el("span", null, ev.target || "");
    tgt.dir = "auto";
    row.appendChild(tgt);
    if (ev.location) row.appendChild(el("span", "period-tag", ev.location));
    for (const sid of ev.source_ids || []) {
      const a = el("span", "srclink", sid);
      a.onclick = () => flashSource(sid);
      row.appendChild(a);
    }
    evs.appendChild(row);
  }

  // Appendix.
  const app = $("appendix");
  app.replaceChildren();
  for (const s of b.source_appendix || []) {
    const div = el("div", "appendix-item");
    const t = el("span", null, `${s.source_id} — ${s.title || "untitled"}`);
    t.dir = "auto";
    div.appendChild(t);
    div.appendChild(el("span", "rel",
      ` · ${s.publisher || "unknown"} · ${s.publication_date || "no date"} · ` +
      `${s.language || "?"} · reliability: ${s.reliability}`));
    div.onclick = () => flashSource(s.source_id);
    app.appendChild(div);
  }
}

function ulOf(items) {
  const ul = el("ul");
  for (const item of items || []) ul.appendChild(el("li", null, item));
  return ul;
}

function sideBox(label, side) {
  const div = el("div");
  if (!side) return div;
  const lines = [label + ":"];
  if (side.kind) lines.push(`kind=${side.kind}`);
  if (side.date) lines.push(`date=${side.date}`);
  if (side.excerpt) lines.push(`"${side.excerpt}"`);
  if (side.publisher) lines.push(`publisher=${side.publisher}`);
  div.textContent = lines.join(" ");
  for (const sid of side.source_ids || []) {
    const a = el("span", "srclink", sid);
    a.onclick = () => flashSource(sid);
    div.appendChild(a);
  }
  return div;
}

function renderClaims(claims) {
  const box = $("claims");
  box.replaceChildren();
  $("claim-count").textContent = String(claims.length);
  for (const c of claims) {
    const div = el("div", "claim");
    div.id = `claim-${c.claim_id}`;
    const head = el("div", "head");
    head.appendChild(el("span", `type-badge type-${c.claim_type}`, c.claim_type));
    head.appendChild(el("span", null, c.claim_id));
    head.appendChild(el("span",
      `status-badge status-${c.review_status || "pending"}`,
      `analyst: ${c.review_status || "pending"}`));
    head.appendChild(el("span", "conf",
      `confidence ${(c.confidence ?? 0).toFixed(2)}`));
    div.appendChild(head);
    const body = el("div", "body", c.text);
    body.dir = "auto";
    div.appendChild(body);

    const detail = el("div", "detail");
    if (c.claim_type === "forecast") {
      detail.appendChild(el("div", null,
        `Horizon: ${c.time_horizon} · assumptions: ${(c.assumptions || []).join("; ")}`));
      detail.appendChild(el("div", null,
        `Confirming: ${(c.confirming_indicators || []).join("; ")}`));
      detail.appendChild(el("div", null,
        `Weakening: ${(c.weakening_indicators || []).join("; ")}`));
    }
    if (c.reasoning) detail.appendChild(el("div", null, `Reasoning: ${c.reasoning}`));
    if (c.counterevidence) {
      const ce = Array.isArray(c.counterevidence)
        ? c.counterevidence.map((x) => x.note).join("; ")
        : c.counterevidence.note;
      detail.appendChild(el("div", null, `Counterevidence: ${ce || "—"}`));
    }
    const cb = c.confidence_breakdown;
    if (cb) detail.appendChild(el("div", null, `Confidence basis: ${cb.explanation}`));
    const cites = el("div", null, "Cited sources: ");
    for (const sid of c.source_ids || []) {
      const a = el("span", "srclink", sid);
      a.onclick = (ev) => { ev.stopPropagation(); flashSource(sid); };
      cites.appendChild(a);
    }
    detail.appendChild(cites);

    const actions = el("div", "actions");
    for (const status of ["reviewed", "approved", "rejected"]) {
      const btn = el("button", null, status);
      btn.onclick = async (ev) => {
        ev.stopPropagation();
        try {
          await api(`/api/analysis/runs/${state.runId}/claims/${c.claim_id}/review`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
          });
          c.review_status = status;
          renderClaims(claims);
        } catch (e) { alert(e.message); }
      };
      actions.appendChild(btn);
    }
    detail.appendChild(actions);
    div.appendChild(detail);
    div.onclick = () => div.classList.toggle("open");
    box.appendChild(div);
  }
}

function focusClaim(claimId) {
  const node = $(`claim-${claimId}`);
  if (!node) return;
  node.classList.add("open");
  node.scrollIntoView({ behavior: "smooth", block: "center" });
}

function flashSource(sourceId) {
  const node = $(`src-item-${sourceId}`);
  if (!node) return;
  node.scrollIntoView({ behavior: "smooth", block: "center" });
  node.classList.add("flash");
  setTimeout(() => node.classList.remove("flash"), 1600);
}

/* ───────────────────────── init ───────────────────────── */

$("src-add").onclick = addPastedSource;
$("src-file").onchange = (e) => {
  if (e.target.files[0]) uploadFile(e.target.files[0]);
  e.target.value = "";
};
$("run-btn").onclick = runAnalysis;

(async function init() {
  await loadBriefs();
  await loadSources();
})();
