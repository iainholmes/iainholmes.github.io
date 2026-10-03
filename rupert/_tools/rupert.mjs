#!/usr/bin/env node
import { readLogBackup } from '../assets/js/core/field-log.js';
import { previousSuggestions, reuseEligibility } from '../assets/js/core/recommendations.js';
import { accessProblem } from '../assets/js/core/publication.js';
import { artworkProblems } from '../assets/js/core/adventure.js';
import { createHash } from 'node:crypto';
// The Rupert Atlas build tool. No dependencies. Run from anywhere:
//   node rupert/_tools/rupert.mjs build     validate everything, write the manifest, render all pages
//   node rupert/_tools/rupert.mjs check     validate only (exit 1 on any error)
//   node rupert/_tools/rupert.mjs test      run the edition-selection tests
//   node rupert/_tools/rupert.mjs photo SOURCE --id … --provenance … --alt "…" [print options]
//                                           prepare an image (Python helper: _tools/prep_photos.py,
//                                           dependencies in _tools/requirements.txt), then build
//
// Lives in _tools/ so Jekyll never publishes it.

import { readFile, writeFile, readdir, mkdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { validate } from './validate.mjs';
import { selectCurrentPair, archiveGroups } from '../assets/js/core/editions.js';
import { parseDate, nyDateString } from '../assets/js/core/dates.js';
import { cycleWeekend } from '../assets/js/core/cycles.js';
import { veilState, veilArtworkProblems } from '../assets/js/core/veil.js';
import { veilArrivalBoot } from '../assets/js/core/veil-arrival.js';
import { chrome, renderWeek, renderEdition, renderArchive, renderAtlas, renderComing, renderTravel, weekLabelFor, esc } from '../assets/js/core/render.js';
import { placeStatuses, markerFeatures, boundsOf, registerGroups, counts } from '../assets/js/core/atlas.js';
import { trafficConfig } from '../assets/js/traffic-config.js';
import { trafficAvailable } from '../assets/js/core/traffic.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const P = (...p) => join(ROOT, ...p);
const readJSON = async f => JSON.parse(await readFile(f, 'utf8'));
// Version the whole module graph so cached imports cannot revive old layouts.
const moduleFiles = (await walk(P('assets/js'))).filter(f=>f.endsWith('.js')).sort();
const assetHash = createHash('sha256');
for (const file of [...moduleFiles.map(f=>'assets/js/'+f),'assets/css/atlas.css','assets/css/field-log.css']) assetHash.update(await readFile(P(file)));
const assetVersion = assetHash.digest('hex').slice(0,12);
const iconVersion = createHash('sha256').update(await readFile(P('assets/img/icons/apple-touch-icon.png'))).digest('hex').slice(0,12);

const errors = [], warnings = [];
const err = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`${where}: ${msg}`);

async function load() {
  if((trafficConfig.apiKey || trafficConfig.publicToken) && !trafficAvailable(trafficConfig,'https://iainholmes.github.io')) err('traffic-config','Use only a dedicated restricted browser credential and the production origin; secret/invalid credentials cannot be built.');
  const site = await readJSON(P('data/site.json'));
  const places = await readJSON(P('data/places.json'));
  const photos = await readJSON(P('data/photos.json'));
  const accessChecks = await readJSON(P('data/access-checks.json'));
  const schema = await readJSON(P('schema/edition.schema.json'));
  const photoSchema = await readJSON(P('schema/photo.schema.json'));
  const files = (await readdir(P('data/editions'))).filter(f => /^\d{4}-W\d{2}-(?:r\d+-)?(tue|thu)\.json$/.test(f)).sort();
  const editions = {};
  for (const f of files) editions[f.replace(/\.json$/, '')] = await readJSON(P('data/editions', f));
  const logArg = process.argv.indexOf('--log');
  const logPath = logArg >= 0 ? process.argv[logArg + 1] : P('_private/recommendation-log.json');
  if (logArg >= 0 && !logPath) throw Error('Provide a local Field Log backup after --log.');
  if (logArg >= 0 && !existsSync(logPath)) throw Error('The supplied Field Log backup does not exist.');
  const completionLog = existsSync(logPath) ? readLogBackup(await readFile(logPath, 'utf8')) : [];
  return { site, places, photos, schema, photoSchema, editions, accessChecks, completionLog };
}

