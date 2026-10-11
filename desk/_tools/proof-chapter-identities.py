"""Render integrated SVG fragments at their CSS sizes. Not a browser/page test.

Requires Inkscape and the installed Latin Modern Roman Dunhill proof font.
Run after build.mjs; the served SVGs and canonical raster are used verbatim.
"""
from pathlib import Path
import base64
import re
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
source = (ROOT / 'index.html').read_text()
marks = re.findall(r'<svg class="chapter-device .*?</svg>.*?</svg>', source, re.S)
assert len(marks) == 3
uri = 'data:image/png;base64,' + base64.b64encode((ROOT / 'assets/identity/ih-signature.png').read_bytes()).decode()
parts = ['<rect width="720" height="790" fill="#fff"/>']
labels = ['Inquiry', 'Field &amp; Folio', 'Scholar']
for size, width in [('Desktop', 126), ('iPhone', 114)]:
    offset = 0 if size == 'Desktop' else 330
    for column, (theme, ink, paper, muted) in enumerate([
        ('Day', '#263b33', '#f3efe4', '#5a645c'),
        ('Night', '#e8ebdc', '#141f1b', '#b4c0b3'),
    ]):
        x = 20 + column * 355
        parts.append(f'<text x="{x}" y="{24+offset}" font-size="12">{theme} · {size} · {width}px artwork</text>')
        parts.append(f'<rect x="{x-10}" y="{34+offset}" width="345" height="277" fill="{paper}"/>')
        for row, (mark, label) in enumerate(zip(marks, labels)):
            y = 48 + offset + row * 88
            mark = mark.replace('assets/identity/ih-signature.png', uri)
            mark = mark.replace('width="126" height="60"', f'x="{x}" y="{y}" width="{width}" height="{width*100/210}" color="{ink}"', 1)
            parts.append(mark)
            parts.append(f'<text x="{x+width+(12 if size=="Desktop" else 10)}" y="{y+width*50/210+5}" fill="{ink}" font-family="Latin Modern Roman Dunhill" font-style="oblique" font-size="{18 if size=="Desktop" else 17}">{label}</text>')
        if size == 'iPhone':
            parts.append(f'<rect x="{x-10}" y="662" width="345" height="86" fill="{paper}"/>')
            parts.append(f'<g text-anchor="middle" fill="{muted}" font-family="Latin Modern Roman Dunhill" font-style="oblique"><text x="{x+162}" y="695" font-size="14">“Everything in its right place.”</text><text x="{x+162}" y="721" font-size="12">— Thom Yorke, Radiohead</text></g>')
parts.append('<text x="20" y="777" font-size="11">Actual-size composition proof only. Integrated desktop/iPhone browser acceptance remains outstanding.</text>')
svg = '<svg xmlns="http://www.w3.org/2000/svg" width="720" height="790" viewBox="0 0 720 790">' + ''.join(parts) + '</svg>'
with tempfile.TemporaryDirectory() as tmp:
    path = Path(tmp) / 'proof.svg'
    path.write_text(svg)
    subprocess.run(['inkscape', str(path), '--export-type=png', '--export-filename=' + str(ROOT / '_review/chapter-identity-proof.png')], check=True, capture_output=True)
print('Rendered SVG composition proof; not a browser screenshot.')
