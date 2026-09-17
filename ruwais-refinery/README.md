# Ruwais Refinery — Interactive 3D Explainer

An educational, offline-capable web app that explains how the Ruwais refinery
complex (Abu Dhabi) works, and how the Crude Flexibility Project (CFP, 2023)
lets Ruwais West swap light sweet Murban crude for heavier sour grades
(Upper Zakum, Basrah) — freeing Murban for export.

**This is a schematic, not a survey.** Layout, positions and sizes are
representative. Every number in the UI carries a badge:
`public` / `public-approx` (cited in [SOURCES.md](./SOURCES.md)),
`representative` (estimate, derivation in SOURCES.md), or `not public`.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/ (includes data/)
npm run preview    # serve the production build
npm run check      # headless smoke test: zero console errors + screenshot
```

No backend, no network calls after install — everything is local.

## What you can do

- **Crude diet switcher (top bar)** — A: Murban (pre-CFP baseline),
  B: Upper Zakum (post-CFP typical), C: Basrah-led sour blend (opportunistic
  imports). Flows, tank grades, yield bars and stats all update.
- **Click any unit** (3D shape, its floating label, or a 2D node) for a
  plain-language panel: what it does, inputs/outputs, typical conditions,
  why it exists, and what changes when the crude gets heavier.
- **Trace a barrel** — arm the mode, click the crude tank farm, and watch one
  barrel split at the CDU into its cuts, each following the pipes to its
  product tank.
- **Follow the crude** — a 14-step guided tour with camera animation.
- **2D diagram** — an SVG process-flow view generated from the same data;
  selection stays in sync with 3D.
- **English / العربية** toggle (full RTL). Search box to jump to any unit.
- **Legend** zone names double as camera presets.

## Editing the data (no code required)

All content lives in `/data`. The app validates the files on load and shows a
precise error overlay if something is malformed.

| File | Contents |
|---|---|
| `data/units.json` | Every unit: id, zone, 3D `type` + `position` + `size`, names + descriptions (en/ar), capacity + `tag`, inputs/outputs, conditions, `source_refs` (IDs that resolve in SOURCES.md) |
| `data/flows.json` | Stream color legend + every flow: `from`, `to`, `stream`, `volume` in kb/d per scenario `{A,B,C}`. Volume 0 hides a flow in that scenario; pipe thickness and particle count scale with volume |
| `data/scenarios.json` | Crude specs, per-scenario feed, tank grade allocation, CDU cut %, product yield %, stats (with `tag` and optional derivation `detail_en`), "why this matters" notes |
| `data/i18n.json` | UI strings and the 14 tour steps, `en` and `ar`. The Arabic is a working draft — edit freely |

Unit `type` values map to 3D shapes in `src/geometry.ts`:
`column`, `drum`, `reactor`, `tank`, `tankfarm`, `sphere`, `box`, `furnace`,
`flare`, `jetty`, `pipeline`, `context` (greyed, non-process block).

## Known simplifications

- Ruwais East (~420 kb/d, Murban diet), Borouge, base oils and the planned
  Ruwais LNG plant are greyed context blocks, not detailed.
- Flow volumes are representative and do not close a rigorous mass balance;
  they exist to show *relative* magnitudes and routing changes per diet.
- Product yields per crude diet are estimates — ADNOC publishes none
  (see SOURCES.md, "Representative figures").
- One CDU/VDU train stands in for the real plant's multiple trains; utilities
  are one block; pipe routing is stylized rack routing, not real plot plan.
- Pre-CFP scenario A routes untreated residue straight to the RFCC — in
  reality Murban residue treating history is more nuanced; the point being
  taught is "sweet residue was RFCC-acceptable, sour residue needs the ARD".

## Code layout

```
src/main.ts       boot: load + validate JSON, init modules
src/types.ts      data-shape types mirroring /data
src/validate.ts   hand-rolled validation + error overlay
src/state.ts      tiny observable app state (scenario/lang/selection/…)
src/scene.ts      renderer, camera, lights, picking, labels, presets
src/geometry.ts   unit primitives per type; nozzle heights for pipes
src/flows.ts      pipe-rack routed tubes + animated particles
src/trace.ts      trace-a-barrel (routes computed from flows.json)
src/tour.ts       guided tour (steps live in data/i18n.json)
src/pfd.ts        2D SVG process-flow diagram
src/ui.ts         top bar, legend, unit + scenario panels, search
scripts/check.mjs headless Chromium smoke test + screenshots
```

Performance notes: pixel ratio is capped (1.5 on mobile), particle counts
halve on small/touch screens, no shadows, labels are CSS2D with
distance-based hiding. The scene is a few dozen low-poly primitives — it
should hold 60 fps on any recent laptop.
