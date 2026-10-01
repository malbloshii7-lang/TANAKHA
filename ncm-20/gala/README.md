# Reading the Sky · Gala Edition

The film for the National Center of Meteorology's 20th-anniversary ceremony (March 2027). It is made to be shown on a
large LED wall in a dark hall to an audience that includes UAE ministers. It grows out of the v3 film in `../film/`
and keeps that film's engraved-plate language, rebuilt for the room:

- **Arabic first.** Every words block leads with Arabic (Noto Kufi Arabic; Amiri for quotations), with English
  second. Latin and number runs inside Arabic are isolated so they cannot reorder. The narrator's copy is fully
  vowelled; on-screen Arabic is not.
- **The first editions' headlines.** The large words on each chapter are the Arabic headlines of the first two
  editions, in the nation's own "we": «عددنا أيام السنة بطلوع سهيل», «وأبحرنا مع رياح الموسم», «ونقرأ السماء لكل
  رحلة» and the rest (Revision 5 in `TREATMENT.md` lists them). Each is fitted to the words column.
- **Night to night.** The film opens on the real pre-dawn sky over Abu Dhabi as Suhail rises, computed from the Yale
  Bright Star Catalogue, watched by a man and his couched camel on a near dune, in silhouette. It turns to parchment
  at dawn. It ends on the March 2027 night seen from Marina Mall:
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
  - The film runs 2:43.3. `?april2024` puts April 2024 back after the seven emirates, on the national map, drawn as a
    weather chart would show it, and runs 3:00.0; the protocol office decides. The seeding stays six beats away from
    the floods.
  - The seeding aircraft is NCM's type, a Beechcraft King Air C90, built in engraved 3D from its published
    dimensions. It works over UAE ground, burning hygroscopic flares in racks under its wings. It carries no livery.
  - The globe names Ethiopia among the UAE's rain-enhancement partners: the country only, with no year and no claim.
  - The working day claims only NCM's own products: public dust and fog warnings across the land (the Etihad Rail
    beat), the marine forecast (Jebel Ali) and the east-coast bulletin that NCM's AI assistant drafts and a forecaster
    approves (the tanker beat). Never "safe passage".
  - The tanker is unbranded and under way, heading away from the strait. She carries no ADNOC name, livery or Murban
    label, and there is no terminal or smoke. The beat can be pulled at the go/no-go checks with `?pull=tanker`, and it
    stays out of every cut-down and the international version.
  - Revision 11 (`?rev11`) puts her alongside the Port of Fujairah's VLCC jetty, at the requester's direction: the jetty,
    the breakwater, the sea and the Hajar only. There is no tank farm, manifold, buoy, smoke, glow or backlight (the
    oil zone was struck in March and May 2026), and her bow points south, away from the strait. The go/no-go checks
    and `?pull=tanker` apply to it as before.
  - "Etihad Rail" on screen needs Etihad Rail's written clearance. Without it, set `RAIL_NAME` in `timeline.js` to
    the national network's name.
  - `TREATMENT.md` (Revisions 2 to 5, and §11) lists what NCM and the protocol office must still decide.
- **Emirati music.**
  - The temp score draws on the drums of Al Ayyala for the day, the rababa and hummed call-and-answer for the nights
    and the cards, and the nahham's sea songs for the pearling beat.
  - Every drum pattern is a sketch for the troupe to replace.
  - A restrained mix without percussion is ready in case the ceremony falls in Ramadan or a mourning period.

## Files

