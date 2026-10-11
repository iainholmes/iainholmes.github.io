# desk.

A self-contained organizational home at `https://iainholmes.github.io/desk/`.

**Desk supplies the composition; its constituent applications supply much of the visual richness.** The default IH. collection and the authentic application reveals are separate presentations. This pass continues `a90ab04`, preserving the exact supplied IH. artwork and established application content. Final browser and artistic acceptance remain with the owner.

## Architecture

`index.html` is generated from `projects.json` by a dependency-free Node script and committed for the existing GitHub Pages/Jekyll pipeline. All assets and tools stay inside `desk/`. No root configuration, constituent application, publishing job or shared infrastructure changes are required.

Native links and optional native disclosures keep every destination directly accessible. The small local `desk.js` provides three local behaviors:

- A sticky day/night toggle. Automatic appearance follows `America/New_York`, including daylight-saving time: day from 07:00 through 20:59, night otherwise. It is set before the stylesheet and initial page paint. A choice overrides the clock in memory for the current visit; reloads, new visits and restored back/forward-cache visits reevaluate the clock. A scheduled boundary update keeps an open automatic visit current.
- Measured section positioning and focus. TOC requests scroll smoothly unless reduced motion is preferred; direct fragments and history restore immediately. All three section links land 12 CSS pixels below the sticky bar. The last section receives only the extra document length needed to reach that position. Native fragment URLs and history remain available.

- Deliberate application reveals: each work has an independent IH. collection article and an authentic application article, sharing content and link data through the generator. Native `hidden` removes the inactive face from layout, keyboard navigation and the accessibility tree. TOC selection reveals its entire chapter and resets the others. Individual Reveal/Return controls change one work, preserving selected siblings in the same chapter. A chapter return restores that chapter's collection. Appearance and reveal state are independent.

Ordinary scrolling never reveals or closes a work; returning to the very beginning restores the complete collection. History stores the exact selected subset and destination, including a closed collection. Direct `#research`, `#reading` and `#profile` URLs reveal their chapters; `#work-advisor`, `#work-qst`, `#work-field-brief`, `#work-loblolly`, `#work-workbook`, `#work-rupert` and `#work-portfolio` reveal individual works. `#collection` opens the collection. Open website links are separate from the local reveal controls.

The script makes no network requests and reads no cookies, application data, browser storage, Field Log content or credentials. There is no service worker, backend, embedded app session or offline claim. With JavaScript unavailable, direct links/disclosures remain native and the page uses day appearance.

## Typography and identity

Navigation and explanatory interface text use authentic Latin Modern Roman Dunhill Regular or Oblique, weight 400. The three publication mastheads use their authentic editorial faces: Bodoni Moda (weight 500), Ectros and STIX Two Text, following the final application-identity direction. The existing Archivo wordmark is now lowercase **desk.**, genuine italic, weight 650. No synthetic weights or styles are requested. Dunhill type sizes and wrapping are recalibrated across the existing desktop and phone compositions; lettering embedded in canonical artwork remains untouched.

Font sources, licenses, change notes and access to the complete Latin Modern distribution are documented in `assets/fonts/NOTICE.md`; hashes are in `SOURCE-REVISIONS.json`.

All northeast link marks are matching static SVGs. The Home Screen icon is an original paper bookplate with outlined italic `desk.` lettering; the matching favicon uses `d.` for small-size legibility. SVG, opaque 180/192/512px PNG assets and a 32px fallback favicon are included. `_tools/build-icons.py` can reproduce these assets with fontTools and Inkscape; neither is required to serve or review the site.

The final **IH.** signature is the exact supplied image, not a font substitution or reconstructed SVG. The untouched master is retained in `assets/identity/`; header and footer exports are lossless whitespace crops with pixel-for-pixel validation. A light paper mount preserves the original artwork in both day and night appearances. [Identity guidance](assets/identity/README.md) documents the crop rectangles and display limits.

## Editorial composition

The tagline has been removed without replacement. The opening pairs the lowercase italic wordmark with the exact IH. logo on a warm ivory/forest/copper surround. The three existing groups are sequential editorial chapters on both desktop and phone; the navigation remains stable throughout.

| Chapter | Default IH. collection | Authentic reveal |
| --- | --- | --- |
| Research & practice | Paired, asymmetrical scholarly folios; drafting dividers and geometric instruments; forest serif type, numbered copper folios and ivory space. | Advisor's navy methodology interface beside QST's quantitative-learning interface and language identities. |
| Reading & outdoors | Four illustrated catalogue entries in a two-column desktop arrangement: fish, pine, engraved books and a centered compass/contour study. | Three authentic publication mastheads and archival covers across the desktop shelf; the original navy Rupert Atlas follows at full width. Individual reveals keep the surrounding collection entries. |
| Personal website | An architectural study beside large academic typography and the existing professional description/affiliation; stacked deliberately on phone. | The established scholarly-blue portfolio, research interests and Research/Academic CV links. |

All seven [SVG illustrations](assets/illustrations/README.md) are unchanged and belong to the collection faces. They disappear when their corresponding authentic face appears. Authentic artwork is absent from the initial visible collection. The architecture study is original, not a named campus landmark.

Switches replace one layout with the other, then position and focus the stable work or chapter wrapper. A short incoming-face fade is disabled with reduced motion; there is no simultaneous interactive overlay or animated height. Complete chapter reveals receive their original surrounding palette; partial reveals retain IH. surroundings for the unrevealed siblings. These are genuinely different layouts, so final Safari scroll timing and responsive composition require physical review.

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
