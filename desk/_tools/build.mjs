import { readFile, writeFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const config = JSON.parse(await readFile(new URL('projects.json', root), 'utf8'));
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const arrow = '<span class="arrow" aria-hidden="true">↗</span>';
const number = i => String(i + 1).padStart(2, '0');
const link = (url, label, cls = '') => `<a class="${cls}" href="${escape(url)}">${escape(label)}${arrow}</a>`;
const disclosure = (label, body) => `<details class="context"><summary>${escape(label)}<span class="disclosure-sign" aria-hidden="true"></span></summary><div class="context-body">${body}</div></details>`;

// Pinned, trusted repository assets, not remote markup. Embedding the exact
// archived SVG lets its original text use the page's self-hosted editorial fonts.
const covers = new Map(await Promise.all(config.projects.flatMap(p => p.publications || []).map(async p => [p.id, await readFile(new URL(p.asset, root), 'utf8')])));

const publication = p => `<article class="publication ${escape(p.id)}" aria-labelledby="${escape(p.id)}-title">
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
        <ol class="design-path" aria-label="Research-design workflow">${p.workflow.map((v,i)=>`<li><span class="path-number" aria-hidden="true">${number(i)}</span><div><strong>${escape(v.name)}</strong><span>${escape(v.detail)}</span></div></li>`).join('')}</ol>
        <span class="open-line" id="advisor-action">${e.action}${arrow}</span>
      </a>
      ${disclosure('Inside Advisor', '<p>Start with your research question and data. The assessment connects your design to a methods toolkit and an interactive knowledge graph.</p><dl class="context-list"><div><dt>Develop</dt><dd>Identification, estimating equations and diagnostics.</dd></div><div><dt>Take away</dt><dd>A research-design brief, methods appendix or reviewer reference.</dd></div></dl>')}
    </article>`;
    case 'qst': return `<article class="qst destination" aria-labelledby="qst-title">
      <a class="destination-link" href="${e.url}" aria-labelledby="qst-title qst-action">
        <div class="qst-top"><h3 id="qst-title"><span class="qst-initials">${e.shortName}</span><span class="qst-full">${e.name}</span></h3><span class="native-label">Quantitative practice</span></div>
        <p class="qst-description">${e.description}</p>
        <ul class="language-strip" aria-label="Available languages">${p.languages.map((v,i)=>`<li class="language language-${i}">${escape(v)}</li>`).join('')}</ul>
        <ol class="learning-sequence" aria-label="Learning sequence">${p.sequence.map((v,i)=>`<li><span class="phase-number" aria-hidden="true">${number(i)}</span><strong>${escape(v.name)}</strong><span class="phase-detail">${escape(v.detail)}</span></li>`).join('')}</ol>
        <span class="open-line" id="qst-action">${e.action}${arrow}</span>
      </a>
      ${disclosure('Explore the learning path', `<ol class="curriculum-list">${p.tiers.map(v=>`<li>${escape(v)}</li>`).join('')}</ol><p>Choose a language and module. Read the lesson, work in your own coding environment, then bring your code and output back for feedback.</p>`)}
    </article>`;
    case 'periodicals': return `<article class="periodicals" aria-labelledby="periodicals-title">
      <div class="publication-head"><div><h3 id="periodicals-title">${link(p.url, p.name)}</h3><p>${e.description}</p></div><span class="native-label">The reading shelf</span></div>
      <div class="publication-shelf">${p.publications.map(publication).join('\n')}</div>
      <div class="shelf-footer">${link(p.url, 'Browse Periodicals', 'shelf-link')}
      ${disclosure('Publication notes', '<dl class="context-list"><div><dt>Field Brief · Every day</dt><dd>Five consequential developments, including weekends.</dd></div><div><dt>Loblolly &amp; Logit · Fridays</dt><dd>Research readings, synthesis and a cumulative methods notebook.</dd></div><div><dt>The Workbook · Weekdays</dt><dd>Economics problems with assistance and worked explanations.</dd></div></dl><p class="archive-note">The covers above are selections from the archive. Each publication opens at its home, where current and earlier editions are available.</p>')}
      </div>
    </article>`;
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
const groups = group => config.projects.filter(p=>p.group===group).map(render).join('\n');
const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#263b33">
  <meta name="description" content="${escape(config.description)} Desk. brings Iain Holmes’s applications, publications and projects together.">
  <meta name="apple-mobile-web-app-title" content="Desk.">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <title>Desk.</title>
  <link rel="canonical" href="https://iainholmes.github.io/desk/">
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="assets/apple-touch-icon.png">
  <link rel="manifest" href="manifest.webmanifest">
  <link rel="preload" href="assets/fonts/archivo.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="desk.css">
</head>
<body id="top">
  <a class="skip-link" href="#destinations">Skip to destinations</a>
  <div class="desk-shell">
    <header class="desk-header">
      <div class="masthead"><h1>Desk<span>.</span></h1><p>${escape(config.description)}</p></div>
      <div class="owner"><span>A personal collection</span><span>Iain Holmes</span></div>
    </header>
    <nav class="desk-nav" aria-label="Desk sections"><a href="#research">Research &amp; practice</a><a href="#reading">Reading &amp; outdoors</a><a href="#profile">Personal website</a></nav>
    <main id="destinations" tabindex="-1">
      <div class="collections">
        <section class="research-group" id="research" aria-labelledby="research-title"><div class="section-heading"><h2 id="research-title">Research &amp; practice</h2><span aria-hidden="true">01</span></div><div class="research-projects">${groups('research')}</div></section>
        <section class="reading-group" id="reading" aria-labelledby="reading-title"><div class="section-heading"><h2 id="reading-title">Reading &amp; outdoors</h2><span aria-hidden="true">02</span></div><div class="reading-projects">${groups('reading')}</div></section>
      </div>
      <section class="profile-group" id="profile" aria-labelledby="profile-title"><div class="section-heading"><h2 id="profile-title">Personal &amp; professional</h2><span aria-hidden="true">03</span></div>${groups('profile')}</section>
    </main>
    <footer class="desk-footer"><a href="#top" class="footer-wordmark" aria-label="Desk. — back to top">Desk.</a><p>Everything has its place.</p><details class="install-help"><summary>Keep Desk. close<span class="disclosure-sign" aria-hidden="true"></span></summary><div>On iPhone, open Desk. in Safari, tap Share, then Add to Home Screen.</div></details></footer>
  </div>
</body>
</html>
`;
await writeFile(new URL('index.html',root),html);
console.log(`Built Desk. with ${config.projects.length} destinations and ${covers.size} archival covers.`);
