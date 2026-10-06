# Al Falah Al Thahab Kitchen · مطبخ الفلاح الذهب

Logo and identity for an Emirati kitchen serving banquets and daily meals.

The emblem is a heaped rice platter on a footed serving tray (siniya), with three tapering wisps of steam. It sits inside a gold bezel braided from 108 rice grains. The grains on the heap are laid in a herringbone weave that nods to Al Sadu weaving, and the braid nods to talli embroidery.

## Files

| File | Use |
| --- | --- |
| `al-falah-al-thahab-kitchen-logo.pdf` | Vector master for printers and sign makers (4 pages: dark, light, signboard, identity sheet) |
| `logo-primary-dark.png` | Main logo, gold on Ghaf green (2400 px) |
| `logo-primary-light.png` | Main logo on ivory, for menus, receipts and light packaging |
| `logo-gold-transparent.png` | Main logo, no background, for dark surfaces and photos |
| `logo-light-transparent.png` | Main logo, no background, for light surfaces |
| `logo-signboard.png` | Wide shopfront layout: English, emblem, Arabic (Arabic on the right) |
| `emblem-gold.png` / `emblem-green.png` / `emblem-white.png` | Emblem only, transparent, 2000 px (stamps, stickers, food boxes) |
| `social-avatar.png` | 1080 px profile picture for Instagram, WhatsApp Business and others |
| `brand-sheet.png` | Construction, palette, type and colourways at a glance |
| `design-philosophy.md` | The visual principles behind the mark |

## Palette

| Name | HEX | RGB |
| --- | --- | --- |
| Ghaf Green | `#0D3A33` | 13 58 51 |
| Thahab Gold | `#C9A24D` | 201 162 77 |
| Basmati Ivory | `#F6F0E3` | 246 240 227 |
| Qahwa Brown | `#2B1D14` | 43 29 20 |

**Type:** Aref Ruqaa Bold (Arabic) and Cinzel SemiBold / Medium (Latin). Both are free under the SIL Open Font License, and their licence files are in `source/fonts/`.

## Regenerating

Everything is generated from code in `source/`. `emblem.js` holds the geometry, and `gen.js` handles the layouts and exports. To regenerate, you need Node with Playwright (Chromium) and `pdfunite` (poppler-utils):

```sh
node source/gen.js            # writes all PNGs + the PDF into this folder
node source/gen.js /tmp/out --debug   # ink boxes and centre axes overlaid
```
