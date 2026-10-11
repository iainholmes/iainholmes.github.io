# desk. application identity verification — 11 October 2026

## Scope and recovery

Continued the clean existing branch `desk/foundation-20261010` at `8ec23e71b44fdd8faad4f3fdadc95462e271d07b`. This focused pass implements the seven application-specific illustrated treatments from the final supplied assignment. The accepted structure, exact personal identity, application content and functionality are preserved. All changes stay in `desk/`. PR #4 remains draft; no merge or deployment.

## Implemented treatments

| Destination | Integrated treatment |
| --- | --- |
| Field Brief | Original burgundy natural-history fish engraving, fine divider and authentic Bodoni Moda masthead alongside the unchanged archival cover. |
| Loblolly & Logit | Original botanical long-needle pine sprig/cone, forest-green ink and Ectros masthead alongside the unchanged cover. |
| The Workbook | Original stack of three scholarly volumes with engraved page/cloth details and geometric bookboard; STIX Two Text masthead and the original equation-bearing cover. |
| Econometric Advisor | Brass-colored drafting dividers and construction lines in a reserved column beside the existing research-design stages. Original navy and application mark retained. |
| QST | Set square and protractor beside the introduction, preceding the unchanged Python/R/Stata strip and Learn / Practice / Feedback sequence. |
| The Rupert Atlas | Compact compass rose and abstract contours above the heading. Original Rupert plate, navy and three deep links preserved. |
| Personal Website | Restrained original academic arcade beside the identity. This is not a likeness of a named campus building; affiliations and destinations remain unchanged. |

The three-publication shelf remains three columns on desktop and individual horizontal presentations on phone. On phone the illustration sits above its cover in the left column, with title/description/link in the right column. Research, Atlas and portfolio devices have their own placements. No new section, product feature or explanatory copy was added.

## Preservation and validation

- `python3 desk/_tools/validate.py --online`: **271 static/source checks passed**, including every destination URL and both portfolio fragments, canonical artwork/font provenance, exact IH. master/crops, XML safety, seven correct illustration placements, accessible decoration and deterministic SVG/HTML output.
- `node --check desk/desk.js`: passed.
- `node --test desk/_tools/test-runtime.cjs`: **7 passed**, covering Eastern time/DST scheduling, visit-only manual override, all section positions/focus, bottom scroll space and fragment/history behavior. These remain simulated-DOM tests.
- All existing visible text and link attributes match the starting commit. Header/footer markup, runtime, configuration and runtime tests are byte-identical. All 41 existing non-document assets are byte-identical, including the final IH. master/crops, publication covers, original Rupert plate, fonts and installation icons.
- New SVGs contain only static paths/circles/groups, no scripts, remote references or text. All seven are decorative and inaccessible to pointer/focus interaction; existing accessible destination names remain intact.
- Publication mastheads use existing authentic Bodoni Moda 500, Ectros 400 and STIX Two Text 400. Navigation/explanatory text retain Dunhill; synthetic font styles remain disabled.
- `git diff --check` passed. Candidate and full PR paths remain confined to `desk/`; the remote tree is checked against the staged validated tree before updating the branch.

## Visual evidence and remaining acceptance

Reexamined both original identity boards. Authored seven local vector devices using their concrete fish/pine/books/compass vocabulary plus complementary analytical/architectural motifs. Inspected Inkscape proofs at larger and intended desktop/phone ornament dimensions against day/night surfaces. Refined fish hatching, book engraving and instrument framing after that inspection. The principal silhouettes remain visible; fine engraving naturally reduces at small sizes.

These proofs are **rendered illustrations, not full-page browser screenshots**. CSS placements and unchanged navigation geometry were reviewed in source, but integrated wrapping, enlarged text, page length, touch behavior and Safari/Chrome acceptance still need the owner's established Mac/iPhone review. See `LOCAL-REVIEW.md`.

The managed Sites preview previously failed twice before startup with `bwrap: Can't mount proc on /newroot/proc: Operation not permitted`. No supported browser-control dependency was available. It was not retried; no alternative preview infrastructure or deployment was used. There is no working hosted preview link.

The exact IH. logo remains unchanged. Cross-site integration is a separate future assignment. Final visual acceptance and release require the owner's approval.
