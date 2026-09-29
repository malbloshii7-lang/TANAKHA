# QC of the 4K 50p LED masters

Measured on the encoded files by `qc/masters_qc.py`.

| File | Frames | fps | Colour (colr) | Keyframes | A/V Δ ms | Loudness LUFS | True peak dBTP |
|---|---|---|---|---|---|---|---|
| `hold-a-4k50.mp4` | 1000 | 50 | BT.709 limited | 1 | 21.3 | -24.0 | -12.5 |
| `hold-b-4k50.mp4` | 1000 | 50 | BT.709 limited | 1 | 21.3 | -24.0 | -12.5 |
| `hold-c-4k50.mp4` | 1000 | 50 | BT.709 limited | 1 | 21.3 | -24.0 | -12.5 |
| `hold-world-4k50.mp4` | 600 | 50 | BT.709 limited | 1 | 21.3 | -20.0 | -6.7 |
| `hold-world-pull-4k50.mp4` | 600 | 50 | BT.709 limited | 1 | 21.3 | -20.0 | -8.1 |
| `part1-4k50-restrained.mp4` | 7083 | 50 | BT.709 limited | 31 | 14.7 | -16.5 | -2.5 |
| `part1-4k50.mp4` | 7083 | 50 | BT.709 limited | 31 | 14.7 | -16.4 | -1.3 |
| `part1-pull-4k50-restrained.mp4` | 6833 | 50 | BT.709 limited | 30 | 1.3 | -16.6 | -1.3 |
| `part1-pull-4k50.mp4` | 6833 | 50 | BT.709 limited | 30 | 1.3 | -16.5 | -1.6 |
| `part2-4k50-restrained.mp4` | 1084 | 50 | BT.709 limited | 6 | 16.0 | -13.8 | -1.2 |
| `part2-4k50.mp4` | 1084 | 50 | BT.709 limited | 6 | 16.0 | -14.0 | -0.8 |

## Seams and cuts (8-bit levels, mean absolute difference)

| Pair | Luma mean | RGB mean | RGB p99 | Unchanged pixels |
|---|---|---|---|---|
| hold-world-4k50.mp4 loop point (last -> first) | 0.0001 | 0.0001 | 0 | 99.99% |
| hold-world-4k50.mp4 neighbouring step (second-last -> last) | 0.0 | 0.0 | 0 | 100.0% |
| hold-world-pull-4k50.mp4 loop point (last -> first) | 0.0001 | 0.0001 | 0 | 99.99% |
| hold-world-pull-4k50.mp4 neighbouring step (second-last -> last) | 0.0 | 0.0 | 0 | 100.0% |
| hold-a-4k50.mp4 loop point (last -> first) | 0.0051 | 0.0066 | 0 | 99.3% |
| hold-a-4k50.mp4 neighbouring step (second-last -> last) | 0.0013 | 0.0015 | 0 | 99.91% |
| hold-b-4k50.mp4 loop point (last -> first) | 0.0055 | 0.0071 | 0 | 99.23% |
| hold-b-4k50.mp4 neighbouring step (second-last -> last) | 0.0013 | 0.0014 | 0 | 99.91% |
| hold-c-4k50.mp4 loop point (last -> first) | 0.002 | 0.0025 | 0 | 99.72% |
| hold-c-4k50.mp4 neighbouring step (second-last -> last) | 0.0008 | 0.0009 | 0 | 99.93% |
| part1-4k50.mp4 last -> hold-world-4k50.mp4 first | 0.7989 | 0.9454 | 6 | 30.01% |
| hold-world-4k50.mp4 last -> part2-4k50.mp4 first | 0.9196 | 1.0649 | 5 | 23.37% |
| floor: part1-4k50.mp4 last -> part2-4k50.mp4 first (two separate encodes) | 1.1262 | 1.1957 | 7 | 27.96% |
| part1-pull-4k50.mp4 last -> hold-world-pull-4k50.mp4 first | 0.8058 | 0.9443 | 6 | 29.09% |
| hold-world-pull-4k50.mp4 last -> part2-4k50.mp4 first | 0.9927 | 1.1393 | 6 | 21.15% |
| floor: part1-pull-4k50.mp4 last -> part2-4k50.mp4 first (two separate encodes) | 1.1791 | 1.2433 | 7 | 27.8% |
| part2-4k50.mp4 neighbouring step (second-last -> last) | 0.0267 | 0.0273 | 0 | 99.2% |
| part2-4k50.mp4 last -> hold-a-4k50.mp4 first | 0.4167 | 0.5341 | 4 | 48.92% |
| part2-4k50.mp4 last -> hold-b-4k50.mp4 first | 4.5731 | 4.5743 | 158 | 47.52% |
| part1-4k50.mp4 across its keyframe at frame 6472 | 0.7867 | 0.8609 | 4 | 36.16% |
| part1-4k50.mp4 the step before it (frame 6470 -> 6471) | 0.0036 | 0.0049 | 0 | 99.5% |
| part1-4k50.mp4 across its keyframe at frame 6722 | 1.0075 | 1.079 | 7 | 33.13% |
| part1-4k50.mp4 the step before it (frame 6720 -> 6721) | 0.0847 | 0.0849 | 2 | 97.92% |
| part1-4k50.mp4 across its keyframe at frame 6972 | 1.853 | 1.9074 | 27 | 34.57% |
| part1-4k50.mp4 the step before it (frame 6970 -> 6971) | 1.2169 | 1.218 | 28 | 88.1% |

## WAVs

| File | Loudness LUFS | LRA LU | True peak dBTP |
|---|---|---|---|
| `audio/hold-world-pull.wav` | -20.0 | 2.7 | -8.1 |
| `audio/hold-world.wav` | -19.9 | 3.3 | -6.7 |
| `audio/hold.wav` | -24.0 | 1.5 | -12.3 |
| `audio/part1-pull-restrained.wav` | -16.6 | 8.4 | -1.3 |
| `audio/part1-pull.wav` | -16.5 | 7.9 | -1.5 |
| `audio/part1-restrained.wav` | -16.5 | 8.6 | -2.5 |
| `audio/part1.wav` | -16.4 | 8.2 | -1.3 |
| `audio/part2-restrained.wav` | -13.9 | 6.8 | -1.3 |
| `audio/part2.wav` | -14.1 | 6.8 | -1.1 |

## Photosensitivity pre-check (ITU-R BT.1702 model; not a certified Harding test)

| File | Max flashes in any 1 s | Max concurrent transition area | Red flashes | Result |
|---|---|---|---|---|
| `hold-a-4k50.mp4` | 0.0 | 0.0% | 0.0 | pass |
| `hold-b-4k50.mp4` | 0.0 | 0.0% | 0.0 | pass |
| `hold-c-4k50.mp4` | 0.0 | 0.0% | 0.0 | pass |
| `hold-world-4k50.mp4` | 0.0 | 0.0% | 0.0 | pass |
| `hold-world-pull-4k50.mp4` | 0.0 | 0.0% | 0.0 | pass |
| `part1-4k50.mp4` | 0.0 | 4.3% | 0.0 | pass |
| `part1-pull-4k50.mp4` | 0.0 | 4.4% | 0.0 | pass |
| `part2-4k50.mp4` | 0.0 | 2.7% | 0.0 | pass |
