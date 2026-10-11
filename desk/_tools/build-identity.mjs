/** Canonical IH. geometry. Hand-drawn paths; no fonts, raster tracing or dependencies. */
import { writeFile } from 'node:fs/promises';
const root = new URL('../assets/identity/', import.meta.url);
const copper = '#976144';
const paper = '#eeeee6';
// Staggered initials retain two independent, optically separated silhouettes.
const initialI = `M222 280H378V288C348 289 335 297 335 326V562C335 591 347 600 378 602V610H222V602C253 600 265 591 265 562V326C265 297 253 289 222 288Z`;
const initialH = `M352 398H486V406C460 408 452 416 452 446V556H584V446C584 416 576 408 542 406V398H686V406C653 408 646 416 646 446V672C646 702 654 710 686 712V720H542V712C576 710 584 702 584 672V568H452V672C452 702 460 710 486 712V720H352V712C384 710 392 702 392 672V446C392 416 384 408 352 406Z`;
// The small master opens the I/H gap and strengthens hairlines at 48–96 CSS px.
const smallI = `M218 280H374V294C345 295 332 302 332 329V559C332 586 345 596 374 597V612H218V597C248 596 261 586 261 559V329C261 302 248 295 218 294Z`;
const smallH = `M356 398H490V412C464 414 456 422 456 449V552H584V449C584 422 576 414 544 412V398H688V412C656 414 648 422 648 449V669C648 696 656 706 688 707V722H544V707C576 706 584 696 584 669V572H456V669C456 696 464 706 490 707V722H356V707C388 706 396 696 396 669V449C396 422 388 414 356 412Z`;
// Rupert faces up and right, beneath the lowest left bough. No facial micro-detail.
const rupert = `M16 91C17 86 17 82 20 77C23 72 28 69 29 63L29 59C26 57 27 52 31 50C34 47 38 48 41 50L47 47L49 50L44 55L40 56C38 60 37 66 36 72L38 87C38 89 40 90 43 91V93H33L30 80L28 89C31 90 31 92 31 93H14C9 93 7 90 9 88C11 90 13 91 16 91Z`;
// Asymmetric, open boughs and a long exposed trunk avoid a solid triangular tree.
const pine = `M66 6C65 13 63 17 59 20L63 20C60 25 55 28 50 29L60 28C57 33 51 36 44 37L58 35C53 40 46 43 37 44L42 47C49 47 57 44 63 40L62 98H69L67 39C73 45 79 46 86 44L76 39L81 39C77 36 73 33 69 29L79 31C75 27 71 24 68 20L73 21C69 16 68 11 66 6Z`;
const simplePine = `M66 7L61 21L65 20C61 29 54 33 47 34L60 33C55 40 47 44 38 45L43 49C51 48 57 45 63 41L62 98H70L68 40C74 46 81 47 86 44L75 39L81 39C75 33 71 27 68 21L73 22Z`;
function period(id, simple = false) {
  return `<circle cx="50" cy="50" r="50" fill="${copper}"/>
  <defs><clipPath id="${id}"><circle cx="50" cy="50" r="50"/></clipPath></defs>
  <g clip-path="url(#${id})" fill="${paper}"><path data-part="pine" d="${simple ? simplePine : pine}"/><path data-part="rupert" d="${rupert}"/></g>`;
}
function monogram({ night = false, small = false } = {}) {
  const ink = night ? '#e8ebdc' : '#263b33';
  const variant = small ? 'small' : night ? 'night' : 'primary';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000" role="img" aria-label="IH. — Iain Holmes" data-identity="ih-${variant}">
  <title>IH. — Iain Holmes</title>
  <desc>Staggered serif I and H within a fine circle, followed by a small copper period${small ? '.' : ' containing Rupert seated to the left of a pine, looking up beneath its lowest boughs.'}</desc>
  <circle class="ih-ring" cx="500" cy="500" r="466" fill="none" stroke="${ink}" stroke-width="${small ? 14 : 9}"/>
  <g class="ih-ink" fill="${ink}"><path data-initial="I" d="${small ? smallI : initialI}"/><path data-initial="H" d="${small ? smallH : initialH}"/></g>
  ${small ? `<circle data-part="period" cx="752" cy="672" r="50" fill="${copper}"/>` : `<g data-part="period" transform="translate(702 622)">${period(`ih-${variant}-scene`)}</g>`}
</svg>\n`;
}
await writeFile(new URL('ih-monogram.svg', root), monogram());
await writeFile(new URL('ih-monogram-night.svg', root), monogram({ night: true }));
await writeFile(new URL('ih-monogram-small.svg', root), monogram({ small: true }));
await writeFile(new URL('copper-period.svg', root), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100" role="img" aria-label="Iain Holmes — copper-period signature" data-identity="ih-period">
  <title>IH. copper-period signature</title>
  <desc>Rupert sitting below the left boughs of a pine within a copper circle.</desc>
  ${period('ih-period-scene', true)}
</svg>\n`);
console.log('Built four canonical IH. vector assets.');
