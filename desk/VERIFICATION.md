# desk. final identity and editorial refinement verification

## Recovery and scope

Resumed the existing branch `desk/foundation-20261010` at `314657d8824bbee4ee1162d071913b96894eaf15`. The working tree was clean: the interrupted creative pass had inspection progress but no uncommitted implementation to recover. Prior accepted functionality and artwork were preserved. All changes remain within `desk/`. PR #4 stays draft, unmerged and undeployed.

## Completed composition

Refined the maximum page measure, outer margins, header spacing and wordmark scale. The existing introductory sentence uses authentic Dunhill Oblique; on iPhone it occupies a separate full-width row below the wordmark and signature. Numbered section headings and fine rules establish a consistent rhythm. Wider gutters and a desktop vertical divider distinguish the two application groups without imposing a uniform card design. Publication covers retain their full artwork with more breathing room; the Rupert plate receives a narrow cream mount. The final illustrated period concludes the page between symmetrical rules above the preserved footer controls.

## Exact final identity

The supplied `IH_personal logo(1).png` supersedes every previous identity. `assets/identity/ih-master.png` is an unchanged copy, SHA-256 `7e2dabb7244b44c8a582792f59ff3cb1fa0eb8e911a8a4e7c249d68c5ba0c619`. The header and footer PNGs are integer-coordinate whitespace crops. Pixel equality against the corresponding master regions is tested; there is no resampling, redraw, recoloring, transparency conversion or substitute typography. Obsolete SVGs and their generator were removed.

The header displays the same complete artwork at every breakpoint on a light paper mount, including night appearance. This preserves the original green, copper and textured light background. The footer uses the exact original illustrated period. See `assets/identity/README.md` for coordinates, dimensions and reproduction instructions.

## Visual evidence and limitations

Inspected the supplied master and both earlier reference boards. The boards inform editorial craftsmanship, not replacement layouts. Examined the crops at native resolution and actual-size asset proofs at 148, 132, 112 and 100px header mount widths and a 32px footer signature, against day and night backgrounds. The original I/H geometry, staggered alignment, extended H crossbar, period placement and illustration are retained.

The small header period is approximately 10–15px across. Its scene remains present but Rupert and individual branches cannot be reliably distinguished at normal viewing distance on the smallest rendering. No simplified mark is substituted and the period is not enlarged independently. The 32px footer presentation makes the scene clearer; its 60px source crop also limits useful enlargement. Final physical-device legibility is for the owner's review.

These are image proofs, **not browser screenshots of the website**. Integrated layout, wrapping, enlarged text, touch behavior and Safari/Chrome acceptance still require the established MacBook/iPhone review in `LOCAL-REVIEW.md`. The managed preview previously failed twice before startup with `bwrap: Can't mount proc on /newroot/proc: Operation not permitted`; no supported browser-control dependency was available. No launch retry, substitute preview infrastructure or deployment was performed. No hosted preview link is available.

## Validation — 11 October 2026

- `python3 desk/_tools/validate.py --online`: **226 static/source checks passed**, including all 12 destination URLs and both portfolio fragments. Includes exact master hash, pixel-identical crops, deterministic exports/HTML, artwork/font provenance, accessible identity labeling and repository isolation.
- `node --check desk/desk.js`: passed.
- `node --test desk/_tools/test-runtime.cjs`: **7 tests passed**, covering Eastern time/DST boundaries, scheduling, visit-only override, all three section positions/focus, bottom scroll space and fragment/history behavior. These are simulated-DOM tests, not browser tests.
- Generated main content and navigation match the previous commit. Runtime, project configuration, runtime tests and all 39 non-identity assets are byte-identical. Section headings retain the existing measured 12px sticky-navigation offset; no new top padding shifts the anchored heading.
- Header artwork has one descriptive accessible image name; the footer ornament is hidden from assistive technology. Existing controls, focus treatment and direct links remain intact. No filter changes the approved image in night appearance.
- `git diff --check` passed. Candidate paths remain exclusively within `desk/`; full PR isolation is checked before updating the branch.

Cross-site identity changes remain a separate future assignment. Final visual acceptance and release require the owner's approval.
