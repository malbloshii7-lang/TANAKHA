/**
 * STANDARD — H.E. Speech Builder · Frontend Logic
 *
 * - "Prepare H.E. speech" -> POST /api/prepare -> on-page preview (offline draft)
 * - "English copy" / "Arabic copy" -> POST /api/copy?lang=.. -> .docx download
 *
 * All requests hit the local server only. No external calls.
 */

let paragraphCount = 0;

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("speechForm");
  const addBtn = document.getElementById("addParagraph");

  addBtn.addEventListener("click", addParagraph);
  form.addEventListener("submit", handlePrepare);
  document.getElementById("copyEN").addEventListener("click", () => downloadCopy("en"));
  document.getElementById("copyAR").addEventListener("click", () => downloadCopy("ar"));

  addParagraph();
});

function addParagraph() {
  paragraphCount++;
  const container = document.getElementById("bodyItems");

  const item = document.createElement("div");
  item.className = "body-item";
  item.id = `para-${paragraphCount}`;

  item.innerHTML = `
    <div class="body-item-controls">
      <label>
        <input type="checkbox" class="bold-checkbox" /> Bold lead-in
      </label>
      <label>
        <input type="checkbox" class="list-checkbox" /> Add list
      </label>
      <button type="button" class="btn-secondary" onclick="removeParagraph(${paragraphCount})">Remove</button>
    </div>
    <textarea class="para-text" placeholder="Paragraph text or talking point..."></textarea>
    <div class="list-items" style="display: none;">
      <div class="list-item">
        <input type="text" class="list-item-input" placeholder="List item 1...">
        <button type="button" onclick="removeListItem(this)">Remove</button>
      </div>
      <button type="button" class="btn-secondary" onclick="addListItem(this)">+ Add item</button>
    </div>
  `;

  const listCheckbox = item.querySelector(".list-checkbox");
  const listItems = item.querySelector(".list-items");
  listCheckbox.addEventListener("change", () => {
    listItems.style.display = listCheckbox.checked ? "block" : "none";
  });

  container.appendChild(item);
}

function removeParagraph(id) {
  const el = document.getElementById(`para-${id}`);
  if (el) el.remove();
}

function addListItem(button) {
  const parent = button.parentElement;
  const newItem = document.createElement("div");
  newItem.className = "list-item";
  newItem.innerHTML = `
    <input type="text" class="list-item-input" placeholder="List item...">
    <button type="button" onclick="removeListItem(this)">Remove</button>
  `;
  parent.insertBefore(newItem, button);
}

function removeListItem(button) {
  button.parentElement.remove();
}

/** Collect the form into the intake shape the server expects. */
function gatherIntake() {
  const intake = {
    occasion: document.getElementById("occasion").value,
    principal: document.getElementById("principal").value,
    audience: document.getElementById("audience").value,
    location: document.getElementById("location").value,
    date: document.getElementById("date").value,
    language: document.getElementById("language").value,
    closing: document.getElementById("closing").value,
    body: [],
  };

  document.querySelectorAll(".body-item").forEach((item) => {
    const text = item.querySelector(".para-text").value;
    const bold = item.querySelector(".bold-checkbox").checked;
    const hasList = item.querySelector(".list-checkbox").checked;

    if (text || hasList) {
      const bodyItem = { text, bold };
      if (hasList) {
        const listInputs = item.querySelectorAll(".list-item-input");
        bodyItem.list = {
          marker: "bullet",
          items: Array.from(listInputs).map((inp) => inp.value).filter((v) => v),
        };
      }
      intake.body.push(bodyItem);
    }
  });

  return intake;
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
    const block = document.getElementById("previewBlock");
    const pre = document.getElementById("preview");
    pre.textContent = data.preview;
    pre.dir = data.language === "ar" ? "rtl" : "ltr";
    block.style.display = "block";

    setStatus("success", `✓ Draft ready (${data.language === "ar" ? "Arabic" : "English"}). Review the preview, then download a copy.`);
  } catch (error) {
    setStatus("error", `✗ ${error.message}`);
  }
}

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
