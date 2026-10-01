const fs=require('fs'),vm=require('vm'),assert=require('assert');
const source=fs.readFileSync('weekly-economics-environment/index.html','utf8');
const block=source.slice(source.indexOf('function heronScroll()'),source.indexOf('function initCompanion()'));
let on=true,settled=0;const dismissed=new Set();
const ctx={companionMobile:()=>true,companionOn:()=>on,settleHeron:()=>settled++,addTo:(key,id)=>dismissed.add(id),HERON:{closed:{},items:[],current:null,edition:{dataset:{edition:'test'}}}};
vm.createContext(ctx);vm.runInContext(block,ctx);
function item(id){const classes=new Set();return {a:{id},state:'perched',btn:{hidden:false,classList:{add:k=>classes.add(k),remove:k=>classes.delete(k),contains:k=>classes.has(k)},setAttribute(k,v){this[k]=v}},panel:{hidden:false}}}
const a=item('a'),b=item('b');ctx.HERON.items=[a,b];
ctx.summon(a);assert.equal(a.state,'note');assert.equal(ctx.HERON.current,a);
ctx.release(a);assert(!a.btn.hidden&&a.panel.hidden,'Close collapses contents but retains the label');assert(a.btn.classList.contains('vacant'),'Close hides the bird');assert.equal(a.btn['aria-expanded'],'false');assert(ctx.HERON.closed['test:a']);assert.equal(ctx.HERON.current,null);assert(!b.btn.hidden,'closing affects only this perch');
ctx.summon(a);assert.equal(a.state,'note','retained label can reopen');assert(!a.btn.hidden);assert(!a.btn.classList.contains('vacant'),'reopening uses the existing inspection pose without flight');
ctx.dismissHeron(a);assert(a.btn.hidden&&a.panel.hidden,'dismissal hides both bird and label');assert(dismissed.has('a'),'dismissal is persisted');ctx.summon(a);assert(a.btn.hidden,'dismissed intervention cannot reopen');
ctx.summon(b);assert.equal(b.state,'note');on=false;ctx.release(b);const c=item('c');ctx.summon(c);assert.equal(c.state,'perched','Heron Off prevents opening');ctx.heronTick();assert.equal(settled,1);on=true;ctx.companionMobile=()=>false;ctx.summon(c);assert.equal(c.state,'perched','desktop cannot open a companion');
assert(!source.includes('new IntersectionObserver(function(ents)'),'standing perches do not depend on scroll-triggered arrival');
assert(source.includes("it.btn.hidden=!companionMobile()||!companionOn()||it.state==='dismissed'"));
assert(!source.includes('.heron-perch:hover .pose-inspect'),'hover alone must not bend the standing bird');
console.log('Heron lifecycle: open → close → bird gone + label retained → reopen; persistent dismissal; independent items, mobile scope and Off passed.');

// Exercise the real shelf controller with geometry and node identity, including resize restoration.
const shelfSource=fs.readFileSync('personal-updates/mobile-shelf.js','utf8');
const shelfEvents={},media={matches:true,addEventListener:(name,fn)=>media.change=fn},frames=[];
let panelNode;
function container(){return {children:[],dataset:{},hidden:false,setAttribute(){},append(node){if(node.parent)node.parent.children.splice(node.parent.children.indexOf(node),1);this.children.push(node);node.parent=this}}}
const notes=[0,1,2].map(i=>({hidden:false,liveTitle:'title-'+i}));
const units=notes.map((note,i)=>{const unit=container();unit.append(note);unit.querySelector=s=>s==='.press-note'?note:{dataset:{issueMark:['fb','sp','cp'][i]}};unit.getBoundingClientRect=()=>({left:16+i*324-shelf.scrollLeft});return unit});
const shelf={scrollLeft:0,querySelectorAll:()=>units,getBoundingClientRect:()=>({left:16}),after:node=>panelNode=node,addEventListener:(name,fn)=>shelfEvents[name]=fn,scrollTo:o=>shelf.scrollLeft=o.left};
const shelfContext={document:{getElementById:()=>shelf,createElement:container,fonts:{ready:{then(){}}}},matchMedia:()=>media,requestAnimationFrame:fn=>{frames.push(fn);return frames.length},ResizeObserver:class{observe(){}},addEventListener(){}};
vm.createContext(shelfContext);vm.runInContext(shelfSource,shelfContext);
assert.equal(panelNode.dataset.publication,'fb');assert.equal(panelNode.children.length,3);assert(units.every(u=>u.children.length===0),'mobile shelf holds only covers');
for(const [index,key] of ['fb','sp','cp'].entries()){shelf.scrollLeft=index*324;shelfEvents.scrollend();assert.equal(panelNode.dataset.publication,key);assert.deepEqual(notes.map(n=>n.hidden),notes.map((n,i)=>i!==index));assert.equal(panelNode.children[index],notes[index],'live hooks retain their original node');}
notes[2].liveTitle='new live title';assert.equal(panelNode.children[2].liveTitle,'new live title','live updates cannot leave a stale clone');
media.matches=false;media.change();assert(panelNode.hidden);assert(units.every((u,i)=>u.children[0]===notes[i]&&!notes[i].hidden),'desktop gets its exact original notes back');
media.matches=true;media.change();assert.equal(panelNode.dataset.publication,'cp');shelfEvents.focusin({target:{closest:()=>units[0]}});assert.equal(panelNode.dataset.publication,'fb','keyboard focus keeps the panel synchronized');
console.log('Mobile shelf: cover-only browsing, synchronized stationary notes, original live hooks, keyboard selection and desktop restoration passed.');

