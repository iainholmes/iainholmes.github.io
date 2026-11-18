# IH. House Divider System — Design Principles & Implementation Register

## Original reference

Loblolly & Logit remains the source and the strongest house signature. In
`weekly-economics-environment/index.html`, its day tokens are
`--forest:#1f4a3b` and `--clay:#b4532e`. The exterior pillars in
`reading-folio.css` use `--pillar-copper:color-mix(in srgb,var(--clay) 82%,var(--pollen))`.
Their broad terminals taper to a central stroke one third of their breadth.
Both the journal's architecture and its contextual Special Feature boundaries
remain authoritative; neither is a target for restyling.

## Geometry and use

- **Rule:** a slender central stroke with short, full-height terminal caps and
  six-pixel tapered shoulders. The reference ratio is 3:1, adapted to context.
- **Spine:** the same silhouette rotated vertically, where a structural rail
  already exists. Do not use it around ordinary controls or every paragraph.
- **Hinge:** the shoulder joining the cap and stroke supplies the signature;
  a separate ornament is unnecessary.
- **Finishing rule:** optional at a genuine editorial close; never obligatory.

Use CSS gradients and clip paths. Decorative layers contain no text, take no
focus, intercept no pointer input, and do not change the reserved border space.
Cap length is clamped rather than scaled across the entire viewport.
The design is static. Keep typography, layout, artworks and functional colors.
In forced colors use the system text color; retain an ordinary rule for print.
Do not give the motif functional meaning or depend on color to explain content.

Refine a meaningful existing transition. Preserve negative space and stop after
the few placements that establish ancestry. Use native palettes rather than
forcing forest/copper onto application controls, diagrams or local features.
Separate repositories should carry a small local interpretation; no cross-site
runtime dependency is required.

## Implementation register

| Property | Source and decision | Status |
| --- | --- | --- |
| Personal website | Main repository, `index.html`; high-level research boundaries only | Pending adaptation |
| desk. | `desk/desk.css`: replace the three chapter-heading hairlines with 4px capped silhouettes and a 1⅓px central stroke; reuse the exact original forest/clay in day appearance, native ink/accent at night, chapter-native colors on complete reveals | Implemented on review branch |
| Rupert Atlas | Main repository, `rupert/`; preserve illustrations, maps, travel and publication controls | Pending adaptation |
| Periodicals hub | `personal-updates/index.html`; existing shelf/press framing, no cover or metadata changes | Pending adaptation |
| Field Brief | `daily-watchlist-5/index.html`; existing oxblood family | Pending adaptation |
| Workbook | `daily-econ-challenge/index.html`; existing navy/teal family | Pending adaptation |
| Loblolly & Logit | Existing exterior pillars, joins, contextual feature borders, Heron and archived editions | Intentionally preserved |
| Econometric Advisor | Separate `iainholmes/econometric-advisor`, `main`, `index.html` | Pending adaptation |
| Quant Skills Trainer | Separate `iainholmes/quant-skills-trainer`, `main`, `index.html`; most restrained interpretation | Pending adaptation |

The desk page's only HTML changes are the three content-derived asset cache
versions. Its dated publication snapshot, publication markup and every artwork
remain unchanged. `--retained-snapshot` reproduces these accepted bytes during
validation; ordinary builds still refresh canonical publications.

## Review and maintenance

Validation uses a temporary workflow on the isolated
`validation/ih-house-divider-20261117` branch. It checks out exact source SHAs,
uses existing Node/source tests, serves only runner-local previews, installs the
existing pinned Playwright 1.57.0 runtime, and uploads screenshot/JSON evidence.
It has read-only repository permissions, no secrets, no schedule and no deployment
step. It is not included in design PRs or merged into production.

Inspect the downloaded screenshots themselves, alongside layout and interaction
assertions. Record actual commits/runs in PRs. A successful build is not a visual
review or a verified deployment. Physical Mac/iPhone acceptance remains with the
owner. Future properties should inherit proportions and terminal behavior while
making their own restrained placement and palette decisions.
