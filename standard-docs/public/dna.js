/**
 * STANDARD — Speech DNA Studio · frontend
 * Step 1 analyze -> Step 2 fingerprint -> Step 3 generate -> Step 4 trace.
 * All calls hit the local server only.
 */

let FP = null;        // source fingerprint
let GENTEXT = null;   // generated speech

const $ = (id) => document.getElementById(id);

document.addEventListener("DOMContentLoaded", () => {
  $("btnAnalyze").addEventListener("click", analyze);
  $("btnGenerate").addEventListener("click", generate);
});

function setStatus(kind, msg) {
  const s = $("status");
  s.className = "status " + kind;
  s.textContent = msg;
}

async function post(url, body) {
  const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error || "Request failed");
  return j;
}

async function analyze() {
  try {
    setStatus("loading", "Measuring style DNA…");
    const j = await post("/api/dna/analyze", {
      text: $("srcText").value,
      name: $("srcName").value,
      lang: $("srcLang").value,
    });
    FP = j.fingerprint;
    renderFingerprint(FP);
    $("step2").style.display = "block";
    $("step3").style.display = "block";
    $("genLang").value = FP.lang;
    setStatus("success", "✓ Fingerprint extracted" + (j.saved ? ` and saved as '${j.saved}'` : "") + ". Now set a topic and create a speech.");
    $("step2").scrollIntoView({ behavior: "smooth" });
  } catch (e) { setStatus("error", "✗ " + e.message); }
}

function renderFingerprint(fp) {
  const cards = [
    [fp.words, "words"], [fp.sentences, "sentences"],
    [fp.avgSentenceLen, "avg words / sentence"], [fp.sentenceStd, "rhythm variance"],
    [fp.ttr, "vocabulary richness"], [fp.formalityPer1k, "formality /1k words"],
    [fp.triadsPer1k, "triads /1k words"], [fp.questionsPct + "%", "questions"],
    [fp.shortPct + "%", "short sentences"], [fp.longPct + "%", "long sentences"],
  ];
  $("fpGrid").innerHTML = cards.map(([v, k]) => `<div class="fp-card"><div class="v">${v}</div><div class="k">${k}</div></div>`).join("");
  $("sigChips").innerHTML = fp.signatures.length
    ? "<strong style='font-size:.8rem;letter-spacing:.1em;color:var(--muted)'>SIGNATURE PHRASES&nbsp;&nbsp;</strong>" +
      fp.signatures.map((s) => `<span dir="auto">${esc(s)}</span>`).join("")
    : "";
}

async function generate() {
  try {
    if (!FP) throw new Error("Extract a fingerprint first.");
    setStatus("loading", "Synthesizing in the measured style…");
    const lang = $("genLang").value;
    const j = await post("/api/dna/generate", {
      fingerprint: FP,
      topic: $("genTopic").value,
      lang,
      targetWords: +$("genWords").value || 220,
    });
    GENTEXT = j.text;
    const out = $("genOut");
    out.textContent = j.text;
    out.dir = lang === "ar" ? "rtl" : "ltr";
    out.style.display = "block";
    await trace(lang);
    setStatus("success", "✓ Speech created and traced against the source DNA below.");
  } catch (e) { setStatus("error", "✗ " + e.message); }
}

async function trace(lang) {
  const j = await post("/api/dna/trace", { fingerprint: FP, text: GENTEXT, lang });
  const t = j.trace;
  $("traceRows").innerHTML = t.dimensions.map((d) => `
    <div class="trace-row">
      <div class="lbl">${esc(d.label)} <span style="color:var(--muted)">(${d.source} → ${d.generated})</span></div>
      <div class="bar"><div class="fill" data-w="${d.score}"></div></div>
      <div class="pct">${d.score}%</div>
    </div>`).join("") + `
    <div class="trace-row">
      <div class="lbl">Signature phrase overlap</div>
      <div class="bar"><div class="fill" data-w="${t.signatureOverlap}"></div></div>
      <div class="pct">${t.signatureOverlap}%</div>
    </div>`;
  $("overall").innerHTML = `Overall DNA match&nbsp;&nbsp;<b>${t.overall}%</b>`;
  $("step4").style.display = "block";
  requestAnimationFrame(() =>
    document.querySelectorAll(".fill").forEach((f) => (f.style.width = f.dataset.w + "%"))
  );
  $("step4").scrollIntoView({ behavior: "smooth" });
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
