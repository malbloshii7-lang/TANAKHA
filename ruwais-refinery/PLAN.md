# PLAN.md — Ruwais Refinery Interactive 3D Explainer

**Status: awaiting your review. No code has been written yet.**

An educational, schematic 3D web app (Vite + Three.js + TypeScript, offline after
install, no backend) explaining how the Ruwais complex works and how the Crude
Flexibility Project (CFP) lets Ruwais West swap light sweet Murban for heavier sour
grades. Layout is **representative, not surveyed** — no real coordinates, no
security-relevant detail. Every number is tagged `public/approx` or
`representative` in the UI and cited in SOURCES.md.

---

## 1. Corrections & findings vs. your reference data

I verified your numbers against public sources. Most hold up; a few need adjusting:

1. **CFP was not just "modifications" — it built six new units.** Public EPC and
   trade-press sources (A Barrel Full project page, OGJ, MEES) describe the $3.5bn
   CFP scope as six *new* units at Ruwais West:
   - **Atmospheric Residue Desulphurizer (ARD)** — 177,000 bpsd. This is the heart
     of the project: it hydrotreats sour atmospheric residue so the existing RFCC
     can still accept it.
   - **Hydrogen Manufacturing Unit (HMU)** — 243,000 Nm³/h.
   - **Sulfur Recovery Unit + Tail Gas Treating Unit (SRU/TGTU)** — 1,100 t/d.
   - **Sour Water Strippers (SWS)** — 3,120 t/d.
   - **Amine Regeneration Unit (ARU)** — 21,600 t/d.
   - **Saturated Gas Plant (SGP)** — 705 t/d.
   Plus CDU/metallurgy modifications. The plan below adds the ARD as a first-class
   unit in the Conversion/Treating zones — it's the single best visual for "what
   CFP changed."
2. **Basrah Medium is ~27.9 API / 3.0% S** (SOMO respec via S&P Global) — matches
   your ~28. Basrah Heavy ~24 API / ~4.05% S. Murban ~40 API / ~0.7–0.8% S.
   Upper Zakum ~34 API / ~1.75% S. All confirmed.
3. **Capacity figures confirmed**: complex ~837,000 bpd design (East ~420k, West
   ~417k); ADNOC's own site now quotes >922,000 bpsd actual throughput capability.
   I'll show 837k design and note the higher actual figure. RFCC 127,000 bpd
   ("world's largest RFCC") confirmed.
4. **Scenario C nuance**: MEES reported first Basrah cargoes to Ruwais in April
   2024, Basrah Heavy lifts in Nov 2024, first Kuwaiti crude in Jan 2025 — but also
   that ADNOC "flexed Murban back to Ruwais" in mid-2025 when the arbitrage closed.
   So C is best labeled "opportunistic third-party sour diet (e.g. Basrah)" rather
   than a permanent state. The "why this matters" note will explain the arbitrage
   logic: run whatever nets the most export value that month.
5. **ADNOC does not publish per-crude product yields for Ruwais.** Scenario yield
   bars will be **representative estimates** derived from public crude assays +
   public unit capacities, and labeled as such in the UI (distinct tag from
   `public/approx`). Never presented as facts.

---

## 2. Unit list (with sources)

Zone colors in brackets. Capacity `null` = not public; UI will say "not public."

### Zone 1 — Crude receipt & storage [slate blue]
| Unit | Capacity | Source |
|---|---|---|
| Habshan–Ruwais crude pipeline inlet (Murban) | null | ADNOC (route public knowledge; no public capacity for refinery leg) |
| Marine crude jetty (imports: Upper Zakum, Basrah, third-party) | null | MEES Apr 2024 (Basrah cargo delivery by tanker) |
| Crude tank farm (6 schematic tanks, grade allocation changes per scenario) | null | representative |

### Zone 2 — Primary separation [steel grey]
| Unit | Capacity | Source |
|---|---|---|
| CDU (Ruwais West) | 417,000 b/d | OGJ "Takreer commissions Ruwais refinery expansion" |
| VDU | 200,000 b/d | OGJ (same) |