/* ---------- checks ---------- */

function checkEditions({ editions, schema, places, photos, accessChecks, completionLog }) {
  const placeIds = new Set(places.places.map(p => p.id));
  const photoIds = new Set(photos.photos.map(p => p.id));
  for (const issue of artworkProblems(editions, photos)) err('illustrations',issue);
  for (const [id, ed] of Object.entries(editions)) {
    for (const e of validate(ed, schema)) err(`editions/${id}.json`, e);
    if (ed.id !== id) err(id, `id "${ed.id}" does not match filename`);
    if (ed.slot && !id.endsWith(ed.slot.slice(0, 3))) err(id, `slot "${ed.slot}" does not match id suffix`);
    if (ed.weekend) {
      if (parseDate(ed.weekend.start).dow !== 6) err(id, `weekend.start ${ed.weekend.start} is not a Saturday`);
      if (parseDate(ed.weekend.end).dow !== 0) err(id, `weekend.end ${ed.weekend.end} is not a Sunday`);
    }
    if (ed.published_at && ed.weekend && nyDateString(new Date(ed.published_at)) >= ed.weekend.start)
      err(id, 'published_at must fall before the weekend it is for');
    // Found by the W41 publishing test: a date-only as_of is read as UTC midnight and prints as the evening before.
    if (ed.conditions?.as_of && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?[+-]\d{2}:\d{2}$/.test(ed.conditions.as_of))
      err(id, `conditions.as_of "${ed.conditions.as_of}" needs a time and offset, e.g. 2026-09-28T15:00:00-04:00`);
    for (const role of ['flagship', 'local_trail', 'away_mission', 'wildcard']) {
      const pid = ed[role]?.place_id;
      if (pid && !placeIds.has(pid)) err(id, `${role}.place_id "${pid}" is not in places.json`);
    }
    const accessIssue=accessProblem(ed,accessChecks.checks,accessChecks.official_hosts);
    if(accessIssue)err(id,'Publication gate: '+accessIssue);
    if (ed.status === 'published') {
      const reuse = reuseEligibility(ed, Object.values(editions), {log: completionLog});
      if (!reuse.eligible) err(id, 'Recommendation reuse: ' + reuse.reason);
    }
    if (ed.status === 'published' && previousSuggestions(ed, Object.values(editions)).length) {
      const stamp = new Date(ed.published_at);
      for (const [label, value, limit] of [['Place snapshot', ed.flagship.snapshot.as_of + 'T00:00:00-04:00', 7], ['Forecast', ed.conditions.as_of, 3]]) {
        const age = (stamp - new Date(value)) / 86400000;
        if (!Number.isFinite(age) || age < -1 || age > limit) err(id, `Refresh ${label.toLowerCase()} for the new edition.`);
      }
    }
    if (ed.status === 'published' && ed.flagship.experiences?.includes('event') && !ed.flagship.event_window) err(id, 'Event recommendations need an event_window.');
    const ph = ed.flagship?.photo?.id;
    if (ph && !photoIds.has(ph)) warn(id, `flagship photo "${ph}" is not in photos.json yet (a stand-in will render)`);
    const rec = photos.photos.find(p => p.id === ph);
    if (rec?.provenance === 'documentary' && rec.place_id !== ed.flagship.place_id)
      err(id, `flagship image "${ph}" is documentary at "${rec.place_id}", which is not this edition's place — mark it archive or editorial, or choose another`);
    if (ed.interlude && !photoIds.has(ed.interlude.photo_id)) warn(id, `interlude photo "${ed.interlude.photo_id}" missing`);
    if (ed.mission?.tone === 'training') warn(id, 'training mission — fine occasionally, not as the default');
  }
  // Two editions for one weekend must be different slots.
  const seen = new Map();
  for (const ed of Object.values(editions)) {
    if (ed.status !== 'published') continue;
    const k = `${ed.weekend?.start}|${ed.slot}`;
    if (seen.has(k)) err(ed.id, `duplicate ${ed.slot} edition for weekend ${ed.weekend.start} (also ${seen.get(k)})`);
    seen.set(k, ed.id);
  }
}

