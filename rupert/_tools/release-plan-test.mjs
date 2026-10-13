import assert from 'node:assert/strict';
import { cp, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { releasePlan, missingReleaseMessage } from './release-plan.mjs';
const at = time => new Date(`2026-10-13T${time}-04:00`);
const ed = (slot, status='draft', start='2026-10-17') => ({slot,status,weekend:{start},published_at:'2026-10-13T07:00:00-04:00'});
assert.deepEqual(releasePlan([],at('06:57:39')).missing,[]);
assert.equal(releasePlan([],at('06:57:39')).next.at.toISOString(),'2026-10-13T11:00:00.000Z');
for (const time of ['07:00:00','08:00:00','09:00:00']) assert.deepEqual(releasePlan([],at(time)).missing,['tuesday']);
assert.deepEqual(releasePlan([ed('tuesday')],at('08:00:00')).missing,[]);
assert.deepEqual(releasePlan([ed('tuesday','published')],at('08:00:00')).missing,[]);
// Existing withdrawal notices remain released history; no automatic replacement is invented.
assert.deepEqual(releasePlan([ed('tuesday','withdrawn')],at('08:00:00')).missing,[]);
assert.deepEqual(releasePlan([ed('tuesday','published','2026-10-10')],at('08:00:00')).missing,['tuesday']);
assert.deepEqual(releasePlan([ed('thursday')],at('08:00:00')).missing,['tuesday']);
assert.deepEqual(releasePlan([ed('tuesday','published')],new Date('2026-10-15T06:59:59-04:00')).missing,[]);
assert.deepEqual(releasePlan([ed('tuesday','published')],new Date('2026-10-15T07:00:00-04:00')).missing,['thursday']);
assert.deepEqual(releasePlan([ed('thursday')],new Date('2026-10-15T08:00:00-04:00')).missing,['tuesday']);
assert.deepEqual(releasePlan([],new Date('2026-10-19T08:00:00-04:00')).missing,[]);
assert.equal(releasePlan([],new Date('2026-11-03T06:57:00-05:00')).next.at.toISOString(),'2026-11-03T12:00:00.000Z');
assert.deepEqual(releasePlan([],new Date('2026-11-03T07:00:00-05:00')).missing,['tuesday']);
assert.match(missingReleaseMessage(releasePlan([],at('08:00:00'))),/publication is due.*no prepared draft/);
// Exercise the real CLI with its real clock in a disposable, public-only fixture.
// No override, force option or production data mutation is introduced for testing.
const scratch = await mkdtemp(join(tmpdir(),'atlas-release-plan-'));
const fixture = join(scratch,'rupert');
try {
  const source = fileURLToPath(new URL('../',import.meta.url));
  await cp(source,fixture,{recursive:true,filter:path=>!path.includes('/_private')});
  await cp(fileURLToPath(new URL('../../assets/identity/',import.meta.url)),join(scratch,'assets/identity'),{recursive:true});
  const now = new Date(), plan = releasePlan([],now);
  const dir = join(fixture,'data/editions');
  const pins=JSON.parse(await readFile(join(fixture,'data/artwork-locks.json'),'utf8'));
  const photos=JSON.parse(await readFile(join(fixture,'data/photos.json'),'utf8'));
  for (const f of await readdir(dir)) {
    if (!/^\d{4}-W\d{2}-(?:r\d+-)?(tue|thu)\.json$/.test(f)) continue;
    const data = JSON.parse(await readFile(join(dir,f),'utf8'));
    if (data.weekend.start === plan.weekend.start) {await rm(join(dir,f));delete pins.editions[data.id];const id=data.flagship.artwork?.image_id||data.flagship.photo?.id;const record=photos.photos.find(p=>p.id===id);if(record)delete record.plate_no;}
  }
  await writeFile(join(fixture,'data/artwork-locks.json'),JSON.stringify(pins));
  await writeFile(join(fixture,'data/photos.json'),JSON.stringify(photos));
  const before = await readFile(join(fixture,'data/release-log.json'),'utf8');
  for (const args of [['release'],['release','--apply']]) {
    const run = spawnSync(process.execPath,[join(fixture,'_tools/publish.mjs'),...args],{encoding:'utf8'});
    assert.equal(run.status,plan.missing.length ? 1 : 0,run.stdout+'\n'+run.stderr);
    if (plan.missing.length) assert.match(run.stderr,/publication is due but no prepared draft/);
    else assert.match(run.stdout,/Next slot:/);
    assert.equal(await readFile(join(fixture,'data/release-log.json'),'utf8'),before);
  }
} finally { await rm(scratch,{recursive:true,force:true}); }
console.log('17 release-plan assertions and real-clock dry-run/apply missing-slot CLI checks passed.');
