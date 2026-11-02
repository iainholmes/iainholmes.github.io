# Loblolly & Logit — Reading Composition V (review draft PR #49)

**Status:** Draft branch only; not merged or deployed. This revision follows the user's November 2 evening visual inspection. The accepted forest, river-blue, copper, paper, typography and outer two-track page structure remain intact.

## Corrections made in response to the screenshots

- Restored the authored **Why it matters** section to its original, vertically flowing heading and paragraph layout in all 26 applicable readings. No sideways title and giant empty first column.
- The actual post-reading **Read the Source** register is now compact and horizontal: a left-hand label and a narrow-spaced stack of source links, with all original URLs and accessible link text preserved.
- Every chapter has a stronger, deliberate **6px forest/copper top transition** with supporting registration mark and more coherent top spacing. This clarifies transitions between successive readings without inserting an extra content column.
- Each analytical pairing uses a **3px outer frame / 6px top / 4px bottom / 5px internal colored partition**, not a floating 1px hairline. The paired layouts collapse to strongly separated horizontal sections on narrower screens.
- The **Incidence Ledger** now has its source-grounded chart in the **left Economic interpretation panel**. The ledger's explanation and incidence rows stay on the **right** with approved forest/river/copper rows. The economic graphic no longer doubles the height of the right side while leaving most of the left empty.
- **The Long View** now uses a more spacious, coherent *horizontal chronological rail* at desktop width below the economic interpretation, shifting to two columns and then one on smaller screens. All seven original primers, 23 step explanations and status qualifiers remain.
- The rejected **Source Dossier** has been fully replaced in rendered articles by two substantive alternatives. This is a user-facing **preview of options**, not final editorial acceptance.

## The two replacement concepts (12 readings)

### The Assumption Test · six research-focused readings

An analytical exhibit with an opening orientation, the key **identifying or modeling assumption**, a plausible **challenge to that assumption**, and a concrete **empirical check that could help adjudicate the claim**. It does not treat unresolved threats as proven bias or claim that the original authors omitted their robustness checks.

Examples:
- **Clean Equipment and Rooftop Solar Work Together** (October 30 reading 02): Are estimated household technology complementarities stable under alternative preferences, access constraints and grid assumptions?
- **Rarely Exposed Groups Can Vanish in Population Averages** (October 16): Would dilution and statistical power permit the dataset to detect a meaningful effect?
- **Disaster Losses Persist When Displacement Breaks Local Ties** (October 9): Do households on either side of the narrow landslide path supply a credible comparison?
- Green spending, corporate debt-tax bias, and monitored climate vital signs each receive their own source-specific tests.

### The Decision Margin · six policy/institutional readings

An editorial comparison of **two real decision or implementation margins**, framed as possible paths or considerations rather than a simplistic vote. The exhibit explains both implications, gives a question or measurement that would help evaluate the approaches, and clearly labels non-final or conditional status.

Examples:
- **A New Emissions Model Changes the Baseline** (October 30 reading 05): standard national defaults versus investment in better local inputs, noted explicitly as *complementary* rather than mutually exclusive.
- **Carbon-Border Policy Enters a New Institutional Test**: detailed product emissions accounting versus administratively simpler benchmarks; no claim of WTO merits decision.
- **FERC Proposes Trading Case-Specific Review for Categorical Rules**: categorical treatment versus prior-notice review, where the real choice involves risk thresholds.
- Glyphosate review, climate-liability litigation and EIB adaptation finance receive separate tailored versions.

No Source Dossier, Evidence Cabinet, “From the Annex,” or generic Economic Hinge remains in the published preview.

## What stayed intact

- All **30 original author-written reading records**: headline, finding, Why it matters / specialist first heading, economic interpretation, limitation, Research Notebook, figures, source citations, link URLs, issue metadata, and article IDs.
- The left 14px tapered spine and right **8px geometrically matching** spine, with matched 70px top/bottom copper terminals.
- The original Heron and Keep scripts, edition navigation, publication scheduling, published artwork and all non-reading pages.
- Incidence Ledgers: 11 custom graphs/models/calculations with source-grounded evidence qualifiers.
- Long Views: seven annotated series with 23 individually authored explanatory steps and uncertainty labels.
- Publication composer works deterministically and is idempotent; future uncurated readings receive a clearly flagged provisional Assumption Test, *not* a fabricated causal mechanism.

## Checks and acceptance conditions

Source-level JavaScript checks from the connected GitHub branch passed: **159** historical-edition assertions, **125** structural/layout assertions and **714** exhibits/editorial assertions = **998** checks. Original scholarly-content records compare equal 30/30. Exactly 11 Ledger figures occupy the economic-interpretation side; there are six Assumption Tests, six Decision Margins and seven Long Views. Stylesheet braces are balanced.

These are **source-level tests using isolated JavaScript and read-only filesystem/Git mocks**, not a complete Jekyll/Node run or actual Safari render. Do not merge based on source checks alone.

**Visual review:** In the October 30 issue compare reading 02 (*The Assumption Test*) and reading 05 (*The Decision Margin*) before deciding which new feature family is most compelling. For the stronger frame check reading 03's Ledger and reading 04's Long View; check reading boundaries above/below and the compact source register at the foot of each. Check wider MacBook view, narrow laptop/tablet, iPhone portrait, light/night, full/Glance/print, actual expanded/dismissed Heron and Keep buttons. Verify all source-specific numbers against original linked primary documents before live publication.

**To refresh the already-open local Safari preview:** Run `git pull --ff-only` from the existing temporary preview clone, then force reload `http://localhost:8765/weekly-economics-environment/` (restarting the local Python server only if it has stopped).
