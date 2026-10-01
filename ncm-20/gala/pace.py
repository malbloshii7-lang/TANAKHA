#!/usr/bin/env python3
"""Stretch a score to a cut's pace (Revision 11 runs 10% slower than its design, timeline.js PACE).

The score is built from the design cut (FILM_QUERY='rev11&pace=1'), so its cues sit on the design bar grid; this stretches
it by the pace without changing its pitch (ffmpeg's Rubber Band filter, crisp transients, channels together so the stereo
image holds), puts its integrated loudness back where the input had it, and holds its true peak under -1.5 dBTP with a
limiter run at 4x oversampling (it acts only on the few transients the stretch sharpens).

    python3 pace.py in.wav out.wav [pace]        # pace defaults to 1.1; FFMPEG names the binary (as for render.js)
"""
import os
import re
import subprocess
import sys
import tempfile

FF = os.environ.get('FFMPEG', 'ffmpeg')


def loudness(path):
    """Integrated loudness (LUFS) and true peak (dBTP) of a file, from ffmpeg's ebur128 filter."""
    err = subprocess.run([FF, '-hide_banner', '-nostats', '-i', path, '-af', 'ebur128=peak=true', '-f', 'null', '-'],
                         capture_output=True, text=True).stderr
    summary = err[err.rfind('Summary:'):]
    i = float(re.search(r'I:\s+(-?[\d.]+) LUFS', summary).group(1))
    tp = float(re.search(r'Peak:\s+(-?[\d.]+) dBFS', summary).group(1))
    return i, tp


def main(src, dst, pace=1.1):
    i0, tp0 = loudness(src)
    with tempfile.TemporaryDirectory() as tmp:
        mid = os.path.join(tmp, 'stretched.wav')
        subprocess.run([FF, '-hide_banner', '-v', 'error', '-y', '-i', src, '-af',
                        f'rubberband=tempo={1 / pace:.7f}:transients=crisp:channels=together:phase=laminar',
                        '-c:a', 'pcm_s24le', mid], check=True)
        i1, _ = loudness(mid)
        gain = round(i0 - i1, 2)
        subprocess.run([FF, '-hide_banner', '-v', 'error', '-y', '-i', mid, '-af',
                        f'volume={gain}dB,aresample=192000,alimiter=limit=0.83:attack=1:release=80:level=false:asc=true,'
                        'aresample=48000', '-c:a', 'pcm_s24le', dst], check=True)
    i2, tp2 = loudness(dst)
    print(f'{src}: {i0:.1f} LUFS, {tp0:.1f} dBTP -> {dst}: {i2:.1f} LUFS, {tp2:.1f} dBTP (pace {pace}, gain {gain:+.2f} dB)')
    if tp2 > -1.0:
        sys.exit(f'true peak {tp2:.1f} dBTP is above -1.0')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2], float(sys.argv[3]) if len(sys.argv) > 3 else 1.1)
