"""Rebuild Desk's outlined identity assets (fontTools and Inkscape required)."""
from pathlib import Path
import subprocess
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen

ROOT = Path(__file__).resolve().parents[1]
font = instantiateVariableFont(TTFont(ROOT / 'assets/fonts/archivo-italic.woff'), {'wght': 650}, inplace=False)
glyphs = font.getGlyphSet()
cmap = font.getBestCmap()
units = font['head'].unitsPerEm


def lettering(text, x, y, width):
    cursor, shapes, bounds = 0, [], []
    for char in text:
        glyph = glyphs[cmap[ord(char)]]
        pen, box = SVGPathPen(glyphs), BoundsPen(glyphs)
        glyph.draw(pen)
        glyph.draw(box)
        a, b, c, d = box.bounds
        bounds.append((a + cursor, b, c + cursor, d))
        shapes.append(f'<path transform="translate({cursor} 0)" fill="{"#976144" if char == "." else "#263b33"}" d="{pen.getCommands()}"/>')
        cursor += font['hmtx'].metrics[cmap[ord(char)]][0] - .075 * units
    left, bottom = min(b[0] for b in bounds), min(b[1] for b in bounds)
    right, top = max(b[2] for b in bounds), max(b[3] for b in bounds)
    scale = width / (right - left)
    height = (top - bottom) * scale
    return f'<g transform="translate({x - left * scale:.4f} {y + top * scale:.4f}) scale({scale:.6f} {-scale:.6f})">'+''.join(shapes)+'</g>', height


wordmark, height = lettering('desk.', 88, 228, 336)
icon = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <title>desk.</title>
  <rect width="512" height="512" fill="#263b33"/>
  <path d="M56 56h382v370H56Z" fill="#bdc4b6"/>
  <path d="M70 70h382v370H70Z" fill="#eeeee6"/>
  <path d="M88 119h78m-78 10h49" stroke="#976144" stroke-width="3"/>
  {wordmark}
  <path d="M88 378h336" stroke="#263b33" stroke-width="2"/>
</svg>
'''
# A simplified matching glyph stays legible at browser-tab sizes.
favicon_mark, _ = lettering('d.', 64, 122, 380)
favicon = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><title>desk.</title><rect width="512" height="512" fill="#eeeee6"/>{favicon_mark}<path d="M64 438h380" stroke="#263b33" stroke-width="18"/></svg>\n'''
(ROOT / 'assets/icon.svg').write_text(icon)
(ROOT / 'assets/favicon.svg').write_text(favicon)
for source, output, size in [('icon.svg', 'apple-touch-icon.png', 180), ('icon.svg', 'icon-192.png', 192), ('icon.svg', 'icon-512.png', 512), ('favicon.svg', 'favicon-32.png', 32)]:
    subprocess.run(['inkscape', str(ROOT / 'assets' / source), '--export-type=png', f'--export-filename={ROOT / "assets" / output}', f'--export-width={size}', f'--export-height={size}'], check=True, capture_output=True)
print('Built original desk. bookplate and matching favicon from genuine Archivo italic outlines.')
