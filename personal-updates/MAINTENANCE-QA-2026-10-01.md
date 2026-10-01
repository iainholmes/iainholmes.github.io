# Periodicals maintenance verification — October 1, 2026

Review branch: `periodicals/publishing-maintenance-2026-10-01`.
Verified starting master: `68490dbc4a62fbbdb813dafb04e1ef7fc45f93e5`.

## Content and archive integrity

- Workbook Set 004 was **recreated**, after two focused history searches found the specified eight topics but no original questions/options/answers/explanations or recoverable attachment. It contains eight problems: treatment-level clustering, positive externalities, Ramsey dynamics, noncompliance, permit banking, experimental covariate adjustment, Faustmann rotations and spatial spillovers.
- Sets 001–003 are unchanged as parsed objects and as original data bytes. Explicit numbers remain 1, 2, 3; October 1 is 4. Correct indexes and question IDs are valid and distinct. Calculations and economic assumptions were checked.
- All six existing Field Brief editions and all their five-story payloads remain unchanged. Only the publisher contract was added.
- L&L's original articles, Register, Heron data and existing navigation remain intact. The requested hero title is now `The Price of a Resilient Economy`. Original Field Study 001's complete SVG/caption bytes are preserved in both the hero and the dated artifact registry.
- Root `index.html`, `/rupert/`, other publications and personal-site pages are untouched. Source changes are limited to the four requested publication paths and their focused publishing/test helpers under `scripts/`.

## Automated checks

Passed:

- `node scripts/test_issue_marks.cjs`: issue-wide themes, equal per-question thematic votes, normalization, different issue output and content-derived subject behavior.
- `node scripts/test_periodicals.cjs`: existing Heron arrival/queued triggers/scroll/note/departure/reopen/mobile/reduced-motion lifecycle; Resume thresholds, semantic restoration, question recovery and suppression; control-bar swipes.
- `node scripts/test_publishing.cjs`: original edition byte preservation; Set 004's eight-question schema; seven-edition lookback with zero/one/six/ten source issues; repeat penalties; evidence-backed material-development overrides; diversity defaults and deliberate exception; stable legacy marks; different repeated-subject compositions; unchanged Field Study 001; sequential/deterministic new studies; title hierarchy; idempotent preparation.
- Every executable inline script in the four affected HTML pages parses. `git diff --check` passes.

## Responsive browser and interaction QA

A local headless Chromium renderer was made available through a reputable npm browser package after the usual browser download and cloud preview route failed. Actual rendered pages, rather than markup alone, were inspected.

| Viewport | Hub | Workbook | Field Brief | L&L |
|---|---|---|---|---|
| Desktop, 1440×1000 | Inspected | Inspected | Inspected | Inspected |
| Laptop, 1280×800 | Inspected | Inspected | Inspected | Inspected |
| iPhone portrait size, 393×852 | Inspected | Inspected | Inspected | Inspected |
| iPhone landscape size, 852×393 | Inspected | Inspected | Inspected | Inspected |

- No page script errors in the 16-page render matrix.
- Workbook: all eight questions were navigated and answered through the actual controls on desktop and portrait. Submission produced Score 8 of 8 and eight worked solutions. The Ledger lists four editions, with October 1 first; all four date routes render their correct date.
- Hub: both dynamic and embedded fallback covers reflect Field Brief October 1 / Issue 006 and Workbook October 1 / Set 004, with correct issue titles/counts.
- Issue marks: September 30's institutional threshold and October 1's power trunk/compute block/oversight frame were rendered side by side at 300px cover width and visually inspected. Their dominant silhouettes and arrangement are clearly different, while the Field Brief palette remains the same. Old mark SVGs match the pre-maintenance generator exactly; future incidental text edits cannot mutate them.
- L&L: computed styles report Ectros normal on the masthead, Latin Modern Roman Dunhill normal on hero, Five Readings and article titles. Both requested fonts loaded successfully. Original Field Study 001 was visually compared with a generated Field Study 002 test artifact based on a river-displacement synthesis. The test plate was not published as an actual issue.
- The laptop hub retains a pre-existing roughly 1px overflow on the Workbook cadence label. It reproduces against the original hub and was left outside this focused maintenance scope. The phone shelf's horizontal browsing behavior is unchanged.

## Publishing diagnosis and limits

The failed Workbook write's exact cause remains **unestablished**: accessible history confirms a block before repository acceptance but exposes no raw failed-operation log. The current scheduler targets `master`. Field Brief's successful October 1 append shows that the live repository was writable for that publication; it does not identify Workbook's failed call or justify alleging a general outage.

The repaired write discipline is documented in `PUBLISHING.md`: latest master → isolated append → numbering/content/artwork verification → intended commit → remote and live verification → publisher/backup state. Re-enable the accessible paused weekday Workbook task only after the completed publication is verified on master and GitHub Pages; retain the 10:00 AM America/New_York Monday–Friday schedule.

Phone QA uses Chromium at iPhone dimensions, not a physical iPhone/Safari session. Editorial keyword profiles support judgment; publishers must supply explicit tags where automatic domain matching is ambiguous. Diversity and novelty are editorial defaults, not mechanical quotas or a guarantee of future editorial judgment.
