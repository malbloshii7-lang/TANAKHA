#!/usr/bin/env python3
"""The show caller's reference (TREATMENT.md §10 A.3): the running order as one 1080p50 file with the picture above a
cue band. The band shows the 25 fps timecode (film timecode in part 1, part-2 timecode in part 2, time into each loop),
the current cue and its house / lighting / media note, a STANDBY five seconds before every cue and GO on it.

Running order: part 1 -> loop W once (12 s; on the night it loops until the caller releases part 2) -> part 2 -> loop B
once (20 s). Picture and sound come from the masters; nothing is re-graded.

    python3 qc/caller_ref.py <masters dir> <cuesheet.csv> <out.mp4> [--pull]
"""
import argparse
import csv
import subprocess
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from mp4info import mp4info  # noqa: E402

FPS_TC = 25
STANDBY = 5.0


def ffmpeg():
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        return 'ffmpeg'


def tc(sec):
    f = int(round(sec * FPS_TC + 1e-6))
    s, fr = divmod(f, FPS_TC)
    return f'{s // 3600:02d}:{s // 60 % 60:02d}:{s % 60:02d}:{fr:02d}'


def ass_time(sec):
    cs = int(round(sec * 100))
    return f'{cs // 360000}:{cs // 6000 % 60:02d}:{cs // 100 % 60:02d}.{cs % 100:02d}'


def esc(s):
    return s.replace('\\', '\\\\').replace('{', '(').replace('}', ')').replace('\n', '\\N')


