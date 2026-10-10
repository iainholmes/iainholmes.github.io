# desk. finishing-pass verification

## Status and scope

**Draft PR #4; not merged or deployed.** Branch: `desk/foundation-20261010`. The owner accepted the revised desktop and physical-iPhone composition at `a90259af14d6bbb85aa2b7ebe1c81beecf4bfc3f`, including application identities, canonical artwork and optional introductions. This finite pass implements the five approved corrections plus the explicitly requested lowercase italic `desk.` wordmark. All changes remain in `desk/`.

## Changes

1. Authentic self-hosted Latin Modern Roman Dunhill Regular/Oblique, weight 400, across interface copy; actual Archivo italic for the wordmark. Source/license notices and the full Latin Modern distribution location are included. Canonical artwork lettering is unchanged. Type sizes, line heights and narrow-screen spacing are recalibrated within the accepted layout.
2. A sticky toolbar at all widths; measured section positioning, keyboard focus transfer and sufficient bottom scroll space for Personal website. Native fragment links and history are retained.
3. Consistent outlined SVG northeast link icons, hidden from assistive technology and removed from the tab order.
4. Day/night appearance set before the stylesheet, with a native labeled toggle. Automatic defaults follow America/New_York (DST-aware), day 07:00–20:59, night 21:00–06:59. Manual selection exists only in memory for the current visit. Reload/new/restored visits reevaluate the clock. No browser storage or application data is accessed.
5. Original outlined italic desk. bookplate icon, matching d. favicon, opaque PNG variants and updated installation identity.

## Completed validation — 10 October 2026

- `node desk/_tools/build.mjs`: passed; HTML deterministically regenerates from the existing configuration and unchanged cover SVGs.
- `node --check desk/desk.js`: passed.
- `node --test desk/_tools/test-runtime.cjs`: **7 tests passed**. Covers standard/daylight time thresholds, spring/fall DST transitions, next-boundary scheduling, visit-only manual override, fresh/restored visits, all three section positions and focus transfer, repeated links without accumulating blank space, modifier clicks, direct section URLs and hash history. Navigation tests use a simulated DOM and geometry; they are not browser rendering tests.
- `python3 desk/_tools/validate.py --online`: **203 checks passed**, including all **12 distinct URLs returning HTTP 200** and both portfolio fragments resolving. Includes original artwork hashes and exact frozen cover bytes, font hashes and source copies, generated output, optional disclosure semantics, labels/IDs, SVG icons, PNG dimensions, script ordering and repository isolation.
- Source contrast review: **24 representative normal-text foreground/background pairs meet 4.5:1**, minimum **4.87:1**. Day/night copper accent and focus colors meet the applicable 3:1 threshold (4.38:1 and 7.50:1 against their page backgrounds). Canonical artwork colors are preserved.
- Font metadata and character coverage inspected: Dunhill faces are authentic Regular/Oblique, both weight 400; all interface characters are covered. Archivo is a genuine italic variable face at normal width, with real weight 650 selected. `font-synthesis:none` prevents artificial weight/style generation.
- All four PNG variants are opaque and correctly sized. The actual 512px icon and 32px favicon were rasterized and visually inspected as assets.
- `git diff --check`: passed. All candidate and complete PR paths must remain under `desk/`; no constituent application, publishing automation or unrelated file changes are included.

## Visual evidence and remaining review

The accepted foundation was physically inspected by the owner. **This finishing pass has not been browser-rendered by the agent.** Updated mobile wrapping, sticky navigation behavior, focus visibility, Safari/Chrome consistency, cold-load theme appearance, VoiceOver/touch and physical Home Screen behavior remain for the owner's established local review. Source checks and simulated-DOM tests do not establish physical-device or visual acceptance.

Work's managed Sites preview previously failed twice before application startup:

```text
bwrap: Can't mount proc on /newroot/proc: Operation not permitted
```

It was not retried. No new workspace, substitute preview infrastructure or deployment was used. Follow `LOCAL-REVIEW.md` to refresh the existing Mac/Python preview and open it from the iPhone on the same Wi-Fi network.

Do not merge or deploy in this pass. Any later integration into current master and GitHub Pages/public-route verification requires a separately authorized release after acceptance of these corrections.
