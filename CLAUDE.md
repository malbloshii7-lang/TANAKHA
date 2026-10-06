# CLAUDE.md

## Mistake-tracking protocol

- Anytime I do something incorrectly, add it to this file under "Known mistakes" so I don't repeat it.
- After every correction the user gives me, end my reply with: `Update your CLAUDE.md so you don't make that mistake again.`

## Known mistakes

<!-- Append each entry as: `- YYYY-MM-DD — <what went wrong> → <what to do instead>` -->
- 2026-10-05 — Put a CSS `mask-image` on a zero-height wrapper whose children were absolutely positioned, so the whole card vanished (masks clip to the element's border box, and also clip any `drop-shadow` on the same element) → give the masked element an explicit size, keep shadows on an outer wrapper, and set the mask to `none` once a reveal finishes.
- 2026-10-05 — Gated a canvas draw block by a time window (`t < fin + 1.2`), so the persistent route line disappeared after the finale transition → when a block animates an element into its final state, keep drawing that final state after the window ends; always inspect the very last frame.
- 2026-10-05 — Fired "arrival" events (node pops, sound cues) on linear time while the moving head followed an eased curve, so they landed ~0.3 s early → derive event times from the inverse of the same easing function.
- 2026-10-05 — Ran `cd` into other folders inside Bash commands, which silently moved the session's primary working directory → use absolute paths instead of `cd`.
- 2026-10-05 — Used `pkill -f "<pattern>"`, which matched and killed its own shell → find PIDs with `ps -eo pid,args | grep "[p]attern"` and kill those.
- 2026-10-06 — Took the reference infographic's stop dates and its "Kyrgyzstan" label as final without flagging which ones I had not verified; the user then corrected the Wellington, Melbourne and Jakarta dates and asked for the capital (Bishkek) → when building from a reference, list every date/place I could not verify and ask the user to confirm them before the final render.
