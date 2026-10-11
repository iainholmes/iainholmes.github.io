# Editorial illustration collection

Seven original, self-contained SVG line engravings, authored for desk. on 11 October 2026. Reproduce them with `python3 desk/_tools/build-illustrations.py`; the served page has no illustration library or new runtime dependency. Source coordinates, curved hatching, needle clusters, page edges and instrument divisions are maintained in that script. Asset hashes are recorded in `SOURCE-REVISIONS.json`.

These devices implement the fish, botanical pine, books and compass vocabulary of the owner's identity boards, alongside complementary analytical and architectural studies. They are original drawings rather than cropped board images. They do not replace the supplied IH. logo or any canonical publication artwork.

| Asset | Placement and purpose |
| --- | --- |
| `field-fish.svg` | Burgundy natural-history ornament above the Field Brief masthead on desktop; above its archival cover on phone. Not a statement that Field Brief specializes in fisheries. |
| `loblolly-sprig.svg` | Forest-green botanical study of a long-needle pine sprig and cone, paired with Loblolly & Logit's cover. Decorative, not a scientific identification plate. |
| `workbook-volumes.svg` | Three engraved scholarly volumes with page edges, cloth hatching and a geometric bookboard, paired with The Workbook's equation-bearing cover. |
| `advisor-dividers.svg` | Warm brass drafting dividers and construction lines beside the existing research-design workflow. Not a new tool, data plot or model result. |
| `qst-instruments.svg` | Set square and protractor beside the QST introduction, preceding the unchanged language identities and Learn / Practice / Feedback sequence. |
| `atlas-bearing.svg` | Small compass rose and abstract contour lines above the Atlas heading, leaving the original Rupert plate unobstructed. Not a geographic map. |
| `academic-arcade.svg` | Original academic arcade vignette beside the portfolio identity. It is not a depiction of UVA, NC State, Sewanee or any other named building. |

## Display and accessibility

The page embeds the canonical SVGs unchanged. Their `currentColor` ink inherits the destination's palette; explicit muted cream/ink treatments support night appearance. No filters, scripts, external resources, animation or text fonts occur inside these vectors. The exact personal logo is outside this color system and remains unchanged.

Desktop publication devices occupy an 88–94px-high band; the mobile device is 56–64px high, above the cover in its existing left column. Research instruments occupy reserved side columns; Atlas and portfolio ornaments have independent compact placements. Fine engraving detail naturally reduces at phone sizes, but the principal silhouettes are retained. There is no separate simplified mobile asset.

All seven devices are decorative. Wrappers and SVGs use `aria-hidden="true"`; SVGs also use `focusable="false"`. They receive no pointer events, introduce no controls and add no repeated screen-reader description. Existing destination names, link labels and navigation remain authoritative.

## Review evidence

Inkscape-rendered proofs were inspected at larger and intended desktop/phone ornament sizes against day/night surfaces. Source validation checks XML safety, placement in each correct application, accessible treatment, hashes and deterministic generation. These proofs do not establish integrated browser layout acceptance. See `../../LOCAL-REVIEW.md` for the physical Mac/iPhone review.
