"""Cross-site identity coverage and preservation checks; no browser required."""
from collections import Counter
from hashlib import sha256
from html.parser import HTMLParser
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]
BASE = 'e6658950948d5667408cba882d76308a0cf6d609'
PAGES = ['index.html', 'personal-updates/index.html',
         'personal-updates/commonplace/index.html', 'personal-updates/handbook/index.html',
         'daily-watchlist-5/index.html', 'daily-econ-challenge/index.html',
         'weekly-economics-environment/index.html',
         'weekly-economics-environment/notebook/index.html']
checks = 0

def check(ok, message):
    global checks
    assert ok, message
    checks += 1

class Tags(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.tags = []
        self.feed(source)
    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))

def old(path):
    return subprocess.check_output(['git', 'show', f'{BASE}:{path}'], cwd=ROOT, text=True)

def clean(source):
    source = re.sub(r'<link rel="stylesheet" href="[^"]*assets/identity/identity.css[^>]+>\n?', '', source)
    source = re.sub(r'<div class="ih-atlas-device"[^>]*>.*?</div>', '', source)
    source = re.sub(r'<span class="ih-personal-mark[^"]*">.*?</span>', '', source)
    source = re.sub(r'<img class="ih-personal-mark"[^>]+>', '', source)
    source = re.sub(r'\?v=[a-f0-9]{12}', '?v=ASSET', source)
    return re.sub(r'\n[ \t]*\n', '\n', source)

from PIL import Image
check(sha256((ROOT / 'desk/assets/identity/ih-master.png').read_bytes()).hexdigest() ==
      '7e2dabb7244b44c8a582792f59ff3cb1fa0eb8e911a8a4e7c249d68c5ba0c619',
      'canonical IH. master remains unchanged')
day = Image.open(ROOT / 'assets/identity/ih-signature.png').convert('RGBA')
night = Image.open(ROOT / 'assets/identity/ih-signature-night.png').convert('RGBA')
period = Image.open(ROOT / 'assets/identity/ih-period.png').convert('RGBA')
original = Image.open(ROOT / 'desk/assets/identity/ih-signature.png').convert('RGBA')
original_period = Image.open(ROOT / 'desk/assets/identity/ih-period.png').convert('RGBA')
check(day.size == night.size == original.size == (466, 438), 'original signature resolution and composition')
check(period.size == (60, 60), 'original period resolution')
check(day.getchannel('A').tobytes() == night.getchannel('A').tobytes(), 'contrast variant has identical geometry/alpha')
check(day.crop((380,343,440,403)).tobytes() == night.crop((380,343,440,403)).tobytes() == period.tobytes(), 'identical copper illustration in both variants')
for image in [day, night, period]:
    alpha = image.getchannel('A')
    check(all(image.getpixel(p)[3] == 0 for p in [(0,0),(image.width-1,0),(0,image.height-1),(image.width-1,image.height-1)]), 'surrounding corners transparent')
    check(sum(0 < v < 255 for v in alpha.get_flattened_data()) > 50, 'antialiased fractional-alpha edges retained')
    check(alpha.getextrema() == (0,255), 'fully transparent and opaque regions')
cream = []
for y in range(60):
    for x in range(60):
        p = original_period.getpixel((x,y))
        if (x-30)**2+(y-30)**2 < 23**2 and min(p[:3]) > 225:
            cream.append((x,y))
check(len(cream) > 100, 'substantial internal illustration fixture')
check(all(period.getpixel(p) == original_period.getpixel(p) for p in cream), 'Rupert/pine cream details retained opaque and unchanged')
core = []
for y in range(2,341):
    for x in range(2,464):
        if all((lambda p: p[0]<48 and p[1]-p[0]>22 and p[1]-p[2]>7)(original.getpixel((xx,yy))) for yy in range(y-1,y+2) for xx in range(x-1,x+2)):
            core.append((x,y))
check(len(core)>10000 and all(day.getpixel(p)==original.getpixel(p) for p in core), 'opaque original letter colors and texture preserved')

