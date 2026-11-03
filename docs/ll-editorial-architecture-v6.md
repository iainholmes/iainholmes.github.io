# Loblolly & Logit: permanent editorial architecture VI

Effective with the six-edition re-issue, 3 November 2026. This document supersedes
the older exhibit rotation and finish-stage layout instructions. The publication
schedule, immutable artwork and shared Periodicals navigation are unchanged.

## Sources of truth

- `weekly-economics-environment/index.html`: archival prose, original source
  register, stable reading/edition identities, figures and companion interactions.
- `editorial-decisions.json` in that directory: explicit reading-level editorial
  argument, verified subject classifications, composition, feature content,
  provenance, six selection criteria, rejected alternatives, figure and model
  opportunity assessments, and the historical change record.
- `reading-feature-registry.js`: the four Editorial Sections and eight Special
  Features, their purposes, and evidence-led candidate eligibility. Keywords and
  mechanical rotation cannot produce publishable selections.
- `editorial-architecture.cjs`: semantic feature rendering and content-appropriate
  interleaving; called by `editorial-folio.cjs`. Missing decisions stop publishing.
- `reading-folio.css`: the single reading and Index design system. Do not append
  inline finish-stage overrides to the page head.
- `field-guide.cjs`: generates the Field Guide from the registry and actual
  publication Index. `reading-index.js` presents generated metadata in the sticky
  toolbar drawer. Neither owns a second manually maintained archive.
- `reading-layout-guard.cjs`: the pre-write publication gate.
- `source-review.json`: source access and specific full-text checks, explicitly
  distinguishing endpoint access from substantive verification.

The old `reading-exhibits.cjs` and `reading-feature-dossiers.cjs` are retained as
historical source records only. They are not renderer imports or fallbacks.

## Authoring a future edition

1. Assess the research and sources; preserve their definitions, dates, units and
   uncertainty. Record what was actually read. An accessible URL alone does not
   verify a claim. Record access limitations without bypassing them.
2. Write the core argument and four consistent Editorial Sections. Add the five
   reading articles to the edition with stable, unique IDs and original sources.
3. Add one explicit decision record per ID to `editorial-decisions.json`. Inspect
   existing records for the schema; never clone their conclusions as a substitute
   for reading a new source. Supply `subjects`, `argument`, `composition`,
   `figureAssessment`, `modelAssessment`, `rejected`, `evidenceReview`,
   `minimumTargetReview` and `changeRecord`.
4. Rank eligible feature candidates against analytical relevance, evidence,
   distinctiveness, reader value, presentation suitability and information burden.
   Write the two strongest substantive features. Document a minimum-target
   exception if fewer are warranted. The Heron does not count toward this target.
   Justify any additional feature; retain original sourced figures. Use archive
   variety only to break a tie between equally useful choices.
5. Each feature needs `type`, `title`, an explicit evidence `status`, `rationale`,
   `provenance`, all six `assessment` fields and substantive type-specific content.
   Estimation Desks require semantic MathML, definitions, interpretation/estimand
   and identification boundaries. Label reported, reconstructed, theoretical and
   proposed specifications accurately. Maps require connected nodes and qualified
   links; charts require sourced quantities or explicitly theoretical diagrams.
   Do not invent estimates, confidence intervals or completed diagnostic tests.
6. Choose the composition for the argument: `figure-led`, `model-led`, `map-led`,
   `decision-led`, `horizon-led`, `comparison` or `method-pair`. The renderer varies
   feature placement and width while retaining each family's identity. Chronology
   tracks derive from stage count. Ledger comparisons have three desktop columns;
   mobile reflow and intermediate four-stage timeline wrapping are intentional.
7. Run `node scripts/prepare_periodicals.cjs`. It composes the archive, versions CSS
   and Index assets, validates before writes, and regenerates the Index, inventory
   and Field Guide from the actual publication. Fix failures at the authored source.
   Do not bypass the gate, restore v5 fallbacks, or hand-edit generated metadata.
8. Run the checks below, inspect responsive renders and all changed features, then
   publish through the existing master/GitHub Pages workflow. Confirm the actual
   deployment commit and loaded asset bytes, and repeat browser QA on production.

## Required checks

```sh
node scripts/test_ll_publication_layout.cjs
node scripts/test_reading_exhibits.cjs
node scripts/test_editorial_folio.cjs
node scripts/test_notebook.cjs
node scripts/test_field_register.cjs
node scripts/test_publishing.cjs
python3 -m http.server 8765 --bind 127.0.0.1
# In a separate terminal with Playwright 1.57.0 and Chromium installed:
LL_QA_JSON=/tmp/ll-layout-results.json node scripts/test_ll_layout_browser.cjs
# Repeat against the published site:
LL_ORIGIN=https://iainholmes.github.io node scripts/test_ll_layout_browser.cjs
```

`.github/workflows/ll-layout.yml` runs source/preservation checks and the rendered
browser gate on pushes and PRs. The browser gate covers every reading at thirteen
widths in day and night modes plus Index search, coverage, precise feature links,
Escape, focus restoration and position preservation. A private future-edition
fixture verifies automatic growth from 30 to 35 indexed readings.

Visual acceptance remains an editorial responsibility: inspect heading/body and
closing treatment, readable nodes, axes, equation scrolling, borders, stage-count
boundaries, accidental whitespace, phone reflow and actual custom fonts. Exercise
the Heron's close/reopen/dismiss and persisted toggle states. Capture meaningful
before/after examples and all changed families. Passing source tests or a commit
is not a substitute for viewing the production deployment.

## Navigation contract

The sticky toolbar's Index replaces the old Editions dialog and includes all
archive functionality. It browses editions, actual subjects and precise feature
anchors. The shared Periodicals dropdown is exclusively site-wide navigation and
must not receive the Index. The Field Guide explains components and links to
authentic examples; the Index locates their actual occurrences.

## Research limitations

The 2026 re-issue preserves original scholarly prose, graphics, citations and
edition identities. New equations clearly identify their provenance. Access
checks found 37 accessible endpoints out of 52; 15 were restricted or unavailable.
Three full-text methodological specifications received separate checks, recorded
in `source-review.json`. This is not a claim that every source was available in
full text or that an HTTP success verifies every historical assertion.
