"""Render vector proofs and an explicitly schematic placement map with Inkscape.

This is not browser QA. It does not evaluate CSS or claim actual page layout.
"""
from pathlib import Path
import re
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
source = (ROOT / 'index.html').read_text()
marks = dict(re.findall(r'<div class="collection-monogram collection-monogram-([^" ]+)"[^>]*>(.*?)</div>', source, re.S))
assert list(marks) == ['research', 'reading', 'profile']
labels = {'research':'IH. Distribution', 'reading':'IH. River', 'profile':'IH. Tree & Dog'}
def mark(chapter, x, y, width, ink='#263b33', suffix=''):
    svg = marks[chapter].replace('width="160" height="130"', f'x="{x}" y="{y}" width="{width}" height="{width*130/160}" color="{ink}"', 1)
    return svg.replace('ih-river-i-cut', 'ih-river-i-cut-' + suffix)
def text(x,y,copy,size=14,color='#263b33'):
    return f'<text x="{x}" y="{y}" font-family="Latin Modern Roman Dunhill" font-size="{size}" fill="{color}">{copy.replace("&", "&amp;")}</text>'
def rect(x,y,w,h,paper,stroke='none'):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{paper}" stroke="{stroke}" stroke-width=".6"/>'
def render(filename, width, height, parts):
    with tempfile.TemporaryDirectory() as tmp:
        path = Path(tmp) / 'proof.svg'
        path.write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}">' + ''.join(parts) + '</svg>')
        subprocess.run(['inkscape', str(path), '--export-type=png', '--export-filename=' + str(ROOT / '_review' / filename)], check=True, capture_output=True)

parts = [rect(0,0,900,585,'#f3efe4'), text(24,28,'Secondary IH. Monograms — Outlined Vector Proof',21)]
for col, chapter in enumerate(marks):
    x=24+col*294
    parts += [text(x,62,labels[chapter],18),mark(chapter,x+12,78,240,suffix=chapter+'-large')]
    parts += [text(x,298,'Day / Night · Desktop 72px',13)]
    for j,(ink,paper) in enumerate([('#263b33','#f3efe4'),('#bdd0bd','#202e26')]):
        parts += [rect(x+j*125,312,118,84,paper),mark(chapter,x+15+j*125,321,72,ink,chapter+str(j)+'-desktop')]
    parts += [text(x,424,'Day / Night · iPhone 68px',13)]
    for j,(ink,paper) in enumerate([('#263b33','#f3efe4'),('#bdd0bd','#202e26')]):
        parts += [rect(x+j*125,438,118,84,paper),mark(chapter,x+17+j*125,449,68,ink,chapter+str(j)+'-mobile')]
parts += [text(24,558,'No canonical logo pixels are reused. No enclosing frames or background plates are part of these SVGs.',13),text(24,578,'Actual-size asset rows; not browser screenshots. Night uses a light forest ink for contrast.',12)]
render('secondary-monograms.png',900,585,parts)

# Diagram only: boxes denote existing content regions, not redesigned panels.
p=[rect(0,0,1000,930,'#f3efe4'),text(24,30,'Intended Placement — Schematic, Not a Browser Rendering',22),text(24,53,'Existing content regions are abbreviated; monograms shown at 72px desktop / 68px iPhone.',13)]
p += [text(24,90,'Desktop: Existing Folio Gutters',18),text(720,90,'iPhone: Centered Transitions',18)]
# Research: 32px horizontal gutter; column proportions mirror 1.1 : 1.
p += [text(24,124,'01 — Research & Practice'),rect(24,139,320,175,'#eeeee6','#9eaa9f'),rect(376,139,291,175,'#eeeee6','#9eaa9f'),text(44,170,'Econometric Advisor'),text(396,170,'Quant Skills Trainer'),mark('research',324,195,72,suffix='map-r')]
p += [rect(720,139,250,51,'#eeeee6','#9eaa9f'),text(734,170,'Econometric Advisor'),mark('research',811,194,68,suffix='map-rm'),rect(720,253,250,51,'#eeeee6','#9eaa9f'),text(734,284,'Quant Skills Trainer')]
# Reading: first row periodicals; second row Workbook / Atlas has a 30px gutter.
p += [text(24,353,'02 — Reading & Outdoors'),rect(24,368,306,56,'#eeeee6','#9eaa9f'),rect(360,368,307,56,'#eeeee6','#9eaa9f'),text(44,400,'Field Brief'),text(380,400,'Loblolly & Logit'),rect(24,454,306,154,'#eeeee6','#9eaa9f'),rect(360,454,307,154,'#eeeee6','#9eaa9f'),text(44,485,'The Workbook'),text(380,485,'The Rupert Atlas'),mark('reading',309,502,72,suffix='map-read')]
p += [rect(720,368,250,90,'#eeeee6','#9eaa9f'),text(734,399,'Periodicals'),text(734,432,'… The Workbook'),mark('reading',811,462,68,suffix='map-readm'),rect(720,525,250,83,'#eeeee6','#9eaa9f'),text(734,557,'The Rupert Atlas')]
# Profile: a real normal-flow concluding row, not an overlay on content.
p += [text(24,652,'03 — Personal Website'),rect(24,667,643,140,'#eeeee6','#9eaa9f'),text(44,700,'Existing Academic Composition / Introduction'),mark('profile',309.5,729,72,suffix='map-p'),rect(720,667,250,140,'#eeeee6','#9eaa9f'),text(734,699,'Academic Introduction'),mark('profile',811,730,68,suffix='map-pm')]
p += [text(24,855,'Title banners retain Inquiry / Field & Folio / Scholar, unchanged.',16),text(24,882,'All three personal monograms disappear whenever any application in their chapter is revealed.',14),text(24,910,'Diagram verifies placement intent only. Browser alignment, wrapping and touch review remain the owner’s acceptance gate.',13)]
render('monogram-placement-map.png',1000,930,p)
print('Rendered secondary-monograms.png and monogram-placement-map.png; neither is a browser screenshot.')
