/**
 * STANDARD — H.E. Speech Builder · Frontend Logic
 *
 * Single body editor is the source of truth:
 * - typing/pasting -> live preview via POST /api/parse (debounced)
 * - "Prepare H.E. speech" -> POST /api/prepare -> seeds the editor (phrase bank)
 * - "English copy" / "Arabic copy" -> POST /api/copy?lang=.. -> .docx download
 *
 * Formatting typed in the editor is reflected in the .docx:
 *   blank line = new paragraph · "- " = bullet · **text** = bold.
 *
 * All requests hit the local server only. No external calls.
 */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("speechForm");

  form.addEventListener("submit", handlePrepare);
  document.getElementById("copyEN").addEventListener("click", () => downloadCopy("en"));
  document.getElementById("copyAR").addEventListener("click", () => downloadCopy("ar"));

  // Live preview as the user types / pastes.
  ["bodyText", "audience", "closing", "language"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", schedulePreview);
      el.addEventListener("change", schedulePreview);
    }
  });
});

function gatherIntake() {
  return {
    occasion: document.getElementById("occasion").value,
    principal: document.getElementById("principal").value,
    audience: document.getElementById("audience").value,
    location: document.getElementById("location").value,
    date: document.getElementById("date").value,
    language: document.getElementById("language").value,
    closing: document.getElementById("closing").value,
    body: document.getElementById("bodyText").value,
  };
}

function setStatus(kind, msg) {
  const status = document.getElementById("status");
  status.className = `status ${kind}`;
  status.textContent = msg;
}

async function errorMessage(response, fallback) {
  try {
    const j = await response.json();
    if (j && j.error) return j.error;
  } catch (_) {}
  return fallback;
}

function renderPreview(data) {
  const block = document.getElementById("previewBlock");
  const pre = document.getElementById("preview");
  pre.textContent = data.preview;
  pre.dir = data.language === "ar" ? "rtl" : "ltr";
  block.style.display = "block";
}

// ---- live preview (debounced) ----
let previewTimer = null;
function schedulePreview() {
  if (previewTimer) clearTimeout(previewTimer);
  previewTimer = setTimeout(updatePreview, 350);
}

async function updatePreview() {
  const intake = gatherIntake();
  if (!intake.body.trim() && !intake.audience.trim()) {
    document.getElementById("previewBlock").style.display = "none";
    return;
  }
  try {
    const response = await fetch("/api/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(intake),
    });
    if (!response.ok) return;
    renderPreview(await response.json());
  } catch (_) {
    /* preview is best-effort */
  }
}

// ---- Prepare H.E. speech: seed the editor from the phrase bank ----
async function handlePrepare(e) {
  e.preventDefault();
  setStatus("loading", "Preparing H.E. speech…");

  try {
    const intake = gatherIntake();
    if (!intake.occasion || !intake.principal) {
      throw new Error("Occasion and Principal are required.");
    }

    const response = await fetch("/api/prepare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(intake),
    });
    if (!response.ok) throw new Error(await errorMessage(response, "Failed to prepare speech"));

    const data = await response.json();
    // Seed the single editor + salutation/closing the staffer can refine.
    if (!document.getElementById("audience").value.trim() && data.salutation) {
      document.getElementById("audience").value = data.salutation;
    }
    if (!document.getElementById("closing").value.trim() && data.closing) {
      document.getElementById("closing").value = data.closing;
    }
    document.getElementById("bodyText").value = data.bodyText;

    renderPreview(data);
    setStatus(
      "success",
      `✓ Draft seeded (${data.language === "ar" ? "Arabic" : "English"}). Edit the body, then download a copy.`
    );
  } catch (error) {
    setStatus("error", `✗ ${error.message}`);
  }
}

// ---- English copy / Arabic copy: faithful .docx ----
async function downloadCopy(lang) {
  setStatus("loading", `Generating ${lang === "ar" ? "Arabic" : "English"} copy…`);

  try {
    const intake = gatherIntake();
    if (!intake.occasion || !intake.principal) {
      throw new Error("Occasion and Principal are required.");
    }

    const response = await fetch(`/api/copy?lang=${lang}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(intake),
    });
    if (!response.ok) throw new Error(await errorMessage(response, "Failed to render document"));

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    const safe = (intake.occasion || "speech").replace(/\s+/g, "-");
    a.href = url;
    a.download = `${safe}-HE-${lang}.docx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();

    setStatus("success", `✓ ${lang === "ar" ? "Arabic" : "English"} copy downloaded.`);
  } catch (error) {
    setStatus("error", `✗ ${error.message}`);
  }
}
