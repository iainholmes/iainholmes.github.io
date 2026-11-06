# Unified feature surfaces and viewport reading spread

Starting master: `9275f9bad554ba2a0534b6f47ebc729de3510114` (5 November 2026). The branch retains the native adjacency introduced by PR #58 and the framing corrections of #59/#61. No historical source audit was restarted.

## Implementation

- The reading grid takes its width from the actual main content box, with fluid 22–40px safe insets, a 154–204px reading rail and a 24–44px gutter. The 1462px cap is removed from the reading spread. Opening pages and closing apparatus retain their existing measures. Mobile and tablet transformations remain in place.
- Each real feature cell paints its reading-owned translucent wash. Transparent structural wrappers prevent compounded washes and stop analytical backgrounds from enveloping a Research Notebook. The eight authored palettes, feature typography, analytical graphics and data-encoded node colors are retained. Text opacity remains 1.
- Existing native grid/flex/flow joins are preserved. There are no bridge strips, cover-up rectangles, fixed feature heights or spacer tracks. The runtime measures only actual common edges within 1px, rejects intervening editorial material, and places the original clipped copper/forest dividers at 90% of each actual overlap, centered with 5% clearance at either end. Caps shrink for short edges.
- Corner changes follow the endpoints of each shared segment. Partial joins square only corners actually reached by that neighbor; exposed corners retain their softened asymmetrical geometry. Borders use the same element geometry as the background.
- The wider canvas keeps authored reading arrangements and Economic Interpretation's role. On ultrawide canvases, long prose receives a bounded measure and up to two readable columns within its original editorial unit. Figures retain their source graphics and have a sensible display-size limit. Headlines and folios retain their original fonts and size limits.
- A stable scrollbar gutter prevents the Index from temporarily widening the reading canvas and moving the reader when dismissed. The Index remains centered in the stable paper/content viewport. Its archive, focus, filtering and navigation behavior is unchanged.
- The shared stylesheet/runtime are content-versioned by the existing preparation path. The Field Guide's divider description now says 90% for both orientations. No publisher workflow, schedule or automation configuration is modified.

## Executed checks

- Existing renderer, archive preservation, source-evidence, Notebook, Register and publishing tests passed: 15 publication/future-growth checks, 691 feature checks, 261 preservation checks, 267 Notebook checks, 99 Register checks, 31 source-evidence/pre-write checks, and publishing idempotency.
- Actual supported-browser audit: 264 edition/viewport/theme cases, covering all six editions and all 30 readings. Widths: 320, 375, 390, 430, 520, 650, 651, 768, 820, 850, 900, 1024, 1180, 1280, 1440, 1512, 1600, 1710, 1920, 2560 and 3440; additional 852×393 landscape cases. Both Day and Night were explicitly verified. Initial load, font readiness and native responsive reflow were used; no forced reflow was needed for the final audit.
- The 9316 assertions inspect real viewport clearance, lack of horizontal scrolling, typography, mathematical content, sources placement, matching computed translucent colors without painted ancestors, text opacity, borders, correct corner geometry, every actual shared edge, 90% divider lengths and centering, true boundary position, taper geometry and cap sizes.
- Real browser interactions passed: 39 Index assertions, 236 reading/feature deep links, six Heron opening/closing/keyboard/dismissal checks and two Field Guide connection checks. Opening and dismissing the Index preserves the exact reading position.
- All 30 desktop compositions were visually inspected; desktop and phone screenshots were captured for every reading. Matched before/after views cover household climate, MOVES6, FERC, an entire MacBook-sized reading spread and a phone reading, including Day/Night. Ultrawide prose and the mobile mathematical/testing pair were inspected separately.

Screenshots and detailed local JSON evidence are delivered in the task's `outputs/viewport-refinement` directory. These initial images show the local candidate; production status and evidence are reported only after the deployed assets are independently checked.

The first CI run exposed a measurement difference: headless Chrome includes the reserved scrollbar gutter in `documentElement.clientWidth`, while its body/paper box excludes it. The inset assertion now measures the actual body/content boundary, just as the Index centering assertion does. Safe-clearance limits are unchanged; no CSS was weakened to satisfy the test.

A subsequent independent browser run exposed stale divider geometry after late panel reflow. The runtime now remeasures genuine shared edges even when its authored composition choice is cached, and observes feature/balance-region dimensions as well as the whole article. The browser test waits for actual font readiness and two animation frames before inspection, without forcing composition.

## Preservation and limits

Original reading prose, equations, assumptions, citations, source-evidence records/classifications, artwork, palettes, composition registry, historical dates, five-reading editions, Field Register, cumulative Notebook, Heron artwork, hash links and site-wide navigation remain unchanged. Other publications are outside this change. Existing incomplete historical verification remains incomplete; passing layout/source-consistency checks is not a new scholarly attestation.

Browser viewport emulation is reported as such. No physical iPhone or Safari verification is claimed.
