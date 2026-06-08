// WMO Presidential Campaign Portal — Phase 1 front-end (vanilla JS PWA)

// ---------- i18n ----------
const I18N = {
  en: {
    appTitle: "WMO Presidential Campaign Portal",
    appShort: "Campaign Portal",
    teamOnly: "Private — campaign team only",
    username: "Username", password: "Password", signIn: "Sign in",
    logout: "Logout", save: "Save", cancel: "Cancel", del: "Delete",
    edit: "Edit", close: "Close",
    navStatus: "Status", navContacts: "Contacts", navDocuments: "Documents",
    editStatus: "Update status", phase: "Phase", voteEstimate: "Vote estimate",
    regionalSnapshot: "Regional snapshot", keyDates: "Key dates",
    noteEn: "Note (English)", noteAr: "Note (Arabic)", updatedBy: "Updated by",
    searchContacts: "Search contacts…", allRoles: "All roles", embassy: "Embassy",
    other: "Other", allStances: "All stances", supportive: "Supportive",
    neutral: "Neutral", opposed: "Opposed", unknown: "Unknown",
    addContact: "+ Add", uploadDoc: "+ Upload",
    name: "Name", country: "Country", role: "Role", region: "Region",
    organization: "Organization", email: "Email", phone: "Phone",
    language: "Language", owner: "Relationship owner", stance: "Stance",
    lastContact: "Last contact", nextAction: "Next action", notes: "Notes",
    titleEn: "Title (English)", titleAr: "Title (Arabic)", docType: "Type",
    version: "Version", file: "File", share: "Share", shareVia: "Share via",
    copyLink: "Copy link", whatsapp: "WhatsApp", emailShare: "Email",
    linkCopied: "Link copied", views: "views", noContacts: "No contacts yet.",
    noDocs: "No documents yet.", confirmDel: "Delete this item?",
    cv: "CV", portfolio: "Portfolio", vision: "Vision", endorsement: "Endorsement",
  },
  ar: {
    appTitle: "بوابة الحملة الرئاسية للمنظمة العالمية للأرصاد الجوية",
    appShort: "بوابة الحملة",
    teamOnly: "خاص — فريق الحملة فقط",
    username: "اسم المستخدم", password: "كلمة المرور", signIn: "تسجيل الدخول",
    logout: "تسجيل الخروج", save: "حفظ", cancel: "إلغاء", del: "حذف",
    edit: "تعديل", close: "إغلاق",
    navStatus: "الحالة", navContacts: "جهات الاتصال", navDocuments: "المستندات",
    editStatus: "تحديث الحالة", phase: "المرحلة", voteEstimate: "تقدير الأصوات",
    regionalSnapshot: "نظرة إقليمية", keyDates: "تواريخ مهمة",
    noteEn: "ملاحظة (إنجليزي)", noteAr: "ملاحظة (عربي)", updatedBy: "حُدّث بواسطة",
    searchContacts: "ابحث في جهات الاتصال…", allRoles: "كل الأدوار", embassy: "سفارة",
    other: "أخرى", allStances: "كل المواقف", supportive: "مؤيد",
    neutral: "محايد", opposed: "معارض", unknown: "غير معروف",
    addContact: "+ إضافة", uploadDoc: "+ رفع",
    name: "الاسم", country: "الدولة", role: "الدور", region: "الإقليم",
    organization: "الجهة", email: "البريد الإلكتروني", phone: "الهاتف",
    language: "اللغة", owner: "مسؤول العلاقة", stance: "الموقف",
    lastContact: "آخر تواصل", nextAction: "الإجراء التالي", notes: "ملاحظات",
    titleEn: "العنوان (إنجليزي)", titleAr: "العنوان (عربي)", docType: "النوع",
    version: "الإصدار", file: "الملف", share: "مشاركة", shareVia: "مشاركة عبر",
    copyLink: "نسخ الرابط", whatsapp: "واتساب", emailShare: "بريد",
    linkCopied: "تم نسخ الرابط", views: "مشاهدات", noContacts: "لا توجد جهات اتصال بعد.",
    noDocs: "لا توجد مستندات بعد.", confirmDel: "حذف هذا العنصر؟",
    cv: "السيرة الذاتية", portfolio: "ملف الأعمال", vision: "الرؤية", endorsement: "تزكية",
  },
};

let lang = localStorage.getItem("wmo_lang") || "en";
const t = (k) => (I18N[lang][k] ?? I18N.en[k] ?? k);

function applyLang() {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
    el.placeholder = t(el.dataset.i18nPh);
  });
  const other = lang === "ar" ? "English" : "العربية";
  ["loginLang", "langToggle"].forEach((id) => {
    const b = document.getElementById(id);
    if (b) b.textContent = other;
  });
  localStorage.setItem("wmo_lang", lang);
  if (state.token) renderAll();
}
function toggleLang() { lang = lang === "ar" ? "en" : "ar"; applyLang(); }

