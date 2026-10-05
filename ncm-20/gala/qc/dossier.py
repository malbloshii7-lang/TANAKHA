#!/usr/bin/env python3
"""The QC dossier for the tech rehearsal: one self-contained HTML page (QC.html) built from qc-report.json, the cue
sheet and thumbnails taken from the masters at every cue. For the AV vendor, the show caller and NCM production.

    python3 qc/dossier.py <masters dir> <out.html> --source <commit> --rendered <date>
"""
import argparse
import base64
import csv
import html
import json
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from mp4info import mp4info  # noqa: E402

FPS_TC = 25


def ffmpeg():
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        return 'ffmpeg'


def thumb(path, t):
    out = subprocess.run([ffmpeg(), '-v', 'error', '-ss', f'{max(t, 0):.3f}', '-i', str(path), '-frames:v', '1',
                          '-vf', 'scale=480:270:flags=area', '-q:v', '4', '-f', 'mjpeg', '-'], capture_output=True).stdout
    return 'data:image/jpeg;base64,' + base64.b64encode(out).decode() if out else None


def e(s):
    return html.escape(str(s))


def chart(series_parts, cues_at, width=1000, height=220):
    """Mean screen luminance through the running order: an SVG line on one time scale, cue ticks along the axis."""
    pts, t0, segs = [], 0.0, []
    for name, series, dt in series_parts:
        segs.append((name, t0, t0 + len(series) * dt))
        pts += [(t0 + i * dt, v) for i, v in enumerate(series)]
        t0 += len(series) * dt
    if not pts:
        return ''
    T = t0
    vmax = max(20.0, max(v for _, v in pts) * 1.1)
    L, R, TOP, B = 56, 12, 14, 34
    X = lambda t: L + (width - L - R) * t / T
    Y = lambda v: TOP + (height - TOP - B) * (1 - v / vmax)
    d = 'M' + ' L'.join(f'{X(t):.1f},{Y(v):.1f}' for t, v in pts)
    area = d + f' L{X(pts[-1][0]):.1f},{Y(0):.1f} L{X(0):.1f},{Y(0):.1f} Z'
    step = 20 if vmax <= 100 else 50
    grid = ''.join(f'<line x1="{L}" x2="{width - R}" y1="{Y(v):.1f}" y2="{Y(v):.1f}" class="grid"/>'
                   f'<text x="{L - 8}" y="{Y(v) + 4:.1f}" class="ax" text-anchor="end">{v}</text>' for v in range(0, int(vmax) + 1, step))
    bands = ''.join(f'<rect x="{X(a):.1f}" y="{TOP}" width="{X(b) - X(a):.1f}" height="{height - TOP - B}" class="{"band" if k % 2 else "band2"}"/>'
                    f'<text x="{(X(a) + X(b)) / 2:.1f}" y="{height - 8}" class="ax" text-anchor="middle">{e(n)}</text>'
                    for k, (n, a, b) in enumerate(segs))
    ticks = ''.join(f'<line x1="{X(t):.1f}" x2="{X(t):.1f}" y1="{Y(0):.1f}" y2="{Y(0) + 6:.1f}" class="tick"/>' for t in cues_at if 0 <= t <= T)
    return (f'<svg viewBox="0 0 {width} {height}" role="img" aria-label="Mean screen luminance through the running order">'
            f'{bands}{grid}<path d="{area}" class="area"/><path d="{d}" class="line"/>{ticks}'
            f'<text x="{L}" y="{TOP - 2}" class="ax">cd/m² on the 200 cd/m² reference display</text></svg>')


