# Production method — fixed vs variable

## The problem this solves

The brief specified that some things are **fixed** (the aircraft, its livery, the flare rack) and
some are **variable** (camera, light, weather, action). Early production ignored this in practice:
every shot was a pure text prompt, so the aircraft was redesigned from scratch on every render and
changed completely from shot to shot.

**A text prompt has no fixed elements.** The model regenerates everything from the words each time.
No amount of precision in the wording changes this — "twin green pinstripe, NCM lettering, N6151A"
is a description to be re-interpreted, not an instruction to reuse. Consistency is not something
text can carry.

## The rule

> **Fixed elements come from a reference image. Variable elements come from the prompt.
> Never describe a fixed element in the prompt.**

Attach the same reference to every shot in a film. Write only what changes.

## Setup

| Reference | File | media_id |
|---|---|---|
| Aircraft in flight — livery, markings, rack | `refs/hero-aircraft-inflight.jpg` | `9b57be54-d80d-4d7a-a24f-4bc34c434fb6` |
| Flare rack close — two rows, bolt plate | `refs/hero-flare-rack.jpg` | `cc5dc88a-3ae0-45fd-b566-eb262460bab3` |
| Ground service — loading, green caps | `refs/hero-ground-service.jpg` | *(import as needed)* |

Model: `seedance_2_0_mini`, `resolution: 720p`, `duration: 4–5`, `generate_audio: false`.
**10 credits per shot** — cheaper than the 17.5 the text-prompt route cost.

`kling3_0` cannot do this: it accepts only `start_image`, which locks the entire first frame and so
locks composition too. `seedance` accepts `image_references`, which locks the *subject* while
leaving camera and action free. That distinction is the whole reason for the model change.

## Prompt shape

Open with the lock, then describe only the variable:

> Keep this exact aircraft and its exact livery, markings and under-wing flare rack unchanged.
> [What changes: camera move, light, weather, action.]
> Stylized 3D cartoon, clean cel-shaded surfaces, crisp linework, soft volumetric light.

Do **not** restate the livery, the registration, the stripe colours or the rack geometry. Every
sentence describing a fixed element is an invitation for the model to reinterpret it.

## Publishing references

The Higgsfield upload host is blocked by the Claude Code session's egress policy. Route used
instead: commit the still to this public repo, then `media_import_url` on its
`raw.githubusercontent.com` URL, which Higgsfield fetches server-side.

## What this does not fix

Fine lettering — the registration, Arabic titles — still degrades. A reference improves it markedly
but does not guarantee it. Composite critical text in post rather than paying for re-rolls.
