const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const runtime = fs.readFileSync(`${__dirname}/../desk.js`, 'utf8');
const { appearanceAt, nextBoundary, sectionScrollPlan, revealSelection, selectionForHash } = require('../desk.js');

test('Eastern boundaries in standard and daylight time, independent of device zone', () => {
  for (const [date, expected] of [
    ['2026-01-15T11:59:59Z', 'night'], ['2026-01-15T12:00:00Z', 'day'],
    ['2026-01-16T01:59:59Z', 'day'], ['2026-01-16T02:00:00Z', 'night'],
    ['2026-07-15T10:59:59Z', 'night'], ['2026-07-15T11:00:00Z', 'day'],
    ['2026-07-16T00:59:59Z', 'day'], ['2026-07-16T01:00:00Z', 'night'],
    ['2026-03-08T06:59:59Z', 'night'], ['2026-03-08T07:00:00Z', 'night'],
    ['2026-03-08T10:59:59Z', 'night'], ['2026-03-08T11:00:00Z', 'day'],
    ['2026-11-01T05:59:59Z', 'night'], ['2026-11-01T06:00:00Z', 'night'],
    ['2026-11-01T11:59:59Z', 'night'], ['2026-11-01T12:00:00Z', 'day']
  ]) assert.equal(appearanceAt(new Date(date)), expected, date);
});

test('Next automatic change crosses both DST changes and a year boundary correctly', () => {
  for (const [date, expected] of [
    ['2026-01-15T10:00:00Z', '2026-01-15T12:00:00.000Z'],
    ['2026-07-15T11:00:00Z', '2026-07-16T01:00:00.000Z'],
    ['2026-07-16T01:00:00Z', '2026-07-16T11:00:00.000Z'],
    ['2026-03-08T02:00:00Z', '2026-03-08T11:00:00.000Z'],
    ['2026-11-01T01:00:00Z', '2026-11-01T12:00:00.000Z'],
    ['2027-01-01T02:00:00Z', '2027-01-01T12:00:00.000Z']
  ]) assert.equal(new Date(nextBoundary(new Date(date))).toISOString(), expected, date);
});

test('Section plan reaches every destination including the bottom section', () => {
  for (const [viewportHeight, toolbarHeight] of [[900, 62], [874, 72], [667, 84]]) {
    for (const targetTop of [250, 1300, 2700]) {
      const plan = sectionScrollPlan({ targetTop, toolbarHeight, viewportHeight, documentHeight: 3020 });
      assert.equal(targetTop - plan.top, toolbarHeight + 12);
      assert.ok(3020 + plan.space - viewportHeight >= plan.top, 'Scroll destination is reachable');
      const repeat = sectionScrollPlan({ targetTop, toolbarHeight, viewportHeight, documentHeight: 3020 + plan.space, spacerHeight: plan.space });
      assert.deepEqual(repeat, plan, 'Repeated clicks do not accumulate blank space');
    }
  }
  assert.deepEqual(sectionScrollPlan({ targetTop: 20, toolbarHeight: 72, viewportHeight: 800, documentHeight: 3000 }), { top: 0, space: 0 });
});