/** JPEG metadata scan: any APP1 (Exif/XMP), APP13 (IPTC) segment, or a GPS marker fails. */
function jpegMetadata(buf) {
  const found = [];
  if (buf[0] !== 0xff || buf[1] !== 0xd8) return ['not a JPEG'];
  let i = 2;
  while (i < buf.length - 4) {
    if (buf[i] !== 0xff) break;
    const marker = buf[i + 1];
    if (marker === 0xda) break; // start of scan: no more headers
    const len = buf.readUInt16BE(i + 2);
    const seg = buf.subarray(i + 4, i + 2 + len);
    if (marker === 0xe1) found.push(seg.subarray(0, 4).toString('latin1') === 'Exif' ? 'EXIF' : 'XMP/APP1');
    if (marker === 0xed) found.push('IPTC');
    i += 2 + len;
  }
  return found;
}

function checkPlaces(places) {
  for (const p of places.places) {
    const a = p.access;
    if (!a) { err(`places.json#${p.id}`, 'missing access point'); continue; }
    if (typeof a.coords_verified !== 'boolean') err(`places.json#${p.id}`, 'access.coords_verified must be true or false');
    if (!a.coords_source) err(`places.json#${p.id}`, 'access.coords_source must say where the point came from');
    if (!a.coords_verified) warn(`places.json#${p.id}`, 'access point not yet verified (shown as "pin approximate")');
  }
}

async function checkPhotos({ photos, photoSchema, places }) {
  checkPlaces(places);
  const placeIds = new Set(places.places.map(p => p.id));
  for (const p of photos.photos) {
    for (const e of validate(p, photoSchema)) err(`photos.json#${p.id}`, e);
    if (p.provenance === 'documentary' && !(p.place_id && p.taken_at)) err(`photos.json#${p.id}`, 'documentary needs place_id and taken_at');
    if (p.provenance !== 'documentary' && p.place_id) err(`photos.json#${p.id}`, 'place_id is only for documentary images');
    if (p.kind === 'plate' && p.provenance !== 'editorial') err(`photos.json#${p.id}`, 'plates are illustrations and must be editorial');
    if (p.place_id && !placeIds.has(p.place_id)) err(`photos.json#${p.id}`, `unknown place_id "${p.place_id}"`);
  }
  const gi = existsSync(P('.gitignore')) ? await readFile(P('.gitignore'), 'utf8') : '';
  if (!/^_private\/$/m.test(gi)) err('.gitignore', 'must contain "_private/" so original-photo context never enters the repository');
  const dir = P('photos');
  const onDisk = existsSync(dir) ? (await readdir(dir)).filter(f => !f.startsWith('.')) : [];
  const expected = new Set();
  for (const p of photos.photos) {
    if (!/^[a-z0-9-]+$/.test(p.file)) err(`photos.json#${p.id}`, 'file must be lowercase letters, digits and hyphens');
    if (!p.alt || p.alt.length < 8) err(`photos.json#${p.id}`, 'alt text required');
    for (const w of p.widths) {
      const f = `${p.file}-${w}.jpg`;
      expected.add(f);
      if (!onDisk.includes(f)) { err(`photos/${f}`, 'listed in photos.json but missing'); continue; }
      const buf = await readFile(join(dir, f));
      const meta = jpegMetadata(buf);
      if (meta.length) err(`photos/${f}`, `carries metadata (${meta.join(', ')}). Re-run _tools/prep_photos.py.`);
      if (buf.length > 900 * 1024) warn(`photos/${f}`, `${Math.round(buf.length / 1024)} KB — over the 900 KB budget`);
    }
  }
  for (const f of onDisk) if (!expected.has(f)) err(`photos/${f}`, 'on disk but not in photos.json (unapproved photos must not be in the repo)');
}

/* ---------- output ---------- */

