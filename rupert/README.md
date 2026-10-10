# The Rupert Atlas

A self-contained static site under `/rupert/`. It shares nothing with the rest of the repository except Jekyll's copy step: pages have no front matter, and `_tools/` and `_private/` are never published because of their leading underscore.

## One entry point

```
node rupert/_tools/rupert.mjs build     # validate everything, write data/editions/index.json, render every page
node rupert/_tools/rupert.mjs check     # validate only; exits 1 on any error
node rupert/_tools/rupert.mjs test      # edition-selection tests (time zone, Tue/Thu, rollover, DST, ISO weeks)
node rupert/_tools/rupert.mjs audit [--history]
                                        # public-data and privacy audit of everything Jekyll would publish;
                                        # --history also checks every photo blob the branch would push
node rupert/_tools/rupert.mjs photo SOURCE --id ID --provenance archive --alt "…" [options]
                                        # prepare an image (Python helper), then build
```

`build`, `check`, `test` and `audit` need only Node 18+.

`photo` also needs Python 3 and the packages in `_tools/requirements.txt`:

| Package | Why |
|---|---|
| `Pillow`, `numpy` | Always needed |
| `pillow-heif` | For iPhone HEIC originals |
| `rembg[cpu]` | Cuts out the subject for prints. On first use it downloads a ~180 MB model to `~/.rembg`. Without it, pass `--no-cutout`. |

```
python3 -m pip install -r rupert/_tools/requirements.txt
```

Internal helpers, which `rupert.mjs photo` calls for you: `_tools/prep_photos.py` (sizing, metadata stripping, registry) and `_tools/make_print.py` (the field-print treatment).

## Images: three layers

`--kind` is required, because each layer does a different job:

| Kind | What it is | Where it belongs |
|---|---|---|
| `photograph` | The documentary record | Field Log entries, completed adventures, personal memories |
| `print` | The Atlas's signature field print, made from a photograph: cut out, parchment halo, printed background, ochre collar | This Week, edition covers, archive treatments, seasonal moments |
| `plate` | An occasional illustrative or editorial graphic (landscape, water, ridge, sun), imported as-is | Special interludes. Always `--provenance editorial`. |

- **Public copies** in `photos/` carry pixels only: no EXIF, GPS, camera, XMP or ICC data. `check` fails on any JPEG that carries metadata, and on any file in `photos/` that isn't listed in `data/photos.json`.
- **Private context** from the original is kept in `_private/originals.json`: filename, capture time, camera and GPS if present. That file is git-ignored, and `check` fails if `.gitignore` stops covering `_private/`.

Every image has a **provenance**, and the site prints it with the image:

| Provenance | Meaning | Required fields |
|---|---|---|
| `documentary` | Taken at `place_id` on `taken_at`. The caption may name that place. | `place_id`, `taken_at` |
| `archive` | A real photograph whose place is unknown or unrelated to where it's used. It is never captioned as the edition's place. | none |
| `editorial` | Chosen or made for mood. Implies no place. | none |

`check` fails if an edition uses a documentary image from a different place, or if a plate isn't editorial.

Print options:

| Option | Values |
|---|---|
| `--ground` | `lake`, `pine`, `ochre`, `slate`, `rust`, `red`, `parchment` |
| `--threshold` | Ink share of the subject |
| `--background` | `print` or `plain` |
| `--scene` | `none`, `water` or `ridge` |
| `--no-collar` | Turns off the ochre spot colour on Rupert's collar |
| `--tones 3 --mid 0.18` | **Experimental.** Adds a hatched, engraved midtone that keeps faces and coat detail a hard two-tone split can lose. It is the hook for a fuller engraved style later. |

## Atlas

`atlas/` is a register that always works, plus a map the browser adds on top.

- `assets/js/core/atlas.js` is pure: it turns released editions and optional browser-local Field Log history into independent editorial/visit states, markers and bounds.
- The UI (`assets/js/atlas-view.js`) reaches the map only through `assets/js/map/maplibre-provider.js`.
- Tile hosts, the style and the relief source live in `assets/js/map/style.js`.
- MapLibre GL JS 5.24.0 is vendored in `vendor/`.

Map states use shape as well as colour:

| State | Marker |
|---|---|
| Recommended | Filled ochre circle |
| Visited, still recommended | Pine circle with a check |
| Withdrawn, whether visited or not | Red warning circle |
| Planned | Open diamond |
| Register only | Small ring |