const catalogue = [
  {id:'advisor',chapter:'research'},{id:'qst',chapter:'research'},
  {id:'field-brief',chapter:'reading'},{id:'loblolly',chapter:'reading'},
  {id:'workbook',chapter:'reading'},{id:'rupert',chapter:'reading'},
  {id:'portfolio',chapter:'profile'}
];
function browserHarness(start) {
  let now=Date.parse(start), timerId=0, frameId=0;
  const events={}, timers=new Map(), frames=new Map(), targets={}, works={};
  const listen=(name,fn)=>{const previous=events[name];events[name]=previous?e=>{previous(e);fn(e);}:fn;};
  function node(id='') { return {id,dataset:{},attrs:{},hidden:false,style:{},handlers:{},classList:{add(){}},
    setAttribute(k,v){this.attrs[k]=v;},removeAttribute(k){delete this.attrs[k];},
    addEventListener(k,fn){this.handlers[k]=fn;},focus(options){this.focused=options.preventScroll;}}; }
  const root={dataset:{},style:{setProperty(){}},clientHeight:874};
  const label={},meta={},button=node();button.hidden=true;button.querySelector=()=>label;
  const toolbar={getBoundingClientRect:()=>({height:72})};
  const spacer={style:{height:'0px'},getBoundingClientRect:()=>({height:parseFloat(spacer.style.height)})};
  Object.defineProperty(root,'scrollHeight',{get:()=>3020+parseFloat(spacer.style.height)});
  const topFor=chapter=>({research:250,reading:1300,profile:2700}[chapter])+(chapter!=='research' && works.advisor && !works.advisor.authentic.hidden?120:0);
  const links=['research','reading','profile'].map(id=>{
    targets[id]=node(id);targets[id].getBoundingClientRect=()=>({top:topFor(id)-window.scrollY});
    const link=node();link.hash=`#${id}`;return link;
  });
  const returns=links.map(link=>{const n=node();n.dataset.return=link.hash.slice(1);n.hidden=true;return n;});
  catalogue.forEach((work,i)=>{
    const n=node(`work-${work.id}`);n.dataset={work:work.id,name:work.id,chapter:work.chapter};
    n.collection=node();n.authentic=node();n.authentic.hidden=true;n.button=node();n.button.hidden=true;
    const text={},sign={};n.button.querySelector=selector=>selector==='span'?text:sign;
    n.querySelector=selector=>({'[data-collection]':n.collection,'[data-authentic]':n.authentic,'[data-reveal]':n.button}[selector]);
    n.getBoundingClientRect=()=>({top:topFor(work.chapter)+110+(i%2)*100-window.scrollY});
    works[work.id]=n;targets[n.id]=n;
  });
  targets.top=node('top');targets.top.getBoundingClientRect=()=>({top:-window.scrollY});
  const publicationHeading=node();publicationHeading.hidden=true;
  const document={documentElement:root,hidden:false,fonts:{ready:Promise.resolve()},
    querySelector:s=>({'meta[name="theme-color"]':meta,'.appearance-switch':button,'.desk-toolbar':toolbar,'[data-publication-heading]':publicationHeading}[s]),
    querySelectorAll:s=>({'.desk-nav a':links,'[data-work]':Object.values(works),'[data-return]':returns}[s]),
    getElementById:id=>id==='section-scroll-room'?spacer:targets[id],addEventListener:listen};
  const entries=[];let index=-1;
  function save(state,url,replace) {
    window.location.hash=url.startsWith('#')?url:'';window.history.state=state;
    const entry={state,hash:window.location.hash};
    if(replace && index>=0)entries[index]=entry;else{entries.splice(index+1);entries.push(entry);index++;}
  }
  const window={scrollY:0,location:{hash:'',pathname:'/desk/',search:''},reduced:false,deferSmooth:false,scrollCalls:[],
    history:{state:null,pushState(state,title,url){save(state,url,false);},replaceState(state,title,url){save(state,url,true);}},
    matchMedia(){return{matches:this.reduced};},
    requestAnimationFrame(fn){frames.set(++frameId,fn);return frameId;},
    scrollTo(options){this.scrollCalls.push(options);if(!(this.deferSmooth && options.behavior==='smooth'))this.scrollY=options.top;},
    addEventListener:listen};
  class Clock extends Date {constructor(...args){super(...(args.length?args:[now]));}}
  vm.runInNewContext(runtime,{document,window,Intl,Date:Clock,
    setTimeout(fn,delay){const id=++timerId;timers.set(id,{fn,delay});return id;},clearTimeout(id){timers.delete(id);}});
  return {root,meta,label,button,events,links,returns,targets,works,window,timers,spacer,entries,publicationHeading,
    advance(date){now=Date.parse(date);},mount(){events.DOMContentLoaded();},
    flush(){const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn());},
    travel(delta){index+=delta;const entry=entries[index];window.history.state=entry.state;window.location.hash=entry.hash;events.popstate();events.hashchange();}};
}
const tick=()=>new Promise(setImmediate);
const click=link=>link.handlers.click({button:0,preventDefault(){}});
const visible=h=>Object.entries(h.works).filter(([,w])=>!w.authentic.hidden).map(([id])=>id);

