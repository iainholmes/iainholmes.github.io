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
check('<title>Desk.</title>' in source, 'Exact Desk. identity required')
check(not any(tag in ['script', 'iframe', 'form'] for tag, _ in page.tags), 'No app execution, storage or embedded sessions')
check('viewport-fit=cover' in source and 'safe-area-inset-bottom' in css, 'Safe-area support')
check('prefers-reduced-motion:reduce' in css, 'Reduced-motion support')
check(':focus-visible' in css and 'Skip to destinations' in source, 'Keyboard navigation support')
check(not any(token in source + css for token in ['localStorage', 'sessionStorage', 'api_key', 'api.anthropic', 'serviceWorker']), 'Desk must not access app storage or credentials')
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
check(manifest['name'] == 'Desk.' and manifest['short_name'] == 'Desk.', 'Install identity')
check(manifest['scope'] == '/desk/' and manifest['start_url'] == '/desk/', 'Install scope must stay within Desk')
for icon in manifest['icons']:
    check((ROOT / icon['src']).is_file(), 'Missing installation icon')
for dest, original in [
    ('assets/rupert-river-plate.jpg', 'rupert/photos/rupert-plate-eno-ledge-800.jpg'),
    ('assets/fonts/velenor.ttf', 'rupert/assets/fonts/velenor-regular.ttf'),
    ('assets/fonts/ectros.ttf', 'weekly-economics-environment/fonts/Ectros-Regular.ttf'),
    ('assets/fonts/archivo.woff2', 'rupert/assets/fonts/archivo-latin-wdth-normal.woff2')
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
