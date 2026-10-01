# عشرون عاماً في قراءة السماء
# Twenty Years of Reading the Sky

**The anniversary film for the National Center of Meteorology's 20th-anniversary ceremony, March 2027.**
Final treatment by the head of media and PR lead. Draft for NCM and protocol approval, 25 September 2026.

| | |
|---|---|
| Runtime | **2:43.3** (163.3 s = 49 bars at 72 BPM; one bar = 3.333 s), then a 20 s seamless stage-hold loop (Revision 6). 3:00.0 with April 2024 (`?april2024`); 2:38.3 with the tanker beat pulled. Revision 11 (`?rev11`, a draft): 3:15.0 in design time (58.5 bars), played 10% slower at the requester's direction: 3:34.5 on screen, 3:27.2 with the tanker pulled, 3:52.8 with April 2024 |
| Screen | Large LED wall in a dark hall. The event master is 50p, rendered to the wall's native pixel map (3840×2160 if the wall is 16:9) with the LED grade (`?grade=led`) |
| Sound | 5.1 cinema mix (7.1 if the hall has it), an original score recorded live, and an Arabic voice-over by an Emirati narrator |
| Language | Arabic leads everywhere: the voice-over, the first and larger line of every text block, the right-hand text column. English comes second |
| Built in | The gala engine in this folder (`engine.js`, `timeline.js`, `scenes/`). It re-cuts 13 v3 plates and uses 5 new scenes (night open, national map, quote cards, night finale, lockup) |
| Facts | The anniversary page's source list (`../index.html`, src-1 to src-68), the v3 film README (`../film/README.md`, chapters VI–IX), and the September 2026 research on protocol, quotes, facts and map data. A fact that could not be verified is left out of the film |

This treatment replaces the provisional wording in `timeline.js`. Appendix A says how to build it and Appendix B records how the three draft treatments were merged.

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
  - Revision 11 adds ADNOC HQ (1.67 km, bearing 174.2°, 11.6° high) and Qasr Al Watan (2.37 km, bearing 226.6°).
    See its notes of 1 October.

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

## Revision 4 · 26 September 2026: the Saadiyat rain, the King Air, Ethiopia

Three changes, at the requester's direction, on the 3:00 cut of Revision 3. A five-act re-cut was tried and withdrawn
the same day: it lost the film's density, and the requester preferred this cut.

- **Before the rain, after the seeding and the science** (moved there on 28 September, at the requester's note, so
  that the rain sought over the Hajar arrives as a blessing for the whole country). The Saadiyat Cultural District
  under natural rain, seen from a boat offshore at 24.5445 N, 54.3780 E. Each museum stands at its true bearing and angular size (OSM footprints; the published
  heights):
  - the Guggenheim Abu Dhabi (opening 11 December 2026), its cones up to 88 m;
  - the Zayed National Museum, its wings up to 123 m;
  - the Louvre Abu Dhabi, its 180 m dome.

  The narration (VO-08r, VO-08s) says only that the Center's forecasts and early warnings come before the rain, for
  people's safety. It never says NCM makes rain, and no aircraft appears in it. April 2024 remains one query away
  (`?april2024`): it returns after the seven emirates and the Saadiyat rain leaves the cut, so the film never sets
  seeding beside the April 2024 floods. **The protocol office chooses** which of the two goes to the ceremony.
- **B16 · the seeding aircraft** is NCM's type, a Beechcraft King Air C90, built in engraved 3D from its published
  dimensions:
  - 10.82 m long, 15.32 m span;
  - a low wing with 7 degrees of dihedral;
  - two PT6A turboprops in nacelles;
  - a conventional tail.

  The salt plumes rise from the hygroscopic flare racks under its wings. It carries no livery, registration or marks.
- **B19 · Ethiopia** joins the globe's partners, pinned at Addis Ababa. It is named as a country only, with no year
  and no drought or outcome claim, because none is verified.

**Music.**

- B09 has no Emirati percussion: a cello pedal, felt-piano drops, and the rababa's Suhail motif as the rain eases,
  warming to F into the working day.
- The working day's drums now wait for its own first bar, as they did after April 2024.
- Ethiopia's pin has its chime.
- The world beat is ridden lower (-4.0 dB), so every leader's card still measures at or above it in the new order:
  - cards: -13.7, -14.1 and -14.1 LUFS;
  - world: -14.3 LUFS.

**Checked on 28 September:**

- The Guggenheim has ten cones as built: nine clad in stainless-steel mesh and one in onyx and glass, up to 88 m (DCT,
  28 July 2026). The drawing now shows the onyx cone warm and translucent, the others as mesh.
- The Zayed National Museum's five wings stand 83-123 m above the sea datum, on a 30 m mound (DCT; Foster +
  Partners).
- The three museums' bearings and distances agree with their OSM outlines within 0.3 degrees and 20 m.
- NCM flies four Beechcraft King Air C90GTi for seeding (NCM, 2024; UAEREP), with hygroscopic flares on both wings.
  The drawn type is right.
- Ethiopia: "The NCM has worked with Mauritania, Pakistan and Ethiopia" (AGBI, 5 February 2025). No agreement, year or
  scope is published, so the pin names the country only.
- The Arabic of VO-08r, VO-08s and the beat's words was read against official usage and grammar and stands.

**Before the master:** which cone and which wing stands where, left to right (no published text gives it; match
Foster + Partners' elevations in RIBAJ and DCT's July 2026 photographs). NCM's own Arabic editor should still sign off
the new lines.

## Revision 5 · 28 September 2026: the first editions' headlines, and rain as a mercy

At the requester's direction, on the Revision 4 cut. Where this section and the body differ, this section stands;
`SCRIPT.md` is the as-built text with its times.

**The first two editions' Arabic headlines return.** They are the large words (Level A) on their beats, in the nation's
own "we" over the narrator's story, each with its English:

| Beat | Arabic | English |
|---|---|---|
| The Durour wheel | عددنا أيام السنة بطلوع سهيل | WE COUNTED THE YEAR BY A STAR |
| Ibn Majid and the monsoon | وأبحرنا مع رياح الموسم | WE SAILED BY THE MONSOON |
| Every wind by name | وعرفنا الرياح بأسمائها | WE KNEW EVERY WIND BY NAME |
| The aflaj | وأجرينا الماء في الأفلاج عبر الصحراء | WE CARRIED WATER THROUGH THE DESERT |
| 2007 | ثم أسسنا مركزاً يرصد السماء | THEN WE BUILT A CENTER TO READ THE SKY |
| For every flight | ونقرأ السماء لكل رحلة | WE READ THE SKY FOR EVERY FLIGHT |
| For every ship | ونقرأ البحر لكل سفينة | WE READ THE SEA FOR EVERY SHIP |
| For clean energy | ونتنبأ بسطوع الشمس وهبوب الرياح | WE FORECAST THE SUN AND THE WIND |
| More rain from the clouds | واستمطرنا السحاب | WE ASKED THE CLOUDS FOR MORE |
| The science of rain | ودعمنا علوم الاستمطار | WE FUNDED THE SCIENCE OF RAIN |

- **Kept as they were:**
  - the railway's and the east coast's lines, which carry on the list («على امتداد البر», «للساحل الشرقي»);
  - «المرجع الرسمي للطقس»;
  - the national line «من سماء الإمارات إلى العالم», which protocol puts at the film's peak;
  - the title.
- **Not used:**
  - «واليوم نشارك علمنا مع العالم»: the national line takes its place;
  - «ونسهر على كل بيت»: in the `?april2024` cut the April beat keeps its remembrance with no headline, because over
    the floods that line would claim an outcome.
- **Pronoun arc.** The narrator still tells the heritage as "they". The headlines speak as "we" from the first chapter.
  "We" is the people of this land and the nation, one voice across generations.
- **Layout.** Each headline is fitted to the 760 px words column: `levelA` fits its widest line with `maxW`. The long
  lines run over two lines at up to 84 px. The English now clears the Arabic's deepest descenders (ح ع ي).
- **Two collisions found and fixed:**
  - the seven emirates' line «المرجع الرسمي للطقس» had run into the Fujairah and Sea of Oman map labels since
    Revision 2; it now sits in the open paper above them;
  - the seeding line sits below the King Air's line of flight, which crosses into the words' column by the end of
    the beat.

**B09 · Rain as a mercy.** «قبل المطر / BEFORE THE RAIN» is gone.

- **The words.** The rain eases, the sky clears toward the sun, and the words said after rain appear in the light:
  **«مُطِرْنا بفضلِ اللهِ ورحمتِه» / RAIN, BY THE GRACE AND MERCY OF GOD.**
  - They are the Prophet's words in Sahih al-Bukhari 846 and Sahih Muslim 71, spoken on a morning after a night's rain.
  - The verb is vowelled so it reads «مُطِرْنا» (we have been given rain), never «مَطَرُنا» (our rain).
  - The same hadith sets thanks to God against crediting rain to the stars. The film opens on Suhail as a calendar;
    this beat gives the rain to God, not to a star and not to seeding.
- **The narration.**
  - VO-08r: «وحينَ يُنَزِّلُ اللهُ الغيثَ رحمةً على هذهِ الأرض،» / *And when God sends down the rain as a mercy upon
    this land,*
  - VO-08s: «يسهرُ المركزُ على سلامةِ الناس، بتنبُّؤاتِهِ وإنذاراتِهِ المبكِّرة.» / *the Center keeps watch over
    people's safety with its forecasts and early warnings.*
  - The Center's part is still only its forecasts and warnings. Nothing says it makes rain.
- **The plate, redrawn.** The museums' verified geometry is unchanged.
  - **The rain.** The rain cloud's base is engraved in perspective: banks of swelling lines, their undersides in
    rounded billows, the nearer banks larger and darker. Fine rain falls in two layers. The museums are veiled in it
    and mirrored in the sea.
  - **The light.** From 7.6 s the rain band's trailing edge crosses from the right and the rain eases. The morning sun
    breaks through above the frame's top right; it stands at azimuth 124° and 13.7° up, computed for about 08:15 in
    late December. Pale shafts fan down, the sea glitters under the sun, and the dome's crown takes the light. The
    headline arrives at 10.3 s, in the clearing.
  - **Left out.** There is no rainbow: it would stand opposite the sun, behind the boat. Nothing glows up from the
    ground, and nothing is orange.
