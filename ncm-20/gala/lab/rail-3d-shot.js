// The Etihad Rail hero scene: one shot chain, three beats, 10 bars at 72 BPM (read by lab/rail-3d.js for the picture and
// by lab/bed.py for the sound, so the bass, the drums and the diesel are placed from the same numbers the camera uses).
//   Beat 1 (shot A, 0-10 s): the Hajar and the saddle in the ranges on a long lens (450 mm on a full-frame camera,
//     widening to 330 mm) from outside the fence; the camera pans down the ranges to find the train emerging at their
//     foot, 1.4 km out.
//     A low bass under the wind; the label and the headline.
//   Cut on the drum downbeat at 10.0 s.
//   Beat 2 (shot B, 10-20 s): a worm's-eye camera at the foot of the embankment, 11 m from the near track and 0.5 m
//     above the ground, holds its composition while the locomotive towers past (its engine abeam at about 18.8 s);
//     the Emirati drums over the diesel.
//   Beat 3 (shot B continues, 20-33.3 s): the drums' last stroke, then silence as the camera rises to an epic wide
//     (45 m up, oblique, never overhead): the whole train stretching back toward the mountains, held.
// World: x east, y north, z up (m); the near track's centre line is y = 0, its rail tops at z = 2.8; the fence at y = -22.
// Keys: time t (s), camera position C, look-at point L, focal length f (px on a 1920-wide frame); ease: the camera is at
// rest at that key. The train runs west at 80 km/h (22.2 m/s); head0 is its front's x at the shot's first frame.
// downbeat0: the first downbeat of the scene's bar grid (the scene starts on a bar line of the film).
const R3_SHOT = {
  "dur": 33.3333, "cut": 10.0, "rise": 20.0, "v": 22.2, "bpm": 72, "downbeat0": 0.0,
  "shots": [
    { "t0": 0.0, "t1": 10.0, "head0": 1500,
      "keys": [
        { "t": 0.0, "C": [-60, -36, 4.5], "L": [1930.6, -227.7, 32.4], "f": 24000, "ease": true },
        { "t": 2.5, "C": [-60, -36, 4.5], "L": [1930.6, -227.7, 32.4], "f": 24000, "ease": true },
        { "t": 7.5, "C": [-60, -36, 4.5], "L": [1939.5, 2.4, 26.8], "f": 17500, "ease": true },
        { "t": 10.0, "C": [-60, -36, 4.5], "L": [1939.5, 4.1, 26.1], "f": 18200, "ease": true } ] },
    { "t0": 10.0, "t1": 33.3333, "head0": 141.4,
      "keys": [
        { "t": 10.0, "C": [-40, -11, 0.5], "L": [35.2, 52.1, 19.6], "f": 1100, "ease": true },
        { "t": 20.0, "C": [-40, -11, 0.5], "L": [35.2, 52.1, 19.6], "f": 1100, "ease": true },
        { "t": 23.0, "C": [-46, -22, 9.0], "L": [60, 30, 6], "f": 1150 },
        { "t": 26.0, "C": [-66, -60, 26.0], "L": [150, 15, 2], "f": 1250 },
        { "t": 29.0, "C": [-90, -100, 45.0], "L": [250, 6, 0], "f": 1350, "ease": true },
        { "t": 33.3333, "C": [-90, -100, 45.0], "L": [250, 6, 0], "f": 1350, "ease": true } ] }
  ]
};
