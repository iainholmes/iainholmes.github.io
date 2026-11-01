# Editorial layout review — 1 November 2026

## Scope and evidence

Started from production `f3814a85e4c98ae79e5afaf3771e6d9ebdd6b51e` and incorporated concurrent production `4cbcdd88af6aa87d4c4674f8638a324787d3904f` without altering its unrelated Notebook work. Only `/rupert/` presentation source, canonically generated pages/cache versions and this review change. No illustration, canonical edition, place, manifest, release-log, artwork-lock, private preparation or automation changes.

Before captures used the actual public deployment. No screenshot was included in the supplied attachment; the live implementation was the visual baseline. Rendered Chromium comparisons cover eight pages at 1600, 1512, 1280, 1024, 834, 768, 430, 393, 375, 852-landscape and 320px widths. Stable clocks are browser-test fixtures only, never publication overrides. Execution outputs retain before/after introduction, complete gallery, viewer, This Week, recent/legacy Full Edition, selected map, Travel, Field Log, Archive and footer screenshots. Fully rendered map and populated saved-state captures use isolated synthetic records, never real personal information.

## Demonstrated defects corrected

**Plate Register:** computed shared header height was 142px, not the older 210px declaration. Separate Archive heading, local navigation and introductory margins compounded; narrow introductory copy and vertically centered landscape prints added empty space before the first visible artwork. Archive navigation now shares the Register's compact header, with a wrapping editorial title/count/description group. The paragraph is 18px on desktop and 17px on phones; dates are 13px. Existing three/two/one-column galleries and 4:5 mounts retain their dimensions. Complete landscape images align to their mounts' top edges, with `contain`, never cropping. At 1512×982 the first painted artwork moves from 794px to 515px; at 1280×800, 749px to 486px; at 393×852, 642px to 444px. All 11 plates, dates, edition associations, withdrawal labels and viewer behavior remain intact.

**Full Edition introductions:** artificial 22ch title and 65ch short-lede limits removed within the existing header columns; governing header gap/padding reduced and address type balanced. Recent and legacy examples retain their narrative reading measure, section/body dimensions and complete native artwork geometry. The recent header is about 53px shorter at 1512px and 66px shorter at 834px.

**Narrow/increased-text layouts:** mobile Field Log heading previously wrapped despite space beside its silhouette. Content-aware header columns retain a one-line title; Travel uses the same small silhouette column to avoid enlarged-title clipping. Long Archive names, enlarged Tuesday/Thursday tab labels and dock labels may wrap within their allocated tracks, avoiding horizontal overflow. Normal mobile behavior and navigation remain intact.

## Inspected and deliberately retained

This Week's accepted desktop comparison and phone artwork/action geometry, Atlas map and selected-place context, routing controls, Travel planning/data panels, populated Field Log content, Archive filtering, plate dialog, footer, veil/Almanac and shared identity. Long narratives retain their controlled reading measure. No new composition or controls were added where inspection showed no defect. Shared image-loading/rendering behavior remains unchanged.

## Validation

- Complete existing package source-test chain passed, including integrity, Eastern-date/Almanac, week state, publication, private history, release plan, staging, immutable plates, Directory and Register checks. Staging's local-server check required the permitted host execution environment; it passed there.
- Canonical build/check, privacy/history audit and read-only release check passed. No due drafts were released. Existing warnings remain: W41 Thursday training mission and two previously approximate unused access pins.
- 88 page/viewport comparisons: no horizontal overflow or script errors; 277 before/after geometry and preservation assertions passed.
- 24 increased-text cases (150% direct text/control scaling): no horizontal overflow or clipped headings.
- Existing browser suites: 385 presentation assertions (14 viewport/PWA scenarios), 154 publication/routing assertions, 544 Field Log/history assertions. Final presentation rerun passed after the completed changes.
- Register browser verification: 543 assertions, all 11 images and edition links, three/two/one columns, complete artwork, withdrawal history, keyboard cycling, dialog focus containment/return, Escape/close, Archive filters, phone tabs/swipes and no-JavaScript fallback. Final rerun passed.
- Real MapLibre selected-place states rendered at desktop/phone dimensions; synthetic Travel and Field Log records survived reload unchanged.

The existing closure browser suite fails its asynchronous rollover assertion “Reading position not captured” with both the unchanged production stylesheet and these changes. The test and veil behavior were not modified to force a pass. Source closure checks pass; the browser suite is not claimed as passing. Chromium emulation is not physical iPhone or Safari acceptance; WebKit is unavailable in this environment. Deployment and live byte-parity evidence are recorded with the release outputs.