function manifestFrom(editions) {
  return {
    schema_version: 1,
    generated_by: 'rupert/_tools/rupert.mjs',
    editions: Object.values(editions)
      .sort((a, b) => a.published_at.localeCompare(b.published_at))
      .map(e => ({
        id: e.id, slot: e.slot, status: e.status, published_at: e.published_at, weekend: e.weekend,
        title: e.flagship.title, place_id: e.flagship.place_id,
        experience_key: e.flagship.experience_id || e.flagship.snapshot?.route?.route_id || null,
        options: ['flagship'].map(role => ({ role, title: e[role].title, place_id: e[role].place_id, seasons: e[role].seasons, experiences: e[role].experiences, crowd: e[role].snapshot.crowd })),
        place_ids: ['flagship'].map(r => e[r]?.place_id).filter(Boolean),
        place_roles: ['flagship'].filter(r => e[r]?.place_id).map(r => ({ place_id: e[r].place_id, role: r })),
        photo_id: e.flagship.artwork?.image_id || e.flagship.photo?.id || null,
        path: `data/editions/${e.id}.json`,
      })),
  };
}

function page({ title, description, depth, active, body, site, weekLabel, cycle = '', pageClass, scripts = true, extra = [] }) {
  const base = '../'.repeat(depth);
  return `<!doctype html>
<html lang="en-US" style="background:#1D2A3A">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${site.noindex ? '<meta name="robots" content="noindex, nofollow">\n' : ''}<meta name="color-scheme" content="light">
<meta name="theme-color" content="#1D2A3A">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="The Atlas">
<link rel="manifest" href="${base}manifest.webmanifest">
<link rel="apple-touch-icon" sizes="180x180" href="${base}assets/img/icons/apple-touch-icon.png?v=${iconVersion}">
<link rel="preload" href="${base}assets/fonts/lmromandunhill-regular.otf" as="font" type="font/otf" crossorigin>
<link rel="preload" href="${base}assets/fonts/lmroman-regular.otf" as="font" type="font/otf" crossorigin>
<link rel="preload" href="${base}assets/fonts/velenor-regular.ttf" as="font" type="font/ttf" crossorigin>
<link rel="icon" type="image/svg+xml" href="${base}assets/img/rupert-face.svg">
<link rel="stylesheet" href="${base}assets/css/atlas.css">
<script type="importmap">${JSON.stringify({imports:Object.fromEntries(moduleFiles.map(f=>[base+'assets/js/'+f,base+'assets/js/'+f+'?v='+assetVersion]))})}</script>
${scripts ? `<script type="module" src="${base}assets/js/site.js"></script>\n` : ''}${extra.map(x => `<script type="module" src="${base}${x}"></script>\n`).join('')}</head>
<body data-base="${base}" data-section="${active}"${cycle ? ` data-cycle="${esc(cycle)}"` : ''}>
${scripts ? `<script>(${veilArrivalBoot.toString()})();</script>` : ''}
${chrome({ active, base, weekLabel, site, body, pageClass })}
</body>
</html>
`;
}

async function write(rel, content) {
  if (rel.endsWith('.html')) content = content.replace(/[ \t]+$/gm, '').replace(/((?:href|src)="[^"?]*assets\/(?:css|js)\/[^"?]+)(")/g,`$1?v=${assetVersion}$2`);
  const f = P(rel);
  await mkdir(dirname(f), { recursive: true });
  let old = null;
  try { old = await readFile(f, 'utf8'); } catch {}
  if (old !== content) await writeFile(f, content);
  return old !== content;
}

