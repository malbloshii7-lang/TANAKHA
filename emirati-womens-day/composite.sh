#!/bin/bash
# Composite bilingual overlay cards onto the generated video, extend ending, mux audio.
set -e
cd "$(dirname "$0")"
FF=$(python3 -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())")

"$FF" -y -i out/scenes.mp4 \
  -loop 1 -i overlays/card1.png \
  -loop 1 -i overlays/card2.png \
  -loop 1 -i overlays/card3.png \
  -loop 1 -i overlays/card4.png \
  -filter_complex "\
[0:v]scale=1280:720,tpad=stop_mode=clone:stop_duration=3[base];\
[1:v]format=rgba,fade=t=in:st=0.8:d=0.8:alpha=1,fade=t=out:st=6.8:d=0.8:alpha=1[c1];\
[2:v]format=rgba,fade=t=in:st=8.6:d=0.8:alpha=1,fade=t=out:st=14.8:d=0.8:alpha=1[c2];\
[3:v]format=rgba,fade=t=in:st=16.4:d=0.8:alpha=1,fade=t=out:st=22.0:d=0.8:alpha=1[c3];\
[4:v]format=rgba,fade=t=in:st=23.6:d=0.8:alpha=1,fade=t=out:st=29.2:d=0.8:alpha=1[c4];\
[base][c1]overlay=0:0:enable='between(t,0.8,7.6)'[v1];\
[v1][c2]overlay=0:0:enable='between(t,8.6,15.6)'[v2];\
[v2][c3]overlay=0:0:enable='between(t,16.4,22.8)'[v3];\
[v3][c4]overlay=0:0:enable='between(t,23.6,30.0)'[v4];\
[v4]fade=t=in:st=0:d=0.6,fade=t=out:st=29.8:d=1.2,trim=0:31,setpts=PTS-STARTPTS[vout];\
[0:a]apad,atrim=0:31,afade=t=out:st=27.0:d=2.5,asetpts=PTS-STARTPTS[aout]" \
  -map "[vout]" -map "[aout]" \
  -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r 25 \
  -c:a aac -b:a 192k -movflags +faststart \
  out/emirati-womens-day-linkedin.mp4

"$FF" -y -i out/emirati-womens-day-linkedin.mp4 2>&1 | grep -E "Duration|Stream"
