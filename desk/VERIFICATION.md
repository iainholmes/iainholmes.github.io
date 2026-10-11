# desk. home-to-chapter verification — 11 October 2026

## Recovery and scope

Continued the clean existing branch `desk/foundation-20261010` at `670442a08a67fb0706315474fc2436aef228c1af`. This assignment introduces the requested home-to-chapter architecture within the continuous page. No new project, branch, constituent-application modification or deployment. PR #4 stays draft.

## Editorial architecture

The home uses warm ivory, forest ink, a restrained copper rule and the exact IH. artwork, alongside the unchanged lowercase italic wordmark. The introductory tagline has been removed from both page markup and project configuration, with no replacement sentence in the header.

The three chapters now follow one another vertically on desktop as well as phone. This makes each TOC target and natural-scroll boundary distinct. Persistent navigation retains desk.'s identity. Only the active chapter receives its full atmospheric layer; adjacent chapters retain recognizable application content without competing surroundings.

- **Research & Practice:** deep navy drafting field, faint measured grid, cream heading, brass opening instruments; Advisor and QST appear side by side on desktop and sequentially on phone, retaining their separate surfaces, stages and language colors.
- **Reading & Outdoors:** archival paper, botanical green and fine rules; larger original publication covers, authentic masthead faces and subordinate engravings. A full-width navy Atlas composition continues the reading room with its original 4:5 plate and compass/contour device.
- **Personal Website:** scholarly blue, architectural ink and a large marginal arcade study, with affiliations, professional focus and direct research/CV links arranged as an academic chapter rather than a footer panel.

Research dividers and QST instruments moved to the shared chapter opening. Fish, pine and books remain tied to their individual publications: marginal title devices on wide screens and small devices beneath covers on phone. The Atlas compass remains with its field-guide heading. The arcade moved outside portfolio text to frame the entire academic composition. All seven SVG files are unchanged.

## Runtime behavior

Chapter identity and day/night appearance are independent data attributes. The Eastern/DST clock and visit-only manual appearance selection remain intact. TOC clicks focus the destination, preserve the 12px sticky-toolbar clearance and request native smooth scrolling; reduced-motion preferences, direct fragments and history restoration use immediate positioning.

A passive scroll listener schedules at most one pending animation-frame observation. A reading line near the top of the usable viewport selects one sequential chapter; returning to the beginning restores home. Ordinary scrolling changes neither history nor focus. During a TOC journey the requested chapter remains selected, avoiding intermediate atmosphere flashes. Arrival, scrollend, user input or a bounded 1.6-second fallback releases that state. Observation never scrolls the page. The atmospheric pseudo-elements are paint-only layers: state changes do not alter padding, dimensions or document flow.

## Validation

- `python3 desk/_tools/validate.py --online`: **277 static/source/accessibility checks passed**, including all destination URLs and both portfolio fragments, unchanged canonical artwork, exact IH. master/crops, deterministic generation, safe decorative SVGs and their revised chapter placements.
- `node --check desk/desk.js`: passed.
- `node --test desk/_tools/test-runtime.cjs`: **14 tests passed**. The seven existing appearance/navigation tests remain, with added chapter selection, home restoration, appearance independence, smooth travel/interruption, reduced motion/history, rapid clicks, completion and bounded-fallback coverage.
- All existing visible text other than the explicitly removed tagline and all anchor attributes are preserved. All **48 non-document assets** are byte-identical, including the final IH. artwork, seven illustrations, canonical covers, Rupert plate, fonts and installation icons.
- Keyboard focus remains on the chosen section, with the existing visible heading outline. Active TOC links use `aria-current="location"`. Passive chapter observations do not announce or steal focus. No decorative element receives pointer input or a tab stop.
- `git diff --check` passed. All candidate and complete PR files remain within `desk/`; remote/staged tree equality is checked before final handoff.

## Visual evidence and acceptance limits

The existing seven illustrations were previously rendered and inspected at desktop/phone ornament dimensions in both palettes; their artwork is unchanged. This pass reviewed generated structure, responsive grid rules, fixed geometry, palettes, layer ordering and interaction logic in source. It did **not** render the integrated revised page in a browser. Runtime tests use a simulated DOM; they do not establish Safari scroll timing, physical iPhone wrapping or final artistic quality.

The previously failing managed preview was not retried. No substitute preview infrastructure was used, and no hosted preview is available. The exact earlier error remains `bwrap: Can't mount proc on /newroot/proc: Operation not permitted`.

**The implementation is prepared for visual review, not visually accepted.** The owner must inspect the overall composition and all four home/chapter states on MacBook and iPhone in both appearances, including enlarged text, transition pacing, precise navigation and cover prominence. See `LOCAL-REVIEW.md`. Do not merge or deploy without explicit approval.
