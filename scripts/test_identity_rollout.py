"""Cross-site identity coverage and preservation checks; no browser required."""
from collections import Counter
from hashlib import sha256
from html.parser import HTMLParser
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]
BASE = 'f74d6a4539d194c014256a50ce311d0c9028b0f0'
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
    source = re.sub(r'    <div class="ih-atlas-device">.*?</div>\n', '', source)
    source = re.sub(r'<div class="ih-imprint ih-atlas-imprint">.*?</div>', '', source)
    source = source.replace('wrap ih-atlas-footer', 'wrap')
    return re.sub(r'\?v=[a-f0-9]{12}', '?v=ASSET', source)

# Preserve the immutable master; check the exact binary blobs of approved
# transparent exports without assuming their surrounding paper remains opaque.
from hashlib import sha1
check(sha256((ROOT / 'desk/assets/identity/ih-master.png').read_bytes()).hexdigest() ==
      '7e2dabb7244b44c8a582792f59ff3cb1fa0eb8e911a8a4e7c249d68c5ba0c619',
      'canonical IH. master must remain unchanged')
for name, digest in {
    'ih-signature.png': '6236e517a3f329837b0e1df68f27f609d1a306b4',
    'ih-period.png': '9cc9d95b3c320ac505e0f1f1dc40db8e736e0b33',
}.items():
    data = (ROOT / 'assets/identity' / name).read_bytes()
    blob = b'blob ' + str(len(data)).encode() + b'\x00' + data
    check(sha1(blob).hexdigest() == digest, name + ': approved transparent derivative')
    check(data[:8] == b'\x89PNG\r\n\x1a\n', name + ': valid PNG signature')

atlas = sorted(str(p.relative_to(ROOT)) for p in (ROOT / 'rupert').rglob('index.html'))
check(len(atlas) >= 11, 'Atlas coverage includes generated editions and archives')
for path in PAGES + atlas:
    source = (ROOT / path).read_text()
    before = old(path)
    tags, previous = Tags(source).tags, Tags(before).tags
    check('assets/identity/identity.css' in source, path + ': shared styling')
    marks = [a for t, a in tags if t == 'img' and a.get('class') == 'ih-personal-mark']
    check(len(marks) == 1 if path != 'weekly-economics-environment/index.html' else len(marks) == 3,
          path + ': persistent imprint coverage, including dialogs')
    for attrs in marks:
        check(attrs.get('alt') == 'IH. — Iain Holmes', path + ': accessible identity')
        check((attrs.get('width'), attrs.get('height')) == ('466', '438'), path + ': correct ratio')
    for tag, attrs in tags:
        url = attrs.get('src') or (attrs.get('href') if tag == 'link' else '')
        if url and 'assets/identity/' in url:
            check((ROOT / path).parent.joinpath(url.split('?')[0]).resolve().is_file(), path + ': valid asset path')
    for tag, key in [('a', 'href'), ('img', 'src')]:
        current = Counter(a.get(key) for t, a in tags if t == tag)
        previous_urls = Counter(a.get(key) for t, a in previous if t == tag)
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
            return re.findall(r'<script\b[^>]*>[\s\S]*?</script>', s)
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
check(not re.search(r'(?:^|[;{])\s*(?:filter|mix-blend-mode|transform)\s*:', css), 'No color/geometry alteration of approved artwork')
changed = subprocess.check_output(['git', 'diff', BASE, '--name-only'], cwd=ROOT, text=True).splitlines()
check(not any(p.startswith('desk/') for p in changed), 'No desk changes')
print(f'{checks} identity coverage/preservation checks passed across {len(PAGES + atlas)} pages.')
