"""Procedural score + sound design for the WMO mission video (50.0 s, 48 kHz stereo).
Every cue is placed on the same timeline constants as js/engine.js (101.05 BPM grid)."""
import numpy as np, scipy.signal as sg, wave, sys

SR = 48000
DUR = 50.0
N = int(SR * DUR)
BEAT = 0.59375; BAR = 4 * BEAT; PAN = 1.75 * BEAT; A0 = 5 * BAR
ARR = [A0 + 2 * BAR * i for i in range(7)]
T = dict(head=[BEAT * .5, BEAT * .9, BEAT * 1.3], name=BEAT * 2.55, stats=BAR,
         lineA=BAR + BEAT * .5, lineB=2 * BAR - BEAT * .25, morph=2 * BAR + 2 * BEAT,
         morphEnd=3 * BAR + BEAT * .25, pulse=3 * BAR + BEAT * .25, pulseEnd=4 * BAR + BEAT * .5,
         dock=4 * BAR + BEAT, dockEnd=A0, pill=ARR[6], fin=ARR[6] + 2 * BAR)
rng = np.random.default_rng(20261002)
mf = lambda m: 440.0 * 2 ** ((m - 69) / 12)

# ---------------------------------------------------------------- buses
bus = {k: np.zeros((2, N)) for k in ('pad', 'bass', 'keys', 'drums', 'fx')}
send = np.zeros((2, N))

def put(name, sig, t0, pan=0.0, gain=1.0, rev=0.0):
    sig = np.asarray(sig, float)
    if sig.ndim == 1:
        a = (pan + 1) * np.pi / 4
        sig = np.vstack([sig * np.cos(a), sig * np.sin(a)])
    i0 = int(round(t0 * SR))
    if i0 < 0: sig = sig[:, -i0:]; i0 = 0
    n = min(sig.shape[1], N - i0)
    if n <= 0: return
    bus[name][:, i0:i0 + n] += sig[:, :n] * gain
    if rev: send[:, i0:i0 + n] += sig[:, :n] * gain * rev

def tt(dur): return np.arange(int(dur * SR)) / SR

def env_ar(n, a, r_tau):
    t = np.arange(n) / SR
    return (1 - np.exp(-t / max(a, 1e-4))) * np.exp(-t / r_tau)

def bandpass_sweep(x, f_of_t, q=1.2, block=256):
    """time-varying band-pass via block-updated biquads (state carried across blocks)"""
    y = np.zeros_like(x); zi = np.zeros(2)
    for i in range(0, len(x), block):
        f = float(np.clip(f_of_t(i / SR), 40, SR / 2 * .9))
        w0 = 2 * np.pi * f / SR; al = np.sin(w0) / (2 * q)
        b = np.array([al, 0, -al]); a = np.array([1 + al, -2 * np.cos(w0), 1 - al])
        b /= a[0]; a /= a[0]
        seg, zi = sg.lfilter(b, a, x[i:i + block], zi=zi)
        y[i:i + block] = seg
    return y

def lowpass(x, fc, order=2):
    b, a = sg.butter(order, fc / (SR / 2)); return sg.lfilter(b, a, x)
def highpass(x, fc, order=2):
    b, a = sg.butter(order, fc / (SR / 2), 'high'); return sg.lfilter(b, a, x)

# ---------------------------------------------------------------- instruments
def supersaw_note(m, dur, fc=2200.0, voices=5, spread=.11, att=.7, rel=1.6, bright=1.0):
    """additive, band-limited detuned saw stack -> stereo"""
    n = int((dur + rel) * SR); t = np.arange(n) / SR
    out = np.zeros((2, n)); f0 = mf(m)
    for v in range(voices):
        det = (v - (voices - 1) / 2) * spread
        f = f0 * 2 ** (det / 12)
        drift = 1 + .0015 * np.sin(2 * np.pi * (.13 + .07 * v) * t + v)
        ph = rng.uniform(0, 2 * np.pi, 40)
        sig = np.zeros(n); h = 1
        while f * h < 6500 and h <= 40:
            amp = (1 / h) / (1 + (f * h / (fc * bright)) ** 2)
            sig += amp * np.sin(2 * np.pi * f * h * t * drift + ph[h - 1]); h += 1
        pan = (v - (voices - 1) / 2) / ((voices - 1) / 2) * .7
        a = (pan + 1) * np.pi / 4
        out[0] += sig * np.cos(a); out[1] += sig * np.sin(a)
    e = np.clip(t / att, 0, 1) ** 1.6 * np.where(t < dur, 1, np.exp(-(t - dur) / (rel / 4)))
    return out * e / voices

