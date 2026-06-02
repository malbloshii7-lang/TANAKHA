# Meteorology Brief — NCM International Affairs sector monitor

A simple, well-designed feed of *what's new across the meteorology sector* —
WMO governance, NMHS operations, climate, water and science — pulled from the
official RSS feeds of the bodies that matter and shown on one clean page.

No database, no API keys, no heavy infrastructure. A fetch script writes a
`feed.json`; a single static page renders it.

## Layout

```
metfeed/
├── sources.py        # the curated source list — edit this to add/remove feeds
├── fetch.py          # zero-dependency RSS/Atom fetcher -> web/feed.json
└── web/
    ├── index.html    # the interface
    ├── style.css     # design (light/dark, sector colours, responsive)
    ├── app.js        # filtering, search, rendering
    └── feed.json     # generated data (ships with sample data)
```

## Run it

The page works straight away with bundled sample data:

```bash
cd metfeed/web
python -m http.server 8080      # then open http://localhost:8080
```

To pull **live** updates (overwrites `web/feed.json`):

```bash
python -m metfeed.fetch              # from the repo root
python -m metfeed.fetch --limit 8    # cap items per source
```

`fetch.py` uses only the Python standard library, so no `pip install` is
needed. Sources that time out or return bad XML are skipped — one broken feed
never breaks the run.

## Keep it fresh automatically

Add a cron entry (every hour):

```cron
0 * * * * cd /path/to/TANAKHA && python -m metfeed.fetch
```

Or wire it to a GitHub Action that commits the updated `feed.json` on a
schedule.

## Editing sources

Open `sources.py` and add an entry — `category` controls the filter chips,
`tier: 1` marks authoritative bodies (WMO/UN) with an "Official source" badge.

## On tweets / X posts

X/Twitter no longer offers a free API, so this build deliberately uses **free,
reliable RSS** from official bodies. To add posts later, either add a paid
X API key behind a small fetcher, or point `sources.py` at an RSS bridge for
the accounts you care about — the interface needs no changes.
