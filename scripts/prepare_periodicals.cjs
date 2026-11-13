/* Run after appending canonical content, before committing. Preserves published scholarship and pins. */
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');const read=p=>fs.readFileSync(path.join(root,p),'utf8');const write=(p,s)=>fs.writeFileSync(path.join(root,p),s);
const crypto=require('node:crypto');
const storyArt=require('../daily-watchlist-5/artwork.js'),storyArchive=require('../daily-watchlist-5/artwork-archive.js');
const digest=s=>crypto.createHash('sha256').update(s).digest('hex').slice(0,12);
const marks=require('../personal-updates/issue-marks.js'),archive=require('../personal-updates/issue-mark-archive.js'),studies=require('../weekly-economics-environment/field-study.js');
const plain=s=>String(s).replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&nbsp;/g,'\u00a0').replace(/&#(\d+);/g,(_,n)=>String.fromCharCode(+n)).replace(/&lt;/g,'<').replace(/&gt;/g,'>');
function data(s,id){return JSON.parse(s.match(new RegExp('<script type="application/json" id="'+id+'">([\\s\\S]*?)</script>'))[1]);}
function jsonReplace(s,id,value){return s.replace(new RegExp('(<script type="application/json" id="'+id+'">)[\\s\\S]*?(</script>)'),(_,a,b)=>a+'\n'+JSON.stringify(value,null,2)+'\n'+b);}
const fb=data(read('daily-watchlist-5/index.html'),'briefing-data').editions.sort((a,b)=>a.date.localeCompare(b.date));
// Validate editorial placement before preparing artwork or writing any artifact.
for(const ed of fb)require('../daily-watchlist-5/editorial-order.cjs').validate(ed);
for(const ed of fb)if(archive['fb:'+ed.date]&&!storyArchive.issues[ed.date])throw Error('Published Field Brief is missing its story artwork pin: '+ed.date);
const llSource=read('weekly-economics-environment/index.html');
const registerHistory=require('../weekly-economics-environment/field-register-schema.cjs').validate({journal:llSource}).history;
// Companion and evidence gates precede artwork preparation and every artifact write.
require('../weekly-economics-environment/source-evidence.cjs').validate({journal:llSource});
const reviewedLL=require('../weekly-economics-environment/editorial-folio.cjs').compose(llSource);
require('../weekly-economics-environment/source-evidence.cjs').validate({journal:reviewedLL});
// A present edition without its cumulative notebook review is not a completed publication.
require('../weekly-economics-environment/notebook/validate.cjs').validate({journal:llSource});
// Labels follow the selected edition's annual volume/issue, preserving the existing superscript apparatus.
const llEditionMarkup=llSource.match(/<main[^>]*id="edition"[^>]*>([\s\S]*?)<\/main>/)[1];
const labelEditions=[...llEditionMarkup.matchAll(/<section class="edition"[^>]*data-edition="([^"]+)"[\s\S]*?<div class="eyebrow edition-label">([\s\S]*?)<\/div>/g)].sort((a,b)=>a[1].localeCompare(b[1]));
if(labelEditions.length!==[...llEditionMarkup.matchAll(/<section class="edition"[^>]*data-edition=/g)].length)throw Error('Every L&L edition requires a hero edition label');
const roman=n=>{let text='';for(const [value,symbol] of [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']])while(n>=value){text+=symbol;n-=value}return text};
labelEditions.forEach(e=>{
 const year=+e[1].slice(0,4),no=labelEditions.filter(x=>x[1].slice(0,4)===String(year)&&x[1]<=e[1]).length;
 const date=new Date(e[1]+'T12:00:00Z').toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});
 const expected='Volume '+roman(year-2025)+' / No. '+String(no).padStart(3,'0')+' / '+date;
 if(year<2026||plain(e[2]).replace(/\s+/g,' ').trim()!==expected||!/<sup>o<\/sup>/.test(e[2]))throw Error('Invalid L&L edition label: '+e[1]+'; expected '+expected);
});
const plates=storyArt.prepare(fb,storyArchive);
const cp=data(read('daily-econ-challenge/index.html'),'challenge-data').editions.sort((a,b)=>a.date.localeCompare(b.date));
// Workbook publication requires authored, safe, question-specific Assistance and Explanation before any artifact is written.
require('../daily-econ-challenge/learning-schema.cjs').validate({editions:cp});
for(const [key,editions] of [['fb',fb],['cp',cp]]){
 editions.forEach((e,i)=>{if(key==='cp'&&e.no!==i+1)throw Error('Nonsequential Workbook number');if(key==='fb'&&e.stories.length!==5)throw Error('Field Brief needs five stories');if(new Set(editions.map(x=>x.date)).size!==editions.length)throw Error('Duplicate publication date');
 const id=key+':'+e.date;if(archive[id]){if(key==='cp'&&e.date>'2026-10-23'){if(archive[id].date!==e.date||archive[id].key!=='cp'||archive[id].no!==String(e.no).padStart(3,'0'))throw Error('Workbook cover does not match its canonical set: '+e.date);marks.validateOriginality(archive[id],archive);}if(key==='fb'&&e.date>storyArt.issuePolicy.historicalThrough){if(archive[id].date!==e.date||archive[id].key!=='fb'||archive[id].no!==String(e.no||i+1).padStart(3,'0'))throw Error('Field Brief cover does not match its canonical edition: '+e.date);storyArt.validateIssue(archive[id],archive);}return;}
 if(key==='cp'&&e.date<='2026-10-23')throw Error('Missing historical Workbook cover pin: '+e.date);
 if(key==='fb'&&(e.date<=storyArt.issuePolicy.historicalThrough||storyArchive.issues[e.date]))throw Error('Missing historical Field Brief cover pin: '+e.date);
 const m=marks.model({key,date:e.date,no:e.no||i+1,title:e.issueTitle,questions:e.questions,stories:e.stories,framing:[e.deck,e.signalTitle,...e.signal||[]].join(' '),previous:i?archive[key+':'+editions[i-1].date]:null});
 if(key==='cp')marks.validateOriginality(m,archive);
 if(key==='fb')storyArt.validateIssue({...m,frozen:marks.svg(m)},archive);
 archive[id]={...m,frozen:marks.svg(m)};
 });
}
// Compose new authored editions into the same semantic folio before any writes.
// This is idempotent and does not rewrite text, figures, identifiers or citations.
let ll=reviewedLL;
// HTML and CSS must advance together on Pages/CDN caches after every layout edit.
ll=ll.replace(/reading-folio\.css(?:\?v=[^"]*)?"/,'reading-folio.css?v='+digest(read('weekly-economics-environment/reading-folio.css'))+'"');
ll=ll.replace(/reading-index\.js(?:\?v=[^"]*)?"/,'reading-index.js?v='+digest(read('weekly-economics-environment/reading-index.js'))+'"');
ll=ll.replace(/reading-composition\.js(?:\?v=[^"]*)?"/,'reading-composition.js?v='+digest(read('weekly-economics-environment/reading-composition.js'))+'"');
ll=ll.replace(/commonplace\.js(?:\?v=[^"]*)?"/,'commonplace.js?v='+digest(read('personal-updates/commonplace/commonplace.js'))+'"');
// Fail before *any* archive/artwork/hub write if a future issue loses its
// finished layout, source register, notebook structure or authored exhibit.
require('../weekly-economics-environment/reading-layout-guard.cjs').validate({
 journal:ll,
 notebook:read('weekly-economics-environment/notebook/index.html'),
 folioCss:read('weekly-economics-environment/reading-folio.css'),
 notebookCss:read('weekly-economics-environment/notebook/notebook.css')
});
const field=data(ll,'field-studies');
const editions=[...ll.matchAll(/<section class="edition"[^>]*data-edition="([^"]+)"[^>]*data-title="([^"]+)"[^>]*>([\s\S]*?)(?=<section class="edition"|<\/main>)/g)].sort((a,b)=>a[1].localeCompare(b[1]));
editions.forEach((e,i)=>{
 const synthesis=plain(e[3].match(/<section class="synthesis"[\s\S]*?<\/section>/)?.[0]||e[2]);
 const isNew=!field[e[1]];
 const id='sp:'+e[1];
 if(!archive[id]){if(e[1]<='2026-10-23')throw Error('Missing historical L&L cover pin: '+e[1]);const m=marks.model({key:'sp',date:e[1],no:i+1,framing:synthesis,previous:i?archive['sp:'+editions[i-1][1]]:null});marks.validateOriginality(m,archive);archive[id]={...m,frozen:marks.svg(m)};}
 else if(e[1]>'2026-10-23'||archive[id].version===6){if(archive[id].date!==e[1]||archive[id].key!=='sp'||archive[id].no!==String(i+1).padStart(3,'0'))throw Error('L&L cover does not match its canonical edition: '+e[1]);marks.validateOriginality(archive[id],archive);}
 if(isNew){if(e[1]<='2026-10-23')throw Error('Missing historical Field Study pin: '+e[1]);field[e[1]]=studies.artifact({date:e[1],no:i+1,synthesis,history:field,cover:archive[id]});studies.validateOriginality(field[e[1]],field,archive[id]);}
 else if(e[1]>'2026-10-23'||field[e[1]].version===4){if(field[e[1]].date!==e[1]||field[e[1]].no!==i+1)throw Error('Field Study does not match its canonical edition: '+e[1]);studies.validateOriginality(field[e[1]],field,archive[id]);}
 const figure='<figure class="hero-art" data-field-study="'+e[1]+'">'+field[e[1]].html+'</figure>';
 ll=ll.replace(e[0],e[0].replace(/<figure class="hero-art"[^>]*>[\s\S]*?<\/figure>/,figure));
});
const hub=marks.renderHub(read('personal-updates/index.html'),{
 fb,
 sp:data(ll,'ll-reading-index-data').editions,
 cp,
 registerCount:data(ll,'field-register').entries.length
});
// No artifact or hub writes until every new cover and Field Study has passed.
write('weekly-economics-environment/field-register-history.json',JSON.stringify(registerHistory,null,2)+'\n');
write('daily-watchlist-5/artwork-archive.js',"/* Frozen published Field Brief plates. Legacy templates preserve their exact SVG bytes. Append only. */\n(function(root){const archive="+JSON.stringify(plates,null,2)+";if(typeof module==='object'&&module.exports)module.exports=archive;else root.FieldBriefArtworkArchive=archive;})(typeof window==='object'?window:{});\n");
let brief=read('daily-watchlist-5/index.html');
brief=brief.replace(/artwork-archive\.js(?:\?v=[^"]*)?"/,'artwork-archive.js?v='+digest(read('daily-watchlist-5/artwork-archive.js'))+'"');
write('daily-watchlist-5/index.html',brief);
write('weekly-economics-environment/index.html',jsonReplace(ll,'field-studies',field));
write('weekly-economics-environment/reading-feature-inventory.json',JSON.stringify(require('../weekly-economics-environment/editorial-architecture.cjs').inventory(ll),null,2)+'\n');
write('weekly-economics-environment/reading-field-guide/index.html',require('../weekly-economics-environment/field-guide.cjs').generate(ll));
write('personal-updates/issue-mark-archive.js',"/* Published artwork is immutable. Append new editions; never overwrite an existing entry. */\n(function(root){var archive="+JSON.stringify(archive,null,2)+";if(typeof module==='object'&&module.exports)module.exports=archive;else root.PeriodicalsMarkArchive=archive;})(typeof window==='object'?window:{});\n");
write('personal-updates/index.html',hub);
console.log('Pinned issue artwork and Field Studies; refreshed hub cover and edition metadata.');
