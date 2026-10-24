# Artwork originality recovery — validation record, 24 October 2026

## Recovery and baseline

Recovered the local `maintenance/artwork-full-history` branch and stash `bc1ccebc99a42d6028bf88c7a8f894e534dd097c` (`artwork-alignment-before-oct23-ll-reconcile`), based on `baea324ba6fbf0b0f1c2ff2d6792ea6d36ec31f6`. The original branch and stash remain intact. No relevant remote branch or open PR existed at preflight.

Applied the ten recovered files in an isolated worktree based on current production `edf28fa85a93c3462683aa8a00a86ee09bcd8c39`. GitHub and `git ls-remote origin refs/heads/master` independently confirmed this baseline. Its Pages run `40009960215` completed successfully. This maintenance work does not publish a new edition.

Retained the saved helper, generators, preparation changes, tests and audit. Completed Issue 005 reconciliation, updated the synthetic future L&L fixture to Issue 006, and prohibited regeneration of missing historical L&L pins through October 23. Additional regression coverage exposed a substantial-reuse gap for short compound paths; the helper now includes those meaningful paths. Legacy valley/watershed identities use actual central geometry, not family names or concepts alone. Field Brief's source, generator and thresholds are unchanged.

## Scope and behavior

Workbook selection ranks scenes supported by question stems/concepts and excludes structures from the complete frozen archive. L&L covers use independently authored synthesis-supported scenes and full cover history. Field Studies retain their own concepts and scenes, compare with complete Field Study history, and remain distinct from the same-edition cover. All three stop with actionable exhaustion errors; there is no randomized or cosmetic recycling fallback.

The helper reuses Field Brief's existing vector feature engine without modifying it. It removes publication furniture and metadata, compares effective identities, normalized central geometry, substantial primitive reuse and transform-insensitive silhouettes. The historical audit documents Workbook duplicate groups 002/003, 004/005/006/007, and 008/013. No duplicate effective identity or central geometry was found among the five L&L covers or five Field Studies. Historical duplication remains valid frozen history.

Only helper/generator/preparation code, script loading, directly necessary tests and documentation change. The shelf browser test derives current Workbook metadata from canonical data and checks all five frozen Field Studies. The Workbook browser fixture now expects the current 13 sets/104 questions and checks the monospace font while the known code block is actually displayed, rather than assuming the latest set contains one. The Heron browser test uses the supported edition route and includes Issue 005. These repair stale test assumptions; no publication UI, cadence or Heron implementation changes.

## Source and publishing checks

Commands ran from the repository root using Node v24.22.1. No prior test counts were assumed.

| Command | Result |
| --- | --- |
| `node scripts/test_art_originality.cjs` | 247 assertions passed |
| `node scripts/test_workbook_marks.cjs` | 135 assertions passed; isolated future set only |
| `node scripts/test_field_brief_cover_originality.cjs` | 395 checks passed; 48 distinct repeated-theme covers |
| `node scripts/test_field_brief_operations.cjs` | 103 checks passed |
| `node scripts/test_daily_schedule.cjs` | 118 checks passed |
| `node scripts/test_workbook_cadence.cjs` | 1,010 checks passed |
| `node scripts/test_workbook_learning.cjs` | 267 assertions passed; 104 authored question pairs |
| `node scripts/test_notebook.cjs` | 101 assertions passed |
| `node scripts/test_issue_marks.cjs` | Passed |
| `node scripts/test_publishing.cjs` | Passed; preservation and byte-idempotent preparation |
| `node scripts/test_periodicals.cjs` | Passed; Heron, shelf, learning/navigation and route regressions |
| `node scripts/test_reading_navigation.cjs` | Passed |
| `node scripts/prepare_periodicals.cjs` | Passed; no additional tracked changes |
| `node weekly-economics-environment/notebook/validate.cjs` | Five editions, 19 concepts; latest reviewed October 23 |
| `node scripts/check_field_brief.cjs 2026-10-23` | Issue 027 complete; no errors; verify existing deployment |
| `node --check` for the four changed runtime/preparation modules | Passed |
| Parse JSON and compile inline JavaScript on the hub and three publication pages | Five JSON blocks and seven inline scripts passed |
| `git diff --check` | Passed |