def build(masters, cuesheet, out, pull=False):
    m = Path(masters)
    p1 = m / ('part1-pull-4k50.mp4' if pull else 'part1-4k50.mp4')
    w = m / ('hold-world-pull-4k50.mp4' if pull else 'hold-world-4k50.mp4')
    p2, b = m / 'part2-4k50.mp4', m / 'hold-b-4k50.mp4'
    for f in (p1, w, p2, b):
        if not f.exists():
            raise SystemExit(f'missing {f} (rejoin the part-1 pieces first)')
    dur = lambda f: next(t['duration'] for t in mp4info(str(f))['tracks'] if t.get('handler') == 'vide')
    D1, DW, D2, DB = dur(p1), dur(w), dur(p2), dur(b)
    seg = [('PART 1', 0.0, D1), ('LOOP W · APPLAUSE · loops until the caller releases part 2', D1, D1 + DW),
           ('PART 2', D1 + DW, D1 + DW + D2), ('LOOP B · STAGE HOLD · loops until the MC', D1 + DW + D2, D1 + DW + D2 + DB)]
    total = seg[-1][2]

    rows = [r for r in csv.DictReader(open(cuesheet, encoding='utf-8')) if r.get('cue', '').strip().isdigit()]
    cues = []
    for r in rows:
        n = int(r['cue'])
        if r.get('part 2 timecode', '').strip():
            h, mi, s, f = (int(x) for x in r['part 2 timecode'].split(':'))
            t = D1 + DW + ((h * 60 + mi) * 60 + s) + f / FPS_TC
        else:
            t = float(r['seconds'])
            if pull and t > D1:
                t = D1
        what = ' · '.join(x for x in (r['picture'].strip(), r['transition'].strip() and f"{r['transition'].strip()} {r['dissolve (s)'].strip()} s") if x)
        cues.append({'n': n, 't': min(t, total), 'what': what, 'note': r['house / lighting / media note'].strip()})
    cues.sort(key=lambda c: (c['t'], c['n']))

    L = []
    L += ['[Script Info]', 'ScriptType: v4.00+', 'PlayResX: 1920', 'PlayResY: 1080', 'WrapStyle: 0', 'ScaledBorderAndShadow: yes', '']
    L += ['[V4+ Styles]',
          'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding',
          # the band (y 900-1080) in three columns: timecode stack 40-520, cue and note 560-1400, STANDBY / GO 1440-1880
          'Style: TC,DejaVu Sans Mono,52,&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,1,0,0,0,100,100,0,0,1,0,0,7,40,1400,912,1',
          'Style: Sub,DejaVu Sans Mono,24,&H00D0D0D0,&H00FFFFFF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,0,0,7,40,1400,974,1',
          'Style: Seg,DejaVu Sans,22,&H00A0A0A0,&H00FFFFFF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,0,0,7,40,1400,1008,1',
          'Style: Cue,DejaVu Sans,30,&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,1,0,0,0,100,100,0,0,1,0,0,7,560,520,912,1',
          'Style: Note,DejaVu Sans,24,&H0080D0FF,&H00FFFFFF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,0,0,7,560,520,992,1',
          'Style: Call,DejaVu Sans,40,&H0000C8FF,&H00FFFFFF,&H00000000,&H00000000,1,0,0,0,100,100,0,0,1,0,0,9,1440,40,912,1',
          'Style: Go,DejaVu Sans,40,&H0050E050,&H00FFFFFF,&H00000000,&H00000000,1,0,0,0,100,100,0,0,1,0,0,9,1440,40,912,1',
          '']
    L += ['[Events]', 'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text']
    ev = lambda a, z, style, text: L.append(f'Dialogue: 0,{ass_time(a)},{ass_time(z)},{style},,0,0,0,,{esc(text)}')

    # timecode, one event per 25 fps frame
    step = 1 / FPS_TC
    k = 0
    while k * step < total - 1e-9:
        t0, t1 = k * step, min((k + 1) * step, total)
        name, a, z = next(s for s in seg if s[1] <= t0 < s[2] + 1e-9)
        if name == 'PART 1':
            ev(t0, t1, 'TC', tc(t0))
        elif name == 'PART 2':
            ev(t0, t1, 'TC', tc(t0 - a))
            ev(t0, t1, 'Sub', f'film {tc(D1 + (t0 - a))}')
        else:
            ev(t0, t1, 'TC', ('W +' if name.startswith('LOOP W') else 'B +') + tc(t0 - a)[3:])
        k += 1
    for name, a, z in seg:
        ev(a, z, 'Seg', name)
    # current cue with its note, until the next cue
    for i, c in enumerate(cues):
        end = cues[i + 1]['t'] if i + 1 < len(cues) else total
        if end > c['t']:
            ev(c['t'], end, 'Cue', f"CUE {c['n']} · {c['what']}")
            if c['note']:
                ev(c['t'], end, 'Note', c['note'])
    # standby and go
    for c in cues:
        if c['t'] > 0.05:
            ev(max(0.0, c['t'] - STANDBY), c['t'], 'Call', f"STANDBY CUE {c['n']}")
        ev(c['t'], min(total, c['t'] + 1.0), 'Go', f"GO CUE {c['n']}")

    with tempfile.TemporaryDirectory() as tmp:
        ass = Path(tmp) / 'cues.ass'
        ass.write_text('\n'.join(L) + '\n', encoding='utf-8')
        inputs = []
        for f in (p1, w, p2, b):
            inputs += ['-i', str(f)]
        # picture: 1600x900 at the top, the cue band below; limited-range BT.709 in and out
        chain = ''.join(f'[{i}:v]scale=1600:900:flags=area,setsar=1,pad=1920:1080:160:0:black[v{i}];' for i in range(4))
        chain += ''.join(f'[v{i}][{i}:a]' for i in range(4)) + 'concat=n=4:v=1:a=1[v][a];'
        chain += f"[v]ass='{ass}'[vo]"
        cmd = [ffmpeg(), '-y', '-v', 'error', *inputs, '-filter_complex', chain, '-map', '[vo]', '-map', '[a]',
               '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-r', '50',
               '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
               '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', str(out)]
        subprocess.run(cmd, check=True)
    return {'out': str(out), 'seconds': round(total, 3), 'cues': len(cues), 'segments': [(s[0].split(' ·')[0], round(s[1], 3), round(s[2], 3)) for s in seg]}


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('masters'); ap.add_argument('cuesheet'); ap.add_argument('out'); ap.add_argument('--pull', action='store_true')
    a = ap.parse_args()
    print(build(a.masters, a.cuesheet, a.out, a.pull))
