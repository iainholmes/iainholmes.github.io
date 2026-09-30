import { guidanceFor } from './adventure.js';
import { fetchDock } from './fetch-drawing.js';
import { CROWD_LEVELS, CROWD_TOLERANCES } from './crowds.js';
import { SEASONS, EXPERIENCES, seasonFor } from './options.js';
// HTML rendering. Pure string functions shared by the build tool (pre-render) and the browser (re-render).
// Every value from data passes through esc(). No DOM access here.
import { weekendRange, publishedLabel, shortDate, longDate, minutesRange, hoursRange, isoWeek, nyDateString, nyTime } from './dates.js';

import { expectedPublish } from './editions.js';

export const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const SLOT_LABEL = { tuesday: "Tuesday's choice", thursday: "Thursday's choice" };
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
    + ` style="${focalVars(p.width / p.height, fx, fy)}"`
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
  if (snap?.duration_h) bits.push(esc(hoursRange(snap.duration_h)) + ' on trail');
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
    <div class="dateline"><span>${esc(weekLabel)}</span></div>
    <p class="wordmark"><a href="${base}">The Rupert Atlas</a></p>
    <nav class="primary" aria-label="Sections"><ul>${navItems('nav-link')}</ul><a class="nav-archive" href="${base}archive/"${active === 'archive' ? ' aria-current="page"' : ''}>Archive</a></nav>
  </div>
</header>
<div class="bar" id="bar">
  <div class="wrap bar-inner">
    <a class="bar-mark" href="${base}">The Rupert Atlas</a>
    <nav class="bar-nav" aria-label="Sections, compact"><ul>${navItems('nav-link')}</ul></nav>
    <span class="bar-week">${esc(weekLabel.replace('Week ', 'Wk '))}</span>
  </div>
</div>
<main id="main" class="${pageClass}" tabindex="-1">
${body}
</main>
<footer class="utility-footer"><div class="wrap"><a href="${base}archive/">Archive</a><a href="${base}atlas/">Place directory</a><span>${esc((now || new Date()).getFullYear())}</span></div></footer>
<nav class="dock" aria-label="Sections, bottom"><ul>${NAV.map(n =>
    `<li><a href="${base}${n.href}"${n.key === active ? ' aria-current="page"' : ''}>${esc(n.label)}</a></li>`).join('')}</ul></nav>`;
}

export function weekLabelFor(dateStr) {
  const { year, week } = isoWeek(dateStr);
  return `Week ${week} · ${year} · ${SEASONS[seasonFor(dateStr)]}`;
}

/* ---------- This Week ---------- */

function plate(slot, ed, pair, ctx) {
  const { base, photos } = ctx;
  const id = `plate-${slot}`;
  if (!ed) {
    const when = pair.missing[slot] ? publishedLabel(pair.missing[slot]) : '';
    return `<article class="plate is-pending" id="${id}" data-slot="${slot}" aria-labelledby="${id}-h">
  <p class="p-eyebrow"><span class="p-day">${SLOT_LABEL[slot]}</span></p>
  <h2 class="p-title" id="${id}-h">${pair.state === 'past' ? 'Not published' : `Publishes ${esc(when)}`}</h2>
  <p class="p-stand">${slot === 'thursday'
      ? 'Weekend choice 2 of 2.'
      : 'Weekend choice 1 of 2.'}</p>
</article>`;
  }
  const f = ed.flagship;
  const href = `${base}edition/${esc(ed.id)}/`;
  const bits = routeBits(f.snapshot).map(b => `<li>${b}</li>`).join('');
  const adverse = f.condition_level === 'adverse';
  const cond = f.headline_condition ? `<li class="cond${adverse ? ' is-adverse' : ''}"><span class="cond-k">${adverse ? 'Warning' : 'Weather'}</span> ${esc(f.headline_condition)}</li>` : '';
  return `<article class="plate" id="${id}" data-slot="${slot}" aria-labelledby="${id}-h">
  <p class="p-eyebrow"><span class="p-day">${SLOT_LABEL[slot]}</span><span class="p-pub">Published ${esc(publishedLabel(ed.published_at))}</span></p>
  <h2 class="p-title" id="${id}-h"><a href="${href}">${esc(f.title)}</a></h2>
  <p class="p-stand">${esc(f.standfirst)}</p>
    <ul class="p-metrics" aria-label="Logistics">${bits}${cond}</ul>
  <figure class="p-photo">${photo(imageRef(f), photos, base, { sizes: '(min-width: 760px) 46vw, 100vw', eager: slot === 'tuesday' })}${credit(imageRef(f), photos, ctx.places)}</figure>

  <p class="p-more"><a href="${href}">Full edition<span class="vh"> for ${esc(f.title)}</span></a></p>
