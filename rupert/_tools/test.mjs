import { guidanceFor, artworkProblems } from '../assets/js/core/adventure.js';
import { rupertDay, cleanEntry, readLogBackup } from '../assets/js/core/field-log.js';
import { matchesOption, seasonFor } from '../assets/js/core/options.js';
import { cleanPlan, readBackup } from '../assets/js/core/travel.js';
import { validPoint, drivingRoute } from '../assets/js/core/routing.js';
import { readFileSync } from 'node:fs';
import { atlasStyle } from '../assets/js/map/style.js';
// Tests for edition selection and date handling. Run: node rupert/_tools/test.mjs
import assert from 'node:assert/strict';
import { selectCurrentPair, archiveGroups } from '../assets/js/core/editions.js';
import { isoWeek, nyInstant, weekendRange, minutesRange, hoursRange } from '../assets/js/core/dates.js';

import { renderArchive } from '../assets/js/core/render.js';

const ed = (id, slot, published_at, start, end, status = 'published') => ({ id, slot, status, published_at, weekend: { start, end } });
const W40 = [
  ed('2026-W39-tue', 'tuesday',  '2026-09-22T07:00:00-04:00', '2026-09-26', '2026-09-27'),
  ed('2026-W39-thu', 'thursday', '2026-09-24T07:00:00-04:00', '2026-09-26', '2026-09-27'),
  ed('2026-W40-tue', 'tuesday',  '2026-09-29T07:00:00-04:00', '2026-10-03', '2026-10-04'),
  ed('2026-W40-thu', 'thursday', '2026-10-01T07:00:00-04:00', '2026-10-03', '2026-10-04'),
];
const m = { editions: W40 };
const at = s => new Date(s);
let n = 0; const t = (name, fn) => { fn(); n++; console.log('ok', name); };

