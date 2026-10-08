# Production recovery — 8 October 2026

Baseline: master `5fd637205fe23cf28be8eca2c89814f9406ed28c`, fetched again before release. Its deployed Atlas assets matched source. No Atlas publishing workflow exists; the old Rupert brief automation was disabled and was not a publisher. The README described a manual refresh/build/release. There is no execution evidence tying this missed release to Work usage. Thursday was correctly withheld as a draft.

The Directory/map consumed generated HTML and inline marker JSON only, whereas This Week rechecked the publication manifest. A build before Tuesday release thus retained three historic places. New runtime updates and the build share `atlasModel`/`isReleased`; no draft earns a place. History retains Cox Mountain as Withdrawn. The five-place released catalog contains Riverwalk, Company Mill, Cox Mountain, Occoneechee Mountain and Raven Rock.

Forecast updating was only an instruction, not a process. Repeat recommendations had a freshness gate, but first publications could retain an old outlook. The guarded command refreshes NWS and requires release-day official access and substantive editorial review for every draft. Scheduled editorial publishing is enabled in the connected task service at Tuesday/Thursday 07:00 Eastern, with 08:00/09:00 retry opportunities. Timing does not alter publication status. Its first future scheduled execution has not yet occurred.

## Genuine evidence and recovery

Official NC State Parks home/trails and pet rules reviewed on 8 October:

- https://www.ncparks.gov/state-parks/raven-rock-state-park
- https://www.ncparks.gov/state-parks/raven-rock-state-park/trails
- https://www.ncparks.gov/state-parks/occoneechee-mountain-state-natural-area
- https://www.ncparks.gov/state-parks/occoneechee-mountain-state-natural-area/trails
- https://www.ncparks.gov/about-us/guidelines-park-rules-and-regulations

Official hiking status was Open. Raven Rock Loop: 2.6 miles; main access 3009 Raven Rock Road; October opening 07:00; attended pets on a leash up to six feet. Occoneechee: 2.2-mile loop; October opening 08:00; same pet rule. No active closure was shown on reviewed official pages; this is a dated check, not a guarantee of future access.

Actual NWS API `/points` and forecast/active-alert responses were fetched successfully using public trailhead coordinates. Latest refreshed source issue: **2026-10-08T20:48:13Z** (16:48:13 EDT).

- Raven Rock: https://api.weather.gov/gridpoints/RAH/66,42/forecast — Saturday high 72°F, rain 50% after 08:00; Saturday-night rain/thunderstorms 90%, 0.75–1 inch possible; Sunday thunderstorms 90%, high 79°F.
- Occoneechee: https://api.weather.gov/gridpoints/RAH/56,68/forecast — Saturday high 67°F, rain 40% after 14:00; Saturday-night rain 90%, 0.5–0.75 inch possible; Sunday showers/thunderstorms 90%, high 74°F.
- Both point-alert responses returned no active features at refresh. No closure or weather observation was invented.

Old Sep 28 outlooks and sources are preserved in conditions history. Current editorial advice is explicitly dry-Saturday-only, with wet footing/thunder/flooding/closure prompting postponement; another outdoor trail is not a thunderstorm substitute. Carry drinking water and stay out of rivers. Artwork and crowd data are unchanged.

The guarded canonical release passed and recorded Raven Rock at **2026-10-08T16:57:58-04:00**; nominal 07:00 is separately retained in the release ledger. Tuesday's original timestamp is unchanged. Repeating `release --apply` made no changes.

## Verification

Untouched-master source suite passed before editing. Final source/regression, build/check and public-data/history audit passed, including 80 new publication/forecast/synchronization assertions. Existing warnings for occasional training copy and two approximate historical planning pins were unchanged.

Browser results:

- Current-week lifecycle: 786 assertions, all representative natural/delayed states, reload/hash, archive, weekly rollover and standalone.
- Publication/Directory/edition Home: 154 assertions; status transitions, a subsequent new place, counts/markers/picker/links, retained active route, offline history, Home absent/success/failure/change/clear/reload, forecast correction on resume.
- Veil/refinement: 581 assertions, including Previous Week and Wednesday published Tuesday one-touch navigation underneath the veil.
- Crowd/almanac: 665 assertions, calendar/DST/phase agreement and responsive/standalone coverage.
- Traffic: 354 assertions with real MapLibre/OpenFreeMap and synthetic TomTom/OSRM responses; clear/partial/delay/closure, refresh, failure/rate-limit fallback and responsive states.

Focused Home/edition layouts included 375×812, 393×852, 430×932, 852×393, 1024×768 and 1440×1000, both normal and standalone-equivalent. No overflow or clipping. Portrait screenshot was inspected. Existing veil/traffic suites covered portrait, landscape and desktop. Real OSRM public-reference requests returned valid geometry: Occoneechee 22 min / 12.0 mi; Raven Rock 82 min / 52.0 mi. Browser saved-Home fixtures used public points, never a residential address.

No CSS, typography, artwork, traffic config/classification/router, veil rendering/lifecycle, crowd model or recommendation history was changed. Generated page import-map/cache versions were rebuilt; Travel/Field Log implementation and presentation are unchanged. All tracked edits are `/rupert/` only. Periodicals untouched.

Physical iPhone/Safari and actual installed-PWA testing are not available in this environment; automated standalone/resume and responsive behavior passed. The next scheduled publisher run requires future execution; publication gates and the actual recovery command are tested now. Deployment and public-byte verification are recorded in the completion report rather than asserted from a local build.