def pad_chord(notes, t0, t1, gain=.05, fc=2200, att=.7, rel=1.8, bright=1.0):
    for m in notes:
        put('pad', supersaw_note(m, t1 - t0, fc=fc, att=att, rel=rel, bright=bright), t0, gain=gain, rev=.45)

def epiano(m, vel=.8, dur=1.6):
    t = tt(dur); f = mf(m)
    I = 2.0 * vel * np.exp(-t * 5.5) + .3
    car = np.sin(2 * np.pi * f * t + I * np.sin(2 * np.pi * f * t))
    tine = .12 * vel * np.sin(2 * np.pi * f * 14 * t) * np.exp(-t * 45)
    return (car + tine) * env_ar(len(t), .003, .55 + .25 * (1 - vel)) * vel

def bell(m, vel=.7, dur=3.2, ratio=3.0):
    t = tt(dur); f = mf(m)
    I = 1.6 * np.exp(-t * 2.2)
    s = np.sin(2 * np.pi * f * t + I * np.sin(2 * np.pi * f * ratio * t))
    s += .35 * np.sin(2 * np.pi * f * 2.0 * t) * np.exp(-t * 3)
    return s * env_ar(len(t), .002, 1.1) * vel

def glass(m, vel=.5, dur=1.4):
    t = tt(dur); f = mf(m)
    s = np.sin(2 * np.pi * f * t) + .25 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 6)
    return s * env_ar(len(t), .001, .32) * vel

def bass_note(m, dur, vel=.8, fc=520):
    n = int((dur + .25) * SR); t = np.arange(n) / SR; f = mf(m)
    s = np.zeros(n)
    for h in range(1, 18):
        if f * h > 3000: break
        s += (1 / h) / (1 + (f * h / fc) ** 2) * np.sin(2 * np.pi * f * h * t)
    s += .9 * np.sin(2 * np.pi * f * t)  # fundamental weight
    e = (1 - np.exp(-t / .004)) * np.where(t < dur, .55 + .45 * np.exp(-t / .22), 0)
    e = np.where(t < dur, e, e.max() * 0 + (.55 + .45 * np.exp(-dur / .22)) * np.exp(-(t - dur) / .05))
    return np.tanh(1.4 * s * e) * vel

def kick(vel=1.0):
    t = tt(.6); f = 44 + 95 * np.exp(-t * 30)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7.0)
    click = highpass(rng.standard_normal(len(t)), 2500) * np.exp(-t * 260) * .12
    return np.tanh(1.3 * (body + click)) * vel

def clap(vel=.6):
    t = tt(.5); nz = rng.standard_normal(len(t))
    nz = bandpass_sweep(nz, lambda x: 1500, q=.9)
    e = np.zeros(len(t))
    for d in (0, .009, .019):
        e += np.where(t >= d, np.exp(-(t - d) * 90), 0)
    e += .5 * np.exp(-t * 14)
    return nz * e * vel * .9

def hat(vel=.3, open_=False):
    t = tt(.25 if open_ else .09); nz = highpass(rng.standard_normal(len(t)), 7500, 4)
    return nz * np.exp(-t * (16 if open_ else 70)) * vel

def whoosh(dur, vel=.5, f_lo=350, f_hi=3200, peak=.62, pan_from=.8, pan_to=-.8):
    n = int(dur * SR); t = np.arange(n) / SR; u = t / dur
    nz = rng.standard_normal(n)
    shape = lambda x: np.sin(np.pi * np.clip(x, 0, 1) ** (np.log(.5) / np.log(peak)))
    y = bandpass_sweep(nz, lambda x: f_lo + (f_hi - f_lo) * shape(x / dur) ** 1.5, q=1.1)
    env = shape(u) ** 2.2
    y = y * env * vel
    p = pan_from + (pan_to - pan_from) * u
    a = (p + 1) * np.pi / 4
    return np.vstack([y * np.cos(a), y * np.sin(a)])

