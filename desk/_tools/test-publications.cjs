const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const api=require('../publications.js'),repo=path.resolve(__dirname,'../..');
const now=new Date('2026-10-12T22:00:00Z');
const read=p=>Promise.resolve(fs.readFileSync(path.join(repo,p),'utf8'));
const archive=api.archiveFrom(fs.readFileSync(path.join(repo,'personal-updates/issue-mark-archive.js'),'utf8'));
const manifest=JSON.parse(fs.readFileSync(path.join(repo,'rupert/data/editions/index.json')));
const photos=JSON.parse(fs.readFileSync(path.join(repo,'rupert/data/photos.json')));
const page=id=>fs.readFileSync(path.join(repo,{workbook:'daily-econ-challenge/index.html','field-brief':'daily-watchlist-5/index.html',loblolly:'weekly-economics-environment/index.html'}[id]),'utf8');
test('Current canonical publication data and artwork agree',async()=>{
 const data=await api.snapshot(read,now);
 for(const [id,no,date]of [['field-brief','016','2026-10-12'],['workbook','010','2026-10-12'],['loblolly','003','2026-10-09']]){
  const p=data.publications[id];assert.equal(p.number,no);assert.equal(p.date,date);assert(p.title&&p.artwork.startsWith('<svg'));
  const key={workbook:'cp','field-brief':'fb',loblolly:'sp'}[id];assert.equal(p.artwork,archive[key+':'+date].frozen);
 }
 assert(data.atlas.every(e=>e.state==='published'&&e.pending));
});
test('New genuine editions advance without changing desk configuration; unpinned and future entries do not',()=>{
 const html=page('field-brief'),data=JSON.parse(html.match(/id="briefing-data">([\s\S]*?)<\/script>/)[1]);
 const latest=data.editions.at(-1),release={...latest,date:'2026-10-13',issueTitle:'New Authored Edition'};data.editions.push(release);
 const updated=html.replace(/(id="briefing-data">)[\s\S]*?(<\/script>)/,(_,a,b)=>a+JSON.stringify(data)+b);
 const pins={...archive,'fb:2026-10-13':{...archive['fb:2026-10-12'],date:release.date,no:'017'}};
 assert.equal(api.periodical('field-brief',updated,pins,now).number,'016');
 assert.equal(api.periodical('field-brief',updated,archive,new Date('2026-10-13T22:00Z')).number,'016');
 assert.equal(api.periodical('field-brief',updated,pins,new Date('2026-10-13T22:00Z')).title,release.issueTitle);
 release.status='draft';data.editions[data.editions.length-1]=release;
 const draft=html.replace(/(id="briefing-data">)[\s\S]*?(<\/script>)/,(_,a,b)=>a+JSON.stringify(data)+b);
 assert.equal(api.periodical('field-brief',draft,pins,new Date('2026-10-13T22:00Z')).number,'016');
});
test('Incomplete metadata and active SVG do not become new publication claims',()=>{
 const pin=archive['fb:2026-10-12'];
 assert.throws(()=>api.periodical('field-brief',page('field-brief'),{...archive,'fb:2026-10-12':{...pin,no:'bad'}},now));
 for(const svg of ['<svg><script>alert(1)</script></svg>','<svg><image href="https://example.com"/></svg>','<svg><animate attributeName="opacity"/></svg>'])assert.equal(api.safeCover(svg),false);
});
test('Unavailable sources fail independently and cannot invent fallback releases',async()=>{
 const data=await api.snapshot(p=>p.includes('daily-watchlist')?Promise.reject(Error('offline')):read(p),now);
 assert.equal(data.publications['field-brief'],undefined);assert.equal(data.publications.workbook.number,'010');assert.equal(data.atlas.length,2);
 const none=await api.snapshot(()=>Promise.reject(Error('offline')),now);assert.deepEqual(none,{publications:{},atlas:[]});
});
test('Drafts, future timestamps and scheduled-only slots never trigger edition/artwork fetches',async()=>{
 const fake=structuredClone(manifest);fake.editions.push({id:'secret-draft',slot:'tuesday',status:'draft',published_at:'2026-10-01T07:00-04:00',weekend:{start:'2026-10-17'},title:'Secret Title',path:'data/editions/secret-draft.json'});
 fake.editions.push({...fake.editions.at(-1),id:'future',status:'published',published_at:'2026-10-13T07:00-04:00'});
 const requested=[];const data=await api.snapshot(p=>{requested.push(p);return p.endsWith('editions/index.json')?Promise.resolve(JSON.stringify(fake)):read(p);},now);
 assert(!requested.some(p=>/secret-draft|future/.test(p)));assert(!JSON.stringify(data).includes('Secret Title'));
 assert(data.atlas.every(e=>e.pending));
});
test('A released edition must match its manifest and registered editorial image',()=>{
 const selected=api.atlasIndex(manifest,now).find(e=>e.slot==='thursday');
 const edition=JSON.parse(fs.readFileSync(path.join(repo,'rupert',selected.entry.path)));
 const good=api.atlasRelease(selected,edition,photos,now);assert(good.artwork.startsWith('/rupert/photos/'));assert.equal(good.title,edition.flagship.title);
 assert.throws(()=>api.atlasRelease(selected,{...edition,status:'draft'},photos,now));
 assert.throws(()=>api.atlasRelease(selected,edition,{photos:[]},now));
});
test('Withdrawn slots do not resurrect their recommendation artwork',()=>{
 const fake=structuredClone(manifest);const latest=fake.editions.filter(e=>e.slot==='thursday').at(-1);latest.status='withdrawn';
 const s=api.atlasIndex(fake,now).find(e=>e.slot==='thursday'),e=api.atlasRelease(s,null,photos,now);
 assert.equal(e.state,'withdrawn');assert.equal(e.title,undefined);assert.equal(e.artwork,undefined);
});
