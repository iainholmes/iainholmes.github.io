// Editorial guidance is frozen with an edition; never infer a live forecast from a season.
export const ROLES = ['flagship'];
export const LEGACY_EDITIONS = ['2026-W40-tue', '2026-W40-thu', '2026-W41-tue', '2026-W41-thu'];
export const CHARACTERS = {
  rupert: 'Rupert: lean chocolate American Labrador Retriever, long muzzle, floppy ears, mustard-orange collar',
  bosch: 'Bosch: stockier chocolate English Labrador Retriever, broader head, light-blue collar',
  tilli: 'Tilli: smaller Tennessee Treeing Brindle, brindled coat, red collar',
};
export function guidanceFor(option) {
  if (option.panels?.length) return option.panels;
  const q = option.qualities || {}, dog = option.snapshot?.dog;
  if (q.expected_heat === 'hot' || option.condition_level === 'adverse') return [
    { label: 'For Rupert', text: dog?.shade ? `Shade: ${dog.shade}. Bring drinking water and allow breaks.` : 'Bring drinking water and allow breaks; choose a shorter outing if conditions warrant.' },
    { label: 'Keep in mind', text: option.headline_condition || 'Check the forecast and conditions before leaving.' },
  ];
  if (q.activity === 'pup-cup') return [
    { label: 'Treat stop', text: 'Check ingredients and portion size against Rupert’s usual diet.' },
    { label: 'Short walk', text: 'Check nearby walking access and leash rules.' },
  ];
  if (q.activity === 'patio' || option.experiences?.includes('town-walk')) return [
    { label: 'For Rupert', text: 'Check space, shade and drinking water at the stop.' },
    { label: 'Before you go', text: 'Confirm current dog access and opening hours.' },
  ];
  return [
    { label: 'For Rupert', text: dog?.shade ? `Shade: ${dog.shade}.` : 'Choose a pace and duration that suit Rupert.' },
    { label: 'Keep in mind', text: dog?.watch_for?.join('; ') || option.snapshot?.route?.surface || 'Check current weather, access and dog rules before leaving.' },
  ];
}
export function artworkProblems(editions, photos) {
  const problems = [], used = new Map();
  for (const edition of Object.values(editions)) for (const role of ROLES) {
    const o = edition[role]; if (!o) continue;
    const art = o.artwork;
    if (!art) { if (!LEGACY_EDITIONS.includes(edition.id)) problems.push(`${edition.id}.${role}: a newly generated illustration is required`); continue; }
    const record = photos.photos.find(p => p.id === art.image_id);
    if (record?.generation?.owner !== `${edition.id}/${role}`) problems.push(`${edition.id}.${role}: illustration generation belongs to a different suggestion`);
    if (!record || record.kind !== 'plate' || record.provenance !== 'editorial') problems.push(`${edition.id}.${role}: artwork must reference an editorial plate`);
    if (!art.characters?.includes('rupert') || new Set(art.characters).size !== art.characters?.length) problems.push(`${edition.id}.${role}: exactly one Rupert is required`);
    // IDs and filenames cannot be reassigned to a new suggestion. Pixel duplicates are checked by the build.
    const key = record?.file || art.image_id;
    if (used.has(key)) problems.push(`${edition.id}.${role}: illustration already belongs to ${used.get(key)}`);
    used.set(key, `${edition.id}.${role}`);
    if (!LEGACY_EDITIONS.includes(edition.id) && o.panels?.length !== 2) problems.push(`${edition.id}.${role}: freeze two contextual panels before publication`);
  }
  return problems;
}
export function illustrationPrompt(edition, role) {
  const o = edition[role]; if (!o) throw new Error('Unknown suggestion role');
  const characters = o.artwork?.characters || ['rupert'];
  return `Create ONE newly generated finished illustration for ${edition.id} / ${role}: ${o.title}.\nOuting: ${o.line || o.standfirst || ''}\nSeasons: ${(o.seasons || []).join(', ')}. Experience: ${(o.experiences || []).join(', ')}.\nComposition brief: ${o.artwork?.brief || 'Minimal portrait or simple action on a flat field; scenery is optional. Use verified details only.'}\nCharacters, each depicted exactly once: ${characters.map(c => CHARACTERS[c]).join('; ')}. Default one Rupert, companions only when deliberately selected.\nArt direction: preserve the approved vintage screen-print, woodcut and engraved-print family: strong chocolate Labrador shapes, fine cream carved lines and hatching, restrained 3–5-color palette and subtle ink grain. Favor minimalist compositions most of the time: a portrait on a solid burgundy/oxblood, ochre, olive, cream or navy field; simple walking, running, swimming, tennis-ball carrying, investigating or resting; or a distinctive face, paws, profile or silhouette crop. Use generous negative space and at most one or two environmental cues ordinarily. Elaborate woodland, mountain, river or destination prints are occasional and require a deliberate subject-specific reason in the brief. Review the latest six published artworks, especially the preceding pair, before generation; vary pose, framing, subject scale, negative space, background treatment and dominant color deliberately. Avoid repeating Rupert before mountains, water, trees and a circular sun. Variety is compositional, never random stylistic experimentation. Keep Rupert recognizable as the chocolate American Labrador in the supplied real photographs, with his mustard-orange collar and expressive ears and muzzle; approved artwork guides style only. No photorealism, glossy fur, photographic shading, cinematic light, cartoon aesthetics or excessive decoration. Landscape 3:2, main subject within the central crop-safe area. No collage, panels, repeated figures, text or watermark. Never reuse an earlier finished illustration, even for the same place. Label this as an illustration; completed Field Log outings use real photographs.`;
}
