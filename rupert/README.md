# The Rupert Atlas

A self-contained static site under `/rupert/`. It shares nothing with the rest of the repository except the Jekyll copy step.

- `node _tools/rupert.mjs build` validates editions, places and photos, writes `data/editions/index.json`, and renders every page.
- `node _tools/test.mjs` tests edition selection (time zone, Tuesday/Thursday, rollover, DST, ISO weeks).
- Editions live in `data/editions/<ISO week>-<tue|thu>.json`. Tuesday and Thursday are two separate choices for the same weekend.
- Public photos only in `photos/`, listed in `data/photos.json`, metadata-free (the build fails otherwise).
- `data/site.json` → `review_clock` must be `null` before merging.

Nothing here is private. Anything committed under `/rupert/` is public once merged.
