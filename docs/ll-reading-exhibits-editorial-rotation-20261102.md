# Loblolly & Logit — Integrated Reading Spreads (PR #49)

**Review-only.** The draft branch is not the live periodical. Never merge until the actual page has been visually inspected and the article-specific figures have received editorial confirmation.

## Editorial design

The journal retains its outer page width, edition navigation, left and right vertical boundaries, enlarged mirrored copper terminals, typography, site identity, Research Notebook, Heron and Commonplace/Keep controls. All original author-written article text, figures and sources are preserved.

Each reading now follows a more intentionally composed rhythm:

1. **Chapter header and finding:** clear typography and subtle horizontal rules.
2. **Research / design / initial argument:** readable full-width narrative with a controlled line measure.
3. **Asymmetrical analytical spread:** the existing *Economic interpretation* shares a composed editorial surface with one article-specific feature. The Source Dossier sits to the left; the Incidence Ledger or Long View sits to the right. The two sections form one spread rather than separate consecutive blocks.
4. **Original figures** (where authored): retained after the interpretive stage, never replaced by the feature.
5. **Evidence Register:** *What the evidence does—and does not—say* and *Research Notebook* share a horizontal starting line. When the Heron creates a `.margin` wrapper, the notebook remains in the same column.
6. **Original source links:** unchanged.

At narrower viewports the analytical spread stacks instead of squeezing prose into tiny columns. At phone width it remains vertically legible. Print omits decorative framing and preserves actual content.

## Three independently designed reading features

### The Incidence Ledger — 11 readings

**A tight, source-grounded economic graphic plus a compact two-part ledger**: affected party / actual or plausible incidence, with an evidence-status qualification on each entry. The chart/model is integral to the Ledger rather than an unrelated decoration.

The eleven custom graphics include:

| Reading | Visual type | Evidence basis |
|---|---|---|
| Coal demand | Two-bar comparison | Mining-employment declines of 0.94 and 1.15 percentage points (different measures, not additive) |
| Methane-rule reconsideration | Economic accounting equation | EPA's projected $2.5bn annual compliance savings and $0.2–0.3bn annual market-surplus change, yielding $2.7–2.8bn reported subtotal, **excluding some external damages** |
| Winter heating | Signed bar chart | EIA conditional forecasts: +21% oil, +4% electricity, −9% gas, −3% propane |
| Paper markups | Segmented decomposition | 17.7 marginal-cost + 5.2 markup log points ≈ 23 reported price-coefficient log points; distinct from the estimated 5.6% markup change |
| Mobility finance | Two interval ranges | Reported borrowing-rate ranges of 45–90% versus 4–8%, explicitly not a controlled comparison |
| Insurance, policy mix, storage, trade cooperation, PFAS farming, energy macro | Six distinct titled mechanism pathways | Conceptual illustrations based on the reading, with no invented magnitudes and explicit caveats |

All data graphics are generated locally as deterministic, labeled HTML/SVG, with evidence caveats and no external plotting service. Their axes and numerical values derive from the published readings and should be spot-checked against the linked primary sources before release.

### The Source Dossier — 12 readings

**Renamed from Evidence Cabinet.** It is now intelligible as an examination of a specific source-supported claim: a verbatim excerpt from L&L's published finding, a short note on what supports the claim, and a clear note on where the claim stops. Compact archival-paper styling and two annotations make it distinct from the general limitations section and easy to inspect.

This does not impersonate a primary-source facsimile. The excerpt is explicitly attributed to the original L&L reading, with linked primary sources retained below.

### The Long View — 7 readings

A **connected vertical chronological track** with numbered stations, visible date/event/status groupings, filled versus open milestone markers distinguishing observations from conditional stages, and an authored one-sentence takeaway explaining why the sequence matters. Timelines no longer assume all data points are historical; scenarios, plans and projections are labeled as such. Uses the reading's published evidence.

## Editorial selection and future issues

Selection prioritizes the reading's actual economic question and evidence type. Variety is monitored but **not forced**: all six editions use more than one feature, none contains three consecutive identical treatments. Across 30 readings there are 11 Ledgers, 12 Source Dossiers and seven Long Views.

Editors should author an appropriate item for a new reading, including a Ledger graphic with verifiable provenance or a timeline with defensible dates. The no-mapping fallback is a clearly labeled Source Dossier quoting the new reading's own finding, without invented numerical estimates, parties or dates. Publisher generation is synchronous, deterministic, offline and idempotent.

## Verification performed, and limits

- All **30 original scholarship records** remain identical under the source-preservation comparison, including article headlines, source links, figures and research notes.
- Layout composer repeated on the current document produces identical output.
- Reviewed source-level JavaScript test runs: **159 historical-edition, 111 reading-layout and 542 rotating-exhibit checks passed (812 total)**.
- All 11 source-specific visuals, 12 Dossiers, seven timelines, nine original visual/media blocks, and 30 evidence/notebook pairs appear in the generated document.
- This was tested with repository sources retrieved from GitHub and isolated JS execution using read-only mocks. It is **not equivalent to executing the full repository Node/Jekyll workflow**.
- **No physical Safari screenshot, browser-measured fit, or production deployment has yet been independently verified.**

## Required visual and editorial acceptance before merge

View actual branch in Safari using the existing local preview:

- Coal reading: source-derived bar comparison and no giant unused Ledger space.
- Methane reading: the EPA equation is legible and doesn't suggest complete social welfare.
- Household-climate reading: the renamed **Source Dossier** has clear purpose and hierarchy.
- Solar + storage: timeline dates, event sequence and conditional future milestones are immediately distinguishable.
- Figure-rich articles: source graphics still fit and are not squeezed into the interpretive stage.
- Check laptop/desktop at 1704, 1512, 1440, 1280, 1180; iPad at 820; phone around 393 CSS pixels; night and light modes, Glance, print, real Heron expanded/collapsed/dismissed, Keep controls and clipping.
- Read every graphic's source/qualifier and all curated Dossier annotations before editorial approval. The test verifies internal consistency; it does not independently substantiate every primary-source number.

Changes remain on **draft PR #49**, unmerged.