test('Initial render has only collection faces; appearance is set before DOM paint',()=>{
  const h=browserHarness('2026-07-15T12:00:00Z');assert.equal(h.root.dataset.appearance,'day');assert.equal(h.meta.content,'#f3efe4');
  h.mount();assert.deepEqual(visible(h),[]);assert.ok(Object.values(h.works).every(w=>!w.collection.hidden && !w.button.hidden));
  assert.equal(h.publicationHeading.hidden,true);assert.equal(h.root.dataset.chapter,'home');assert.equal(h.entries.length,1);
});

test('Visit-only appearance override and Eastern scheduling stay independent of reveals',async()=>{
  const h=browserHarness('2026-07-16T00:59:59Z');h.mount();
  const scheduled=[...h.timers.values()][0];assert.equal(scheduled.delay,1030);
  h.advance('2026-07-16T01:00:01Z');scheduled.fn();assert.equal(h.root.dataset.appearance,'night');
  click(h.links[0]);await tick();h.button.handlers.click();assert.equal(h.root.dataset.appearance,'day');
  assert.deepEqual(visible(h),['advisor','qst']);assert.equal(h.button.attrs['aria-pressed'],'false');
  h.advance('2026-07-17T02:00:00Z');h.events.visibilitychange();assert.equal(h.root.dataset.appearance,'day');
  h.events.pageshow({persisted:true});assert.equal(h.root.dataset.appearance,'night');assert.deepEqual(visible(h),['advisor','qst']);
});

test('Each TOC reveals exactly its chapter after layout changes and aligns at 12px clearance',async()=>{
  const h=browserHarness('2026-07-15T12:00:00Z');h.mount();
  for(const link of h.links){click(link);await tick();const id=link.hash.slice(1);
    assert.deepEqual(visible(h),catalogue.filter(w=>w.chapter===id).map(w=>w.id));
    assert.equal(h.targets[id].getBoundingClientRect().top,84);assert.equal(h.targets[id].focused,true);
    assert.equal(h.targets[id].dataset.complete,'true');assert.equal(link.attrs['aria-current'],'location');
    assert.equal(h.window.scrollCalls.at(-1).behavior,'smooth');
  }
  const count=h.entries.length;click(h.links[2]);await tick();assert.equal(h.entries.length,count,'No duplicate history entry');
  assert.ok(parseFloat(h.spacer.style.height)>0);
  h.links[0].handlers.click({button:0,metaKey:true,preventDefault(){assert.fail('Modifier click intercepted');}});
});

test('Individual controls reveal only selected works, preserve siblings, and reverse accessibly',async()=>{
  const h=browserHarness('2026-07-15T12:00:00Z');h.mount();h.works.qst.button.handlers.click();await tick();
  assert.deepEqual(visible(h),['qst']);assert.equal(h.works.qst.collection.hidden,true);assert.equal(h.works.qst.button.attrs['aria-expanded'],'true');
  assert.equal(h.works.qst.focused,true);assert.equal(h.works.qst.getBoundingClientRect().top,84);
  h.works.advisor.button.handlers.click();await tick();assert.deepEqual(visible(h),['advisor','qst']);
  h.works.qst.button.handlers.click();await tick();assert.deepEqual(visible(h),['advisor']);assert.equal(h.works.qst.collection.hidden,false);
  h.works['field-brief'].button.handlers.click();await tick();assert.deepEqual(visible(h),['field-brief']);assert.equal(h.publicationHeading.hidden,false);
  h.works['field-brief'].button.handlers.click();await tick();assert.deepEqual(visible(h),[]);assert.equal(h.publicationHeading.hidden,true);
});

