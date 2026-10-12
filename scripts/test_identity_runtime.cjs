// Execute the real Field Brief renderer for every edition, including first/last.
// This tests rendered HTML and event behavior, not browser layout.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const {execFileSync} = require('node:child_process');
const file = 'daily-watchlist-5/index.html';
const current = fs.readFileSync(file, 'utf8');
const baseline = execFileSync('git', ['show', 'f74d6a4539d194c014256a50ce311d0c9028b0f0:' + file], {encoding: 'utf8'});
const data = JSON.parse(current.match(/<script type="application\/json" id="briefing-data">([\s\S]*?)<\/script>/)[1]);
const editions = data.editions;
assert(Array.isArray(editions) && editions.length > 1);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function renderer(source) {
  const events = [];
  const context = {
    ordered: editions, esc, INKS: ['--ink'], stopReadingPosition() {},
    issueLabel: ed => String(ed.no), issueNumber: ed => ed.no,
    modeHTML: () => '<span>Day / Night</span>', dayName: () => 'Sunday',
    storyHTML: (ed, s) => `<section id="story-${esc(s.number)}">${esc(s.title)}</section>`,
    mount: {innerHTML: '', querySelectorAll: () => []},
    document: {title: '', querySelectorAll: () => []},
    window: {dispatchEvent: e => events.push(e), scrollTo() {}},
    CustomEvent: class { constructor(type, init) {this.type = type; this.detail = init.detail;} },
  };
  vm.createContext(context);
  vm.runInContext(source.slice(source.indexOf('  function render(ed,storyNo)'), source.indexOf('  /* ---- day / night')), context);
  return {context, events};
}
const before = renderer(baseline), after = renderer(current);
for (const edition of editions) {
  before.context.render(edition);
  after.context.render(edition);
  const html = after.context.mount.innerHTML;
  assert.equal((html.match(/class="ih-personal-mark"/g) || []).length, 1);
  assert(html.indexOf('ih-edition-colophon') > html.indexOf('aria-label="Adjacent editions"'));
  assert.equal(html.replace(/    <footer class="ih-edition-colophon">.*?<\/footer>\n/, ''), before.context.mount.innerHTML);
  const event = after.events.at(-1);
  assert.equal(event.type, 'periodicals:edition');
  assert.equal(event.detail.current, edition.date);
  assert.equal(event.detail.hash(edition.date), '#' + edition.date);
}
console.log(`${editions.length} Field Brief editions rendered: one signature after navigation; original content, links and edition events preserved.`);
