# desk.

A self-contained organizational home at `https://iainholmes.github.io/desk/`.

**Desk supplies the composition; its constituent applications supply much of the visual richness.** The owner has accepted the revised desktop and iPhone composition, application identities, archival artwork and optional introductions. This finishing pass applies the five approved corrections and lowercase italic wordmark without reopening that foundation.

## Architecture

`index.html` is generated from `projects.json` by a dependency-free Node script and committed for the existing GitHub Pages/Jekyll pipeline. All assets and tools stay inside `desk/`. No root configuration, constituent application, publishing job or shared infrastructure changes are required.

Native links and optional native disclosures keep every destination directly accessible. The small local `desk.js` adds only two behaviors:

- A sticky day/night toggle. Automatic appearance follows `America/New_York`, including daylight-saving time: day from 07:00 through 20:59, night otherwise. It is set before the stylesheet and initial page paint. A choice overrides the clock in memory for the current visit; reloads, new visits and restored back/forward-cache visits reevaluate the clock. A scheduled boundary update keeps an open automatic visit current.
- Measured section positioning and focus. All three section links land 12 CSS pixels below the sticky bar. The last section receives only the extra document length needed to reach that position. Native fragment URLs and history remain available.

The script makes no network requests and reads no cookies, application data, browser storage, Field Log content or credentials. There is no service worker, backend, embedded app session or offline claim. With JavaScript unavailable, direct links/disclosures remain native and the page uses day appearance.

## Typography and identity

All interface text uses authentic Latin Modern Roman Dunhill Regular or Oblique, weight 400. The existing Archivo wordmark is now lowercase **desk.**, genuine italic, weight 650. No synthetic weights or styles are requested. Dunhill type sizes and wrapping are recalibrated across the existing desktop and phone compositions; lettering embedded in canonical artwork remains untouched.

Font sources, licenses, change notes and access to the complete Latin Modern distribution are documented in `assets/fonts/NOTICE.md`; hashes are in `SOURCE-REVISIONS.json`.

All northeast link marks are matching static SVGs. The Home Screen icon is an original paper bookplate with outlined italic `desk.` lettering; the matching favicon uses `d.` for small-size legibility. SVG, opaque 180/192/512px PNG assets and a 32px fallback favicon are included. `_tools/build-icons.py` can reproduce these assets with fontTools and Inkscape; neither is required to serve or review the site.

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
node desk/_tools/build.mjs
node --check desk/desk.js
node --test desk/_tools/test-runtime.cjs
python3 desk/_tools/validate.py --online
git diff --check
```

Read `LOCAL-REVIEW.md` to refresh the owner's established Mac/iPhone preview and review the five corrections. `VERIFICATION.md` records evidence and its limits. The managed Sites preview is not retried. PR #4 remains draft; this pass does not authorize merging or deployment.
