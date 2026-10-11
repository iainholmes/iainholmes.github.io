# Secondary IH. collection monograms

Three new vector identities interpret concepts **03 · IH Distribution**, **05 · IH River** and **01 · IH Tree & Dog** from the owner's original IH/ITH exploration board. These are secondary designs, explicitly authorized separately from the immutable header logo.

| Asset | Integration into the letterforms | Placement |
| --- | --- | --- |
| `ih-distribution.svg` | The H's straight crossbar is replaced by a single continuous distribution curve. Both original serif stems remain. | In the gutter between the two Research & Practice folios; centered between them when stacked. |
| `ih-river.svg` | A tapering river becomes the H's crossbar and the I's lower terminal. No separate landscape vignette. | Between the lower Periodicals folio and The Rupert Atlas; centered above the Atlas on iPhone. |
| `ih-tree-dog.svg` | The H's right stem grows into a sparse pine crown; a minimal seated Rupert rests on its crossbar and looks upward. | A small concluding row beneath the introductory academic composition. |

## Typography and production

The outlined foundation is the existing **Bodoni Moda** face in `../fonts/bodoni-moda.woff`, distributed under the existing [SIL Open Font License](../fonts/OFL-Bodoni-Moda.txt). The generator extracts its real I/H outlines and preserves the source serif/stem geometry where subjects do not replace it. New curve, river, pine and dog contours are authored in `../../_tools/build-monograms.py`. All scaling is uniform; no artificial weight, font substitution or runtime font dependency is used inside the SVGs.

Each asset shares a `0 0 160 130` viewBox, raised I, a small copper period and transparent background. There are no white squares, circles around the mark, ornamental frames, raster inserts or copies of the canonical logo. The river uses one local vector clip for its modified I terminal. Each vector appears once in the page, so its clip ID is unique.

The canonical header PNG, bookplate, illustrated period and footer remain unchanged. These new designs must never replace that approved personal logo or be represented as exact derivatives of it.

## Scale and appearance

- Desktop: 72 × 58.5 CSS pixels. Research switches to its centered stacked placement at 900px and uses 68 × 55.25px there.
- iPhone: 68 × 55.25px for all three. Do not shrink further without fresh inspection.
- Day ink: forest `#263b33`; Night ink: light forest `#bdd0bd` for contrast. Copper remains `#976144` in both. Forced-colors mode uses CanvasText for the main letterforms.
- All marks are decorative, non-interactive and hidden from assistive technology. Existing headings and controls remain the accessible interface.
- Every mark disappears when **any** application in its chapter is revealed, using the existing `data-active` attribute. It returns with the full collection. No runtime changes.

The two desktop gutter marks are absolutely positioned within existing whitespace and add no page height. The stacked research transition consumes a 63.25px interval instead of the previous 20–32px gap. The mobile Atlas transition adds about 45px; the concluding academic row adds roughly 60–70px, depending on the existing breakpoint gaps. Returning the original smaller chapter illustrations offsets some of this increase. No application panels are resized or rearranged.

## Verification and review

```sh
python3 desk/_tools/build-monograms.py
node desk/_tools/build.mjs
python3 desk/_tools/validate.py
node --test desk/_tools/test-runtime.cjs
python3 desk/_tools/proof-chapter-identities.py
```

[Vector proof](../../_review/secondary-monograms.png): enlarged marks and actual desktop/iPhone sizes, Day and Night. The recognizable I/H family, distribution/river crossbars and tree/dog integration have been inspected. At small sizes Rupert is a deliberately minimal seated silhouette, not a detailed portrait.

[Placement map](../../_review/monogram-placement-map.png): explicitly schematic diagrams of the intended locations. **Neither file is a browser screenshot.** No managed preview was retried; the required supported browser-control dependency remains unavailable. Actual integrated alignment, wrapping and touch acceptance remain for the owner's existing Mac/iPhone preview.

After pulling `desk/foundation-20261010`, refresh `/desk/?review=secondary-monograms#collection` on the existing local server. Inspect all three collection chapters in Day and Night, then reveal each application, use Return, and check TOC and Back/Forward. Verify the header, QST and footer remain unchanged. No merge or deployment is authorized.
