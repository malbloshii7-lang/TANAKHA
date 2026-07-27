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

## PrimeAI Situation Room — intelligence engine

`/situation-room` turns Arabic and English evidence into a traceable
executive briefing: structured sources → entities → events → claims
(observed / inferred / forecast) → contradictions → UAE implications →
three scenarios → indicators → leadership takeaway. Traceability beats
prose: every material statement links to source evidence, unsupported
observed claims are **blocked before persistence**, and material
contradictions land in an analyst review queue.

```bash
uvicorn app.main:app --reload
# open http://localhost:8000/situation-room
```

A Red Sea demonstration brief (`brf_redsea`, 1 Arabic + 2 English sources)
is seeded automatically and idempotently on startup.

### Architecture

- **`services/intelligence/`** — provider-neutral analytical engine:
  Arabic normalization (`arabic_normalizer.py`), language detection,
  source processing with content-hash dedup and PDF text extraction
  (`source_processor.py`), bilingual gazetteer entity extraction
  (`entities.py`), event extraction with strict date discipline
  (`events.py` — exact dates only when the text supports a specific day,
  otherwise a period), claim validators (`claims.py`), contradiction
  detection (`contradictions.py`), UAE implication framework
  (`implications.py`), scenario engine (`scenarios.py`), length-disciplined
  briefing composer (`briefing.py`), documented confidence blend
  (`confidence.py`), citations (`citations.py`), and the orchestrating
  `pipeline.py`.
- **`services/intelligence/providers/`** — `deterministic` (rule-based,
  offline, reproducible; used by tests/CI) and `huggingface` (official
  `huggingface_hub` client with timeouts, bounded retry, JSON validation
  and **no fallback that invents analysis**). Provider name + model ID are
  recorded on every run; raw model output is stored separately from
  approved analytical records.
- **`app/intelligence/`** — FastAPI routes, SQLite persistence
  (`intel_sources`, `intel_runs`, `intel_claims`, `intel_review_queue`,
  `intel_briefs`) and the seeded Red Sea brief.
- **`packages/evaluation/`** — 12 golden cases + metrics + runner
  (`python -m packages.evaluation.runner`); CI fails on unsupported
  observed claims, missing source linkage, invalid claim types,
  horizonless forecasts, broken Arabic handling or schema failures.
- **`web/situation-room/`** — the briefing interface (provider/model strip,
  knowledge cutoff, evidence counts, warnings, contradictions, confidence
  explanation, claim→source navigation, analyst review actions, scenario
  indicators; RTL-aware rendering for Arabic).

### Intelligence API

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/intel/sources` | ingest pasted Arabic/English text (JSON) |
| POST | `/api/intel/sources/upload` | upload TXT / MD / PDF (text-based) / JSON |
| GET | `/api/intel/sources` | list sources — `?brief_id=` |
| GET | `/api/intel/briefs` | list briefs (incl. seeded `brf_redsea`) |
| POST | `/api/analysis/run` | run analysis `{brief_id?, source_ids?, strategic_question?, knowledge_cutoff?, provider?}` |
| GET | `/api/analysis/runs/{id}` | retrieve a persisted run (`?include_raw=true` for raw model output) |
| POST | `/api/analysis/runs/{id}/rerun` | rerun with the same inputs |
| GET | `/api/analysis/compare?run_a=&run_b=` | compare two runs |
| POST | `/api/analysis/runs/{id}/claims/{cid}/review` | mark claim reviewed / approved / rejected |
| GET | `/api/analysis/review-queue` | open contradiction review items |
| POST | `/api/analysis/review-queue/{item_id}` | update a review item |

### Configuring the Hugging Face provider

```bash
export INTELLIGENCE_PROVIDER=huggingface
export HF_TOKEN=hf_...                       # never committed to code
export HF_MODEL_ID=meta-llama/Llama-3.3-70B-Instruct   # any chat model
export HF_TIMEOUT_SECONDS=60                 # optional, default 60
uvicorn app.main:app --reload
```

Missing configuration fails the request with a clear 422 — the app never
silently downgrades a requested `huggingface` run to the deterministic
provider. Per-request `{"provider": "deterministic"}` overrides remain
available regardless of the environment default.

### Running the analytical evaluation

```bash
python -m pytest -q                          # unit + integration + e2e
python -m packages.evaluation.runner         # 12 golden cases; writes
                                             # evaluation-reports/*.json|md
```

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

---

## Climate Command Center & Campaign Team Portal

This repo also hosts a second, unrelated static site: the **Climate Command Center**, a
campaign site for climate coordination policy, plus a **Campaign Team Portal** that links
it and the repo's other published landing pages.

### Live URLs (after enabling GitHub Pages — see below)

| Site | URL |
|---|---|
| Campaign Team Portal | `https://malbloshii7-lang.github.io/TANAKHA/portal/` |
| Climate Command Center | `https://malbloshii7-lang.github.io/TANAKHA/climate/` |

### One-time setup to go live

GitHub Pages must be switched to **Actions**-based deploys once:

1. Repo → **Settings** → **Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Push to `main` (or run the **Deploy Pages** workflow manually from the **Actions** tab).

The workflow (`.github/workflows/pages.yml`) builds `climate-command-center/` with Vite,
then assembles the root static pages, `portal/`, and the built app into one deploy so
everything ships from a single Pages site.

### What's where

- **`climate-command-center/`** — React + Vite + Tailwind site (5 pages: Home, Data
  Intelligence, Strategic Framework, Partnerships, Governance). Uses `HashRouter` so deep
  links work under the `/climate/` Pages subpath.
- **`climate-command-center/src/content/`** — the campaign's editable source of truth:
  - `smart-framework.ts` — SMART 2.0 pillars, initiatives, KPIs.
  - `events.ts` — the governance calendar (shared by Home and Governance).
  - `roadmap.ts` — implementation phases and milestones.
  - `stats.ts` — headline indicators, regional risk data, and the data-vintage string.
  - `partners.ts` — global partners & endorsements.

  **To update the campaign** (new SMART version, new event dates, refreshed figures),
  edit the relevant file here — every page that displays that content updates automatically,
  and TypeScript will flag any shape mismatch.
- **`climate-command-center/public/data/`** — the underlying World Bank Open Data CSVs
  (CO2 per capita, renewable energy consumption, energy use per capita), served as-is and
  linked from the Data Intelligence page's download cards and the portal's data section.
- **`portal/index.html`** — the Campaign Team Portal: a single static page linking the
  Climate Command Center, the repo's other published pages, and the raw CSVs.

### Refreshing the World Bank data

The bundled CSVs are a point-in-time pull (July 2026). To refresh:

1. Re-pull the three indicators from [World Bank Open Data](https://data.worldbank.org)
   (`EN.GHG.CO2.PC.CE.AR5`, `EG.FEC.RNEW.ZS`, `EG.USE.PCAP.KG.OE`).
2. Replace the files in `climate-command-center/public/data/`.
3. Update the headline figures in `climate-command-center/src/content/stats.ts` and bump
   `DATA_VINTAGE` / `DATA_VINTAGE_SHORT`.

### Design system

The site uses a light, institutional "paper + navy ink + petrol teal" palette (see
`climate-command-center/src/index.css`) instead of a dark/neon theme — chosen for a
classy, practical, ministerial tone. A `.band-dark` class re-themes specific sections
(navbar, hero, footer) to a deep-navy "gravitas" band using the same tokens.
