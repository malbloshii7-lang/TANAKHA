# Al Falah Al Thahabi Kitchen · مطبخ الفلاح الذهبي

Logo and identity for an Emirati kitchen serving banquets and daily meals.

The emblem shows a chef standing behind a heaped rice platter on a footed serving tray (siniya), presenting it. He is a faceless gold silhouette, with the pleats of his toque and his neckerchief cut out in negative space. It sits inside a gold bezel braided from 108 rice grains. The grains on the heap are laid in a herringbone weave that nods to Al Sadu weaving, and the braid nods to talli embroidery.

## Official logo

**Gold on Ghaf green** is the official logo: `logo-primary-dark.png` for screens and `logo-primary-dark.pdf` for print. Use it wherever the green background can be reproduced. The other versions are only for surfaces where it can't, such as white paper, single-colour stamps, or photos.

## Files

| File | Use |
| --- | --- |
| `al-falah-al-thahabi-kitchen-logo.pdf` | Vector master for printers and sign makers (4 pages: dark, light, signboard, identity sheet) |
| `logo-primary-dark.png` / `.pdf` | **Official logo**, gold on Ghaf green (2400 px PNG; single-page vector PDF) |
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
