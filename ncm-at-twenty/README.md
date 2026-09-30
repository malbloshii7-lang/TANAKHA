# NCM at Twenty

A bilingual (Arabic-first) commemorative story for the 20th anniversary of the UAE
National Center of Meteorology, March 2027. It is published as a claude.ai artifact:
https://claude.ai/artifact/CqcyKC5WmQWdse7PXFLU2P

| File | What it is |
| --- | --- |
| `page.src.html` | The page source. Citations are written as `[[key]]` or `[[key1,key2]]`. |
| `build.py` | Holds the source list, numbers sources by first citation, and writes `index.html`. |
| `index.html` | The built page that gets published. Do not edit it by hand. |
| `v1-review-draft.html` | The first draft, as management reviewed it, kept for comparison. |

Rebuild after any edit:

```bash
python3 ncm-at-twenty/build.py
```

The build fails on an unknown source key and reports any source that is defined but
never cited, so the numbered list always matches what the page relies on.

## What changed from v1

- Arabic is the default language, and English is one click away.
- The leadership chapter comes first: quotations from H.H. the President (2011) and
  H.H. Sheikh Mansour bin Zayed (IREF, January 2025), in their published wording.
- A new record of H.H. Sheikh Mansour bin Zayed's twenty years with the Center:
  - it was founded in his ministry in 2007;
  - he chaired the first board meeting in 2008;
  - he is patron of UAEREP (2015) and of IREF (2025);
  - he visited the Center's headquarters in August 2025;
  - a 2026 law places the Center under the Chairman of the Presidential Court.
- Four headline figures in the masthead and four service pillars, each backed by one
  proof figure.
- Removed: the "not an official NCM publication" line, the passage on scientific
  unknowns, and the network counts dated 2021.
- Heritage is condensed into four short entries plus a timeline that runs from 1934.
- Fixed: the Arabic text had described Dr Al Mandous as DG "آنذاك" (at the time). He is addressed as
  «معالي» / H.E. throughout: he has held ministerial rank since the federal decree of 15 April 2026.
- Footnote numbers now sit at the end of each block instead of mid-sentence.
- The attendance of H.H. is deliberately not announced on the page, because it is
  shared by public link.