</article>`;
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
      <span class="tab-k">${SLOT_LABEL[slot]}</span><span class="tab-t">${ed ? esc(placeShort(places, ed.flagship.place_id, ed.flagship.title)) : 'Publishes ' + esc(publishedLabel(pair.missing[slot]))}</span></button>`;
  const inter = interlude(thu || tue, ctx);
  return `<section class="week" data-pair="${esc(pairKeyFrom(pair))}" aria-labelledby="week-h">
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

function pairKeyFrom(pair) {
  return [pair.weekend.start, pair.tuesday?.id || '-', pair.thursday?.id || '-', pair.state].join('|');
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
  const scale = (label, value) => {
    const index = CROWD_LEVELS.indexOf(value);
    return `<div class="crowd-line"><span>${label}</span><span class="crowd-scale" role="img" aria-label="${esc(label)}: ${esc(value || 'No crowd data')}">${CROWD_LEVELS.map((x,i)=>`<i class="${index >= i ? 'filled' : ''}"></i>`).join('')}</span><span>${esc(value || '—')}</span></div>`;
  };
  const facts = [['Quietest window',crowd?.low_crowd_window],['Peak',crowd?.peak_period],['Dogs',crowd?.dog_density],['Attendance',crowd?.attendance],['Weekdays / weekends',crowd?.weekend_vs_weekday],['Foot traffic',crowd?.foot_traffic]].filter(([,v])=>v);
  return `<div class="crowd-visual">${scale('Typical crowd',crowd?.typical_level)}${scale('Perceived crowding',crowd?.perceived_crowding)}<div class="crowd-key"><span>Quiet</span><span>Busy</span></div>${facts.length ? `<dl class="facts">${facts.map(([k,v])=>`<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : ''}${!crowd?.typical_level && !crowd?.perceived_crowding ? '<p class="as-of">No crowd data recorded.</p>' : ''}</div>`;
}

/* ---------- full edition ---------- */

export function renderEdition(ed, ctx, sibling) {
  const { base, photos, places } = ctx;
  const f = ed.flagship, s = f.snapshot || {};
  const panels = guidanceFor(f);
  const place = (places?.places || []).find(p => p.id === f.place_id);
  const ref = places?.reference_points?.[s.drive?.from];
  const fact = (k, v) => v ? `<div><dt>${k}</dt><dd>${v}</dd></div>` : '';
  const r = s.route || {};
  const facts = [
    fact('Distance', r.distance_mi ? `${esc(r.distance_mi)} mi ${esc(r.shape || '')}` : ''),
    fact('Climb', r.gain_ft ? `${esc(r.gain_ft)} ft gain` : r.climb_ft_approx ? `About ${esc(r.climb_ft_approx)} ft` : ''),
    fact('Difficulty', esc(r.difficulty)),
    fact('Surface', esc(r.surface)),
    fact('Time on trail', s.duration_h ? esc(hoursRange(s.duration_h)) : ''),
    fact('Drive', s.drive ? `${esc(minutesRange(s.drive.minutes))}<span class="fact-note">from ${esc(ref?.label || 'Chapel Hill')}</span>` : ''),
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
    return `<li id="${role}"><span>${ROLE_LABEL[role]}</span><a href="${base}atlas/#place-${esc(o.place_id)}">${esc(o.title)}</a><small>${esc(supportLine(o))}</small></li>`;
  };
  const corrections = (ed.corrections || []).length
    ? `<section class="ed-corrections"><h2 class="sec-h">Corrections</h2><ul>${ed.corrections.map(c => `<li><span class="data">${esc(c.at)}</span> ${esc(c.note)}</li>`).join('')}</ul></section>` : '';
  const sib = sibling && new Date(sibling.published_at) <= (ctx.now || new Date())
    ? `<p class="ed-sibling"><span class="lbl">The other choice for this weekend</span><a href="${base}edition/${esc(sibling.id)}/">${esc(SLOT_LABEL[sibling.slot])}: ${esc(sibling.flagship.title)}</a></p>` : '';

  return `<article class="edition" aria-labelledby="ed-h">
  <header class="ed-head wrap">
    <div class="ed-heading"><p class="ed-eyebrow"><span class="p-day">${SLOT_LABEL[ed.slot]}</span><span>For the weekend of ${esc(weekendRange(ed.weekend.start, ed.weekend.end))}</span></p>
    <h1 id="ed-h">${esc(f.title)}</h1>
    <p class="ed-stand">${esc(f.standfirst)}</p>
    <p class="ed-pub">Published ${esc(publishedLabel(ed.published_at))} · ${esc(nyTime(new Date(ed.published_at)))} ET · Weekend choice ${ed.slot === 'tuesday' ? 1 : 2} of 2</p></div>
    ${marginNote("The outing", `${esc(place?.short_name || f.title)}<br>${esc(s.access?.name || '')}`, `<a href="${base}atlas/#place-${esc(f.place_id)}">Find it in the Atlas →</a>`)}
  </header>
  <div class="ed-feature wrap"><figure class="ed-hero${f.artwork ? ' adventure-illustration' : ''}">${photo(imageRef(f), photos, base, { sizes: '(min-width: 1024px) 65vw, 100vw', eager: true })}${credit(imageRef(f), photos, places)}</figure>
    <aside class="ed-companion"><h2 class="sec-h">Outing overview</h2><ul class="feature-facts">${routeBits(s).map(x => `<li>${x}</li>`).join('')}</ul><p class="overview-window">${esc(ed.practical?.best_window || '')}</p><dl class="facts">${fact('Route',esc(r.difficulty))}${fact('Start',esc(s.access?.name))}</dl></aside></div>
  <div class="ed-body wrap">
    <div class="ed-main">
      <section><h2 class="sec-h">Why this week</h2><p>${esc(f.why_this_week)}</p></section>
      <section class="ed-conditions"><h2 class="sec-h">Conditions</h2><p>${esc(ed.conditions?.summary)}</p>
        ${ed.conditions?.pivot ? `<div class="pivot${ed.flagship.condition_level === 'adverse' ? ' is-adverse' : ''}"><p class="pivot-k">If it turns</p><p><strong>${esc(ed.conditions.pivot.if)}:</strong> ${esc(ed.conditions.pivot.note)}${pivotTarget ? ` <span class="pivot-to">Go to: ${esc(pivotTarget.title)}</span>` : ''}</p></div>` : ''}
        <p class="as-of">Forecast as of ${esc(shortDate(nyDateString(new Date(ed.conditions.as_of))))}, ${esc(nyTime(new Date(ed.conditions.as_of)))} ET</p></section>
      <div class="ed-fun">
        ${panels.map(p => `<section><h2 class="sec-h">${esc(p.label)}</h2><p class="fun-text">${esc(p.text)}</p></section>`).join('')}

      </div>
      <section class="contingency"><h2 class="sec-h">If plans change</h2><ul class="fallbacks">${outing('local_trail')}${outing('away_mission')}${outing('wildcard')}</ul></section>
      <section class="memory-prompt"><h2 class="sec-h">Memory prompt</h2><p>${esc(ed.memory_prompt?.text)}</p></section>
      ${corrections}
      <section class="ed-sources"><h2 class="sec-h">Sources</h2><ul>${(f.sources || []).map(x => `<li><a href="${esc(x.url)}" rel="noopener">${esc(x.label)}</a> <span class="data">retrieved ${esc(x.retrieved)}</span></li>`).join('')}</ul>
        <p class="as-of">Place details as recorded ${esc(shortDate(s.as_of))}. They stay as published even if the place's record is corrected later.</p></section>
    </div>
    <aside class="ed-sheet" aria-label="Trail facts">
      <section><h2 class="sec-h">The route</h2><dl class="facts">${facts}</dl></section>
      ${dog ? `<section><h2 class="sec-h">Dog access</h2><dl class="facts">${dog}</dl></section>` : ''}
      <section><h2 class="sec-h">Crowd &amp; foot traffic</h2>${crowdVisual(s.crowd)}</section>
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
  const cards = groups.map(g => `<section class="archive-week"><h2>${esc(weekendRange(g.weekend.start,g.weekend.end))}${g.editions.some(e=>e.current)?'<span class="arch-now">This Week</span>':''}</h2><div class="archive-results">${['tuesday','thursday'].map(slot=>{
    const e=g.editions.find(e=>e.slot===slot), publish=expectedPublish(slot,g.weekend.start);
    if(!e) return `<article class="archive-card is-missing"><p class="p-day">${SLOT_LABEL[slot]}</p><p>${publish > (ctx.now || new Date()) ? 'Publishes '+esc(publishedLabel(publish.toISOString())) : 'Not published'}</p></article>`;
    const option={...(e.options?.find(o=>o.role==='flagship') || {}),title:e.title,place_name:(places?.places||[]).find(p=>p.id===e.place_id)?.name || ''};
    return `<article class="archive-card" data-option="${esc(JSON.stringify(option))}"><a href="${base}edition/${esc(e.id)}/" class="archive-image" tabindex="-1" aria-hidden="true">${photo(e.photo_id?{id:e.photo_id}:null,photos,base,{sizes:'(min-width: 760px) 42vw, 90vw'})}</a><div><p class="p-day">${SLOT_LABEL[slot]} · ${esc(publishedLabel(e.published_at))}</p><h3><a href="${base}edition/${esc(e.id)}/">${esc(e.title)}</a></h3><p class="arch-meta">${esc(option.place_name)}</p></div></article>`;
  }).join('')}</div></section>`).join('');
  return `<div class="archive wrap"><header class="page-head"><h1>Archive</h1></header><form class="archive-filters" hidden role="search"><label>Search<input type="search" name="query" placeholder="Place or activity"></label><label>Season<select name="season"><option value="">All seasons</option>${Object.entries(SEASONS).map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select></label><label>Activity<select name="experience"><option value="">All activities</option>${Object.entries(EXPERIENCES).map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select></label><label>Crowd<select name="crowd">${Object.entries(CROWD_TOLERANCES).map(([v,l])=>`<option value="${v}"${v==='any'?' selected':''}>${l}</option>`).join('')}</select></label><button type="reset">Clear</button></form><p class="archive-count" role="status" aria-live="polite"></p><p class="archive-empty" hidden>No editions match these filters.</p>${cards || '<p>No editions published.</p>'}</div>`;
}

