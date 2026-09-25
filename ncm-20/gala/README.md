# Reading the Sky · Gala Edition

The film for the National Center of Meteorology's 20th-anniversary ceremony (March 2027). It is made to be shown on a
large LED wall in a dark hall to an audience that includes UAE ministers. It grows out of the v3 film in `../film/`
and keeps that film's engraved-plate language, rebuilt for the room:

- **Arabic first.** Every words block leads with Arabic (Noto Kufi Arabic; Amiri for quotations), with English
  second. Latin and number runs inside Arabic are isolated so they cannot reorder. The narrator's copy is fully
  vowelled; on-screen Arabic is not.
- **Night to night.** The film opens on the real pre-dawn sky over Abu Dhabi as Suhail rises, computed from the Yale
  Bright Star Catalogue. It turns to parchment at dawn. It ends on the March 2027 night seen from Marina Mall:
  - Suhail stands 12.2° up in the south, just clear of the Etihad Towers.
  - Emirates Palace lies low to the right.
  - Every building is at its true bearing and angular size.
- **One device.** A turning circle carries the film: the star wheel, the compass and wind roses, the radar scope, the
  globe, the gauge's rim, and the gold ring around Suhail at the end.
- **Protocol.**
  - Leaders' words appear only on cards, never in the narration, and each card carries the music as fully as any beat.
  - The national map lights all seven emirates together and names them in constitutional order. It has no range
    rings, no point symbols and no trajectories.
  - Abu Musa and the Greater and Lesser Tunb are drawn as UAE territory from neutral data. Musandam and Madha are
    left to Oman.
  - April 2024 is shown on the national map as a weather chart would show it.
  - The seeding aircraft works over UAE ground.
  - `TREATMENT.md` (Revision 2 and §11) lists what NCM and the protocol office must still decide.

## Files

| Path | What it is |
|---|---|
| `film.html` | The film, live in a browser (silent). Query options: `?t=60` start at 1:00 · `?scale=2` 4K · `?grade=led` LED-wall grade · `?vo` scratch narration as subtitles · `?tc` burned-in timecode · `?hold=A\|B\|C\|W` a stage hold |
| `engine.js` | Drawing, type, camera, transitions (fade, dawn, dusk, iris), themes (parchment and night), text recording, the frame loop |
| `timeline.js` | The cut: every beat, its words and their film times, the narration (`VO`), the stage holds |
| `scenes/` | One file per scene. `plate-*.js` are the v3 plates (drawing only). `night-*.js`, `map-nation.js` and `cards.js` are new |
| `data/` | The star catalogue, the UAE map (`build/` has its build scripts, a check image and `rak_skyline.py` for the seeding skyline), the verified quotes |
| `fonts/` | The typefaces, self-hosted, with their SIL Open Font Licences. A render stops if any face fails to load |
| `render.js` | Renders stills, the film (in parallel chunks; 4K, 50 fps and the LED grade are options) and the cue list with every words block |
| `audio.py`, `score.py` | The synthesized temp score, placed from the timeline: stems, mixes, the stage loop and the applause bed |
| `subtitles.py` | On-screen text and narration as Arabic and English SRT files |
| `cuesheet.py` | The show-control cue sheet (cue to cue, with SMPTE timecode) |
| `script.py` → `SCRIPT.md` | The as-built script for approval: every narration line and every words block, with its times |
| `TREATMENT.md` | The treatment: purpose, messages, structure, the music brief, the protocol checklist, deliverables and open decisions |

## Build

```bash
export NODE_PATH=/opt/node22/lib/node_modules          # Playwright with Chromium
export FFMPEG=$(python3 -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())")
node render.js cues out/cues.json                     # the timeline, every words block and the narration
python3 score.py out/cues.json out/                   # music, sfx, mix (-16 LUFS), mix-r128 (-23), part1/part2, hold, hold-world (.wav)
python3 subtitles.py out/cues.json out/               # on-screen-ar/en.srt, vo-ar/en.srt
python3 cuesheet.py out/cues.json out/cuesheet.csv 25 # show control, cue to cue
python3 script.py out/cues.json SCRIPT.md             # the as-built script for approval

FILM_QUERY='vo&tc' node render.js film out/review-vo.mp4 out/mix.wav --jobs 3   # review copy: scratch narration, timecode
node render.js film out/review.mp4 out/mix.wav --jobs 3                         # clean 1080p 30 fps
# the event master, cue to cue: part 1 ends on B17, part 2 starts at B18 (4K, 50p, LED grade)
node render.js film out/part1-4k50.mp4 out/part1.wav --to 136.667 --scale 2 --fps 50 --grade led --jobs 3
node render.js film out/part2-4k50.mp4 out/part2.wav --from 136.667 --afrom 0 --scale 2 --fps 50 --grade led --jobs 3
# the loops: W under the applause after B17 (12 s), A/B/C at the end (20 s); each loops seamlessly
FILM_QUERY=hold=W node render.js film out/hold-world.mp4 out/hold-world.wav --scale 2 --fps 50 --grade led
FILM_QUERY=hold=A node render.js film out/hold-a.mp4 out/hold.wav --scale 2 --fps 50 --grade led
node render.js preview out/safety-slate 158                                     # the still for a playback failure
```

The media server crossfades audio for 0.5 s at each cut to a loop. The temp score is synthesized. The brief in
`TREATMENT.md` §8 asks for an original score, recorded live, and an Emirati narrator. Until they are recorded, the
review copy shows the narration as subtitles.
