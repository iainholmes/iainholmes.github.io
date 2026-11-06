#!/usr/bin/env node
'use strict';
/*
 * Independent release watchdog. It NEVER authors, alters, merges or publishes
 * content. It verifies the canonical archive, guarded artifacts and Pages.
 * Failures become actionable GitHub Issues instead of silent "no_update" runs.
 */
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const ROOT=path.resolve(__dirname,'..');
const TZ='America/New_York';
const DEFINITIONS=[
 {key:'fb',name:'Field Brief',hour:8,minute:0,grace:45,weekday:null,url:'daily-watchlist-5/',file:'daily-watchlist-5/index.html'},
 {key:'cp',name:'The Workbook',hour:8,minute:0,grace:45,weekday:'Fri',url:'daily-econ-challenge/',file:'daily-econ-challenge/index.html'},
 {key:'sp',name:'Loblolly & Logit',hour:15,minute:0,grace:45,weekday:'Fri',url:'weekly-economics-environment/',file:'weekly-economics-environment/index.html'}
];
function eastern(input){
 const d=input instanceof Date?input:new Date(input);
 if(!Number.isFinite(d.getTime()))throw Error('Invalid observation instant');
 const x=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit',weekday:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(d).filter(z=>z.type!=='literal').map(z=>[z.type,z.value]));
 return {date:x.year+'-'+x.month+'-'+x.day,weekday:x.weekday,minute:+x.hour*60+(+x.minute)};
}
function due(instant,definitions=DEFINITIONS){
 const x=eastern(instant);
 return definitions.filter(d=>(!d.weekday||d.weekday===x.weekday)&&x.minute>=d.hour*60+d.minute+d.grace).map(d=>({...d,date:x.date}));
}
function parseJSON(html,id){
 const m=html.match(new RegExp('<script[^>]*id="'+id+'"[^>]*>([\\s\\S]*?)<\\/script>'));
 if(!m)throw Error('Missing embedded '+id+' registry');
 return JSON.parse(m[1]);
}
function editionHTML(html,date){
 const match=[...html.matchAll(/<section class="edition"[^>]*data-edition="(\d{4}-\d{2}-\d{2})"/g)].find(m=>m[1]===date);
 if(!match)return null;
 const start=match.index;
 const tail=html.slice(start+match[0].length);
 const next=tail.search(/<section class="edition"[^>]*data-edition=|<\/main>/);
 if(next<0)throw Error('No end boundary for L&L edition');
 return html.slice(start,start+match[0].length+next);
}
function read(p){return fs.readFileSync(path.join(ROOT,p),'utf8')}
function audit(d){
 let html=read(d.file);
 const marks=require('../personal-updates/issue-mark-archive.js');
 const pin=marks[d.key+':'+d.date];
 const errors=[];
 if(!pin||!pin.frozen||pin.date!==d.date)errors.push('dated frozen cover absent');
 let selected=null,count=0;
 if(d.key==='fb'){
  const ed=parseJSON(html,'briefing-data').editions;
  selected=ed.find(e=>e.date===d.date);
  if(!selected)return {state:'missing',errors:['no dated Field Brief issue'],count:ed.length};
  if((ed.at(-1)?.date||'')<d.date)errors.push('new issue not current');
  if(selected.stories?.length!==5)errors.push('issue must have five stories');
  try{require('../daily-watchlist-5/editorial-order.cjs').validate(selected)}catch(e){errors.push('editorial order: '+e.message)}
  const plates=require('../daily-watchlist-5/artwork-archive.js').issues?.[d.date];
  if(!plates||selected.stories.some(s=>!plates[s.number]?.frozen))errors.push('one or more original story plates missing');
  count=ed.length;
 }else if(d.key==='cp'){
  const ed=parseJSON(html,'challenge-data').editions;
  selected=ed.find(e=>e.date===d.date);
  if(!selected)return {state:'missing',errors:['no dated Workbook set'],count:ed.length};
  if((ed.at(-1)?.date||'')<d.date)errors.push('new set not current');
  if(selected.questions?.length!==8)errors.push('set must have eight questions');
  if(selected.no!==ed.findIndex(e=>e.date===d.date)+1)errors.push('set number not sequential');
  count=ed.length;
 }else{
  const index=parseJSON(html,'ll-reading-index-data');
  selected=editionHTML(html,d.date);
  if(!selected)return {state:'missing',errors:['no dated L&L edition section'],count:index.editions.length};
  if((index.editions.at(-1)?.date||'')<d.date)errors.push('reading index missing due issue');
  if((selected.match(/<article class="entry"/g)||[]).length!==5)errors.push('edition must contain five complete readings');
  const field=parseJSON(html,'field-studies')[d.date];
  if(!field?.html||field.date!==d.date)errors.push('original Field Study absent');
  try{require('../weekly-economics-environment/source-evidence.cjs').validate({journal:html})}catch(e){errors.push('source evidence: '+e.message)}
  try{require('../weekly-economics-environment/notebook/validate.cjs').validate({journal:html})}catch(e){errors.push('Notebook: '+e.message)}
  try{require('../weekly-economics-environment/field-register-schema.cjs').validate({journal:html})}catch(e){errors.push('Field Register: '+e.message)}
  count=index.editions.length;
 }
 const hub=read('personal-updates/index.html');
 const expectedHubDate=(d.key==='sp'?parseJSON(html,'ll-reading-index-data').editions.at(-1)?.date:parseJSON(html,d.key==='fb'?'briefing-data':'challenge-data').editions.at(-1)?.date);
 const expectedHubPin=marks[d.key+':'+expectedHubDate];
 if(!hub.includes('data-issue-mark="'+d.key+'" data-edition="'+expectedHubDate+'"'))errors.push('Periodicals hub points at wrong current issue');
 if(expectedHubPin?.frozen&&!hub.includes(expectedHubPin.frozen))errors.push('Periodicals hub frozen cover mismatch');
 return {state:errors.length?'incomplete':'canonical_ready',errors,count,selected:!!selected};
}
const BASE='https://iainholmes.github.io/';
async function getPublic(rel,stamp){
 const url=BASE+rel+(rel.includes('?')?'&':'?')+'publisher_verify='+encodeURIComponent(stamp);
 const res=await fetch(url,{headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(25000),redirect:'follow'});
 if(!res.ok)throw Error('Public fetch '+rel+' returned HTTP '+res.status);
 return res.text();
}
async function verifyPages(d,stamp){
 const [page,hub]=await Promise.all([getPublic(d.url,stamp),getPublic('personal-updates/',stamp)]);
 const canonical=read(d.file),marks=require('../personal-updates/issue-mark-archive.js');
 const pin=marks[d.key+':'+d.date],errors=[];
 const latestDate=d.key==='sp'?parseJSON(canonical,'ll-reading-index-data').editions.at(-1)?.date:parseJSON(canonical,d.key==='fb'?'briefing-data':'challenge-data').editions.at(-1)?.date;
 const latestPin=marks[d.key+':'+latestDate];
 if(!hub.includes('data-issue-mark="'+d.key+'" data-edition="'+latestDate+'"'))errors.push('live hub has wrong latest cover metadata');
 if(latestPin?.frozen&&!hub.includes(latestPin.frozen))errors.push('live hub frozen cover differs');
 if(d.key==='fb'||d.key==='cp'){
  const id=d.key==='fb'?'briefing-data':'challenge-data';
  const local=parseJSON(canonical,id).editions,live=parseJSON(page,id).editions;
  if(local.length!==live.length||JSON.stringify(local.at(-1))!==JSON.stringify(live.at(-1))||JSON.stringify(local.find(x=>x.date===d.date))!==JSON.stringify(live.find(x=>x.date===d.date)))errors.push('live dated edition content does not match canonical archive');
 }else{
  const a=editionHTML(canonical,d.date),b=editionHTML(page,d.date);
  if(!b)errors.push('live L&L edition absent');
  else if(createHash('sha256').update(a).digest('hex')!==createHash('sha256').update(b).digest('hex'))errors.push('live L&L edition differs from canonical');
 }
 return {state:errors.length?'deployment_lag':'published',errors};
}
async function gh(method,resource,body){
 const token=process.env.GITHUB_TOKEN;
 if(!token||!process.env.GITHUB_REPOSITORY)throw Error('Cannot create incident: missing GitHub token or repository');
 const result=await fetch('https://api.github.com/repos/'+process.env.GITHUB_REPOSITORY+resource,{
  method,headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json','User-Agent':'periodicals-release-watchdog'},
  body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(20000)
 });
 if(!result.ok)throw Error('GitHub API '+method+' '+resource+' returned HTTP '+result.status+': '+(await result.text()).slice(0,260));
 return result.json();
}
function issueTitle(d){return '[Publisher incident] '+d.name+' — '+d.date}
async function reconcileIssue(d,result,stamp){
 if(!process.env.GITHUB_TOKEN)return;
 const title=issueTitle(d);
 const issues=await gh('GET','/issues?state=all&per_page=100');
 const issue=issues.find(i=>!i.pull_request&&i.title===title);
 if(result.state==='published'){
  if(issue&&issue.state==='open'){await gh('POST','/issues/'+issue.number+'/comments',{body:'Recovered: independent Pages and frozen-cover parity verified '+stamp+'.'});await gh('PATCH','/issues/'+issue.number,{state:'closed'});}
  return;
 }
 const run=process.env.GITHUB_SERVER_URL+'/'+process.env.GITHUB_REPOSITORY+'/actions/runs/'+process.env.GITHUB_RUN_ID;
 const details=result.errors.map(x=>'- '+x).join('\n')||'- Dated edition not present in canonical master';
 const body='@'+process.env.GITHUB_REPOSITORY.split('/')[0]+'\n\n**Publication has not been verified.**\n\n'+
 'Publication: '+d.name+'\nDue date (America/New_York): '+d.date+'\nState: '+result.state+'\n'+
 'Findings:\n'+details+'\n\nDiagnostic run: '+run+'\n\n'+
 'The watchdog cannot invent/review research or bypass publication gates. Inspect the authoring executor and release branch, recover via canonical editorial and artwork process, then verify the live site. Do not duplicate published content.';
 if(!issue)await gh('POST','/issues',{title,body});
 else if(issue.state==='closed')await gh('PATCH','/issues/'+issue.number,{state:'open',body});
}
async function main(){
 const now=process.env.WATCHDOG_NOW||new Date().toISOString();
 const targets=due(now);
 // Recheck prior outstanding incidents after their due date. Recovering a dated
 // issue tomorrow must close yesterday's incident once archive and Pages agree.
 if(process.env.GITHUB_TOKEN&&!process.argv.includes('--local-only')&&!process.argv.includes('--no-issues')){
  try{
   const open=await gh('GET','/issues?state=open&per_page=100');
   for(const issue of open){
    if(issue.pull_request)continue;
    const match=String(issue.title||'').match(/^\[Publisher incident\] (.+) — (\d{4}-\d\d-\d\d)$/);
    if(!match)continue;
    const definition=DEFINITIONS.find(x=>x.name===match[1]);
    if(!definition||match[2]>eastern(now).date||targets.some(x=>x.key===definition.key&&x.date===match[2]))continue;
    targets.push({...definition,date:match[2]});
   }
  }catch(e){console.error('Cannot recheck unresolved publication incidents:',e.message);process.exitCode=1;}
 }
 const results=[];
 for(const d of targets){
  let r;
  try{
   r=audit(d);
   if(r.state==='canonical_ready'&&!process.argv.includes('--local-only')){
    try{r={...r,...await verifyPages(d,now)}}catch(e){r={state:'unverified',errors:['Public network/parity check: '+e.message]}}
   }
  }catch(e){r={state:'unverified',errors:['Read-only verification error: '+e.message]}}
  results.push({publication:d.name,date:d.date,state:r.state,errors:r.errors});
  if(!process.argv.includes('--local-only')&&!process.argv.includes('--no-issues')){
   try{await reconcileIssue(d,r,now)}catch(e){results.at(-1).errors.push('Incident notification failed: '+e.message)}
  }
 }
 if(!targets.length)results.push({state:'not_due',message:'No publication exceeds the allowed preparation grace window'});
 console.log(JSON.stringify({observation:now,eastern:eastern(now),results},null,2));
 if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,'## Independent Periodicals verification\n\n'+results.map(x=>'- '+(x.publication||'Schedule')+': **'+x.state+'** '+(x.date||'')+' '+(x.errors||[]).join('; ')).join('\n')+'\n');
 if(results.some(x=>!['published','not_due'].includes(x.state))&&!process.argv.includes('--local-only'))process.exitCode=1;
}
module.exports={eastern,due,parseJSON,editionHTML,audit,verifyPages,DEFINITIONS,issueTitle};
if(require.main===module)main().catch(e=>{console.error('Watchdog infrastructure failure:',e);process.exitCode=1});
