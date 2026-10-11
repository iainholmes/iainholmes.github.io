/** Canonical IH. geometry, optically redrawn from the approved reference. */
import { writeFile } from 'node:fs/promises';
const root = new URL('../assets/identity/', import.meta.url);
const copper = '#a45f35';
const paper = '#eeeee6';
// The reference has a raised I, lower H and a period aligned with H's baseline.
// Independent outlines preserve the narrow but deliberate gap between the initials.
const initialI = `M221 292H377V299C348 300 334 309 334 338V577C334 607 347 618 377 619V626H221V619C251 618 262 607 262 577V338C262 309 251 300 221 299Z`;
const initialH = `M351 409H486V416C460 418 452 426 452 456V566H584V456C584 426 576 418 544 416V409H689V416C655 418 648 426 648 456V689C648 719 655 727 689 729V737H544V729C576 727 584 719 584 689V579H452V689C452 719 460 727 486 729V737H351V729C383 727 388 719 388 689V456C388 426 383 418 351 416Z`;
// Compact outlines retain proportions; only the serif/hairline thickness is lifted.
const compactI = `M221 292H377V304C348 305 334 313 334 341V574C334 603 347 614 377 615V626H221V615C251 614 262 603 262 574V341C262 313 251 305 221 304Z`;
const compactH = `M351 409H486V421C460 423 452 431 452 460V565H584V460C584 431 576 423 544 421V409H689V421C655 423 648 431 648 460V686C648 715 655 723 689 725V737H544V725C576 723 584 715 584 686V582H452V686C452 715 460 723 486 725V737H351V725C383 723 388 715 388 686V460C388 431 383 423 351 421Z`;
// Seated haunch, rising chest, floppy ear, lifted muzzle, foreleg and resting tail.
// The dog is left of the tree; its upward gaze meets the lowest left bough.
const rupert = `M13 85C14 80 15 75 20 70C25 66 28 64 29 59L30 53C27 51 28 48 30 46C33 43 37 44 40 46L46 43Q48 42 48 45L44 49L40 50C38 54 37 57 37 63C37 67 36 70 37 75L39 86L44 87L44 90H35L32 77L30 71C27 71 25 74 26 77C29 78 30 82 29 86L32 88V90H14C10 90 7 88 7 85C9 87 11 87 13 85Z`;
const compactRupert = `M12 87C13 79 16 73 22 68C27 64 29 61 30 56V52C27 49 29 45 33 44C36 43 38 44 41 46L47 42L49 45L44 50L40 51C38 57 37 62 37 68L40 86L45 88V91H34L30 76C26 75 25 79 28 82L29 87L32 89V91H13C9 91 6 88 7 85C9 88 11 88 12 87Z`;
const trunk = `M64 2H66L67 64C67 77 68 89 71 100H60C63 89 63 77 63 64Z`;
// Six asymmetric branch tiers retain the reference's fine, irregular pine silhouette.
const boughs = `M65 3C64 9 62 13 58 15L60 16L59 17C62 17 64 16 65 14C67 17 70 18 73 17L71 16L72 15C68 12 66 8 65 3Z
M64 14C62 20 58 23 53 25L55 26L54 27L59 27L58 28C61 27 64 25 65 23C68 27 72 28 77 27L75 26L78 25C72 23 68 19 66 14Z
M64 24C60 30 55 33 48 35L51 36L50 37L55 36L54 38C59 36 62 35 65 32C68 35 71 37 75 37L74 36L80 38L79 36L83 36C75 33 70 29 66 24Z
M64 34C59 40 52 43 43 46L47 46L46 48L51 47L50 49C57 47 62 44 65 42C69 46 73 47 77 48L76 46L82 48L81 46L86 47C77 43 71 39 66 34Z
M64 44C58 51 49 54 40 56L43 57L42 59L47 57L46 60C53 58 60 55 65 52C70 56 75 58 80 59L78 56L84 58L82 56L88 57C79 53 72 49 66 44Z
M64 54C58 59 48 63 38 65L42 66L40 68L47 66L45 69C53 67 60 64 65 62C70 65 74 67 80 68L78 65L85 67L83 65L89 66C80 62 72 59 66 54Z`;
// More open negative space at header sizes; both silhouettes remain, never a plain dot.
const compactBoughs = `M65 3C63 11 60 15 55 18L60 19L65 16L71 20L75 18C70 14 67 9 65 3Z
M64 20C60 28 54 31 48 33L53 36L59 33L65 30L72 35L81 35C76 31 69 27 66 20Z
M64 34C58 42 50 45 43 47L48 50L56 47L64 43L73 49L85 49C77 44 70 40 66 34Z
M64 48C57 55 48 59 39 61L43 65L52 62L64 57L73 62L79 61L88 64C80 58 72 54 66 48Z`;
const ground = `M11 89C27 87 44 89 55 94C44 90 27 90 13 91Z`;
function period(id, compact = false) {
  return `<circle cx="50" cy="50" r="50" fill="${copper}"/>
  <defs><clipPath id="${id}"><circle cx="50" cy="50" r="50"/></clipPath></defs>
  <g clip-path="url(#${id})" fill="${paper}"><path data-part="pine" d="${trunk} ${compact ? compactBoughs : boughs}"/><path data-part="rupert" transform="translate(-2 5) scale(.94)" d="${compact ? compactRupert : rupert}"/><path data-part="ground" d="${ground}"/>${compact ? '' : `<path data-part="ear" transform="translate(-2 5) scale(.94)" d="M32 46C35 45 36 48 34 53L32 56C33 51 30 49 32 46Z" fill="${copper}"/>`}</g>`;
}
function monogram({ night = false, small = false } = {}) {
  const ink = night ? '#e8ebdc' : '#263b33';
  const variant = small ? 'small' : night ? 'night' : 'primary';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000" role="img" aria-label="IH. — Iain Holmes" data-identity="ih-${variant}">
  <title>IH. — Iain Holmes</title>
  <desc>Staggered serif I and H within a fine circle, followed by a small copper period containing Rupert seated left of a loblolly pine, looking up beneath its lowest branches${small ? '; optically simplified for small display sizes' : ''}.</desc>
  <circle class="ih-ring" cx="500" cy="500" r="466" fill="none" stroke="${ink}" stroke-width="${small ? 12 : 10.5}"/>
  <g class="ih-ink" fill="${ink}"><path data-initial="I" d="${small ? compactI : initialI}"/><path data-initial="H" d="${small ? compactH : initialH}"/></g>
  <g data-part="period" transform="translate(702 633) scale(1.04)">${period(`ih-${variant}-scene`, small)}</g>
</svg>\n`;
}
await writeFile(new URL('ih-monogram.svg', root), monogram());
await writeFile(new URL('ih-monogram-night.svg', root), monogram({ night: true }));
await writeFile(new URL('ih-monogram-small.svg', root), monogram({ small: true }));
await writeFile(new URL('copper-period.svg', root), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100" role="img" aria-label="Iain Holmes — copper-period signature" data-identity="ih-period">
  <title>IH. copper-period signature</title>
  <desc>Rupert seated below the lowest left branches of a loblolly pine, looking upward within a copper circle.</desc>
  ${period('ih-period-scene')}
</svg>\n`);
console.log('Built four canonical IH. vector assets, all retaining Rupert and the loblolly.');
