# Publishing test: W41 (Sat 10 – Sun 11 October 2026)

**Run:** 29 Sep 2026, on `rupert/foundation`.

**Goal:** add a new Tuesday/Thursday pair using only the existing schemas, place registry, image rules, tools and current-pair logic, with no design or structural change.

**Historical test result:** passed. The trace below describes the original publishing test; release cleanup is recorded at the end. W41 went in as data. The build produced both edition pages and moved This Week, the Archive and the Atlas along with no hand edits to any page or template. One tooling fix came out of the test (item 6 below). No design, layout or schema changes were made.

## What went in

| File | What it is |
|---|---|
| `data/editions/2026-W41-tue.json` | **Tuesday choice.** Occoneechee Mountain and the quarry overlook (flagship). Brumley Forest (local). Hanging Rock (away). Hillsborough Riverwalk (wildcard). |
| `data/editions/2026-W41-thu.json` | **Thursday choice.** Raven Rock and the stairs down to the Cape Fear (flagship). Carolina North (local). Umstead, Company Mill (away). Duke Forest, Korstian (wildcard). |
| `photos/rupert-plate-eno-ledge-{800,1400}.jpg` | Two new editorial plates, added through `rupert.mjs photo --kind plate --provenance editorial` |
| `photos/rupert-plate-bank-trail-700.jpg` | |
| `data/photos.json` | The two plates, registered by the photo command |
| `data/site.json` | `review_clock` moved to Thu 8 Oct 08:00, so the prototype shows W41 as current |

Every `place_id` was already in `places.json`, so no new coordinates were needed.

## What the pipeline did by itself

| Output | What happened |
|---|---|
| `data/editions/index.json` | Regenerated: 4 editions, with roles and photo ids |
| `edition/2026-W41-tue/`, `edition/2026-W41-thu/` | Full edition pages. Each links to the other choice for the same weekend. |
| This Week (`index.html`) | Shows W41: "Sat 10 – Sun 11 October", Tuesday and Thursday tabs |
| Archive | W41 added as "On this week now". W40 moved below it as an ordinary past weekend. |
| Atlas | Place statuses recomputed. The Hillsborough Riverwalk changed from register-only to Recommended, because W41 recommends it. |
| Masthead | Week label changed to "WK 41 · 2026" on every page |

**Clock trace.** `selectCurrentPair` against the built manifest:

| Time (New York) | This Week shows | Archive |
|---|---|---|
| Mon 5 Oct 12:00 | W40, "past" (last weekend) | W40 |
| Tue 6 Oct 06:59 | W40, "past" | W40 |
| Tue 6 Oct 07:00 | W41 Tuesday choice; Thursday shows "Publishes Thu 8 Oct" | W41 (Tue), W40 |
| Thu 8 Oct 07:00 | W41 both choices | W41, W40 |
| Sat 10 Oct 09:00 | W41, "now" | W41, W40 |
| Mon 12 Oct 09:00 | W41, "past" | W41, W40 |

**Pages checked:** This Week (390 px light and dark, 1280 px, the Tuesday-only state), both edition pages, and the Archive (390 and 1280 px). None scroll sideways.

**Checks:** `check`, `test` (12/12) and `audit` all pass: 59 public files, 6.5 MB, no metadata, coordinates on the allowlist.

**Reproducible:** rebuilt on the Mac from the committed data alone. The pages and manifest match the sandbox build byte for byte.

## Every step that needed a person

1. **Writing the editions.** This is editorial work and is expected to stay manual: choosing places and roles, research, then writing about 90 lines of JSON per edition. There is no scaffold command; copying last week's file is the practical start. The schema caught nothing because nothing was wrong, and the checker's advisory warning ("training mission — fine occasionally") worked as intended.

2. **Images.** No approved new artwork existed, and the Atlas uses no real photographs.
   - I drew two block-print plates in the Atlas palette: a river ledge under a low sun, and a moonlit river under a cliff. Rupert in each is cut from Iain's own illustrations.
   - Making a plate is outside the pipeline: `make_print.py` only turns photographs into prints. The plates were drawn with a one-off script, then imported through the normal `rupert.mjs photo` step. That step sized them, stripped them, registered them and wrote the private record.

3. **A caption edit after import.** "Night swim below the rock" became "Rupert and the river at night" in `photos.json` by hand, so the Raven Rock page wouldn't suggest swimming in the Cape Fear. The photo command has no way to update an entry's text.

4. **The forecast.** On 29 Sep only the NOAA 6–10 and 8–14 day outlooks reach 10–11 Oct. Both editions say "Outlook only" and promise the forecast on publication day. For real, the editor refreshes `conditions` and `headline_condition` on Tuesday and Thursday mornings. Nothing fetches it or warns when it's stale.

5. **Route facts reused by hand.** The flagship snapshots reuse W40's route ids (`raven-rock-loop@1`, 2.6 mi; `occoneechee-mountain-loop@1`, 2.2 mi). Sources disagree: Hiking Project gives Raven Rock as 2.2 mi. There is no route registry, so keeping the same distance for the same `@1` depends on the editor.

6. **A bug the test found, and the one tooling change.**
   - Problem: the schema accepted a date-only `conditions.as_of` ("2026-09-28"). The page read it as UTC midnight and printed "Forecast as of Sun 27 Sep, 20:00 ET", a day early.
   - Fix: `rupert.mjs check` now fails unless `as_of` has a time and offset.
   - The editions now use `2026-09-28T15:00:00-04:00` and print "Mon 28 Sep, 15:00 ET".

7. **The prototype clock.** `review_clock` was moved by hand from Thu 1 Oct to Thu 8 Oct, and its note updated. The clock override, banner, comparison controls and associated styles were subsequently removed for release.

## Decision for Iain: publishing ahead of time

GitHub Pages serves only what's committed.
- The build writes an edition's page as soon as it is marked `published`, even when its `published_at` is days away. At the old 1 Oct clock, both W41 pages were already written, though nothing linked to them.
- This Week and the Archive wait for the publication time: the page switches over in the browser at 07:00.
- Readers without JavaScript, and the pre-rendered HTML, show whatever the last build chose.

There are two ways to run this:

| Option | How it works | Trade-off |
|---|---|---|
| **A. Schedule ahead** (how it works now) | Commit the edition any time before Tuesday 07:00. It appears on This Week at 07:00 by itself. | Its URL is live, unlinked, from the push. |
| **B. Publish at the time** | Push on the morning. Optionally, a scheduled GitHub Action rebuilds at 07:00 on Tuesday and Thursday. | Nothing is early, but the push or the Action becomes part of every edition. |

Either works without design changes. B's Action would be new tooling, so it wasn't added in this test.

## Final release cleanup

- Replaced the initial Raven Rock illustration with the supplied bank-trail plate (Rupert on a leash). Imported the 700 px source through the existing metadata-stripping pipeline without upscaling.
- Removed the superseded image files and registry entry before squashing the local W41 commit; they must not appear in pushed ancestry.
- Removed the review clock configuration and code, banner, and masthead comparison controls. Builds and browser rendering now use real New York time.
- Archive badge reads “This Week”. Missing future slots derive “Publishes Thu 1 Oct” (or the applicable date) from the weekend schedule; overdue missing slots retain “Not published”. Archive refreshes its content on page load.
- Added publication-boundary, past-missing-slot, DST and year-boundary Archive regression coverage (15 total automated tests).
- W41 forecasts remain outlooks requiring editorial refresh on publication day. Future edition URLs remain available before their scheduled listing time; pages without JavaScript retain the last build state.
