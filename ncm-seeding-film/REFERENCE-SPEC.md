# Reference spec — observed facts

Derived from the reference material supplied 2 Aug 2026. These override the earlier prompt packs
and the GHAITH skeleton wherever they conflict. **Nothing should be rendered against the old
descriptions.**

## The aircraft

Beechcraft King Air C90, National Center of Meteorology.

- **White fuselage with a twin GREEN pinstripe** running the length of the body — a darker green
  over a lighter green — sweeping up over the rear fuselage. Green also on the wing upper surface
  and engine nacelle accents.
- **Rear fuselage titles:** UAE coat of arms, then المركز الوطني للأرصاد above
  *National Center of Meteorology* in English.
- Small Beechcraft King Air titles forward, near the cockpit windows.
- Oval cabin windows, airstair door on the port side.

### Note on the GHAITH skeleton

The skeleton specifies *"white with navy blue belly, red pinstripe, NCM roundel on tail"*. That
matches the navy/red fleet aircraft, not the green one described above. Both exist — see
*Known liveries* below.

**Correction.** An earlier version of this file called the navy-and-red King Air in `IMG_3647`
"a different airframe" and said not to take livery from it. That was wrong. Its titles read
وزارة شؤون الرئاسة / *Ministry of Presidential Affairs*, and that aircraft is also part of the
seeding operation. The fleet carries more than one livery.

### Known liveries

| Livery | Seen in | Titles |
|---|---|---|
| White + twin **green** pinstripe | hangar clip, `IMG_3730` (N6151A) | Arabic + English National Center of Meteorology |
| White + **navy/red** pinstripe | landing clip, night-hero clip | NCM roundel on tail, "Cloud Seeding" |
| White + **navy/red** pinstripe | `IMG_3647` (display model) | Ministry of Presidential Affairs |

All three are legitimate. **The constraint is consistency within a single film, not choosing a
single "correct" livery.** The delivered GHAITH 4K master uses navy/red and is therefore valid;
it does not need re-rendering for livery. Pick one per film and hold it across every shot.

## The seeding flares

- Plain **white cylinders** with **GREEN end caps**, plus a narrow orange/red band partway along
  the body. Body stencilling reads *Ghaith* (غيث).
- Mounted in **multiple parallel rows** on rack rails beneath the wing — a dense block of flares,
  not a sparse line.
- Green caps face **forward**; the bodies extend rearward, and the burn and smoke go rearward.

### What was wrong before

- The skeleton's *"green-tipped salt flares"* was **correct**.
- The earlier brief's *"red covers face the tail"* was applied as hardware colour and is wrong;
  the red seen in the cel-shaded reference is the **ignited end**, not the cap. Green caps,
  red glow only when burning.
- Flare density was under-rendered throughout: the references show many tightly packed rows.

## The headquarters

Blue-glass mid-rise, perimeter wall carrying the NCM roundel, the UAE coat of arms, and
المركز الوطني للأرصاد above *National Center of Meteorology*. Three UAE flags on poles.
Shaded parking canopies along the frontage.

## The Central Forecast Office

Curved room, floor-to-ceiling windows along one side showing sunset. A very large curved satellite
map of the UAE fills the end wall, with live radar cells in green/yellow/red over the eastern
Emirates and Al Ain labelled. A male forecaster in kandura and ghutra stands at the wall pointing
at the cell; operators in kandura and black abaya at a long curved console of many monitors; a
woman in black abaya foreground holds a radio handset. Cool screen light against warm window light.

This reference is close to a finished shot 02 as it stands.

## Style split — important

The supplied references are **not one visual world**:

| Reference | Style | Serves |
|---|---|---|
| HQ exterior clip | Thunder cel-shaded | Thunder pack, shot 01 |
| Cabin-window flare clip | Thunder cel-shaded | Thunder pack, shot 07c |
| Hangar / boarding clip | Photorealistic | GHAITH, shots 04 / 05 / 13 |
| Forecast office still | Photorealistic | GHAITH, shots 02 / 03 |

Feeding a cel-shaded reference into a photorealistic shot, or the reverse, will fight the prompt.
Keep each reference to the pack it belongs to.

## Corrected livery clause

Use verbatim in every shot where the aircraft appears:

> A Beechcraft King Air C90 of the National Center of Meteorology: white fuselage with a twin green
> pinstripe, dark green over light green, sweeping along the body and up over the rear fuselage.
> UAE coat of arms and المركز الوطني للأرصاد / National Center of Meteorology titles on the rear
> fuselage. Green accents on the wing and engine nacelles.

## Corrected flare clause

Use verbatim in every shot where the racks appear:

> Beneath the wing, dense parallel rows of white cylindrical hygroscopic seeding flares on rack
> rails, each with a green end cap facing forward and a narrow orange band on the body. When fired,
> only the rearward end burns — a small controlled glow — releasing steady white-grey smoke that
> streams backward and is drawn up into the cloud base. No rocket pods, no large flames, no fire.