Failure drills:

| URL parameter | Simulates |
|---|---|
| `?maptest=notiles` | Tile host failure |
| `?maptest=nowebgl` | No WebGL |
| `?maptest=offline` | Offline |
| `?maptest=nosize` | A map box with no height (the first iPhone RC bug) |

The map counts as ready only once it has **drawn**: the box and canvas have a real size, WebGL is alive, and basemap features are on screen. MapLibre's `load` event alone isn't enough. If it loads but can't draw, the page says so (`size`, `blank` or `lost`) instead of leaving an empty box.

A real stall shows a timeout message after 12 seconds. In every case the register stays usable. `?qa=1` adds a diagnostics panel (see `_tools/IPHONE-QA.md`).

## Editions

Editions live in `data/editions/<ISO week>-<tue|thu>.json`, validated against `schema/edition.schema.json`. Tuesday and Thursday are two separate choices for the same weekend.

`condition_level` sets the weather treatment:

- `"adverse"`: storms, dangerous heat, flooding, closures or ice. Shows Field Red plus the word "Warning" and a triangle.
- `"normal"`: everything else. Shows in ink.

### Publishing a new weekend

Prepared recommendations remain `draft`. Their `published_at` records the intended Tuesday/Thursday 07:00 Eastern slot until genuine release. The clock does not promote a draft, create a Directory entry or reveal its This Week slot.

Use the guarded release procedure in [_tools/PUBLISHING.md](_tools/PUBLISHING.md). It refreshes the NWS weekend forecast at the public trailhead, requires a publication-day official access check and an editorial review of the actual refreshed evidence, validates all canonical content/artwork, and records the actual release instant. Never pre-mark a future draft as published to simulate scheduling.

The release build regenerates This Week, Full Editions, Archive and Atlas from one manifest. This Week, Archive and the Directory/map also recheck the manifest every minute and on resume. Directory counts, markers, picker and edition links use the same genuine-publication gate; historical and withdrawn entries remain available. Manifest revisions also refresh a corrected forecast without needing a new edition ID.

Weather is a dated snapshot, with source issue/retrieval timestamps. The original outlook is retained in `data/conditions-history.json`. A failed forecast is explicitly unavailable, never an invented benign forecast. An editor still checks closure, dog policy and safety before publication.

Full Edition Drive facts use the existing device-local Home and shared OSRM router when available; otherwise they identify the editorial Chapel Hill reference estimate. No residential address or Home coordinates belong in public editorial data.

## Before merging

- Build and browser rendering use the real clock in America/New_York. No prototype clock override remains.
- Nothing here is private once merged. `noindex` and staying out of the site's navigation are not privacy controls.

## QA records

- `_tools/MAP-TESTS.md`: desktop map tests (passed), tap-target tests, and access-point verification.
- `_tools/IPHONE-QA.md`: real-iPhone checklist and how to serve the branch to a phone over Wi-Fi. Build 2 passed on a real iPhone.
- `_tools/PUBLISHING-TEST-W41.md`: the end-to-end publishing test, and every step that needed a person.

## Closing refinement

The Rupert Atlas uses self-hosted VELENOR for its masthead and page-level titles, Latin Modern Roman Dunhill for secondary editorial headings, and Latin Modern Roman for reading text and controls. The licensed Dunhill regular and oblique fonts live within `assets/fonts/`. Blue fields frame cream reading sheets; copper marks actions and editorial details. Atlas and Travel have compact, subtly distinct blue banners and smaller pose-specific Labrador outlines. Field Log has a dog-only right banner. The footer pairs the year with a decorative Rupert head.

The published-history Place Directory remains a shallow, horizontally scrolling desktop strip with a 280px minimum card width. Dynamic desktop map sizing is preserved. Tablet and phone use a place picker and expandable history. Frame Map contains camera scopes; compact Home and Relief controls sit directly above the route/status overlay. Home requires a locally saved home point. Menus close on fine-pointer departure with a short grace period, retain keyboard focus and touch behavior, and return focus on Escape; historical content disclosures retain their existing behavior.

