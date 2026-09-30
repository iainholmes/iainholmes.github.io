// Date helpers. All editorial time is America/New_York.
// Calendar dates ("2026-10-03") are treated as plain dates, never shifted by time zone.

export const TZ = 'America/New_York';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MON3 = MONTHS.map(m => m.slice(0, 3));
const DAYS3 = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

/** Parse "YYYY-MM-DD" into {y, m, d, dow} without time-zone drift. */
export function parseDate(s) {
  const [y, m, d] = s.split('-').map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return { y, m, d, dow };
}

/** Offset of New York from UTC, in minutes, at a given instant (e.g. -240 in summer). */
export function nyOffsetMinutes(instant) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: TZ, timeZoneName: 'shortOffset' })
    .formatToParts(instant);
  const tz = parts.find(p => p.type === 'timeZoneName').value; // "GMT-4"
  const m = tz.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
  if (!m) return 0;
  const sign = m[1] === '-' ? -1 : 1;
  return sign * (Number(m[2]) * 60 + Number(m[3] || 0));
}

/** The UTC instant for a New York wall-clock time on a calendar date. */
export function nyInstant(dateStr, time = '00:00:00') {
  const { y, m, d } = parseDate(dateStr);
  const [hh, mm, ss] = time.split(':').map(Number);
  const guess = Date.UTC(y, m - 1, d, hh, mm, ss || 0);
  // Two passes settle the offset across DST changes.
  let t = guess - nyOffsetMinutes(new Date(guess)) * 60000;
  t = guess - nyOffsetMinutes(new Date(t)) * 60000;
  return new Date(t);
}

/** Calendar date string for an instant, as seen in New York. */
export function nyDateString(instant) {
  const p = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' })
    .format(instant);
  return p; // en-CA gives YYYY-MM-DD
}

export function addDays(dateStr, n) {
  const { y, m, d } = parseDate(dateStr);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return t.toISOString().slice(0, 10);
}

/** ISO 8601 week for a calendar date: { year, week }. */
export function isoWeek(dateStr) {
  const { y, m, d } = parseDate(dateStr);
  const t = new Date(Date.UTC(y, m - 1, d));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((t - yearStart) / 86400000 + 1) / 7);
  return { year: t.getUTCFullYear(), week };
}

/** "Sat 3 Oct" */
export function shortDate(dateStr) {
  const { m, d, dow } = parseDate(dateStr);
  return `${DAYS3[dow]} ${d} ${MON3[m - 1]}`;
}

/** "Saturday 3 October" */
export function longDate(dateStr) {
  const { m, d, dow } = parseDate(dateStr);
  return `${DAYS[dow]} ${d} ${MONTHS[m - 1]}`;
}

/** "Sat 3 – Sun 4 October" (or across months: "Sat 31 Oct – Sun 1 Nov") */
export function weekendRange(start, end) {
  const a = parseDate(start), b = parseDate(end);
  if (a.m === b.m) return `${DAYS3[a.dow]} ${a.d} – ${DAYS3[b.dow]} ${b.d} ${MONTHS[b.m - 1]}`;
  return `${DAYS3[a.dow]} ${a.d} ${MON3[a.m - 1]} – ${DAYS3[b.dow]} ${b.d} ${MON3[b.m - 1]}`;
}

/** Publication line from an ISO timestamp: "Tue 29 Sep". */
export function publishedLabel(iso) {
  return shortDate(nyDateString(new Date(iso)));
}

/** "08:00" wall-clock time in New York */
export function nyTime(instant) {
  return new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false }).format(instant);
}

/** Minutes range → "30–40 min" or "1 h 40 – 1 h 55" */
export function minutesRange([a, b]) {
  const f = n => n < 60 ? `${n}` : `${Math.floor(n / 60)} h ${String(n % 60).padStart(2, '0')}`;
  if (b < 60) return `${a}–${b} min`;
  return `${f(a)} – ${f(b)}`;
}

/** Hours range → "About 2 h" / "2–3 h" */
export function hoursRange([a, b]) {
  const r = x => (Math.round(x * 2) / 2).toString().replace('.5', '½').replace(/^0½$/, '½');
  return r(a) === r(b) ? `About ${r(a)} h` : `${r(a)}–${r(b)} h`;
}
