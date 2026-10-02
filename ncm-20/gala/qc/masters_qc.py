#!/usr/bin/env python3
"""Technical QC of the 4K 50p LED masters, measured on the encoded files. Writes qc-report.json and QC.md.

For every MP4: resolution, frame rate, exact frame count against the running order, the colour box (BT.709,
limited range), keyframes (a loop must be one stream with one keyframe), audio format and its duration against the
picture, and EBU R128 loudness with true peak. For every WAV: loudness and true peak. Seams, from accurately decoded
frames (BT.709, full-chroma interpolation): each loop's last frame back to its first, and the cuts part 1 -> loop W ->
part 2 (and for the fallback) and part 2 -> loops A and B, each set beside a neighbouring-frame step, the floor
between two separately encoded files, and the film's own keyframe refresh. The photosensitivity pre-check (qc/pse.py) runs on every MP4. SHA-256 of every file.

    python3 qc/masters_qc.py <masters dir> [--no-pse]
"""
import argparse
import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).parent))
from mp4info import mp4info  # noqa: E402
import pse  # noqa: E402

EXPECT = {  # frames at 50 fps, from the running order
    'part1-4k50.mp4': 7083, 'part1-4k50-restrained.mp4': 7083,
    'part1-pull-4k50.mp4': 6833, 'part1-pull-4k50-restrained.mp4': 6833,
    'part2-4k50.mp4': 1084, 'part2-4k50-restrained.mp4': 1084,
    'hold-world-4k50.mp4': 600, 'hold-world-pull-4k50.mp4': 600,
    'hold-a-4k50.mp4': 1000, 'hold-b-4k50.mp4': 1000, 'hold-c-4k50.mp4': 1000,
}
LOOPS = ['hold-world-4k50.mp4', 'hold-world-pull-4k50.mp4', 'hold-a-4k50.mp4', 'hold-b-4k50.mp4', 'hold-c-4k50.mp4']


def ffmpeg():
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        return 'ffmpeg'


FF = ffmpeg()
DEC = 'scale=in_color_matrix=bt709:in_range=tv:out_range=pc:flags=accurate_rnd+full_chroma_int+bicubic,format=rgb24'


def sha256(p):
    h = hashlib.sha256()
    with open(p, 'rb') as f:
        for chunk in iter(lambda: f.read(1 << 22), b''):
            h.update(chunk)
    return h.hexdigest()


def rgb_frames(path, first=None, last=None, w=3840, h=2160):
    """Decode the first N or the last N frames (last: seek near the end and keep the tail)."""
    args = [FF, '-v', 'error']
    if last:
        args += ['-sseof', '-0.5']
    args += ['-i', str(path), '-map', '0:v:0', '-vf', DEC]
    if first:
        args += ['-frames:v', str(first)]
    args += ['-f', 'rawvideo', '-pix_fmt', 'rgb24', '-']
    raw = subprocess.run(args, capture_output=True, check=True).stdout
    frames = np.frombuffer(raw, np.uint8).reshape(-1, h, w, 3)
    return frames[-last:] if last else frames


def rgb_range(path, n0, n, w=3840, h=2160):
    """Decode frames n0 .. n0+n-1 (0-based)."""
    args = [FF, '-v', 'error', '-i', str(path), '-map', '0:v:0', '-vf', f'select=between(n\\,{n0}\\,{n0 + n - 1}),{DEC}',
            '-vsync', '0', '-frames:v', str(n), '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-']
    raw = subprocess.run(args, capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, h, w, 3)


def diff(a, b):
    """RGB (all three channels) and luma (BT.709 Y' from the same RGB) mean absolute differences, in 8-bit levels."""
    d = np.abs(a.astype(np.int16) - b.astype(np.int16))
    y = lambda x: x[..., 0] * 0.2126 + x[..., 1] * 0.7152 + x[..., 2] * 0.0722
    dy = np.abs(y(a.astype(np.float32)) - y(b.astype(np.float32)))
    return {'mean': round(float(d.mean()), 4), 'p99': float(np.percentile(d, 99)), 'unchanged_pct': round(float((d.max(-1) == 0).mean() * 100), 2),
            'luma_mean': round(float(dy.mean()), 4)}


