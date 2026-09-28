#!/bin/sh
# Rejoin the four large masters from their pieces, then check every file against MANIFEST.sha256.
# macOS or Linux: open a terminal in this folder and run:  sh join.sh
set -e
cd "$(dirname "$0")"
for f in part1-4k50 part1-4k50-restrained part1-pull-4k50 part1-pull-4k50-restrained; do
  cat "$f.mp4.part-aa" "$f.mp4.part-ab" "$f.mp4.part-ac" > "$f.mp4"
  echo "rejoined $f.mp4"
done
if command -v sha256sum >/dev/null 2>&1; then sha256sum -c MANIFEST.sha256; else shasum -a 256 -c MANIFEST.sha256; fi
echo "Every file matches its checksum. The .part-* files can be deleted."