const mobile=fs.readFileSync('personal-updates/mobile/mobile.js','utf8');
const recoveryBlock=mobile.slice(mobile.indexOf('const workbook='),mobile.indexOf("addEventListener('periodicals:edition'"));
function recoveryContext(path){
 const stored=new Map(),els=[{id:'article-one',top:800,height:1200,title:'First substantial article'},{id:'connections',top:2000,height:1000,title:'What connects this week'}].map(e=>({...e,offsetHeight:e.height,getClientRects:()=>[1],getBoundingClientRect(){return {top:this.top-c.scrollY,bottom:this.top+this.height-c.scrollY}},querySelector:()=>({textContent:e.title})}));
 const resume={isConnected:true,hidden:true},c={path,stored,state:null,pending:null,saved:null,timer:null,engaged:false,location:{hash:''},scrollY:0,innerHeight:852,resume,resumeTitle:{},resumeContext:{},prev:{},next:{},clearTimeout(){},requestAnimationFrame:f=>f(),images(){},read:k=>stored.get(k)||null,write:(k,v)=>stored.set(k,v),localStorage:{removeItem:k=>stored.delete(k)},window:{scrollTo:p=>{c.scrollY=p.top}},document:{documentElement:{scrollHeight:3200},body:{classList:{contains:()=>false}},getElementById:id=>els.find(e=>e.id===id),querySelector:()=>null,querySelectorAll:s=>s.includes('.ix-item')?[]:els}};
 vm.createContext(c);vm.runInContext(recoveryBlock,c);return c;
}
const reader=recoveryContext('/weekly-economics-environment/');reader.state={current:'2026-09-25',dates:['2026-09-25'],title:'A resilient economy',hash:d=>'#edition-'+d};reader.scrollY=220;reader.save();assert(!reader.read(reader.key()),'masthead scrolling does not create Resume');reader.scrollY=900;reader.save();let record=reader.read(reader.key());assert.equal(record.section,'article-one');assert.equal(record.offset,220);assert(record.label.includes('First substantial article'));reader.pending=record;reader.scrollY=0;reader.restore();assert.equal(reader.scrollY,900,'semantic section and local offset restore reading position');reader.scrollY=2700;reader.save();assert(!reader.read(reader.key()),'Resume is removed near end');
const brief=recoveryContext('/daily-watchlist-5/');brief.state={current:'2026-09-30',label:'30 September',dates:['2026-09-30'],hash:d=>'#'+d};brief.scrollY=1200;brief.save();assert(brief.read(brief.key()).label.includes('Story article-one')); // story labels are derived from stable story IDs.
const book=recoveryContext('/daily-econ-challenge/');book.state={current:'2026-09-30',dates:['2026-09-30'],progress:{no:3,question:3,answered:2,total:8,submitted:false}};book.save();assert.equal(book.read(book.key()).question,3);assert.equal(book.read(book.key()).label,'No. 003 · Question 4 of 8');let restored;book.state.resume=q=>{restored=q};book.pending=book.read(book.key());book.restore();assert.equal(restored,3);book.state.progress.submitted=true;book.save();assert(!book.read(book.key()),'submitted sets do not offer Resume');
console.log('Resume: masthead threshold, semantic section/offset, near-end suppression, story context, native question recovery and completed-set suppression passed.');

const recovering=recoveryContext('/daily-econ-challenge/');const detail={current:'2026-09-30',dates:['2026-09-30'],hash:d=>'#'+d,progress:{no:3,question:1,answered:1,total:8,submitted:false},recovery:{edition:'2026-09-30',question:1,label:'No. 003 · Question 2 of 8'}};recovering.update({detail});assert(!recovering.resume.hidden);recovering.update({detail:{...detail,progress:{...detail.progress,question:2}}});assert(recovering.resume.hidden);recovering.update({detail:{...detail,progress:{...detail.progress,question:2}}});assert(recovering.resume.hidden,'rendering an active question must not reoffer recovery');console.log('Active-session Resume suppression passed.');

const swipeBlock=mobile.slice(mobile.indexOf('let touch=null;'),mobile.indexOf('function theme()'));
const listeners={},swipes=[];let touchTime=0;
const gesture={state:{},tools:{addEventListener:(n,f)=>{listeners[n]=f}},turn:d=>swipes.push(d),Date:{now:()=>touchTime}};
vm.createContext(gesture);vm.runInContext(swipeBlock,gesture);
function swipe(dx,dy,elapsed){touchTime=0;listeners.touchstart({touches:[{clientX:200,clientY:800}]});touchTime=elapsed;listeners.touchend({changedTouches:[{clientX:200+dx,clientY:800+dy}]})}
swipe(120,5,200);swipe(-120,5,200);swipe(20,2,200);swipe(120,100,200);swipe(120,5,900);listeners.touchstart({touches:[{clientX:0,clientY:0}]});listeners.touchcancel();listeners.touchend({changedTouches:[{clientX:120,clientY:0}]});assert.deepEqual(swipes,[-1,1]);assert.deepEqual(Object.keys(listeners),['touchstart','touchend','touchcancel']);console.log('Control-bar swipe direction, movement/time thresholds, vertical rejection and cancellation passed.');

book.state.progress.submitted=false;book.state.progress.answered=8;book.write(book.key(),{edition:'2026-09-30',question:7});book.save();assert(!book.read(book.key()),'fully answered but unsubmitted sets are also at the end');reader.scrollY=1000;reader.pending={edition:reader.state.current,fromTop:true};reader.restore();assert.equal(reader.scrollY,0);console.log('Start-from-top semantic recovery and fully answered set suppression passed.');
