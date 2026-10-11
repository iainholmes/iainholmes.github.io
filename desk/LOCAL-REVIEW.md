# Review the IH. collection and authentic application reveals

PR #4 remains draft and undeployed. This revision replaces automatic scroll-driven chapter styling with separate IH. collection and authentic application presentations. Full browser acceptance has not occurred in Work.

## Refresh the existing Mac preview

Stop the old Python server with Control-C. Pull the existing checkout with any local edits saved:

```sh
git switch desk/foundation-20261010
git pull --ff-only origin desk/foundation-20261010
```

Alternatively, download and extract the updated [branch ZIP](https://github.com/iainholmes/iainholmes.github.io/archive/refs/heads/desk/foundation-20261010.zip).

In Terminal, `cd` to the repository folder containing the root index.html and desk directory. Start your established server:

```sh
python3 -m http.server 8000 --bind 0.0.0.0
```

Open [the local collection](http://localhost:8000/desk/?review=ih-collection) in Safari and Chrome with **no fragment after the URL**. Reload without cache with Option-Command-R in Safari or Shift-Command-R in Chrome. No package installation or build is required. Preserve local edits; if Git reports divergence, use the fresh ZIP instead of resetting them.

## iPhone

Keep the Mac awake and server running on the same Wi-Fi network. Find its Wi-Fi address using `ipconfig getifaddr en0` (or System Settings if empty). Open `http://MAC_IP:8000/desk/?review=ih-collection` in iPhone Safari, replacing MAC_IP. Use Safari rather than an older Home Screen shortcut. Allow Python's incoming local-network connection if macOS asks.

## Required before/after visual captures

Inspect on the 15-inch MacBook Air and iPhone portrait, in both Day and Night. Capture the default page before selecting anything, then each chapter before and after its TOC selection.

| Capture | Default collection must show | Revealed chapter must show |
| --- | --- | --- |
| Research | Forest/ivory scholarly folios, drafting dividers and geometric instruments. No navy Advisor or QST interface. | Original navy Advisor and distinct QST learning presentation; collection illustrations gone. |
| Reading | Four IH. catalogue entries: fish, pine, books and compass. No original publication covers or navy Rupert panel. | Three original covers/mastheads, followed by navy Rupert Atlas with original Rupert artwork. |
| Personal | Architecture and forest academic typography. No existing blue portfolio panel. | Scholarly-blue portfolio, original information and research/CV links. |

The before/after compositions should be unmistakably different. Evaluate typography, negative space, proportions, illustration prominence and overall coherence as well as functionality. Exact IH. header artwork and quiet footer remain unchanged. No replacement tagline should appear.

## Interaction and accessibility checks

1. Scroll the untouched page from beginning to end. All seven works must stay in their IH. collection faces; no authentic panels should appear merely by scrolling.
2. Select each TOC destination. Only that chapter reveals, its heading lands 12px below the sticky bar, and unrelated chapters return to their collection. Test the bottommost Personal Website destination and rapid consecutive selections.
3. Reveal individual works. Only that work changes; open siblings in the same chapter remain open. Revealing a work in another chapter closes the prior chapter. Open website navigates externally, separately from Reveal.
4. Use individual Return and Return chapter to collection. Focus should remain visible on a stable destination and controls should remain reachable. Scroll around an open chapter; it must remain open. Returning to the very top restores all collection faces.
5. Test `#research`, `#reading`, `#profile` and an individual route such as `#work-field-brief`. Use Back/Forward through chapter, individual and return actions; exact selections should restore without duplicate entries or intermediate flashing. Direct `#collection` opens the collection.
6. Switch Day/Night in each state. Selected works must not change. Reload to reevaluate Eastern time. The exact IH. image retains its original colors/light mount throughout.
7. Tab through the page and use Enter/Space on controls. Hidden faces must expose no focusable links; VoiceOver should announce Reveal/Return and expanded state. Test Reduce Motion, increased text size, narrow portrait widths and Safari controls for overlap, clipping or unexpected scrolling.
8. Check original artwork is uncropped, application/deep links work, and all five optional disclosures remain available when relevant. Confirm Home Screen help and footer. Repeated bottom-section navigation should not accumulate blank space.

Report discrepancies with browser/device, viewport or text-size setting, and before/after screenshots. Source and simulated-DOM tests do not establish visual or physical-device acceptance.
