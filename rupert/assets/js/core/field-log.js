import { nyDateString } from './dates.js';
import { seasonFor } from './options.js';
export const LOG_KEY = 'rupert-field-log-v1';
export const rupertDay = (now = new Date()) => nyDateString(now).slice(5) === '04-07';
export const birthdayPrompt = 'Keep one small thing from Rupert Day: his favourite moment, your favourite moment, and a photograph worth returning to.';
export function cleanEntry(v) {
  if (!v || typeof v !== 'object') throw Error('Invalid memory.');
  const date = String(v.date || '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0,10) !== date) throw Error('Choose a valid date.');
  const out = { id: typeof v.id === 'string' && /^fl_[a-z0-9_-]{1,100}$/i.test(v.id) ? v.id : `fl_${crypto.randomUUID()}`, date, season: seasonFor(date) };
  for (const [key, max] of Object.entries({place:200, activity:300, notes:10000, prompt:1000, edition:100, experience:100, tags:500})) {
    out[key] = typeof v[key] === 'string' ? v[key].trim() : '';
    if (out[key].length > max) throw Error('A memory field is too long.');
  }
  if (!out.place || !out.activity) throw Error('Add a place and what you did.');
  out.source = ['planned','unplanned','rupert-day'].includes(v.source) ? v.source : 'unplanned';
  out.photos = Array.isArray(v.photos) ? v.photos : [];
  if (out.photos.length > 3 || out.photos.some(p => typeof p !== 'string' || !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(p) || p.length > 750000)) throw Error('Use up to three small photos.');
  return out;
}
export function readLogBackup(text) {
  if (text.length > 4000000) throw Error('Backup exceeds 4 MB.');
  const v = JSON.parse(text);
  if (v.version !== 1 || !Array.isArray(v.entries) || v.entries.length > 200) throw Error('Use a Field Log backup.');
  const entries = v.entries.map(cleanEntry);
  if (new Set(entries.map(e=>e.id)).size !== entries.length) throw Error('Duplicate memories in backup.');
  return entries;
}
