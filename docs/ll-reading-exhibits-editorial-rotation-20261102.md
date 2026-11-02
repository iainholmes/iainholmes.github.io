# Loblolly & Logit — Guided Reading Spreads (draft PR #49)

**Status: review branch only. No merge or deployment.** This update responds to the user's direct inspection and preserves the current admired typography, palette, page width, and overall publication architecture.

## The reading sequence

1. **Original chapter title and evidence status** → a thin graduated horizontal rule with restrained copper/forest registration details.
2. **Original finding / lead** → a separate delicate rule, connecting the headline to the research rather than boxing it into a card.
3. **First research section** → if its authored heading is literally *Why it matters* (26 readings), the heading becomes a wide left title with its untouched explanatory paragraph to the right. The four other openings retain their specialized headings and existing sequential treatment.
4. **Paired analytical spread** → original *Economic interpretation* and one appropriate reading exhibit. A subtly ruled seam gives the two sections separate editorial identities without another heavy panel. The Source Dossier, when selected, appears on the opposite side.
5. **Original article figure(s)** → nine source-author visual/media sections retain their published markup after the spread.
6. **Aligned evidence register** → *What the evidence does—and does not—say* and the *Research Notebook* begin on the same horizontal line, with complementary forest/copper/river borders. The existing Heron wrapper is nonsticky inside this specific pair.
7. **Original source links**, unchanged.

These changes affect presentation rather than rewriting the 30 published author-supplied readings.

## Three recurring, article-specific exhibits

### The Incidence Ledger (11 readings)

Every Ledger now opens with an **authored beginner-friendly explanation of the economic question**, followed by its **source-grounded numerical figure, accounting identity, or explicitly non-numerical model**, a **How to read this** interpretation, the **incidence entries**, and one **defined key concept**.

The ledger is tight: numerical figure in a subtle colored surface; compressed lines carry both the impact and evidence status; forest, river-blue and copper highlight separate parties/channels without changing the approved journal palette. Every graphic explicitly identifies whether it is an estimate, forecast, model mechanism or agency-projected quantity.

Verified against the published original journal copy (not yet individually against all primary-source documents):

- Coal employment decline: 0.94 and 1.15 **percentage points** in different sources, not additive.
- EPA methane rule: about **$2.5bn annual compliance savings plus $0.2–$0.3bn energy-market surplus = $2.7–$2.8bn projected subtotal** versus the 2024-rule baseline. Extra climate/health damages are **not** completely included. This is **not total social welfare**.
- EIA winter fuels: conditional +21% heating oil, +4% electricity, −9% natural gas and −3% propane expenditure forecasts.
- Pollution-rule price decomposition: estimated marginal-cost 17.7 and markup 5.2 log points ≈ 23 log points, distinct from the estimated 5.6% markup increase.
- Rider credit: 45–90% and 4–8% borrowing-rate ranges are *different markets*, not a causal comparison.
- Six remaining Ledgers show labeled economic transmission models without invented data points.

### The Source Dossier (12 readings)

The former Evidence Cabinet keeps its clearer name. It displays a verbatim excerpt **from L&L's own published finding**, with **What supports it** and **Where the claim stops** annotations. It does not masquerade as a facsimile of a primary-source document, and published citations remain below the reading. No generic **“From the Annex”** or similar kicker remains in any exhibit.

### The Long View (7 readings)

All seven Long Views are now self-explanatory even when encountered before the main story:

- A **plain-language orientation** says what the timeline is about and which quantities should not be confused.
- The timeline identifies a **reported observation, policy/proposal, modeled counterfactual or conditional projection** at every stage.
- Each of the **23 milestones** now has its own explanatory paragraph describing why it matters, not just a label.
- One **key concept** is defined in accessible language, and the original concluding interpretation is preserved in a clearer **Why this matters** area.

Do not treat speculative steps as inevitable historical developments. Percent reductions referring to the same baseline are not additive. An observed sales share is not the fleet composition; a policy proposal is not implementation; a modeled welfare counterfactual is not an observed impact.

## Framing details

- The left spine is still **14px wide**, with symmetrical **70px copper** top and bottom terminals and the established tapered transition.
- The right spine is now **8px wide**, horizontally scaled from the left: **exact same 70px copper lengths and taper geometry**, same colors and mirrored placement. Not a differently proportioned end cap.
- On desktop, thin graduated lines separate the title from the lead, lead from analysis, and the essay from the selected exhibit; the lower evidence register has a shared heading rule and two distinct accent seams.
- On narrow desktop, the paired interpretation and exhibit stack before columns become cramped. The horizontal Why-it-matters opening stacks on tablet/mobile. Print removes unnecessary decorative treatment.

## Selection, publishing, and source discipline

Exhibit type is chosen by reading-specific relevance, not an arbitrary 1–2–3 sequence. The archive currently has 11 Ledgers, 12 Dossiers, and seven Long Views; each six-edition run uses more than one type and avoids three identical types in a row.

Publish-time rendering is deterministic and local. A future reading without a curated entry receives a clearly labeled source-exact Source Dossier instead of invented incidence, dates or graphs. The source-preservation comparator ignores only separately generated exhibits; it still compares author-supplied paragraphs, headings, figures, source links, identifiers and research notes.

## Verification and release gate

**Passed:** 159 historical-edition, 118 page-layout, and 715 guided-exhibit source-level assertions: **992 total**. All 30 original article records compare equal; 30 reading stages finish; 26 Why-it-matters openings are horizontal; 18 new exhibit primers and economic concept definitions exist; all 23 Long View milestones have separate explanations; 11 Ledgers retain unique source-specific graphics. Recomposition is idempotent, and stylesheet braces are balanced.

These checks were run with repository source retrieved through GitHub and isolated JavaScript using read-only filesystem/Git mocks. They do **not** demonstrate a full Node/Jekyll test run, Safari rendering, actual interaction testing or independent numerical-source verification.

**Before merge:** Inspect representative exhibits and first-reader comprehension, right-hand tapered ends at both page extremes, larger laptop and phone widths, light/night/Glance/print, Keep controls, expanded/dismissed Heron, source figures and original links. Final numbers should be checked against linked primary sources. Seek explicit visual approval.

**Local preview:** Existing locally cloned draft branch can be refreshed using `git pull --ff-only` in the cloned site directory, then reloading the localhost browser page; a fresh running preview server will serve updated files automatically.
