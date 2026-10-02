// Calendar identity for the recommendation Saturday, independent of publication availability.
import { addDays, isoWeek, nyDateString, parseDate } from './dates.js';
import { SEASONS, seasonFor } from './options.js';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const ROMAN = ['I','II','III','IV','V'];

export function cycleWeekend(now = new Date()) {
  const date = nyDateString(now), { dow } = parseDate(date);
  // Sunday still belongs to the Saturday just passed; Monday starts the next cycle.
  const start = addDays(date, dow === 0 ? -1 : 6 - dow);
  return { start, end: addDays(start, 1) };
}

export function cycleIdentity(weekendStart) {
  const { y, m, d } = parseDate(weekendStart);
  const month = MONTHS[m - 1], ordinal = ROMAN[Math.ceil(d / 7) - 1];
  const season = SEASONS[seasonFor(weekendStart)].toUpperCase();
  return { month, ordinal, season, year: y, issue: isoWeek(weekendStart).week,
    label: `${month} ${ordinal} · ${season} · ${y}` };
}
