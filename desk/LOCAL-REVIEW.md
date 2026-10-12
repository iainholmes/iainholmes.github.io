# desk. — Final maintenance review (PR #9)

This guide applies to [draft PR #9](https://github.com/iainholmes/iainholmes.github.io/pull/9), implementing publication synchronization, iPhone Reveal/Return stabilization, and installation-help removal. It supersedes earlier PR #4 collection/identity review instructions. **Nothing is merged or deployed until approved.** Work's tests are not physical Safari acceptance.

## Refresh the existing Mac preview

Keep any unrelated local edits safe. In the existing repository checkout, stop the old preview server (Control-C), then:

```sh
git fetch origin
git switch desk/final-integration-20261012
git pull --ff-only origin desk/final-integration-20261012
python3 -m http.server 8000 --bind 0.0.0.0
```

If local changes block the switch or pull, do **not** reset or overwrite them; instead use the [branch ZIP](https://github.com/iainholmes/iainholmes.github.io/archive/refs/heads/desk/final-integration-20261012.zip) in a new folder, then run the server from that repository's root (the directory containing the top-level `index.html` and `desk/`). No package installation is needed.

Open `http://localhost:8000/desk/?review=maintenance-20261012` in Mac Safari and Chrome, without a hash fragment. Hard refresh (Option-Command-R in Safari, Shift-Command-R in Chrome).

For iPhone Safari, keep Mac and phone on the same Wi-Fi and leave the server running. Find the Mac's local address with `ipconfig getifaddr en0` (or System Settings) and open `http://MAC_IP:8000/desk/?review=maintenance-20261012`, replacing `MAC_IP`. Use Safari rather than a cached Home Screen shortcut. Approve the local network connection if prompted.

## Three acceptance checks

### 1. Genuine publication synchronization

Reveal the Periodicals chapter and each Field Brief, Workbook and Loblolly & Logit work. Confirm the date, number, title and cover match the latest *actually released* source edition; the reference snapshot from October 12 contains Field Brief 016, Workbook 010 and Loblolly & Logit 003. A successful live read should label the source **Published**, while a disconnected or unavailable source must retain a previously verified preview with **Last Verified**, not invent an edition. Check that each link opens the intended source.

Reveal The Rupert Atlas and inspect the latest legitimately released Tuesday and Thursday options and artwork. Unpublished current-week slots must stay pending, with the older recommendation clearly marked **Last Published · Current Release Pending** when online. No scheduled-only title, unreleased destination or illustration should appear. Disconnecting the local preview from its data sources must not falsely promote releases.

### 2. iPhone Reveal / Return

On iPhone portrait, Reveal and Return individual works across Research, Reading and Personal, including multiple siblings and the last work near the bottom of the page. Check that the relevant work stays comfortably in view rather than jumping to the page top or another chapter. Test Return Chapter, rapid successive taps, direct fragments (`#research`, `#reading`, `#profile`, `#work-field-brief`), Back/Forward, touch interruption during repositioning, and Reduce Motion. Repeat a smaller sample in landscape and on the Mac. Confirm accepted authentic reveals, accessibility labels, focus order and Day/Night compositions stay unchanged.

### 3. Footer and design preservation

The entire **“Keep desk. Close +”** installation-help disclosure and hidden instructions must be absent. There must be **no replacement**. Confirm the existing desk. wordmark, copper mark, **“Everything in its right place.”** quotation and attribution, spacing, illustrations, logos, appearance switch and chapter structure remain intact.

## Acceptance boundary

The PR reports 342 source/accessibility checks, 16 interaction tests and 7 publication tests passing; these do not substitute for the physical review above. Report any discrepancy with the device/browser, approximate viewport, steps and before/after screenshots. After acceptance, deploy the reviewed PR once and transition desk. to maintenance mode rather than opening new design work.
