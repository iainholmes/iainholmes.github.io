'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {parseJSON} = require('./periodicals-publication-watchdog.cjs');
const {hubIssue, matchesHubIssue, renderHub} = require('../personal-updates/issue-marks.js');
const pins = require('../personal-updates/issue-mark-archive.js');
const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const hub = read('personal-updates/index.html');
const journal = read('weekly-economics-environment/index.html');
const current = {
  fb: parseJSON(read('daily-watchlist-5/index.html'), 'briefing-data').editions,
  sp: parseJSON(journal, 'll-reading-index-data').editions,
  cp: parseJSON(read('daily-econ-challenge/index.html'), 'challenge-data').editions,
  registerCount: parseJSON(journal, 'field-register').entries.length
};
const artwork = svg => svg.slice(svg.indexOf('<desc>'), svg.indexOf('<path d="M42 570H558"'));
const date = '2027-01-08';
const longTitle = 'How measurement changes what we know about household adaptation, regional exposure, and environmental enforcement';
const next = structuredClone(current);
const nextPins = {...pins};
assert.equal(renderHub(hub, current), hub, 'current hub can be rebuilt byte for byte');
for (const key of ['fb', 'sp', 'cp']) {
  const published = hubIssue(key, current[key]);
  assert(matchesHubIssue(hub, published));
  assert.equal(artwork(published.cover), artwork(published.pin.frozen), 'cover uses the exact pinned illustration');
  assert(!matchesHubIssue(hub.replace(published.cover, published.pin.frozen), published), 'stale embedded caption is rejected');
  const previous = next[key].at(-1);
  const serial = String(next[key].length+1).padStart(3,'0');
  // This fixture exercises hub rendering after preparation has validated the pin.
  // No editorial content or test artwork is published.
  const newEdition = {...previous, date};
  if (key==='fb') newEdition.issueTitle = longTitle;
  if (key==='sp') Object.assign(newEdition, {title:longTitle, number:'001'});
  if (key==='cp') newEdition.no = Number(serial);
  next[key].push(newEdition);
  const original = published.pin;
  nextPins[key+':'+date] = {...original, date, no:serial, frozen:original.frozen.replace(
    original.no+' / '+original.date, serial+' / '+date
  )};
}
assert.throws(()=>renderHub(hub,next,pins),/Missing or mismatched hub artwork/);
const nextHub = renderHub(hub,next,nextPins);
assert.equal(renderHub(nextHub,next,nextPins),nextHub,'retry leaves the same paired metadata');
for (const key of ['fb', 'sp', 'cp']) {
  const issue = hubIssue(key,next[key],nextPins);
  assert(matchesHubIssue(nextHub,issue));
  assert.equal(issue.date,date);
  assert.equal(issue.count,current[key].length+1);
  assert.equal(artwork(issue.cover),artwork(issue.pin.frozen));
  if (key!=='cp') assert(issue.cover.includes(longTitle));
}
assert(nextHub.includes('ISSUE 001 / '+date),'L&L uses its canonical annual number');
assert(nextHub.includes('N<sup>o</sup>. 001 · 8 Jan 2027'));
assert.equal(renderHub(hub,current),hub,'unavailable next edition leaves the published hub intact');
if (process.env.HUB_METADATA_FIXTURE) {
  const output = path.join(process.env.HUB_METADATA_FIXTURE,'personal-updates');
  fs.mkdirSync(output,{recursive:true});
  fs.writeFileSync(path.join(output,'index.html'),nextHub);
}
console.log('Current and future hub pairs, unchanged illustration bytes, annual numbering, stale captions, missing pins and retry passed.');
