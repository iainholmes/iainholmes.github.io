# desk. IH. integration verification

## Status and scope

**Draft PR #4; not merged or deployed.** Branch: `desk/foundation-20261010`. The owner accepted the desktop/iPhone design, lowercase italic wordmark, typography, application representations, navigation and day/night system at `df8c942ba9b5dd9f5e7ab8c574f66a554ed1f54a`. This pass adds the canonical IH. personal monogram, header/footer integration, asset guidance and a read-only cross-site proposal. All changes remain in `desk/`.

The working tree was clean at the confirmed baseline when the interrupted assignment resumed. Existing reference images and project files were preserved. No new branch, workspace or PR was created.

## Changes

- Four original vector masters: light and nighttime primary circular IH., a strengthened small-format IH. with a solid copper period, and the simplified copper-period signature. Paths require no fonts, raster image, script or external resource. The primary period depicts Rupert seated to the left of a pine, looking upward beneath its lower boughs.
- Upper-right owner text replaced by the circular mark, with one accessible name and no new focus stop. Responsive sizes are 112px, 96px, 84px and 72px; the smaller three use the simplified master.
- A centered 26px copper-period device between two short rules below the existing footer controls. Its repetition is decorative and hidden from assistive technology. Back-to-top and installation help remain intact.
- Letters and enclosure follow the existing day/night ink. Copper and the cream silhouette remain constant. The accepted theme schedule, switching behavior, wordmark, typography, app icons and constituent artwork are unchanged.
- Usage guidance in `assets/identity/README.md`; recommendations for seven destinations in `IDENTITY-INTEGRATION.md`. No cross-site implementation.

## Completed validation — 11 October 2026

- `node desk/_tools/build-identity.mjs` and `node desk/_tools/build.mjs`: passed; canonical SVGs and HTML regenerate deterministically.
- `node --check desk/desk.js`: passed.
- `node --test desk/_tools/test-runtime.cjs`: **7 tests passed**. Covers Eastern standard/daylight thresholds, spring/fall DST transitions, boundary scheduling, visit-only manual override, fresh/restored visits, all three section positions and focus transfer, repeated links, modifier clicks, direct fragments and hash history. These use simulated DOM geometry, not browser rendering.
- `python3 desk/_tools/validate.py --online`: **250 checks passed**, including all **12 distinct destinations returning HTTP 200** and both portfolio fragments resolving. Checks cover canonical artwork/font provenance, exact archived cover bytes, disclosures, labels/IDs, icons, script ordering, deterministic output, repository isolation and the new SVG identity geometry, local clipping references, asset hashes, accessibility attributes and embedded/canonical equivalence.
- IH. letters/enclosure contrast: **10.26:1** on day paper and **13.97:1** on night paper. Constant copper: **4.38:1** against day paper/cream silhouette and **3.31:1** against night paper. These exceed the 3:1 graphic threshold. Existing text and focus palettes are unchanged from the accepted finishing pass.
- Standalone vectors were rasterized with Inkscape and visually inspected at **112, 96, 84, 72 and 48px**, in both palettes, plus the **26px** footer period. Both initials remain distinct. The small master deliberately omits the scene. The primary miniature remains ornamental at header size; guidance specifies 160px or more if the scene itself must be examined closely.
- Byte comparison against `df8c942` confirmed that `desk.js`, `projects.json`, the runtime tests, manifest, existing icons, canonical artwork and every font/license asset are unchanged.
- `git diff --check`: passed. Candidate and complete PR file paths are restricted to `desk/`; no constituent application, publishing system or unrelated repository file is included.

## Visual evidence and remaining review

The accepted foundation was physically inspected by the owner. **The new IH. integration has not been browser-rendered by the agent.** Standalone vector proofs establish asset rendering, not final header/footer composition, Safari/Chrome behavior or physical-device acceptance. These remain for the owner's established Mac/iPhone preview, including narrow-screen proportions, text enlargement, theme transitions, keyboard/VoiceOver behavior and footer controls.

The managed Sites preview previously failed twice before startup with `bwrap: Can't mount proc on /newroot/proc: Operation not permitted`. It was not retried. No substitute preview infrastructure or deployment was used. Follow `LOCAL-REVIEW.md` to refresh the existing Mac/Python preview and open it from the iPhone on the same Wi-Fi network.

Keep PR #4 draft. Merging, deployment and public GitHub Pages acceptance require a separately authorized release after local visual review.
