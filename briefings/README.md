# Briefings

Ministerial-grade official trip briefing system — methodology, templates, and worked case studies in the Saudi MoFA / GCC tradition, cross-referenced against UK FCDO and US State Department practice.

## What's here

```
briefings/
├── README.md                  ← you are here
├── templates/                 ← reusable section scaffolds (00–13 + master)
└── case-studies/              ← worked examples
    └── 2026-03-tokyo-ksa-mofa/   simulated: KSA FM → Tokyo, March 2026
```

## The canonical 14-section structure

Every pack contains the same sections in the same order. This is what separates a ministerial pack from a briefing memo.

| # | Section | Purpose | Read first? |
|---|---|---|---|
| 00 | Cover & Distribution | Classification, sign-off chain, distribution list | — |
| 01 | Executive Summary | ≤1 page; the page the Minister reads in the car | **Yes** |
| 02 | Strategic Objectives | Anchored to Vision 2030 pillars | Minister + CoS |
| 03 | Bilateral State of Play | History, temperature, trade, irritants | CoS + DG |
| 04 | Counterpart Bios | One card per counterpart | Minister |
| 05 | Talking Points Cards | One card per meeting; opening, points, ask, close, defensive lines | Minister, in-room |
| 06 | Press Lines & Q&A | Bilingual; SPA-ready; hostile Q rebuttals | Spokesperson + Minister |
| 07 | Sensitivities & Red Lines | What NOT to say or agree to | **Minister + CoS + Ambassador only** |
| 08 | Scenario Annex | 5–8 curveballs with responses | Minister |
| 09 | Logistics & Protocol Annex | Schedule, motorcade, seating, prayer, dress, dietary | Delegation-wide |
| 10 | Gifts & Cultural Notes | What we give, receive, do, don't | Protocol team |
| 11 | Delegation Composition | Roster, roles, seat assignments | All delegation |
| 12 | Media & Comms Plan | Pre/during/post visibility plan with KPIs | DG Comms |
| 13 | Post-Visit Deliverables | Memcons, commitments tracker, cables, RCD brief | CoS for 30 days |

## How to produce a pack

### Option A — by hand
1. Copy `templates/` to `case-studies/<YYYY-MM>-<host>-<visiting>-<portfolio>/`.
2. Fill in placeholders section by section.
3. Get sign-off per the chain in Section 00.

### Option B — agent-orchestrated (recommended)
1. In Claude Code (this repo), invoke the `minister-briefing-orchestrator` agent with a one-line trip spec:
   > *"Saudi FM to Seoul, May 2026, focus on AI cooperation and PIF–KIC dialogue."*
2. The orchestrator routes section drafts to specialists (`country-desk-analyst`, `protocol-officer`, `press-lines-drafter`) in parallel and calls `ambassador-kai-voss` for strategic sharpening of Sections 01, 07, 08.
3. Output lands in `case-studies/<auto-named>/` with a `[VERIFY]` punch list at the end of the master pack.
4. Human review by the equivalent of DG Asia / Chief of Staff before sign-off.

## Standards every pack must meet

- **Vision 2030 anchoring** — every Strategic Objective maps to a published pillar / program / KPI.
- **Bilingual register** — AR + EN side-by-side in Sections 00, 01, 05, 06, 09 where formal lines appear.
- **Classification** — every page header marked (`عادي / محدود / سري / سري للغاية`).
- **`[VERIFY]` discipline** — any time-sensitive factual claim (current officeholders, trade figures of the last 12 months, ratification status of MoUs) is flagged.
- **No bluffing** — unknown facts are flagged, not invented.
- **One-page Executive Summary** — hard cap.

## Production timeline (T-minus to wheels-up)

| T-minus | Action | Owner |
|---|---|---|
| T-14 | File opened; skeleton drafted (Sections 00–04). | Country desk |
| T-10 | Bios + bilateral state of play complete; DG circulation. | Country desk → DG |
| T-7 | Talking points + press lines first draft; sensitivities locked. | Division + Comms |
| T-5 | Inter-agency clearance (Investment, Energy, Defense). | Chief of Staff |
| T-3 | Protocol annex + logistics finalized with host embassy. | Protocol |
| T-2 | DG sign-off; Chief of Staff clears. | Chief of Staff |
| T-1 | Minister briefing session; final corrections; pack bound + digital. | Minister's Office |
| T-0 | Pack handed over at wheels-up. | ADC / CoS |
| T+1 → T+7 | Memcons; readouts; cable; commitments tracker opened. | Country desk |

## Reference traditions

- **Saudi MoFA / Royal Court Diwan / SPA** — primary house style; bilingual; Vision 2030-anchored.
- **UAE MoFAIC, Qatar MoFA** — GCC cross-reference.
- **UK FCDO "submissions"** — exec-summary discipline.
- **US State "scope papers" + memcons + talking-points cards** — modularity.

## Roadmap

- **Phase D (deferred):** Markdown→PDF rendering via `weasyprint` for printable ministerial pack.
- **Phase E (deferred):** UI in `web/` to drive the orchestrator from a browser.
- **Real trip data:** out of scope here; the case study is deliberately simulated.

## Files of note

- `templates/_master-pack.md` — entry point; cross-references the 14 sections.
- `templates/01-executive-summary.md` — start here when learning the structure.
- `templates/07-sensitivities-red-lines.md` — shortest, highest-consequence section.
- `case-studies/2026-03-tokyo-ksa-mofa/_master-pack.md` — fully worked example.
