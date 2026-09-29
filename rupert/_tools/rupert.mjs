#!/usr/bin/env node
// The Rupert Atlas build tool. No dependencies. Run from anywhere:
//   node rupert/_tools/rupert.mjs build     validate everything, write the manifest, render all pages
//   node rupert/_tools/rupert.mjs check     validate only (exit 1 on any error)
//
// Lives in _tools/ so Jekyll never publishes it.

import { readFile, writeFile, readdir, mkdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validate } from './validate.mjs';
import { selectCurrentPair, archiveGroups } from '../assets/js/core/editions.js';
import { parseDate, nyDateString } from '../assets/js/core/dates.js';
import { chrome, renderWeek, renderEdition, renderArchive, renderAtlasRegister, renderComing, weekLabelFor, esc } from '../assets/js/core/render.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const P = (...p) => join(ROOT, ...p);
const readJSON = async f => JSON.parse(await readFile(f, 'utf8'));

const errors = [], warnings = [];
const err = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`${where}: ${msg}`);

async function load() {
  const site = await readJSON(P('data/site.json'));
  const places = await readJSON(P('data/places.json'));
  const photos = await readJSON(P('data/photos.json'));
  const schema = await readJSON(P('schema/edition.schema.json'));
  const files = (await readdir(P('data/editions'))).filter(f => /^\d{4}-W\d{2}-(tue|thu)\.json$/.test(f)).sort();
  const editions = {};
  for (const f of files) editions[f.replace(/\.json$/, '')] = await readJSON(P('data/editions', f));
  return { site, places, photos, schema, editions };
}

/* ---------- checks ---------- */

function checkEditions({ editions, schema, places, photos }) {
  const placeIds = new Set(places.places.map(p => p.id));
  const photoIds = new Set(photos.photos.map(p => p.id));
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
    for (const role of ['flagship', 'local_trail', 'away_mission', 'wildcard']) {
      const pid = ed[role]?.place_id;
      if (pid && !placeIds.has(pid)) err(id, `${role}.place_id "${pid}" is not in places.json`);
    }
    const ph = ed.flagship?.photo?.id;
    if (ph && !photoIds.has(ph)) warn(id, `flagship photo "${ph}" is not in photos.json yet (a stand-in will render)`);
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

async function checkPhotos({ photos }) {
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
      if (buf.length > 600 * 1024) warn(`photos/${f}`, `${Math.round(buf.length / 1024)} KB — over the 600 KB budget`);
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
        place_ids: ['flagship', 'local_trail', 'away_mission', 'wildcard'].map(r => e[r]?.place_id).filter(Boolean),
        path: `data/editions/${e.id}.json`,
      })),
  };
}

function page({ title, description, depth, active, body, site, weekLabel, pageClass, scripts = true }) {
  const base = '../'.repeat(depth);
  return `<!doctype html>
<html lang="en-US">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${site.noindex ? '<meta name="robots" content="noindex, nofollow">\n' : ''}<meta name="color-scheme" content="light dark">
<meta name="theme-color" content="#ECE5D4" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#1C1511" media="(prefers-color-scheme: dark)">
<link rel="preload" href="${base}assets/fonts/archivo-latin-wdth-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${base}assets/fonts/source-serif-4-latin-opsz-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${base}assets/css/atlas.css">
${scripts ? `<script type="module" src="${base}assets/js/site.js"></script>\n` : ''}</head>
<body data-base="${base}" data-section="${active}">
${chrome({ active, base, weekLabel, site, body, pageClass })}
</body>
</html>
`;
}

async function write(rel, content) {
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
  if (data.site.review_clock) warn('data/site.json', `review_clock is set (${data.site.review_clock}). Set it to null before merging.`);

  const manifest = manifestFrom(data.editions);
  const now = data.site.review_clock ? new Date(data.site.review_clock) : new Date();
  const pair = selectCurrentPair(manifest, now);
  const weekLabel = weekLabelFor(nyDateString(now));

  if (writeFiles && !errors.length) {
    const changed = [];
    const ctx0 = { photos: data.photos, places: data.places };
    const w = async (rel, html) => { if (await write(rel, html)) changed.push(rel); };

    await w('data/editions/index.json', JSON.stringify(manifest, null, 2) + '\n');

    const eds = data.editions;
    await w('index.html', page({
      title: 'The Rupert Atlas', description: 'Two choices for the coming weekend with Rupert, published Tuesday and Thursday.',
      depth: 0, active: 'week', site: data.site, weekLabel,
      body: renderWeek(pair, eds, { ...ctx0, base: '' }),
    }));

    for (const ed of Object.values(eds).filter(e => e.status === 'published')) {
      const sib = Object.values(eds).find(o => o.id !== ed.id && o.status === 'published' && o.weekend.start === ed.weekend.start);
      await w(`edition/${ed.id}/index.html`, page({
        title: `${ed.flagship.title} · The Rupert Atlas`, description: ed.flagship.standfirst,
        depth: 2, active: 'week', site: data.site, weekLabel, pageClass: 'page-edition',
        body: renderEdition(ed, { ...ctx0, base: '../../' }, sib),
      }));
    }
    await w('edition/index.html', page({
      title: 'Editions · The Rupert Atlas', description: 'All editions', depth: 1, active: 'archive', site: data.site, weekLabel, scripts: false,
      body: `<div class="wrap page-head"><h1>Editions</h1><p><a href="../archive/">See the archive</a></p></div>`,
    }));
    await w('archive/index.html', page({
      title: 'Archive · The Rupert Atlas', description: 'Every edition, by weekend.',
      depth: 1, active: 'archive', site: data.site, weekLabel,
      body: renderArchive(archiveGroups(manifest, now, pair), { base: '../' }),
    }));
    await w('atlas/index.html', page({
      title: 'Atlas · The Rupert Atlas', description: 'Register of places.',
      depth: 1, active: 'atlas', site: data.site, weekLabel,
      body: renderAtlasRegister(data.places, manifest, { base: '../' }),
    }));
    for (const k of ['travel', 'log']) {
      await w(`${k}/index.html`, page({
        title: `${k === 'log' ? 'Field Log' : 'Travel'} · The Rupert Atlas`, description: 'In preparation.',
        depth: 1, active: k, site: data.site, weekLabel, body: renderComing(k, { base: '../' }),
      }));
    }
    console.log(changed.length ? `wrote:\n  ${changed.join('\n  ')}` : 'no changes');
  }

  for (const w of warnings) console.warn(`warn  ${w}`);
  for (const e of errors) console.error(`ERROR ${e}`);
  if (pair) console.log(`current pair: ${pair.weekend.start} · tue=${pair.tuesday?.id || '—'} · thu=${pair.thursday?.id || '—'} · ${pair.state}`);
  if (errors.length) { console.error(`${errors.length} error(s); nothing written.`); process.exit(1); }
}

const cmd = process.argv[2] || 'build';
if (cmd === 'build') await build({ writeFiles: true });
else if (cmd === 'check') await build({ writeFiles: false });
else { console.error('usage: rupert.mjs build|check'); process.exit(2); }
