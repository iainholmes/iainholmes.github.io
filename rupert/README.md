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

- `assets/js/core/atlas.js` is pure: it turns places, editions (and later the Field Log) into statuses, markers and bounds.
- The UI (`assets/js/atlas-view.js`) reaches the map only through `assets/js/map/maplibre-provider.js`.
- Tile hosts, the style and the relief source live in `assets/js/map/style.js`.
- MapLibre GL JS 5.24.0 is vendored in `vendor/`.

Map states use shape as well as colour:

| State | Marker |
|---|---|
| Recommended | Filled ochre circle |
| Walked | Pine circle with a check |
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

This path was proved end to end with W41; see `_tools/PUBLISHING-TEST-W41.md`.

1. Write `data/editions/<week>-tue.json`, with `published_at` set to Tuesday 07:00 New York time. Copying the previous week's file is the quickest start. Every `place_id` must already be in `data/places.json`.
2. Generate a fresh cover illustration for this recommendation, then import it with `rupert.mjs photo … --kind plate --provenance editorial`. See `ILLUSTRATIONS.md` for ownership and review requirements; do not reuse earlier suggestion art.
3. Set `conditions.as_of` to a full timestamp (for example `2026-10-05T15:00:00-04:00`). Refresh the forecast and `headline_condition` on the morning of publication.
4. Run `rupert.mjs build`, `check` and `audit`. This Week, the Archive, the edition page and the Atlas statuses all update from the data.
5. Commit and push. Repeat for Thursday.

The build writes an edition's page as soon as its `status` is `published`, even before its `published_at`. This Week and the Archive wait for the publication time; the page's own URL does not.

## Before merging

- Build and browser rendering use the real clock in America/New_York. No prototype clock override remains.
- Nothing here is private once merged. `noindex` and staying out of the site's navigation are not privacy controls.

## QA records

- `_tools/MAP-TESTS.md`: desktop map tests (passed), tap-target tests, and access-point verification.
- `_tools/IPHONE-QA.md`: real-iPhone checklist and how to serve the branch to a phone over Wi-Fi. Build 2 passed on a real iPhone.
- `_tools/PUBLISHING-TEST-W41.md`: the end-to-end publishing test, and every step that needed a person.

## September interface update

The masthead and editorial titles use user-provided Magrebis; body text, navigation and metadata use bundled Archivo. The masthead shows the site title, New York ISO week and northern-hemisphere meteorological season, with no slogan. Section outline decorations are removed, and the Atlas uses a native house marker for Home. Wider editorial proportions, smaller supporting type and clearer module spacing apply across the site.

The main recommendation and its subordinate contingencies carry `seasons` and `experiences`. These are editorial suitability tags, separate from the publication season. Historical route snapshots, sources and publish dates remain intact. The Archive contains one entry per Tuesday or Thursday recommendation; search and filters apply only to that main recommendation. Clear filters restores the paired pending Thursday slot and its scheduled publication date. Future editions are still excluded by the existing publication-time selection.

Travel is a browser-local planner with a light map: ordered car, flight, ferry, rail and walking legs, reorder/remove controls, optional car-leg stops, saved trips and validated backup import/export. Explicit lookup calculates OSRM road geometry, measured detours, drive time, planned breaks and a chronological Trip Table. Transit connectors are schematic and manually timed. Destination activities use the public place directory, with an OpenStreetMap park lookup when needed. Import merges new identifiers and preserves existing plans. Field Log supports completed and unplanned outings, local photos and backup/restore.

Home setup is browser-local under `rupert-location-v1`. The public build contains no residential address or coordinates. Address lookup is an explicit form submission to Nominatim; coordinate entry also works directly. Routing is opt-in, with disclosure beside its checkbox: OSRM receives the home and selected public trailhead coordinates. Its road geometry is highlighted in ochre, with estimated drive duration and mileage shown on the map; it does not include live traffic. Turning routing off, forgetting home, clearing selection or changing filters clears the route and cancels pending requests. Home view uses zoom 10 centered on the saved point, or all public places if no home is saved. Motion follows the reduced-motion preference.

Relief has stronger hillshade, visible on/off labels, provider-failure feedback and terrain diagnostics in `?qa=1`. The map uses a light cream and forest palette with cool water tones; automatic dark switching is removed in the calibration pass.

`_tools/test.mjs` covers combined option filters, season boundaries, all suggestion tags, backup round trips and invalid imports, coordinate validation, route geometry/time and failures, and relief style changes alongside the existing publication timing tests.

Crowd metadata integrates the separately reviewed ca9612d change. All existing outings are explicitly unassessed; no crowd observations were invented. Search, season, activity and crowd tolerance match only the main recommendation. Full Edition crowd bars distinguish typical crowd level from perceived crowding; factual details appear only when recorded. See CROWD-METADATA.md.

## Illustrations, fetch and postcards

See `ILLUSTRATIONS.md` for new per-suggestion art ownership, character consistency, varied compositions, frozen contextual panels and the authoring workflow. The current Tuesday artwork uses the seated Rupert illustration specifically approved on 30 September; earlier rejected proposals remain excluded. Full Editions have an explicitly initiated accessible fetch dock; Travel supports a browser-local postcard per journey, including backup/restore. Field Log supports planned completion and unplanned outings with local photos, and Rupert Day activates only on April 7 in New York time.

The visual system uses Magrebis Regular for display and editorial titles, paired with SIL-OFL Archivo for body text and utility information. Travel has a light route map, explicit location-lookup consent, OSRM road routes and detour estimates, manually timed transit connectors, ordered legs, planned breaks, destination activity lookup and local postcard/backup storage.

## Visual calibration

The centered masthead and navigation, clean cream/navy/oxblood/forest palette, restrained editorial rules, map/directory proportions, Archive hover and active-filter states, Travel grouping and Field Log action area refine the existing architecture. Automatic dark switching is removed; the page and map have one intentional palette. No AllTrails integration is included.

Magrebis is the chosen, user-provided design asset. The user's 30 September directive confirms responsibility for supplying the font and confirming any licensing requirements; no independent license-verification gate or font substitution is applied. Its single regular face is self-hosted as a 28 KB WOFF, with synthetic bold and italic disabled. Magrebis supplies the centered masthead, page titles, recommendation titles, Full Edition headlines and editorial subheads, Archive outing titles and Field Log entry titles. Archivo remains the body and utility font. Long headlines and utility layouts have been reviewed at 1366, 768 and 390 px widths without horizontal overflow; the phone masthead and context line are centered above the content.

The user approved the seated Rupert illustration on 30 September, lifting the earlier image ban only for this asset. It replaces the current Tuesday creek print and is assigned to `2026-W40-tue/flagship`. Its desktop 3:2 frame, phone 9:10 crop and Archive thumbnail preserve the complete Rupert silhouette. Credits flow below the artwork rather than obscuring it. The metadata-stripping import, ownership checks, build, 36 tests and privacy audit pass. Earlier rejected proposals remain excluded.
