// Reader-facing status only. Route geometry, classifications and provider values
// remain authoritative and are never changed by this presentation helper.
export function trafficCardStatus(result) {
  const levels = (result.features || []).map(f => f.properties.traffic);
  const known = levels.some(v => ['normal', 'mild', 'moderate', 'heavy', 'severe', 'closure'].includes(v));
  const partial = !levels.length || result.unknownSegments > 0 || levels.includes('unknown');
  const closed = levels.includes('closure') || result.incidents?.some(v => v.closed);
  const delay = result.provider === 'tomtom' ? result.delaySeconds :
    Number.isFinite(result.typicalSeconds) ? Math.max(0, result.seconds - result.typicalSeconds) : null;
  const delayed = Number.isFinite(delay) && delay > 0;
  const delayText = delayed ? (delay < 60 ? '<1 MIN DELAY' : `+${Math.round(delay / 60)} MIN DELAY`) : '';
  let status;
  if (closed) status = 'ROAD CLOSURE' + (delayed ? ' · ' + delayText : '');
  else if (delayed) status = delayText;
  else if (partial || !Number.isFinite(delay)) status = known ? 'PARTIAL DATA' : 'DATA UNAVAILABLE';
  else if (levels.every(v => v === 'normal') && !result.incidents?.length) status = 'CLEAR';
  else status = 'ROUTE INCIDENT';
  if (partial && (closed || delayed)) status += ' · PARTIAL DATA';
  return 'LIVE TRAFFIC · ' + status;
}

// Only states actually drawn on the selected route belong in its compact key.
// Heavy/severe share a color and reader label; no delay/coverage inference.
export function trafficCardKey(result) {
  const levels=new Set((result.features || []).map(f=>f.properties.traffic === 'severe' ? 'heavy' : f.properties.traffic));
  return [
    ['normal','No reported delay'],['mild','Minor delay'],['moderate','Moderate delay'],
    ['heavy','Major delay'],['closure','Closure'],['unknown','Indeterminate']
  ].filter(([level])=>levels.has(level)).map(([level,label])=>({level,label}));
}
