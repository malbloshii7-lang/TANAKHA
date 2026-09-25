#!/usr/bin/env python3
"""Subtitle files for the gala film, from the build itself (`node render.js cues cues.json`).

    python3 subtitles.py cues.json out-dir/

Writes, as UTF-8 SRT:
  on-screen-ar.srt, on-screen-en.srt  every words block and card, with the film times it is on screen (side screens)
  vo-ar.srt, vo-en.srt                the narration (VO-01 ... VO-16), for Arabic and English captions (accessibility)

Caption renderers often draw the Unicode isolate marks (U+2066-2069) that keep "2007-2027" in order inside Arabic as
boxes, so every isolated run is re-marked here with LEFT-TO-RIGHT MARKs (U+200E) on both sides instead, and every Arabic
line starts with a RIGHT-TO-LEFT MARK (U+200F), so a player that takes a line's direction from its first strong
character never lays out a line that opens with a number left to right.
The Arabic narration is set without the narrator's vowel marks (the shadda and the tanween on alif are kept).
"""
import json
import re
import sys

ISO = re.compile('⁦(.*?)⁩', re.S)
RLM = '\u200f'


def plain(s):
    return ISO.sub(lambda m: '‎' + m.group(1) + '‎', s).replace('⁦', '').replace('⁩', '')


def ts(t):
    t = max(0.0, t)
    ms = int(round(t * 1000))
    return f'{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}'


def write(path, items):
    with open(path, 'w', encoding='utf-8') as f:
        for i, (a, b, lines) in enumerate(items, 1):
            f.write(f'{i}\n{ts(a)} --> {ts(b)}\n' + '\n'.join(lines) + '\n\n')
    print('wrote', path, len(items))


def main(cues_path, out):
    cues = json.load(open(cues_path))
    end = cues['duration']
    errors = [t['error'] for t in cues.get('text', []) if 'error' in t]
    assert not errors, errors
    blocks = sorted((t for t in cues.get('text', []) if 'tin' in t), key=lambda t: t['tin'])
    ar, en = [], []
    for t in blocks:
        a, b = t['tin'], min(t['tout'], end) if t['tout'] < 1e8 else end
        if b - a < 0.3:
            continue
        if t['ar']:
            ar.append((a, b, [RLM + plain(l) for l in t['ar']]))
        if t['en']:
            en.append((a, b, [plain(l) for l in t['en']]))
    write(f'{out}/on-screen-ar.srt', ar)
    write(f'{out}/on-screen-en.srt', en)
    vo = cues.get('vo', [])
    write(f'{out}/vo-ar.srt', [(v['in'], v['out'], [RLM + plain(v['sub'])]) for v in vo])
    write(f'{out}/vo-en.srt', [(v['in'], v['out'], [v['en']]) for v in vo])


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else '.')