// ---------- state + api ----------
const state = { token: localStorage.getItem("wmo_token") || "", role: "viewer",
                contacts: [], documents: [], status: null };

async function api(path, opts = {}) {
  const headers = opts.headers || {};
  if (state.token) headers["Authorization"] = "Bearer " + state.token;
  if (opts.json !== undefined) {
    headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(opts.json);
  }
  const res = await fetch("/api/portal" + path, { ...opts, headers });
  if (res.status === 401) { doLogout(); throw new Error("auth"); }
  if (!res.ok) {
    let msg = "Error";
    try { msg = (await res.json()).detail || msg; } catch {}
    throw new Error(msg);
  }
  return res.status === 204 ? null : res.json();
}

// ---------- auth ----------
const $ = (id) => document.getElementById(id);

function showApp() {
  $("login").hidden = true;
  $("app").hidden = false;
  document.querySelectorAll(".editor-only").forEach((el) =>
    el.classList.toggle("hide", !["admin", "editor"].includes(state.role)));
  renderAll();
}
function doLogout() {
  state.token = ""; localStorage.removeItem("wmo_token");
  $("app").hidden = true; $("login").hidden = false;
}

$("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const err = $("loginError"); err.hidden = true;
  try {
    const data = await api("/login", {
      method: "POST", json: { username: $("username").value, password: $("password").value },
    });
    state.token = data.token; state.role = data.user.role;
    localStorage.setItem("wmo_token", data.token);
    if (data.user.lang) { lang = data.user.lang; applyLang(); }
    showApp();
  } catch (ex) { err.textContent = ex.message; err.hidden = false; }
});
$("logout").addEventListener("click", doLogout);
$("loginLang").addEventListener("click", toggleLang);
$("langToggle").addEventListener("click", toggleLang);

// ---------- tabs ----------
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((x) => x.classList.remove("active"));
    tab.classList.add("active");
    document.querySelectorAll(".panel").forEach((p) => (p.hidden = true));
    $("tab-" + tab.dataset.tab).hidden = false;
  });
});

// ---------- render ----------
function esc(s) { return (s ?? "").toString().replace(/[&<>"]/g,
  (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

async function renderAll() {
  await Promise.all([loadStatus(), loadContacts(), loadDocuments()]);
}

// Status
async function loadStatus() {
  try { state.status = (await api("/status")).status; } catch { return; }
  const s = state.status || {};
  const note = lang === "ar" ? (s.note_ar || s.note_en) : (s.note_en || s.note_ar);
  $("statusCard").innerHTML = `
    <div class="phase">${esc(s.phase) || "—"}</div>
    <dl>
      <dt>${t("voteEstimate")}</dt><dd>${esc(s.vote_estimate) || "—"}</dd>
      <dt>${t("regionalSnapshot")}</dt><dd>${esc(s.regional_snapshot) || "—"}</dd>
      <dt>${t("keyDates")}</dt><dd>${esc(s.key_dates) || "—"}</dd>
    </dl>
    ${note ? `<p>${esc(note)}</p>` : ""}
    <p class="meta muted">${t("updatedBy")}: ${esc(s.updated_by) || "—"} · ${esc((s.updated_at || "").replace("T", " "))}</p>`;
}
$("editStatusBtn").addEventListener("click", () => {
  const s = state.status || {};
  $("s_phase").value = s.phase || ""; $("s_vote").value = s.vote_estimate || "";
  $("s_region").value = s.regional_snapshot || ""; $("s_dates").value = s.key_dates || "";
  $("s_note_en").value = s.note_en || ""; $("s_note_ar").value = s.note_ar || "";
  $("statusForm").hidden = false; $("editStatusBtn").hidden = true;
});
$("cancelStatus").addEventListener("click", () => {
  $("statusForm").hidden = true; $("editStatusBtn").hidden = false;
});
$("statusForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  await api("/status", { method: "POST", json: {
    phase: $("s_phase").value, vote_estimate: $("s_vote").value,
    regional_snapshot: $("s_region").value, key_dates: $("s_dates").value,
    note_en: $("s_note_en").value, note_ar: $("s_note_ar").value } });
  $("statusForm").hidden = true; $("editStatusBtn").hidden = false;
  loadStatus();
});

