import { validPoint } from './routing.js';
import { cleanJourney, cleanManualRoutes } from './journey-storage.js';
const MODES = ['car', 'air', 'ferry', 'rail', 'walk'];
// Explicit projection prevents imported objects from carrying unexpected fields into storage.
export function cleanPlan(value) {
  if (!value || typeof value.title !== 'string' || !value.title.trim() || value.title.length > 160 || !Array.isArray(value.legs) || !value.legs.length || value.legs.length > 40) throw new Error('A plan needs a name and 1–40 legs.');
  const legs = value.legs.map((leg, i) => {
    if (!MODES.includes(leg.mode) || typeof leg.from?.label !== 'string' || typeof leg.to?.label !== 'string' || !leg.from.label.trim() || !leg.to.label.trim() || leg.from.label.length > 200 || leg.to.label.length > 200) throw new Error(`Check the mode and both locations for leg ${i + 1}.`);
    const endpoint=v=>({label:v.label.trim(),...(validPoint(v)?{lat:v.lat,lng:v.lng}:{} )});
    const minutes=leg.minutes==='' || leg.minutes==null?undefined:Number(leg.minutes);if(minutes!==undefined && (!Number.isFinite(minutes)||minutes<0||minutes>10080))throw Error('Check the travel duration.');
    return { seq:i+1, mode:leg.mode, from:endpoint(leg.from), to:endpoint(leg.to), ...(minutes!==undefined?{minutes}: {}) };
  });
  const dates = {};
  for (const k of ['start', 'end']) { const date = value.dates?.[k]; if (date && (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0,10)!==date)) throw new Error('Check the trip dates.'); if (date) dates[k] = date; }
  if (dates.start && dates.end && dates.start > dates.end) throw new Error('The end date must follow the start.');
  const manual_stops = (value.manual_stops || []).map(stop => {
    if (!Number.isInteger(stop.leg) || !legs[stop.leg - 1] || legs[stop.leg - 1].mode !== 'car' || typeof stop.note !== 'string' || stop.note.length > 500) throw new Error('Check the driving stops.');
    if(stop.minutes!=null && (!Number.isFinite(Number(stop.minutes))||Number(stop.minutes)<0||Number(stop.minutes)>1440))throw Error('Check stop duration.');
    return { leg: stop.leg, ...(validPoint(stop.location)?{location:{label:String(stop.location.label||'Stop').slice(0,200),lat:stop.location.lat,lng:stop.location.lng}}:{}), ...(stop.minutes!=null?{minutes:Number(stop.minutes)}:{}), ...(typeof stop.place_id === 'string' && stop.place_id ? { place_id: stop.place_id } : {}), note: stop.note };
  });
  if (new Set(manual_stops.map(s => s.leg)).size !== manual_stops.length) throw new Error('Use one stop record per driving leg; combine extra stops in its note.');
  if (manual_stops.length > 80) throw new Error('Too many stops in this backup.');
  const id = typeof value.id === 'string' && /^tp_[a-z0-9_-]{1,100}$/i.test(value.id) ? value.id : `tp_${crypto.randomUUID?.() || [...crypto.getRandomValues(new Uint8Array(16))].map(n=>n.toString(16).padStart(2,'0')).join('')}`;
  let postcard;
  if (value.postcard) {
    const p=value.postcard;
    if (typeof p.image !== 'string' || p.image.length > 1500000 || !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(p.image) || typeof p.caption !== 'string' || !p.caption.trim() || p.caption.length > 160) throw new Error('Use a small JPEG, PNG or WebP illustration and a postcard caption.');
    postcard={image:p.image,caption:p.caption.trim(),...(p.automatic===true?{automatic:true}:{})};
  }
  const planning={departure:/^([01]\d|2[0-3]):[0-5]\d$/.test(value.planning?.departure)?value.planning.departure:'09:00',break_every:[0,90,120,180].includes(value.planning?.break_every)?value.planning.break_every:120};
  if(value.planning?.detour!=null) {
    if(!Number.isFinite(value.planning.detour)||value.planning.detour<0||value.planning.detour>120) throw Error('Check the detour tolerance.');
    planning.detour=value.planning.detour;
  }
  return { id, title:value.title.trim(), dates, legs, manual_stops, planning, ...(postcard ? {postcard} : {}), ...(value.journey?{journey:cleanJourney(value.journey)}:{}), ...(value.manual_routes?{manual_routes:cleanManualRoutes(value.manual_routes,legs)}:{}) };
}
export function readBackup(text) {
  if (text.length > 20000000) throw new Error('This backup is too large.');
  const d = JSON.parse(text);
  if (d.schema_version !== 1 || !Array.isArray(d.plans) || d.plans.length > 100) throw new Error('Use a Rupert Travel backup.');
  const plans = d.plans.map(cleanPlan);
  if (new Set(plans.map(p => p.id)).size !== plans.length) throw new Error('Duplicate journeys in backup.');
  return plans;
}
