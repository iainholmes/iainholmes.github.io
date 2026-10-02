# Rupert Atlas closure verification — 2 October 2026

Branch: `atlas/final-closure-20261002`. Initial master was `ce4ea0719d6f89e1d552d3ce1898104a9eb9d1dd`. The later Periodicals Handbook and Workbook commits were integrated before publication; release baseline is `dd70aef109aee593b9d6f3307c4dd311e4fe5e13`. The release response records the final commit, master SHA, deployment run, and live verification.

The final scoped change contains 43 files, all under `/rupert/`, including canonical sources, generated HTML, portrait icons, focused tests, and excluded build/QA evidence. All root entries other than `rupert` must match the release baseline exactly. Edition JSON, publication statuses/timestamps, photos and their registry, places, access reviews, schemas, Field Log, routing providers, and the SVG favicon are unchanged. Periodicals and all unrelated areas retain current master's contents.

Publication remains **Tuesday · 7:00 AM ET** and **Thursday · 7:00 AM ET**. `assets/js/core/editions.js` defines the two expected instants using internal `07:00:00`; `assets/js/core/dates.js` defines `America/New_York` and the timezone conversion. `core/veil.js` supplies the explicit pending reader label `7:00 AM ET` to the shared renderer. Future This Week, Archive, and veil schedule labels use that label. There is no reader-facing `7:00 PM` or ambiguous `07:00` publication schedule. Existing outing-window times remain editorial data.

Main and compact mastheads use the recommendation Saturday: `October I · AUTUMN · 2026`, advancing I–V by Saturday's day in the month. Global surfaces follow the current/upcoming New York cycle; individual full editions retain their own cycle. The veil uses the separate annual `isoWeek(weekend.start).week` number. Its composite lockup is centered as one object: expressive bundled Magrebis `No. X`, a CSS vertical rule, and quieter Latin Modern Roman month/season/year. No. 40 corresponds to 3 October; No. 41 corresponds to 10 October.

The translucent graduated navy covers the entire requested route, masthead, dock and viewport. There is no redirect or visible enter/close instruction. Underlying body children are inert and scrolling is locked. Noninteractive veil clicks dismiss without clicking through; links remain usable. Escape dismisses, Tab and reverse Tab stay in the dialog, and focus and reading position return on dismissal. Motion reduction is honored by the absence of veil animation.

The veil evaluates the manifest, status and actual `published_at`, together with the New York phase. Monday and pre-publication Tuesday show two subdued current artworks and two linked prior publications. A genuine Tuesday publication at/after 7 AM removes it; a draft/delay does not. Wednesday starts a separate pre-Thursday phase, with published Tuesday in full color. A genuine Thursday publication removes it; a draft/delay keeps it eligible through Sunday. A future timestamp cannot publish early. Withdrawals and replacements retain truthful state and labels. Ordinary `selectCurrentPair` semantics are unchanged. Session dismissal keys combine cycle Saturday and preTuesday/preThursday phase, so the next phase and cycle can appear again.

All four recommendation tiles use real `photo_id` records and JPEG assets in the existing registry. The current and previous groups remain side by side, with two tiles in each group, including portrait. Pending art is recognizable but subdued and has no edition link. Available art is full color and linked. Required missing artwork fails build integrity; the runtime logs an integrity issue instead of fabricating artwork.

Upcoming Travel projects only the title and start date of the next genuinely future saved journey from the existing `rupert-travel-v1` backup schema. It links to the existing Saved Trips region. No region or placeholder appears without such a trip. Travel's Open/Save round-trip remains intact; its architecture and data schema are preserved. Test journeys exist only in browser QA contexts.

