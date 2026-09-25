#!/usr/bin/env python3
"""The as-built script, for approvals: every narration line and every words block, with its film times, exactly as
the build renders them (`node render.js cues cues.json`).

    python3 script.py cues.json SCRIPT.md

TREATMENT.md sets out the intent; SCRIPT.md is what the film says. Regenerate it after any change to timeline.js,
data/quotes.js or the VO table, and send this file (not the treatment) to the protocol office and the Arabic editor.
"""
import json
import re
import sys

ISO = re.compile('[⁦-⁩]')
LEVEL = {'A': 'A (headline)', 'B': 'B (label)', 'card': 'Card', 'title': 'Title', 'lockup': 'Lockup'}


def clean(s):
    return ISO.sub('', s).replace('|', '\\|')


def mmss(t):
    return f'{int(t // 60)}:{t % 60:05.2f}'


def main(cues_path, out):
    cues = json.load(open(cues_path))
    scenes = cues['scenes']
    beat = {}
    for i, s in enumerate(scenes, 1):
        beat[s['id']] = f'B{i:02d}'

    def which(t):
        cur = scenes[0]['id']
        for s in scenes:
            if s['start'] <= t + 1e-6:
                cur = s['id']
        return beat[cur]

    L = ['# عشرون عاماً في قراءة السماء · Twenty Years of Reading the Sky', '',
         '**As-built script** for approval, generated from the build by `script.py` (film times in seconds and m:ss).',
         f"Runtime {mmss(cues['duration'])}. The narrator's copy is fully vowelled; the on-screen text carries no vowels "
         'except where one prevents a misreading. Leaders\' words appear on cards only and are never voiced.', '',
         '## Narration (voice-over)', '', '| ID | Beat | In–out | Arabic (narrator\'s copy) | English |', '|---|---|---|---|---|']
    for v in cues.get('vo', []):
        L.append(f"| {v['id']} | {which(v['in'])} | {mmss(v['in'])}–{mmss(v['out'])} | {clean(v['ar'])} | {clean(v['en'])} |")
    L += ['', '## On screen', '', '| Beat | In–out | Level | Arabic | English |', '|---|---|---|---|---|']
    for t in sorted((t for t in cues.get('text', []) if 'tin' in t), key=lambda t: t['tin']):
        tout = min(t['tout'], cues['duration'])
        L.append(f"| {which(t['tin'])} | {mmss(t['tin'])}–{mmss(tout)} | {LEVEL.get(t['level'], t['level'])} | "
                 f"{'<br>'.join(clean(x) for x in t['ar'])} | {'<br>'.join(clean(x) for x in t['en'])} |")
    L += ['', '## Beats', '', '| Beat | Scene | Start | Length | Transition in |', '|---|---|---|---|---|']
    for s in scenes:
        L.append(f"| {beat[s['id']]} | `{s['id']}` | {mmss(s['start'])} | {s['dur']:.2f} s | {s['enter']} ({s['xf']} s) |")
    L.append('')
    open(out, 'w', encoding='utf-8').write('\n'.join(L))
    print('wrote', out, len(cues.get('vo', [])), 'VO lines,', len(cues.get('text', [])), 'text blocks')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else 'SCRIPT.md')
