# EMPWR · Greater Emblem — The Infused Seal

A grand seal for the **Dr. Abdulla Al Mandous — WMO President re-election campaign (2027–2031)**,
created by infusing all six concept studies from `Dr__Almandous_WMO_Reelection_Emblem.pptx`
into a single master emblem.

## What was infused

| Source direction | Element carried into the greater emblem |
|---|---|
| 3A · Seal — hairline rings | Three concentric hairline rings form the outer boundary |
| 3C · The purest stack | Circumscribed titles: name above, mandate and term below |
| 2A · The gold line | A single gradient gold ring divides titles from the heart of the mark |
| 2B · The wind stroke | Three wind strokes sweep behind the compass star |
| 1B · Chrome gold wordmark | EMPWR set in chrome gold anchors the base |
| 1C · Acrostic pillars | Five compass stars stud the rings — one per pillar — and the motto arcs over the star |
| 1D · Colophon — paper and gold | The paper-and-gold palette and the colophon star beneath the wordmark |

The central compass star is the exact geometry from the source deck (two overlaid
four-point stars, one rotated 45°, with a pale center dot), and the gold ramp is the
source gradient: `#f8e6b0 → #eccb85 → #cf9f4d → #b68235 → #8a5d1f` on charcoal `#232323`
and paper `#faf6ec`.

## Files

- `greater-emblem-light.svg` / `greater-emblem-dark.svg` — master vectors (edit these)
- `greater-emblem-light-2000.png` / `greater-emblem-dark-2000.png` — 2000×2000 exports
- `EMPWR-greater-emblem.pptx` — presentation slides (4A light seal · 4B ceremonial dark · 4C anatomy)

## Regenerating the PNGs

Render the SVG at 1000×1000 CSS pixels with a 2× scale factor in any Chromium:

```sh
chromium --headless --no-sandbox --force-device-scale-factor=2 \
  --window-size=1000,1000 --screenshot=greater-emblem-light-2000.png \
  greater-emblem-light.svg
```
