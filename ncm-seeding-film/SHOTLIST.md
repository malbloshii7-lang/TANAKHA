# NCM Cloud Seeding — Shot List

**Film:** *The Order Travels* — National Center of Meteorology hygroscopic seeding mission, Al Ain.

**Look:** Cinematic high-end stylized 3D cartoon in the Thunder aesthetic — refined cel-shaded
surfaces, crisp illustrated linework, soft volumetric light, calm institutional grace. No
exaggeration, no cartoon physics.

**Delivery:** 12 shots × 10 s = 120 s, 16:9, silent (no generated audio — kept clean for a
single scored mix in post).

**Model:** `kling3_0` (Kling v3.0), `mode: pro`, `duration: 10`, `aspect_ratio: 16:9`, `sound: off`.

Every prompt is prefixed with the house style line so the twelve shots read as one film:

> Cinematic high-end stylized 3D cartoon film, refined cel-shaded surfaces, crisp illustrated
> linework, soft volumetric light, calm institutional grace, realistic physics, no exaggeration.

## Sequence

| # | Beat | Shot |
|---|------|------|
| 01 | Headquarters | Establishing push-in on the NCM HQ in Shawamekh, late-afternoon light, roof dishes and radomes catching the sun |
| 02 | Forecast Office | Interior, curved radar wall in blue light; operators in kandura and ghutra; the senior forecaster reads the convective cells over Al Ain and gives the order |
| 03 | The order travels | Female officer in black abaya on the radio handset; screen reads `AL AIN AIRPORT — SEEDING FLIGHT PREPARATION — STATUS: READY` |
| 04 | Apron 5 | Low three-quarter tracking shot, King Air C90 in NCM livery taxiing the yellow centerline |
| 05 | Roll and rotate | Three-quarter exterior tracking shot on runway 01/19, nose wheel lifts, aircraft leaves the ground |
| 06 | Cockpit | Over the captain's shoulder — hands on the yoke, runway sliding away beneath the windshield |
| 07 | Climb-out | Rear three-quarter air-to-air, gear folding into the nacelles, bank with visible aileron and rudder deflection |
| 08 | Cruise | Long held air-to-air past the ridge of Jebel Hafeet toward the Hajar mountains, layered haze |
| 09 | The release | Cockpit close shot beneath the convective cells; the pilot presses the discrete flare release |
| 10 | The flares | Oval cabin window onto the wing racks — cylindrical hygroscopic flares igniting one by one, white-grey plumes drawn up into the cloud base. No flames, no rockets |
| 11 | Return | Descent under the seeded weather, final approach, touchdown with honest spray and reflection |
| 12 | Rest | Slow taxi back to Apron 5, cabin-window view of hangars and wet desert light, propellers wind down |

## Technical notes

- **Resolution.** The brief asks for 8K. No model in the catalogue renders 8K; `kling3_0` tops out
  at its `4k` mode, and `pro` was chosen instead for cost. Master the twelve clips at their native
  resolution and upscale in post if an 8K deliverable is required.
- **Audio.** Generated per-shot audio would not match across twelve independent renders, so every
  clip is rendered silent and the film is intended to be scored as one piece.
- **Assembly.** `assemble.sh` concatenates the downloaded shots in order into `ncm-seeding-film.mp4`.