def riser(dur, vel=.4, f0=180, f1=1400):
    t = tt(dur); u = t / dur
    nz = bandpass_sweep(rng.standard_normal(len(t)), lambda x: 400 + 5200 * (x / dur) ** 2, q=.8)
    f = f0 * (f1 / f0) ** (u ** 1.6)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * .25
    tone2 = np.sin(2 * np.pi * np.cumsum(f * 1.5) / SR) * .12
    env = u ** 2.4
    y = (nz * .9 + tone + tone2) * env * vel
    return np.vstack([y, np.roll(y, int(.011 * SR))])

def impact(vel=.9, low=1.0):
    t = tt(2.6); f = 38 + 36 * np.exp(-t * 9)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.6) * low
    nz = lowpass(rng.standard_normal(len(t)), 900) * np.exp(-t * 9) * .6
    return np.tanh((boom + nz) * 1.2) * vel

def pop(f=1250, vel=.25):
    t = tt(.09); ff = f * (1 - .35 * (1 - np.exp(-t * 60)))
    return np.sin(2 * np.pi * np.cumsum(ff) / SR) * np.exp(-t * 55) * vel

def tick(vel=.12):
    t = tt(.03); return highpass(rng.standard_normal(len(t)), 3000) * np.exp(-t * 300) * vel

def sparkle(t0, dur, notes, vel=.22, count=9):
    for k in range(count):
        tk = t0 + dur * (k / count) + rng.uniform(-.02, .02)
        put('fx', glass(notes[k % len(notes)] + (12 if k % 3 == 2 else 0), vel * rng.uniform(.6, 1)), tk,
            pan=rng.uniform(-.7, .7), rev=.6)

# ---------------------------------------------------------------- harmony
CH = {
    'D':   dict(pad=[50, 57, 61, 64, 66], bass=38, arp=[74, 69, 76, 78, 81, 78, 76, 69]),
    'Bm':  dict(pad=[47, 54, 57, 62, 64], bass=35, arp=[71, 66, 74, 76, 78, 76, 74, 66]),
    'G':   dict(pad=[43, 50, 54, 57, 59], bass=43, arp=[74, 67, 71, 74, 79, 74, 71, 66]),
    'A':   dict(pad=[45, 52, 57, 59, 61], bass=45, arp=[73, 69, 76, 71, 81, 76, 73, 69]),
    'F#m': dict(pad=[42, 49, 52, 57, 61], bass=42, arp=[73, 66, 69, 76, 78, 76, 69, 66]),
    'Em':  dict(pad=[40, 47, 50, 55, 59], bass=40, arp=[71, 67, 74, 76, 79, 76, 74, 67]),
    'Asus':dict(pad=[45, 52, 57, 62, 64], bass=45, arp=[74, 69, 76, 74, 81, 76, 74, 69]),
}
PROG = ['D', 'D', 'Bm', 'G', 'A',             # bars 0-4  title / globe / dock
        'D', 'Bm', 'G', 'A', 'D', 'F#m', 'G', 'A', 'Bm', 'G', 'Em', 'Asus',   # bars 5-16 stops
        'G', 'A',                              # bars 17-18 pillars
        'D']                                   # bar 19+  finale
bar_t = lambda k: k * BAR

# pads (one segment per bar; finale holds to the end)
for k, c in enumerate(PROG):
    t0 = bar_t(k); t1 = DUR - .2 if k == 19 else bar_t(k + 1)
    sect_gain = (.040 if k < 3 else .046 if k < 5 else .050 if k < 17 else .060 if k < 19 else .066) * 1.25
    fc = (1500 if k < 3 else 1900 if k < 5 else 2300 if k < 17 else 2900 if k < 19 else 2600) * 1.2
    pad_chord(CH[c]['pad'], t0, t1, gain=sect_gain, fc=fc, att=.9 if k in (0, 19) else .35, rel=2.2 if k == 19 else 1.2)
# a high shimmer layer for the lift + finale
for k in (17, 18, 19):
    c = CH[PROG[k]]['pad']
    pad_chord([n + 24 for n in c[2:]], bar_t(k), (DUR - .2) if k == 19 else bar_t(k + 1), gain=.018, fc=5200, att=.6, rel=2.0)

