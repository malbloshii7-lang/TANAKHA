#!/bin/sh
# The show deliverables and the QC report for a set of masters (after masters.sh):
#   LTC timecode WAVs (25 fps, from 00:00:00:00, as the cue sheet) for part 1, the fallback part 1 and part 2;
#   side-screen subtitles as WebVTT and EBU-STL, with a reading-speed report;
#   the show caller's 1080p50 reference, with and without the tanker beat;
#   QC.md and qc-report.json (formats, frame counts, colour, keyframes, loudness, seams, photosensitivity pre-check).
#
#   sh qc/deliver.sh <masters dir> <dir with cuesheet.csv and the *.srt files>
set -eu
M=$(cd "$1" && pwd) # resolve the arguments before moving into qc/
S=$(cd "$2" && pwd)
cd "$(dirname "$0")"
mkdir -p "$M/show/ltc" "$M/show/subtitles" "$M/show/caller"

for p in part1 part1-pull part2; do
  frames=$(python3 -c "import math,sys; sys.path.insert(0,'.'); from mp4info import mp4info; \
v=[t for t in mp4info('$M/$p-4k50.mp4')['tracks'] if t.get('handler')=='vide'][0]; print(math.ceil(v['duration']*25-1e-6))")
  python3 ltc.py write "$M/show/ltc/ltc-$p-25fps.wav" --frames "$frames"
  python3 ltc.py read "$M/show/ltc/ltc-$p-25fps.wav"
done

cp "$S"/*.srt "$S/cuesheet.csv" "$M/show/"
python3 subs.py "$S" "$M/show/subtitles"

python3 caller_ref.py "$M" "$S/cuesheet.csv" "$M/show/caller/caller-reference-1080p50.mp4"
python3 caller_ref.py "$M" "$S/cuesheet.csv" "$M/show/caller/caller-reference-pull-1080p50.mp4" --pull

python3 masters_qc.py "$M"
