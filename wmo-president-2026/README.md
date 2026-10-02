# Four Weeks, Three Regions

This is a short film for the LinkedIn account of H.E. Dr Abdulla Al Mandous, President of the World Meteorological
Organization. It covers his missions from September to October 2026, in this order:
- Kyrgyzstan: Kyrgyzhydromet's centenary and the 37th session of the CIS Interstate Council for Hydrometeorology;
- the South-West Pacific: the Pacific ministers' meeting in Tonga, then MetService, the Bureau of Meteorology and BMKG;
- Bucharest: the Regional Association VI Regional Conference and RA VI-19.

The film runs 93 s.

**Frame and sound.**
- It is made in 4:5 (1080×1350, 30 fps) for the feed. It reads without sound: LinkedIn plays muted.
- There is no narration. The score is recorded instruments, with recorded places under each beat.

**Style.** It is drawn in the gala edition's language (`../ncm-20/gala`): engraved plates on parchment, hand-coloured
with transparent washes.
- **The register.** A register runs along the top, one row per mission, as an observer keeps one: the date, the
  place, the WMO Region and the local time. On the last page it holds every mission.
- **What the plates show.** Each beat's plate is the real place, drawn from data:
  - the Teskey Ala-Too across Issyk-Kul, from the terrain;
  - the Nukuʻalofa lagoon and reef, from the bathymetry;
  - the week's pressure charts over Region V, from the GFS analyses;
  - a Bucharest observation garden.
- **The photographs.** The office's own photographs are laid on the plates as prints.

**Words and facts.**
- The screen is English. The Arabic travels as an SRT.
- Every fact and its source is in `SOURCES.md`. Facts that come only from the office's internal briefings are not used.
- Nothing is typed in the bottom 15% of the frame, where LinkedIn's controls and captions sit.

## Files

| Path | What it is |
|---|---|
| `film.html` | The film, live in a browser (silent). `?t=60` starts at 1:00, `?scale=2` renders 2160×2700, `?slots` marks where each photograph will sit, and `?colour` turns on the colour pass (always on for delivery) |
| `engine.js`, `engrave3d.js`, `start.js`, `render.js` | The gala edition's engine, 3D engraving, boot and renderer, copied with the frame set to 1080×1350 and their own fonts |
| `scenes/kit.js` | The layout and devices: the register, the words under the plate (never below the safe line), and the prints |
| `scenes/*.js` | One file per beat: `open`, `kyrgyz`, `tonga`, `regionv`, `bucharest`, `close`. `kit3d.js` is the gala's 3D plate kit |
| `timeline.js` | The cut: each beat's times, register row and words, with the Arabic of every part for the SRT |
| `score.py` | The score: VSCO-2 CE orchestra and field recordings, from the gala's `audio.py`, `sampler.py` and `foley.py` |
| `subtitles.js` | Writes the English and Arabic SRT from the build itself |
| `photos/` | The office's photographs, as named in `photos/README.md`. They are not committed |
| `data/` | The plates' derived data (skyline, coastlines, pressure grids) |
| `SOURCES.md` | Every fact, source and computation |

## Build

```sh
export NODE_PATH=/opt/node22/lib/node_modules FFMPEG=$(python3 -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())")
python3 score.py out/score.wav --samples ../VSCO-2-CE --foley ../foley     # −14 LUFS, −1 dBTP
node subtitles.js out                                                     # out/four-weeks-three-regions.{en,ar}.srt
FILM_QUERY="colour&fadeout=2.5" node render.js film out/master-2x.mp4 out/score.wav --scale 2 --jobs 3
"$FFMPEG" -i out/master-2x.mp4 -vf "scale=1080:1350:flags=lanczos" -c:v libx264 -preset slow -crf 17 -profile:v high \
  -pix_fmt yuv420p -colorspace bt709 -color_primaries bt709 -color_trc bt709 -c:a copy -movflags +faststart out/four-weeks-three-regions.mp4
```

The 2× render, scaled down, keeps the engraving's fine lines clean at the delivery size.