# bass: soft sustained notes in the intro/globe, pulsing 8ths through the stops
for k, c in enumerate(PROG):
    b = CH[c]['bass']
    if k < 2: continue
    if k < 5 or k >= 17:
        if k == 19:
            put('bass', bass_note(b, DUR - bar_t(k) - .3, .55, fc=420), bar_t(k), gain=.25)
        else:
            put('bass', bass_note(b, BAR - .05, .5, fc=380), bar_t(k), gain=.23)
        continue
    for e8 in range(8):
        tb = bar_t(k) + e8 * BEAT / 2
        vel = .62 if e8 % 2 == 0 else .42
        put('bass', bass_note(b + (12 if e8 in (3, 7) else 0), BEAT / 2 * .82, vel, fc=600), tb, gain=.27)

# arpeggio (e-piano) through the stops, softer under the pillars
for k, c in enumerate(PROG):
    if k < 5 or k == 19: continue
    pat = CH[c]['arp']
    for e8 in range(8):
        tb = bar_t(k) + e8 * BEAT / 2
        vel = (.38 if e8 % 2 == 0 else .27) * (.75 if k >= 17 else 1)
        put('keys', epiano(pat[e8], vel, 1.2), tb, pan=-.35 if e8 % 2 else .35, gain=.30, rev=.35)

# drums
for k in range(5, 17):                    # stops: full but soft groove
    for bt in range(4):
        tb = bar_t(k) + bt * BEAT
        if bt in (0, 2): put('drums', kick(.85), tb, gain=.55)
        if bt in (1, 3): put('drums', clap(.5), tb, pan=.05, gain=.24, rev=.25)
        for s16 in range(4):
            v = (.22 if s16 == 2 else .12) * (1.15 if bt == 3 and s16 == 3 else 1)
            put('drums', hat(v), tb + s16 * BEAT / 4, pan=.25, gain=.55)
    if k == 16:                           # little lift into the pillars
        for s16 in range(8):
            put('drums', clap(.18 + .04 * s16), bar_t(k) + 2 * BEAT + s16 * BEAT / 4, gain=.18, rev=.2)
for k in (3, 4):                          # globe: heartbeat kick
    for bt in (0, 2):
        put('drums', kick(.6), bar_t(k) + bt * BEAT, gain=.45)
for k in (17, 18):                        # pillars: kick on 1 + light hats
    put('drums', kick(.7), bar_t(k), gain=.5)
    put('drums', kick(.45), bar_t(k) + 2.5 * BEAT, gain=.4)
    for e8 in range(8): put('drums', hat(.10), bar_t(k) + e8 * BEAT / 2 + BEAT / 4, pan=-.2, gain=.5)

# ---------------------------------------------------------------- sound design cues
inv_ioC = lambda y: (y / 4) ** (1 / 3) if y < .5 else 1 - (2 * (1 - y)) ** (1 / 3) / 2
# title
sparkle(.78, .45, [86, 90, 93, 98], vel=.20, count=6)                      # emblem glint
for k, (tm, note) in enumerate(zip(T['head'], (74, 78, 81))):           # headline lines land
    put('keys', epiano(note, .55, 1.8), tm + .16, pan=(-.2, 0, .2)[k], gain=.5, rev=.5)
    put('fx', whoosh(.42, .10, 600, 2600, .7, -.3, .3), tm - .12, gain=.8)
put('fx', pop(980, .14), T['name'] + .08, rev=.2)
base = T['stats']
put('fx', whoosh(.5, .12, 500, 2400, .6, .7, .2), base - .1)
for k in range(3): put('fx', pop(1150 + 120 * k, .16), base + .18 + k * .2 + .05, pan=.4, rev=.2)
for dtk in (.338, .435, .607): put('fx', tick(.10), base + dtk, pan=.45)  # slot-roll digit changes
for k, note in enumerate((81, 83, 86)): put('keys', glass(note, .32), base + .5 + k * .12 + .08, pan=.45, gain=.6, rev=.4)
# timeline nodes: ascending plucks exactly when the comet reaches each node
for i, note in enumerate((74, 76, 78, 81, 83, 86)):
    tn = T['lineA'] + (T['lineB'] - T['lineA']) * inv_ioC(i / 5)
    put('keys', epiano(note, .5, 1.4), tn + .02, pan=-.6 + .24 * i, gain=.55, rev=.45)
