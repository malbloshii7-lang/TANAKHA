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
| 0:06 | I · Al Durour · الدرور | We counted the year by a star. | A 36-petal Durour wheel turning through the year; Suhail rises; the five "stolen days" | 36 × 10 days + 5, counted from Suhail's rising |
| 0:14 | II · Al Mawsim · الموسم | We sailed by the monsoon. | A late-15th-century Gulf ship: double-ended and sewn-plank (stitched seams, through-beam ends), a straight raked stem, a central sternpost rudder with an aft tiller, a four-sided palm-mat sail on an oblique yard, a grapnel anchor; the compass rose turns like the sky about the North Star; the monsoon; a star measured in *isbaʿ* | Ibn Majid of Julfar; *Kitab al-Fawaʾid*, c. 1490 (895 AH); Aden to East Africa on days 320–330 of the Nayruz year |
| 0:22 | III · Al Ghous · الغوص | We knew every wind by name. | A wind rose over the pearl banks: a sambuk at anchor (two masts, the sail spread as an awning, oars out); a diver on the bed on his lifeline, held by his hauler at the rail, reaches for an open oyster while the stone weight is hauled up; resting divers hold ropes tied to the oars; drawn to one scale, the bank about 15 m deep | Shamal, Kaus, Suhaili, Nashi; the great dive, June–September |
| 0:30 | IV · Al Aflaj · الأفلاج | We carried water through the desert. | An Iron Age falaj at Hili in section: a gallery with stone-collared shafts, below the water table where it gathers water and above it where it only carries it, a slab-covered cut-and-cover channel, an open channel, a distributor with a sluice gate, fields and palms; the Hajar mountains on the east horizon and Jebel Hafeet on the south | Hili, Al Ain, Iron Age; UNESCO World Heritage 2011 |
| 0:38 | V · Al Markaz · المركز | Then we built a center to read the sky. | Radar scope and tower, anemometer, a logbook | Federal Decree-Law No. 6 of 2007; 254.8 mm (16 Apr 2024; WAM, with the decimal from Gallagher Re citing NCM), 51.8 °C (1 Aug 2025), −5.7 °C (3 Feb 2017) |
| 0:46 | VI · Al Matarat · المطارات | We read the sky for every flight. | Zayed International from runway 31L, drawn in the runway's own perspective: fog lifts off Terminal A and its dune-like roof and the crescent-shaped control tower, both small on the horizon at their true size, with a figure of the tower (109 m) to one scale beside them; a widebody lands, gear down, flaring onto the touchdown zone; a windsock | NCM's 24-hour aviation weather watch over 10 UAE airports; aviation including aviation-enabled tourism 18.2% of UAE GDP (IATA, 2023 data; direct aviation alone 5.3%); Zayed International about 24 fog days a year (1983–2018) |
| 0:54 | VII · Al Mawani · الموانئ | We read the sea for every ship. | Jebel Ali from the water: a container ship at berth, quay cranes (seen end-on) working her bays, one idle with its boom raised; a harbour tug; a buoy on the swell | Al Bahar 5-day marine forecasts since 2018; UAE ports ~21 million TEU (2023); Cyclone Shaheen red alert, 3 Oct 2021, 10 ft waves offshore |
| 1:02 | VIII · Al Taqa · الطاقة | We forecast the sun and the wind. | Shams 1, Madinat Zayed: rows of parabolic troughs turn east to west with the sun and fold its light onto the receiver tubes; the power block and its air-cooled condenser; a pyranometer and a 10 m anemometer mast | NCM forecasts for solar plants and wind farms; UAE renewables 6 GW (2024); WMO–IRENA clean-energy workshop hosted by NCM, Abu Dhabi, July 2024 |
| 1:10 | IX · Al Mujtamaʿ · المجتمع | We watch over every home. | Abu Dhabi's Corniche across the water (WTC and Trust Tower, The Landmark, Nation Towers, ADNOC HQ, Etihad Towers, Emirates Palace); a storm warning ripples out from the forecast and lights the phones in the homes on this shore | Forecast on 11 Apr 2024, red "Take Action" alert on 16 Apr 2024; NCM's UAE Weather app warnings (fog, rain, sea); WMO: 24 hours' notice can cut damage by 30% |
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

### Drawn from real places

The illustrations depict real UAE places, drawn from published descriptions and dimensions:

