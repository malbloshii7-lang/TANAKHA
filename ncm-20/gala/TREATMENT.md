# عشرون عاماً في قراءة السماء
# Twenty Years of Reading the Sky

**The anniversary film for the National Center of Meteorology's 20th-anniversary ceremony, March 2027.**
Final treatment by the head of media and PR lead. Draft for NCM and protocol approval, 25 September 2026.

| | |
|---|---|
| Runtime | **2:55.0** in the locked order (Revision 5: 52.5 bars at 72 BPM; one bar = 3.333 s), then a 20 s seamless stage-hold loop. Revision 3's cut ran 3:00.0 |
| Screen | Large LED wall in a dark hall. The event master is 50p, rendered to the wall's native pixel map (3840×2160 if the wall is 16:9) with the LED grade (`?grade=led`) |
| Sound | 5.1 cinema mix (7.1 if the hall has it), an original score recorded live, and an Arabic voice-over by an Emirati narrator |
| Language | Arabic leads everywhere: the voice-over, the first and larger line of every text block, the right-hand text column. English comes second |
| Built in | The gala engine in this folder (`engine.js`, `timeline.js`, `scenes/`). It re-cuts 13 v3 plates and uses 5 new scenes (night open, national map, quote cards, night finale, lockup) |
| Facts | The anniversary page's source list (`../index.html`, src-1 to src-68), the v3 film README (`../film/README.md`, chapters VI–IX), and the September 2026 research on protocol, quotes, facts and map data. A fact that could not be verified is left out of the film |

This treatment replaces the provisional wording in `timeline.js`. Appendix A says how to build it and Appendix B records how the three draft treatments were merged.

## Revision 5 · 26 September 2026: the locked order (this is the cut that `timeline.js` builds)

The director locked the film to five acts on the thesis "twenty years reading the sky: Suhail's heritage to mastery of
the storm, as living engravings". Engraved plates and engraved 3D only; one idea a beat; sparse type; the sound follows
the picture. The runtime is 2:55.0 (52.5 bars at 72 BPM), then the stage hold.

| Act | Beats (bars) | What the viewer gets |
|---|---|---|
| 1 · Heritage | Suhail (4.5), with a black sky held for the first bar; the star and the dhow, Ahmed bin Majid (3.5); the Hili falaj (4.5) | The ancestral line: "Long before radar and satellites, the people of this land read the sky… to live." |
| 2 · The storm | 2007, one national center (2.5); the seven emirates (3.5); April 2024 (8) | The red alert as a held frame: the storm's clock and the camera stop for 5 s while the label reads, and the music holds on its pedal |
| 3 · The hero | Etihad Rail in engraved 3D (10) | The train emerging from the Hajar on a long lens, with a bass; a worm's-eye pass, with the Ayyala over the diesel; the rise to an epic wide, in silence |
| 4 · Rain enhancement | Seeding over the Hajar (4.5); one research figure, a droplet growing on a salt nucleus (4.5) | One seeding shot and one research image, not a deck |
| 5 · The same star | Suhail over the Abu Dhabi skyline, the short dedication, the title and the lockup (7) | The bookend, and the people the film is for |

**Out of this cut:**

- the Durour wheel and the pearling winds;
- the three leaders' cards (the order says "kill quote walls");
- the working-day montage: the airport, the 2D rail plate, the port, the tanker and energy;
- the world beat and its globe;
- the rain gauge.

The Saadiyat museums and the King Air are deferred until after the export.

**Leaders.** The narration still names the late Sheikh Zayed (who restored the aflaj) and the late Sheikh Khalifa (who
founded the Center by decree).

**Open decision for NCM and protocol.** No card of H.H. the President appears in this cut. Restoring one whole card
before the finale is a one-entry change in `timeline.js`, and `score.py` would need its card cue back.

## Revision 2 · 25 September 2026: after the Arabic edit and the protocol review

