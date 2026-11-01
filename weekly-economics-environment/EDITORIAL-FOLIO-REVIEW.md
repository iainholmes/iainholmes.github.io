# Editorial Reading Folio — visual review, 1 November 2026

Review only. Supersedes the unapproved Expanded Editorial Spread at
`44b2fb4337bd34bfabf13a915b1cd5a8523cd9ee`. No production merge or deployment.
Reconciled with production `70274c9dfae92aa3c6132a3cf7dfd3659d9559a1`;
that production advance contains only Rupert changes, preserved unchanged.

## Editorial architecture

- Each reading has a chapter folio, substantial LM Roman Dunhill headline,
  evidence classification, separate lead argument and semantic analytical sections.
- The analysis and research question share a stable grid. The question is a
  scholarly companion with its own headline and research agenda, without floats,
  cards, clipped histories or independently scrolling content.
- The sticky chapter register separates the five numbered readings from synthesis,
  Methods and the editorial record. Selected destinations expose `aria-current`.
- Synthesis uses an intact introductory paragraph, asymmetric central argument
  and supporting discussion, and an intact concluding observation when authored.
  Paragraphs are never split between CSS newspaper columns.
- The issue's Methods directory has an introduction and numbered concept links.
  The colophon groups complete original paragraphs under editorial scope,
  evidence/interpretation and publication record labels.
- A single `reading-folio.css` owns these components. Superseded component rules
  were removed from inline CSS and `refinement.css`; shared opening/navigation
  styles remain in place. Canvas maximum is 1462px plus 44px outer gutters.

## Authoring and future additions

`editorial-folio.cjs` is a dependency-free publication-time formatter, not browser
JavaScript. The existing preparation command composes new canonical authoring
markup into the same semantic structure before any writes. It slices original
HTML rather than reserializing scholarship, links or figures; retries are byte
stable. Unsupported reading structures fail explicitly instead of dropping text.

All six current editions contain direct concept links, with no issue-specific
accordion explanations. No summaries or explanations were fabricated. Native
`details`/`summary` remains supported for future authored entries; its Enter/Space
interaction and visible focus were checked in a clearly labelled private fixture.
The fixture is not publication content and is not part of this branch.

The inaugural edition's historical prototype statements (including its archive
and scheduling description) remain verbatim. These are historical statements,
not claims about current operations, and were not silently corrected.

## Visual and browser verification

[Full-resolution before/after evidence](https://chatgpt.com/library?file_id=libfile_6b59e0205aec81918576f5dab5bdef4c&account_id=personal)
contains 20 native viewport captures, preserved at their captured resolution
without thumbnail resizing. It includes the former proposal, revised readings,
long titles, dense analysis, the preserved September 25 chart, consecutive reading
boundaries, all three closing regions, footer, tablet, phone and Night examples.
Desktop browser captures show the browser-scaled 1512/1600px CSS viewport;
geometry was tested at the actual selected iframe width.

The browser checks ran through the cloud Chrome UI and authored private QA pages:

- 36 combinations: 1600, 1512, 1280, 1024, 834, 768, 430, 393 and 375px,
  each in Day/Night and September 25/October 30 editions. No page overflow,
  overlapping research notes or closing sections; hero/Field Notes bounds unchanged.
- 99 navigation checks: 26 Register records, eight associated readings, two
  history actions, six direct bookmarks, one reload, six Full Edition/At a Glance
  transitions, 19 Concept Index/return paths and 31 historical Notebook links.
- 48 reading/closing chapter destinations across all six editions: headings clear
  the toolbar and active-location state updates.
- Native keyboard Tab/Enter chapter navigation with a visible 2px focus outline;
  native Enter/Space accordion interaction in the private fixture; Heron open/close.
- 200% text simulation across the full reading/closing region: 393px phone
  (378px content viewport, 34px prose) and 1280px desktop (1265px, 36px prose).
  Text-range bounds and document width showed no horizontal overflow.

Below 1181px, research follows analysis; its heading/agenda can share two tracks
until narrow-phone width. Below 821px the rail gives way to the existing mobile
navigation. On phones the chapter opening is vertical and all closing grids stack.

## Commands and results

| Command | Result |
| --- | --- |
| `node scripts/test_editorial_folio.cjs` | 159 assertions passed; historical scholarship, closing paragraphs, destinations, private future edition, native accordion markup, idempotency and mutation sensitivity |
| `node scripts/test_notebook.cjs` | 265 assertions passed; cumulative Notebook unchanged on this branch |
| `node weekly-economics-environment/notebook/validate.cjs` | Six editions, 19 concepts, latest reviewed October 30 |
| `node scripts/test_publishing.cjs` | Passed, including idempotent preparation and retained journal font |
| `node scripts/test_art_originality.cjs` | 523 assertions passed; all originality thresholds unchanged |
| `node scripts/test_art_append_growth.cjs` | 228 growth checks; augmented fixture also passes 535 originality and 308 Workbook assertions |
| `node scripts/test_field_register.cjs` | 99 assertions passed |
| `node scripts/test_periodicals.cjs` | Passed Heron lifecycle/DOM, mobile shelf, recovery and navigation checks |
| `node scripts/test_reading_navigation.cjs` | Passed |
| `node scripts/test_daily_schedule.cjs` | 134 checks passed |
| `node scripts/test_workbook_cadence.cjs` | Passed |
| `node scripts/prepare_periodicals.cjs` | Passed; no unintended generated files changed |
| `git diff --check` | Passed |

The historical artwork fixture canonicalizes only the authorized journal
presentation before per-edition comparison. Exact original paragraphs, headings,
figures, links and IDs are independently protected by the folio suite. Missing
pins, altered historical content/metadata, structural reuse and invalid supplied
artwork continue to fail; append-only growth remains allowed.

## Preservation and known limitations

All 30 reading content records match production; all 15 figure elements and all
six hero/overview sections remain byte-identical. Every original ID and anchor
element remains. Frozen artwork registries, `field-studies`, `field-register`
and `companion-data` are byte-identical. Cumulative Notebook, other Periodicals,
shared reading modes, schedules/workflows and Rupert are unchanged.

Four older suites were run against both untouched production and this review;
each fails at the same first pre-existing assertion:

| Suite | Same production/review failure |
| --- | --- |
| `test_polish.cjs` | Workbook canonical-data snapshot |
| `test_final_regressions.cjs` | Periodicals hub interaction/data snapshot |
| `test_maintenance_20261009.cjs` | Commonplace whole-file snapshot |
| `test_identity_runtime.cjs` | Legacy colophon ordering assertion |

Those suites were not changed or bypassed. No local Jekyll build is claimed:
Bundler remains unavailable. Native Safari/iOS, physical-device rendering and
live deployment parity have not been verified. One clipped browser screenshot
timed out; native viewport captures succeeded and are the delivered evidence.

## Independent release decisions

1. Main journal: approve/reject this revised Editorial Reading Folio separately.
2. Cumulative Notebook: the unified scholarly folio and all 19 “Key Qualification”
   headings remain on `design/ll-scholarly-folio-review-20261101` at
   `8db7f4928f99eb8e94d980bb931c740c2ba7b35a`, untouched by this work.

The visual sources are disjoint. Both branches update `scripts/test_notebook.cjs`
in separate hunks: this journal review protects scholarship independently of
presentation, while the Notebook review enforces its heading label. A disposable
combined-merge rehearsal merged without conflicts and passed the 267-assertion
Notebook suite, 159-assertion folio suite, publishing checks and `git diff --check`.
Neither review branch was modified by that rehearsal. Either design retains its
own explicit visual-approval gate; preserve current production and the other review.
