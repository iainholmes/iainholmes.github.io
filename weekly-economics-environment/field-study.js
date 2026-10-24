/* Per-edition conceptual artwork. Stored artifacts are authoritative, including the original plate. */
(function(root){
'use strict';
const originality=typeof module==='object'&&module.exports?require('../personal-updates/art-originality.js'):root.PeriodicalsArtOriginality;
const concepts=[
 {id:'incidence',words:/incidence|burden|pass.through|cost bearer/ig,label:'Where the burden lands'},
 {id:'networks',words:/complement|grid|network|infrastructure|coordination/ig,label:'Connections across the landscape'},
 {id:'risk',words:/insurance|risk|resilien|loss|uncertainty/ig,label:'Exposure and shelter'},
 {id:'water',words:/water|river|flood|fish|spillover/ig,label:'Flow and displacement'},
 {id:'forest',words:/forest|timber|rotation|conservation|land/ig,label:'Land and time'},
 {id:'boundaries',words:/border|trade|jurisdiction|institution|rule|authority/ig,label:'Boundaries and exchange'},
 {id:'evidence',words:/evidence|measurement|identification|counterfactual|information/ig,label:'Observation and the landscape'}
];
function plan(text,previous){
 const ranked=concepts.map((c,i)=>({c,i,n:(String(text).match(c.words)||[]).length})).sort((a,b)=>b.n-a.n||a.i-b.i);
 const c=ranked[0].n?ranked[0].c:concepts.at(-1);
 return {version:2,concept:c.id,label:c.label,composition:previous&&previous.concept===c.id&&previous.composition==='valley'?'watershed':'valley'};
}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function legacyArtifact({date,no,synthesis,previous}){
 const p=plan(synthesis,previous);
 if(p.concept==='incidence')return transmission({date,no,label:p.label,concept:p.concept});
 const prefix='study-'+date,ink='#1f4a3b',clay='#b4532e',pollen='#e3b456',cream='#f3f0e6';
 let subject='';
 if(p.concept==='networks')subject='<path d="M110 295V128L84 176H136ZM460 279V98L434 146H486Z" fill="none" stroke="'+ink+'" stroke-width="5"/><path d="M84 176Q286 265 434 146M136 176Q306 242 486 146" fill="none" stroke="'+ink+'" stroke-width="3"/><path d="M240 290L300 230L358 290V339H240Z" fill="'+clay+'"/><path d="M277 339V285H316V339" fill="'+cream+'"/>';
 else if(p.concept==='risk')subject='<path d="M172 280L300 165L429 280V338H172Z" fill="'+ink+'"/><path d="M271 338V266H329V338" fill="'+cream+'"/><path d="M125 271Q300 35 475 271" fill="none" stroke="'+clay+'" stroke-width="12"/><path d="M150 282Q300 80 450 282" fill="none" stroke="'+pollen+'" stroke-width="3"/>';
 else if(p.concept==='water')subject='<path d="M365 122Q218 207 290 265T211 390H301Q405 302 347 258T425 137Z" fill="'+ink+'"/><path d="M395 131Q260 213 320 264T258 390" fill="none" stroke="'+cream+'" stroke-width="3"/><path d="M126 263L157 225L188 263V297H126ZM429 266L460 228L491 266V300H429Z" fill="'+clay+'"/>';
 else if(p.concept==='forest')subject='<path d="M174 334V149M328 314V97M444 338V189" stroke="'+clay+'" stroke-width="7"/><path d="M105 285L174 135L243 285ZM249 271L328 82L407 271ZM391 303L444 173L497 303Z" fill="'+ink+'"/><path d="M128 356Q300 386 482 349" fill="none" stroke="'+clay+'" stroke-width="3"/>';
 else if(p.concept==='boundaries')subject='<path d="M300 70V355" stroke="'+clay+'" stroke-width="13"/><path d="M120 261Q245 171 460 224M423 202L464 223L432 246" fill="none" stroke="'+ink+'" stroke-width="8"/><path d="M276 178H324V250H276Z" fill="'+pollen+'"/>';
 else subject='<path d="M145 321L297 133L450 320M297 133V323" fill="none" stroke="'+ink+'" stroke-width="5"/><circle cx="297" cy="133" r="25" fill="'+clay+'"/><path d="M104 321H490M185 309V333M297 309V333M403 309V333" stroke="'+ink+'" stroke-width="3"/>';
 const terrain=p.composition==='valley'?'<path d="M0 208Q140 92 310 200T600 172V390H0Z" fill="#c9cfb9"/><path d="M0 307Q240 190 600 284V390H0Z" fill="#dfe0cb"/>':'<path d="M0 170L240 312L600 129V390H0Z" fill="#c9cfb9"/><path d="M0 258L240 350L600 215V390H0Z" fill="#dfe0cb"/>';
 // Legacy renderer retained for unused subjects; transforms never establish a new identity.
 if(p.composition==='watershed')subject='<g transform="translate(600 0) scale(-1 1)">'+subject+'</g>';
 const html='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 390" role="img" aria-labelledby="'+prefix+'-title '+prefix+'-desc"><title id="'+prefix+'-title">'+esc(p.label)+'</title><desc id="'+prefix+'-desc">Original conceptual Field Study derived from this edition’s synthesis; not a geographic map or measured result.</desc><rect width="600" height="390" fill="'+cream+'"/><circle cx="484" cy="79" r="36" fill="'+pollen+'" opacity=".65"/>'+terrain+'<g fill="none" stroke="'+ink+'" opacity=".17"><path d="M0 337Q200 245 600 321M0 350Q200 258 600 334M0 363Q200 271 600 347"/></g>'+subject+'<path d="M18 40V18H40M560 18H582V40M18 350V372H40M560 372H582V350" stroke="'+ink+'" fill="none"/></svg><figcaption>FIELD STUDY '+String(no).padStart(3,'0')+' &nbsp; / &nbsp; '+esc(p.label)+'<br>Original conceptual illustration · not a geographic map</figcaption>';
 return {...p,no,html};
}
// New plates may retain the landscape furniture, but never recycle its central subject.
const scenes=[
 ['incidence-ledgers','incidence','<path d="M65 105H175V275H65ZM245 105H355V275H245ZM425 105H535V275H425Z" fill="#dfe0cb" stroke="#1f4a3b" stroke-width="3"/><path d="M85 145H155M265 190H335M445 235H515" stroke="#b4532e" stroke-width="12"/><path d="M175 155H245M355 215H425M215 140L245 155L215 170M395 200L425 215L395 230" fill="none" stroke="#1f4a3b" stroke-width="4"/>'],
 ['incidence-burden-layers','incidence','<path d="M90 105H510V150H90ZM90 180H510V225H90ZM90 255H510V300H90Z" fill="#dfe0cb"/><path d="M130 105V150H430V225H250V300" fill="none" stroke="#b4532e" stroke-width="17"/><path d="M90 322H510M90 85V322" stroke="#1f4a3b" stroke-width="4"/>'],
 ['network-bottleneck','networks','<path d="M65 110L230 190L65 290M535 110L370 190L535 290M230 190H370" fill="none" stroke="#1f4a3b" stroke-width="9"/><path d="M278 130V250M322 130V250" stroke="#b4532e" stroke-width="10"/><g fill="#e3b456"><circle cx="65" cy="110" r="17"/><circle cx="65" cy="290" r="17"/><circle cx="535" cy="110" r="17"/><circle cx="535" cy="290" r="17"/></g>'],
 ['risk-pooling','risk','<path d="M90 125L220 190M90 285L220 220M510 125L380 190M510 285L380 220" stroke="#1f4a3b" stroke-width="6"/><path d="M220 140Q300 110 380 140V280Q300 320 220 280Z" fill="#1f4a3b"/><ellipse cx="300" cy="140" rx="80" ry="23" fill="#e3b456"/><path d="M240 240H360" stroke="#b4532e" stroke-width="14"/>'],
 ['water-withdrawals','water','<path d="M60 135H535V190H60Z" fill="#1f4a3b"/><path d="M165 190V285H245M405 190V285H485" fill="none" stroke="#b4532e" stroke-width="15"/><path d="M100 235H220V315H100ZM345 235H465V315H345Z" fill="none" stroke="#1f4a3b" stroke-width="3"/><path d="M75 160H510" stroke="#f3f0e6" stroke-width="3"/>'],
 ['water-retention','water','<path d="M65 260Q150 150 235 260T405 260L535 155" fill="none" stroke="#1f4a3b" stroke-width="17"/><path d="M235 150V310M275 150V310" stroke="#b4532e" stroke-width="9"/><path d="M80 160H205V230H80Z" fill="#dfe0cb"/><path d="M90 180H195M90 200H195" stroke="#1f4a3b" stroke-width="3"/>'],
 ['forest-cohorts','forest','<path d="M75 105H205V305H75ZM235 105H365V305H235ZM395 105H525V305H395Z" fill="#dfe0cb"/><path d="M110 275V235H170V275M270 275V185H330V275M430 275V135H490V275" fill="none" stroke="#1f4a3b" stroke-width="12"/><path d="M75 320H525" stroke="#b4532e" stroke-width="5"/>'],
 ['boundary-jurisdictions','boundaries','<path d="M60 105H240V305H60ZM360 105H540V305H360Z" fill="#dfe0cb" stroke="#1f4a3b" stroke-width="3"/><path d="M115 155H420V255H485" fill="none" stroke="#1f4a3b" stroke-width="8"/><path d="M285 85V325M315 85V325" stroke="#b4532e" stroke-width="8"/><circle cx="300" cy="155" r="25" fill="#e3b456"/>'],
 ['evidence-intervals','evidence','<path d="M90 115H510M90 205H510M90 295H510" stroke="#1f4a3b" stroke-width="2"/><path d="M150 115H310M240 205H465M115 295H400M150 100V130M310 100V130M240 190V220M465 190V220M115 280V310M400 280V310" stroke="#1f4a3b" stroke-width="6"/><g fill="#b4532e"><circle cx="220" cy="115" r="13"/><circle cx="375" cy="205" r="13"/><circle cx="275" cy="295" r="13"/></g>']
];
function sceneArtifact({date,no},p,s){
 const html='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 390" role="img" aria-labelledby="study-'+date+'-title"><title id="study-'+date+'-title">'+esc(p.label)+'</title><desc>Conceptual relationships derived from the edition synthesis; not a measured result.</desc><rect width="600" height="390" fill="#f3f0e6"/><path d="M0 353Q180 315 330 351T600 338V390H0Z" fill="#dfe0cb"/><g data-art-subject>'+s[2]+'</g><path d="M18 40V18H40M560 18H582V40M18 350V372H40M560 372H582V350" stroke="#1f4a3b" fill="none"/></svg><figcaption>FIELD STUDY '+String(no).padStart(3,'0')+' &nbsp; / &nbsp; '+esc(p.label)+'<br>Original conceptual illustration · not a geographic map</figcaption>';
 return {version:4,date,no,concept:p.concept,label:p.label,composition:s[0],signature:'field-study:'+s[0],html};
}
function artifact(info){
 const p=plan(info.synthesis),history={...info.history};
 if(!concepts.some(c=>new RegExp(c.words.source,'i').test(info.synthesis)))throw Error('Field Study needs a content-supported synthesis: '+info.date);
 if(info.previous)history[info.previous.date||'previous:0000-00-00']=info.previous;
 const candidates=[{...legacyArtifact({...info,previous:null}),date:info.date},...scenes.filter(s=>s[1]===p.concept).map(s=>sceneArtifact(info,p,s))];
 for(const m of candidates)if(originality.review(m,history,'study').ok&&distinctFromCover(m,info.cover))return m;
 throw Error('Field Study needs a new unused content-supported '+p.concept+' composition for '+info.date+'; full history or same-edition cover collides. Author a new relevant scene; do not mirror or change the landscape background.');
}
function structure(a){const c=a&&a.composition||'';return /^(burden-transect|transect)$/.test(c)?'terrain-shocks':/^(valley|watershed)$/.test(c)?'legacy:'+originality.features(a).geometry:c;}
function distinctFromCover(study,cover){
 if(!study||!cover)return true;
 if(structure(study)===structure(cover))return false;
 // Retain the original within-edition shared-path guard as well as the new checks.
 const paths=s=>new Set([...String(s||'').matchAll(/<path[^>]*\bd="([^"]+)"/g)].map(m=>m[1].replace(/\s+/g,'')).filter(x=>x.length>35));
 const a=paths(study.html),b=paths(cover.frozen);if(a.size&&[...a].filter(p=>b.has(p)).length/a.size>=.5)return false;
 const r=originality.compare(study,cover);return !r.reason&&r.similarity<.86;
}
function validateOriginality(study,history,cover){
 const r=originality.validate(study,history,'study');
 if(!distinctFromCover(study,cover))throw Error('Field Study duplicates its same-edition issue cover: '+study.date);
 return r;
}
function transmission({date,no,label='Where the burden lands',concept='incidence'}){
 const svg="<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 600 390\" role=\"img\" aria-labelledby=\"study-DATE-title study-DATE-desc\"><title id=\"study-DATE-title\">Incidence through prices and institutions</title><desc id=\"study-DATE-desc\">An initial cost branches through prices, contracts, and legal or fiscal decisions to households, firms, and government. Cross-links show that the first payer need not be the final cost bearer. Conceptual, not a measured allocation.</desc><defs><pattern id=\"study-DATE-hatch\" width=\"6\" height=\"6\" patternUnits=\"userSpaceOnUse\"><path d=\"M0 0L6 6\" stroke=\"#1f4a3b\" stroke-width=\".6\" opacity=\".2\"/></pattern><marker id=\"study-DATE-arrow\" viewBox=\"0 0 8 8\" refX=\"7\" refY=\"4\" markerWidth=\"5\" markerHeight=\"5\" orient=\"auto\"><path d=\"M0 0L8 4L0 8Z\" fill=\"#1f4a3b\"/></marker></defs><rect width=\"600\" height=\"390\" fill=\"#f3f0e6\"/><path d=\"M18 40V18H40M560 18H582V40M18 350V372H40M560 372H582V350\" stroke=\"#1f4a3b\" fill=\"none\"/><g font-family=\"Instrument Sans,sans-serif\" font-size=\"12\" letter-spacing=\"1.5\" fill=\"#1f4a3b\"><text x=\"44\" y=\"59\">INITIAL COST</text><text x=\"227\" y=\"59\">TRANSMISSION</text><text x=\"441\" y=\"59\">COST BEARERS</text></g><path d=\"M44 77H556\" stroke=\"#1f4a3b\" opacity=\".35\"/><path d=\"M62 164L117 131L153 195L98 228Z\" fill=\"#b4532e\"/><path d=\"M69 173L110 148L137 194L96 219Z\" fill=\"url(#study-DATE-hatch)\"/><g fill=\"none\" stroke=\"#1f4a3b\" stroke-width=\"2.5\" marker-end=\"url(#study-DATE-arrow)\"><path d=\"M153 195H182V119H221M153 195H221M153 195H182V291H221M366 119H427M366 205H427M366 291H427\"/></g><g fill=\"#dfe0cb\" stroke=\"#1f4a3b\" stroke-width=\"1.5\"><path d=\"M226 96H365V142H226ZM226 182H365V228H226ZM226 268H365V314H226Z\"/></g><g fill=\"none\" stroke=\"#b4532e\" stroke-width=\"1.5\"><path d=\"M371 124L417 200M371 200L417 286M371 286L417 124\"/></g><g fill=\"#1f4a3b\" font-family=\"Instrument Sans,sans-serif\" font-size=\"16\"><text x=\"245\" y=\"125\">Prices</text><text x=\"245\" y=\"211\">Contracts</text><text x=\"245\" y=\"297\">Law &amp; budgets</text><text x=\"440\" y=\"125\">Households</text><text x=\"440\" y=\"211\">Firms</text><text x=\"440\" y=\"297\">Government</text></g><g fill=\"#e3b456\" stroke=\"#1f4a3b\" stroke-width=\"1.5\"><circle cx=\"431\" cy=\"119\" r=\"4\"/><circle cx=\"431\" cy=\"205\" r=\"4\"/><circle cx=\"431\" cy=\"291\" r=\"4\"/></g><text x=\"44\" y=\"347\" font-family=\"Instrument Sans,sans-serif\" font-size=\"13\" fill=\"#1f4a3b\">The first payer is not necessarily the final bearer.</text></svg>".replaceAll('DATE',date);
 const html=svg+'<figcaption>FIELD STUDY '+String(no).padStart(3,'0')+' &nbsp; / &nbsp; '+esc(label)+'<br>Original conceptual illustration · not a geographic map</figcaption>';
 return {version:3,no,concept,label,composition:'incidence-channels',html};
}
function mount(editions,stored){
 let previous=null;
 editions.forEach((ed,i)=>{const date=ed.dataset.edition,figure=ed.querySelector('.hero-art');if(!figure)return;
 const a=stored[date]||artifact({date,no:i+1,synthesis:ed.querySelector('.synthesis')?.textContent||ed.dataset.title,previous,history:stored});
 if(figure.innerHTML!==a.html)figure.innerHTML=a.html;figure.dataset.fieldStudy=date;figure.dataset.composition=a.composition;previous=a;});
}
const api={plan,artifact,mount,transmission,distinctFromCover,structure,validateOriginality};if(typeof module==='object'&&module.exports)module.exports=api;else root.PeriodicalsFieldStudies=api;
})(typeof window==='object'?window:{});