put('fx', whoosh(T['lineB'] - T['lineA'], .07, 300, 1800, .5, -.8, .8), T['lineA'])
# morph: riser -> impact as the globe forms
put('fx', riser(T['morphEnd'] - T['morph'] + .25, .30), T['morph'] - .4)
put('fx', impact(.75), 3 * BAR, rev=.6)
put('keys', bell(81, .45, 3.5), 3 * BAR + .02, gain=.5, rev=.6)
# pulse across the globe: a ping per city
PU = lambda i: np.arccos(1 - 2 * (i / 5)) / np.pi
for i, note in enumerate((81, 83, 86, 88, 90, 93)):
    put('keys', bell(note, .30, 2.4, ratio=2.0), T['pulse'] + (T['pulseEnd'] - T['pulse']) * PU(i), pan=-.5 + .2 * i, gain=.55, rev=.55)
# dock: zoom down into the first card
put('fx', whoosh(1.45, .22, 2600, 380, .35, .0, .0), T['dock'] + .1)
put('fx', impact(.45, .7), T['dockEnd'] - .02, rev=.4)
put('keys', bell(74, .5, 3.0), T['dockEnd'], gain=.5, rev=.5)
# each pan between stops: whoosh (R->L, cards travel left) + arrival bell
ARR_NOTE = {1: 79, 2: 74, 3: 83, 4: 78, 5: 76}
for i in range(1, 7):
    put('fx', whoosh(PAN + .25, .30, 320, 3400, .55, .75, -.75), ARR[i] - PAN - .1, gain=.9, rev=.15)
    if i <= 5:
        put('keys', bell(ARR_NOTE[i], .42, 3.0), ARR[i] - .01, pan=.15, gain=.55, rev=.5)
        put('fx', pop(1400, .07), ARR[i] + .02, pan=.1)
# pillars: slogan lines + four pops
for k, note in enumerate((62, 66, 69)):
    tl = ARR[6] - PAN * .75 + k * .2 + .35
    put('keys', epiano(note + 12, .55, 2.2), tl, gain=.45, rev=.5)
    put('keys', epiano(note, .45, 2.2), tl, gain=.35, rev=.5)
for k, note in enumerate((81, 83, 85, 88)):
    put('keys', glass(note, .35), ARR[6] + .55 + k * .16 + .06, pan=-.5 + .33 * k, gain=.7, rev=.5)
# finale: riser -> impact + resolve, comet sparkle, headline shine
put('fx', riser(1.6, .34), T['fin'] - 1.55)
put('fx', impact(.95), T['fin'], rev=.65)
for note in (62, 66, 69, 73, 76):
    put('keys', epiano(note, .5, 4.0), T['fin'] + .01, gain=.32, rev=.6)
put('keys', bell(86, .4, 4.0), T['fin'] + .02, gain=.45, rev=.7)
for i, note in enumerate((86, 88, 90, 93, 95, 98)):           # cards land
    put('fx', glass(note, .22), T['fin'] + .75 + i * .085, pan=-.6 + .24 * i, rev=.5)
for i, note in enumerate((74, 78, 81, 86, 90, 93)):           # comet runs the line
    put('keys', glass(note, .30, 2.0), T['fin'] + 1.75 + 2.1 * PU(i), pan=-.7 + .28 * i, gain=.7, rev=.6)
sparkle(T['fin'] + 2.4, 1.0, [93, 95, 98, 100], vel=.16, count=8)
# pillar scene: the wave comet touches each pillar icon
import json, os
tl = json.load(open(os.path.join(os.path.dirname(__file__), '..', 'audio', 'timeline.json')))
for k, (tp, note) in enumerate(zip(tl['WAVE_PASS'], (81, 85, 88, 93))):
    put('fx', glass(note, .26, 1.6), tp + .05, pan=-.6 + .4 * k, rev=.55)

