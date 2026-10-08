import { pairKey } from './editions.js';
import { labrador } from './labrador.js';
import { weatherParts } from './weather.js';
import { guidanceFor } from './adventure.js';
import { fetchDock } from './fetch-drawing.js';
import { CROWD_LEVELS, CROWD_TOLERANCES, crowdReadings } from './crowds.js';
import { SEASONS, EXPERIENCES, seasonFor } from './options.js';
// HTML rendering. Pure string functions shared by the build tool (pre-render) and the browser (re-render).
// Every value from data passes through esc(). No DOM access here.
import { weekendRange, publishedLabel, shortDate, longDate, minutesRange, hoursRange, nyDateString, nyTime } from './dates.js';
import { cycleIdentity } from './cycles.js';
import { PENDING_TIME } from './veil.js';

import { expectedPublish } from './editions.js';
import { previousSuggestions } from './recommendations.js';
// Editorial slot and real publication date are separate; the timestamp stays machine-readable.
function slotPublication(ed) {
  const date = publishedLabel(ed.published_at).replace(/^\S+\s/, '');
  return `<time datetime="${esc(ed.published_at)}">${esc(SLOT_LABEL[ed.slot].replace("'s Choice", ' edition'))} · ${esc(date)}</time>`;
}

export const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const titleCase = value => String(value || '').split(/(\s+)/).map((word,i,all) => /^(and|or|the|a|an|of|in|on|at|to|for|with|from|by)$/i.test(word) && i > 0 && i < all.length-1 ? word.toLowerCase() : word.charAt(0).toUpperCase()+word.slice(1)).join('');

export const SLOT_LABEL = { tuesday: "Tuesday's Choice", thursday: "Thursday's Choice" };
const ROLE_LABEL = { local_trail: 'Closer', away_mission: 'Bigger day', wildcard: 'Alternative' };

export const NAV = [
  { key: 'week', label: 'This Week', href: '' },
  { key: 'atlas', label: 'Atlas', href: 'atlas/' },
  { key: 'travel', label: 'Travel', href: 'travel/' },
  { key: 'log', label: 'Field Log', href: 'log/' },
];

export function optionTags(o) {
  return `<span class="option-tags">${(o.seasons || []).map(x => `<span>${esc(SEASONS[x])}</span>`).join('')}${(o.experiences || []).map(x => `<span>${esc(EXPERIENCES[x])}</span>`).join('')}</span>`;
}
function marginNote(label, text, link = '') {
  return `<aside class="head-note"><span class="lbl">${label}</span><p>${text}</p>${link}</aside>`;
}

/* ---------- photographs ---------- */

export function photoById(photos, id) {
  return (photos?.photos || []).find(p => p.id === id) || null;
}

/**
 * <img> with srcset from the registry, or a designed stand-in when the photograph isn't in yet.
 * The focal point drives object-position, so crops follow Rupert rather than the frame's centre.
 */
export function photo(ref, photos, base, { sizes = '100vw', eager = false, cls = '' } = {}) {
  const p = ref && photoById(photos, ref.id);
  if (!p) {
    return `<div class="ph-missing ${cls}" role="img" aria-label="Photograph to come"><span>Photograph to come</span></div>`;
  }
  const [fx, fy] = ref.focal || p.focal || [0.5, 0.5];
  const srcset = p.widths.map(w => `${base}photos/${esc(p.file)}-${w}.jpg ${w}w`).join(', ');
  const mid = p.widths[Math.floor(p.widths.length / 2)];
  return `<img class="${cls}" src="${base}photos/${esc(p.file)}-${mid}.jpg" srcset="${srcset}" sizes="${esc(sizes)}"`
    + ` width="${p.width}" height="${p.height}" alt="${esc(ref.alt || p.alt)}"`
    + ` ${p.generation ? 'data-illustration="true"' : ''} style="${focalVars(p.width / p.height, fx, fy)}"`
    + (eager ? ' fetchpriority="high"' : ' loading="lazy" decoding="async"') + '>';
}

/**
 * object-position values that put the focal point as close to the centre of the crop as the image allows,
 * for each container shape the site uses: 3:2 plates, 4:5 phone crops, 2:1 heroes.
 */
function focalVars(imgAspect, fx, fy) {
  const pos = boxAspect => {
    const clamp = v => Math.min(1, Math.max(0, v));
    let x = 0.5, y = 0.5;
    if (imgAspect > boxAspect) { const r = imgAspect / boxAspect; x = clamp((fx * r - 0.5) / (r - 1)); }
    else if (imgAspect < boxAspect) { const r = boxAspect / imgAspect; y = clamp((fy * r - 0.5) / (r - 1)); }
    return `${Math.round(x * 100)}% ${Math.round(y * 100)}%`;
  };
  return `--pos-32:${pos(3 / 2)};--pos-45:${pos(4 / 5)};--pos-21:${pos(2 / 1)}`;
}

function imageRef(option) { return option.artwork ? { id: option.artwork.image_id } : option.photo; }

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
function takenLabel(t) {
  if (!t) return '';
  const [y, m, d] = t.split('-').map(Number);
  return d ? `${d} ${MONTHS[m - 1]} ${y}` : m ? `${MONTHS[m - 1]} ${y}` : `${y}`;
}

/**
 * The provenance line shown with every image. It never implies a place the image wasn't taken:
 * only documentary images name a place, and only the place recorded on the image itself.
 */
