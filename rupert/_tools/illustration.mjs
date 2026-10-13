// Print a distinct generation brief for one suggestion; generation stays an editorial publishing step.
import { readFile } from 'node:fs/promises';
import { reservePrompt } from './art-direction.mjs';
import { writeFile } from 'node:fs/promises';
import { privatePath } from './private-staging.mjs';
import { fileURLToPath } from 'node:url';
import { isReleased } from '../assets/js/core/editions.js';
const [mode, input, output] = process.argv.slice(2);
if(mode!=='--reserve' || !input || !output)throw Error('Usage: illustration.mjs --reserve PRIVATE_BRIEF.json PRIVATE_PROMPT.txt');
const root=fileURLToPath(new URL('../',import.meta.url)),target=await privatePath(root,output);
const brief=JSON.parse(await readFile(input,'utf8'));
const manifest = JSON.parse(await readFile(new URL('../data/editions/index.json', import.meta.url)));
const registry = JSON.parse(await readFile(new URL('../data/photos.json', import.meta.url)));
const recent = manifest.editions.filter(e => isReleased(e))
  .sort((a,b) => b.published_at.localeCompare(a.published_at)).slice(0,6);
console.log('Read rupert/ILLUSTRATIONS.md. Visually review these recent published prints before choosing the new composition:');
for (const e of recent) {
  const photo = registry.photos.find(p => p.id === e.photo_id);
  console.log(`${e.id} (${e.status}) — ${photo ? `rupert/photos/${photo.file}-${Math.max(...photo.widths)}.jpg` : 'Inspect its Full Edition artwork'}`);
}
console.log('Favor a minimal portrait, simple action or distinctive crop. Record deliberate differences in pose, framing, subject scale, negative space, background and dominant color in artwork.brief. Elaborate scenery is occasional, not the default.\n');
await writeFile(target,reservePrompt(brief)+'\n',{mode:0o600});
console.log('Private destination-independent 4:5 brief saved. Do not preview or describe unused artwork in reports.');
