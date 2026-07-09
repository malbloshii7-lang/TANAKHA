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

The repo ships a `render.yaml` blueprint and a `Procfile`.

**Render (free, easiest):**
1. Go to [render.com](https://render.com) → **New** → **Blueprint**.
2. Connect this GitHub repo (`malbloshii7-lang/TANAKHA`). Render reads `render.yaml`
   and deploys the `claude/chat-session-TlNKl` branch.
3. In a minute you get a public URL like `https://tanakha.onrender.com`.
4. (Optional) Add `IMAGE_PROVIDER=replicate` + `IMAGE_API_KEY`, and `ANTHROPIC_API_KEY`,
   in the dashboard to turn on real AI renders and Claude briefs.

The `Procfile` also lets you deploy on Railway/Heroku-style hosts with the same start command.
Note: the free tier's filesystem is ephemeral, so uploaded images and the SQLite leads DB
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
- **`app/climate/`** — a second, independent feature: **Climate Pulse**, a live monitoring
  feed. See below.

## API

| Method | Route | Purpose |
|---|---|---|
| GET | `/` | Front-end |
| POST | `/api/visualize` | multipart `image` + `style` → `{before_url, after_url, brief, style}` |
| POST | `/api/leads` | JSON lead → `{id, status}` |
| GET | `/api/leads` | List captured leads |

## Climate Pulse — live monitoring feed

`/climate` is an editorial-style live feed aggregating posts from WMO, national met
services (NHMS), UN agencies, climate science bodies, and climate-finance institutions,
plus a rolling calendar of climate-related events. It's a separate feature sharing this
app's backend/DB conventions — see `app/climate/README.md` for the full design.

```bash
uvicorn app.main:app --reload
# open http://localhost:8000/climate
```

Works with **zero API keys** by default: a server-side mock ingestion source produces a
realistic, always-on feed (real timestamps, real dedup, real SSE push — just synthetic
content instead of live social posts). Two real, pluggable sources are also included:

- `rss` — polls free, keyless public feeds (NWS alerts, USGS earthquakes, ReliefWeb,
  GDACS) on a 5-minute cadence.
- `twitter` — polls the real X API v2 recent-search endpoint for the WMO/NHMS/UN seed
  accounts, but only activates when `X_BEARER_TOKEN` is set (requires a paid X API tier).

Enable them via `CLIMATE_SOURCES=mock,rss` (comma-separated) in your environment. LinkedIn/
Facebook/Instagram ingestion is out of scope — those platforms don't offer public
third-party read APIs.

| Method | Route | Purpose |
|---|---|---|
| GET | `/climate` | Front-end |
| GET | `/api/climate/feed` | Paginated feed reads — `?source=&search=&cursor=&limit=` |
| GET | `/api/climate/feed/stream` | SSE stream — pushes new items/events as they're ingested |
| GET | `/api/climate/events` | Upcoming calendar events |
| GET | `/api/climate/stats` | Stat row: posts today, alerts, active sources, engagement |

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
| `CLIMATE_SOURCES` | `mock` | comma list: `mock`, `rss`, `twitter` |
| `CLIMATE_EVENT_SOURCES` | `mock` | comma list: `mock` |
| `X_BEARER_TOKEN` | — | enables the real `twitter` source |
| `CLIMATE_INGESTION_ENABLED` | `1` | set `0` to disable all background polling |

### Going live with real "after" images

1. Get a [Replicate](https://replicate.com) API token.
2. `export IMAGE_PROVIDER=replicate IMAGE_API_KEY=r8_...`
3. Restart — `/api/visualize` now returns model-generated renders. If the model errors, the
   app transparently falls back to the mock so requests never fail.

## Tests

```bash
pytest -q
```

Runs fully offline (mock provider + templated briefs; Climate Pulse's background
ingestion is disabled in tests via `CLIMATE_INGESTION_ENABLED=0`).

## Notes & roadmap

- **Deliberately out of scope** for now: address→photo lookup (Google Street View),
  outbound email/SMS, payments. Outreach should be **opt-in only** to stay clear of
  CAN-SPAM / TCPA — that's why the funnel captures consent at the lead form.
- Previews are AI-generated *concepts*, not exact build plans.
