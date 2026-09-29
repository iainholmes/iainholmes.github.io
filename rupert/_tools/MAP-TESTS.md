# Atlas map: test record (Milestone 1)

**Run:** 29 Sep 2026.

**Browser:** the Claude desktop app's built-in Chromium 152 on Iain's Mac (DPR 2), on the live origin `https://iainholmes.github.io`. The tile and relief hosts can't be reached from the build sandbox, so the real-network tests ran there. The failure paths also ran headless in the sandbox, where every tile host is blocked.

**Real iPhone:** build 1 failed (blank map; see the end of this file). Build 2 awaits retest.

**Previously not tested:** a real iPhone. These numbers come from Mac hardware, including the 390×844 run. Checking Safari on an actual phone is still open.

## CORS and hosts, from the real origin

| Request | Result |
|---|---|
| OpenFreeMap TileJSON `/planet` | 200, 19 KB, ~300 ms |
| Vector tile z12 (Chapel Hill) | 200, 89 KB, ~650 ms |
| Vector tile z14 | 200, 189 KB, ~770 ms |
| Glyphs, Noto Sans Regular and Italic | 200, ~75 KB each |
| Terrain tile z10 (AWS Terrarium) | 200, 40 KB |
| Page CSP | none, so nothing blocks these hosts |

All requests used `fetch` in CORS mode from the page. No proxy is needed.

## Performance, desktop 1280×800

| Measure | Result |
|---|---|
| Style load (first paint of the basemap) | ~1.5 s |
| Idle, all visible tiles drawn | ~1.8 s |
| Pan at z13 | 120 fps, worst frame 9 ms |
| Zoom 9 to 13 | 120 fps, worst frame 9 ms |
| Fly from the regional view to z13 | 81 fps, one ~1 s hitch while the first z13 tiles arrived |
| Relief on: extra time to idle | +2.0 s |
| Relief on: pan and zoom | no measurable frame cost |
| JS heap after the session | ~53 MB |

## Performance, 390×844 (phone viewport on Mac hardware)

- Fly to z13.5: 120 fps.
- Pan with relief on: 120 fps.

**Decision:** relief is on by default at 1024px and wider. It's off by default on phones to save data (about 40 KB of terrain per view). A toggle is always offered and remembered per browser.

## Trail readability

OpenMapTiles carries footpaths and tracks only from about z13 to z14. The trail layer is ink, dashed, 2 px at z14 and 3.2 px at z17. At the Eno (Fews Ford, z14) the Cox Mountain and Fanny's Ford trails read clearly against the lightened wood fill. Trail names appear from z14.

Changes made after this test:
- The wood and park fills were lightened.
- The trail line was darkened and thickened.

## Attribution

"OpenFreeMap · © OpenMapTiles · Data © OpenStreetMap contributors", plus "Relief: Terrain Tiles" when relief is on. It's always visible, bottom right, with no compact collapse.

## Failure behaviour

The register renders first in every case and stays fully usable. The map area shows a plain message instead of the map.

| Case | How tested | Result |
|---|---|---|
| TileJSON 404 | real network | error from source `omt` after 0.6 s → "The map tiles couldn't be loaded." |
| Tile host unreachable (DNS) | real network | error after 0.8 s → same message |
| Host stalls (blocked by proxy, no response) | sandbox | timeout at 12 s → "didn't arrive in time" |
| Glyphs missing | real network | map loads without labels. Later errors show a small notice, and the map stays. |
| No WebGL | `?maptest=nowebgl` | immediate message |
| Offline | `?maptest=offline`, and `navigator.onLine === false` | immediate message |
| Style rejected | caught in real testing: an invalid `line-width` expression | now fails fast with reason `style` instead of timing out |

## Bug found and fixed by this test

Road casings used `["+", <zoom interpolate>, n]`, which MapLibre rejects, because a zoom expression may only appear at the top level. Before the fix, the style failed to load and the map timed out. Casings now interpolate their widths directly.

Both themes, with relief on and off, now pass `@maplibre/maplibre-gl-style-spec` validation.

## Release-candidate additions (29 Sep 2026)

### Pin tap targets

Run in the same browser at a 390×844 viewport, with the release-candidate hit-testing code.

- Taps 0, 18, 20 and 21×21 px from the Raven Rock pin all select it. A tap 40 px away selects nothing.
- Every pin now answers a 44×44 px box, not just the 20 px icon.
- Occoneechee and the Riverwalk sit 3 px apart at the regional view. A tap there now zooms in on the pair instead of guessing. The nearest-pin choice worked (a tap 30% of the way picked Occoneechee, 70% picked the Riverwalk), but 3 px is too close for a finger.
- Two-finger map gestures (`cooperativeGestures`) are enabled on touch devices and confirmed active.

