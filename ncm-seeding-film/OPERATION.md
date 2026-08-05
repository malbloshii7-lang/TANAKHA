# GHAITH — The Operation

The delivered film. Eleven shots, 89 s, 1920×1080, silent.

**Film:** https://d2ol7oe51mr4n9.cloudfront.net/user_3GDYTMzP23BD6MHwIHFhhk07Vl5/3f3a7bbe-2263-45ad-ac70-2a70aee3424b.mp4

## Why this cut exists

Earlier masters (`PROMPTS-v2.md`, `GHAITH-PRODUCTION.md`) were built from text prompts, so the
aircraft was re-invented on every render and drifted shot to shot — the exact failure the brief
warned against. This cut is assembled **only from green-livery material**: the supplied hero clips
plus the renders that were reference-locked or spec-matched to them. One aircraft throughout.

## Sequence

| # | Beat | Source | In | Len |
|---|---|---|---:|---:|
| 01 | Forecast office — the order | hero `CFO_LADY` | 2 s | 7 s |
| 02 | Ground service — loading the flares | hero `Ground_Service` | 0 s | 4 s |
| 03 | Apron taxi | render, green-livery clause | 1 s | 9 s |
| 04 | Climb-out, gear retracting | render, green-livery clause | 1 s | 9 s |
| 05 | Cruise, low three-quarter | hero `Cruising` | 0 s | 6 s |
| 06 | Cruise over the Hajar | hero `Mid_flight_cruise` | 0 s | 10 s |
| 07 | Held cruise, mountains | render, green-livery clause | 1 s | 9 s |
| 08 | Flare racks, loaded | hero `loaded_flares` | 0 s | 6 s |
| 09 | Flares firing | render, green-livery clause | 1 s | 9 s |
| 10 | Cruise, reference-locked | render, `seedance` image_references | 0 s | 5 s |
| 11 | Extended cruise | render, `kling3_0` from hero start-frame | 0 s | 15 s |

## Known limits

- **Silent.** No audio was ever generated. A single scored mix over the whole 89 s is the largest
  remaining improvement.
- **No landing.** The only approach and touchdown footage carries the old navy/red livery, so it
  was cut rather than break aircraft continuity. The film ends in cruise. Closing the loop needs
  two reference-locked shots — approach and at-rest — at ~10 credits each.
- **Mixed rendering styles.** The hero clips are not one visual world: `CFO_LADY` is cel-shaded and
  vertical (pillarboxed here), `Ground_Service` is photorealistic, the cruise clips are stylized 3D.
  The livery is consistent; the render style is not.
- Shot 11 was requested as a three-beat multi-shot generation, but the backend dropped
  `multi_shots` when a `start_image` was supplied. It is one continuous 15 s take.

## Method

See `METHOD.md`. Fixed elements come from a reference image, variable elements from the prompt.
Never describe a fixed element in the prompt.
