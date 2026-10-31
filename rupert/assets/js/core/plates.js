import { isReleased } from './editions.js';

// Publication, not generation metadata or a numbered reserve, admits a print.
// A repeated image keeps its first publication and permanent number.
export function publishedPlates(manifest, photos, now = new Date()) {
  const seen = new Set(), entries = [];
  const editions = [...(manifest.editions || [])].filter(e => isReleased(e, now))
    .sort((a,b) => new Date(a.published_at)-new Date(b.published_at) || a.id.localeCompare(b.id));
  for (const edition of editions) {
    const image = photos.photos.find(p => p.id === edition.photo_id);
    if (!image || !Number.isInteger(image.plate_no) || image.plate_no < 1 || seen.has(image.id)) continue;
    seen.add(image.id); entries.push({ image, edition });
  }
  return entries.sort((a,b) => a.image.plate_no-b.image.plate_no || a.image.id.localeCompare(b.image.id));
}
