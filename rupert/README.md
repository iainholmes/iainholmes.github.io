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
| `?theme=light` or `?theme=dark` | Forces a palette, to compare themes on one device |

The map counts as ready only once it has **drawn**: the box and canvas have a real size, WebGL is alive, and basemap features are on screen. MapLibre's `load` event alone isn't enough. If it loads but can't draw, the page says so (`size`, `blank` or `lost`) instead of leaving an empty box.

A real stall shows a timeout message after 12 seconds. In every case the register stays usable. `?qa=1` adds a diagnostics panel (see `_tools/IPHONE-QA.md`).

## Editions

Editions live in `data/editions/<ISO week>-<tue|thu>.json`, validated against `schema/edition.schema.json`. Tuesday and Thursday are two separate choices for the same weekend.

`condition_level` sets the weather treatment:

- `"adverse"`: storms, dangerous heat, flooding, closures or ice. Shows Field Red plus the word "Warning" and a triangle.
- `"normal"`: everything else. Shows in ink.

## Before merging

- `data/site.json` → set `review_clock` to `null`. `check` warns while it's set.
- Nothing here is private once merged. `noindex` and staying out of the site's navigation are not privacy controls.

## QA records

- `_tools/MAP-TESTS.md`: desktop map tests (passed), tap-target tests, and access-point verification.
- `_tools/IPHONE-QA.md`: real-iPhone checklist and how to serve the branch to a phone over Wi-Fi. **Pending.**
