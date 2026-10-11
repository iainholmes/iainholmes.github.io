"""Prepare pixel-exact whitespace crops of the user's final IH. master.

No resizing, recoloring, tracing, alpha replacement or generated artwork.
Pillow is needed only for maintenance; all PNGs are committed for serving.
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / 'assets' / 'identity'
CROPS = {
    'ih-signature.png': (400, 380, 866, 818),
    'ih-period.png': (780, 723, 840, 783),
}


def prepare():
    with Image.open(ROOT / 'ih-master.png') as master:
        assert master.size == (1254, 1254) and master.mode == 'RGBA'
        for name, box in CROPS.items():
            master.crop(box).save(ROOT / name)
    print('Prepared two lossless crops; master and visible pixels unchanged.')


if __name__ == '__main__':
    prepare()
