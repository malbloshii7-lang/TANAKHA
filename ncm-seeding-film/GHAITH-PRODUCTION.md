# GHAITH — production plan

Costing and build notes for the *GHAITH Enhanced 8K Cinematic Shot Skeleton*. Thirteen shots,
~32 s, 16:9, photorealistic.

This is a **different film** from `PROMPTS-v2.md`, not a revision of it: photorealistic ARRI-style
rather than Thunder cel-shaded, 13 shots rather than 14, ~32 s rather than ~140 s, and a faster
cutting rhythm (2–3 s average) rather than the long held shots the earlier brief asked for. Both
packs are kept; neither supersedes the other.

## Cost

Preflighted against the live catalogue. All thirteen shots render at 3 s (see *Durations* below).

| Option | Per shot | 13 shots | Notes |
|---|---:|---:|---|
| `kling3_0` `mode:pro`, 3 s | 5.25 | **68.25** | 1920×1080. Recommended. |
| `kling3_0` `mode:4k`, 3 s | 18 | 234 | Highest resolution available. |
| `seedance_2_0` 1080p, 4 s | 36 | 468 | Best identity consistency across shots. |
| `seedance_2_0` 4k, 4 s | 88 | 1144 | Not worth it here. |

Settings for the recommended option:
`{model: "kling3_0", mode: "pro", duration: 3, aspect_ratio: "16:9", sound: "off"}`

## Four things the skeleton asks for that cannot be delivered as written

### 1. 8K is not available
No model in the catalogue renders 7680×4320. The ceiling is `kling3_0` `mode:4k` (3840×2160).
Master at 4K and upscale in post if a true 8K deliverable is contractual — `upscale_video` reaches
4K, not 8K.

### 2. The 2-second shots cannot be rendered directly
`kling3_0` has a 3 s floor (`seedance_2_0` a 4 s floor). Seven shots are specified at 2 s.
Render all thirteen at 3 s and trim the seven to 2 s on the timeline — costs nothing extra and
gives handles for the cut.

### 3. The flare description contradicts the earlier hard constraint
Shot 11 asks for *"bright orange flames"*; shot 10 for *"a ring of salt particles ignites,
creating a golden halo"*. The brief two revisions ago said, explicitly: **"Do NOT show big flames
or fire."** Shots 04 and 05 also specify *green-tipped* flares, where the previous brief specified
red end covers facing the tail.

These cannot both be satisfied. Both variants are written below — pick one at render time.

**Shot 11 — variant A (as GHAITH specifies, with flame):**
> …The aircraft releases a line of burning salt flares from under-wing racks — bright orange flame
> at the flare tips and white smoke trails drawn upward into the cloud base by updrafts…

**Shot 11 — variant B (honours the no-flame constraint):**
> …The aircraft releases a line of hygroscopic salt flares from under-wing racks, mounted pointing
> rearward toward the tail. Each shows only a small controlled burn, releasing steady white-grey
> smoke trails drawn upward into the cloud base by updrafts. No large flames, no fire, no rocket
> pods…

Same choice applies to shot 10's "golden halo" and to the flare colour in shots 04, 05 and 09.

### 4. Arabic signage will not render reliably
Shots 01, 05 and 13 call for Arabic text on the facade and fuselage
(المركز الوطني للأرصاد, تبخير السحب). Generative video renders Arabic script poorly — expect
malformed letterforms. Shot 03's English status line
(`Al Ain Airport — Seeding Flight Preparation — STATUS: READY`) is also unreliable; the v1 attempt
is worth inspecting before paying for it again.

The dependable route for all four is to render the shot clean and composite the lettering in post.
Budget for that rather than for re-rolls.

## Audio

The skeleton specifies per-shot sound design (radar sweeps, radio crackle, turboprop spool-up,
flare whoosh, thunder). Do **not** use per-shot generated audio — thirteen independent renders
each invent their own ambience and none of it matches across a 2 s cut. Render silent
(`sound: "off"`, which is also cheaper) and lay the design over the finished cut as one pass.

## Assembly

Same approach as the earlier cuts: `filter_complex` concat normalising every input to
1920×1080@24 (or 3840×2160@24 for the 4K option), straight cuts, no crossfades.
`assemble.sh` in this directory is the local equivalent; the render CDN is blocked by the Claude
Code session's egress policy, so the master gets cut in the Higgsfield sandbox instead.

## SUPERSEDED — livery is wrong

`REFERENCE-SPEC.md` (derived from supplied reference material) shows the NCM King Air is **white
with a twin green pinstripe** and full Arabic/English titles — not the *"navy blue belly, red
pinstripe, NCM roundel"* this skeleton specifies. **All thirteen shots of the master below carry
the wrong aircraft** and need re-rendering with the hangar reference attached. Flare caps are
green, not red, and the racks are far denser than rendered.

Read `REFERENCE-SPEC.md` before spending any further credits on this pack.

## Finished master

- **Film:** https://d2ol7oe51mr4n9.cloudfront.net/user_3GDYTMzP23BD6MHwIHFhhk07Vl5/12103ddd-87d9-4f6d-95bc-1d07040a3004.mp4
- 3840×2160, 24 fps, 32.0 s, H.264, silent, 76.4 MB. Thirteen shots, straight cuts.
- Rendered with `kling3_0` `mode:4k`, 3 s per shot; the seven 2 s shots trimmed on the timeline.
- **Flare variant B** was used throughout — small controlled burns, white-grey smoke, no large
  flames. Re-rolling shots 10 and 11 to variant A costs 36 credits.
- Per-shot source URLs and cut durations are in `ghaith-shots.tsv`.

## Status

**Rendered and cut.** All thirteen shots rendered at 4K and assembled into the master linked
above. 234 credits spent; ~268 remaining.
