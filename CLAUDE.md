# CLAUDE.md

## Mistake-tracking protocol

- Anytime I do something incorrectly, add it to this file under "Known mistakes" so I don't repeat it.
- After every correction the user gives me, end my reply with: `Update your CLAUDE.md so you don't make that mistake again.`

## Known mistakes

<!-- Append each entry as: `- YYYY-MM-DD — <what went wrong> → <what to do instead>` -->
- Never use `pkill -f <pattern>` or `pgrep -f <pattern>` with a pattern that also appears in my own command line. It matches my own shell and kills it (exit 144), and a `pgrep -f` wait loop matches itself and never ends. Kill by PID (`kill <pid>`, taken from `$!` or `ps`) and wait with `kill -0 <pid>`. I made this mistake twice (once earlier in the session, once more when stopping the cut check).
