# Reading the Sky · Gala edition · 4K 50p LED-wall masters

This branch holds only the masters of the NCM 20th-anniversary film. They were rendered on 29 September 2026 from
Revision 8 on the branch `claude/focused-mayer-jogort` (commit e346263). That branch can render them again, so this one
can be deleted once the files are downloaded.

**Status.** These are technical masters, for LED calibration, media-server programming and the tech rehearsal.
- The score is the synthesized temp score.
- The narration is not recorded yet, so these files carry none.
- The final ceremony masters follow the recorded score and narration.

`MASTERS.txt` is the full spec sheet. `QC.html` is the QC report as a page, with a frame for every cue; `QC.md` and
`qc-report.json` hold the same measurements.

## What changed from Revision 7

The cut, the words, the narration and the score are unchanged. The cue sheet and the subtitle files are byte-identical,
regenerated from the new source.
- **Frame QA.** Every cut, dissolve and beat ending was reviewed, and 20 defects were confirmed and fixed. Among them:
  - the radar masts that read as a cross;
  - the runway lights' red chase;
  - lines through the world headline;
  - plates that entered on blank paper;
  - loops A and B, which now start where the film ends.
  `TREATMENT.md` Revision 8 lists them all.
- **Colour.** Revision 7 was encoded with the BT.601 matrix and untagged, so a media server decoding it as BT.709 played
  the parchment warm. These files are BT.709, limited range, tagged, and every frame was captured losslessly.
- **New files:** show timecode (LTC), WebVTT and EBU-STL subtitles, the show caller's reference, and the QC report.

## The files

Every video file is 3840 × 2160 at 50 fps, H.264 High, BT.709 limited range, in the LED grade, with AAC 48 kHz stereo.
The WAVs in `audio/` (48 kHz, 24-bit) are for the sound desk.

| Order | File | Length | Frames | What |
|---|---|---|---|---|
| 1 | `part1-4k50.mp4` (3 pieces) | 2:21.66 | 7,083 | GO → the split, where the dissolve into the twenty drops begins |
| 2 | `hold-world-4k50.mp4` | 0:12.00 loop | 600 | Loop W under the applause; it matches part 1's last frame and part 2's first |
| 3 | `part2-4k50.mp4` | 0:21.68 | 1,084 | On the caller's cue: the twenty drops → the title and lockup |
| 4 | `hold-b-4k50.mp4` | 0:20.00 loop | 1,000 | Loop B, the running order's hold: the dedication and lockup |
| | `hold-a-4k50.mp4` | 0:20.00 loop | 1,000 | Loop A: title and lockup; the film's next frame |
| | `hold-c-4k50.mp4` | 0:20.00 loop | 1,000 | Loop C: dimmed sky and ring, behind speeches |
| | `safety-slate-4k.png` | still | | For a playback failure |

- **Without the tanker** (the go/no-go fallback): `part1-pull-4k50.mp4` (3 pieces; 2:16.66, 6,833 frames), then
  `hold-world-pull-4k50.mp4`. Part 2 and loops A, B and C are the same.
- **Ramadan or mourning**: the `*-restrained` files, with the same picture and the restrained mix.
- **Show control** (`show/`):
  - `cuesheet.csv`: 25 fps timecode, cue to cue.
  - `ltc/`: SMPTE LTC at 25 fps from 00:00:00:00 for part 1, the fallback part 1 and part 2. Each is a 48 kHz WAV at
    −10 dBFS, decoded back frame by frame with no discontinuity.
  - `caller/`: the show caller's 1080p50 reference, with and without the tanker. It shows the running order with the
    timecode, each cue and its note, and STANDBY then GO on every cue.
- **Side screens** (`show/`): the four SRT files. `show/subtitles/` adds WebVTT of all four and EBU-STL of the two
  English files, with `subtitles-report.json` flagging the cues that read fast. Nothing is re-timed or re-worded.

## Rejoining the four large masters

GitHub refuses files over 100 MB, so each part-1 master is split into three pieces of up to 90 MiB:
`.part-aa`, `.part-ab` and `.part-ac`. Download the whole branch, with GitHub's *Code → Download ZIP* or:

```
git clone --single-branch --depth 1 --branch claude/focused-mayer-jogort-masters https://github.com/malbloshii7-lang/TANAKHA
```

Then, in the downloaded folder:

- **macOS or Linux**: `sh join.sh`. It rejoins the four masters and checks every file against `MANIFEST.sha256`.
- **Windows**: double-click `join.bat`. It rejoins them and prints each one's SHA-256 to compare with `MANIFEST.sha256`.
- **By hand**:
  - macOS or Linux: `cat part1-4k50.mp4.part-aa part1-4k50.mp4.part-ab part1-4k50.mp4.part-ac > part1-4k50.mp4`
  - Windows: `copy /b part1-4k50.mp4.part-aa + part1-4k50.mp4.part-ab + part1-4k50.mp4.part-ac part1-4k50.mp4`

The rejoined files are byte-for-byte the rendered masters; their checksums prove it.

## Measured on the encoded files

- Every file has its exact frame count at 50 fps, the BT.709 colour tags, and its audio matched to the picture.
- Every loop is one stream with one keyframe. Its last frame runs into its first like two neighbouring frames: 0.007 of a
  grey level or less, with at least 99.2% of pixels unchanged.
- The cuts into and out of loop W (0.94 to 1.14, fallback included) and from part 2 into loop A (0.53) sit below the
  floor between two separately encoded files (1.20; 1.24 for the fallback).
- The cuts are the size of the film's own keyframe refresh, which re-codes the paper grain every 5 s: 0.86 to 1.08 in
  still passages.
- The cut into loop B changes the words by design, from the title to the dedication. Ask the media server for a
  0.5 s dissolve there if a hard change is not wanted.
- The photosensitivity pre-check, on the ITU-R BT.1702 model, passes on every picture. It is not the certified test.
- The true peak of part 2's AAC is −0.8 dBTP. Its WAV is −1.1, and the sound desk plays the WAVs.
