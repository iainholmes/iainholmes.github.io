# The Rupert Atlas — UI/Visual Finishing release review

Authoritative baseline: master `f503c4e20b0324a0cce14863e138c22f9edbc81c`.
Review branch: `codex/the-atlas-finishing-2026-10-01`.
Final implementation: `0b67b4a2a31b5bf5658f1267604ee233bf12dbc0`.

## Resumption and scope

The interrupted branch already contained the typography, publication-history, recommendation-lifecycle, responsive-form and dated-access-evidence changes in commits 626f269, 1522595 and 097f93b. Those commits were preserved. The working files matched that branch; nothing had been published to master. The side-by-side Atlas screenshot represented the actual then-current implementation, not a temporary preview. This release replaces that superseded geometry. No source edition JSON, artwork or unrelated site files were changed. The Travel UX/Routing Rebuild was not started.

## Automated verification

`npm --prefix rupert test`: 111 passing checks — 36 general, 9 corrective publication, 12 replacement lifecycle, 40 history/cooldown/provenance and 14 camera-framing checks. No previous check was removed. The earlier count of 91 grew through six dated-evidence/event-window checks and fourteen camera-framing checks.

Build, check, public-file audit and `git diff --check` pass. The existing W41 training-mission and two approximate candidate-pin warnings remain. Those candidate places do not appear in the published-history Directory.

## Rendered review

The committed review build was rendered through the existing raw.githack browser preview when local preview access was unavailable. This Week, Atlas, Full Edition, Travel, Field Log and Archive were inspected at 1728×1117, 1366×900, 834×1112, 390×844 and 844×390: 30 section/viewport cases. All computed-font checks passed and none had horizontal page overflow. Field Log's expanded editor and the withdrawn edition were additionally checked at all five sizes. The full matrix was repeated after the Atlas viewport/blue-field and Field Log corrections; the final withdrawn-header correction was then checked at all five sizes.

Verified: self-hosted VELENOR/Latin Modern Roman; larger, coherent scale; navigation and wrapping; Tuesday's visible `Tuesday edition · 30 Sep` label with its actual `2026-09-30T17:40:00-04:00` timestamp; This Week's 3:2 art; natural For Rupert/Before You Go panel heights; Travel form alignment; Field Log editor heading clear of navigation; Archive filtering and Clear restoration; withdrawn notices and sources.

Atlas is banner → compact horizontal Place Directory/control surface → full-width map. The main Atlas page field computes to `rgb(29, 42, 58)` (#1D2A3A). Cream is confined to separate Directory cards, menus and the map surface. Desktop Directory height is approximately 140 px. Tablet/phone use a picker and expandable history, with two-column tablet and stacked phone history. Frame map and Home controls use nested/bounded menus outside the canvas, including Escape dismissal. Camera scopes fit bounds and preserve all markers, selection and publication history; they are not stored as filters. The 14 camera tests exercise this behavior.

The Directory contains only Riverwalk, Company Mill and withdrawn Cox Mountain. Every entry links to its published edition and contextual details; future/draft, contingency, Travel and unplanned personal entries remain excluded. Cox Mountain is clearly historical and withdrawn; its notice retains correction evidence and official sources. Its final heading uses the reading width rather than the ordinary edition's sidebar.

## Desktop workspace fit

Measurements after revealing the workspace below compact navigation (including the ordinary Show on Map action):

| Viewport | Directory height | Map width | Map height | Map bottom | Both edges visible |
|---|---:|---:|---:|---:|---|
| 1728×1117 | 140 px | 1489 px | 804 px | 1029 px | Yes |
| 1366×900 | 140 px | 1241 px | 648 px | 872 px | Yes |
| 1366×768 | 140 px | 1241 px | 527 px | 751 px | Yes |
| 1440×900 | 140 px | 1311 px | 648 px | 872 px | Yes |
| 1920×1080 | 140 px | 1489 px | 778 px | 1002 px | Yes |

The earlier 580 px minimum clipped the bottom on the shorter laptop. Desktop map height now uses the dynamic viewport minus measured Directory, navigation and spacing, capped at the previous height. Taller representative screens retain their existing 804/648 px heights. The provider resizes with the canvas. Initial masthead/banner scrolling is distinct from normal map use: once the workspace is revealed, viewing the opposite edge does not require another page scroll.

## Verification limit

The connected cloud Chrome cannot create a WebGL context. Atlas and Travel therefore rendered their honest map-unavailable fallbacks. Container geometry, responsive fit, menus, selection, history and fallback presentation were visually checked; camera-bound behavior was checked with the actual framing module and a recording map adapter. GPU-rendered basemap pixels, live canvas pan/zoom and real-device touch gestures could not be visually reverified in this browser. This is an environment verification limit, not a claim that the basemap drew successfully.
