import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { atlasModel, directoryPlaces, registerGroups } from '../assets/js/core/atlas.js';
import { renderAtlas } from '../assets/js/core/render.js';

const json = path => JSON.parse(readFileSync(new URL('../' + path, import.meta.url)));
const places = json('data/places.json'), currentManifest = json('data/editions/index.json');
const now = new Date('2026-10-15T23:00:00-04:00');
// Keep the historical scenario stable as genuine later editions are published.
const manifest = { ...currentManifest, editions: currentManifest.editions.filter(e => new Date(e.published_at) <= now) };
let checks = 0;
const check = fn => { fn(); checks++; };
const ids = model => model.directory.map(p => p.id);
const renderedIds = model => [...renderAtlas(model, { base: '../' }).matchAll(/class="reg-row" id="place-([^"]+)"/g)].map(m => m[1]);
const model = atlasModel(places, manifest, { now });
const before = JSON.stringify({ places, manifest });
const expected = ['jordan-lake-new-hope', 'hanging-rock-trail', 'raven-rock', 'occoneechee-mountain', 'umstead-company-mill', 'hillsborough-riverwalk', 'eno-cox-mountain'];
check(() => assert.deepEqual(ids(model), expected));
check(() => assert.deepEqual(renderedIds(model), expected));
check(() => assert.equal(model.counts.all, 7));
check(() => assert.equal(new Set(ids(model)).size, 7));
check(() => assert.deepEqual(new Set(model.features.map(f => f.properties.id)), new Set(expected)));
check(() => assert.equal(model.statuses.get('eno-cox-mountain').status, 'withdrawn'));
check(() => assert.deepEqual(model.groups, registerGroups(places, model.statuses))); // Map framing stays regional.
check(() => assert.deepEqual(model.regions, model.groups.map(g => ({ label: g.region, ids: g.places.map(p => p.id) }))));
check(() => assert.deepEqual(ids(atlasModel({ places: [...places.places].reverse() }, { editions: [...manifest.editions].reverse() }, { now })), expected));

// Only genuine releases earn a position, and a later repeat updates one card and its edition link.
const repeat = { ...manifest.editions.at(-1), id: 'future-repeat', status: 'draft',
  published_at: '2026-10-20T07:00:00-04:00', place_roles: [{ place_id: 'umstead-company-mill', role: 'flagship' }] };
const later = { editions: [...manifest.editions, repeat] };
check(() => assert.deepEqual(ids(atlasModel(places, later, { now: new Date('2026-10-20T08:00:00-04:00') })), expected));
repeat.status = 'scheduled';
check(() => assert.deepEqual(ids(atlasModel(places, later, { now: new Date('2026-10-20T08:00:00-04:00') })), expected));
repeat.status = 'published';
check(() => assert.deepEqual(ids(atlasModel(places, later, { now })), expected));
const advanced = atlasModel(places, later, { now: new Date(repeat.published_at) });
check(() => assert.equal(advanced.directory[0].id, 'umstead-company-mill'));
check(() => assert.equal(advanced.counts.all, 7));
check(() => assert.equal(advanced.statuses.get('umstead-company-mill').editions[0].id, repeat.id));
check(() => assert.match(renderAtlas(advanced, { base: '../' }), /href="\.\.\/edition\/future-repeat\/">Latest edition/));

// Compare instants, not timestamp strings: offsets can differ across legitimate historical records.
const tiePlaces = { places: ['a', 'b', 'c'].map(id => ({ id, name: id, region: id })) };
const edition = (id, place, published_at) => ({ id, slot: 'tuesday', status: 'published', published_at,
  place_roles: [{ place_id: place, role: 'flagship' }], weekend: { start: '2026-10-24', end: '2026-10-25' } });
const offsets = { editions: [edition('old', 'a', '2026-10-15T12:00:00Z'), edition('new', 'b', '2026-10-15T09:00:00-04:00'), edition('repeat', 'a', '2026-10-15T09:30:00-04:00')] };
const offsetModel = atlasModel(tiePlaces, offsets, { now });
check(() => assert.deepEqual(ids(offsetModel), ['a', 'b']));
check(() => assert.equal(offsetModel.statuses.get('a').editions[0].id, 'repeat'));
const ties = { editions: [edition('z', 'b', '2026-10-15T13:00:00Z'), edition('y', 'a', '2026-10-15T09:00:00-04:00'), edition('a', 'a', '2026-10-15T13:00:00Z')] };
const tieModel = atlasModel(tiePlaces, ties, { now });
check(() => assert.deepEqual(ids(tieModel), ['a', 'b']));
check(() => assert.equal(tieModel.statuses.get('a').editions[0].id, 'a'));
const incomplete = new Map([['c', { editions: [] }], ['b', { editions: [{ published_at: 'invalid' }] }], ['a', { editions: [{ published_at: '2026-10-15T13:00:00Z' }] }]]);
check(() => assert.deepEqual(directoryPlaces(tiePlaces, incomplete).map(p => p.id), ['a', 'b', 'c']));
offsets.editions.push(edition('missing', 'c', undefined));
check(() => assert.ok(!atlasModel(tiePlaces, offsets, { now }).statuses.has('c')));
check(() => assert.equal(JSON.stringify({ places, manifest }), before));
const latest = currentManifest.editions.filter(e => ['published', 'withdrawn'].includes(e.status))
  .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))[0];
const currentModel = atlasModel(places, currentManifest, { now: new Date(latest.published_at) });
check(() => assert.equal(ids(currentModel)[0], latest.place_id));
check(() => assert.equal(renderedIds(currentModel)[0], latest.place_id));
console.log(`${checks} chronological Directory, recurring-place, release-boundary, stable-fallback and map-history assertions PASS.`);