### Zone 3 — Conversion [orange-red]
| Unit | Capacity | Source |
|---|---|---|
| RFCC (resid fluid catalytic cracker) | 127,000 b/d | OGJ; Eni/press "world's largest" |
| Hydrocracker | 57,000 b/d | OGJ |
| **ARD — Atmospheric Residue Desulphurizer (CFP, new 2023)** | 177,000 bpsd | A Barrel Full CFP page; OGJ CFP articles |

### Zone 4 — Treating & upgrading [teal]
| Unit | Capacity | Source |
|---|---|---|
| Naphtha hydrotreater | 69,000 b/d | OGJ |
| Kerosene/jet hydrotreater | 108,000 b/d | OGJ |
| Diesel hydrotreater | 75,000 b/d | OGJ |
| Gasoline hydrotreater (RFCC naphtha) | 37,000 b/d | OGJ |
| C4 isomerization | 23,000 b/d | OGJ |
| CCR reformer | null | unit existence public (licensor/press); capacity not found |
| Amine Regeneration Unit (CFP) | 21,600 t/d | A Barrel Full CFP page |
| Sour Water Strippers (CFP) | 3,120 t/d | A Barrel Full CFP page |
| Saturated Gas Plant (CFP) | 705 t/d | A Barrel Full CFP page |

### Zone 5 — Sulfur & hydrogen [violet/orange]
| Unit | Capacity | Source |
|---|---|---|
| Hydrogen Manufacturing Unit (CFP) | 243,000 Nm³/h | A Barrel Full CFP page |
| SRU + TGTU (CFP addition) | 1,100 t/d | A Barrel Full CFP page |
| Pre-CFP sulfur recovery | null | existence public; capacity not found |

### Zone 6 — Blending & product storage [green]
Product tank farm (gasoline, jet, diesel, fuel oil, LPG spheres, sulfur pad),
blending headers. All representative; no public tankage figures.

### Zone 7 — Export & dispatch [cyan]
Product jetty (tankers), domestic pipeline/truck rack. Representative.

### Zone 8 — Utilities [dim grey]
Power/steam block, cooling water, flare. Simplified, representative.

### Context blocks (greyed, non-interactive except a one-line tooltip)
Ruwais East refinery (~420,000 b/d, Murban diet — shown as one simplified block),
Borouge petrochemical complex, Ruwais LNG (planned), base oils plant.

**Focus decision:** the interactive detail covers **Ruwais West** (where CFP
lives). East is a single context block with its own crude feed line — otherwise
the scene doubles in size for no educational gain. Flag if you want East detailed.

---

## 3. Zone layout sketch (schematic, not geographic)

```
        ┌────────────────────────────────────────────────────────────────┐
        │                        [8] UTILITIES          ✱ flare          │
        │                                                                │
 Habshan│  [1] CRUDE RECEIPT        [2] PRIMARY           [3] CONVERSION │
 ═══════╪══► pipeline inlet         ┌─────┐  ┌─────┐      ┌──────┐       │
 (Murban│         │                 │ CDU │─►│ VDU │      │ RFCC │       │
  crude)│         ▼                 └──┬──┘  └──┬──┘      └──────┘       │
        │   ╔═══════════╗              │        │         ┌──────┐       │
  tanker│   ║ crude tank ║────────────►│        └────────►│ HCU  │       │
 ───────┼──►║ farm (6)   ║   atm.resid │                  └──────┘       │
  jetty │   ╚═══════════╝       ┌──────┴───┐              ┌──────┐       │
 (UZ /  │                       │ARD (CFP)│─────────────►│(feeds │       │
 Basrah)│                       └──────────┘              │ RFCC) │      │
        │                                                                │
        │  [5] SULFUR & HYDROGEN        [4] TREATING & UPGRADING         │
        │  ┌─────┐ ┌─────────┐          NHT · KHT · DHT · GHT · CCR ·    │
        │  │ HMU │ │SRU+TGTU │          ISOM · ARU · SWS · SGP           │
        │  └─────┘ └─────────┘                                           │
        │                                                                │
        │  [6] BLENDING & STORAGE            [7] EXPORT & DISPATCH       │
        │  product tanks + blend headers ──► product jetty ═► tankers    │
        │                                └─► domestic pipeline/trucks    │
        │                                                                │
        │  ▓▓ Ruwais East (context) ▓▓  ▓▓ Borouge ▓▓  ▓▓ LNG (plan) ▓▓ │
        └────────────────────────────────────────────────────────────────┘
```