export function credit(ref, photos, places) {
  const p = ref && photoById(photos, ref.id);
  if (!p) return '';
  const when = takenLabel(p.taken_at);
  const print = p.kind === 'print';
  let line;
  if (p.provenance === 'documentary') {
    const place = (places?.places || []).find(x => x.id === p.place_id);
    line = [print ? 'Print' : null, place?.short_name || place?.name, when].filter(Boolean).join(' · ');
  } else if (p.provenance === 'archive') {
    line = [p.caption, print ? `Print from an archive photograph${when ? ', ' + when : ''}` : `Archive photograph${when ? ', ' + when : ''}`].filter(Boolean).join(' · ');
  } else {
    line = p.caption || (p.kind === 'plate' ? 'Plate' : print ? 'Field print' : 'Editorial photograph');
  }
  return `<figcaption class="credit">${esc(line)}</figcaption>`;
}

/* ---------- small formatters ---------- */

function routeBits(snap) {
  const r = snap?.route;
  const bits = [];
  if (r?.distance_mi) bits.push(`<b>${esc(r.distance_mi)}</b> mi${r.shape ? ' ' + esc(r.shape) : ''}`);
  if (snap?.drive) bits.push(`<b>${esc(minutesRange(snap.drive.minutes))}</b> drive`);
  if (snap?.duration_h) bits.push(esc(hoursRange(snap.duration_h)) + ' outside');
  return bits;
}

function supportLine(o) {
  const snap = o.snapshot || {};
  const bits = [];
  if (snap.route?.distance_mi) bits.push(`${snap.route.distance_mi} mi`);
  if (snap.drive) bits.push(`${minutesRange(snap.drive.minutes)} drive`);
  if (o.commitment) bits.push(o.commitment.toLowerCase());
  return bits.join(' · ');
}

/* ---------- chrome ---------- */

export function chrome({ active, base, weekLabel, site, body, pageClass = '', now }) {
  const navItems = (cls) => NAV.map(n =>
    `<li><a class="${cls}" href="${base}${n.href}"${n.key === active ? ' aria-current="page"' : ''}>${esc(n.label)}</a></li>`).join('');
  return `<a class="skip" href="#main">Skip to content</a>
<header class="masthead" id="masthead">
  <div class="wrap">
    <div class="dateline"><span>Chapel Hill, N.C.</span><span>${esc(weekLabel)}</span></div>
    <p class="wordmark"><a href="${base}">The Rupert Atlas</a></p>
    <nav class="primary" aria-label="Sections"><ul>${navItems('nav-link')}</ul><a class="nav-archive" href="${base}archive/"${active === 'archive' ? ' aria-current="page"' : ''}>Archive</a></nav>
  </div>
</header>
<div class="bar" id="bar">
  <div class="wrap bar-inner">
    <a class="bar-mark" href="${base}">The Rupert Atlas</a>
    <nav class="bar-nav" aria-label="Sections, compact"><ul>${navItems('nav-link')}<li><a class="nav-link" href="${base}archive/"${active === 'archive' ? ' aria-current="page"' : ''}>Archive</a></li></ul></nav>
    <span class="bar-week">${esc(weekLabel)}</span>
  </div>
</div>
<main id="main" class="${pageClass}" tabindex="-1">
${body}
</main>
<footer class="utility-footer"><div class="wrap"><a href="${base}archive/">Archive</a><a href="${base}atlas/">Place Directory</a><span class="footer-identity">${esc((now || new Date()).getFullYear())}<img src="${base}assets/img/rupert-portrait-outline.svg" width="30" height="30" alt="" aria-hidden="true"></span></div></footer>
<nav class="dock" aria-label="Sections, bottom"><ul>${NAV.map(n =>
    `<li><a href="${base}${n.href}"${n.key === active ? ' aria-current="page"' : ''}>${esc(n.label)}</a></li>`).join('')}</ul></nav>`;
}

export function weekLabelFor(dateStr) {
  return cycleIdentity(dateStr).label;
}

/* ---------- This Week ---------- */

function plate(slot, ed, pair, ctx) {
  const { base, photos } = ctx;
  const id = `plate-${slot}`;
  if (!ed) {
    const when = pair.missing[slot] ? publishedLabel(pair.missing[slot]) : '';
    return `<article class="plate is-pending" id="${id}" data-slot="${slot}" aria-labelledby="${id}-h">
  <p class="p-eyebrow"><span class="p-day"><span class="edition-number">${slot==='tuesday'?'01':'02'}</span>${SLOT_LABEL[slot]}</span></p>
  <h2 class="p-title" id="${id}-h">${pair.state === 'past' ? 'Not published' : `Publishes ${esc(when)} · ${PENDING_TIME}`}</h2>
  <p class="p-stand">${slot === 'thursday'
      ? 'Weekend choice 2 of 2.'
      : 'Weekend choice 1 of 2.'}</p>
</article>`;
  }
  if (ed.status === 'withdrawn') return `<article class="plate is-withdrawn" id="${id}" data-slot="${slot}" aria-labelledby="${id}-h"><p class="p-day">${SLOT_LABEL[slot]} · Withdrawn</p><h2 class="p-title" id="${id}-h">${esc(titleCase(ed.flagship.title))}</h2><p class="p-stand">${esc(ed.corrections.at(-1).note)}</p><p><a href="${base}edition/${esc(ed.id)}/">Read the withdrawal</a></p></article>`;
  const f = ed.flagship;
  const href = `${base}edition/${esc(ed.id)}/`;
  return `<article class="plate" id="${id}" data-slot="${slot}" aria-labelledby="${id}-h">
  <p class="p-eyebrow"><span class="p-day"><span class="edition-number">${slot==='tuesday'?'01':'02'}</span>${SLOT_LABEL[slot]}</span><span class="p-pub">${slotPublication(ed)}</span></p>
  <h2 class="p-title" id="${id}-h"><a href="${href}">${esc(titleCase(f.title))}</a></h2>
  <p class="p-stand">${esc(f.standfirst)}</p>
    ${renderOutingInfo(ed)}
  <figure class="p-photo${f.artwork ? ' adventure-illustration' : ''}">${photo(imageRef(f), photos, base, { sizes: '(min-width: 760px) 46vw, 100vw', eager: slot === 'tuesday' })}${credit(imageRef(f), photos, ctx.places)}</figure>

  <p class="p-more"><a href="${href}">Full edition<span class="vh"> for ${esc(titleCase(f.title))}</span></a></p>
</article>`;
}

