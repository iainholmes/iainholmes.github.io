# Real-iPhone QA: release candidate

**Build 2 (fixes the blank map).** The first build's map box collapsed to 0 px high on the page itself, so the map drew into nothing while the panel said "ready". "Ready" now means the map has actually drawn, and the panel shows the evidence.

GitHub Pages only publishes `master`, so the release-candidate branch isn't live anywhere. Test it by serving the branch from the Mac over your home Wi-Fi.

## Serve the branch

On the Mac, in Terminal:

```
cd ~/Documents/"GitHub Repositories"/iainholmes.github.io
git switch rupert/foundation
python3 -m http.server 8000 --bind 0.0.0.0
```

In a second Terminal window, get the Mac's address:

```
ipconfig getifaddr en0
```

This prints something like `192.168.1.23`.

On the iPhone, on the same Wi-Fi, open these in Safari:

- `http://<that address>:8000/rupert/`
- `http://<that address>:8000/rupert/atlas/?qa=1`

`?qa=1` shows a panel at the top of the Atlas page. Tap it to shrink it to two lines, and tap again to expand it. It updates every second.

| Line | What it tells you |
|---|---|
| `map:` | `ready` only once the map has drawn, then the time from page start. On failure it gives the reason: `tiles`, `timeout`, `style`, `size` (no room to draw), `blank` (loaded, nothing drawn), `lost` (graphics dropped), `nowebgl`, `offline` or `script`. |
| `relief · filter · theme` | Relief on or off, the active filter, and which palette the map uses. `(forced)` means `?theme=` is set. |
| `viewport · touch` | Screen size, pixel ratio, and whether the device reports touch |
| `last tap` | The last pin or register selection |
| `load event · drawn` | MapLibre's `load`, then the moment features were confirmed on screen, both from map creation, plus frames drawn |
| `container · canvas` | The map box's size and positioning, the canvas's on-screen size and its pixel (backing) size, and whether it's displayed |
| `webgl` | WebGL version, whether the context is lost, maximum texture size, and any lost or restored events |
| `source · tiles` | Whether the basemap source and all visible tiles have loaded, plus the zoom |
| `features drawn` | How many features are on screen, per layer |
| `controls · attribution` | The on-screen size and visibility of the zoom buttons and the attribution line |
| `errors` | The last few map errors, with times |

If anything fails, a screenshot of the expanded panel is the most useful thing to send.

Stop the server with Ctrl-C when you're done. It serves only this folder, and only while it's running.

## Checklist

Record pass or fail and a note for each.

### Atlas: map

1. **The map draws.** You can see the basemap, pins, the + and − buttons, and the attribution. The panel shows:
   - `map: ready` and a time. Note the time.
   - a container height of well over 0 (about 470 on a 390×844 phone)
   - `features drawn` above 0
   - `errors: none`
2. **Relief is off by default.** The panel shows `relief: false` and the Relief button isn't pressed. Turning it on shows shading, and the choice survives a reload.
3. **Gestures.**
   - One finger dragging on the map scrolls the page, and a "use two fingers" hint appears.
   - Two fingers pan and zoom the map.
   - Pinch zoom works, and the map doesn't rotate.
4. **Pin tap targets.**
   - Tap each pin slightly off-centre, about a fingertip away. It should still select, within a roughly 44 px box.
   - Where two pins are almost on top of each other (Occoneechee and the Riverwalk at the regional view), a tap zooms in on the pair instead of guessing. A second tap then selects.
5. **Map to register.** Tapping a pin opens a card at the foot of the map showing the name and status.
   - "See in the register" scrolls to that row, which is highlighted.
   - "Close" dismisses the card.
   - Tapping empty map clears the selection.
6. **Register to map.** "Show on map" on a row scrolls the map into view, centres it on the pin, and enlarges the pin.
7. **Filters.**
   - "Recommended" hides register-only places from both the list and the map.
   - "Walked" is disabled (0).
   - "All" restores everything.
8. **Attribution.** The OpenFreeMap / OpenMapTiles / OpenStreetMap line is readable at the bottom right and isn't hidden by the bottom navigation.

### Atlas: failure behaviour

9. Open `/rupert/atlas/?maptest=notiles&qa=1`. Within about a second the map area shrinks to a short strip with a plain message. The register is immediately usable, and there's no blank tall box.
10. Open `?maptest=offline&qa=1`, and separately turn on Airplane Mode and reload. Both should give the offline message with the register intact.
11. Open `?maptest=nowebgl&qa=1`. The WebGL message appears and the register is intact.
11a. Open `?maptest=nosize&qa=1`. This rebuilds the first build's bug on purpose. The panel shows `map: failed (size)`, the map area shows "The map couldn't be drawn on this screen", and the register is intact. It must never show `ready` with an empty box.

### Navigation and layout

12. **Bottom navigation.** The four sections are always visible, clear of the home indicator, and each target is easy to hit. The current section is marked by an ochre rule and darker text.
13. The top bar stays pinned. On This Week, the Tuesday/Thursday switcher stays pinned under it while scrolling.
14. **This Week.** The first screen shows the weekend, the switcher, title, summary and logistics, with the print arriving just below. Swiping across the print switches choices.
15. There is no sideways scroll on any page: This Week, both editions, Archive, Atlas, Travel, Field Log.
16. Text is comfortable at arm's length. Labels never feel smaller than about 13 px.
17. Rotate to landscape and back. The layout stays sane and the map resizes.
18. Dark mode (Settings → Display → Dark). Every page is readable, and the map uses the night palette (`theme: dark` in the panel).
    - Also open `?qa=1&theme=light` while the phone is in dark mode, and `?qa=1&theme=dark` in light mode. Both palettes should draw on the same phone.

## Report back

For each item: pass or fail, the iPhone model and iOS version, and a screenshot of anything that fails. The panel's "ready" time from item 1 is the one number worth recording.
