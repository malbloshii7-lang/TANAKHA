#!/usr/bin/env python3
"""Show-control cue sheet for the gala film, from the timeline (`node render.js cues cues.json`).

    python3 cuesheet.py cues.json out.csv [fps]

One row per picture cut and per marked moment, with SMPTE timecode at the given frame rate (default 25, the 50 Hz
house rate). Beat numbers (B01...) are counted from the cut itself, so they stay right when a beat is pulled (?pull=).
The locked order's cut runs in one part and ends on the stage hold (LOOP A); a cut with a world beat and a gauge (an
earlier revision) still gets its applause split: PART 1 stops on the world beat's frame, LOOP W runs under the
applause, and the caller releases PART 2. The lighting and show-caller teams work from this; the ceremony's running
order is theirs.
"""
import csv
import json
import sys

LABEL = {
    'suhail': ('Night: Suhail rises over the desert', 'House lights out before GO; black under 1.5 s'),
    'durour': ('Dawn: the Durour star calendar', 'Warm light cue with the dawn'),
    'monsoon': ('Ahmed bin Majid and the monsoon', ''),
    'pearling': ('The great dive; the nahham', ''),
    'falaj': ('Hili falaj, Al Ain; Sheikh Zayed named', ''),
    'rail3d': ('Etihad Rail in engraved 3D: from the Hajar, the pass, the rise', 'The loudest drums of the film at the pass; silence as the camera rises'),
    'quote-zayed': ('Card: the late Sheikh Zayed', 'Hold light; no movement on stage'),
    'centre': ('2007: one national center', ''),
    'nation': ('The seven emirates', ''),
    'homes': ('April 2024, on the national map', 'Lighting restrained; no colour chase'),
    'airport': ('Zayed International', ''),
    'rail': ('Etihad Rail near Al Dhaid, Sharjah', ''),
    'port': ('Jebel Ali', ''),
    'tanker': ('A laden tanker off Fujairah; the east-coast bulletin', 'Removable module: go/no-go at two weeks and at 72 hours'),
    'energy': ('Shams 1', ''),
    'quote-president': ('Card: H.H. the President', 'Hold light; no movement on stage'),
    'seeding': ('Rain enhancement, Hajar (Ras Al Khaimah)', ''),
    'science': ('The science of rain', ''),
    'quote-mansour': ('Card: H.H. Sheikh Mansour bin Zayed', 'Hold light; no movement on stage'),
    'world': ('From the skies of the Emirates to the world', 'Applause expected at the end of this beat'),
    'gauge': ('Twenty years: twenty drops', ''),
    'finale': ('Night: the same star; title; lockup', ''),
}


def smpte(t, fps):
    f = int(round(t * fps))
    return f'{f // (3600 * fps):02d}:{f // (60 * fps) % 60:02d}:{f // fps % 60:02d}:{f % fps:02d}'


def main(cues_path, out, fps=25):
    cues = json.load(open(cues_path))
    S = {s['id']: s for s in cues['scenes']}
    parts = 'world' in S and 'gauge' in S
    split = S['gauge']['start'] - S['gauge']['xf'] / 2 if parts else None  # PART 1 ends where the dissolve into the gauge begins
    rows = [(0.0, '', 'PART 1 GO' if parts else 'GO', '', '', 'After the anthem and at least 5 s of silence')]
    B = {s['id']: f'B{i:02d}' for i, s in enumerate(cues['scenes'], 1)}
    for s in cues['scenes']:
        what, note = LABEL.get(s['id'], (s['id'], ''))
        rows.append((s['start'], s['id'], f"{B[s['id']]} {what}", s.get('enter', 'fade'), s.get('xf', 0.5), note))
    if parts:
        rows.append((split, 'world', f"PART 1 ENDS on the {B['world']} frame (office and name on screen)", '', '',
                     'Media server: cut to LOOP W (hold-world.mp4 / hold-world.wav, 12 s seamless) until the room settles'))
        rows.append((split + 0.001, 'gauge', 'PART 2 GO (released by the show caller)', '', '',
                     'Caller releases when applause ends; PART 2 clip starts at 00:00:00:00'))
        g = S['gauge']
        if g.get('t20') is not None:
            rows.append((g['start'] + g['t20'], 'gauge', 'The twentieth drop lands on 2027 (the hit)', '', '', 'GO: warm-gold stage wash, 4 s'))
    rows.append((cues['duration'], 'end', ('PART 2 ends' if parts else 'The film ends') + ' on the night sky; roll LOOP A', '', '',
                 'Media server: LOOP A (title) or B (dedication); LOOP C (dimmed) behind speeches; fade LOOP audio before the MC speaks'))
    rows.sort(key=lambda r: r[0])
    with open(out, 'w', newline='', encoding='utf-8') as f:
        w = csv.writer(f)
        w.writerow(['cue', f'film timecode ({fps} fps)', 'seconds', 'part 2 timecode', 'scene', 'picture', 'transition', 'dissolve (s)', 'house / lighting / media note'])
        for i, (t, sid, what, enter, xf, note) in enumerate(rows, 1):
            p2 = smpte(t - split, fps) if parts and t > split else ''
            w.writerow([i, smpte(t, fps), f'{t:.3f}', p2, sid, what, enter, xf, note])
        w.writerow([])
        w.writerow(['', '', '', '', 'safety', 'SAFETY SLATE (safety-slate.png): the title frame, on its own media-server layer', '', '', 'Switch to it at once if playback fails'])
    print('wrote', out, len(rows), 'cues')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 25)
