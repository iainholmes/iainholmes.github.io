# IH. rollout review — 12 October 2026

Production baseline: `f74d6a4539d194c014256a50ce311d0c9028b0f0`.
Recovered the interrupted 28-file branding pass, rebased it onto the accepted
Atlas veil release, and regenerated Atlas pages from the updated source.
The unused duplicate master was removed; the authoritative file in `/desk/`
and all other `/desk/` files remain unchanged.

## Passing verification

- 230 identity coverage/preservation assertions across 19 HTML pages.
- Actual Field Brief renderer exercised for all 16 published editions: exactly
  one imprint follows navigation; earlier content, links and events match the
  production baseline.
- Atlas build, `npm run check`, and the full `npm test` suite pass.
- Atlas generated pages match production after removing only identity additions
  and generated asset-cache versions. Native CSS, veil code, data, lifecycle,
  masthead text, Rupert portrait, and publication behavior remain unchanged.
- Existing Notebook suite: 102 assertions, including preparation idempotence.
- Existing Workbook learning suite: 219 assertions, 80 authored question pairs.
- Existing reading-navigation, daily-schedule (96 assertions), and issue-mark
  suites pass.
- Image hashes match the canonical source and lossless crops exactly; relative
  asset paths resolve at every route depth. Existing links, inline styles,
  scripts and canonical data are preserved (Field Brief adds footer markup to
  its existing render template only).
- `git diff --check` passes.

## Existing suite limitations

Six older suites also fail against an in-memory, read-only copy of the accepted
production baseline: `test_periodicals.cjs` (DOM fixture lacks `matches()`),
`test_final_regressions.cjs`, `test_polish.cjs`, `test_publishing.cjs`,
`test_workbook_marks.cjs`, and `test_field_brief_artwork.cjs` (historical snapshots
or edition/cover expectations). These were not changed to conceal failures.

`test_maintenance_20261009.cjs` passes on production but rejects this rollout
because it requires the entire Commonplace HTML to be unchanged. The added
stylesheet/footer is intentional; the new preservation checks verify that its
existing styles, scripts, artwork, and links remain intact.

## Browser acceptance still required

Supported browser control is unavailable in this managed Work session. No
preview server, unsupported browser workaround, merge, or deployment was used.
Responsive CSS and source were reviewed, but actual desktop/iPhone rendering,
focus and touch behavior have not been visually accepted.

Using the existing local preview, review the branch at a desktop viewport such
as 1440 × 900 and iPhone portrait around 402 × 874, then on the physical phone:

- Personal website copyright/footer.
- Periodicals hub, Handbook, Commonplace (including tabs/Threads).
- Field Brief first/intermediate/latest editions and Index drawer.
- Workbook current/archived sets and results: closing equation remains intact.
- Loblolly & Logit editions, Archive/Field Register dialogs, and Notebook.
- Atlas This Week, Archive, all full editions, Atlas, Travel, and Field Log:
  copper period above masthead, new footer, original Rupert portrait preserved.
- Day/night where supported, narrow wrapping, keyboard focus, mobile toolbar
  clearance, and image clarity. The full footer logo is 44 CSS pixels wide;
  its tiny illustration retains original pixels but is not detailed at that size.

Separate Advisor and QST draft PRs use the same exact signature crop at 40 CSS
pixels. Their entire original source is recovered by removing the new identity
CSS/markup; inline scripts parse unchanged. Neither repository has an existing
test runner. Review Advisor landing/assessment/results footer, QST attribution
in both themes/languages, and confirm exported Advisor documents are unchanged.
