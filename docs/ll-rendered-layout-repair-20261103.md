# Loblolly & Logit rendered layout repair · 3 November 2026

The supplemental Incidence Ledgers in `grid` and `2026-10-09-nuclear-finance` compare three parties side by side above 650px. Each column contains its number, heading and interpretation. Historical primary Ledgers retain their authored accounting rows and source graphics. Their different role is intentional; no registry selection or editorial quotas changed.

All seven Long Views derive desktop tracks from the actual stage count (five with three, two with four). Three-stage views fill three equal tracks; four-stage views use four, or a complete 2×2 composition at 651–1000px. At 650px and below all stages stack on a connected vertical rail. Horizontal rail segments end at the final station of each row. No font sizes were reduced.

## What caused the mismatch

* The user's 14:48:09 and 14:48:13 screenshots preceded the final successful Pages deployment at **14:48:59 EST**. GitHub run `41706519476` deployed `ef7f0fb`; the four preceding runs were cancelled. A commit was not evidence that the page had deployed. A fresh independent browser opened later did show that commit's three Ledger columns and filled three-stage timelines at 1440px. This supports deployment timing as the immediate screenshot discrepancy; the earlier browser cache itself cannot be reconstructed.
* Source CSS simultaneously retained the original vertical timeline, later horizontal grid, later flex overrides, and a duplicate `ll-accepted-reading-arrangement-20261103` inline style after the linked stylesheet. Responsive rules used several inconsistent breakpoints. These layers have been reconciled into one timeline layout and one supplemental Ledger layout in `reading-folio.css`; the duplicated inline block is removed. The accepted transition/divider styling remains.
* `finishReading()` returned immediately on `data-reading-finish="5"`. Existing archive readings therefore skipped changed renderer output. A presentation-only migration now runs before that return, and publication preflight verifies that every stage count agrees with the track count and actual markup.
* The publisher now versions the stylesheet URL with its SHA-256 content digest, so CSS edits cannot silently reuse a stale asset URL.
* Rendered tests found disconnected phone chronology markers and hidden drawer links causing page overflow at 851px. The rail now adapts to stacking/wrapping; journal drawer links wrap at the affected tablet widths.

## Preservation and tests

The six-edition `<main>` region is byte-identical to `ef7f0fb` except seven `--longview-stages` presentation attributes. All prose, dates, links, artwork, edition IDs, feature choices, source qualifications and profile/feature associations remain unchanged. The source renderer and preservation comparison distinguish authored companion features from the original scholarship, and companion markup is separately protected by the archive byte comparison.

`test_ll_publication_layout.cjs` covers archive migration, repeat composition, future-edition growth, CSS version integrity, stage mismatch rejection and duplicate inline override rejection. `test_ll_layout_browser.cjs` checks real served HTML/CSS rather than matching source strings. It can run through Playwright or the connected browser and audits all six editions at 13 widths (320–1440px), including both sides of responsive thresholds. It checks equal columns, actual element positions, unused right tracks, complete mobile stacks, mobile rails, five readings per edition, content/page overflow and excess blank area below the actual panel content. The existing 14px figure crop marks are intentional margin ornaments and are excluded from content overflow checks.

Run locally or against Pages:

```sh
LL_ORIGIN=https://iainholmes.github.io LL_QA_JSON=layout-results.json node scripts/test_ll_layout_browser.cjs
```

Primary Ledger and Assumption Test panels previously stretched to the height of a taller neighbour, producing up to 766px of blank painted canvas. Their existing editorial columns, palette, artwork and shared upper ribbon remain, while panel boundaries now close at their own content. No primary Ledger content or accounting-row semantics were overwritten.

The `Loblolly & Logit rendered layout` GitHub workflow runs the source checks and the full browser audit on relevant pushes and pull requests.

Local Chromium result: **78 edition/viewport cases, 1,223 assertions passed**. Source publication, exhibit rendering, editorial preservation, field register and publishing integrity tests also pass. Final live deployment status, asset hashes and screenshots are recorded separately in delivery evidence after deployment; none is inferred from a source check.

## Live deployment evidence

Layout commit `5dba2bb153be1a72bf2bd7571901bfbf677a4bcf` passed Pages deployment run `41711274579` and cloud rendered-layout run `41711274807` on 3 November 2026. An independent fresh browser then passed the same **78 live edition/viewport cases and 1,223 assertions**. The stylesheet response received by the browser was HTTP 200, without disk-cache or service-worker substitution, and matched the tested file byte-for-byte: SHA-256 `fae16ebd49ad8a9c21b4ac8e54b540cdd0ad3fc741ee63786c48d0e983b2756f`.

Published screenshots cover the first edition's grid and electrification Long Views, both supplemental Ledgers, the final edition's four-stage solar chronology, primary Ledger/Assumption Test/Decision Margin/Mechanism Map examples, tablet wrapping, and phone stacking. Day/night, Full Edition/At a Glance, archive selection and Heron controls were also checked. Delivery evidence includes the original user screenshots beside the published corrected features.

Two broad legacy suites also fail on the untouched baseline: `test_editorial_rail.cjs` assumes older companion/spine state; `test_art_originality.cjs` reconstructs a historical fixture without the canonical CSS references required by current preflight. Those inherited failures are not counted as passing checks. The scoped source preservation suites and new cloud browser audit pass.
