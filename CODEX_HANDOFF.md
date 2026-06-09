# CODEX HANDOFF — TANAKHA

Handoff doc for a coding agent (Codex) to continue the work. It captures the
current state, what is already done, what remains, and an exact **ordered list
of prompts** to feed Codex one at a time.

---

## 1. Project context

**TANAKHA** = "AI Yard Makeover Visualizer" — a FastAPI Python app.
- Upload a yard photo → AI writes a landscape **design brief** → renders a
  photorealistic **"after"** image → before/after slider → captures a **lead**.
- Works with **zero API keys** (offline mock renderer + template briefs);
  optional `ANTHROPIC_API_KEY` + Replicate key switch on real AI.
- Stack: `fastapi`, `uvicorn`, `pillow`, `anthropic`, SQLite, `pytest`.
- Deploy: Render free tier via `render.yaml` (deploys branch
  `claude/chat-session-TlNKl`) and a `Procfile`.

**Repo:** `malbloshii7-lang/TANAKHA`
**Active work branch:** `claude/ai-freelance-arabic-platforms-FyvQi`

### Layout
```
app/
  main.py          FastAPI app + routes
  design.py        design-brief logic
  db.py            SQLite leads
  storage.py       file/image storage
  providers/       image providers: base, mock, replicate
web/               static frontend: index.html, app.js, style.css
tests/test_api.py  5 passing tests
.github/
  workflows/ci.yml      pytest CI (added)
  dependabot.yml        weekly dep updates (added)
.claude/agents/ambassador-kai-voss.md   freelance assistant agent (added)
```

---

## 2. What is already DONE (committed + pushed to the work branch)

1. **`.claude/agents/ambassador-kai-voss.md`** — a Claude Code subagent
   ("Kai Voss") that helps run an Arabic freelance business on Khamsat/Mostaql.
   Includes Kimi as the preferred visuals/AI-video tool. *(Not app code — a
   productivity asset; safe to leave as-is.)*
2. **`.github/workflows/ci.yml`** — runs `python -m pytest -q` on every push/PR.
   Verified locally: **5 tests pass**.
3. **`.github/dependabot.yml`** — weekly updates for pip + github-actions.
4. **`CLAUDE.md`** — mistake-tracking note (proactive reminders).

Local test status: `python -m pytest -q` → **5 passed**.
(Note: use `python -m pytest`, not bare `pytest` — a uv-isolated `pytest` on
PATH can miss project deps.)

---

## 3. What REMAINS (for Codex)

Priority order:

1. **Enable Secret Scanning + Push Protection** — repo Settings → Security.
   *(UI toggle, human-only — Codex cannot do this. Flagged for the owner.)*
2. **Decide the deploy branch** — `render.yaml` currently deploys
   `claude/chat-session-TlNKl`. The CI/Dependabot work lives on
   `claude/ai-freelance-arabic-platforms-FyvQi`. These must be merged (or the
   `render.yaml` branch updated) before CI guards the live deploy.
3. **Add a GitHub Pages landing page** (optional) — static lead-capture funnel
   for TANAKHA pointing at the Render API.
4. **Harden the app** (suggested improvements):
   - Add input validation + size limits on photo upload.
   - Add error handling around the Replicate provider (timeouts, failures).
   - Move SQLite to a managed DB + object storage for production persistence
     (free-tier filesystem is ephemeral).
   - Expand test coverage (lead capture, provider fallback, error paths).
5. **Add a healthcheck route** (`/healthz`) for uptime monitoring.

---

## 4. ORDERED PROMPTS FOR CODEX

Paste these into Codex one at a time, in order. Wait for each to finish + tests
to pass before moving on.

### Prompt 1 — Orient
```
Read the repo TANAKHA. Summarize the architecture of the FastAPI app in app/,
the image provider abstraction in app/providers/, how leads are stored in
app/db.py, and how the frontend in web/ calls the API. Then run
`python -m pytest -q` and confirm all tests pass. Do not change code yet.
```

### Prompt 2 — Healthcheck + hardening
```
Add a GET /healthz route to app/main.py that returns {"status":"ok"} with 200.
Add a test in tests/ for it. Run `python -m pytest -q` and make sure everything
passes. Keep the change minimal and match the existing code style.
```

### Prompt 3 — Upload validation
```
In the photo-upload endpoint, enforce: allowed content types (jpeg/png/webp),
a max file size (e.g. 10 MB), and a clear 400 error with a JSON message on
violation. Add tests covering a rejected oversized/invalid upload and an
accepted valid one. Run `python -m pytest -q`.
```

### Prompt 4 — Provider resilience
```
Make app/providers/replicate.py robust: handle network timeouts and API errors
gracefully, and fall back to the mock provider so the user still gets an
"after" image instead of a 500. Add a test simulating a provider failure and
asserting the fallback path. Run `python -m pytest -q`.
```

### Prompt 5 — Production persistence (plan first)
```
Propose a minimal change to support a managed Postgres DB (via DATABASE_URL)
and object storage for uploaded images, while keeping SQLite + local files as
the zero-config default. Show the plan and the diff. Do not break existing
tests. Run `python -m pytest -q`.
```

### Prompt 6 — Landing page (optional)
```
Create a static GitHub Pages landing page (in /docs or a gh-pages branch) that
markets TANAKHA, explains the before/after demo, and has a lead-capture CTA
pointing to the deployed Render URL. Keep it a single self-contained
index.html + style.css.
```

### Prompt 7 — Finalize
```
Run `python -m pytest -q` one final time. Ensure CI (.github/workflows/ci.yml)
would pass. Write a concise summary of all changes for the PR description.
```

---

## 5. Guardrails for Codex

- Always run tests with **`python -m pytest -q`** (not bare `pytest`).
- Keep changes minimal and match existing style; don't refactor broadly.
- Don't commit secrets; real AI keys come from env vars
  (`ANTHROPIC_API_KEY`, `IMAGE_API_KEY`, `IMAGE_PROVIDER`).
- The app must keep working with **zero API keys** (mock fallback intact).
- Push to a feature branch; do not force-push shared branches.
