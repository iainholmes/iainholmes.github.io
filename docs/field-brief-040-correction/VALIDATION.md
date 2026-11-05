# Field Brief No. 040 — order correction and independent story rules

Baseline: `e404c1c88cf90b5a114d0011729e352b4d294f2b` (November 5 publication, 40 editions). Production and live No. 040 were inspected before editing. The previous seven issues placed North Carolina reporting fifth; No. 040's editorial assembly put the regional item fourth and national productivity fifth. Explicit regional metadata already existed, but preflight checked completeness/sequential IDs and had no dedicated-feature placement gate. The five-color position sequence was correct and is unchanged.

## Identity and preservation

Only No. 040's fourth/fifth story objects exchange array positions. Their permanent `number` fields remain 05/productivity and 04/Wake-Raleigh. Display folios and Index/front-list numbering follow array position. Existing `/2026-11-05/05` continues to open productivity and `/2026-11-05/04` continues to open Wake/Raleigh; the visible positions are now 04 and 05 respectively. These URLs cannot simultaneously acquire the opposite subjects and retain their historical meaning, so permanent identity takes precedence for compatibility.

Both original artwork pins stay under their existing identities, with unchanged SVG bytes, captions/title associations, compositions and metadata. Neither `artwork-archive.js` nor `issue-mark-archive.js` changes. Every story word, source URL, implication, issue field and earlier edition is protected by the new exact baseline comparison. The only additional editorial field is `editorial.feature: "north-carolina"` on the local item. Issue count remains 40. The hub remains byte-identical.

Commonplace itself is unchanged. Where the displayed folio differs, an invisible `.s-no` retains the original identity and `.s-position` supplies the accessible, visible ordinal. Actual browser `data-cp-bound` values confirm `fb:2026-11-05:story:05` is still productivity and `…:04` still Wake/Raleigh. The source router, DOM IDs, image lookup and saved-position targets remain permanent. The compatibility hook also works with cached Commonplace clients.

## Prospective gate

`daily-watchlist-5/editorial-order.cjs` is invoked in preparation before any artwork work or artifact writes, and by read-only preflight. From November 6 onward, exactly one explicitly designated `editorial.feature="north-carolina"` with explicit North Carolina geography belongs in the fifth array position. Additional NC coverage elsewhere is permitted without that designation. Headlines and incidental mentions are not classification evidence. Earlier editions are not retrospectively retagged or rejected. No. 040 alone permits the specific 01/02/03/05/04 permanent-ID ordering.

A deliberate exception requires `editorialSelection.orderException` containing reason, approvedBy, a valid YYYY-MM-DD approvedAt, and HTTPS reviewUrl. These are structurally checked editorial attestations, not authenticated proof of a review; the publisher must establish actual authorization. Multiple dedicated-feature tags remain ambiguous and are rejected. Publishing schedules/permissions and unrelated source-selection logic do not change.

## Independent borders

The existing `.story` is the containing block for its own `::before` and `::after`: matching 2px rules using its existing positional `--k` color. They start/end inside the story's existing 34px/36px vertical padding, so each pair terminates before the inter-story separation. At widths up to 820px the existing 28px padding is retained, rules become 1.5px and their lateral outset reduces from 14px to 10px. Outsets fit inside the existing publication gutters; no content width, art size/crop, typography or overall grid changes. No full-page overlay, fixed height, filler section or new horizontal rule is introduced. The new framing applies automatically to all rendered editions.

[Desktop](desktop.jpg) · [Portrait Night](phone-night.jpg). These are local Chrome renders, using sized iframes for desktop/laptop/tablet/phone testing; physical iPhone and Safari are not claimed.

## Executed checks

- `node scripts/test_field_brief_order.cjs`: **89 passed**. Protects all earlier editions, exact content/source/metadata apart from the approved pair and tag, individual frozen registry records, permanent links, image associations, ordinal/ink rendering, future placement/exception/additional-NC cases and real preparation failure before writes.
- `node scripts/test_field_brief_operations.cjs`: **103 passed**.
- `node scripts/test_field_brief_cover_originality.cjs`: **425 passed**, including 48 repeated-theme covers.
- `node scripts/test_field_brief_editorial_cover.cjs`: **40 passed**.
- `node scripts/test_daily_schedule.cjs`: **144 passed**.
- `node scripts/test_reading_navigation.cjs`: **passed**.
- `node scripts/test_issue_marks.cjs`: **passed**.
- `node scripts/test_publishing.cjs`: **passed**, including repeat preparation byte-idempotency.
- `node scripts/check_field_brief.cjs 2026-11-05`: complete, No. 40, verify-deployment, no errors.
- Inline JavaScript compilation and `git diff --check`: **passed**.

The permanent regression protects historical editions and artwork entries individually and allows later editions/registry entries to append. Whole registry, hub and Commonplace byte equality is one-time preservation evidence for this release, not a permanent constraint on future publications.

Private future-publication fixtures now assign fresh sequential IDs and designate their final NC feature rather than inheriting a historical correction's identities. This maintains the real validators rather than weakening them to accommodate synthetic data.

Actual browser audits: 1512, 1280, 820, 852×393 landscape and 393×852 portrait, Day and Night. All five pairs match each story's color/visible folio, remain within its natural vertical extent and stop before the next pair. All five widths have no horizontal overflow in either theme (25 story/viewport records per theme). The corrected fourth/fifth headlines, art titles and Commonplace identities were read from the actual DOM. Desktop, laptop, portrait and landscape presentations were visually inspected; both moved stories were inspected on phone and desktop. Existing old links retain their target subjects. The public pre-correction page was independently observed with the original wrong order.

## Baseline failures and limits

Four broader suites fail at the same unrelated point on untouched baseline and this branch after fixture normalization:

- `test_periodicals.cjs`: existing Heron “Close hides the bird” assertion.
- `test_field_brief_artwork.cjs`: obsolete whole-archive canonical snapshot equality.
- `test_art_originality.cjs`: existing L&L fixture lacks companion-data required by editorial-architecture finalization.
- `test_art_append_growth.cjs`: existing future L&L fixture lacks authored feature decisions for 2026-11-06-coal-country.

They remain failures; none was bypassed, weakened or repaired in another publication. The new No. 040 preservation suite supplies an explicit, narrowly scoped allowance for only the authorized story order and feature tag. `bundle exec jekyll build` could not run (`bundle: command not found`, exit 127). Standalone browser-launch suites were not run; actual browser validation used the supported Chrome surface. No new blocking runtime regression was observed. A single recovery does not demonstrate future unattended execution.
