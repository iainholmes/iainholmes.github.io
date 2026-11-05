# L&L structural joins, source evidence and navigation — validation

Baseline: c0cfd0b2a41ae3c5551db33f8fe237e983f0864e, after Field Brief PR #57. All six editions / 30 readings were inspected structurally. No other publisher, schedule or artwork-generation behavior is changed.

## Root causes and implementation

The old runtime linked rectangles up to 108px apart using painted `.ll-feature-bridge` strips. Nearby rectangles were not genuine editorial adjacency. The strip generator and CSS are removed. Five explicitly authored feature sequences now use unpainted flow wrappers and native grid/flex cells. Existing shared fields retain their architecture. Actual section edges meet, including an inset figure over a wider Ledger and side-by-side unequal-content features. Only shared-edge corners are squared. Intervening prose, research material and independent sections remain separate.

The original copper/forest clipped-tip divider declarations are byte-identical. Dividers are measured only after actual edges meet (within 1px); measurement positions the original divider on that edge and never fills a gap. No fixed panel heights, spacer tracks, cover-up strips or new panel surfaces are introduced. Sources remain last. Accepted Mechanism Map/Heron styling and all seven feature identities are retained.

The toolbar Heron toggle, toggle-only CSS/listeners and dead body suppression rule are removed. The retired global local-storage off flag is ignored; authored notes remain subject to their existing viewport configuration and individual dismissal. Note opening, closing, keyboard reopening, Escape from the note and focus restoration are preserved. The Field Guide drawer link alone is removed; its page remains and receives the necessary stylesheet cache version. Other drawer destinations remain exact.

## Source controls: existing versus added

Existing editorial decisions required provenance URLs, feature assessments and qualitative labels. source-review.json retained access observations and three earlier full-text assertions. The preparation/layout validators checked authored structure, not source-to-component review completion. HTTP access is not substantive verification; two Federal Register access records even identify Request Access pages.

The new source-evidence record binds actual article components (including standalone prose/figures, feature mathematics and configured Heron notes) to content fingerprints, source document version/hash and precise passages, classifications, qualifications and review reasoning. Preparation validates both the supplied draft and its pure in-memory composed result before artwork preparation or artifact writes; actual article markup is inspected even if the generated Index is stale. New readings cannot claim historical exemption. Missing, changed or deleted components, source-version mismatches, contradictory typed claims, unsupported recorded magnitudes/units, mislabeled diagnostics, source-author equivalence and notation collisions are rejected. Properly documented future content is accepted.

These checks establish structure and consistency, not source truth or authenticated reviewer identity. Actual passage reading and analytical evaluation remain required. There is no automatic completion or attestation generator in preparation. Tests use expressly private synthetic fixtures; they are not publication evidence.

## Demonstrated amendment: NBER 35945

Downloaded the canonical October 2026 PDF on November 5 (HTTP 200), SHA-256 23a8d7ba77b986cffe604299f7419f1f1d41f83fe704d821aaf2aeb22f52ad5a. Read targeted PDF pp. 1–3, 18–32, 68–69; visually checked the policy page. §5 printed p. 26 / PDF p. 28 supports the expenditure objective and 10% target. §3 and Appendix B.3 support household choices and financing. Numerical comparisons were checked on printed pp. 27–29 / PDF pp. 29–31. This was not a replication or a full-paper audit.

The objective was supported, not fabricated. The amendment explicitly labels the equation as an editorial reconstruction, uses z rather than the source's household solar-choice s_i, and discloses the suppressed technology rates, discrete eligibility caps, household equilibrium and balancing tax. Existing reported magnitudes and original reading prose are unchanged. No illustration or conceptual figure is regenerated.

## Historical coverage — do not confuse inventory with verification

Ten components of the household-climate reading were substantively reviewed. Its publication-metadata component remains incomplete, as do all components of the other 29 readings: **318 incomplete components** in total. This includes mathematical, empirical and visual claims. The three older asserted full-text reviews were not independently repeated and do not count as completed component reviews here. Unchanged historical records may remain; amended/new content must complete review. No finding of falsification is inferred from incomplete verification.

The following is the complete coverage register. Zero means **verification incomplete**, not unsupported. Mathematical features are the first priority in any later authorized continuation; no unattended audit or follow-up was scheduled.

