const fs=require('fs'),assert=require('assert/strict'),{execFileSync}=require('child_process');
const base='9d2777912fdc8adb230bafa628813a626c3d40e6',pre='960ef0700ed31ea3c4089b2fe7e13791e8da3a81';
const read=p=>fs.readFileSync(p,'utf8'),at=(sha,p)=>execFileSync('git',['show',sha+':'+p],{encoding:'utf8'});
const pages=['personal-updates/index.html','personal-updates/commonplace/index.html','personal-updates/handbook/index.html','daily-watchlist-5/index.html','daily-econ-challenge/index.html','weekly-economics-environment/index.html','weekly-economics-environment/notebook/index.html'];
for(const p of pages){const s=read(p);assert(!/Instrument(?:\+| )Sans/.test(s),p+' retains an active Instrument Sans use');assert(s.includes('/personal-updates/fonts/fahkwang.css?v=20261002-regression'));for(const w of [400,500,600,700])assert(s.includes('fahkwang-'+w+'.woff2'));}
for(const p of ['personal-updates/issue-marks.css','personal-updates/mobile/mobile.css','weekly-economics-environment/notebook/notebook.css'])assert.equal(read(p),at(base,p).replaceAll('Instrument Sans','Fahkwang'),p+' changed beyond the requested UI family');
// Both locked interactions and their data remain byte-identical.
assert.equal(read('personal-updates/mobile-shelf.js'),at(base,'personal-updates/mobile-shelf.js'));
const hub=read(pages[0]),oldHub=at(base,pages[0]);
assert.equal(hub.match(/@media\(max-width:1000px\)[\s\S]*?<\/style>/)[0],oldHub.match(/@media\(max-width:1000px\)[\s\S]*?<\/style>/)[0]);
const ll=read('weekly-economics-environment/index.html'),oldLL=at(base,'weekly-economics-environment/index.html');
const scripts=s=>[...s.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)].filter(m=>!m[1].includes('src=')).map(m=>m[2]);
assert.deepEqual(scripts(ll),scripts(oldLL),'locked Heron/schema/edition scripts changed');
const rules=(s,prefix)=>[...s.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter(m=>m[1].trim().startsWith(prefix)).map(m=>m[0].trim());
assert.deepEqual(rules(ll,'.mh-folio'),rules(at(pre,'weekly-economics-environment/index.html'),'.mh-folio'),'verified Source Serif folio treatment changed');
const book=read('daily-econ-challenge/index.html'),oldBook=at(pre,'daily-econ-challenge/index.html');
for(const prefix of ['.ps-no b{','.ps-no .ps-folio{','.ps-no .ps-folio .no,','.ps-no .ps-folio .no sup,'])assert.deepEqual(rules(book,prefix),rules(oldBook,prefix),'Workbook pre-polish folio cascade changed: '+prefix);
assert(book.includes('#resTitle .folio-num{font-family:var(--mono);font-weight:500}'));
assert(book.includes('<span class="folio-num">\'+pad(ed.no)+\'</span>'));
const fb=read('daily-watchlist-5/index.html');assert.deepEqual(rules(fb,'.mast-folio'),rules(at(base,'daily-watchlist-5/index.html'),'.mast-folio'),'Field Brief issue folio changed');
assert(fb.includes('.mast-vn{flex:0 0 100%;white-space:nowrap;'));
const hb=read('personal-updates/handbook/index.html');assert(hb.includes('class="house-index">HOUSE INDEX</span><span class="house-year">2026</span>'));assert(hb.includes('.house-year{font:500 82px/.8 var(--display)'));assert(!hb.includes('class="hb-no"'));
const cp=read('personal-updates/commonplace/index.html');assert(cp.includes('.imprint>a,.imprint nav>a,.imprint nav>span{display:inline-flex;align-items:center;min-height:44px;box-sizing:border-box}'));assert(cp.includes('<span aria-current="page">Commonplace</span>'));
const fontCSS=read('personal-updates/fonts/fahkwang.css');for(const style of ['normal','italic'])for(const weight of [400,500,600,700]){assert(fontCSS.includes('font-weight:'+weight));const p='personal-updates/fonts/fahkwang-'+weight+(style==='italic'?'-italic':'')+'.woff2';assert.equal(fs.readFileSync(p).subarray(0,4).toString(),'wOF2');}
assert(fontCSS.includes('font-display:block'));assert(read('personal-updates/fonts/OFL-Fahkwang.txt').includes('SIL OPEN FONT LICENSE'));
console.log('Final regression checks: Fahkwang loading/scope, locked shelf/Heron scripts, exact pre-polish folio rules, unchanged Field Brief folio, date line, Handbook year, Commonplace alignment passed.');
