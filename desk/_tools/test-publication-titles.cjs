const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const api=require('../publications.js'),repo=path.resolve(__dirname,'../..');
const archive=api.archiveFrom(fs.readFileSync(path.join(repo,'personal-updates/issue-mark-archive.js'),'utf8'));
const specs={'field-brief':['fb','daily-watchlist-5','briefing-data'],workbook:['cp','daily-econ-challenge','challenge-data'],loblolly:['sp','weekly-economics-environment']};
const clean=s=>s.replace(/&amp;/g,'&').trim();
for(const [id,[key,dir,block]] of Object.entries(specs)){
 test(`${id}: current release uses its pinned cover phrase`,()=>{
  const html=fs.readFileSync(path.join(repo,dir,'index.html'),'utf8');
  const p=api.periodical(id,html,archive,new Date());
  assert.equal(p.title,clean(archive[key+':'+p.date].phrase));
  assert(!p.detail.toLowerCase().includes(p.title.toLowerCase()));
  assert.equal(p.artwork,archive[key+':'+p.date].frozen);
 });
 test(`${id}: future release keeps distinct headline secondary and rejects missing phrases`,()=>{
  const date='2099-01-02',phrase='Evidence & Decisions',title='A Longer Official Editorial Headline';
  const e={date,title,issueTitle:title,no:999,stories:Array(5).fill({}),questions:[{field:'Methods'}],readTime:'6 min read',minutes:20};
  const html=block?`<script type="application/json" id="${block}">${JSON.stringify({editions:[e]})}</script>`:`<section class="edition" data-edition="${date}" data-title="${title}">`;
  const pin={key,date,no:999,phrase,frozen:`<svg><text>${phrase.replace('&','&amp;')}</text></svg>`};
  const p=api.periodical(id,html,{[key+':'+date]:pin},new Date('2099-01-03T12:00Z'));
  assert.equal(p.title,phrase);assert(p.detail.startsWith(title));assert(!p.detail.includes(phrase));
  const same=html.replaceAll(title,phrase);
  assert(!api.periodical(id,same,{[key+':'+date]:pin},new Date('2099-01-03T12:00Z')).detail.includes(phrase));
  assert.throws(()=>api.periodical(id,html,{[key+':'+date]:{...pin,phrase:''}},new Date('2099-01-03T12:00Z')));
 });
}
