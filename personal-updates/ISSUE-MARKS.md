# Current issue marks

The Periodicals shelf reads the same canonical publication pages as its issue counts and notes. `issue-marks.js` derives a single visual theme and renders the current number/date into a common 600×800 SVG frame. The image region occupies 71% of the height. The surrounding shelf, publication links and press notes keep their existing layout.

- Field Brief uses `deck`, `signalTitle` and the entire `signal` synthesis, with the issue title as a fallback. Its image uses cream, oxblood and dark editorial shapes.
- L&L uses the current edition’s `.synthesis` text, including its closing research question. Its image uses spruce, clay, pollen, cream and restrained field contours.
- The Workbook examines every question’s field, concepts, stem and explanation. Each question casts at most one vote for a thematic concept, preventing a long first stem from dominating. Its image uses navy/teal and a faint analytical grid.

The theme families are institutional constraints, identification, complements, allocation and change over time. They produce one conceptual threshold, arch, paired path, equilibrium diagram or adjustment curve, respectively. These are illustrations rather than measured results. Edition metadata and issue-wide content seed modest composition changes; a new issue automatically receives a new mark. The primary subject comes from thematic scoring, not the seed.

Marks refresh on load, focus and restoration from browser history. Embedded current marks provide an offline/no-script fallback. Future editions need no new hub markup or permanent publication icon. Publish canonical framing/concepts along with the new issue. Keep full article titles in editorial Title Case on L&L; other hub article references read canonical headings.

`node scripts/test_issue_marks.cjs` checks issue-wide themes, equal per-question weighting, number normalization and mark changes across editions. Render the marks at desktop and phone widths before publication.
