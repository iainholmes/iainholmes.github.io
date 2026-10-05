// Functional navigation checks. No browser/runtime dependency is added to the publication.
const fs=require('fs'),vm=require('vm'),assert=require('assert'),{execFileSync}=require('child_process');
const wb=fs.readFileSync('daily-econ-challenge/index.html','utf8'),fb=fs.readFileSync('daily-watchlist-5/index.html','utf8'),mobile=fs.readFileSync('personal-updates/mobile/mobile.js','utf8');
const editions=JSON.parse(wb.match(/<script type="application\/json" id="challenge-data">([\s\S]*?)<\/script>/)[1]).editions;
const old=editions.find(e=>e.date==='2026-10-01'),latest=editions.at(-1);
assert(old&&latest.date!==old.date,'published Set 004 fixture and a newer set exist');
function run(source,c){vm.createContext(c);vm.runInContext(source,c);return c}
const recoverySource=wb.slice(wb.indexOf('  function recovery('),wb.indexOf('  function announceProgress('));
const native=new Map([[old.date,{current:6,answers:{q1:[0]},submitted:false}]]);
const recovery=run(recoverySource,{EDITIONS:editions,load:d=>native.get(d),pad:n=>String(n).padStart(3,'0')});
assert.equal(recovery.recovery(old.date).question,6);
assert.equal(recovery.recovery(old.date,0).label,'No. 004 · Question 1 of 8');
assert.equal(recovery.recovery(old.date,99).question,7,'saved questions are bounded by their own set');
assert.equal(recovery.recovery('missing'),null);
native.set(latest.date,{current:0,answers:{},submitted:true});
assert.equal(recovery.recovery(latest.date).question,0,'completion does not discard the last viewed question');
assert.equal(recovery.recovery(old.date).question,6,'today completion cannot invalidate older progress');

const recoveryBlock=mobile.slice(mobile.indexOf('const workbook='),mobile.indexOf("addEventListener('periodicals:edition'"));
function reader(path='/daily-econ-challenge/'){
 const stored=new Map(),frames=[],actions={};
 const c={path,stored,state:null,pending:null,saved:null,timer:null,engaged:false,location:{hash:''},scrollY:0,innerHeight:844,resume:{isConnected:true,hidden:true},resumeTitle:{},resumeContext:{},prev:{},next:{},clearTimeout(){},requestAnimationFrame:f=>frames.push(f),images(){},read:k=>stored.get(k)||null,write:(k,v)=>stored.set(k,v),localStorage:{removeItem:k=>stored.delete(k)},window:{scrollTo:(p,y)=>c.scrollY=typeof p==='number'?y:p.top},document:{readyState:'complete',documentElement:{scrollHeight:10000},body:{classList:{contains:()=>false}},querySelector:()=>null,querySelectorAll:()=>[],getElementById:()=>null},action:(label,fn)=>actions[label]=fn};
 run(recoveryBlock,c);
 vm.runInContext(mobile.slice(mobile.indexOf("action('Resume'"),mobile.indexOf('resume.append(')),c);
 c.actions=actions;c.flush=()=>{while(frames.length)frames.shift()()};return c;
}
function detail(c,date){const p=native.get(date)||{current:0,answers:{},submitted:false},e=editions.find(e=>e.date===date);return {current:date,dates:editions.map(e=>e.date).sort(),hash:d=>'#'+d,recover:recovery.recovery,recovery:recovery.latestRecovery(),progress:{no:e.no,question:p.current,answered:Object.values(p.answers).filter(a=>a.length).length,total:e.questions.length,submitted:p.submitted},resume:q=>navigate(q)};
 function navigate(q){p.current=q;c.location.hash='#'+date+'/'+e.questions[q].id;c.update({detail:detail(c,date)});c.scrollY=400}}