// Contacts
async function loadContacts() {
  try { state.contacts = (await api("/contacts")).contacts; } catch { return; }
  renderContacts();
}
function renderContacts() {
  const q = ($("contactSearch").value || "").toLowerCase();
  const fr = $("filterRole").value, fs = $("filterStance").value;
  const editor = ["admin", "editor"].includes(state.role);
  const list = state.contacts.filter((c) =>
    (!fr || c.role === fr) && (!fs || (c.stance || "unknown") === fs) &&
    (!q || [c.name, c.country, c.organization, c.owner].join(" ").toLowerCase().includes(q)));
  const host = $("contactList");
  if (!list.length) { host.innerHTML = `<p class="muted">${t("noContacts")}</p>`; return; }
  host.innerHTML = list.map((c) => {
    const st = c.stance || "unknown";
    return `<div class="card item">
      <h4>${esc(c.name)}</h4>
      <div class="badges">
        ${c.role ? `<span class="badge">${esc(c.role)}</span>` : ""}
        ${c.region ? `<span class="badge">${esc(c.region)}</span>` : ""}
        <span class="badge ${st}">${t(st)}</span>
      </div>
      <div class="meta">${esc(c.country) || ""}${c.organization ? " · " + esc(c.organization) : ""}</div>
      ${c.next_action ? `<div class="meta"><b>${t("nextAction")}:</b> ${esc(c.next_action)}</div>` : ""}
      ${c.owner ? `<div class="meta">${t("owner")}: ${esc(c.owner)}</div>` : ""}
      ${editor ? `<div class="actions">
        <button class="ghost" data-edit="${c.id}">${t("edit")}</button>
        <button class="ghost danger" data-del="${c.id}">${t("del")}</button></div>` : ""}
    </div>`;
  }).join("");
  host.querySelectorAll("[data-edit]").forEach((b) =>
    b.addEventListener("click", () => contactForm(state.contacts.find((c) => c.id == b.dataset.edit))));
  host.querySelectorAll("[data-del]").forEach((b) =>
    b.addEventListener("click", async () => {
      if (!confirm(t("confirmDel"))) return;
      await api("/contacts/" + b.dataset.del, { method: "DELETE" }); loadContacts();
    }));
}
["contactSearch", "filterRole", "filterStance"].forEach((id) =>
  $(id).addEventListener("input", renderContacts));
$("addContactBtn").addEventListener("click", () => contactForm(null));

function field(id, key, val = "", type = "text") {
  return `<label>${t(key)}</label><input id="${id}" type="${type}" value="${esc(val)}" />`;
}
function contactForm(c) {
  const e = c || {};
  openModal(`
    <h3>${c ? t("edit") : t("addContact")}</h3>
    ${field("c_name", "name", e.name)}
    ${field("c_country", "country", e.country)}
    <label>${t("role")}</label>
    <select id="c_role">${["PR","MFA","Embassy","Other"].map((r) =>
      `<option ${e.role===r?"selected":""}>${r}</option>`).join("")}</select>
    <label>${t("region")}</label>
    <select id="c_region">${["","RA I","RA II","RA III","RA IV","RA V","RA VI"].map((r) =>
      `<option ${e.region===r?"selected":""}>${r}</option>`).join("")}</select>
    ${field("c_org", "organization", e.organization)}
    ${field("c_email", "email", e.email, "email")}
    ${field("c_phone", "phone", e.phone)}
    ${field("c_owner", "owner", e.owner)}
    <label>${t("stance")}</label>
    <select id="c_stance">${["supportive","neutral","opposed","unknown"].map((s) =>
      `<option value="${s}" ${ (e.stance||"unknown")===s?"selected":""}>${t(s)}</option>`).join("")}</select>
    ${field("c_next", "nextAction", e.next_action)}
    ${field("c_notes", "notes", e.notes)}
    <div class="row">
      <button id="saveContact">${t("save")}</button>
      <button class="ghost" id="closeModal">${t("cancel")}</button>
    </div>`);
  $("saveContact").addEventListener("click", async () => {
    const payload = {
      name: $("c_name").value, country: $("c_country").value, role: $("c_role").value,
      region: $("c_region").value, organization: $("c_org").value, email: $("c_email").value,
      phone: $("c_phone").value, owner: $("c_owner").value, stance: $("c_stance").value,
      next_action: $("c_next").value, notes: $("c_notes").value };
    try {
      if (c) await api("/contacts/" + c.id, { method: "PUT", json: payload });
      else await api("/contacts", { method: "POST", json: payload });
      closeModal(); loadContacts();
    } catch (ex) { alert(ex.message); }
  });
}

