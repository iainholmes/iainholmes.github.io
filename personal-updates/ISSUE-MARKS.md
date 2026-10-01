# Current and archived issue marks

The Periodicals shelf reads canonical publication pages for latest dates, counts and framing. Its cover system keeps the existing 600×800 frame, publication palettes, type identities and conceptual illustration style. `scripts/prepare_periodicals.cjs` also updates embedded covers and metadata for offline/no-script use.

Broad thematic families still describe the issue, but new illustrations derive their dominant subject from specific content: compute and power infrastructure, timber rotations, river displacement, networks, shelter and insurance, experimental assignment, institutional boundaries or prices over time. The October 1 Field Brief uses a compute block linked to a power trunk within an oversight frame, replacing the September 30 threshold composition. These are conceptual illustrations, never photographs or measured diagrams.

`issue-mark-archive.js` pins each published model and complete SVG. Earlier marks retain their original output exactly, and regenerated published editions use their pinned artifact even after incidental prose changes. Publication preparation proceeds chronologically, passes each previous model to the generator, and switches the dominant composition when a new issue revisits the same subject. New artifacts are appended, never regenerated over old entries. Metadata alone or a tiny seeded offset is not sufficient differentiation.

Field Brief framing uses deck, signal title and synthesis. Workbook concepts use the entire question set, retaining equal per-question thematic votes. L&L uses its synthesis and closing research question. Edition content and chronology choose the concept and composition; stored artifacts preserve that choice permanently.

Run `node scripts/test_issue_marks.cjs` and `node scripts/test_publishing.cjs`, then compare consecutive covers at actual shelf scale. See `PUBLISHING.md` for complete publication/state discipline and L&L's distinct per-edition Field Study system.