function setup(){const c=reader();c.write(c.key(),{edition:old.date,question:6,label:'No. 004 · Question 7 of 8'});c.update({detail:detail(c,latest.date)});return c}
const undecided=setup();assert(!undecided.resume.hidden,'completed today still offers older unfinished set');
undecided.save();assert.equal(undecided.read(undecided.key()).edition,old.date,'pagehide/scroll cannot overwrite an undecided recovery');
for(const action of ['Resume']){
 native.get(old.date).current=6;const c=setup(),answers=JSON.stringify(native.get(old.date).answers);
 assert.equal(c.actions['Start from top'],undefined,'Workbook recovery offers Resume only');
 c.actions[action]();assert.equal(c.location.hash,'#'+old.date,'Resume identifies the set named in the panel');
 c.update({detail:detail(c,old.date)});c.flush();
 assert.equal(native.get(old.date).current,6);
 assert.equal(c.location.hash,'#'+old.date+'/q7');
 assert.equal(JSON.stringify(native.get(old.date).answers),answers,'navigation preserves all answers');
 assert.equal(c.pending,null);assert(c.resume.hidden);
 assert.equal(c.scrollY,400,'Resume retains the saved question reading area');
}
native.get(old.date).current=6;
const fallback=reader();fallback.update({detail:detail(fallback,latest.date)});assert.equal(fallback.saved.edition,old.date,'new session reconstructs native-only progress');
fallback.write(fallback.key(),{edition:'missing',question:4,label:'Missing set'});fallback.update({detail:detail(fallback,latest.date)});assert.equal(fallback.saved.edition,old.date,'unknown sets fall back to valid native progress');
fallback.write(fallback.key(),{edition:latest.date,question:4,label:'Completed set'});fallback.update({detail:detail(fallback,latest.date)});assert.equal(fallback.saved.edition,latest.date,'a completed last-viewed set remains resumable');assert.equal(fallback.saved.question,4);
const switching=setup();switching.update({detail:detail(switching,old.date)});assert(switching.engaged&&switching.resume.hidden,'deliberate cross-set routing leaves the recovery session');
console.log('Workbook recovery: Resume only, exact last-viewed question, native fallback, completed/stale records, unresolved session and preserved answers passed.');

const goSource=wb.slice(wb.indexOf('  function go('),wb.indexOf('  function pick('));
const historyCalls=[],g=run(goSource,{navigation:0,ed:old,st:{current:0,answers:{q1:[0]},submitted:false},history:{state:{retained:true},replaceState:(state,title,hash)=>historyCalls.push({state,hash})},save(){},render(){},document:{getElementById:()=>null}});
for(const q of [6,2,3,2,0]){g.go(q,true);assert.equal(g.st.current,q);assert.equal(historyCalls.at(-1).hash,'#'+old.date+'/'+old.questions[q].id)}
assert.equal(JSON.stringify(g.st.answers),'{"q1":[0]}');assert(historyCalls.every(c=>c.state.retained),'question routing retains history state');
const routeSource=wb.slice(wb.indexOf('  function route(){'),wb.indexOf("  document.querySelectorAll('#homeLink"));
const routeFrames=[],targets=[],r={navigation:0,location:{hash:'#'+old.date+'/q7'},EDITIONS:editions,ed:null,st:null,load:d=>native.get(d),fresh:()=>({current:0,answers:{},submitted:false}),save(){},render(){},window:{scrollTo(){}},requestAnimationFrame:f=>routeFrames.push(f),document:{getElementById:()=>null,querySelector:()=>({isConnected:true,scrollIntoView:o=>targets.push(o.block)}),fonts:{ready:{then:f=>f()}}}};
run(routeSource,r);r.route();assert.equal(r.ed.date,old.date);assert.equal(r.st.current,6);
r.location.hash='#'+latest.date;r.route();routeFrames.shift()();assert.equal(targets.length,0,'newer routes cancel obsolete deferred question scroll');
r.location.hash='#'+old.date+'/q3';r.route();routeFrames.shift()();assert.equal(r.st.current,2);assert.equal(targets.at(-1),'start');
let initialScrolls=0,readyScrolls=0;r.document.querySelector=()=>({scrollIntoView:()=>initialScrolls++});r.route();
r.document.querySelector=()=>({scrollIntoView:()=>readyScrolls++});routeFrames.shift()();assert.equal(initialScrolls,0);assert.equal(readyScrolls,1,'shared-ready replacement of the same question must retain direct-link scrolling');
assert(wb.includes("if(location.hash===hash)route();else location.hash=hash"),'same-hash latest control routes explicitly');
console.log('Workbook canonical question URL, repeated numbered/Previous/Next paths, direct routes and stale-scroll cancellation passed.');