def loudness(path, stream='0:a:0'):
    r = subprocess.run([FF, '-hide_banner', '-nostats', '-i', str(path), '-map', stream, '-af', 'ebur128=peak=true', '-f', 'null', '-'],
                       capture_output=True, text=True)
    s = r.stderr[r.stderr.rfind('Summary:'):]
    grab = lambda k: float(re.search(k + r':\s*(-?[\d.]+|-inf)', s).group(1).replace('-inf', '-inf')) if re.search(k + r':\s*(-?[\d.]+)', s) else None
    return {'integrated_lufs': grab('I'), 'lra_lu': grab('LRA'), 'true_peak_dbtp': grab('Peak')}


def run(masters, do_pse=True):
    m = Path(masters)
    rep = {'files': {}, 'seams': {}, 'pse': {}, 'wav': {}}
    for f in sorted(m.glob('*.mp4')):
        info = mp4info(str(f))
        v = next(t for t in info['tracks'] if t.get('handler') == 'vide')
        a = next((t for t in info['tracks'] if t.get('handler') == 'soun'), None)
        ks = v.get('sync_samples')
        e = {
            'size_bytes': f.stat().st_size, 'sha256': sha256(f),
            'width': v.get('width'), 'height': v.get('height'), 'fps': v.get('fps'), 'frames': v.get('samples'),
            'frames_expected': EXPECT.get(f.name), 'video_s': round(v['duration'], 4),
            'avc_profile': {100: 'High', 244: 'High 4:4:4'}.get(v.get('avc_profile'), v.get('avc_profile')), 'avc_level': (v.get('avc_level') or 0) / 10,
            'colr': v.get('colr'), 'keyframes': len(ks) if isinstance(ks, list) else ks,
            'audio': {'codec': a.get('codec'), 'rate': a.get('sample_rate'), 'channels': a.get('channels'), 'seconds': round(a['duration'], 4)} if a else None,
            'faststart': info['faststart'],
        }
        e['av_delta_ms'] = round((a['duration'] - v['duration']) * 1000, 1) if a else None
        e['colour_ok'] = e['colr'] == {'primaries': 1, 'transfer': 1, 'matrix': 1, 'full_range': False}
        e['frames_ok'] = e['frames_expected'] in (None, e['frames']) and abs(e['fps'] - 50) < 1e-6
        if f.name in LOOPS:
            e['one_keyframe'] = e['keyframes'] == 1
        if a:
            e['loudness'] = loudness(f)
        rep['files'][f.name] = e
        print('checked', f.name, 'frames', e['frames'], 'colour', e['colour_ok'], flush=True)

    for f in LOOPS:
        p = m / f
        if p.exists():
            head, tail = rgb_frames(p, first=1)[0], rgb_frames(p, last=2)
            rep['seams'][f + ' loop point (last -> first)'] = diff(tail[-1], head)
            rep['seams'][f + ' neighbouring step (second-last -> last)'] = diff(tail[-2], tail[-1])
    for p1, w, p2 in (('part1-4k50.mp4', 'hold-world-4k50.mp4', 'part2-4k50.mp4'), ('part1-pull-4k50.mp4', 'hold-world-pull-4k50.mp4', 'part2-4k50.mp4')):
        if all((m / x).exists() for x in (p1, w, p2)):
            e1 = rgb_frames(m / p1, last=1)[0]
            w0, w1 = rgb_frames(m / w, first=1)[0], rgb_frames(m / w, last=1)[0]
            s2 = rgb_frames(m / p2, first=1)[0]
            rep['seams'][f'{p1} last -> {w} first'] = diff(e1, w0)
            rep['seams'][f'{w} last -> {p2} first'] = diff(w1, s2)
            rep['seams'][f'floor: {p1} last -> {p2} first (two separate encodes)'] = diff(e1, s2)
    if (m / 'part2-4k50.mp4').exists():  # the film's end into the closing holds: A is its next frame; B swaps the title
        # for the dedication by design (and C, dimmed, is not measured)
        t2 = rgb_frames(m / 'part2-4k50.mp4', last=2)
        rep['seams']['part2-4k50.mp4 neighbouring step (second-last -> last)'] = diff(t2[-2], t2[-1])
        for h in ('hold-a-4k50.mp4', 'hold-b-4k50.mp4'):
            if (m / h).exists():
                rep['seams'][f'part2-4k50.mp4 last -> {h} first'] = diff(t2[-1], rgb_frames(m / h, first=1)[0])
    p1 = m / 'part1-4k50.mp4'
    if p1.exists():  # the film's own keyframe refresh (every 5 s): each keyframe re-codes the paper grain, the yardstick for a cut
        v = next(t for t in mp4info(str(p1))['tracks'] if t.get('handler') == 'vide')
        for k in [s - 1 for s in v['sync_samples']][-3:]:
            f = rgb_range(p1, k - 2, 3)
            rep['seams'][f'part1-4k50.mp4 across its keyframe at frame {k}'] = diff(f[1], f[2])
            rep['seams'][f'part1-4k50.mp4 the step before it (frame {k - 2} -> {k - 1})'] = diff(f[0], f[1])

    for f in sorted((m / 'audio').glob('*.wav')):
        rep['wav'][f.name] = {**loudness(f), 'sha256': sha256(f)}
        print('loudness', f.name, rep['wav'][f.name]['integrated_lufs'], flush=True)

    if do_pse:
        for f in sorted(m.glob('*.mp4')):
            if 'restrained' in f.name:
                continue  # the same picture as its full-mix twin
            r = pse.analyse(str(f))
            rep['pse'][f.name] = r
            print('pse', f.name, 'pass' if r['general']['pass'] and r['red']['pass'] else 'FAIL', flush=True)
    return rep