export function renderOutingInfo(ed) {
  const weather=weatherParts(ed), bits=routeBits(ed.flagship?.snapshot);
  return `<div class="outing-info">
    ${bits.length ? `<section class="outing-glance"><h3 class="outing-heading">Outing at a glance</h3><ul class="outing-metrics" aria-label="Outing logistics">${bits.map(b=>`<li>${b}</li>`).join('')}</ul></section>` : ''}
    ${(weather.days.length||weather.forecast) ? `<section class="outing-weather${weather.adverse?' is-adverse':''}"><h3 class="outing-heading">${weather.adverse?'Weather warning':'Weather'}</h3>${weather.days.length?`<table class="outing-forecast"><thead><tr><th scope="col">Day</th><th scope="col">Forecast</th></tr></thead><tbody>${weather.days.map(d=>`<tr><th scope="row">${esc(d.day)}</th><td>${esc(d.forecast)}</td></tr>`).join('')}</tbody></table>`:''}${weather.forecast?`<p>${esc(weather.forecast)}</p>`:''}${weather.context?`<p class="weather-context">${esc(weather.context)}</p>`:''}${weatherProvenance(ed.conditions, ed.flagship?.sources)}</section>`:''}
    ${weather.trail?`<section class="outing-trail"><h3 class="outing-heading">Trail note</h3><p>${esc(weather.trail)}</p></section>`:''}
  </div>`;
}

export function renderWeek(pair, editions, ctx) {
  if (!pair) {
    return `<section class="week wrap" data-pair="none"><header class="weekband"><h1>No editions published</h1></header></section>`;
  }
  const { base, photos, places } = ctx;
  const tue = pair.tuesday && editions[pair.tuesday.id];
  const thu = pair.thursday && editions[pair.thursday.id];
  const eyebrow = pair.state === 'past' ? 'Last weekend' : pair.state === 'now' ? 'This weekend' : 'For the weekend of';
  const tab = (slot, ed) => `<button type="button" role="tab" class="tab" id="tab-${slot}" aria-controls="plate-${slot}" aria-selected="false" tabindex="-1">
      <span class="tab-k"><span class="edition-number">${slot==='tuesday'?'01':'02'}</span><span>${SLOT_LABEL[slot]}</span></span><span class="tab-t">${ed ? esc(placeShort(places, ed.flagship.place_id, ed.flagship.title)) : 'Publishes ' + esc(publishedLabel(pair.missing[slot])) + ' · ' + PENDING_TIME}</span></button>`;
  const inter = interlude(thu || tue, ctx);
  return `<section class="week" data-pair="${esc(pairKey(pair))}" aria-labelledby="week-h">
  <header class="weekband wrap">
    <p class="wb-eyebrow">${eyebrow}</p>
    <h1 id="week-h">${esc(weekendRange(pair.weekend.start, pair.weekend.end))}</h1>
  </header>
  <div class="tabs wrap" role="tablist" aria-label="Choose between this weekend's editions" hidden>
    ${tab('tuesday', tue)}${tab('thursday', thu)}
  </div>
  <div class="plates wrap">
    ${plate('tuesday', tue, pair, ctx)}
    ${plate('thursday', thu, pair, ctx)}
  </div>
  ${inter}
  <p class="week-archive wrap"><a href="${base}archive/">Earlier weekends in the archive</a></p>
</section>`;
}

function placeShort(places, id, fallback) {
  return (places?.places || []).find(p => p.id === id)?.short_name || fallback;
}

function interlude(ed, ctx) {
  const it = ed?.interlude;
  if (!it) return '';
  const p = photoById(ctx.photos, it.photo_id);
  const place = it.caption || p?.place || '';
  const date = p?.date;
  return `<figure class="interlude">${photo({ id: it.photo_id, alt: it.alt }, ctx.photos, ctx.base, { sizes: '100vw', cls: 'il-img' })}
    ${p ? `<figcaption><span class="il-place">${esc(place)}</span>${date ? `<span class="il-date">${esc(longDate(date))}</span>` : ''}</figcaption>` : ''}</figure>`;
}

