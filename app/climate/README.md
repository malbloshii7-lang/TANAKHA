# Climate Pulse — implementation notes

Backend for the `/climate` live monitoring feed. Built from a design handoff
(`design_handoff_live_feed/` in the original PR) that specified pixel-exact
frontend tokens/animations and a data contract, but shipped only a client-side
`setTimeout` simulation. This package replaces that simulation with a real,
always-on ingestion pipeline, following this repo's existing conventions
(FastAPI + SQLite + pluggable zero-key-first providers — see `app/providers/`
for the pattern this mirrors).

## Architecture

- **`db.py`** — SQLite tables `climate_feed_items` and `climate_events`.
  Dedup is enforced by a `UNIQUE` constraint on the stable `id` column;
  `seq` (autoincrement) is the pagination cursor.
- **`normalize.py`** — shared helpers: `stable_id()` (dedup key), relative
  time formatting, engagement-string → numeric score parsing, and a
  keyword-based `is_breaking()` heuristic.
- **`sources/`** — pluggable ingestion sources, each implementing
  `poll()` (called on a timer) and optionally `seed()` (called once at
  startup to backfill). See `sources/base.py`.
  - `mock.py` — zero-key offline generator. Default and always safe; mirrors
    the design prototype's sample content but runs server-side with real
    timestamps.
  - `rss.py` — real, free, keyless public feeds (NWS alerts, USGS
    earthquakes, ReliefWeb, GDACS). Uses `defusedxml` to parse untrusted
    remote XML safely and caps response size to bound entity-expansion
    impact.
  - `twitter.py` — real X API v2 recent-search polling for the WMO/NHMS/UN
    seed accounts. No-ops unless `X_BEARER_TOKEN` is set (paid X API tier
    required) — see `get_provider()` in `app/providers/__init__.py` for the
    established "real provider only if a key is present" pattern this
    follows.
- **`ingestion.py`** — `IngestionManager` runs one background `asyncio` task
  per configured source; on each new (non-duplicate) row it publishes to
  `Broadcaster`, an in-process pub/sub that `routes.py`'s SSE endpoint
  subscribes to. Started/stopped from `app/main.py`'s FastAPI `lifespan`.
- **`routes.py`** — `GET /api/climate/feed`, `/feed/stream` (SSE),
  `/events`, `/stats`.

## Why not LinkedIn/Facebook/Instagram?

Those platforms don't offer public third-party read APIs suitable for
aggregation — the original design handoff flagged this as needing
confirmation per-platform, and none turned out to be feasible without a
partner agreement. Only `platform` values `twitter`, `linkedin`, `facebook`,
`instagram` (from the original prototype's sample data) and `rss` (added for
the real feed source) are actually populated.

## Data contract

Matches the frontend's expectations (`web/climate/app.js`), extended with a
real `timestamp` (ISO 8601) alongside the display `time` string, per the
original handoff's recommendation to avoid stale frozen relative-time labels:

```
{
  id, author, handle, avatar,
  source: 'WMO' | 'NHMS' | 'UN' | 'Climate' | 'Finance',
  platform: 'twitter' | 'linkedin' | 'facebook' | 'instagram' | 'rss',
  role, text, time, timestamp, engagement, hasImage, imageLabel?, isBreaking,
}
```

## Extension points

- Real event ingestion (the `events` table) only has a mock source today —
  no free, structured, keyless calendar API for WMO/UN meetings was
  available. Add an `EventSource` subclass in `sources/` and register it in
  `ingestion.build_event_sources()`.
- To add another RSS feed, append to `FEEDS` in `sources/rss.py`.