- **Zayed International (VI).**
  - Terminal A: one roof swelling into a dune-like arch, 52 m high across 319 m, with piers of rolling arches.
    - [KPF](https://www.kpf.com/project/zayed-international-airport)
    - [RIBAJ](https://www.ribaj.com/products/abu-dhabi-international-airport-midfield-complex)
  - The crescent-shaped control tower, 109 m on a five-storey base.
    - [CTBUH](https://www.skyscrapercenter.com/building/abu-dhabi-international-airport-air-traffic-control-tower/30422)
    - [Smithsonian](https://airandspace.si.edu/multimedia-gallery/11537hjpg)
  - Runway 31L, with the tower 1 km to its right and the terminal beyond on the same line.
    - [UAE AIP, OMAA](https://www.gcaa.gov.ae/en/ais/AIPHtmlFiles/AIP/Current/AIRACs/2026-P04/html/eAIP/AD-2.OMAA-en-GB.html)
- **Jebel Ali (VII).** Quay cranes seen end-on from the water, a raised boom on an idle crane, container bays, a harbour tug.
  - [DP World](https://www.dpworld.com/en/ports-terminals/uae/jebel-ali-port)
- **Shams 1 (VIII).** The trough geometry and the power block follow the plant's published design.
  - 100 MW of parabolic troughs near Madinat Zayed, inaugurated on 17 March 2013.
  - Trough aperture 5.77 m, focal length 1.71 m, rows about 17 m apart, tracking the sun east to west.
  - Power block: an air-cooled condenser, no tower.
  - Sources:
    - [NLR SolarPACES](https://solarpaces.nlr.gov/project/shams-1)
    - [Shams Power](https://shamspower.ae/en/shams-project/technology)
- **The Corniche (IX).** Drawn to one scale from CTBUH heights, as seen from the water.
  - Heights:
    - WTC tower 381 m
    - ADNOC HQ 342 m
    - The Landmark 324 m
    - Etihad Towers 305/278/260/234/218 m
    - Nation Towers 268/233 m, sky bridge at 202 m
  - Emirates Palace at the western end.
  - [CTBUH Skyscraper Center](https://www.skyscrapercenter.com/)

- **Al Ain (IV).**
  - The falaj follows the excavated Iron Age falaj Hili 15. Water was drained from a shallow water table to the north-east by a gallery with stone-collared shafts; there is no deep mother well.
    - [Benoist et al. 2021](https://hal.science/hal-03339631v1/document)
    - [DCT Abu Dhabi, *The Iron Age Sites of Hili*](https://ar.library.dctabudhabi.ae/sites/default/files/The%20Iron%20Age%20Sites%20of%20Hili_0.pdf)
  - Jebel Hafeet's outline is its skyline as seen from Hili, computed from the Copernicus 30 m elevation model with heights ×3. Its 1980 road is left out.
  - [UNESCO, Cultural Sites of Al Ain](https://whc.unesco.org/en/list/1343/)
- **The ships (II, III).**
  - The 15th-century ship is based on the Belitung wreck, the *Jewel of Muscat* reconstruction, Ibn Majid, and da Gama's 1498 account of sewn ships with palm-mat sails.
    - [Flecker](https://www.iseas.edu.sg/wp-content/uploads/2016/05/01_flecker_002to039.pdf)
    - [Vosmer](https://asia.si.edu/wp-content/uploads/2023/06/shipwrecked-08-vosmer.pdf)
  - The pearling scene follows Lorimer's *Gazetteer* (1908) and Heard-Bey. At the bank the sails were used as shade; the diver works on a lifeline held by his hauler, and the stone is hauled back up.
    - [Abu Dhabi Culture, pearl diving](https://abudhabiculture.ae/en/Cultural-Heritage/InTangible/Heritage-Register/Social-Practices/Maritime-Life)

NCM's role is limited to what the captions say. The film does not claim any NCM service to Jebel Ali or to Shams 1.

The economy figures (GDP share, TEU, GW) describe the size of each sector. They are not NCM
achievements, and the film does not present them as such.

## Rebuild

```bash
pip install numpy scipy imageio-ffmpeg
python3 score.py score.wav

# needs Playwright with Chromium (NODE_PATH may point at a global install)
export FFMPEG=$(python3 -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())")
node render.js film master.mp4 score.wav                   # 3,420 frames at CRF 17 (~73 MB)
node render.js preview stills 13 24 35                     # PNG stills at those seconds
# the committed copy: two-pass at 3,000 kb/s, ~45 MB, under GitHub's 50 MB warning
$FFMPEG -i master.mp4 -c:v libx264 -preset slow -b:v 3000k -pass 1 -an -f mp4 /dev/null
$FFMPEG -i master.mp4 -c:v libx264 -preset slow -b:v 3000k -pass 2 -pix_fmt yuv420p -c:a copy -movflags +faststart ncm-20-reading-the-sky.mp4
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
