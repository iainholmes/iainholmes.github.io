# The Rupert Atlas — final Travel build and finishing pass

Branch: `atlas/final-travel-finish-20261002`  
Base: `c76a72aa0dd1be3f32f161b2f2579e300b4f70c8`  
Release identifier: the commit containing this report. The exact SHA and deployed Pages verification are included in the final delivery.

## Scope and preservation

Only `/rupert/` changes. Periodicals and every other repository path are untouched. No place records, source editions, access checks, publication index, photo ownership or recommendation history changed. Riverwalk and Company Mill remain published; Cox Mountain remains withdrawn. Tuesday/Thursday publication timing, cooldown rules, public-history membership, noindex/nofollow, map camera scopes and browser-local privacy remain intact. Directory expansion uses runtime QA fixtures under `_tools/`; no fake places enter production data. QA journeys use public city names and public mapped places. No residential address, private home point or API secret was added.

## Regression gate

`npm --prefix rupert test`: **201 checks passed**.

| Suite | Checks |
|---|---:|
| Existing core, publishing, backup, routing, local-data and relief tests | 36 |
| Corrective publication / withdrawal | 9 |
| Replacement lifecycle | 12 |
| Publication history, cooldown, variety and provenance | 40 |
| Camera framing | 14 |
| New final-build regressions | 90 |

`npm --prefix rupert run build`, `node rupert/_tools/rupert.mjs check` and `node rupert/_tools/rupert.mjs audit --history` pass. No existing tests were weakened. New regressions cover duration labels, deduplication and route caps, full geometry bounds (including a 150,000-point case), selected-stop leg creation/order, overnight clocks, activity policies and query diversity, backup geometry, manual transit modes, weather parsing, menu behavior hooks, direct map controls, typography, Archive structure and PWA references.

Existing advisory warnings remain: approximate contingency pins for Carolina North Forest and Duke Forest; W41 Thursday is a training mission. These records were preserved.

## Actual rendered viewport matrix

Chrome rendered the actual generated site inside fixed-size review frames. The raw computed DOM records, fixtures and saved-trip diagnostics are in `FINAL-VIEWPORT-EVIDENCE.json`.

| Viewport | This Week | Atlas | Travel | Field Log | Archive | Current full edition |
|---|---|---|---|---|---|---|
| 1440 × 900 desktop | Pass | Pass | Pass | Pass | Pass | Pass |
| 1366 × 768 short laptop | Pass | Pass | Pass | Pass | Pass | Pass |
| 834 × 1112 tablet | Pass | Pass | Pass | Pass | Pass | Pass |
| 390 × 844 phone portrait | Pass | Pass | Pass | Pass | Pass | Pass |
| 844 × 390 phone landscape | — | Pass | Pass | Pass | Pass | — |

All 28 recorded cases have no page-level horizontal overflow and loaded the three intended font families. Screenshots were inspected for all six desktop/portrait pages and the four critical landscape pages; tablet geometry and font checks were inspected. These are responsive browser frames, not physical iPhone or installed-mode certification. All six live public pages were also inspected at the browser’s native 1363 × 936 viewport. A live Chapel Hill → Durham journey, Carrboro split, Save/Open restoration and automatic postcard were verified after deployment. Final deployed-asset byte verification and the final SHA are reported in the delivery.

## Travel implementation and real-provider QA

The normal order is **Plan → Choose a Route → Build the Journey → Itinerary**. Origin/destination precede dates, departure and detour tolerance. Manual Add Leg remains inside Advanced / Manual Legs. The Trip Table follows planning choices. Lookup stays explicitly opt-in, naming Nominatim, OSRM and Overpass and explaining that locations are sent to those providers.

| Public test journey | Initial route | Families | Actual changes and restoration |
|---|---|---:|---|
| Chapel Hill → Durham | 11 mi · 24 min | 1 | Carrboro added/removed; Carrboro + Hillsborough split into three routed legs, reordered and removed. Daisy Cakes/The Parlour appended after arrival, reordered/removed. Saved trip restores Carrboro, Daisy Cakes and two road legs (14 mi · 32 min driving). |
| Chapel Hill → Asheville | 221 mi · 4 h 21 min | 1 | Real café/bakery suggestions added; three road legs, reorder and removal verified. Final saved test uses Mocksville and restores two legs, 222 mi · 4 h 30 min driving. |
| Chapel Hill → Seattle | 2,821 mi · 50 h 37 min | 2 | Alternative: 2,874 mi · 51 h 33 min (+56 min), with a different OSRM corridor. Nashville overnight and Kansas City added; three legs, reorder and removal verified. Final Nashville itinerary restores two legs, 2,914 mi · 51 h 57 min driving and the custom postcard caption. |

