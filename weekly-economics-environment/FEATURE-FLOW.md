# Native Special Feature boundaries

Every authored reading uses the native feature-flow contract emitted by
`reading-compositions.cjs`. The reading-specific arrangement, proportions,
insets, arguments and palette remain editorial decisions. Their shared layout
primitives determine physical adjacency; authors do not add spacing between
neighboring Special Features.

Rows, feature hosts, shared fields and figure/commentary compositions have no
feature-to-feature gutter or external block margin. Real grid and flex cells
meet, including partial edges beside editorial material. Standard editorial
cells own their breathing room. An inset made entirely of standard material
occupies a standard-only block boundary, while a notebook beside a figure does
not interrupt that figure's lower edge. No fixed section heights or painted gap
bridges are used.

A feature cell paints its reading-owned wash once. Old hairline box outlines
are absent. The existing geometry-based renderer places a centered 90% copper
and forest divider on each real shared segment and squares only the corners
reached by that segment. It never draws a divider across an editorial section,
Notebook, Heron or source register.

Publication checks require the native contract and the figure's separate
commentary context. The rendered-browser audit independently searches for
unobstructed corridors between feature rectangles, without relying on join
classes or existing dividers. A positive gap fails publication. Another check
requires every actual shared edge to carry its correctly positioned divider.
Regression fixtures cover stacked, side-by-side, partial and blocked edges.
These checks enumerate the generated Index, so newly published readings are
automatically included.

Run `node scripts/test_ll_publication_layout.cjs` and
`node scripts/test_ll_layout_browser.cjs` from the repository root. The existing
L&L Actions workflow runs these checks at 21 widths in day and night modes,
plus navigation, precise links and companion persistence. Review the rendered
screenshots and verify the actual deployed assets and production layout after
publication; source tests or a successful commit alone are insufficient.
