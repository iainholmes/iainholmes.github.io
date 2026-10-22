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
console.log('Review at least the latest six published recommendation illustrations, including withdrawn history where relevant. Choose deliberately among minimal portrait/action, restrained environmental scene and occasional detailed field-guide/landscape print within the approved TRA print family. Minimalism remains fully approved, not the default. Compare pose, framing, subject scale, background, negative space, palette, environmental complexity, visual density, spatial depth and engraving/hatching detail. Record the chosen mode, meaningful differences and any recent mode imbalance in the private artwork.brief. Prefer another mode after a sustained minimal flat-field run unless the concept strongly justifies another distinct minimalist plate; a background-color change alone is insufficient. No fixed rotation or quotas.\n');
await writeFile(target,reservePrompt(brief)+'\n',{mode:0o600});
console.log('Private destination-independent 4:5 brief saved. Do not preview or describe unused artwork in reports.');