# ---------------------------------------------------------------- mix
if '--stems' in sys.argv:
    np.save('/tmp/claude-0/-home-user/5fa49a95-e97c-5e91-987b-5b8fe05a5f75/scratchpad/keys.npy', bus['keys'][0].astype(np.float32))
    for k, v in list(bus.items()) + [('send', send)]:
        f, P = sg.welch(v[0], SR, nperseg=8192)
        band = (f > 650) & (f < 1000)
        print(k, 'rms', float(np.sqrt((v ** 2).mean())), 'peak bin 650-1000Hz', float(f[band][np.argmax(P[band])]), 'ratio', float(P[band].max() / (np.median(P[band]) + 1e-20)))
    sys.exit()
def reverb_ir(sec=2.8, pre=.022):
    n = int(sec * SR); t = np.arange(n) / SR
    dec = np.exp(-t * 6.9 / sec)
    ir = rng.standard_normal((2, n)) * dec
    ir = np.vstack([lowpass(ir[0], 5200, 1), lowpass(ir[1], 4800, 1)])
    ir[:, :int(.004 * SR)] *= np.linspace(0, 1, int(.004 * SR))
    ir = np.hstack([np.zeros((2, int(pre * SR))), ir])
    return ir / np.sqrt((ir ** 2).sum(axis=1, keepdims=True))

ir = reverb_ir()
wet = np.vstack([sg.fftconvolve(send[0], ir[0])[:N], sg.fftconvolve(send[1], ir[1])[:N]])
wet = highpass(wet, 180, 1) if wet.ndim == 1 else np.vstack([highpass(wet[0], 180, 1), highpass(wet[1], 180, 1)])

# gentle sidechain: pads/bass/keys breathe with the stop-section kicks
duck = np.ones(N)
for k in range(5, 17):
    for bt in (0, 2):
        i0 = int((bar_t(k) + bt * BEAT) * SR); n = int(.42 * SR)
        e = 1 - .28 * np.exp(-np.arange(n) / SR / .11)
        duck[i0:i0 + n] = np.minimum(duck[i0:i0 + n], e[:max(0, min(n, N - i0))])
mix = (bus['pad'] * duck * 1.0 + bus['bass'] * duck * .9 + bus['keys'] * (.6 + .4 * duck) +
       bus['drums'] * .9 + bus['fx'] * 1.0 + wet * .55)
mix = np.vstack([highpass(mix[0], 30), highpass(mix[1], 30)])
def biquad(kind, f0, gain_db, q=.707):
    A = 10 ** (gain_db / 40); w0 = 2 * np.pi * f0 / SR; al = np.sin(w0) / (2 * q); c = np.cos(w0)
    if kind == 'peak':
        b = [1 + al * A, -2 * c, 1 - al * A]; a = [1 + al / A, -2 * c, 1 - al / A]
    else:  # high shelf
        sq = 2 * np.sqrt(A) * al
        b = [A * ((A + 1) + (A - 1) * c + sq), -2 * A * ((A - 1) + (A + 1) * c), A * ((A + 1) + (A - 1) * c - sq)]
        a = [(A + 1) - (A - 1) * c + sq, 2 * ((A - 1) - (A + 1) * c), (A + 1) - (A - 1) * c - sq]
    b = np.array(b) / a[0]; a = np.array(a) / a[0]; return b, a
for kind, f0, g, q in (('peak', 2600, 2.0, .8), ('shelf', 5200, 2.5, .707), ('peak', 180, -1.5, .9)):
    b, a = biquad(kind, f0, g, q); mix = np.vstack([sg.lfilter(b, a, mix[0]), sg.lfilter(b, a, mix[1])])
# fades
fi = np.clip(np.arange(N) / (.03 * SR), 0, 1)
fo = np.clip((DUR - np.arange(N) / SR) / 1.6, 0, 1) ** 1.5
mix *= fi * fo
# soft clip / glue
pk = np.abs(mix).max(); mix = mix / pk * .89
mix = np.tanh(mix * 1.15) / np.tanh(1.15)
out = sys.argv[1] if len(sys.argv) > 1 else 'audio/score_raw.wav'
pcm = (np.clip(mix, -1, 1).T * 32767).astype(np.int16)
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('wrote', out, 'peak', float(np.abs(mix).max()))
