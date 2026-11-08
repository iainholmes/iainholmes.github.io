'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const archive=require('../personal-updates/issue-mark-archive.js');
const marks=require('../personal-updates/issue-marks.js');
const art=require('../daily-watchlist-5/artwork.js');
const old=archive['fb:2026-11-06'],current=archive['fb:2026-11-07'];
assert(old&&current,'Existing and corrected cover pins must exist');
assert.equal(current.no,'042');
assert.equal(current.date,'2026-11-07');
assert.equal(current.composition,'authored-signal-and-reserve-20261107');
assert.equal(current.phrase,'Signals and scarcity');
assert.equal(current.frozen,marks.svg({...current,frozen:null}), 'Frozen cover must reproduce exactly from its authored original geometry');
assert.equal(art.validateIssue(current,archive).ok,true,'Full existing cross-history originality gate must pass');
const similarity=art.visualSimilarity(art.issueFeatures(current),art.issueFeatures(old));
assert(similarity<0.72,'Current cover is still too visually close to yesterday\'s: '+similarity);
assert.notEqual(current.geometry,old.geometry);
assert(!current.geometry.includes('service-rack'));
assert(current.geometry.includes('<circle')&&current.geometry.includes('stroke="$accent"'),'An original integral price-signal / reserve motif must exist');
const attemptedReuse={...current,composition:'study-novel-service-rack'};
const rejected=art.issueTreatment(attemptedReuse,archive);
assert.equal(rejected.ok,false,'Future cover rule must reject reuse of a single prominent recent motif');
assert(/reused distinctive motif/.test(rejected.reason),'Expected stronger distinctness safeguard');
const hub=fs.readFileSync(require('node:path').join(__dirname,'../personal-updates/index.html'),'utf8');
const currentHubEdition=hub.match(/data-issue-mark="fb" data-edition="(\d{4}-\d{2}-\d{2})"/)?.[1];
assert(currentHubEdition&&currentHubEdition>='2026-11-07','Landing page cannot regress to an older edition');
if(currentHubEdition==='2026-11-07')assert(hub.includes(current.frozen),'Latest Issue 042 cover must use its corrected frozen artwork');
else {
  assert(archive['fb:'+currentHubEdition]?.frozen,'Newer current hub cover must be archived');
  assert(hub.includes(archive['fb:'+currentHubEdition].frozen),'Newer cover must match its own frozen archive');
}
assert(!hub.includes(old.frozen),'Current landing page must not display previous Issue 041 artwork');
assert(/issue-mark-archive\.js\?v=[^"\s]+/.test(hub),'Landing page must version its issue-mark archive');
assert(!hub.includes('issue-mark-archive.js?v=2026-11-07_2026-11-06_2026-10-30_3da3e2b2a9d5'),'The previous cached original-artwork archive key must be invalidated');
for(const [key,m] of Object.entries(archive)){if(key.startsWith('fb:')&&key!=='fb:2026-11-07')assert.notEqual(m.frozen,current.frozen,'Cover repeated '+key)}
console.log('Field Brief Issue 042 original cover passes renderer, archival, recent-motif, visual separation and live-hub source checks; similarity to 041 = '+similarity.toFixed(4));