| Edition | Reading ID | Substantive features | Verified components / total |
| --- | --- | --- | --- |
| 2026-09-25 | electrification | decision-margin, estimation-desk | 0 / 12 |
| 2026-09-25 | grid | incidence-ledger, long-view | 0 / 11 |
| 2026-09-25 | carbon-border | mechanism-map, assumption-test | 0 / 10 |
| 2026-09-25 | insurance | estimation-desk, economic-figures, incidence-ledger | 0 / 12 |
| 2026-09-25 | glyphosate | decision-margin, assumption-test | 0 / 10 |
| 2026-10-02 | 2026-10-02-green-spending | estimation-desk, assumption-test | 0 / 12 |
| 2026-10-02 | 2026-10-02-policy-mix | economic-figures, incidence-ledger | 0 / 10 |
| 2026-10-02 | 2026-10-02-amoc | mechanism-map, economic-figures, long-view | 0 / 12 |
| 2026-10-02 | 2026-10-02-storage | estimation-desk, decision-margin, incidence-ledger | 0 / 11 |
| 2026-10-02 | 2026-10-02-tax-bias | mechanism-map, incidence-ledger | 0 / 10 |
| 2026-10-09 | 2026-10-09-trade-climate | decision-margin, economic-figures, incidence-ledger | 0 / 12 |
| 2026-10-09 | 2026-10-09-landslides | assumption-test, mechanism-map, long-view | 0 / 12 |
| 2026-10-09 | 2026-10-09-nuclear-finance | incidence-ledger, estimation-desk | 0 / 11 |
| 2026-10-09 | 2026-10-09-winter-bills | economic-figures, incidence-ledger, decision-margin | 0 / 11 |
| 2026-10-09 | 2026-10-09-climate-liability | decision-margin, long-view | 0 / 10 |
| 2026-10-16 | 2026-10-16-targeted-power | estimation-desk, economic-figures | 0 / 11 |
| 2026-10-16 | 2026-10-16-pfas-agriculture | mechanism-map, decision-margin, long-view | 0 / 11 |
| 2026-10-16 | 2026-10-16-ferc-review | decision-margin, assumption-test, long-view | 0 / 12 |
| 2026-10-16 | 2026-10-16-energy-macro | incidence-ledger, economic-figures, mechanism-map | 0 / 11 |
| 2026-10-16 | 2026-10-16-climate-vitals | assumption-test, long-view | 0 / 10 |
| 2026-10-23 | 2026-10-23-paper-markups | estimation-desk, economic-figures | 0 / 11 |
| 2026-10-23 | 2026-10-23-vehicle-mix | economic-figures, assumption-test, long-view | 0 / 12 |
| 2026-10-23 | 2026-10-23-emissions-gap | long-view, estimation-desk, mechanism-map | 0 / 11 |
| 2026-10-23 | 2026-10-23-adaptation-finance | decision-margin, incidence-ledger, mechanism-map | 0 / 11 |
| 2026-10-23 | 2026-10-23-mobility-finance | decision-margin, economic-figures | 0 / 10 |
| 2026-10-30 | 2026-10-30-coal-country | estimation-desk, economic-figures | 0 / 11 |
| 2026-10-30 | 2026-10-30-household-climate | estimation-desk, mechanism-map, assumption-test | 10 / 11 |
| 2026-10-30 | 2026-10-30-methane-rule | incidence-ledger, economic-figures | 0 / 10 |
| 2026-10-30 | 2026-10-30-solar-storage | long-view, economic-figures | 0 / 10 |
| 2026-10-30 | 2026-10-30-moves6 | assumption-test, estimation-desk | 0 / 10 |

## Executed source tests

- `node scripts/test_ll_source_evidence.cjs`: 31 passed, including every requested negative case, accepted sourced interpretation, future coverage, stale Index detection, missing component detection and actual pre-write refusal with unchanged artifacts.
- `node scripts/test_ll_publication_layout.cjs`: 15 passed.
- `node scripts/test_reading_exhibits.cjs`: 691 passed.
- `node scripts/test_editorial_folio.cjs`: 261 passed; the sole drawer exception is exactly the approved Field Guide link removal.
- `node scripts/test_notebook.cjs`: 267 passed.
- `node scripts/test_field_register.cjs`: 99 passed, six editions / 26 records / 18 featured.
- `node scripts/test_publishing.cjs`: passed, including byte-idempotent preparation.
- `node scripts/test_field_brief_order.cjs`: 89 passed; the preceding Field Brief release is preserved.
- `node scripts/test_reading_navigation.cjs`: passed.
- `node scripts/prepare_periodicals.cjs`: passed; only intended generated journal, feature inventory and Field Guide asset version changed.
- `git diff --check`: passed.

## Browser validation

Actual Chrome rendering used the supported browser surface with sized iframes, not physical-device simulation. The Day/Night geometry audit covers all six editions at the established responsive widths, plus 1512px and 852x393 landscape. Each divider must coincide with actual feature boundaries; no artificial bridge is permitted. Source hashes and original figures are checked separately from rendering.

Desktop visual checks cover the inset grid figure / Ledger join, unequal-content insurance features, and the amended household equation. Phone Night inspection confirms readable wrapping and no equation overflow. A seeded old off preference does not prevent Heron opening. Close collapses the note, keyboard reopening works, Escape from the focused note restores the perch control, individual dismissal hides the appearance and moves focus to the reading heading. Index opens, Escape closes and restores focus. The mobile Periodicals drawer contains all primary destinations and no Field Guide entry. Full Edition / At a Glance switch correctly.

Before/after screenshots: [before](before.jpg), [after](after.jpg). These show local preview rendering, not deployment evidence.

Full responsive/browser CI and production verification are recorded on the PR after completion. Standalone WebKit browser-launch scripts were updated for the explicitly removed toggle but not run locally. Physical Safari/iPhone testing is not claimed. Local Bundler remains unavailable; no independent Jekyll build is claimed here.

`node scripts/test_final_regressions.cjs` fails identically on untouched baseline and this branch at the old hub-script snapshot (before reaching its updated toolbar assertion). This is pre-existing, not reported as a pass.

The first PR CI attempt caught a prerequisite-order regression in the Register fixture after moving composition earlier. Register preflight retains its original priority; both source gates still execute before artwork work or writes. An explicit empty-reading rejection was added. No check was bypassed.