Camera presets: one per zone + "overview" + "CFP tour" (frames ARD/HMU/SRU).

---

## 4. Scenario assumptions

### Crude specs (public/approx)
| Grade | API | Sulfur wt% | Source |
|---|---|---|---|
| Murban | ~40 | ~0.7–0.8% | TotalEnergies Murban assay; Platts methodology |
| Upper Zakum | ~34 | ~1.75% | ExxonMobil UZ assay; Platts |
| Basrah Medium | ~27.9 | ~3.0% | S&P Global (SOMO 2020 respec) |
| Basrah Heavy | ~24 | ~4.05% | S&P Global |

### Straight-run cut yields (vol%, **representative**, from public assay summaries)
| Cut | Murban | Upper Zakum | Basrah Medium blend |
|---|---|---|---|
| Gas + LPG | ~3 | ~2 | ~2 |
| Naphtha (C5–160°C) | ~27 | ~20 | ~16 |
| Kerosene (160–230°C) | ~15 | ~13 | ~11 |
| Gasoil/diesel (230–360°C) | ~24 | ~21 | ~19 |
| Atmospheric residue (360°C+) | ~31 | ~44 | ~52 |

The teaching point the CDU animation makes: **heavier crude ≈ more residue**, and
residue is exactly what the ARD → RFCC / VDU → HCU chain exists to convert.

