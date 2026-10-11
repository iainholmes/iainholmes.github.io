"""Original desk. editorial line engravings. No external art or runtime dependencies.

Coordinates are authored here; repetition is limited to engraving strokes,
scales, pine needles and instrument divisions. Never processes IH. artwork.
"""
from pathlib import Path
from math import sin, cos, radians

ROOT = Path(__file__).resolve().parents[1] / 'assets' / 'illustrations'
ROOT.mkdir(exist_ok=True)


def path(d, w=1, opacity=1, fill='none'):
    return f'<path d="{d}" stroke-width="{w}" opacity="{opacity}" fill="{fill}"/>'


def circle(x,y,r,w=1,fill='none'):
    return f'<circle cx="{x}" cy="{y}" r="{r}" stroke-width="{w}" fill="{fill}"/>'


def save(name, body, box='0 0 300 180'):
    svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{box}" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">\n{body}\n</svg>\n'
    (ROOT / (name+'.svg')).write_text(svg)

# A natural-history fish: long dorsal rays, gill, scale field and forked tail.
a=path('M57 92 C93 51 167 48 214 68 Q239 77 257 91 Q243 110 215 120 C163 145 94 131 57 106 L22 126 Q32 99 20 72 Z',1.7)
a+=path('M89 65 Q105 54 117 41 Q133 29 149 38 Q170 44 198 62',1.2)
a+=path('M103 119 Q123 139 145 147 L142 130 M162 132 L180 148 192 127 M178 95 Q162 111 144 115 Q155 96 178 95',1.1)
a+=path('M214 69 Q194 93 215 120 M207 74 Q194 94 208 113 M229 100 Q241 104 249 96 M242 89 257 91 M60 96 Q137 82 195 93',1.15)
a+=circle(228,85,5,1.3)+circle(229,85,1.8,1,'currentColor')
for x,y in [(101,56),(106,52),(112,47),(118,41),(124,37),(130,35),(136,35),(142,37),(150,40),(158,44),(167,48),(178,53),(188,57)]:
    a+=path(f'M{x} {y} Q{x+5} {y+10} {x+7} 62',.7)
for i in range(9):
    y=77+i*5; a+=path(f'M57 99 Q40 {90+i*2} {24+abs(4-i)} {y}',.7,.8)
for row in range(6):
    y=73+row*8
    for col in range(11):
        x=78+col*11+(row%2)*5
        if (x-139)**2/75**2+(y-99)**2/33**2<1:
            a+=path(f'M{x} {y} q7 4 0 8',.65,.72)
for i in range(6):
    a+=path(f'M{110+i*5} 128 {136+i} {143-i*2} M{169+i*3} 130 {180+i} {145-i*2}',.65)
# Closely spaced curved hatching follows the back, belly and gill rather
# than using a flat gray fill; shape remains clear in one ink at small sizes.
for i in range(35):
    x=77+i*3.7
    y=56+((x-146)/75)**2*16
    a+=path(f'M{x:.1f} {y:.1f} q-4 5 -3 10',.52,.85)
for i in range(28):
    x=85+i*4.2; y=134-((x-148)/80)**2*17
    a+=path(f'M{x:.1f} {y:.1f} l5 -5',.5,.62)
for i in range(9):
    a+=path(f'M{213+i*2} {106+i*.5} l-2 5',.55,.75)
a+=path('M73 148 H129 M167 148 H222',.65,.5)
save('field-fish',a)

