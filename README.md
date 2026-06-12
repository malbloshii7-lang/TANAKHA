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

## API

| Method | Route | Purpose |
|---|---|---|
| GET | `/` | Front-end |
| POST | `/api/visualize` | multipart `image` + `style` → `{before_url, after_url, brief, style}` |
| POST | `/api/leads` | JSON lead → `{id, status}` |
| GET | `/api/leads` | List captured leads |
| GET | `/transfer` | File-transfer front-end |
| POST | `/api/transfers` | multipart `file` → `{token, filename, size_bytes, expires_at, download_url}` |
| GET | `/d/{token}` | Download a shared file (404 once expired) |

## File transfer (send heavy files)

Open `/transfer`, drop in any file up to **2 GB**, and get a download link you can share
with one click via **WhatsApp** (`wa.me`) or **email** (`mailto:`), or just copy it.
Uploads stream to disk in 1 MB chunks (memory stays flat), links use unguessable
`secrets.token_urlsafe` tokens, and every link **expires after 7 days** — expired files
are deleted automatically at startup and on access.

Caveats on free-tier hosting (Render): the disk is ephemeral, so uploaded files do not
survive a redeploy/restart — stale links degrade gracefully to 404. The platform proxy
may also cap very large request bodies or time out multi-GB uploads; for serious volume,
move storage to S3/R2 presigned uploads.

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
| `TRANSFER_DIR` | `transfers` | file-transfer storage dir |
| `MAX_TRANSFER_BYTES` | `2147483648` (2 GB) | per-file upload cap |

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

## Notes & roadmap

- **Deliberately out of scope** for now: address→photo lookup (Google Street View),
  outbound email/SMS, payments. Outreach should be **opt-in only** to stay clear of
  CAN-SPAM / TCPA — that's why the funnel captures consent at the lead form.
- Previews are AI-generated *concepts*, not exact build plans.
