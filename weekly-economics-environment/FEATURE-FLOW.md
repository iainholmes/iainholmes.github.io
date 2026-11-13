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

A feature cell paints the reading's wash once. The eight existing palettes
provide the accent, with a small ink mix for the outer edge and a lighter
paper mix for the middle of the shared divider. Charts, equations, headings
and feature-specific interior marks keep their own established roles.

- A standalone or topmost feature has a 4px upper rail that follows its
  corner radius. A feature with a shared upper edge uses a 4px left spine
  when that side is free. A shared upper and left edge leave the divider to
  do the work. The rail and spine are painted inside the panel and add no
  width or height.
- A real shared edge receives one centered divider, with a 6px maximum
  thickness and tapered ends, spanning the middle 90% of the measured
  contact. The same rule serves vertical seams between columns and
  horizontal seams when features stack.
- Mixed and staggered arrangements use only the measured overlap. A
  divider squares the panel corners its shared edge reaches. Prose, the
  Notebook, Heron and Sources retain their own space and interrupt feature
  joins.

Editors choose the feature, its existing composition primitives and a
reading palette. The renderer determines which edges are exposed after
reflow. Future editions inherit these treatments without border settings,
per-reading rules or additional palette entries.

Publication checks require the native contract and the figure's separate
commentary context. The rendered-browser audit independently searches for
unobstructed corridors between feature rectangles, without relying on join
classes or existing dividers. A positive gap fails publication. Another check
requires one correctly positioned divider per shared edge and verifies that
outside accents never compete with it. Regression fixtures cover stacked,
side-by-side, partial and blocked edges, and both themes check palette contrast.
These checks enumerate the generated Index, so newly published readings are
automatically included.

Run `node scripts/test_ll_publication_layout.cjs` and
`node scripts/test_ll_layout_browser.cjs` from the repository root. The existing
L&L Actions workflow runs these checks at 21 widths in day and night modes,
plus navigation, precise links and companion persistence. Review the rendered
screenshots and verify the actual deployed assets and production layout after
publication; source tests or a successful commit alone are insufficient.
