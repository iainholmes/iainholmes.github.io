import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {wholeJourneyBounds} from '../assets/js/core/journey.js';
const source=readFileSync(new URL('../assets/js/travel-view.js',import.meta.url),'utf8');
const extract=(start,end)=>source.slice(source.indexOf(start),source.indexOf(end,source.indexOf(start)));
const origin={lat:35.9132,lng:-79.0558},destination={lat:44.8016,lng:-68.7712};
const result={feature:{geometry:{type:'LineString',coordinates:[[-79.0558,35.9132],[-77,39],[-68.7712,44.8016]]}}};
const alternative={feature:{geometry:{type:'LineString',coordinates:[[-79.0558,35.9132],[-110,45],[-68.7712,44.8016]]}}};
let count=0;const test=(name,fn)=>{fn();count++;console.log('PASS',name)};
const elements=new Map();const $=id=>{if(!elements.has(id))elements.set(id,{textContent:'',removeAttribute(){}});return elements.get(id)};
test('Route fit uses selected geometry and endpoints, excludes unrelated alternatives, and clears focus',()=>{
 let fitted,options,selected,stopped=0,resized=0;
 const map={raw:{stop(){stopped++},getBounds:()=>({contains:()=>false})},resize(){resized++},select(id){selected=id},fit(b,o){fitted=b;options=o}};
 const fit=new Function('map','state','wholeJourneyBounds','$','matchMedia','let mapFocus={id:"preview"};'+extract('function fitRoute(', 'function journeyRoute(')+';return {fitRoute,getFocus:()=>mapFocus}')(
 map,{results:[result],families:[alternative],origin,destination},wholeJourneyBounds,$,()=>({matches:false}));
 fit.fitRoute(true,{immediate:true});
 assert.deepEqual(fitted,wholeJourneyBounds([result],origin,destination));
 assert.ok(fitted[0][0]>-80);assert.equal(options.retainPadding,false);assert.equal(options.duration,0);
 assert.equal(selected,null);assert.equal(fit.getFocus(),null);assert.ok(stopped&&resized);
});
test('Layout synchronization measures the new map size before restoring route or focused place',()=>{
 const calls=[],frames=new Map();let next=0;
 const map={raw:{stop:()=>calls.push('stop')},resize:()=>calls.push('resize'),focus:id=>calls.push(id)};
 const sync=new Function('map','cancelAnimationFrame','requestAnimationFrame','fitRoute','let mapViewportFrame=0,mapFocus=null;'+extract('function syncMapViewport(){','function focusMapActivity(')+';return {syncMapViewport,setFocus:v=>mapFocus=v}')(
 map,id=>frames.delete(id),fn=>{frames.set(++next,fn);return next},()=>calls.push('fit'));
 sync.syncMapViewport();sync.syncMapViewport();assert.equal(frames.size,1);
 [...frames.values()][0]();frames.clear();assert.deepEqual(calls,['stop','resize','fit']);
 calls.length=0;sync.setFocus({id:'preview'});sync.syncMapViewport();[...frames.values()][0]();
 assert.deepEqual(calls,['stop','resize','preview']);
});
test('Active floating-map preview performs no scrolling or docking',()=>{
 const actions=[];
 const show=new Function('$','getComputedStyle','window','innerHeight','mapFollowDismissed','floatMap','stageTo','requestAnimationFrame','travelNavigationOffset','scrollToTravelTarget','let mapFloatOpen=true;'+extract('function showTravelMap(){',"document.querySelectorAll('.journey-stages a').forEach")+';return showTravelMap')(
 $,()=>({}),{scrollY:100},900,false,()=>actions.push('float'),()=>actions.push('stage'),()=>actions.push('frame'),()=>60,()=>actions.push('scroll'));
 show();assert.deepEqual(actions,[]);
});
test('Explicit preview from a docked Build the Journey opens its companion without scrolling',()=>{
 const actions=[];
 const show=new Function('$','getComputedStyle','window','innerHeight','mapFollowDismissed','floatMap','stageTo','requestAnimationFrame','travelNavigationOffset','scrollToTravelTarget','let mapFloatOpen=false;'+extract('function showTravelMap(){',"document.querySelectorAll('.journey-stages a').forEach")+';return showTravelMap')(
 ()=>({getBoundingClientRect:()=>({top:-100,bottom:1300})}),()=>({}),{scrollY:100},900,true,open=>actions.push(open),()=>actions.push('stage'),()=>actions.push('frame'),()=>60,()=>actions.push('scroll'));
 show();assert.deepEqual(actions,[true]);
});
console.log(`Travel map: ${count} focused regression checks passed.`);