| Path | What it is |
|---|---|
| `film.html` | The film, live in a browser (silent). Query options: `?t=60` start at 1:00 · `?scale=2` 4K · `?grade=led` LED-wall grade · `?vo` scratch narration as subtitles · `?tc` burned-in timecode · `?hold=A\|B\|C\|W` a stage hold · `?pull=tanker` the cut without the tanker beat (2:38.3) · `?april2024` April 2024 after the seven emirates (3:00.0) · `?colour` the hand-coloured pass (Revision 9, a draft for approval) · `?heritage` the Emirati crafts and skills (Revision 10, a draft) · `?rev11` the founding decree, the working day in full and the Center's watch (Revision 11, a draft: 3:34.5, at a pace 10% slower than its design) · `?pace=1` the design pace (for the score build), or any other factor |
| `engine.js` | Drawing, type, camera, transitions (fade, dawn, dusk, iris), themes (parchment and night), text recording, the frame loop |
| `timeline.js` | The cut: every beat, its words and their film times, the narration (`VO`), the stage holds |
| `scenes/` | One file per scene. `plate-*.js` are the v3 plates (drawing only). `night-*.js`, `map-nation.js` and `cards.js` are new. `r11-*.js` are Revision 11's plates (only with `?rev11`): `r11-founding.js` (the decree's charter and the Center's instruments), `r11-airport.js` (dawn fog at Zayed International, the arrival), `r11-jebelali.js` (the container quay), `r11-jetty.js` (Fujairah's VLCC jetty), `r11-solar.js` (Al Dhafra Solar PV), `r11-watch.js` (forecasters at work at night, a generic room; the full-disk satellite image that lands on the world globe, its coasts outside the UAE's box from Natural Earth 1:50m land, public domain); `r11-geneva.js` (WMO's headquarters in Geneva under cumulus, the clouds in its glass: a small plate in the world beat's words column, with its caption and the line on the Extraordinary Session of Congress the WMO President chaired there in October 2025); `r11-kit.js` holds their shared helpers, including the camera that sets every Revision 11 plate in the approved plates' frame. All but the founding, the watch and the Geneva plate are drawn in true 3D with `engrave3d.js`. `plate-energy.js` and `plate-world.js` carry small `?rev11`-only changes for the dissolves into and out of the new beats, and `plate-rail.js` draws the head end as Etihad Rail's EMD SD70ACS under `?rev11` (the approved cut is unchanged) |
| `data/` | The star catalogue, the UAE map (`build/` has its build scripts, a check image and `rak_skyline.py` for the seeding skyline), the verified quotes |
| `fonts/` | The typefaces, self-hosted, with their SIL Open Font Licences. A render stops if any face fails to load |
| `render.js` | Renders stills, the film (in parallel chunks; 4K, 50 fps and the LED grade are options) and the cue list with every words block. Frames are captured losslessly (`--capture png`, the default at `--scale 2`) and encoded BT.709, limited range, tagged |
| `masters.sh` | Builds every 4K 50p LED master: parts 1 and 2, the no-tanker part 1, the five loops, the safety slate, the restrained versions |
| `qc/` | The show deliverables and the checks, run by `qc/deliver.sh`: LTC (`ltc.py`), WebVTT and EBU-STL (`subs.py`), the show caller's reference (`caller_ref.py`), `masters_qc.py` → `QC.md` and `qc-report.json` (with `pse.py`, a BT.1702-model photosensitivity pre-check, and `mp4info.py`), and `dossier.py` → `QC.html` |
| `audio.py`, `score.py` | The synthesized temp score, placed from the timeline: stems (music, Emirati percussion, sfx), the mixes (with a restrained mix without percussion), the stage loop and the applause bed. The build fails if any leader's card measures quieter than the world beat |
| `sampler.py` | Opt-in (`score.py … --samples DIR`): the orchestra (strings, horn, timpani, pizzicato, harp, glockenspiel, a cymbal swell into the two blooms) plays recorded samples from VSCO-2 Community Edition (Versilian Studios, CC0), each note at the loudness of the synthesized voice it replaces. The Emirati and Arabic instruments, the voices and the effects stay synthesized. Without the flag the score is byte-identical |
| `subtitles.py` | On-screen text and narration as Arabic and English SRT files |
| `cuesheet.py` | The show-control cue sheet (cue to cue, with SMPTE timecode) |
| `script.py` → `SCRIPT.md` | The as-built script for approval: every narration line and every words block, with its times |
| `TREATMENT.md` | The treatment: purpose, messages, structure, the music brief, the protocol checklist, deliverables and open decisions |

## Build

```bash
export NODE_PATH=/opt/node22/lib/node_modules          # Playwright with Chromium
export FFMPEG=$(python3 -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())")
node render.js cues out/cues.json                     # the timeline, every words block and the narration
python3 score.py out/cues.json out/                   # music, perc, sfx, mix (-16 LUFS), mix-r128 (-23), mix-restrained, part1/part2 (and -restrained), hold, hold-world (.wav)
python3 subtitles.py out/cues.json out/               # on-screen-ar/en.srt, vo-ar/en.srt
python3 cuesheet.py out/cues.json out/cuesheet.csv 25 # show control, cue to cue
python3 script.py out/cues.json SCRIPT.md             # the as-built script for approval

FILM_QUERY='vo&tc' node render.js film out/review-vo.mp4 out/mix.wav --jobs 3   # review copy: scratch narration, timecode
node render.js film out/review.mp4 out/mix.wav --jobs 3                         # clean 1080p 30 fps
FILM_QUERY='vo&colour&fadeout=2.5' node render.js film out/review-colour.mp4 out/mix.wav --jobs 3   # the colour pass (Revision 9), narration as subtitles
FILM_QUERY='vo&colour&heritage&fadeout=2.5' node render.js film out/review-heritage.mp4 out/mix.wav --jobs 3   # with the Emirati touches (Revision 10)
# Revision 11 (?rev11) has its own cut, so its own cues and score: every query that changes the cut goes on each step.
# It also runs 10% slower than its design (timeline.js PACE 1.1), so the score is built from the design cut (pace=1),
# then stretched to the pace without changing its pitch; the cue list itself (cue sheet, subtitle files) is in real time
FILM_QUERY='rev11&pace=1' node render.js cues out/r11/cues-design.json && python3 score.py out/r11/cues-design.json out/r11/
python3 pace.py out/r11/mix.wav out/r11/mix-paced.wav 1.1
# the same score with the orchestra recorded instead of synthesized (a draft for comparison), from a checkout of
# https://github.com/sgossner/VSCO-2-CE (the folders sampler.py lists, about 0.5 GB)
mkdir -p out/r11s && python3 score.py out/r11/cues-design.json out/r11s/ --samples ../VSCO-2-CE && python3 pace.py out/r11s/mix.wav out/r11s/mix-paced.wav 1.1
FILM_QUERY=rev11 node render.js cues out/r11/cues.json
FILM_QUERY='vo&colour&heritage&rev11&fadeout=2.5' node render.js film out/review-rev11.mp4 out/r11/mix-paced.wav --jobs 3

# every master in one go (about 2.7 hours at --jobs 3), then the show deliverables, the QC report and its page
sh masters.sh out/audio out/masters                   # gathers the WAVs from out/ and out/pull/ if out/audio has none
sh qc/deliver.sh out/masters out                      # out/ holds cuesheet.csv and the four SRT files
python3 qc/dossier.py out/masters out/masters/QC.html --source "$(git rev-parse --short HEAD)" --rendered "$(date +'%-d %B %Y')"

# the same, step by step. Every film is encoded BT.709, limited range, and tagged so: an untagged UHD file is decoded
# as BT.709 by media servers, and a BT.601 one then plays warm
# the event master, cue to cue: part 1 ends where the dissolve into the gauge begins ("split", read from the cut)
node render.js film out/part1-4k50.mp4 out/part1.wav --to split --scale 2 --fps 50 --grade led --jobs 3
node render.js film out/part2-4k50.mp4 out/part2.wav --from split --afrom 0 --scale 2 --fps 50 --grade led --jobs 3
# the loops: W under the applause after the world beat (12 s, a still frame), A/B/C at the end (20 s). Each loops
# seamlessly: every motion is periodic in the loop's length and the light over the sheet stands still in a hold. Each is
# rendered LOSSLESS in parallel chunks (so the frames pass the chunk joins bit-exact), then encoded once as a single
# stream with one keyframe at CRF 2 (the loops are mostly still, so about 14 MiB each). Measured on loop B: the seam
# (last frame back to the first) is 0.005 of a grey level on average, 99% of pixels unchanged; encoded in separate
# chunks, or from a lossy intermediate, the paper grain and the text edges re-quantize at the loop point
loop() { # name, hold, audio, frames
  FILM_QUERY=hold=$2 node render.js film out/lossless-$1.mp4 out/$3 --scale 2 --fps 50 --grade led --jobs 3 --crf 0 --preset ultrafast --profile high444
  $FFMPEG -i out/lossless-$1.mp4 -map 0:v -map 0:a -c:v libx264 -preset slow -crf 2 -profile:v high -pix_fmt yuv420p \
    -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv \
    -x264-params keyint=$4:min-keyint=$4:scenecut=0 -c:a copy -movflags +faststart out/$1-4k50.mp4
}
loop hold-world W hold-world.wav 600   # its light stands where the film leaves it at the split, so the cuts in and out match
loop hold-b B hold.wav 1000   # the dedication (the running order's hold)
loop hold-a A hold.wav 1000   # title and lockup
loop hold-c C hold.wav 1000   # dimmed, behind speeches
FILM_QUERY=hold=A node render.js preview out/safety-slate-4k 0 --scale 2 --grade led                         # the still for a playback failure
# the restrained mix (Ramadan or mourning): the same picture with the restrained audio, no re-render
$FFMPEG -i out/part1-4k50.mp4 -i out/part1-restrained.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest out/part1-4k50-restrained.mp4

# without the tanker (the go/no-go fallback): the same steps with the query on every render and its own cues
FILM_QUERY=pull=tanker node render.js cues out/cues-pull.json
python3 score.py out/cues-pull.json out/pull/
FILM_QUERY=pull=tanker node render.js film out/part1-pull-4k50.mp4 out/pull/part1.wav --to split --scale 2 --fps 50 --grade led --jobs 3
# and its own loop W (the split comes 5 s earlier, so the light it holds is a little different); part 2 and loops A/B/C are shared
FILM_QUERY='hold=W&pull=tanker' node render.js film out/lossless-hold-world-pull.mp4 out/pull/hold-world.wav --scale 2 --fps 50 --grade led --jobs 3 --crf 0 --preset ultrafast --profile high444
```

The rendered 4K 50p LED masters of Revision 8 (with the loops, the fallback, the restrained versions, the WAVs, the cue
sheet, LTC, subtitles, the show caller's reference, the QC report, checksums and rejoin scripts) are on the branch `claude/focused-mayer-jogort-masters`; its README gives the
running order. Delete that branch once they are downloaded: this branch renders them again.

The media server crossfades audio for 0.5 s at each cut to a loop. The temp score is synthesized. The brief in
`TREATMENT.md` §8 asks for an original score, recorded live, and an Emirati narrator. Until they are recorded, the
review copy shows the narration as subtitles.

## Lab: the Etihad Rail beat in engraved 3D (a workshop, not part of the film)

`lab/rail-3d.html` builds the Etihad Rail shot in true 3D from the same research as `scenes/plate-rail.js`: the
locomotive, the stone wagons, the embankment with its ditch and berm, the fence and the Al Dhaid palms. The Hajar
front is layered by distance from the same terrain as the plate's skyline (`lab/ridges.py`). `engrave3d.js` is
the small renderer (the film also uses it, for the seeding aircraft): a pinhole camera, near-plane clipping, back-face culling, painter's order, and hatching that
follows the light.

`lab/rail-3d-shot.js` holds the camera keys. `lab/bed.py` builds the sound from the same keys: the diesel's level,
brightness, pan and Doppler follow the engine's distance and bearing to the camera. The film does not use it yet.

```bash
python3 lab/ridges.py <terrain-tile-cache>          # the layered Hajar skyline (fetches missing AWS Terrain Tiles)
python3 lab/bed.py out/rail-3d-bed.wav                # its sound, placed from the shot keys
FILM_HTML=lab/rail-3d.html node render.js film out/rail-3d.mp4 out/rail-3d-bed.wav --jobs 3
```
