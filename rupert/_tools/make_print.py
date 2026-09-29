#!/usr/bin/env python3
"""Turn a photograph of Rupert into a two-colour field print (block-print / screenprint look).

    python3 rupert/_tools/make_print.py SOURCE OUT.png --ground lake [--threshold 0.7] [--scene water] [--no-cutout]
Usually called through:  node rupert/_tools/rupert.mjs photo SOURCE --id ... --provenance archive

The subject is cut out (rembg, optional), rendered as ink and parchment with print grain,
given a parchment halo, and set on a flat ground from the Atlas palette. The result is a new
image with no metadata; prep_photos.py then sizes and registers it like any other image.

Dependencies: Pillow, numpy; pillow-heif for HEIC; rembg[cpu] for the cut-out
(first use downloads a ~180 MB model to ~/.rembg). Without rembg, use --no-cutout for a full-frame print.
"""
import argparse, sys
import numpy as np
from PIL import Image, ImageOps, ImageFilter
try:
    import pillow_heif; pillow_heif.register_heif_opener()
except ImportError:
    pass

GROUNDS = {  # Atlas palette
    'lake': (30, 53, 71), 'pine': (62, 66, 42), 'red': (131, 25, 26), 'ochre': (184, 132, 48),
    'rust': (170, 61, 35), 'slate': (64, 97, 106), 'parchment': (238, 220, 185),
}
INK = (34, 31, 28)
PAPER = (238, 222, 190)


def add_print_args(ap):
    ap.add_argument('--ground', default='lake', choices=GROUNDS)
    ap.add_argument('--threshold', type=float, default=0.7, help='share of the subject printed as ink (0–1)')
    ap.add_argument('--width', type=int, default=2000)
    ap.add_argument('--halo', type=int, default=0, help='halo px at output size (default: 0.6%% of width)')
    ap.add_argument('--no-cutout', action='store_true')
    ap.add_argument('--seed', type=int, default=7)
    ap.add_argument('--no-collar', action='store_true', help="don't print Rupert's mustard collar as an ochre spot colour")
    ap.add_argument('--background', default='print', choices=['print', 'plain'],
                    help="print: the photo's own background (water, grass, trees) as a second, quieter print layer")
    ap.add_argument('--bg-light', type=float, default=0.16, help='share of the background printed as light marks')
    ap.add_argument('--tones', type=int, default=2, choices=[2, 3],
                    help='3 (experimental): add an engraved midtone, hatched in ink, to keep more facial and coat detail')
    ap.add_argument('--mid', type=float, default=0.14, help='with --tones 3: share of the subject given the hatched midtone')
    ap.add_argument('--scene', default='none', choices=['none', 'water', 'ridge'],
                    help='add block-print water lines or a sun-and-ridge horizon behind the subject')