async function build({ writeFiles }) {
  const data = await load();
  checkEditions(data);
  await checkPhotos(data);

  const artworkHashes = new Map();
  for (const record of data.photos.photos) {
    const width=record.widths[0], file=P(`photos/${record.file}-${width}.jpg`);
    if (!existsSync(file)) continue;
    const hash=createHash('sha256').update(await readFile(file)).digest('hex');
    if (record.generation && artworkHashes.has(hash)) err('illustrations',`new illustration ${record.id} duplicates ${artworkHashes.get(hash)}`);
    artworkHashes.set(hash,record.id);
  }
  const manifest = manifestFrom(data.editions);
  const now = new Date();
  const pair = selectCurrentPair(manifest, now);
  const weekLabel = weekLabelFor(cycleWeekend(now).start);
  const frontispiece = veilState(manifest,now);
  if(frontispiece.active) for(const issue of veilArtworkProblems(frontispiece,data.photos)) err('frontispiece',issue);
  // Validate the next authored cycle now, including the unpublished Thursday's real image.
  const nextStart = [...new Set(manifest.editions.map(e=>e.weekend.start))].filter(s=>s>frontispiece.weekend.start).sort()[0];
  if(nextStart) {
    const previewNow = new Date(Date.parse(nextStart+'T12:00:00Z')-5*86400000);
    for(const issue of veilArtworkProblems(veilState(manifest,previewNow),data.photos)) err('frontispiece',issue);
  }

  if (writeFiles && !errors.length) {
    const changed = [];
    const ctx0 = { photos: data.photos, places: data.places, history: Object.values(data.editions), now };
    const w = async (rel, html) => { if (await write(rel, html)) changed.push(rel); };

    await w('data/editions/index.json', JSON.stringify(manifest, null, 2) + '\n');
    const pwa = await readJSON(P('manifest.webmanifest'));
    for(const icon of pwa.icons) icon.src=icon.src.split('?')[0]+'?v='+iconVersion;
    await w('manifest.webmanifest',JSON.stringify(pwa,null,2)+'\n');

    const eds = data.editions;
    await w('index.html', page({
      title: 'The Rupert Atlas', description: 'Tuesday and Thursday outing recommendations, route details and a searchable archive.',
      depth: 0, active: 'week', site: data.site, weekLabel,
      body: renderWeek(pair, eds, { ...ctx0, base: '' }),
    }));

    for (const ed of Object.values(eds).filter(e => ['published','withdrawn'].includes(e.status))) {
      const sib = Object.values(eds).find(o => o.id !== ed.id && o.status === 'published' && o.weekend.start === ed.weekend.start);
      await w(`edition/${ed.id}/index.html`, page({
        title: `${ed.flagship.title} · The Rupert Atlas`, description: ed.flagship.standfirst,
        depth: 2, active: 'week', site: data.site, weekLabel:weekLabelFor(ed.weekend.start), cycle:ed.weekend.start, pageClass: 'page-edition',
        body: renderEdition(ed, { ...ctx0, base: '../../' }, sib), extra: ['assets/js/fetch-view.js'],
      }));
    }
    for (const ed of Object.values(eds).filter(e=>e.status==='draft')) {
      await w(`edition/${ed.id}/index.html`,page({title:'Edition in preparation · The Rupert Atlas',description:'Pending official access review.',depth:2,active:'week',site:data.site,weekLabel:weekLabelFor(ed.weekend.start),cycle:ed.weekend.start,body:'<div class="wrap page-head"><h1>Edition in Preparation</h1><p>This recommendation is awaiting its pre-publication official access check.</p></div>'}));
    }
    await w('edition/index.html', page({
      title: 'Editions · The Rupert Atlas', description: 'All editions', depth: 1, active: 'archive', site: data.site, weekLabel,
      body: `<div class="wrap page-head"><h1>Editions</h1><p><a href="../archive/">See the archive</a></p></div>`,
    }));
    await w('archive/index.html', page({
      title: 'Archive · The Rupert Atlas', description: 'Every edition, by weekend.',
      depth: 1, active: 'archive', site: data.site, weekLabel,
      body: renderArchive(archiveGroups(manifest, now, pair), { ...ctx0, base: '../' }),
    }));
    const statuses = placeStatuses(data.places, manifest, { now });
    const atlasModel = { statuses, groups: registerGroups(data.places, statuses), counts: counts(statuses),
      features: markerFeatures(data.places, statuses), bounds: boundsOf({ places: data.places.places.filter(p => statuses.has(p.id)) }) };
    await w('atlas/index.html', page({
      title: 'Atlas · The Rupert Atlas', description: 'Published recommendations and their history, on a map and in a directory.',
      depth: 1, active: 'atlas', site: data.site, weekLabel, pageClass: 'page-atlas', extra: ['assets/js/atlas-view.js'],
      body: renderAtlas(atlasModel, { base: '../' }),
    }));
    for (const k of ['travel', 'log']) {
      await w(`${k}/index.html`, page({
        title: `${k === 'log' ? 'Field Log' : 'Travel'} · The Rupert Atlas`, description: k === 'travel' ? 'Plan trips with mapped routes, ordered legs, stops and browser-local backups.' : 'Record completed and unplanned outings, photos and notes in this browser.',
        depth: 1, active: k, site: data.site, weekLabel, pageClass:k==='travel'?'page-travel':'', extra: k === 'travel' ? ['assets/js/travel-view.js'] : [], body: k === 'travel' ? renderTravel({ ...ctx0, base: '../' }) : renderComing(k, { base: '../' }),
      }));
    }
    console.log(changed.length ? `wrote:\n  ${changed.join('\n  ')}` : 'no changes');
  }

  for (const w of warnings) console.warn(`warn  ${w}`);
  for (const e of errors) console.error(`ERROR ${e}`);
  if (pair) console.log(`current pair: ${pair.weekend.start} · tue=${pair.tuesday?.id || '—'} · thu=${pair.thursday?.id || '—'} · ${pair.state}`);
  if (errors.length) { console.error(`${errors.length} error(s); nothing written.`); process.exit(1); }
}

