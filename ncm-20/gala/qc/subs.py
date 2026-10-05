#!/usr/bin/env python3
"""The side-screen subtitle deliverables from the SRT files subtitles.py writes: WebVTT for all four, EBU-STL (Tech 3264,
25 fps, Latin code table) for the two English files, and a reading-speed report.

The words and times are the approved ones; nothing is re-timed or re-worded. The report only flags cues that read fast
(characters a second, spaces included) or wrap to more than two 42-character rows, for the editor to judge.

    python3 qc/subs.py <dir with *.srt> <out dir>
"""
import datetime
import json
import re
import struct
import sys
import textwrap
from pathlib import Path

FPS = 25
ROW = 42          # characters a row for the side screens
CPS_LIMIT = 17    # a comfortable reading speed for ceremony captions (both languages)

TIME = re.compile(r'(\d+):(\d+):(\d+)[,.](\d+)')


def parse_srt(path):
    cues = []
    for block in re.split(r'\n\s*\n', Path(path).read_text(encoding='utf-8-sig').strip()):
        lines = block.strip().splitlines()
        if len(lines) < 3:
            continue
        a, b = (TIME.search(x) for x in lines[1].split('-->'))
        ms = lambda m: ((int(m[1]) * 60 + int(m[2])) * 60 + int(m[3])) * 1000 + int(m[4])
        cues.append({'n': int(lines[0]), 'in': ms(a), 'out': ms(b), 'text': '\n'.join(lines[2:])})
    return cues


def vtt_time(ms):
    return f'{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d}.{ms % 1000:03d}'


def write_vtt(cues, path, arabic):
    out = ['WEBVTT', '']
    if arabic:
        out += ['STYLE', '::cue { direction: rtl; }', '']
    for c in cues:
        out += [str(c['n']), f"{vtt_time(c['in'])} --> {vtt_time(c['out'])}", c['text'], '']
    Path(path).write_text('\n'.join(out), encoding='utf-8')


# ISO/IEC 6937 (EBU-STL code table 00) for the few non-ASCII characters in the English files
ISO6937 = {'‘': 0xA9, '“': 0xAA, '’': 0xB9, '”': 0xBA, '·': 0xB7, '×': 0xB4, '°': 0xB0}
FALLBACK = {'…': '...', '–': '-', '—': '-', ' ': ' ', '‏': '', '‎': ''}


def enc6937(s):
    b = bytearray()
    for ch in s:
        ch = FALLBACK.get(ch, ch)
        for c in ch:
            if c in ISO6937:
                b.append(ISO6937[c])
            elif ord(c) < 128:
                b.append(ord(c))
            else:
                raise ValueError(f'no ISO 6937 mapping for {c!r} in {s!r}')
    return bytes(b)


def stl_tc(ms):
    f = round(ms * FPS / 1000)
    s, fr = divmod(f, FPS)
    return bytes([s // 3600, s // 60 % 60, s % 60, fr])


def write_stl(cues, path, title):
    rows_max = 0
    ttis = []
    for c in cues:
        rows = []
        for line in c['text'].split('\n'):
            rows += textwrap.wrap(line, ROW) or ['']
        rows_max = max(rows_max, len(rows))
        text = b'\x8a'.join(enc6937(r) for r in rows)   # 0x8A: CR/LF between rows
        chunks = [text[i:i + 112] for i in range(0, len(text), 112)] or [b'']
        for k, chunk in enumerate(chunks):
            ebn = 0xFF if k == len(chunks) - 1 else k
            tti = struct.pack('<BHBB', 0, c['n'], ebn, 0) + stl_tc(c['in']) + stl_tc(c['out'])
            tti += bytes([22 - 2 * len(rows) if len(rows) < 11 else 1, 2, 0])   # vertical position, centred, not a comment
            tti += chunk.ljust(112, b'\x8f')
            ttis.append(tti)
    assert all(len(t) == 128 for t in ttis)
    today = datetime.date.today().strftime('%y%m%d')
    f = lambda s, n: s.encode('latin-1')[:n].ljust(n, b' ')
    gsi = (f('850', 3) + f('STL25.01', 8) + f('0', 1) + f('00', 2) + f('09', 2) +
           f(title, 32) + f('', 32) + f('', 32) + f('', 32) + f('', 32) + f('', 32) + f('NCM20-GALA', 16) +
           f(today, 6) + f(today, 6) + f('01', 2) + f(f'{len(ttis):05d}', 5) + f(f'{len(cues):05d}', 5) + f('001', 3) +
           f(f'{ROW:02d}', 2) + f(f'{max(rows_max, 1):02d}', 2) + f('1', 1) + f('00000000', 8) +
           f(''.join(f'{x:02d}' for x in stl_tc(cues[0]['in'])) if cues else '00000000', 8) + f('1', 1) + f('1', 1) +
           f('ARE', 3) + f('National Center of Meteorology', 32) + f('', 32) + f('', 32) + b' ' * 75 + b' ' * 576)
    assert len(gsi) == 1024, len(gsi)
    Path(path).write_bytes(gsi + b''.join(ttis))
    return len(ttis)


def report(cues):
    flags = []
    for c in cues:
        txt = c['text'].replace('\n', ' ').replace('‏', '').replace('‎', '')
        dur = (c['out'] - c['in']) / 1000
        cps = len(txt) / dur if dur else float('inf')
        rows = sum(len(textwrap.wrap(line, ROW)) or 1 for line in c['text'].split('\n'))
        if cps > CPS_LIMIT or rows > 2:
            flags.append({'cue': c['n'], 'seconds': round(dur, 2), 'chars': len(txt), 'cps': round(cps, 1), 'rows_at_42': rows})
    return flags


if __name__ == '__main__':
    src, out = Path(sys.argv[1]), Path(sys.argv[2])
    out.mkdir(parents=True, exist_ok=True)
    rep = {}
    for srt in sorted(src.glob('*.srt')):
        cues = parse_srt(srt)
        arabic = srt.stem.endswith('-ar')
        write_vtt(cues, out / (srt.stem + '.vtt'), arabic)
        made = [srt.stem + '.vtt']
        if not arabic:
            n = write_stl(cues, out / (srt.stem + '.stl'), 'Reading the Sky - ' + srt.stem)
            made.append(f'{srt.stem}.stl ({n} TTI blocks)')
        rep[srt.name] = {'cues': len(cues), 'written': made, 'reading_speed_flags': report(cues)}
    (out / 'subtitles-report.json').write_text(json.dumps(rep, indent=1, ensure_ascii=False), encoding='utf-8')
    for k, v in rep.items():
        print(k, v['cues'], 'cues ->', ', '.join(v['written']), '|', len(v['reading_speed_flags']), 'flagged')
