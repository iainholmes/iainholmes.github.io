# Illustration policy

A suggestion is one Tuesday or one Thursday recommendation. Each has one Full Edition, one Archive entry, one completion path and one **newly generated finished illustration**. Closer, bigger-day and alternative contingencies are subordinate fallbacks, not additional suggestions; they do not receive artwork or Archive entries. Repeat visits still receive new art. Never choose from a stock collection or reuse a previous finished illustration for a new suggestion. Its original edition, This Week display and Archive thumbnail may display the same asset because those are presentations of the same suggestion.

## Art direction

**Earlier rejected proposals from this chat remain excluded. On 30 September 2026 the user approved one specific illustration: the seated Rupert in a mustard collar on a sparse oxblood field, imported as `rupert-cox-mountain-2026-w40-tue`. That image may appear in the current Tuesday recommendation, its Full Edition and its Archive card. This exception does not authorize the other rejected proposals or reuse for another recommendation. Existing archive prints remain.**

The approved references define one vintage screen-print, woodcut and engraved-print family: strong chocolate Labrador shapes, fine cream carved lines and hatching, restrained palettes and subtle ink grain. Preserve this identity while varying composition. No glossy or photorealistic fur, cinematic light, cartoon aesthetics, sentimental copy, invented landmarks or excessive decoration. The site’s reading sheets stay clean; print grain belongs inside artwork only.

### Composition for future Tuesday and Thursday editions

Favor minimalist compositions most of the time. Choose deliberately rather than randomly:

- Minimal portraits against a solid burgundy/oxblood, ochre, olive, cream or navy field, with little or no scenery.
- Simple action: walking, running, swimming, carrying a tennis ball, investigating or resting, without elaborate staging.
- Cropped face, paws, profile, silhouette or other distinctive details. Preserve Rupert's likeness and keep essential features legible in This Week and Archive crops.
- Restrained environments with one or two meaningful landscape elements, generous negative space and a clear subject.
- Occasional elaborate woodland, mountain, river or destination-inspired prints only when the subject benefits from them. Use these sparingly so they feel special.

Before writing each new brief, visually review the latest six published illustrations (including withdrawn history), especially the immediately preceding Tuesday/Thursday pair. Compare pose, framing, subject scale, negative space, background treatment and dominant color. Record the intended differences in `artwork.brief`; do not rely on a generic instruction to “make it different.” Avoid repeatedly combining Rupert, mountains, water, trees and a circular sun. Vary composition within the established print family, not the illustration style. These instructions apply only to future artwork; existing published illustrations remain unchanged.

Exactly one Rupert by default: lean chocolate American Labrador, long muzzle, drop ears, mustard-orange collar. Companions appear only when deliberately chosen, each once: Bosch has a broader English Labrador head and light-blue collar; Tilli is a smaller Tennessee Treeing Brindle with a red collar. Banner dogs remain extremely simple outline vectors, a distinct functional use authorized in the refinement brief.

Use real supplied photos for identity. Stylized references are for art direction only. Do not publish originals, camera filenames, GPS, or private reference paths. Generated art is labelled **Illustration**. Completed outings in Field Log use real photographs.

## Publishing a new suggestion

1. Write two concise `panels` (`label`, `text`) based on the suggestion's verified conditions and characteristics. Use factual, practical labels and copy. A season is suitability, not proof of a forecast. Capture the chosen wording in the edition so it stays faithful in the Archive.
2. Set `artwork` with a fresh `image_id`, a specific composition `brief` following the review above, and `characters` (normally `["rupert"]`). Generate one artwork for the main recommendation using the built-in image tool. `node rupert/_tools/illustration.mjs EDITION_ID ROLE` lists recent published artwork to inspect and prints the individual brief; it does not call a paid API or silently create art at page load. Read this policy as well as the printed brief.
3. Inspect the finished artwork for likeness, collar, dog count, restrained background, composition and distinction from recent editions. Earlier rejected proposals remain excluded; the specific approved exception above is assigned only to its own recommendation.
4. Import the finished artwork through the existing `photo` pipeline as `--kind plate --provenance editorial`, with meaningful alt text and an `Illustration` caption. The pipeline creates responsive JPEGs from pixels and strips metadata. Set registry `generation` to `{ "owner": "EDITION_ID/ROLE", "created_at": "YYYY-MM-DD", "style_version": "atlas-engraved-3" }`.
5. Build/check/test/privacy audit. New edition checks require a separate assigned plate and two frozen panels for the main recommendation. Registry owner, duplicate IDs/filenames and identical asset hashes are checked. These guards cannot determine artistic originality: visual review and a new generation are still required.

The four existing W40/W41 records are legacy prepared editions. The current W40 Tuesday illustration is replaced by the specific approved exception above; the other legacy records retain their existing artwork. New records cannot use that legacy exemption. Do not add IDs to the exemption to bypass the illustration requirement.

## Travel postcards

Travel automatically makes a private canvas postcard when a journey is mapped or saved. A bundled engraved Rupert element in the approved print family is combined locally with origin, destination, mode, terrain cues and route marks. No private itinerary is sent to an image-generation service. The caption and composition are included in backup/restore. Optional “Replace Artwork” accepts a JPEG/PNG/WebP that is resized and re-encoded; “Use Automatic Artwork” restores local composition. The reusable Travel element is not reused as a finished recommendation illustration.

## Full Edition fetch

Only Full Edition pages load the fetch script. A tiny fixed dock holds a muted tennis-green ball; click/tap or keyboard activation starts one throw → six-pose chase → brief exit → return carrying the ball → drop at the dock. No automatic triggers and no rare alternate behaviors enabled. Repeated presses during a loop are ignored. Escape, page hiding, resize or a changed motion preference resets the dock. Reduced motion uses a static response and live status text.