t('Tuesday 06:59 still shows last weekend, labelled past', () => {
  const p = selectCurrentPair(m, at('2026-09-29T06:59:00-04:00'));
  assert.equal(p.weekend.start, '2026-09-26'); assert.equal(p.state, 'past');
});
t('Tuesday 07:01 switches to the new weekend with Thursday pending', () => {
  const p = selectCurrentPair(m, at('2026-09-29T07:01:00-04:00'));
  assert.equal(p.tuesday.id, '2026-W40-tue'); assert.equal(p.thursday, null);
  assert.equal(p.state, 'upcoming');
  assert.equal(p.missing.thursday, new Date('2026-10-01T07:00:00-04:00').toISOString());
});
t('Thursday after publication shows both', () => {
  const p = selectCurrentPair(m, at('2026-10-01T08:00:00-04:00'));
  assert.equal(p.tuesday.id, '2026-W40-tue'); assert.equal(p.thursday.id, '2026-W40-thu');
});
t('Saturday is "now"', () => assert.equal(selectCurrentPair(m, at('2026-10-03T09:00:00-04:00')).state, 'now'));
t('Sunday 23:59 is still "now"', () => assert.equal(selectCurrentPair(m, at('2026-10-04T23:59:00-04:00')).state, 'now'));
t('Monday keeps the pair, labelled past', () => {
  const p = selectCurrentPair(m, at('2026-10-05T09:00:00-04:00'));
  assert.equal(p.weekend.start, '2026-10-03'); assert.equal(p.state, 'past');
});
t('drafts and future editions are ignored', () => {
  const p = selectCurrentPair({ editions: [...W40, ed('2026-W41-tue', 'tuesday', '2026-10-06T07:00:00-04:00', '2026-10-10', '2026-10-11', 'draft')] }, at('2026-10-07T09:00:00-04:00'));
  assert.equal(p.weekend.start, '2026-10-03');
});
t('missing Tuesday but Thursday published', () => {
  const p = selectCurrentPair({ editions: [W40[3]] }, at('2026-10-01T09:00:00-04:00'));
  assert.equal(p.tuesday, null); assert.equal(p.thursday.id, '2026-W40-thu');
});
t('nothing published returns null', () => assert.equal(selectCurrentPair({ editions: [] }, at('2026-10-01T09:00:00-04:00')), null));
t('DST end: Sunday 1 Nov 2026 weekend ends at local midnight', () => {
  const eds = { editions: [ed('2026-W44-tue', 'tuesday', '2026-10-27T07:00:00-04:00', '2026-10-31', '2026-11-01')] };
  assert.equal(selectCurrentPair(eds, at('2026-11-01T23:30:00-05:00')).state, 'now');
  assert.equal(selectCurrentPair(eds, at('2026-11-02T00:30:00-05:00')).state, 'past');
  assert.equal(nyInstant('2026-11-02').toISOString(), '2026-11-02T05:00:00.000Z');
});
t('ISO weeks incl. week 53', () => {
  assert.deepEqual(isoWeek('2026-09-29'), { year: 2026, week: 40 });
  assert.deepEqual(isoWeek('2026-12-31'), { year: 2026, week: 53 });
  assert.deepEqual(isoWeek('2027-01-01'), { year: 2026, week: 53 });
  assert.deepEqual(isoWeek('2027-01-04'), { year: 2027, week: 1 });
});
t('formatters', () => {
  assert.equal(weekendRange('2026-10-03', '2026-10-04'), 'Sat 3 – Sun 4 October');
  assert.equal(weekendRange('2026-10-31', '2026-11-01'), 'Sat 31 Oct – Sun 1 Nov');
  assert.equal(minutesRange([25, 35]), '25–35 min');
  assert.equal(minutesRange([100, 115]), '1 h 40 – 1 h 55');
  assert.equal(hoursRange([1.75, 2.5]), '2–2½ h');
});
const archiveAt = (manifest, time) => {
  const now = at(time);
  return renderArchive(archiveGroups(manifest, now), { base: '../', photos: { photos: [] }, now });
};
t('Archive pending Thursday uses the scheduled date and This Week label', () => {
  const html = archiveAt(m, '2026-09-29T12:00:00-04:00');
  assert.match(html, /Publishes Thu 1 Oct/);
  assert.match(html, /class="arch-now">This Week</);
  assert.doesNotMatch(html, /Not published|On This Week now/);
});
t('Archive changes at Thursday publication and retains past missing slots', () => {
  assert.match(archiveAt(m, '2026-10-01T06:59:59-04:00'), /Publishes Thu 1 Oct/);
  const live = archiveAt(m, '2026-10-01T07:00:00-04:00');
  assert.doesNotMatch(live, /Publishes Thu 1 Oct/);
  assert.match(live, /edition\/2026-W40-thu\//);
  const missed = archiveAt({ editions: [W40[2]] }, '2026-10-05T12:00:00-04:00');
  assert.match(missed, /Not published/);
});
t('Archive computes new dates across DST and year boundaries', () => {
  const manifest = { editions: [ed('2026-W45-tue', 'tuesday', '2026-11-03T07:00:00-05:00', '2026-11-07', '2026-11-08')] };
  assert.match(archiveAt(manifest, '2026-11-03T08:00:00-05:00'), /Publishes Thu 5 Nov/);
  const year = { editions: [ed('2026-W53-tue', 'tuesday', '2026-12-29T07:00:00-05:00', '2027-01-02', '2027-01-03')] };
  assert.match(archiveAt(year, '2026-12-29T08:00:00-05:00'), /Publishes Thu 31 Dec/);
});
t('Archive matches all active filters against the same option', () => {
  const o={title:'Cox Mountain',place_name:'Eno River State Park',seasons:['spring','autumn'],experiences:['river','ridge']};
  assert.equal(matchesOption(o,{query:'eno mountain',season:'autumn',experience:'ridge'}),true);
  assert.equal(matchesOption(o,{season:'winter',experience:'ridge'}),false);
  assert.equal(matchesOption(o,{query:'company mill'}),false);
  assert.equal(matchesOption(o,{query:'  COX  ',experience:'short-walk'}),false);
});
t('Season boundaries use month in supplied New York date', () => {
  assert.equal(seasonFor('2026-02-28'),'winter');assert.equal(seasonFor('2026-03-01'),'spring');assert.equal(seasonFor('2026-06-01'),'summer');assert.equal(seasonFor('2026-09-01'),'autumn');assert.equal(seasonFor('2026-12-01'),'winter');
});
const plan={id:'tp_test',title:'Journey',dates:{start:'2026-10-03',end:'2026-10-04'},legs:[{seq:1,mode:'car',from:{label:'Chapel Hill'},to:{label:'Durham'}},{seq:2,mode:'air',from:{label:'RDU'},to:{label:'Boston'}}],manual_stops:[{leg:1,place_id:'eno-cox-mountain',note:'Creek walk'}]};
t('Travel backup round-trips all legs and manual driving stops', () => {
  const clean=cleanPlan(plan);assert.deepEqual(readBackup(JSON.stringify({schema_version:1,plans:[clean]})),[clean]);
});
t('Travel rejects bad imports, dates, stops on flights and duplicated identifiers', () => {
  assert.throws(()=>cleanPlan({...plan,dates:{start:'2026-10-04',end:'2026-10-03'}}));
  assert.throws(()=>cleanPlan({...plan,legs:[]}));
  assert.throws(()=>cleanPlan({...plan,manual_stops:[{leg:2,note:'Stop'}]}));
  assert.throws(()=>readBackup(JSON.stringify({schema_version:1,plans:[plan,plan]})));
  assert.throws(()=>readBackup(JSON.stringify({schema_version:2,plans:[plan]})));
  assert.deepEqual(cleanPlan({...plan,unapproved:'data'}),plan);
});
t('Home points reject non-numeric or out-of-range coordinates', () => {
  assert.equal(Boolean(validPoint({lat:'35',lng:-79})),false);assert.equal(Boolean(validPoint({lat:Infinity,lng:-79})),false);assert.equal(Boolean(validPoint({lat:90,lng:-79})),false);assert.equal(Boolean(validPoint({lat:35,lng:-79})),true);
});
t('Every suggestion has curated season and experience tags', () => {
  for(const id of ['2026-W40-tue','2026-W40-thu','2026-W41-tue','2026-W41-thu']) {
    const edition=JSON.parse(readFileSync(new URL(`../data/editions/${id}.json`,import.meta.url)));
    for(const role of ['flagship','local_trail','away_mission','wildcard']) {assert.ok(edition[role].seasons.length);assert.ok(edition[role].experiences.length);}
  }
});
t('Relief changes actual hillshade visibility and palettes differ from page', () => {
  for(const theme of ['light','dark']) {
    const off=atlasStyle(theme),on=atlasStyle(theme,{relief:true});assert.equal(off.layers.find(l=>l.id==='relief').layout.visibility,'none');assert.equal(on.layers.find(l=>l.id==='relief').layout.visibility,'visible');assert.equal(on.layers.find(l=>l.id==='relief').paint['hillshade-exaggeration'],0.85);
    assert.notEqual(on.layers[0].paint['background-color'],theme==='dark'?'#13232C':'#EFE2C8');
  }
});
const fakeRoute={code:'Ok',routes:[{duration:1200,distance:16093.44,geometry:{type:'LineString',coordinates:[[-79,35],[-78.9,35.1]]}}]};
const route=await drivingRoute({lat:35,lng:-79},{lat:35.1,lng:-78.9},{request:async(url)=>{assert.match(url,/route\/v1\/driving\/-79,35;-78.9,35.1/);return {ok:true,json:async()=>fakeRoute};}});
assert.equal(route.minutes,20);assert.equal(route.miles,'10.0');n++;console.log('ok Driving route returns road geometry, time and distance');
await assert.rejects(()=>drivingRoute({lat:35,lng:-79},{lat:35.1,lng:-78.9},{request:async()=>({ok:true,json:async()=>({code:'NoRoute'})})}));
await assert.rejects(()=>drivingRoute({lat:35,lng:-79},{lat:35.1,lng:-78.9},{request:async()=>({ok:false})}));n++;console.log('ok Route failure stays a failure, without fabricated geometry or duration');
t('Crowd tolerance uses perceived space and never treats unknown as quiet', () => {
  const option={title:'Forest',seasons:['winter'],experiences:['short-walk'],crowd:{typical_level:'Busy',perceived_crowding:'Low'}};
  assert.equal(matchesOption(option,{query:'forest',season:'winter',experience:'short-walk',crowd:'quiet'}),true);
  assert.equal(matchesOption({...option,crowd:null},{crowd:'quiet'}),false);
  assert.equal(matchesOption({...option,crowd:null},{crowd:'any'}),true);
  assert.equal(matchesOption({...option,crowd:{perceived_crowding:'Moderate'}},{crowd:'quiet'}),false);
  assert.equal(matchesOption({...option,crowd:{perceived_crowding:'Moderate'}},{crowd:'low_moderate'}),true);
  assert.equal(matchesOption(option,{season:'summer',crowd:'quiet'}),false);
});
t('Every published and future suggestion carries explicit unassessed crowd fields', () => {
  const keys=['typical_level','low_crowd_window','peak_period','weekend_vs_weekday','foot_traffic','dog_density','attendance','perceived_crowding'];
  for(const id of ['2026-W40-tue','2026-W40-thu','2026-W41-tue','2026-W41-thu']) {
    const ed=JSON.parse(readFileSync(new URL(`../data/editions/${id}.json`,import.meta.url)));
    for(const role of ['flagship','local_trail','away_mission','wildcard']) {assert.deepEqual(Object.keys(ed[role].snapshot.crowd).sort(),keys.slice().sort());assert.ok(Object.values(ed[role].snapshot.crowd).every(v=>v===null));}
  }
});
t('Context panels prioritize adverse conditions over a whimsical activity',()=>{
  const hot=guidanceFor({qualities:{activity:'pup-cup',expected_heat:'hot'},headline_condition:'Hot afternoon'});
  assert.equal(hot[1].label,'Keep in mind');assert.equal(hot[1].text,'Hot afternoon');
  assert.equal(guidanceFor({qualities:{activity:'pup-cup'}})[0].label,'The important stop');
  const frozen=[{label:'Look for',text:'An individually written detail.'},{label:'The window',text:'An individually verified time.'}];
  assert.deepEqual(guidanceFor({panels:frozen,condition_level:'adverse'}),frozen);
});
t('New suggestions cannot share or omit generated illustration ownership',()=>{
  const o={artwork:{image_id:'new',characters:['rupert']},panels:[{},{}]};
  const images={photos:[{id:'new',file:'new',kind:'plate',provenance:'editorial',generation:{owner:'2027-W01-tue/flagship'}}]};
  assert.deepEqual(artworkProblems({a:{id:'2027-W01-tue',flagship:o}},images),[]);
  assert.ok(artworkProblems({a:{id:'2027-W01-tue',flagship:o,local_trail:o}},images).some(x=>x.includes('already belongs')));
  assert.ok(artworkProblems({a:{id:'2027-W01-tue',flagship:{}}},images).length);
});
t('Travel postcards survive backup round-trip and reject external or executable images',()=>{
  const p=cleanPlan({...plan,postcard:{image:'data:image/jpeg;base64,YQ==',caption:'A journey imagined'}});
  assert.deepEqual(readBackup(JSON.stringify({schema_version:1,plans:[p]}))[0].postcard,p.postcard);
  assert.throws(()=>cleanPlan({...plan,postcard:{image:'https://example.com/photo.jpg',caption:'No'}}));
  assert.throws(()=>cleanPlan({...plan,postcard:{image:'data:image/svg+xml;base64,YQ==',caption:'No'}}));
});
t('Rupert Day starts and ends at Eastern midnight only on April 7',()=>{
  for(const year of [2027,2028]){
    assert.equal(rupertDay(new Date(`${year}-04-07T03:59:59Z`)),false);assert.equal(rupertDay(new Date(`${year}-04-07T04:00:00Z`)),true);
    assert.equal(rupertDay(new Date(`${year}-04-08T03:59:59Z`)),true);assert.equal(rupertDay(new Date(`${year}-04-08T04:00:00Z`)),false);
  }
});
t('Field Log validates memory dates, local photos and backup duplicates',()=>{
  const e=cleanEntry({id:'fl_test',date:'2027-04-07',place:'River',activity:'Walk',source:'unplanned',notes:'Our day'});
  assert.equal(e.season,'spring');assert.deepEqual(readLogBackup(JSON.stringify({version:1,entries:[e]})),[e]);
  assert.throws(()=>cleanEntry({...e,date:'2027-02-30'}));assert.throws(()=>cleanEntry({...e,photos:['https://example.com/photo.jpg']}));
  assert.throws(()=>readLogBackup(JSON.stringify({version:1,entries:[e,e]})));
});
console.log(`${n} tests passed`);