Travel now follows Plan, Choose a Route, Build the Journey and Itinerary. Origin and destination come first. OSRM alternatives are deduplicated by corridor geometry and timing, with at most three families and no forced extra options. A hidden opportunity heuristic bounds corridor discovery to eight areas. Keyless OpenStreetMap Overpass lookups supply varied trip-local activities, separate from the published Directory and editorial cooldown. Named places, dog-access confidence, source links, estimated corridor detours and activity durations remain visible; policies and opening hours require confirmation. Provider errors produce explicit retry feedback and a bounded cooldown.

Adding, removing or reordering an along-route activity rebuilds road legs and arrivals. Route-defining towns can change the corridor. Destination activities append after arrival without rerouting the driving journey; local transfers are excluded. Optional overnight areas create a new travel day with at least ten hours of rest. Very long remaining legs stay flagged. Arrival estimates use the departure clock throughout, with an explicit time-zone caveat. Whole-route fitting uses complete route geometry and endpoints, with Travel minimum zoom 2; activity markers do not set whole-route bounds.

Save/Open retain trip activities, route geometry and local artwork. Backup import/export preserve stable identifiers and existing plans. Advanced/manual car, flight, ferry, rail and walking legs remain available, including persisted road geometry and schematic transit connectors. Travel automatically composes a local Rupert postcard, preserving custom captions and optional replacement artwork. Saved trips, home and Field Log memories stay in browser storage; no itinerary goes to an image service.

This Week separates authored Saturday/Sunday forecasts from trail advice without inventing weather. Future editions may use structured `conditions.days` and `trail_note`; prose continues to format automatically. Phone bottom padding provides 50px of breathing room. Full-edition information boxes use an 8% lake-blue wash. Archive uses a 25/75 desktop filter/results layout, 30/70 tablet layout and stacked phone layouts, with smaller editorial index entries.

The whole Atlas has a scoped standalone manifest, deep-blue theme/background, Apple touch icon, 192/512 icons and maskable variants derived from the approved Rupert vector language. Safe-area CSS and existing browser-local storage remain in place. `_tools/FINAL-BUILD-QA.md` records the final regression and rendered checks, including genuine browser/hardware limitations.

The main recommendation and its subordinate contingencies carry `seasons` and `experiences`. These are editorial suitability tags, separate from the publication season. Historical route snapshots, sources and publish dates remain intact. The Archive contains one entry per Tuesday or Thursday recommendation; search and filters apply only to that main recommendation. Clear filters restores the paired pending Thursday slot and its scheduled publication date. Future editions are still excluded by the existing publication-time selection.

Home setup is browser-local under `rupert-location-v1`. The public build contains no residential address or coordinates. Address lookup is an explicit form submission to Nominatim; coordinate entry also works directly. Routing is opt-in, with disclosure beside its checkbox: OSRM receives the home and selected public trailhead coordinates. Its road geometry is highlighted in ochre, with estimated drive duration and mileage shown on the map; it does not include live traffic. Turning routing off, forgetting home, clearing selection clears the route and cancels pending requests. Home view uses zoom 10 centered on the saved point; the direct Home control is disabled when that information is unavailable. Motion follows the reduced-motion preference.

Relief has stronger hillshade, visible on/off labels, provider-failure feedback and terrain diagnostics in `?qa=1`. The map uses a light cream and forest palette with cool water tones; automatic dark switching is removed in the calibration pass.

`_tools/test.mjs` covers combined option filters, season boundaries, all suggestion tags, backup round trips and invalid imports, coordinate validation, route geometry/time and failures, and relief style changes alongside the existing publication timing tests.

Crowd metadata integrates the separately reviewed ca9612d change. All existing outings are explicitly unassessed; no crowd observations were invented. Search, season, activity and crowd tolerance match only the main recommendation. Full Edition crowd bars distinguish typical crowd level from perceived crowding; factual details appear only when recorded. See CROWD-METADATA.md.


## Replacing an unavailable recommendation

`node rupert/_tools/replace.mjs ORIGINAL_ID CANDIDATE.json [CANDIDATE.json ...] --at REVIEW_TIMESTAMP` previews the lifecycle; add `--apply` to write and rebuild. Candidates are evaluated immediately in supplied editorial order. The original becomes Withdrawn with a correction while a separately identified revision (for example `2026-W40-r1-tue`) takes its active slot. Both remain in the Archive. Closed, disputed, stale, unverified and secondary-source-only candidates cannot publish. The command validates the full site and rolls back source writes if those checks fail. It refuses to overwrite an existing replacement.