Near-identical OSRM alternatives are aggressively deduplicated; the cap is three, and one route is shown when only one survives. Labels stay factual: Most direct, Alternative, and actual corridor names. Activities do not create route families. Along-route suggestions use up to eight hidden opportunity zones; no repetitive generic break rows are inserted. Adding/removing/reordering selected stops routes all affected legs and updates arrivals. Route-adjacent selections use corridor guide points; route-defining towns can change the corridor. Failed route rebuilds keep the previous itinerary. Save/export wait for pending route updates; Save reads the latest stored trips and other tabs refresh their saved lists. A two-tab save test retained all three QA journeys.

Discovery uses **19** OpenStreetMap taxonomy entries covering treats, cafés, bakeries, outdoor meals/breweries, parks/gardens, named paths/greenways, piers/boardwalks, beaches/swimming, viewpoints/picnics, roadside attractions, markets/farm stands, garden/outdoor shops, campuses, towns, ferries and overnight leads. Each named lead has mapped coordinates, source links, dog-access confidence, a suggested duration, fit explanation and approximate corridor detour information. Approximate lateral detours are explicitly distinguished from the actual OSRM calculation performed when a stop is added. Dog-prohibited/private places are excluded. Unknown dog policies are plainly marked; community tags do not become official access claims. Destination activities remain separate, append after arrival and save with the trip; local transfers are excluded from driving totals.

Live public-data testing returned 12 varied Durham destination leads and 18 regional leads, including cafés, bakeries, patios, markets, parks and viewpoints. Continental destination discovery returned 12 leads during a successful request, including cafés, parks and waterside areas, but other attempts failed. Overpass requests are serialized, bounded to 25 seconds and use a provider cooldown after availability/rate errors; affected areas show honest retry feedback. No paid service, API key, fabricated candidate or publication cooldown is involved. Travel never publishes to the Directory or Archive. Previously published places can link to their history.

Six named continental overnight areas were surfaced (Ohio, Illinois, Iowa, South Dakota and Montana). Choosing Nashville creates Chapel Hill → Nashville (arrive 2026-10-03 18:40), an overnight departure at 2026-10-04 09:00, then Nashville → Seattle. At least ten hours of rest are preserved; subsequent oversized legs remain flagged. All ordinary durations use minutes below an hour and hours/minutes above it. Arrival clocks use the departure time zone throughout, with an explicit UI note to allow for local time-zone changes.

### Whole-route fit result

Fit Route and saved restoration were exercised for all three journeys. Every restored route coordinate is within the whole-journey bounds. The Seattle-with-Nashville snapshot contains 11,983 route coordinates; bounds run from `[-122.340924, 35.850296]` to `[-79.043841, 47.724312]`. Whole-route bounds use route geometry plus endpoints, excluding activity markers. Travel minimum zoom is 2, with 36px phone / 60px desktop padding. Choosing a family fits its complete route; Back to Whole Route and Fit Route restore those bounds.

**Rendered camera fit cannot be certified in this environment: Cloud Chrome has no WebGL.** The map provider correctly reports unavailable while route choices, itinerary, saves and local postcards remain usable. Geometric coverage, bounds plumbing and minimum zoom were verified; a real WebGL-capable browser is still needed to confirm the visible continental map and direct Home/Relief actions.

Automatic postcards remain local, with the approved simplified engraved Rupert, ochre collar and restrained Atlas palette. Custom captions survive regeneration and reload. Replace Artwork remains available. Advanced car/flight/ferry/rail/walk legs and schematic transit connectors remain; their geometry and manually supplied timings now persist. Backup round trips, validation, stable identifiers and existing-plan preservation pass automated checks. An actual exported-file download could not be captured by the browser automation event API; the export handler and backup validation were checked.

## Sitewide finishing results

