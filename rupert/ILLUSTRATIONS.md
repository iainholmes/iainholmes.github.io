# Illustration policy

A suggestion is one Tuesday or one Thursday recommendation. Each has one Full Edition, one Archive entry, one completion path and one **newly generated finished illustration**. Closer, bigger-day and alternative contingencies are subordinate fallbacks, not additional suggestions; they do not receive artwork or Archive entries. Repeat visits still receive new art. Never choose from a stock collection or reuse a previous finished illustration for a new suggestion. Its original edition, This Week display and Archive thumbnail may display the same asset because those are presentations of the same suggestion.

## Art direction

**Earlier rejected proposals from this chat remain excluded. On 30 September 2026 the user approved one specific illustration: the seated Rupert in a mustard collar on a sparse oxblood field, imported as `rupert-cox-mountain-2026-w40-tue`. That image may appear in the current Tuesday recommendation, its Full Edition and its Archive card. This exception does not authorize the other rejected proposals or reuse for another recommendation. Existing archive prints remain.**

The new direction uses the user's red-background references for style only: modern graphic screen-print / photocopy / coarse halftone, strong silhouette, large flat color field, very reduced environmental detail and generous negative space. Use 3–5 colors from oxblood, cream, deep navy, chocolate and mustard, varying composition, viewpoint, dog pose, cropping and dominant balance. Recognizable Rupert, never realistic Rupert. No glossy fur, photorealistic eyes, realistic shading, coat sheen, detailed anatomy, cinematic lighting, dense landscapes or faux-aging. Keep warm chocolate identity, floppy ears and mustard collar; use real photos only for identity.

One coherent scene, never a collage, contact sheet, multi-panel image or repeated depictions of the same dog. Use 3–5 colors, a large flat field, strong silhouette, coarse photocopy/screen-print texture, sparse environment and substantial negative space. Recognizable Rupert, never realistic Rupert: no glossy fur, photorealistic eyes, coat sheen, detailed anatomy or cinematic lighting. Default exactly one Rupert. Companions appear only when thematically appropriate and deliberately chosen, each once:

- Rupert: lean chocolate American Labrador, long muzzle, floppy ears, mustard-orange collar.
- Bosch: stockier chocolate English Labrador, broader head, light-blue collar.
- Tilli: smaller Tennessee Treeing Brindle, brindled coat, red collar.

Use real supplied photos for identity. Stylized references are for art direction only. Do not publish originals, camera filenames, GPS, or private reference paths. Generated art is labelled **Illustration**. Completed outings in Field Log use real photographs.

## Publishing a new suggestion

1. Write two concise `panels` (`label`, `text`) based on the suggestion's verified conditions and characteristics. Use factual, practical labels and copy. A season is suitability, not proof of a forecast. Capture the chosen wording in the edition so it stays faithful in the Archive.
2. Set `artwork` with a fresh `image_id`, specific scene `brief`, and `characters` (normally `["rupert"]`). Generate one artwork for the main recommendation using the built-in image tool. `node rupert/_tools/illustration.mjs EDITION_ID ROLE` prints its individual brief; it does not call a paid API or silently create art at page load.
3. Inspect the finished artwork for likeness, collar, dog count, restrained background, composition and distinction from recent editions. Earlier rejected proposals remain excluded; the specific approved exception above is assigned only to its own recommendation.
4. Import the finished artwork through the existing `photo` pipeline as `--kind plate --provenance editorial`, with meaningful alt text and an `Illustration` caption. The pipeline creates responsive JPEGs from pixels and strips metadata. Set registry `generation` to `{ "owner": "EDITION_ID/ROLE", "created_at": "YYYY-MM-DD", "style_version": "atlas-graphic-2" }`.
5. Build/check/test/privacy audit. New edition checks require a separate assigned plate and two frozen panels for the main recommendation. Registry owner, duplicate IDs/filenames and identical asset hashes are checked. These guards cannot determine artistic originality: visual review and a new generation are still required.

The four existing W40/W41 records are legacy prepared editions. The current W40 Tuesday illustration is replaced by the specific approved exception above; the other legacy records retain their existing artwork. New records cannot use that legacy exemption. Do not add IDs to the exemption to bypass the illustration requirement.

## Travel postcards

Each journey can hold one newly made illustration and caption, stored only in the browser, with no automatic destination claim. Add a JPEG/PNG/WebP postcard to the plan; it is resized, re-encoded and included in the journey backup. Use a fresh image for each new journey, then keep real photos in Field Log. The website does not generate images from private itinerary details or transmit them to an image service.

## Full Edition fetch

Only Full Edition pages load the fetch script. A tiny fixed dock holds a muted tennis-green ball; click/tap or keyboard activation starts one throw → six-pose chase → brief exit → return carrying the ball → drop at the dock. No automatic triggers and no rare alternate behaviors enabled. Repeated presses during a loop are ignored. Escape, page hiding, resize or a changed motion preference resets the dock. Reduced motion uses a static response and live status text.
