# IH. — three collection chapter identities

The three original SVG engravings remain unchanged. The page generator composes each with **the exact approved `../identity/ih-signature.png`**, including both staggered initials and the illustrated copper period. These are branded compositions, not replacement logos or application identities.

| Identity | Illustration preserved | Distinctive composition |
| --- | --- | --- |
| IH. · Inquiry | Drafting divider, concentric arcs, registration ticks and measured baseline | Monogram at left, instrument at right; an open registration corner and shared drafting baseline. |
| IH. · Field & Folio | Open book, pine sprig and copper impression | Illustration leads on the left; the monogram sits slightly higher on the right, above two restrained publisher’s rules. |
| IH. · Scholar | Pediment, columns, arch and bookplate corners | Monogram and architecture sit within a wider set of bookplate corners; stepped rules conclude the architectural half. |

All three share a 210 × 100 composition, the same 86-unit-wide approved image, fine engraving strokes, inherited forest/ivory ink and fixed copper accents. The original image has a small white paper surround in both appearances; its colors, geometry and every source pixel remain unchanged. No cropping, clipping, filtering, replacement initials or image generation is involved. Inline SVG uses both `href` and `xlink:href` for the same local PNG. Each original engraving is nested with its original viewBox and proportions.

Desktop compositions display at **126 × 60px**; iPhone/narrow layouts at **114 × 54.29px**. The actual IH. image is approximately **51.6px / 46.7px wide**. Its initials remain recognizable in inspected raster proofs at those sizes. The complete Rupert/loblolly illustration remains in the small period, but its individual details are not reliably distinguishable at this scale. Do not silently substitute a plain period or enlarge it independently. These compositions should not be displayed smaller than the mobile size without fresh review.

The existing Dunhill Oblique labels remain ordinary HTML text: 18px desktop / 17px mobile. Chapter placement and the 800px responsive transition are unchanged. Artwork height increases by only 6px desktop and about 18px mobile. These repeated identity devices are decorative (`aria-hidden`), while headings provide accessible names. No additional keyboard stops or interactions are introduced.

Any reveal within a chapter hides its signature through the existing `data-active` state. Returning all works to the collection restores it. No runtime changes are required.

## Review

After `node desk/_tools/build.mjs`, run `python3 desk/_tools/proof-chapter-identities.py` to reproduce [the actual-size composition proof](../../_review/chapter-identity-proof.png). It uses the served SVG fragments and approved raster, rendered by Inkscape in both palettes. It also shows the new footer quotation/attribution typography. This is **not an integrated page/browser screenshot**. Desktop/iPhone browser acceptance remains with the owner; the managed preview was not retried.

The earlier `identity-refinement.png` proof documents the illustration-only stage and is historical, not the current branded composition.
