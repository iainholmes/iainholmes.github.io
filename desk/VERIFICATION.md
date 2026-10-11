# desk. IH. visual-correction verification

## Status and scope

**Draft PR #4; unmerged and undeployed.** Branch: `desk/foundation-20261010`. The working tree was clean at `175bba989170c1e37a5ba9351955ebf2eab87add` when this correction began. The accepted site foundation remains `df8c942`. This pass corrects only IH. vector fidelity and header/footer placement, plus their documentation and validation. All repository changes remain in `desk/`.

## Demonstrated discrepancies and corrections

- The first implementation explicitly replaced the scene with a solid dot below 1000px. The user's header screenshot confirms it. **Every variant now contains Rupert and the loblolly.** Compact geometry opens branch spacing and strengthens fine strokes instead of removing the defining figures.
- Compared the large SVG with the approved logo using normalized enclosures. Refined the I/H vertical placement, serifs, spacing and H/period baseline; retained separate initials and a fine circle. Period diameter is 10.4% of the canvas, matching the reference's approximate proportion and remaining constant at every breakpoint.
- Replaced the coarse tree and dog contours with a seated haunch/foreleg, lifted muzzle, ear, resting tail and ground, beside six irregular branch tiers. The compact master uses four more open tiers and no ear cutout. Clear space separates the muzzle from the branches.
- Warmed only the signature copper from `#976144` to `#a45f35` toward the approved reference. Copper/cream remain fixed in day/night. Accepted page colors, wordmark color, typefaces and theme logic are unchanged.
- Header scale is now 120px desktop, 104px intermediate, 96px phone and 88px narrow phone, with a small mobile optical offset. The wordmark and its descriptive typography are unchanged.
- The supplied footer capture showed the signature appended below the utility row. It now closes the content above those controls, using equal rule tracks, .75px lines, 12px gaps and a centered 26px illustrated period. The group has more deliberate space from the final panel and preserves footer functionality.

## Visual evidence and limitations

Inspected the approved logo, both identity boards and the user's existing header/footer screenshots. The concept sheet containing alternative plain-dot ideas does not override the specifically approved Rupert/loblolly mark. Illustrative hero imagery and publication mockups were not reproduced.

Rendered the final primary SVG at 1000px and compared it with the approved reference. Also inspected Inkscape proofs of **120, 104, 96 and 88px** header marks, the **26px** ruled footer device, both day/night palettes and a **3× raster** of the phone-sized SVG. Both initials remain distinct; both dog/tree silhouettes are present and separate. At 96px, the period is about 10px and Rupert only about 4px tall. The scene is therefore miniature: the ear and individual branch tips are not reliably readable at normal viewing distance, even on a high-density display. This limitation is documented rather than hidden by substituting a plain dot. The 26px footer scene is materially clearer.

**These are asset renderings, not a browser rendering of the revised website.** Current source geometry and the owner's prior captures informed header/footer corrections; final integrated proportions, surrounding negative space, Safari/Chrome behavior and physical iPhone acceptance remain for the owner's established local review. No claim of complete visual acceptance is made.

The Sites managed-preview environment still has no exposed supported browser-control dependency. Its prior launch and retry failed before initialization with `bwrap: Can't mount proc on /newroot/proc: Operation not permitted`. No launch was retried, browser installed, substitute preview infrastructure started or deployment performed. Follow `LOCAL-REVIEW.md`.

## Validation — 10 October 2026, Eastern

- Canonical SVGs and HTML regenerate deterministically with `node desk/_tools/build-identity.mjs` and `node desk/_tools/build.mjs`.
- `node --check desk/desk.js` and the established runtime suite: **7 tests passed**, covering Eastern time/DST, scheduling, visit-only override, section positioning/focus, bottom scroll space and fragment/history behavior. The runtime and tests are unchanged; these are simulated-DOM tests.
- `python3 desk/_tools/validate.py --online`: **254 checks passed**, including HTTP 200 for all 12 destination URLs and both portfolio fragments. Adds a regression requirement that every identity asset contains Rupert and the loblolly; retains asset hashes, local clipping, portable vector structure, embedded/canonical equivalence, accessible labels, source artwork/font provenance, deterministic output and repository isolation.
- Identity contrast: letters/enclosure **10.26:1 day / 13.97:1 night**; copper against day paper/cream **4.22:1**, against night paper **3.44:1**. The illustration and mark exceed the 3:1 graphic threshold. Decorative rules use the current ink at 45% opacity.
- Byte preservation checks cover the runtime, project configuration, manifest, existing icons, canonical artwork, all fonts/licenses and the generated page's accepted masthead, toolbar and main content.
- `git diff --check` passed. All candidate and complete PR paths are under `desk/`.

Keep this PR draft. The cross-site assessment remains a proposal only; its old 48–56px full-monogram suggestion is revised to respect the newly explicit minimum size. No cross-site changes, merge or deployment are authorized.
