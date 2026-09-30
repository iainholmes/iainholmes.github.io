# Periodicals on iPhone

This pass covers the Periodicals shelf, Field Brief, Loblolly & Logit, The Workbook, Commonplace and Handbook. The Rupert Atlas remains its separate existing product. All publication content, artwork and typefaces are retained.

- One Periodicals manifest and opaque PNG Home Screen icons derived from the existing books/spines favicon. Installation starts at the shelf, with root scope allowing its sibling publication routes to stay in the installed experience.
- Default iOS status-bar treatment; page theme colour follows the current reading mode. No device-specific splash-image collection: launch uses manifest background and native browser startup behavior.
- Safe-area insets, stable page minimum height, dynamic overlay heights, landscape side insets, bottom clearance and scroll offsets.
- Text-only phone reading controls with at least 44px touch targets; native archive controls remain available. Narrow reading typography, captions and inputs tuned; Workbook ledger overflow contained.
- Keyboard-accessible image viewer, original captions, fit/2× zoom, native pinch gesture permitted, scrolling for zoomed images, Close/Escape and a downward gesture on the viewer header. Underlying reading position and focus restored on close.
- Browser-local Continue Reading for an edition and vertical position. The Workbook retains its existing question/answer persistence. Entries are only saved after meaningful scrolling; no automatic jump on return.
- Native Web Share API with copy-link fallback and explicit failure feedback.
- Horizontal edition swipe confined to the bottom controls, single-finger, 70px minimum, horizontal-dominance and duration checks. No reading-surface interception or preventDefault.
- Local Unread labels in publication indexes; opening an edition marks it seen. New editions naturally appear unread. No operating-system badge, account synchronization or notifications.

## Deferred

Offline shell/current/recent-edition caching is intentionally deferred. These publication HTML files embed their entire archive, so caching a visited document would also cache every historical edition. Proper bounded offline reading needs an edition-specific publishing/output strategy; a root service worker would also affect the unrelated personal website. No service worker is registered by this pass.

## Validation

Manually inspected desktop at 1280×900; phone at 393×852 and reduced 393×700 height; compact 320×568; landscape 852×393. All three publication pages, shelf, Handbook and Commonplace checked. Workbook ledger overflow found and repaired at 320px. Checked index navigation, previous/next editions, disabled boundaries, long-form scrolling, Continue Reading after reload, image opening/closing, zoom and captions. Image viewer tracked the reduced 700px viewport. Simulated 59px top and 34px bottom safe areas with a temporary QA harness and visually checked control spacing.

Focused DOM tests passed for previous/next boundaries, edition routing, unread state updates, image clip-path reference rewriting, zoom/close and disabled browser storage. Embedded publication JSON compared byte-for-byte to origin/master and unchanged. JavaScript syntax and Git whitespace checks passed.

## Device verification still required

The desktop in-app browser is not iOS Safari. Safe-area values were simulated; actual Dynamic Island values, Safari toolbar collapse/expansion, native pinch and touch swipes, native share-sheet presentation, Add to Home Screen and standalone cold launch have not been verified on a physical iPhone. There is no claim that those device checks passed. iOS controls status-bar/launch presentation; browser storage can be cleared or evicted and is separate across some browsing/install contexts. Web Share requires a supporting secure context and user activation. Opening marks an edition seen, not fully read.

Reference behavior: https://webkit.org/blog/7929/designing-websites-for-iphone-x/ and https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API

## Publishing

Changes are prepared for review. The local repository's AGENTS.md says: “Prepare changes for review before publishing. Obtain explicit authorization before deploying or merging changes that update the live site.” Do not merge/deploy this branch until authorized; complete physical-iPhone checks before claiming full iOS validation.
