# IH. — canonical personal signature

IH. identifies Iain Holmes, the person behind the work. **desk. identifies the collection.** These four SVGs are the authoritative vector masters for future, separately approved integrations. They do not replace an application's identity or imply a link back to desk.

## Four assets

| Asset | Intended use | Practical display size |
| --- | --- | --- |
| `ih-monogram.svg` | Primary circular signature on light surfaces, with staggered serif initials and Rupert beneath the loblolly in the copper period. | 120px and above. Enlarge to 240px or more to examine the scene readily. |
| `ih-monogram-night.svg` | Identical primary geometry with pale letters and enclosure for dark surfaces. | Same as primary. |
| `ih-monogram-small.svg` | Compact optical master: strengthened hairlines and four open branch tiers, retaining the seated dog, upward muzzle, tree, ground and copper period. No plain-dot substitution. | 88–119px; desk. uses 104, 96 and 88px. |
| `copper-period.svg` | The illustrated period alone, using the primary silhouette; a quiet secondary signature between fine rules. | 24px minimum; desk. uses 26px. |

All sizes are CSS pixels. At a 96px mobile header size, the copper period is about **10px** wide and Rupert occupies only part of it. The paired dog/tree silhouettes remain present, but the ear, individual branch tips and breed-specific detail cannot be reliably read at normal phone viewing distance. A high-density screen supplies more raster samples, not more physical space. That limitation is explicit; the artwork is never silently removed. Below 88px, prefer the illustrated period alone at 24px or larger, or omit the personal signature. Do not substitute a plain dot or disproportionately enlarge the period.

## Construction and color

- The approved **Elegant IH Monogram with Dog and Pine Dot.png** and the two Desk identity boards govern the identity geometry and placements. Their illustrative site mockups do not authorize changes to desk.'s accepted panels, wordmark, fonts or content.
- The raised I and lower H are independent outlined shapes, refined against the reference's stagger, serif weight, separation and baseline. The circle is fine and regular. No installed font, embedded raster, filter, script or external resource is required.
- Rupert's seated haunch, foreleg, upward muzzle and resting tail sit left of the tree. Six irregular tiers form the primary pine; the compact master opens four tiers for separation at small sizes. The compact scene omits the ear cutout, not the dog or tree.
- Ink: `#263b33`; night ink: `#e8ebdc`; signature copper: **`#a45f35` in both appearances**; silhouette: `#eeeee6`. Copper is warmer than the first implementation to follow the approved reference. The accepted desk. wordmark/accent palette is unchanged.
- Ring diameter: 932/1000 of the canvas. Period diameter: **104/1000**, aligned with H's baseline. This follows the reference's proportion; it is not enlarged at mobile breakpoints.
- Retain clear space of at least one period diameter outside the enclosure. Never stretch or rearrange the initials. Do not reverse the copper device at night or add labels around the header mark.

## Integration

`_tools/build.mjs` embeds canonical geometry with presentation/accessibility attributes adjusted for the page. The header uses the 120px primary above 1000px viewport width, then the 104px compact at 601–1000px, 96px at 371–600px and 88px at 370px and below. Its mobile optical offset is -4px; the accepted wordmark and accompanying type remain unchanged.

The footer signature is centered **above** the preserved utility row, closing the page content before the back-to-top and installation controls. Two equal grid tracks form .75px rules at 45% of the current ink, separated from the 26px period by 12px. The group is at most 280px wide on desktop and 260px on phones, with 30/24px of space from the preceding panel.

Standalone light/night primary assets can be used in `<img>` with alternative text and explicit dimensions. For the compact master on dark surfaces, inline it and set `.ih-ink { fill:#e8ebdc }` and `.ih-ring { stroke:#e8ebdc }`; one compact geometry master avoids a redundant color export. Page CSS uses existing ink variables and does not alter appearance state or schedule.

The header exposes one accessible name: **Iain Holmes — IH. personal monogram**. It adds no link or tab stop. The repeated footer signature is decorative and hidden from assistive technology. Existing app icons and the italic Archivo wordmark remain unchanged.

## Maintenance and verification

Edit canonical geometry only in `desk/_tools/build-identity.mjs`, then run:

```sh
node desk/_tools/build-identity.mjs
node desk/_tools/build.mjs
python3 desk/_tools/validate.py --online
node --test desk/_tools/test-runtime.cjs
```

Validation requires both Rupert and the loblolly in every master, including the compact one. Source tests do not establish fidelity. Inspect enlarged and actual-size renderings in both palettes and complete the Mac/iPhone checks in `../../LOCAL-REVIEW.md` before visual acceptance. Reuse an identified commit for any later integration; no “by desk.” label or automatic backlink accompanies the signature.
