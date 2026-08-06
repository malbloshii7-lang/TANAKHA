# GHAITH — The Full Film

**4K MASTER (presentation):**
https://d8j0ntlcm91z4.cloudfront.net/user_3GDYTMzP23BD6MHwIHFhhk07Vl5/hf_20260806_085714_58f43e0e-7344-4149-b41b-e07d1c0dd3f4.mp4
3840×2160 · Topaz prob-4 enhancement · ~1.3 GB

**1080p MASTER (distribution):**
https://d2ol7oe51mr4n9.cloudfront.net/user_3GDYTMzP23BD6MHwIHFhhk07Vl5/4f3788fa-9edd-48c3-916d-bd254a0208b0.mp4

**39 shots · 3 min 24 s · silent**
Fade in over 1.5 s, fade to black over the final 3 s.

Every shot cel-shaded. Every aircraft shot either supplied hero footage or reference-locked to it.

## Six acts

### I — The decision (29 s)
| # | Beat |
|---|---|
| 01 | NCM headquarters, Abu Dhabi |
| 02 | UAE flags, radomes on the roof |
| 03 | Central Forecast Office, radar wall |
| 04 | The cell over Al Ain, pulsing red |
| 05 | The senior forecaster gives the order |
| 06 | The order goes out by radio |

### II — Preparation (30 s)
| 07 | Al Ain airport from the air |
| 08 | NCM hangar, props turning |
| 09 | Ground crew load the flares |
| 10 | The loaded rack — two rows, bolt plate |
| 11 | Ground service, close |
| 12 | The crew walk out |
| 13 | Cockpit, checklist, instruments waking |

### III — Departure (32 s)
| 14 | Apron taxi |
| 15 | Runway lineup |
| 16 | Takeoff roll |
| 17 | **Hero takeoff** |
| 18 | Cockpit rotation |
| 19 | Climb-out, gear folding |
| 20 | Over the desert |

### IV — Transit (28 s)
| 21 | Cruise over the Hajar |
| 22 | Cockpit at altitude, cloud ahead |
| 23 | Past Jebel Hafeet |
| 24 | The cells building — no aircraft |
| 25 | Under the cells |

### V — The seeding (36 s)
| 26 | The hand presses **RELEASE** |
| 27 | **Flares firing** — 10 s, the longest hold in the film |
| 28 | The racks |
| 29 | Smoke drawn up into the cloud base |
| 30 | Banking for a second pass |
| 31 | Very wide — the aircraft small beneath the storm |

### VI — The return (49 s)
| 32 | Turning for home |
| 33 | Descent through weather |
| 34 | Final approach, rain shaft behind |
| 35 | Cockpit touchdown, rain on the glass |
| 36 | Touchdown in the rain |
| 37 | Taxi back across the wet apron |
| 38 | Props wind down, empty racks |
| 39 | **Rain on the desert — wet sand, rivulets, green shoots** |

The film ends on rain falling on sand. No aircraft in the last shot. That is what the operation
is for, and it is the only image that says so without narration.

## Production

- 24 shots rendered for this cut, `seedance_2_0_mini`, 720p, 5 s, reference-locked where the
  aircraft appears. **240 credits.**
- 15 shots from supplied hero footage and earlier reference-locked renders.
- Reference: `hero-aircraft-inflight.jpg` (aircraft) and `hero-flare-rack.jpg` (rack).
- Method in `METHOD.md`: fixed elements from the reference image, variable elements from the
  prompt, never describe a fixed element in the prompt.

## Remaining

- **Silent.** `generate_audio` is text-to-speech only and explicitly declines music and sound
  effects — a score is **not obtainable through this toolchain** and must come from outside.
  Narration in English or Arabic *is* possible here.
- ~~Reference-locked shots render at 720p inside a 1080p timeline.~~ **Done:** the master has been
  through a Topaz prob-4 pass to 3840×2160.
