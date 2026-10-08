#!/usr/bin/env node
// Canonical guarded release/forecast refresh. Actual clock only; no production clock override.
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { releaseProblem } from '../assets/js/core/publication.js';
import { fetchWeekendForecast, unavailableForecast } from '../assets/js/core/forecast.js';
import { nyTimestamp } from '../assets/js/core/dates.js';
import { expectedPublish } from '../assets/js/core/editions.js';
import { cycleWeekend } from '../assets/js/core/cycles.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = async p => JSON.parse(await readFile(resolve(root,p),'utf8'));
const optional = async (p, fallback) => { try { return await read(p); } catch (e) { if (e.code === 'ENOENT') return fallback; throw e; } };
const write = (p, data) => writeFile(resolve(root,p),JSON.stringify(data,null,2)+'\n');
const check = () => { const p = spawnSync(process.execPath,[resolve(root,'_tools/rupert.mjs'),'check'],{stdio:'inherit'}); if (p.status !== 0) throw Error('Atlas validation failed; nothing may be released.'); };
const args = process.argv.slice(2), now = new Date();
if (!['refresh','release'].includes(args[0]) || (args[0] === 'refresh' && !args[1])) throw Error('Usage: node --use-env-proxy rupert/_tools/publish.mjs refresh EDITION_ID | release [--apply]');
const editions = await Promise.all((await readdir(resolve(root,'data/editions'))).filter(f=>/^\d{4}-W\d{2}-(?:r\d+-)?(tue|thu)\.json$/.test(f)).map(async f=>({path:'data/editions/'+f,ed:await read('data/editions/'+f)})));
check();
if (args[0] === 'refresh') {
  const entry = editions.find(e=>e.ed.id===args[1]); if (!entry) throw Error('Unknown edition.');
  if (entry.ed.weekend.start !== cycleWeekend(now).start) throw Error('Only the current recommendation weekend may be refreshed by this command.');
  const places = await read('data/places.json'), point = places.places.find(p=>p.id===entry.ed.flagship.place_id)?.access;
  const before = structuredClone(entry.ed);
  const controller = new AbortController(), timeout = setTimeout(()=>controller.abort(),45000);
  let conditions;
  try { conditions = await fetchWeekendForecast(point,entry.ed.weekend,{now,signal:controller.signal}); }
  catch (e) { conditions = unavailableForecast({now,reason:e.message}); }
  finally { clearTimeout(timeout); }
  // Preserve authored pivots only until the editor reviews the new evidence. A failed source cannot
  // carry yesterday's optimistic advice as today's forecast.
  if (conditions.kind === 'forecast') {
    conditions.pivot = entry.ed.conditions?.pivot;
    conditions.trail_note = entry.ed.conditions?.trail_note;
  } else {
    entry.ed.flagship.headline_condition = 'Current forecast unavailable'; entry.ed.flagship.condition_level = 'adverse';
  }
  entry.ed.conditions = conditions;
  const history = await optional('data/conditions-history.json',{snapshots:[]});
  history.snapshots.push({edition_id:entry.ed.id,replaced_at:now.toISOString(),conditions:before.conditions,forecast_sources:before.flagship.sources.filter(s=>s.kind==='forecast'),headline_condition:before.flagship.headline_condition,condition_level:before.flagship.condition_level});
  await write(entry.path,entry.ed);
  try { check(); } catch (e) { await write(entry.path,before); throw e; }
  await write('data/conditions-history.json',history);
  console.log(`${entry.ed.id}: ${conditions.kind}; source issue ${conditions.as_of}. Review the actual weather and safety guidance before release.`);
} else {
  const checks = await read('data/access-checks.json'), reviews = await optional('data/editorial-reviews.json',{reviews:[]});
  const due = editions.filter(({ed})=>ed.status==='draft' && ed.weekend.start===cycleWeekend(now).start && now>=expectedPublish(ed.slot,ed.weekend.start));
  if (!due.length) { console.log('No due drafts. Already published editions remain unchanged.'); process.exit(0); }
  const problems = due.map(({ed})=>({id:ed.id,problem:releaseProblem(ed,{checks:checks.checks,officialHosts:checks.official_hosts,reviews:reviews.reviews,now})})).filter(e=>e.problem);
  if (problems.length) { problems.forEach(e=>console.error(`${e.id}: ${e.problem}`)); process.exit(1); }
  if (!args.includes('--apply')) { console.log('Ready: '+due.map(e=>e.ed.id).join(', ')+'. Use release --apply to record actual publication.'); process.exit(0); }
  const before = due.map(({path,ed})=>({path,ed:structuredClone(ed)}));
  const log = await optional('data/release-log.json',{releases:[]});
  const previousLog = structuredClone(log);
  for (const {path,ed} of due) { ed.status='published'; ed.published_at=nyTimestamp(now); await write(path,ed); }
  try { check(); } catch (e) { for (const entry of before) await write(entry.path,entry.ed); throw e; }
  for (const {ed} of due) log.releases.push({edition_id:ed.id,scheduled_at:nyTimestamp(expectedPublish(ed.slot,ed.weekend.start)),published_at:ed.published_at,reviewed_at:reviews.reviews.filter(r=>r.edition_id===ed.id).at(-1).reviewed_at});
  await write('data/release-log.json',log);
  const build = spawnSync(process.execPath,[resolve(root,'_tools/rupert.mjs'),'build'],{stdio:'inherit'});
  if (build.status !== 0) {
    for (const entry of before) await write(entry.path,entry.ed);
    await write('data/release-log.json',previousLog);
    throw Error('Build failed; draft source restored. Do not deploy this working tree.');
  }
  console.log('Released at actual review time: '+due.map(e=>`${e.ed.id} ${e.ed.published_at}`).join(', '));
}
