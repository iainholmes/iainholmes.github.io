// Private opt-in input only. This helper lives outside the public Pages tree.
import { readFile, realpath, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { readLogBackup } from '../assets/js/core/field-log.js';
import { recommendationHistory, readRecommendationHistory } from '../assets/js/core/experience-history.js';
export async function loadRecommendationHistory(args, catalog, root) {
  const flag = args.includes('--history') ? '--history' : args.includes('--log') ? '--log' : null;
  if (args.includes('--history') && args.includes('--log')) throw Error('Supply one private history input.');
  const supplied = flag ? args[args.indexOf(flag)+1] : resolve(root,'_private/recommendation-history.json');
  if (flag && (!supplied || supplied.startsWith('--'))) throw Error('Provide a private file after '+flag+'.');
  if (!flag && !existsSync(supplied)) return [];
  const path = await realpath(resolve(supplied)), repository = resolve(root,'..');
  if ((path === repository || path.startsWith(repository+sep)) && !path.startsWith(resolve(root,'_private')+sep)) throw Error('Personal history must be outside the repository or in ignored rupert/_private/.');
  if ((await stat(path)).size > (flag === '--log' ? 4000000 : 100000)) throw Error('History input is too large.');
  const text = await readFile(path,'utf8');
  // Old explicit --log usage is compatible, but never guesses completion from legacy edition/activity fields.
  const minimal = flag === '--log' ? JSON.stringify(recommendationHistory(readLogBackup(text),catalog)) : text;
  return readRecommendationHistory(minimal,catalog);
}
