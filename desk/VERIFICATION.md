# First release verification

## Deployment status

**Not deployed.** The implementation is on the dedicated `desk/foundation-20261010` branch. Master and existing applications remain unchanged.

## Completed

- Read-only discovery of all three repositories and all five deployed application interfaces.
- Purpose, branding, artwork, routes and useful deep links derived from source implementations.
- Static generated page with no client JavaScript, data fetching, credentials or storage access.
- Self-contained font, illustration and icon assets; original Atlas artwork and original user-supplied fonts retained byte-for-byte.
- Desktop and mobile CSS compositions, safe-area rules, keyboard focus, skip navigation, reduced-motion rules and Home Screen metadata implemented.

- Automated source/structure checks passed; all 12 distinct application URLs and deep links returned HTTP 200, with portfolio anchor targets present.
- Final diff contains only new files under `desk/`; no source application or publishing configuration changed.

## Blocking verification

The managed preview supervisor failed before server startup:

```text
bwrap: Can't mount proc on /newroot/proc: Operation not permitted
```

Supervisor status then reported `Sites preview stopped`. This is an environment failure, not a confirmed application rendering defect. No screenshot or browser layout test of Desk has been completed. In particular, laptop proportions, mobile wrapping/overflow, touch targets, focus appearance, sticky navigation and physical iPhone Home Screen behavior must not be reported as verified.

The brief explicitly requires successful desktop and iPhone inspection before deployment, so production integration is held. Restore the supported preview environment, inspect at representative 1440/1710-pixel desktop and 375/402/430-pixel portrait widths (including 320-pixel reflow), fix any observed defects, then rerun the source checks before integration.

## Integration procedure

After the browser gate passes, fetch current master, preserve all concurrent work, and compare the complete change set. Every changed path must start with `desk/`. Use a pull request or a non-forced fast-forward under the repository's current protection rules. Wait for the GitHub Pages build and verify the live `/desk/` response and asset bytes against the integrated commit. Do not call the release complete until that production comparison succeeds.
