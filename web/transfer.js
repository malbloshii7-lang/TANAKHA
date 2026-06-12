(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);

  const MAX_BYTES = 2 * 1024 ** 3;
  const state = { file: null };

  // ---- file picking ----
  const dropzone = $("dropzone");
  const fileInput = $("fileInput");

  dropzone.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", () => setFile(fileInput.files[0]));

  ["dragover", "dragenter"].forEach((e) =>
    dropzone.addEventListener(e, (ev) => {
      ev.preventDefault();
      dropzone.classList.add("drag");
    })
  );
  ["dragleave", "drop"].forEach((e) =>
    dropzone.addEventListener(e, (ev) => {
      ev.preventDefault();
      dropzone.classList.remove("drag");
    })
  );
  dropzone.addEventListener("drop", (ev) => {
    const f = ev.dataTransfer.files[0];
    if (f) setFile(f);
  });

  function setFile(file) {
    if (!file) return;
    if (file.size > MAX_BYTES) {
      showError(`That file is ${prettySize(file.size)} — the limit is 2 GB.`);
      return;
    }
    if (file.size === 0) {
      showError("That file is empty.");
      return;
    }
    hideError();
    state.file = file;
    $("dzFileName").textContent = file.name;
    $("dzFileSize").textContent = prettySize(file.size);
    $("dzFile").classList.remove("hidden");
    $("dzEmpty").classList.add("hidden");
    $("sendBtn").disabled = false;
  }

  // ---- upload (XHR for progress events) ----
  $("sendBtn").addEventListener("click", () => {
    if (!state.file) return;
    hide("uploadSection");
    show("progressSection");

    const fd = new FormData();
    fd.append("file", state.file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/transfers");

    xhr.upload.addEventListener("progress", (e) => {
      if (!e.lengthComputable) return;
      const pct = Math.round((e.loaded / e.total) * 100);
      $("progressFill").style.width = pct + "%";
      $("progressLabel").textContent =
        `Uploading… ${pct}% (${prettySize(e.loaded)} of ${prettySize(e.total)})`;
    });

    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        showResult(JSON.parse(xhr.responseText));
      } else if (xhr.status === 413) {
        failBack("That file is too large (max 2 GB).");
      } else {
        failBack("Upload failed. Please try again.");
      }
    });
    xhr.addEventListener("error", () => failBack("Network error during upload. Please try again."));

    xhr.send(fd);
  });

  function failBack(msg) {
    hide("progressSection");
    show("uploadSection");
    showError(msg);
  }

  // ---- result + sharing ----
  function showResult(data) {
    const link = window.location.origin + data.download_url;
    const expiry = new Date(data.expires_at).toLocaleDateString(undefined, {
      year: "numeric", month: "long", day: "numeric",
    });
    const name = data.filename;
    const size = prettySize(data.size_bytes);

    $("linkInput").value = link;
    $("expiryNote").textContent = `Anyone with the link can download "${name}" (${size}) until ${expiry}.`;

    const message = `Here's "${name}" (${size}):\n${link}\n\nLink expires ${expiry}.`;
    $("whatsappBtn").href = "https://wa.me/?text=" + encodeURIComponent(message);
    $("emailBtn").href =
      "mailto:?subject=" + encodeURIComponent(`File for you: ${name}`) +
      "&body=" + encodeURIComponent(message);

    hide("progressSection");
    show("resultSection");
  }

  $("copyBtn").addEventListener("click", async () => {
    const input = $("linkInput");
    try {
      await navigator.clipboard.writeText(input.value);
    } catch (err) {
      input.select();
      document.execCommand("copy");
    }
    const btn = $("copyBtn");
    btn.textContent = "Copied!";
    setTimeout(() => (btn.textContent = "Copy link"), 1600);
  });

  // ---- helpers ----
  function prettySize(bytes) {
    if (bytes < 1024) return bytes + " B";
    const units = ["KB", "MB", "GB"];
    let v = bytes, i = -1;
    do { v /= 1024; i++; } while (v >= 1024 && i < units.length - 1);
    return v.toFixed(v >= 100 ? 0 : 1) + " " + units[i];
  }
  function showError(msg) {
    const el = $("uploadError");
    el.textContent = msg;
    el.classList.remove("hidden");
  }
  function hideError() { $("uploadError").classList.add("hidden"); }
  function show(id) { $(id).classList.remove("hidden"); }
  function hide(id) { $(id).classList.add("hidden"); }
})();
