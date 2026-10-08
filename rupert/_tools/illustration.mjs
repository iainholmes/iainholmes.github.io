// Print a distinct generation brief for one suggestion; generation stays an editorial publishing step.
import { readFile } from 'node:fs/promises';
import { illustrationPrompt } from '../assets/js/core/adventure.js';
import { isReleased } from '../assets/js/core/editions.js';
const [id, role = 'flagship'] = process.argv.slice(2);
if (!/^\d{4}-W\d{2}-(?:r\d+-)?(tue|thu)$/.test(id || '')) throw new Error('Usage: node rupert/_tools/illustration.mjs EDITION_ID ROLE');
const edition = JSON.parse(await readFile(new URL(`../data/editions/${id}.json`, import.meta.url)));
const manifest = JSON.parse(await readFile(new URL('../data/editions/index.json', import.meta.url)));
const registry = JSON.parse(await readFile(new URL('../data/photos.json', import.meta.url)));
const recent = manifest.editions.filter(e => e.id !== id && isReleased(e))
  .sort((a,b) => b.published_at.localeCompare(a.published_at)).slice(0,6);
console.log('Read rupert/ILLUSTRATIONS.md. Visually review these recent published prints before choosing the new composition:');
for (const e of recent) {
  const photo = registry.photos.find(p => p.id === e.photo_id);
  console.log(`${e.id} (${e.status}) — ${photo ? `rupert/photos/${photo.file}-${Math.max(...photo.widths)}.jpg` : 'Inspect its Full Edition artwork'}`);
}
console.log('Favor a minimal portrait, simple action or distinctive crop. Record deliberate differences in pose, framing, subject scale, negative space, background and dominant color in artwork.brief. Elaborate scenery is occasional, not the default.\n');
console.log(illustrationPrompt(edition, role));
