# Review the desk. IH. integration

PR #4 stays draft. The owner has accepted the desktop/iPhone design, lowercase italic wordmark, typography, application representations, navigation and day/night system at `df8c942`. This review checks the new IH. monogram and header/footer integration using the established local Mac preview. Merging and deployment remain unauthorized.

## Refresh a downloaded ZIP

1. Stop the old Python server with **Control-C** in its Terminal window.
2. Download the updated branch: https://github.com/iainholmes/iainholmes.github.io/archive/refs/heads/desk/foundation-20261010.zip
3. Extract it into a fresh folder. Keep the old copy separate so files from different revisions cannot mix.
4. In Terminal, type `cd ` (including the space), drag the newly extracted repository folder from Finder into Terminal, and press Return. This must be the folder containing both the root `index.html` and the `desk` directory.
5. Run:

```sh
python3 -m http.server 8000 --bind 0.0.0.0
```

Open http://localhost:8000/desk/ in Safari and Chrome. Reload without cache if a previous version appears: Option-Command-R in Safari; Shift-Command-R in Chrome. The new version has a circular **IH.** mark at the upper right and a centered copper-period signature between two rules at the footer. If the old “A personal collection / Iain Holmes” text remains, the browser is showing an older copy.

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
4. Reload the iPhone page after replacing the files. If an old copy persists, close that local-preview tab and reopen `http://MAC_IP:8000/desk/?review=ih`. Open the page in Safari rather than an older Home Screen shortcut.
5. If the Mac asks whether Python can accept incoming connections, allow it for this local review. If the address command returns nothing, use the Mac's Wi-Fi IP address shown in System Settings.
6. Keep the Mac awake and the server running. Stop the server with Control-C when finished.

No build, package installation or application credentials are needed. The direct destination links intentionally open the existing public applications; use Back to return to Desk.

## IH. integration checks

- **Header:** At normal MacBook size in Safari and Chrome, the complete circular IH. should balance the existing italic desk. wordmark without competing with it. Both initials must remain distinct, the enclosure fine, and the copper period subordinate. The tiny dog/tree scene is ornamental at this size; inspect `/desk/assets/identity/ih-monogram.svg` enlarged to examine its geometry.
- **iPhone and transitions:** Review portrait at normal and enlarged text, then narrow/resize the Mac window. The mark changes to its strengthened small-format master at 1000px and below. Its solid copper period is intentional; it avoids unreadable miniature detail. Check clear space, crisp initials, alignment, no clipping and no sideways scrolling at 320–430 CSS-pixel widths. The accepted wordmark and introductory copy should retain their hierarchy.
- **Footer:** Scroll to the end. The 26px copper-period signature should sit centered between two equal, restrained rules, below the existing footer row. Check breathing room above the phone's bottom safe area. Back-to-top and “Keep desk. close” must remain usable; opening installation help must not collide with the signature.
- **Day/night:** Switch both ways and inspect the header and footer. Letters and enclosure should follow the page ink; the copper and cream silhouette should remain consistent. The established Eastern schedule and visit-only override are unchanged. Reload to recheck automatic appearance and absence of a wrong-theme flash.
- **Accessibility:** VoiceOver should announce the header once as “Iain Holmes — IH. personal monogram”; the repeated footer ornament should be skipped. Neither mark adds a tab stop or tiny touch target. Verify visible focus and comfortable touch use on the preserved footer controls and sticky appearance switch.
- **Preservation:** Quickly exercise all three section links, a direct destination, an optional introduction and back-to-top. Each selected section heading should remain below the sticky bar, including Personal website. Typography, canonical artwork, SVG link arrows and existing Home Screen/favicon assets are unchanged. No shortcut reinstallation is required for this pass.

Report any integration-specific defect with its browser/device and a screenshot of the affected area. The overall design remains accepted. No build, dependency installation, new preview service or Sites launch is needed. See `IDENTITY-INTEGRATION.md` for the separate read-only proposal; no cross-site visual changes are expected.
