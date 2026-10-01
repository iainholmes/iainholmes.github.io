#!/usr/bin/env node
// Local editorial candidate ranking, never written to the public Directory.
// node rupert/_tools/recommend.mjs CANDIDATES.json --at TIMESTAMP [--log FIELD_LOG_BACKUP.json]
import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { rankCandidates } from '../assets/js/core/recommendations.js';
import { accessProblem } from '../assets/js/core/publication.js';
import { readLogBackup } from '../assets/js/core/field-log.js';
const root = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2), path = args.shift();
const option = key => args.includes(key) ? args[args.indexOf(key) + 1] : null;
const at = option('--at');
if (!path || !at || !Number.isFinite(+new Date(at))) throw Error('Provide a candidate queue and --at publication timestamp.');
const queue = JSON.parse(await readFile(path, 'utf8'));
if (!Array.isArray(queue) || !queue.length || queue.some(c => !c.flagship?.place_id || !Number.isFinite(Number(c.suitability_score ?? 50)))) throw Error('Use a nonempty array of edition candidates with finite suitability scores.');
const files = (await readdir(root + 'data/editions')).filter(f => /^\d{4}-W\d{2}-(?:r\d+-)?(tue|thu)\.json$/.test(f));
const history = await Promise.all(files.map(f => readFile(root + 'data/editions/' + f, 'utf8').then(JSON.parse)));
const checks = JSON.parse(await readFile(root + 'data/access-checks.json', 'utf8'));
const log = option('--log') ? readLogBackup(await readFile(option('--log'), 'utf8')) : [];
const ranked = rankCandidates(queue, history, { at, log }).map(({ candidate, ...rank }) => {
  const access = accessProblem({...candidate, status:'published', published_at:at}, checks.checks, checks.official_hosts);
  return { id:candidate.id, place_id:candidate.flagship.place_id, ...rank, accessProblem:access, readyForEditorialReview:rank.eligible && !access };
});
console.log(JSON.stringify({at, completionHistory:log.length ? 'Local backup supplied' : 'No local completion backup supplied', candidates:ranked}, null, 2));
