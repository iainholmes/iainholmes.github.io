# Current and archived issue marks

The Periodicals shelf reads canonical publication pages for latest dates, counts and framing. Its cover system keeps the existing 600×800 frame, publication palettes, type identities and conceptual illustration style. `scripts/prepare_periodicals.cjs` also updates embedded covers and metadata for offline/no-script use.

Broad thematic families still describe the issue, but new illustrations derive their dominant subject from specific content: compute and power infrastructure, timber rotations, river displacement, networks, shelter and insurance, experimental assignment, institutional boundaries or prices over time. The October 1 Field Brief uses a compute block linked to a power trunk within an oversight frame, replacing the September 30 threshold composition. These are conceptual illustrations, never photographs or measured diagrams.

`issue-mark-archive.js` pins each published model and complete SVG. Earlier marks retain their original output exactly, and regenerated published editions use their pinned artifact even after incidental prose changes. Publication preparation proceeds chronologically, passes each previous model to the generator, and switches the dominant composition when a new issue revisits the same subject. New artifacts are appended, never regenerated over old entries. Metadata alone or a tiny seeded offset is not sufficient differentiation.

Field Brief framing uses deck, signal title and synthesis. Workbook concepts use the entire question set, retaining equal per-question thematic votes. L&L uses its synthesis and closing research question. Edition content and chronology choose the concept and composition; stored artifacts preserve that choice permanently.

Run `node scripts/test_issue_marks.cjs` and `node scripts/test_publishing.cjs`, then compare consecutive covers at actual shelf scale. See `PUBLISHING.md` for complete publication/state discipline and L&L's distinct per-edition Field Study system.

## Field Brief artwork diversity (October 3 corrective release)

New Field Brief covers use version 3 structural composition signatures. Story plates in `daily-watchlist-5/artwork.js` read titles, categories, dates, positions, editorial metadata and reading context. Thirty-three distinct scenes cover subject-specific and related institutional mechanisms; seeds choose among complete compositions, never offsets, rotations, mirrors or colors. Both generators prefer avoiding three prior issues, relaxing older history only if the relevant vocabulary is exhausted; the immediately preceding issue remains excluded.

`daily-watchlist-5/artwork-archive.js` pins story plates. The legacy template table preserves the exact SVG output of all issues through No. 007. The explicitly authorized No. 008 repair replaces its boundary cover with an observation/capacity mark and replaces its four repeated story plates; its distinct fourth plate stays unchanged. No. 008 is now authoritative like every other published artifact. Missing historical pins cause an error rather than regeneration. Preparation appends new plates, validates their structural identity and geometry, and versions both registries by content digest. Run `node scripts/test_field_brief_artwork.cjs` alongside the existing checks and visually compare successive covers and story plates at reading scale.