test('Chapter return restores collection without affecting appearance or losing focus',async()=>{
  const h=browserHarness('2026-07-15T12:00:00Z');h.mount();h.button.handlers.click();click(h.links[1]);await tick();
  assert.equal(h.returns[1].hidden,false);h.returns[1].handlers.click();await tick();
  assert.deepEqual(visible(h),[]);assert.equal(h.returns[1].hidden,true);assert.equal(h.targets.reading.focused,true);
  assert.equal(h.root.dataset.appearance,'night');assert.equal(h.targets.reading.getBoundingClientRect().top,84);
});

test('Ordinary scrolling never reveals or undoes a reveal; returning to top resets everything',async()=>{
  const h=browserHarness('2026-07-15T12:00:00Z');h.mount();
  for(const top of [100,1400,2800]){h.window.scrollY=top;h.events.scroll();h.flush();assert.deepEqual(visible(h),[]);}
  h.works.workbook.button.handlers.click();await tick();h.events.scrollend();const count=h.entries.length;
  h.window.scrollY=2500;h.events.scroll();h.flush();assert.deepEqual(visible(h),['workbook']);assert.equal(h.entries.length,count);
  h.window.scrollY=0;h.events.scroll();h.flush();assert.deepEqual(visible(h),[]);assert.equal(h.window.location.hash,'');assert.equal(h.entries.length,count);
});

test('Direct chapter and individual fragments restore meaningful reveal states',async()=>{
  for(const [hash,expected] of [['#reading',['field-brief','loblolly','workbook','rupert']],['#work-qst',['qst']],['#profile',['portfolio']]]){
    const h=browserHarness('2026-07-15T12:00:00Z');h.window.location.hash=hash;h.mount();await tick();
    assert.deepEqual(visible(h),expected);assert.equal(h.targets[hash.slice(1)].getBoundingClientRect().top,84);assert.equal(h.window.scrollCalls.at(-1).behavior,'auto');
  }
});

test('Back/Forward restores precise individual selections and closed collection snapshots',async()=>{
  const h=browserHarness('2026-07-15T12:00:00Z');h.mount();
  h.works['field-brief'].button.handlers.click();await tick();
  h.works.loblolly.button.handlers.click();await tick();assert.deepEqual(visible(h),['field-brief','loblolly']);
  h.travel(-1);await tick();assert.deepEqual(visible(h),['field-brief']);
  h.travel(1);await tick();assert.deepEqual(visible(h),['field-brief','loblolly']);
  h.returns[1].handlers.click();await tick();assert.deepEqual(visible(h),[]);
  h.travel(-1);await tick();assert.deepEqual(visible(h),['field-brief','loblolly']);
  h.travel(1);await tick();assert.deepEqual(visible(h),[]);assert.equal(h.targets.reading.getBoundingClientRect().top,84);
});

test('Reduced motion, rapid requests and journey interruption avoid scroll loops',async()=>{
  const h=browserHarness('2026-07-15T12:00:00Z');h.mount();h.window.reduced=true;
  click(h.links[0]);click(h.links[1]);await tick();assert.equal(h.window.scrollCalls.length,1);assert.equal(h.window.scrollCalls[0].behavior,'auto');
  assert.deepEqual(visible(h),['field-brief','loblolly','workbook','rupert']);
  h.events.touchstart();h.events.resize();h.window.scrollY=1600;h.events.scroll();h.flush();
  assert.equal(h.window.scrollCalls.length,1);assert.deepEqual(visible(h),['field-brief','loblolly','workbook','rupert']);
});

test('Reveal reducer sanitizes history and cannot activate unrelated chapters',()=>{
  assert.deepEqual(revealSelection([],{type:'restore',ids:['qst','qst','bad','rupert']},catalogue),['qst']);
  assert.deepEqual(selectionForHash('#work-advisor',catalogue),['advisor']);
  assert.deepEqual(selectionForHash('#collection',catalogue),[]);
  assert.deepEqual(revealSelection(['qst'],{type:'toggle',id:'bad'},catalogue),['qst']);
});
