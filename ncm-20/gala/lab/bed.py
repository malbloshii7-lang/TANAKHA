# The 12 s music bed for the 3D look test: the working day's drive as the film has it on the rail beat (the chords,
# the strings in eighths, the Ayyala with the takhamir in steady eighths), and the diesel, loudest as the locomotive
# passes the camera (about 8.6 s). Built from score.py's own helpers.
import sys
import numpy as np
sys.path.insert(0, __import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)), '..'))
import audio as A
import score as S
L = 12.0
music, perc, sfx = A.Bus(L + 3), A.Bus(L + 3), A.Bus(L + 3)
d0 = S.BAR / 2  # the drums come in on the first downbeat after the takhmeera
S.chord(music, S.Dmaj, 0.0, d0 + 0.2, gain=0.3, bright=2000, attack=0.4)
k, t = 0, d0
while t < L:
    S.chord(music, [S.Dmaj, S.Bm, S.G, S.Amaj][k % 4], t, S.BAR * 1.02, gain=0.34, bright=2600, attack=0.3, release=0.6)
    for e in range(8):
        te = t + e * S.BEAT / 2
        if te < L - 0.2:
            music.add(A.strings([S.D3, S.A3, S.D4, S.A3, S.D3 + 7, S.A3, S.D4, S.A3][e] + (0 if k % 2 == 0 else -2), S.BEAT * 0.45, bright=2400, attack=0.02, release=0.2, voices=3), te, 0.3)
    k, t = k + 1, t + S.BAR
S.takhmeera(perc, d0, 'mf')
S.play(perc, S.AYYALA + [(i, 'stick', 0.3) for i in (0, 4, 8, 12)], d0, d0, L - 0.3, 'mf')
dz = S.diesel_far(15.0, gain=1.6)  # its swell peaks at 7.5 s into the sound; start it so the peak lands on the pass
sfx.add(dz, 8.6 - 7.5, pan=0.1)
m = A.reverb(music.stereo(), rt60=3.4, wet=0.3) + A.reverb(A.hp(perc.stereo(), 40, 2), rt60=1.8, wet=0.18) + A.reverb(sfx.stereo(), rt60=1.6, wet=0.12) * 0.9
n = int(L * A.SR); m = m[:, :n]
fi, fo = int(0.4 * A.SR), int(1.2 * A.SR)
m[:, :fi] *= np.linspace(0, 1, fi); m[:, -fo:] *= np.linspace(1, 0, fo) ** 2
A.write_wav(sys.argv[1], A.master(m, target_lufs=-16.0, ceiling_db=-1.0))
print('bed', A.lufs(A.master(m, target_lufs=-16.0, ceiling_db=-1.0)))
