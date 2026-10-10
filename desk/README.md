# Desk.

A self-contained organizational home at `https://iainholmes.github.io/desk/`.

## Architecture

`index.html` is generated from `projects.json` by a dependency-free Node script. It is committed so the existing GitHub Pages/Jekyll pipeline can serve it directly. No root configuration, app files or publishing jobs need to change. All Desk assets and tools stay under this directory.

The rendered page needs **no JavaScript**, external services, packages or requests to application data. Native links, anchor navigation and a native disclosure provide the interactions. Desk does not read cookies, local storage, session storage, Field Log content or credentials. There is no service worker or offline claim. The manifest and icons support adding this route to a Home Screen; physical-device installation still needs validation.

## Maintain

1. Edit `projects.json` for destinations, descriptions and links.
2. Run `node desk/_tools/build.mjs` from the repository root.
3. Run `python desk/_tools/validate.py --online`.
4. Review browser rendering at laptop and iPhone portrait dimensions before publishing.

The five initial identities use purpose-specific templates. An additional project can use a new ID, an existing group (`research`, `reading`, `profile`) and `presentation: "standard"` for the built-in text treatment. No empty future sections are shown.

Stable home routes open current content in each application. No edition numbers, recommendation state, personal progress, release times or synchronized feeds are duplicated here.

## Discovery — 10 October 2026

| Destination | Source repository | Verified route | Representation |
| --- | --- | --- | --- |
| Personal Website | `iainholmes/iainholmes.github.io`, `master` | `/` | Cormorant name treatment and the portfolio's navy; direct research and academic CV anchors |
| Econometric Advisor | `iainholmes/econometric-advisor`, `main` | `/econometric-advisor/` | Instrument Sans, navy palette, original landing mark, research-design purpose |
| QST | `iainholmes/quant-skills-trainer`, `main` | `/quant-skills-trainer/` | Atkinson typography, actual Python/R/Stata colors and Learn/Practice/Feedback sequence |
| Periodicals | Pages repository | `/personal-updates/` | Individual Field Brief, Loblolly & Logit and Workbook mastheads; direct publication links |
| The Rupert Atlas | Pages repository | `/rupert/` | VELENOR masthead, blue field and unaltered 4:5 Rupert editorial plate; Atlas and Field Log links |

Repository implementations and the five deployed interfaces were inspected read-only. QST's language strip describes available languages; it is not an embedded language switcher. The source applications retain all functionality and navigation.

## Assets

- `assets/rupert-river-plate.jpg`: byte-for-byte copy of `rupert/photos/rupert-plate-eno-ledge-800.jpg`. Original editorial artwork, 800 × 1000, shown uncropped; no claim that this is a newly selected recommendation.
- `assets/advisor-mark.svg`: exact static `<svg>` from the Econometric Advisor landing logo. Source commit recorded in `SOURCE-REVISIONS.json`.
- VELENOR and Ectros: exact existing user-supplied font assets from Atlas and Loblolly & Logit. Their original app provenance remains authoritative. Their usage here is restricted to the corresponding project names.
- Archivo: existing open-source font from the repository, used at normal width for Desk. Includes its OFL license.
- Instrument Sans, Atkinson Hyperlegible Next, Bodoni Moda, Fraunces, STIX Two Text and Cormorant Garamond: downloaded from Google Fonts, matching the corresponding original projects, losslessly packaged as WOFF and served locally. OFL license files are included.
- Desk's `D.` favicon is a new code-native SVG; PNGs are rasterizations of that vector for Home Screen compatibility.

## Release gate

Read `VERIFICATION.md` for the current verification and deployment status. A successful local build does not establish a live release.
