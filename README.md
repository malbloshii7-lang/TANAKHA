# Reading the Sky · Gala edition · 4K 50p LED-wall masters

This branch holds only the masters of the NCM 20th-anniversary film. They were rendered on 28 September 2026 from
Revision 7 on the branch `claude/focused-mayer-jogort` (commit 09ef507). That branch can render them again, so this one
can be deleted once the files are downloaded.

**Status.** These are technical masters, for LED calibration, media-server programming and the tech rehearsal.
- The score is the synthesized temp score.
- The narration is not recorded yet, so these files carry none.
- The final ceremony masters follow the recorded score and narration.

`MASTERS.txt` is the full spec sheet.

## The files

Every video file is 3840 × 2160 at 50 fps, H.264 High, in the LED grade, with AAC 48 kHz stereo. The WAVs in `audio/`
(48 kHz, 24-bit) are for the sound desk.

| Order | File | Length | Frames | What |
|---|---|---|---|---|
| 1 | `part1-4k50.mp4` (3 pieces) | 2:21.66 | 7,083 | GO → the split, where the dissolve into the twenty drops begins |
| 2 | `hold-world-4k50.mp4` | 0:12.00 loop | 600 | Loop W under the applause; it matches part 1's last frame and part 2's first |
| 3 | `part2-4k50.mp4` | 0:21.68 | 1,084 | On the caller's cue: the twenty drops → the title and lockup |
| 4 | `hold-b-4k50.mp4` | 0:20.00 loop | 1,000 | Loop B, the running order's hold: the dedication and lockup |
| | `hold-a-4k50.mp4` | 0:20.00 loop | 1,000 | Loop A: title and lockup |
| | `hold-c-4k50.mp4` | 0:20.00 loop | 1,000 | Loop C: dimmed sky and ring, behind speeches |
| | `safety-slate-4k.png` | still | | For a playback failure |

- **Without the tanker** (the go/no-go fallback): `part1-pull-4k50.mp4` (3 pieces; 2:16.66, 6,833 frames), then
  `hold-world-pull-4k50.mp4`. Part 2 and loops A, B and C are the same.
- **Ramadan or mourning**: the `*-restrained` files, with the same picture and the restrained mix.
- **Show control**: `show/cuesheet.csv` (25 fps timecode, cue to cue). The side-screen subtitles are `show/*.srt`.

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

- Every loop's last frame runs into its first like two neighbouring frames: 0.005 of a grey level or less, with 99% of
  pixels unchanged.
- Loop W matches the film at both of its cuts (0.335 and 0.280), which is the floor between any two separately encoded
  files (0.349).
- Every file has exact frame counts and its audio matched to the picture.
