# Review the desk. editorial refinement and final identity

PR #4 stays draft and undeployed. This pass completes the broader visual refinement and uses the exact supplied final IH. image. Review the 15-inch MacBook Air and iPhone portrait compositions in both appearances; source tests and asset proofs are not browser acceptance.

## Refresh a downloaded ZIP

1. Stop the old Python server with **Control-C** in its Terminal window.
2. Download the updated branch: https://github.com/iainholmes/iainholmes.github.io/archive/refs/heads/desk/foundation-20261010.zip
3. Extract it into a fresh folder. Keep the old copy separate so files from different revisions cannot mix.
4. In Terminal, type `cd ` (including the space), drag the newly extracted repository folder from Finder into Terminal, and press Return. This must be the folder containing both the root `index.html` and the `desk` directory.
5. Run:

```sh
python3 -m http.server 8000 --bind 0.0.0.0
```

Open http://localhost:8000/desk/ in Safari and Chrome. Reload without cache: Option-Command-R in Safari; Shift-Command-R in Chrome. The current version has the supplied **uncircled IH.** on a light paper mount at upper right, numbered section headings with fine rules, and the original copper-period image in the footer. A circular logo indicates an obsolete copy.

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
4. Reload the iPhone page after replacing the files. If an old copy persists, close that local-preview tab and reopen `http://MAC_IP:8000/desk/?review=final-identity`. Open the page in Safari rather than an older Home Screen shortcut.
5. If the Mac asks whether Python can accept incoming connections, allow it for this local review. If the address command returns nothing, use the Mac's Wi-Fi IP address shown in System Settings.
6. Keep the Mac awake and the server running. Stop the server with Control-C when finished.

No build, package installation or application credentials are needed. The direct destination links intentionally open the existing public applications; use Back to return to Desk.

## Review checks

- **Exact identity:** Compare `/desk/assets/identity/ih-master.png` with your supplied original, then `/desk/assets/identity/ih-signature.png` at native size. The crop must preserve both initials, the H crossbar extension, period placement, colors and Rupert/loblolly detail. There is no circular enclosure, alternate lettering or simplified mobile mark.
- **Desktop opening:** Check the balance of the italic desk. wordmark, Dunhill Oblique introduction and light-mounted personal signature at normal zoom on the 15-inch MacBook Air. Inspect the quiet vertical division and the breathing room before navigation.
- **iPhone opening:** The wordmark and signature share the first row; the introduction occupies its own full-width row below. Check portrait, enlarged text, and 320–430 CSS-pixel widths for overlap or sideways scrolling. The complete image must remain visible. The tiny header scene is inherently miniature; the footer shows it more clearly.
- **Collection:** Check numbered section headings, fine rules, column spacing, the original publication covers and the cream-mounted Rupert plate. Advisor, QST, each publication and the academic profile should retain their identities. At narrow widths the desktop divider disappears; the groups remain clearly separated by spacing.
- **Footer:** The original copper period should sit between equal rules, above the utility row. The closing phrase is centered on desktop and omitted on phone as before. Back-to-top and installation help must remain comfortably usable, with no overlap or safe-area clipping.
- **Day/night:** Both themes must show the exact same green/copper logo on its light mount. Switch manually, scroll and reload; the accepted Eastern schedule and visit-only override remain unchanged. Inspect text contrast, focus outlines and night panel colors.
- **Navigation/accessibility:** Exercise all three section links, especially Personal website, plus direct fragments and Back. Headings should still arrive 12px beneath the sticky toolbar. Tab/Enter through the page and use VoiceOver: the header image is named once; the footer ornament is skipped. Check every optional introduction and a direct application link.

No build or dependency installation is needed to review the committed site. Report any defect with browser/device, viewport or zoom setting, and a screenshot. The supported managed browser remains unavailable; no substitute preview or deployment was used.
