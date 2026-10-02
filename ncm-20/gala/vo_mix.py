#!/usr/bin/env python3
"""Lay the narration into a paced Revision 11 score: one voice line per VO cue, the music ducked under it.

The lines are the AI narration listed in data/narration-jasper.json (ElevenLabs through Higgsfield, voice "Jasper",
generated 1 October 2026), one file per VO id. Each line is trimmed of its leading and trailing silence, cleaned (a high
pass at 80 Hz, a gentle compressor, a touch of presence), and set at its cue's time on the paced cut. A line longer than
the room before the next line is first given the slack after its own cue (it may end later than its subtitle's planned
out), and only if it would still run into the next line is it tightened with Rubber Band, never past 1.12x; beyond that
the next line is moved later, and the move is reported so the subtitles can follow. The music under every line dips by
`--duck` dB with a 0.25 s attack and a 0.7 s release, then the whole mix is set to the input's integrated loudness and
held under -1.5 dBTP (4x oversampled limiter), as pace.py does.

    python3 vo_mix.py --fetch                                   # download the lines listed in the manifest (needs the host)
    python3 vo_mix.py MUSIC.wav OUT.wav [--cues out/r11/cues.json] [--voice out/r11/voice] [--duck 9] [--timing T.json]

FFMPEG names the ffmpeg binary (as for render.js and pace.py).
"""
import argparse
import json
import os
import re
import subprocess
import sys
import tempfile
import urllib.request

import numpy as np

FF = os.environ.get('FFMPEG', 'ffmpeg')
SR = 48000
HERE = os.path.dirname(os.path.abspath(__file__))


