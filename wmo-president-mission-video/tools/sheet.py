# usage: python3 tools/sheet.py out.jpg cols scale img1 img2 ...
import sys
from PIL import Image, ImageDraw
out, cols, sc = sys.argv[1], int(sys.argv[2]), float(sys.argv[3]); files = sys.argv[4:]
ims = [Image.open(f).convert('RGB') for f in files]
w, h = int(1080 * sc), int(1350 * sc)
rows = (len(ims) + cols - 1) // cols
sheet = Image.new('RGB', (cols * (w + 6) + 6, rows * (h + 26) + 6), (40, 40, 48))
d = ImageDraw.Draw(sheet)
for k, (im, f) in enumerate(zip(ims, files)):
    x, y = 6 + (k % cols) * (w + 6), 6 + (k // cols) * (h + 26)
    sheet.paste(im.resize((w, h), Image.LANCZOS), (x, y + 20))
    d.text((x + 4, y + 4), f.split('/')[-1], fill=(255, 255, 255))
sheet.save(out, quality=90)
