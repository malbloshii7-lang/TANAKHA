# TANAKHA — AI Yard Makeover Visualizer

Upload a photo of a yard → AI writes a tailored landscape **design brief** and renders a
photorealistic **"after"** image → a before/after slider creates the "wow" → the homeowner's
details are captured as a **lead**. The lead is the monetizable asset (contractor SaaS,
lead marketplace, or consumer hook — the same engine serves all three).

## Quick start

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
# open http://localhost:8000
```

Works **with zero API keys**: the renderer defaults to an offline mock and the design brief
falls back to per-style templates. Add keys (below) to switch on real AI.

## Deploy (get a public link)

The repo ships a `railway.json` + `nixpacks.toml` (Railway), a `render.yaml`
blueprint (Render), and a `Procfile`.

**Railway (recommended):**
1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**.
2. Pick `malbloshii7-lang/TANAKHA` and the `claude/kind-hamilton-HPaJy` branch.
   Railway reads `railway.json`/`nixpacks.toml` and builds automatically.
3. In the service's **Variables**, set:
   - `PORTAL_ADMIN_PASSWORD` — your portal admin login password.
   - `PORTAL_SECRET` — a long random string (e.g. `python -c "import secrets;print(secrets.token_hex(32))"`).
4. **Settings → Networking → Generate Domain** to get a public URL. The yard
   visualizer is at `/` and the **campaign portal is at `/portal`** (login `admin` /
   the password you set).

**Render (alternative):**
1. [render.com](https://render.com) → **New** → **Blueprint** → connect the repo.
2. Render reads `render.yaml` and deploys `claude/kind-hamilton-HPaJy`. When prompted,
   set **`PORTAL_ADMIN_PASSWORD`**; `PORTAL_SECRET` is auto-generated.
3. You get a URL like `https://tanakha.onrender.com` — portal at `/portal`.

(Optional, both hosts) Add `IMAGE_PROVIDER=replicate` + `IMAGE_API_KEY`, and
`ANTHROPIC_API_KEY`, in the dashboard to turn on real AI renders and Claude briefs.

Note: free tiers have an ephemeral filesystem, so uploaded files and the SQLite DB
reset on redeploy/restart — fine for a demo; use a managed DB + object storage for production.

## How it works

```
photo ──▶ Claude vision ──▶ design brief ──▶ image provider ──▶ "after" image
                                                  │
                              before/after slider ─┴─▶ lead form ──▶ SQLite (leads)
```

- **`app/main.py`** — FastAPI app + routes.
- **`app/design.py`** — Claude-powered design brief, with a templated fallback.
- **`app/providers/`** — pluggable image renderers: `mock` (offline, zero-key, default) and
  `replicate` (real img2img, used when a key is present). `get_provider()` picks safely.
- **`app/db.py`** — SQLite `leads` table.
- **`app/storage.py`** — saves before/after images to `media/`.
- **`web/`** — premium single-page front-end (upload → style → reveal → lead form).

## API

| Method | Route | Purpose |
|---|---|---|
| GET | `/` | Front-end |
| POST | `/api/visualize` | multipart `image` + `style` → `{before_url, after_url, brief, style}` |
| POST | `/api/leads` | JSON lead → `{id, status}` |
| GET | `/api/leads` | List captured leads |

## Configuration

Copy `.env.example` and set what you need:

| Variable | Default | Purpose |
|---|---|---|
| `IMAGE_PROVIDER` | `mock` | `mock` or `replicate` |
| `IMAGE_API_KEY` | — | Replicate token; enables real renders |
| `REPLICATE_MODEL` | `black-forest-labs/flux-dev` | img2img model |
| `CLAUDE_MODEL` | `claude-haiku-4-5-20251001` | design-brief model |
| `TANAKHA_DISABLE_CLAUDE` | — | set `1` to force templated briefs |
| `MEDIA_DIR` | `media` | image storage dir |
| `DATABASE_PATH` | `tanakha.db` | SQLite path |

### Going live with real "after" images

1. Get a [Replicate](https://replicate.com) API token.
2. `export IMAGE_PROVIDER=replicate IMAGE_API_KEY=r8_...`
3. Restart — `/api/visualize` now returns model-generated renders. If the model errors, the
   app transparently falls back to the mock so requests never fail.

## Tests

```bash
pytest -q
```

Runs fully offline (mock provider + templated briefs).

## WMO Presidential Campaign Portal (`/portal`)

A separate, **team-only bilingual (Arabic / English) PWA** for a WMO presidential
campaign, mounted on the same app. Plan: [`docs/wmo-campaign-portal-plan.md`](docs/wmo-campaign-portal-plan.md).

- Open **`/portal`** — installable on iPhone/iPad/PC (Add to Home Screen).
- First-run seeds an admin account from `PORTAL_ADMIN_USER` / `PORTAL_ADMIN_PASSWORD`
  (defaults `admin` / `changeme` — **change these**). Set `PORTAL_SECRET` in production.
- Phase 1 features: **contact database** (PR / MFA / embassy, region, stance, owner,
  next action), **document library** (CV/portfolio) with one-tap **WhatsApp / email /
  copy** share links (trackable views, optional expiry), and an editable **election
  status** banner. Full RTL + language switcher.

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/portal/login` | `{username, password}` → `{token, user}` |
| GET/POST/PUT/DELETE | `/api/portal/contacts[/{id}]` | contact CRUD |
| GET/POST/DELETE | `/api/portal/documents[/{id}]` | list / upload / delete |
| POST | `/api/portal/documents/{id}/share` | mint a public share link |
| GET/POST | `/api/portal/status` | read / update election status |
| GET | `/s/{token}` | public, no-auth document link (for WhatsApp/email) |

## Notes & roadmap

- **Deliberately out of scope** for now: address→photo lookup (Google Street View),
  outbound email/SMS, payments. Outreach should be **opt-in only** to stay clear of
  CAN-SPAM / TCPA — that's why the funnel captures consent at the lead form.
- Previews are AI-generated *concepts*, not exact build plans.
