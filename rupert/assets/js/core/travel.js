const MODES = ['car', 'air', 'ferry', 'rail', 'walk'];
// Explicit projection prevents imported objects from carrying unexpected fields into storage.
export function cleanPlan(value) {
  if (!value || typeof value.title !== 'string' || !value.title.trim() || value.title.length > 160 || !Array.isArray(value.legs) || !value.legs.length || value.legs.length > 40) throw new Error('A plan needs a name and 1–40 legs.');
  const legs = value.legs.map((leg, i) => {
    if (!MODES.includes(leg.mode) || typeof leg.from?.label !== 'string' || typeof leg.to?.label !== 'string' || !leg.from.label.trim() || !leg.to.label.trim() || leg.from.label.length > 200 || leg.to.label.length > 200) throw new Error(`Check the mode and both locations for leg ${i + 1}.`);
    return { seq: i + 1, mode: leg.mode, from: { label: leg.from.label.trim() }, to: { label: leg.to.label.trim() } };
  });
  const dates = {};
  for (const k of ['start', 'end']) { const date = value.dates?.[k]; if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Check the trip dates.'); if (date) dates[k] = date; }
  if (dates.start && dates.end && dates.start > dates.end) throw new Error('The end date must follow the start.');
  const manual_stops = (value.manual_stops || []).map(stop => {
    if (!Number.isInteger(stop.leg) || !legs[stop.leg - 1] || legs[stop.leg - 1].mode !== 'car' || typeof stop.note !== 'string' || stop.note.length > 500) throw new Error('Check the driving stops.');
    return { leg: stop.leg, ...(typeof stop.place_id === 'string' && stop.place_id ? { place_id: stop.place_id } : {}), note: stop.note };
  });
  if (new Set(manual_stops.map(s => s.leg)).size !== manual_stops.length) throw new Error('Use one stop record per driving leg; combine extra stops in its note.');
  if (manual_stops.length > 80) throw new Error('Too many stops in this backup.');
  const id = typeof value.id === 'string' && /^tp_[a-z0-9_-]{1,100}$/i.test(value.id) ? value.id : `tp_${crypto.randomUUID()}`;
  return { id, title: value.title.trim(), dates, legs, manual_stops };
}
export function readBackup(text) {
  if (text.length > 500000) throw new Error('This backup is too large.');
  const d = JSON.parse(text);
  if (d.schema_version !== 1 || !Array.isArray(d.plans) || d.plans.length > 100) throw new Error('Use a Rupert Travel backup.');
  const plans = d.plans.map(cleanPlan);
  if (new Set(plans.map(p => p.id)).size !== plans.length) throw new Error('Duplicate journeys in backup.');
  return plans;
}
