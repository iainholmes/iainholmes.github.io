// Focused chronology regression: real Atlas handlers and MapLibre, desktop and touch-sized Chromium.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve, extname } from 'node:path';
import { atlasModel } from '../assets/js/core/atlas.js';

const { chromium } = createRequire(import.meta.url)('playwright');
const root = fileURLToPath(new URL('../../', import.meta.url));
const output = process.env.ATLAS_QA_OUTPUT_DIR || '/tmp/atlas-directory-order';
await mkdir(output, { recursive: true });
const readJSON = async path => JSON.parse(await readFile(resolve(root, path), 'utf8'));
const places = await readJSON('rupert/data/places.json');
const manifest = await readJSON('rupert/data/editions/index.json');
const expected = atlasModel(places, manifest).directory.map(p => p.id);
const baselineRef = process.env.ATLAS_QA_BASELINE || 'HEAD';
const baseline = file => execFileSync('git', ['show', `${baselineRef}:rupert/assets/js/core/${file}`], { cwd: root, encoding: 'utf8' });
const provider = await readFile(resolve(root, 'rupert/assets/js/map/maplibre-provider.js'), 'utf8');
// Expose the unmodified provider API only inside the test browser, so marker clicks use actual projection.
const instrumentedProvider = provider.replace('export async function createMap(', 'async function createMapForTest(')
  + '\nexport async function createMap(...args){const map=await createMapForTest(...args);window.__directoryMap=map;return map;}';
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png', '.woff': 'font/woff', '.woff2': 'font/woff2', '.otf': 'font/otf' };
const server = createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (path.split('/').some(p => p.startsWith('_') || p.startsWith('.'))) throw Error('Private');
    let file = resolve(root, '.' + path);
    if (!file.startsWith(root)) throw Error('Outside root');
    if ((await stat(file)).isDirectory()) file = resolve(file, 'index.html');
    res.setHeader('Content-Type', mime[extname(file)] || 'application/octet-stream');
    res.end(await readFile(file));
  } catch { res.writeHead(404); res.end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = process.env.ATLAS_QA_URL || `http://127.0.0.1:${server.address().port}/rupert/`;
const browser = await chromium.launch({ headless: true, executablePath: process.env.ATLAS_QA_CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const evidence = { base, map: 'Actual MapLibre provider and markers', physicalIPhone: false, checks: 0, layouts: [], errors: [] };
const check = (ok, message) => { assert.ok(ok, message); evidence.checks++; };
const order = page => page.locator('.reg-row').evaluateAll(rows => rows.map(row => row.dataset.place));
async function snapshot(page) {
  return page.locator('.reg-row').evaluateAll(rows => Object.fromEntries(rows.map(row => [row.dataset.place, {
    content: row.innerHTML,
    styles: ['.reg-select', '.reg-word', '.reg-latest', '.reg-details > summary'].map(selector => {
      const s = getComputedStyle(row.querySelector(selector));
      return ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'color', 'padding', 'margin'].map(k => s[k]);
    }),
  }]).sort(([a], [b]) => a.localeCompare(b))));
}
async function open(width, height, old = false) {
  const context = await browser.newContext({ viewport: { width, height }, isMobile: width < 760, hasTouch: width < 760, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const currentManifest = structuredClone(manifest);
  page.on('pageerror', e => evidence.errors.push(e.message));
  await page.route('**/data/editions/index.json*', r => r.fulfill({ json: currentManifest }));
  await page.route('**/map/maplibre-provider.js*', r => r.fulfill({ contentType: 'text/javascript', body: instrumentedProvider }));
  if (old) for (const file of ['atlas.js', 'render.js']) await page.route('**/core/' + file + '*', r => r.fulfill({ contentType: 'text/javascript', body: baseline(file) }));
  await page.goto(base + 'atlas/');
  if (await page.locator('.atlas-veil').isVisible()) await page.keyboard.press('Escape');
  await page.waitForFunction(() => document.querySelectorAll('.reg-row').length === 7 && window.__directoryMap && document.querySelector('#map-state').dataset.state === 'ready', null, { timeout: 45000 });
  await page.evaluate(() => document.fonts.ready);
  if (width < 1024) await page.locator('.directory-catalog > summary').click();
  await page.waitForFunction(() => [...document.querySelectorAll('.reg-details')].every(d => d.dataset.menuReady === 'true'));
  return { context, page, currentManifest };
}
try {
  for (const [width, height] of [[1440, 900], [1024, 768], [393, 852], [852, 393]]) {
    const old = await open(width, height, true), current = await open(width, height);
    const page = current.page;
    check(JSON.stringify(await order(page)) === JSON.stringify(expected), `${width}: chronological cards`);
    check(JSON.stringify(await snapshot(page)) === JSON.stringify(await snapshot(old.page)), `${width}: card content and styling preserved by place ID`);
    check(!await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), `${width}: no page overflow`);
    const picker = await page.locator('#place-picker option').evaluateAll(options => options.map(o => o.value).filter(Boolean));
    check(JSON.stringify(picker) === JSON.stringify(expected), `${width}: picker follows cards`);
    for (const id of expected) {
      const card = page.locator('#place-' + id);
      await card.locator('.reg-select').click();
      check(await card.getAttribute('aria-current') === 'true', `${id}: selected card`);
      check(await page.locator('#place-picker').inputValue() === id, `${id}: picker synchronized`);
      check(await page.evaluate(id => window.__directoryMap.raw.getFilter('marks-sel')[2] === id, id), `${id}: actual marker selected`);
      check(await card.locator('.reg-latest').getAttribute('href') === '../edition/' + atlasModel(places, manifest).statuses.get(id).editions[0].id + '/', `${id}: latest edition link`);
      await card.locator('.reg-details > summary').click();
      check(await card.locator('.reg-dossier').isVisible(), `${id}: details accessible`);
      await card.locator('.reg-details > summary').press('Escape');
    }
    // A real rendered map-marker click selects its card, including after chronology changed DOM order.
    const id = expected[0];
    await page.evaluate(id => window.__directoryMap.focus(id), id);
    await page.waitForFunction(id => window.__directoryMap.raw.queryRenderedFeatures({ layers: ['marks'] }).some(f => f.properties.id === id), id);
    await page.locator('#map').scrollIntoViewIfNeeded();
    const canvasPoint = await page.evaluate(id => {const f=window.__directoryMap.raw.queryRenderedFeatures({layers:['marks']}).find(f=>f.properties.id===id);const p=window.__directoryMap.raw.project(f.geometry.coordinates);return {x:p.x,y:p.y};}, id);
    await page.locator('#map canvas').click({ position: canvasPoint });
    check(await page.locator('#place-' + id).getAttribute('aria-current') === 'true', `${width}: actual marker-to-directory selection`);
    await page.locator('.atlas-register').scrollIntoViewIfNeeded();
    if (width >= 1024) {
      await page.locator('.directory-list').evaluate(list => { list.scrollLeft = list.scrollWidth; });
      check(await page.locator('.reg-row').last().evaluate(row => {const r=row.getBoundingClientRect(),list=document.querySelector('.directory-list').getBoundingClientRect();return r.right<=list.right+1&&r.left>=list.left-1;}), `${width}: horizontal navigation reaches oldest card`);
      await page.locator('.directory-list').evaluate(list => { list.scrollLeft = 0; });
    }
    await page.locator('.atlas-register').screenshot({ path: resolve(output, `directory-${width}.png`) });
    // Exercise the existing refresh path: a new release automatically moves a repeat to the front.
    const repeat = { ...manifest.editions.at(-1), id: 'qa-repeat-only', status: 'draft',
      published_at: new Date().toISOString(), place_roles: [{ place_id: 'umstead-company-mill', role: 'flagship' }] };
    current.currentManifest.editions.push(repeat);
    let response = page.waitForResponse('**/data/editions/index.json');
    await page.evaluate(() => window.dispatchEvent(new Event('pageshow'))); await response;
    check((await order(page))[0] === expected[0], `${width}: draft cannot reorder cards`);
    repeat.status = 'published';
    response = page.waitForResponse('**/data/editions/index.json');
    await page.evaluate(() => window.dispatchEvent(new Event('pageshow'))); await response;
    await page.waitForFunction(() => document.querySelector('.reg-row').dataset.place === 'umstead-company-mill');
    check((await order(page)).length === 7, `${width}: released repeat stays one unique card`);
    check(await page.locator('#place-umstead-company-mill .reg-latest').getAttribute('href') === '../edition/qa-repeat-only/', `${width}: refreshed latest link`);
    check(await page.locator('#place-' + id).getAttribute('aria-current') === 'true', `${width}: refresh preserves selection`);
    check(await page.evaluate(id => window.__directoryMap.raw.getFilter('marks-sel')[2] === id, id), `${width}: refresh preserves marker selection`);
    evidence.layouts.push({ width, height, places: expected.length });
    await old.context.close(); await current.context.close();
  }
  check(evidence.errors.length === 0, 'No page script errors');
  await writeFile(resolve(output, 'results.json'), JSON.stringify(evidence, null, 2));
  console.log(`${evidence.checks} chronological Directory browser assertions PASS; actual MapLibre, four desktop/mobile layouts.`);
} finally { await browser.close(); await new Promise(r => server.close(r)); }