def decode(path, mono=False):
    """Any audio file as float32 at 48 kHz (stereo, or mono when asked), through ffmpeg."""
    ch = '1' if mono else '2'
    raw = subprocess.run([FF, '-v', 'error', '-i', path, '-ac', ch, '-ar', str(SR), '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    x = np.frombuffer(raw, np.float32).copy()
    return x if mono else x.reshape(-1, 2)


def write(path, x):
    """A float32 array (frames x channels) as 24-bit WAV, through ffmpeg."""
    ch = 1 if x.ndim == 1 else x.shape[1]
    subprocess.run([FF, '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', str(ch), '-i', '-', '-c:a', 'pcm_s24le', path],
                   input=np.ascontiguousarray(x, np.float32).tobytes(), check=True)


def ffilter(x, chain):
    """Run a mono float32 signal through an ffmpeg filter chain."""
    out = subprocess.run([FF, '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', '-af', chain, '-f', 'f32le', '-'],
                         input=np.ascontiguousarray(x, np.float32).tobytes(), capture_output=True, check=True).stdout
    return np.frombuffer(out, np.float32).copy()


def trim(x, floor_db=-45.0, pad=0.04):
    """Cut the leading and trailing silence (below floor_db of the line's peak), keeping a short pad."""
    env = np.convolve(np.abs(x), np.ones(480) / 480, mode='same')
    on = np.where(env > np.max(env) * 10 ** (floor_db / 20))[0]
    if not len(on):
        return x
    a, b = max(0, on[0] - int(pad * SR)), min(len(x), on[-1] + int(pad * SR))
    return x[a:b]


def loudness(path):
    err = subprocess.run([FF, '-hide_banner', '-nostats', '-i', path, '-af', 'ebur128=peak=true', '-f', 'null', '-'],
                         capture_output=True, text=True).stderr
    s = err[err.rfind('Summary:'):]
    return float(re.search(r'I:\s+(-?[\d.]+) LUFS', s).group(1)), float(re.search(r'Peak:\s+(-?[\d.]+) dBFS', s).group(1))


def fetch(manifest, voice_dir):
    os.makedirs(voice_dir, exist_ok=True)
    for ln in manifest['lines']:
        dst = os.path.join(voice_dir, ln['vo'] + '.mp3')
        if os.path.exists(dst) and os.path.getsize(dst) > 1000:
            continue
        with urllib.request.urlopen(ln['url'], timeout=60) as r, open(dst, 'wb') as f:
            f.write(r.read())
        print('fetched', ln['vo'], os.path.getsize(dst), 'bytes')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('music', nargs='?')
    ap.add_argument('out', nargs='?')
    ap.add_argument('--manifest', default=os.path.join(HERE, 'data', 'narration-jasper.json'))
    ap.add_argument('--cues', default=os.path.join(HERE, 'out', 'r11', 'cues.json'))
    ap.add_argument('--voice', default=os.path.join(HERE, 'out', 'r11', 'voice'))
    ap.add_argument('--duck', type=float, default=9.0)
    ap.add_argument('--gap', type=float, default=0.3)
    ap.add_argument('--max-tempo', type=float, default=1.12)
    ap.add_argument('--timing', default=None, help='write the lines\' final in/out (paced seconds) here')
    ap.add_argument('--fetch', action='store_true')
    a = ap.parse_args()
    manifest = json.load(open(a.manifest))
    if a.fetch:
        fetch(manifest, a.voice)
        if not a.music:
            return
    cues = json.load(open(a.cues))
    vo = {v['id']: v for v in cues['vo']}
    music = decode(a.music)
    i0, _ = loudness(a.music)
    n = len(music)
    voice = np.zeros(n, np.float32)
    timing, prev_end = [], 0.0
    lines = manifest['lines']
    for k, ln in enumerate(lines):
        v = vo[ln['vo']]
        x = trim(decode(os.path.join(a.voice, ln['vo'] + '.mp3'), mono=True))
        # clean: rumble out, a gentle compressor, a little presence, no hiss
        x = ffilter(x, 'highpass=f=80,acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120:makeup=2,'
                       'equalizer=f=3200:t=q:w=1.0:g=2.5,equalizer=f=250:t=q:w=1.2:g=-1.5')
        start = max(v['in'], prev_end + a.gap)
        nxt = vo[lines[k + 1]['vo']]['in'] if k + 1 < len(lines) else cues['duration'] - 1.0
        room = nxt - a.gap - start
        tempo = 1.0
        if len(x) / SR > room:
            tempo = min(a.max_tempo, (len(x) / SR) / room)
            x = ffilter(x, f'rubberband=tempo={tempo:.5f}:transients=smooth:formant=preserved')
        end = start + len(x) / SR
        s = int(round(start * SR))
        seg = x[:max(0, min(len(x), n - s))]
        voice[s:s + len(seg)] += seg
        timing.append({'vo': ln['vo'], 'in': round(start, 3), 'out': round(end, 3), 'cue_in': v['in'], 'cue_out': v['out'],
                       'tempo': round(tempo, 3), 'moved': round(start - v['in'], 3), 'over_next': round(max(0, end + a.gap - nxt), 3)})
        prev_end = end
        flag = '  MOVED %+.2f s' % (start - v['in']) if start - v['in'] > 0.01 else ''
        flag += '  RUNS %.2f s INTO THE NEXT LINE' % (end + a.gap - nxt) if end + a.gap > nxt + 0.01 else ''
        print(f"{ln['vo']:7s} {start:8.3f} -> {end:8.3f}  ({len(x) / SR:5.2f} s, tempo {tempo:.3f}; cue {v['in']:.2f}-{v['out']:.2f}){flag}")
    # the voice's level: every line to the same speech loudness (a -23 LUFS-ish RMS), then the ducking envelope from it
    rms = np.sqrt(np.convolve(voice ** 2, np.ones(SR // 10) / (SR // 10), mode='same'))
    speech = rms > 10 ** (-50 / 20)
    target = 10 ** (-20 / 20)
    voice *= target / max(1e-6, np.sqrt(np.mean(voice[speech] ** 2)))
    # duck: a gate on the speech, smoothed with a 0.25 s attack and a 0.7 s release
    g = np.where(speech, 1.0, 0.0).astype(np.float32)
    att, rel = 1 - np.exp(-1 / (0.25 * SR)), 1 - np.exp(-1 / (0.7 * SR))
    env = np.zeros_like(g)
    e = 0.0
    for i in range(0, n, 48):
        tgt = g[i]
        e += (tgt - e) * (1 - (1 - (att if tgt > e else rel)) ** 48)
        env[i:i + 48] = e
    duck = 10 ** (-a.duck * env / 20)
    mix = music * duck[:, None] + np.stack([voice, voice], 1) * 10 ** (-1.0 / 20)
    with tempfile.TemporaryDirectory() as tmp:
        raw = os.path.join(tmp, 'raw.wav')
        write(raw, mix)
        i1, _ = loudness(raw)
        gain = round(i0 - i1, 2)
        subprocess.run([FF, '-hide_banner', '-v', 'error', '-y', '-i', raw, '-af',
                        f'volume={gain}dB,aresample=192000,alimiter=limit=0.83:attack=1:release=80:level=false:asc=true,aresample=48000',
                        '-c:a', 'pcm_s24le', a.out], check=True)
    i2, tp2 = loudness(a.out)
    print(f'{a.out}: {i2:.1f} LUFS, {tp2:.1f} dBTP (music in at {i0:.1f} LUFS; ducked {a.duck} dB under the voice)')
    if a.timing:
        json.dump(timing, open(a.timing, 'w'), indent=1)
    if tp2 > -1.0:
        sys.exit(f'true peak {tp2:.1f} dBTP is above -1.0')


if __name__ == '__main__':
    main()
