#!/usr/bin/env bash
# usage: tools/encode.sh <frames_dir> <audio.wav|.m4a> <out.mp4>
set -euo pipefail
FR=${1:-frames}; AU=${2:-audio/score_final.wav}; OUT=${3:-out/wmo-president-mission-2026.mp4}
mkdir -p "$(dirname "$OUT")"
# an already-encoded AAC track (.m4a/.aac/.mp4) is copied bit-for-bit; a WAV is encoded to AAC
case "$AU" in *.m4a|*.aac|*.mp4) ACODEC="-c:a copy" ;; *) ACODEC="-c:a aac -b:a 192k -ar 48000" ;; esac
ffmpeg -hide_banner -y -framerate 30 -i "$FR/%05d.png" -i "$AU" -map 0:v:0 -map 1:a:0 \
  -vf "scale=out_color_matrix=bt709:out_range=tv:flags=lanczos+accurate_rnd+full_chroma_int,format=yuv420p" \
  -c:v libx264 -preset slow -crf 16 -profile:v high -level 4.1 -g 60 -bf 3 \
  -x264-params "aq-mode=3:aq-strength=0.9:deblock=-1,-1" -maxrate 18M -bufsize 36M \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv \
  $ACODEC -movflags +faststart "$OUT"   # inputs are both exactly 50.0 s; -shortest would trim frames at the AAC packet edge
