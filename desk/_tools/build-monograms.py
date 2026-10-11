"""Three secondary IH. designs inspired by the owner's concept board.

Outline foundation: the repository's OFL Bodoni Moda face. The statistical and
river bars replace the H's crossbar; the pine grows from its right stem.
Never reads or modifies the canonical raster IH. identity.
"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets/monograms'
OUT.mkdir(exist_ok=True)
font = TTFont(ROOT / 'assets/fonts/bodoni-moda.woff')
glyphs = font.getGlyphSet()
cmap = font.getBestCmap()
def outline(char):
    pen = SVGPathPen(glyphs)
    glyphs[cmap[ord(char)]].draw(pen)
    return pen.getCommands()
I, H = outline('I'), outline('H')
# Guard the source contours before modifying the crossbar. All vertical strokes
# and serifs below use the original glyph's vertices, with uniform scaling.
assert H == 'M1491 1500V1461H1311V39H1491V0H893V39H1088V720H462V39H656V0H57V39H238V1461H57V1500H656V1461H462V760H1088V1461H893V1500Z'
scale = 82 / 1500
left = 'M57 0V39H238V1461H57V1500H656V1461H462V39H656V0Z'
right = 'M893 0V39H1088V1461H893V1500H1491V1461H1311V39H1491V0Z'
def glyph(path, x, baseline, cls=''):
    return f'<path class="{cls}" transform="translate({x} {baseline}) scale({scale} {-scale})" d="{path}"/>'
def save(name, body):
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 130" width="160" height="130" fill="currentColor" aria-hidden="true" focusable="false">\n{body}\n<circle cx="143" cy="109" r="4" fill="#976144"/>\n</svg>\n'
    (OUT / (name + '.svg')).write_text(svg)

# The bell curve IS the H crossbar; no chart, axes or illustration beside it.
distribution = H.replace('V720H462V39', 'V720C950 720 950 1120 780 1120S600 720 462 720V39').replace('V760H1088V1461', 'V760C610 760 610 1160 780 1160S940 760 1088 760V1461')
save('ih-distribution', glyph(I, 5, 98, 'initial-i') + glyph(distribution, 45, 114, 'initial-h distribution-crossbar'))

# A tapering river replaces the straight H bar and becomes the I's lower terminal.
# The clip removes only the secondary I's lower serif; no canonical art is used.
river = '<defs><clipPath id="ih-river-i-cut"><path d="M0 0H50V80Q25 81 0 96Z"/></clipPath></defs>'
river += '<g clip-path="url(#ih-river-i-cut)">' + glyph(I, 5, 98, 'initial-i') + '</g>'
river += glyph(left + right, 45, 114, 'initial-h river-stems')
river += '<path class="river-crossbar" d="M5 92C30 72 45 73 70 88S109 113 133 94L133 98C108 121 87 108 68 94S30 76 5 94Z"/>'
save('ih-river', river)

# The H right stem continues into the pine; Rupert sits ON its crossbar.
# Source serif bases and left stem remain intact. No enclosing device or label.
tree = glyph(I, 5, 98, 'initial-i') + glyph(left, 45, 114, 'initial-h-left')
tree += '<path class="initial-h-pine" d="M93.8 114V111.87H104.48V63L106 28H109L116.67 63V111.87H126.51V114Z"/>'
tree += '<path class="pine-canopy" d="M106 9L103 22L95 28L103 27L100 35L86 42Q96 43 104 37L101 47L80 57Q93 59 104 50L103 60L84 67Q96 70 107 61Q117 67 129 65L110 57L109 48Q122 54 135 52L109 42L109 34L125 37L109 26L106 9Z"/>'
tree += '<path class="tree-crossbar" d="M70.26 72.45H106V74.64H70.26Z"/>'
tree += '<path class="rupert" fill="#976144" d="M81 72Q84 69 85 63L87 58L87 53L84 51L85 48L91 49L96 46L98 49L94 52L93 57Q95 60 95 66L98 72H92L90 63L89 71H87Q83 76 77 73L76 71Q79 72 81 72Z"/>'
save('ih-tree-dog', tree)
print('Built 3 secondary IH. vector monograms; canonical identity untouched.')