| Requirement | Result |
|---|---|
| VELENOR / Dunhill / Roman hierarchy | Self-hosted licensed Dunhill regular/oblique for secondary headings; VELENOR remains masthead/page H1/full-edition title; body, controls and metadata retain Roman. Computed fonts verified, including the separately loaded Field Log stylesheet for section, year-group and memory headings. Travel saved-trip headings and import/replacement labels use readable cream on blue. |
| Compact banners | Atlas/Travel/Field Log measure 142px desktop with 100px dogs; 128px tablet with 88px dogs. Phone dogs 72px; Travel 108px, Atlas 154px including functional context, Field Log about 130px with a two-line title. Standing/walking/sitting poses preserved. |
| Blue-page hierarchy | Atlas/Travel use #26384C banners and a restrained copper hairline against #1D2A3A. Cream reading areas remain. |
| Banner kicker removal | Ordinary ornamental accents removed; This Week weekend eyebrow, edition publication context and masthead metadata preserved. |
| Choose a Place | Idle context is empty/hidden. Selection shows actual region/access information if available. Show on Map remains. |
| Field Log | Right banner contains only the sitting Labrador. Field Log records, photos and local backup behavior preserved. |
| Menus | Runtime fixture passes fine-pointer leave, touch retention, keyboard retention, Escape close and focus return. Only menu/settings/popover disclosures receive this behavior. |
| Home / Relief | Compact paired row immediately above map driving/status overlay; absent home data disables Home; Relief retains real toggle, aria-pressed and persistence. Both removed from Frame Map. |
| Directory growth | 20-record DOM fixture: all cards 280px, one row, 5,904px scroll width, 4,663px horizontal scroll, no page overflow. Short-laptop map workspace fits. Phone picker/history preserves a 574px map. Production history remains three records. |
| Weather | Saturday/Sunday authored forecasts separated, then trail note and source context. No invented temperature/probability. Structured future-day fields supported; prose formats automatically. Adverse-condition treatment retained. |
| This Week bottom spacing | 50px explicit phone bottom padding; internal content positions preserved. |
| Full-edition side boxes | Restrained 8% lake-blue/cream wash, dark readable text, existing square/rule language and Dunhill headings. |
| Archive layout | Desktop computed columns 302.266px / 906.797px (25/75, gap excluded); tablet 215.078px / 501.891px (30/70). Portrait and short landscape phones stack. |
| Archive result scale | Secondary title 26px versus 32px, thumbnails 118px versus 160px, 14px metadata and reduced gaps; blue weekend bars remain strong. |
| Footer | Year + decorative copper Rupert head outline, 30px desktop / 28px phone; aria-hidden. |
| PWA identity | Whole-Atlas scope/id/start URL, standalone display, deep-blue theme/background, 180px Apple icon, 192/512 icons and maskable variants. Recognizable brown Rupert head, ochre collar, no text; pixel-only PNG metadata audit and dimensions pass. |
| Accessibility | Labels, keyboard routes, visible focus, menu Escape, reduced motion, safe-area CSS, touch paths and overflow checks preserved. No hover-only essential workflow. |

## Remaining limits

- WebGL is unavailable in the QA browser; actual basemap rendering, continental camera fit and rendered Home/Relief operation require a capable browser.
- No physical iPhone or installed Home Screen session was available. Manifest/icon/head references, responsive layouts and safe-area/standalone CSS were checked; real install, safe-area painting and persistent storage in installed mode were not certified.
- Keyless public discovery is intermittently unavailable and community data cannot certify dog access, opening hours or accommodation policy. The UI identifies those limits and keeps routing/saved plans usable.
- Download completion could not be captured by the browser automation event API; backup serialization/import validation passed.

## Changed files

- `rupert/README.md`
- `rupert/_tools/FINAL-BUILD-QA.md`
- `rupert/_tools/FINAL-VIEWPORT-EVIDENCE.json`
- `rupert/_tools/finish-test.mjs`
- `rupert/_tools/preview.mjs`
- `rupert/_tools/rupert.mjs`
- `rupert/_tools/visual-qa.html`
- `rupert/archive/index.html`
- `rupert/assets/css/atlas.css`
- `rupert/assets/css/field-log.css`
- `rupert/assets/fonts/README.txt`
- `rupert/assets/fonts/lmromandunhill-oblique.otf`
- `rupert/assets/fonts/lmromandunhill-regular.otf`
- `rupert/assets/img/icons/apple-touch-icon.png`
- `rupert/assets/img/icons/icon-192.png`
- `rupert/assets/img/icons/icon-512.png`
- `rupert/assets/img/icons/maskable-192.png`
- `rupert/assets/img/icons/maskable-512.png`
- `rupert/assets/img/rupert-outline.svg`
- `rupert/assets/js/atlas-view.js`
- `rupert/assets/js/core/discovery.js`
- `rupert/assets/js/core/journey-storage.js`
- `rupert/assets/js/core/journey.js`
- `rupert/assets/js/core/menus.js`
- `rupert/assets/js/core/render.js`
- `rupert/assets/js/core/routing.js`
- `rupert/assets/js/core/travel.js`
- `rupert/assets/js/core/trip-map.js`
- `rupert/assets/js/core/weather.js`
- `rupert/assets/js/field-log-view.js`
- `rupert/assets/js/location-view.js`
- `rupert/assets/js/map/maplibre-provider.js`
- `rupert/assets/js/site.js`
- `rupert/assets/js/travel-view.js`
- `rupert/atlas/index.html`
- `rupert/edition/2026-W40-r1-tue/index.html`
- `rupert/edition/2026-W40-thu/index.html`
- `rupert/edition/2026-W40-tue/index.html`
- `rupert/edition/2026-W41-thu/index.html`
- `rupert/edition/2026-W41-tue/index.html`
- `rupert/edition/index.html`
- `rupert/index.html`
- `rupert/log/index.html`
- `rupert/manifest.webmanifest`
- `rupert/package.json`
- `rupert/schema/edition.schema.json`
- `rupert/travel/index.html`
