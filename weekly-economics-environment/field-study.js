/* Per-edition conceptual artwork. Stored artifacts are authoritative, including the original plate. */
(function(root){
'use strict';
const concepts=[
 {id:'networks',words:/complement|grid|network|infrastructure|coordination/ig,label:'Connections across the landscape'},
 {id:'risk',words:/insurance|risk|resilien|loss|uncertainty/ig,label:'Exposure and shelter'},
 {id:'water',words:/water|river|flood|fish|spillover/ig,label:'Flow and displacement'},
 {id:'forest',words:/forest|timber|rotation|conservation|land/ig,label:'Land and time'},
 {id:'boundaries',words:/border|trade|jurisdiction|institution|rule|authority/ig,label:'Boundaries and exchange'},
 {id:'evidence',words:/evidence|measurement|identification|counterfactual|information/ig,label:'Observation and the landscape'}
];
function plan(text,previous){
 const ranked=concepts.map((c,i)=>({c,i,n:(String(text).match(c.words)||[]).length})).sort((a,b)=>b.n-a.n||a.i-b.i);
 const c=ranked[0].n?ranked[0].c:concepts[5];
 return {version:2,concept:c.id,label:c.label,composition:previous&&previous.concept===c.id&&previous.composition==='valley'?'watershed':'valley'};
}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function artifact({date,no,synthesis,previous}){
 const p=plan(synthesis,previous),prefix='study-'+date,ink='#1f4a3b',clay='#b4532e',pollen='#e3b456',cream='#f3f0e6';
 let subject='';
 if(p.concept==='networks')subject='<path d="M110 295V128L84 176H136ZM460 279V98L434 146H486Z" fill="none" stroke="'+ink+'" stroke-width="5"/><path d="M84 176Q286 265 434 146M136 176Q306 242 486 146" fill="none" stroke="'+ink+'" stroke-width="3"/><path d="M240 290L300 230L358 290V339H240Z" fill="'+clay+'"/><path d="M277 339V285H316V339" fill="'+cream+'"/>';
 else if(p.concept==='risk')subject='<path d="M172 280L300 165L429 280V338H172Z" fill="'+ink+'"/><path d="M271 338V266H329V338" fill="'+cream+'"/><path d="M125 271Q300 35 475 271" fill="none" stroke="'+clay+'" stroke-width="12"/><path d="M150 282Q300 80 450 282" fill="none" stroke="'+pollen+'" stroke-width="3"/>';
 else if(p.concept==='water')subject='<path d="M365 122Q218 207 290 265T211 390H301Q405 302 347 258T425 137Z" fill="'+ink+'"/><path d="M395 131Q260 213 320 264T258 390" fill="none" stroke="'+cream+'" stroke-width="3"/><path d="M126 263L157 225L188 263V297H126ZM429 266L460 228L491 266V300H429Z" fill="'+clay+'"/>';
 else if(p.concept==='forest')subject='<path d="M174 334V149M328 314V97M444 338V189" stroke="'+clay+'" stroke-width="7"/><path d="M105 285L174 135L243 285ZM249 271L328 82L407 271ZM391 303L444 173L497 303Z" fill="'+ink+'"/><path d="M128 356Q300 386 482 349" fill="none" stroke="'+clay+'" stroke-width="3"/>';
 else if(p.concept==='boundaries')subject='<path d="M300 70V355" stroke="'+clay+'" stroke-width="13"/><path d="M120 261Q245 171 460 224M423 202L464 223L432 246" fill="none" stroke="'+ink+'" stroke-width="8"/><path d="M276 178H324V250H276Z" fill="'+pollen+'"/>';
 else subject='<path d="M145 321L297 133L450 320M297 133V323" fill="none" stroke="'+ink+'" stroke-width="5"/><circle cx="297" cy="133" r="25" fill="'+clay+'"/><path d="M104 321H490M185 309V333M297 309V333M403 309V333" stroke="'+ink+'" stroke-width="3"/>';
 const terrain=p.composition==='valley'?'<path d="M0 208Q140 92 310 200T600 172V390H0Z" fill="#c9cfb9"/><path d="M0 307Q240 190 600 284V390H0Z" fill="#dfe0cb"/>':'<path d="M0 170L240 312L600 129V390H0Z" fill="#c9cfb9"/><path d="M0 258L240 350L600 215V390H0Z" fill="#dfe0cb"/>';
 // Two genuinely different landscape orientations for a repeated synthesis mechanism.
 if(p.composition==='watershed')subject='<g transform="translate(600 0) scale(-1 1)">'+subject+'</g>';
 const html='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 390" role="img" aria-labelledby="'+prefix+'-title '+prefix+'-desc"><title id="'+prefix+'-title">'+esc(p.label)+'</title><desc id="'+prefix+'-desc">Original conceptual Field Study derived from this edition’s synthesis; not a geographic map or measured result.</desc><rect width="600" height="390" fill="'+cream+'"/><circle cx="484" cy="79" r="36" fill="'+pollen+'" opacity=".65"/>'+terrain+'<g fill="none" stroke="'+ink+'" opacity=".17"><path d="M0 337Q200 245 600 321M0 350Q200 258 600 334M0 363Q200 271 600 347"/></g>'+subject+'<path d="M18 40V18H40M560 18H582V40M18 350V372H40M560 372H582V350" stroke="'+ink+'" fill="none"/></svg><figcaption>FIELD STUDY '+String(no).padStart(3,'0')+' &nbsp; / &nbsp; '+esc(p.label)+'<br>Original conceptual illustration · not a geographic map</figcaption>';
 return {...p,no,html};
}
function mount(editions,stored){
 let previous=null;
 editions.forEach((ed,i)=>{const date=ed.dataset.edition,figure=ed.querySelector('.hero-art');if(!figure)return;
 const a=stored[date]||artifact({date,no:i+1,synthesis:ed.querySelector('.synthesis')?.textContent||ed.dataset.title,previous});
 if(figure.innerHTML!==a.html)figure.innerHTML=a.html;figure.dataset.fieldStudy=date;figure.dataset.composition=a.composition;previous=a;});
}
const api={plan,artifact,mount};if(typeof module==='object'&&module.exports)module.exports=api;else root.PeriodicalsFieldStudies=api;
})(typeof window==='object'?window:{});
