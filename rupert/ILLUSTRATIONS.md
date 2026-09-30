# Adventure imagined / adventure remembered

Each new Tuesday or Thursday edition contains four independent suggestions: flagship, Local Trail, Away Mission and Wildcard. Every new suggestion requires one **newly generated finished illustration**. Repeat visits still receive new art. Never choose from a stock collection or reuse a previous finished illustration for a new suggestion. Its original edition, This Week display and Archive thumbnail may display the same asset because those are presentations of the same suggestion.

## Art direction

**No image generated or displayed as a proposed illustration in this chat may ever be published on the site. All of those generation attempts are rejected, including the final Cox Mountain image. Cox Mountain retains its original archive photograph print. Artwork replacement is pending a future approved direction.** The target is edgy, visibly artistic printmaking: rough ink / deconstructed woodcut, warm chocolate and cream dog shapes, mustard collar, broad imperfect cuts and slightly broken contours. The cream-paper Cox Mountain draft is the closest composition reference, but its dog is too realistically modeled. Treat Rupert as an artistic interpretation: broad imperfect shapes, minimal facial/body modeling, loose expressive drawing; recognize him through his lean build, floppy ears, muzzle and collar rather than meticulous anatomy. Avoid realistic shading, dense precise fur, sculpted highlights or rigid engraving. Keep backgrounds predominantly flat with one or two small outing cues. Avoid scenic landscape wallpaper. Subtle paper grain rather than heavy speckling. Use a range of cream, navy, mustard, muted red, olive and dusty blue, varying dominant color, viewpoint, pose, framing and open space for each outing; no fixed repeating design.

One coherent scene, never a collage, contact sheet, multi-panel image or repeated depictions of the same dog. Default exactly one Rupert. Companions appear only when thematically appropriate and deliberately chosen, each once:

- Rupert: lean chocolate American Labrador, long muzzle, floppy ears, mustard-orange collar.
- Bosch: stockier chocolate English Labrador, broader head, light-blue collar.
- Tilli: smaller Tennessee Treeing Brindle, brindled coat, red collar.

Use real supplied photos for identity. Stylized references are for art direction only. Do not publish originals, camera filenames, GPS, or private reference paths. Generated art is labelled **Adventure imagined**. Completed outings in Field Log use real photographs: **Adventure remembered**.

## Publishing a new suggestion

1. Write two concise `panels` (`label`, `text`) based on the suggestion's verified conditions and characteristics. Practical conditions take priority over whimsical labels. A season is suitability, not proof of a forecast. Capture the chosen wording in the edition so it stays faithful in the Archive.
2. Set `artwork` with a fresh `image_id`, specific scene `brief`, and `characters` (normally `["rupert"]`). Generate one artwork per role using the built-in image tool. `node rupert/_tools/illustration.mjs EDITION_ID ROLE` prints its individual brief; it does not call a paid API or silently create art at page load.
3. Inspect the finished artwork for likeness, collar, dog count, restrained background, composition and distinction from recent editions. The images generated in this chat are permanently excluded. Do not reuse or publish them.
4. Import the finished artwork through the existing `photo` pipeline as `--kind plate --provenance editorial`, with meaningful alt text and an `Adventure imagined` caption. The pipeline creates responsive JPEGs from pixels and strips metadata. Set registry `generation` to `{ "owner": "EDITION_ID/ROLE", "created_at": "YYYY-MM-DD", "style_version": "atlas-woodcut-1" }`.
5. Build/check/test/privacy audit. New edition checks require a separate assigned plate and two frozen panels for each role. Registry owner, duplicate IDs/filenames and identical asset hashes are checked. These guards cannot determine artistic originality: visual review and a new generation are still required.

The four existing W40/W41 records are legacy prepared editions. Their existing artwork remains; no generated image from this chat is used. New records cannot use that legacy exemption. Do not add IDs to the exemption to bypass the illustration requirement.

## Travel postcards

Each journey can hold one newly made illustration and caption, stored only in the browser, with no automatic destination claim. Add a JPEG/PNG/WebP postcard to the plan; it is resized, re-encoded and included in the journey backup. Use a fresh image for each new journey, then keep real photos in Field Log. The website does not generate images from private itinerary details or transmit them to an image service.

## Full Edition fetch

Only Full Edition pages load the fetch script. A tiny fixed dock holds a muted tennis-green ball; click/tap or keyboard activation starts one throw → six-pose chase → brief exit → return carrying the ball → drop at the dock. No automatic triggers and no rare alternate behaviors enabled. Repeated presses during a loop are ignored. Escape, page hiding, resize or a changed motion preference resets the dock. Reduced motion uses a static response and live status text.
