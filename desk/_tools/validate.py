"""Check release boundaries, real assets, navigation and static accessibility.

Run from anywhere: python desk/_tools/validate.py [--online]
Browser visual/interaction review is a separate, required release gate.
"""
from concurrent.futures import ThreadPoolExecutor
from hashlib import sha256
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse
from urllib.request import Request, urlopen
import json
import re
import subprocess
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parent
checks = 0


def check(condition, message):
    global checks
    if not condition:
        raise AssertionError(message)
    checks += 1


class Page(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.tags, self.links, self.ids, self.refs = [], [], [], []
        self.anchors = 0
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.tags.append((tag, attrs))
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        if tag == 'a':
            check(self.anchors == 0, 'Nested links are invalid')
            self.anchors += 1
            self.links.append(attrs.get('href', ''))
        if tag in ['details', 'summary']:
            check(self.anchors == 0, 'Disclosure controls must not be nested in navigation links')
        if tag == 'details':
            check('open' not in attrs, 'Introductions must be optional and initially closed')
        if tag == 'img':
            check('alt' in attrs, 'Every image needs an alt attribute')
            check('width' in attrs and 'height' in attrs, 'Image dimensions must reserve space')
        for attribute in ['aria-labelledby', 'aria-describedby', 'aria-controls']:
            self.refs.extend(attrs.get(attribute, '').split())

    def handle_endtag(self, tag):
        if tag == 'a':
            self.anchors -= 1


source = (ROOT / 'index.html').read_text()
page = Page(source)
config = json.loads((ROOT / 'projects.json').read_text())
provenance = json.loads((ROOT / 'SOURCE-REVISIONS.json').read_text())
css = (ROOT / 'desk.css').read_text()
check(len(page.ids) == len(set(page.ids)), 'Duplicate IDs')
check(all(ref in page.ids for ref in page.refs), 'Broken accessible label reference')
check(sum(tag == 'main' for tag, _ in page.tags) == 1, 'Exactly one main landmark required')
check(sum(tag == 'h1' for tag, _ in page.tags) == 1, 'Exactly one page heading required')
check('<title>desk.</title>' in source and '<h1>desk<span>.</span></h1>' in source, 'Lowercase desk. identity required')
check(not any(tag in ['iframe', 'form'] for tag, _ in page.tags), 'No embedded application sessions')
check([attrs.get('src') for tag, attrs in page.tags if tag == 'script'] == ['desk.js'], 'Only the local appearance/navigation script is permitted')
check(source.index('<script src="desk.js">') < source.index('<link rel="stylesheet"'), 'Appearance must be set before stylesheet paint')
check(all(not key.lower().startswith('on') for _, attrs in page.tags for key in attrs), 'No inline event handlers')
check('↗' not in source, 'Use SVG link icons, not emoji-dependent arrows')
for tag, attrs in page.tags:
    if attrs.get('class') == 'arrow':
        check(tag == 'svg' and attrs.get('aria-hidden') == 'true' and attrs.get('focusable') == 'false', 'Decorative SVG arrows must not create tab stops')
    if attrs.get('class') == 'appearance-switch':
        check(tag == 'button' and attrs.get('aria-label') == 'Night appearance' and attrs.get('aria-pressed') == 'false', 'Appearance control must be a labeled native toggle')
    if attrs.get('id') in ['research', 'reading', 'profile']:
        check(attrs.get('tabindex') == '-1', 'Section destinations must receive programmatic focus')
check('font-synthesis:none' in css, 'Do not synthesize Dunhill font weights or styles')
check('font-style:italic' in css and 'archivo-italic.woff' in css, 'Use genuine Archivo italic')
check('viewport-fit=cover' in source and 'safe-area-inset-bottom' in css, 'Safe-area support')
check('prefers-reduced-motion:reduce' in css, 'Reduced-motion support')
check(':focus-visible' in css and 'Skip to Destinations' in source, 'Keyboard navigation support')
check(not any(token in source + css + (ROOT / 'desk.js').read_text() for token in ['localStorage', 'sessionStorage', 'api_key', 'api.anthropic', 'serviceWorker']), 'Desk must not access app storage or credentials')
for tag, attrs in page.tags:
    for key in ['href', 'src']:
        value = attrs.get(key, '')
        if not value:
            continue
        if value.startswith('#'):
            check(value[1:] in page.ids, f'Broken local anchor: {value}')
        elif not value.startswith('https://'):
            check((ROOT / value).is_file(), f'Missing local resource: {value}')
for asset in re.findall(r'url\(([^)]+)\)', css):
    check((ROOT / asset).is_file(), f'Missing CSS resource: {asset}')
for p in config['projects']:
    check(p['group'] in ['research', 'reading', 'profile'], f'Unknown group: {p["id"]}')
    check(p['url'] in page.links, f'Missing destination: {p["name"]}')
    for child in p.get('publications', []) + p.get('links', []):
        check(child['url'] in page.links, f'Missing deep link: {child["name"]}')
for url in page.links:
    check(url.startswith('#') or url.startswith('https://iainholmes.github.io/'), f'Unexpected navigation: {url}')
manifest = json.loads((ROOT / 'manifest.webmanifest').read_text())
check(manifest['name'] == 'desk.' and manifest['short_name'] == 'desk.', 'Install identity')
check(manifest['scope'] == '/desk/' and manifest['start_url'] == '/desk/', 'Install scope must stay within Desk')
for icon in manifest['icons']:
    check((ROOT / icon['src']).is_file(), 'Missing installation icon')
for dest, original in [
    ('assets/rupert-river-plate.jpg', 'rupert/photos/rupert-plate-eno-ledge-800.jpg'),
    ('assets/fonts/velenor.ttf', 'rupert/assets/fonts/velenor-regular.ttf'),
    ('assets/fonts/ectros.ttf', 'weekly-economics-environment/fonts/Ectros-Regular.ttf'),
    ('assets/fonts/archivo.woff2', 'rupert/assets/fonts/archivo-latin-wdth-normal.woff2'),
    ('assets/fonts/lmromandunh10-regular.otf', 'weekly-economics-environment/fonts/LMRomanDunhill-Regular.otf'),
    ('assets/fonts/lmromandunh10-oblique.otf', 'weekly-economics-environment/fonts/LMRomanDunhill-Oblique.otf')
]:
    check(sha256((ROOT / dest).read_bytes()).digest() == sha256((REPO / original).read_bytes()).digest(), f'Original asset changed: {dest}')
check(sha256((ROOT / 'assets/advisor-mark.svg').read_bytes()).hexdigest() == provenance['advisor_mark_sha256'], 'Original Advisor mark changed')
archive_source = (REPO / 'personal-updates/issue-mark-archive.js').read_text()
archive, _ = json.JSONDecoder().raw_decode(archive_source.split('var archive=', 1)[1])
for item in provenance['archival_covers']:
    cover = (ROOT / item['asset']).read_text()
    check(cover == archive[item['archive_key']]['frozen'], f'Canonical artwork changed: {item["asset"]}')
    check(sha256(cover.encode()).hexdigest() == item['sha256'], 'Cover provenance mismatch')
    check(cover in source, 'Archived cover must be embedded without modification')
    svg = ET.fromstring(cover)
    check(svg.attrib.get('viewBox') == '0 0 600 800', 'Preserve complete archival cover proportions')
    check(all(node.tag.rsplit('}', 1)[-1] not in ['script', 'foreignObject', 'image'] for node in svg.iter()), 'Cover must remain self-contained static vector artwork')
    check(all(not k.lower().startswith('on') and k.rsplit('}', 1)[-1] != 'href' for node in svg.iter() for k in node.attrib), 'No active or external SVG resources')
for item in provenance['additional_fonts']:
    check(sha256((ROOT / item['asset']).read_bytes()).hexdigest() == item['sha256'], 'Font provenance mismatch')
    check((ROOT / item['license']).is_file(), 'Font license missing')
for name in ['GUST-FONT-LICENSE.txt', 'LPPL-1.3c.txt', 'Latin-Modern-README.txt', 'Latin-Modern-MANIFEST.txt', 'NOTICE.md']:
    check((ROOT / 'assets/fonts' / name).is_file(), f'Missing font distribution notice: {name}')
for file, size in [('apple-touch-icon.png', 180), ('icon-192.png', 192), ('icon-512.png', 512), ('favicon-32.png', 32)]:
    image = (ROOT / 'assets' / file).read_bytes()
    check(image[:8] == b'\x89PNG\r\n\x1a\n' and int.from_bytes(image[16:20], 'big') == size and int.from_bytes(image[20:24], 'big') == size, f'Incorrect PNG dimensions: {file}')

# The supplied final identity is immutable; derivatives must be exact source pixels.
from PIL import Image
identity = provenance['personal_signature']
master_path = ROOT / identity['master']
check(sha256(master_path.read_bytes()).hexdigest() == '7e2dabb7244b44c8a582792f59ff3cb1fa0eb8e911a8a4e7c249d68c5ba0c619', 'Supplied IH. master must remain byte-identical')
master = Image.open(master_path)
check(master.size == (1254, 1254) and master.mode == 'RGBA', 'Preserve master dimensions and channels')
identity_before = {}
for item in identity['assets']:
    path = ROOT / item['asset']
    data = path.read_bytes()
    identity_before[path] = data
    check(sha256(data).hexdigest() == item['sha256'], 'Identity asset provenance mismatch')
    if 'source_crop' in item:
        crop = master.crop(item['source_crop'])
        export = Image.open(path)
        check(export.size == crop.size and export.mode == crop.mode, 'No identity resampling or channel conversion')
        check(export.tobytes() == crop.tobytes(), 'Every exported identity pixel must equal the supplied master crop')
check(not list((ROOT / 'assets/identity').glob('*.svg')), 'Remove superseded reconstructed identity SVGs')
check(sum(tag == 'img' and attrs.get('src') == 'assets/identity/ih-signature.png' and attrs.get('alt') == 'Iain Holmes — IH. personal signature with Rupert beneath a loblolly pine' for tag, attrs in page.tags) == 1, 'Header must expose the exact supplied identity once')
check(sum(tag == 'img' and attrs.get('src') == 'assets/identity/ih-period.png' and attrs.get('alt') == '' and attrs.get('aria-hidden') == 'true' for tag, attrs in page.tags) == 1, 'Footer uses the exact decorative period crop')
check(any(attrs.get('class') == 'footer-signature' and attrs.get('aria-hidden') == 'true' for _, attrs in page.tags), 'Repeated footer signature is decorative')
chapter_devices = re.findall(r'<svg class="chapter-device .*?</svg>.*?</svg>', source, re.S)
check(len(chapter_devices) == 3, 'All three collection chapters need branded compositions')
ns = '{http://www.w3.org/2000/svg}'
for fragment, name in zip(chapter_devices, ['inquiry', 'field-folio', 'scholar']):
    device = ET.fromstring(fragment)
    check(device.attrib.get('viewBox') == '0 0 210 100' and device.attrib.get('aria-hidden') == 'true', 'Compact, decorative chapter identity required')
    images = list(device.iter(ns + 'image'))
    check(len(images) == 1 and images[0].attrib.get('href') == 'assets/identity/ih-signature.png', 'Each chapter must visibly include the exact IH. image')
    check(images[0].attrib.get('{http://www.w3.org/1999/xlink}href') == images[0].attrib['href'], 'SVG raster fallback must use the same approved image')
    check(images[0].attrib.get('preserveAspectRatio') == 'xMidYMid meet' and 'transform' not in images[0].attrib, 'Never stretch or transform the canonical image')
    check(not any(n.tag.rsplit('}', 1)[-1] in ['clipPath', 'mask', 'filter', 'script', 'foreignObject', 'text'] for n in device.iter()), 'No identity clipping, recoloring or substitute lettering')
    illustration = device.find(ns + 'svg')
    original = ET.parse(ROOT / 'assets/chapter-signatures' / (name + '.svg')).getroot()
    check(illustration is not None and [(n.tag, n.attrib) for n in illustration.iter()][1:] == [(n.tag, n.attrib) for n in original.iter()][1:], 'Preserve every original chapter engraving path')
check('.editorial-chapter[data-active="true"] .chapter-signature { display:none }' in css, 'Any authentic reveal hides the chapter identity; returning restores it')
check('<p>“Everything in its right place.”</p>' in source, 'Preserve the exact quotation with explicit punctuation')
check('Thom Yorke<span class="sr-only">, vocalist</span>, Radiohead' in source and 'title="Radiohead vocalist"' in source, 'Attribute to Radiohead’s vocalist without a sole-songwriter claim')
check('footer-utilities' in source and 'Keep desk. Close' in source and 'desk. — back to top' in source, 'Preserve footer controls')
check('identity-small' not in source + css and 'ih-monogram' not in source, 'Never switch back to a reconstructed or simplified logo')
check(not re.search(r'(?:filter|mix-blend-mode)\s*:', css), 'Never recolor or blend the supplied identity')
subprocess.run([sys.executable, str(ROOT / '_tools/prepare-identity.py')], check=True, capture_output=True)
check(all(path.read_bytes() == data for path, data in identity_before.items()), 'Identity crop generation must be deterministic and preserve the master')

# Seven self-contained, decorative devices must remain attached to their destinations.
illustration_targets = {
    'field-fish':'collection-field-brief', 'loblolly-sprig':'collection-loblolly',
    'workbook-volumes':'collection-workbook', 'advisor-dividers':'collection-advisor',
    'qst-instruments':'collection-qst', 'atlas-bearing':'collection-rupert', 'academic-arcade':'collection-portfolio'
}
illustration_before = {}
check(len(provenance['editorial_illustrations']['assets']) == 7, 'Exactly seven editorial devices required')
for item in provenance['editorial_illustrations']['assets']:
    file = ROOT / item['asset']
    data = file.read_bytes()
    illustration_before[file] = data
    check(sha256(data).hexdigest() == item['sha256'], 'Editorial illustration provenance mismatch')
    svg = ET.fromstring(data)
    check(svg.attrib.get('aria-hidden') == 'true' and svg.attrib.get('focusable') == 'false', 'Decorative illustrations must not duplicate link labels or create tab stops')
    check(all(node.tag.rsplit('}',1)[-1] in ['svg','g','path','circle'] for node in svg.iter()), 'Illustrations must remain static self-contained vectors')
    check(all(not k.lower().startswith('on') and k.rsplit('}',1)[-1] != 'href' for node in svg.iter() for k in node.attrib), 'No active or remote illustration resources')
    name = file.stem
    target = illustration_targets[name]
    tag = 'section' if target.endswith('-group') else 'article'
    article = re.search(r'<'+tag+r' class="[^"]*\b'+target+r'\b[^"]*".*?</'+tag+'>', source, re.S)
    check(article is not None and data.decode() in article.group(), f'Illustration missing from its own destination: {name}')
    check(source.count('data-illustration="'+name+'"') == 1, 'Each destination needs its own single illustration')
subprocess.run([sys.executable, str(ROOT / '_tools/build-illustrations.py')], check=True, capture_output=True)
check(all(path.read_bytes() == data for path,data in illustration_before.items()), 'Illustration output must reproduce deterministically')

check('A home for research, reading and getting outside.' not in source + json.dumps(config), 'Remove the introductory tagline from served markup and configuration')
check('<div class="masthead"><h1>desk<span>.</span></h1></div>' in source, 'Home header must not replace the tagline with another sentence')
check(sum(tag == 'section' and 'editorial-chapter' in attrs.get('class','').split() for tag,attrs in page.tags) == 3, 'Keep exactly three continuous editorial chapters')
check('collection-advisor' in source and 'collection-qst' in source, 'Independent IH. research folios required')
check('class="profile-composition"' in source, 'Architecture must frame the academic chapter')
check('.editorial-chapter::before' in css and 'pointer-events:none' in css, 'Atmospheric layers must not block interaction')

class PresentationAudit(HTMLParser):
    void = {'img','meta','link','br','hr','input','source','wbr','area','base','embed','param','track','col'}
    def __init__(self):
        super().__init__()
        self.stack = []
        self.faces = {}
    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        concealed = 'hidden' in attrs or any(hidden for _, _, hidden in self.stack)
        work = attrs.get('data-work') or next((a['data-work'] for _,a,_ in reversed(self.stack) if 'data-work' in a), None)
        if 'data-work' in attrs:
            self.faces[work] = set()
        if 'data-authentic' in attrs:
            check(concealed, 'Every authentic presentation must be hidden in initial HTML')
            self.faces[work].add('authentic')
        if 'data-collection' in attrs:
            check(not concealed, 'Every IH. collection face must be initially visible')
            self.faces[work].add('collection')
        if tag == 'article' and set(attrs.get('class','').split()) & {'advisor','qst','publication','rupert','portfolio'}:
            check(concealed, 'Authentic application article exposed before selection')
        if 'data-reveal' in attrs:
            check(tag == 'button' and attrs.get('type') == 'button' and attrs.get('aria-expanded') == 'false' and attrs.get('aria-controls') == 'authentic-'+work, 'Reveal must be a separate accessible local control')
        if tag not in self.void:
            self.stack.append((tag,attrs,concealed))
    def handle_endtag(self, tag):
        for i in range(len(self.stack)-1,-1,-1):
            if self.stack[i][0] == tag:
                del self.stack[i:]
                break
presentation = PresentationAudit()
presentation.feed(source)
check(len(presentation.faces) == 7 and all(value == {'collection','authentic'} for value in presentation.faces.values()), 'Seven structurally separate collection/authentic presentation pairs required')
check('[hidden] { display:none!important }' in css, 'Inactive presentations must leave layout and accessibility navigation')

before = source
subprocess.run(['node', str(ROOT / '_tools/build.mjs')], check=True, capture_output=True)
check((ROOT / 'index.html').read_text() == before, 'Committed HTML is out of sync with configuration')
changed = subprocess.check_output(['git', 'diff', '--name-only', 'origin/master', '--'], cwd=REPO, text=True).splitlines()
untracked = subprocess.check_output(['git', 'ls-files', '--others', '--exclude-standard'], cwd=REPO, text=True).splitlines()
check(all(p.startswith('desk/') for p in changed + untracked), 'Changes outside desk/')

if '--online' in sys.argv:
    def verify(url):
        parsed = urlparse(url)
        with urlopen(Request(url, headers={'User-Agent': 'Desk-link-verification'}), timeout=30) as response:
            data = response.read().decode('utf-8')
            check(response.status == 200, f'Bad HTTP status for {url}')
            check(urlparse(response.url).netloc == parsed.netloc, f'Unexpected redirect for {url}')
            if parsed.fragment:
                target_ids = re.findall(r'\bid=[\"\']([^\"\']+)[\"\']', data)
                check(parsed.fragment in target_ids, f'Missing destination fragment: {url}')
        return url

    urls = sorted({url for url in page.links if url.startswith('https://')})
    with ThreadPoolExecutor(max_workers=5) as executor:
        for verified in executor.map(verify, urls):
            print(f'HTTP 200 {verified}')
print(f'PASS: {checks} static/source checks. Browser rendering remains a separate release gate.')