An Arabic editor and a protocol reviewer (reading as a minister's chief of staff would) went through this treatment
and the build. Their corrections are now in the build. **Where this section and a beat below disagree, this section
and the build win.** The words as built, with their film times, are in **`SCRIPT.md`**, generated from the build by
`script.py`. That file, not §6 and §7 below, goes to the protocol office and the Arabic editor for approval.

**Arabic.** Every line of the editor's table is applied:
- The narrator's copy is fully vowelled. Numbers are written out in words.
- The on-screen text carries no vowels except where one prevents a misreading («عدّوا», «دَرّاً», «عُمان»).
- One term is used for each thing throughout: تنبؤات for forecasts. الاستمطار names the programme and the science; تلقيح السحب names the operation.

**Out: images that read as war graphics.**
- The ring that widened from the capital across the map is gone. At «في الإمارات السبع» all seven emirates are washed in gold together and named in the order of Article 1 of the Constitution: Abu Dhabi, Dubai, Sharjah, Ajman, Umm Al Quwain, Fujairah, Ras Al Khaimah.
- The airport squares are gone.
- The Geneva line now lies on the globe's surface and fades in whole.
- The globe turns west to east.
- The ornament is now a compass star. The old one was an eight-pointed star whose outline is the hizb marker; the quote cards' star is replaced by rings and a slowly turning dial.

**Prominence.**
- The world beat's musical peak is the national line, «من سماء الإمارات إلى العالم».
- Dr Al Mandous's name is held under a steady chord, with no bloom.
- Each leader's card has full strings, the motif in the horn and a wordless choir. Measured in `mix.wav`, every card is at or above the world beat's level (Revision 3: the build now checks it).
- Dr Al Mandous's name is set no larger than the office line above it (28 px Arabic, 16 px English), smaller than the leaders' names on their cards (30 px, 18 px).
- The applause after B17 runs **cue to cue**. PART 1 stops on B17's last frame, with the office and the name on screen. LOOP W, a 12 s still with its music bed, plays until the show caller releases PART 2.

**April 2024** is now on the national map. A rain area drawn the way a weather chart draws one (hatched, wavy-edged) crosses the country from the west and clears to the east by the remembrance. The event was national, so no one city stands for it, and no NCM product is imitated.
- Labels: «14 أبريل · المركز يتوقّع تزايد عدم الاستقرار الجوي» and «16 أبريل · المركز يُصدر إنذاراً أحمر».
- VO-08b says only what the 14 April bulletin says: «وكانَ المركزُ قد توقَّعَ تزايُدَ عدمِ الاستقرارِ قبلَ يومَين، ثمَّ أصدرَ إنذاراً أحمرَ.» / "Two days before, the Center had forecast growing instability; then it issued a red alert."
- One short label: «تنبؤات 14 أبريل · إنذار أحمر 16 أبريل» / FORECASTS 14 APRIL · RED ALERT 16 APRIL.
- The remembrance line is now the alternate, «نستحضِرُ تلكَ الأيّامَ العصيبة، ونُحيّي كلَّ مَن سهِرَ على سلامةِ الناس.» In March 2027, «من فقدناهم» would be heard against losses the film does not name.

**Facts.**
- The network counts are off the screen until NCM certifies them.
- «17 مشروعاً» is off; it goes stale with the seventh cycle.
- VO-07 says «بمرسومٍ بقانونٍ اتحاديٍّ» and puts the official-source role in the present: «والمركزُ اليومَ المرجعُ الرسميُّ للطقس».
- VO-13 says «للدُّوَلِ التي تُواجِهُ شُحَّ المياه».
- Seismology is named in the dedication («وعلماء الزلازل»).
- Khalifa University is credited on the nanomaterial figure.
- "Ahmed bin Majid" follows RAK Antiquities.
- Sheikh Mansour's card defaults to the IREF 2025 quote, which has an official English. The May 2026 quote waits for an approved English.

**Places.**
- The islands' outlines now come from Natural Earth (public domain). No other country's administrative file is used for any UAE territory; the geoBoundaries outlines of Oman, Saudi Arabia and Qatar draw only those countries' own faint shapes. The FGIC map is still required before lock.
- The seeding scene's mountains are the computed skyline of the Hajar in Ras Al Khaimah, seen from the plain at 25.78 N, 56.02 E. Only terrain inside the UAE outline is counted (`data/build/rak_skyline.py`).
- The finale is drawn from a real viewpoint, Marina Mall (24.4769 N, 54.3225 E), looking south:
  - Etihad Towers stand 1.96 km away on a bearing of 183.6°; the 305 m tower is 8.9° high.
  - Emirates Palace stands 1.76 km away on a bearing of 199.6°.
  - Suhail, at 12.2°, clears the towers just to their right.

**Sound and build.**
- The seeding aircraft is a distant turboprop.
- Fonts are self-hosted (`fonts/`, SIL OFL), and a render stops if one fails to load.
- The subtitle files are generated from the build, with LRM marks in place of isolates for caption renderers.
- The Arabic and English narration captions are delivered too.

## Revision 3 · 26 September 2026: Etihad Rail, the east coast, and an Emirati score

The client asked for three things:
- an Etihad Rail scene;
- an ADNOC vessel laden with Murban crude, "depending on our AI solution for a safe passage";
- background music that is more Emirati.

Five research briefs (rail, tanker, NCM's AI, Emirati music, protocol) and an adversarial check of the rail facts
shaped what is built. **Where this section and anything above disagree, this section and the build win.**
`SCRIPT.md` has the words as built.

**The cut.**
- 21 beats, 54 bars, **3:00.0**.
- The working day is now five 5 s beats: the airport, B11 the railway, the port, B13 the east coast, and Shams 1.
- The President's card starts at 1:50.
- Beat numbers from B11 on move up by one or two; the cue sheet counts them from the cut itself.

**B11 · Across the land (Etihad Rail near Al Dhaid, Sharjah).**
- **Picture.**
  - An EMD SD70-family locomotive, engraved from its published dimensions (22.6 m, about 5 m high, six axles). It has no logo, and its livery bands are hatched, not coloured.
  - It draws open hopper wagons of crushed stone west from the Hajar, on the double-track embankment with the ditch and berm that stop the sand.
  - The skyline is computed from a viewpoint near Al Dhaid.
- **No container train.** Since 20 September 2026 the Fujairah–ICAD container service runs on this section. International press calls it the route that bypasses the Strait of Hormuz. Beside a tanker off Fujairah, containers would tell that story.
- **Words.**
  - Label: «قطارات الاتحاد · الذيد، الشارقة» / ETIHAD RAIL · AL DHAID, SHARJAH.
  - Headline: «على امتداد البر» / ACROSS THE LAND.
  - VO-09r: «وعلى امتدادِ البَرِّ تحذيراتٌ من الغبارِ والضَّباب،» / "across the land, warnings of dust and fog;". The fatha on «البَرّ» keeps it from being read as «البِرّ» (piety) or «البُرّ» (wheat).
  - This claims only NCM's public dust and fog warnings (WAM, 4 January and 21 February 2026), which address the public and drivers.
  - No NCM service to Etihad Rail is documented, so the film never says "for every railway" or "for every train".
  - The film never says "links all seven emirates": the main line does not run through Ajman or Umm Al Quwain.
- **Clearance.** Showing the name "Etihad Rail" needs Etihad Rail's written clearance, obtained through NCM. Until then, set `RAIL_NAME` in `timeline.js` to «شبكة السكك الحديدية الوطنية» / NATIONAL RAIL NETWORK.
- **Sound.** A distant diesel only: no horn (Etihad Rail keeps no-horn zones) and no wheel clack (the main line is continuously welded).

**B13 · For the east coast (the Sea of Oman off Fujairah).**
- **Picture.**
  - A very large crude carrier, laden (about 9 m of hull showing), under way on a south-easterly course, away from the strait.
  - She is drawn at her true size for 1.8 km, with the Hajar behind her (computed skyline).
  - Her bow wave is small and her wake stays in the water behind her.
  - She has no name, flag, livery or logo, no terminal or loading buoy, and no funnel smoke. Off Fujairah in 2026, smoke reads as fire.
- **The bulletin inset.** NCM's EASTERN COAST marine bulletin writes itself line by line, then a forecaster signs it.
  - Its chart is the UAE's own east coast, from the Oman border at Dibba to the border south of Kalba, taken from the national map's data, with the sea to the east.
  - It shows no Musandam, no strait, no route line and no ship marker, and no numbers.
- **Words.**
  - Label: «الفجيرة · بحر عُمان» / FUJAIRAH · SEA OF OMAN.
  - Headline: «للساحل الشرقي» / FOR THE EAST COAST.
  - VO-10t: «وللساحلِ الشرقيِّ نشرةٌ يقترحُها الذكاءُ الاصطناعيّ، ويعتمدُها المتنبِّئون،» / "for the East Coast, a bulletin that AI drafts and forecasters approve;".
  - This follows WAM, 29 June 2026: NCM's Forecaster Assistant prepares preliminary drafts of weather and marine bulletins, and specialists review and approve every output.
  - The AI proposes and people approve: the line claims no protection, safety or decision.
  - The Arabic editor's changes:
    - The plural «المتنبِّئون», because the singular sounds like the poet «المتنبّي» at a pause.
    - No second «بحريّة» after VO-10's.
    - Eight words instead of eleven, so the clause no longer fills its whole beat.
  - The fallback that keeps WAM's own verb is «…نشرةٌ يُسهِمُ الذكاءُ الاصطناعيُّ في إعدادِها، ويعتمدُها المتنبِّئون،».
- **Declined, with the reasons given to the client** (each fact checked independently on 26 September 2026).
  - **"Safe passage"** («عبور آمن», «ممر آمن», «مسار آمن»).
    - In September 2026 this is the vocabulary of the Hormuz diplomacy. A joint statement read at the UN on 24 September, on behalf of 79 signatories including the UAE, called for "the safe, secure and unimpeded transit of all vessels".
    - It would claim a security outcome that no weather agency delivers.
  - **ADNOC's name or livery, and a Murban label.**
    - ADNOC vessels have been attacked while transiting Hormuz since the war began on 28 February:
      - ADNOC gave 15 on 7 August; Bloomberg reported 23 in mid-August.
      - The UAE condemned Iranian attacks on ADNOC-affiliated vessels on 8, 14 and 15 August.
      - Reuters reported an ADNOC-managed LPG carrier struck on 20 September; ADNOC declined to comment on "voyage planning or vessel movements".
    - Murban is a traded crude grade, and naming it reads as product placement.
    - It is sold free on board at Fujairah into the buyer's ship, so "an ADNOC vessel laden with Murban" may not even be accurate.
    - ICE's Murban futures have been winding down since 31 July, when ADNOC announced its move to Platts Dubai pricing from 1 November.
    - H.H. the President chairs ADNOC's Board, and H.H. Sheikh Mansour bin Zayed sits on it. Dr Sultan Al Jaber is Minister of Industry and Advanced Technology and ADNOC's Managing Director and Group CEO. Protocol confirms who attends.
    - Naming ADNOC or Murban is a new label and a new picture that NCM leadership, the protocol office and MoFA must approve together, with ADNOC. It is not a switch in the build.
  - **The loading buoy.** It is the literal image of the Fujairah export point. Fires broke out in the Fujairah Oil Industry Zone after drone attacks or falling interception debris on several days in March and on 4 May 2026.
- **Removable.**
  - `?pull=tanker` takes the beat out and closes the cut up to 2:55.0, with its narration, its music and the cue sheet.
  - Hold a go/no-go at two weeks and again at 72 hours before the ceremony, against the Hormuz situation and any incident involving a UAE vessel.
  - The beat never goes into a cut-down, a social clip, the international version or a press still. Its headline over a laden tanker reads as a weather service only with the narration under it.
- **Verification.** The AI wording matches WAM's Arabic and English texts of 29 June 2026, checked twice. NCM's marine bulletin (12 June 2026) has ARABIAN GULF and EASTERN COAST sections giving wave height, wind speed and wind direction; take a current original from NCM before any bulletin detail goes on screen.

**Music: an Emirati temp score** (`score.py`).
- **Every cue is placed from its beat's start**, so the music follows any re-cut, including a pulled tanker.
- **The drums of Al Ayyala carry the day**: the ras, three takhamir, the tar and the tus.
  - They enter with the ras player's takhmeera after the iris into the Center (pianissimo).
  - One tar and tus stroke marks the seven emirates lit together.
  - They carry the working day at mezzo-forte, with a colour for each place: steady eighths for the railway, the sawt's mirwas and interlocking claps for the port.
  - The drums rest under the tanker, where only the jahla and the crew's drone play; protocol advised against Ayyala under a ship.
  - They take the world beat to forte on the national line, recede under the office, and stop before the name.
  - The twentieth drop lands with the ras and the tus.
- **Nights have no drums.** A practitioner's account has the Ayyala performed only in the afternoon.
  - The night open and the finale have the rababa (it replaces the ney) and a hummed lead answered by a group.
  - The oud replaces the qanun. New Grove: neither the ney nor the qanun has a traditional link to the area.
- **Pearling** has one wordless nahham call over the crew's drone two octaves below, with two groups of claps and the jahla.
- **Every leader's card** gets the same hummed lead and answer, strings, horn and choir, and no percussion.
- **April 2024** has no Emirati percussion, no claps and no voices.
- **Left out on purpose:**
  - Al Harbiya and Al Razfa (war and victory);
  - Liwa and the zaffa (weddings);
  - the habban (Iranian-coast origins);
  - the manior (zar);
  - chanted verse of any kind;
  - the anthem.
- **A restrained mix** (`mix-restrained.wav`, with its own part files) drops the drums, tus, claps and jahla, for a ceremony in Ramadan or a period of mourning.
- **Precedence is measured.** The build fails if any leader's card is quieter than the world beat (in the current mix the cards measure −13.8, −13.3 and −13.5 LUFS, the world beat −13.9). The drums at the national line sit about 6 dB under the orchestra: present, not triumphal.
- **The temp is a sketch.** Every drum pattern is a programming sketch, not a transcription, and the troupe replaces it with its own. The synthesized voices are never played to heritage advisers as Emirati music.
- **Credits** (programme, not screen): the troupes by name and emirate; the Ayyala as a joint UNESCO file with Oman (2014); and an original score for NCM (Decree-Law 38/2021, Articles 16, 17 and 29).

**Reading times (critique M1: at least 3 s plus 0.3 s a word).**
- The new labels meet the rule.
- The Great Dive, the airport and Shams 1 labels were retimed to meet it. The airport's English is 0.3 s short.
- Still short by the rule, for decision:
  - **the three leaders' cards**: up 10.4 s each, while their texts need 13 to 19.5 s. Lengthen all three equally or trim the English (§11, row 39);
  - **the WMO office and name** in the continuous cut only. In the event master they hold through LOOP W;
  - **the lockup**, which holds in LOOP A.

**Build.**
- `render.js --to split` / `--from split` cuts the two show parts at the right frame for either cut.
- The cue sheet numbers the beats from the cut.
- `?pull=tanker` works in every tool.

---

## 1. Purpose and audience

**Why this film exists.** It opens the ceremony. In 2 minutes 38 seconds it has to tell a room of UAE ministers, the Center's leadership and staff, partners and international guests one thing: *the people of this land have always read the sky; for twenty years the National Center of Meteorology has done it for the whole nation; now the world listens.*

**Who is in the room, and what each needs:**

| Audience | What they need from the film |
|---|---|
| UAE ministers and senior officials | A clear, dignified account of what the Center is for, in Arabic first. Correct protocol, with every leader's words verbatim and correctly credited. No claim they would have to correct later |
| NCM leadership, including H.E. Dr Abdulla Ahmed Al Mandous | A film that honours the institution and its people and marks the WMO presidency, with room for the hall's applause |
| NCM staff (forecasters, observers, pilots, engineers, scientists) | To see their work and be thanked by name of profession. The film ends on them |
| International guests (WMO, partner services, embassies) | An English-voiced master, and on the night English subtitles on the side screens |
| Press and broadcast cameras | Frames that survive a 50 Hz camera pointed at an LED wall, quotable lines, and stills |

**Tone.** A tribute, not a sales reel. It is slower than v3 (72 BPM instead of 120), carries fewer words, and uses three silent leadership cards. It has one restrained passage for April 2024 and one moment of celebration (the twentieth year). The applause room after Dr Al Mandous's name is planned.

**What it is not.** It is not an economic-impact film: v3's sector figures (18.2% of GDP, 21 million TEU, 6 GW) describe sectors, not NCM outcomes, so they go to the press fact sheet with their qualifiers. It does not claim what other bodies do: no "keeping skies open", no "guiding ships", no "lives saved", no alerts on phones.

---

## 2. Key messages

**Three things a minister should leave with:**

| # | Arabic | English | Where the film proves it |
|---|---|---|---|
| 1 | **مركزٌ وطنيٌّ واحد، هو المرجع الرسمي للطقس في الإمارات السبع** | **One national center, the official source for the weather across the seven emirates.** | Founded in 2007 in federal law by the late Sheikh Khalifa bin Zayed Al Nahyan (src-18, src-20, src-21). It is the only official body for meteorological services (src-27; Decree-Law Articles 4 and 13). The network appears across all seven emirates (src-24, src-25). It keeps a 24-hour aviation watch, issues marine forecasts and forecasts for power plants (README VI–VIII). In April 2024 it warned two days ahead of the heaviest rain on record (src-28, src-30, src-31) |
| 2 | **من شحّ المطر إلى علمٍ للعالم** | **From scarce rain to a science for the world.** | The President's 2011 words on water (src-34). A land with less than 100 mm of rain in a typical year (src-29). Seeding nationwide since 2010 (src-44, src-47). UAEREP since 2015, 17 projects (src-53, src-40, src-54). HH Sheikh Mansour's words on the programme, May 2026 (src-59) |
| 3 | **من سماء الإمارات إلى العالم** | **From the skies of the Emirates to the world.** | The WMO presidency, 2023–2027, the first from the GCC (src-43). Partners in Kazakhstan, Morocco and Lahore (src-61 to src-64) |

**The undertone** is continuity: Suhail, Ibn Majid, the aflaj and Sheikh Zayed's care for the land lead to a modern science. It ends in gratitude to the Center's people.

**Lines built to be quoted.** These go to the ministers' speech-writers two weeks before the ceremony, so the speeches after the film can echo them:

| Arabic | English |
|---|---|
| مركزٌ وطنيٌّ واحد | One national center |
| لكلِّ رحلةٍ، رصدٌ لا ينام | For every flight, a watch that never sleeps |
| من سماء الإمارات إلى العالم | From the skies of the Emirates to the world |
| عشرون عاماً من رصد السماء، ليخطّط الوطن لغده بثقة | Twenty years of watching the sky, so the nation can plan for tomorrow with confidence |
| عشرون عاماً في قراءة السماء | Twenty Years of Reading the Sky (the title, matching the page's headline) |

---

## 3. Concept and signature device

### 3.1 Concept: one sky, night to night

The film is one sky seen across one day and twenty years. It opens on the real pre-dawn sky over Abu Dhabi as Suhail rises over the dunes: the star from which the Durour calendar counted the year. Dawn turns the sky into parchment, and the engraved plates carry the inheritance, the founding, the nation's working day, the April 2024 storm, the search for rain and the world stage. It ends on the real night sky over the same city on the evening of the ceremony, with Suhail standing in the south above the Corniche. The star that rose over empty dunes stands over a city that plans by the Center's forecasts.

### 3.2 Signature device: the turning circle

One shape joins every movement. Each circle is matched to the next one at the same screen position and radius, so the eye carries it across the cut:

> Suhail's halo → the Durour wheel → Ibn Majid's compass rose → the wind rose over the pearl banks → *(the falaj, the Zayed card's star)* → the radar scope → the Center's gold ring widening over the seven emirates → the storm symbol's ring on NCM's own warning map (the film's only red) → the sun over Shams 1 → the leaders' cards' star halos → a droplet at the cloud base → the seeding nanoparticle → the globe → the rim of the rain gauge → a gold ring closing around Suhail → the lockup ornament.

How it is built (all implementable in the current engine; see Appendix A):
- The plates' own circles carry most of it. The existing `lockCam` helper puts the outgoing circle's screen centre and radius onto the incoming one.
- The engine's `iris` transition is already traced by a gold ring. It opens each new plate from the circle it matches.
- A small persistent gold `RING` overlay is added only where no plate circle exists: Suhail's halo into the Durour wheel (0:09–0:13), and optionally the sun into the President card's star.
- A soft brass "detent" click sounds at each circle lock, so the ear hears the rhyme too.

### 3.3 Three signature moments

1. **Suhail rises (0:08.3).** The sky is computed from the Yale Bright Star Catalogue for 24 August 2026 before dawn, not drawn freehand.
2. **The seven emirates light (0:57.5–0:58.8).** The Center's gold ring widens from its headquarters at a constant speed and names each emirate as it reaches the capital, by true great-circle distance. All seven light within 1.3 s, at one size, while the late Sheikh Khalifa's name is spoken.
3. **The twentieth drop (2:23.3).** A rain gauge graduated 2007–2027 takes twenty drops, one per year. The twentieth lands on 2027 on the music's biggest hit. This is the gauge on the anniversary page's masthead, so film and page share one image.

### 3.4 Rules for the room

- **Arabic first.** The text column is on the right, with one right-hand edge at x 1840 (1920×1080 canvas units). The Arabic line comes first and larger; the English sits beneath at about 45% of the Arabic size. Drawings take the left ~60% and are never mirrored.
- **Two levels of text.**
  - **Level A:** 2–5 words that echo what the narrator has just said, word for word, appearing about 0.3 s after the phrase.
  - **Level B:** place, date and source-year labels, in museum-label style.
  - The screen never carries a different sentence from the voice at the same moment. There is no text during the remembrance line or during applause.
  - Three **big-word moments** use the largest size: «مركزٌ وطنيٌّ واحد», «من سماء الإمارات إلى العالم» and «عشرون عاماً». The title card is the fourth.
- **Type.**
  - Arabic headlines and labels: Noto Kufi Arabic, the base font of the UAE Design System.
  - Quotations: Amiri.
  - English headlines: Cinzel. English labels: IBM Plex Mono. English quotations: IM Fell English italic.
  - Minimum sizes on a 1080 basis: **30 px Arabic, 24 px English** for anything meant to be read. Sizes: Level A Arabic 84 px (big words 96 px, «عشرون عاماً» 120 px); Level B Arabic 32 px and English 24 px.
  - The v3 plate labels at 10–13 px become texture only: they are removed or enlarged, and never carry numbers.
- **Numbers.** Western digits. Every Latin or number run inside Arabic is wrapped as an LTR isolate (the engine's `ltr()`, U+2066…U+2069), so «2007–2027» can never display reversed. Every number on screen carries its source and year (§9.3).
- **Switch at the cut.** Words fade out before a transition and in after it; they never crossfade. Dissolves composite the incoming scene as a whole layer.
- **Colour script.**
  - Day is sepia ink on parchment. Night is cream and gold light on deep indigo-black.
  - **Red appears once:** the storm symbol's ring on NCM's warning map, April 2024.
  - **Gold** is the ring device and the twentieth year. The gauge's 2027 graduation is gold, not red.
- **Built for an LED wall.**
  - The open and close are dark, so the audience's eyes adapt.
  - Parchment uses the LED grade (about two-thirds of the web grade's luminance, with a deeper vignette), calibrated with a meter at the tech rehearsal.
  - There are no full-frame flashes, no full-frame red and no strobing. The twentieth-year glint ramps over 0.6 s. A Harding / ITU-R BT.1702 photosensitivity test is passed before sign-off.
  - Line weight is at least 2 px and hatch gaps at least 5 px at output resolution, to avoid moiré on the wall and on cameras.
  - Critical text stays out of the bottom 15% of the frame, where the stage and lectern may block it [confirm with the stage design].

---

## 4. Structure with timecodes

### 4.1 Movements

| Movement | Time | Beats | Light | The room should feel |
|---|---|---|---|---|
| I · Night and inheritance | 0:00.0–0:45.0 | B01–B06 | Black → stars → dawn → parchment | Awe, then belonging, then reverence |
| II · The Center | 0:45.0–1:05.0 | B07–B08 | Parchment | Confidence: "this is ours" |
| III · The test | 1:05.0–1:21.7 | B09 | Parchment greys under cloud, then clears | Gravity, remembrance |
| IV · The working day | 1:21.7–1:36.7 | B10–B12 | Morning fog lifting, then full day | Momentum, gratitude |
| V · Water | 1:36.7–2:05.0 | B13–B16 | Parchment, warm | Resolve, ingenuity, honour |
| VI · The world | 2:05.0–2:16.7 | B17 | Parchment, the orchestral peak | National pride; applause |
| VII · Twenty, and night | 2:16.7–2:38.3 | B18–B19 | Golden, then dusk into the night sky | Arrival, gratitude, continuity |

**Pronoun arc.** The heritage is told as "they" (the people of this land). The founding and the services are told as "the Center". From water onward it becomes "we" (the nation). The last line joins them: *so the nation can plan for tomorrow with confidence.*

### 4.2 Overview

72 BPM, 4/4. Bars are counted from 0, as `at(bars)` counts them in `timeline.js`. Every cut lands on a bar or half-bar.

| # | Time | Bars | Beat | Scene (source) | Enter | VO |
|---|---|---|---|---|---|---|
| B01 | 0:00.0–0:11.7 | 0–3.5 | Night: Suhail rises | `suhail` (built) | from black | yes |
| B02 | 0:11.7–0:18.3 | 3.5–5.5 | The Durour wheel | `durour` (v3 I) | `dawn`, 2.8 s | yes |
| B03 | 0:18.3–0:23.3 | 5.5–7 | Ibn Majid, the monsoon | `monsoon` (v3 II) | circle lock, 0.8 s | yes |
| B04 | 0:23.3–0:28.3 | 7–8.5 | Every wind by name | `pearling` (v3 III) | circle lock, 0.8 s | yes |
| B05 | 0:28.3–0:36.7 | 8.5–11 | The aflaj; Sheikh Zayed | `falaj` (v3 IV) | line match, 0.8 s | yes |
| B06 | 0:36.7–0:45.0 | 11–13.5 | Card: Sheikh Zayed, 1998 | `quote` (built) | fade, 1.2 s | silent |
| B07 | 0:45.0–0:53.3 | 13.5–16 | 2007: one national center | `centre` (v3 V) | `iris` at the scope, 1.6 s | yes |
| B08 | 0:53.3–1:05.0 | 16–19.5 | Seven emirates, one official source | `nation` (built) | `iris` from the scope, 1.6 s | yes |
| B09 | 1:05.0–1:21.7 | 19.5–24.5 | April 2024 | `homes` (v3 IX, revised) | `iris` from the Corniche on the map, 1.6 s | yes |
| B10 | 1:21.7–1:26.7 | 24.5–26 | For every flight | `airport` (v3 VI) | fade, 1.0 s | yes |
| B11 | 1:26.7–1:31.7 | 26–27.5 | For every ship | `port` (v3 VII) | cut, 0.5 s | yes |
| B12 | 1:31.7–1:36.7 | 27.5–29 | For clean energy | `energy` (v3 VIII) | cut, 0.5 s | yes |
| B13 | 1:36.7–1:45.0 | 29–31.5 | Card: HH the President, 2011 (reported speech) | `quote`, new `reported` style | fade, 1.2 s | silent |
| B14 | 1:45.0–1:51.7 | 31.5–33.5 | More rain from the clouds | `seeding` (v3 X, revised) | fade, 1.2 s | yes |
| B15 | 1:51.7–1:56.7 | 33.5–35 | The science of rain | `science` (v3 XI, revised) | `iris` from the droplet, 1.2 s | yes |
| B16 | 1:56.7–2:05.0 | 35–37.5 | Card: HH Sheikh Mansour, 2026 | `quote` (built) | fade, 1.2 s | silent |
| B17 | 2:05.0–2:16.7 | 37.5–41 | From the skies of the Emirates to the world | `world` (v3 XII, pins) | `iris` from the globe centre, 1.4 s | yes |
| B18 | 2:16.7–2:28.3 | 41–44.5 | Twenty years | `gauge` (v3 XIII, revised) | circle lock: limb to rim, 1.0 s | yes |
| B19 | 2:28.3–2:38.3 | 44.5–47.5 | Night: the same star; title; lockup | `finale` + `outro` (built) | `dusk`, 3.0 s | yes |
| — | loop | — | Stage hold (20 s) | `finale` in `?hold` mode | seamless | — |

---

## 5. Per-beat table

> **Superseded in part by Revision 2 and by `SCRIPT.md`** (the words and times as built). Where they differ, `SCRIPT.md` is right; this section records the original intent.

Times are film seconds. "src-N" refers to the anniversary page's source list and "README" to `../film/README.md`. VO times are in and out points. On-screen text gives Arabic first, then English.

### B01 · 0.00–11.67 · Night: Suhail rises

| | |
|---|---|
| **Scene** | `suhail` (built): the real sky before dawn over Abu Dhabi on 24 August 2026, 05:00→05:27 Gulf time, time-lapsed, facing south-south-east (azimuth 153°). Star positions are computed per frame from `data/stars.js`; low dunes sit along the horizon |
| **Visual** | 0.0–1.5: true black with room tone; the hall settles. 1.5–4.0: stars fade up in order of brightness. 3.0–6.0: the dune line inks left to right. **8.33: Suhail (Canopus) clears the dunes**; its computed rising point is azimuth 151°. The sky clock is re-keyed so the rising lands on bar 2.5. 9.2: a thin gold ring (r 24) draws itself around the star, and the device is born. 10.3: first light grows on the left (east) |
| **Camera** | Locked off, then a slow push toward the rising point: `{t 0, s 1.00, px 960, py 560, sx 960, sy 560}` → `{t 11.67, s 1.10, px 960, py 700, sx 960, sy 640}` |
| **On screen** | 8.8, beside the star (Level B): «سهيل» / SUHAIL · CANOPUS |
| **VO** (2.2–7.8) | «قبل الراداراتِ والأقمارِ الاصطناعيةِ بزمنٍ طويل، قرأ أهلُ هذه الأرضِ السماءَ… ليعيشوا.» / "Long before radar and satellites, the people of this land read the sky… to live." |
| **Music** | 0–1.5 silence. From 1.5, a low D drone (divided celli, sub pad) and a faint desert wind in the surrounds. Celesta glints on the brightest stars. **8.33: a solo ney states the Suhail motif** and a wordless male choir hum swells. 9.2: the ring tone, a harp harmonic on D |
| **Transition out** | `dawn` (xf 2.8, centred on 11.67): the day sheet uncovers from the horizon upward behind a band of first light. The gold ring grows from Suhail's point into the Durour wheel's outer ring |
| **Sources** | The Durour counts from Suhail's rising (src-1). The line is the page's own (§1). Suhail's rising: NCM, August 2026 (src-15). The sky is computed |

### B02 · 11.67–18.33 · The Durour wheel

| | |
|---|---|
| **Scene** | `durour` (v3 I): the 36-petal wheel turning through the year, the five extra days marked, Suhail rising again in the medallion |
| **Visual** | The wheel inks outward from the point where Suhail stood and turns once, a year, like the sky |
| **Camera** | `lockCam` from Suhail's ring `{sx, sy, R 24}` to `CIRCLES.durour` (r 382), settling to the standard left-plate framing by 3.0 s, then 1.00→1.06 |
| **On screen** | 13.2 (B): «حساب الدرور · 36 × 10 + 5» / THE DUROUR CALENDAR · 36 × 10 DAYS + 5. 15.6 (A): «عدّوا أيام السنة» / THEY COUNTED THE DAYS OF THE YEAR |
| **VO** (12.3–17.8) | «ومن طلوعِ سهيلٍ عدّوا أيامَ السنة، ومواسمَ الزرعِ والبحرِ والمطر.» / "From Suhail's rising they counted the year, and the seasons for planting, the sea and rain." |
| **Music** | First light chord (strings and harp) on the dawn. The oud ostinato enters in maqam Bayati on D, with a half-time frame drum. A soft burin scratch sits under the wheel's first stroke only |
| **Transition out** | Circle lock at 18.33 (0.8 s whole-layer dissolve): the wheel's ring holds while the petals give way to the compass rose. Detent click |
| **Sources** | 36 × 10 days + 5, from Suhail's rising (src-1); the seasons it told (src-2) |

### B03 · 18.33–23.33 · Ibn Majid and the monsoon

| | |
|---|---|
| **Scene** | `monsoon` (v3 II): the late-15th-century sewn-plank Gulf ship under a palm-mat sail. The compass rose turns like the sky about the Pole Star, and a star's height is measured in *isbaʿ*. It enters with `offset` 2.0, so the ship is already drawn |
| **Camera** | `lockCam(plateCircle(CIRCLES.durour, …), CIRCLES.monsoon)` (already in `timeline.js`), then a slow push |
| **On screen** | 19.0 (B): «أحمد بن ماجد · جلفار، رأس الخيمة · نحو 1490» / AHMAD IBN MAJID · JULFAR, RAS AL KHAIMAH · c. 1490 |
| **VO** (18.6–24.2, carries 0.9 s across the cut) | «ومن جُلفار، وقّتَ ابنُ ماجد أسفارَه على الموسم، وقاسَ ارتفاعَ النجومِ بالأصابع.» / "From Julfar, Ibn Majid timed his voyages by the monsoon and measured star heights in fingers." |
| **Music** | A qanun run lands on the cut. The oud ostinato continues. Sea wash, creaking sewn planks, the sail flapping |
| **Transition out** | Circle lock at 23.33: the compass rose becomes the wind rose. Detent click and a wind gust |
| **Sources** | Born in Julfar, present-day Ras Al Khaimah (src-3). *Kitab al-Fawa'id*, about 1490 (src-4). Monsoon from *mawsim* (src-5). Voyages timed by counting days; star heights in fingers (src-6). The ship's construction: README II |

### B04 · 23.33–28.33 · Every wind by name

| | |
|---|---|
| **Scene** | `pearling` (v3 III): the wind rose over the pearl banks. Below, a sambuk at anchor with its sail spread as an awning, a diver on the bed on his lifeline held by his hauler, the stone weight hauled up; all drawn to one scale, the bank about 15 m deep. **Remove the "Nashi" wind** (not on the page's sources) |
| **Camera** | `lockCam(…, CIRCLES.pearling)`, then a tilt down from the rose to the diver (py 430→700, s 1.10→0.95) |
| **On screen** | 24.6 (B): «الغوص الكبير · من يونيو إلى سبتمبر» / THE GREAT DIVE · JUNE TO SEPTEMBER. 25.8–26.8, on the rose at their bearings: «الشمال» SHAMAL (NW) · «الكوس» KAUS (SE) · «السهيلي» SUHAILI (S). 26.8 (A): «كلُّ ريحٍ باسمها» / EVERY WIND BY NAME |
| **VO** (24.6–27.0) | «وعرفَ البحّارةُ كلَّ ريحٍ باسمها.» / "Sailors knew every wind by name." |
| **Music** | Wind gusts pan across as each name inks. 27.0–28.6: a one-bar wordless call by a *nahham*, the pearling boat's song leader, newly recorded by a practising performer [cultural adviser to confirm]. Rope creak; water |
| **Transition out** | Line match at 28.33 (0.8 s dissolve): the sea surface becomes the falaj's water table at the same screen height |
| **Sources** | The great dive, June–September (src-7, src-9). Shamal NW, Kaus SE, Suhaili S (src-8). README III |

### B05 · 28.33–36.67 · The aflaj, and Sheikh Zayed

| | |
|---|---|
| **Scene** | `falaj` (v3 IV): the Iron Age falaj at Hili in section, after the excavated Hili 15. A gallery with stone-collared shafts gathers water below the water table and carries it above it; a slab-covered channel, an open channel, a distributor with a sluice gate, palms and fields. The Hajar lie on the east horizon and Jebel Hafeet on the south, from the Copernicus 30 m elevation model; there is no road on Jebel Hafeet. Water runs downhill only |
| **Camera** | "Follow the water": a lateral truck along the channel toward the palms (s 1.04→1.10) |
| **On screen** | 29.4 (B): «هيلي، العين · العصر الحديدي» / HILI, AL AIN · IRON AGE. 31.0 (B): «مواقع العين الثقافية · التراث العالمي لليونسكو، 2011» / CULTURAL SITES OF AL AIN · UNESCO WORLD HERITAGE, 2011. Both labels leave at 33.0, so the frame is clean while Sheikh Zayed's name is spoken |
| **VO** (29.0–36.6) | «وفي العين، تقاسموا الماءَ بالأفلاج، وأحياها المغفورُ له الشيخ زايد بن سلطان آل نهيان، طيّب الله ثراه.» / "In Al Ain they shared out the water through the aflaj, and the late Sheikh Zayed bin Sultan Al Nahyan restored them." |
| **Music** | Water trickle; pizzicato droplets. The strings open under Sheikh Zayed's name (33.0), and the percussion stops at 35.0 |
| **Transition out** | Fade to clean parchment (1.2 s). The card's star ornament starts drawing as the VO ends |
| **Sources** | Hili aflaj, Iron Age (src-10). World Heritage 2011 (src-10, src-11). As the Ruler's Representative in Al Ain, Sheikh Zayed restored the aflaj and shared the water rights more fairly (src-12). README IV |

### B06 · 36.67–45.00 · Card: the Founding Father

| | |
|---|---|
| **Scene** | `quote` (built): parchment, a faint gold eight-pointed star behind centred words, a rule with a star above and below. No likeness, portrait, signature or emblem |
| **Timing** | 37.3 the Arabic inks right to left; 39.4 the English fades in whole; 40.8 the credit; hold to 44.4 |
| **On screen AR** | «إننا نولي بيئتنا جل اهتمامنا / لأنها جزء عضوي من بلادنا وتاريخنا وتراثنا» — set exactly as the source, with no added tashkeel. Credit: «الوالد المؤسس المغفور له الشيخ زايد بن سلطان آل نهيان، طيّب الله ثراه» · «اليوم الوطني الأول للبيئة · فبراير 1998». In the build the year is an LTR isolate: `'اليوم الوطني الأول للبيئة · فبراير ' + ltr('1998')` |
| **On screen EN** | "We cherish our environment because it is an integral part of our country, our history and our heritage." THE LATE SHEIKH ZAYED BIN SULTAN AL NAHYAN · FOUNDING FATHER OF THE UAE · FIRST NATIONAL ENVIRONMENT DAY · FEBRUARY 1998 |
| **VO** | None. The room reads; the narrator never voices a leader's words |
| **Music** | Everything drops to a held D–A fifth in high strings; the ney plays the Suhail motif once, slowly. No percussion, no effects |
| **Transition out** | `iris` at the radar scope's screen point (555, 675), 1.6 s, traced by the gold ring. The pulse enters on 45.0 |
| **Sources** | Arabic: Aletihad 2012 (src-68), matching Al Bayan, 4 Feb 2000. English: the official rendering used by MoFA (src-13). Occasion, first National Environment Day, 8 February 1998: Al Bayan 2000; The National |

### B07 · 45.00–53.33 · 2007: one national center

| | |
|---|---|
| **Scene** | `centre` (v3 V): the radar tower and dome, the flat radar scope (rings about art 1430, 700), the anemometer turning, the logbook. The logbook's page carries only «2007» in ink. v3's record figures are removed from this plate; no decree facsimile, signature, seal or emblem appears |
| **Camera** | Left-plate framing, pushing from s 1.00 to 1.12 onto the scope, which ends centred near screen (554, 689) for the match |
| **On screen** | 45.9 (B): «المرسوم بقانون اتحادي رقم (6) لسنة 2007» / FEDERAL DECREE-LAW NO. 6 OF 2007. **50.4 (A, big words): «مركزٌ وطنيٌّ واحد» / ONE NATIONAL CENTER** (out at 52.9) |
| **VO** (45.3–51.7) | «في عام 2007، جمعتِ الدولةُ خدماتِ الأرصادِ وأبحاثَ الغلافِ الجوي في مركزٍ وطنيٍّ واحد،» / "In 2007 the nation brought its weather service and atmospheric research together in one national center," |
| **Music** | **The pulse enters on 45.0:** a radar tick in eighths, a string ostinato in tempered D Dorian, soft timpani. A quill scratch on «2007». The anemometer cups whir under a low radar hum. A horn swell under the big words |
| **Transition out** | `iris` from the scope's centre into the map (1.6 s). The map opens with the headquarters at the scope's screen point |
| **Sources** | The 2007 merger of the forecasting department and the rain-enhancement research department (src-18, src-19). Decree-Law No. 6 of 2007 (src-20). The page's wording (§2) |

### B08 · 53.33–65.00 · Seven emirates, one official source

| | |
|---|---|
| **Scene** | `nation` (built, `scenes/map-nation.js`, from `data/uae-map.js`) |
| **Visual** | The coast inks first, longest line first, then the islands, then the emirate borders as fine dashes. **Abu Musa, Greater Tunb and Lesser Tunb are drawn as UAE territory.** Musandam and Madha are left to Oman and Nahwa is drawn as Sharjah's. The neighbours (Oman, Saudi Arabia, Qatar) are faint and unnamed, and Iran is not drawn. The seas are «الخليج العربي» / ARABIAN GULF and «بحر عُمان» / SEA OF OMAN, with the sea in fine horizontal engraving. The headquarters in Al Shawamekh lights with a gold star. **57.5: a gold ring widens from it at 160 km/s and names each emirate as it reaches the capital**: Abu Dhabi +0.20 s (31 km), Dubai +0.74 (118 km), Sharjah +0.87 (138 km), Ajman +0.90 (145 km), Umm Al Quwain +1.03 (165 km), Fujairah +1.20 (192 km), Ras Al Khaimah +1.30 (208 km). All seven names are the same size and hold together. 59.5: the ten airports with NCM aviation-weather offices appear as small squares, with a key. **No radar marks are drawn** (see Appendix A) |
| **Camera** | Starts close on the headquarters (s 2.2) at the scope's old screen point, and pulls out to the whole country by 57.0; then a 2% drift |
| **On screen** | Map names (Arabic 30 px, English 24 px, stacked in the Gulf on hairline leaders; Fujairah over the Sea of Oman): أبوظبي ABU DHABI · دبي DUBAI · الشارقة SHARJAH · عجمان AJMAN · أم القيوين UMM AL QUWAIN · رأس الخيمة RAS AL KHAIMAH · الفجيرة FUJAIRAH. Key (B, 59.8): «مكاتب الأرصاد الجوية في المطارات» / AVIATION WEATHER OFFICES AT AIRPORTS. Register (B, 60.0–64.0): «أكثر من 100 محطة أرصاد جوية · 9 رادارات طقس (2021)» / «23 محطة زلزالية (2023)» — 100+ WEATHER STATIONS · 9 WEATHER RADARS (2021) / 23 SEISMIC STATIONS (2023). 61.8 (A): «المرجعُ الرسميُّ للطقس» / THE OFFICIAL SOURCE FOR THE WEATHER |
| **VO** (53.6–63.2, completing the sentence) | «أسّسه بقانونٍ اتحاديٍّ المغفورُ له الشيخ خليفة بن زايد آل نهيان، طيّب الله ثراه، ليكونَ المرجعَ الرسميَّ للطقس في الإمارات السبع.» / "which the late Sheikh Khalifa bin Zayed Al Nahyan established in federal law as the official source for the weather across the seven emirates." |
| **Music** | A rising string figure. **Seven soft qanun harmonics, one per emirate, as the ring passes each capital**, all within 1.3 s. They land while Sheikh Khalifa's name is spoken; this is deliberate. A swell under the Level A words |
| **Transition out** | `iris` (1.6 s) opening from the Corniche's position on the map (the north-west shore of Abu Dhabi island) into the April plate |
| **Sources** | Decree-Law No. 6 of 2007, issued by the late Sheikh Khalifa, headquarters in Abu Dhabi (src-20, src-21). The only official body for meteorological services nationwide (src-27; Decree-Law Articles 4 and 13). Network counts with years (src-24, src-25). AvMet's ten airports (README VI; avmet.ae). Map geometry, the three islands and distances: `data/uae-map.json` (the distances are computed from its capital points and the headquarters point) |

### B09 · 65.00–81.67 · April 2024

| | |
|---|---|
| **Scene** | `homes` (v3 IX, revised). Abu Dhabi's Corniche across the water, to one scale from CTBUH heights: WTC and Trust Tower, The Landmark, Nation Towers, ADNOC HQ, the Etihad Towers, and Emirates Palace at the west end. Along the top is **NCM's own warning map**: a strip of weather symbols (sun, cloud, rain, fog, dust, storm) |
| **Visual** | Day theme. 65.8–73.0: engraved cloud hatching builds and a grey multiply tint dims the parchment; fine, calm rain falls as diagonal engraving. **76.2: the storm symbol takes a steady red ring**, the red warning level and the only red in the film. It does not pulse, flash or ripple over the city. Windows stay as drawn. **Not shown:** phones, alert messages, sirens, flooded streets, damage, people in danger, lightning. 77.5–81.0: the rain thins, the tint lifts, and the sky clears as the remembrance line is spoken |
| **Camera** | A slow push, 1.00→1.06, that stops at 77.5 and holds still through the remembrance |
| **On screen** | 66.4–72.3 (B): «16 أبريل 2024 · أغزر أمطار منذ بدء جمع البيانات عام 1949» / 16 APRIL 2024 · THE HEAVIEST RAINFALL SINCE DATA COLLECTION BEGAN IN 1949. 72.8–77.6 (B): «14 أبريل · المركز ينبّه إلى تزايد عدم الاستقرار الجوي» / «16 أبريل · إنذار أحمر» — 14 APRIL · NCM WARNS OF GROWING INSTABILITY / 16 APRIL · RED ALERT. **No text from 77.6**, during the remembrance |
| **VO** | 66.0–72.0: «وفي أبريل 2024، شهدتِ الدولةُ أغزرَ أمطارٍ في سجلّاتها.» / "In April 2024 the country saw the heaviest rainfall in its records." · 72.6–77.2: «وكان المركزُ قد نبّه قبلها بيومين، ثمّ أصدرَ إنذاراً أحمر.» / "The Center had warned two days before, then issued a red alert." · 77.6–82.2 (carries 0.5 s across the cut): «نستذكرُ من فقدناهم، ونحيّي كلَّ من سهرَ على سلامةِ الناس.» / "We remember those we lost, and we salute all who stayed awake for others' safety." (For the alternate without the loss, see §6) |
| **Music** | **The pulse stops at 65.0.** A cello pedal on D, one felt-piano note per bar, and close, gentle rain with a distant sea. 76.2: one low cello note with the red ring, and no alert tone. 77.6: the strings warm toward F under the remembrance. **No thunder, no siren, no alert-like motif, no LFE.** Some of the audience lived that week, and in 2026 alert tones mean missile warnings |
| **Transition out** | Fade (1.0 s) into the airport in morning fog |
| **Sources** | Heaviest rainfall since data collection began in 1949 (src-28, WAM 16 Apr 2024). NCM warned two days earlier of growing instability (src-30, WAM 14 Apr 2024). Red alert, 16 April (src-31). Left out on purpose: 254.8 mm (kept for the MC and the press), WMO's "24 hours' notice cuts damage by 30%" (it would read as an NCM outcome), and any seeding image or word (src-49) |

### B10 · 81.67–86.67 · For every flight

| | |
|---|---|
| **Scene** | `airport` (v3 VI), entering with `offset` so only the key motion plays: Zayed International from runway 31L in the runway's own perspective. Fog lifts off Terminal A's dune-like roof and the crescent tower, both at true size on the horizon. A widebody arrival crosses the threshold at about 15 m, gear down, and flares onto the touchdown zone at about 86.0. A windsock. The "109 M" and "RUNWAY 31L" texture labels are removed |
| **Camera** | Left-plate framing, a push 1.00→1.05 toward the touchdown zone |
| **On screen** | 82.6 (B): «مطار زايد الدولي · أبوظبي» / ZAYED INTERNATIONAL AIRPORT · ABU DHABI. 84.0 (A): «لكلِّ رحلةٍ، رصدٌ لا ينام» / FOR EVERY FLIGHT, A WATCH THAT NEVER SLEEPS. 84.4 (B): «رصد جوي على مدار الساعة» / 24-HOUR AVIATION WEATHER WATCH |
| **VO** (83.4–85.8) | «لكلِّ رحلةٍ، رصدٌ لا ينام،» / "For every flight, a watch that never sleeps;" |
| **Music** | 81.67: the sky clears and a warm chord resolves; the oud states the motif. **83.33: the working-day drive begins** (strings in eighths, light tabl). A turbofan approach falls in pitch, with a soft wheel chirp at touchdown (about 86.0), mixed low |
| **Transition out** | Cut on 86.67 (0.5 s whole-layer dissolve) |
| **Sources** | AvMet: NCM's 24-hour aviation weather watch, with offices at 10 airports; NCM is the Meteorological Watch Office for the Emirates FIR (README VI; UAE AIP GEN 3.5). Terminal, tower and runway geometry (README, "Drawn from real places") |

### B11 · 86.67–91.67 · For every ship

| | |
|---|---|
| **Scene** | `port` (v3 VII): Jebel Ali from the water. A container ship at berth; quay cranes seen end-on with their booms spanning her beam, working her bays; one idle crane with its boom raised; a harbour tug; a buoy riding on the waterline. The "WAVE HEIGHT" texture label is removed |
| **Camera** | A gentle truck along the quay following a crane trolley |
| **On screen** | 87.0 (B): «ميناء جبل علي · دبي» / JEBEL ALI PORT · DUBAI. 88.2 (A): «لكلِّ سفينة» / FOR EVERY SHIP. 88.6 (B): «توقعات بحرية لخمسة أيام · منذ 2018» / 5-DAY MARINE FORECASTS · SINCE 2018 |
| **VO** (87.1–89.8) | «ولكلِّ سفينةٍ، توقعاتٌ بحريةٌ لخمسةِ أيام،» / "for every ship, a five-day marine forecast;" |
| **Music** | A tabl accent on the cut; a low, distant ship's horn pitched to D; crane hum and one container clank on the beat |
| **Transition out** | Cut on 91.67 (0.5 s) |
| **Sources** | Al Bahar five-day marine forecasts since 2018 (README VII; The National, 22 Oct 2018). The place stands for the sector: no NCM service specific to Jebel Ali is claimed (README). The service's Arabic brand name is not used until NCM confirms it |

### B12 · 91.67–96.67 · For clean energy

| | |
|---|---|
| **Scene** | `energy` (v3 VIII): Shams 1 near Madinat Zayed. Rows of parabolic troughs turn east to west and fold the sun onto their receiver tubes; the power block with its air-cooled condenser; a pyranometer and a 10 m anemometer mast. The texture labels become bilingual at readable size or are removed |
| **Camera** | A slow tilt up from the troughs to the sun disc (1.00→1.05) |
| **On screen** | 92.0 (B): «شمس 1 · مدينة زايد، أبوظبي» / SHAMS 1 · MADINAT ZAYED, ABU DHABI. 93.2 (A): «للطاقة النظيفة» / FOR CLEAN ENERGY. 93.6 (B): «توقعات لمحطات الطاقة الشمسية وطاقة الرياح» / FORECASTS FOR SOLAR PLANTS AND WIND FARMS |
| **VO** (92.1–94.9) | «وللطاقةِ النظيفة، تنبؤاتٌ بالشمسِ والرياح.» / "for clean energy, forecasts of sun and wind." |
| **Music** | Tracker hum and the anemometer's whirr; a brass swell to 95.8, where the drive drops out |
| **Transition out** | Fade (1.2 s). Optionally the gold `RING` circles the sun disc and carries it into the next card's star halo |
| **Sources** | NCM forecasts for solar plants and wind farms (README VIII; Abu Dhabi Department of Energy, 26 Jan 2025). Plant geometry (README). No NCM service to Shams 1 is claimed |

### B13 · 96.67–105.00 · Card: HH the President (reported speech)

| | |
|---|---|
| **Scene** | `quote` with a new **`reported`** style: the same card design, but **no quotation marks**. The text is the news agency's reported speech, and it begins with the reporting verb, so it cannot be read as a verbatim quotation |
| **Timing** | 97.3 the Arabic inks; 99.6 the English; 101.0 the credit; hold to 104.4 |
| **On screen AR** | «أكّد صاحب السمو الشيخ محمد بن زايد آل نهيان، رئيس الدولة، حفظه الله، / أن المياه تشكّل أهمية كبرى تفوق أهمية النفط بالنسبة إلى الإمارات». Credit: «ديسمبر 2011، حين كان سموّه ولياً لعهد أبوظبي · وام» |
| **On screen EN** | His Highness Sheikh Mohamed bin Zayed Al Nahyan, President of the UAE, stressed that water is more important than oil for the UAE. DECEMBER 2011, AS CROWN PRINCE OF ABU DHABI · WAM |
| **VO** | None |
| **Music** | Suspended: a string pad with an oud harmonic; no percussion |
| **Transition out** | Fade (1.2 s) into the seeding plate |
| **Why here** | The storm and seeding are separated by the whole working day (about 23 s) and this card. The President's words turn the story from warning to water, in protocol order: the Founding Father (B06), the late Sheikh Khalifa (B08, in the VO), the President (B13), then HH Sheikh Mansour (B16). The thematic bridge runs energy, then oil, then water |
| **Sources** | src-34 (Emirates 24\|7, relaying WAM, 13 Dec 2011). Arabic agency text: Emarat Al Youm, 13 and 14 Dec 2011. The quotes research found it only as reported speech, so it carries no quotation marks. His title and the "as Crown Prince" wording follow the page (§3) |

### B14 · 105.00–111.67 · More rain from the clouds

| | |
|---|---|
| **Scene** | `seeding` (v3 X, revised). The ground becomes the **Hajar skyline with Jebel Hafeet**, borrowed from the falaj plate's elevation-model profile, because the operational programme began over the Hajar. A cumulus builds; the seeding aircraft flies level beneath its base in the updraft. Salt flares burn on the wing racks as soft plumes that rise *into* the cloud, never as sparks or anything that detaches. Droplets gather at the base, then a modest rain shaft falls on dry foothills. The aircraft type and markings follow NCM reference photos [to supply]; until then no livery is drawn |
| **Camera** | A slow lateral track with the aircraft; it ends with a droplet at the cloud base at the screen point where B15's particle will sit |
| **On screen** | 106.0–108.8 (B): «أقل من 100 ملم من المطر في العام المعتاد» / LESS THAN 100 MM OF RAIN IN A TYPICAL YEAR. 109.2 (B): «أول تجربة استمطار في الدولة · فبراير 1982 · في أنحاء الدولة طوال العام منذ 2010» / THE UAE'S FIRST CLOUD-SEEDING TRIAL · FEBRUARY 1982 · NATIONWIDE, ALL YEAR, SINCE 2010. Cartouche on the plate: «جبال الحجر» / HAJAR MOUNTAINS |
| **VO** (105.5–112.4) | «وفي أرضٍ يقلُّ مطرُها عن مئةِ ملّيمتر في العامِ المعتاد، سعينا إلى مطرٍ أوفر من السحاب.» / "In a land with less than 100 millimetres of rain in a typical year, we sought more rain from the clouds." |
| **Music** | The pulse returns as pizzicato eighths. A turboprop passes across the front channels; a soft flare fizz at about 107.5 |
| **Transition out** | `iris` (1.2 s) opening from the droplet's screen point: the droplet becomes the seeding nanoparticle |
| **Sources** | Less than 100 mm in a typical year (src-29). The UAE's first trial, February 1982, by Abu Dhabi Municipality before NCM existed, so "the UAE's", not "NCM's" (src-44). Operations began over the Hajar in 2002; nationwide and all year since 2010; natural-salt flares (src-47). No seeding percentage, mission count or aircraft count is shown (the sources conflict or are caveated) |

### B15 · 111.67–116.67 · The science of rain

| | |
|---|---|
| **Scene** | `science` (v3 XI, revised): a plate of four engraved figures: the seeding nanomaterial (a salt core with a titanium-dioxide shell), a droplet growing on a salt nucleus, the numerical model on the *Atmosphere* supercomputer, and machine learning as a node lattice. **No drone and no laser**, which in 2026 could read as weapons. The figure captions are texture and carry no numbers |
| **Camera** | A pull-back from the particle (Fig. I) to the whole plate |
| **On screen** | 112.4 (B): «برنامج الإمارات لبحوث علوم الاستمطار · منذ 2015» / UAE RESEARCH PROGRAM FOR RAIN ENHANCEMENT SCIENCE · SINCE 2015. 113.4 (B): «17 مشروعاً بحثياً في ست دورات · 2016–2026» / 17 RESEARCH PROJECTS IN SIX CYCLES · 2016–2026 |
| **VO** (113.0–117.0) | «ثمّ استثمرنا في العلمِ نفسِه، لكلِّ بلدٍ يواجهُ الجفاف.» / "Then we invested in the science itself, for every country facing drought." |
| **Music** | Celesta particles and qanun arpeggios; a detent click on the iris |
| **Transition out** | Fade (1.2 s) to the card. The VO ends as the card's star draws |
| **Sources** | UAEREP launched January 2015 under the patronage of HH Sheikh Mansour bin Zayed Al Nahyan (src-53). 17 projects in six cycles (src-40, src-54). The core-shell nanomaterial (src-56). "Invest in the science itself" is the page's framing (§4). "8 patents" is not shown: the source says "obtained and filed" and gives no date |

### B16 · 116.67–125.00 · Card: HH Sheikh Mansour bin Zayed

| | |
|---|---|
| **Scene** | `quote` (built), the twin of B06. A context kicker sits above the top rule, outside the quotation |
| **Timing** | 117.3 the kicker; 117.6 the Arabic inks; 119.8 the English; 121.4 the credit; hold to 124.4 |
| **On screen AR** | Kicker: «عن برنامج الإمارات لبحوث علوم الاستمطار». Quote: «اليوم، أصبح البرنامج منصة عالمية تجمع العقول، / وتنتج حلولاً نوعية تعزز الأمن المائي، / وتمهّد لمستقبل أكثر استدامة». Credit: «سمو الشيخ منصور بن زايد آل نهيان» · «نائب رئيس الدولة، نائب رئيس مجلس الوزراء، رئيس ديوان الرئاسة» · «مايو 2026» |
| **On screen EN** | ON THE UAE RESEARCH PROGRAM FOR RAIN ENHANCEMENT SCIENCE. "Today, the programme has become a global platform that brings minds together and produces distinctive solutions that strengthen water security and pave the way for a more sustainable future." HIS HIGHNESS SHEIKH MANSOUR BIN ZAYED AL NAHYAN · VICE PRESIDENT, DEPUTY PRIME MINISTER AND CHAIRMAN OF THE PRESIDENTIAL COURT · MAY 2026 · TRANSLATED FROM THE ARABIC |
| **VO** | None |
| **Music** | A low wordless choir hum with strings; no percussion |
| **Transition out** | `iris` (1.4 s) from the globe's centre. The orchestra lands on 125.0 |
| **Sources** | src-59 (Al Khaleej, 13 May 2026), matched word for word to the cited article. There is no official English, so the line is marked "translated from the Arabic". `data/quotes.js` must be switched from the January 2025 forum quote to this one (Appendix A); that quote stays as the approved fallback (§11) |

### B17 · 125.00–136.67 · From the skies of the Emirates to the world

| | |
|---|---|
| **Scene** | `world` (v3 XII, as rebuilt): an engraved globe turning, with the armillary ring and its small satellite. Partners appear as **pins, not trajectories**. One quiet dotted thread runs from Abu Dhabi to Geneva, the seat of the WMO. It draws once and stays still, with no moving head. There are no arcs to Kazakhstan, which would cross Iran and could read as missile tracks. Abu Dhabi carries the gold star |
| **Camera** | Left-plate framing. A slow push toward Geneva from 129.0 to 132.5, then a pull back to the whole globe by 135.5 |
| **On screen** | **127.2 (A, big words): «من سماء الإمارات إلى العالم» / FROM THE SKIES OF THE EMIRATES TO THE WORLD** (out at 130.4). Pins (B, on the plate, 30 px Arabic and 24 px English): «جنيف» GENEVA · WMO (127.8) · «تركستان، كازاخستان · 2026» TURKISTAN, KAZAKHSTAN · 2026 (128.6) · «المغرب · 2025» MOROCCO · 2025 (129.2) · «لاهور، باكستان · 2023» LAHORE, PAKISTAN · 2023 (129.8). 130.8 (B): «رئاسة المنظمة العالمية للأرصاد الجوية · 2023–2027» / PRESIDENCY OF THE WORLD METEOROLOGICAL ORGANIZATION · 2023–2027. 134.8 (B): «معالي الدكتور عبدالله أحمد المندوس» / HIS EXCELLENCY DR ABDULLA AHMED AL MANDOUS (out at 136.3) |
| **VO** | 125.6–128.8: «واليوم، من سماءِ الإماراتِ إلى العالم:» / "And today, from the skies of the Emirates to the world," · 129.0–136.6: «ويرأسُ المنظمةَ العالميةَ للأرصادِ الجوية، لأوّلِ مرةٍ من دولِ مجلسِ التعاونِ الخليجي، معالي الدكتور عبدالله أحمد المندوس.» / "the first President of the World Meteorological Organization from the GCC: His Excellency Dr Abdulla Ahmed Al Mandous." The name is the last thing said |
| **Music** | The orchestra lands on 125.0 in F major, with a wordless male choir and frame drums; the brass carries the Suhail motif, harmonised. The first LFE bloom is orchestral, not an impact. Soft accents on each pin. **The apex comes as the name is spoken, then 136.6–139.4 is the applause room**: the music holds and the mixer rides it under the hall |
| **Transition out** | Circle lock (1.0 s): the globe's outline dissolves into the gauge's rim at the same screen centre and radius (`lockCam` from `CIRCLES.world` to a new `CIRCLES.gauge`) |
| **Sources** | Elected June 2023, term 2023–2027, the first meteorologist from the GCC (src-43; WMO). "Presides" is present tense and valid in March 2027: the term runs to the 20th World Meteorological Congress, tentatively June 2027 (re-check in February 2027). Kazakhstan: memorandum October 2025 and Turkistan pilot May 2026 (src-61, src-62). Morocco, joint research, December 2025 (src-63). Lahore, December 2023 (src-64). The honorific معالي follows the federal decree granting ministerial rank, 15 April 2026. He is never called "Minister" |

### B18 · 136.67–148.33 · Twenty years

| | |
|---|---|
| **Scene** | `gauge` (v3 XIII, revised): a rain gauge standing on the ground, graduated 2007–2027 (majors 2007, 2012, 2017, 2022, 2027), in golden light. The funnel mouth is drawn as an ellipse (rx 108, ry 16) to match the globe, with the water surface and the foot drawn consistently as seen from slightly above. A light, sparse passing shower (at most 40 streaks) ends by 139.0. **Twenty drops, one per year, fall into the funnel on sixteenth notes (0.2083 s apart) from 139.37; the level steps up one graduation per drop, and the twentieth lands on 2027 at 143.33.** The 2027 graduation takes a single gold glint that ramps over 0.6 s. A gold ring expands once from the rim |
| **Camera** | Pull back from the rim (s ≈3.1, where the rim equals the globe's size, to 1.00) from 136.67 to 139.0, then hold |
| **On screen** | 139.8 (A, small typewriter line, echoing the VO): «إلى المتنبئين والراصدين والطيارين والمهندسين والعلماء» / TO THE FORECASTERS, OBSERVERS, PILOTS, ENGINEERS AND SCIENTISTS. **143.5 (A, the largest type in the film): «عشرون عاماً»**; 143.8: TWENTY YEARS. All text out by 146.6 |
| **VO** | 139.4–142.9: «إلى المتنبئين والراصدين، والطيّارين والمهندسين والعلماء…» / "To the forecasters and observers, the pilots, engineers and scientists…" · 143.9–146.1: «عشرون عاماً من رصدِ السماء…» / "twenty years of watching the sky…" |
| **Music** | Harp and strings under the applause. From 139.37, twenty soft water notes on sixteenths rising up the scale, and a timpani roll from 141.67. **143.33: the hit.** Tutti with choir plays the Suhail motif on the dominant (A), so it opens rather than closes. The second and last LFE bloom. The music then recedes to strings and oud |
| **Transition out** | `dusk` (xf 3.0, centred on 148.33): the night sheet comes down from the top of the sky |
| **Sources** | 2007 (src-20) to 2027. The dedication is the page's closing sentence (§6), split across the hit |

### B19 · 148.33–158.33 · Night: the same star; title; lockup

| | |
|---|---|
| **Scene** | `finale` (built) then `outro` (the lockup slot). The real night sky over Abu Dhabi on the ceremony evening, facing due south. Suhail stands low in the south with Sirius high above it. **Computed: on 15 March 2027 at 20:00 Gulf time Canopus is 12.2° up at azimuth 187°; it transits 12.8° up at 19:15. By 23 March at 20:00 it is 11.0° up, and by 30 March 9.6°. The scene is recomputed for the real date and hour.** Along the horizon the Corniche skyline from B09 stands in silhouette with its windows lit: the same homes, now calm |
| **Visual** | 148.3–149.8: the dusk wipe. 150.8: **the gold ring closes around Suhail**, and the circle is complete. 153.33: the title. 155.0: the lockup fades in. 158.33: the last frame is identical to the hold loop's first frame |
| **Camera** | A slow push toward Suhail (1.00→1.04) that holds still from 153.33 |
| **On screen** | 151.2 (B): «سهيل» / SUHAIL. Optional small readout, computed: «سماء أبوظبي · مساء [تاريخ الحفل]» / THE SKY OVER ABU DHABI · [DATE], EVENING. **153.33, the title card:** «عشرون عاماً في قراءة السماء» (Noto Kufi Arabic 88 px, or hand-lettered, see §11), with TWENTY YEARS OF READING THE SKY (Cinzel 32 px) beneath. **155.0, the lockup:** [the official NCM logo, dark-ground version] · «المركز الوطني للأرصاد» / NATIONAL CENTER OF METEOROLOGY, set Arabic first and to equal width · «2007 — 2027» as an LTR isolate. Nothing sits in the bottom 15% except the skyline |
| **VO** (150.0–152.8) | «ليخطّطَ الوطنُ لغدِه بثقة.» / "so the nation can plan for tomorrow with confidence." |
| **Music** | Broad D major. Strings and horns play the Suhail motif in its major form, with the choir; a swell as the ring closes at 150.8. **153.33: the final chord on the tonic, the only full cadence in the film and the applause cue.** It rings out; B01's night wind returns; at 158.33 it settles into the hold pad |
| **Transition out** | Seamless into the stage-hold loop |
| **Sources** | The sky is computed from `data/stars.js`. The line is the page's closing dedication (§6). Skyline heights from CTBUH (README IX) |

---

## 6. Voice-over script (Arabic and English)

> **Superseded in part by Revision 2 and by `SCRIPT.md`** (the words and times as built). Where they differ, `SCRIPT.md` is right; this section records the original intent.

**Casting.** An Emirati narrator, mature, warm and unhurried: calm authority, not a trailer voice. The narrator reads formal MSA. Audition three voices, male and female, on B09 and B19; NCM decides.

**Recording.** Record to picture, dry, at 48 kHz / 24-bit, with three takes per line plus wild lines for the cut-downs. The Arabic averages 2.07 words a second while speaking (the per-line check is in the table below). Read numbers in full: «ألفين وسبعة», «ألفين وأربعة وعشرين».

**Editorial.** A native Arabic editor makes the final style and tashkeel pass on the narrator's copy before the session. On-screen Arabic carries no tashkeel except «دَرّاً» where it is used.

**Pronunciation sheet:** سُهَيْل · الدُّرُور · جُلْفار · ابنُ ماجِد · الكَوْس · السُّهَيْلي · الأفلاج · هيلي · تركستان · المندوس.

**English master (M3).** An English narrator records the English column to the same in and out points. Three short English lines (VO-08c, VO-09, VO-14a) run 3.3–3.4 words a second; a ±0.3 s tolerance is allowed there.

| # | In–out (s) | Arabic (narrator's copy) | English (M3 VO and subtitles) | Source |
|---|---|---|---|---|
| VO-01 | 2.2–7.8 | قبل الراداراتِ والأقمارِ الاصطناعيةِ بزمنٍ طويل، قرأ أهلُ هذه الأرضِ السماءَ… ليعيشوا. | Long before radar and satellites, the people of this land read the sky… to live. | page §1 |
| VO-02 | 12.3–17.8 | ومن طلوعِ سهيلٍ عدّوا أيامَ السنة، ومواسمَ الزرعِ والبحرِ والمطر. | From Suhail's rising they counted the year, and the seasons for planting, the sea and rain. | src-1, src-2 |
| VO-03 | 18.6–24.2 | ومن جُلفار، وقّتَ ابنُ ماجد أسفارَه على الموسم، وقاسَ ارتفاعَ النجومِ بالأصابع. | From Julfar, Ibn Majid timed his voyages by the monsoon and measured star heights in fingers. | src-3 to src-6 |
| VO-04 | 24.6–27.0 | وعرفَ البحّارةُ كلَّ ريحٍ باسمها. | Sailors knew every wind by name. | src-8 |
| VO-05 | 29.0–36.6 | وفي العين، تقاسموا الماءَ بالأفلاج، وأحياها المغفورُ له الشيخ زايد بن سلطان آل نهيان، طيّب الله ثراه. | In Al Ain they shared out the water through the aflaj, and the late Sheikh Zayed bin Sultan Al Nahyan restored them. | src-10, src-12 |
| — | 36.7–45.0 | *(card: the Founding Father; no VO)* | | |
| VO-06 | 45.3–51.7 | في عام 2007، جمعتِ الدولةُ خدماتِ الأرصادِ وأبحاثَ الغلافِ الجوي في مركزٍ وطنيٍّ واحد، | In 2007 the nation brought its weather service and atmospheric research together in one national center, | src-18, src-19 |
| VO-07 | 53.6–63.2 | أسّسه بقانونٍ اتحاديٍّ المغفورُ له الشيخ خليفة بن زايد آل نهيان، طيّب الله ثراه، ليكونَ المرجعَ الرسميَّ للطقس في الإمارات السبع. | which the late Sheikh Khalifa bin Zayed Al Nahyan established in federal law as the official source for the weather across the seven emirates. | src-20, src-21, src-27 |
| VO-08a | 66.0–72.0 | وفي أبريل 2024، شهدتِ الدولةُ أغزرَ أمطارٍ في سجلّاتها. | In April 2024 the country saw the heaviest rainfall in its records. | src-28 |
| VO-08b | 72.6–77.2 | وكان المركزُ قد نبّه قبلها بيومين، ثمّ أصدرَ إنذاراً أحمر. | The Center had warned two days before, then issued a red alert. | src-30, src-31 |
| VO-08c | 77.6–82.2 | نستذكرُ من فقدناهم، ونحيّي كلَّ من سهرَ على سلامةِ الناس. | We remember those we lost, and we salute all who stayed awake for others' safety. | — (tribute; claims nothing) |
| *alt* VO-08c | 77.6–82.2 | نستذكرُ تلك الأيام، ونحيّي كلَّ من سهرَ على سلامةِ الناس. | We remember those days, and we salute all who stayed awake for others' safety. | — (for NCM to choose, §11) |
| VO-09 | 83.4–85.8 | لكلِّ رحلةٍ، رصدٌ لا ينام، | For every flight, a watch that never sleeps; | README VI |
| VO-10 | 87.1–89.8 | ولكلِّ سفينةٍ، توقعاتٌ بحريةٌ لخمسةِ أيام، | for every ship, a five-day marine forecast; | README VII |
| VO-11 | 92.1–94.9 | وللطاقةِ النظيفة، تنبؤاتٌ بالشمسِ والرياح. | for clean energy, forecasts of sun and wind. | README VIII |
| — | 96.7–105.0 | *(card: HH the President, reported speech; no VO)* | | |
| VO-12 | 105.5–112.4 | وفي أرضٍ يقلُّ مطرُها عن مئةِ ملّيمتر في العامِ المعتاد، سعينا إلى مطرٍ أوفر من السحاب. | In a land with less than 100 millimetres of rain in a typical year, we sought more rain from the clouds. | src-29, src-47 |
| VO-13 | 113.0–117.0 | ثمّ استثمرنا في العلمِ نفسِه، لكلِّ بلدٍ يواجهُ الجفاف. | Then we invested in the science itself, for every country facing drought. | src-53, page §4 |
| — | 116.7–125.0 | *(card: HH Sheikh Mansour bin Zayed; no VO)* | | |
| VO-14a | 125.6–128.8 | واليوم، من سماءِ الإماراتِ إلى العالم: | And today, from the skies of the Emirates to the world, | src-61 to src-64 |
| VO-14b | 129.0–136.6 | ويرأسُ المنظمةَ العالميةَ للأرصادِ الجوية، لأوّلِ مرةٍ من دولِ مجلسِ التعاونِ الخليجي، معالي الدكتور عبدالله أحمد المندوس. | the first President of the World Meteorological Organization from the GCC: His Excellency Dr Abdulla Ahmed Al Mandous. | src-43 |
| — | 136.6–139.4 | *(applause room; no VO)* | | |
| VO-15a | 139.4–142.9 | إلى المتنبئين والراصدين، والطيّارين والمهندسين والعلماء… | To the forecasters and observers, the pilots, engineers and scientists… | page §6 |
| VO-15b | 143.9–146.1 | عشرون عاماً من رصدِ السماء… | twenty years of watching the sky… | page §6 |
| VO-16 | 150.0–152.8 | ليخطّطَ الوطنُ لغدِه بثقة. | so the nation can plan for tomorrow with confidence. | page §6 |

**Totals.** 199 Arabic words and 264 English words (the main lines, not the alternate). The voice is present for about 96 s of 158 s; the rest is picture, music, the three silent cards, the applause room and the open.

**Leaders' words are never voiced by the narrator.** They appear only on the cards, verbatim, and the narrator speaks only honorifics and names (Sheikh Zayed, Sheikh Khalifa, Dr Al Mandous).

---

## 7. On-screen text (Arabic and English)

> **Superseded in part by Revision 2 and by `SCRIPT.md`** (the words and times as built). Where they differ, `SCRIPT.md` is right; this section records the original intent.

Level A echoes the voice; Level B is a label; "Card" marks leadership text. Every entry below goes to `subtitles.py` and to the sign-off sheet. In the Arabic column every number and Latin run is an LTR isolate in the build.

| In–out (s) | Level | Arabic | English | Source · year |
|---|---|---|---|---|
| 8.8–11.0 | B | سهيل | SUHAIL · CANOPUS | computed sky |
| 13.2–18.0 | B | حساب الدرور · 36 × 10 + 5 | THE DUROUR CALENDAR · 36 × 10 DAYS + 5 | src-1 |
| 15.6–18.0 | A | عدّوا أيام السنة | THEY COUNTED THE DAYS OF THE YEAR | VO-02 |
| 19.0–23.0 | B | أحمد بن ماجد · جلفار، رأس الخيمة · نحو 1490 | AHMAD IBN MAJID · JULFAR, RAS AL KHAIMAH · c. 1490 | src-3, src-4 |
| 24.6–28.0 | B | الغوص الكبير · من يونيو إلى سبتمبر | THE GREAT DIVE · JUNE TO SEPTEMBER | src-7, src-9 |
| 25.8–28.0 | B (on the rose) | الشمال · الكوس · السهيلي | SHAMAL · KAUS · SUHAILI | src-8 |
| 26.8–28.0 | A | كلُّ ريحٍ باسمها | EVERY WIND BY NAME | VO-04 |
| 29.4–33.0 | B | هيلي، العين · العصر الحديدي | HILI, AL AIN · IRON AGE | src-10 |
| 31.0–33.0 | B | مواقع العين الثقافية · التراث العالمي لليونسكو، 2011 | CULTURAL SITES OF AL AIN · UNESCO WORLD HERITAGE, 2011 | src-10, src-11 |
| 37.3–44.4 | Card | «إننا نولي بيئتنا جل اهتمامنا لأنها جزء عضوي من بلادنا وتاريخنا وتراثنا» · الوالد المؤسس المغفور له الشيخ زايد بن سلطان آل نهيان، طيّب الله ثراه · اليوم الوطني الأول للبيئة · فبراير 1998 | "We cherish our environment because it is an integral part of our country, our history and our heritage." · THE LATE SHEIKH ZAYED BIN SULTAN AL NAHYAN · FOUNDING FATHER OF THE UAE · FIRST NATIONAL ENVIRONMENT DAY · FEBRUARY 1998 | src-68, src-13; Al Bayan 2000 |
| 45.9–52.9 | B | المرسوم بقانون اتحادي رقم (6) لسنة 2007 | FEDERAL DECREE-LAW NO. 6 OF 2007 | src-20 |
| 45.9–52.9 | B (logbook) | 2007 | 2007 | src-20 |
| 50.4–52.9 | A (big) | مركزٌ وطنيٌّ واحد | ONE NATIONAL CENTER | VO-06 |
| 57.7–64.0 | B (map) | أبوظبي · دبي · الشارقة · عجمان · أم القيوين · رأس الخيمة · الفجيرة | ABU DHABI · DUBAI · SHARJAH · AJMAN · UMM AL QUWAIN · RAS AL KHAIMAH · FUJAIRAH | uae-map.json |
| 56.0–64.0 | B (map) | الخليج العربي · بحر عُمان | ARABIAN GULF · SEA OF OMAN | protocol §4 |
| 59.8–64.0 | B | مكاتب الأرصاد الجوية في المطارات | AVIATION WEATHER OFFICES AT AIRPORTS | README VI |
| 60.0–64.0 | B | أكثر من 100 محطة أرصاد جوية · 9 رادارات طقس (2021) / 23 محطة زلزالية (2023) | 100+ WEATHER STATIONS · 9 WEATHER RADARS (2021) / 23 SEISMIC STATIONS (2023) | src-24 (2021), src-25 (2023) |
| 61.8–64.0 | A | المرجعُ الرسميُّ للطقس | THE OFFICIAL SOURCE FOR THE WEATHER | VO-07; src-27 |
| 66.4–72.3 | B | 16 أبريل 2024 · أغزر أمطار منذ بدء جمع البيانات عام 1949 | 16 APRIL 2024 · THE HEAVIEST RAINFALL SINCE DATA COLLECTION BEGAN IN 1949 | src-28 (2024) |
| 72.8–77.6 | B | 14 أبريل · المركز ينبّه إلى تزايد عدم الاستقرار الجوي / 16 أبريل · إنذار أحمر | 14 APRIL · NCM WARNS OF GROWING INSTABILITY / 16 APRIL · RED ALERT | src-30, src-31 (2024) |
| 77.6–82.6 | — | *(no text during the remembrance)* | | |
| 82.6–86.3 | B | مطار زايد الدولي · أبوظبي | ZAYED INTERNATIONAL AIRPORT · ABU DHABI | README VI |
| 84.0–86.3 | A | لكلِّ رحلةٍ، رصدٌ لا ينام | FOR EVERY FLIGHT, A WATCH THAT NEVER SLEEPS | VO-09 |
| 84.4–86.3 | B | رصد جوي على مدار الساعة | 24-HOUR AVIATION WEATHER WATCH | README VI |
| 87.0–91.3 | B | ميناء جبل علي · دبي | JEBEL ALI PORT · DUBAI | README VII |
| 88.2–91.3 | A | لكلِّ سفينة | FOR EVERY SHIP | VO-10 |
| 88.6–91.3 | B | توقعات بحرية لخمسة أيام · منذ 2018 | 5-DAY MARINE FORECASTS · SINCE 2018 | README VII (2018) |
| 92.0–96.0 | B | شمس 1 · مدينة زايد، أبوظبي | SHAMS 1 · MADINAT ZAYED, ABU DHABI | README VIII |
| 93.2–96.0 | A | للطاقة النظيفة | FOR CLEAN ENERGY | VO-11 |
| 93.6–96.0 | B | توقعات لمحطات الطاقة الشمسية وطاقة الرياح | FORECASTS FOR SOLAR PLANTS AND WIND FARMS | README VIII (DoE 2025) |
| 97.3–104.4 | Card (reported) | أكّد صاحب السمو الشيخ محمد بن زايد آل نهيان، رئيس الدولة، حفظه الله، أن المياه تشكّل أهمية كبرى تفوق أهمية النفط بالنسبة إلى الإمارات · ديسمبر 2011، حين كان سموّه ولياً لعهد أبوظبي · وام | His Highness Sheikh Mohamed bin Zayed Al Nahyan, President of the UAE, stressed that water is more important than oil for the UAE. · DECEMBER 2011, AS CROWN PRINCE OF ABU DHABI · WAM | src-34; Emarat Al Youm 2011 |
| 106.0–108.8 | B | أقل من 100 ملم من المطر في العام المعتاد | LESS THAN 100 MM OF RAIN IN A TYPICAL YEAR | src-29 |
| 109.2–111.3 | B | أول تجربة استمطار في الدولة · فبراير 1982 · في أنحاء الدولة طوال العام منذ 2010 | THE UAE'S FIRST CLOUD-SEEDING TRIAL · FEBRUARY 1982 · NATIONWIDE, ALL YEAR, SINCE 2010 | src-44, src-47 |
| 106.0–111.3 | B (plate) | جبال الحجر | HAJAR MOUNTAINS | src-47 |
| 112.4–116.3 | B | برنامج الإمارات لبحوث علوم الاستمطار · منذ 2015 | UAE RESEARCH PROGRAM FOR RAIN ENHANCEMENT SCIENCE · SINCE 2015 | src-53 |
| 113.4–116.3 | B | 17 مشروعاً بحثياً في ست دورات · 2016–2026 | 17 RESEARCH PROJECTS IN SIX CYCLES · 2016–2026 | src-40, src-54 |
| 117.3–124.4 | Card | عن برنامج الإمارات لبحوث علوم الاستمطار · «اليوم، أصبح البرنامج منصة عالمية تجمع العقول، وتنتج حلولاً نوعية تعزز الأمن المائي، وتمهّد لمستقبل أكثر استدامة» · سمو الشيخ منصور بن زايد آل نهيان · نائب رئيس الدولة، نائب رئيس مجلس الوزراء، رئيس ديوان الرئاسة · مايو 2026 | ON THE UAE RESEARCH PROGRAM FOR RAIN ENHANCEMENT SCIENCE · "Today, the programme has become a global platform that brings minds together and produces distinctive solutions that strengthen water security and pave the way for a more sustainable future." · HIS HIGHNESS SHEIKH MANSOUR BIN ZAYED AL NAHYAN · VICE PRESIDENT, DEPUTY PRIME MINISTER AND CHAIRMAN OF THE PRESIDENTIAL COURT · MAY 2026 · TRANSLATED FROM THE ARABIC | src-59 |
| 127.2–130.4 | A (big) | من سماء الإمارات إلى العالم | FROM THE SKIES OF THE EMIRATES TO THE WORLD | VO-14a |
| 127.8–136.3 | B (pins) | جنيف · تركستان، كازاخستان · 2026 · المغرب · 2025 · لاهور، باكستان · 2023 | GENEVA · WMO · TURKISTAN, KAZAKHSTAN · 2026 · MOROCCO · 2025 · LAHORE, PAKISTAN · 2023 | src-62, src-63, src-64 |
| 130.8–136.3 | B | رئاسة المنظمة العالمية للأرصاد الجوية · 2023–2027 | PRESIDENCY OF THE WORLD METEOROLOGICAL ORGANIZATION · 2023–2027 | src-43 |
| 134.8–136.3 | B | معالي الدكتور عبدالله أحمد المندوس | HIS EXCELLENCY DR ABDULLA AHMED AL MANDOUS | src-43; decree, 15 Apr 2026 |
| 137.0–146.6 | B (gauge) | 2007 · 2012 · 2017 · 2022 · 2027 | 2007 · 2012 · 2017 · 2022 · 2027 | src-20 |
| 139.8–146.6 | A (small) | إلى المتنبئين والراصدين والطيارين والمهندسين والعلماء | TO THE FORECASTERS, OBSERVERS, PILOTS, ENGINEERS AND SCIENTISTS | VO-15a; page §6 |
| 143.5–146.6 | A (largest) | عشرون عاماً | TWENTY YEARS | VO-15b |
| 151.2–158.3 | B | سهيل | SUHAIL | computed sky |
| 151.2–158.3 | B (optional) | سماء أبوظبي · مساء [تاريخ الحفل] | THE SKY OVER ABU DHABI · [DATE], EVENING | computed sky; date to confirm |
| 153.33– | Title | عشرون عاماً في قراءة السماء | TWENTY YEARS OF READING THE SKY | the page's headline |
| 155.0– | Lockup | [شعار المركز] · المركز الوطني للأرصاد · 2007 — 2027 | [NCM LOGO] · NATIONAL CENTER OF METEOROLOGY · 2007 — 2027 | NCM brand |

**Glyph checks before lock.** Check «×», «—», «–» and «·» and the Western digits in Noto Kufi Arabic and Amiri. Set the «36 × 10 + 5» run in IBM Plex Mono if Noto Kufi draws «×» oddly, and zoom on the render. No ʿ or ʾ is used on screen (the monsoon plate's «ISBA‘» texture label is removed); "c." stands for "circa", not "~".

---

## 8. Music and sound brief

> **Superseded in part by Revisions 2 and 3.** The score as built is `score.py`: Emirati forms, cues placed from each beat's start, the world beat's peak on the national line (never on a name), no drums at night, on the cards or under April 2024. This section records the original brief.

### 8.1 Concept

"The sky has a pulse." An original, commissioned score recorded live, on a single 72 BPM grid (one bar = 3.333 s), so every cut, ring and hit lands on the beat. Energy changes through subdivision and orchestration, never through tempo. The existing synthesized `score.py` / `audio.py`, retimed to this map, is the temp track for the animatic.

**Key and modes.**
- The key centre is D throughout.
- **The heritage:** maqam Bayati on D. The E half-flat sits in the ney and the oud, and the orchestra leaves the second degree out of its harmony under those lines.
- **The Center:** tempered D Dorian.
- **April 2024:** stripped to a D pedal, with no dramatic mode.
- **The world:** it lifts to F major.
- **The twenty-year hit:** it lands on the dominant (A), so it opens rather than ends.
- **The finale:** D major with the ney's Bayati ornament on top, heritage and science in one chord. The only full cadence is the final tonic at 153.33.

**The Suhail motif** is a rising four-note figure: D, E half-flat, F, G. In the finale it takes its major form, D–E–F♯–G. It is heard on:
- the ney (0:08.3, Suhail rises);
- the oud (heritage, and the clearing sky at 1:21.7);
- the ney again (the Zayed card);
- the brass, harmonised (the world);
- tutti with choir (the twenty-year hit);
- strings and horns in major (the ring closes at 2:30.8).

### 8.2 Tempo map

| Bars | Time | Section | Feel | Instrumentation | Dynamic |
|---|---|---|---|---|---|
| 0–3.5 | 0:00.0–0:11.7 | Night | Free time on the grid; no pulse | Silence to 1.5, then a low D drone, desert wind, celesta glints; the ney motif and a choir hum at 8.33 | silence → pp → p |
| 3.5–11 | 0:11.7–0:36.7 | Inheritance | Half-time | Oud ostinato (Bayati), qanun runs, mirwas and tar kept light, sustained strings; the nahham at 27.0–28.6; pizzicato droplets in the falaj | p → mp |
| 11–13.5 | 0:36.7–0:45.0 | Zayed card | Suspended | Held D–A fifth in high strings, solo ney | pp |
| 13.5–19.5 | 0:45.0–1:05.0 | The Center | The pulse enters | Radar tick in eighths, string ostinato, soft timpani, horns; seven qanun harmonics on the map | mf |
| 19.5–24.5 | 1:05.0–1:21.7 | April 2024 | The pulse stops | Cello pedal on D, one felt-piano note per bar, gentle rain; strings warm toward F at 77.6 | p → pp |
| 24.5–29 | 1:21.7–1:36.7 | The working day | Drive from 83.33 | Warm chord and oud motif, then strings in eighths, light tabl, brass swell; the drive drops out at 95.8 | mp → f |
| 29–31.5 | 1:36.7–1:45.0 | President card | Suspended | String pad, oud harmonic | p |
| 31.5–35 | 1:45.0–1:56.7 | Rain and science | The pulse returns | Pizzicato eighths, qanun arpeggios, celesta | mp → mf |
| 35–37.5 | 1:56.7–2:05.0 | Mansour card | Suspended | Low wordless choir hum, strings | p |
| 37.5–41 | 2:05.0–2:16.7 | The world | Full | Orchestra in F, male choir (wordless), frame drums, the motif in the brass; apex at the name; applause room from 136.6 | f → ff |
| 41–44.5 | 2:16.7–2:28.3 | Twenty | Broadening, then the hit | Harp and strings; twenty water notes on sixteenths from 139.37; timpani roll from 141.67; the tutti hit on the dominant at 143.33; recedes to strings and oud | mp → ff → mp |
| 44.5–47.5 | 2:28.3–2:38.3 | Night | Broad, a slight ritardando into 153.33 | D major; strings, horns and choir; the final tonic chord at 153.33 rings out into the night wind | mf → p |

### 8.3 Hit points

| Time (s) | Bar | Picture | Music and sound |
|---|---|---|---|
| 0.0 | 0 | Black | Room tone only |
| 1.5 | 0.45 | Stars fade up | Sub drone, desert wind, celesta glints |
| **8.33** | **2.5** | **Suhail clears the dunes** | **Ney: the Suhail motif; choir hum swells** |
| 9.2 | 2.76 | The gold ring is born | Harp harmonic on D (the ring tone) |
| 11.67 | 3.5 | Dawn | First light chord; the oud enters |
| 18.33 | 5.5 | Wheel → rose | Qanun run lands; detent click |
| 23.33 | 7 | Rose → wind rose | Detent click; a wind gust pans |
| 27.0 | 8.1 | Pearling | The nahham's one-bar call |
| 28.33 | 8.5 | Sea → water table | Water trickle; pizzicato |
| 33.0 | 9.9 | Sheikh Zayed's name | The strings open |
| 36.67 | 11 | The Zayed card | Everything drops to a D–A fifth |
| **45.0** | **13.5** | **Iris into the scope** | **The pulse enters** |
| 50.4 | 15.1 | ONE NATIONAL CENTER | Horn swell |
| 57.7–58.8 | 17.3–17.6 | The ring names the seven emirates | Seven qanun harmonics, distance-timed |
| 65.0 | 19.5 | April 2024 | The pulse stops; cello pedal |
| 76.2 | 22.9 | The storm symbol's red ring | One low cello note (no alert tone) |
| 81.67 | 24.5 | The sky clears | Warm chord; oud motif |
| 83.33 | 25 | The drive | Strings in eighths, tabl |
| 86.0 | 25.8 | Touchdown | Soft wheel chirp |
| 86.67 / 91.67 | 26 / 27.5 | Cuts | Tabl accents; low ship's horn; tracker hum |
| 95.8 | 28.7 | Before the card | The drive drops out |
| 96.67 | 29 | President card | String pad |
| 105.0 | 31.5 | Seeding | Pizzicato returns; turboprop |
| 111.67 | 33.5 | Droplet → particle | Celesta; detent click |
| 116.67 | 35 | Mansour card | Choir hum |
| **125.0** | **37.5** | **The globe** | **The orchestra lands in F; first LFE bloom** |
| 127.8–129.8 | 38.3–38.9 | Pins | Soft timpani/tabl accents |
| 134.4–136.6 | 40.3–41 | Dr Al Mandous's name | Apex |
| 136.6–139.4 | 41–41.8 | Applause room | Music holds; the mixer rides under applause |
| 139.37–143.33 | 41.8–43 | Twenty drops | Twenty water notes on sixteenths; timpani roll |
| **143.33** | **43** | **The twentieth drop lands on 2027** | **Tutti hit on the dominant, choir, the motif; second and last LFE bloom** |
| 146.83 | 44.05 | Dusk | Recedes to strings and oud |
| 150.8 | 45.2 | The ring closes around Suhail | Swell; the motif in major |
| **153.33** | **46** | **Title** | **Final tonic chord; applause cue** |
| 155.0 | 46.5 | Lockup | The chord rings |
| 158.33 | 47.5 | End | Decays into the hold pad; the night wind returns |

### 8.4 Instrumentation

- **Strings:** about 16.14.12.10.8.
- **Brass, percussion and keys:**
  - 4 horns, 2 trombones and a bass trombone, warm and never martial.
  - Timpani, harp and celesta.
  - A felt piano, used only in April.
- **Soloists:** oud, qanun, ney.
- **Gulf percussion:** mirwas, tabl, tar/daf, jahla, and handclaps used sparingly.
- **Voices:**
  - A 12-voice male choir, humming only, so it never competes with the VO.
  - One *nahham* call, recorded by a practising performer with a cultural adviser. It must not imitate a specific recorded song.
- **Recording:** UAE-based musicians wherever possible.
- **Never used:**
  - the national anthem's melody (it is played in full and formally, separately, in the ceremony's running order);
  - sung lyrics or religious recitation;
  - bells of any church-bell timbre (qanun harmonics take their place);
  - pop "drops".

### 8.5 Sound design

- **Banned for the 2026–27 audience:**
  - thunder;
  - sirens and any real or imitation emergency-alert tone (the 853/960 Hz broadcast tone included);
  - explosions, booms and impact hits;
  - whooshes that could read as projectiles.
- **Kept, mixed low and literal:**
  - desert wind and sea wash;
  - sewn planks and rigging;
  - water in the falaj (recorded on location in Al Ain, with permission);
  - the anemometer's whir and the radar hum;
  - gentle rain;
  - the turbofan arrival and its wheel chirp;
  - a crane clank and a distant ship's horn;
  - tracker hum;
  - the turboprop and a soft flare fizz.
- **The detent click** is a small, soft brass click at each circle lock (18.33, 23.33, 45.0, 53.33, 111.67, 136.67), about −30 dB under the dialogue.
- **The burin scratch** sits only under the Durour wheel's first stroke and the title.

### 8.6 Mix and masters

- **Formats:** 5.1 (7.1 if the hall supports it) and stereo. The VO is always in the centre channel.
- **Surround use:** wind in the surrounds in the night scenes; rain stays on screen, so the hall is not put "inside the storm".
- **LFE** is used only for the felt drone in the open and the two orchestral blooms (125.0 and 143.33), never in April. Test it on site so the stage does not rattle.
- **The hall level** is set with the house engineer at the tech rehearsal (about 79–82 dB reference for a mid-size hall), so the front row hears the VO comfortably without low-frequency impact. The mixer rides the music under applause at 136.6 and keeps VO-15a intelligible.
- **Loudness:**
  - Broadcast and web masters: −23 LUFS integrated, −1 dBTP (EBU R128), or the broadcaster's spec.
  - Social: −14 LUFS stereo.

### 8.7 The Ramadan version

Ramadan 1448 is expected to begin on 8 February 2027, with Eid al-Fitr expected on 9 or 10 March, subject to moon sighting. If the ceremony falls in Ramadan, or in a declared mourning period, the mix changes:

- Drop the Gulf percussion and handclaps.
- Keep strings, oud, ney, qanun and the choir hum.
- Soften the 143.33 hit to strings, choir and timpani.
- The nahham call stays only on the cultural adviser's advice.

---

## 9. Protocol and compliance checklist

Legend for the status column:
- **[V]** verified on an official UAE source.
- **[S]** verified on a secondary source.
- **[U]** unverified: it must be confirmed with NCM protocol or the Presidential Court before picture lock (§11).

### 9.1 Leaders, honorifics and quotations

| Item | Rule | How the film complies | Status and source |
|---|---|---|---|
| The Founding Father | الوالد المؤسس المغفور له الشيخ زايد بن سلطان آل نهيان، طيّب الله ثراه / the late Sheikh Zayed bin Sultan Al Nahyan, Founding Father of the UAE | Full honorific in VO-05 and on the B06 card | [V] mohamedbinzayed.ae; WAM 2026 usage |
| The late Sheikh Khalifa | المغفور له الشيخ خليفة بن زايد آل نهيان، طيّب الله ثراه | Named in VO-07 as the issuer of Decree-Law No. 6 of 2007 | [V] src-20 (the decree-law) |
| HH the President | صاحب السمو الشيخ محمد بن زايد آل نهيان، رئيس الدولة، حفظه الله / His Highness Sheikh Mohamed bin Zayed Al Nahyan, President of the UAE. Spelled **Mohamed** | The B13 card. The 2011 date is shown "as Crown Prince of Abu Dhabi", following the page | [V] u.ae leaders page |
| HH Sheikh Mansour | سمو الشيخ منصور بن زايد آل نهيان، نائب رئيس الدولة، نائب رئيس مجلس الوزراء، رئيس ديوان الرئاسة (سمو, not صاحب السمو) / His Highness Sheikh Mansour bin Zayed Al Nahyan, Vice President, Deputy Prime Minister and Chairman of the Presidential Court | The B16 card, with the title current in May 2026 | [V] uaecabinet.ae; WAM Aug 2025, Jan 2026. Re-check on the event date [U] |
| Dr Al Mandous | معالي الدكتور عبدالله أحمد المندوس / His Excellency Dr Abdulla Ahmed Al Mandous. Ministerial **rank** (decree of 15 April 2026), not a Cabinet seat: never "Minister" or «وزير» | Name and WMO presidency only. **His NCM title is not shown**, because 2026 sources conflict between Director-General, Director and President of NCM | [V] WAM, 15 Apr 2026; The National, 6 May 2026. His NCM title [U] |
| Order | President, then Sheikh Mohammed bin Rashid, then Sheikh Mansour; the Founding Father first in a historical sequence | Chronological order is also precedence order: Zayed (B06) → Khalifa (B08) → the President (B13) → Sheikh Mansour (B16). Sheikh Mohammed bin Rashid is not referenced (see §11) | [V] WAM "رئيس الدولة ونائباه"; the Founding Father first [U] |
| Quotation practice | Arabic original first, verbatim; the official English if one exists, otherwise marked "translated from the Arabic"; credit with honorific, name, title, occasion and date; no paraphrase inside quotation marks; no invented quotes | Zayed: verbatim Arabic plus the official MoFA English. Mansour: verbatim Arabic plus "translated from the Arabic". **The President: reported speech with no quotation marks**, because the only source gives it as the agency's reported speech. The narrator never voices a leader's words | [S] quotes research: (a), (b), (c) |
| Likenesses | No generated or drawn depiction of national symbols or public figures without official approval | No faces, silhouettes, portraits, signatures or seals of any leader. Text-only cards. The only people drawn are anonymous historical figures (the diver and hauler) at small scale | [V] UAE Media Council, 25 Sep 2025; VIG official-portraits guideline |
| Clearance | Leaders' words cleared through the relevant office before lock | On the approvals list (§11) | [U] |

### 9.2 National symbols, map and identity

| Item | Rule | How the film complies | Status and source |
|---|---|---|---|
| The flag | Federal Law No. 2 of 1971; never altered, cropped, mirrored, textured or used as a background; nothing placed on it | **No flag is drawn in the film.** The stage carries the flags. Titles, credits and logos are never placed over a flag on the wall or in any cut-down | [V] uaelegislation.gov.ae; vig.gmo.gov.ae |
| The federal emblem | Not placed on images or video | Not used | [V] VIG video rules |
| The NCM logo | Logo only in the outro, with simple fades; entity name Arabic first, English second, set to equal width | Lockup at 155.0 with fades. The `outro` scene already sets the name to equal width. No partner logos on the ceremony master | [V] VIG; whether the VIG still applies under the National Media Authority [U] |
| The map outline | Trace from the Federal Geographic Information Center's General Map with its approved official borders | The working outline is geoBoundaries / OpenStreetMap data (ODbL), validated in `data/uae-map-check.png`. **It must be checked and signed off against the FGIC General Map before lock**, including the western border near Khor Al Udaid | [V] FGIC General Map, 5 Dec 2023; sign-off [U] |
| The three islands | Abu Musa (Sharjah) and Greater and Lesser Tunb (Ras Al Khaimah) are UAE islands occupied by Iran since 30 Nov 1971 | Drawn as UAE territory, with their emirates' fill. Iran is not drawn | [V] uae-embassy.org; the map-data record |
| Oman's territory | Musandam and Madha are Omani; Nahwa (inside Madha) is Sharjah's | Excluded or included accordingly; test points pass | [S] the map-data validation |
| Sea names | «الخليج العربي» / Arabian Gulf; «بحر عُمان» | As labelled | [V] u.ae usage; NCM's bulletin |
| Maritime lines | None | No maritime boundaries drawn | the map-data record |
| The seven emirates | Equal treatment | One size and style for all seven names. All seven are washed in gold together and named in the order of Article 1 of the Constitution (Abu Dhabi, Dubai, Sharjah, Ajman, Umm Al Quwain, Fujairah, Ras Al Khaimah), 0.14 s apart. No ring, no marks. |
| NMA content standards | Respect the State's governance, symbols and institutions; nothing that harms national unity or foreign relations | Neighbours faint and unnamed; partner pins only; no political content | [V] nma.gov.ae media content standards |

### 9.3 Facts and numbers on screen

Every number on screen, its qualifier and its source:

| On screen | Qualifier carried | Source | Status |
|---|---|---|---|
| 36 × 10 + 5 | "counted from Suhail's rising" (in the VO) | src-1 | [S] |
| c. 1490 | "c." | src-4 | [V] (LoC) |
| 2011 (World Heritage) | "Cultural Sites of Al Ain" | src-10, src-11 | [V] |
| February 1998 | first National Environment Day | Al Bayan 2000; The National | [S] |
| Decree-Law No. 6 of 2007 | "Federal Decree-Law" | src-20 | [V] |
| 100+ stations · 9 radars (2021) | "(2021)"; the latest published counts | src-24 | [V] |
| 23 seismic stations (2023) | "(2023)" | src-25 | [S] |
| 16 April 2024 · since 1949 | "since data collection began in 1949" | src-28 (WAM) | [V] |
| 14 April · 16 April | "warns of growing instability" / "red alert" | src-30, src-31 | [V]/[S] |
| 5-day · since 2018 | "marine forecasts" | README VII | [S] |
| 2011 (the President's words) | "as Crown Prince of Abu Dhabi"; reported speech | src-34 | [V] as reported speech |
| < 100 mm | "in a typical year" | src-29 | [V] |
| February 1982 · since 2010 | "the UAE's first", not NCM's; "nationwide, all year" | src-44, src-47 | [S] |
| since 2015 · 17 projects · 2016–2026 | "in six cycles" | src-53, src-40, src-54 | [V] |
| May 2026 | "translated from the Arabic" | src-59 | [S] |
| 2026 · 2025 · 2023 (pins) | the partner and the year | src-62, src-63, src-64 | [V]/[S] |
| 2023–2027 | "presidency"; "the first from the GCC" in the VO | src-43 | [V] |
| 2007–2027 (gauge, lockup) | — | src-20 | [V] |
| Star positions | computed for the date shown | `data/stars.js` | computed |

**Deliberately kept off screen:**

| Figure | Reason | Where it goes instead |
|---|---|---|
| 254.8 mm at Khatm Al Shakla | Restraint in the April passage | MC script and press |
| 51.8 °C and −5.7 °C (records) | Not needed in the film | MC script and press |
| The Atmosphere supercomputer's 2.8 petaflops (2021) | Too much text for the science beat | Press |
| "8 patents" | Source says "obtained and filed" and is undated | — |
| UAEREP country and researcher counts | Sources conflict (9 vs 13) | — |
| Aircraft and mission counts for 2025 | Sources conflict | — |
| Any seeding percentage | Sources range widely; NCM's own scientists say the effect is unquantified | Q&A only, with the caveat |
| Sector sizes (18.2% of GDP incl. aviation-enabled tourism, 2023 data; ~21 million TEU, 2023; 6 GW, 2024) | They describe sectors, not NCM outcomes | Press fact sheet, with their qualifiers |
| "24 hours' notice cuts damage by 30%" | Would read as an NCM outcome | — |
| The UN 2026 Water Conference | A UAE-government event, not NCM's | MC script, past tense |
| The founding day "13 November 2007" | See §11 on the anniversary date | — |

### 9.4 NCM's role and the April 2024 passage

| Item | Rule | How the film complies | Source |
|---|---|---|---|
| NCM's verbs | NCM observes, forecasts, warns, researches, funds research, shares, and leads at the WMO. It does not "keep skies open", "guide ships", "watch over every home" or "save lives" | The VO verbs are *brought together, established as the official source, warned, issued a red alert, a watch* (the 24-hour aviation watch), *forecast, sought more rain, invested in the science, presides*. The places at Jebel Ali and Shams 1 stand for sectors, and their labels are kept apart from the service labels | README; CLAUDE.md known mistakes |
| The warning channel | Phone alerts belong to NCEMA, and in 2026 they mean missile warnings | NCM's warning is shown on **NCM's own channel**: the weather map's storm symbol takes a red ring. No phones, no alert text, no cell broadcast | [V] NCEMA, WAM 2026 |
| Restraint | No spectacle, no triumphant music, no damage, no claimed outcomes; the loss is acknowledged | Two facts and a remembrance line. The camera stops. There is no thunder, lightning, siren or alert tone, no LFE, and no text during the remembrance | [S] The National, 17–19 Apr 2024 (four deaths) |
| Seeding myth | Do not place seeding next to the storm | The storm and seeding are about 23 s apart, separated by the working day (B10–B12) and the President's card (B13). No aircraft or cloud in B09. The fact that NCM did no seeding during the storm and does not seed in extreme weather goes to the Q&A | src-49 |

### 9.5 The 2026 context

- Missiles and drones struck the UAE in 2026. So:
  - no projectile-like arcs;
  - the globe uses pins and one still, dotted thread to Geneva;
  - the seeding flares are soft plumes rising into the cloud;
  - no booms;
  - no red flashing;
  - the April storm is set in daylight, not over a night city with red light.
- Check the week of the ceremony for any declared official mourning.
- Avoid the WMO Executive Council week (EC-81, tentatively 1–5 March 2027 in Geneva, chaired by Dr Al Mandous).

### 9.6 Picture safety and accessibility

- Pass a Harding / ITU-R BT.1702 photosensitivity test.
- No full-frame red, no strobe, and no flash at more than 3 a second.
- The LED grade is signed off on the wall. The event master is 50p, so 50 Hz broadcast cameras do not show beating.
- English subtitles of the Arabic VO go to the side and IMAG screens; the main wall stays clean. Arabic SDH captions are delivered for accessibility.

---

## 10. Deliverables

**A. Event playback**

1. **M1 ceremony master:**
   - Arabic VO and bilingual text, LED grade, 50p.
   - Rendered to the wall's native pixel map: a re-layout for a non-16:9 wall, never a stretch.
   - ProRes 4444 XQ and ProRes 422 HQ.
2. **Media-server files:** HAP Q (or NotchLC) at the native pixel map for the Watchout, Disguise or Pixera server. Main and backup servers are frame-locked to LTC, with an H.264 protection copy on a separate drive.
3. **Show-caller reference:** 1080p with burned-in timecode and cue marks (from `cuesheet.py`).

**B. Other picture masters**

4. **M2:** Arabic VO, web grade, 3840×2160, 50p, for broadcast and online.
5. **M3:** English VO with English-first text, for WMO delegations, embassies and international events.
6. **M4:** textless, for re-versioning.
7. **M5:** clean (VO, no text), for broadcasters.
8. **Broadcast delivery:** 1080p50 or 25p to the broadcaster's spec, with slate and clock [confirm with the broadcaster].

**C. Audio** (WAV, 48 kHz, 24-bit)

- The 5.1 (and 7.1) printmaster and a stereo LoRo.
- Stems: DX-AR, DX-EN, music (strings, Arabic ensemble, percussion, choir, brass), effects, ambiences, and an M&E.
- An LTC track.
- The Ramadan mix if needed.
- The VO-only track and the wild lines.

**D. Text**

- English subtitles of the Arabic VO (SRT, VTT, EBU-STL) for the side screens.
- Arabic SDH.
- The on-screen text list (§7) as SRT from `subtitles.py`.
- The narrator's vowelled script (PDF).
- A bilingual transcript.
- The English script for the simultaneous interpreters.

**E. Loops and stings**

- **Walk-in loop** (5–10 min, seamless): the real sky over Abu Dhabi for that evening, turning slowly, with a small lockup and a low pad. It fades out 3 s before GO, so the film grows out of it.
- **Stage hold** (20 s, seamless, every motion periodic in 20 s):
  - **A:** title and lockup.
  - **B:** the dedication «إلى المتنبئين والراصدين والطيارين والمهندسين والعلماء في المركز الوطني للأرصاد» with the lockup, for the moment the MC invites the Center's staff to stand (recommended).
  - **C:** sky and ring only at about 30% luminance, for speeches, so speakers are lit and cameras expose correctly.
- A **5 s walk-up sting** (the ring drawing itself, then the lockup).
- **Lower-third templates** at the wall's resolution.

**F. Cut-downs**

- **Versions:** 60 s, 30 s and 15 s in 16:9, 9:16, 1:1 and 4:5. They are Arabic-first, with English captions burned in for social. Because the film is code, each is a native re-layout, not a crop.
- **Suggested 60 s:** B01 (6) → B02 (3) → B07–B08 (12) → B10–B12 (8) → B14–B15 (7) → B17 (10) → B18 hit (6) → B19 (8).
- **Suggested 30 s:** B01 (4) → B08 (7) → B17 (8) → B18 hit (5) → B19 (6).
- **Suggested 15 s:** the twenty drops and the hit → the title and lockup.
- **Leaders' cards** appear only whole and uncropped. They are left out of cut-downs unless the protocol office approves, and never offered for remix.
- **The April 2024 passage** does not appear in any social cut-down.

**G. Stills** (4K PNG/TIFF, with and without text)

- Key art: the twentieth drop on 2027, and the ring closing around Suhail over the Corniche. The key art also goes as an 8K TIFF for print.
- One still per beat.
- The title card.

**H. Press and PR**

- A bilingual release, Arabic leading, embargoed until the film ends on stage.
- A fact sheet in which every figure carries its year, source and qualifier. It includes the sector sizes and records kept off screen (§9.3).
- **Spokesperson Q&A:**
  - *Did seeding cause the April 2024 floods?* No seeding took place during that storm, and NCM does not seed in extreme weather (src-49).
  - *How much does seeding add?* NCM estimates 10–25% for suitable clouds (src-51), and its scientists say there are too many unknowns to report a specific percentage (src-52). Always give both.
  - *What does NCM do at airports, ports and power plants?* It observes, forecasts and warns; it does not run operations.
- A **speech-writers' kit** (§2), sent two weeks ahead.
- A **ministry share kit** (approved copy, two clips, stills) for each attending minister's office, under embargo.

**I. Documents and archive**

- The fact matrix (every line and label mapped to its source).
- The protocol sign-off sheet.
- The rights register:
  - **Fonts:** OFL.
  - **Score, VO, nahham performer and any calligraphy:** perpetual, worldwide, all-media buyouts, including cut-downs.
  - **Map data:** ODbL attribution, or FGIC terms if the official data replaces it.
  - **Elevation data:** Copernicus.
  - **Star catalogue:** Yale BSC.
- The SMPTE cue sheet for lighting.
- The photosensitivity and loudness reports.
- The tech spec sheet.
- The film code (engine, scenes, timeline, render scripts).

**Show running order**

| When | What happens |
|---|---|
| Standby | Walk-in loop; house at half |
| T−15 s | House lights to black |
| T0 | GO on the film (its first 1.5 s are black with room tone) |
| 2:23.3 | Optional: a warm-gold stage wash (4 s) on the hit. No pyrotechnics, no confetti |
| 2:38.3 | The stage hold auto-follows (variant B) |
| +3 s | The MC walks on; speech light up |

**Schedule** (T = the ceremony, March 2027)

| When | Work |
|---|---|
| Oct 2026 | Approve the treatment. Protocol and legal read of every word. NCM data requests (§11). Commission the composer; cast the narrator; engage the nahham performer and cultural adviser |
| Nov 2026 | Build the revisions (Appendix A). The engine renders the full-length animatic at draft quality with scratch VO and the temp score. Arabic editorial pass |
| Dec 2026 | Final VO in Arabic and English; record the score; fine cut; close the fact matrix |
| Jan 2027 | Approvals from NCM, the protocol office and the leadership media office. First full render; Harding test |
| Feb 2027 | Re-check every "today" fact (the WMO presidency tense, titles, network counts). Hall recce: LED calibration, the 5.1 check, a camera moiré test |
| T−2 weeks | Masters, loops and cut-downs delivered; media kits sent under embargo |
| T−2 days | Tech rehearsal in the hall and playback redundancy test |
| T | Walk-in loop → house to black → film → stage hold B → speeches |

---

## 11. Open questions needing NCM approval

| # | Question | Why it matters | Owner | Default until answered |
|---|---|---|---|---|
| 1 | The ceremony's date, hour and venue | It sets the finale sky and readout, the Ramadan/Eid music version, the mourning check, and a clash check with EC-81 (1–5 Mar 2027) | NCM | Finale computed for 15 March 2027, 20:00; readout hidden |
| 2 | **Which founding act and date the anniversary marks, and who is credited.** The only dated instrument on record is Federal Decree-Law No. 6 of 13 November 2007, so March 2027 is 19 years and 4 months after it. The page also cites a resolution of the Minister of Presidential Affairs creating the Center (Resolution No. 16 of 2007); that minister in 2007 was H.H. Sheikh Mansour bin Zayed (to be confirmed). If that resolution is the founding act, VO-07 must name both acts in order | «عشرون عاماً» must be true on the night, and a founding act by a leader in the front row cannot go uncredited | NCM (documented date and instrument, in writing) | «2007» only; the VO credits the decree-law. Fallbacks: «في عامه العشرين» / "In its twentieth year" (true from 13 Nov 2026), or tie the evening to World Meteorological Day, 23 March 2027 |
| 3 | Dr Al Mandous's current NCM title in Arabic and English (مدير / مدير عام / رئيس المركز), for the MC script and credits | 2026 sources conflict | NCM protocol | Name and WMO presidency only; the page's «آنذاك» to be removed |
| 4 | NCM's parent body (the Presidential Court) as of 2026 | Credits and the MC script | NCM | Not stated in the film |
| 5 | **Order of prominence.** The film has the late Sheikh Zayed (VO and card), the late Sheikh Khalifa (VO), H.H. the President (card) and H.H. Sheikh Mansour (card). H.H. Sheikh Mohammed bin Rashid, Vice President and Prime Minister and head of the ministers in the room, does not appear. Should he? Should the narrator voice each leader's name and title on their card (never their words)? His 17 April 2024 post «الأزمات تظهر معادن الدول والمجتمعات» could close the April passage, with an approved English | «رئيس الدولة ونائباه» are read as a set; a film that names the WMO President aloud but not the leaders is unbalanced | Presidential Court / protocol office | Cards silent (music only) at equal musical weight; no reference to H.H. Sheikh Mohammed bin Rashid until the Court decides |
| 6 | Sheikh Mansour's card: the IREF line (28 Jan 2025, verified Arabic and official English, delivered on his behalf) or src-59 (May 2026, on ten years of the programme; needs WAM's or the Court's English, and the exact original: «اليوم» or «واليوم», «حلولاً» or «حلولًا») | Verbatim wording; an unofficial English of a Vice President's words is a clearance risk | Presidential Court | **IREF line** (built as the default) |
| 7 | The Zayed card: the Arabic name of the occasion («اليوم الوطني الأول للبيئة»), "February 1998", and «الوالد المؤسس»; ideally the 1998 original from the National Library and Archives | Verbatim wording and credit | NCM / NLA | As set in B06 |
| 8 | The President's card: approve the reported-speech text (WAM, December 2011) and "as Crown Prince", or supply a verbatim, approved quotation | Protocol | Presidential Court | Reported speech, no quotation marks |
| 9 | **Does April 2024 appear at all?** If it does: the passage now sits on the national map with a chart-style rain area; the VO says the Center forecast it two days before and then issued a red alert; the remembrance line is the alternate («نستحضر تلك الأيام العصيبة»). Or no line, and the chair leads any remembrance in person | Ministers whose bodies took criticism that week are in the room; in March 2027 «من فقدناهم» would also be heard against the 2026 losses | NCM leadership and the Presidential Court | As built (national map, alternate line) |
| 10 | The map: sign-off of the outline against the FGIC General Map (the islands, the western border, Musandam, Madha and Nahwa); every re-layout (9:16, 1:1, 4:5) re-approved so no crop loses the islands or changes the border | National territory | FGIC / protocol office | Natural Earth islands, OpenStreetMap coast; all seven named together, bilingual. Without FGIC geometry, the map beat is cut and the seven names are set as type |
| 11 | Current, NCM-certified network counts (stations, radars, seismic) "as of 2027", if any count is to be shown. WMO's database lists 6 operational radars against the sourced "9 (2021)" | A stale or conflicting count invites "Doesn't NCM know its own network?" | NCM | No counts on screen |
| 12 | The seeding aircraft type, flare-rack layout and livery (reference photos) | Draw the real aircraft | NCM operations | No livery |
| 13 | The Arabic name of the Al Bahar marine service, and whether the 5-day range is current | Labels | NCM | Service name not used |
| 14 | NCM logo files (dark-ground version), any 20th-anniversary mark, the Arabic brand typeface, and whether the GMO identity guidelines still apply under the National Media Authority | The lockup | NCM communications | Lockup slot with the text wordmark |
| 15 | Hall technical data: wall pixel map, pitch, maximum nits, processor refresh, media server, speaker format, hall depth, stage occlusion of the lower frame; the broadcast partner's frame rate and loudness | Master specs, minimum text size | AV vendor / broadcaster | 3840×2160 50p; lower 15% kept clear |
| 16 | Casting and commissions: the narrator (voice and gender), composer, nahham performer and cultural adviser; optional hand-lettered calligraphy for the title (Thuluth or Diwani, vectorised so the engine can ink it) | Quality and rights | NCM / production | Noto Kufi Arabic title |
| 17 | International guests expected? | Whether the English master or open captions are needed on the night | NCM protocol | English subtitles on the side screens |
| 18 | Whether the page's "The next twenty" ambitions are NCM strategy. If yes, a 10 s beat can replace the optional readout time and part of B18's applause room | Forward messages | NCM strategy | Left out |
| 19 | A native Arabic editorial pass on every line in §6 and §7 | Language quality | NCM / editor | Required before recording |
| 20 | Page fixes on `../index.html`. Done on 25 Sep 2026: «آنذاك» removed from Dr Al Mandous's line; the closing dedication now matches the film («المتنبئين الجويين … وعلماء الزلازل», "seismologists"); «طيّب الله ثراه» is set the same way in film and page. Still open: add Al Bayan 2000 or The National as the source for the 1998 occasion | Consistency between film and page | Web team | — |
| 21 | Dr Al Mandous's title: WAM has called him «رئيس المركز الوطني للأرصاد» / "President of NCM" since July 2026, after the 2026 amendment to NCM's law. Did the amendment also create a separate Director who will be in the hall? He is never «وزير» | The film never says he leads NCM; the MC script must acknowledge any Director | NCM protocol | Name and WMO presidency only |
| 22 | A verbatim, approved line from H.H. the President about NCM, weather or water (for example his congratulation on the WMO election, June 2023, if one exists) to replace the 2011 reported speech | The Head of State's only appearance reads like a news clipping | Presidential Court | Reported-speech card (WAM, 2011) |
| 23 | Federal balance: eight of ten named places are in Abu Dhabi. Sourced options: Sharjah (Al Mahatta, 1932, and its early weather observations), Ras Al Khaimah (Jebel Jais and its record low), Fujairah (east-coast marine forecasts); Ajman and Umm Al Quwain need an NCM station or coastal forecast | A federal film | NCM | The seeding scene now stands over the Hajar in Ras Al Khaimah; others need NCM's sources |
| 24 | NCM's people and future: an engraved, anonymous operations room at night (it could carry "a watch that never sleeps"); photographs of staff who have consented for hold B; verified present facts for a look ahead (the agentic-AI forecasting assistants, WAM 29 June 2026, with experts keeping the final decision; the WMO Regional Training Centre, 2024; Early Warnings for All by end-2027, credited to WMO and the UN) | The film promises to end on the Center's people; only 3.5 s of VO names them | NCM strategy / communications | Dedication in B18 and hold B only |
| 25 | NCM's archived warning display for 16 April 2024 (the national map with its yellow, orange and red areas), if NCM wants its real product shown | An invented display would be spotted by NCM's forecasters | NCM | Not shown |
| 26 | The partner pins: keep only partnerships NCM confirms, each with a noun (for example "rain-enhancement pilot · 2026"). Lahore 2023 is sourced to AFP via Dawn and a lone Pakistan pin can read as a political choice; Morocco rests on one small outlet | Foreign-relations standard | NCM / MoFA | Four pins as built |
| 27 | Climate and partners: the word "climate" never appears; the COP28 Science for Climate Action pavilion (with WMO and IPCC) and the MoFA–NCM early-warning platform for citizens abroad are unused; any thanks-to-the-leadership line | Messages ministers expect | NCM / protocol | Not in the film |
| 28 | Running order: Quran recitation, then the national anthem, then at least 5 s of silence, then the film. Black before the film no longer than 1.5 s. A still title card (`safety-slate.png`) on its own media-server layer for a playback failure. The operator fades the hold's audio before the MC speaks | A dark hall reads long black as a failure | Show caller / AV vendor | As in the cue sheet |
| 29 | LED specifications in measurable terms: cd/m² for parchment white and for black level, banding tests of B01 and B19 at show brightness, 50 Hz genlock for 50p, and sound levels at the front row (for example LAeq ≤ 85 dB, peaks ≤ 95 dBC) | "Two-thirds of web luminance" cannot be measured | AV vendor | To be set at the hall test |
| 30 | Accessibility on the night: Arabic captions beside the English on the side screens, and an Emirati Sign Language interpreter on the IMAG screens; the caption files tested on the real playback system | Arabic-speaking Deaf guests otherwise get none of the narration | NCM protocol / AV vendor | Captions delivered (`vo-ar.srt`, `vo-en.srt`) |
| 31 | The logo: if NCM's logo carries the federal emblem, it goes on a plain outro background, not over the sky; the AV vendor's side-screen packages add no animated flag with text over it | Federal identity rules | NCM communications / AV vendor | Text lockup over the sky |
| 32 | Schedule: approve the script (`SCRIPT.md`) with protocol and legal in November 2026, record the VO after that, lock picture timings, then record the score in January 2027. Plan the February hall visit and the delivery two weeks before the ceremony around Ramadan and Eid (about 8 February to 10 March 2027) | Words recorded before approval get recorded twice | Production | — |
| 33 | Expiry: "presides" is true until the 20th World Meteorological Congress (about June 2027). The cut-downs and any use at international events need a June 2027 expiry and past-tense alternates, routed through MoFA | Stale claims abroad | NCM / MoFA | Ceremony use only |
| 34 | **The tanker beat**: keep it as built (weather only, unbranded, under way, removable), replace it with an anonymous operations room where a forecaster approves the AI-drafted east-coast bulletin, or cut it. Go/no-go at two weeks and at 72 hours | Hormuz, attacks on UAE ships and Fujairah in 2026 | NCM leadership, protocol office, MoFA | As built; `?pull=tanker` ready |
| 35 | Etihad Rail: written clearance for the name and the depiction; which freight runs past Al Dhaid (stone assumed); reference photographs of the Stage 2 SD70 livery and the wagons | The name on screen; draw the real train | NCM communications with Etihad Rail | Name in review copies only; the master needs clearance or `RAIL_NAME` set to the national network |
| 36 | Does NCM have a forecast, warning or data-sharing arrangement with Etihad Rail or ADNOC? None is documented | If one exists, the rail line could say «لكل قطار» and cite it | NCM | Public warnings only |
| 37 | The Emirati music: a named cultural adviser; troupes from more than one emirate; the nahham (the Sharjah Institute for Heritage's Zeenat Al Sharjah troupe is one lead); written agreements with a perpetual buyout, and credits by name and emirate | Authenticity and performers' rights (Decree-Law 38/2021) | NCM / production | Synthesized temp, never played to heritage advisers |
| 38 | Which mix on the night: the full mix, or the restrained mix (no drums, tus, claps or jahla) if the ceremony falls in Ramadan (expected about 8 February to 9 March 2027) or a period of mourning | Propriety | NCM protocol | Full mix; restrained mix delivered |
| 39 | The leaders' cards' reading time: lengthen all three equally (for example to 15 s each, adding about 10 s) or trim their English | The rule of 3 s plus 0.3 s a word; equal treatment | Protocol office | 11.7 s beats as built |
| 40 | H.H. Sheikh Mohammed bin Rashid's words at the national rail network's inauguration (23 February 2023, verified): «ربط إمارات الدولة بشبكة قطارات وطنية يرفع إمكاناتنا ويعزز تنافسيتنا ويرسخ وحدتنا». A card only, never voiced, with WAM's English; it bears on row 5 | Prominence of the Vice President and Prime Minister | Presidential Court | Not used |
---

## Appendix A. Build map for `ncm-20/gala/`

### A.1 Timeline (replaces the provisional entries in `timeline.js`)

| Beat | `id` / `use` | `start` | `dur` | Enter (`xf`) | Camera | Notes |
|---|---|---|---|---|---|---|
| B01 | `suhail` | `at(0)` | `at(3.5)` | from black | push to s 1.10 | Re-key the sky clock so Canopus clears the dunes at 8.33 s; draw the ring at 9.2 |
| B02 | `durour` | `at(3.5)` | `at(2)` | `dawn` (2.8) | `lockCam({sx,sy,R:24}, CIRCLES.durour)` | `RING` overlay carries Suhail's ring into the wheel |
| B03 | `monsoon` | `at(5.5)` | `at(1.5)` | fade (0.8) | existing `lockCam(plateCircle(CIRCLES.durour,…), CIRCLES.monsoon, {off:2})` | `offset` 2.0 |
| B04 | `pearling` | `at(7)` | `at(1.5)` | fade (0.8) | `lockCam(…, CIRCLES.pearling)` then a tilt down | Remove NASHI |
| B05 | `falaj` | `at(8.5)` | `at(2.5)` | fade (0.8) | truck along the channel | Labels out at 33.0 |
| B06 | `quote-zayed` / `quote` | `at(11)` | `at(2.5)` | fade (1.2) | static | Credit sizes ≥30 AR / ≥24 EN |
| B07 | `centre` | `at(13.5)` | `at(2.5)` | `iris` at (555, 675) (1.6) | `PLATE_LEFT(1.0, 1.12)` | Logbook shows only 2007; remove v3 records; add `CIRCLES.scope` {px 1430, py 700, r 370} |
| B08 | `nation` | `at(16)` | `at(3.5)` | `iris` from the scope (1.6) | HQ at the scope point, s 2.2 → 1.0 by 57.0 | Ring leaves HQ at film 57.5; no radar marks; labels 30/24 px |
| B09 | `homes` | `at(19.5)` | `at(5)` | `iris` from the Corniche on the map (1.6) | `PLATE_LEFT(1.0, 1.06)`, stop at 77.5 | Day theme; grey tint builds then clears; red ring at 76.2; no phones |
| B10 | `airport` | `at(24.5)` | `at(1.5)` | fade (1.0) | `PLATE_LEFT(1.0, 1.05)` | `offset` so the touchdown lands at about 86.0 |
| B11 | `port` | `at(26)` | `at(1.5)` | fade (0.5) | truck | Remove "WAVE HEIGHT" |
| B12 | `energy` | `at(27.5)` | `at(1.5)` | fade (0.5) | tilt up to the sun | Bilingual or no texture labels |
| B13 | `quote-president` / `quote` | `at(29)` | `at(2.5)` | fade (1.2) | static | New `reported` style (no guillemets) |
| B14 | `seeding` | `at(31.5)` | `at(2)` | fade (1.2) | track; end on the droplet point | Hajar/Jebel Hafeet ground borrowed from `falaj` |
| B15 | `science` | `at(33.5)` | `at(1.5)` | `iris` at the droplet/particle point (1.2) | pull back | No numbers in captions |
| B16 | `quote-mansour` / `quote` | `at(35)` | `at(2.5)` | fade (1.2) | static | src-59 text; context kicker |
| B17 | `world` | `at(37.5)` | `at(3.5)` | `iris` at the globe centre (1.4) | push to Geneva, then back | Pin labels with years, ≥30/24 px |
| B18 | `gauge` | `at(41)` | `at(3.5)` | fade (1.0) with `lockCam(plateCircle(CIRCLES.world,…), CIRCLES.gauge)` | s ≈3.1 → 1.0 by 139.0 | `dt: 60/72/4` (sixteenths); `t20` so the 20th drop lands at film 143.33; 2027 in GOLD; elliptical rim; add `CIRCLES.gauge` {px 1500, py 150, r 108} |
| B19 | `finale` then `outro` | `at(44.5)` | `at(3)` | `dusk` (3.0) | push 1.00 → 1.04, hold from 153.33 | Ring closes at 150.8; title at 153.33; lockup at 155.0 |
| hold | `finale` (`?hold`) | 0 | 20 | — | still | Variants A, B, C (§10 E) |

`at(47.5)` = 158.33 s. After re-keying, run `node render.js cues out/cues.json` and regenerate the score placement, subtitles and cue sheet from it.

### A.2 Engine and scene changes

1. **`RING` overlay.** A persistent gold ring drawn on the main canvas after compositing, keyed per timeline entry as `{t, x, y, r, a}`. It is used for B01→B02 (and optionally B12→B13), and it never dissolves, so it never ghosts. Include it only where no plate circle exists.
2. **Scene tint.** An optional `tint(t)` on a scene: a multiply wash drawn over its layer. It is used for B09's grey sky building and clearing.
3. **A `label(ar, en, x, y, t0, t1)` helper** for Level B text:
   - bidi isolation built in;
   - defaults of 32 px Arabic and 24 px English;
   - fade in after the cut and out before it.
4. **Minimum sizes.**
   - Raise the defaults of `small()` and `smallAr()` and the `quoteCard` credits to at least 24 px English and 30 px Arabic.
   - Remove or enlarge every v3 texture label under 24 px, and strip numbers from them ("109 M", "WAVE HEIGHT", "RUNWAY 31L", the science captions).
5. **Keep-out check.** Log any critical text below y 918 (the bottom 15%).
6. **`quote` card styles.**
   - A `reported` style: no guillemets, with the reporting verb in the text.
   - An optional context `kicker` above the top rule.
   - Update `data/quotes.js`: add `president` (reported), switch `mansour` to src-59, keep the forum quote as `mansour_iref` (the fallback).
7. **`map-nation.js`.**
   - Draw no radar marks. The WMO database file lists 6 operational radars against the sourced "9 radars (2021)", so marks and count would disagree. Gate the marks behind NCM's full, current list.
   - Enlarge and re-space the stacked Gulf labels.
   - Add English names.
   - Check every label box against the coast, the leaders and the register in the final frame.
8. **`plate-homes.js`.** Day theme with the tint. Keep the weather-symbol strip and the steady red ring on the storm symbol. Rain density no higher than now. No phones, no pulsing.
9. **`plate-gauge.js`.**
   - Draw 2027 in gold.
   - Draw the elliptical rim with a consistent water surface and foot.
   - Set sixteenth-note drops.
   - Keep 40 shower streaks or fewer.
10. **`plate-seeding.js`.** Borrow the Hajar/Jebel Hafeet profile for the ground. Keep the aircraft level below the cloud base and the flares as rising plumes. Draw the aircraft type from NCM photos.
11. **`plate-pearling.js`.** Remove the NASHI wind (W8 entry).
12. **`night-finale.js`.** Take the date and hour as parameters and recompute. Draw the ring closing around Suhail at 150.8.
13. **`render.js`.** Add a custom canvas size for a non-16:9 wall, and a burn-in timecode option for the show-caller copy. 50 fps, 4K and the LED grade already exist.

### A.3 QA gates before any review render

These come from the project's known-mistakes list.

- **Bidi:** screenshot every Arabic label in the final frame of its beat, and check «2007–2027», «(6)» and the years in the Arabic view.
- **Glyphs:** check coverage of «×», «—», «–», «·» and digits in every font used; zoom on renders.
- **Numbers:** every number on screen appears in §9.3; the fact matrix is closed.
- **Transitions:**
  - Review frames at every cut ±0.1 s and at the midpoint of every dissolve, iris, dawn and dusk. Words must never overlap across a transition.
  - Dissolves composite whole layers; no scene is drawn at partial alpha.
- **Label collisions:** check every label box against notes, frames, leaders and drawing lines in the final frame of each beat. Size figure text for its widest value at every aspect ratio of the cut-downs.
- **Physics:**
  - the falaj flows downhill under gravity and the fields are not waterlogged;
  - the ship and the tug sit on their waterlines;
  - the arrival crosses the threshold at about 15 m and touches down in the touchdown zone;
  - the crane booms span the ship's beam;
  - the aircraft flies below the cloud base and the plumes rise into it;
  - rain slants with the wind;
  - the globe turns the right way;
  - the gauge stands on the ground and the water rises from the bottom;
  - Suhail's positions are computed for the stated date.
- **Real places:** Hili 15 (Iron Age, no deep mother well, no road on Jebel Hafeet), Zayed International runway 31L, Jebel Ali, Shams 1, the Corniche at CTBUH heights, the FGIC-checked map. No generic stand-ins.
- **Photosensitivity:** a Harding test on the final render.

---

## Appendix B. How the three draft treatments were merged

| Question | Ceremony draft | Cinema draft | Message draft | Final decision and reason |
|---|---|---|---|---|
| Tempo grid | 96 BPM | 72 BPM | 72 BPM | **72 BPM**, matching the existing gala build (`BAR72`, `score.py`) and a dignified pace |
| Spine | Night → day, April at 1:20, "watch" hands scene | Storm as the climax at 1:50 | Storm at 1:10, then a firewall beat, "next twenty" | **The message draft's order**, with April after the network (the proof of "official source") and the working day as the firewall. The storm is not the climax: the research asks for restraint |
| April 2024 | Night theme, windows, no phones | Red ring spreading over the city, LFE thunder, a designed alert motif | Red ripples, phones lighting, "THE WARNING CAME FIRST" in big type | **Restraint:** daylight, NCM's own warning map, one steady red ring, no alert-like sound, no big words, and a remembrance line. A night city with red light could recall 2026's missile nights |
| Leaders | Zayed and Mansour cards; the President deferred | Zayed and Mansour cards | The President as a VO mention with a headline in the card style | **Three cards in precedence order.** The President's is reported speech without quotation marks, which is the only form the source supports. No headline that looks like a quotation |
| Mansour quote | src-59 | src-59 | src-59 (replacing the forum quote) | **src-59**, with the forum quote (official English) as the fallback for the Presidential Court to choose |
| Map | Range ring by distance, 200 km/s | Ring by distance; marks only if they match the count | Ring by distance; order flagged | **Ring by distance at 160 km/s** (as built), all seven within 1.3 s; no radar marks; order flagged for protocol |
| Globe | Gold arcs to four places | Arcs; red ring cooling to gold | Arcs | **Pins and one still, dotted thread to Geneva** (as rebuilt): no arcs across Iran |
| Science | Four figures including drone and laser | No drone, no laser | Drone and laser | **No drone, no laser** (as rebuilt) |
| Twenty | 20 drops on eighths, hit at 2:25 | "The Twentieth Ring": a radar sweep drawing rings | Gauge re-graduated from mm to years; hit on the dominant | **The gauge with twenty drops on sixteenths and the hit on the dominant.** It is already built and matches the page's masthead. The radar-sweep rings would be a new, photosensitivity-risky build |
| Finale | Dedication, dusk, Suhail | Rings morph into the sky's circles | Ring closes around Suhail; title; lockup | **Dedication across the hit, dusk, the ring closing around Suhail over the Corniche**, with the page's own closing sentence split across the hit and the dusk |
| Forward look | EW4All line | — | "The next twenty" beat (draft ambitions) | **Left out of the cut** (they are not NCM-approved strategy); offered as an option (§11, item 18) |
| UN 2026 Water Conference | MC script | — | In the VO | **MC script only.** It is a UAE-government event, not NCM's |
| Big words | None | Four | Five | **Three plus the title**, for clarity in a hall |