The footer calculates Saturday sunset, daylight and lunar phase locally at the existing public Franklin Street Chapel Hill reference, 35.913, −79.056. Solar calculations use the [NOAA fractional-year equations](https://gml.noaa.gov/grad/solcalc/solareqns.PDF); lunar coordinates/illumination adapt [SunCalc 1.9.0](https://github.com/mourner/suncalc/tree/v1.9.0), retaining its BSD-2-Clause license in `assets/js/core/SUNCALC-LICENSE.txt`. No private home location or network weather lookup enters the almanac. The Fetch game remains on full editions.

The portrait map popup is positioned below the measured controls/driving-card stack, leaving the right-side map controls clear. Closing it hides that card alone, preserving selected place, driving card and route geometry. The banner's Show on Map action and arbitrary default-place handler are removed. Real selected name/address are left aligned and wrap; empty and invalid selection clears stale banner/route state. Landscape's accepted treatment is preserved. Local portrait grid metrics align 01/02 and both day-choice labels. This Week Dunhill titles use 1.3 line height in portrait. Full-edition main titles now use the bundled secondary Dunhill face, at 1.26 in portrait and 1.2 elsewhere. Wording, colors, and unrelated title roles are preserved.

The PWA portrait is cropped/resampled/padded from the exact supplied red-background Rupert image, with no image generation. Source SHA256: `e4de7befefc21049cc956adf53ec783e225e1f5567a1361295559a71fccc2715`. The script requires that exact source. A 1024-square master is in `_tools/rupert-portrait-master.png`; public exports are `apple-touch-icon.png` 180×180, `icon-192.png` 192×192, `icon-512.png` 512×512, `maskable-192.png` 192×192, and `maskable-512.png` 512×512. Maskable padding keeps face, ears, tongue and collar in the central safe region. Every generated HTML Apple icon reference and every manifest icon reference has the portrait content version `50ef87cec10b`. Manifest identity, scope, standalone display, navy colors and SVG favicon are preserved. Existing installed iOS icons can retain a platform cache; removal/re-addition may be necessary, and was not tested on a physical phone.

## Verification

Commands run from `rupert/`:

```sh
node _tools/rupert.mjs build
npm test
node _tools/rupert.mjs check
node _tools/rupert.mjs audit --history
ATLAS_QA_CHROME=/path/to/chromium node _tools/closure-browser-test.mjs
git diff --check
```

Build is idempotent. All 201 existing assertions and 80 focused closure assertions pass: **281 regressions**. Validation/schema checks pass. Syntax checks pass for the new modules and browser harness. Privacy audit passes for 115 public files, 11.1 MB, including pixels-only icon PNG chunks and existing public-coordinate allowlists. The history audit is run on the committed branch before release to inspect all distinct registered photo blobs that its history would push. Source photo contents and all production data remain unchanged. No original upload, private address, home coordinate, private note, or local backup is committed or published.

The browser harness passes **635 assertions**, **40 rendered veil layouts**, and **9 requested routes**, using Chromium 153.0.8010.0. It checks coverage, all four real artworks, horizontal groups, centered lockup, visible footer, Travel omission/presence, image decoding, no veil/plate/document overflow, scroll locking, focus, child clicks, no click-through, phase/cycle dismissal, exact 7 AM boundaries and publication availability. It also verifies title metrics, map card separation and close-state retention, clean/invalid banner selection, Travel Open/Save, Fetch presence, and icon URLs/MIME. Mock clocks and publication/provider responses are isolated in the QA harness and do not alter production JSON.

| Viewport | Mon / Wed, no Travel / saved Travel | Result |
|---|---|---|
| 375 × 812 | 4 cases | Fits one viewport |
| 390 × 844 | 4 cases | Fits one viewport |
| 393 × 852 | 4 cases | Fits one viewport |
| 402 × 874 | 4 cases | Fits one viewport |
| 430 × 932 | 4 cases | Fits one viewport |
| 852 × 393 | 4 cases | Fits one viewport |
| 844 × 390 | 4 cases | Fits one viewport |
| 768 × 1024 | 4 cases | Fits one viewport |
| 1024 × 768 | 4 cases | Fits one viewport |
| 1440 × 1000 | 4 cases | Fits one viewport |

Raw geometry, browser errors, provider diagnostics and inspected screenshots are in `closure-evidence/`. The direct provider probe creates a WebGL2 context, but external OpenFreeMap tiles fail to fetch in this environment. The popup and route-state tests therefore use deterministic provider/OSRM fixtures while executing the real application handlers. This is an environment limitation, not evidence of a production map failure. Chromium viewport emulation is actual rendering, but it is not native Safari/WebKit or a physical installed-iPhone test; those environments were unavailable.

Release must use a nonforced branch push and safe fast-forward of current master, verify the Pages workflow for that commit, compare deployed bytes to committed files, and rerun the browser harness against the live URL with its isolated clocks/fixtures. Stop after those checks.
