# Desk. refinement verification

## Release status

**Draft; not deployed.** Continue PR #4 on `desk/foundation-20261010`. This refinement pass must not merge into master or publish. All implementation changes stay in `desk/`.

## Visual evidence and remaining gate

The owner reported that the initial candidate rendered successfully in Safari and Chrome on a 15-inch MacBook Air and accepted its wordmark, palette, typography and broad architectural composition. This is user-reported desktop review of the **initial candidate**, not visual acceptance of the refinement.

The managed Work preview failed twice before application startup:

```text
bwrap: Can't mount proc on /newroot/proc: Operation not permitted
```

No further recovery or launch attempts were made during the refinement. The owner explicitly selected their existing Mac/Python local preview as the acceptance workflow. See `LOCAL-REVIEW.md` for refresh and same-network iPhone instructions.

**The revised candidate has not been browser-rendered by the agent. Desktop acceptance and physical iPhone acceptance are pending.** Responsive rules, native disclosure semantics, focus styles and reserved artwork proportions are implementation measures, not proof of rendering or device behavior. Do not claim automated screenshots, touch checks, VoiceOver checks or Home Screen installation have passed.

## Source verification

- Existing build and static/source/navigation validation retained and rerun.
- All 12 distinct public destination URLs return HTTP 200; the portfolio's Research and Academic CV fragments resolve.
- Build reproduces committed HTML from configuration and local archival SVGs.
- Original Rupert plate and source fonts remain byte-identical. Advisor mark hash matches the original.
- Three publication cover SVGs are exact copies of frozen, dated archive entries, verified against `personal-updates/issue-mark-archive.js`; no artwork was generated, cropped or redrawn.
- New Instrument Serif font is self-hosted with its OFL license, retaining the Field Brief archive cover's original font family.
- Native disclosures are optional, initially closed and separate from direct navigation. No runtime JavaScript, embedded application sessions, storage access, polling, authentication or backend was added.
- Permanent schedules match `personal-updates/PUBLISHING.md`: Field Brief every day including weekends; Workbook weekdays; Loblolly & Logit Fridays. No current publication availability, recommendation state, progress or operational status is asserted.
- `git diff --check` and the source-isolation check must pass before updating the draft branch. Every PR path must start with `desk/`.

## After owner acceptance

Rerun the source checks if corrections are made. Once the owner accepts desktop and iPhone rendering and authorizes release, fetch current master, preserve concurrent work, and verify the entire PR diff remains within `desk/`. Integrate without a forced update under current repository protections, wait for GitHub Pages, and compare the public `/desk/` route and assets with the integrated commit. These release steps are not authorized during this refinement pass.
