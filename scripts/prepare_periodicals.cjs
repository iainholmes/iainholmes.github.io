/* Run after appending canonical content, before committing. Never changes an existing edition. */
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');const read=p=>fs.readFileSync(path.join(root,p),'utf8');const write=(p,s)=>fs.writeFileSync(path.join(root,p),s);
const marks=require('../personal-updates/issue-marks.js'),archive=require('../personal-updates/issue-mark-archive.js'),studies=require('../weekly-economics-environment/field-study.js');
const plain=s=>String(s).replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&nbsp;/g,'\u00a0').replace(/&#(\d+);/g,(_,n)=>String.fromCharCode(+n)).replace(/&lt;/g,'<').replace(/&gt;/g,'>');
function data(s,id){return JSON.parse(s.match(new RegExp('<script type="application/json" id="'+id+'">([\\s\\S]*?)</script>'))[1]);}
function jsonReplace(s,id,value){return s.replace(new RegExp('(<script type="application/json" id="'+id+'">)[\\s\\S]*?(</script>)'),(_,a,b)=>a+'\n'+JSON.stringify(value,null,2)+'\n'+b);}
const fb=data(read('daily-watchlist-5/index.html'),'briefing-data').editions.sort((a,b)=>a.date.localeCompare(b.date));
const cp=data(read('daily-econ-challenge/index.html'),'challenge-data').editions.sort((a,b)=>a.date.localeCompare(b.date));
for(const [key,editions] of [['fb',fb],['cp',cp]]){
 editions.forEach((e,i)=>{if(key==='cp'&&e.no!==i+1)throw Error('Nonsequential Workbook number');if(key==='fb'&&e.stories.length!==5)throw Error('Field Brief needs five stories');if(new Set(editions.map(x=>x.date)).size!==editions.length)throw Error('Duplicate publication date');
 const id=key+':'+e.date;if(archive[id])return;
 const m=marks.model({key,date:e.date,no:e.no||i+1,title:e.issueTitle,questions:e.questions,framing:[e.deck,e.signalTitle,...e.signal||[]].join(' '),previous:i?archive[key+':'+editions[i-1].date]:null});
 archive[id]={...m,frozen:marks.svg(m)};
 });
}
let ll=read('weekly-economics-environment/index.html');const field=data(ll,'field-studies');
const editions=[...ll.matchAll(/<section class="edition"[^>]*data-edition="([^"]+)"[^>]*data-title="([^"]+)"[^>]*>([\s\S]*?)(?=<section class="edition"|<\/main>)/g)].sort((a,b)=>a[1].localeCompare(b[1]));
editions.forEach((e,i)=>{
 const synthesis=plain(e[3].match(/<section class="synthesis"[\s\S]*?<\/section>/)?.[0]||e[2]);
 if(!field[e[1]])field[e[1]]=studies.artifact({date:e[1],no:i+1,synthesis,previous:i?field[editions[i-1][1]]:null});
 const id='sp:'+e[1];if(!archive[id]){const m=marks.model({key:'sp',date:e[1],no:i+1,framing:synthesis,previous:i?archive['sp:'+editions[i-1][1]]:null});archive[id]={...m,frozen:marks.svg(m)};}
 const figure='<figure class="hero-art" data-field-study="'+e[1]+'">'+field[e[1]].html+'</figure>';
 ll=ll.replace(e[0],e[0].replace(/<figure class="hero-art"[^>]*>[\s\S]*?<\/figure>/,figure));
});
write('weekly-economics-environment/index.html',jsonReplace(ll,'field-studies',field));
write('personal-updates/issue-mark-archive.js',"/* Published artwork is immutable. Append new editions; never overwrite an existing entry. */\n(function(root){var archive="+JSON.stringify(archive,null,2)+";if(typeof module==='object'&&module.exports)module.exports=archive;else root.PeriodicalsMarkArchive=archive;})(typeof window==='object'?window:{});\n");
let hub=read('personal-updates/index.html');
const latest={fb:fb.at(-1),cp:cp.at(-1),sp:{date:editions.at(-1)[1],title:plain(editions.at(-1)[2])}};
for(const key of ['fb','cp','sp']){
 const e=latest[key],m=archive[key+':'+e.date];
 hub=hub.replace(new RegExp('<div class="cover ([^"]+)" data-issue-mark="'+key+'"[\\s\\S]*?</div>'),(_,cl)=>'<div class="cover '+cl+'" data-issue-mark="'+key+'" data-edition="'+m.date+'" data-theme="'+m.theme+'" data-signature="'+m.seed+'">'+m.frozen+'</div>');
 const escape=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
 function set(attr,val){
  const boundary=hub.indexOf('\n<script>\n(function(){'),head=hub.slice(0,boundary),tail=hub.slice(boundary);
  hub=head.replace(new RegExp('(<(b|p|span)[^>]*\\b'+attr+'[^>]*>)[\\s\\S]*?(</\\2>)','g'),(_,a,tag,b)=>a+val+b)+tail;
 }
 const count=key==='fb'?fb.length:key==='cp'?cp.length:editions.length;
 set('data-'+key+'="count"',count);
 set('data-'+key+'="title"',escape(key==='fb'?e.issueTitle:key==='sp'?e.title:e.questions.length+' questions · '+new Set(e.questions.map(q=>q.field)).size+' fields'));
 const date=new Date(e.date+'T12:00:00Z').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
 set('data-'+key+'="line"','N<sup>o</sup>. '+String(key==='cp'?e.no:count).padStart(3,'0')+' · '+date);
 if(key==='fb')set('data-fb-depth',fb.reduce((n,x)=>n+x.stories.length,0));
 if(key==='cp'){set('data-cp-depth',cp.reduce((n,x)=>n+x.questions.length,0));set('data-cp-fields',new Set(cp.flatMap(x=>x.questions.map(q=>q.field))).size);}
}
// Version the immutable registry whenever any publication advances.
const version=[latest.fb.date,latest.cp.date,latest.sp.date].join('_');
hub=hub.replace(/issue-mark-archive\.js(?:\?v=[^"]*)?"/,'issue-mark-archive.js?v='+version+'"');
write('personal-updates/index.html',hub);
console.log('Pinned issue artwork and Field Studies; refreshed hub fallback metadata.');
