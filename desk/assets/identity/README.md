# IH. — canonical personal signature

IH. identifies Iain Holmes, the person behind the work. **desk. identifies the collection.** This directory is the authoritative vector source for future, separately approved integrations. It does not replace any application's identity or imply a link back to desk.

## Four assets

| Asset | Intended use | Minimum practical size |
| --- | --- | --- |
| `ih-monogram.svg` | Primary circular signature on light surfaces; two distinct staggered serif initials and a subordinate copper period containing Rupert and a pine. | 112px square for the complete mark. Use 160px or larger when the tiny scene itself must be readily examined. |
| `ih-monogram-night.svg` | The identical primary geometry with pale letters and enclosure for dark surfaces. | Same as primary. |
| `ih-monogram-small.svg` | 48–96px uses: strengthened serifs/crossbar/enclosure, increased separation of the initials, solid copper period. Omits the tiny scene rather than compressing it into noise. | 48px square. Do not use a complete monogram below this size. |
| `copper-period.svg` | A quiet secondary signature, with a simpler pine canopy and Rupert's upward-looking silhouette; suitable between short editorial rules. | 24px diameter; desk. uses 26px. Below 24px, use a plain copper circle rather than another detailed asset. |

All measurements are CSS display sizes, independent of device pixel ratio. No monogram/favicon/app-icon replacement elsewhere is implied. desk.'s existing app icons and italic Archivo wordmark remain unchanged.

## Construction and color

- Paths are hand-drawn vector geometry, not live font characters or an embedded/cropped image. No installed font, filter, external resource or JavaScript is needed.
- The reference is **Elegant IH Monogram with Dog and Pine Dot.png**, read alongside the supplied Desk identity boards. The design preserves the raised I, lower H, circular enclosure, subordinate copper period and Rupert looking toward the lower left boughs. Geometric refinement keeps the initials optically separate.
- Canonical ink: `#263b33`; night ink: `#e8ebdc`; copper: **`#976144` in both appearances**; silhouette: `#eeeee6` in both appearances. The copper device is not reversed or hue-shifted at night.
- Ring diameter is 932/1000 of the canvas. The period is 100/1000, so it remains punctuation rather than a competing emblem.
- Keep clear space outside the circle of at least one period diameter (10% of the mark's displayed width). Never stretch, rearrange, animate or add outlines to the initials. Keep both letters visible.
- The period and its scene are deliberately asymmetric: Rupert is seated to the left of the pine and looks up; the trunk is open below the branches. Do not move the dog into the letters or expand the period to compete with IH.

## Integration

Standalone light/dark primary assets are ready for `<img>` use with descriptive alternative text and explicit dimensions. For a small mark on a dark surface, inline `ih-monogram-small.svg` and set `.ih-ink { fill:#e8ebdc }` and `.ih-ring { stroke:#e8ebdc }`. This uses one small-format master and avoids redundant color exports.

Within desk., `_tools/build.mjs` embeds the canonical SVGs unchanged in geometry and changes only their accessibility/presentation attributes. CSS selects 112px primary above 1000px viewport width; 96px small at 601–1000px; 84px small at 371–600px; and 72px small at 370px and below. The existing appearance variables recolor only the letters and circle. There is no additional theme state or schedule.

The header has a single accessible image label, **Iain Holmes — IH. personal monogram**, without a new link or tab stop. The repeated footer device is decorative and hidden from assistive technology. Existing footer links and installation help remain independent controls.

## Maintenance

Edit canonical geometry only in `desk/_tools/build-identity.mjs`, then run:

```sh
node desk/_tools/build-identity.mjs
node desk/_tools/build.mjs
python3 desk/_tools/validate.py --online
node --test desk/_tools/test-runtime.cjs
```

Do not copy a reference raster into production. Reuse these assets from an identified commit when a future cross-site change is approved; retain each host application's own appearance controls, typography, artwork, navigation and attribution. No “by desk.” label or automatic backlink accompanies this signature.