### Access-point verification

Each point was checked against the owner's published address or access listing (NC State Parks "Plan your visit" pages; Triangle Land Conservancy), then located on the matching OpenStreetMap parking lot or feature through OpenFreeMap tiles and Nominatim.

| Place | Result |
|---|---|
| Eno River, Fews Ford (6101 Cole Mill Rd.) | Verified. OSM lot at the Cox Mountain Trail start, 34 m from the old pin. |
| Umstead, Reedy Creek (2100 N. Harrison Ave.) | Verified. OSM lot at the end of N. Harrison Ave. |
| Hanging Rock visitor center (1790 Hanging Rock Park Rd.) | Verified. OSM "Visitor Center Parking Lot". |
| Raven Rock main access (3009 Raven Rock Rd.) | Verified. OSM lot beside the visitor center, about 250 m from the old pin. |
| Occoneechee Mountain (625 Virginia Cates Rd.) | Verified. OSM lot and information board at the road's end. |
| Hillsborough Riverwalk, Gold Park (415 Dimmocks Mill Rd.) | Verified. **The old pin was about 1.4 km off.** |
| Brumley South (3055 New Hope Church Rd., TLC) | Verified. **The old pin was about 7 km off.** |
| Duke Forest Korstian (Whitfield Rd.) | Not verified. A trail guide and the OSM fire station agree, but Duke Forest publishes gates only as PDF maps. Shown as "pin approximate". |
| Carolina North Forest | Not verified. The trailhead lot off Municipal Dr. isn't mapped, so the pin marks the forest's centre and is shown as "pin approximate". |

Every pin is a public trailhead, parking area or public land. None is residential. `rupert.mjs audit` fails if any public file contains a coordinate other than these access points, the public Chapel Hill reference point, or the Atlas's padded default view.

## Blocker from real-iPhone QA, build 1 (29 Sep 2026)

**Symptom.** In iPhone Safari, on the branch served from the Mac, the QA panel said `map: ready`, but the map area was empty. There was no basemap, pins, controls or attribution. The register worked.

**Cause.** The page's CSS, not Safari.
- MapLibre's stylesheet gives its container `position: relative`. The provider loaded that stylesheet after the Atlas's own, so it beat `.map-canvas { position: absolute; inset: 0 }`.
- The map box then had no height (390×0). MapLibre still loaded, fired `load`, and drew into a box nothing could see. The controls and attribution sit inside that box, so they vanished too.
- The same thing happens in Chromium and in both themes. It isn't specific to iPhone or to dark mode.

**Why the desktop tests missed it.** They ran MapLibre in a test container styled inline on the live origin. The inline style outranked MapLibre's rule, so the real page's CSS was never exercised with live tiles.

**Fixes.**
- A higher-specificity rule (`.atlas-map > .map-canvas`) keeps the box absolute whatever order the stylesheets load in.
- MapLibre's stylesheet is now awaited and inserted before the Atlas stylesheet.
- The map box falls back to `vh` where `svh` isn't supported.
- "Ready" now requires proof of drawing: the container and canvas have a size, WebGL isn't lost, a frame has drawn since `load`, and basemap features are on screen. Otherwise the page fails with `size` or `blank`, and a WebGL context loss after start fails with `lost`. Each shows a plain message, and the register stays usable.
- New drills: `?maptest=nosize` and `?theme=light|dark`. The `?qa=1` panel now reports load against drawn, sizes, WebGL, source and tile state, features per layer, control visibility and errors.

**Verified (headless Chromium, 390×844 at 3x, touch, synthetic OpenMapTiles-shaped vector tiles served in place of OpenFreeMap).** The sandbox can't reach the real tile host.

| Case | Result |
|---|---|
| Build 1 code | Reproduced: `ready`, container 390×0 |
| Build 2, light | `ready`, container 390×471, canvas 390×471 (backing 1170×1413), 15 features, controls and attribution visible |
| Build 2, dark, and both `?theme=` overrides | Same result |
| Build 2, 1280×900 | `ready`, container 696×814 |
| Tiles with no features | `failed (blank)` with a message. Never `ready`. |
| `?maptest=nosize` | `failed (size)` with a message |
| `notiles`, `nowebgl` | Unchanged, both pass |
| A tap on the Raven Rock pin | Card opens |

The real-tile, real-Safari confirmation is IPHONE-QA build 2.
