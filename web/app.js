(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);

  const state = { file: null, style: null, result: null };

  // ---- theme switcher ----
  const THEME_KEY = "tanakha-theme";
  const THEMES = ["verdant", "noir-azure", "organic-warm"];
  const themeDots = document.querySelectorAll(".theme-dot");

  function applyTheme(name) {
    if (!THEMES.includes(name)) name = THEMES[0];
    document.documentElement.setAttribute("data-theme", name);
    localStorage.setItem(THEME_KEY, name);
    themeDots.forEach((dot) => dot.classList.toggle("active", dot.dataset.set === name));
  }

  themeDots.forEach((dot) => dot.addEventListener("click", () => applyTheme(dot.dataset.set)));
  applyTheme(localStorage.getItem(THEME_KEY) || THEMES[0]);

  // ---- upload ----
  const dropzone = $("dropzone");
  const fileInput = $("fileInput");
  const dzEmpty = $("dzEmpty");
  const dzPreview = $("dzPreview");

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
    if (!file || !file.type.startsWith("image/")) return;
    state.file = file;
    dzPreview.src = URL.createObjectURL(file);
    dzPreview.classList.remove("hidden");
    dzEmpty.classList.add("hidden");
    refreshButton();
  }

  // ---- style selection ----
  document.querySelectorAll(".style-card").forEach((card) => {
    card.addEventListener("click", () => {
      document.querySelectorAll(".style-card").forEach((c) => c.classList.remove("active"));
      card.classList.add("active");
      state.style = card.dataset.style;
      refreshButton();
    });
  });

  const visualizeBtn = $("visualizeBtn");
  function refreshButton() {
    visualizeBtn.disabled = !(state.file && state.style);
  }

  // ---- visualize ----
  visualizeBtn.addEventListener("click", async () => {
    if (!state.file || !state.style) return;
    show("processing");
    hide("studio");
    window.scrollTo({ top: 0, behavior: "smooth" });

    const fd = new FormData();
    fd.append("image", state.file);
    fd.append("style", state.style);

    try {
      const res = await fetch("/api/visualize", { method: "POST", body: fd });
      if (!res.ok) throw new Error("visualize failed");
      const data = await res.json();
      state.result = data;
      renderResult(data);
      hide("processing");
      show("result");
      $("result").scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      hide("processing");
      show("studio");
      alert("Something went wrong generating your makeover. Please try again.");
    }
  });

  // ---- render result ----
  function renderResult(data) {
    $("afterImg").src = data.after_url;
    $("beforeImg").src = data.before_url;
    setPos(50);
    renderBrief(data.brief);
  }

  function renderBrief(brief) {
    if (!brief) return;
    const feats = (brief.features || []).map((f) => `<li>${esc(f)}</li>`).join("");
    const plants = (brief.suggested_plants || []).map((p) => `<span class="chip">${esc(p)}</span>`).join("");
    $("brief").innerHTML = `
      <h3>Your ${esc(brief.style || "")} design</h3>
      <p class="summary">${esc(brief.summary || "")}</p>
      <div class="grid">
        <div><h4>Key features</h4><ul>${feats}</ul></div>
        <div><h4>Suggested plants</h4><div class="chips">${plants}</div></div>
      </div>
      <div class="budget">Estimated project budget: <b>${esc(brief.est_budget_range || "—")}</b></div>
    `;
  }

  // ---- before/after slider ----
  const baRange = $("baRange");
  function setPos(pct) {
    document.querySelector(".ba").style.setProperty("--pos", pct + "%");
    baRange.value = pct;
  }
  baRange.addEventListener("input", () => setPos(baRange.value));

  // ---- lead form ----
  $("leadForm").addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const email = $("leadEmail").value.trim();
    if (!email || !email.includes("@")) {
      alert("Please enter a valid email.");
      return;
    }
    const btn = $("leadBtn");
    btn.disabled = true;
    btn.textContent = "Sending…";

    const payload = {
      name: $("leadName").value.trim() || null,
      email,
      zip: $("leadZip").value.trim() || null,
      style: state.result?.style || state.style,
      brief: state.result?.brief || null,
      before_url: state.result?.before_url || null,
      after_url: state.result?.after_url || null,
    };

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("lead failed");
      hide("result");
      show("thankyou");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      btn.disabled = false;
      btn.textContent = "Get my free quote →";
      alert("Couldn't submit right now. Please try again.");
    }
  });

  // ---- helpers ----
  function show(id) { $(id).classList.remove("hidden"); }
  function hide(id) { $(id).classList.add("hidden"); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );
  }

  // ---- scroll reveal ----
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
    { threshold: 0.15 }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
})();
