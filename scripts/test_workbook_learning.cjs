/* Scoped Workbook release regressions; no runtime dependency is shipped to the reader. */
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm'),cp=require('node:child_process');
let assertions=0;function check(condition,message){assert(condition,message);assertions++}function equal(a,b,message){assert.deepEqual(a,b,message);assertions++}
const source=fs.readFileSync('daily-econ-challenge/index.html','utf8'),mobile=fs.readFileSync('personal-updates/mobile/mobile.js','utf8');
const data=JSON.parse(source.match(/id="challenge-data">([\s\S]*?)<\/script>/)[1]),schema=require('../daily-econ-challenge/learning-schema.cjs');
const report=schema.validate(data);equal(report.questions,data.editions.reduce((n,e)=>n+e.questions.length,0));
for(const e of data.editions)for(const q of e.questions){
 check(q.assistance!==q.explanation,e.date+'/'+q.id+' keeps help separate from the answer');
 check(!/\b(?:correct answer|answer is|option [A-H]|\([A-H]\) (?:is|are) correct)\b/i.test(q.assistance),'Assistance names no correct choice');
}
for(const field of ['assistance','explanation']){
 const absent=structuredClone(data);delete absent.editions[0].questions[0][field];assert.throws(()=>schema.validate(absent));assertions++;
 const active=structuredClone(data);active.editions[0].questions[0][field]='<p>Useful published support should remain readable for this question without active browser content or executable material.</p><script>alert(1)</script>';assert.throws(()=>schema.validate(active));assertions++;
 const malformed=structuredClone(data);malformed.editions[0].questions[0][field]+='<p>Unclosed';assert.throws(()=>schema.validate(malformed));assertions++;
}
const duplicate=structuredClone(data);duplicate.editions[0].questions[1].assistance=duplicate.editions[0].questions[0].assistance;assert.throws(()=>schema.validate(duplicate));assertions++;
function run(s,c){vm.createContext(c);vm.runInContext(s,c);return c}
// Use production state and render functions rather than an alternate implementation.
const records=new Map(),old=data.editions[1],first=data.editions[0],latest=data.editions.at(-1),q=old.questions[4],events=[];
const c={KEY:'dec:v1:',EDITIONS:data.editions.slice().reverse(),ed:old,st:null,navigation:0,resetRequest:null,Date:{now:()=>500},localStorage:{getItem:k=>records.get(k)||null,setItem:(k,v)=>records.set(k,v),removeItem:k=>records.delete(k),key:i=>[...records.keys()][i],get length(){return records.size}},announceProgress(){},history:{state:{kept:true},replaceState:(state,title,hash)=>{c.location.hash=hash;events.push(hash)}},location:{hash:'#'+old.date+'/q5'},window:{scrollTo(){},dispatchEvent:e=>events.push(e.type)},Event:class{constructor(type){this.type=type}},document:{getElementById:()=>null},render(){},app:{querySelector:()=>null},LETTERS:'ABCDEFGH'};
run(source.slice(source.indexOf('  function load(date)'),source.indexOf('  function exhibitHTML(')),c);
run(source.slice(source.indexOf('  function recovery('),source.indexOf('  function announceProgress(')),c);
run(source.slice(source.indexOf('  function go('),source.indexOf('  function pick(')),c);
run(source.slice(source.indexOf('  function pick('),source.indexOf('  function submit(){')),c);
run(source.slice(source.indexOf('  function confirmReset('),source.indexOf('  function recovery(')),c);
const legacy={answers:{q1:[0],q3:[2]},current:4,submitted:false};records.set(c.KEY+old.date,JSON.stringify(legacy));c.st=c.load(old.date);
equal(JSON.stringify(c.st.answers),JSON.stringify(legacy.answers),'existing answers are not migrated away');
equal(c.recovery(old.date).question,4,'an unanswered last-viewed Q5 remains recoverable');
for(const i of [7,2,3,2,4]){c.go(i,true);equal(c.st.current,i);equal(c.location.hash,'#'+old.date+'/'+old.questions[i].id);equal(JSON.stringify(c.st.answers),JSON.stringify(legacy.answers))}
check(c.st.viewedAt>500,'timestamps order same-millisecond visits deterministically');
equal(c.latestRecovery().edition,old.date,'native-only recovery chooses last viewed rather than newest published');
c.st.submitted=true;c.save();equal(c.recovery(old.date).question,4,'completed questions stay recoverable');c.st.submitted=false;
let selectedScore=c.scoreOf(old,c.st);c.learningState(q.id).assistanceUsed=true;c.learningState(q.id).assistanceUsed=true;c.save();equal(c.assistanceCount(old,c.st),1,'repeated help use counts a question once');equal(c.scoreOf(old,c.st),selectedScore,'help never changes score');
check(!c.learningHTML(q,'explanation'),'no Explanation material/control in unanswered question markup');
c.st.answers[q.id]=[1];check(!c.learningHTML(q,'explanation'),'a draft selection does not reveal Explanation');
c.st.committed[q.id]=[1];check(c.learningHTML(q,'explanation').includes(q.explanation),'a committed answer enables its authored Explanation');
c.learningState(q.id).explanationOpen=true;c.save();c.st=c.load(old.date);check(c.learningHTML(q,'explanation').includes(' open'),'Explanation remains open on a recorded revisit');
c.pick(0);check(!c.committed(q),'editing a submitted selection returns it to draft');check(!c.learningHTML(q,'explanation'),'changed selections cannot reuse prior answer commitment');
// A reset request/cancellation is render-only; only confirmation owns clearing.
const wbRecord='periodicals:reading:v2:/daily-econ-challenge/',wbSeen='periodicals:seen:v1:/daily-econ-challenge/';
records.set(c.KEY+latest.date,JSON.stringify({answers:{q1:[2]},current:2,submitted:false,learning:{q1:{assistanceUsed:true}},committed:{q1:[2]}}));
records.set(wbRecord,JSON.stringify({edition:old.date,question:4}));records.set(wbSeen,JSON.stringify([old.date]));
const foreign={'periodicals:mode':'night','commonplace:v1':'keep','periodicals:reading:v2:/daily-watchlist-5/':'saved','rupert:test':'frozen'};Object.entries(foreign).forEach(([k,v])=>records.set(k,v));
let snapshot=JSON.stringify([...records]);c.location.hash='#archive';c.resetRequest='all';equal(JSON.stringify([...records]),snapshot,'requesting confirmation does not clear records');c.resetRequest=null;equal(JSON.stringify([...records]),snapshot,'cancellation does not clear records');c.confirmReset();equal(JSON.stringify([...records]),snapshot,'confirmation without a current request is inert');
c.resetRequest='all';c.confirmReset();equal(c.ed.date,first.date);equal(c.st.current,0);equal(c.location.hash,'#'+first.date+'/q1');equal(JSON.stringify(c.st.answers),'{}');equal(JSON.stringify(c.st.learning),'{}');equal(JSON.stringify(c.st.committed),'{}');check(!c.st.submitted);check(!records.has(c.KEY+old.date)&&!records.has(c.KEY+latest.date));check(!records.has(wbRecord)&&!records.has(wbSeen));Object.entries(foreign).forEach(([k,v])=>equal(records.get(k),v,'reset touches only Workbook records'));
check(events.includes('workbook:reset'),'confirmed reset cancels the shared Workbook recovery session');
// Retake remains distinct: clear only its named set, preserving every other attempt.
const firstRecord=records.get(c.KEY+first.date);records.set(c.KEY+old.date,JSON.stringify(legacy));c.location.hash='#archive';c.resetRequest=old.date;c.confirmReset();equal(c.ed.date,old.date);equal(records.get(c.KEY+first.date),firstRecord);equal(JSON.stringify(c.st.answers),'{}');equal(c.location.hash,'#'+old.date+'/q1');
check(mobile.includes("if(!/daily-econ/.test(path))action('Start from top'"),'only Workbook loses the ambiguous return action');check(mobile.includes("if(workbook)addEventListener('workbook:reset'"),'reset-session handling is Workbook-only');
// Release guard: original published content and every frozen surface stay protected.
if(process.env.WORKBOOK_BASE){
 const base=process.env.WORKBOOK_BASE,before=cp.execFileSync('git',['show',base+':daily-econ-challenge/index.html'],{encoding:'utf8'}),prior=JSON.parse(before.match(/id="challenge-data">([\s\S]*?)<\/script>/)[1]);
 const original=structuredClone(data);original.editions.forEach(e=>e.questions.forEach(q=>delete q.assistance));equal(original,prior,'all original question wording, options, keys, exhibits, explanations, refs, dates and history are unchanged');
 const styles=s=>s.match(/<style>([\s\S]*?)<\/style>/)[1];equal(styles(source).replace(/\/\* Question-level learning and Ledger management[\s\S]*?(?=\/\* Periodicals shelf)/,''),styles(before),'accepted Workbook CSS is unchanged outside the new learning and Ledger-management rules');
 const allowed=new Set(['daily-econ-challenge/index.html','daily-econ-challenge/learning-schema.cjs','personal-updates/mobile/mobile.js','personal-updates/PUBLISHING.md','scripts/prepare_periodicals.cjs','scripts/test_workbook_learning.cjs','scripts/test_workbook_browser.cjs','scripts/test_reading_navigation.cjs','scripts/test_periodicals.cjs','scripts/test_publishing.cjs']);
 for(const f of cp.execFileSync('git',['diff','--name-only',base],{encoding:'utf8'}).trim().split('\n').filter(Boolean))check(allowed.has(f),'unrelated change '+f);
 equal(cp.execFileSync('git',['diff',base,'--','rupert','daily-watchlist-5','weekly-economics-environment','personal-updates/commonplace','personal-updates/handbook','personal-updates/index.html'],{encoding:'utf8'}),'','all frozen publications, hub and Atlas remain byte-identical');
}
console.log(assertions+' Workbook learning/progress assertions passed; '+report.questions+' authored question pairs validated.');
