# Reading the Sky · Gala Edition

The film for the National Center of Meteorology's 20th-anniversary ceremony (March 2027). It is made to be shown on a
large LED wall in a dark hall to an audience that includes UAE ministers. It grows out of the v3 film in `../film/`
and keeps that film's engraved-plate language, rebuilt for the room:

- **Arabic first.** Every words block leads with Arabic (Noto Kufi Arabic; Amiri for quotations), with English
  second. Latin and number runs inside Arabic are isolated so they cannot reorder. The narrator's copy is fully
  vowelled; on-screen Arabic is not.
- **The cut: the locked order (Revision 5), five acts in 2:55.**
  1. Heritage: a black sky held, then Suhail rises; the star and the dhow; the falaj.
  2. The storm: 2007 and the national map, then April 2024 with the red alert held as a still frame.
  3. The hero: Etihad Rail in engraved 3D. The train emerges from the Hajar, then comes the worm's-eye pass, then the
     rise to an epic wide in silence.
  4. Rain enhancement: one seeding shot and one research image.
  5. Suhail over the Abu Dhabi skyline, a short dedication, the title.

  One idea a beat and sparse type. The leaders' cards, the working-day montage, the world beat and the rain gauge
  are out of this cut.
- **Night to night.** The film opens on the real pre-dawn sky over Abu Dhabi as Suhail rises, computed from the Yale
  Bright Star Catalogue. It turns to parchment at dawn. It ends on the March 2027 night seen from Marina Mall:
  - Suhail stands 12.2° up in the south, just clear of the Etihad Towers.
  - Emirates Palace lies low to the right.
  - Every building is at its true bearing and angular size.
- **One device.** A turning circle carries the film: the gold ring born around Suhail and carried into the navigator's
  compass rose, the radar scope, the irises, and the ring around Suhail at the end.
- **Protocol.**
  - The narration names the late Sheikh Zayed (who restored the aflaj) and the late Sheikh Khalifa (who founded the
    Center by decree). The leaders' cards are not in this cut: they are in the timeline's history and can come back
    as whole cards, never as a quote wall.
  - The national map lights all seven emirates together and names them in constitutional order. It has no range
    rings, no point symbols and no trajectories.
  - Abu Musa and the Greater and Lesser Tunb are drawn as UAE territory from neutral data. Musandam and Madha are
    left to Oman.
  - April 2024 is shown on the national map as a weather chart would show it.
  - The seeding aircraft works over UAE ground.
  - The rail beat names only the place and the land; no NCM agreement with Etihad Rail is documented. The wagons
    carry stone west from the Hajar, never containers. Never "safe passage".
  - "Etihad Rail" on screen needs Etihad Rail's written clearance. Without it, set `RAIL_NAME` in `timeline.js` to
    the national network's name.
  - `TREATMENT.md` (Revisions 2, 3 and 5, and §11) lists what NCM and the protocol office must still decide.
- **Emirati music.**
  - The temp score draws on the drums of Al Ayyala for the day and the rail, and on the rababa and hummed
    call-and-answer for the nights.
  - The rail's sound is built from its own camera keys (`lab/bed.py`). A bass carries the emergence, the drums play
    over the diesel at the pass, and the rise is silent.
  - Every drum pattern is a sketch for the troupe to replace.
  - A restrained mix without percussion is ready in case the ceremony falls in Ramadan or a mourning period.

## Files

| Path | What it is |
|---|---|
| `film.html` | The film, live in a browser (silent). Query options: `?t=60` start at 1:00 · `?scale=2` 4K · `?grade=led` LED-wall grade · `?vo` scratch narration as subtitles · `?tc` burned-in timecode · `?hold=A\|B\|C` a stage hold · `?fadeout=2.5` fade to black at the end (the review copy) · `?pull=<id>` the cut without a beat |
| `engine.js` | Drawing, type, camera, transitions (fade, dawn, dusk, iris), themes (parchment and night), text recording, the frame loop |
| `timeline.js` | The cut: every beat, its words and their film times, the narration (`VO`), the stage holds |
| `scenes/` | One file per scene. `plate-*.js` are the v3 plates (drawing only). `night-*.js`, `map-nation.js` and `cards.js` are new |
| `data/` | The star catalogue, the UAE map (`build/` has its build scripts, a check image and `rak_skyline.py` for the seeding skyline), the verified quotes |
| `fonts/` | The typefaces, self-hosted, with their SIL Open Font Licences. A render stops if any face fails to load |
| `render.js` | Renders stills, the film (in parallel chunks; 4K, 50 fps and the LED grade are options) and the cue list with every words block |
| `audio.py`, `score.py` | The synthesized temp score, placed from the timeline: stems (music, Emirati percussion, sfx), the mixes (with a restrained mix without percussion) and the stage loop. The rail's sound comes from `lab/bed.py` |
| `subtitles.py` | On-screen text and narration as Arabic and English SRT files |
| `cuesheet.py` | The show-control cue sheet (cue to cue, with SMPTE timecode) |
| `script.py` → `SCRIPT.md` | The as-built script for approval: every narration line and every words block, with its times |
| `TREATMENT.md` | The treatment: purpose, messages, structure, the music brief, the protocol checklist, deliverables and open decisions |