Eight counted source suites total 2,376 assertions/checks, plus four uncounted passing suites. The new suite exercises full-history exclusion, exact/recolored/transformed/perturbed copies, substantial reused geometry with an added frame, supported unused candidates, exhaustion, separate cover/Field Study layers, Issue 005 collisions and frozen bytes, append-only preparation, retries, and invalid supplied pins rejected before writes.

## Browser acceptance

WebKit 2336 with Playwright, a local checkout routed through the existing browser test harness, and the real Google font assets. An isolated launcher supplies compatible host libraries; no dependency or launcher is added to the repository. Initial launch failures were environment failures (missing libraries and a GStreamer/GLib mismatch) and were resolved before acceptance.

Reproduction in this session:

```sh
export WB_WEBKIT=/workspace/scratch/e27130331310/qa/webkit.sh
export SHELF_FIXTURE=/workspace/scratch/e27130331310/qa/future-workbook
SHELF_FIXTURE="$SHELF_FIXTURE" node scripts/test_workbook_marks.cjs
WB_QA_DIR=/workspace/scratch/e27130331310/qa/shelf node scripts/test_shelf_browser.cjs
WB_QA_DIR=/workspace/scratch/e27130331310/qa/heron node scripts/test_heron_browser.cjs
WB_QA_DIR=/workspace/scratch/e27130331310/qa/daily node scripts/test_daily_browser.cjs
WB_QA_DIR=/workspace/scratch/e27130331310/qa/workbook node scripts/test_workbook_browser.cjs
```

| Browser suite | Result |
| --- | --- |
| Shelf/artwork/refresh | 1,491 assertions passed at 390×844, 844×390, 768×1024 and 1440×900; latest metadata, return state, future canonical refresh and no-script fallback; all five L&L editions/Field Studies retained; no console or script errors |
| Heron | 144 assertions passed across eight viewport sizes, all five archive editions, breakpoint changes, open/close/reopen, persistent dismissal/Off, keyboard, reduced motion, day/night and glance/full modes; no script errors |
| Daily navigation/runtime | 130 assertions passed on phone portrait/landscape and desktop; Field Brief first/intermediate/latest, archives, L&L, Workbook, toolbar and day/night checks; no script errors |
| Workbook | 9,357 assertions passed; all 104 questions, learning controls, scoring, resume, ledger/reset/privacy boundaries and five responsive sizes; no script errors |

The four final browser suites total 11,122 assertions. Desktop hub and iPhone portrait Issue 005 Field Study screenshots were visually inspected. The existing image viewer's role/tabindex/class/accessible-label decoration is normalized only in the browser comparison; frozen SVG geometry and captions are compared intact.

## Baseline failures and limitations

The untouched baseline was checked in a separate worktree at the same production SHA, with the same Node runtime.

| Check | Untouched production and branch |
| --- | --- |
| `node scripts/test_field_brief_artwork.cjs` | Same assertion rejects legitimate later canonical editions against an old whole-array snapshot; normalized failure logs identical |
| `node scripts/test_final_regressions.cjs` | Same first assertion compares present hub scripts with an obsolete historical snapshot; branch diff includes the authorized full-history refresh change, independently covered by the new preservation and browser checks |
| `node scripts/test_maintenance_20261009.cjs` | Same obsolete Commonplace whole-file snapshot assertion; normalized failure logs identical |
| `node scripts/test_polish.cjs` | Same obsolete Workbook canonical-data snapshot assertion; normalized failure logs identical |
| Original shelf browser test | Both fail expecting October 8/Set 008 while production contains October 23/Set 013; repaired test now validates canonical metadata and current schedules |
| Original Heron browser test | Both time out locating an October 16 article after using an unsupported bare-date route; supported `#edition-...` route fixes the test |
| Original Workbook browser test | Both fail immediately at `13 !== 5`; updated current-data count permits actual learning/ledger coverage. A focused baseline responsive replay also reproduces the later null-font error: Set 013 Q2 has no `pre`; its font assertion was moved to the actual code-block fixture |
| `bundle exec jekyll build --destination ...` | Exit 127 on both trees: Bundler is not installed. A full Jekyll build remains unverified in this environment. No Jekyll templates, Sass or build inputs change. JavaScript/JSON checks and browser execution pass. |

