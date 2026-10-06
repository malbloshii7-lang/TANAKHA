# WMO President — "One line across three WMO Regions" (LinkedIn video)

A 50-second, 1080×1350 (4:5) motion piece for the WMO President's LinkedIn, built from the
September–October 2026 mission infographic and using the same layout, palette and imagery.

**Deliverables** (in `out/`)

| File | What |
|---|---|
| `wmo-president-mission-2026.mp4` | Final video — H.264 High, 30 fps, AAC 48 kHz stereo, −14 LUFS, faststart |
| `wmo-president-mission-2026_poster.png` | Final frame (the full infographic) — use as the LinkedIn custom thumbnail |

## Storyboard (101 BPM grid — every cut lands on the beat)

| Time | Scene |
|---|---|
| 0.0–5.9 s | Header, headline *One line / across three / WMO Regions*, name, stats card (4 weeks · II·V·VI · 3 WMO Regions); the route draws as a timeline with all six dates |
| 5.9–7.3 s | The flat dot-map and the timeline **morph into a 3-D globe**; the line becomes the real great-circle route |
| 7.3–10.1 s | A pulse travels Bishkek → Nuku’alofa → Wellington → Melbourne → Jakarta → Bucharest; each city and its WMO Region labels in |
| 10.1–11.9 s | The globe shrinks and **docks as the locator badge** of the first card, which builds around it |
| 11.9–40.4 s | Six stop cards (4.75 s each) along one continuous line, whip-pans with true motion blur, Ken Burns photos, a mini-globe per card tracing the route |
| 40.4–45.1 s | *Early warnings. National services. Regional ownership.* + EW4All · AIM for Scale · RTC training · Strategic Plan 2028–2031 |
| 45.1–50.0 s | Everything flies into the **exact infographic layout**; a last comet runs the line |

## How it is made

- `index.html` + `css/stage.css` + `js/engine.js` — a deterministic renderer: `renderFrame(t)` sets every element for time `t` (DOM for type/cards, canvas for the globe, dots and route). Open `index.html?t=12` over a local server to inspect any moment.
- `js/data.js` — all text (verbatim from the infographic) and poster geometry.
- `assets/photos/` — the six city images cut from the infographic (`ref/infographic.png`), corner-inpainted and upscaled 4× with Real-ESRGAN (ncnn models from the `realesrgan-ncnn-vulkan` v0.2.5.0 release, unzipped to `tools/realesrgan/`) by `tools/prep_photos.py`; `assets/wmo_emblem*.png` by `tools/prep_emblem.py`; `assets/dots.js` (land dots from Natural Earth via `world-atlas`) by `tools/build_dots.mjs`.
- `tools/score.py` — the soundtrack is synthesised from code (pads, e-piano, bells, soft drums, whooshes, risers) on the same timeline constants, then loudness-normalised with ffmpeg.

## Re-render

```bash
npm install                      # d3-geo, topojson-client, world-atlas (only for tools/build_dots.mjs)
python3 -m http.server 8765 &    # the page must be served over http
for w in 0 1 2 3; do node tools/render.js frames 30 $w 4 & done; wait
python3 tools/merge.py frames    # merges motion-blur sub-frames
node tools/dump_timeline.js                  # exact cue times for the score
python3 tools/score.py audio/score_raw.wav && bash tools/loudnorm.sh   # -14 LUFS / -1.5 dBTP
bash tools/encode.sh frames audio/score_final.wav out/wmo-president-mission-2026.mp4
```
