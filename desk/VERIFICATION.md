# desk. collection / application verification — 11 October 2026

## Recovery and scope

Continued the existing `desk/foundation-20261010` branch at `a90ab040944e63089abfbc6da77c00052eeb91ba`. On resumption, six modified files contained the interrupted two-presentation implementation and its updated source/runtime checks. That work was preserved and completed. No new branch, workspace, constituent-application changes or deployment. PR #4 remains draft.

## Two independently composed presentations

Every application has a collection article and a separate authentic presentation inside one stable work wrapper. Both are generated from the same project data. All seven authentic presentations initially have native `hidden`; only the illustrated IH. collection is visible. Inactive faces take no layout space and expose no keyboard or accessibility-tree controls. Reveal buttons are progressive enhancement; without JavaScript, the complete collection and direct Open website links remain available.

| Chapter | IH. collection | Selected authentic presentation |
| --- | --- | --- |
| Research | Paired scholarly folios with drafting dividers and geometric instruments, asymmetrical columns, copper numbering and forest serif typography. | Dark navy Advisor with its original logo/methodology stages; QST with its original language colors and learning workflow. |
| Reading | Four illustrated catalogue compositions using fish, pine, books and compass/contour artwork. | Original publication mastheads and complete archival covers in the desktop shelf; original navy Rupert Atlas and Rupert plate below. |
| Personal | Architectural engraving and large academic typography, with existing professional description and affiliation. | Scholarly-blue academic portfolio with existing content and research/CV links. |

The difference is structural, not a variable recoloring: collection and authentic articles have separate markup, imagery, layout and typographic rules. The original illustrations recede entirely from revealed faces. A short incoming-face fade avoids simultaneously active layers; reduced motion disables it. Mobile rules stack the research pair and catalogue, compose publication covers beside text and move the architectural engraving above the personal information.

## Interaction and accessibility

- TOC selection reveals the requested chapter and closes unrelated chapters. Individual controls reveal/return one work; selected siblings in that chapter remain open. Opening a work in another chapter closes the previous chapter's selection. Separate Open website links preserve direct navigation.
- Chapter return restores that chapter's collection. Ordinary scrolling changes no reveal state. Returning to the very beginning restores the complete collection and replaces the current history entry.
- Chapter and individual fragment URLs reveal their destinations. History snapshots preserve selected subsets and closed collection destinations; Back/Forward restores them with immediate positioning. Repeated identical selections create no duplicate entry.
- Stable work/section wrappers receive focus before font-dependent scroll positioning. TOC navigation requests native smooth scrolling with 12px sticky-toolbar clearance; individual switches and history use immediate positioning. Bottom spacing excludes existing spacer height. User input cancels pending navigation, and the bounded journey guard never issues a second scroll.
- Reveal controls expose `aria-expanded` and `aria-controls`; current TOC location is marked. Touch controls have a 44px minimum height, visible focus styles remain, and decorative illustrations stay hidden from assistive technology. Source/simulated-DOM checks do not replace VoiceOver/device review.
- Eastern time, DST boundaries, prepaint appearance and visit-only manual override are preserved. Day/night and reveal state remain independent.

## Validation evidence

- Final source/accessibility validation: **328 checks passed with `--online`**, including all 12 destination URLs and both portfolio fragments. The **302 offline checks** cover ID references, seven independent face pairs, initially hidden authentic articles, progressive controls, source provenance, exact identity crops and deterministic generation.
- Simulated-DOM/runtime suite: **13 tests passed** after the final focus/direct-fragment initialization changes. Covers Eastern/DST scheduling, appearance independence, chapter controls, individual subsets/returns, ordinary scrolling/top reset, direct fragments, exact Back/Forward snapshots, reduced motion, rapid requests, interruption and scroll-room calculation.
- Retrieval of a preceding online run was interrupted by a platform usage-limit approval-review error. A subsequent final validation ran successfully through the normal execution workflow; the earlier interrupted run is not the evidence for the result above.
- JavaScript syntax and `git diff --check` passed. Preservation checks confirmed all **48 non-document assets**, all **12 established destination URLs**, all **five disclosures**, project data and exact header/footer markup are unchanged from `a90ab04`.

## Preserved identity and assets

The exact IH. master and lossless header/footer crops are unchanged; the light mount preserves their original colors at night. The lowercase italic wordmark, fonts/provenance, seven engravings, publication covers, Rupert artwork and Home Screen assets are unchanged. Project data, established destination/deep links and five optional native disclosures are preserved. The removed header tagline stays absent. Shared Publication notes now say “The publication covers are selections from the archive” because covers are deliberately absent from the initial collection.

All implementation/documentation changes are confined to `desk/`. The final PR check must confirm the entire PR, not just this incremental commit, stays within that boundary.

## Visual evidence and acceptance limits

The unchanged illustrations have prior Inkscape day/night asset proofs. Those proofs do not show this new integrated layout. This pass reviewed generated markup, responsive rules, palettes, hidden-state semantics and interaction logic in source. **No integrated desktop/iPhone browser capture was produced.** Simulated-DOM tests cannot establish physical wrapping, Safari timing, visual stability or artistic quality.

The managed preview was not retried after the earlier `bwrap: Can't mount proc on /newroot/proc: Operation not permitted` failures. No substitute preview infrastructure or deployment was used. No hosted preview link is available.

**Prepared for visual review, not visually accepted.** Mandatory default and before/after captures remain the owner's MacBook/iPhone review gate in both appearances. Follow `LOCAL-REVIEW.md`; do not merge or deploy without explicit approval.
