import { readFile, writeFile } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const config = JSON.parse(await readFile(new URL('projects.json', root), 'utf8'));
const escape = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const arrow = '<span class="arrow" aria-hidden="true">↗</span>';
const link = (url, label, cls = '') => `<a class="${cls}" href="${escape(url)}">${escape(label)}${arrow}</a>`;
const render = p => {
  const e = Object.fromEntries(Object.entries(p).filter(([,v]) => typeof v === 'string').map(([k,v]) => [k,escape(v)]));
  switch (p.presentation) {
    case 'advisor': return `<article class="advisor destination" aria-labelledby="advisor-title">
      <a class="destination-link" href="${e.url}" aria-labelledby="advisor-title advisor-action">
        <div class="advisor-top"><span class="native-label">Research design</span><img src="${e.asset}" width="52" height="52" alt="" aria-hidden="true"></div>
        <h3 id="advisor-title">Econometric<br>Advisor</h3><p class="advisor-description">${e.description}</p>
        <p class="advisor-detail">${e.detail}</p><span class="open-line" id="advisor-action">${e.action}${arrow}</span>
      </a></article>`;
    case 'qst': return `<article class="qst destination" aria-labelledby="qst-title"><a class="destination-link" href="${e.url}" aria-labelledby="qst-title qst-action">
      <div class="qst-top"><h3 id="qst-title"><span class="qst-initials">${e.shortName}</span><span class="qst-full">${e.name}</span></h3>${arrow}</div>
      <p>${e.description}</p><div class="language-strip" aria-label="Available languages">${p.languages.map((v,i)=>`<span class="language language-${i}">${escape(v)}</span>`).join('')}</div>
      <div class="qst-bottom"><span class="learning-sequence">${p.sequence.map(escape).join('<span aria-hidden="true"> / </span>')}</span><span class="sr-only" id="qst-action">${e.action}</span></div>
    </a></article>`;
    case 'periodicals': return `<article class="periodicals" aria-labelledby="periodicals-title">
      <div class="publication-head"><h3 id="periodicals-title">${link(p.url, p.name)}</h3><p>${e.description}</p></div>
      <div class="publication-shelf">${p.publications.map((v,i)=>`<a class="publication ${escape(v.id)}" href="${escape(v.url)}"><span class="publication-number" aria-hidden="true">${['I','II','III'][i]}</span><span class="publication-type"><span class="publication-name">${escape(v.name)}</span><span class="publication-description">${escape(v.description)}</span></span>${arrow}</a>`).join('')}</div>
      <a class="shelf-link" href="${e.url}">Browse Periodicals${arrow}</a>
    </article>`;
    case 'rupert': return `<article class="rupert" aria-labelledby="rupert-title"><a class="rupert-main" href="${e.url}" aria-labelledby="rupert-title rupert-action">
      <div class="rupert-heading"><h3 id="rupert-title"><span>The</span> Rupert Atlas</h3><p>${e.description}</p></div>
      <img class="rupert-art" src="${e.asset}" alt="${e.alt}" width="800" height="1000" fetchpriority="high">
      <span class="open-line" id="rupert-action">${e.action}${arrow}</span>
    </a><nav class="rupert-links" aria-label="Rupert Atlas sections">${p.links.map(v=>link(v.url,v.name)).join('')}</nav></article>`;
    case 'portfolio': return `<article class="portfolio" aria-labelledby="portfolio-title"><div class="portfolio-identity"><span class="native-label">${e.name}</span><h3 id="portfolio-title">${link(p.url,p.displayName)}</h3></div><p>${e.description}</p><nav aria-label="Personal website sections">${p.links.map(v=>link(v.url,v.name)).join('')}${link(p.url,p.action,'portfolio-open')}</nav></article>`;
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
      <span class="owner">Iain Holmes</span>
    </header>
    <nav class="desk-nav" aria-label="Desk sections"><a href="#research">Research & practice</a><a href="#reading">Reading & outdoors</a><a href="#profile">Personal website</a></nav>
    <main id="destinations" tabindex="-1">
      <div class="collections">
        <section class="research-group" id="research" aria-labelledby="research-title"><div class="section-heading"><h2 id="research-title">Research & practice</h2><span aria-hidden="true">01</span></div><div class="research-projects">${groups('research')}</div></section>
        <section class="reading-group" id="reading" aria-labelledby="reading-title"><div class="section-heading"><h2 id="reading-title">Reading & outdoors</h2><span aria-hidden="true">02</span></div><div class="reading-projects">${groups('reading')}</div></section>
      </div>
      <section class="profile-group" id="profile" aria-labelledby="profile-title"><h2 id="profile-title" class="sr-only">Personal & professional</h2>${groups('profile')}</section>
    </main>
    <footer class="desk-footer"><a href="#top" class="footer-wordmark" aria-label="Desk. — back to top">Desk.</a><p>Everything has its place.</p><details class="install-help"><summary>Keep Desk. close</summary><div>On iPhone, open Desk. in Safari, tap Share, then Add to Home Screen.</div></details></footer>
  </div>
</body>
</html>
`;
await writeFile(new URL('index.html',root),html);
console.log(`Built Desk. with ${config.projects.length} destinations.`);
