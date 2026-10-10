# Review the refined Desk. candidate

PR #4 stays draft. This review uses the local Mac preview already established by the owner. Do not merge or deploy until the revised candidate has been accepted on desktop and iPhone.

## Refresh a downloaded ZIP

1. Stop the old Python server with **Control-C** in its Terminal window.
2. Download the updated branch: https://github.com/iainholmes/iainholmes.github.io/archive/refs/heads/desk/foundation-20261010.zip
3. Extract it into a fresh folder. Keep the old copy separate so files from different revisions cannot mix.
4. In Terminal, type `cd ` (including the space), drag the newly extracted repository folder from Finder into Terminal, and press Return. This must be the folder containing both the root `index.html` and the `desk` directory.
5. Run:

```sh
python3 -m http.server 8000 --bind 0.0.0.0
```

Open http://localhost:8000/desk/ in Safari and Chrome. Reload without cache if a previous version appears: Option-Command-R in Safari; Shift-Command-R in Chrome. The refined version has three complete archival publication covers and an **Inside Advisor** disclosure.

If port 8000 is already in use, stop the existing preview server first. Keep this Terminal window running throughout the review.

## Refresh a Git checkout instead

From the existing repository folder, with your own local edits saved:

```sh
git switch desk/foundation-20261010
git pull --ff-only origin desk/foundation-20261010
python3 -m http.server 8000 --bind 0.0.0.0
```

Stop any previously running preview server before the last command. If Git reports local changes or a divergent branch, retain them and use the fresh ZIP procedure rather than resetting them.

## Physical iPhone

1. Connect the Mac and iPhone to the same Wi-Fi network.
2. In a second Mac Terminal window, get its Wi-Fi address:

```sh
ipconfig getifaddr en0
```

3. In iPhone Safari, open `http://MAC_IP:8000/desk/`, replacing `MAC_IP` with that address (for example, `http://192.168.1.25:8000/desk/`). Do not use `localhost` on the iPhone: that refers to the phone itself.
4. If the Mac asks whether Python can accept incoming connections, allow it for this local review. If the address command returns nothing, use the Mac's Wi-Fi IP address shown in System Settings.
5. Keep the Mac awake and the server running. Stop the server with Control-C when finished.

No build, package installation or application credentials are needed. The direct destination links intentionally open the existing public applications; use Back to return to Desk.

## Acceptance pass

- **MacBook Air, Safari and Chrome:** inspect at normal browser zoom, then a narrower window. Check the familiar wordmark/palette, overall balance, Advisor workflow, QST sequence, all three distinct publication identities, Atlas artwork and academic website treatment.
- **iPhone portrait:** inspect the complete page. Check readable type, compact publication rows, uncropped 4:5 Rupert illustration, working section navigation and no sideways scrolling. Check smaller portrait widths where available; source breakpoints also target 320, 375, 402 and 430 CSS pixels, but source rules alone do not establish visual acceptance.
- **Direct access:** open Advisor, QST, each publication, the Periodicals home, This Week, Atlas, Field Log, the personal website, Research and Academic CV. Nothing should require a disclosure first.
- **Optional context:** open and close Inside Advisor, Explore the learning path, Publication notes and A way into the Atlas. Content should expand in the page without covering another destination. The publication covers are explicitly archival selections; they link to the publication homes.
- **Keyboard:** Tab through the page; the skip link and every focused link/summary should be visible. Enter follows links; Enter or Space toggles disclosures. Collapsed content should not introduce hidden tab stops. With VoiceOver, check destination names and disclosure expanded/collapsed states.
- **Accessibility preferences:** check enlarged text/zoom, reduced motion, and comfortable tap targets. No interaction depends on hovering.

Please report the browser/device and include a full-page desktop screenshot plus iPhone screenshots of any problematic area. Report acceptance separately for desktop and iPhone. Home Screen installation metadata is retained; local HTTP review does not establish production installation behavior.
