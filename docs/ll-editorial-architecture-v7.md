# Loblolly & Logit: authored reading architecture VII

The six-edition reissue preserves the journal's research, dates, original graphics,
anchors, artwork and site-wide navigation. Layout is publication-specific.

## Authoring and publishing

1. Review the source, its design, estimand, mechanisms, evidence status and limits.
2. Record the argument, subjects, ranked feature choices, six assessment criteria,
   provenance, plausible rejected alternatives and figure/model opportunities in
   `weekly-economics-environment/editorial-decisions.json`.
3. Aim for two substantive features; justify fewer or more. Audit all eight families
   for broadly balanced use. Retained source graphics and the selective Heron remain
   visible in the actual rendered inventory; neither is discarded to satisfy a quota.
4. Give the reading an individual `layout.id`, palette, color rationale, composition
   rationale, permitted notebook/Heron docking locations and any feature variants.
   Author its arrangement in `reading-arrangements.cjs`. The four approved complex
   specimens are composed in `reading-compositions.cjs`. Missing arrangements stop
   publication; an old template or keyword match is not a fallback.
5. Author meaningful equations, diagrams, comparisons and reading guides. Label
   reported, reconstructed, theoretical and proposed material. Define mathematical
   terms, interpretations and identifying limits. `mathLayout` records line breaks
   whose rendering is checked against the original mathematical tokens.
6. Run `node scripts/prepare_periodicals.cjs`. It composes every edition, versions
   CSS, Index and composition-runtime assets, validates before writes, and generates
   the inventory and Field Guide from the rendered archive. Retry is idempotent.
7. Run the source/publishing tests and rendered browser checks in the workflow.
   Inspect all changed compositions at desktop, laptop, tablet and phone widths in
   day and night modes. Check inside components for horizontal scrolling.
8. Publish through the existing master/GitHub Pages process. Confirm the deployed
   revision and asset hashes, then repeat rendered checks on production.

## Governing visual rules

- Keep the approved headline type, large copper numbers, title rules and continuous
  forest pillars with copper tips. Full-width rules separate adjacent readings.
- Economic Interpretation follows the reading. Standard sections retain one clear
  typographic system. Notebook and Heron placement can adapt; Sources always come last.
- Each reading owns one subtle background profile. Shared and detached feature fields
  keep that identity. Rounded, feathered edges do not replace the architectural frame.
- Adjacent Special Features join physically into one continuous analytical field, even across individually authored rows or vertically adjacent feature-only groups. Standard editorial, notebook, source and Heron elements are hard boundaries: never bridge them. A short editorial text column may be centered vertically when the opposing analytical figure is substantially taller; do not insert filler or change prose.
- Internal dividers only separate genuinely adjacent Special Features inside joined fields. They are
  miniature outer pillars, with copper tips tapering into green stems, at reduced
  opacity. Vertical and horizontal versions occupy the centered 80% of the actual
  shared boundary. The runtime excludes standard elements and other intervening
  content. It does not extend a divider beside an editorial section or notebook.
- Fit real content without fixed section heights or placeholders. The runtime can
  balance authored pairs within their intended hierarchy and move actual notebook
  or Heron nodes only to approved locations. It preserves focus and does not move an
  open companion. Freed space moves Sources and the next reading upward.
- A Ledger uses three comparison columns when space permits. Chronology tracks use
  the actual stage count. Bounded or vertical chronologies are intentional variants.
- On phones, stack sections, reflow chart labels and break mathematical notation
  into readable lines. No page or component should require horizontal scrolling.
- Sources use horizontal references where space permits, a copper-underlined reading
  descriptor and a short copper/forest double rule. This is distinct from the full
  separator between readings.

The Reading Index opens as a centered, viewport-fitted modal, not a right-hand drawer; preserve its search, archive, subject and feature views. The Reading Field Guide reuses the publication's copper-tipped framing and three-line reading motif, with a separate visual identity for Special Feature specimens. Every Special Feature reader guide must be reading-specific, source-qualified, and synchronized with the published feature inventory; the ordinary Editorial Sections are not rewritten by this rule.

`reading-folio.css` owns the reading/Index design; do not append inline overrides.
`reading-composition.js` measures joins and content fit. The Field Guide explains the
families; the sticky toolbar Index locates actual editions, subjects and feature
anchors. The Periodicals dropdown remains reserved for navigation between publications.

## Validation

Run the six source/publication checks in `.github/workflows/ll-layout.yml` and the
browser acceptance suite in `scripts/test_ll_layout_browser.cjs`. It verifies the
archive, feature geometry, component overflow, headline identity, chronology bounds,
80% dividers, Index navigation, exact deep links and companion behavior. Historical
prose, citations, original figures, artwork and shared navigation are independently
checked against Git history. Layout assertions follow available component width.
