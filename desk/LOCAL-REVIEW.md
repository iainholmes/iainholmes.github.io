# Review the desk. finishing pass

PR #4 stays draft. The owner has accepted the revised desktop and iPhone foundation. This review checks only the five finishing corrections and lowercase italic wordmark, using the established local Mac preview. Merging and deployment remain unauthorized.

## Refresh a downloaded ZIP

1. Stop the old Python server with **Control-C** in its Terminal window.
2. Download the updated branch: https://github.com/iainholmes/iainholmes.github.io/archive/refs/heads/desk/foundation-20261010.zip
3. Extract it into a fresh folder. Keep the old copy separate so files from different revisions cannot mix.
4. In Terminal, type `cd ` (including the space), drag the newly extracted repository folder from Finder into Terminal, and press Return. This must be the folder containing both the root `index.html` and the `desk` directory.
5. Run:

```sh
python3 -m http.server 8000 --bind 0.0.0.0
```

Open http://localhost:8000/desk/ in Safari and Chrome. Reload without cache if a previous version appears: Option-Command-R in Safari; Shift-Command-R in Chrome. The new version displays an italic lowercase **desk.** wordmark and a Day/Night button in the sticky navigation. If these are absent, the browser is showing an older copy.

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
4. Reload the iPhone page after replacing the files. If an old copy persists, close that local-preview tab and reopen `http://MAC_IP:8000/desk/?review=finishing`. Open the page in Safari rather than an older Home Screen shortcut.
5. If the Mac asks whether Python can accept incoming connections, allow it for this local review. If the address command returns nothing, use the Mac's Wi-Fi IP address shown in System Settings.
6. Keep the Mac awake and the server running. Stop the server with Control-C when finished.

No build, package installation or application credentials are needed. The direct destination links intentionally open the existing public applications; use Back to return to Desk.

## Finishing checks

- **Typography:** On the Mac in Safari and Chrome, check at normal zoom and a narrower window. On iPhone, check portrait, enlarged text and both appearances. All interface copy should use Dunhill, with a lowercase italic Archivo `desk.` wordmark. The three cover illustrations retain their original lettering. Look for clipping, crowded lines, sideways scrolling or unwanted heading wraps; the source rules cover 320, 375, 402 and 430 CSS pixels, but those rules are not visual acceptance.
- **Three section links:** Select Research & practice, Reading & outdoors, then Personal website. Each heading should sit just below the sticky bar with its opening content visible. Repeat from the bottom, after opening an introduction, and after rotating/resizing. On a wide desktop, Research and Reading naturally share a top row. Personal website must still reach the same clear position despite being the last section. Also open `/desk/#profile` directly and use Back after changing sections.
- **Day/night:** The control stays with the sticky navigation. Switch in both directions and continue scrolling/using introductions: your choice should remain for this visit. Reload: the page should return to day at 07:00–20:59 Eastern and night at 21:00–06:59 Eastern, independent of the device's local zone. Test cold loads for a wrong-theme flash. Automated runtime tests cover both daylight-saving transitions; no phone clock change is needed.
- **SVG links:** Compare the northeast marks in Safari and Chrome. They should share a consistent outline and never become colored emoji. Existing compact phone Atlas links retain their text-first layout.
- **Keyboard and touch:** Tab from the skip link through section links, appearance switch, destinations and disclosures. Enter on a section link moves focus into that section; subsequent Tab proceeds into its content. Enter/Space toggles the appearance button and native disclosures. Focus rings must stay visible in both appearances, and tapping should not require precision or hover. Check VoiceOver's button name and pressed state.
- **Home Screen identity:** Inspect the opaque 180px icon at `/desk/assets/apple-touch-icon.png` and the new favicon in the browser tab. If reviewing a local Home Screen shortcut, remove only that obsolete local-preview shortcut and add the refreshed local page again; do not remove the production shortcut. A local HTTP check does not establish production installation behavior. Production install verification waits for a separately authorized release.
- **Preservation:** Direct destinations and optional introductions remain available as before. The illustrations and publication covers should retain their accepted composition and colors, including in night appearance.

Report any correction-specific defect with its browser/device and a screenshot of the affected area. This is not a request to revisit the accepted overall design. No build, dependency installation, new preview service or Sites launch is needed.