/* ---------- section placeholders (milestone 1 honesty pages) ---------- */

function weekendShort(a, b) {
  const M = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const [, m1, d1] = a.split('-').map(Number), [, m2, d2] = b.split('-').map(Number);
  return m1 === m2 ? `${d1}–${d2} ${M[m1 - 1]}` : `${d1} ${M[m1 - 1]}–${d2} ${M[m2 - 1]}`;
}

export const MARK_SVG = {
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
  const STAT = { walked: 'Walked', recommended: 'Recommended', planned: 'Planned', register: 'In the directory' };
  const row = p => {
    const st = model.statuses.get(p.id);
    const r = p.routes?.[0];
    const meta = [r ? `${r.distance_mi} mi ${r.shape}` : null, r?.difficulty, p.dog_policy].filter(Boolean).map(esc).join(' · ');
    const start = p.access ? `<p class="reg-start">Start: ${esc(p.access.name)}${p.access.coords_verified ? '' : ' <span class="reg-approx">· pin approximate</span>'}</p>` : '';
    const eds = st.editions.map(e => `<a href="${base}edition/${esc(e.id)}/">${esc(e.label)}, ${esc(weekendShort(e.weekend.start, e.weekend.end))}</a>`).join('; ');
    return `<li class="reg-row" id="place-${esc(p.id)}" data-place="${esc(p.id)}" data-status="${st.status}">
      ${MARK_SVG[st.status]}
      <div class="reg-main">
        <h4>${esc(p.name)}</h4>
        <p class="reg-meta">${meta}</p>${start}
        <p class="reg-status"><span class="reg-word">${STAT[st.status]}</span>${eds ? ` · ${eds}` : ''}</p>
      </div>
      <button type="button" class="reg-show" data-show="${esc(p.id)}" hidden>Show on map</button>
    </li>`;
  };
  const groups = model.groups.map(g => `<section class="reg-group" data-region="${esc(g.region)}">
      <h3 class="reg-region">${esc(g.region)}</h3><ul class="reg">${g.places.map(row).join('')}</ul></section>`).join('');
  const c = model.counts;
  const legend = ['recommended', 'walked', 'planned', 'register']
    .map(k => `<li>${MARK_SVG[k]}<span>${STAT[k]}</span></li>`).join('');
  return `<div class="atlas">
  <header class="page-head wrap"><div><h1>Atlas</h1></div></header>
  <div class="wrap"><details class="location-settings"><summary>Home &amp; driving routes</summary>
    <p>Home stays in this browser. Map providers receive the visible map area; home is never published.</p>
    <form id="address-form"><label>Home address<input name="address" autocomplete="street-address" maxlength="240" required placeholder="Street, town, state, ZIP"></label><button>Locate with OpenStreetMap</button></form><p class="season-note">Locating sends the address to OpenStreetMap’s Nominatim service. Check the returned coordinates below before saving home. You can also enter coordinates directly.</p>
    <form id="location-form"><label>Latitude<input name="lat" type="number" step="any" min="-85" max="85" required></label><label>Longitude<input name="lng" type="number" step="any" min="-180" max="180" required></label><button>Save home</button><button type="button" id="forget-location">Forget home</button></form>
    <label class="routing-choice"><input type="checkbox" id="routing-enabled"> Enable driving routes: OSRM receives your home and selected trailhead coordinates. Estimates exclude live traffic.</label><p id="location-status" role="status"></p>
  </details></div>
  <div class="atlas-body wrap">
    <section class="atlas-map" aria-label="Map of places">
      <div class="map-canvas" id="map"></div>
      <p id="drive-status" class="drive-status" role="status" aria-live="polite">Select a place to plan the drive.</p>
      <div class="map-state" id="map-state" role="status"><span class="ridge" aria-hidden="true"></span>
        <p id="map-msg">Enable JavaScript for the map.</p></div>
      <ul class="map-legend" aria-label="Legend">${legend}</ul>
      <div class="map-tools" hidden><button type="button" id="relief" aria-pressed="false">Relief</button><button type="button" id="recenter">Home view</button></div>
      <div class="map-card" id="map-card" hidden></div>
    </section>
    <section class="atlas-register" aria-labelledby="reg-h">
      <div class="reg-head"><h2 id="reg-h">Place directory</h2>
        <div class="reg-filter" role="group" aria-label="Show places" hidden>
          <button type="button" data-filter="all" aria-pressed="true">All <span>${c.all}</span></button>
          <button type="button" data-filter="recommended" aria-pressed="false"${c.recommended ? '' : ' disabled'}>Recommended <span>${c.recommended}</span></button>
          <button type="button" data-filter="walked" aria-pressed="false"${c.walked ? '' : ' disabled'}>Walked <span>${c.walked}</span></button>
        </div></div>
      ${groups}
    </section>
  </div>
  <script type="application/json" id="atlas-data">${JSON.stringify({ features: model.features, bounds: model.bounds }).replace(/</g, '\\u003c')}</script>
</div>`;
}