atlas = sorted(str(p.relative_to(ROOT)) for p in (ROOT / 'rupert').rglob('index.html'))
check(len(atlas) >= 11, 'Atlas coverage includes generated editions and archives')
for path in PAGES + atlas:
    source = (ROOT / path).read_text()
    before = old(path)
    tags, previous = Tags(source).tags, Tags(before).tags
    check('assets/identity/identity.css' in source, path + ': shared styling')
    marks = [a for t, a in tags if t == 'span' and a.get('class','').split()[:1] == ['ih-personal-mark']]
    check(len(marks) == 1 if path != 'weekly-economics-environment/index.html' else len(marks) == 3,
          path + ': persistent imprint coverage, including dialogs')
    images = [a for t, a in tags if t == 'img' and a.get('class') in ['ih-mark-day','ih-mark-night']]
    check(len(images) == len(marks)*2, path + ': both contrast treatments')
    for attrs in images:
        check(attrs.get('alt') == 'IH. — Iain Holmes', path + ': accessible identity')
        check((attrs.get('width'), attrs.get('height')) == ('466', '438'), path + ': correct ratio')
        check('?v=20261012-seamless2' in attrs['src'], path + ': refreshed image cache')
    for tag, attrs in tags:
        url = attrs.get('src') or (attrs.get('href') if tag == 'link' else '')
        if url and 'assets/identity/' in url:
            check((ROOT / path).parent.joinpath(url.split('?')[0]).resolve().is_file(), path + ': valid asset path')
    for tag, key in [('a', 'href'), ('img', 'src')]:
        current = Counter(a.get(key) for t, a in tags if t == tag and 'assets/identity/' not in a.get(key,''))
        previous_urls = Counter(a.get(key) for t, a in previous if t == tag and 'assets/identity/' not in a.get(key,''))
        check(not (previous_urls - current), path + ': existing links/artwork preserved')
    check(re.findall(r'<style[^>]*>([\s\S]*?)</style>', source) ==
          re.findall(r'<style[^>]*>([\s\S]*?)</style>', before), path + ': existing styles unchanged')
    if path.startswith('rupert/'):
        check(clean(source) == clean(before), path + ': only identity and generated cache versions changed')
        check('rupert-portrait-outline.svg' in source, path + ': Rupert portrait retained')
    else:
        def scripts(s):
            # Field Brief's sole runtime edit appends a noninteractive imprint to every issue.
            s = re.sub(r'    <footer class="ih-edition-colophon">.*?</footer>\n', '', s)
            return re.findall(r'<script\b[^>]*>[\s\S]*?</script>', clean(s))
        check(scripts(source) == scripts(before), path + ': data and behavior unchanged')

fb = (ROOT / 'daily-watchlist-5/index.html').read_text()
check(re.search(r'id="ixBody"></div>\s*<div class="ih-imprint ih-index-imprint"', fb), 'Field Brief index signature')
check(re.search(r'</nav>\s*<footer class="ih-edition-colophon">', fb), 'Field Brief signature follows edition navigation')
ll = (ROOT / 'weekly-economics-environment/index.html').read_text()
for dialog in ['archive-dialog', 'register-dialog']:
    check('ih-dialog-imprint' in re.search(r'<dialog id="'+dialog+r'"[\s\S]*?</dialog>', ll).group(), dialog + ': signature visible within dialog')
wb = (ROOT / 'daily-econ-challenge/index.html').read_text()
check(re.search(r'<a class="wb-mark foot-mark"[\s\S]*?</a>', wb).group() ==
      re.search(r'<a class="wb-mark foot-mark"[\s\S]*?</a>', old('daily-econ-challenge/index.html')).group(), 'Workbook closing equation unchanged')
css = (ROOT / 'assets/identity/identity.css').read_text()
check('flex-wrap: wrap' in css and '@media (max-width: 600px)' in css, 'Narrow-screen wrapping rules present (not browser acceptance)')
check('background: transparent' in css and 'background:#fff' not in css, 'no rectangular backing')
check('grid-template-columns:minmax(0,1fr) auto minmax(0,1fr)' in css and 'align-items:center' in css, 'desktop dateline alignment')
check('@media (max-width:1023.98px)' in css and 'grid-row:3' in css and '18px 18px' in css and '16px 16px' in css, 'mobile portrait/landscape ornament rules')
check('?v=20261012-seamless2' in css, 'mobile period cache refreshed')
changed = subprocess.check_output(['git', 'diff', BASE, '--name-only'], cwd=ROOT, text=True).splitlines()
check(not any(p.startswith('desk/') for p in changed), 'No desk changes')
print(f'{checks} identity coverage/preservation checks passed across {len(PAGES + atlas)} pages.')