# Botanical loblolly sprig: asymmetric fascicles of long needles and a scaled cone.
def pine():
    s=path('M146 162 Q145 103 160 31 M148 131 Q111 109 85 82 M153 103 Q187 91 215 54 M155 75 Q134 56 124 32',1.8)
    s+=path('M150 160 Q149 107 164 33 M148 134 Q114 112 86 85',.65)
    tips=[(88,84,-142),(107,99,-126),(125,115,-115),(158,45,-91),(156,69,-66),(178,90,-44),(201,68,-49),(137,57,-130)]
    for x,y,angle in tips:
        for j in range(13):
            ang=radians(angle+(j-6)*6); length=27+(j%4)*5
            ex=x+cos(ang)*length; ey=y+sin(ang)*length
            cx=x+cos(ang+.15)*length*.52; cy=y+sin(ang+.15)*length*.52
            s+=path(f'M{x} {y} Q{cx:.1f} {cy:.1f} {ex:.1f} {ey:.1f}',.75,.88)
    s+=path('M160 119 Q181 103 193 119 Q205 145 181 164 Q158 154 160 119Z',1.1)
    for row in range(5):
        for col in range(3):
            x=164+col*9+(row%2)*3; y=120+row*7
            s+=path(f'M{x} {y} q5 -4 9 1 l-4 7Z',.7,.9)
    s+=path('M151 111 169 118 M141 163 157 163',1)
    return s
save('loblolly-sprig',pine())

# Three cloth-bound scholarly volumes, page edges and engraved spine bands.
s=''
for x,y,w,h,slant in [(54,119,183,23,17),(66,83,170,27,22),(57,46,182,29,27)]:
    s+=path(f'M{x} {y} {x+slant} {y-14} {x+w} {y+3} {x+w-slant} {y+16}Z',1.4)
    s+=path(f'M{x} {y} Q{x-4} {y+h/2} {x} {y+h} L{x+w-slant} {y+h+16} V{y+16} M{x+w-slant} {y+h+16} {x+w} {y+h+3} V{y+3}',1.5)
    s+=path(f'M{x+11} {y+4} Q{x+7} {y+h/2} {x+11} {y+h+1} M{x+27} {y+5} V{y+h+2}',.9)
    for k in range(4):
        yy=y+20+k*3
        s+=path(f'M{x+w-slant+4} {yy} {x+w-4} {yy-12}',.65,.8)
    for k in range(13):
        xx=x+35+k*8
        s+=path(f'M{xx} {y+8+(xx-x)*.07:.1f} l4 1',.65,.6)
    s+=path(f'M{x+39} {y+h-4} {x+w-slant-8} {y+h+9}',.65,.75)
    # Cloth engraving and worn board edges, held away from the page block.
    for k in range(23):
        xx=x+31+k*5.2; yy=y+h-1+(xx-x)*.078
        s+=path(f'M{xx:.1f} {yy:.1f} l2.5 -4',.5,.7)
    for k in range(6):
        s+=path(f'M{x+2} {y+4+k*3} l5 1',.55,.8)
s+=path('M43 163 H251 M45 167 H234',.6,.45)
# Fine geometry on the upper bookboard; no invented title or formula.
s+=path('M121 48 142 37 195 45 174 57Z M126 48 174 54 M146 40 170 53',.7,.75)
save('workbook-volumes',s)

# Brass dividers over a ruled research construction. No data or results implied.
s=path('M27 142 H282 M45 28 V153 M55 132 99 108 138 122 182 83 239 64',.75,.4)
for x,y in [(55,132),(99,108),(138,122),(182,83),(239,64)]:s+=circle(x,y,2.4,.8)
s+=path('M92 146 A84 84 0 0 1 236 102',.8,.7)
s+=path('M160 40 106 146 99 156 102 143 149 38 M158 42 209 143 214 157 206 147 149 43',1.8)
s+=path('M150 41 106 140 M158 47 207 140 M129 84 Q153 76 182 87 M130 89 Q156 83 180 92 M151 23 V12 H160 V23',1)
s+=circle(154,32,12,1.5)+circle(154,32,4,1)
s+=path('M139 70 174 73 M137 75 178 78 M157 66 157 81',1.2)
for i in range(9): s+=path(f'M{138+i*4} 74 v4',.6)
for i in range(6): s+=path(f'M{42+i*40} 140 v4',.6,.5)
save('advisor-dividers',s,'24 8 260 153')

