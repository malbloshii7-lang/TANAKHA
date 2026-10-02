# Four Weeks, Three Regions

This is a short film for the LinkedIn account of H.E. Dr Abdulla Al Mandous, President of the World Meteorological
Organization. It covers his missions from September to October 2026:
- **Kyrgyzstan:** Kyrgyzhydromet's centenary and the 37th session of the CIS Interstate Council for Hydrometeorology.
- **The South-West Pacific:** the Pacific ministers' meeting in Tonga; MetService, the Bureau of Meteorology and BMKG.
- **Bucharest:** the Regional Association VI Regional Conference and RA VI-19.

**The feed cut** runs 59.5 s, in 4:5 (1080×1350, 30 fps).
- **The open:** it starts bright, with the title complete on the first frame, which is the thumbnail and the autoplay
  preview.
- **The stops:** each stop has 11 s on one plate, with one set of words.
- **The close:** the register of the six stops, the aim (early warnings for everyone by the end of 2027), and his name.

**What it leaves out:**
- **The President does not appear.** That was the requester's direction; his photographs are in his earlier posts.
- **No voice-over.** The sound is a recorded score with recorded places under each stop.
- **The hosts and the distance:** the hosts are thanked by name in the post (`POST.md`), not in the film, and the
  distance is left to the post.

**Style.** It is drawn in the gala edition's language (`../ncm-20/gala`): engraved plates on parchment, hand-coloured
with transparent washes.
- **The register.** It runs along the top: the date, the place, the WMO Region and the local time of each stop.
- **The plates:** each beat's plate is the real place, drawn from data:
  - the Teskey Ala-Too across Issyk-Kul, from the terrain;
  - the Nukuʻalofa lagoon and reef, from Sentinel-2;
  - the week's pressure charts over Region V, from the GFS analyses;
  - the Bucharest-Băneasa observation garden, in the station's own weather.

**Words and facts.**
- The screen is English, and the Arabic travels as an SRT.
- Every fact and its source is in `SOURCES.md`. Facts that come only from the office's internal briefings are not used.
- Nothing is typed in the bottom 15% of the frame, where LinkedIn's controls and captions sit.

The first, 93 s edition (with a slower title and longer holds) is in the git history (commit 9291430).

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
FILM_QUERY="colour&fadeout=1.0" node render.js film out/master-2x.mp4 out/score.wav --scale 2 --jobs 3
"$FFMPEG" -i out/master-2x.mp4 -vf "scale=1080:1350:flags=lanczos" -c:v libx264 -preset slow -crf 17 -profile:v high \
  -pix_fmt yuv420p -colorspace bt709 -color_primaries bt709 -color_trc bt709 -c:a copy -movflags +faststart out/four-weeks-three-regions.mp4
```

The 2× render, scaled down, keeps the engraving's fine lines clean at the delivery size.
