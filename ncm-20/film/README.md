# Reading the Sky — the NCM at Twenty film

A 1:54 film for the 20th anniversary of the UAE National Center of Meteorology (March 2027),
companion to the [NCM at Twenty](../index.html) page. It is drawn like an engraved plate on
parchment: chapter labels in Roman numerals, large inscriptional claims in the voice of the
nation ("we"), an Arabic line under each, a typewriter caption, and line illustrations that
draw themselves. An original, synthesized, up-tempo score runs underneath.

The film has three movements:
- **Heritage (I–IV):** how the people of this coast read the sky before there was a center.
- **The Center and the economy (V–IX):** the airports, sea ports, energy and society the
  Center keeps running.
- **Rain and the world (X–XIII):** rain enhancement, its science, and the world it is shared with.

| File | What it is |
|---|---|
| `ncm-20-reading-the-sky.mp4` | The film: 1920×1080, 30 fps, H.264 + AAC stereo, 1:54 |
| `film.html` | The film as code. A canvas animation where every frame is a pure function of time. Open it in a browser to watch it live (silent; click to restart, `?t=45` starts at 0:45) |
| `render.js` | Renders `film.html` frame by frame in headless Chromium and pipes the frames to ffmpeg |
| `score.py` | Synthesizes the score (no samples, royalty-free) at 120 BPM, so every chapter cut lands on a downbeat |

## Chapters

| Time | Chapter | Headline | On screen | Facts used |
|---|---|---|---|---|
| 0:00 | Prologue · المقدمة | READING THE SKY · قراءة السماء | Suhail over a horizon | — |
| 0:06 | I · Al Durour · الدرور | We counted the year by a star. | A 36-petal Durour wheel; Suhail rises; the five "stolen days" | 36 × 10 days + 5, counted from Suhail's rising |
| 0:14 | II · Al Mawsim · الموسم | We sailed by the monsoon. | A dhow, a compass rose, the monsoon, a star measured in *isbaʿ* | Ibn Majid of Julfar; *Kitab al-Fawaʾid*, c. 1490 (895 AH); Aden to East Africa on days 320–330 of the Nayruz year |
| 0:22 | III · Al Ghous · الغوص | We knew every wind by name. | A wind rose over a pearling sea | Shamal, Kaus, Suhaili, Nashi; the great dive, June–September |
| 0:30 | IV · Al Aflaj · الأفلاج | We carried water through the desert. | A falaj in section, feeding an oasis | Hili, Al Ain, Iron Age; UNESCO World Heritage 2011 |
| 0:38 | V · Al Markaz · المركز | Then we built a center to read the sky. | Radar scope and tower, anemometer, a logbook | Federal Decree-Law No. 6 of 2007; 254.8 mm (16 Apr 2024; WAM, with the decimal from Gallagher Re citing NCM), 51.8 °C (1 Aug 2025), −5.7 °C (3 Feb 2017) |
| 0:46 | VI · Al Matarat · المطارات | We read the sky for every flight. | Fog lifts off a runway; a jet departs past the tower | NCM's 24-hour aviation weather watch over 10 UAE airports; aviation including aviation-enabled tourism 18.2% of UAE GDP (IATA, 2023 data; direct aviation alone 5.3%); Zayed International about 24 fog days a year (1983–2018) |
| 0:54 | VII · Al Mawani · الموانئ | We read the sea for every ship. | A crane loads a container ship; a buoy rides the swell | Al Bahar 5-day marine forecasts since 2018; UAE ports ~21 million TEU (2023); Cyclone Shaheen red alert, 3 Oct 2021, 10 ft waves offshore |
| 1:02 | VIII · Al Taqa · الطاقة | We forecast the sun and the wind. | The sun crosses a solar field; turbines turn; a pyranometer | NCM forecasts for solar plants and wind farms; UAE renewables 6 GW (2024); WMO–IRENA clean-energy workshop hosted by NCM, Abu Dhabi, July 2024 |
| 1:10 | IX · Al Mujtamaʿ · المجتمع | We watch over every home. | A storm warning ripples out from the forecast and lights the phones below | Forecast on 11 Apr 2024, red "Take Action" alert on 16 Apr 2024; NCM's UAE Weather app warnings (fog, rain, sea); WMO: 24 hours' notice can cut damage by 30% |
| 1:18 | X · Al Istimtar · الاستمطار | We asked the clouds for more. | A seeding aircraft under a cumulus, flares, then rain | First trial 1982; nationwide since 2010; 311 missions in 2022; salt flares (NaCl, KCl) |
| 1:26 | XI · Al ʿIlm · العلم | We funded the science of rain. | A plate of four figures: nanomaterial, charge drone, laser, machine learning | UAEREP since 2015; 17 projects in 6 cycles; 8 patents |
| 1:34 | XII · Al ʿĀlam · العالم | Now we share it with the world. | A turning globe; arcs to Geneva, Turkistan, Morocco and Lahore | WMO presidency 2023–2027; Kazakhstan pilot 2026; Morocco 2025; Lahore 2023; UN 2026 Water Conference, Abu Dhabi, 8–10 December |
| 1:42 | XIII · Al Ghad · الغد | Twenty years of reading the sky. | A rain gauge graduated 2007–2027, filling in the rain | 2007–2027; March 2027 |

