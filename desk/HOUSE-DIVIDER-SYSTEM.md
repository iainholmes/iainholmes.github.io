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
| Personal website | Main repository, `index.html`; two existing heading underlines at Research and Research Toolkit; exact forest/clay reference | Implemented |
| desk. | `desk/desk.css`: replace the three chapter-heading hairlines with 4px capped silhouettes and a 1⅓px central stroke; reuse the exact original forest/clay in day appearance, native ink/accent at night, chapter-native colors on complete reveals | Implemented |
| Rupert Atlas | Main repository, `rupert/`; native pine and rule-strong ink on the existing This Week heading boundary; illustrations, maps, Travel and Full Editions unchanged | Implemented |
| Periodicals hub | `personal-updates/index.html`; taper existing press-note spines and their corner hinges in each note's existing --c ink; covers and metadata unchanged | Implemented |
| Field Brief | `daily-watchlist-5/index.html`; one front-to-story transition per issue; oxblood principal stroke and press-ink terminals; story-side borders untouched | Implemented |
| Workbook | `daily-econ-challenge/index.html`; existing title and results rules in --navy/--teal; question and mathematical boundaries unchanged | Implemented |
| Loblolly & Logit | Existing exterior pillars, joins, contextual feature borders, Heron and archived editions | Intentionally preserved |
| Econometric Advisor | Separate `iainholmes/econometric-advisor`, `main`, `index.html`; one toolkit-to-resources boundary in --surface/--hint | Implemented |
| Quant Skills Trainer | Separate `iainholmes/quant-skills-trainer`, `main`, `index.html`; compact session-heading rule in --border2 with current --lang terminals | Implemented |

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

## Site-specific restraint and source preservation

The homepage uses only two existing research/toolkit underlines. Contact,
CV, navigation and the rest of its academic composition retain their own rules.
The hub reuses its existing seven-pixel press corners, with a one-third-width
spine, tapered shoulders and a short horizontal hinge; its shelf and all three
covers are unchanged. Field Brief adds no story-level repetition: the five
accepted story-border pairs, colors, illustrations and issue data are untouched.
The Workbook changes no question, explanation, console, feedback or progress UI.

The Atlas treatment is limited to This Week's existing heading boundary.
Full Editions already contain sufficient hierarchy; no added illustration-side
or route/map ornament is justified. Travel and every publication format remain
unchanged. Advisor's single overview/toolkit boundary uses native interface blue
and hint ink, leaving every methodological category and graph color untouched.
QST adds only a three-pixel-cap/one-pixel-stroke session transition. Its language
color follows the existing selection; editors, output, feedback and progress
receive no ornament. No new footer signature is needed.

Outside desk, HTML changes consist solely of one scoped style block named
`ih-house-dividers`; the Atlas stylesheet receives a small appended block scoped to the week page, and only
its stylesheet cache query is refreshed in `rupert/index.html`.
Source checks remove only that added block and require byte-for-byte equality
with the base. Frozen artwork, published prose/questions, scripts, citations,
metadata, storage formats, schedules and all L&L files must compare unchanged.

The accepted first stage was validated before integration in
[run 44231398846](https://github.com/iainholmes/iainholmes.github.io/actions/runs/44231398846):
342 source checks, 30 Node tests, four viewport sizes, both appearances,
48 hashed comparison screenshots, unchanged element geometry, all seven reveals
and all complete-chapter palettes. Downloaded desktop, tablet, portrait and
landscape samples were inspected. Source and deployment evidence for subsequent
stages belongs in the repository-specific PRs; user/device acceptance remains
distinct from implementation and remote inspection.
