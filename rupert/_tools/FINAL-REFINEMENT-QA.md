# Atlas targeted final refinement

Branch: `atlas/targeted-final-refinement-20261003`.

Started and reconciled against current remote master `28a8aaa8da9895c6255fca9d6241257066c40de8`, preserving its subsequent veil, routing and popup improvements. All changes are under `/rupert/`; Periodicals is untouched. No force push is used.

## Behavior

- Almanac sits at the bottom safe edge, preserving the brighter 2px ochre rule and all text.
- Previous Week and saved-Travel links preserve the review query when needed. Natural active periods use the existing site-wide production logic. Links do not record dismissal; background taps/Escape do. The selected destination remains underneath the veil.
- Pending artwork is concealed inside a separate ochre thumbnail frame; its filter cannot darken the frame into a vertical divider. Previous artwork stays full-color.
- Mobile dock changes from 54px to 52px, plus its existing border and safe-area inset. Targets remain at least 44px. Footer padding includes the safe area.
- Compact portrait place popup has a larger title, quiet status, small cross-reference and canonical county at lower right. Close retains a 44px target and does not clear the route.
- Existing automatic Home routing is retained and reconciled with canonical markup. Map, Directory and picker select the destination through the same route handler. Place changes replace the route; clearing Home clears it; no Home sends no routing request. Home remains browser-local; OSRM receives the coordinates needed for the requested drive, as disclosed. Nominatim behavior is unchanged.
- No traffic-capable provider is configured. Checkbox: **Enable live traffic data**, disabled. Explanation: **Live traffic unavailable with current routing provider.** Route status: **OSRM Estimate · Traffic Not Included**. No traffic values are invented.
- Both This Week recommendations use `renderOutingInfo`: Outing at a Glance, a ruled metric grid, Weather, a two-row Day/Forecast table, then a distinct Trail Note with a vertical ochre rule. Existing complete forecast wording is retained rather than guessing individual high/rain fields. The same component handles future published editions.
- Publication data/timestamps, routes, Travel storage/architecture and withdrawal history are unchanged. The withdrawn edition article, reason, recorded date and red treatment are preserved.

## Rupert source and asset

Sole source: the large front-facing Rupert portrait in the attached `AE36F5F4-9591-433C-855E-FDD32AF594C1.jpeg`.

Source SHA-256: `60b38d94b6be1011414e6d8c6ca5be6bb9c4143e936dacec127b88c4d4baa5f3`.

Canonical hand-traced vector: `rupert/assets/img/rupert-portrait-outline.svg`.

The SVG follows the source crown, asymmetric ears and eye placement, nose, closed muzzle and jowls. Transparent background, ochre strokes, no raster embedding or fill. Small sizes use thicker strokes and omit secondary contour paths; the enlarged watermark uses the same tracing. The source upload and old outline asset are untouched.

Uses: the shared utility footer beside 2026 on every Atlas shell (This Week, Archive, Atlas, Travel, Field Log, edition index and all edition pages), and the noninteractive veil watermark between recommendation/Travel content and the bottom almanac. No other surfaces use the new tracing.

## Verification

- `npm test --prefix rupert`: 311 checks pass (281 existing + 30 focused source checks).
- `npm run build --prefix rupert` and `npm run check --prefix rupert`: pass. Existing warnings remain for the training mission and two approximate access points.
- Focused browser matrix: 669 assertions pass, including 36 veil layouts (9 viewports × browser/PWA emulation × with/without saved Travel), review and natural-period navigation, safe-area/dynamic-height simulation, recommendation hierarchy, footer geometry, automatic routing, route replacement, no-Home state, disabled traffic and popup county/Close behavior.
- Existing closure browser regression: 635 checks pass across 40 layout cases and 9 routes.
- Viewports: 375×812, 390×844, 393×852, 402×874, 430×932, 844×390, 852×393, 1024×768 and 1440×1000.
- Rendered portrait, landscape, desktop, popup, footer and outing information were reviewed.
- Browser: Chromium with touch/mobile and standalone-mode emulation. Physical iPhone Safari/PWA chrome, real safe-area insets and dynamic browser UI still require manual device verification. Provider responses and Home in interaction tests are isolated synthetic fixtures; these checks do not claim a live traffic service.
- Whitespace and diff-scope checks pass. Canonical module imports and generated cache keys are reconciled; rebuilding does not restore the obsolete routing checkbox.

## Exact changed files

- `rupert/_tools/FINAL-REFINEMENT-QA.md`
- `rupert/_tools/closure-browser-test.mjs`
- `rupert/_tools/closure-test.mjs`
- `rupert/_tools/finish-test.mjs`
- `rupert/_tools/refinement-browser-test.mjs`
- `rupert/_tools/refinement-test.mjs`
- `rupert/archive/index.html`
- `rupert/assets/css/atlas.css`
- `rupert/assets/img/rupert-portrait-outline.svg`
- `rupert/assets/js/atlas-view.js`
- `rupert/assets/js/core/render.js`
- `rupert/assets/js/location-view.js`
- `rupert/assets/js/site.js`
- `rupert/assets/js/veil-view.js`
- `rupert/atlas/index.html`
- `rupert/edition/2026-W40-r1-tue/index.html`
- `rupert/edition/2026-W40-thu/index.html`
- `rupert/edition/2026-W40-tue/index.html`
- `rupert/edition/2026-W41-thu/index.html`
- `rupert/edition/2026-W41-tue/index.html`
- `rupert/edition/index.html`
- `rupert/index.html`
- `rupert/log/index.html`
- `rupert/package.json`
- `rupert/travel/index.html`
