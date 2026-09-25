# Reading the Sky — the NCM at Twenty film

A 1:46 film for the 20th anniversary of the UAE National Center of Meteorology (March 2027),
companion to the [NCM at Twenty](../index.html) page. It is drawn like an engraved plate on
parchment: chapter labels in Roman numerals, large inscriptional claims in the voice of the
nation ("we"), an Arabic line under each, a typewriter caption, and line illustrations that
draw themselves, over an original synthesized score.

| File | What it is |
|---|---|
| `ncm-20-reading-the-sky.mp4` | The film: 1920×1080, 30 fps, H.264 + AAC stereo, 1:46 |
| `film.html` | The film as code. A canvas animation where every frame is a pure function of time. Open it in a browser to watch it live (silent; click to restart, `?t=45` starts at 0:45) |
| `render.js` | Renders `film.html` frame by frame in headless Chromium and pipes the frames to ffmpeg |
| `score.py` | Synthesizes the score (no samples, royalty-free), cut to the chapter changes |

## Chapters

| Time | Chapter | Headline | On screen | Facts used |
|---|---|---|---|---|
| 0:00 | Prologue · المقدمة | READING THE SKY · قراءة السماء | Suhail over a horizon | — |
| 0:05 | I · Al Durour · الدرور | We counted the year by a star. | A 36-petal Durour wheel; Suhail rises; the five "stolen days" | 36 × 10 days + 5, counted from Suhail's rising |
| 0:16 | II · Al Mawsim · الموسم | We sailed by the monsoon. | A dhow, a compass rose, the monsoon, a star measured in *isbaʿ* | Ibn Majid of Julfar; *Kitab al-Fawaʾid*, c. 1490 (895 AH); Aden to East Africa on days 320–330 of the Nayruz year |
| 0:27 | III · Al Ghous · الغوص | We knew every wind by name. | A wind rose over a pearling sea | Shamal, Kaus, Suhaili, Nashi; the great dive, June–September |
| 0:38 | IV · Al Aflaj · الأفلاج | We carried water through the desert. | A falaj in section, feeding an oasis | Hili, Al Ain, Iron Age; UNESCO World Heritage 2011 |
| 0:49 | V · Al Markaz · المركز | Then we built a center to read the sky. | Radar scope and tower, anemometer, a logbook | Federal Decree-Law No. 6 of 2007; 254.8 mm (16 Apr 2024), 51.8 °C (1 Aug 2025), −5.7 °C (3 Feb 2017) |
| 1:00 | VI · Al Istimtar · الاستمطار | We asked the clouds for more. | A seeding aircraft under a cumulus, flares, then rain | First trial 1982; nationwide since 2010; 311 missions in 2022; salt flares (NaCl, KCl) |
| 1:11 | VII · Al ʿIlm · العلم | We funded the science of rain. | A plate of four figures: nanomaterial, charge drone, laser, machine learning | UAEREP since 2015; 17 projects in 6 cycles; 8 patents |
| 1:22 | VIII · Al ʿĀlam · العالم | Now we share it with the world. | A turning globe; arcs to Geneva, Turkistan, Morocco and Lahore | WMO presidency 2023–2027; Kazakhstan pilot 2026; Morocco 2025; Lahore 2023; UN 2026 Water Conference, Abu Dhabi, 8–10 December |
| 1:33 | IX · Al Ghad · الغد | Twenty years of reading the sky. | A rain gauge graduated 2007–2027, filling in the rain | 2007–2027; March 2027 |

Every fact comes from the sources cited on the NCM at Twenty page (`../index.html`).

## Rebuild

```bash
pip install numpy scipy imageio-ffmpeg
python3 score.py score.wav

# needs Playwright with Chromium (NODE_PATH may point at a global install)
export FFMPEG=$(python3 -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())")
node render.js film ncm-20-reading-the-sky.mp4 score.wav   # ~3,180 frames
node render.js preview stills 13 24 35                     # PNG stills at those seconds
```

## Editing

- **Words** live in each `scene({ … })` block in `film.html`: `kicker` (the caption), `head`
  (headline lines), `accent` (the one colored word), `arHead` (the Arabic line) and `readout`
  (top right).
- **Timing** is `start` and `dur` per scene. If you retime, update `CHAPTERS` (and `WORDS` if a
  headline's word count changes) in `score.py` so the drum, bell and word taps stay on the cuts.
- **Before public release:** give the Arabic lines a native editorial pass, and confirm the
  anniversary date (the public record dates the founding decree-law to 13 November 2007;
  March 2027 follows NCM's own date).
