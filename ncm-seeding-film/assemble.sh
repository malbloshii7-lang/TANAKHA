#!/usr/bin/env bash
# Download the twelve rendered shots and concatenate them into the finished film.
#
#   ./assemble.sh            # download (if needed) + assemble
#
# Requires ffmpeg on PATH, or `pip install imageio-ffmpeg` (the script finds that build too).
set -euo pipefail

cd "$(dirname "$0")"
mkdir -p shots

FFMPEG="$(command -v ffmpeg || python3 -c 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())')"

while IFS=$'\t' read -r slug url; do
  [ -z "${slug:-}" ] && continue
  case "$slug" in \#*) continue ;; esac
  if [ ! -s "shots/${slug}.mp4" ]; then
    echo "downloading ${slug}"
    curl -fsSL "$url" -o "shots/${slug}.mp4"
  fi
done < shots.tsv

: > concat.txt
while IFS=$'\t' read -r slug _; do
  [ -z "${slug:-}" ] && continue
  case "$slug" in \#*) continue ;; esac
  printf "file '%s'\n" "shots/${slug}.mp4" >> concat.txt
done < shots.tsv

# Re-encode rather than stream-copy: the clips are independent renders and a
# concat demuxer copy leaves broken timestamps at every cut.
"$FFMPEG" -y -f concat -safe 0 -i concat.txt \
  -vf "fps=30,scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2" \
  -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p -an \
  ncm-seeding-film.mp4

echo "wrote ncm-seeding-film.mp4"
