"""Crop/resample/pad the exact supplied portrait; no illustration or image regeneration.

Usage: python rupert/_tools/make_icons.py /path/to/the/supplied/portrait.png
"""
from pathlib import Path
import hashlib
import sys
from PIL import Image

source = Path(sys.argv[1])
raw = source.read_bytes()
if hashlib.sha256(raw).hexdigest() != 'e4de7befefc21049cc956adf53ec783e225e1f5567a1361295559a71fccc2715':
    raise ValueError('Use the exact supplied red-background Rupert portrait.')
im = Image.open(source).convert('RGB')
if im.size != (856, 1576):
    raise ValueError('Use the exact 856 × 1576 supplied red-background portrait.')

# Crop retains the head, both source ears, open mouth, and collar. Padding adds mask margins.
crop = im.crop((0, 550, 856, 1530))
red = im.crop((300, 150, 550, 350)).resize((1, 1), Image.Resampling.BOX).getpixel((0, 0))
def plate(side):
    square = Image.new('RGB', (side, side), red)
    square.paste(crop, ((side-crop.width)//2, (side-crop.height)//2))
    return square

root = Path(__file__).resolve().parent.parent
regular = plate(1120)
maskable = plate(1400)  # Face/ears sit inside the maskable central 80% circle.
regular.resize((1024,1024),Image.Resampling.LANCZOS).save(root/'_tools/rupert-portrait-master.png')
icons = root/'assets/img/icons'
for name, size, image in [('apple-touch-icon.png',180,regular),('icon-192.png',192,regular),
                          ('icon-512.png',512,regular),('maskable-192.png',192,maskable),
                          ('maskable-512.png',512,maskable)]:
    image.resize((size,size),Image.Resampling.LANCZOS).save(icons/name, optimize=True)
print('Supplied portrait SHA256:',hashlib.sha256(raw).hexdigest())
print('Source crop: (0,550)–(856,1530); standard pad 1120; maskable pad 1400; master 1024.')