This static site does not run a background crawler or invent fresh official evidence. An editor must supply a candidate queue, new artwork and a current official-manager check, plus a real forecast review. Run this command immediately when a recommendation becomes unavailable; refresh rejected candidates before considering the slot empty. A withdrawal without a replacement is allowed only when the queue yields no credible officially validated option. A build failure never deploys anything. The existing `build`, `check`, `audit` and rendered release review still apply before publication.

### September 30 replacement

The current Tuesday slot for October 3–4 was replaced on September 30 with Hillsborough Riverwalk and Gold Park. The September 29 Cox Mountain record remains withdrawn. Town pages confirm ordinary opening hours and Gold Park access, dog-park rules and storm/flood limitations; no current closure was found on the reviewed listings and news page. The Town’s October 4–6 notice names Sunday races on Riverwalk. NWS Hillsborough, updated September 30 at 2:18 p.m. EDT, forecasts a 50% Saturday shower chance (mainly after 8 a.m.) and 70% Sunday chance with possible afternoon thunderstorms. Saturday’s short daylight window is provisional; fresh notices, radar and on-site barriers take priority.

The transparent Travel Labrador is an approved engraved print element. Its PNG is stripped to pixel chunks (IHDR, IDAT, IEND); the public audit rejects any ancillary metadata or trailing bytes. Postcards are assembled and saved in the browser, with no itinerary sent to an image service.


## Published Directory and renewable recommendations

The Atlas Directory and markers now come exclusively from published primary recommendations whose publication time has passed. Withdrawn publications retain a clearly marked historical entry. Each place links to its latest edition and, after repeat publication, its earlier history. Draft/future recommendations, contingency options, Travel activities and unplanned Field Log memories do not earn Directory entries. Travel uses separate, ephemeral public-data discovery for the active trip; those activities never enter published history.

The shared reuse policy enforces 180 days since the latest publication of the same experience, or 365 days when explicitly supplied private history marks it completed. A place visit alone does not trigger the completion cooldown. A documented, materially different experience at the same place can use 120 days; changing its title, ID or route version alone does not qualify. Stable `flagship.experience_id`, a substantive `difference_note`, and a different route/activity or comparable structured `experience_basis` identify the new experience. Curated seasons and optional `event_window` restrict eligibility further. Repeats need a new edition ID, fresh official access evidence, a recent snapshot/forecast and newly owned artwork. The old edition is preserved, and the new one displays a Previously suggested link.

Append dated checks to `data/access-checks.json` when a place is reviewed again; retain its prior evidence. The publication gate selects the newest check available at that edition's publication time. A later closure blocks a new suggestion without rewriting an earlier Archive record; conflicting checks on the same day conservatively use the negative status.

Rank an authored queue locally with `node rupert/_tools/recommend.mjs CANDIDATES.json --at TIMESTAMP --history PRIVATE_HISTORY.json`. Candidate `suitability_score` is editorial judgment; recent trail-heavy history raises credible café, patio, pup-treat, market, shopping, garden, water, town, campus, scenic-drive, ferry, picnic and event choices. Unfamiliar places receive a modest preference, while completed experiences receive a substantial penalty. Ranking reports access problems and never publishes automatically.

The Field Log's separate **Export recommendation history** supplies only canonical IDs and dates, never memories, notes, photographs or Home. Give the ignored minimal file to the draft release guard with `node rupert/_tools/publish.mjs release --history PRIVATE_HISTORY.json`, or deliberately place it in `rupert/_private/recommendation-history.json`. Existing explicit `--log` inputs remain compatible; legacy records do not imply completion. Browser-local memories cannot be read by the publisher, and personal information never enters generated pages or retroactively invalidates historical editions. See [_tools/EXPERIENCE-HISTORY.md](_tools/EXPERIENCE-HISTORY.md) for classification, corrections, backup portability and the private editorial workflow.

`npm --prefix rupert test` includes cooldown boundaries, category variety, history provenance and the separation of Travel/Field Log from the Directory. `npm --prefix rupert run dev` serves a dependency-free local preview; `_tools/visual-qa.html` provides fixed-width desktop, laptop, tablet and iPhone frames and computed-font checks. `_tools/` is excluded from GitHub Pages.
