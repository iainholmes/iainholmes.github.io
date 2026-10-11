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
        for attribute in ['aria-labelledby', 'aria-describedby']:
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
check(':focus-visible' in css and 'Skip to destinations' in source, 'Keyboard navigation support')
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

# The personal signature must remain portable vector geometry with one accessible label.
identity_assets = {}
for item in provenance['personal_signature']['assets']:
    data = (ROOT / item['asset']).read_bytes()
    check(sha256(data).hexdigest() == item['sha256'], 'Personal signature provenance mismatch')
    svg = ET.fromstring(data)
    check(svg.attrib.get('viewBox') in ['0 0 1000 1000', '0 0 100 100'], 'Identity canvas must remain square')
    check(svg.attrib.get('role') == 'img' and bool(svg.attrib.get('aria-label')), 'Standalone identity needs an accessible name')
    check(all(node.tag.rsplit('}', 1)[-1] in ['svg', 'title', 'desc', 'circle', 'g', 'path', 'defs', 'clipPath'] for node in svg.iter()), 'Identity must use only static vector geometry')
    check(all(not k.lower().startswith('on') and k.rsplit('}', 1)[-1] != 'href' for node in svg.iter() for k in node.attrib), 'No identity script or external resource')
    ids = {node.attrib['id'] for node in svg.iter() if 'id' in node.attrib}
    check(all(ref in ids for ref in re.findall(r'url\(#([^)]*)\)', data.decode())), 'Identity clipping references must resolve locally')
    check(any(node.attrib.get('fill') == '#a45f35' for node in svg.iter()), 'Reference-matched copper signature color must remain constant')
    check(all(any(node.attrib.get('data-part') == part and node.attrib.get('d') for node in svg.iter()) for part in ['pine', 'rupert']), 'Every identity variant must retain Rupert and the loblolly')
    if 'monogram' in item['asset']:
        initials = {node.attrib.get('data-initial'): node.attrib.get('d') for node in svg.iter() if 'data-initial' in node.attrib}
        check(set(initials) == {'I', 'H'} and initials['I'] != initials['H'], 'Both distinct initials are required')
    identity_assets[Path(item['asset']).name] = (data, svg)
primary = identity_assets['ih-monogram.svg'][1]
night = identity_assets['ih-monogram-night.svg'][1]
check([n.attrib.get('d') for n in primary.iter() if 'd' in n.attrib] == [n.attrib.get('d') for n in night.iter() if 'd' in n.attrib], 'Night treatment must preserve primary geometry')
small = identity_assets['ih-monogram-small.svg'][1]
check(any(n.attrib.get('data-part') == 'period' and n.attrib.get('transform') == 'translate(702 633) scale(1.04)' for n in small.iter()), 'Compact identity must preserve the reference period proportion and placement')
check(sum(attrs.get('class') == 'owner-mark' and attrs.get('role') == 'img' and attrs.get('aria-label') == 'Iain Holmes — IH. personal monogram' for _, attrs in page.tags) == 1, 'Expose the personal identity once in the header')
check(any(attrs.get('class') == 'footer-signature' and attrs.get('aria-hidden') == 'true' for _, attrs in page.tags), 'Repeated footer signature is decorative')
check('A personal collection' not in source, 'Replace the old owner block rather than duplicating it')
check('footer-utilities' in source and 'Keep desk. close' in source and 'desk. — back to top' in source, 'Preserve footer controls')
for key, filename in [('primary', 'ih-monogram.svg'), ('small', 'ih-monogram-small.svg'), ('period', 'copper-period.svg')]:
    embedded = re.search(r'<svg class="identity-' + key + r'".*?</svg>', source, re.S)
    check(embedded is not None, f'Missing inline {key} identity')
    svg = ET.fromstring(embedded.group(0))
    check(svg.attrib.get('aria-hidden') == 'true' and svg.attrib.get('focusable') == 'false', 'Inline identities must not introduce duplicate announcements or focus stops')
    check([ET.tostring(n) for n in svg] == [ET.tostring(n) for n in identity_assets[filename][1]], 'Inline identity geometry must match the canonical asset')
subprocess.run(['node', str(ROOT / '_tools/build-identity.mjs')], check=True, capture_output=True)
check(all((ROOT / 'assets/identity' / name).read_bytes() == data for name, (data, _) in identity_assets.items()), 'Canonical identity generation must be deterministic')

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
