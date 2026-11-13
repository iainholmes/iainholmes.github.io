'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const playwright = require(process.env.LL_PLAYWRIGHT || 'playwright');
const engine = process.env.LL_BROWSER || 'chromium';
const origin = process.env.LL_ORIGIN || 'http://127.0.0.1:8765';
const journalUrl = origin + '/weekly-economics-environment/';
const date = '2026-11-06';
const source = fs.readFileSync('weekly-economics-environment/index.html', 'utf8');
const companionBlock = /(<script type="application\/json" id="companion-data">)([\s\S]*?)(<\/script>)/;
const companions = JSON.parse(source.match(companionBlock)[2]);
const directory = JSON.parse(source.match(/id="ll-reading-index-data">([\s\S]*?)<\/script>/)[1]);
const issue = directory.editions.find(edition => edition.date === date);
const active = '.edition:not([hidden])';
const button = '.heron-perch';
const dismissed = 'economics-environment:companion:dismissed';

function fixture(positions, suffix) {
  return {
    enabled: true,
    appearances: positions.map(position => ({
      id: 'heron-fixture-' + suffix + '-' + position,
      target: issue.readings[position - 1].id,
      type: 'method',
      title: 'A fixture about the evidence in Reading ' + position,
      text: 'Private test note. Check what the observed measure captures and whether a comparison supports the proposed interpretation.',
      diagram: 'counterfactual',
      see: { href: 'notebook/#counterfactual-reasoning', label: 'Counterfactual reasoning' }
    }))
  };
}