- **Music.**
  - The felt-piano drops stop as the rain eases, and the strings open to F with the light.
  - Under the words, the rababa plays a plain phrase falling to F on the bar line, in place of the Suhail motif,
    because of the hadith's contrast with crediting the stars.
  - The horn swell in 2007 moves to its new headline.
- **Measured.**
  - Every leader's card is still at or above the world beat: cards −13.5, −14.0 and −13.2 LUFS, world −14.3 LUFS.
  - Both of the rain beat's dissolves were checked at the cut and 0.1 s either side. No words overlap.

**Straight after the seeding (28 September, the requester: "still not well positioned").** The order is now:

1. the seeding;
2. the rain over Saadiyat;
3. the science of rain;
4. Sheikh Mansour's card.

The rain had sat after the science of rain, so it did not answer the seeding, and it broke the science's hand-over to
Sheikh Mansour's card on research.

- **Picture.** The seeded cloud's rain dissolves straight into the rain over Saadiyat. The science of rain irises in
  from the cloud over Saadiyat, where it used to iris in from the seeded droplet. With `?april2024` the seeding and the
  science stay together as before.
- **Sound.** The seeded cloud's rain runs on across the cut into the rain over Saadiyat. The seeding and the science
  keep their pizzicato and muted mirwas, but each carries its own bars, so no drum plays under the rain.
- **Protocol.** The rain now follows the seeding directly, which is the impression the requester asked for. Its words
  give the rain to God, the narration claims only forecasts and warnings, and no aircraft appears in it. **The
  protocol office should see this order.**
- **Measured.** Cards −13.5, −13.5 and −13.6 LUFS; world −14.9 LUFS. The three joins were checked at the cut and 0.1 s
  either side.

**Reading times (the rule is 3 s plus 0.3 s a word).**

- **Meet the rule:** the rain beat and the headlines on the longer beats.
- **Short, because a five-second beat leaves at most 4.0–4.3 s between its dissolves:**
  - monsoon: the English needs 4.5 s and is up 4.3 s;
  - every wind: the English needs 4.8 s and is up 4.1 s;
  - flight: the English needs 5.1 s and is up 4.2 s;
  - ship: the English needs 5.1 s and is up 4.3 s;
  - energy: the Arabic needs 4.5 s and the English 5.1 s; both are up 4.0 s.
- Each of these echoes the narration almost word for word.
- **For decision:** keep them, or give those five beats shorter English lines (for example FOR EVERY FLIGHT).

**Before the master:** NCM's Arabic editor, and a religious adviser, read the new narration and the hadith line,
including its setting over music.

## Revision 6 · 28 September 2026: the Saadiyat rain taken out

At the requester's direction ("not feeling it"), the rain over the Saadiyat Cultural District leaves the film, with
everything that belonged to it:

