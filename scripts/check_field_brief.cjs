/* Read-only publication preflight. A canonical dated edition is never a new-publication retry. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const art=require('../daily-watchlist-5/artwork.js'),memory=require('../personal-updates/editorial-memory.js');
const json=(s,id)=>{const m=s.match(new RegExp('<script[^>]*id="'+id+'"[^>]*>([\\s\\S]*?)</script>'));if(!m)throw Error('Missing '+id);return JSON.parse(m[1]);};
function registry(source){const c={module:{exports:{}}};vm.runInNewContext(source,c);return JSON.parse(JSON.stringify(c.module.exports));}
function inspect({date,html,marks,plates,hub}){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||new Date(date+'T12:00:00Z').toISOString().slice(0,10)!==date)throw Error('Supply an actual YYYY-MM-DD date');
 const editions=json(html,'briefing-data').editions,dates=editions.map(e=>e.date),errors=[];
 if(new Set(dates).size!==dates.length)throw Error('Duplicate canonical Field Brief date');
 const ordered=[...editions].sort((a,b)=>a.date.localeCompare(b.date)),issue=editions.find(e=>e.date===date);
 if(editions.some(e=>e.stories?.length!==5))throw Error('Canonical archive contains an incomplete five-story edition');
 if(!issue){if(ordered.at(-1)?.date>date)throw Error('Historical gap requires explicit numbering review; do not renumber newer publications');return {date,state:'missing',action:'prepare',latest:ordered.at(-1)?.date,nextNumber:editions.length+1};}
 const no=ordered.findIndex(e=>e.date===date)+1,fail=s=>errors.push(s),stories=issue.stories||[];
 if(stories.length!==5)fail('Expected exactly five stories');
 stories.forEach((s,i)=>{
  if(s.number!==String(i+1).padStart(2,'0'))fail('Invalid permanent story number '+s.number);
  for(const key of ['title','art','why'])if(typeof s[key]!=='string'||!s[key].trim())fail('Missing story '+s.number+' '+key);
  for(const key of ['summary','implications','sources'])if(!Array.isArray(s[key])||!s[key].length)fail('Missing story '+s.number+' '+key);
  if(!(s.sources||[]).every(x=>Array.isArray(x)&&x.length===2&&x[0]&&/^https:\/\//.test(x[1])))fail('Invalid source '+s.number);
 });
 if(date>art.issuePolicy.historicalThrough){
  if(!issue.issueTitle||!issue.deck||!issue.signal?.length)fail('Missing edition framing');
  const selection=issue.editorialSelection;
  if(!selection||JSON.stringify(selection.historyDates)!==JSON.stringify(memory.history(editions,date).map(e=>e.date)))fail('Missing/incorrect seven-edition review');
 }
 const mark=marks['fb:'+date],pin=plates.issues?.[date];
 if(!mark?.frozen||mark.date!==date||mark.key!=='fb'||mark.no!==String(no).padStart(3,'0'))fail('Missing/mismatched frozen cover');
 else if(date>art.issuePolicy.historicalThrough){try{art.validateIssue(mark,marks);}catch(e){fail(e.message);}}
 if(!pin||stories.some(s=>!pin[s.number]?.frozen))fail('Missing frozen story plates');else if(date>art.issuePolicy.historicalThrough){
  try{art.validateEdition(issue,pin,art.recent(plates.issues,date));}catch(e){fail(e.message);}
 }
 // The hub represents the latest actual publication, including when checking an older retry.
 const latest=ordered.at(-1),latestPin=marks['fb:'+latest.date];
 if(hub!==undefined){
  if(!hub.includes('data-issue-mark="fb" data-edition="'+latest.date+'"')||!latestPin?.frozen||!hub.includes(latestPin.frozen))fail('Hub cover is not the latest frozen issue');
  const text=attr=>hub.match(new RegExp('data-fb="'+attr+'"[^>]*>([\\s\\S]*?)</(?:b|p|span)>'))?.[1];
  const escape=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;');
  if(text('count')!==String(editions.length)||text('title')!==escape(latest.issueTitle))fail('Hub latest metadata is stale');
 }
 return {date,no,state:errors.length?'incomplete':'complete',action:errors.length?'stop':'verify-deployment',latest:latest.date,errors};
}
function readCurrent(root,date){const read=p=>fs.readFileSync(path.join(root,p),'utf8');return inspect({date,html:read('daily-watchlist-5/index.html'),marks:registry(read('personal-updates/issue-mark-archive.js')),plates:registry(read('daily-watchlist-5/artwork-archive.js')),hub:read('personal-updates/index.html')});}
if(require.main===module){try{const result=readCurrent(path.resolve(__dirname,'..'),process.argv[2]);console.log(JSON.stringify(result,null,2));if(result.state==='incomplete')process.exitCode=1;}catch(e){console.error(e.message);process.exitCode=1;}}
module.exports={inspect,readCurrent,registry};