def make_print(src, a):
    """src: an RGB PIL image (already rotated). a: parsed options. Returns an RGB PIL image."""
    rng = np.random.default_rng(a.seed)
    w = a.width; h = round(src.height * w / src.width)
    img = src.resize((w, h), Image.LANCZOS)

    if a.no_cutout:
        mask = np.ones((h, w), bool)
    else:
        from rembg import new_session, remove
        cut = remove(src, session=new_session('isnet-general-use'))
        alpha = cut.getchannel('A').resize((w, h), Image.LANCZOS).filter(ImageFilter.GaussianBlur(w / 900))
        mask = np.asarray(alpha) > 127

    # Tone: local contrast so the dark coat still carries highlights, then grain, then threshold.
    g = np.asarray(ImageOps.grayscale(img), dtype=np.float32) / 255
    blur = np.asarray(ImageOps.grayscale(img).filter(ImageFilter.GaussianBlur(w / 60)), dtype=np.float32) / 255
    tone = 0.65 * g + 0.35 * (g - blur + 0.5)
    tone = np.asarray(Image.fromarray((np.clip(tone, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(w / 1400)), dtype=np.float32) / 255
    grain = rng.normal(0, 0.045, tone.shape).astype(np.float32)
    grain = np.asarray(Image.fromarray(((grain + 0.5) * 255).clip(0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8)), dtype=np.float32) / 255 - 0.5
    tone = tone + grain
    t = np.quantile(tone[mask], a.threshold) if mask.any() else 0.5
    ink = (tone < t) & mask

    # Clean speckle a little so it reads as a print, not noise.
    ink_img = Image.fromarray((ink * 255).astype(np.uint8)).filter(ImageFilter.MedianFilter(3))
    ink = np.asarray(ink_img) > 127

    base = np.array(GROUNDS[a.ground], np.float32)
    deep = base * 0.62                       # the same ink, printed twice
    light = base * 0.45 + np.array(PAPER) * 0.55
    ground = np.empty((h, w, 3), np.float32); ground[:] = base
    ground += rng.normal(0, 2.2, (h, w, 1))  # paper texture
    out = ground

    if a.scene != 'none':
        scene_marks(out, a.scene, w, h, rng, base, deep)

    if a.background == 'print' and not a.no_cutout and (~mask).any():
        bg = ~mask
        bt = tone
        hi = np.quantile(bt[bg], 1 - a.bg_light); lo = np.quantile(bt[bg], 0.38)
        lite = np.asarray(Image.fromarray(((bt > hi) & bg).astype(np.uint8) * 255).filter(ImageFilter.MedianFilter(3))) > 127
        dark = np.asarray(Image.fromarray(((bt < lo) & bg).astype(np.uint8) * 255).filter(ImageFilter.MedianFilter(3))) > 127
        out[dark] = deep
        out[lite] = light
    if not a.no_cutout:
        halo = a.halo or max(4, round(w * 0.006))
        m = Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(halo * 2 + 1))
        out[np.asarray(m) > 127] = PAPER
    out[mask] = PAPER
    out[ink] = INK
    if a.tones == 3:
        # Engraved midtone (experimental hook): the band just lighter than the ink threshold is printed
        # as fine diagonal hatching, so faces and coat keep modelling a hard two-tone split would lose.
        t2 = np.quantile(tone[mask], min(0.98, a.threshold + a.mid))
        midband = mask & ~ink & (tone < t2)
        yy, xx = np.mgrid[0:h, 0:w]
        pitch = max(3, round(w / 420))
        hatch = ((xx + yy) % pitch) < max(1, pitch // 3)
        out[midband & hatch] = INK
    if not a.no_collar:
        # Spot colour: saturated orange-to-mustard pixels on the subject (Rupert's collar) print in ochre.
        hsv = np.asarray(img.convert('HSV'), dtype=np.float32)
        hue = hsv[..., 0] * 360 / 255; sat = hsv[..., 1] / 255; val = hsv[..., 2] / 255
        spot = mask & (hue >= 18) & (hue <= 48) & (sat > 0.55) & (val > 0.45)
        spot = np.asarray(Image.fromarray((spot * 255).astype(np.uint8)).filter(ImageFilter.MedianFilter(5))) > 127
        out[spot] = GROUNDS['ochre']
    return Image.fromarray(out.clip(0, 255).astype(np.uint8))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('source'); ap.add_argument('out')
    add_print_args(ap)
    a = ap.parse_args()
    src = ImageOps.exif_transpose(Image.open(a.source)).convert('RGB')
    im = make_print(src, a)
    im.save(a.out)  # new pixels only; no metadata
    print(f'{a.out}: {im.width}x{im.height}, ground {a.ground}')


def scene_marks(out, kind, w, h, rng, base, deep):
    from PIL import ImageDraw
    layer = Image.new('L', (w, h), 0); d = ImageDraw.Draw(layer)
    if kind == 'water':
        y = h * 0.52
        while y < h:
            x = -rng.uniform(0, w * 0.1)
            while x < w:
                seg = rng.uniform(w * 0.04, w * 0.22)
                amp = h * 0.004; ph = rng.uniform(0, 6.28)
                pts = [(x + t, y + amp * np.sin(ph + t / (w * 0.03))) for t in np.linspace(0, seg, 24)]
                d.line(pts, fill=255, width=max(2, int(rng.uniform(0.0025, 0.006) * w)))
                x += seg + rng.uniform(w * 0.02, w * 0.12)
            y += rng.uniform(h * 0.022, h * 0.04)
        m = np.asarray(layer) > 127
        out[m] = np.array(PAPER, np.float32) * 0.9 + base * 0.1
    elif kind == 'ridge':
        cx, cy, r = w * 0.72, h * 0.2, w * 0.11
        d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=128)
        xs = np.linspace(0, w, 14); ys = h * 0.46 + rng.uniform(-h * 0.07, h * 0.02, 14)
        d.polygon([(0, h)] + list(zip(xs, ys)) + [(w, h)], fill=255)
        L = np.asarray(layer)
        out[L == 128] = GROUNDS['ochre']
        out[L == 255] = deep


if __name__ == '__main__':
    sys.exit(main())