- its words («مُطِرْنا بفضلِ اللهِ ورحمتِه»), its two narration lines (VO-08r, VO-08s), the museum captions;
- its music (the felt-piano drops, the rababa's phrase into F) and its rain;
- the plate (`scenes/plate-saadiyat.js`). It stays in the history, at commit 5d9f4aa.

**The cut closes up.** The beats after the seeding move 5 bars earlier, and the film runs **2:43.3** (49 bars).
- The seeding and the science of rain run together again: the science irises in from the seeded droplet, and one
  passage of pizzicato and muted mirwas carries both, as in Revision 3.
- `?april2024` puts April 2024 back after the seven emirates and brings the film to 3:00.0 (the protocol office
  decides). `?pull=tanker` gives 2:38.3.

**Measured.** Without the rain beat, the President's and Sheikh Mansour's cards measured quieter than the world beat,
and the build stopped. All three cards now ride 0.5 dB up and the world 0.3 dB down:
- cards −13.5, −14.0 and −14.2 LUFS;
- world −14.4 LUFS.

## Revision 7 · 28 September 2026: four pictures raised

At the requester's direction ("elevate it"), four of the film's pictures are redrawn. The cut, the words, the
narration and the score are unchanged: every cue, words block and narration line is identical to Revision 6's.

- **B01 · the people of this land.**
  - On a near dune, 24 m from the camera, a man in kandura and ghutra stands with his camel stick beside his couched
    camel, both watching Suhail rise. The narrator says, at that moment, that the people of this land read the sky.
  - They are silhouettes, with no face. Their edges toward the twilight in the east take a faint rim of light.
  - They are drawn to one scale from the camera's eye (1.6 m up, 47.7 px a metre at 24 m), so the man is 84 px tall.
    The crest they stand on is 1.65° above the horizon, so they stand against the sky.
  - Two ridges of dunes lie between them and the horizon. The near dune's face carries wind ripples, and Suhail rises
    clear of it to the right.
  - Low in the sky, Suhail twinkles and shifts colour through the long path of air, as a low star does and as the poets
    describe it. The flicker is small and slow, never a strobe, and dies away as the star climbs.
  - The finale answers this opening: the same star over the city twenty years on.
- **B06, B15, B18 · the leaders' cards.**
  - All three cards now sit in a framed page: a gold double rule with compass-star corners, never the hizb star.
  - Behind the words turns a guilloché rosette, the fine interlaced line-work of banknotes and official seals, in the
    place of the plain rings.
  - The words are centred in the frame. They are unchanged, and all three cards are treated alike.
- **B16 · the cloud over the Hajar.**
  - The cumulus is engraved as the volume it is: a congestus about 3.5 km across with a flat base near 2 km, built of
    turrets with cauliflower edges.
  - Each turret is contour-hatched on its shadowed side (the sun is behind the camera, to its right), and the base is
    in shade.
  - The base darkens as the seeding takes hold. The King Air works under it, and the droplet the science irises from is
    where it was.
- **B20 · twenty years.**
  - The rain gauge is engraved as glass: walls with their thickness and shading, reflections down the tube and along
    the funnel's cone, a meniscus on the water, and the base plate it stands on.
  - The twentieth drop lands in gold. A crown of gold droplets rises into the funnel and falls back, and gold ripples
    run out to the glass on the hit.
  - Nothing flashes; the 2027 glint still ramps over 0.6 s.

**Checked.**
- Every changed beat was looked at in its own frames and at its cuts, ±0.1 s.
- The line and hatch spacing keeps to the LED rules: at least 1 px and 2.5 px here, 2 px and 5 px on the 4K master.

## Revision 8 · 29 September 2026: frame QA and colour-true masters

At the requester's direction ("sharpen it"), the approved cut is checked frame by frame and its masters are rendered
again. The cut, the words, the narration and the score are unchanged: every beat's start and length, every words
block, every narration line and every cue is identical to Revision 7's.

**How it was checked.**
- Five reviewers looked at every cut ±0.1 s, every dissolve's midpoint and every beat's last frame against A.3 and the
  known-mistakes log.
- A second reviewer re-rendered each finding at 4K and tried to refute it. 20 of the 37 findings held, and all 20 are
  fixed.
- Frames outside the fixed moments are pixel-identical to Revision 7's (60 of 109 frames, sampled every 1.5 s).

**What changed on screen.**
- **Readings.**
  - The radar masts on the port and the tanker are A-frames. A post with a crossbar read as a Latin cross.
  - The runway's edge lights burn steady, and the red chase is gone (§9.5).
- **Words over line-work.**
  - The world headline, the science programme's label and Abu Dhabi's name each sit on a paper patch cut to their
    measured ink, so no line runs through a letter.
  - ETHIOPIA keeps one side of its pin instead of jumping across it mid-shot.
  - SEA OF OMAN sits off the Omani coast.
  - The Hajar label clears the peak.
  - The nation headline's English clears the final ي.
- **Plates entering on blank paper.**
  - The Centre, the nation map and the falaj each start later in their own time, with their cameras moved to match,
    so they arrive drawn. Every frame after each dissolve is as before.
  - The HQ star grows inside the iris.
  - The world globe and the gauge's rim are drawn through their irises, so the "limb to rim" match reads.
- **Paper and physics.**
  - The pearling boat and the falaj cuts fade with their shapes. Before, they punched holes in the sea and ground lines.
  - The monsoon's rudder and sternpost reach the keel's depth.
  - The King Air flies in and out along one straight line. Before, it appeared and vanished mid-frame.
  - The rail skyline covers the whole pan, bearings 70° to 165°. It is recomputed from the terrain by
    `data/build/rak_skyline.py`, which reproduces the stored 70° to 114.8° exactly.
- **The holds.**
  - Loops A and B start from the finale's last phase and keep the SUHAIL label. The cut from the film into loop A now
    changes less than one frame step inside the film does (a mean of 0.013 against 0.019 grey levels).
  - The film at the split is identical to loop W's first frame.

**Colour.**
- Revision 7's masters were encoded with the BT.601 matrix and carried no colour tags. Media servers and UHD players
  decode untagged UHD as BT.709, so the parchment played warm (red +1.9, blue −0.7 levels).
- Every frame had also passed through JPEG.
- Frames are now captured losslessly and encoded BT.709, limited range, with the primaries, transfer and matrix
  tagged. On the parchment the mean cast is now about 0, and the error is 1.32 levels (it was 2.06).

**New deliverables.** `masters.sh` builds every master, then `qc/deliver.sh` builds these:
- SMPTE LTC at 25 fps for part 1, part 1 without the tanker, and part 2 (§10 A.2). Each is read back against the cue
  sheet.
- WebVTT of every subtitle file, and EBU-STL of the English, with a reading-speed report.
- The show caller's 1080p50 reference (§10 A.3), with timecode, the cue and its note, and STANDBY then GO for every cue.
- `QC.md`, `qc-report.json` and `QC.html`, covering:
  - frame counts, colour tags and keyframes;
  - loudness and true peak;
  - the loop seams and the cuts;
  - a photosensitivity pre-check on the ITU-R BT.1702 model;
  - checksums.
  The pre-check is not the certified test that §9.6 asks for.

**Recorded, not changed.**
- The §5 pin row now matches the build, which played in Revision 7. It reads GENEVA (the words name the WMO),
  TURKISTAN REGION, KAZAKHSTAN · 2026 and ETHIOPIA (Revision 4). The build is the approved wording.
- Reading speed (row 39) on the side screens. Each card's subtitle holds 10.4 s.
  - H.H. Sheikh Mansour's card in English is 378 characters with its full attribution: 36 a second, 11 rows at 42
    characters. The quote alone reads at 14 a second.
  - The English narration peaks at 22 characters a second (VO cue 17).
  - `qc/subs.py` reports this only. Nothing is re-timed or re-worded.

## Revision 9 · 30 September 2026: more colour (a draft for approval)

The requester passed on management's instruction: "More colorful". The cut, the words, the narration and the score are
unchanged. The colour pass is a switch, `?colour`. Without it the film is the approved Revision 8, and its masters are
untouched: 20 stills, one from every beat, are identical to the pixel. When the colour pass is approved, the masters
are rendered again with it (row 41).

**The approach.** The plates are hand-coloured, as engravings and maps were.
- The colour is transparent washes laid over the printed line, so the paper grain and every line show through.
- The palette is the country's own: the Gulf's turquoise and the deeper blue of the Sea of Oman; sand, dune and the
  Hajar's rust; the green of the palms; a clear sky; gold for the instruments and the film's circle.
- The night becomes blue instead of near-black, and stays dark enough for the hall.

**Rules the colour keeps.**
- Never a red wash, since red reads as an alert or a war graphic. The seven emirates share one colour, and their gold
  wash still arrives together. The neighbours stay faint and unnamed.
- No colour where none is verified. The locomotive's livery waits for Etihad Rail's clearance (row 35). The tanker
  carries no livery, as before. The port's cranes stay ink.
- The three leaders' cards are coloured alike: a teal and gold seal tint in the rosette and a deep blue between the
  frame's rules. Their words stay ink on paper.
- Nothing flashes. Each wash fades in with the drawing it colours.
- The skies are true to the moment:
  - the opening colours its computed twilight: a violet and rose band in the east that grows as the sun climbs;
  - the finale, at 20:00 and long after sunset, has only the city's warm glow;
  - in the stage loops every colour stands still, so they still join seamlessly.

**Beat by beat.**
- **Durour:** each season's petals in its colour, and a dawn sky over sand in the medallion.
- **Monsoon and pearling:**
  - the Gulf in section, turquoise deepening to the bank, with sand on the bed;
  - teak hulls and a warm palm-mat sail;
  - the compass cards gilded.
- **Falaj:**
  - the sky cut at the true skyline, the Hajar and Jebel Hafeet in rust;
  - the section's dry ground in sand and the saturated ground below the water table in water colour;
  - green palms.
- **Centre:** the radar scope in teal, the radome pale, the logbook cream.
- **National map:** the Gulf and the Sea of Oman in turquoise, fading with the engraving; the land in sand.
- **Airport, rail, port, tanker, energy:**
  - a clear sky, desert either side, the runway grey;
  - the Hajar in rust, harbour water and a deep-blue hull above the boot-top;
  - the Sea of Oman deepening toward the eye;
  - a warm halo about the sun, and the troughs holding the sky.
- **Seeding and science:**
  - a clear sky with the cumulus left white;
  - the cloud's base in a cool shade that deepens as the seeding takes hold;
  - each figure on its own pale ground.
- **World:** the globe's sea lit from the upper left, and a gold armillary ring. The labels on the globe sit on clean sea.
- **Gauge:** the sky clearing behind the glass after the shower, and the water column in blue.


## Revision 11 · 30 September 2026: the founding, the working day in full, and the watch (a draft for approval)

The requester asked for more:
- the airport "extended with more realistic scenes";
- the formation decree "enhanced as it is the main message of the celebrations";
- a jetty at the Fujairah oil terminal;
- Jebel Ali "expanded to reflect the might of this port";
- Shams to show the UAE as a pioneer in sustainable energy;
- "all made possible with perfect forecast, world class capability and capacity of UAE Met, which is reflected on
  the global stage" at the WMO presidency;
- "the real soul".

Everything is behind a switch, `?rev11`, which works with `?colour` and `?heritage`. Without it the film is the
approved Revision 8: the cue list, the cue sheet and the score are byte-identical, and 20 stills (one per beat) are
identical to the pixel.

**The cut: 4:11.2 on screen** (68.5 bars, 3:48.3 at the design tempo, played at a pace of 1.1, its ten detail beats a
bar longer each: see the notes of 1 October below; 4:00.2 with the tanker pulled; 4:29.5 with `?april2024`). The beats
keep the bar grid. *Superseded lengths:* before the detail beats were slowed, 3:34.5 (58.5 bars; 3:27.2 and 3:52.8),
still built with `?slow=0`; the table below gives each beat's length before that change.
The working day now runs from dawn into the late afternoon, and the Center's watch leads into the world.

| Beat | Revision 8 | Revision 11 |
|---|---|---|
| B07 · the founding | the radar scope, 2.5 bars | the decree's charter, held, then the Center's instruments, 4.5 bars |
| B10 · Zayed International | the runway, 1.5 bars | dawn fog at the airfield (new, 1.5) and the arrival (1.5), both in true 3D |
| B12 · Jebel Ali | one ship, 1.5 bars | the container quay in its length, true 3D, 2.5 bars |
| B13 · the east coast | a tanker under way, 1.5 bars | the VLCC jetty with a tanker alongside, true 3D, 2 bars |
| B14 · clean energy | Shams 1, 1.5 bars | Shams 1 (1.5), then Al Dhafra Solar PV in the afternoon, its trackers turning with the sun, and the net-zero pledge (new, 2) |
| B18b · the watch | — | forecasters at work; the satellite disc becomes the globe (new, 2.5 bars) |

**"Perfect forecast" is not claimed.** No NCM forecast-accuracy figure is published (the one found, 90–97%, is from
2020 press with no metric; Saudi Arabia's NCM publishes others under the same Arabic name). The film shows the
capability instead: the watch around the clock, the instruments, the supercomputer, and forecasters having the final
word. "All made possible" is not said: each port, plant and airport keeps its own fact, with its source and year, set
under its own name and never under an NCM "we" headline, and NCM keeps its verbs (observes, forecasts, warns, shares,
leads at the WMO).

**B07 · the founding (4.5 bars).** The decree is the celebration's main message, so it now opens the Center's movement,
one bar longer than first drafted so that it is held and read.
- **The charter (0–9.6 s).** The iris opens from the Zayed card's rosette straight onto an engraved charter framed to
  the whole screen (its title about 84 px), which inks in line by line and is then held, complete, for 3 s while the
  music holds its chord; the narration enters in the last second of the hold, so «في عامِ ألفَينِ وسبعة» falls on the
  decree it is about. It is typography, never a facsimile: no signature block, seal, rosette,
  emblem or palace. It carries:
  - the decree's title as it was gazetted: «مرسوم بقانون اتحادي رقم (6) لسنة 2007 بإنشاء وتنظيم المركز الوطني للأرصاد
    الجوية والزلازل» / FEDERAL DECREE-LAW No. (6) OF 2007, on the establishment and regulation of the National Center of
    Meteorology and Seismology (the name until Federal Law No. 13 of 2017 renamed it; the 2007 title matches the 2007
    gazette line under it, and the seismic station among the instruments);
  - «أبوظبي، 1428هـ الموافق 2007م · الجريدة الرسمية، العدد 473» / ABU DHABI · 2007 · OFFICIAL GAZETTE No. 473. The day and
    month (3 Dhu al-Qa'dah 1428, 13 November 2007; published 15 November) stay off screen until NCM answers §11 row 2;
  - a credit in today's voice, never a signature: «أصدره المغفور له الشيخ خليفة بن زايد آل نهيان، طيّب الله ثراه» / ISSUED
    BY THE LATE SHEIKH KHALIFA BIN ZAYED AL NAHYAN.
- **The instruments (9.6–15 s).** The charter settles into the plate. Below it four engraved figures, the Center's
  instruments since its first years, draw in, each named in both languages: «رادار الطقس» / WEATHER RADAR (the C-band
  dish in its random-panel radome, cut away to show it turning on its pedestal and yoke); «محطة أرصاد آلية» / AUTOMATIC
  WEATHER STATION (a 10 m mast drawn to one scale, with a detail roundel of the cups and vane); «محطة رصد زلزالي» /
  SEISMIC STATION (a hut over a shallow vault, the sensor on its pier, and its seismogram; the National Seismic Network,
  August 2008); «مسبار جوي» / RADIOSONDE (the balloon lifting the sonde on its train from an airport station, AvMet). A
  gold thread drops from the decree to one ring; as VO-06 says «في مركزٍ وطنيٍّ واحد» a thread runs from each instrument
  into it and the Center's star glints on «واحد»; the map (B08) opens from that ring. The approved headline «ثم أسسنا
  مركزاً يرصد السماء» (held 4.6 s) and VO-06 are kept.
- **Not used.** Article 13's penalties (they read as a security clause); "official source" attributed to the decree
  (the decree's words are "unify the source", Art. 3, and "to the exclusion of all others", Art. 4; the approved
  "official source" line on B08 stays as approved). The proposing office (the Minister of Presidential Affairs, then
  H.H. Sheikh Mansour bin Zayed) is true and resonant, but it addresses the head of the hall, so it goes to protocol
  (§11 rows 2 and 43) with a ready line in the decree's own words, naming the office and not the person: «بناءً على ما
  عرضه وزير شؤون الرئاسة، وموافقة مجلس الوزراء» / "upon the proposal of the Minister of Presidential Affairs and the
  approval of the Cabinet". The default is no line.

**B10 · Zayed International (3 bars).**
- **Dawn (new, 1.5 bars).** Radiation fog lying on the airfield at sunrise, its commonest hour (about 24 fog days a year,
  peaking December–January around sunrise: Weston et al., JAMC 2021; about 70% radiation fog: Mohan et al., MWR 2020).
  From the courtyard between the piers, Terminal A's roof (319 m wide, arches up to 180 m, a 50 m facade: KPF) crowns
  the frame and a widebody at its gate stands out of the fog, unliveried. Label: «مطار زايد الدولي · أبوظبي» and «32.5
  مليون مسافر في 2025» / 32.5 MILLION PASSENGERS IN 2025 (Abu Dhabi Airports, 29 Jan 2026; Zayed International alone).
  New narration VO-09a, concessive so that it reinforces the unbroken watch instead of limiting it: «وحتّى حينَ يغشى
  الضَّبابُ المَدارِجَ عندَ الفَجر،» / "Even when fog settles on the runways at dawn,".
- **The arrival (1.5 bars).** From beside runway 31L's approach lights, 330 m out: a widebody on the 3° glide path passes
  over at its true 70 m/s and crosses the threshold about 17 m up (the AIP's datum height, 57 ft; the earlier plate said
  15 m) over lights drawn steady (no strobing); the runway dark asphalt; Terminal A and the 109 m crescent tower (NASM)
  at their true size beyond. Runway visual range transmissometers stand beside the runway (AIP GEN 3.5; their owner is
  not named). The approved headline and VO-09, and no register: VO-09's "a watch that never sleeps" already says it.
  The AIP names NCM as the airport's MET office, H24 (TAF every 6 h, a 2-hour TREND every 30 minutes) and as the
  Meteorological Watch Office for the Emirates FIR.

**B12 · Jebel Ali (2.5 bars).** The container quay in its length, in true 3D, seen from high over the harbour: Terminal
3-class cranes (69.5 m lifting height, reaching across ships 25 containers wide, over 138 m with the boom raised: DP
World) working ultra-large ships of the 400 m, 24,000 TEU class that call there (DP World, 2020), their bridges forward
and funnels aft standing clear of the stacks, yard blocks parallel to the quay under gantries. Under the port's name:
«طاقة استيعابية سنوية 19.4 مليون حاوية نمطية / موانئ دبي العالمية · 2026» / 19.4 MILLION TEU ANNUAL CAPACITY · DP WORLD,
2026 (DP World, 19 Feb 2025, restated 22 Jul 2026). A capacity, not a year's throughput: the 2025 figure was the last before the
2026 fall, and set under «ونقرأ البحر لكل سفينة» it read as NCM's outcome. No smoke, haze or warm glow (a berth fire
from interception debris, 1 Mar 2026), no red, no route lines, no liveries. The approved headline and VO-10.

**B13 · the east coast (2 bars).** The Port of Fujairah's VLCC Jetty No. 1 (in full operation since 2016; up to
330,000 DWT; 26 m below chart datum: Fujairah Ports Authority) with a tanker alongside, at the requester's direction.
The frame holds the jetty, its trestle to the breakwater, the sea and the Hajar only: no tank farm, manifold, buoy,
smoke, glow or backlight (the oil zone was struck on 3, 6 and 17 March and 4 May 2026, WAM; and on 14 and 16 March,
Reuters and Fujairah media). Her bow points south, away from the strait. The inset is NCM's product, never a map:
«النشرة البحرية · الساحل الشرقي» / MARINE BULLETIN · EAST COAST, its table written row by row and signed, and it leaves
before the dissolve into Shams 1. VO-10t keeps WAM's own verb (the AI helps prepare marine bulletins in general; WAM
does not name the east-coast one; §11 row 46): «وللساحلِ الشرقيِّ نشراتٌ بحريّة، يُسهِمُ الذكاءُ الاصطناعيُّ في إعدادِها،
ويعتمدُها المتنبِّئون،» / "for the East Coast, marine bulletins that AI helps prepare and forecasters approve;". Still
removable with `?pull=tanker`.

