# desk.

A self-contained organizational home at `https://iainholmes.github.io/desk/`.

**Desk supplies the composition; its constituent applications supply much of the visual richness.** The owner has accepted the desktop and iPhone composition, application identities, archival artwork, optional introductions, lowercase italic wordmark, typography, navigation and appearance system at `df8c942`. The current pass introduces the home-to-chapter architecture while retaining the user’s final, fixed IH. artwork. The earlier hand-drawn identity is superseded.

## Architecture

`index.html` is generated from `projects.json` by a dependency-free Node script and committed for the existing GitHub Pages/Jekyll pipeline. All assets and tools stay inside `desk/`. No root configuration, constituent application, publishing job or shared infrastructure changes are required.

Native links and optional native disclosures keep every destination directly accessible. The small local `desk.js` provides three local behaviors:

- A sticky day/night toggle. Automatic appearance follows `America/New_York`, including daylight-saving time: day from 07:00 through 20:59, night otherwise. It is set before the stylesheet and initial page paint. A choice overrides the clock in memory for the current visit; reloads, new visits and restored back/forward-cache visits reevaluate the clock. A scheduled boundary update keeps an open automatic visit current.
- Measured section positioning and focus. TOC requests scroll smoothly unless reduced motion is preferred; direct fragments and history restore immediately. All three section links land 12 CSS pixels below the sticky bar. The last section receives only the extra document length needed to reach that position. Native fragment URLs and history remain available.

- Scroll-driven chapter identity: one active chapter gains its own surrounding frame, rules, ink and atmosphere. Passive, animation-frame-coalesced observation updates the active chapter and TOC location without changing history or moving focus. Returning to the top restores home. Chapter identity never overrides appearance choice.

The script makes no network requests and reads no cookies, application data, browser storage, Field Log content or credentials. There is no service worker, backend, embedded app session or offline claim. With JavaScript unavailable, direct links/disclosures remain native and the page uses day appearance.

## Typography and identity

Navigation and explanatory interface text use authentic Latin Modern Roman Dunhill Regular or Oblique, weight 400. The three publication mastheads use their authentic editorial faces: Bodoni Moda (weight 500), Ectros and STIX Two Text, following the final application-identity direction. The existing Archivo wordmark is now lowercase **desk.**, genuine italic, weight 650. No synthetic weights or styles are requested. Dunhill type sizes and wrapping are recalibrated across the existing desktop and phone compositions; lettering embedded in canonical artwork remains untouched.

Font sources, licenses, change notes and access to the complete Latin Modern distribution are documented in `assets/fonts/NOTICE.md`; hashes are in `SOURCE-REVISIONS.json`.

All northeast link marks are matching static SVGs. The Home Screen icon is an original paper bookplate with outlined italic `desk.` lettering; the matching favicon uses `d.` for small-size legibility. SVG, opaque 180/192/512px PNG assets and a 32px fallback favicon are included. `_tools/build-icons.py` can reproduce these assets with fontTools and Inkscape; neither is required to serve or review the site.

The final **IH.** signature is the exact supplied image, not a font substitution or reconstructed SVG. The untouched master is retained in `assets/identity/`; header and footer exports are lossless whitespace crops with pixel-for-pixel validation. A light paper mount preserves the original artwork in both day and night appearances. [Identity guidance](assets/identity/README.md) documents the crop rectangles and display limits.

## Editorial composition

The tagline has been removed without replacement. The opening pairs the lowercase italic wordmark with the exact IH. logo on a warm ivory/forest/copper surround. The three existing groups are sequential editorial chapters on both desktop and phone; the navigation remains stable throughout.

Research uses a navy drafting field with fine grid lines and a shared instrument frontispiece. Advisor retains its dark methodology workflow, while QST retains its light/dark learning surface and three language identities. Reading uses archival paper, individual publication mastheads and prominent original covers, continuing into the Atlas's navy field-guide composition. Personal Website uses scholarly blue and a marginal architectural study, with the original academic identity and links.

Only the active chapter receives the full atmospheric layer. Color and opacity transitions are restrained and disabled for reduced motion. These layers do not affect layout or anchor geometry. Day/night palettes are separate from chapter state.

The seven original [SVG illustrations](assets/illustrations/README.md) remain unchanged: the two instruments now introduce Research, the fish/pine/books sit beside publication titles on wide screens and beneath their covers on phone, the compass belongs to the Atlas heading, and the arcade frames the academic chapter. The arcade remains an original study rather than a named campus landmark. No new application feature or section is introduced.

The [cross-site assessment](IDENTITY-INTEGRATION.md) remains historical guidance only. Expansion of the identity is a separate future assignment.

## Preserved material

- Advisor's original mark, navy identity and research-design workflow.
- QST's Python/R/Stata identities and Learn/Practice/Feedback sequence.
- Three byte-identical frozen publication covers from `personal-updates/issue-mark-archive.js`, with their dates, canonical lettering and complete 3:4 artwork. They are explicitly archival selections, not synchronized issue choices.
- The original byte-identical Rupert 4:5 plate, with This Week, Atlas and Field Log links.
- The personal website's academic identity, Research and Academic CV anchors.
- All 12 destination URLs and five initially closed native disclosures, separate from direct navigation.

Stable publication cadences remain descriptive. No availability, progress, recommendation state or operational status is duplicated from the source applications.

## Maintain and review

From the repository root:

```sh
python3 desk/_tools/prepare-identity.py
python3 desk/_tools/build-illustrations.py
node desk/_tools/build.mjs
node --check desk/desk.js
node --test desk/_tools/test-runtime.cjs
python3 desk/_tools/validate.py --online
git diff --check
```

Read `LOCAL-REVIEW.md` to refresh the owner's established Mac/iPhone preview and review the editorial refinement and exact supplied identity. `VERIFICATION.md` records evidence and its limits. The managed Sites preview is not retried. PR #4 remains draft; this pass does not authorize merging or deployment.
