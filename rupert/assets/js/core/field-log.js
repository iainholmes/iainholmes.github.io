import { nyDateString } from './dates.js';
import { seasonFor } from './options.js';
export const LOG_KEY = 'rupert-field-log-v1';
export const LOG_CHANGED = 'rupert-history-changed';
export const rupertDay = (now = new Date()) => nyDateString(now).slice(5) === '04-07';
export const birthdayPrompt = 'Record today’s outing and add a photograph.';
export function cleanEntry(v) {
  if (!v || typeof v !== 'object') throw Error('Invalid memory.');
  const date = String(v.date || '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0,10) !== date) throw Error('Choose a valid date.');
  const out = { id: typeof v.id === 'string' && /^fl_[a-z0-9_-]{1,100}$/i.test(v.id) ? v.id : `fl_${crypto.randomUUID()}`, date, season: seasonFor(date) };
  for (const [key, max] of Object.entries({place:200, activity:300, notes:10000, prompt:1000, edition:100, experience:100, tags:500, place_id:100, experience_id:160})) {
    out[key] = typeof v[key] === 'string' ? v[key] : '';
    if (out[key].length > max) throw Error('A memory field is too long.');
  }
  if (!out.place.trim() || !out.activity.trim()) throw Error('Add a place and what you did.');
  out.history_kind = ['visit','completed','unclassified'].includes(v.history_kind) ? v.history_kind : 'unclassified';
  out.association_manual = v.association_manual === true;
  if (out.history_kind === 'completed' && (!out.place_id || !out.experience_id && !out.edition)) throw Error('Choose the specific outing you completed.');
  out.source = ['planned','unplanned','rupert-day'].includes(v.source) ? v.source : 'unplanned';
  out.photos = Array.isArray(v.photos) ? v.photos : [];
  if (out.photos.length > 3 || out.photos.some(p => typeof p !== 'string' || !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(p) || p.length > 750000)) throw Error('Use up to three small photos.');
  return out;
}
export function readLogBackup(text) {
  if (text.length > 4000000) throw Error('Backup exceeds 4 MB.');
  const v = JSON.parse(text);
  if (![1,2].includes(v.version) || !Array.isArray(v.entries) || v.entries.length > 200) throw Error('Use a Field Log backup.');
  const entries = v.entries.map(cleanEntry);
  if (new Set(entries.map(e=>e.id)).size !== entries.length) throw Error('Duplicate memories in backup.');
  return entries;
}
export function readLocalHistory() {
  try { const raw = localStorage.getItem(LOG_KEY); return { entries: raw ? readLogBackup(raw) : [], available: true }; }
  catch { return { entries: [], available: false }; }
}