One initial expanded Workbook browser attempt timed out waiting for a learning panel after eight sets. The isolated ninth-set sequence passed on both branch and production. A subsequent complete run exercised all 104 questions, then exposed the stale monospace fixture described above; the focused untouched-baseline replay reproduced that test error. After moving the font check to the actual code-block fixture, the final unmodified repository command passed all 9,357 assertions. No learning/product code was changed.

The four obsolete source snapshot tests remain failing and unchanged; no check was bypassed or originality threshold weakened to make them green. No new implementation defect remains identified. A reviewer should retain the Jekyll environment limitation and initial browser timeout in view; this is a draft for review, not a release approval.

## Published bytes and privacy/history preservation

Direct `git show` byte comparisons against the production SHA and SHA-256 hashes below match. The entire issue-mark registry (45 covers), Field Brief reading-art archive (27 editions/135 reading plates plus legacy templates), all 13 Workbook sets and learning material, the complete five-edition L&L main markup, all five frozen Field Studies, and notebook/review files are preserved. Thus Issue 005's readings, synthesis, citations, IDs, metadata, associations and review remain unchanged, while its cover and Field Study participate in future history checks.

| Protected artifact | SHA-256 |
| --- | --- |
| `personal-updates/issue-mark-archive.js` | `abae6d5d16921c0447a1a3411b5d3ec3e0df896a2372b5ca78467250855df395` |
| `daily-watchlist-5/artwork-archive.js` | `9e02a7d7bc64191c67581d0fc8ce0ea429a1415006e910d38fbb349cd6ec09ec` |
| `daily-watchlist-5/artwork.js` | `639c232718f900f0da1cc958ebeecce5f15a31de2af4de854c077359e3265a91` |
| `daily-watchlist-5/index.html` | `a64c688f46458bbdbfce8d80b37caddb1fb3927afa7652397f7d1604e7584b29` |
| `daily-econ-challenge/index.html` | `64c8fdd3976e10f7e67ea9bcbccf5a45393459ce5375678420962f13779f101e` |
| `weekly-economics-environment/notebook/index.html` | `72793244d808142b81bad42026fe6c831cb294c39bf2797f3fb14f19b31ca3e4` |
| `weekly-economics-environment/notebook/reviews.json` | `907e26f1116b6fef617eb9740c345e50991267ab97ec4f000741088eda387ded` |
| `L&L complete edition main` | `f039449f391d345e473c8b0c085821ce705ba139bf430db5bc1d0e1f1abff098` |
| `L&L frozen Field Study JSON` | `22e7c61c33a327980c2e2b33358f931512255ef28c2f1f4a7369a8e350d7c52b` |

Additional path-level diffs are empty for `/daily-watchlist-5/`, `/daily-econ-challenge/`, `/weekly-economics-environment/notebook/`, shared mobile code, Commonplace, Handbook, identity assets, `.github/` and `/rupert/`. No storage keys, learning records, network endpoints, credentials, external services, paid dependencies, automations or schedules are changed. New originality code is local SVG analysis only. Preparation and retry tests leave published source files unchanged.

## Delivery boundary

Dedicated branch: `maintenance/artwork-full-history-recovery-20261024`, based directly on the current production publication commit. Draft PR only; no merge, auto-merge, production branch update or deployment is authorized or performed.
