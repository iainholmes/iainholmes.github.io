// Print a distinct generation brief for one suggestion; generation stays an editorial publishing step.
import { readFile } from 'node:fs/promises';
import { illustrationPrompt } from '../assets/js/core/adventure.js';
const [id, role = 'flagship'] = process.argv.slice(2);
if (!/^\d{4}-W\d{2}-(tue|thu)$/.test(id || '')) throw new Error('Usage: node rupert/_tools/illustration.mjs EDITION_ID ROLE');
const edition = JSON.parse(await readFile(new URL(`../data/editions/${id}.json`, import.meta.url)));
console.log(illustrationPrompt(edition, role));
