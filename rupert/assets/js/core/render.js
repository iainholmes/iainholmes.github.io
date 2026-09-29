// HTML rendering. Pure string functions shared by the build tool (pre-render) and the browser (re-render).
// Every value from data passes through esc(). No DOM access here.
import { weekendRange, publishedLabel, shortDate, longDate, minutesRange, hoursRange, isoWeek, nyDateString, nyTime } from './dates.js';

export const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const SLOT_LABEL = { tuesday: "Tuesday's choice", thursday: "Thursday's choice" };
const ROLE_LABEL = { local_trail: 'Local Trail', away_mission: 'Away Mission', wildcard: 'Wildcard' };
const MEMORY_KIND = { photo: 'photograph', video: 'ten-second video', observation: 'observation', object: 'something to keep', note: 'short note' };

export const NAV = [
  { key: 'week', label: 'This Week', href: '' },
  { key: 'atlas', label: 'Atlas', href: 'atlas/' },
  { key: 'travel', label: 'Travel', href: 'travel/' },
  { key: 'log', label: 'Field Log', href: 'log/' },
];

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
  const clock = site?.review_clock
    ? `<div class="review-band" role="note"><span class="rb-long">Prototype · clock set to ${esc(shortDate(nyDateString(new Date(site.review_clock))))}, ${esc(nyTime(new Date(site.review_clock)))} ET so both choices show</span><span class="rb-short">Prototype · clock set to ${esc(shortDate(nyDateString(new Date(site.review_clock))))}</span><span class="rb-mast" hidden> · Masthead <button type="button" data-mast="b" aria-pressed="true">B · single line (default)</button> <button type="button" data-mast="a" aria-pressed="false">A · two lines</button></span></div>`
    : '';
  return `${clock}<a class="skip" href="#main">Skip to content</a>
<header class="masthead" id="masthead">
  <div class="wrap">
    <div class="dateline"><span>Chapel Hill, N.C. · Est. 2026</span><span>${esc(weekLabel)}</span></div>
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
<footer class="colophon">
  <div class="wrap colophon-inner">
    <p class="colophon-mark">The Rupert Atlas</p>
    <p>A record of places, routes and weekends with Rupert, a chocolate Labrador. Chapel Hill, N.C.</p>
    <p><a href="${base}archive/">Archive of editions</a></p>
  </div>
</footer>
<nav class="dock" aria-label="Sections, bottom"><ul>${NAV.map(n =>
    `<li><a href="${base}${n.href}"${n.key === active ? ' aria-current="page"' : ''}>${esc(n.label)}</a></li>`).join('')}</ul></nav>`;
}

export function weekLabelFor(dateStr) {
  const { year, week } = isoWeek(dateStr);
  return `Week ${week} · ${year}`;
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
  const row = (k, v, extra = '', cls = '') => `<div class="row ${cls}"><dt>${k}</dt><dd>${v}${extra ? `<span class="row-meta">${esc(extra)}</span>` : ''}</dd></div>`;
  const support = ['local_trail', 'away_mission', 'wildcard'].filter(r => ed[r])
    .map(r => row(ROLE_LABEL[r], esc(ed[r].title), supportLine(ed[r]))).join('');
  const mission = ed.mission ? row("Rupert's Mission", esc(ed.mission.text), '', 'fun') : '';
  const memory = ed.memory_prompt ? row(`Memory Prompt`, esc(ed.memory_prompt.text), MEMORY_KIND[ed.memory_prompt.kind] || '', 'fun') : '';
  return `<article class="plate" id="${id}" data-slot="${slot}" aria-labelledby="${id}-h">
  <p class="p-eyebrow"><span class="p-day">${SLOT_LABEL[slot]}</span><span class="p-pub">Published ${esc(publishedLabel(ed.published_at))}</span></p>
  <h2 class="p-title" id="${id}-h"><a href="${href}">${esc(f.title)}</a></h2>
  <p class="p-stand">${esc(f.standfirst)}</p>
  <ul class="p-metrics" aria-label="Logistics">${bits}${cond}</ul>
  <figure class="p-photo">${photo(f.photo, photos, base, { sizes: '(min-width: 760px) 46vw, 100vw', eager: slot === 'tuesday' })}${credit(f.photo, photos, ctx.places)}</figure>
  <dl class="p-ledger">${support}${mission}${memory}</dl>
  <p class="p-more"><a href="${href}">Full edition<span class="vh"> for ${esc(f.title)}</span></a> <span class="p-more-note">dog notes, parking, the plan if it rains</span></p>
</article>`;
}

