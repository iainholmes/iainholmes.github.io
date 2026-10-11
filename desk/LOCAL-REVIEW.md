# Review the home-to-chapter desk. build

PR #4 remains draft and undeployed. This revision introduces three continuous editorial chapters and removes the introductory tagline. Full browser acceptance has not occurred in Work.

## Refresh the existing Mac preview

Stop the old Python server with Control-C. Either pull the existing checkout (with your local edits saved):

```sh
git switch desk/foundation-20261010
git pull --ff-only origin desk/foundation-20261010
```

Or download and extract a fresh copy of the updated branch ZIP:
https://github.com/iainholmes/iainholmes.github.io/archive/refs/heads/desk/foundation-20261010.zip

In Terminal, `cd` to the extracted repository folder containing the root index.html and desk directory. Start your established server:

```sh
python3 -m http.server 8000 --bind 0.0.0.0
```

Open http://localhost:8000/desk/?review=chapters in Safari and Chrome. Reload without cache with Option-Command-R in Safari or Shift-Command-R in Chrome. The header must show only desk. and the exact IH. logo, with no tagline. Research and Reading now follow one another vertically on desktop.

## iPhone

Use the same Wi-Fi network as the Mac. Find the Mac's Wi-Fi address with `ipconfig getifaddr en0` (or System Settings if that returns nothing). Open `http://MAC_IP:8000/desk/?review=chapters` in iPhone Safari, replacing MAC_IP with that address. Keep the Mac awake and its server running. Use Safari rather than an older Home Screen shortcut. If necessary allow Python's incoming local-network connection when macOS asks.

No package installation or build is needed. Preserve any local Git edits; if pull reports divergence, use the fresh ZIP instead of resetting them.

## Visual and interaction acceptance

1. **Home:** At the top, check warm ivory/forest/copper balance, unchanged lowercase italic wordmark and exact personal logo. There is no new tagline or splash screen. The applications remain on the same page.
2. **TOC:** Select each of the three options. The selected chapter should scroll smoothly into place beneath the sticky bar with 12px clearance. Its local atmosphere activates, and the current link is marked. Rapidly select another destination; the last choice should win. Interrupt scrolling with touch/wheel and verify ordinary scrolling takes over.
3. **Ordinary scrolling:** Move between all three chapters without clicking. Only one surrounding frame should be fully active. Return to the beginning; all chapter atmospheres should recede to the home state. Manual scrolling should not change the URL or move keyboard focus.
4. **Research:** Check the navy measured field, cream heading and shared instruments. Advisor and QST remain visually distinct, side by side on desktop and stacked on phone. Confirm methodology stages and Learn / Practice / Feedback remain readable.
5. **Reading:** Check paper margins, authentic mastheads and large complete covers. Fish, pine and books should be subordinate to the covers. The Atlas should continue the chapter naturally, with its original uncropped Rupert plate, navy and three usable destinations.
6. **Personal Website:** Check the scholarly blue setting, marginal arcade and academic information. On phone the architecture becomes a compact opening vignette. Research and CV links must remain immediate and readable.
7. **Appearance:** Repeat in day and night. Selecting or scrolling to a chapter must never change the selected appearance. Reload to reevaluate Eastern time. The exact IH. image keeps its original colors and light mount in every state.
8. **Navigation/accessibility:** Open direct #research, #reading and #profile URLs; test Back/Forward and back-to-top. Tab to TOC links, press Enter and check heading focus. Enable Reduce Motion: scrolling and chapter transitions should be immediate. Test enlarged text and narrow portrait widths for overflow or overlap. Decorative graphics should be ignored by VoiceOver.
9. **Preservation:** Exercise all five optional introductions, application links and Home Screen installation help. Check the last section can align beneath the bar without repeated clicks accumulating blank space.

Judge the complete editorial composition as well as the transition mechanics. Report issues with browser/device, viewport or text-size setting, and screenshots. Source and simulated-DOM tests do not establish final visual quality or physical-device acceptance.
