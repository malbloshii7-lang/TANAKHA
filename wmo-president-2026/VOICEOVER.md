# Narration

**The current narration** is for the feed cut (59.5 s). A narrator reads it in the third person.
- **Voice:** an AI voice, Higgsfield Seed Audio, preset voice "Holden", at speech rate +15. It was generated on
  2 October 2026, job `cc210413-e4b1-4d4e-a25d-97feb6a603c5`.
- **Pace:** 34.6 s for 87 words.
- **No impersonation:** the President does not appear in the film, and the voice does not speak as him.
- **Facts:** every one is in `SOURCES.md`.
- **The text:** in `voiceover.json`, which the build reads. Each line there has its cue, its slot and its Arabic.

| # | Starts at | Slot | Line |
|---|---|---|---|
| 1 | 0:00.3 | 4.3 s | Four weeks. Three of WMO's regions. Six countries. |
| 2 | 0:04.6 | 8.6 s | At Lake Issyk-Kul, Kyrgyzstan's weather service turned one hundred. In Bishkek: glaciers, dust storms and rivers. |
| 3 | 0:14.5 | 10 s | In Tonga, ministers adopted a new declaration for early warnings, and His Royal Highness the Crown Prince received the WMO President. |
| 4 | 0:25.6 | 9.4 s | In Wellington, Melbourne and Jakarta: the forecast and warning rooms that never close. |
| 5 | 0:36.6 | 9.4 s | In Bucharest, Europe's services turned to the work ahead: early warnings for all. |
| 6 | 0:50.7 | 5.4 s | Early warnings for everyone on Earth, by the end of 2027. |
| 7 | 0:56.4 | 2.6 s | With thanks to every host. |

## How the narration goes into the film

- The generated read is one WAV file. It is cut at its pauses into `vo/line-1.wav` … `vo/line-7.wav`, which are not
  committed.
- `score.py --vo vo/` then:
  - trims each line and sets it to one level;
  - places it on its cue;
  - lowers the music and the places 9 dB under it;
  - writes the captions in English and Arabic from the times each line actually runs.
- A line longer than its slot is reported; nothing is ever sped up silently.

## The first-person script (not used)

The first version of this file was a 93 s script for the President to record himself, in the first person. The
requester chose instead a film in which he does not appear, read by a narrator. That script is in the git history (commit
b755407).