export function renderWeek(pair, editions, ctx) {
  if (!pair) {
    return `<section class="week wrap" data-pair="none"><header class="weekband"><h1>The first editions are on their way</h1></header></section>`;
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
    <p class="wb-note">Two choices for one weekend.</p>
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

/* ---------- full edition ---------- */

export function renderEdition(ed, ctx, sibling) {
  const { base, photos, places } = ctx;
  const f = ed.flagship, s = f.snapshot || {};
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
    return `<li class="outing"><p class="outing-k">${ROLE_LABEL[role]}</p><h3>${esc(o.title)}</h3><p>${esc(o.line)}</p><p class="outing-meta">${esc(supportLine(o))}</p></li>`;
  };
  const corrections = (ed.corrections || []).length
    ? `<section class="ed-corrections"><h2 class="sec-h">Corrections</h2><ul>${ed.corrections.map(c => `<li><span class="data">${esc(c.at)}</span> ${esc(c.note)}</li>`).join('')}</ul></section>` : '';
  const sib = sibling
    ? `<p class="ed-sibling"><span class="lbl">The other choice for this weekend</span><a href="${base}edition/${esc(sibling.id)}/">${esc(SLOT_LABEL[sibling.slot])}: ${esc(sibling.flagship.title)}</a></p>` : '';

  return `<article class="edition" aria-labelledby="ed-h">
  <header class="ed-head wrap">
    <p class="ed-eyebrow"><span class="p-day">${SLOT_LABEL[ed.slot]}</span><span>For the weekend of ${esc(weekendRange(ed.weekend.start, ed.weekend.end))}</span></p>
    <h1 id="ed-h">${esc(f.title)}</h1>
    <p class="ed-stand">${esc(f.standfirst)}</p>
    <p class="ed-pub">Published ${esc(publishedLabel(ed.published_at))} · ${esc(nyTime(new Date(ed.published_at)))} ET · Weekend choice ${ed.slot === 'tuesday' ? 1 : 2} of 2</p>
  </header>
  <figure class="ed-hero">${photo(f.photo, photos, base, { sizes: '100vw', eager: true })}${credit(f.photo, photos, places)}</figure>
  <div class="ed-body wrap">
    <div class="ed-main">
      <section><h2 class="sec-h">Why this week</h2><p>${esc(f.why_this_week)}</p></section>
      <section class="ed-conditions"><h2 class="sec-h">Conditions</h2><p>${esc(ed.conditions?.summary)}</p>
        ${ed.conditions?.pivot ? `<div class="pivot${ed.flagship.condition_level === 'adverse' ? ' is-adverse' : ''}"><p class="pivot-k">If it turns</p><p><strong>${esc(ed.conditions.pivot.if)}:</strong> ${esc(ed.conditions.pivot.note)}${pivotTarget ? ` <span class="pivot-to">Go to: ${esc(pivotTarget.title)}</span>` : ''}</p></div>` : ''}
        <p class="as-of">Forecast as of ${esc(shortDate(nyDateString(new Date(ed.conditions.as_of))))}, ${esc(nyTime(new Date(ed.conditions.as_of)))} ET</p></section>
      <section class="ed-fun">
        ${ed.mission ? `<div><h2 class="sec-h">Rupert's Mission</h2><p class="fun-text">${esc(ed.mission.text)}</p></div>` : ''}
        ${ed.memory_prompt ? `<div><h2 class="sec-h">Memory Prompt <span class="kind">${esc(MEMORY_KIND[ed.memory_prompt.kind] || '')}</span></h2><p class="fun-text">${esc(ed.memory_prompt.text)}</p></div>` : ''}
      </section>
      <section><h2 class="sec-h">Also this weekend</h2><ul class="outings">${outing('local_trail')}${outing('away_mission')}${outing('wildcard')}</ul></section>
      ${corrections}
      <section class="ed-sources"><h2 class="sec-h">Sources</h2><ul>${(f.sources || []).map(x => `<li><a href="${esc(x.url)}" rel="noopener">${esc(x.label)}</a> <span class="data">retrieved ${esc(x.retrieved)}</span></li>`).join('')}</ul>
        <p class="as-of">Place details as recorded ${esc(shortDate(s.as_of))}. They stay as published even if the place's record is corrected later.</p></section>
    </div>
    <aside class="ed-sheet" aria-label="Trail facts">
      <h2 class="sec-h">The route</h2><dl class="facts">${facts}</dl>
      ${dog ? `<h2 class="sec-h">For Rupert</h2><dl class="facts">${dog}</dl>` : ''}
      <h2 class="sec-h">Practical</h2><dl class="facts">${practical}</dl>
      ${place?.links?.length ? `<p class="sheet-links">${place.links.map(l => `<a href="${esc(l.url)}" rel="noopener">${esc(l.label)}</a>`).join('<br>')}</p>` : ''}
    </aside>
  </div>
  <footer class="ed-foot wrap">${sib}<p><a href="${base}">Back to This Week</a> · <a href="${base}archive/">Archive</a></p></footer>
</article>`;
}

/* ---------- archive ---------- */

export function renderArchive(groups, ctx) {
  const { base, photos, places } = ctx;
  const placeName = id => (places?.places || []).find(p => p.id === id)?.short_name || '';
  const ed = (g, slot) => {
    const e = g.editions.find(x => x.slot === slot);
    if (!e) return `<li class="arch-ed is-missing"><span class="arch-thumb" aria-hidden="true"></span><div><span class="p-day">${SLOT_LABEL[slot]}</span><h4>Not published</h4></div></li>`;
    const img = photo(e.photo_id ? { id: e.photo_id, alt: '' } : null, photos, base, { sizes: '132px' });
    return `<li class="arch-ed"><a class="arch-thumb" href="${base}edition/${esc(e.id)}/" tabindex="-1" aria-hidden="true">${img}</a>
      <div><span class="p-day">${SLOT_LABEL[slot]}</span><h4><a href="${base}edition/${esc(e.id)}/">${esc(e.title)}</a></h4>
      <p class="arch-meta">${esc(placeName(e.place_id))}${placeName(e.place_id) ? ' · ' : ''}Published ${esc(publishedLabel(e.published_at))}</p></div></li>`;
  };
  let year = null, out = '';
  for (const g of groups) {
    const y = g.weekend.start.slice(0, 4);
    if (y !== year) { out += `<h2 class="arch-year">${esc(y)}</h2>`; year = y; }
    const now = g.editions.some(e => e.current);
    out += `<article class="arch-week" aria-labelledby="w-${esc(g.weekend.start)}">
      <div class="arch-when"><h3 id="w-${esc(g.weekend.start)}">${esc(weekendRange(g.weekend.start, g.weekend.end))}</h3>${now ? '<span class="arch-now">On This Week now</span>' : ''}</div>
      <ul class="arch-pair">${ed(g, 'tuesday')}${ed(g, 'thursday')}</ul></article>`;
  }
  return `<div class="archive wrap"><header class="page-head"><p class="wb-eyebrow">Every edition, by weekend</p><h1>Archive</h1>
    <p class="page-note">Each weekend had two choices, published Tuesday and Thursday. Every edition keeps the details as they stood when it was published.</p></header>${out || '<p>No editions yet.</p>'}</div>`;
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
  const STAT = { walked: 'Walked', recommended: 'Recommended', planned: 'Planned', register: 'In the register' };
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
  <header class="page-head wrap"><p class="wb-eyebrow">The Atlas</p><h1>Places</h1>
    <p class="page-note">Every place recommended, walked or planned. Pins mark public trailheads and parking, checked against park and preserve listings. Places marked "pin approximate" are still to be confirmed. No pin marks a home.</p></header>
  <div class="atlas-body wrap">
    <section class="atlas-map" aria-label="Map of places">
      <div class="map-canvas" id="map"></div>
      <div class="map-state" id="map-state" role="status"><span class="ridge" aria-hidden="true"></span>
        <p id="map-msg">The map needs JavaScript. The register lists every place.</p></div>
      <ul class="map-legend" aria-label="Legend">${legend}</ul>
      <div class="map-tools" hidden><button type="button" id="relief" aria-pressed="false">Relief</button></div>
      <div class="map-card" id="map-card" hidden></div>
    </section>
    <section class="atlas-register" aria-labelledby="reg-h">
      <div class="reg-head"><h2 id="reg-h">Register</h2>
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
  const copy = {
    travel: ['Travel', 'Trips as ordered legs: a flight, a drive, a ferry. Worthwhile stops are suggested for drives only. The first version takes manual stops. Detour times come later from a routing service, and the page will say which service sees which points before any are sent. Plans stay in this browser and never reach the public site.'],
    log: ['Field Log', 'A record of each outing: the date, notes, what Rupert loved, what you loved, whether to go back, and photographs. It opens once backup and full restore have been tested end to end. Entries stay private in this browser until you approve specific fields and photographs for publication.'],
  }[kind];
  return `<div class="wrap coming"><header class="page-head"><p class="wb-eyebrow">In preparation</p><h1>${copy[0]}</h1><p class="page-note">${copy[1]}</p></header>
    <p><a href="${ctx.base}">Back to This Week</a></p></div>`;
}