### Scenario table (all **representative estimates** unless cited)
| Metric | A: Murban (pre-CFP) | B: Upper Zakum (post-CFP) | C: Basrah-led sour diet |
|---|---|---|---|
| West feed | 417k b/d Murban | ~420k b/d UZ (public) | ~420k b/d Basrah Medium/Heavy + other sour |
| Feed sulfur load | ~400 t/d | ~1,000 t/d | ~1,800–2,400 t/d |
| H₂ demand (rel.) | low | high | very high |
| ARD utilization | idle/bypassed (didn't exist pre-CFP) | high | max |
| RFCC / HCU | full, sweet feed | full, ARD-treated feed | full, ARD at limit |
| Murban freed for export | 0 | ~420k b/d (public: MEES, S&P) | ~420k b/d + buys discounted Basrah |
| Product slate (bars) | gasoline ~30, diesel ~31, jet ~16, LPG+C3= ~7, FO ~4, S ~0.7 | gasoline ~28, diesel ~29, jet ~14, LPG+C3= ~7, FO ~7, S ~1.7 | gasoline ~26, diesel ~27, jet ~12, LPG+C3= ~6, FO ~11, S ~3 |

Feed-sulfur t/d is arithmetic from public API/S specs (barrels × density × S%),
shown with the formula in the UI so it's transparent. Product slates are
representative (labeled so); ADNOC publishes none.

**"Why this matters" one-paragraph notes** (drafted per scenario): A = baseline,
burning your best export barrel at home; B = CFP arbitrage — refine sour, export
Murban at a premium (Murban exports hit 8-year highs, S&P May 2024); C = the same
logic extended to *anyone's* discounted sour barrels, with the constraint that
sulfur handling (SRU 1,100 t/d) and hydrogen become the binding limits as feed
gets heavier.

---

## 5. Architecture & data (as you specified, confirming)

- `ruwais-refinery/` subfolder of this repo. Vite + Three.js + TypeScript, no backend.
- `/data/units.json`, `/data/flows.json` (volume_by_scenario{A,B,C}), `/data/scenarios.json`,
  `/data/i18n.json` — validated on load (lightweight hand-rolled validator, no dep),
  clear on-screen error listing the offending field if malformed.
- Every displayed number carries a `tag: "public" | "approx" | "representative" | "not-public"`
  rendered as a small badge; `source_refs[]` link into SOURCES.md anchors.
- Primitives only (cylinders/boxes/spheres/tubes), instanced where repeated;
  particle flows on `CatmullRomCurve3` paths, count/thickness scaled by scenario
  volume; sprite-based labels with distance-tiered visibility.
- Mobile: touch OrbitControls, DPR cap, reduced particle count, simplified tank farm.
- Stream colors exactly as you specified (crude dark, naphtha/gasoline yellow, jet
  light blue, diesel green, residue brown, gas/LPG white, hydrogen violet, sulfur orange).

## 6. Build order (your list, unchanged)
static scene → labels/legend → click panels → flows → scenarios → guided tour
(14 steps, "Follow the crude") → 2D SVG PFD view → i18n (EN + AR skeleton for your
edit, RTL-aware panels) → mobile pass. After each stage: dev server + headless
Chromium (pre-installed) → assert zero console errors → screenshot to `/screenshots`.
Then README.md (run/edit/known simplifications) and SOURCES.md (every figure, URL,
access date 2026-09-17).

## 7. Open questions before I code
1. **Ruwais East as a single context block** (my recommendation) — OK?
2. Scenario C label: "Basrah-led sour diet (opportunistic)" with the mid-2025
   Murban-flex caveat — OK, or keep your simpler "current situation" framing?
3. "Trace a barrel" starts from any crude tank and follows CDU cuts to product
   tanks — planned as part of the flows stage. Confirm it's a must-have for v1.

---

### Key sources (full list with access dates goes to SOURCES.md)
- OGJ — [Takreer commissions Ruwais refinery expansion](https://www.ogj.com/refining-processing/refining/operations/article/17245418/takreer-commissions-ruwais-refinery-expansion) (unit capacities)
- OGJ — [ADNOC's Ruwais refinery due multibillion-dollar crude flexibility project](https://www.ogj.com/refining-processing/refining/optimization/article/17297666/adnocs-ruwais-refinery-due-multibillion-dollar-crude-flexibility-project); [CFP progress](https://www.ogj.com/refining-processing/refining/article/14181816/adnoc-progresses-on-ruwais-refinerys-crude-flexibility-project)
- A Barrel Full — [Ruwais Refinery Crude Flexibility Project](http://abarrelfull.wikidot.com/ruwais-refinery-crude-flexibility-project) (CFP six-unit scope & capacities)
- MEES — [Adnoc Finalizes Ruwais CFP](https://www.mees.com/2023/11/17/refining-petrochemicals/adnoc-finalizes-ruwais-crude-flexibility-project/e330ade0-8554-11ee-9d82-d97d92834405) (Nov 2023); [Basrah imports](https://www.mees.com/2024/4/26/oil-gas/adnoc-imports-basrah-crude-for-ruwais-refinery/03c197e0-03c4-11ef-94f0-b5ec5bff662c) (Apr 2024); [Basrah Heavy lift](https://www.mees.com/2024/11/8/news-in-brief/adnoc-lifts-basrah-crude-for-ruwais-refinery/c3dcdec0-9ddd-11ef-b368-5d72dc55b7bb); [first Kuwaiti crude](https://www.mees.com/2025/1/10/oil-gas/adnoc-supplies-ruwais-refining-complex-with-first-kuwaiti-crude/f3516860-cf50-11ef-93fd-796baa88849f); [Murban flexed back](https://www.mees.com/2025/6/6/oil-gas/adnoc-flexes-murban-crude-back-to-ruwais-refinery/b5927310-42d0-11f0-a555-f1f968559a35) (Jun 2025)
- S&P Global — [ADNOC transforms Ruwais as Murban exports hit 8-yr high](https://www.spglobal.com/energy/en/news-research/latest-news/crude-oil/050724-uaes-adnoc-transforms-ruwais-refinery-as-murban-exports-hit-eight-year-high); [Iraq new export grade specs](https://www.spglobal.com/energy/en/news-research/latest-news/crude-oil/111820-iraq-outlines-new-specs-of-crude-export-grades)
- ADNOC — [Refining locations](https://www.adnoc.ae/en/adnoc-refining/about-us/locations) (837k design / >922k bpsd); [Crude Flexibility project page](https://www.adnoc.ae/en/our-projects/crude-flexibility)
- Assays — [TotalEnergies Murban assay (PDF)](https://trading.totalenergies.com/wp-content/uploads/2025/11/MURBAN.pdf); [ExxonMobil Upper Zakum assay (PDF)](https://corporate.exxonmobil.com/-/media/global/files/crude-oils/pdf/2024/upper_zakum.pdf) — *both blocked by this sandbox's egress proxy; cut yields above are from secondary public summaries and marked representative. Please spot-check these two PDFs if you want the CDU cut numbers tightened.*
- Wikipedia — [Ruwais refinery](https://en.wikipedia.org/wiki/Ruwais_refinery)
