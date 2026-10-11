# IH. — final supplied personal identity

The user-supplied **IH_personal logo(1).png** is the sole authoritative logo. It supersedes every earlier circle, vector approximation, letterform specification and night/small-format variant. **Do not redraw or recolor it.** IH. identifies the person; desk. identifies the collection.

## Files and exact preservation

| File | Purpose | Preparation |
| --- | --- | --- |
| `ih-master.png` | Unchanged source of record, 1254 × 1254 RGBA | Byte-for-byte copy of the upload. |
| `ih-signature.png` | Header, 466 × 438 RGBA | Integer crop `(400, 380, 866, 818)` of the master; surrounding whitespace only removed. |
| `ih-period.png` | Secondary footer signature, 60 × 60 RGBA | Integer crop `(780, 723, 840, 783)` of the original illustrated period. |

Crop coordinates use Pillow's left/top-inclusive, right/bottom-exclusive convention. Neither crop is resized, recolored, traced, sharpened or made transparent. Every RGBA pixel equals the corresponding original pixel. The primary crop preserves the complete I and H, the H's left-extending crossbar, their exact stagger, the copper period's position, and Rupert/loblolly illustration. The footer uses the original period rather than a recreated drawing.

Master SHA-256: `7e2dabb7244b44c8a582792f59ff3cb1fa0eb8e911a8a4e7c249d68c5ba0c619`. All asset hashes and crop rectangles are recorded in `../../SOURCE-REVISIONS.json`. Superseded SVGs and their generator were removed so they cannot accidentally be served as canonical assets. Git history retains them only as historical work.

## Presentation

The same header image is served at every width and in both appearances. A warm archival-paper mount, fine copper outer rule, inset paper rule and forest-gray inner window accommodate the original light background. At night the mount remains deliberately light. These are surrounding HTML/CSS elements, never alterations to the artwork. Never use filters, blend modes, artificial outlines, color inversion or a replacement font. Do not add a circular enclosure to the final mark.

Mount widths are 156px above a 1000px viewport, 144px at 601–1000px, 122px at 371–600px and 112px at 370px and below. Outer and inner padding/borders preserve the previous image widths exactly: 126, 114, 98 and 88 CSS pixels respectively. The 466px source crop supplies over 3× native resolution even at the largest header size. The header period remains part of the complete image; it is never separately resized or repositioned.

The footer period crop displays at 32px between equal rules with 18px gaps. Its round white surrounding margin accommodates the original light background; clipping removes only the square crop's outer white corners, not the copper disc. The copper disc itself is approximately 29px across, from 54 source pixels. This gives roughly 1.9 source pixels per displayed CSS pixel; higher-density screens will interpolate. Do not invent extra detail to disguise that limit. A higher-resolution original would be required for sharper large exports.

At header sizes the period is approximately 10–15 CSS pixels across. Its complete illustration is retained, but tiny details are naturally difficult to distinguish at normal viewing distance. The larger footer impression makes the scene easier to examine.

The header image has one descriptive alt text and no added interaction. The footer repetition is decorative (`alt=""`, `aria-hidden="true"`). The existing desk. Home Screen icon, favicon and italic wordmark are unchanged.

The original [chapter illustrations](../chapter-signatures/README.md) have been restored without canonical-logo composites. Three separately authorized [secondary IH. monograms](../monograms/README.md) use newly designed letterforms and integrated subjects elsewhere in the collection. They do not replace, imitate pixel-for-pixel or modify this canonical header identity. The footer attribution identifies Thom Yorke as Radiohead’s vocalist through its tooltip and accessible text; it makes no sole-songwriter credit claim.

## Maintenance

```sh
python3 desk/_tools/prepare-identity.py
node desk/_tools/build.mjs
python3 desk/_tools/validate.py --online
node --test desk/_tools/test-runtime.cjs
```

Pillow is needed only for crop preparation/validation, not for serving the site. The validator verifies the immutable master hash and exact crop pixel equality. No future cross-site integration is authorized by this document.
