import { readFile, writeFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const config = JSON.parse(await readFile(new URL('projects.json', root), 'utf8'));
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const arrow = '<svg class="arrow" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true" focusable="false"><path d="M5 19 19 5M9 5h10v10M5 10v9h9"/></svg>';
const number = i => String(i + 1).padStart(2, '0');
const link = (url, label, cls = '') => `<a class="${cls}" href="${escape(url)}">${escape(label)}${arrow}</a>`;
const disclosure = (label, body) => `<details class="context"><summary>${escape(label)}<span class="disclosure-sign" aria-hidden="true"></span></summary><div class="context-body">${body}</div></details>`;

// Pinned, trusted repository assets, not remote markup. Embedding the exact
// archived SVG lets its original text use the page's self-hosted editorial fonts.
const covers = new Map(await Promise.all(config.projects.flatMap(p => p.publications || []).map(async p => [p.id, await readFile(new URL(p.asset, root), 'utf8')])));

// Original decorative engravings are local, script-free vectors. CurrentColor
// connects each one to its application's palette without altering source artwork.
const illustrationNames = ['field-fish','loblolly-sprig','workbook-volumes','advisor-dividers','qst-instruments','atlas-bearing','academic-arcade'];
const illustrations = new Map(await Promise.all(illustrationNames.map(async name => [name, await readFile(new URL(`assets/illustrations/${name}.svg`,root),'utf8')])));
const plate = (name, cls) => `<div class="editorial-illustration ${cls}" data-illustration="${name}" aria-hidden="true">${illustrations.get(name)}</div>`;
const publicationPlates = {'field-brief':'field-fish',loblolly:'loblolly-sprig',workbook:'workbook-volumes'};

const authenticPublication = p => `<article class="publication ${escape(p.id)}" aria-labelledby="${escape(p.id)}-title">
  <a class="publication-main" href="${escape(p.url)}" aria-labelledby="${escape(p.id)}-title ${escape(p.id)}-open">
    <div class="publication-heading"><span class="publication-cadence">${escape(p.schedule)}</span><h4 id="${escape(p.id)}-title">${escape(p.name)}</h4></div>
    <figure class="publication-cover"><div class="cover-art">${covers.get(p.id)}</div><figcaption>Archive · <time datetime="${escape(p.archiveDate)}">${escape(p.archiveLabel)}</time></figcaption></figure>
    <p class="publication-description">${escape(p.description)}</p>
    <span class="publication-open" id="${escape(p.id)}-open">Open publication${arrow}</span>
  </a>
</article>`;

const render = p => {
  const e = Object.fromEntries(Object.entries(p).filter(([,v]) => typeof v === 'string').map(([k,v]) => [k,escape(v)]));
  switch (p.presentation) {
    case 'advisor': return `<article class="advisor destination" aria-labelledby="advisor-title">
      <a class="destination-link" href="${e.url}" aria-labelledby="advisor-title advisor-action">
        <div class="advisor-top"><span class="native-label">Research design</span><img src="${e.asset}" width="52" height="52" alt="" aria-hidden="true"></div>
        <h3 id="advisor-title">Econometric<br>Advisor</h3><p class="advisor-description">${e.description}</p>
        <div class="advisor-study"><ol class="design-path" aria-label="Research-design workflow">${p.workflow.map((v,i)=>`<li><span class="path-number" aria-hidden="true">${number(i)}</span><div><strong>${escape(v.name)}</strong><span>${escape(v.detail)}</span></div></li>`).join('')}</ol></div>
        <span class="open-line" id="advisor-action">${e.action}${arrow}</span>
      </a>
      ${disclosure('Inside Advisor', '<p>Start with your research question and data. The assessment connects your design to a methods toolkit and an interactive knowledge graph.</p><dl class="context-list"><div><dt>Develop</dt><dd>Identification, estimating equations and diagnostics.</dd></div><div><dt>Take away</dt><dd>A research-design brief, methods appendix or reviewer reference.</dd></div></dl>')}
    </article>`;
    case 'qst': return `<article class="qst destination" aria-labelledby="qst-title">
      <a class="destination-link" href="${e.url}" aria-labelledby="qst-title qst-action">
        <div class="qst-introduction"><div class="qst-top"><h3 id="qst-title"><span class="qst-initials">${e.shortName}</span><span class="qst-full">${e.name}</span></h3><span class="native-label">Quantitative practice</span></div>
        <p class="qst-description">${e.description}</p></div>
        <ul class="language-strip" aria-label="Available languages">${p.languages.map((v,i)=>`<li class="language language-${i}">${escape(v)}</li>`).join('')}</ul>
        <ol class="learning-sequence" aria-label="Learning sequence">${p.sequence.map((v,i)=>`<li><span class="phase-number" aria-hidden="true">${number(i)}</span><strong>${escape(v.name)}</strong><span class="phase-detail">${escape(v.detail)}</span></li>`).join('')}</ol>
        <span class="open-line" id="qst-action">${e.action}${arrow}</span>
      </a>
      ${disclosure('Explore the learning path', `<ol class="curriculum-list">${p.tiers.map(v=>`<li>${escape(v)}</li>`).join('')}</ol><p>Choose a language and module. Read the lesson, work in your own coding environment, then bring your code and output back for feedback.</p>`)}
    </article>`;
    case 'periodicals': return `<div class="periodicals">
      <div class="publication-head" data-publication-heading hidden><div><h3 id="periodicals-title">${link(p.url, p.name)}</h3><p>${e.description}</p></div><span class="native-label">The reading shelf</span></div>
      <div class="publication-shelf">${p.publications.map(item => work(item, 'reading', authenticPublication(item))).join('\n')}</div>
      <div class="shelf-footer">${link(p.url, 'Browse Periodicals', 'shelf-link')}
      ${disclosure('Publication notes', '<dl class="context-list"><div><dt>Field Brief · Every day</dt><dd>Five consequential developments, including weekends.</dd></div><div><dt>Loblolly &amp; Logit · Fridays</dt><dd>Research readings, synthesis and a cumulative methods notebook.</dd></div><div><dt>The Workbook · Weekdays</dt><dd>Economics problems with assistance and worked explanations.</dd></div></dl><p class="archive-note">The publication covers are selections from the archive. Each publication opens at its home, where current and earlier editions are available.</p>')}
      </div>
    </div>`;
    case 'rupert': return `<article class="rupert" aria-labelledby="rupert-title">
      <div class="rupert-layout">
        <figure class="rupert-artwork"><img class="rupert-art" src="${e.asset}" alt="${e.alt}" width="800" height="1000" loading="lazy"></figure>
        <div class="rupert-content"><div class="rupert-heading"><span class="native-label">A field guide</span><h3 id="rupert-title"><span>The</span> Rupert Atlas</h3><p>${e.description}</p></div>
          <nav class="rupert-links" aria-label="Rupert Atlas sections"><a href="${e.url}"><span><strong>This Week</strong><span>Tuesday &amp; Thursday</span></span>${arrow}</a>${p.links.map(v=>`<a href="${escape(v.url)}"><span><strong>${escape(v.name)}</strong><span>${escape(v.detail)}</span></span>${arrow}</a>`).join('')}</nav>
        </div>
      </div>
      ${disclosure('A way into the Atlas', '<p>Start with <strong>This Week</strong> to choose an outing. Open a full edition for the detail, use <strong>Atlas</strong> to explore and plan, and keep your own account of the visit in <strong>Field Log</strong>.</p>')}
    </article>`;
    case 'portfolio': return `<article class="portfolio" aria-labelledby="portfolio-title">
      <div class="portfolio-identity"><span class="native-label">${e.name}</span><h3 id="portfolio-title">${link(p.url,p.displayName)}</h3><p class="portfolio-affiliation">${e.affiliation}</p></div>
      <div class="portfolio-focus"><span class="native-label">Research &amp; professional work</span><p>${e.description}</p><span class="portfolio-methods">Causal inference · Spatial analysis</span></div>
      <nav aria-label="Personal website sections">${link(p.url,p.action,'portfolio-open')}<div>${p.links.map(v=>link(v.url,v.name)).join('')}</div></nav>
    </article>`;
    default: return `<article class="additional-project"><h3>${link(p.url,p.name)}</h3><p>${e.description}</p></article>`;
  }
};
const workIdentity = {
  advisor: {plate:'advisor-dividers',folio:'01 / I',label:'Research design'},
  qst: {plate:'qst-instruments',folio:'01 / II',label:'Quantitative practice'},
  'field-brief': {plate:'field-fish',folio:'02 / I',label:'Every day'},
  loblolly: {plate:'loblolly-sprig',folio:'02 / II',label:'Fridays'},
  workbook: {plate:'workbook-volumes',folio:'02 / III',label:'Weekdays'},
  rupert: {plate:'atlas-bearing',folio:'02 / IV',label:'A field guide'},
  portfolio: {plate:'academic-arcade',folio:'03 / I',label:'Personal Website'}
};
function work(p, chapter, authentic) {
  const id = escape(p.id), device = workIdentity[p.id];
  const name = escape(p.displayName || p.name);
  return `<div class="work-item work-${id}" id="work-${id}" data-work="${id}" data-name="${escape(p.name)}" data-chapter="${chapter}" tabindex="-1">
    <article class="collection-entry collection-${id}" data-collection aria-labelledby="collection-${id}-title">
      <div class="collection-folio"><span>${device.folio}</span><span>${escape(device.label)}</span></div>
      ${plate(device.plate,'collection-engraving')}
      <div class="collection-copy"><h3 id="collection-${id}-title">${name}</h3><p>${escape(p.description)}</p>${p.affiliation ? `<p class="collection-affiliation">${escape(p.affiliation)}</p>` : ''}</div>
    </article>
    <div id="authentic-${id}" class="authentic-presentation" data-authentic hidden>${authentic}</div>
    <div class="work-actions"><button id="reveal-${id}" type="button" data-reveal="${id}" aria-expanded="false" aria-controls="authentic-${id}" aria-label="Reveal ${escape(p.name)} within desk." hidden><span>Reveal</span><span class="reveal-sign" aria-hidden="true">+</span></button>${link(p.url,'Open website','collection-open').replace('<a ', `<a aria-label="Open ${escape(p.name)} website" `)}</div>
  </div>`;
}
const groups = group => config.projects.filter(p=>p.group===group).map(p=>p.presentation==='periodicals' ? render(p) : work(p,group,render(p))).join('\n');
const chapterReturn = id => `<button class="chapter-return" type="button" data-return="${id}" hidden>Return chapter to collection</button>`;
// Secondary editorial signatures never reproduce or alter the canonical IH. mark.
const chapterIdentities = {research:['inquiry','Inquiry'], reading:['field-folio','Field & folio'], profile:['scholar','Scholar']};
const chapterMarks = new Map(await Promise.all(Object.entries(chapterIdentities).map(async ([id,[file,label]]) => [id,
  `<div class="chapter-signature" data-chapter-signature="${id}" aria-hidden="true">${await readFile(new URL(`assets/chapter-signatures/${file}.svg`,root),'utf8')}<span>${escape(label)}</span></div>`
])));
// The final identity is a fixed user-supplied raster master, never reconstructed.
const identity = {
  primary: '<img src="assets/identity/ih-signature.png" width="466" height="438" alt="Iain Holmes — IH. personal signature with Rupert beneath a loblolly pine" decoding="async">',
  period: '<img src="assets/identity/ih-period.png" width="60" height="60" alt="" aria-hidden="true" decoding="async">'
};

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#f3efe4">
  <meta name="description" content="Iain Holmes’s applications, publications and projects.">
  <meta name="apple-mobile-web-app-title" content="desk.">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <title>desk.</title>
  <link rel="canonical" href="https://iainholmes.github.io/desk/">
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="icon" href="assets/favicon-32.png" sizes="32x32" type="image/png">
  <link rel="apple-touch-icon" href="assets/apple-touch-icon.png">
  <link rel="manifest" href="manifest.webmanifest">
  <link rel="preload" href="assets/fonts/archivo-italic.woff" as="font" type="font/woff" crossorigin>
  <link rel="preload" href="assets/fonts/lmromandunh10-regular.otf" as="font" type="font/otf" crossorigin>
  <script src="desk.js"></script>
  <link rel="stylesheet" href="desk.css">
</head>
<body id="top">
  <a class="skip-link" href="#destinations">Skip to destinations</a>
  <div class="desk-shell">
    <header class="desk-header">
      <div class="masthead"><h1>desk<span>.</span></h1></div>
      <div class="owner-mark"><div class="bookplate-window">${identity.primary}</div></div>
    </header>
    <div class="desk-toolbar">
    <nav class="desk-nav" aria-label="Desk sections"><a href="#research"><span>Research <span class="nav-detail">&amp; practice</span></span></a><a href="#reading"><span>Reading <span class="nav-detail">&amp; outdoors</span></span></a><a href="#profile"><span>Personal <span class="nav-detail">website</span></span></a></nav>
    <button class="appearance-switch" type="button" aria-label="Night appearance" aria-pressed="false" hidden>
      <svg class="sun-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="4"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4.2 4.2l2.1 2.1m11.4 11.4 2.1 2.1M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/></svg>
      <svg class="moon-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" focusable="false"><path d="M20.5 15.2A9 9 0 0 1 8.8 3.5a9 9 0 1 0 11.7 11.7Z"/></svg>
      <span class="appearance-label" aria-hidden="true">Day</span>
    </button>
    </div>
    <main id="destinations" tabindex="-1">
      <div class="collections">
        <section class="research-group editorial-chapter" id="research" tabindex="-1" aria-labelledby="research-title"><div class="section-heading"><h2 id="research-title">Research &amp; practice</h2><span aria-hidden="true">01</span>${chapterMarks.get('research')}</div>${chapterReturn('research')}<div class="research-projects">${groups('research')}</div></section>
        <section class="reading-group editorial-chapter" id="reading" tabindex="-1" aria-labelledby="reading-title"><div class="section-heading"><h2 id="reading-title">Reading &amp; outdoors</h2><span aria-hidden="true">02</span>${chapterMarks.get('reading')}</div>${chapterReturn('reading')}<div class="reading-projects">${groups('reading')}</div></section>
      </div>
      <section class="profile-group editorial-chapter" id="profile" tabindex="-1" aria-labelledby="profile-title"><div class="section-heading"><h2 id="profile-title">Personal website</h2><span aria-hidden="true">03</span>${chapterMarks.get('profile')}</div>${chapterReturn('profile')}<div class="profile-composition">${groups('profile')}</div></section>
    </main>
    <footer class="desk-footer"><div class="footer-utilities"><a href="#top" class="footer-wordmark" aria-label="desk. — back to top">desk.</a><p>Everything in its right place.</p><details class="install-help"><summary>Keep desk. close<span class="disclosure-sign" aria-hidden="true"></span></summary><div>On iPhone, open desk. in Safari, tap Share, then Add to Home Screen.</div></details></div><div class="footer-signature" aria-hidden="true">${identity.period}</div></footer>
    <div id="section-scroll-room" aria-hidden="true"></div>
  </div>
</body>
</html>
`;
await writeFile(new URL('index.html',root),html);
console.log(`Built Desk. with ${config.projects.length} destinations and ${covers.size} archival covers.`);
