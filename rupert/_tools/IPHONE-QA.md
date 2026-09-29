# Real-iPhone QA: release candidate

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

`?qa=1` shows a small panel at the top of the Atlas page with:
- the map state, and why it failed if it did
- time until the map was ready
- relief on or off, and the active filter
- viewport size and whether the device reports touch
- the last pin or register selection

Stop the server with Ctrl-C when you're done. It serves only this folder, and only while it's running.

## Checklist

Record pass or fail and a note for each.

### Atlas: map

1. The map loads. The panel shows `map: ready` and a time. Note the time.
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

### Navigation and layout

12. **Bottom navigation.** The four sections are always visible, clear of the home indicator, and each target is easy to hit. The current section is marked by an ochre rule and darker text.
13. The top bar stays pinned. On This Week, the Tuesday/Thursday switcher stays pinned under it while scrolling.
14. **This Week.** The first screen shows the weekend, the switcher, title, summary and logistics, with the print arriving just below. Swiping across the print switches choices.
15. There is no sideways scroll on any page: This Week, both editions, Archive, Atlas, Travel, Field Log.
16. Text is comfortable at arm's length. Labels never feel smaller than about 13 px.
17. Rotate to landscape and back. The layout stays sane and the map resizes.
18. Dark mode (Settings → Display → Dark). Every page is readable, and the map uses the night palette.

## Report back

For each item: pass or fail, the iPhone model and iOS version, and a screenshot of anything that fails. The panel's "ready" time from item 1 is the one number worth recording.
