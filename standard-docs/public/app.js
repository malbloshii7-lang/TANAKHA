/**
 * STANDARD — Frontend Logic
 *
 * Form intake, dynamic paragraphs, submission to /api/render
 */

let paragraphCount = 0;

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("speechForm");
  const addBtn = document.getElementById("addParagraph");

  addBtn.addEventListener("click", addParagraph);
  form.addEventListener("submit", handleSubmit);

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
    <textarea class="para-text" placeholder="Paragraph text..."></textarea>
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

async function handleSubmit(e) {
  e.preventDefault();

  const status = document.getElementById("status");
  status.className = "status loading";
  status.textContent = "Generating document...";

  try {
    const occasion = document.getElementById("occasion").value;
    const principal = document.getElementById("principal").value;
    const audience = document.getElementById("audience").value;
    const location = document.getElementById("location").value;
    const date = document.getElementById("date").value;
    const language = document.getElementById("language").value;
    const closing = document.getElementById("closing").value;

    const bodyItems = [];
    document.querySelectorAll(".body-item").forEach((item) => {
      const text = item.querySelector(".para-text").value;
      const bold = item.querySelector(".bold-checkbox").checked;
      const hasList = item.querySelector(".list-checkbox").checked;

      if (text || hasList) {
        const bodyItem = { text, bold };
        if (hasList) {
          const listInputs = item.querySelectorAll(".list-item-input");
          const items = Array.from(listInputs).map((inp) => inp.value).filter((v) => v);
          bodyItem.list = { marker: "bullet", items };
        }
        bodyItems.push(bodyItem);
      }
    });

    if (!occasion || !principal || !audience || !language || !closing) {
      throw new Error("Please fill in all required fields");
    }

    const response = await fetch("/api/render", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ occasion, principal, audience, location, date, language, body: bodyItems, closing })
    });

    if (!response.ok) {
      let msg = "Failed to render document";
      try { const j = await response.json(); if (j.error) msg = j.error; } catch (_) {}
      throw new Error(msg);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${occasion.replace(/\s+/g, "-")}-${language}.docx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();

    status.className = "status success";
    status.textContent = "✓ Document generated and downloaded!";
  } catch (error) {
    status.className = "status error";
    status.textContent = `✗ Error: ${error.message}`;
  }
}