const positionSource=fb.slice(fb.indexOf('  let readingPosition='),fb.indexOf('  function render(ed,storyNo)'));
const events={},positionFrames=[],observers=[],scrolls=[],article={},node={id:'story-03',getBoundingClientRect:()=>({top:storyTop-p.window.scrollY})};let storyTop=2400,headerBottom=49;
const transitionEvents={},main={addEventListener:(type,fn)=>transitionEvents[type]=fn,removeEventListener:type=>delete transitionEvents[type]};let transform='none';
const p=run(positionSource,{mount:{firstElementChild:article,closest:()=>main},getComputedStyle:()=>({transform}),location:{hash:'#2026-10-04/03'},window:{scrollY:1700,scrollTo:(x,y)=>{assert.equal(x,0);scrolls.push(y);p.window.scrollY=y}},document:{getElementById:()=>node,querySelector:s=>{assert.equal(s,'.run');return {getBoundingClientRect:()=>({bottom:headerBottom})}},fonts:{ready:{then:f=>f()}}},requestAnimationFrame:f=>positionFrames.push(f),addEventListener:(type,fn)=>events[type]=fn,ResizeObserver:class{constructor(fn){this.fn=fn;observers.push(this)}observe(a){assert.equal(a,article)}disconnect(){this.disconnected=true}}});
p.positionReading(node,p.location.hash);positionFrames.shift()();assert.equal(scrolls.length,1);assert.equal(scrolls[0],storyTop-headerBottom);
assert.equal(node.getBoundingClientRect().top,headerBottom,'selected reading starts immediately below the masthead, with no preceding reading content exposed by stacked scroll offsets');
// Existing safe-area padding increases the real masthead height; layout changes also move the reading.
headerBottom=69;storyTop+=35;
observers.at(-1).fn();positionFrames.shift()();assert.equal(scrolls.length,2,'post-render keeping/font layout realigns the destination');
assert.equal(node.getBoundingClientRect().top,headerBottom,'framing uses the measured masthead including its safe area');
events.touchstart();assert(observers.at(-1).disconnected);observers.at(-1).fn();positionFrames.shift()();assert.equal(scrolls.length,2,'reading input ends alignment ownership');
p.positionReading(node,p.location.hash);p.location.hash='#2026-10-04/05';positionFrames.shift()();assert.equal(scrolls.length,2,'late alignment cannot override a new hash');
p.location.hash='#2026-10-04/03';p.positionReading(node,p.location.hash);p.mount.firstElementChild={};positionFrames.shift()();assert.equal(scrolls.length,2,'replaced editions cannot receive stale scrolling');
p.stopReadingPosition();p.mount.firstElementChild=article;transform='matrix(.985, 0, 0, .985, 56, 0)';p.positionReading(node,p.location.hash);positionFrames.shift()();assert.equal(scrolls.length,2,'Index surface transform must settle before measuring a destination');
transform='none';transitionEvents.transitionend({target:main,propertyName:'transform'});positionFrames.shift()();assert.equal(scrolls.length,3,'Index transition completion aligns the final reading coordinates');
p.stopReadingPosition();assert.deepEqual(Object.keys(transitionEvents),[],'route/input cancellation removes transition listeners');
assert(fb.includes("history.scrollRestoration='manual'"));assert(wb.includes("history.scrollRestoration='manual'"));
console.log('Field Brief route-scoped layout alignment, browser-history ownership, input cancellation and stale-route guards passed.');

// Release-only audit against the caller's baseline, without pinning future publication content.
if(process.env.PERIODICALS_NAV_BASE){
 const base=process.env.PERIODICALS_NAV_BASE,allowed=new Set(['daily-econ-challenge/index.html','daily-watchlist-5/index.html','personal-updates/mobile/mobile.js','scripts/test_reading_navigation.cjs']);
 const names=execFileSync('git',['diff','--name-only',base],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
 for(const name of names)assert(allowed.has(name),'unrelated release change: '+name);
 for(const path of ['daily-econ-challenge/index.html','daily-watchlist-5/index.html']){
  const before=execFileSync('git',['show',base+':'+path],{encoding:'utf8'}),after=fs.readFileSync(path,'utf8');
  const styles=s=>[...s.matchAll(/<style\b[^>]*>[\s\S]*?<\/style>/g)].map(m=>m[0]);
  const data=s=>[...s.matchAll(/<script type="application\/json"[^>]*>[\s\S]*?<\/script>/g)].map(m=>m[0]);
  assert.deepEqual(styles(after),styles(before),'approved CSS remains byte-identical');assert.deepEqual(data(after),data(before),'published content/artwork remains byte-identical');
  const shell=s=>s.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');assert.equal(shell(after),shell(before),'static visual markup/font imports remain unchanged');
 }
 assert.equal(execFileSync('git',['diff',base,'--','rupert'],{encoding:'utf8'}),'');
 console.log('Release boundary: only scoped navigation files; all CSS, static typography, published data/artwork and /rupert/ unchanged.');
}
