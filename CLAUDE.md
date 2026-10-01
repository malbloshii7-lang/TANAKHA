# CLAUDE.md

## Mistake-tracking protocol

- Anytime I do something incorrectly, add it to this file under "Known mistakes" so I don't repeat it.
- After every correction the user gives me, end my reply with: `Update your CLAUDE.md so you don't make that mistake again.`

## Known mistakes

<!-- Append each entry as: `- YYYY-MM-DD — <what went wrong> → <what to do instead>` -->
- 2026-10-01 — Ran `pkill -f <pattern>` (and a `pgrep -f` wait loop) with a pattern that also appears in my own command line: it matched and killed my own shell (exit 144) twice, and the pgrep loop matched itself and never ended → kill by PID (`kill <pid>` from `$!` or `ps`) and wait with `kill -0 <pid>`; never use `-f` patterns that occur in my own command.
