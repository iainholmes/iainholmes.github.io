// NWS forecasts for public trailheads only. Never receives saved Home or an address.
import { nyDateString, nyTimestamp } from './dates.js';
import { validPoint } from './routing.js';

export function nwsWeekend(data, weekend, { now = new Date(), url } = {}) {
  const p = data?.properties, issued = new Date(p?.updateTime);
  if (!Number.isFinite(+issued) || issued > now || now - issued > 3 * 86400000) throw Error('NWS forecast is stale or invalid.');
  const days = [weekend.start, weekend.end].map((date, i) => {
    const period = p.periods?.find(x => x.isDaytime === true && Number.isFinite(+new Date(x.startTime)) && nyDateString(new Date(x.startTime)) === date);
    if (!period?.detailedForecast) throw Error('NWS does not yet cover the recommendation weekend.');
    return { day: i ? 'Sunday' : 'Saturday', forecast: period.detailedForecast };
  });
  const nights = [weekend.start, weekend.end].flatMap((date,i) => {
    const period = p.periods?.find(x => x.isDaytime === false && Number.isFinite(+new Date(x.startTime)) && nyDateString(new Date(x.startTime)) === date);
    return period?.detailedForecast ? [`${i ? 'Sunday' : 'Saturday'} night: ${period.detailedForecast}`] : [];
  });
  return { kind: 'forecast', as_of: nyTimestamp(issued), checked_at: now.toISOString(),
    source: { label: 'National Weather Service', url, issued_at: issued.toISOString(), retrieved_at: now.toISOString() },
    days, summary: [...days.map(d => `${d.day}: ${d.forecast}`), ...nights].join(' ') };
}

export async function fetchWeekendForecast(point, weekend, { now = new Date(), request = fetch, signal } = {}) {
  if (!validPoint(point)) throw Error('A public trailhead coordinate is required.');
  const get = async url => {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' || parsed.hostname !== 'api.weather.gov') throw Error('Invalid NWS endpoint.');
    const response = await request(url, { signal, headers: { 'User-Agent': 'TheRupertAtlas/1.0 (https://iainholmes.github.io/rupert/)', Accept: 'application/geo+json' } });
    if (!response.ok) throw Error(`NWS source unavailable (${response.status}).`);
    return response.json();
  };
  const grid = await get(`https://api.weather.gov/points/${point.lat},${point.lng}`);
  const url = grid.properties?.forecast;
  if (!url) throw Error('NWS has no forecast for this trailhead.');
  const [forecast, alerts] = await Promise.all([get(url), get(`https://api.weather.gov/alerts/active?point=${point.lat},${point.lng}`)]);
  const conditions = nwsWeekend(forecast, weekend, { now, url });
  const active = (alerts.features || []).map(f => f.properties).filter(p => p && (!p.expires || new Date(p.expires) > now));
  conditions.alerts = active.map(p => ({ event: p.event, headline: p.headline || p.event, severity: p.severity || 'Unknown', expires: p.expires || null }));
  conditions.alerts_checked_at = now.toISOString();
  return conditions;
}

export function unavailableForecast({ now = new Date(), reason = 'Forecast source unavailable.' } = {}) {
  return { kind: 'unavailable', as_of: nyTimestamp(now), checked_at: now.toISOString(),
    summary: 'Current weekend forecast unavailable. Check the National Weather Service before leaving; no weather clearance is implied.', unavailable_reason: reason };
}
