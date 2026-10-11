# desk. final identity refinement — verification, 11 October 2026

## Recovery and scope

Started from the clean existing branch `desk/foundation-20261010` at `621b7e3b1d8581e08f4d68418871026420161fea`; the remote PR head matched. The owner has accepted the two-state design. This finishing pass changes only chapter companion identities, the header's surrounding mount and the footer quotation, with documentation and an asset proof. No new branch, PR, workspace, application functionality or deployment.

## Three companion identities

- **Inquiry:** divider construction, drafting arcs, registration ticks and a copper pivot.
- **Field & folio:** an open book whose spine continues into a pine sprig; a small copper impression below.
- **Scholar:** an abstract classical opening within bookplate corner rules, with a copper lintel accent. It represents no identifiable building.

The three hand-authored vectors share a 160 × 120 coordinate system, fine strokes, forest/ivory ink and a constant copper accent. Dunhill Oblique labels are HTML text. They neither redraw the IH. initials nor modify the master.

Desktop placement uses 72 × 54px drawings beside chapter titles. At 800px and below, 48 × 36px drawings sit with their labels above the titles, alongside chapter numbers. A signature disappears whenever any work in its chapter is revealed, using the existing `data-active` attribute; it returns with the full collection. No script or interaction change is required. Decorative wrappers and SVGs stay outside assistive-technology naming and receive no input.

## Header and footer

The canonical header image now sits in an archival-paper mount with a copper outer rule, inset paper rule and forest-gray inner window. Night appearance preserves a deliberately light mount. The artwork's previous displayed widths remain exactly 126 / 114 / 98 / 88 CSS pixels across the existing breakpoints; surrounding mount widths become 156 / 144 / 122 / 112px.

The footer line is exactly **“Everything in its right place.”** No attribution or additional lyrics were added. The existing copper-period ornament and footer controls remain. The old mobile rule hid the footer paragraph; the replacement is centered beneath the two existing controls on phone.

## Preservation and validation

- All **48 original non-document assets** remain byte-identical to `621b7e3`, including the exact IH. master and pixel-identical lossless crops, canonical covers, Rupert artwork, fonts, seven existing illustrations and Home Screen assets.
- All **seven authentic application articles** and **seven collection articles** remain unchanged. Project data and the entire appearance/navigation script are byte-identical. Existing application destinations, deep links and disclosures remain.
- The existing runtime suite passes **13 tests**, covering Eastern/DST time, manual appearance, reveal/return state, TOC positioning, ordinary scrolling/top reset, history, direct fragments, reduced motion and interrupted navigation.
- The existing source/accessibility suite passes **328 checks with `--online`**, including all 12 destination URLs and both portfolio fragments; **302 checks** also pass offline. Deterministic generation and JavaScript syntax pass.
- Additional targeted inspection verifies all three SVGs contain only static path/circle geometry, no fonts/scripts/remote references, correct chapter placement and accessible decorative treatment. The existing active-state selector hides companions on reveals, and mobile footer visibility is explicit.
- Final diff/PR isolation and remote-tree equality are checked before handoff. All changes must remain under `desk/`.

## Visual evidence and limits

[The asset proof](_review/identity-refinement.png) was rasterized with Inkscape and inspected in day/night palettes at full drawing scale and the intended desktop/mobile dimensions. It also shows the actual unchanged logo image inside a geometric reproduction of the CSS bookplate at desktop and iPhone sizes. The proof confirms the vector rendering and mount details; it is **not a browser screenshot** and does not establish integrated header alignment or responsive page behavior.

No supported browser-control dependency is available for managed preview QA. The prior Sites failure was `bwrap: Can't mount proc on /newroot/proc: Operation not permitted`. It was not retried, no substitute preview infrastructure was started and there is no hosted preview.

The accepted two-state design has been preserved. Final visual acceptance of these three refinements remains with the owner using [LOCAL-REVIEW.md](LOCAL-REVIEW.md), especially title spacing, header balance, narrow/mobile footer wrapping and day/night integration. PR #4 stays draft, unmerged and undeployed pending explicit approval.
