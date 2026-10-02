// Local Saturday almanac at the existing PUBLIC Franklin Street reference. No private location input.
// Solar equations: https://gml.noaa.gov/grad/solcalc/solareqns.PDF (NOAA fractional-year approximation).
// Lunar coordinates/illumination adapted from SunCalc 1.9.0, Copyright (c) 2014 Vladimir Agafonkin.
// BSD-2-Clause terms are retained in SUNCALC-LICENSE.txt; based on Meeus, Astronomical Algorithms.
import { nyInstant, parseDate, TZ } from './dates.js';
const RAD = Math.PI / 180, DAY = 86400000;
const PUBLIC_CHAPEL_HILL = { lat: 35.913, lng: -79.056 };
const PHASES = ['New Moon','Waxing Crescent','First Quarter','Waxing Gibbous','Full Moon','Waning Gibbous','Last Quarter','Waning Crescent'];
const { sin, cos, tan, asin, acos, atan2 } = Math;

function moonPhase(instant) {
  const d = instant.valueOf() / DAY + 2440587.5 - 2451545;
  const obliquity = 23.4397 * RAD;
  const coords = (longitude, latitude) => ({
    ra: atan2(sin(longitude)*cos(obliquity)-tan(latitude)*sin(obliquity), cos(longitude)),
    dec: asin(sin(latitude)*cos(obliquity)+cos(latitude)*sin(obliquity)*sin(longitude)),
  });
  const anomaly = (357.5291 + .98560028*d)*RAD;
  const sun = coords(anomaly + (1.9148*sin(anomaly)+.02*sin(2*anomaly)+.0003*sin(3*anomaly)+102.9372)*RAD + Math.PI, 0);
  const meanMoon = (134.963 + 13.064993*d)*RAD;
  const moon = coords((218.316+13.176396*d)*RAD + 6.289*RAD*sin(meanMoon), 5.128*RAD*sin((93.272+13.229350*d)*RAD));
  const distance = 385001-20905*cos(meanMoon), solarDistance = 149598000;
  const elongation = acos(sin(sun.dec)*sin(moon.dec)+cos(sun.dec)*cos(moon.dec)*cos(sun.ra-moon.ra));
  const incidence = atan2(solarDistance*sin(elongation), distance-solarDistance*cos(elongation));
  const angle = atan2(cos(sun.dec)*sin(sun.ra-moon.ra), sin(sun.dec)*cos(moon.dec)-cos(sun.dec)*sin(moon.dec)*cos(sun.ra-moon.ra));
  const phase = .5 + .5*incidence*(angle<0 ? -1 : 1)/Math.PI;
  return PHASES[Math.round(phase*8)%8];
}

export function weekendAlmanac(date) {
  const { y, m, d } = parseDate(date);
  const dayOfYear = (Date.UTC(y,m-1,d)-Date.UTC(y,0,1))/DAY+1;
  const yearDays = (Date.UTC(y+1,0,1)-Date.UTC(y,0,1))/DAY;
  const gamma = 2*Math.PI/yearDays*(dayOfYear-1);
  const eqtime = 229.18*(.000075+.001868*cos(gamma)-.032077*sin(gamma)-.014615*cos(2*gamma)-.040849*sin(2*gamma));
  const decl = .006918-.399912*cos(gamma)+.070257*sin(gamma)-.006758*cos(2*gamma)+.000907*sin(2*gamma)-.002697*cos(3*gamma)+.00148*sin(3*gamma);
  const lat = PUBLIC_CHAPEL_HILL.lat*RAD;
  const hourAngle = acos(cos(90.833*RAD)/(cos(lat)*cos(decl))-tan(lat)*tan(decl))/RAD;
  const sunsetMinutes = 720-4*PUBLIC_CHAPEL_HILL.lng+4*hourAngle-eqtime;
  const sunset = new Date(Date.UTC(y,m-1,d)+Math.round(sunsetMinutes)*60000);
  const daylightMinutes = Math.round(8*hourAngle);
  return { date, sunset: new Intl.DateTimeFormat('en-US',{timeZone:TZ,hour:'numeric',minute:'2-digit',hour12:true}).format(sunset),
    daylight: `${Math.floor(daylightMinutes/60)}h ${String(daylightMinutes%60).padStart(2,'0')}m`,
    moon: moonPhase(nyInstant(date,'12:00:00')) };
}
