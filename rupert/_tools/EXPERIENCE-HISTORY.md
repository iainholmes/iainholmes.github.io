# Experience history

Personal history and editorial status are independent. A visit never releases a draft, removes a withdrawal, or completes every recommendation at that place. Published records, timestamps, URLs and editorial snapshots are unchanged.

## Browser-local records

The existing `rupert-field-log-v1` localStorage key is retained. Full JSON backups now have `version: 2`; version 1 imports remain supported. Photos, dates, activity text, notes, tags, prompts and original edition references are preserved. Nothing is written merely by opening a page or resolving an old record.

New association fields are `place_id`, `experience_id` and `history_kind` (`visit`, `completed`, `unclassified`). The existing `experience` field remains an activity tag, **not** a canonical identity. Stable experience identity is the explicit editorial `experience_id`, or the historical route ID without its `@version` suffix; the place ID is always part of the composite key.

Legacy memories resolve to a place only through an exact, unique place name or a consistent released-edition reference. Conflicting/ambiguous associations remain unassociated. A legacy `planned` source or an edition reference alone does not prove completion. Use **Edit Memory** to associate the place and classify the record. A saved manual association (including **Not associated**) is respected; the private `association_manual` flag prevents a deliberately removed link from being inferred again. For an earlier Occoneechee visit that did not complete October 6's loop, choose **Place visited**; leave the original activity, date, notes and photographs intact.

Choose **Specific outing completed** only for an actual completed outing, then select the published edition or a registered route without an edition. A visit before an edition's release can establish that experience was done, but cannot complete that future edition. Future-dated entries do not count as observed visits. Corrections and deletions update page indicators; other tabs refresh through storage events, and resumed pages reread local history. An open Field Log edit is retained rather than overwritten by another tab. Saving preserves other newly added memories; if that same memory changed elsewhere, the editor asks you to cancel and reopen it instead of overwriting the newer correction.

- Map: ochre recommended/unvisited; existing forest-green check marker for visited recommended places; withdrawn places retain the red warning.
- Directory: editorial wording/edition links retained, with a small visit check. Counts and ordering remain editorial.
- Archive/Full Edition: **Outing completed** means that exact edition is linked. **Experience completed · edition not recorded** means its experience is known, without asserting completion of that edition. **Place visited · outing not completed** does not imply the itinerary was done.
- No valid stored history: ordinary browsing and publication continue. Unreadable storage is left intact and never treated as an invented completion.

## iPhone / MacBook portability

**Export backup** includes all memories and photographs. Transfer that file privately (for example AirDrop or Files), then use **Import backup** in the destination browser/PWA. Identical records are deduplicated by their existing IDs. When revisions or possible deletions are present, the import offers:

1. **Use backup revisions**: replace matching IDs and keep additional local memories.
2. **Keep existing versions**: add missing IDs while retaining matching local copies.
3. **Restore whole backup**: deliberately match the backup, including removing entries absent from it. Export the current copy first if it must be retained.

This is manual transfer, not automatic synchronization. Do not assume Safari, an installed PWA, Chrome and a MacBook share storage. Existing size limits remain 200 memories, three resized photos per entry, and 4 MB per backup.

## Opt-in editorial input

**Export recommendation history** is separate from the full backup. It deliberately constructs a minimal `rupert-recommendation-history` file containing only canonical place/experience/edition IDs and relevant calendar dates. It omits memory IDs, prose, tags, photographs, Home data and addresses. Unassociated entries are omitted. The button downloads a file; it makes no upload or telemetry request.

Supply this file privately to the editor's clone, either outside the repository or at ignored `rupert/_private/recommendation-history.json`. Never put it in public `data/`, an issue, a committed file or an Actions artifact. The public audit rejects a history export accidentally placed in public assets. `_private/` must remain ignored and untracked. There is no browser-to-publisher connection, and the publisher on GitHub cannot read iPhone storage.

```sh
node rupert/_tools/recommend.mjs CANDIDATES.json --at TIMESTAMP --history /private/path/rupert-recommendation-history.json
node rupert/_tools/publish.mjs release --history /private/path/rupert-recommendation-history.json
```

The ignored minimal file is an opt-in default if deliberately placed there. `--history` selects an explicit private file. Existing explicit `--log` usage can still read an old private full backup, but completion is never inferred from unclassified legacy records. The former implicit full-backup input is not used. No private history is rendered by the build or copied into public output.

## Recommendation decisions

Existing season/event eligibility, 180-day ordinary reuse and 120-day genuinely different-experience rules remain. An explicitly completed repeat uses the established 365-day cooldown. A place visit alone does not trigger it. A new title, new ID or minor wording change cannot earn the shorter cooldown for the same route/activity. A different route, activity, or comparable structured `experience_basis` plus an explicit ID and substantive `difference_note` is required. Basis fields (`activity_id`, `feature_id`, `format_id`) are stable, source-reviewed editorial identifiers, not synonyms created for a new title. When evidence of difference is insufficient, ordinary reuse rules apply rather than permanently excluding the place.

Ranking keeps suitability primary: up to 12 points for an unfamiliar/unpublished place, existing category-diversity adjustment, existing publication-recency penalty, and 60 points of penalty for a completed experience within a year (30 thereafter). A different experience at a familiar destination is not given that completion penalty. Ranking does not approve access, official-source evidence, weather, dog policy or artwork.

The guarded Tuesday/Thursday release checks completion-sensitive reuse **before** promoting due drafts, alongside all existing review gates. New private information never retroactively invalidates accepted historical editions. No private file means no personal adjustment. This is an editorial preparation/release mechanism, not autonomous content generation or a substitute for the publication-day safety/forecast review.
