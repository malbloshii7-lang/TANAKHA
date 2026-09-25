# CLAUDE.md

## Mistake-tracking protocol

- Anytime I do something incorrectly, add it to this file under "Known mistakes" so I don't repeat it.
- After every correction the user gives me, end my reply with: `Update your CLAUDE.md so you don't make that mistake again.`

## Known mistakes

<!-- Append each entry as: `- YYYY-MM-DD — <what went wrong> → <what to do instead>` -->
- 2026-09-25 — Put a Latin year range ("2007–2027") inside an RTL page without isolating it, so the bidi algorithm displayed it as "2027–2007" → wrap Latin and number runs in RTL text with `dir="ltr"` or `<bdi dir="ltr">`, and screenshot the Arabic view before shipping.
- 2026-09-25 — Sized a stat-figure grid for short numbers only; "US$22.5m" overran into the next cell → size figure grids for the widest value and measure cell overflow at desktop, tablet and phone widths.
