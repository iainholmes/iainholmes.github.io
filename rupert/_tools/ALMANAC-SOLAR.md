# Almanac solar calculation

The veil uses the existing public Chapel Hill reference, 35.913° N, 79.056° W. Its date comes from `America/New_York`, not the UTC date or an edition's weekend. Solar calculations are local and deterministic; no astronomical service is requested by the site. The moon calculation is independent and unchanged.

## October 21, 2026 verification

The former NOAA fractional-year Fourier approximation correctly selected October 21, but returned sunset **6:34 PM** and daylight **11h 07m**. For October 20 it returned **6:36 PM** and **11h 09m**. This was a solar approximation error at the displayed precision, not a demonstrated one-day indexing, time-zone or cache error. Its output happened to resemble the more accurate previous day's values.

Independent comparisons retrieved October 21, 2026 for the same coordinates:

| Eastern date | USNO sunrise (EDT) | USNO sunset (EDT) | NOAA unrounded daylight | Atlas corrected display |
| --- | --- | --- | --- | --- |
| October 20 | 7:27 AM | 6:34 PM | 666.532164 minutes | 6:34 PM · 11h 07m |
| October 21 | 7:28 AM | 6:33 PM | 664.396596 minutes | 6:33 PM · 11h 04m |

USNO's rounded October 21 endpoints differ by 11h 05m. Atlas instead rounds the interval between **unrounded** same-day events once: NOAA gives about 11h 04m 24s, hence 11h 04m. These are different rounding procedures, not different calendar dates.

## Calculation and conventions

Solar coordinates now use NOAA's Julian-century/Meeus equations. Each event receives NOAA's second evaluation at its estimated UTC event time. Sunrise and sunset are calculated separately for the same selected date. Sunset is rounded to the nearest minute and formatted in `America/New_York`; the unrounded elapsed daylight is rounded once to the nearest minute. Actual event-time formatting supplies EST or EDT correctly, including transition days. Julian days incorporate leap days and year changes without seasonal day-of-year indexing.

The retained 90.833° solar zenith convention describes the apparent upper solar limb at a level horizon, including standard refraction and solar radius. It is not civil twilight. Real terrain, observer height and atmospheric conditions can shift observed times; this remains a calculated almanac, not an observation or second-precision prediction.

Sources:

- [NOAA calculator equations](https://gml.noaa.gov/grad/solcalc/main.js), specifically `calcSunriseSetUTC` and the second evaluation in `calcSunriseSet`; [calculation details](https://gml.noaa.gov/grad/solcalc/calcdetails.html).
- [Former NOAA fractional-year approximation](https://gml.noaa.gov/grad/solcalc/solareqns.PDF).
- [USNO October 20](https://aa.usno.navy.mil/api/rstt/oneday?date=2026-10-20&coords=35.913,-79.056&tz=-5&dst=true) and [October 21](https://aa.usno.navy.mil/api/rstt/oneday?date=2026-10-21&coords=35.913,-79.056&tz=-5&dst=true), using standard offset −5 plus daylight saving (`isdst: true`).
- [USNO rise/set definitions and accuracy limits](https://aa.usno.navy.mil/faq/RST_defs).

`integrity-test.mjs` includes independent NOAA snapshots for these dates, DST changes, year boundaries and a leap day, plus exact Eastern-midnight regressions. Original lunar expectations remain unchanged. No displayed label, markup, stylesheet or publication data is changed by this correction; generated HTML receives canonical asset-cache updates only.