export function crowdVisual(crowd) {
  const { typical, perceived, facts } = crowdReadings(crowd);
  const scale = (label, description, reading) => {
    return `<div class="crowd-line${reading ? '' : ' is-unassessed'}"><div class="crowd-heading"><span>${label}</span><strong class="crowd-value">${esc(reading?.value || 'Not recorded')}</strong></div><p class="crowd-description">${description}</p>${reading ? `<div class="crowd-scale" role="img" aria-label="${esc(label)}: ${esc(reading.value)} on the Quiet to Busy scale">${CROWD_LEVELS.map((x,i)=>`<i${reading.index === i ? ' class="is-observed"' : ''} aria-hidden="true"></i>`).join('')}</div><div class="crowd-key" aria-hidden="true"><span>Quiet</span><span>Busy</span></div>` : ''}</div>`;
  };
  return `<div class="crowd-visual">${scale('Typical crowd','Usual number of visitors',typical)}${scale('Perceived crowding','How busy the space feels',perceived)}${facts.length ? `<dl class="facts">${facts.map(([k,v])=>`<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : ''}${!typical && !perceived && !facts.length ? '<p class="as-of">No crowd data recorded.</p>' : ''}</div>`;
}

/* ---------- full edition ---------- */

export function renderEdition(ed, ctx, sibling) {
  if (ed.status === 'withdrawn') return `<article class="edition wrap"><header class="ed-head ed-withdrawn-head"><p class="header-kicker">${SLOT_LABEL[ed.slot]} · Withdrawn</p><h1>${esc(titleCase(ed.flagship.title))}</h1></header><section class="withdrawal"><h2 class="sec-h">Recommendation Withdrawn</h2><p>${esc(ed.corrections.at(-1).note)}</p><p>Withdrawal recorded ${esc(ed.corrections.at(-1).at)}. The original recommendation is no longer active.</p>${(ed.flagship.sources||[]).filter(s=>s.kind==='park').map(s=>`<a href="${esc(s.url)}">${esc(s.label)}</a>`).join(' · ')}</section><p><a href="${ctx.base}">This Week</a> · <a href="${ctx.base}archive/">Archive</a></p></article>`;
  const { base, photos, places } = ctx;
  const f = ed.flagship, s = f.snapshot || {};
  const panels = guidanceFor(f);
  const previous = previousSuggestions(ed, ctx.history || [], ed.published_at)[0];
  const historyLink = previous ? `<p class="previously-suggested"><a href="${base}edition/${esc(previous.id)}/">Previously suggested · ${esc(shortDate(nyDateString(new Date(previous.published_at))))}</a></p>` : '';
  const place = (places?.places || []).find(p => p.id === f.place_id);
  const ref = places?.reference_points?.[s.drive?.from];
  const fact = (k, v) => v ? `<div><dt>${k}</dt><dd>${v}</dd></div>` : '';
  const r = s.route || {};
  const facts = [
    fact('Distance', r.distance_mi ? `${esc(r.distance_mi)} mi ${esc(r.shape || '')}` : ''),
    fact('Climb', r.gain_ft ? `${esc(r.gain_ft)} ft gain` : r.climb_ft_approx ? `About ${esc(r.climb_ft_approx)} ft` : ''),
    fact('Difficulty', esc(r.difficulty)),
    fact('Surface', esc(r.surface)),
    fact('Outing time', s.duration_h ? esc(hoursRange(s.duration_h)) : ''),
    fact('Drive', s.drive ? `<span class="edition-drive" data-place="${esc(f.place_id)}">${esc(minutesRange(s.drive.minutes))}<span class="fact-note">Chapel Hill reference estimate · ${esc(ref?.label || 'Franklin Street')}</span></span>` : ''),
    fact('Start', esc(s.access?.name)),
    fact('Parking', esc(s.access?.parking)),
  ].join('');
  const dog = s.dog ? [
    fact('Leash', esc(s.dog.leash)), fact('Water', esc(s.dog.water)), fact('Shade', esc(s.dog.shade)),
    fact('Watch for', (s.dog.watch_for || []).map(esc).join('; ')),
  ].join('') : '';
  const pr = ed.practical || {};
  const practical = [
    fact('Best window', esc(pr.best_window)), fact('Fees', esc(pr.fees)),
    fact('Bring', (pr.bring || []).map(esc).join(', ')),
    fact('Closures', pr.closures_checked ? `Checked ${esc(shortDate(pr.closures_checked))}` : esc(pr.closures_note || 'Not checked')),
  ].join('');
  const pivotTarget = ed.conditions?.pivot?.then && ed[ed.conditions.pivot.then];
  const outing = role => {
    const o = ed[role]; if (!o) return '';
    const placeLink = places?.places?.find(p => p.id === o.place_id)?.links?.[0]?.url;
    return `<li id="${role}"><span>${ROLE_LABEL[role]}</span>${placeLink ? `<a href="${esc(placeLink)}">${esc(o.title)}</a>` : `<strong>${esc(o.title)}</strong>`}<small>${esc(supportLine(o))}</small></li>`;
  };
  const corrections = (ed.corrections || []).length
    ? `<section class="ed-corrections"><h2 class="sec-h">Corrections</h2><ul>${ed.corrections.map(c => `<li><span class="data">${esc(c.at)}</span> ${esc(c.note)}</li>`).join('')}</ul></section>` : '';
  const sib = sibling && new Date(sibling.published_at) <= (ctx.now || new Date())
    ? `<p class="ed-sibling"><span class="lbl">The other choice for this weekend</span><a href="${base}edition/${esc(sibling.id)}/">${esc(SLOT_LABEL[sibling.slot])}: ${esc(sibling.flagship.title)}</a></p>` : '';

  return `<article class="edition" data-edition="${esc(ed.id)}" aria-labelledby="ed-h">
  <header class="ed-head wrap">
    <div class="ed-heading"><p class="ed-eyebrow"><span class="p-day">${SLOT_LABEL[ed.slot]}</span><span>For the weekend of ${esc(weekendRange(ed.weekend.start, ed.weekend.end))}</span></p>
    <h1 id="ed-h">${esc(titleCase(f.title))}</h1>
    <p class="ed-stand">${esc(f.standfirst)}</p>
    <p class="ed-pub">${slotPublication(ed)} · Weekend choice ${ed.slot === 'tuesday' ? 1 : 2} of 2</p>${historyLink}</div>
    ${marginNote("The Outing", `${esc(place?.short_name || f.title)}<br>${esc(s.access?.name || '')}`, `<a href="${base}atlas/#place-${esc(f.place_id)}">Find it in the Atlas →</a>`)}
  </header>
  <div class="ed-feature wrap"><figure class="ed-hero${f.artwork ? ' adventure-illustration' : ''}">${photo(imageRef(f), photos, base, { sizes: '(min-width: 1024px) 65vw, 100vw', eager: true })}${credit(imageRef(f), photos, places)}</figure>
    <aside class="ed-companion"><h2 class="sec-h">Outing Overview</h2><ul class="feature-facts">${routeBits(s).map(x => `<li>${x}</li>`).join('')}</ul><p class="overview-window">${esc(ed.practical?.best_window || '')}</p><dl class="facts">${fact('Route',esc(r.difficulty))}${fact('Start',esc(s.access?.name))}</dl></aside></div>
  <div class="ed-body wrap">
    <div class="ed-main">
      <section><h2 class="sec-h">Why This Week</h2><p>${esc(f.why_this_week)}</p></section>
      <section class="ed-conditions"><h2 class="sec-h">Conditions</h2><p>${esc(ed.conditions?.summary)}</p>
        ${ed.conditions?.pivot ? `<div class="pivot${ed.flagship.condition_level === 'adverse' ? ' is-adverse' : ''}"><p class="pivot-k">If it turns</p><p><strong>${esc(ed.conditions.pivot.if)}:</strong> ${esc(ed.conditions.pivot.note)}${pivotTarget ? ` <span class="pivot-to">Go to: ${esc(pivotTarget.title)}</span>` : ''}</p></div>` : ''}
        ${weatherProvenance(ed.conditions, ed.flagship?.sources)}</section>
      <div class="ed-fun">
        ${panels.map(p => `<section><h2 class="sec-h">${esc(titleCase(p.label))}</h2><p class="fun-text">${esc(p.text)}</p></section>`).join('')}

      </div>
      <section class="contingency"><h2 class="sec-h">If Plans Change</h2><ul class="fallbacks">${outing('local_trail')}${outing('away_mission')}${outing('wildcard')}</ul></section>
      <section class="memory-prompt"><h2 class="sec-h">Memory Prompt</h2><p>${esc(ed.memory_prompt?.text)}</p></section>
      ${corrections}
      <section class="ed-sources"><h2 class="sec-h">Sources</h2><ul>${(f.sources || []).map(x => `<li><a href="${esc(x.url)}" rel="noopener">${esc(x.label)}</a> <span class="data">retrieved ${esc(x.retrieved)}</span></li>`).join('')}</ul>
        <p class="as-of">Place details as recorded ${esc(shortDate(s.as_of))}. They stay as published even if the place's record is corrected later.</p></section>
    </div>
    <aside class="ed-sheet" aria-label="Outing facts">
      <section><h2 class="sec-h">The Route</h2><dl class="facts">${facts}</dl></section>
      ${dog ? `<section><h2 class="sec-h">Dog Access</h2><dl class="facts">${dog}</dl></section>` : ''}
      <section><h2 class="sec-h">Crowd &amp; Foot Traffic</h2>${crowdVisual(s.crowd)}</section>
      <section><h2 class="sec-h">Practical</h2><dl class="facts">${practical}</dl></section>
      ${place?.links?.length ? `<p class="sheet-links">${place.links.map(l => `<a href="${esc(l.url)}" rel="noopener">${esc(l.label)}</a>`).join('<br>')}</p>` : ''}
    </aside>
  </div>
  <footer class="ed-foot wrap">${sib}<p><a href="${base}">Back to This Week</a> · <a href="${base}archive/">Archive</a></p></footer>
${fetchDock(f.experiences?.some(x => ['river','swim'].includes(x)) ? 'water' : f.experiences?.includes('town-walk') ? 'town' : 'trail')}</article>`;
}

/* ---------- archive ---------- */

export function renderArchive(groups, ctx) {
  const { base, photos, places } = ctx;
  const cards = groups.map(g => `<section class="archive-week${g.editions.some(e=>e.current)?' is-current':''}"><h2>${esc(weekendRange(g.weekend.start,g.weekend.end))}${g.editions.some(e=>e.current)?'<span class="arch-now">This Week</span>':''}</h2><div class="archive-results">${['tuesday','thursday'].flatMap(slot=>{const entries=g.editions.filter(e=>e.slot===slot);return entries.length?entries.map(e=>({slot,e})):[{slot,e:null}];}).map(({slot,e})=>{
    const publish=expectedPublish(slot,g.weekend.start);
    if(!e) return `<article class="archive-card is-missing"><p class="p-day">${SLOT_LABEL[slot]}</p><p>${publish > (ctx.now || new Date()) ? 'Publishes '+esc(publishedLabel(publish.toISOString()))+' · '+PENDING_TIME : 'Not published'}</p></article>`;
    if(e.status==='withdrawn') return `<article class="archive-card is-withdrawn" data-option="${esc(JSON.stringify({...e.options?.[0],title:e.title,place_name:(places?.places||[]).find(p=>p.id===e.place_id)?.name || ''}))}"><div><p class="p-day">${SLOT_LABEL[slot]} · Withdrawn</p><h3><a href="${base}edition/${esc(e.id)}/">${esc(titleCase(e.title))}</a></h3><p class="arch-meta">Recommendation withdrawn · Historical publication</p></div></article>`;
    const option={...(e.options?.find(o=>o.role==='flagship') || {}),title:e.title,place_name:(places?.places||[]).find(p=>p.id===e.place_id)?.name || ''};
    return `<article class="archive-card" data-option="${esc(JSON.stringify(option))}"><a href="${base}edition/${esc(e.id)}/" class="archive-image" tabindex="-1" aria-hidden="true">${photo(e.photo_id?{id:e.photo_id}:null,photos,base,{sizes:'(max-width: 759px) 88px, 118px'})}</a><div><p class="p-day">${slotPublication(e)}</p><h3><a href="${base}edition/${esc(e.id)}/">${esc(titleCase(e.title))}</a></h3><p class="arch-meta">${esc(option.place_name)}</p></div></article>`;
  }).join('')}</div></section>`).join('');
  return `<div class="archive wrap"><header class="page-head"><h1>Archive</h1></header><div class="archive-layout"><aside class="archive-rail"><form class="archive-filters" hidden role="search"><label>Search<input type="search" name="query" placeholder="Place or activity"></label><label>Season<select name="season"><option value="">All seasons</option>${Object.entries(SEASONS).map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select></label><label>Activity<select name="experience"><option value="">All activities</option>${Object.entries(EXPERIENCES).map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select></label><label>Crowd<select name="crowd">${Object.entries(CROWD_TOLERANCES).map(([v,l])=>`<option value="${v}"${v==='any'?' selected':''}>${l}</option>`).join('')}</select></label><button type="reset">Clear</button></form><p class="archive-count" role="status" aria-live="polite"></p></aside><div class="archive-index"><p class="archive-empty" hidden>No editions match these filters.</p>${cards || '<p>No editions published.</p>'}</div></div></div>`;
}

/* ---------- section placeholders (milestone 1 honesty pages) ---------- */

function weekendShort(a, b) {
  const M = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const [, m1, d1] = a.split('-').map(Number), [, m2, d2] = b.split('-').map(Number);
  return m1 === m2 ? `${d1}–${d2} ${M[m1 - 1]}` : `${d1} ${M[m1 - 1]}–${d2} ${M[m2 - 1]}`;
}

export const MARK_SVG = {
  withdrawn: '<svg class="mk mk-withdrawn" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="6.6"/><path d="M6 10h8"/></svg>',
  recommended: '<svg class="mk mk-rec" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="6.6"/></svg>',
  walked: '<svg class="mk mk-walk" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7"/><path d="M6.6 10.2l2.4 2.6 4.6-5.2"/></svg>',
  planned: '<svg class="mk mk-plan" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2.6l7.4 7.4-7.4 7.4-7.4-7.4z"/></svg>',
  register: '<svg class="mk mk-reg" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="4.6"/></svg>',
};

/**
 * The Atlas page: a register that always works, plus a map slot the browser enhances.
 * model = { groups, statuses, counts, features, bounds } from core/atlas.js.
 */
export function renderAtlas(model, ctx) {
  const { base } = ctx;
  const STAT = { walked: 'Walked', recommended: 'Recommended', withdrawn: 'Withdrawn' };
  const row = p => {
    const st = model.statuses.get(p.id), r = p.routes?.[0], latest = st.editions[0];
    const editionLink = e => `<a href="${base}edition/${esc(e.id)}/">${esc(e.label)}, ${esc(weekendShort(e.weekend.start, e.weekend.end))}</a>`;
    const meta = [r ? `${r.distance_mi} mi ${r.shape}` : null, r?.difficulty, p.dog_policy].filter(Boolean).map(esc).join(' · ');
    const start = p.access ? `<p class="reg-start">Start: ${esc(p.access.name)}${p.access.coords_verified ? '' : ' <span class="reg-approx">· pin approximate</span>'}</p>` : '';
    return `<li class="reg-row" id="place-${esc(p.id)}" data-place="${esc(p.id)}" data-status="${st.status}">
      ${MARK_SVG[st.status]}<div class="reg-main"><h4><button type="button" class="reg-select" data-show="${esc(p.id)}" aria-label="Select ${esc(p.name)}">${esc(p.short_name || p.name)}</button></h4>
      <div class="reg-brief"><span class="reg-word">${esc(STAT[st.status])}</span><a class="reg-latest" href="${base}edition/${esc(latest.id)}/">${latest.status === 'withdrawn' ? 'Historical edition' : 'Latest edition'} →</a>
      <details class="reg-details"><summary>Details</summary><div class="reg-dossier"><p class="reg-meta">${esc(p.name)} · ${esc(p.region)}</p><p class="reg-meta">${meta}</p>${start}
      <p class="reg-status">${p.closure?.status === 'closed' ? 'Closed · Official Status Checked ' + esc(p.closure.checked) : latest.status === 'withdrawn' ? 'Withdrawn historical publication; this is not a current recommendation.' : 'Published recommendation'}</p>
      <p class="reg-edition">${editionLink(latest)}</p>${st.editions.length > 1 ? `<details class="reg-history"><summary>Prior recommendations (${st.editions.length - 1})</summary>${st.editions.slice(1).map(editionLink).join('<br>')}</details>` : ''}</div></details></div></div></li>`;
  };
  const groups = model.groups.map(g => `<section class="reg-group" data-region="${esc(g.region)}"><h3 class="reg-region vh">${esc(g.region)}</h3><ul class="reg">${g.places.map(row).join('')}</ul></section>`).join('');
  const regions = model.groups.map(g => ({ label:g.region, ids:g.places.map(p=>p.id) }));
  const places = model.groups.flatMap(g=>g.places), c = model.counts;
  const frameButton = (key, label) => `<button type="button" data-frame="${esc(key)}" disabled>${esc(label)}</button>`;
  const legend = ['recommended', 'withdrawn'].map(k => `<li>${MARK_SVG[k]}<span>${STAT[k]}</span></li>`).join('');
  return `<div class="atlas">
  <header class="page-head wrap"><div><h1>Atlas</h1></div><aside class="head-note atlas-coverage">${labrador('stand')}<div class="banner-copy"><span class="lbl">Current Place</span><p id="atlas-selection">Choose a Place</p><small id="atlas-context" hidden></small></div></aside></header>
  <div class="atlas-body wrap">
    <section class="atlas-register" aria-labelledby="reg-h">
      <div class="reg-head"><div class="reg-heading"><h2 id="reg-h">Place Directory</h2><p class="directory-note">${c.all} published places · History retained</p></div>
      <div class="directory-controls"><details class="frame-menu"><summary>Frame map</summary><div class="frame-options">
      ${frameButton('all','All published places')}${frameButton('recommended','Recommended places')}${frameButton('withdrawn','Withdrawn history')}
      <details class="frame-regions"><summary>By region</summary>${regions.map((r,i)=>frameButton('region:'+i,r.label)).join('')}</details>
      <p class="frame-note" id="frame-status" role="status">Camera framing only; every published place stays in the Directory and on the map.</p></div></details>
      <details class="location-settings"><summary>Home &amp; routes</summary>
    <p>Home stays in this browser. Map providers receive the visible map area; home is never published.</p>
    <form id="address-form"><label>Home address<input name="address" autocomplete="street-address" maxlength="240" required placeholder="Street, town, state, ZIP"></label><button>Locate with OpenStreetMap</button></form><p class="season-note">Locating sends the address to OpenStreetMap’s Nominatim service. Check the returned coordinates below before saving home. You can also enter coordinates directly.</p>
    <form id="location-form"><label>Latitude<input name="lat" type="number" step="any" min="-85" max="85" required></label><label>Longitude<input name="lng" type="number" step="any" min="-180" max="180" required></label><button>Save home</button><button type="button" id="forget-location">Forget home</button></form>
    <p class="season-note">Selecting a place automatically requests a driving route. OSRM receives Home and the selected trailhead coordinates; Home stays saved only in this browser.</p><label class="routing-choice traffic-choice"><input type="checkbox" id="traffic-enabled" disabled aria-describedby="traffic-note"> Enable live traffic data</label><p id="traffic-note" class="season-note traffic-note">Live traffic unavailable with current routing provider.</p><p id="location-status" role="status"></p>
  </details></div></div>
      <label class="directory-picker vh" for="place-picker">Choose a published place</label><select id="place-picker" class="directory-picker"><option value="">Choose a place</option>${places.map(p=>`<option value="${esc(p.id)}">${esc(p.short_name || p.name)}${model.statuses.get(p.id).status === 'withdrawn' ? ' · Withdrawn' : ''}</option>`).join('')}</select>
      <details class="directory-catalog" open><summary>Browse history (${c.all})</summary><div class="directory-list">${groups || '<p>No places published yet.</p>'}</div></details>
    </section>
    <section class="atlas-map" aria-label="Map of places"><div class="map-canvas" id="map"></div>
      <div class="map-drive-overlay"><div class="map-direct-controls"><button type="button" id="recenter" disabled>Home</button><button type="button" id="relief" aria-pressed="false" disabled>Relief</button></div><p id="drive-status" class="drive-status" role="status" aria-live="polite">Select a place to plan the drive.</p></div>
      <div class="map-state" id="map-state" role="status"><span class="ridge" aria-hidden="true"></span><p id="map-msg">Enable JavaScript for the map.</p></div>
      <ul class="map-legend" aria-label="Legend">${legend}</ul><div class="map-card" id="map-card" hidden></div>
    </section>
  </div>
  <script type="application/json" id="atlas-data">${JSON.stringify({ features:model.features, bounds:model.bounds, regions }).replace(/</g, '\\u003c')}</script>
</div>`;
}

export function renderComing(kind, ctx) {
  return `<div class="wrap coming"><header class="page-head"><h1>Field Log</h1></header><noscript>Enable JavaScript to record outings.</noscript></div>`;
}

export function renderTravel(ctx) {
  return `<div class="travel wrap"><header class="page-head"><div><h1>Travel</h1></div><aside class="head-note">${labrador('walk')}<div class="banner-copy" id="travel-banner-copy" hidden><p id="travel-header-plan"></p><small id="travel-header-state"></small></div></aside></header>
  <noscript>Enable JavaScript to plan a trip.</noscript>
  <nav class="journey-stages" aria-label="Trip planning stages"><a href="#plan-stage">01 Plan</a><a href="#route-stage">02 Choose a Route</a><a href="#build-stage">03 Build the Journey</a><a href="#itinerary-stage">04 Itinerary</a></nav>
  <section class="journey-stage travel-editor" id="plan-stage" aria-labelledby="plan-h"><h2 class="sec-h" id="plan-h"><span>01</span> Plan</h2>
    <form id="journey-form"><div class="journey-endpoints"><label>Origin<input id="trip-origin" list="travel-locations" maxlength="200" placeholder="Town, address, or Home" required autocomplete="off"></label><span aria-hidden="true">→</span><label>Destination<input id="trip-destination" list="travel-locations" maxlength="200" placeholder="Where are you going?" required autocomplete="off"></label></div>
    <div class="journey-options"><label>Start date<input id="trip-start" type="date"></label><label>End date<input id="trip-end" type="date"></label><label>Departure<input id="trip-depart" type="time" value="09:00"></label><label>Detour tolerance<select id="trip-detour"><option value="10">Up to 10 min</option><option value="20" selected>Up to 20 min</option><option value="40">Up to 40 min</option><option value="60">Up to 1 h</option></select></label></div>
    <div class="journey-submit"><label class="routing-choice"><input id="trip-routing" type="checkbox"> Enable route &amp; place lookup</label><button id="map-trip" type="submit">Find Routes</button></div>
    <p class="lookup-disclosure">Lookup sends typed places to OpenStreetMap Nominatim, route coordinates (including home if used) to OSRM, and activity-search areas to OpenStreetMap Overpass. Saved plans stay in this browser. Driving estimates exclude live traffic.</p></form><p id="trip-status" role="status" aria-live="polite"></p>
  </section>
  <section class="journey-stage" id="route-stage" aria-labelledby="route-h"><div class="stage-head"><h2 class="sec-h" id="route-h"><span>02</span> Choose a Route</h2><button id="fit-trip" type="button" disabled>Fit Route</button></div><div id="route-families" class="route-families"><p>Enter your origin and destination to compare routes.</p></div>
    <div class="trip-map" aria-label="Journey map"><div id="travel-map" class="map-canvas"></div><p id="trip-map-status" role="status">Loading map…</p><div class="trip-map-key"><span>Driving route</span><span>Selected stop</span></div><button id="close-activity" type="button" hidden>Back to Whole Route</button></div>
  </section>
  <section class="journey-stage" id="build-stage" aria-labelledby="build-h"><h2 class="sec-h" id="build-h"><span>03</span> Build the Journey</h2><p id="journey-discovery-status" role="status">Choose a route to discover places for Rupert along the way.</p>
    <form id="anchor-form" class="anchor-form" hidden><label>Add a town or route-defining stop<input id="trip-anchor" maxlength="200" placeholder="For example, Nashville" required></label><button>Add to Trip</button><label class="anchor-overnight"><input id="anchor-overnight" type="checkbox"> Stay overnight here</label></form>
    <section id="overnight-opportunities" hidden aria-labelledby="overnight-h"><h3 id="overnight-h">Overnight Opportunities</h3><p>A long drive needs travel days. Choose a town or area below, then confirm pet-friendly accommodation. Overnight stops are optional; the following travel day starts from your departure time with at least ten hours of rest.</p><div id="overnight-areas" class="activity-cards"></div></section>
    <div class="journey-discovery"><section><h3>Along the Route</h3><div id="route-activities"><p>Useful stops will appear around natural journey segments.</p></div></section><section class="destination-discovery"><h3>At the Destination</h3><div id="destination-activities"><p>Explore the destination after choosing a route.</p></div></section></div>
  </section>
  <section class="journey-stage trip-itinerary" id="itinerary-stage" aria-labelledby="itinerary-h"><h2 class="sec-h" id="itinerary-h"><span>04</span> Itinerary</h2><p id="trip-summary">Your selected activities will build the itinerary here.</p><p id="overnight-warning" hidden></p><ol id="selected-stops" class="selected-stops"></ol><div id="itinerary-legs" class="itinerary-legs"></div>
    <h3>Trip Table</h3><p class="clock-note">Arrival estimates use your departure clock throughout the journey; allow for local time-zone changes.</p><div class="table-scroll"><table><thead><tr><th>Leg</th><th>Route / activity</th><th>Mode</th><th>Duration</th><th>Stop</th><th>Arrival</th></tr></thead><tbody id="trip-table"><tr><td colspan="6">Map a trip to calculate drive times.</td></tr></tbody></table></div>
    <div class="journey-save"><label>Trip name<input id="trip-title" maxlength="160" placeholder="Optional name for this journey"></label><div class="travel-actions"><button type="button" id="save-trip">Save Trip</button><button type="button" id="new-trip">New Trip</button></div></div>
    <details class="travel-advanced"><summary>Advanced / Manual Legs</summary><p>Use manual legs for flights, ferries, trains, walking or a custom route. Applying manual legs replaces the automatic road itinerary.</p><ol id="trip-legs" class="trip-legs"></ol><div class="travel-actions"><button type="button" id="add-leg">Add Leg</button><button type="button" id="apply-legs">Apply Manual Legs</button></div></details>
  </section>
  <div class="journey-bottom"><section class="trip-library"><h2 class="sec-h">Saved Trips</h2><div id="saved-trips"></div><div class="travel-actions"><button id="export-trips" type="button">Export Backup</button><label class="import-label">Import Backup<input id="import-trips" type="file" accept="application/json,.json"></label></div></section>
    <details class="postcard-panel" open><summary>Travel Postcard</summary><figure id="journey-postcard" class="travel-postcard" hidden></figure><div class="postcard-controls"><label>Caption<input id="postcard-caption" maxlength="160" placeholder="Destination"></label><label class="import-label">Replace Artwork (optional)<input id="postcard-file" type="file" accept="image/jpeg,image/png,image/webp"></label><button id="remove-postcard" type="button" hidden>Use Automatic Artwork</button></div></details></div>
  <datalist id="travel-locations"><option value="Home"></option>${ctx.places.places.map(p=>`<option value="${esc(p.name)}"></option>`).join('')}${Object.values(ctx.places.reference_points || {}).map(p=>`<option value="${esc(p.label)}"></option>`).join('')}</datalist>
  <script type="application/json" id="travel-places">${JSON.stringify(ctx.places.places).replace(/</g,'\\u003c')}</script><script type="application/json" id="travel-references">${JSON.stringify(ctx.places.reference_points || {}).replace(/</g,'\\u003c')}</script><script type="application/json" id="travel-publications">${JSON.stringify((ctx.history||[]).filter(e=>new Date(e.published_at)<=(ctx.now||new Date())).map(e=>({place_id:e.flagship.place_id,id:e.id}))).replace(/</g,'\\u003c')}</script></div>`;
}

// Dated snapshots never claim to be a current observation. Preserve their original source/issue time.
export function weatherProvenance(conditions, sources = []) {
  if (!conditions?.as_of || !Number.isFinite(+new Date(conditions.as_of))) return '';
  const date = new Date(conditions.as_of);
  const source = conditions.source || sources.find(s => s.kind === 'forecast');
  const kind = conditions.kind || (/outlook/i.test(conditions.summary || '') ? 'outlook' : 'forecast');
  const label = kind === 'unavailable' ? 'Forecast unavailable · checked' : kind === 'outlook' ? 'Historical outlook · issued' : 'Forecast snapshot · issued';
  return `<p class="as-of">${label} ${esc(shortDate(nyDateString(date)))}, ${esc(nyTime(date))} ET${source?.url ? ` · <a href="${esc(source.url)}" rel="noopener">${esc(source.label)}</a>` : ''}</p>`;
}