**B14 · clean energy (3.5 bars).**
- **Shams 1 (the plate stays).** Under its name, the operator's record with both its qualifiers: «أول محطة تشغيلية للطاقة
  الشمسية المركّزة على نطاق المرافق في المنطقة · 2013» / THE REGION'S FIRST OPERATIONAL UTILITY-SCALE CSP PLANT · 2013
  (Shams Power: "the first operational utility-scale CSP plant in the MENA region"; inaugurated by the late Sheikh
  Khalifa, 17 March 2013). Its sun's rays and red centre leave before the dissolve.
- **Al Dhafra Solar PV and the pledge (new, 2 bars).** The 2 GW field at the end of the day, in true 3D: bifacial
  modules on single-axis trackers, backtracking west, rows to the horizon, long shadows, a pyranometer in front (what
  NCM's solar-radiation forecasts are about); the low sun drawn as light. Label: «محطة الظفرة للطاقة الشمسية · 2
  جيجاواط · 2023» / AL DHAFRA SOLAR PV · 2 GW · 2023 (Masdar, 16 Nov 2023). Headline «الحياد المناخي بحلول 2050» / NET
  ZERO BY 2050, and under it «أول دولة في الشرق الأوسط وشمال أفريقيا · 2021» / FIRST IN THE MIDDLE EAST AND NORTH AFRICA ·
  2021 (Masdar, 7 Oct 2021: "the first Middle East and North Africa (MENA) nation"; "the region" alone would be
  contestable: Türkiye announced a 2053 target in September 2021). VO-11 keeps its approved full stop and VO-11b follows
  as its own sentence, echoed by the headline: «والإماراتُ أوّلُ دولةٍ في الشرقِ الأوسطِ وشمالِ أفريقيا تلتزمُ بالحيادِ
  المناخيِّ بحلولِ عامِ ألفَينِ وخمسين.» / "And the UAE is the first nation in the Middle East and North Africa to commit to
  net zero by 2050." "The world's largest single-site solar plant at its opening" (overtaken since, and DEWA calls the
  Mohammed bin Rashid Al Maktoum Solar Park the largest single-site solar park) goes to the programme, so the headline
  can be read for 4 s.
- **Left out.** Barakah (a drone strike caused a fire outside its inner perimeter on 17 May 2026), any pin map of
  energy sites, the 5.2 GW round-the-clock project (due 2027, not yet operating).

**B18b · the watch (new, 2.5 bars), after H.H. Sheikh Mansour's card.** Forecasters at work at night, after the working
day's sunset (the clocks read 19:05 UTC and 23:05 in the Emirates): three seen
from behind at a curved console, two in the ghutra and agal and one in the shayla, drawn in true proportion; the middle
forecaster's hand signs off a printed forecast. Above them a video wall (a geostationary full-disk image centred on the
equator at 45.5° E with Africa, Arabia and India under light cloud; the national picture with its weather hatched as a
chart hatches it; forecast charts) and two clocks, UTC and the Emirates' time. The room is generic: the real
Operations Centre, which H.H. Sheikh Mansour toured on 4 Aug 2025 (WAM), is drawn only from NCM's photographs (§11
row 47), so it is not named and the supercomputer appears only in the narration. Then the camera pushes into the
satellite image while the room fades to paper; the disc turns to the world beat's projection and the world dissolves
in over it (its approved iris would have opened a pale disc over the UAE); the gold emirates stay through the dissolve
and give way to Abu Dhabi's star. The disc's coastlines outside the UAE's box are Natural Earth 1:50m land (public
domain; Iran's shore faint, with no borders or labels); inside the box, the land, the islands and the neighbours' coasts
come only from the film's own UAE map. Label «المركز الوطني للأرصاد» / NATIONAL
CENTER OF METEOROLOGY; headline, echoing the end of the narration and giving the beat to its people: «وللمتنبئين القرار
الأخير» / FORECASTERS HAVE THE FINAL WORD. No figure: the only one to hand, the supercomputer's 2.8 petaflops
theoretical peak of 2021 (HPE), would read as modest to WMO guests beside peer services in 2027, so it stays off screen
until NCM gives a current, dated figure (§11 row 11). New narration VO-13b, the weather named as the object so nothing
reads as air-defence language (trimmed on 1 October; see below): «وتَرصُدُ المحطّاتُ والراداراتُ والأقمارُ الاصطناعيّةُ
الطقسَ، ويُشغِّلُ الحاسوبُ الفائقُ النماذجَ، وللمتنبِّئينَ القرارُ الأخير.» / "Stations, radars and satellites observe the weather,
a supercomputer runs the models, and forecasters have the final word." (WAM, 29 Jun 2026: outputs are reviewed and approved by specialists before issue.) Music: the
Center's pulse (B07) returns and rises into the world's F major. No station or radar count is shown: the published
counts conflict (radars: 5, 6, 7 or 9 by source and year).

**The world (B19) is unchanged** but for its entry, a dissolve. WMO's own wording is "the first GCC meteorologist" as
President; "first Arab" would be false (Egypt's M. F. Taha, 1971–1979). The term runs to Cg-20, 14–25 June 2027.

**One frame.** The new plates are drawn in true 3D, but they sit in the approved plates' frame (x 96–1027, y 60–990 on
a 1920 × 1080 screen), so the picture keeps one format from cut to cut and the words keep a clear gutter.

**The runtime.** 4:11.2 on screen is 71.2 s over the earlier ~3:00 instruction (which the approved 2:43.3 cut met). Every
added second answers a named ask: 19.5 s are the pace the requester asked for on 1 October and 36.7 s the slower detail
beats asked for the same day. *Superseded:* the tighter cut offered here before those two asks (the founding 4.5 → 3.5
bars, the airport shots 3 → 2, Jebel Ali 2.5 → 2, the jetty 2 → 1.5, the watch 2.5 → 2, the solar beat 2 → 1.5, 3:19.8)
would now undo them; if the room needs a shorter film, `?slow=0` (3:34.5) is the first step back (§11 row 43).

**The requester's notes on the review copy (1 October 2026).**
- *"The landscape in the final scene needs ADNOC HQ and Qasr Al Watan beside Emirates Palace."* Both now stand in the
  finale's skyline, computed from the same real viewpoint as the rest (the Marina by Marina Mall, 24.4769 N, 54.3225 E,
  looking south), at their true bearing and angular size:
  - ADNOC HQ (24.46194 N, 54.32417 E; 342 m, 65 storeys by CTBUH's count, 75 by HOK's; HOK, 2015): 1.67 km at bearing 174.2°, so its crown stands 11.6°
    up, below Suhail (12.2°) and well to its left, between the Nation Towers and the Etihad Towers. It is the slab the
    Corniche plate already draws, with the open square at its crown, its windows lit; no name or logo (§9.5; §11 row 48).
    The finale's earlier note that it stood east of the frame was wrong.
  - Qasr Al Watan (24.462251 N, 54.305509 E): 2.37 km at bearing 226.6°, to the right of Emirates Palace. Its central dome
    (37 m across) stands 60 m above the ground over the 100 m Great Hall, with a wing to each side; floodlit, as it is at
    night. At that distance it is about 25 px high on a 1080-line screen, its true size; the wings' extent and their
    small domes follow the palace's published massing and are to be checked against a photograph from the Marina before
    lock. It is the Presidential Palace, so its depiction goes to the Presidential Court with the charter's credits
    (§11 rows 43 and 48).
