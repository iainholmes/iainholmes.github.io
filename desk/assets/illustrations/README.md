# Editorial illustration collection

Seven original, self-contained SVG line engravings, authored for desk. on 11 October 2026. Reproduce them with `python3 desk/_tools/build-illustrations.py`; the served page has no illustration library or new runtime dependency. Source coordinates, curved hatching, needle clusters, page edges and instrument divisions are maintained in that script. Asset hashes are recorded in `SOURCE-REVISIONS.json`.

These devices implement the fish, botanical pine, books and compass vocabulary of the owner's identity boards, alongside complementary analytical and architectural studies. They are original drawings rather than cropped board images. They do not replace the supplied IH. logo or any canonical publication artwork.

| Asset | Placement and purpose |
| --- | --- |
| `field-fish.svg` | Forest-ink natural-history study in Field Brief's collection entry. Not a statement that Field Brief specializes in fisheries. |
| `loblolly-sprig.svg` | Long-needle pine sprig and cone opposite Loblolly & Logit's collection typography. Decorative, not a scientific identification plate. |
| `workbook-volumes.svg` | Scholarly volumes, page edges, cloth hatching and geometric bookboard in The Workbook's catalogue entry. |
| `advisor-dividers.svg` | Drafting dividers and construction lines in Advisor's collection folio. Not a new tool, data plot or model result. |
| `qst-instruments.svg` | Set square and protractor in QST's companion collection folio. |
| `atlas-bearing.svg` | Centered compass rose and abstract contour lines above the Atlas collection title. Not a geographic map. |
| `academic-arcade.svg` | Academic architectural study beside the personal collection text on desktop and above it on phone. Not a depiction of any named campus. |

## Display and accessibility

The page embeds the canonical SVGs unchanged. Their `currentColor` ink follows the shared IH. forest/ivory palette, with muted light ink at night. No filters, scripts, external resources, animation or text fonts occur inside these vectors. The exact personal logo is outside this color system and remains unchanged.

The engravings are primary imagery in the default collection faces, not ornaments attached to authentic application panels. Most occupy 130–200px-high viewports; the academic study uses 215px on desktop and 140px on phone, while the compass uses a wide 105px-high viewport. Narrow research folios move instruments above their typography. Each illustration disappears when its authentic application face is revealed. Fine detail naturally reduces at small sizes; no separate simplified mobile asset is used.

All seven devices are decorative. Wrappers and SVGs use `aria-hidden="true"`; SVGs also use `focusable="false"`. They receive no pointer events, introduce no controls and add no repeated screen-reader description. Existing destination names, link labels and navigation remain authoritative.

## Review evidence

Prior Inkscape-rendered proofs were inspected at larger and earlier desktop/phone ornament sizes against day/night surfaces. This pass changes their placement and scale without changing their artwork. Source validation checks XML safety, placement in each correct collection entry, accessible treatment, hashes and deterministic generation. Earlier proofs do not establish acceptance of the new integrated layout. See `../../LOCAL-REVIEW.md` for the physical Mac/iPhone review.
