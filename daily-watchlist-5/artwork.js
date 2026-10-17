/* Local editorial-print plates. A composition ID denotes geometry, never a seed/rotation/color. */
(function(root){
  'use strict';
  const inks={paper:'#dfc7a3',ink:'#2c241d',light:'#f4ead7',red:'#c4452c',blue:'#1b4a6b',green:'#1d5f47',gold:'#c98a12',brown:'#7c5a3e',wine:'#7a1f33'};
  const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function hash(s){let n=2166136261;for(const c of s){n^=c.charCodeAt(0);n=Math.imul(n,16777619)}return n>>>0}
  // Each scene changes the dominant silhouette and its relationships. No transformed variants.
  const scenes=[
    ['labor-steps','labor','Hiring capacity narrows across workstations',`<path d="M85 510V185H255V510M300 510V285H470V510M515 510V395H685V510" fill="$blue"/><g fill="$light"><circle cx="170" cy="265" r="28"/><path d="M134 385V320Q170 286 206 320V385Z"/><circle cx="385" cy="356" r="28"/><path d="M349 476V410Q385 377 421 410V476Z"/></g><path d="M535 440H665" stroke="$red" stroke-width="25"/><path d="M75 548H725" stroke="$ink" stroke-width="18"/>`],
    ['labor-clock','labor','A time clock beside an interrupted production belt',`<circle cx="246" cy="277" r="165" fill="$ink"/><circle cx="246" cy="277" r="125" fill="$light"/><path d="M246 180V277L324 326" fill="none" stroke="$red" stroke-width="25"/><path d="M480 180H700V480H480Z" fill="$blue"/><path d="M517 228H663M517 297H663M517 366H604" stroke="$light" stroke-width="20"/><path d="M80 532H348M443 532H720" stroke="$brown" stroke-width="30"/>`],
    ['labor-benches','labor','Separate work benches and an unfilled place',`<path d="M85 300H325V350H85ZM445 420H715V470H445Z" fill="$ink"/><path d="M125 350V545M280 350V545M480 470V545M670 470V545" stroke="$ink" stroke-width="22"/><circle cx="205" cy="185" r="47" fill="$red"/><path d="M145 285V240Q205 195 265 240V285Z" fill="$blue"/><path d="M506 340V235H635V340" fill="none" stroke="$brown" stroke-width="16"/>`],
    ['heat-canopy','heat','Heat waves above a shaded shelter and exposed ground',`<circle cx="605" cy="160" r="101" fill="$red"/><path d="M70 155Q180 95 290 155T510 155M70 225Q180 165 290 225T510 225" fill="none" stroke="$gold" stroke-width="25"/><path d="M105 375L285 265L465 375Z" fill="$blue"/><path d="M140 375V540M430 375V540" stroke="$ink" stroke-width="23"/><g fill="$ink"><circle cx="230" cy="417" r="24"/><circle cx="328" cy="417" r="24"/><path d="M207 445H253V523H207ZM305 445H351V523H305Z"/></g><path d="M508 520L561 451L600 500L651 427L718 485" fill="none" stroke="$brown" stroke-width="17"/>`],
    ['heat-exposure','heat','An exposure field crossed by people and thermal bands',`<path d="M90 115H710V510H90Z" fill="$wine"/><path d="M90 205Q245 125 410 205T710 205M90 325Q245 245 410 325T710 325M90 445Q245 365 410 445T710 445" fill="none" stroke="$gold" stroke-width="45"/><g fill="$light"><circle cx="255" cy="283" r="38"/><path d="M205 450V355Q255 305 305 355V450Z"/><circle cx="558" cy="360" r="38"/><path d="M508 525V430Q558 380 608 430V525Z"/></g>`],
    ['heat-riverbed','heat','A receding river under a broad heat disc',`<circle cx="400" cy="190" r="143" fill="$gold"/><path d="M70 385Q260 295 420 395T740 385V555H70Z" fill="$brown"/><path d="M100 447Q245 369 375 463T704 453" fill="none" stroke="$blue" stroke-width="42"/><path d="M160 520L200 467M250 549L302 492M540 544L512 491M625 510L650 473" stroke="$light" stroke-width="13"/>`],
    ['trade-detour','trade','Server cargo takes an indirect route around an inspection gate',`<path d="M65 480H240V180H490V480H715" fill="none" stroke="$blue" stroke-width="38"/><path d="M350 280V555" stroke="$wine" stroke-width="24"/><path d="M300 295H400" stroke="$wine" stroke-width="24"/><path d="M75 376H195V506H75ZM552 105H682V247H552Z" fill="$ink"/><path d="M99 410H173M99 451H173M578 146H658M578 194H658" stroke="$light" stroke-width="14"/><path d="M490 180H545" stroke="$red" stroke-width="24"/><path d="M524 158L551 180L524 203" fill="none" stroke="$red" stroke-width="12"/>`],
    ['trade-port','trade','A cargo crane lifts a sealed crate at a port',`<path d="M150 540V120H590M185 120L500 355M515 120V315" fill="none" stroke="$ink" stroke-width="25"/><path d="M445 350H610V475H445Z" fill="$red"/><path d="M480 350V475M575 350V475" stroke="$light" stroke-width="12"/><path d="M65 535H715L665 588H135Z" fill="$blue"/><path d="M365 138V237H645V138" fill="none" stroke="$brown" stroke-width="12"/>`],
    ['trade-checkpoint','trade','A commercial route passes through a staffed checkpoint',`<path d="M80 400H720" stroke="$brown" stroke-width="58"/><path d="M325 510V145H480V510" fill="none" stroke="$ink" stroke-width="28"/><path d="M340 250H565" stroke="$red" stroke-width="27"/><rect x="110" y="300" width="142" height="110" fill="$blue"/><path d="M140 300V410M216 300V410" stroke="$light" stroke-width="12"/><circle cx="570" cy="460" r="31" fill="$ink"/><path d="M530 560V512Q570 480 610 512V560Z" fill="$ink"/>`],
    ['finance-blocked','finance','Payment branches meet a blocking seal',`<path d="M120 150L365 315L120 485M365 315L665 160M365 315L665 490" fill="none" stroke="$blue" stroke-width="31"/><g fill="$gold"><circle cx="120" cy="150" r="58"/><circle cx="120" cy="485" r="58"/><circle cx="665" cy="160" r="58"/></g><rect x="565" y="408" width="158" height="125" fill="$wine"/><path d="M585 435L705 505M705 435L585 505" stroke="$light" stroke-width="18"/><circle cx="365" cy="315" r="69" fill="$ink"/>`],
    ['finance-ledger','finance','A ledger is inspected beside a hidden transfer channel',`<path d="M85 130H360V540H85Z" fill="$light" stroke="$ink" stroke-width="18"/><path d="M125 200H325M125 270H325M125 340H260M125 410H300" stroke="$blue" stroke-width="18"/><circle cx="548" cy="284" r="112" fill="none" stroke="$wine" stroke-width="35"/><path d="M624 367L718 489" stroke="$wine" stroke-width="42"/><path d="M402 530V425H475V345H548" fill="none" stroke="$brown" stroke-width="21"/>`],
    ['finance-vault','finance','A locked reserve encloses transfers',`<rect x="110" y="125" width="430" height="395" rx="9" fill="$ink"/><circle cx="325" cy="320" r="122" fill="$blue" stroke="$light" stroke-width="16"/><path d="M325 235V405M240 320H410" stroke="$light" stroke-width="16"/><path d="M540 245H690V465H615" fill="none" stroke="$red" stroke-width="32"/><path d="M607 449L586 465L607 481" fill="none" stroke="$red" stroke-width="13"/>`],
    ['research-vacancy','research','Research benches lose staffed capacity',`<path d="M75 525H730" stroke="$ink" stroke-width="22"/><path d="M95 235H300V285H95ZM385 385H715V435H385Z" fill="$blue"/><path d="M135 285V525M260 285V525M420 435V525M680 435V525" stroke="$ink" stroke-width="23"/><path d="M170 214V160H207V113H245L270 177L233 210Z" fill="$ink"/><path d="M466 360V254H534V360M586 360V254H654V360" fill="none" stroke="$brown" stroke-width="17"/><path d="M548 105L548 190M510 153L548 195L586 153" fill="none" stroke="$red" stroke-width="24"/>`],
    ['research-observatory','research','An observing instrument links separated research stations',`<path d="M175 255L440 100L490 185L225 341Z" fill="$blue"/><path d="M280 290L180 525M280 290L420 525" stroke="$ink" stroke-width="25"/><circle cx="475" cy="137" r="58" fill="$gold"/><rect x="540" y="350" width="145" height="170" fill="$ink"/><path d="M563 395H662M563 447H662" stroke="$light" stroke-width="17"/><path d="M380 325H520" stroke="$red" stroke-width="18" stroke-dasharray="28 20"/>`],
    ['research-bridge','research','Separated evidence platforms are connected by a narrow research bridge',`<rect x="85" y="305" width="185" height="225" fill="$blue"/><rect x="530" y="210" width="185" height="320" fill="$green"/><path d="M270 354Q400 195 530 260" fill="none" stroke="$ink" stroke-width="30"/><path d="M145 258V145H205V258M587 165V82H648V165" fill="none" stroke="$wine" stroke-width="20"/><path d="M305 420H490" stroke="$brown" stroke-width="15" stroke-dasharray="26 20"/>`],
    ['energy-reserve','energy','A storage tank feeds a finite reserve through a valve',`<path d="M105 170Q250 85 395 170V485Q250 555 105 485Z" fill="$blue"/><ellipse cx="250" cy="170" rx="145" ry="48" fill="$light" stroke="$ink" stroke-width="17"/><path d="M395 380H555V520H710" fill="none" stroke="$ink" stroke-width="32"/><circle cx="555" cy="380" r="52" fill="$red"/><path d="M555 338V422M513 380H597" stroke="$light" stroke-width="11"/><path d="M155 315H345" stroke="$gold" stroke-width="26"/>`],
    ['energy-turbine','energy','Wind generation feeds a separate demand block',`<path d="M285 245V540" stroke="$ink" stroke-width="26"/><path d="M285 245L180 97L218 75L302 220L445 202L449 247L306 260L240 392L201 371Z" fill="$green"/><path d="M475 355H690V530H475Z" fill="$blue"/><path d="M510 392H655M510 447H655" stroke="$light" stroke-width="17"/><path d="M316 476H445" stroke="$red" stroke-width="28"/>`],
    ['energy-feeder','energy','A power feed crosses an interrupted grid',`<path d="M90 145H285V285H455V480H710" fill="none" stroke="$ink" stroke-width="34"/><path d="M90 145V490H285V390" fill="none" stroke="$blue" stroke-width="23"/><path d="M370 235V335M332 275H408" stroke="$red" stroke-width="25"/><circle cx="710" cy="480" r="53" fill="$gold"/><path d="M110 546H675" stroke="$brown" stroke-width="15"/>`],
    ['government-balance','government','Public funds are held in balance under a legal decision',`<path d="M390 130V520M250 525H535M165 240H620" stroke="$ink" stroke-width="28"/><path d="M190 240L110 400H270ZM585 240L505 400H665Z" fill="$blue"/><path d="M135 401Q190 476 245 401M530 401Q585 476 640 401" fill="$gold"/><rect x="295" y="90" width="190" height="105" fill="$wine"/>`],
    ['government-document','government','A legal document meets a gate of authority',`<path d="M110 100H375L460 190V525H110Z" fill="$light" stroke="$ink" stroke-width="19"/><path d="M160 225H395M160 302H395M160 378H312" stroke="$brown" stroke-width="20"/><path d="M530 535V185H690V535M490 260H728" fill="none" stroke="$wine" stroke-width="30"/><path d="M460 445H550" stroke="$blue" stroke-width="27"/>`],
    ['government-stairs','government','A petition ascends institutional steps',`<path d="M70 535V430H240V335H410V240H580V145H730V535Z" fill="$blue"/><path d="M106 140H302V290H106Z" fill="$light" stroke="$ink" stroke-width="17"/><path d="M138 184H267M138 226H241" stroke="$wine" stroke-width="16"/><path d="M330 295L410 200L489 238" fill="none" stroke="$red" stroke-width="24"/>`],
    ['climate-watershed','climate','A high lake spills toward inhabited lower ground',`<path d="M50 425L235 130L398 385L530 215L750 525H50Z" fill="$green"/><ellipse cx="290" cy="285" rx="85" ry="34" fill="$blue"/><path d="M340 295Q340 430 570 483" fill="none" stroke="$blue" stroke-width="34"/><path d="M584 410L650 355L716 410V510H584Z" fill="$ink"/><path d="M93 480H234" stroke="$gold" stroke-width="25"/>`],
    ['climate-levee','climate','Water meets a protective levee beside a settlement',`<path d="M45 365Q180 280 300 365T540 365V565H45Z" fill="$blue"/><path d="M430 540L515 225L583 540Z" fill="$brown"/><path d="M620 365L675 310L730 365V495H620Z" fill="$ink"/><path d="M72 438Q170 380 270 438T470 438" fill="none" stroke="$light" stroke-width="20"/><circle cx="165" cy="154" r="81" fill="$gold"/>`],
    ['climate-terraces','climate','Exposed terraces are monitored at different elevations',`<path d="M65 530V405H255V285H460V165H735V530Z" fill="$green"/><path d="M80 405H247M268 285H448M470 165H720" stroke="$light" stroke-width="18"/><path d="M350 310V185M310 194H390" stroke="$ink" stroke-width="20"/><circle cx="350" cy="159" r="41" fill="$red"/><path d="M105 90Q270 20 440 90" fill="none" stroke="$gold" stroke-width="32"/>`],
    ['climate-vortex','climate','A rotating storm path crosses a settled landscape',`<path d="M95 505H705" stroke="$brown" stroke-width="25"/><path d="M510 505V365L590 300L675 365V505Z" fill="$ink"/><path d="M125 145Q440 70 520 230Q570 330 445 365Q330 398 354 485" fill="none" stroke="$blue" stroke-width="48"/><path d="M190 205Q395 155 438 244Q464 303 386 326" fill="none" stroke="$light" stroke-width="22"/><path d="M239 430L298 388M405 180L452 137M538 272L595 238" stroke="$red" stroke-width="18"/>`],
    ['infrastructure-aisle','infrastructure','A server aisle separates storage and service capacity',`<path d="M80 145H280V520H80ZM520 80H720V520H520Z" fill="$ink"/><path d="M115 200H245M115 290H245M115 380H245M555 135H685M555 225H685M555 315H685M555 405H685" stroke="$light" stroke-width="24"/><path d="M320 550L405 210L480 550Z" fill="$blue"/><circle cx="402" cy="145" r="57" fill="$red"/>`],
    ['infrastructure-wafer','infrastructure','A wafer connects to separate production stages',`<circle cx="265" cy="310" r="190" fill="$blue"/><path d="M142 175H388M108 267H422M108 359H422M142 452H388M175 143V477M267 121V500M359 143V477" stroke="$light" stroke-width="13"/><path d="M470 190H690V295H470ZM520 410H735V515H520Z" fill="$ink"/><path d="M430 310H555V400" fill="none" stroke="$red" stroke-width="24"/>`],
    ['infrastructure-duct','infrastructure','Cooling infrastructure surrounds a capacity chamber',`<path d="M90 155H475V480H90Z" fill="$ink"/><path d="M130 202H432M130 270H432M130 338H432M130 406H432" stroke="$light" stroke-width="23"/><path d="M520 510V185H690V410H600" fill="none" stroke="$blue" stroke-width="51"/><path d="M520 96V160M580 96V160M640 96V160" stroke="$red" stroke-width="20"/>`],
    ['capacity-aperture','general','A narrowing aperture restricts institutional throughput',`<path d="M90 115L330 245V395L90 525ZM710 115L470 245V395L710 525Z" fill="$ink"/><path d="M155 320H310M490 320H650" stroke="$blue" stroke-width="42"/><path d="M357 175V465M445 175V465" stroke="$red" stroke-width="22"/>`],
    ['capacity-columns','general','Unequal capacity columns carry a shared load',`<path d="M85 140H715V202H85Z" fill="$ink"/><path d="M125 202V530H255V202M345 202V385H475V202M565 202V290H695V202" fill="$blue"/><path d="M345 465H475M565 375H695M565 465H695" stroke="$brown" stroke-width="27"/><path d="M95 570H725" stroke="$wine" stroke-width="17"/>`],
    ['capacity-funnel','general','A funnel channels many inputs into limited capacity',`<path d="M90 150H710L450 390V525H350V390Z" fill="$green"/><g fill="$gold"><circle cx="220" cy="90" r="29"/><circle cx="400" cy="90" r="29"/><circle cx="580" cy="90" r="29"/></g><path d="M250 228H550L422 345H378Z" fill="$light"/><path d="M315 560H485" stroke="$red" stroke-width="28"/>`],
    ['observation-lens','general','Observation links a broad field to a decision point',`<circle cx="294" cy="285" r="178" fill="$light" stroke="$ink" stroke-width="32"/><path d="M180 285Q294 160 408 285Q294 410 180 285Z" fill="$blue"/><circle cx="294" cy="285" r="46" fill="$wine"/><path d="M420 410L577 552" stroke="$ink" stroke-width="45"/><path d="M560 120H710V295H560Z" fill="$red"/>`],
    ['institution-wheel','general','Institutional cooperation connects a shared hub to distinct tasks',`<circle cx="400" cy="315" r="118" fill="$wine"/><path d="M400 185V82M530 315H710M400 445V552M270 315H88" stroke="$ink" stroke-width="28"/><rect x="340" y="55" width="120" height="92" fill="$blue"/><circle cx="680" cy="315" r="61" fill="$gold"/><path d="M330 550L400 468L470 550Z" fill="$green"/><rect x="56" y="253" width="113" height="124" fill="$brown"/>`],
    ['institution-weave','general','Interdependent institutions form a woven system',`<path d="M100 170H700M100 320H700M100 470H700" stroke="$blue" stroke-width="72"/><path d="M225 80V560M575 80V560" stroke="$wine" stroke-width="69"/><path d="M185 320H266M535 170H616M535 470H616" stroke="$light" stroke-width="73"/>`]
  ].map(([id,topic,label,geometry])=>({id,topic,label,geometry,signature:'plate:'+id}));
  const topics=[
    ['research',/research|university|laborator|scientific|RTI|SAS|NC.state/i,['labor','infrastructure']],
    ['heat',/heat|temperature|warming|exposure/i,['climate','energy']],
    ['trade',/export|smuggl|GPU|tariff|trade|shipment|cargo/i,['government','infrastructure']],
    ['finance',/financ|sanction|charit|crypto|bank|fundrais|payment/i,['government','trade']],
    ['labor',/payroll|hiring|employment|labor.market|job.cut|wage|workforce/i,['research','finance']],
    ['energy',/fuel|energy|power|diesel|grid|electric|oil/i,['infrastructure','climate']],
    ['government',/court|judg|government|legal|grant|funds|litigation|congress/i,['finance','trade']],
    ['climate',/water|lake|flood|river|climat|coast|forest|storm|tornado/i,['heat','energy']],
    ['infrastructure',/compute|AI|chip|server|data.center|cyber|network/i,['research','trade']]
  ];
  function context(story,date){return [story.title,story.category,story.art,date,story.number,JSON.stringify(story.editorial||{}),story.why,...story.summary||[],...(story.implications||[]).flat()].join(' ')}
  function topic(story){return (topics.find(t=>t[1].test(story.title))||topics.find(t=>t[1].test(context(story,'')))||topics[8]);}
  function choose(candidates,recent,used){
    const all=new Set(recent.flatMap(x=>Object.values(x).map(a=>a.signature))),previous=new Set(Object.values(recent[0]||{}).map(a=>a.signature));
    // Prefer a three-issue window. Exhaustion relaxes older history only; never yesterday or this issue.
    const c=candidates.find(x=>!all.has(x.signature)&&!used.has(x.signature))||candidates.find(x=>!previous.has(x.signature)&&!used.has(x.signature));
    if(!c)throw Error('No distinct, relevant artwork composition available');return c;
  }
  function story(st,date,recent=[],used=new Set()){
    const t=topic(st),seed=hash(context(st,date));
    const emphasis={'labor-steps':/payroll|hiring|slows|growth/i,'labor-clock':/hours|wage|production/i,'labor-benches':/workplace|skills|vacanc/i,'heat-canopy':/heat stress|exposure/i,'heat-riverbed':/river|drought/i,'trade-detour':/GPU|servers|smuggl|diver|third.country/i,'trade-port':/port|shipping|cargo/i,'trade-checkpoint':/tariff|licens|inspection/i,'research-vacancy':/cuts|funding|contraction|reduction/i,'research-bridge':/partnership|translation/i,'energy-reserve':/stock|reserve|diesel/i,'government-balance':/grant|funds|preserv/i,'finance-blocked':/sanction|block|targets/i,'climate-vortex':/storm|tornado|hurricane/i};
    const candidates=scenes.filter(s=>s.topic===t[0]||s.topic==='general'||t[2].includes(s.topic)).map((s,i)=>({s,score:(s.topic===t[0]?30:s.topic==='general'?10:20)+(emphasis[s.id]?.test(st.title)?8:emphasis[s.id]?.test(context(st,''))?2:0),tie:hash(seed+'|'+s.id),i})).sort((a,b)=>b.score-a.score||a.tie-b.tie||a.i-b.i).map(x=>x.s);
    const c=choose(candidates,recent,used);
    const m={version:2,date,number:st.number,category:st.category||st.art,topic:t[0],title:st.title,composition:c.id,signature:c.signature,seed};
    m.frozen=svg(m);return m;
  }
  function svg(m,archive){
    if(m.frozen)return m.frozen;
    if(m.template){if(!archive?.legacy[m.template])throw Error('Missing pinned legacy plate: '+m.template);return archive.legacy[m.template];}
    const c=scenes.find(x=>x.id===m.composition);if(!c)throw Error('Unknown Field Brief plate');
    const id='fb-art-'+m.date+'-'+m.number,geometry=c.geometry.replace(/\$(\w+)/g,(_,k)=>inks[k]);
    return `<svg viewBox="0 0 800 640" role="img" aria-label="${esc(c.label)}"><title>${esc(m.title)}</title><desc>Conceptual linocut illustration, not a measured diagram.</desc><defs><filter id="${id}" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".018 .11" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" xChannelSelector="R" yChannelSelector="G"/></filter></defs><rect width="800" height="640" fill="${inks.paper}"/><g filter="url(#${id})">${geometry}</g></svg>`;
  }
  function recent(issues,date){return Object.keys(issues).filter(d=>d<date).sort().reverse().slice(0,3).map(d=>issues[d]);}
  function edition(ed,issues){const history=recent(issues,ed.date),used=new Set(),out={};for(const st of ed.stories){const m=story(st,ed.date,history,used);used.add(m.signature);out[st.number]=m;}validateEdition(ed,out,history);return out;}
  function validateEdition(ed,models,history){const previous=new Set(Object.values(history[0]||{}).map(x=>x.signature)),seen=new Set();if(ed.stories.length!==5)throw Error('Field Brief needs five story plates');for(const st of ed.stories){const m=models[st.number],c=scenes.find(x=>x.id===m?.composition);if(!c||m.signature!==c.signature||seen.has(m.signature)||previous.has(m.signature))throw Error('Repeated or invalid Field Brief story composition');if(m.frozen!==svg({...m,frozen:null}))throw Error('Plate geometry does not match its composition');seen.add(m.signature);}}
  function prepare(editions,archive){const out={legacy:archive.legacy,issues:{...archive.issues}},frozenThrough=Object.keys(archive.issues).sort().at(-1)||'2026-10-03';for(const ed of [...editions].sort((a,b)=>a.date.localeCompare(b.date)))if(!out.issues[ed.date]){if(ed.date<=frozenThrough||ed.date<='2026-10-03')throw Error('Missing historical Field Brief artwork pin: '+ed.date);out.issues[ed.date]=edition(ed,out.issues);}return out;}
  // Cover vocabulary is separate from story plates and retains the existing abstract press-mark idiom.
  const issueScenes=[
    ['capacity-observation','capacity',`<circle cx="218" cy="252" r="131" fill="none" stroke="$ink" stroke-width="25"/><path d="M110 252Q218 147 326 252Q218 357 110 252Z" fill="$accent"/><circle cx="218" cy="252" r="40" fill="$paper"/><path d="M344 252H425V445M344 252H495V155" fill="none" stroke="$ink" stroke-width="17"/><path d="M385 445H465M455 155H535" stroke="$support" stroke-width="35"/><path d="M128 435H297" stroke="$support" stroke-width="11"/>`],
    ['capacity-load','capacity',`<path d="M84 152H520V206H84Z" fill="$ink"/><path d="M115 206V480H205V206M265 206V361H355V206M415 206V280H505V206" fill="$accent"/><path d="M265 432H355M415 360H505M415 432H505" stroke="$support" stroke-width="24"/>`],
    ['capacity-relay','capacity',`<path d="M97 146H228V287H97ZM361 317H506V465H361Z" fill="$ink"/><path d="M228 214H429V317" fill="none" stroke="$accent" stroke-width="27"/><circle cx="318" cy="214" r="60" fill="$support"/><path d="M122 370H246V486H122Z" fill="none" stroke="$accent" stroke-width="15"/><path d="M246 427H360" stroke="$ink" stroke-width="15"/>`],
    ['risk-shelter','risk',`<path d="M80 301L300 116L520 301Z" fill="$ink"/><path d="M141 301V470M459 301V470" stroke="$ink" stroke-width="23"/><circle cx="300" cy="360" r="64" fill="$accent"/><path d="M80 472Q190 420 300 472T520 472" fill="none" stroke="$support" stroke-width="20"/>`],
    ['risk-reserve','risk',`<path d="M101 157Q221 101 341 157V452Q221 501 101 452Z" fill="$ink"/><ellipse cx="221" cy="157" rx="120" ry="42" fill="$support"/><path d="M341 326H448V471H526" fill="none" stroke="$accent" stroke-width="26"/><circle cx="448" cy="326" r="44" fill="$support"/>`],
    ['risk-drain','risk',`<path d="M73 435L196 122L352 435L439 255L534 435Z" fill="$ink"/><ellipse cx="231" cy="296" rx="64" ry="25" fill="$support"/><path d="M280 311Q280 427 463 462" fill="none" stroke="$accent" stroke-width="23"/>`],
    ['enforcement-channels','enforcement',`<path d="M87 414H227V133H427V414H528" fill="none" stroke="$ink" stroke-width="25"/><path d="M294 255V491" stroke="$accent" stroke-width="24"/><path d="M257 285H336" stroke="$accent" stroke-width="21"/><rect x="79" y="311" width="91" height="129" fill="$support"/><rect x="460" y="110" width="81" height="103" fill="$support"/>`],
    ['enforcement-filter','enforcement',`<path d="M90 132H510L350 312V471H250V312Z" fill="$ink"/><path d="M178 200H422" stroke="$support" stroke-width="22"/><path d="M210 388H390" stroke="$accent" stroke-width="27"/><circle cx="300" cy="95" r="32" fill="$accent"/>`],
    ['enforcement-seal','enforcement',`<path d="M80 156H256V296H80ZM358 337H531V477H358Z" fill="$ink"/><path d="M256 226H446V337" fill="none" stroke="$support" stroke-width="22"/><circle cx="339" cy="226" r="70" fill="$accent"/><path d="M304 191L374 261M374 191L304 261" stroke="$paper" stroke-width="16"/>`],
    ['evidence-lens','evidence',`<circle cx="256" cy="246" r="129" fill="$support" stroke="$ink" stroke-width="23"/><path d="M348 342L463 465" stroke="$ink" stroke-width="35"/><path d="M162 246H350M256 151V341" stroke="$accent" stroke-width="13"/>`],
    ['evidence-split','evidence',`<path d="M300 115V237L148 365M300 237L452 365" fill="none" stroke="$ink" stroke-width="23"/><path d="M90 365H207V477H90Z" fill="$accent"/><path d="M386 365L452 300L518 365L452 476Z" fill="$support"/>`],
    ['evidence-record','evidence',`<path d="M112 100H342L412 170V480H112Z" fill="$ink"/><path d="M149 208H368M149 275H368M149 343H264" stroke="$paper" stroke-width="17"/><circle cx="422" cy="358" r="75" fill="$accent"/><path d="M394 358L417 381L455 326" fill="none" stroke="$paper" stroke-width="14"/>`],
    ['infrastructure-trunk','infrastructure',`<path d="M120 460V160M80 220H160M91 183H149" stroke="$ink" stroke-width="16"/><path d="M120 373H300V266H375" fill="none" stroke="$accent" stroke-width="22"/><rect x="375" y="156" width="132" height="305" fill="$ink"/><path d="M395 207H487M395 268H487M395 329H487M395 390H487" stroke="$paper" stroke-width="17"/>`],
    ['infrastructure-aisle','infrastructure',`<path d="M86 155H222V472H86ZM378 110H514V472H378Z" fill="$ink"/><path d="M108 209H200M108 287H200M108 365H200M400 164H492M400 242H492M400 320H492M400 398H492" stroke="$paper" stroke-width="18"/><path d="M245 483L300 214L355 483Z" fill="$accent"/>`],
    ['infrastructure-chain','infrastructure',`<circle cx="142" cy="235" r="66" fill="none" stroke="$ink" stroke-width="27"/><circle cx="457" cy="378" r="66" fill="none" stroke="$accent" stroke-width="27"/><path d="M190 272L408 341" stroke="$support" stroke-width="32"/><path d="M302 113V226M258 130L302 226L346 130" fill="none" stroke="$ink" stroke-width="18"/>`],
    ['labor-stair','labor',`<path d="M83 465V135H191V465M246 465V255H354V465M409 465V369H517V465" fill="$accent"/><path d="M82 495H521" stroke="$ink" stroke-width="18"/><path d="M124 217H152M287 337H315M450 411H478" stroke="$paper" stroke-width="26"/>`],
    ['labor-counter','labor',`<circle cx="215" cy="247" r="126" fill="$ink"/><circle cx="215" cy="247" r="89" fill="$support"/><path d="M215 175V247L276 283" fill="none" stroke="$accent" stroke-width="16"/><rect x="397" y="136" width="111" height="331" fill="$ink"/><path d="M417 198H488M417 270H488M417 342H488" stroke="$paper" stroke-width="19"/>`],
    ['labor-aperture','labor',`<path d="M85 137L250 235V385L85 484ZM515 137L350 235V385L515 484Z" fill="$ink"/><path d="M270 186V448M331 186V448" stroke="$accent" stroke-width="21"/><path d="M120 310H230M370 310H481" stroke="$support" stroke-width="22"/>`]
  ].map(([id,topic,geometry])=>({id,topic,geometry,signature:'issue:'+id}));
  function markSignature(m){return m.signature||(m.version===2?'legacy-subject:'+m.subject:'legacy-theme:'+m.theme);}
  // Prospective only: these 21 published issues, including duplicates, stay authoritative.
  const issuePolicy=Object.freeze({version:1,historicalThrough:'2026-10-17',recentWindow:3,maxAttempts:96});
  const coverFeatures=new Map();
  function centralArtwork(value){
    let s=String(typeof value==='string'?value:value.frozen||value.geometry||'');
    if(s.includes('<svg')){
      const background=s.match(/<rect\b[^>]*\bwidth=["']600["'][^>]*\bheight=["']800["'][^>]*\/?\s*>/);
      if(background)s=s.slice(background.index+background[0].length);
      const rule=s.search(/<path\b[^>]*\bd=["']M42[ ,]+570H558/);if(rule>=0)s=s.slice(0,rule);
    }
    return s.replace(/<(title|desc|metadata|text|defs)\b[^>]*>[\s\S]*?<\/\1>/g,'');
  }
  function attributes(s){const a={};for(const m of s.matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/g))a[m[1]]=m[3];return a;}
  const identityMatrix=[1,0,0,1,0,0];
  function multiply(a,b){return [a[0]*b[0]+a[2]*b[1],a[1]*b[0]+a[3]*b[1],a[0]*b[2]+a[2]*b[3],a[1]*b[2]+a[3]*b[3],a[0]*b[4]+a[2]*b[5]+a[4],a[1]*b[4]+a[3]*b[5]+a[5]];}
  function transform(s){let out=identityMatrix;for(const m of String(s||'').matchAll(/(matrix|translate|scale|rotate)\s*\(([^)]+)\)/g)){
    const v=m[2].trim().split(/[ ,]+/).map(Number);let t;
    if(m[1]==='matrix')t=v;else if(m[1]==='translate')t=[1,0,0,1,v[0],v[1]||0];else if(m[1]==='scale')t=[v[0],0,0,v[1]===undefined?v[0]:v[1],0,0];
    else{const r=v[0]*Math.PI/180,c=Math.cos(r),s=Math.sin(r);t=[c,s,-s,c,0,0];if(v.length===3)t=multiply(multiply([1,0,0,1,v[1],v[2]],t),[1,0,0,1,-v[1],-v[2]]);}
    out=multiply(out,t);
  }return out;}
  function arcPoints(x,y,rx,ry,angle,large,sweep,nx,ny){
    rx=Math.abs(rx);ry=Math.abs(ry);if(!rx||!ry||(x===nx&&y===ny))return [[nx,ny]];
    const phi=angle*Math.PI/180,c=Math.cos(phi),s=Math.sin(phi),dx=(x-nx)/2,dy=(y-ny)/2;
    const px=c*dx+s*dy,py=-s*dx+c*dy,k=px*px/(rx*rx)+py*py/(ry*ry);if(k>1){rx*=Math.sqrt(k);ry*=Math.sqrt(k);}
    const f=(large===sweep?-1:1)*Math.sqrt(Math.max(0,(rx*rx*ry*ry-rx*rx*py*py-ry*ry*px*px)/(rx*rx*py*py+ry*ry*px*px)));
    const cx=f*rx*py/ry,cy=-f*ry*px/rx,ox=c*cx-s*cy+(x+nx)/2,oy=s*cx+c*cy+(y+ny)/2;
    const a=Math.atan2((py-cy)/ry,(px-cx)/rx);let d=Math.atan2((-py-cy)/ry,(-px-cx)/rx)-a;if(!sweep&&d>0)d-=2*Math.PI;if(sweep&&d<0)d+=2*Math.PI;
    return Array.from({length:24},(_,i)=>{const q=a+d*(i+1)/24;return [ox+c*rx*Math.cos(q)-s*ry*Math.sin(q),oy+s*rx*Math.cos(q)+c*ry*Math.sin(q)]});
  }
  function pathPoints(d){
    const t=String(d).match(/[a-df-z]|[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/ig)||[],arity={M:2,L:2,H:1,V:1,C:6,S:4,Q:4,T:2,A:7};
    let i=0,cmd='',x=0,y=0,start=[0,0],curve=null,previous='',part;const parts=[];
    function add(p){part.points.push(p);[x,y]=p;}
    while(i<t.length){
      if(/^[a-z]$/i.test(t[i]))cmd=t[i++];
      const op=cmd.toUpperCase(),relative=cmd!==op;
      if(op==='Z'){if(!part)throw Error('Invalid cover path');part.closed=true;[x,y]=start;curve=null;previous=op;cmd='';continue;}
      const n=arity[op];if(!n||i+n>t.length)throw Error('Unsupported or malformed Field Brief cover path');
      const v=t.slice(i,i+n).map(Number);if(v.some(a=>!Number.isFinite(a)))throw Error('Invalid cover coordinate');i+=n;
      const point=(a,b)=>[a+(relative?x:0),b+(relative?y:0)];
      if(op==='M'){const p=point(...v);part={points:[p],closed:false};parts.push(part);[x,y]=p;start=p;cmd=relative?'l':'L';}
      else if(!part)throw Error('Cover path must begin with M');
      else if(op==='L')add(point(...v));else if(op==='H')add([v[0]+(relative?x:0),y]);else if(op==='V')add([x,v[0]+(relative?y:0)]);
      else if(op==='A'){const end=point(v[5],v[6]);for(const p of arcPoints(x,y,...v.slice(0,5),...end))add(p);}
      else{
        const origin=[x,y];let a,b,end;
        if(op==='C'){a=point(v[0],v[1]);b=point(v[2],v[3]);end=point(v[4],v[5]);}
        if(op==='S'){a=/[CS]/.test(previous)&&curve?[2*x-curve[0],2*y-curve[1]]:origin;b=point(v[0],v[1]);end=point(v[2],v[3]);}
        if(op==='Q'){a=point(v[0],v[1]);end=point(v[2],v[3]);}
        if(op==='T'){a=/[QT]/.test(previous)&&curve?[2*x-curve[0],2*y-curve[1]]:origin;end=point(v[0],v[1]);}
        for(let step=1;step<=16;step++){const u=step/16,z=1-u;add(b?[z*z*z*origin[0]+3*z*z*u*a[0]+3*z*u*u*b[0]+u*u*u*end[0],z*z*z*origin[1]+3*z*z*u*a[1]+3*z*u*u*b[1]+u*u*u*end[1]]:[z*z*origin[0]+2*z*u*a[0]+u*u*end[0],z*z*origin[1]+2*z*u*a[1]+u*u*end[1]]);}
        curve=b||a;
      }
      if(!/[CSQT]/.test(op))curve=null;previous=op;
    }
    return parts;
  }
  function issueFeatures(value){
    const art=centralArtwork(value);if(coverFeatures.has(art))return coverFeatures.get(art);
    const shapes=[],keys=[],stack=[{matrix:identityMatrix,fill:'black',stroke:'none',width:1}],size=48;
    for(const token of art.match(/<\/?[\w:-]+\b[^>]*>/g)||[]){
      const name=token.match(/^<\/?([\w:-]+)/)[1];if(token.startsWith('</')){if(name==='g')stack.pop();continue;}
      const a=attributes(token),parent=stack.at(-1);if(!parent)throw Error('Invalid cover groups');
      const style={matrix:multiply(parent.matrix,transform(a.transform)),fill:a.fill||parent.fill,stroke:a.stroke||parent.stroke,width:a['stroke-width']===undefined?parent.width:+a['stroke-width'],rule:a['fill-rule']||parent.rule||'nonzero'};
      if(name==='g'){stack.push(style);continue;}
      if(!['path','rect','circle','ellipse','line','polygon','polyline'].includes(name))continue;
      let parts;const n=k=>Number(a[k]||0);
      if(name==='path')parts=pathPoints(a.d);
      else if(name==='rect')parts=[{closed:true,points:[[n('x'),n('y')],[n('x')+n('width'),n('y')],[n('x')+n('width'),n('y')+n('height')],[n('x'),n('y')+n('height')]]}];
      else if(name==='circle'||name==='ellipse')parts=[{closed:true,points:Array.from({length:48},(_,i)=>{const r=i*Math.PI/24;return [n('cx')+Math.cos(r)*(name==='circle'?n('r'):n('rx')),n('cy')+Math.sin(r)*(name==='circle'?n('r'):n('ry'))]})}];
      else if(name==='line')parts=[{closed:false,points:[[n('x1'),n('y1')],[n('x2'),n('y2')]]}];
      else{const v=(a.points||'').trim().split(/[ ,]+/).map(Number);parts=[{closed:name==='polygon',points:Array.from({length:v.length/2},(_,i)=>v.slice(i*2,i*2+2))}];}
      // Ignore wording, color, group rotations and numeric formatting in the exact geometry key.
      keys.push(name+':'+Object.keys(a).filter(k=>/^(d|x|y|x1|x2|y1|y2|width|height|r|rx|ry|cx|cy|points)$/.test(k)).sort().map(k=>k+'='+a[k].replace(/[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/ig,v=>String(+v)).replace(/[\s,]+/g,'')).join(';'));
      const m=style.matrix;parts=parts.map(p=>({...p,points:p.points.map(([x,y])=>[m[0]*x+m[2]*y+m[4],m[1]*x+m[3]*y+m[5]])}));
      shapes.push({...style,width:style.width*Math.sqrt(Math.abs(m[0]*m[3]-m[1]*m[2])),parts});
    }
    const points=shapes.flatMap(s=>s.parts.flatMap(p=>p.points));if(!points.length)throw Error('No central Field Brief artwork to validate');
    const minX=Math.min(...points.map(p=>p[0])),maxX=Math.max(...points.map(p=>p[0])),minY=Math.min(...points.map(p=>p[1])),maxY=Math.max(...points.map(p=>p[1]));
    const extent=Math.max(maxX-minX,maxY-minY);if(!Number.isFinite(extent)||extent<=0)throw Error('Invalid cover extent');
    const scale=(size-4)/extent,dx=(size-(maxX-minX)*scale)/2-minX*scale,dy=(size-(maxY-minY)*scale)/2-minY*scale,mask=new Uint8Array(size*size);
    function winding(points,x,y){let w=0;for(let j=0,k=points.length-1;j<points.length;k=j++){const a=points[k],b=points[j],cross=(b[0]-a[0])*(y-a[1])-(x-a[0])*(b[1]-a[1]);if(a[1]<=y&&b[1]>y&&cross>0)w++;if(a[1]>y&&b[1]<=y&&cross<0)w--;}return w;}
    function distance(a,b,x,y){const vx=b[0]-a[0],vy=b[1]-a[1],d=vx*vx+vy*vy,t=d?Math.max(0,Math.min(1,((x-a[0])*vx+(y-a[1])*vy)/d)):0;return Math.hypot(x-a[0]-t*vx,y-a[1]-t*vy);}
    for(const s of shapes){
      const parts=s.parts.map(p=>({...p,points:p.points.map(([x,y])=>[x*scale+dx,y*scale+dy])})),ps=parts.flatMap(p=>p.points),half=s.stroke==='none'?0:Math.max(.45,s.width*scale/2);
      const left=Math.max(0,Math.floor(Math.min(...ps.map(p=>p[0]))-half)),right=Math.min(size-1,Math.ceil(Math.max(...ps.map(p=>p[0]))+half)),top=Math.max(0,Math.floor(Math.min(...ps.map(p=>p[1]))-half)),bottom=Math.min(size-1,Math.ceil(Math.max(...ps.map(p=>p[1]))+half));
      for(let y=top;y<=bottom;y++)for(let x=left;x<=right;x++){
        const px=x+.5,py=y+.5,w=parts.reduce((sum,p)=>sum+winding(p.points,px,py),0),filled=s.fill!=='none'&&(s.rule==='evenodd'?Math.abs(w)%2===1:w!==0);
        const stroked=half&&parts.some(p=>p.points.some((b,j)=>j?distance(p.points[j-1],b,px,py)<=half:p.closed&&distance(p.points.at(-1),b,px,py)<=half));
        if(filled||stroked)mask[y*size+x]=1;
      }
    }
    // Color-independent occupancy: filled paper cutouts remain geometry, never a color escape hatch.
    const result={geometry:keys.sort().join('|'),mask,count:mask.reduce((a,b)=>a+b,0),shapes:shapes.length,size};if(!result.count)throw Error('Empty cover silhouette');
    coverFeatures.set(art,result);return result;
  }
  function visualSimilarity(a,b){
    let best=0;const n=a.size;
    for(let flip=0;flip<2;flip++)for(let turns=0;turns<4;turns++){
      let shared=0;for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(a.mask[y*n+x]){let u=flip?n-1-x:x,v=y;for(let k=0;k<turns;k++){const t=u;u=n-1-v;v=t;}shared+=b.mask[v*n+u];}
      best=Math.max(best,shared/(a.count+b.count-shared));
    }
    return best;
  }
  function issueHistory(archive,date){return Object.values(archive).filter(m=>m.key==='fb'&&m.date<date).sort((a,b)=>b.date.localeCompare(a.date));}
  function issueOriginality(candidate,archive){
    const a=issueFeatures(candidate),history=issueHistory(archive,candidate.date);let closest=null;
    for(let i=0;i<history.length;i++){
      const old=history[i],b=issueFeatures(old);let reason=null,similarity=0;
      if(a.geometry===b.geometry)reason='identical central geometry';
      else if(candidate.signature&&markSignature(candidate)===markSignature(old))reason='reused structural composition';
      else{similarity=visualSimilarity(a,b);if(similarity>=.90)reason='materially similar silhouette';else if(i<issuePolicy.recentWindow&&similarity>=.82&&Math.min(a.shapes,b.shapes)/Math.max(a.shapes,b.shapes)>=.65)reason='insufficient recent visual separation';}
      if(!closest||similarity>closest.similarity)closest={date:old.date,similarity};
      if(reason)return {ok:false,reason,date:old.date,similarity,compared:history.length};
    }
    return {ok:true,compared:history.length,closest};
  }
  function validateIssue(candidate,archive){const result=issueOriginality(candidate,archive);if(!result.ok)throw Error('Field Brief cover originality: '+candidate.date+' repeats '+result.date+' ('+result.reason+'); author a different content-supported composition and validate again.');return result;}
  // Small semantic motifs, not reduced copies of previously published covers.
  // Their roles and relationships vary together; coordinates are authored, never seed-jittered.
  const issueMotifs={
    capacity:[
      ['staffed-bench','<path d="M5 57H95V68H5ZM16 68V96M84 68V96" fill="$ink" stroke="$ink" stroke-width="6"/><circle cx="50" cy="22" r="16" fill="$accent"/><path d="M31 54V44Q50 29 69 44V54Z" fill="$support"/>'],
      ['aperture-frame','<path d="M5 7H95V93H5ZM27 29V72H73V29Z" fill="$ink" fill-rule="evenodd"/><path d="M40 15V85M60 15V85" stroke="$accent" stroke-width="7"/>'],
      ['shared-load','<path d="M2 20H98V35H2ZM12 35H30V95H12ZM70 35H88V72H70Z" fill="$ink"/><path d="M43 35H57V60H43Z" fill="$accent"/><path d="M65 89H94" stroke="$support" stroke-width="9"/>']
    ],
    enforcement:[
      ['inspection-screen','<path d="M7 8H93V92H7Z" fill="none" stroke="$ink" stroke-width="9"/><path d="M28 18V82M51 18V82M74 18V82" stroke="$support" stroke-width="6"/><path d="M10 56H90" stroke="$accent" stroke-width="13"/>'],
      ['review-docket','<path d="M13 3H70L92 25V97H13Z" fill="$ink"/><path d="M28 35H76M28 54H76M28 73H55" stroke="$paper" stroke-width="7"/><path d="M62 79L73 90L94 64" fill="none" stroke="$accent" stroke-width="9"/>'],
      ['licensed-opening','<path d="M5 96V14H95V96H75V35H25V96Z" fill="$ink"/><path d="M38 45H62V89H38Z" fill="$accent"/><path d="M2 97H98" stroke="$support" stroke-width="6"/>']
    ],
    risk:[
      ['reserve-pool','<path d="M6 22Q50 0 94 22V80Q50 106 6 80Z" fill="$ink"/><ellipse cx="50" cy="22" rx="44" ry="16" fill="$support"/><path d="M18 59H82" stroke="$accent" stroke-width="12"/>'],
      ['buffer-wall','<path d="M8 95L40 5L62 95Z" fill="$ink"/><path d="M70 20H96V95H70Z" fill="$accent"/><path d="M2 66Q18 51 35 66M2 83Q18 68 35 83" fill="none" stroke="$support" stroke-width="7"/>'],
      ['exposure-field','<circle cx="50" cy="50" r="43" fill="none" stroke="$ink" stroke-width="10"/><path d="M16 20L81 85M8 45L56 93M42 8L93 59" stroke="$support" stroke-width="6"/><circle cx="51" cy="49" r="14" fill="$accent"/>']
    ],
    infrastructure:[
      ['service-rack','<path d="M12 3H88V97H12Z" fill="$ink"/><path d="M25 24H75M25 49H75M25 74H75" stroke="$paper" stroke-width="10"/><path d="M90 27H99V81H90Z" fill="$accent"/>'],
      ['power-junction','<path d="M45 3H57V98H45ZM5 34H97V46H5Z" fill="$ink"/><circle cx="51" cy="40" r="22" fill="$accent"/><path d="M51 56V84H93" fill="none" stroke="$support" stroke-width="10"/>'],
      ['fabrication-disc','<circle cx="50" cy="50" r="44" fill="$accent"/><path d="M24 16V84M50 6V94M76 16V84M14 27H86M6 52H94M16 77H84" stroke="$paper" stroke-width="5"/>']
    ],
    labor:[
      ['unfilled-station','<path d="M8 48H92V62H8ZM20 62V96M80 62V96" fill="$ink" stroke="$ink" stroke-width="7"/><path d="M34 42V7H68V42" fill="none" stroke="$accent" stroke-width="9"/>'],
      ['working-hours','<circle cx="50" cy="50" r="44" fill="$ink"/><circle cx="50" cy="50" r="33" fill="$support"/><path d="M50 23V50L75 66" fill="none" stroke="$accent" stroke-width="9"/>'],
      ['hiring-cohorts','<path d="M3 94V8H24V94M40 94V38H61V94M77 94V68H98V94" fill="$accent"/><path d="M2 98H99" stroke="$ink" stroke-width="6"/>']
    ],
    evidence:[
      ['observation-window','<path d="M6 12H94V88H6Z" fill="none" stroke="$ink" stroke-width="10"/><path d="M17 50Q50 17 83 50Q50 83 17 50Z" fill="$support"/><circle cx="50" cy="50" r="16" fill="$accent"/>'],
      ['comparison-pair','<path d="M5 16H35V85H5Z" fill="$ink"/><path d="M65 16H95V85H65Z" fill="$accent"/><path d="M43 39H57M43 61H57" stroke="$support" stroke-width="6"/>'],
      ['measured-range','<path d="M10 20H90M10 80H90M25 50H75M25 37V63M75 37V63" stroke="$ink" stroke-width="6"/><circle cx="50" cy="50" r="14" fill="$accent"/><path d="M50 6V30M50 70V94" stroke="$support" stroke-width="7"/>']
    ]
  };
  const issueLayouts=[
    ['separate-registers',[[65,105,195],[350,280,180],[365,105,112]],'<path d="M305 95V505" stroke="$support" stroke-width="5"/>'],
    ['three-fields',[[65,115,145],[232,320,142],[397,115,145]],'<path d="M60 495H545M223 100V260M385 100V260" stroke="$support" stroke-width="6"/>'],
    ['stepped-review',[[60,315,175],[245,220,160],[405,90,140]],'<path d="M60 510H242V410H415V245H550" fill="none" stroke="$support" stroke-width="9"/>'],
    ['open-triangle',[[205,85,185],[65,340,160],[390,345,145]],'<path d="M80 295H205M410 295H535" stroke="$support" stroke-width="9"/>'],
    ['central-boundary',[[65,175,180],[353,105,175],[395,365,115]],'<path d="M290 90V505M275 90H305M275 505H305" stroke="$support" stroke-width="7"/>'],
    ['broad-and-narrow',[[75,100,245],[360,130,170],[350,355,145]],'<path d="M75 495H525M330 130V455" stroke="$support" stroke-width="6"/>'],
    ['offset-frames',[[65,105,170],[350,310,180],[250,130,135]],'<path d="M55 300V490H260M340 85H550V265" fill="none" stroke="$support" stroke-width="9"/>'],
    ['upper-and-lower',[[65,100,165],[360,100,170],[207,335,190]],'<path d="M65 298H535" stroke="$support" stroke-width="8"/>']
  ];
  const issueTopics=[
    ['capacity',/observ|capacity|research systems|staffing|institution/i,'Observe, enforce & adapt'],
    ['enforcement',/enforc|evasion|sanction|export.control|court|legal|regulat|voter/i,'Routes & enforcement'],
    ['risk',/risk|hazard|adaptation|heat|climat|flood|storm|insurance/i,'Exposure & resilience'],
    ['infrastructure',/comput|power|infrastructure|network|semiconductor|chip|energy/i,'Connections & capacity'],
    ['labor',/\blabor\b|hiring|payroll|employment|wage|workforce/i,'Work & adjustment'],
    ['evidence',/data|evidence|research|measurement|inflation|prices|survey/i,'Observation & evidence']
  ];
  function issueCandidates(info){
    const framing=String(info.framing||info.title||''),stories=info.stories||[],plain=s=>String(s||'').replace(/<[^>]*>/g,' ');
    const records=stories.map(s=>plain([s.title,s.why,...s.summary||[],JSON.stringify(s.editorial||{})].join(' ')));
    const all=[info.title,framing,...records].join(' '),seed=hash(info.date+'|'+String(info.no).padStart(3,'0')+'|'+all);
    let supported=issueTopics.map((t,i)=>({topic:t,positions:records.flatMap((s,j)=>t[1].test(s)?[stories[j].number||String(j+1).padStart(2,'0')]:[]),score:(t[1].test(framing)?5:0)+(t[1].test(info.title||'')?3:0)+records.filter(s=>t[1].test(s)).length,order:i})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.order-b.order);
    if(!supported.length)throw Error('Field Brief cover needs a content-supported framing, not an unrelated novelty fallback: '+info.date);
    const primary=supported[0],topic=primary.topic,options=[];
    for(const scene of issueScenes.filter(s=>s.topic===topic[0]))options.push({id:scene.id,geometry:scene.geometry,rank:0});
    // An editorial juxtaposition makes no causal claim between unrelated stories.
    // A single-theme edition can instead examine its three distinct methodological facets.
    const groups=[issueMotifs[topic[0]],issueMotifs[(supported[1]||primary).topic[0]],issueMotifs[(supported[2]||primary).topic[0]]];
    for(const layout of issueLayouts)for(let a=0;a<3;a++)for(let b=0;b<3;b++)for(let c=0;c<3;c++){
      const motifs=[groups[0][a],groups[1][b],groups[2][c]];if(new Set(motifs.map(m=>m[0])).size!==3)continue;
      const geometry=motifs.map((m,i)=>{const [x,y,size]=layout[1][i];return '<g transform="translate('+x+' '+y+') scale('+(size/100)+')">'+m[1]+'</g>'}).join('')+layout[2];
      options.push({id:'study-'+layout[0]+'-'+motifs.map(m=>m[0]).join('-'),geometry,rank:1});
    }
    options.sort((a,b)=>a.rank-b.rank||hash(seed+'|'+a.id)-hash(seed+'|'+b.id));
    return {seed,subject:topic[0],phrase:topic[2],evidence:supported.map(x=>({concept:x.topic[0],storyNumbers:x.positions})),options};
  }
  function issueModel(info,archive){
    const context=issueCandidates(info),history={...archive};
    if(info.previous&&!history['fb:'+info.previous.date])history['fb:'+info.previous.date]=info.previous;
    let rejected;
    for(const option of context.options.slice(0,issuePolicy.maxAttempts)){
      const model={version:5,date:info.date,subject:context.subject,composition:option.id,signature:'issue:'+option.id,phrase:context.phrase,seed:context.seed,geometry:option.geometry,supportedConcepts:context.evidence};
      const rendered=issuePlate(model,['#f1e6d0','#221a14','#8a2a36','#c5ad88']),review=issueOriginality({...model,geometry:rendered},history);
      if(review.ok)return {...model,originality:{policy:issuePolicy.version,compared:review.compared,recentWindow:issuePolicy.recentWindow}};
      rejected=review;
    }
    throw Error('No original content-supported Field Brief cover after '+Math.min(context.options.length,issuePolicy.maxAttempts)+' candidates for '+info.date+'; closest collision '+(rejected&&rejected.date)+'. Author a new composition; do not bypass originality validation.');
  }
  function issuePlate(m,p){if(m.version===5){if(!m.geometry)throw Error('Missing Field Brief composition geometry');return m.geometry.replace(/\$(ink|accent|support|paper)/g,(_,k)=>p[{paper:0,ink:1,accent:2,support:3}[k]]);}const c=issueScenes.find(x=>x.id===m.composition);if(!c)throw Error('Unknown Field Brief issue composition');return c.geometry.replace(/\$(ink|accent|support|paper)/g,(_,k)=>p[{paper:0,ink:1,accent:2,support:3}[k]]);}
  const api={story,svg,edition,prepare,recent,validateEdition,scenes,issueModel,issuePlate,issueScenes,markSignature,issuePolicy,centralArtwork,issueFeatures,visualSimilarity,issueOriginality,validateIssue};if(typeof module==='object'&&module.exports)module.exports=api;else root.FieldBriefArtwork=api;
})(typeof window==='object'?window:{});