Facts in chapters I–V and X–XIII come from the sources cited on the NCM at Twenty page
(`../index.html`). Chapters VI–IX were checked separately against the sources below.

### Sources for chapters VI–IX

- **VI · Airports**
  - AvMet, NCM's aviation meteorology service: [avmet.ae](https://www.avmet.ae/) (24-hour watch; forecast and observation offices at 10 airports).
  - UAE AIP GEN 3.5, which names NCM as the Meteorological Watch Office for the Emirates FIR: [gcaa.gov.ae](https://www.gcaa.gov.ae/en/ais/AIPHtmlFiles/AIP/Current/AIRACs/2026-P02/pdf/GEN-3.5.pdf).
  - IATA, *The Value of Air Transport to the UAE*: [press release, 16 Apr 2025](https://www.iata.org/en/pressroom/2025-releases/2025-04-16-01/).
  - Weston et al., *Journal of Applied Meteorology and Climatology* 60(2), 2021, fog at Abu Dhabi International, 1983–2018: [journals.ametsoc.org](https://journals.ametsoc.org/view/journals/apme/60/2/JAMC-D-20-0168.1.xml).
- **VII · Sea ports**
  - The National, 22 Oct 2018, launch of Al Bahar: [thenationalnews.com](https://www.thenationalnews.com/uae/environment/uae-launches-local-marine-weather-service-1.783260).
  - Ministry of Energy and Infrastructure, 23 Jun 2025 (~21 million TEU in 2023): [moei.gov.ae](https://www.moei.gov.ae/en/media-center/news/23/6/2025/uae-advances-as-global-maritime-power-through-system-of-legislation-investments).
  - Khaleej Times, 3 Oct 2021, Cyclone Shaheen red alert: [khaleejtimes.com](https://www.khaleejtimes.com/uae/uae-cyclone-shaheen-expected-to-weaken-before-hitting-eastern-coast).
- **VIII · Energy**
  - Abu Dhabi Department of Energy, 26 Jan 2025 (NCM's forecasts for wind farms and solar plants): [doe.gov.ae](https://doe.gov.ae/Media-Centre/News/Chairman-of-the-Department-of-Energy-Visits-the-National-Center-of-Meteorology).
  - WAM, 11 Jan 2026 (renewables 3.1 GW in 2022, 6 GW in 2024): [wam.ae](https://www.wam.ae/en/article/by6agw3-amna-dahak-uae-leads-new-era-renewable-energy).
  - WMO, July 2024, the clean-energy workshop hosted by NCM: [public.wmo.int](https://public.wmo.int/media/update/forging-global-partnership-support-clean-energy-transition).
- **IX · Society**
  - Sharjah 24 / WAM, 11 Apr 2024, the forecast: [sharjah24.ae](https://sharjah24.ae/en/Articles/2024/04/11/NCM-Unstable-weather-from-Sunday-until-Wednesday).
  - Aletihad, 16 Apr 2024, the red alert: [en.aletihad.ae](https://en.aletihad.ae/news/uae/4479274/national-center-of-meteorology-issues--red--warning-due-to-h).
  - The UAE Weather app listing: [App Store](https://apps.apple.com/us/app/weather-uae/id497964984).
  - WMO, 7 Nov 2022, 24 hours' notice cutting damage by 30%: [wmo.int](https://wmo.int/news/media-centre/early-warnings-all-action-plan-unveiled-cop27).

The economy figures (GDP share, TEU, GW) describe the size of each sector. They are not NCM
achievements, and the film does not present them as such.

## Rebuild

```bash
pip install numpy scipy imageio-ffmpeg
python3 score.py score.wav

# needs Playwright with Chromium (NODE_PATH may point at a global install)
export FFMPEG=$(python3 -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())")
node render.js film ncm-20-reading-the-sky.mp4 score.wav   # 3,420 frames
node render.js preview stills 13 24 35                     # PNG stills at those seconds
```

## Editing

- **Words** live in each `scene({ … })` block in `film.html`: `kicker` (the caption), `head`
  (headline lines), `accent` (the one colored word), `arHead` (the Arabic line), `readout`
  (top right) and the `note(…)` calls (small italic marginalia).
- **Timing** is `start`, `dur` and `speed` per scene, on a 120 BPM grid (one bar = 2 s). If you
  retime a scene, move the matching bars in `score.py` (`PLAN`, `DRIVE`, the section loops) and
  the sound-effect cue times (the jet at 49.2 s, the alert tones from 72.2 s, the seeding
  aircraft at 79.0 s, the rain) so the music still turns on the cuts.
- **Before public release:**
  - Give the Arabic lines a native editorial pass.
  - Confirm the anniversary date. The public record dates the founding decree-law to
    13 November 2007; March 2027 follows NCM's own date.
