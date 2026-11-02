# Architectural Bookends — Loblolly & Logit (review only)

This is an **unmerged, non-production design prototype** for a content-specific reading bookend architecture. It does not modify the canonical journal, publisher, issue archives, live CSS, accepted left-side tapered spine, Heron, Commonplace/Keep buttons, or any published material.

## Preview

Open `index.html` from a local repository checkout, or from a preview environment serving this branch. It uses the exact published five reading articles for **October 30, 2026 (No. 006)** with their original headings, findings, analysis, evidence qualifications, sources and research-note asides. This file simulates journal styling; it does *not* claim pixel-level equivalence to live production.

The preview demonstrates top and bottom architectural rules for **each article**, with one topic-specific inline vector illustration spanning both its opening and conclusion. A thin outer-right boundary still frames the entire reading surface, without extra editorial columns, cards, or invented factual diagrams. The existing left tapered spine is represented. Toggle day/night and use the labeled Heron-sized panel probe for preliminary clearance; it is not the actual Heron implementation.

## Artwork provenance and generation

`bookend-art.js` deterministically selects one of five source-grounded concepts, **using specific headline combinations** rather than arbitrary full-article keyword matching:

| Published reading | Generated concept | Visible metaphor |
| --- | --- | --- |
| Coal Demand Shocks Travel Beyond the Mine | `coal-network` | central mine linked to sectors/places: regional spillovers |
| Clean Equipment and Rooftop Solar Work Together | `household-complements` | roof photovoltaics paired with household equipment |
| EPA Proposes a Different Methane Ledger | `methane-ledger` | regulation and accounting rows; no quantitative emissions chart |
| More New Solar Is Arriving With Batteries | `solar-storage` | solar panel and battery |
| A New Emissions Model Changes the Baseline | `model-baseline` | alternate abstract model baselines, **not observed data** |

The SVGs are code-generated, not downloaded or produced by an image service. They have accessible labels and do not imply numerical measurements. Rendering is deterministic and safe for archival reproducibility. **For future readings with uncertain classifications, the default is a title-derived typographic monogram** rather than an unsupported figure. Editors may choose an explicit recognized `data-bookend-concept` after confirming the published subject. Both opening and closing marks derive from the same chosen subject.

The **prototype** currently generates motifs in the preview browser. Before publication, integrate generation into the existing publication/preparation pipeline, pin the output in the produced edition, and preserve article ids and edition archive behavior. Do not turn a browser-only preview into a claim that the production publisher has been updated.

## What would change if approved

- Replace the current right-hand capped outer border with the coherent bookend architecture instead of stacking two competing systems.
- Integrate generated SVG rules into *every* article in each issue at build time, including future issues, using only supported editorial metadata and suitable fallbacks.
- Review full article length, the transition between five readings, Research Notebook, actual perched/expanded Heron, all Keep buttons, figures, navigation, day/night and print.
- Make any needed spacing or balance changes to the existing left tapered spine and right notebook margin **only after** a visual acceptance pass; no guaranteed frozen layout if it prevents quality.
- Test at 1704, 1512, 1440, 1280, 1180, 820, 393 CSS pixels, with horizontal overflow, accessibility and source provenance checks.

## Local validation

`node weekly-economics-environment/_prototypes/architectural-bookends/test-bookend-art.cjs`

**Status:** Review-only candidate. No merge or deployment is authorized by this prototype. Browser, physical Safari and actual site integration still require verification.