def markdown(rep):
    L = ['# QC of the 4K 50p LED masters', '', 'Measured on the encoded files by `qc/masters_qc.py`.', '',
         '| File | Frames | fps | Colour (colr) | Keyframes | A/V Δ ms | Loudness LUFS | True peak dBTP |', '|---|---|---|---|---|---|---|---|']
    for n, e in rep['files'].items():
        c = e['colr']
        col = 'BT.709 limited' if e['colour_ok'] else (f"{c}" if c else 'untagged')
        lo = e.get('loudness') or {}
        L.append(f"| `{n}` | {e['frames']}{'' if e['frames_ok'] else ' ✗'} | {e['fps']:.0f} | {col} | {e['keyframes']} | {e['av_delta_ms']} | {lo.get('integrated_lufs')} | {lo.get('true_peak_dbtp')} |")
    L += ['', '## Seams and cuts (8-bit levels, mean absolute difference)', '', '| Pair | Luma mean | RGB mean | RGB p99 | Unchanged pixels |', '|---|---|---|---|---|']
    for k, d in rep['seams'].items():
        L.append(f"| {k} | {d['luma_mean']} | {d['mean']} | {d['p99']:.0f} | {d['unchanged_pct']}% |")
    L += ['', '## WAVs', '', '| File | Loudness LUFS | LRA LU | True peak dBTP |', '|---|---|---|---|']
    for n, w in rep['wav'].items():
        L.append(f"| `audio/{n}` | {w['integrated_lufs']} | {w['lra_lu']} | {w['true_peak_dbtp']} |")
    if rep['pse']:
        L += ['', '## Photosensitivity pre-check (ITU-R BT.1702 model; not a certified Harding test)', '',
              '| File | Max flashes in any 1 s | Max concurrent transition area | Red flashes | Result |', '|---|---|---|---|---|']
        for n, r in rep['pse'].items():
            ok = r['general']['pass'] and r['red']['pass']
            L.append(f"| `{n}` | {r['general']['max_flashes_in_1s']} | {r['general']['max_concurrent_transition_area'] * 100:.1f}% | {r['red']['max_transitions_in_1s'] / 2} | {'pass' if ok else 'FAIL'} |")
    return '\n'.join(L) + '\n'


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('masters')
    ap.add_argument('--no-pse', action='store_true')
    ap.add_argument('--out', default=None, help='directory for qc-report.json and QC.md (default: the masters dir)')
    a = ap.parse_args()
    rep = run(a.masters, not a.no_pse)
    out = Path(a.out or a.masters)
    (out / 'qc-report.json').write_text(json.dumps(rep, indent=1, default=str))
    (out / 'QC.md').write_text(markdown(rep))
    print('wrote', out / 'qc-report.json', out / 'QC.md')