/* ---------- audit: what would be published, and what history would push ---------- */

async function walk(dir, rel = '') {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (e.name.startsWith('_') || e.name.startsWith('.')) continue; // Jekyll never publishes these
    const r = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) out.push(...await walk(join(dir, e.name), r)); else out.push(r);
  }
  return out;
}

async function audit({ history }) {
  const problems = [], notes = [];
  const bad = (f, m) => problems.push(`${f}: ${m}`);
  await build({ writeFiles: false, quietExit: true });
  const places = await readJSON(P('data/places.json'));
  const allowed = new Set();
  const key = (la, lo) => `${Number(la).toFixed(3)},${Number(lo).toFixed(3)}`;
  for (const p of places.places) if (p.access) allowed.add(key(p.access.lat, p.access.lng));
  for (const r of Object.values(places.reference_points || {})) allowed.add(key(r.lat, r.lng));
  for (const [lo, la] of boundsOf(places)) allowed.add(key(la, lo)); // the Atlas's padded default view
  const manifest = await readJSON(P('data/editions/index.json'));
  const published = placeStatuses(places, manifest);
  for (const [lo, la] of boundsOf({places: places.places.filter(p => published.has(p.id))})) allowed.add(key(la, lo));

  const files = await walk(ROOT);
  const FORBIDDEN_KEYS = ['gps', 'origin', 'home', 'residence', 'notes_private', 'source_file', 'camera', 'approved_media', 'exact'];
  const COORD = /(3[3-7]\.\d{3,})\s*,\s*(-(?:7[5-9]|8[0-4])\.\d{3,})|\[\s*(-(?:7[5-9]|8[0-4])\.\d{3,})\s*,\s*(3[3-7]\.\d{3,})\s*\]/g;
  let bytes = 0;
  for (const f of files) {
    const buf = await readFile(join(ROOT, f)); bytes += buf.length;
    if (/\.(jpe?g)$/i.test(f)) { const m = jpegMetadata(buf); if (m.length) bad(f, `image metadata: ${m.join(', ')}`); continue; }
    const iconSizes={'apple-touch-icon.png':180,'icon-192.png':192,'icon-512.png':512,'maskable-192.png':192,'maskable-512.png':512};
    const iconSize=f.startsWith('assets/img/icons/')&&iconSizes[f.split('/').at(-1)];
    if(f==='assets/img/travel-labrador-engraved.png' || iconSize) {
      // Approved transparent illustration: pixels-only PNG, no text, EXIF or profile chunks.
      let offset=8,ended=false;
      if(!buf.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))bad(f,'Invalid PNG signature');
      while(offset+12<=buf.length){const length=buf.readUInt32BE(offset),type=buf.toString('ascii',offset+4,offset+8);
        if(!['IHDR','IDAT','IEND'].includes(type))bad(f,'Unexpected PNG chunk: '+type);
        if(type==='IHDR' && iconSize && (buf.readUInt32BE(offset+8)!==iconSize || buf.readUInt32BE(offset+12)!==iconSize))bad(f,'Incorrect PWA icon dimensions');
        offset+=length+12;if(type==='IEND'){ended=true;break;}}
      if(!ended||offset!==buf.length)bad(f,'Incomplete PNG or trailing data');continue;
    }
    if (/\.(png|gif|webp|heic|tiff?)$/i.test(f)) { bad(f, 'raster image outside the JPEG pipeline (metadata not checked)'); continue; }
    if (!/\.(html|js|json|webmanifest|css|svg|md|txt)$/i.test(f)) continue;
    if (f.startsWith('vendor/')) continue; // third-party library code
    const text = buf.toString('utf8');
    const isSchema = f.startsWith('schema/'); // schemas describe fields; they hold no data
    if (/_private/.test(text) && !f.endsWith('.md') && !isSchema) bad(f, 'mentions _private');
    if (/\.heic\b|IMG_\d{4}|DSC_\d{4}/i.test(text)) bad(f, 'mentions an original camera filename');
    for (const m of text.matchAll(COORD)) {
      const [la, lo] = m[1] ? [m[1], m[2]] : [m[4], m[3]];
      if (!allowed.has(key(la, lo))) bad(f, `coordinate ${la}, ${lo} is not a public access point or the town reference`);
    }
    if (/\.(json|webmanifest)$/.test(f) && !isSchema) {
      const walkKeys = (o, path) => { if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) {
        if (FORBIDDEN_KEYS.includes(k.toLowerCase())) bad(f, `forbidden key "${path}${k}"`); walkKeys(v, `${path}${k}.`); } };
      try { walkKeys(JSON.parse(text), ''); } catch { bad(f, 'invalid JSON'); }
    }
  }
  notes.push(`${files.length} public files, ${(bytes / 1048576).toFixed(1)} MB`);

  // Git: _private must be ignored and untracked; optionally, every photo blob the branch would push must be clean.
  const git = (...a) => spawnSync('git', a, { cwd: ROOT, encoding: 'utf8' });
  const tracked = git('ls-files', '_private');
  if (tracked.status === 0) {
    if (tracked.stdout.trim()) bad('_private', 'is tracked by git');
    const ign = git('check-ignore', '-q', '_private/originals.json');
    if (ign.status !== 0) bad('_private', 'is not git-ignored');
    if (history) {
      const base = git('merge-base', 'HEAD', 'origin/master').stdout.trim();
      const revs = git('rev-list', base ? `${base}..HEAD` : 'HEAD').stdout.trim().split('\n').filter(Boolean);
      const seen = new Map();
      for (const rev of revs) {
        for (const line of git('ls-tree', '-r', rev, '--', 'photos').stdout.trim().split('\n').filter(Boolean)) {
          const [, , sha, path] = line.split(/\s+/);
          if (!seen.has(sha)) seen.set(sha, { path, rev: rev.slice(0, 7) });
        }
      }
      const reg = await readJSON(P('data/photos.json'));
      const current = new Set(reg.photos.flatMap(p => p.widths.map(w => `photos/${p.file}-${w}.jpg`)));
      for (const [sha, { path, rev }] of seen) {
        const blob = spawnSync('git', ['cat-file', 'blob', sha], { cwd: ROOT, maxBuffer: 64 * 1048576 }).stdout;
        const m = jpegMetadata(blob);
        if (m.length) bad(`${path} @${rev}`, `historical blob carries metadata (${m.join(', ')})`);
        if (!current.has(path.replace(/^rupert\//, ''))) bad(`${path} @${rev}`, 'historical image not in the current registry (would be pushed)');
      }
      notes.push(`history: ${revs.length} commit(s) since ${base.slice(0, 7) || 'root'}, ${seen.size} distinct photo blob(s) checked`);
    }
  } else notes.push('git not available: skipped tracking and history checks');

  for (const n of notes) console.log(`note  ${n}`);
  for (const p of problems) console.error(`AUDIT ${p}`);
  if (problems.length) { console.error(`${problems.length} audit problem(s).`); process.exit(1); }
  console.log('audit passed');
}

const cmd = process.argv[2] || 'build';
const run = (bin, args) => { const r = spawnSync(bin, args, { stdio: 'inherit' }); if (r.status !== 0) process.exit(r.status ?? 1); };
if (cmd === 'build') await build({ writeFiles: true });
else if (cmd === 'check') await build({ writeFiles: false });
else if (cmd === 'test') run(process.execPath, [P('_tools/test.mjs')]);
else if (cmd === 'audit') await audit({ history: process.argv.includes('--history') });
else if (cmd === 'photo') { run('python3', [P('_tools/prep_photos.py'), ...process.argv.slice(3)]); await build({ writeFiles: true }); }
else { console.error('usage: rupert.mjs build | check | test | audit [--history] | photo SOURCE --id … --provenance … --alt "…"'); process.exit(2); }