- *"Make it a bit slower so the audience can scan the texts in the subtitles."* The whole of Revision 11 now plays at a
  pace of 1.1 (10% slower; 72 BPM becomes 65.5): picture, words, dissolves and subtitles slow together, and the score is
  stretched by the same factor without changing its pitch (`pace.py`; the live recording will simply be played at 65.5
  BPM). The densest lines are also given more of their own beats (VO-02, VO-03, VO-04, VO-05, VO-07, VO-09, VO-13,
  VO-14a, VO-14b, VO-15a, VO-16; never across the next line), and VO-13b loses its «وعلى مدار الساعة», which repeated
  the airport's watch. Every subtitle now reads at 15.4 characters a second or less in English (it was up to 22.1, the
  list of professions in VO-15a) and 13.8 or less in Arabic (it was up to 20.0).

**The requester's second notes on the review copy (1 October 2026).**
- *"The locomotive of the train must be fixed."* The rail beat's head end is now drawn as the locomotive Etihad Rail runs,
  an EMD SD70ACS: the desert version of the SD70ACe (seven delivered in 2013 for Stage One; the 38 "EMD SD70" of the
  Stage Two fleet from Progress Rail, 4,500–4,600 hp; Railway Gazette 2011, 2013 and 2020; Etihad Rail 2020 and 2022),
  22.6 m over the couplers and nearly 5 m high (The National, 2011). It has the isolated wide-nose cab under a tropical
  roof, a short nose with two headlights, the long hood with a walkway and handrail along each side, louvred intakes
  behind the cab, the exhaust stack and the dynamic brake's roof grille, the radiator section at the rear wider than
  the hood with its two fans, two three-axle trucks whose side frames stand outside the 1,067 mm wheels, the fuel tank
  slung between them, and at the pilot the coupler, the ditch lights, steps at the corners and a V sand plough (the
  SD70ACS carries two fixed ploughs and a movable one; IRJ, 2015). The old drawing (a narrow box for a nose, a plough
  floating ahead of the pilot, toy bogies with the wheels outside their frames) is gone. Lengths the sources do not give
  (truck centres, the deck's height, the nose, cab and hood) are estimated from the SD70ACe's proportions; no livery or
  logo is shown (§11 row 50).
- *"The plane in the terminal needs a fix: review it."* Reviewed, and four faults fixed in the dawn shot at Terminal A:
  the parked 787-9 had its landing flaps out at the gate (they are now stowed, as at any stand; only the arrival keeps
  them out); its fin had an unswept trailing edge, a shark fin (both types' rudders now sweep back about 20°); the fog
  lay 5 m deep, so the wings, engines and gear vanished and the airliner read as a tube; and from the 18 m eye its near
  wing pointed straight at the lens and foreshortened to a sliver, with its nose cut by the frame's edge. The fog is now
  a shallow layer 3.3 m settling to 2.4 m (the wheels and the lower halves of the engines stand in it, the fuselage,
  wings, fin and nacelle tops above it), the eye is 28 m up, and the view is turned a little left, so the aircraft stands
  whole in the frame, nose to tail, at its jet bridge from the first frame.
- *"The national dress on the forecasters must be near real."* The three forecasters, still seen from behind, are
  redrawn in the dress as it is worn at work. The men wear a white collarless kandura (the tarboosha tassel hangs at the
  front, out of sight), a ghafiya under a white ghutra, and the agal. The ghutra stands off the head under the agal,
  widens over the shoulders and falls down the back as a triangle to the shoulder blades, with soft folds; on the left
  man one end is thrown back over the shoulder. The agal is two black coils on the crown, about a third of the way down
  the head, not a band round it, with the Emirati agal's two cords hanging down the back to small tassels. The woman's
  shayla wraps a rounded head, fuller high at the back, and falls over her shoulders with a long end down her back. It is
  engraved across the form, the loose abaya along it, so they read as two fabrics; the abaya's sleeve opens to an
  embroidered cuff. Her shoulders are about 2.35 head widths, true to life (the cultural adviser still confirms the
  dress, §11 row 47).
- *"The cloud, Geneva and Dr Mandous need an additional little credit in a scene."* Read as one credit for Geneva, its
  clouds and the WMO President, set in the world beat while the camera pushes toward the Geneva pin: a small engraved
  plate of WMO's headquarters at 7bis avenue de la Paix under fair-weather cumulus, the same clouds lying in its glass.
  It is drawn from the references gathered the same day (WMO; the architects and engineers; Geneva's register;
  OpenStreetMap): a true ellipse about 125 × 27 m (the width traced from the map), ground and nine floors to 35.81 m with
  the top floor's restaurant set back behind a terrace, blue and green glass with 38 external steel pillars, and the low
  conference-hall and library wings along its south side, seen from the south-south-east as in WMO's own photograph. Its caption, «مقرّ المنظمة العالمية للأرصاد الجوية · جنيف» / WMO
  HEADQUARTERS · GENEVA, is followed by «وفيه ترأّس رئيس المنظمة الدورة الاستثنائية للمؤتمر العالمي للأرصاد الجوية ·
  2025» / WHERE THE WMO PRESIDENT CHAIRED THE EXTRAORDINARY SESSION OF THE WORLD METEOROLOGICAL CONGRESS · 2025
  (Cg-Ext(2025), 20–23 October 2025, at WMO Headquarters, Geneva, chaired by Dr Al Mandous: WMO, the session's page and
  the Secretary-General's opening address; WAM, 23 October 2025). The beat's own lines then name the presidency and «معالي
  الدكتور عبدالله أحمد المندوس», as before. The plate and its lines keep clear of the pins' labels at the push's peak
  (§11 row 49). If "the cloud" meant cloud seeding, his WMO profile's "Lead of UAE Rain Enhancement Programme" is the
  verified line for a credit in the seeding beat. It is offered, not built: the programme runs under H.H. Sheikh Mansour
  bin Zayed's patronage, and his card follows the science beat, so a credit there is protocol's call.

**A real voice and real music (1 October 2026, at the requester's ask).**
- *The narration.* The 22 Arabic lines of Revision 11 are voiced by an AI narrator (ElevenLabs's multilingual model
  through Higgsfield, the preset voice "Jasper", chosen by the requester from four), read from the vocalised texts of
  §6, 0.3 credits a line. `data/narration-jasper.json` lists each line with its job and length; `vo_mix.py` fetches the
  lines, trims and cleans them, sets each at its cue on the paced cut (tightening a long line by at most 1.12x, else
  moving the next line and reporting it; only VO-15b moves, by 0.8 s), ducks the music 9 dB under the voice and masters
  to -16 LUFS under -1.5 dBTP. The lines cannot yet be downloaded here (the environment's network policy blocks the
  service's file host), so the review copies still carry the scratch subtitles over the score alone (§11 row 51).
- *The music.* The score's orchestra now plays recorded instruments: `score.py --samples` installs `sampler.py`, which
  plays the VSCO-2 Community Edition recordings (CC0) in place of the synthesised strings and pads, horn, timpani,
  pizzicato, glockenspiel, harp and the orchestral blooms, each note matched to the loudness of the voice it replaces.
  The Emirati instruments, the voices and the effects are as before; every leader's card still measures above the world
  beat (-13.5/-13.4/-13.4 against -15.2 LUFS). Built into `out/r11s/`; the approved cut's audio is byte-identical. The
  live recording at the gala, if any, still replaces both.

**Slower detail beats, and the plates come alive (1 October 2026, at the requester's ask).** *"i need to slow the video,
the audience cant catch the details, like the solar panels following the sun, also i want more tweak like this."* The
requester chose to slow the detail scenes (not the whole film again), and these living details: the fog lifting at the
airport, Jebel Ali at work, live radar on the watch wall, Shams 1's mirrors tracking, and "anything that add soul".
- *The slower beats.* Each of the ten detail beats (the two airport shots, the rail, Jebel Ali, the jetty, Shams 1, Al
  Dhafra, the seeding, the science and the watch) gains one bar, and its plate's clock slows in the same proportion
  (to 0.60-0.80 of its speed), so every motion, camera move and draw-in spans the longer beat and every label stays up to
  its end; cards, the opening, the founding, the map, the world and the finale keep their lengths. The cut runs 4:11.2
  on screen; `?slow=0` rebuilds the 3:34.5 cut exactly. The narration keeps its cues, so each line now has more room.
- *Al Dhafra Solar PV (the trackers follow the sun).* A time-lapse of the afternoon of 16 November at the plant (24.141
  N, 54.517 E; OpenStreetMap), 13:50 to 15:28: every row turns west with the sun, in unison, from 32.6 to 60 degrees,
  the stop of its Arctech SkySmart II trackers (Arctech, 7 Sep 2021; pv magazine, 15 Jan 2025), and the shadows swing
  and lengthen as the light warms. The sun comes from NOAA's solar-position equations and the angle from the standard
  single-axis formula. The beat ends as the rows reach their stop, before backtracking would begin (15:43): a sunset
  would have shown them turning away from the sun, so the beat is no longer "at sunset". *Simplified:* the plate draws
  112 modules a tracker (about 127 on the real plant) and one drive at the middle pile.
- *Shams 1 (the troughs track the sun).* A time-lapse of the late morning of 17 March 2013, the day of its inauguration
  (09:34 to 12:14 solar time): every ET-150 trough turns on its north-south axis from facing east toward the sun, about
  47 degrees, its section a true parabola with the receiver at its focus on its supports (DLR/CIEMAT EuroTrough: 5.76 m
  aperture, 1.71 m focal length); the collectors come on sun from a slight defocus, as Shams 1 runs them, and the
  receivers' glow grows steadily; each mirror facet is toned by what it reflects. One sun model moves the sun on the
  plate's dial and the troughs (NREL SolarPACES and Shams Power: 768 collectors in 192 loops, 27,648 receivers).
- *Zayed International (the fog lifts; the arrival lands).* The dawn shot is a time-lapse of the first half-hour after
  sunrise: the radiation fog settles and burns off from its rims into lenses as the sun climbs to 6.6 degrees, as fog
  does over a heating ground (NWS; CIMSS; Stull, *Practical Meteorology*), the light warms, and the apron works: a
  towbarless tug docked at the parked widebody's nose gear and a baggage tractor with three LD3 dollies. The arrival runs
  at real speed: 70 m/s on the 3-degree path, the threshold crossed 17 m up, the flare, and main-gear touchdown 310 m in,
  inside the beat (Airbus and Boeing flight-crew training manuals); to keep the touchdown in frame its eye now stands
  200 m out behind the approach lights. The approach lights glow steadily through the last fog; the sequenced flashers
  are never drawn (photosensitivity), and no visibility figure is put on screen.
- *Jebel Ali (at work).* Every quay crane works the real discharge cycle (hoist off the trailer, trolley out once
  clear of the ship's side, creep down onto the box, lock, hoist clear of the bay's highest stack, trolley in, set the box
  on a waiting trailer, unlock, and the tractor drives off), each at its own point in the cycle, at the ZPMC crane's
  speeds (hoist 90 m/min laden, trolley 240 m/min) in a gentle time-lapse (2.6 times life on screen). Terminal tractors
  with trailers run the portal lanes and the roadway behind the backreach, and the yard gantries make their runs: T3,
  whose cranes the plate draws, is semi-automated, with remote-operated quay cranes, automated rail-mounted gantries and
  driven tractors (Port Technology, 2015; Seatrade Maritime, 19 Jan 2016; Terberg and Kalmar tractor orders, 2014-15).
  *Simplified:* single 40-ft lifts only, no hatch covers.
- *The watch (live radar).* The wall's rain chart is now a radar composite as NCM's network makes it (six C-band
  radars; AMS 40th Conference on Radar Meteorology, 2023): five nested reflectivity bands drift east-south-east across
  the UAE's coast, the cells growing and decaying, with the coast and borders over them and nothing else: no range
  rings, radar sites, sweep, pins or arcs. The satellite image's fronts and cloud bands drift, and keep drifting on the
  disc through the push into the world; the camera mosaic's skies change slowly. The forecasters move: a hand on a mouse,
  a head turning toward the wall, and a fourth forecaster standing at the wall following the rain band with an open hand
  (a weather briefing; protocol may prefer him seated, §11 row 43).
- *Soul.* Arabic coffee on the forecasters' desk: a brass dallah with its crescent beak and three finjan, true to size
  (Arabic coffee, UNESCO's list, 2015); dromedaries grazing and walking calmly outside Etihad Rail's camel fence while
  the freight passes (the line's camel fence and underpasses: Etihad Rail's civil-works specification; Gulf News, 11 Sep
  2023); gulls gliding over the jetty at their true size, and a slow swell running along the moored tanker's waterline.
- *The music.* The score is rebuilt on the new bar lengths (not stretched further): sounds that belong to something drawn
  (the arrival's jet, the seeding aircraft and the rain from its cloud, the winds) follow the plates' slower clocks, and
  the watch's walk gains a bar (D minor, B flat, G minor, C). Every leader's card still measures above the world beat
  (-13.6/-13.7/-13.6 against -14.1 LUFS); the approved cut's score is byte-identical.
- *Checked.* The review copy (4:11.2) passes the photosensitivity pre-check (`qc/pse.py --fps 30`: no flash transitions,
  no red flashes), its sound sits on the mix at zero lag, the dissolve into and out of every new beat was reviewed at its
  midpoint, and every motion was stepped frame by frame for smoothness. The approved cut's cue lists, score and stills
  are unchanged.

**The requester's third notes (1 October 2026).** *"i think no need for narration, but the backgound sound must be
enhanced, the airport scene and the aircraft must be enhanced, the sun over the solar must reach the right not fading
and ending the scene in the middle, the camel eating desert grass in uae desert in the rail scene, Hili water way must
have a sound effect of water not a mechanical generation sound."*
- *No narration.* No voice is heard; the review copies drop the narration's subtitles, and the on-screen headlines and
  labels carry the film's messages (among them H.E. Dr Abdulla Ahmed Al Mandous's WMO presidency). §11 row 51 is closed.
- *The sound (`foley.py`, `score.py --foley`).* Every sound effect is now a field recording, or a physical model of an
  event no free recording covers: the falaj's water is a real stream babbling over stones (gluckose, CC0) where it was
  filtered noise under a regular pulse; the desert wind is Felix Blume's (CC0); the dhows' sea is water along a sailing
  boat's hull with its timbers creaking; the jetty has lapping water and gulls; the seeding cloud's rain, the passing
  freight and the night's crickets are recorded; Jebel Ali gains water at the quay, gulls and the twistlocks of the boxes
  the cranes set down; the operations room its keyboards. The landing airliner is modelled as heard from beside the
  runway: its roar comes up under the end of the dawn shot, and the Doppler fall, the ground reflection's sweeping comb
  and the reverse thrust after touchdown follow the picture's own timing. The drums of Al Ayyala and the sea songs are
  recorded hits (the Versilian Community Sample Library, CC0). Each recording is set to the loudness of the sound it
  replaces, so the balance with the music holds; every leader's card still measures above the world beat. *Clearance:*
  the recordings from the Moodist collection (the sailboat, the gentle waves, the gulls, the train, the keyboards, the
  gusty wind) are under the Pixabay Content License or CC0, as Moodist states without naming each file's source; both
  allow use in a film without credit, and a library replacement is listed for the masters if protocol prefers named
  sources (§11 row 52).
- *Zayed International and the airliner.* One real type throughout, a Boeing 787-9 with no marks, built from Boeing's
  airport-planning document (D6-58333): its fuselage section, radome and flight deck, its windows and doors, the 35-degree
  wing with raked tips, flap-track fairings, flaps, slats and spoilers, GEnx nacelles with chevrons, the swept tail, and
  four-wheel bogies; stowed at the gate, flaps 30 and slats out on arrival, the spoilers rising and the reversers opening
  at touchdown; steady landing lights, the beacons dark (no strobes). The dawn shot looks down on it at its Terminal A
  pier, two jet bridges docked at L1 and L2, the tug at its nose gear, a baggage train passing, as the fog lifts. The
  arrival is now a tracking pan from beside runway 31L (150 m from the centreline): the aircraft in its flare, its main
  gear touching 298 m in, the nose lowering, the crescent tower sliding in behind it, all at real speed. *Not possible:*
  the full approach at real speed in one beat (it opens in the flare), and the tower in the dawn shot (it stands toward
  the rising sun, behind any viewpoint where the terminal is lit). *Corrected:* runway 31L's true bearing (308 degrees;
  306 is magnetic), the touchdown-zone markings' coding, and the met enclosure's position (UAE AIP).
- *Al Dhafra Solar PV.* The sun now travels the whole way across to the right of the picture and settles there, whole
  and bright, before the scene dissolves; the camera turns slowly against the sun's swing west so its path spans the
  frame, the rows still turning with it to their 60-degree stop; the glow around the disc no longer darkens.
- *The rail.* The camels eat the plain's own plants, sown in true size: thumam grass (Panicum turgidum), thanda (Cyperus
  conglomeratus), rimth (Haloxylon salicornicum) and arta (Calligonum comosum). The nearest camel works her lips into a
  thumam tussock, tears a mouthful (the tussock is shorter after), lifts her head with the culms hanging and chews; the
  others crop grass and browse shrubs (El-Keblawy et al., *Journal of Arid Environments*, 2009; ENHG, 1985; UAE Flora).

**Reviewed.** A seven-lens panel (protocol and 2026 context, facts, Arabic, the founding's picture craft, the maritime
plates, energy and the watch, continuity) reviewed the first build on stills; every blocker and major finding above
was fixed. **Checked.** Every new plate was rendered in both looks; nothing is drawn right of the picture box and
headlines keep a 60 px gutter from it; the words were measured to fit the column; the score builds (every leader's card
at or above the world beat); the default cut's cue list, cue sheet and four score WAVs are byte-identical to Revision 8.

## Revision 10 · 30 September 2026: Emirati crafts and skills (a draft for approval)

The requester asked to be surprised with "UAE touch skills" in the film: its crafts and traditional know-how. The
touches are behind a switch, `?heritage`, which works with or without `?colour`. Without it, the film is the approved
Revision 8: 20 stills, one from every beat, are identical to the pixel. No touch adds a word on screen.

**How they were chosen.**
- Four researchers checked 22 candidates against sources: weaving; land and nature; the sea and the city; the
  sky lore.
- A judge chose six that are true to their place and period and visible at true scale.
- Ten independent reviewers then tried to refute them, two per touch, one reading for culture and truth and one for
  picture craft.
- One touch was dropped, and the rest were corrected as recorded below.

**The touches.**
- **Monsoon (B03): the compass card as «الدِّيرة».**
  - This is the Gulf seafarers' compass (Juma bin Thalith, «رجال الغوص واللؤلؤ», KHDA and the Emirates Diving
    Association, reviewed in Al Bayan, 28 Feb 2010).
  - Its card carries the 32 akhnan, named for the risings and settings of stars as Ibn Majid records them.
  - The marks, unlabelled:
    - a small ink star at north, «الياه» (al-Jah, the Pole Star);
    - an empty ring at south, «القطب», where no star stands;
    - one gold star at SSE (157.5 deg), Suhail's rising, the star the film opened on. From here Suhail itself rises
      at about 151-152 deg (computed).
  - The card holds still with north up, as a compass card does. The isba' scale's star is ink: Ibn Majid measured
    the Pole Star.
- **Pearling (B04): the nahham.** A fifth figure stands forward of the mainmast: the boat's song leader, whose call
  the score carries.
  - He stands still like the crew. No gesture is drawn or claimed; a hand to the ear would read as the call to
    prayer.
  - He stands or falls with the call (row 37).
- **The three leaders' cards: Al Sadu's al-hubub.**
  - Each rule becomes a strip of al-hubub, "the grains": small grains on a paper ground between two edge lines,
    woven outward from the star.
  - The design is described by DCT Abu Dhabi as "long, usually white strips with points like crop grains". Al Sadu,
    the traditional weaving skills of the UAE's Bedouin women, is UNESCO element 02223, on the Representative List
    since December 2025 (WAM, 17 Dec 2025).
  - In colour every other grain takes the Hajar rust, standing in for Sadu's red yarn.
  - The code is the same for all three cards.
- **Rail (B11): the ghaf.**
  - Seven ghaf trees, the national tree, stand on the plain near Al Dhaid, drawn from the plate's own perspective.
    They are 6.5-7 m tall, bare to the camels' browse line at 3.2 m, with a rounded crown whose lower edge is a
    ragged weeping hem.
  - The browse line and the stands' densities at Dhaid (29.4 trees a hectare on gravel, 93.7 on sand) are from
    Gallacher and El-Keblawy (2016). The places are composed, not surveyed, and the plain is drawn far sparser than
    a stand.
  - No tree stands behind the train's roofline or under the far palm grove.
- **Finale (B20): al-Shi'ra above Suhail.**
  - As the gold ring closes, the computed sky puts Sirius straight above Suhail. Ibrahim Al Jarwan notes that
    al-Shi'ra and Suhail stand one above the other over the southern horizon after sunset as spring arrives, about
    20 March (WAM, 4 Aug 2020).
  - A soft halo on Sirius, from the ring's close, lets the eye find the pair. It is drawn only if the computed sky
    aligns them to within 1 deg at that moment, so the ceremony date decides it (row 1). It eases to half by the
    film's end, which the stage holds keep.
  - There is no line and no label.

**Dropped or rejected, with the reason.**
- The palm-mat sail as Emirati khoos. It was built, then dropped on review: nothing showed on screen, and the sources
  for palm-mat sails are Red Sea and East African (doum palm), not Gulf.
- A falcon at the man's wrist in the opening. On 24 August a falconer's bird is in its moult, and the falcon is the
  form of the federal emblem.
- Sadu saddle bags on the camel: invisible in a pre-dawn silhouette. The camel's saddle (shdad): the sources conflict
  on its profile.
- A date-harvest climber at the falaj: he would be on screen while the narrator names Sheikh Zayed (the likeness
  rule).
- A dhow at the Marina in the finale: not reliably in that water on the evening.
- A barjeel: no beat's place and period allows one.
- A dallah and finjan at the Center: its story link is hospitality, not reading the sky, and it can read as a coffee
  break.
- Re-grading the isba' to Suhail, and animating the Suhaili wind from the star. The second would read as the star
  bringing the wind (the anwa').

**Words, off screen only.** Each needs a native Arabic edit and protocol's approval before it is used.
- For the MC or the programme:
  - «في أمسيات مارس تتعامد الشِّعرى وسهيل على الأفق الجنوبي مع قدوم الربيع.»
  - "On March evenings al-Shi'ra and Suhail stand one above the other over the southern horizon as spring arrives."
  - Describe the pair only as a marker of time, never as bringing or governing the season.
- For the programme: "The cards' borders follow al-hubub, a design of Emirati Al Sadu, now on UNESCO's Representative
  List."
- Do not call Al Talli or Al Sadu "urgent safeguarding": Talli is on the Representative List (2022), and Sadu moved to
  it in December 2025.

**Checked.**
- Every touch was rendered at 1080p and 4K, in the plain and colour looks.
- LED rules: lines are 1 px or more, and parallel lines at least 2.5 px apart at 1080p.
- Nothing pops or flashes.
- The film's last frame still opens stage hold A exactly.
- Without the switch, all 20 beat stills are identical to Revision 8.


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

**What it is not.** It is not an economic-impact film: v3's sector figures (18.2% of GDP, 21 million TEU, 6 GW) describe sectors, not NCM outcomes, so they go to the press fact sheet with their qualifiers. (Revision 11, a draft, shows a few owners' facts that answer the requester's named asks, each under its owner's name and never under an NCM headline: §9.3.) It does not claim what other bodies do: no "keeping skies open", no "guiding ships", no "lives saved", no alerts on phones.

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

> **Superseded by the revisions above and by `SCRIPT.md`** (the beats and times as built, under "Beats"). The film as built runs 2:43.3 in 20 beats. This section records the original plan.

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

**Pronoun arc.** The heritage is told as "they" (the people of this land). The founding and the services are told as "the Center". From water onward it becomes "we" (the nation). The last line joins them: *so the nation can plan for tomorrow with confidence.* (Revision 5: the on-screen headlines speak as "we" from the first chapter; the narrator keeps this arc.)

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
| 127.8–136.3 | B (pins) | جنيف · إقليم تركستان، كازاخستان · 2026 · المغرب · 2025 · لاهور، باكستان · 2023 · إثيوبيا | GENEVA · TURKISTAN REGION, KAZAKHSTAN · 2026 · MOROCCO · 2025 · LAHORE, PAKISTAN · 2023 · ETHIOPIA | src-62, src-63, src-64 |
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
| Likenesses | No generated or drawn depiction of national symbols or public figures without official approval | No faces, silhouettes, portraits, signatures or seals of any leader. Text-only cards. The only people drawn are anonymous historical figures (the diver and hauler) at small scale and, in Revision 11 (`?rev11`), three anonymous forecasters seen from behind in true proportion (no faces; §11 rows 43 and 47) | [V] UAE Media Council, 25 Sep 2025; VIG official-portraits guideline |
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
| The Atmosphere supercomputer's 2.8 petaflops (2021) | Too much text for the science beat; in Revision 11, a 2021 theoretical peak would read as modest to WMO guests | Press, until NCM gives a current, dated figure |
| "8 patents" | Source says "obtained and filed" and is undated | — |
| UAEREP country and researcher counts | Sources conflict (9 vs 13) | — |
| Aircraft and mission counts for 2025 | Sources conflict | — |
| Any seeding percentage | Sources range widely; NCM's own scientists say the effect is unquantified | Q&A only, with the caveat |
| Sector sizes (18.2% of GDP incl. aviation-enabled tourism, 2023 data; ~21 million TEU, 2023; 6 GW, 2024) | They describe sectors, not NCM outcomes | Press fact sheet, with their qualifiers |
| "24 hours' notice cuts damage by 30%" | Would read as an NCM outcome | — |
| The UN 2026 Water Conference | A UAE-government event, not NCM's | MC script, past tense |
| The founding day "13 November 2007" | See §11 on the anniversary date | — (Revision 11's charter shows the year only, until §11 row 2 is answered) |

**On screen in Revision 11 only (`?rev11`, a draft):**

| Figure | Qualifier on screen | Source | Status |
|---|---|---|---|
| Federal Decree-Law No. (6) of 2007; 1428 AH / 2007; Official Gazette No. 473 | the title with the Center's name before 2017; the year only | UAE Legislation portal (today's consolidated title; the pre-2017 name); the Gazette record (issue and date) | [S] reconstructed: confirm the 2007 wording word for word against Gazette No. 473 or a November 2007 report before lock; if it cannot be confirmed, use today's title with «وتعديلاته» / AS AMENDED and drop the Gazette line |
| 32.5 million passengers, 2025 | Zayed International alone | Abu Dhabi Airports, 29 Jan 2026 | [V] |
| 19.4 million TEU | annual capacity, DP World (not throughput) | DP World, 19 Feb 2025, restated 22 Jul 2026 | [V] |
| Shams 1 · 2013 | the region's first *operational utility-scale* CSP plant | Shams Power | [V] |
| Al Dhafra Solar PV · 2 GW · 2023 | — ("largest at its opening" to the programme) | Masdar, 16 Nov 2023 | [V] |
| Net zero by 2050 · 2021 | first in the Middle East and North Africa | Masdar, 7 Oct 2021 | [V] |
| Cg-Ext(2025) · Geneva · 2025 | the Extraordinary Session of the World Meteorological Congress, held at WMO Headquarters on 20–23 Oct 2025 and chaired by the WMO President (named in the next lines) | WMO, the session's page and the Secretary-General's opening address; WAM, 23 Oct 2025 | [V] |
| Sector sizes | *Superseded under `?rev11`* for the Jebel Ali capacity only, set under the port's name, apart from NCM's headline | — | — |

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
- Avoid the WMO Executive Council week (EC-81, 8–12 March 2027 in Geneva, chaired by Dr Al Mandous; FINAC-47 on 5 March; moved from 1–5 March by the President, WMO Secretary-General's letter of 30 July 2026).

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
| 1 | The ceremony's date, hour and venue | It sets the finale sky and readout, the Ramadan/Eid music version, the mourning check, and a clash check with EC-81 (8–12 Mar 2027; moved from 1–5 Mar: WMO letter, 30 Jul 2026) | NCM | Finale computed for 15 March 2027, 20:00; readout hidden |
| 2 | **Which founding act and date the anniversary marks, and who is credited.** The only dated instrument on record is Federal Decree-Law No. 6 of 13 November 2007, so March 2027 is 19 years and 4 months after it. The page also cites a resolution of the Minister of Presidential Affairs creating the Center (Resolution No. 16 of 2007); that minister in 2007 was H.H. Sheikh Mansour bin Zayed (to be confirmed). If that resolution is the founding act, VO-07 must name both acts in order **Verified 29 Sep 2026:** the decree-law's preamble cites *Ministerial Decision No. 16 of 2007 on the establishment of the National Centre of Meteorology & Seismology*, which the decree-law abrogated, and Article 2 made the Center a unit reporting directly to the Minister (Lexis Middle East, Decree-Law 6/2007). H.H. Sheikh Mansour bin Zayed was appointed Minister of Presidential Affairs on 2 November 2004 (WAM, 2 Nov 2004) and, as that minister, presided over the Center's first board of trustees at the Presidential Palace on 22 June 2008, which approved its bylaws and structure (Khaleej Times / WAM, 23 Jun 2008). So the minister of the 2007 decision was H.H.; the decision's own date (the month the anniversary marks) is still to be read from the Official Gazette. | «عشرون عاماً» must be true on the night, and a founding act by a leader in the front row cannot go uncredited | NCM (documented date and instrument, in writing) | «2007» only; the VO credits the decree-law; Revision 11's charter shows the year and the gazette issue, not the day. Fallbacks: «في عامه العشرين» / "In its twentieth year" (true from 13 Nov 2026), or tie the evening to World Meteorological Day, 23 March 2027 |
| 3 | Dr Al Mandous's current NCM title in Arabic and English (مدير / مدير عام / رئيس المركز), for the MC script and credits **Verified 29 Sep 2026:** a federal decree of 15 April 2026 gives Dr Al Mandous ministerial rank («درجة وزير»; WAM, 15 Apr 2026, which then calls him «مدير المركز الوطني للأرصاد»), so «معالي» / His Excellency is right, as the film has it. See row 21 for the title after the May 2026 amendment. | 2026 sources conflict | NCM protocol | Name and WMO presidency only; the page's «آنذاك» to be removed |
| 4 | NCM's parent body (the Presidential Court) as of 2026 **Verified 29 Sep 2026:** Federal Law No. 2 of 2026 (4 May 2026) replaced «the Minister» in the Center's decree-law with «the Chairman of the Court» (Lexis Middle East), so the Center now reports to the Chairman of the Presidential Court, H.H. Sheikh Mansour bin Zayed. | Credits and the MC script | NCM | Not stated in the film |
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
| 21 | Dr Al Mandous's title: WAM has called him «رئيس المركز الوطني للأرصاد» / "President of NCM" since July 2026, after the 2026 amendment to NCM's law. Did the amendment also create a separate Director who will be in the hall? He is never «وزير» **Verified 29 Sep 2026:** the same Federal Law No. 2 of 2026 replaced the decree-law's «Board» and «Board of Trustees» with «the Chairman of the Centre» (Lexis Middle East), which explains «رئيس المركز» in WAM since July 2026. Whether Dr Al Mandous holds that chair, and whether a separate Director-General remains, is still NCM protocol's to confirm in writing. | The film never says he leads NCM; the MC script must acknowledge any Director | NCM protocol | Name and WMO presidency only |
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
| 41 | **The colour pass (Revision 9, `?colour`):** adopt it for the ceremony masters, and if so as drafted or more restrained. Management asked for the film to be "More colorful" | The look of the whole film in the hall; the LED grade is calibrated on the wall with it | Requester and NCM | The approved Revision 8 look; the colour pass is delivered as a subtitled review copy |
| 42 | **The Emirati crafts and skills (Revision 10, `?heritage`):** adopt them for the ceremony masters, all or some (the «الدِّيرة» card, the nahham, Al Sadu on the cards, the ghaf, al-Shi'ra above Suhail) | Heritage shown before the Vice President must be true and dignified; the cards carry the leaders' words | Requester, NCM, the cultural adviser (row 37) and the protocol office | The approved Revision 8 look; the touches are delivered in a subtitled review copy |
| 43 | **The founding, the working day in full and the watch (Revision 11, `?rev11`):** adopt them for the ceremony masters, all or some (the decree's charter and the Center's instruments; the two airport shots; Jebel Ali's quay; the Fujairah jetty; Al Dhafra Solar PV and the net-zero pledge; the forecasters' watch). The film grows to 4:11.2 on screen at the pace the requester asked for, with the detail beats a bar longer each (3:48.3 at the design tempo), 71.2 s over the earlier ~3:00 instruction; the cut before the detail beats were slowed (3:34.5) stays buildable with `?slow=0`. The charter's founding credit is the decree-law's issuer; whether the charter also carries the proposing office in the decree's own words («بناءً على ما عرضه وزير شؤون الرئاسة، وموافقة مجلس الوزراء» / "upon the proposal of the Minister of Presidential Affairs and the approval of the Cabinet"; that minister in 2007 was H.H. Sheikh Mansour bin Zayed) is the Court's decision, tied to row 2; and whether the watch keeps a forecaster standing at the wall, his open hand following the radar's rain band over the UAE, or seats him (a weather briefing, with no symbol on the map; the 2026 reading is protocol's to judge) | The requester asked for them; they lengthen the film by 87.9 s on screen (31.7 s of new beats at the design tempo, then the pace and the slower detail beats); the charter is now the main message, so its credits are protocol's | Requester, NCM and the Presidential Court's protocol office | The approved Revision 8 cut; Revision 11 is delivered in a subtitled review copy; the charter without the proposing-office line |
| 44 | **The Fujairah jetty in the 2026 context.** The oil zone and the port's manifolds were struck in March and May 2026. The plate shows only the jetty, the breakwater, the sea and the Hajar, calm and in morning light, bow south | A terminal picture can read as a target or damage | NCM, the protocol office and MoFA; the go/no-go checks as for the tanker beat | Built as requested; removable with `?pull=tanker` |
| 45 | **The operators' figures on screen (Revision 11).** 32.5 million passengers at Zayed International in 2025 (Abu Dhabi Airports); Jebel Ali's annual capacity of 19.4 million TEU (DP World; not its 2025 throughput, the last before the 2026 fall); Al Dhafra Solar PV, 2 GW, 2023 (Masdar; "the world's largest single-site solar plant at its inauguration" goes to the programme); Shams 1, the region's first operational utility-scale CSP plant (Shams Power); the first nation in the Middle East and North Africa to commit to net zero (Masdar, 2021). Each is its owner's fact, with its year and every qualifier, set under the place's name, never under an NCM "we" headline | Every number on screen carries its source and year; the owners may wish to see them | NCM communications, with each owner | As built, with the sources in Revision 11 and §9.3 |
| 46 | **VO-10t in the approved cut.** It says NCM's AI drafts the east-coast bulletin; WAM (29 June 2026) says the Forecaster Assistant helps prepare weather and marine bulletins in general, without naming the east-coast one. Revision 11 uses WAM's own verb | The narration is not yet recorded, so it can be corrected before the session | NCM and the Arabic editor | Revision 11's wording, «…نشراتٌ بحريّة، يُسهِمُ الذكاءُ الاصطناعيُّ في إعدادِها، ويعتمدُها المتنبِّئون،» |
| 47 | **The Operations Centre and the forecasters (Revision 11, B18b).** Reference photographs of NCM's Operations Centre, and of consenting staff at work, so the room can be drawn as it is and named; the cultural adviser (row 37) to confirm the ghutra, agal and shayla as redrawn from behind on 1 October. Public sources (1 October) name the room «مركز العمليات» / Operations Centre at NCM headquarters in Al Shawamekh, staffed around the clock, and describe its wall (satellite, radar, station reports; live feeds from 26 cameras; winds from about 110 stations every 15 minutes on the UAE map), which the wall now shows; its layout is not public, so the room stays generic and unnamed (the two-coil agal on the crown with its two cords, the ghutra's triangle to the shoulder blades, the shayla over the abaya). Until then the room is generic and unnamed, and the supercomputer appears only in the register | H.H. Sheikh Mansour toured the real room on 4 Aug 2025, and NCM's staff work in it; an invented interior must not be labelled as theirs | NCM communications and the cultural adviser | A generic room, not named; three anonymous forecasters seen from behind |
| 48 | **The finale's two new landmarks (Revision 11, 1 October).** ADNOC HQ in the closing skyline, in the 2026 context (ADNOC's Ruwais complex and its Fujairah terminal were struck in March 2026, and ADNOC vessels attacked in Hormuz); and Qasr Al Watan, the Presidential Palace, whose depiction the Presidential Court approves. Wikimedia Commons flags both buildings as copyrighted architecture with no usable freedom of panorama in the UAE, so a commercial film may need the owners' clearance (not legal advice); Qasr Al Watan asks that commercial filming be cleared through contact@qasralwatan.ae | The requester asked for both. Each is drawn as the other landmarks are, a quiet lit silhouette at its true size with no name, logo, beam or glow beyond its own floodlights; the closing frame is the film's calm last image | The protocol office and the Presidential Court | As built; without approval, the finale returns to the approved skyline (both are drawn only under `?rev11`) |
| 49 | **The Geneva credit (Revision 11, 1 October).** A small plate of WMO's headquarters in Geneva in the world beat, captioned «مقرّ المنظمة العالمية للأرصاد الجوية · جنيف» / WMO HEADQUARTERS · GENEVA, and the line «وفيه ترأّس رئيس المنظمة الدورة الاستثنائية للمؤتمر العالمي للأرصاد الجوية · 2025» / WHERE THE WMO PRESIDENT CHAIRED THE EXTRAORDINARY SESSION OF THE WORLD METEOROLOGICAL CONGRESS · 2025, ahead of the presidency and his name. The building's width (about 27 m) is traced from OpenStreetMap, ±3 m; its length, storeys and height are published; WMO may wish to see its own house drawn | The requester asked for a little more credit to Geneva and to Dr Al Mandous; the line is the WMO's and WAM's own fact (Cg-Ext(2025), 20–23 Oct 2025, WMO Headquarters); the wording about the WMO President goes to protocol with the name | NCM communications, the protocol office, and WMO's communications if NCM wishes | As built; without approval, the world beat returns to its pins, the presidency and the name (all of it is drawn only under `?rev11`) |
| 50 | **The locomotive and the wagons (Revision 11, 1 October).** The rail beat's head end is drawn as an EMD SD70ACS, the type Etihad Rail runs, to the dimensions found on 1 October (the maker's brochure and railfan data): 22.63 m, 4.84 m high, 3.12 m wide, truck centres 14.58 m, HTSC-II trucks of 3.81 m wheelbase, the deck at 1.854 m; the nose, cab and hood lengths are scaled. The wagons are CRRC's Stage Two aggregate hoppers (13.7 m, 3.212 m, rounded side sheets, three bottom doors, cool grey; CRRC, 17 Sep 2026), their height estimated. Etihad Rail describes the locomotives' livery as light grey "relieved with broad red bands" with its logo mid-body (2012); the bands are not drawn until their path is seen in a photograph or video (two AI video analyses are queued), and no logo is shown. Since 3 Oct 2024 the company's Arabic name is «قطارات الاتحاد» and its logo is new | A named operator's vehicle must be drawn as it is | NCM communications, with Etihad Rail | As built; the approved cut keeps its v3 drawing |
| 51 | **The AI narrator (Revision 11, 1 October). Resolved, 1 October: the requester decided the film needs no narration**, so no voice is heard and the review copies no longer carry the narration's subtitles; the record below stands for reference. The narration is voiced by an AI voice (ElevenLabs through Higgsfield, "Jasper"), not a recorded narrator. It speaks the Founders' and the President's names, H.H. Sheikh Mansour's precedence lines and «معالي الدكتور عبدالله أحمد المندوس». Whether an AI voice may be heard at a state gala (and whether it is disclosed), or serves only as the guide track for a human narrator's session, is protocol's call; an Arabic editor checks every line's pronunciation and stress (the names, «جُلْفار», «سُهَيل», «المَنْدوس») | The requester asked for a real voice now; an AI voice at an official ceremony may need approval and disclosure | The protocol office, NCM communications and the Arabic editor | The scratch subtitles with the score alone; the AI lines as a guide track for a human narrator |
| 52 | **The recorded sound effects (Revision 11, 1 October).** Most effects are CC0 recordings with named recordists (the stream: gluckose; the wind: Felix Blume; the rain and the night: Noisekun's library; the drums: VCSL). Six come from the Moodist collection, under the Pixabay Content License or CC0 without a source named for each file (the sailboat, the gentle waves, the gulls, the train, the keyboards, the gusty wind). Keep them, or replace them with named library recordings (or the studio's own) for the masters | Both licences allow use in a film without credit, but protocol may want every source named | Requester and the post-production studio | Keep; the studio may swap any of the six without changing the cut |
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
