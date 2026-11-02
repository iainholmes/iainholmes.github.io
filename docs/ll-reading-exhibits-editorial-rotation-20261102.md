# Loblolly & Logit — Three rotating reading exhibits

**Status:** draft PR #49, review only. Not merged, not deployed, and not yet visually accepted.

## Editorial decision

Replace the retired Economic Hinge with **one** substantial, reading-specific feature chosen from:

- **The Incidence Ledger:** A carefully ruled table explaining affected groups, the economic consequence, and whether that consequence is estimated, projected, modeled, or merely plausible. Never add unrelated monetary quantities into a fictitious welfare total.
- **The Evidence Cabinet:** A source-exact excerpt from the existing published finding, paired with a curated interpretive key and a prominently identified evidentiary boundary. It is a reading of the record, not a new claim about what the original source proves.
- **The Long View:** A horizontal chronology or explicitly labeled scenario sequence. Each dated station distinguishes observed history, forecasts, proposals, or modeled counterfactuals.

The three experiences have distinct HTML structures and visual treatments, not interchangeable labels applied to a single component.

**Selection rule:** suitability to the reading is primary. Diversity across successive readings is secondary. A 1–2–3 rotation must not turn a non-temporal paper into a fabricated timeline or assign imaginary gains/losses to actors. An audit of the six current editions finds no run of three identical formats in an edition. Over 30 published readings: **11 ledgers, 12 cabinets, 7 long views**.

## Published edition choices

| Edition | Reading 1 | Reading 2 | Reading 3 | Reading 4 | Reading 5 |
|---|---|---|---|---|---|
| September 2026 | Long View | Long View | Cabinet | Ledger | Cabinet |
| October 2 | Cabinet | Ledger | Long View | Ledger | Cabinet |
| October 9 | Ledger | Cabinet | Long View | Ledger | Cabinet |
| October 16 | Cabinet | Ledger | Cabinet | Ledger | Cabinet |
| October 23 | Ledger | Long View | Long View | Cabinet | Ledger |
| October 30 | Ledger | Cabinet | Ledger | Long View | Cabinet |

All 30 have individually curated metadata in `weekly-economics-environment/reading-exhibits.cjs`. The material uses the original published reading, not generated numerical estimates. Each feature has its own visible context and uncertainty classification.

### Future editions and unattended publication

- Editors may append an explicit, source-grounded entry keyed to the stable reading ID. Prefer this for every Friday issue.
- If an unfamiliar reading is published without an approved entry, publication continues using a clearly labeled **Evidence Cabinet** drawn directly from that reading's lead. This avoids fabricating parties, causal effects, prices, or dates in an unattended pipeline.
- The rotation audit detects sameness but does not force unsuitable formats for novelty.
- The exhibit renderer is deterministic and local: no external requests, image generation, subscription or new permission dependency.
- Original issue IDs and accepted artwork are untouched.

## Structural reading redesign retained in draft

1. Chapter metadata/title and finely ruled finding.
2. Continuous prose and research/economic interpretation, not a permanent split-column article.
3. One rotating exhibit in the newly opened width.
4. A shared lower **Evidence Register**, with *What the evidence does—and does not—say* horizontally aligned with the Research Notebook. If Heron moves the notebook into a `.margin` wrapper, that wrapper occupies the same grid track.
5. Existing original source links.

The existing two-column sidebar/reading structure remains. The left tapered spine gains a mirrored copper lower terminal. The continuous right-side perimeter gains larger paired copper tapered terminals; pointer-events are disabled for the decoration. Day/night uses existing theme tokens, while tablet/mobile stacks the features and evidence area. Keep, Heron, Field Notes and publisher scheduling stay unchanged.

## Source and validation evidence

- Existing original article text, headings, figures, author-supplied evidence limitations, Research Notebook content, links, source citations and identifiers compare equal before and after composition for all 30 readings.
- Composer output is idempotent, with a stable `data-reading-exhibit="1"` marker and all 30 exhibit instances present.
- Existing editorial-folio suite: **159 checks passed** in isolated JavaScript with GitHub-backed source mocks.
- Existing layout suite: **108 checks passed**.
- New rotating-exhibit suite: **353 checks passed**, including exact render equality, semantic format metadata, six-edition variation, mobile/layout rules and safe fallback.
- These are **source-level JavaScript checks**, not a complete Node/Jekyll build, automated browser run, or physical Safari test.
- Former Economic Hinge module, test and documentation are removed from this PR branch, and all canonical generated HTML blocks are replaced.

## Before release

Evaluate a representative ledger, cabinet and timeline in full-page browser rendering at 1704, 1512, 1440, 1280, 1180, 820 and 393px. Also verify night mode, print, Glance, Research Notebook layout, actual expanded/dismissed Heron, Keep controls, source links, figures, long date labels, four-stop timelines, top/bottom copper symmetry, right-edge clipping and publication preparation on a new issue.

Inspect the curated interpretations individually for accuracy and suitability before they become published editorial content. Do not merge this draft purely on static checks.
