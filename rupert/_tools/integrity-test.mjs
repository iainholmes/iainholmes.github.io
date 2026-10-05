import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {crowdReadings, CROWD_LEVELS} from '../assets/js/core/crowds.js';
import {crowdVisual} from '../assets/js/core/render.js';
import {currentAlmanac, dailyAlmanac, moonGlyph} from '../assets/js/core/almanac.js';
import {nyInstant, nyDateString, nyOffsetMinutes, longDate, shortDate} from '../assets/js/core/dates.js';
import {veilState} from '../assets/js/core/veil.js';
import {renderVeil} from '../assets/js/veil-view.js';
const json=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url)));
const manifest=json('data/editions/index.json'),photos=json('data/photos.json');
let checks=0;const check=fn=>{fn();checks++;};
for(const crowd of [undefined,null,{}, {typical_level:null,perceived_crowding:null}, {typical_level:0,perceived_crowding:'Unverified'}]){
  const html=crowdVisual(crowd),state=crowdReadings(crowd);
  check(()=>assert.deepEqual(state,{typical:null,perceived:null,facts:[]}));
  check(()=>assert.equal((html.match(/Not recorded/g)||[]).length,2));
  check(()=>assert.doesNotMatch(html,/crowd-scale|is-observed|Quiet<|Busy</));
  check(()=>assert.match(html,/No crowd data recorded/));
}
for(const [index,value] of CROWD_LEVELS.entries()){
  const crowd={typical_level:value,perceived_crowding:value},html=crowdVisual(crowd);
  check(()=>assert.deepEqual(crowdReadings(crowd).typical,{value,index}));
  check(()=>assert.equal((html.match(/class="is-observed"/g)||[]).length,2));
  check(()=>assert.equal((html.match(/class="crowd-scale"/g)||[]).length,2));
  check(()=>assert.doesNotMatch(html,/Not recorded|No crowd data recorded/));
}
for(const crowd of [{typical_level:'Low',perceived_crowding:'Very Busy'},{typical_level:'Busy',perceived_crowding:null},{typical_level:null,perceived_crowding:'Moderate'}]){
  const state=crowdReadings(crowd),html=crowdVisual(crowd),available=Number(!!state.typical)+Number(!!state.perceived);
  check(()=>assert.equal((html.match(/class="is-observed"/g)||[]).length,available));
  check(()=>assert.equal((html.match(/class="crowd-scale"/g)||[]).length,available));
  check(()=>assert.equal((html.match(/Not recorded/g)||[]).length,2-available));
  check(()=>assert.doesNotMatch(html,/No crowd data recorded/));
}
check(()=>assert.deepEqual(crowdReadings({attendance:0,foot_traffic:'Recorded foot traffic'}).facts,[['Attendance',0],['Foot traffic','Recorded foot traffic']]));
check(()=>assert.doesNotMatch(crowdVisual({foot_traffic:'Recorded foot traffic'}),/No crowd data recorded/));
check(()=>assert.match(crowdVisual({typical_level:'Low',foot_traffic:'<script>'}),/&lt;script&gt;/));
for(const e of manifest.editions){
  const edition=json(e.path);
  for(const role of ['flagship','local_trail','away_mission','wildcard'])check(()=>assert.deepEqual(crowdReadings(edition[role].snapshot.crowd),{typical:null,perceived:null,facts:[]}));
}
// Expected date/value snapshots protect against accidentally reusing recommendation Saturday.
const days=[
  ['2026-10-05','6:56 PM','Waning Crescent','11h 43m'],
  ['2026-10-06','6:54 PM','Waning Crescent','11h 40m'],
  ['2026-10-07','6:53 PM','Waning Crescent','11h 38m'],
  ['2026-10-08','6:52 PM','Waning Crescent','11h 36m'],
  ['2026-10-31','6:23 PM','Last Quarter','10h 46m'],
  ['2026-11-01','5:22 PM','Last Quarter','10h 44m'],
  ['2026-03-07','6:16 PM','Waning Gibbous','11h 36m'],
  ['2026-03-08','7:17 PM','Waning Gibbous','11h 38m'],
  ['2026-12-31','5:11 PM','Last Quarter','9h 45m'],
  ['2027-01-01','5:12 PM','Last Quarter','9h 46m']
];
for(const [date,sunset,moon,daylight] of days){
  const now=nyInstant(date,'06:59:00'),almanac=currentAlmanac(now);
  check(()=>assert.deepEqual(almanac,{date,sunset,moon,daylight}));
  check(()=>assert.deepEqual(almanac,dailyAlmanac(date)));
  // Keep a valid recommendation cycle: the almanac must follow now independently of it.
  const html=renderVeil(veilState(manifest,nyInstant('2026-10-05','12:00:00')),photos,'',null,now);
  check(()=>assert.ok(html.includes(`Chapel Hill, N.C. · ${longDate(date).split(' ')[0]} ${shortDate(date).split(' ').slice(1).join(' ')}`)));
  check(()=>assert.ok(html.includes(`Calculated almanac for Chapel Hill, ${longDate(date)}`)));
  check(()=>assert.ok(html.includes(sunset+' ET')&&html.includes(moon)&&html.includes(daylight)));
}
for(const [instant,date] of [['2026-10-06T03:59:59Z','2026-10-05'],['2026-10-06T04:00:00Z','2026-10-06'],['2027-01-01T04:59:59Z','2026-12-31'],['2027-01-01T05:00:00Z','2027-01-01']])check(()=>assert.equal(currentAlmanac(new Date(instant)).date,date));
check(()=>assert.deepEqual(currentAlmanac(new Date('2026-11-01T01:30:00-04:00')),currentAlmanac(new Date('2026-11-01T01:30:00-05:00'))));
for(const [date,offset] of [['2026-03-07',-300],['2026-03-08',-240],['2026-10-31',-240],['2026-11-01',-300]])check(()=>assert.equal(nyOffsetMinutes(nyInstant(date,'18:00:00')),offset));
check(()=>assert.equal(nyDateString(nyInstant('2026-10-05','12:00:00')),'2026-10-05'));
const phases=[['2026-10-09','New Moon'],['2026-10-12','Waxing Crescent'],['2026-10-16','First Quarter'],['2026-10-20','Waxing Gibbous'],['2026-10-24','Full Moon'],['2026-10-01','Waning Gibbous'],['2026-10-02','Last Quarter'],['2026-10-05','Waning Crescent']];
for(const [date,phase] of phases){
  const now=nyInstant(date,'12:00:00'),almanac=currentAlmanac(now);
  check(()=>assert.equal(almanac.moon,phase));
  const html=renderVeil(veilState(manifest,nyInstant('2026-10-05','12:00:00')),photos,'',null,now);
  check(()=>assert.ok(html.includes(moonGlyph(phase))&&html.includes(`<dd>${phase}</dd>`)));
}
check(()=>assert.equal(new Set(phases.map(([,phase])=>moonGlyph(phase))).size,8));
check(()=>assert.match(moonGlyph('New Moon'),/<circle[^>]+r="8"[^>]+fill="none"/));
check(()=>assert.doesNotMatch(moonGlyph('New Moon'),/fill="currentColor"/));
check(()=>assert.match(moonGlyph('Full Moon'),/fill="currentColor"/));
for(const phase of ['Waxing Crescent','First Quarter','Waxing Gibbous'])check(()=>assert.match(moonGlyph(phase),/A8 8 0 0 1 12 20/));
for(const phase of ['Waning Crescent','Last Quarter','Waning Gibbous'])check(()=>assert.match(moonGlyph(phase),/A8 8 0 0 0 12 20/));
check(()=>assert.match(moonGlyph('Waxing Crescent'),/Q24 12/));
check(()=>assert.match(moonGlyph('Waning Crescent'),/Q0 12/));
check(()=>assert.match(moonGlyph('Waxing Gibbous'),/Q0 12/));
check(()=>assert.match(moonGlyph('Waning Gibbous'),/Q24 12/));
check(()=>assert.equal(moonGlyph('Unverified'),''));
console.log(`${checks} crowd/almanac integrity assertions PASS (categorical fixtures; Eastern calendar/DST).`);
