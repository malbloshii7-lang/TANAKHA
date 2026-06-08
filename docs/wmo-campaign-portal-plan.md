# WMO Presidential Campaign Portal — Plan

> **Election Portal** for a candidacy to the Presidency of the World Meteorological
> Organization (WMO). A private, bilingual (Arabic / English) workspace for the
> campaign team that works on phone, tablet, laptop, and PC.
>
> **بوابة الحملة الرئاسية للمنظمة العالمية للأرصاد الجوية** — مساحة عمل خاصة وثنائية
> اللغة (عربي / إنجليزي) لفريق الحملة، تعمل على الهاتف والجهاز اللوحي والحاسوب.

Status: **Planning draft v1** · Owner: Campaign team · Last updated: 2026-06-08

---

## 1. Decisions locked with the user

| Decision | Choice |
|---|---|
| Priorities | Friendly & easy to understand, easy to **manage from any device** |
| Access / privacy | **Private — team only** (invite-only login; nothing public) |
| Timeline | No fixed deadline → **phased rollout (MVP → full)** |
| Build approach | *Recommended below* — optimized for the priorities above |

---

## 2. Context: the race we're building for

- The WMO President is elected by the **World Meteorological Congress**, where each
  of WMO's ~193 Members votes through its **Permanent Representative (PR)** — almost
  always the head of the national meteorological/hydrological service. The current
  term runs **2023–2027**, so the next presidential election falls in the **2027
  Congress** cycle. ([WMO](https://wmo.int/news/media-centre/world-meteorological-congress-sets-new-strategic-priorities-era-of-rapid-climate-societal-and), [Wikipedia: WMO](https://en.wikipedia.org/wiki/World_Meteorological_Organization))
- This is a **diplomatic, relationship-driven election**, not a public vote. Winning
  is about systematically tracking and nurturing relationships with PRs, Ministries
  of Foreign Affairs (MFAs), and embassies — the soft-power playbook used for UN-agency
  leadership races. ([Columbia SIPA: soft power in the UN](https://www.sipa.columbia.edu/sites/default/files/2024-06/For_Publication_Portugal_Mission_Acero.pdf))
- **Implication for the portal:** the heart of the product is a **stakeholder /
  contact intelligence system** (who do we know, what's their stance, who last spoke
  to them, what's the next step) wrapped in correspondence tracking and a polished
  candidate "pitch kit." This mirrors modern advocacy/stakeholder tools that replace
  siloed contact lists with shared team knowledge. ([Advoc8](https://www.advoc8.co/))

---

## 3. Recommended build approach

**Recommendation: a custom, bilingual Progressive Web App (PWA) with a simple,
non-technical admin layer.**

A **PWA** is one codebase that opens as a normal website *and* installs to the home
screen on iPhone, iPad, and PC/laptop — exactly the "easy access across devices,
nothing to download from an app store" the brief asks for. It works offline-ish,
sends notifications, and updates instantly for everyone.

To honor *"easy to manage from any device"*, every piece of content (news, election
status, documents, contacts) is editable **inside the portal itself** through plain
forms — no code, no separate CMS to learn. An authorized team member can update the
status banner or upload a new CV revision from their phone.

| Option considered | Why not the lead choice |
|---|---|
| No-code (Softr/Bubble/Glide) | Fastest to launch and editable by non-devs, but weaker on **fine Arabic RTL polish, custom branding, and the document-access controls** a private campaign wants. *Good fallback if speed beats polish.* |
| Off-the-shelf political CRM (Aristotle, NationBuilder, Pulsar) | Strong contact/correspondence features but built for **public voter/donor campaigns**, not a ~193-PR diplomatic race; Arabic-first UX and our exact data model would be a fight. ([Pulsar](https://pulsar.vote/best-crm-for-political-campaigns/), [Aristotle](https://cm.aristotle.com/)) |

> We can also **reuse this repo's stack** (Python / FastAPI + SQLite → Postgres) as
> the backend and ship the PWA front-end on top, so we're not starting from zero.

---

## 4. The seven requirements → how each is delivered

### 1) Easy access & usability across devices (PC, laptop, iPad, iPhone)
- **Responsive, mobile-first PWA**, installable to the home screen; one URL for all.
- Large tap targets, simple navigation, fast load. Designed so a non-technical team
  member is never more than two taps from "what changed and what do I do next."

### 2) Correspondence — sent & received messages
- A **correspondence log**: every letter/email/note to or from a PR, MFA, or embassy
  recorded with date, direction (sent/received), channel, contact, attachments, and
  status (awaiting reply / replied / action needed).
- Optional **Gmail integration** so emails can be drafted/sent and threads linked to
  the right contact without leaving the portal (Gmail tools are available in this
  workspace).
- Each entry ties back to a contact, so a contact's full history is one click away.

### 3) Election status update
- A prominent, editable **status banner / timeline**: phase (pre-announcement →
  campaigning → Congress vote), vote-count estimates, regional support snapshot,
  upcoming key dates. Updatable from any device in seconds.

### 4) Key documents — CV & portfolio, easy sharing (email, WhatsApp, etc.)
- A **document library** for the CV, portfolio, vision statement, endorsements, in
  both languages and multiple formats (PDF + web view).
- **One-tap share**: generate a clean link and push it to **WhatsApp / email / copy
  link** via the native share sheet. Following 2025 secure-sharing trends, links can
  be **trackable and revocable** with optional view analytics, watermarking, and
  expiry — so the team sees *who opened the CV and when*. ([Papermark: document security trends](https://www.papermark.com/blog/document-security))

### 5) Bilingual interface — Arabic & English
- Full **i18n with proper RTL**: `dir="rtl"` on the root for Arabic, **CSS logical
  properties** (`margin-inline-*`, `inset-inline-*`) so layouts mirror automatically,
  and a header language switcher labeled in each language's own name (**العربية** /
  **English**) that remembers the user's choice. ([RTL best-practice guide](https://aivensoft.com/en/blog/rtl-arabic-website-design-guide), [Logto: RTL support](https://blog.logto.io/rtl-language-support))
- High-quality Arabic webfont (e.g., **Cairo / Tajawal / IBM Plex Arabic**) at a
  slightly larger size than Latin for legibility, with correct bidi handling for
  mixed Arabic + Latin (names, emails).

### 6) Core contact database — MFA, embassies, Permanent Representatives
- The portal's backbone. Each record: name, country, **role (PR / MFA / embassy)**,
  organization, region (WMO RA I–VI), contact channels, language, **relationship
  owner**, **stance (supportive / neutral / opposed / unknown)**, last contact, and
  **next action**.
- Filter and segment by country, region, role, and stance; link every contact to its
  correspondence and shared documents — turning scattered lists into **shared team
  intelligence**. ([Advoc8](https://www.advoc8.co/))

### 7) Media & news
- A simple **news/media feed** (campaign updates, relevant WMO/climate news, press
  mentions) the team can post to from any device, in either language.

---

## 5. Security & privacy (Private — team only)

- **Invite-only access**, no public pages. Email/passwordless or SSO login + **MFA**
  for every team member. ([Papermark](https://www.papermark.com/blog/document-security))
- **Roles**: Admin (full), Editor (content + contacts), Viewer (read-only).
- Encryption in transit and at rest; audit log of who viewed/edited sensitive items.
- Document links shared externally are **separate, controllable tokens** (expiry,
  revoke, optional watermark) so sharing a CV never exposes the portal.
- A managed database + object storage (not the ephemeral demo filesystem) for
  anything that must persist.

---

## 6. Data model (first cut)

```
Contact      ── country, role(PR/MFA/Embassy), region(RA I–VI), stance,
                owner, channels, language, next_action
Correspondence ── contact, direction(sent/received), channel, date, subject,
                  body/attachment, status
Document     ── title(ar/en), type(CV/portfolio/vision), file(s), version,
                share_links[]
ShareLink    ── document, token, expiry, views[], watermark
StatusUpdate ── phase, vote_estimate, regional_snapshot, key_dates, note(ar/en)
NewsItem     ── title(ar/en), body(ar/en), source, published_at
User         ── name, email, role(Admin/Editor/Viewer), language, MFA
```

---

## 7. Phased roadmap (no fixed deadline → ship value early)

**Phase 0 — Foundations (setup)**
Auth + MFA, bilingual/RTL shell, roles, responsive PWA skeleton, managed DB.

**Phase 1 — MVP (the daily-use core)**
Contact database + the share-ready document library (CV/portfolio) with WhatsApp/email
sharing, and the editable election-status banner. *This alone is usable on day one.*

**Phase 2 — Correspondence & intelligence**
Correspondence log linked to contacts, stance/next-action tracking, segmentation and
dashboards (support by region), optional Gmail integration.

**Phase 3 — Reach & polish**
News/media feed, document view-analytics + watermarking, notifications, Arabic-content
QA pass, performance and accessibility hardening.

---

## 8. Open questions for the team

1. **Team size & roles** — how many people, and who needs edit vs. view-only?
2. **Contact data source** — do we import an existing PR/MFA list (spreadsheet) or
   build it up inside the portal?
3. **Email** — connect the campaign's Gmail for in-portal correspondence, or just log
   messages manually at first?
4. **Branding** — candidate name, logo, colors, and the Arabic font preference.
5. **Hosting/budget** — managed hosting (recommended for persistence) vs. free tier
   for an early demo.

---

## 9. Suggested next step

Confirm the build approach (custom PWA recommended) and answer the open questions
above. Then I can scaffold **Phase 1 (contacts + shareable document library +
status banner)** as a working bilingual PWA you can open on your phone.

---

### Sources
- [WMO — Congress strategic priorities](https://wmo.int/news/media-centre/world-meteorological-congress-sets-new-strategic-priorities-era-of-rapid-climate-societal-and) · [Wikipedia — WMO](https://en.wikipedia.org/wiki/World_Meteorological_Organization)
- [Columbia SIPA — soft power in the UN](https://www.sipa.columbia.edu/sites/default/files/2024-06/For_Publication_Portugal_Mission_Acero.pdf) · [Advoc8 — stakeholder/advocacy software](https://www.advoc8.co/)
- Political CRMs: [Pulsar](https://pulsar.vote/best-crm-for-political-campaigns/) · [Aristotle Campaign Manager](https://cm.aristotle.com/) · [Campaign Deputy](https://www.campaigndeputy.com/)
- RTL / bilingual: [Aivensoft RTL guide](https://aivensoft.com/en/blog/rtl-arabic-website-design-guide) · [Logto — RTL support](https://blog.logto.io/rtl-language-support) · [Appinventiv — Arabic/English apps](https://appinventiv.com/blog/english-arabic-app-development-challenges-and-solutions/)
- Secure document sharing: [Papermark — document security trends 2026](https://www.papermark.com/blog/document-security) · [LucidLink — secure file sharing 2025](https://www.lucidlink.com/blog/secure-file-sharing-for-business)