def build(masters, out, source, rendered):
    m = Path(masters)
    rep = json.loads((m / 'qc-report.json').read_text())
    rows = [r for r in csv.DictReader(open(m / 'show' / 'cuesheet.csv', encoding='utf-8')) if r.get('cue', '').strip().isdigit()]
    vdur = lambda f: next(t['duration'] for t in mp4info(str(m / f))['tracks'] if t.get('handler') == 'vide')
    D1 = vdur('part1-4k50.mp4')

    cue_rows, cue_times = [], []
    DW = vdur('hold-world-4k50.mp4')
    for r in rows:
        if r.get('part 2 timecode', '').strip():
            h, mi, s, f = (int(x) for x in r['part 2 timecode'].split(':'))
            t2 = (h * 60 + mi) * 60 + s + f / FPS_TC
            src, t, tc = 'part2-4k50.mp4', t2, r['part 2 timecode']
            cue_times.append(D1 + DW + t2)
        else:
            t = float(r['seconds'])
            src, tc = 'part1-4k50.mp4', r['film timecode (25 fps)']
            cue_times.append(t)
        look = min(t + 1.5, vdur(src) - 0.1) if int(r['cue']) not in (1, 20) else (0.6 if int(r['cue']) == 1 else vdur(src) - 0.05)
        cue_rows.append({'n': r['cue'], 'tc': tc, 'file': src, 'img': thumb(m / src, look), 'picture': r['picture'],
                         'transition': ' '.join(x for x in (r['transition'], r['dissolve (s)'] and r['dissolve (s)'] + ' s') if x),
                         'note': r['house / lighting / media note']})

    pse = rep.get('pse', {})
    series = lambda f: pse.get(f, {}).get('mean_luminance_series_5hz', [])
    lum_svg = chart([('Part 1', series('part1-4k50.mp4'), 0.2), ('Loop W', series('hold-world-4k50.mp4'), 0.2),
                     ('Part 2', series('part2-4k50.mp4'), 0.2), ('Loop B', series('hold-b-4k50.mp4'), 0.2)], cue_times)

    def ok(b):
        return '<span class="ok">✓</span>' if b else '<span class="bad">✗</span>'

    files = rep['files']
    order = ['part1-4k50.mp4', 'hold-world-4k50.mp4', 'part2-4k50.mp4', 'hold-b-4k50.mp4', 'hold-a-4k50.mp4', 'hold-c-4k50.mp4',
             'part1-pull-4k50.mp4', 'hold-world-pull-4k50.mp4', 'part1-4k50-restrained.mp4', 'part1-pull-4k50-restrained.mp4', 'part2-4k50-restrained.mp4']
    frows = ''
    for n in [x for x in order if x in files] + [x for x in files if x not in order]:
        f = files[n]; lo = f.get('loudness') or {}
        frows += (f"<tr><td><code>{e(n)}</code></td><td class='num'>{f['frames']:,}</td><td class='num'>{f['video_s']:.2f}</td>"
                  f"<td>{ok(f['frames_ok'])}</td><td>{ok(f['colour_ok'])} {'BT.709 limited' if f['colour_ok'] else 'untagged'}</td>"
                  f"<td class='num'>{f['keyframes']}{' (one stream)' if f.get('one_keyframe') else ''}</td><td class='num'>{f['av_delta_ms']}</td>"
                  f"<td class='num'>{lo.get('integrated_lufs')}</td><td class='num'>{lo.get('true_peak_dbtp')}</td>"
                  f"<td class='num'>{f['size_bytes'] / 2**20:,.1f}</td><td><code class='sha'>{f['sha256'][:12]}</code></td></tr>")
    srows = ''.join(f"<tr><td>{e(k)}</td><td class='num'>{d['luma_mean']}</td><td class='num'>{d['mean']}</td><td class='num'>{d['p99']:.0f}</td><td class='num'>{d['unchanged_pct']}%</td></tr>"
                    for k, d in rep['seams'].items())
    wrows = ''.join(f"<tr><td><code>audio/{e(n)}</code></td><td class='num'>{w['integrated_lufs']}</td><td class='num'>{w['lra_lu']}</td><td class='num'>{w['true_peak_dbtp']}</td></tr>"
                    for n, w in rep['wav'].items())
    prows = ''.join(f"<tr><td><code>{e(n)}</code></td><td class='num'>{r['general']['max_flashes_in_1s']}</td>"
                    f"<td class='num'>{r['general']['max_concurrent_transition_area'] * 100:.1f}%</td><td class='num'>{r['red']['max_transitions_in_1s'] / 2}</td>"
                    f"<td class='num'>{r['largest_frame_to_frame_mean_change']['cd_m2']} at {r['largest_frame_to_frame_mean_change']['at_s']} s</td>"
                    f"<td>{ok(r['general']['pass'] and r['red']['pass'])} {'pass' if r['general']['pass'] and r['red']['pass'] else 'FAIL'}</td></tr>"
                    for n, r in pse.items())
    crows = ''
    for c in cue_rows:
        img = f'<img src="{c["img"]}" alt="Cue {e(c["n"])} frame" loading="lazy">' if c['img'] else ''
        trans = f'<div class="muted">{e(c["transition"])}</div>' if c['transition'] else ''
        crows += (f'<tr><td class="cue">{e(c["n"])}</td><td>{img}</td>'
                  f'<td><code>{e(c["tc"])}</code><div class="muted">{e(c["file"].split("-4k")[0])}</div></td>'
                  f'<td>{e(c["picture"])}{trans}</td><td>{e(c["note"])}</td></tr>')
    all_colour = all(f['colour_ok'] for f in files.values())
    all_frames = all(f['frames_ok'] for f in files.values())
    loops_one = all(f.get('one_keyframe', True) for f in files.values())
    pse_pass = all(r['general']['pass'] and r['red']['pass'] for r in pse.values()) if pse else None
    tp = max((f.get('loudness') or {}).get('true_peak_dbtp') or -99 for f in files.values())

    page = f"""<title>Gala LED Masters QC</title>
<meta name="description" content="QC dossier for the 4K 50p LED masters of Reading the Sky, the NCM 20th-anniversary film.">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&family=Source+Serif+4:opsz,wght@8..60,600&display=swap">
<style>
/* Layout: a working document for the tech rehearsal; checklist first, then the running order with a frame per cue,
   then the measurements. Diplomatic Ledger palette, shared with the NCM at Twenty page. */
:root{{--paper:#F7F4ED;--surface:#FFFFFF;--ink:#1A2B3C;--soft:#45586B;--mute:#5B6A7B;--accent:#0F6B66;--rule:rgba(26,43,60,.14);
--good:#1E7B4A;--bad:#B3261E;--area:rgba(15,107,102,.14);--band:rgba(26,43,60,.035);
--serif:"Source Serif 4",Georgia,serif;--sans:"IBM Plex Sans",-apple-system,"Segoe UI",system-ui,sans-serif;--mono:"IBM Plex Mono",ui-monospace,Menlo,Consolas,monospace}}
@media (prefers-color-scheme:dark){{:root:not([data-theme="light"]){{--paper:#12212F;--surface:#182A3A;--ink:#EDE9E0;--soft:#B7C2CE;--mute:#8D9AA8;
--accent:#6FB3AA;--rule:rgba(237,233,224,.14);--good:#6FCF97;--bad:#FF8A80;--area:rgba(111,179,170,.18);--band:rgba(237,233,224,.04);color-scheme:dark}}}}
:root[data-theme="dark"]{{--paper:#12212F;--surface:#182A3A;--ink:#EDE9E0;--soft:#B7C2CE;--mute:#8D9AA8;--accent:#6FB3AA;--rule:rgba(237,233,224,.14);
--good:#6FCF97;--bad:#FF8A80;--area:rgba(111,179,170,.18);--band:rgba(237,233,224,.04);color-scheme:dark}}
*{{box-sizing:border-box}}
body{{margin:0;background:var(--paper);color:var(--ink);font:400 15px/1.6 var(--sans);padding-inline:16px}}
.wrap{{max-width:1180px;margin:0 auto;padding-block:40px 64px}}
h1{{font:600 clamp(1.7rem,3.4vw,2.4rem)/1.15 var(--serif);margin:6px 0 10px;text-wrap:balance}}
h2{{font:600 1.3rem/1.3 var(--serif);margin:48px 0 6px;text-wrap:balance}}
p{{margin:0 0 10px;max-width:72ch;color:var(--soft)}}
.eyebrow{{font:500 .75rem/1.4 var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--mute)}}
code{{font:400 .82rem var(--mono)}} .sha{{color:var(--mute)}}
.muted{{color:var(--mute);font-size:.82rem}}
.scroll{{overflow-x:auto;margin-top:14px;border-top:1px solid var(--rule)}}
table{{border-collapse:collapse;width:100%;font-size:.9rem}}
th,td{{text-align:left;vertical-align:top;padding:9px 10px;border-bottom:1px solid var(--rule)}}
th{{font:500 .72rem/1.3 var(--mono);letter-spacing:.06em;text-transform:uppercase;color:var(--mute);white-space:nowrap}}
td.num{{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}}
td.cue{{font:600 1.1rem var(--serif);color:var(--accent)}}
td img{{width:200px;max-width:100%;border-radius:3px;display:block;background:#000}}
.ok{{color:var(--good);font-weight:600}} .bad{{color:var(--bad);font-weight:600}}
.checks{{list-style:none;padding:0;margin:18px 0 0;display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:0 28px}}
.checks li{{border-top:1px solid var(--rule);padding:12px 0;display:grid;grid-template-columns:22px 1fr;gap:8px}}
.checks b{{font-weight:600}}
svg{{width:100%;height:auto;margin-top:14px;display:block}}
svg .line{{fill:none;stroke:var(--accent);stroke-width:1.5}} svg .area{{fill:var(--area)}}
svg .grid{{stroke:var(--rule)}} svg .tick{{stroke:var(--mute)}} svg .band{{fill:var(--band)}} svg .band2{{fill:transparent}}
svg .ax{{font:400 11px var(--mono);fill:var(--mute)}}
ul.plain{{padding-left:1.2em;color:var(--soft);max-width:80ch}} ul.plain li{{margin-bottom:6px}}
</style>
<div class="wrap">
<div class="eyebrow">National Center of Meteorology · 20th anniversary · March 2027</div>
<h1>Reading the Sky · 4K 50p LED masters · QC</h1>
<p>Technical masters for LED calibration, media-server programming and the tech rehearsal. Rendered {e(rendered)} from
<code>claude/focused-mayer-jogort</code> at <code>{e(source)}</code>. The score is the synthesized temp score and there is
no narration yet. Every figure below was measured on the encoded files.</p>

<ul class="checks">
<li>{ok(all_colour)}<span><b>Colour</b>: every file BT.709, limited range, tagged in the stream and the container</span></li>
<li>{ok(all_frames)}<span><b>Frames</b>: exact counts against the running order, 50 fps</span></li>
<li>{ok(loops_one)}<span><b>Loops</b>: each one stream with one keyframe; seams below</span></li>
<li>{ok(bool(pse_pass))}<span><b>Photosensitivity pre-check</b>: no general or red flash (BT.1702 model). A certified Harding test is still required on the ceremony master</span></li>
<li>{ok(tp <= -1.0)}<span><b>True peak</b>: highest in the MP4s {tp} dBTP{'' if tp <= -1.0 else ' (above −1 dBTP after AAC; the sound desk plays the WAVs)'}</span></li>
</ul>

<h2>Running order, a frame per cue</h2>
<p>Film timecode is 25 fps from 00:00:00:00 at GO; part 2 has its own timecode from the caller's release. The frame is taken
1.5 s after each cue (the last frame for cue 20).</p>
<div class="scroll"><table><thead><tr><th>Cue</th><th>Frame</th><th>Timecode</th><th>Picture</th><th>House, lighting, media</th></tr></thead><tbody>{crows}</tbody></table></div>

<h2>Screen brightness through the show</h2>
<p>Mean luminance of the whole frame, every 0.2 s, on the photosensitivity guideline's 200 cd/m² reference display (scale it
to the wall's measured white). Ticks mark the cues. Use it to plan the wall's level and the camera exposure for IMAG.</p>
{lum_svg}

<h2>Masters</h2>
<div class="scroll"><table><thead><tr><th>File</th><th>Frames</th><th>Seconds</th><th>Count</th><th>Colour</th><th>Keyframes</th><th>A/V Δ ms</th><th>LUFS</th><th>dBTP</th><th>MiB</th><th>SHA-256</th></tr></thead><tbody>{frows}</tbody></table></div>
<p class="muted">A/V Δ is the AAC track's length beyond the picture (encoder priming and the last frame's padding). The WAVs are the sound desk's source.</p>

<h2>Seams and cuts</h2>
<p>Mean absolute difference in 8-bit levels between the two frames that meet, from accurately decoded frames. A loop's seam
should be no larger than a neighbouring frame step. The films are encoded at CRF 18 with a keyframe every 5 s, and each
keyframe re-codes the paper grain: the steps across part 1's last three keyframes are listed, with the step before each.
The cuts into and out of loop W, and from part 2 into loop A, should be about the size of that refresh and below the floor
between two separately encoded files. The cut into loop B is larger by design, because the title gives way to the dedication; a
0.5 s dissolve on the media server softens it if a hard change is not wanted.</p>
<div class="scroll"><table><thead><tr><th>Where</th><th>Luma</th><th>RGB</th><th>RGB p99</th><th>Unchanged</th></tr></thead><tbody>{srows}</tbody></table></div>

<h2>Photosensitivity pre-check</h2>
<p>Modelled on ITU-R BT.1702: a flash is a pair of opposing luminance changes of 20 cd/m² or more with the darker below
160 cd/m², over a quarter of the screen at once; more than 3 in any second fails. Red flashes are measured on saturated red.
It screens the masters; it does not replace the certified test.</p>
<div class="scroll"><table><thead><tr><th>File</th><th>Max flashes / s</th><th>Largest concurrent change</th><th>Red flashes / s</th><th>Largest frame-to-frame change</th><th>Result</th></tr></thead><tbody>{prows}</tbody></table></div>

<h2>Audio (WAV, 48 kHz, 24-bit)</h2>
<div class="scroll"><table><thead><tr><th>File</th><th>LUFS</th><th>LRA LU</th><th>True peak dBTP</th></tr></thead><tbody>{wrows}</tbody></table></div>

<h2>What is in the delivery</h2>
<ul class="plain">
<li><code>part1*</code>, <code>part2*</code>, <code>hold-*</code>: the masters (part 1 in three pieces; <code>join.sh</code> / <code>join.bat</code> rejoin and check them).</li>
<li><code>show/ltc/</code>: SMPTE LTC at 25 fps from 00:00:00:00 for part 1, the fallback part 1 and part 2, each checked by decoding every frame.</li>
<li><code>show/subtitles/</code>: WebVTT for the four caption files, EBU-STL for the two English ones, and a reading-speed report for the editor.</li>
<li><code>show/caller/</code>: the show caller's 1080p50 reference, with the running order, STANDBY and GO on every cue, with and without the tanker beat.</li>
<li><code>QC.md</code>, <code>qc-report.json</code>: these measurements as text and data.</li>
</ul>
</div>
"""
    Path(out).write_text(page, encoding='utf-8')
    return {'out': str(out), 'bytes': len(page.encode())}


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('masters'); ap.add_argument('out'); ap.add_argument('--source', required=True); ap.add_argument('--rendered', required=True)
    a = ap.parse_args()
    print(build(a.masters, a.out, a.source, a.rendered))