## Build

```bash
export NODE_PATH=/opt/node22/lib/node_modules          # Playwright with Chromium
export FFMPEG=$(python3 -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())")
node render.js cues out/cues.json                     # the timeline, every words block and the narration
python3 score.py out/cues.json out/                   # music, perc, sfx, mix (-16 LUFS), mix-r128 (-23), mix-restrained, hold (.wav)
python3 subtitles.py out/cues.json out/               # on-screen-ar/en.srt, vo-ar/en.srt
python3 cuesheet.py out/cues.json out/cuesheet.csv 25 # show control
python3 script.py out/cues.json SCRIPT.md             # the as-built script for approval

# the review copy: picture and sound faded out together over the last 2.5 s
$FFMPEG -i out/mix.wav -af "afade=t=out:st=172.5:d=2.5:curve=qsin" -t 175 -c:a pcm_s24le out/mix-review.wav
FILM_QUERY=fadeout=2.5 node render.js film out/review.mp4 out/mix-review.wav --jobs 3      # 1080p 30 fps
FILM_QUERY='vo&tc&fadeout=2.5' node render.js film out/review-vo.mp4 out/mix-review.wav --jobs 3   # scratch narration, timecode
# the event master, in one part; it ends on the stage hold (A/B/C, 20 s, each a seamless loop)
node render.js film out/master-4k50.mp4 out/mix.wav --scale 2 --fps 50 --grade led --jobs 3
FILM_QUERY=hold=A node render.js film out/hold-a.mp4 out/hold.wav --scale 2 --fps 50 --grade led
FILM_QUERY=hold=A node render.js preview out/safety-slate 0                     # the still for a playback failure
```

The media server crossfades audio for 0.5 s at each cut to a loop. The temp score is synthesized. The brief in
`TREATMENT.md` §8 asks for an original score, recorded live, and an Emirati narrator. Until they are recorded, the
review copy shows the narration as subtitles.

## Lab: the Etihad Rail hero scene in engraved 3D (not yet part of the film)

`lab/rail-3d.html` is the Etihad Rail beat built in true 3D from the same research as `scenes/plate-rail.js`: the
locomotive, the stone wagons, the embankment with its ditch and berm, the fence, the Al Dhaid palms and the Hajar front
computed from terrain. `lab/engrave3d.js` is the small renderer: a pinhole camera, near-plane clipping, back-face
culling, painter's order, and hatching that follows the light.

It is one shot chain in three beats, and its keys live in `lab/rail-3d-shot.js`:

1. **Beat 1, 0-7 s.** The train emerges from the Hajar, 1.5 km out, on a long lens. The lens stacks the computed
   ranges behind it (`lab/rail-3d-ridges.js`, from `lab/ridges.py`). The shot cuts on the drum downbeat at 7.0 s.
2. **Beat 2, 7-12.8 s.** The locomotive passes close to a camera held at eye height.
3. **Beat 3, 12.8-19.5 s.** The camera rises as on a crane and turns east along the whole train, back toward the
   mountains.

`lab/bed.py` reads the same keys, so the sound is placed from the picture:

- The diesel's level, brightness, pan and Doppler shift follow the engine's real distance and bearing to the camera, so
  it peaks as the engine passes.
- The Ayyala enters after the silence, lands on the cut and plays under the pass.

```bash
python3 lab/ridges.py <terrain-tile-cache>          # the layered Hajar skyline (fetches missing AWS Terrain Tiles)
python3 lab/bed.py out/rail-3d-bed.wav                # its sound, placed from the shot keys; prints each beat's balance
FILM_HTML=lab/rail-3d.html node render.js film out/rail-3d.mp4 out/rail-3d-bed.wav --jobs 3
```