// Documents
async function loadDocuments() {
  try { state.documents = (await api("/documents")).documents; } catch { return; }
  renderDocuments();
}
function renderDocuments() {
  const editor = ["admin", "editor"].includes(state.role);
  const host = $("docList");
  if (!state.documents.length) { host.innerHTML = `<p class="muted">${t("noDocs")}</p>`; return; }
  host.innerHTML = state.documents.map((d) => {
    const title = (lang === "ar" ? d.title_ar : d.title_en) || d.title_en || d.title_ar || "—";
    const typeLabel = t(d.doc_type) !== d.doc_type ? t(d.doc_type) : d.doc_type;
    return `<div class="card item">
      <h4>${esc(title)}</h4>
      <div class="badges">
        ${d.doc_type ? `<span class="badge">${esc(typeLabel)}</span>` : ""}
        ${d.version ? `<span class="badge">v${esc(d.version)}</span>` : ""}
      </div>
      <div class="actions">
        <a href="${esc(d.url)}" target="_blank" rel="noopener"><button class="ghost">${t("close")==="Close"?"Open":"فتح"}</button></a>
        <button class="ghost" data-share="${d.id}">${t("share")}</button>
        ${editor ? `<button class="ghost danger" data-deldoc="${d.id}">${t("del")}</button>` : ""}
      </div>
    </div>`;
  }).join("");
  host.querySelectorAll("[data-share]").forEach((b) =>
    b.addEventListener("click", () => shareDocument(b.dataset.share)));
  host.querySelectorAll("[data-deldoc]").forEach((b) =>
    b.addEventListener("click", async () => {
      if (!confirm(t("confirmDel"))) return;
      await api("/documents/" + b.dataset.deldoc, { method: "DELETE" }); loadDocuments();
    }));
}
$("addDocBtn").addEventListener("click", () => {
  openModal(`
    <h3>${t("uploadDoc")}</h3>
    ${field("d_title_en", "titleEn")}
    ${field("d_title_ar", "titleAr")}
    <label>${t("docType")}</label>
    <select id="d_type">${["cv","portfolio","vision","endorsement","other"].map((x) =>
      `<option value="${x}">${t(x)}</option>`).join("")}</select>
    ${field("d_version", "version")}
    <label>${t("file")}</label><input id="d_file" type="file" />
    <div class="row">
      <button id="saveDoc">${t("save")}</button>
      <button class="ghost" id="closeModal">${t("cancel")}</button>
    </div>`);
  $("saveDoc").addEventListener("click", async () => {
    const f = $("d_file").files[0];
    if (!f) { alert(t("file")); return; }
    const fd = new FormData();
    fd.append("title_en", $("d_title_en").value);
    fd.append("title_ar", $("d_title_ar").value);
    fd.append("doc_type", $("d_type").value);
    fd.append("version", $("d_version").value);
    fd.append("file", f);
    try { await api("/documents", { method: "POST", body: fd }); closeModal(); loadDocuments(); }
    catch (ex) { alert(ex.message); }
  });
});

async function shareDocument(id) {
  let path;
  try { path = (await api("/documents/" + id + "/share", { method: "POST", json: {} })).path; }
  catch (ex) { alert(ex.message); return; }
  const url = location.origin + path;
  const doc = state.documents.find((d) => d.id == id) || {};
  const title = (lang === "ar" ? doc.title_ar : doc.title_en) || "Document";
  const text = `${title}: ${url}`;
  openModal(`
    <h3>${t("shareVia")}</h3>
    <p class="muted" style="word-break:break-all">${esc(url)}</p>
    <div class="share-row">
      <button class="wa" id="shWa">${t("whatsapp")}</button>
      <button id="shEmail">${t("emailShare")}</button>
      <button id="shCopy">${t("copyLink")}</button>
      ${navigator.share ? `<button id="shNative">${t("share")}</button>` : ""}
    </div>
    <div class="row" style="margin-top:14px"><button class="ghost" id="closeModal">${t("close")}</button></div>`);
  $("shWa").onclick = () => window.open("https://wa.me/?text=" + encodeURIComponent(text), "_blank");
  $("shEmail").onclick = () => window.open(
    "mailto:?subject=" + encodeURIComponent(title) + "&body=" + encodeURIComponent(text));
  $("shCopy").onclick = async () => { await navigator.clipboard.writeText(url); alert(t("linkCopied")); };
  if (navigator.share) $("shNative").onclick = () => navigator.share({ title, text, url });
}

// ---------- modal ----------
function openModal(html) {
  $("modalBody").innerHTML = html;
  $("modal").hidden = false;
  const close = $("closeModal");
  if (close) close.addEventListener("click", closeModal);
}
function closeModal() { $("modal").hidden = true; $("modalBody").innerHTML = ""; }
$("modal").addEventListener("click", (e) => { if (e.target.id === "modal") closeModal(); });

// ---------- boot ----------
applyLang();
if (state.token) {
  api("/me").then((m) => { state.role = m.role; showApp(); }).catch(doLogout);
}
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/portal/sw.js").catch(() => {});
}
