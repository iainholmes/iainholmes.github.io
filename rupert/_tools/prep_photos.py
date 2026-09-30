#!/usr/bin/env python3
"""Prepare an image of Rupert for publication. Normally run through the one entry point:

    node rupert/_tools/rupert.mjs photo SOURCE --id rupert-creek-2023-04 --provenance archive \
        --alt "..." [--taken-at 2023-04] [--place-id eno-cox-mountain] [--caption "..."] [--source-note "..."] \
        --kind photograph|print|plate [print options: --ground lake --threshold 0.7 --scene water --tones 3 ...]

Public output (committed):
  photos/<id>-<width>.jpg at 800/1400/2000 px (never upscaled beyond the print or source size).
  Re-encoded from pixels only: no EXIF, GPS, XMP, ICC or maker notes are written.
  data/photos.json entry with kind, provenance and the fields you pass.

Private output (git-ignored, never published):
  _private/originals.json: source filename, original capture time, GPS and camera, keyed by id,
  so useful context from the original is kept without entering the public repository.

--kind is required, because the three image layers do different jobs:
  photograph  the documentary record: preferred for Field Log entries, completed adventures and memories
  print       the Atlas's signature field print, made from a photograph (see make_print.py):
              This Week, edition covers, archive treatments, seasonal moments
  plate       an occasional illustrative/editorial graphic (landscape, water, ridge, sun), imported as-is;
              always --provenance editorial
Provenance:
  documentary  taken at --place-id (required) on --taken-at; may be captioned as that place
  archive      a real photograph whose place is unknown or unrelated to where it is used
  editorial    chosen or made for mood (illustration, seasonal plate); implies no place
"""
import argparse, json, pathlib, sys
from PIL import Image, ImageOps, ExifTags
try:
    import pillow_heif; pillow_heif.register_heif_opener()
except ImportError:
    pass
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from make_print import add_print_args, make_print

ROOT = pathlib.Path(__file__).resolve().parent.parent
WIDTHS = [800, 1400, 2000]


def private_context(im, source):
    """Everything useful from the original, for the private record only."""
    ctx = {'source_file': pathlib.Path(source).name, 'source_size': list(im.size)}
    ex = im.getexif()
    if not ex:
        return ctx
    tags = {ExifTags.TAGS.get(k, k): v for k, v in ex.items()}
    sub = ex.get_ifd(0x8769)
    taken = sub.get(36867) or tags.get('DateTime')
    if taken: ctx['taken'] = str(taken)
    if tags.get('Make') or tags.get('Model'): ctx['camera'] = f"{tags.get('Make', '')} {tags.get('Model', '')}".strip()
    gps = ex.get_ifd(0x8825)
    if gps and 2 in gps and 4 in gps:
        dms = lambda v: float(v[0]) + float(v[1]) / 60 + float(v[2]) / 3600
        lat = dms(gps[2]) * (-1 if gps.get(1) == 'S' else 1)
        lng = dms(gps[4]) * (-1 if gps.get(3) == 'W' else 1)
        ctx['gps'] = [round(lat, 6), round(lng, 6)]
    return ctx


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('source')
    ap.add_argument('--id', required=True, help='lowercase-hyphenated; also the file stem')
    ap.add_argument('--alt', required=True)
    ap.add_argument('--kind', required=True, choices=['photograph', 'print', 'plate'])
    ap.add_argument('--provenance', required=True, choices=['documentary', 'archive', 'editorial'])
    ap.add_argument('--taken-at', help='YYYY, YYYY-MM or YYYY-MM-DD')
    ap.add_argument('--place-id', help='only for documentary: where it was actually taken')
    ap.add_argument('--caption')
    ap.add_argument('--source-note')
    ap.add_argument('--focal', default='0.5,0.5', help='x,y from 0 to 1: where Rupert is')
    add_print_args(ap)
    a = ap.parse_args()
    if a.provenance == 'documentary' and not (a.place_id and a.taken_at):
        ap.error('documentary photographs need --place-id and --taken-at')
    if a.kind == 'plate' and a.provenance != 'editorial':
        ap.error('plates are illustrations: use --provenance editorial')
    if a.provenance != 'documentary' and a.place_id:
        ap.error('--place-id is only for documentary photographs (it asserts where the photo was taken)')

    orig = Image.open(a.source)
    ctx = private_context(orig, a.source)
    im = ImageOps.exif_transpose(orig).convert('RGB')
    if a.kind == 'print':
        a.width = min(a.width, round(2000 * im.width / max(im.width, im.height)))  # long edge <= 2000
        im = make_print(im, a)

    w, h = im.size
    widths = sorted({x for x in WIDTHS if x < w} | {min(w, WIDTHS[-1])})
    out = ROOT / 'photos'; out.mkdir(exist_ok=True)
    for old in out.glob(f'{a.id}-*.jpg'):
        old.unlink()
    for tw in widths:
        r = im if tw == w else im.resize((tw, round(h * tw / w)), Image.LANCZOS)
        graphic = a.kind in ('print', 'plate')  # flat colour: keep full chroma so edges stay crisp
        r.save(out / f'{a.id}-{tw}.jpg', 'JPEG', quality=78 if graphic else 74,
               subsampling=0 if graphic else 2, optimize=True, progressive=True)

    reg_path = ROOT / 'data' / 'photos.json'
    reg = json.loads(reg_path.read_text())
    fx, fy = (float(v) for v in a.focal.split(','))
    entry = {'id': a.id, 'file': a.id, 'kind': a.kind, 'provenance': a.provenance,
             'width': widths[-1], 'height': round(h * widths[-1] / w), 'widths': widths,
             'alt': a.alt, 'focal': [fx, fy]}
    for k in ('taken_at', 'place_id', 'caption', 'source_note'):
        if getattr(a, k): entry[k] = getattr(a, k)
    reg['photos'] = [p for p in reg['photos'] if p['id'] != a.id] + [entry]
    reg_path.write_text(json.dumps(reg, indent=2, ensure_ascii=False) + '\n')

    priv = ROOT / '_private'; priv.mkdir(exist_ok=True)
    pf = priv / 'originals.json'
    rec = json.loads(pf.read_text()) if pf.exists() else {}
    rec[a.id] = ctx
    pf.write_text(json.dumps(rec, indent=2, ensure_ascii=False) + '\n')
    print(f'{a.id}: {a.kind}, {a.provenance}, {widths} — private context kept in _private/originals.json')


if __name__ == '__main__':
    sys.exit(main())
