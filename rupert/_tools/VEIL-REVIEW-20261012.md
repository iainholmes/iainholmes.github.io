# Inter-edition veil: October 12 draft-PR verification

PR #5 remains draft. No merge, production deployment or recommendation publication is authorized or performed by this pass.

## Baseline and narrow correction

- Reviewed the existing four-file patch at `e37800195564f5a01018f16af3a40de70d71bfdb` against master `df996a37ebab4baffe9c997b2c09b0c6770de6b1`.
- Production state correctly activates Monday, but the original artwork-integrity guard required artwork for unauthored W42 slots and closed the entire veil. The existing patch skips absent slots and introduces neutral placeholders; this pass continues that implementation.
- The existing renderer still disclosed authored draft/future titles in accessible names and loaded their artwork. Names, image URLs/alt text and edition links now depend on genuinely released state. Unreleased records use anonymous neutral placeholders even if they have authored titles/artwork or have passed the nominal release clock.
- Artwork integrity still validates the genuine released plates. Missing/corrupt released artwork is detected; absent or undisclosed draft artwork is not a reason to disable the frontispiece.
- The new Oct 12 unit case previously used the pre-recovery W41 Thursday fixture. It now uses the actual manifest with both W41 recommendations genuinely published.
- Production activation, dismissal keys, one-use navigation handoff, ET schedule, actual-publication gates, almanac, artwork, typography and layout rules remain unchanged apart from the already proposed neutral-placeholder styles.

## Executed validation

| Check | Result |
| --- | --- |
| `npm test --prefix rupert` | PASS: 1,313 assertions across all 15 suites |
| `npm run check --prefix rupert` | PASS |
| `npm run build --prefix rupert` | PASS; second build says no changes |
| `node rupert/_tools/rupert.mjs audit --history` | PASS |
| Asset/import-map verification | `072ef5ae1272`, independently hashed and verified in all 11 generated pages |
| `veil-browser-test.mjs` | PASS: 377 checks, real Oct 12 manifest, 11 responsive sizes and PWA-equivalent interaction cases |
| `week-state-browser-test.mjs` (`ATLAS_QA_QUICK=1`) | PASS: 788 assertions; full lifecycle/availability cases plus portrait, landscape, desktop and standalone layouts |
| `integrity-browser-test.mjs` (`ATLAS_QA_QUICK=1`) | PASS: 665 assertions; existing crowd/current-date almanac/moon glyph behavior preserved |
| `closure-browser-test.mjs` | FAIL: “Reading position not captured”, line 62; reproduced identically on untouched master. Assertions retained; not treated as a green suite. |

The approved-markup source regression was strengthened rather than discarded: new anonymous pending markup is locked by its own hashes, and normalization of only the authorized pending-preview differences still reproduces both original physically approved golden hashes exactly. All other veil markup is therefore protected.

The initial unvalidated PR unit test failed at its two-placeholder assertion because its old Thursday fixture made W41 Thursday unavailable. This was corrected using real publication records. Untouched master's full source suite also fails its privacy-audit fixture on Oct 12 because the original frontispiece guard reports missing current-week artwork before the audit can run; the PR fixes that root cause.

### Browser scope and evidence

Chromium 143.0.7499.40, headless browser simulation. No physical iPhone or native Safari acceptance is claimed. Standalone is simulated through display-mode media state; actual iOS Safari/PWA chrome and hardware safe-area insets remain physical-device checks.

Viewport sizes: 375×812, 390×844, 393×852, 402×874, 430×932, 844×390, 852×393, 1024×768, 1280×800, 1440×1000 and 1512×982.

The real Oct 12 baseline has no W42 edition records. Both genuine W41 plates are decoded, remain full color and match their registered artwork. Current-week placeholders contain no images, draft titles, image URLs or edition links, including accessible names. Published Previous Week tiles each navigate with one click to their own Full Edition under the still-active veil; no dismissal state is set by navigation. Four normal/standalone handoffs recorded zero sampled uncovered frames. Intentional background dismissal restores the selected edition, persists on reload and ordinary navigation, and the Wednesday phase reactivates independently. Unauthored/delayed slots remain pending after nominal Tuesday/Thursday times. Genuine W41 release checks include Thursday’s actual 16:57:58 release rather than falsely clearing at 7 a.m.

Synthetic draft/future-publication disclosure scenarios exist only in runtime interception and automated tests; they are not authored W42 recommendations, public data changes or editorial approvals.

- [iPhone-size screenshot](veil-review-20261012/iphone-393.png)
- [Desktop screenshot](veil-review-20261012/desktop-1440.png)
- [Targeted browser results](veil-review-20261012/browser-results.json)
- [Closure failure on PR](veil-review-20261012/closure-pr.log)
- [Same closure failure on untouched master](veil-review-20261012/closure-master.log)

## Separate architectural finding: public draft data

`manifestFrom()` in `_tools/rupert.mjs` exports every canonical edition without a released-only filter, including draft title, place ID, options/crowd metadata, experience identity, image ID and canonical JSON path. Full canonical edition JSON files and image assets are also in the public repository/site tree. Generic draft HTML pages do not eliminate direct JSON/image or Git access.

The live manifest inspected in this pass currently contains four published recommendations and one withdrawn record, zero draft records and no W42 records. There is no current W42 draft payload to expose. The corrected veil does not render/request unreleased previews, but this UI correction does **not** provide confidentiality for future drafts stored in public Git.

A genuine broader solution requires private draft preparation/staging plus release-only public manifests/edition JSON/assets, with coordinated publisher/build/runtime changes. Filtering only the manifest would leave direct canonical files/Git history accessible. This architectural correction is reported separately and is not implemented in this veil PR; the publishing pipeline is untouched.

## Separate W42 publication readiness

No genuine W42 Tuesday/Thursday edition files exist in current master or this branch. No W42 edition-file commits were found across fetched remote refs, and no W42 preparation evidence was found in the available other Work-thread context. Earlier scratch working directories were pruned, so unavailable private staging cannot be independently inspected; there is no verified evidence that drafts are ready elsewhere.

Tuesday October 13 and Thursday October 15 at 7 a.m. ET require genuinely prepared, verified and approved recommendations for October 17–18. A scheduler cannot release a nonexistent draft. This task does not create candidates, approve access/weather evidence or publish recommendations.

## Review boundary / limitations

- PR #5 stays draft and unmerged; production master is not changed by this pass.
- The legacy closure-browser failure remains a validation limitation, reproduced on baseline. It was not bypassed or resolved by changing unrelated reading/layout behavior.
- Physical iPhone/Safari acceptance is still required; screenshots and browser simulation are evidence, not device acceptance.
- All changed files are under `/rupert/`. No branding, desk., Periodicals, recommendation data or publishing-pipeline files changed. Historical content is preserved. Generated page differences are canonical asset revision/current-cycle outputs.

## Files changed against master

- `rupert/_tools/VEIL-REVIEW-20261012.md`
- `rupert/_tools/closure-test.mjs`
- `rupert/_tools/refinement-test.mjs`
- `rupert/_tools/veil-browser-test.mjs`
- `rupert/_tools/veil-review-20261012/browser-results.json`
- `rupert/_tools/veil-review-20261012/closure-master.log`
- `rupert/_tools/veil-review-20261012/closure-pr.log`
- `rupert/_tools/veil-review-20261012/desktop-1440.png`
- `rupert/_tools/veil-review-20261012/iphone-393.png`
- `rupert/archive/index.html`
- `rupert/assets/css/atlas.css`
- `rupert/assets/js/core/veil.js`
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
- `rupert/travel/index.html`