# A drafting triangle and semicircular protractor, complementary to practice.
s=path('M38 151 220 151 220 24Z M86 136 H204 V57Z',1.5)
s+=path('M48 145 213 31 M214 33 V145 H52',.65,.7)
for i in range(18):
    x=47+i*9; s+=path(f'M{x} 151 v{-8 if i%5==0 else -4}',.75)
for i in range(13):
    y=34+i*9; s+=path(f'M220 {y} h{-8 if i%5==0 else -4}',.75)
s+='<g transform="translate(42 -5)">'
s+=path('M65 126 A75 75 0 0 1 215 126Z M77 126 A63 63 0 0 1 203 126 M90 126 A50 50 0 0 1 190 126',1.1)
for i in range(31):
    ang=radians(180+i*6); r=65 if i%5==0 else 70
    x,y=140+75*cos(ang),126+75*sin(ang); x2,y2=140+r*cos(ang),126+r*sin(ang)
    s+=path(f'M{x:.2f} {y:.2f} {x2:.2f} {y2:.2f}',.75)
s+=circle(140,126,3,.9)+path('M140 126 175 66 M137 123 144 129',.9)
s+='</g>'
save('qst-instruments',s,'34 18 231 140')

# Small cartographic ornament with compass and contour lines, no factual map.
s=''
for d in ['M13 60 C37 15 65 45 99 22 S159 25 173 10','M12 74 C36 26 67 63 101 37 S149 48 178 23','M11 88 C36 40 69 77 101 52 S150 64 182 38','M17 101 C42 56 71 91 107 67 S158 79 187 52','M24 111 C45 75 72 106 114 82 S162 98 190 68']:
    s+=path(d,.85,.5)
s+='<g transform="translate(232 62)">'+circle(0,0,40,.9)+circle(0,0,34,.6)
for ang in range(0,360,15):
    a=radians(ang); r=31 if ang%90==0 else 36
    s+=path(f'M{40*cos(a):.2f} {40*sin(a):.2f} {r*cos(a):.2f} {r*sin(a):.2f}',.65)
for ang in [0,90,180,270]:
    s+=f'<g transform="rotate({ang})">'+path('M0 -49 6 -6 0 0Z',.8,1,'currentColor')+path('M0 -49 -6 -6 0 0Z',.8)+'</g>'
s+=circle(0,0,4,1)+ '</g>'
save('atlas-bearing',s,'0 0 300 124')

# Original academic arcade study, deliberately not a named campus landmark.
s=path('M39 147 H267 M46 140 H260 M54 133 H252 M62 126 V55 L150 21 244 55 V126 M60 55 H246 M69 48 H234 M78 45 150 29 224 46Z',1.3)
s+=path('M68 61 H237 M68 66 H237 M70 120 H237 M70 125 H237',.85)
for x in [78,128,178,228]:
    s+=path(f'M{x-6} 119 H{x+6} V115 H{x+4} V72 H{x+7} V67 H{x-7} V72 H{x-4} V115 H{x-6}Z',1)
    for j in [-2,0,2]:s+=path(f'M{x+j} 76 V112',.55,.6)
for x in [103,153,203]:
    s+=path(f'M{x-15} 116 V94 A15 15 0 0 1 {x+15} 94 V116 M{x-11} 115 V95 A11 11 0 0 1 {x+11} 95 V115',1)
    s+=path(f'M{x} 85 V116 M{x-10} 99 H{x+10}',.7,.7)
    for i in range(5):s+=path(f'M{x-8+i*4} 103 v12',.5,.4)
for x in range(79,232,8):s+=path(f'M{x} 58 v3',.65)
s+=path('M151 34 155 40 151 46 147 40Z M32 153 H275 M46 157 H257',.65,.6)
save('academic-arcade',s,'29 17 250 145')
print('Built seven original editorial SVG illustrations.')
