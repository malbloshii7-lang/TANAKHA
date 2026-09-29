#!/bin/sh
# Build every 4K 50p LED master from this branch, then the show deliverables and the QC report.
#
#   sh masters.sh [audio dir] [out dir]
#
# The audio dir holds the score's WAVs named as on the masters branch: part1.wav, part2.wav, hold-world.wav, hold.wav,
# part1-pull.wav, hold-world-pull.wav and the *-restrained.wav mixes. Without one, they are gathered from score.py's
# outputs in out/ and out/pull/ (see README "Build"). Every film is encoded BT.709, limited range, and tagged so;
# frames are captured losslessly (render.js --capture png, the default at --scale 2).
set -eu
cd "$(dirname "$0")"
: "${FFMPEG:=$(python3 -c 'import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())')}"
export FFMPEG
export NODE_PATH="${NODE_PATH:-/opt/node22/lib/node_modules}"
AUD=${1:-out/audio}
OUT=${2:-out/masters}
JOBS=${JOBS:-3}
mkdir -p "$OUT" "$AUD"

if [ ! -f "$AUD/part1.wav" ]; then # gather score.py's outputs under the masters' names
  cp out/part1.wav out/part2.wav out/hold-world.wav out/hold.wav out/part1-restrained.wav out/part2-restrained.wav "$AUD/"
  cp out/pull/part1.wav "$AUD/part1-pull.wav"
  cp out/pull/hold-world.wav "$AUD/hold-world-pull.wav"
  cp out/pull/part1-restrained.wav "$AUD/part1-pull-restrained.wav"
fi

R="--scale 2 --fps 50 --grade led --jobs $JOBS"
TAGS="-colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv"

# the film, cue to cue: part 1 ends where the dissolve into the twenty drops begins
node render.js film "$OUT/part1-4k50.mp4" "$AUD/part1.wav" --to split $R
node render.js film "$OUT/part2-4k50.mp4" "$AUD/part2.wav" --from split --afrom 0 $R
FILM_QUERY=pull=tanker node render.js film "$OUT/part1-pull-4k50.mp4" "$AUD/part1-pull.wav" --to split $R

# the loops: a lossless 4:4:4 render in chunks (bit-exact at the joins), then one stream with one keyframe
loop() { # name, query, audio, frames
  FILM_QUERY=$2 node render.js film "$OUT/lossless-$1.mp4" "$3" $R --crf 0 --preset ultrafast --profile high444
  "$FFMPEG" -y -v error -i "$OUT/lossless-$1.mp4" -map 0:v -map 0:a -c:v libx264 -preset slow -crf 2 -profile:v high \
    -pix_fmt yuv420p $TAGS -x264-params "keyint=$4:min-keyint=$4:scenecut=0" -c:a copy -movflags +faststart "$OUT/$1-4k50.mp4"
  rm -f "$OUT/lossless-$1.mp4"
}
loop hold-world hold=W "$AUD/hold-world.wav" 600
loop hold-world-pull 'hold=W&pull=tanker' "$AUD/hold-world-pull.wav" 600
loop hold-a hold=A "$AUD/hold.wav" 1000
loop hold-b hold=B "$AUD/hold.wav" 1000
loop hold-c hold=C "$AUD/hold.wav" 1000

# the still for a playback failure: loop A's frame
FILM_QUERY=hold=A node render.js preview "$OUT/safety-slate-4k" 0 --scale 2 --grade led
mv "$OUT/safety-slate-4k-0.png" "$OUT/safety-slate-4k.png"

# Ramadan or mourning: the same picture with the restrained mix, no re-render
for p in part1 part1-pull part2; do
  "$FFMPEG" -y -v error -i "$OUT/$p-4k50.mp4" -i "$AUD/$p-restrained.wav" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k \
    -ar 48000 -shortest -movflags +faststart "$OUT/$p-4k50-restrained.mp4"
done

mkdir -p "$OUT/audio"
cp "$AUD"/*.wav "$OUT/audio/"
echo "masters in $OUT; next: sh qc/deliver.sh $OUT <show files dir>"