export function renderComing(kind, ctx) {
  return `<div class="wrap coming"><header class="page-head"><h1>Field Log</h1></header><noscript>Enable JavaScript to record outings.</noscript></div>`;
}

export function renderTravel(ctx) {
  return `<div class="travel wrap"><header class="page-head"><h1>Travel</h1><p class="page-note">Route, stops and destination activities.</p></header>
  <noscript>Enable JavaScript to plan a trip.</noscript>
  <div class="travel-grid"><section class="travel-editor"><h2 class="sec-h">Trip plan</h2><label>Trip name<input id="trip-title" maxlength="160" placeholder="Trip name"></label><div class="trip-dates"><label>Start date<input id="trip-start" type="date"></label><label>End date<input id="trip-end" type="date"></label></div>
  <ol id="trip-legs" class="trip-legs"></ol><div class="travel-actions"><button type="button" id="add-leg">Add leg</button><button type="button" id="save-trip">Save plan</button><button type="button" id="new-trip">New plan</button></div><p id="trip-status" role="status" aria-live="polite"></p>
  <details class="travel-privacy"><summary>Location &amp; storage</summary><p>Plans and home coordinates stay in this browser. Export a backup before clearing browser data.</p><p>With route lookup enabled, OpenStreetMap Nominatim receives typed locations and OSRM receives route coordinates; OpenStreetMap Overpass receives destination coordinates for nearby-place searches. Map providers receive the visible map area. Nothing is published.</p></details>
  <section class="trip-library"><h2 class="sec-h">Saved trips</h2><div id="saved-trips"></div><div class="travel-actions"><button id="export-trips" type="button">Export backup</button><label class="import-label">Import backup<input id="import-trips" type="file" accept="application/json,.json"></label></div></section></section>
  <section class="travel-workspace"><div class="travel-route-controls"><label class="routing-choice"><input id="trip-routing" type="checkbox"> Enable route lookup</label><button id="map-trip" type="button">Map trip</button><button id="fit-trip" type="button">Fit route</button></div><div class="trip-map" aria-label="Trip map"><div id="travel-map" class="map-canvas"></div><p id="trip-map-status" role="status">Loading map…</p><div class="trip-map-key"><span>Drive</span><span>Flight / ferry / train</span><span>Stop</span></div></div>
  <section class="trip-itinerary"><div class="itinerary-head"><h2 class="sec-h">Trip table</h2><label>Departure time<input id="trip-depart" type="time" value="09:00"></label><label>Break every<select id="break-every"><option value="120">2 hours</option><option value="90">90 minutes</option><option value="180">3 hours</option><option value="0">No planned breaks</option></select></label></div><p id="trip-summary"></p><div class="table-scroll"><table><thead><tr><th>Leg</th><th>Route</th><th>Mode</th><th>Travel</th><th>Stop / break</th><th>Arrival</th></tr></thead><tbody id="trip-table"><tr><td colspan="6">Map a trip to calculate drive times.</td></tr></tbody></table></div></section>
  <div class="trip-activities"><section><h2 class="sec-h">Along the route</h2><label>Maximum detour<select id="trip-detour"><option value="10">10 minutes</option><option value="20" selected>20 minutes</option><option value="40">40 minutes</option></select></label><div id="route-activities"><p>Map a driving leg to find stops.</p></div></section><section><h2 class="sec-h">At the destination</h2><div id="destination-activities"><p>Map the destination to find nearby places.</p></div></section></div>
  <details class="postcard-panel"><summary>Travel postcard</summary><figure id="journey-postcard" class="travel-postcard" hidden></figure><div class="postcard-controls"><label>Caption<input id="postcard-caption" maxlength="160" placeholder="Destination"></label><label class="import-label">Add illustration<input id="postcard-file" type="file" accept="image/jpeg,image/png,image/webp"></label><button id="remove-postcard" type="button" hidden>Remove postcard</button></div></details></section></div>
  <datalist id="travel-locations"><option value="Home"></option>${ctx.places.places.map(p=>`<option value="${esc(p.name)}"></option>`).join('')}${Object.values(ctx.places.reference_points || {}).map(p=>`<option value="${esc(p.label)}"></option>`).join('')}</datalist>
  <script type="application/json" id="travel-places">${JSON.stringify(ctx.places.places).replace(/</g,'\\u003c')}</script><script type="application/json" id="travel-references">${JSON.stringify(ctx.places.reference_points || {}).replace(/</g,'\\u003c')}</script></div>`;
}