async function run() {
  const browser = await playwright[engine].launch({
    headless: true,
    ...(process.env.LL_CHROME ? { executablePath: process.env.LL_CHROME } : {})
  });
  const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
  const errors = [];
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  let assertions = 0;
  function equal(actual, expected, label) {
    assert.deepEqual(actual, expected, label);
    assertions++;
  }
  function check(value, label) {
    assert(value, label);
    assertions++;
  }
  await context.route('**/*', route => route.request().url().startsWith(origin + '/') ? route.continue() : route.abort());
  let fixtureData;
  await page.route(url => url.origin === origin && url.pathname === '/weekly-economics-environment/', route => {
    if (!fixtureData) return route.continue();
    const { [date]: _published, ...others } = companions;
    const data = fixtureData === 'missing' ? others : { ...others, [date]: fixtureData };
    const body = source.replace(companionBlock, (_, open, _data, close) => open + JSON.stringify(data) + close);
    return route.fulfill({ contentType: 'text/html; charset=utf-8', body });
  });

  async function settle() {
    await page.evaluate(async () => {
      await document.fonts.ready;
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });
  }
  let visit = 0;
  async function load(anchor, data) {
    fixtureData = data;
    await page.goto(journalUrl + '?heron-test=' + (++visit) + '#' + anchor, { waitUntil: 'load' });
    await page.locator('body[data-layout-ready="true"]').waitFor();
    await settle();
  }
  async function positions() {
    return page.locator(active + ' ' + button + ':visible').evaluateAll(buttons => buttons.map(el => {
      const reading = el.closest('.entry');
      return [...reading.closest('.edition').querySelectorAll('.entry')].indexOf(reading) + 1;
    }));
  }
  async function checkGeometry(locator, label) {
    const geometry = await locator.evaluate(el => {
      const rect = el.getBoundingClientRect();
      const reading = el.closest('.article-grid').getBoundingClientRect();
      return {
        fits: rect.width > 0 && rect.height > 0 && rect.left >= reading.left - 1 && rect.right <= reading.right + 1,
        readable: rect.left >= 0 && rect.right <= innerWidth + 1 && el.scrollWidth <= el.clientWidth + 2,
        dock: el.closest('.ll-heron-dock')?.closest('.entry') === el.closest('.entry')
      };
    });
    equal(geometry, { fits: true, readable: true, dock: true }, label);
  }
  async function screenshot(name, locator) {
    if (!process.env.LL_QA_SHOTS_DIR) return;
    fs.mkdirSync(process.env.LL_QA_SHOTS_DIR, { recursive: true });
    await locator.screenshot({ path: path.join(process.env.LL_QA_SHOTS_DIR, name + '.png'), animations: 'disabled' });
  }
  try {
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 900 });
      const expected = [[1, 4], [1, 3], [1, 2], [1, 3], [1, 2], [1], []];
      for (const [i, edition] of directory.editions.slice(0, expected.length).entries()) {
        await load('edition-' + edition.date);
        equal(await positions(), expected[i], 'published Issue ' + edition.number + ' at ' + width + 'px');
      }
      for (let position = 1; position <= 5; position++) {
        await load('edition-' + date, fixture([position], 'single'));
        equal(await positions(), [position], 'single authored note at position ' + position + ', ' + width + 'px');
        const perch = page.locator(active + ' ' + button + ':visible');
        await checkGeometry(perch, 'perch stays in reading ' + position + ', ' + width + 'px');
        equal(await perch.getAttribute('aria-expanded'), 'false', 'note starts closed');
      }
      for (const data of ['missing', { enabled: false, appearances: [] }, { enabled: true, appearances: [] }]) {
        await load('edition-' + date, data);
        equal(await positions(), [], 'silent issue at ' + width + 'px');
        equal(await page.locator(active + ' .ll-heron-dock:visible').count(), 0, 'silence leaves no visible dock');
      }
    }

    const data = fixture([5, 2], 'pair');
    const [fifth, second] = data.appearances.map(note => page.locator('#heron-' + note.id));
    await load('edition-' + date, data);
    for (const [width, expected] of [[1024, [2, 5]], [1025, []], [1180, []], [1181, [2, 5]], [1440, [2, 5]], [390, [2, 5]]]) {
      await page.setViewportSize({ width, height: 900 });
      await settle();
      equal(await positions(), expected, 'breakpoint and authored order at ' + width + 'px');
    }
    for (const [width, theme] of [[1440, 'day'], [390, 'night']]) {
      await page.setViewportSize({ width, height: 900 });
      await page.locator('.dn button[data-mode="' + theme + '"]').click();
      await settle();
      await second.locator(button).press('Enter');
      check(await second.locator('.heron-panel').isVisible(), 'keyboard opens later reading in ' + theme);
      await fifth.locator(button).click();
      check(!(await second.locator('.heron-panel').isVisible()), 'opening a second note collapses the first');
      check(await fifth.locator('.pose-inspect').isVisible(), 'open note shows the inspecting pose');
      await checkGeometry(fifth.locator('.heron-panel'), 'expanded note stays inside its reading in ' + theme);
      await screenshot('heron-reading-five-' + theme + '-' + width, fifth);
      await page.keyboard.press('Escape');
      equal(await fifth.locator(button).getAttribute('aria-expanded'), 'false', 'Escape closes the note');
      check(await fifth.locator(button).evaluate(el => document.activeElement === el), 'Escape returns focus');
    }

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.locator('#glance-mode').click();
    equal(await positions(), [], 'At a Glance is quiet');
    await page.locator('#full-mode').click();
    equal(await positions(), [2, 5], 'full mode restores both notes');
    await load('heron-' + data.appearances[1].id, data);
    check(await second.locator('.heron-panel').isVisible(), 'direct link opens the second registry entry on desktop');
    check(await second.locator('.hp-actions a[href="notebook/#counterfactual-reasoning"]').isVisible(), 'notebook link is available');
    await second.locator('.hp-close').click();
    await settle();
    check(!(await second.locator('.heron-panel').isVisible()), 'Commonplace rescan does not reopen a closed deep link');
    await second.locator(button).click();
    await second.locator('.hp-dismiss').click();
    await settle();
    equal(await positions(), [5], 'dismissal affects only the selected note');
    await page.reload({ waitUntil: 'load' });
    await settle();
    equal(await positions(), [5], 'dismissal persists even when reloading its deep link');
    equal(await page.evaluate(key => JSON.parse(localStorage.getItem(key)), dismissed), [data.appearances[1].id], 'dismissal uses the stable note ID');
    equal(errors, [], 'no browser script errors');
    console.log(engine + ': ' + assertions + ' Heron placement, rendering, silence and interaction checks passed.');
  } finally {
    await browser.close();
  }
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
