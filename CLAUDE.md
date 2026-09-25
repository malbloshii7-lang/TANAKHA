# CLAUDE.md

## Mistake-tracking protocol

- Anytime I do something incorrectly, add it to this file under "Known mistakes" so I don't repeat it.
- After every correction the user gives me, end my reply with: `Update your CLAUDE.md so you don't make that mistake again.`

## Known mistakes

<!-- Append each entry as: `- YYYY-MM-DD — <what went wrong> → <what to do instead>` -->
- 2026-09-25 — Put a Latin year range ("2007–2027") inside an RTL page without isolating it, so the bidi algorithm displayed it as "2027–2007" → wrap Latin and number runs in RTL text with `dir="ltr"` or `<bdi dir="ltr">`, and screenshot the Arabic view before shipping.
- 2026-09-25 — Sized a stat-figure grid for short numbers only; "US$22.5m" overran into the next cell → size figure grids for the widest value and measure cell overflow at desktop, tablet and phone widths.
- 2026-09-25 — Wrote an estimated distance ("4,800 km") into a film readout without computing it; the great-circle figure is ~4,915 km → never put a number on screen that isn't sourced or computed; prefer raw data (coordinates) over estimates.
- 2026-09-25 — Crossfaded persistent chapter labels between scenes, so two labels overlapped mid-transition → switch labels and other fixed UI at the cut (fade out before, fade in after), and review a frame at the exact midpoint of every transition.
- 2026-09-25 — Drew a falaj whose tunnel ran uphill and a ship resting above the waterline → check every technical drawing against physics (gravity flow, waterlines, objects standing on the ground) before review, not just its layout.
- 2026-09-25 — Crossfaded scenes by drawing each at partial alpha, so paper "masks" punched holes in the other scene and revealed hidden construction lines → dissolve by drawing the incoming scene whole on its own layer and compositing that layer; review frames at cut ± 0.1 s.
- 2026-09-25 — Wrote headlines that claimed other bodies' outcomes for NCM ("We keep the skies open", "We guide the ships home"; إرشاد means pilotage) and dropped a figure's qualifier (18.2% of GDP includes tourism) → keep headline verbs within the verified role, check the Arabic term's technical sense, and carry every qualifier the source gives.
- 2026-09-25 — Used characters the loaded font lacks or draws oddly (ʿ ʾ in IBM Plex Mono fell back; "~" in IM Fell italic looks like a minus) → check the font's glyph coverage and zoom on rendered text before using modifier letters or symbols.
- 2026-09-25 — Drew generic, invented stand-ins (a Burj-like tower, a single crane with its boom along the ship, flat PV panels, a spiky mountain, toy boats with an out-of-scale diver) where the film was about real UAE places → draw the real, named infrastructure and landscape from researched dimensions and descriptions, check each machine's working geometry (a quay crane's boom spans the ship's beam), and draw people, vessels and objects to one consistent scale.
- 2026-09-25 — Drew the Iron Age Hili falaj as the textbook qanat (a deep mother well at a mountain's foot) and put a 1980 road on Jebel Hafeet in an Iron Age scene → check period-specific archaeology before drawing a historical structure, and keep modern features out of historical scenes.
