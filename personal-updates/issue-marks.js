/* Issue marks derive their theme from canonical issue framing, never a page thumbnail. */
(function(root){
  'use strict';
  var identities={fb:'Field Brief',sp:'Loblolly & Logit',cp:'The Workbook'};
  var archive=typeof module==='object'&&module.exports?require('./issue-mark-archive.js'):(root.PeriodicalsMarkArchive||{});
  var fbArtwork=typeof module==='object'&&module.exports?require('../daily-watchlist-5/artwork.js'):root.FieldBriefArtwork;
  var palettes={fb:['#f1e6d0','#221a14','#8a2a36','#c5ad88'],sp:['#f3f0e6','#1f4a3b','#b4532e','#e3b456'],cp:['#f7f7f3','#1c2f4a','#0e5360','#b5ced1']};
  var themes=[
    {id:'institutions',words:/institution|statutor|jurisdiction|legal|court|governance|credib|administrative|standards/ig,phrase:'Institutional constraints'},
    {id:'identification',words:/causal|counterfactual|identification|difference.in.differences|instrumental|selection|confound|research design/ig,phrase:'Comparisons & evidence'},
    {id:'complements',words:/complement|coordination|network|finance|risk|burden|incidence|bill/ig,phrase:'Costs, risk & institutions'},
    {id:'allocation',words:/allocat|marginal|abatement|price ceiling|demand|supply|scarcity|trade.off|welfare/ig,phrase:'Scarcity & allocation'},
    {id:'change',words:/growth|inflation|interest|resource|renewable|stock|trajectory|capacity/ig,phrase:'Adjustment over time'}
  ];
  function text(s){return String(s||'').replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim()}
  function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function hash(s){var n=2166136261;for(var i=0;i<s.length;i++){n^=s.charCodeAt(i);n=Math.imul(n,16777619)}return n>>>0}
  var subjects=[
    {id:'compute-power',words:/frontier|compute|data.center|AI systems|power project/ig,phrase:'Capability, power & oversight'},
    {id:'timber',words:/forest|timber|Faustmann|rotation/ig,phrase:'Time, harvest & opportunity'},
    {id:'water',words:/river|water|fish|advisory|spillover/ig,phrase:'Flows & displaced activity'},
    {id:'networks',words:/grid|network|transmission|complement/ig,phrase:'Connections & capacity'},
    {id:'housing',words:/housing|insurance|household|rent/ig,phrase:'Shelter, risk & prices'},
    {id:'evidence',words:/random|experiment|treatment|causal|inference|identif/ig,phrase:'Assignment & evidence'},
    {id:'boundaries',words:/court|legal|authority|oversight|institution/ig,phrase:'Rules & boundaries'},
    {id:'prices',words:/price|inflation|interest|trade|scarcity|permit/ig,phrase:'Prices across time'}
  ];
  function concept(framing,key){
    var ranked=subjects.map(function(x,i){return {subject:x,score:(framing.match(x.words)||[]).length,order:i}}).sort(function(a,b){return b.score-a.score||a.order-b.order});
    // The October 1 scaling synthesis explicitly couples capability with infrastructure and oversight.
    if(key==='fb'&&/frontier|compute|AI systems/i.test(framing)&&/infrastructure|power|energy/i.test(framing))return subjects[0];
    return ranked[0].score?ranked[0].subject:subjects[6];
  }
  /* Workbook vocabulary: concepts get one vote per question, never word counts
     from explanations. Each identity names actual geometry, not a rotation. */
  var workbookScenes=[
    {id:'quantile-bands',subject:'quantiles',phrase:'Ranks & distributions',words:/quantile|conditional median|percentile|distribution/i},
    {id:'rank-stair',subject:'quantiles',phrase:'Order & estimation',words:/quantile|conditional median|percentile|distribution/i},
    {id:'distribution-slice',subject:'quantiles',phrase:'Location & dispersion',words:/quantile|conditional median|percentile|distribution/i},
    {id:'quantile-fan',subject:'quantiles',phrase:'Conditional distributions',words:/quantile|conditional median|percentile|distribution/i},
    {id:'public-sum',subject:'public-goods',phrase:'Shared goods & value',words:/public good|Samuelson|vertical summation|nonrival/i},
    {id:'matching-gate',subject:'matching',phrase:'Search & matching',words:/matching function|job.finding|Beveridge|vacancies/i},
    {id:'leakage-channel',subject:'leakage',phrase:'Leakage across borders',words:/carbon leakage|emissions intensity|unregulated foreign/i},
    {id:'spillover-field',subject:'spillovers',phrase:'Direct effects & spillovers',words:/saturation|interference|spillover|spatially/i},
    {id:'posterior-lens',subject:'updating',phrase:'Prior & evidence',words:/Bayesian|posterior|prior|credible interval|conjugacy/i},
    {id:'shared-aquifer',subject:'commons',phrase:'Shared stocks & incentives',words:/common.pool|groundwater|withdrawal|Nash|Cournot/i},
    {id:'validation-window',subject:'measurement',phrase:'Measurement & validation',words:/validation|misclassification|measurement.error|negative.control/i},
    {id:'paired-comparison',subject:'identification',phrase:'Comparisons & evidence',words:/random|treatment|counterfactual|causal|inference|identification/i},
    {id:'threshold-cut',subject:'identification',phrase:'Thresholds & response',words:/kink|discontinu|threshold|cutoff|regression design/i},
    {id:'precision-weights',subject:'precision',phrase:'Precision & information',words:/variance|standard error|weighted least|power|precision|delta method/i},
    {id:'scarcity-wedge',subject:'allocation',phrase:'Prices & allocation',words:/demand|supply|consumer surplus|tariff|scarcity|price|marginal/i},
    {id:'stock-transition',subject:'change',phrase:'Stocks & adjustment',words:/Solow|capital|stock|growth|steady.state|irreversible|waiting/i}
  ];
  function workbookSignature(m){
    // Old section/plan variants share one effective composition.
    return m.signature||'workbook:legacy:'+(m.subject||m.theme);
  }
  function workbookModel(info,chosen,seed,framing){
    var recent=info.recent||Object.keys(archive).filter(function(k){return k.indexOf('cp:')===0&&k.slice(3)<info.date}).sort().reverse().slice(0,3).map(function(k){return archive[k]});
    if(info.previous&&!recent.some(function(m){return m.date===info.previous.date}))recent.unshift(info.previous);
    recent=recent.slice(0,3);
    var used=recent.map(workbookSignature);
    var candidates=workbookScenes.map(function(scene){
      var supporting=(info.questions||[]).map(function(q,i){var s=text([q.stem,(q.concepts||[]).join(' ')].join(' '));return scene.words.test(s)?i+1:0}).filter(Boolean);
      // Broad course vocabulary is weaker evidence than a specific question concept.
      return {scene:scene,supporting:supporting,score:supporting.length*(scene.id==='paired-comparison'?.25:scene.id==='scarcity-wedge'?.5:1),tie:hash(seed+'|'+scene.id)};
    }).filter(function(x){return x.supporting.length}).sort(function(a,b){return b.score-a.score||a.tie-b.tie});
    var pick=candidates.find(function(x){return used.indexOf('workbook:'+x.scene.id)<0});
    if(!pick)throw Error('Workbook artwork needs an unused content-supported composition: '+info.date);
    return {version:4,key:'cp',date:info.date,no:String(info.no).padStart(3,'0'),identity:identities.cp,theme:chosen.id,subject:pick.scene.subject,composition:pick.scene.id,signature:'workbook:'+pick.scene.id,phrase:pick.scene.phrase,seed:seed,framing:framing,questionPositions:pick.supporting};
  }
  function workbookArtwork(m,p){
    var ink=p[1],a=p[2],b=p[3],paper=p[0],s='';
    // A conceptual plate, not data or the worked answer to any question.
    switch(m.composition){
      case 'quantile-bands':s='<path d="M95 160H505V220H95ZM95 240H505V300H95ZM95 320H505V380H95ZM95 400H505V460H95Z" fill="'+b+'"/><path d="M178 145V476M292 145V476M414 145V476" stroke="'+ink+'" stroke-width="5"/><path d="M95 310H505" stroke="'+a+'" stroke-width="14"/>';break;
      case 'rank-stair':s='<path d="M90 465H180V385H260V305H340V225H420V145H510" fill="none" stroke="'+a+'" stroke-width="20"/><path d="M90 490H520M90 110V490" fill="none" stroke="'+ink+'" stroke-width="4"/><g fill="'+ink+'"><circle cx="140" cy="415" r="12"/><circle cx="220" cy="335" r="12"/><circle cx="300" cy="255" r="12"/><circle cx="380" cy="175" r="12"/></g>';break;
      case 'distribution-slice':s='<path d="M85 470C140 470 175 125 300 125S460 470 515 470Z" fill="'+b+'"/><path d="M300 125C340 125 360 260 380 365V470H300Z" fill="'+a+'"/><path d="M85 470H515M300 105V490" stroke="'+ink+'" stroke-width="5"/>';break;
      case 'quantile-fan':s='<path d="M100 420L490 110V440Z" fill="'+b+'"/><path d="M100 420L490 110M100 420L490 265M100 420L490 440" stroke="'+a+'" stroke-width="8"/><path d="M80 100V485H520" fill="none" stroke="'+ink+'" stroke-width="4"/>';break;
      case 'public-sum':s='<path d="M110 340H235V470H110ZM110 180H235V320H110Z" fill="'+b+'"/><path d="M365 160H490V470H365Z" fill="'+a+'"/><path d="M270 250H330M300 220V280M255 470H510" stroke="'+ink+'" stroke-width="5"/>';break;
      case 'matching-gate':s='<g fill="'+ink+'"><rect x="85" y="135" width="80" height="80"/><rect x="85" y="325" width="80" height="80"/></g><g fill="'+b+'"><circle cx="485" cy="175" r="40"/><circle cx="485" cy="365" r="40"/></g><path d="M165 175C290 175 235 270 300 270S380 175 445 175M165 365C290 365 235 270 300 270S380 365 445 365" fill="none" stroke="'+a+'" stroke-width="18"/><path d="M290 220V320H330V220Z" fill="'+ink+'"/>';break;
      case 'leakage-channel':s='<path d="M75 160H245V470H75Z" fill="'+ink+'"/><path d="M355 160H525V470H355Z" fill="'+b+'"/><path d="M300 100V510" stroke="'+ink+'" stroke-width="4" stroke-dasharray="8 9"/><path d="M135 240H465M430 210L465 240L430 270" fill="none" stroke="'+a+'" stroke-width="16"/><path d="M145 375H455" stroke="'+paper+'" stroke-width="9"/>';break;
      case 'spillover-field':s='<circle cx="245" cy="290" r="155" fill="'+b+'"/><circle cx="245" cy="290" r="90" fill="none" stroke="'+a+'" stroke-width="18"/><circle cx="245" cy="290" r="33" fill="'+ink+'"/><g fill="'+ink+'"><rect x="410" y="140" width="38" height="38"/><rect x="460" y="260" width="38" height="38"/><rect x="410" y="390" width="38" height="38"/></g><path d="M400 145V445" stroke="'+ink+'" stroke-width="3" stroke-dasharray="9 9"/>';break;
      case 'posterior-lens':s='<circle cx="240" cy="300" r="145" fill="'+b+'"/><circle cx="360" cy="300" r="145" fill="none" stroke="'+ink+'" stroke-width="8"/><path d="M300 168Q470 300 300 432Q130 300 300 168Z" fill="'+a+'"/>';break;
      case 'shared-aquifer':s='<path d="M75 350Q300 270 525 350V475H75Z" fill="'+b+'"/><path d="M150 155V400M450 155V400" stroke="'+ink+'" stroke-width="18"/><path d="M150 400Q300 470 450 400M150 435Q300 505 450 435" fill="none" stroke="'+a+'" stroke-width="9"/><path d="M85 200H215M385 200H515" stroke="'+ink+'" stroke-width="6"/>';break;
      case 'validation-window':s='<path d="M90 130H330V470H90Z" fill="'+b+'"/><path d="M265 220H505V420H265Z" fill="'+ink+'"/><path d="M285 245H330V395H285Z" fill="'+a+'"/><path d="M115 175H305M115 205H240M355 265H480M355 300H480M355 335H445" stroke="'+paper+'" stroke-width="8"/>';break;
      case 'paired-comparison':s='<path d="M90 170H230V450H90Z" fill="'+a+'"/><path d="M370 170H510V450H370Z" fill="'+b+'"/><path d="M260 270H340M260 340H340" stroke="'+ink+'" stroke-width="8"/><path d="M75 480H525" stroke="'+ink+'" stroke-width="4"/>';break;
      case 'threshold-cut':s='<path d="M95 440L290 310L495 150L495 465H95Z" fill="'+b+'"/><path d="M95 440L290 310L495 150" fill="none" stroke="'+a+'" stroke-width="12"/><path d="M290 110V490" stroke="'+ink+'" stroke-width="7"/>';break;
      case 'precision-weights':s='<path d="M100 330H500M300 130V480M180 480H420" stroke="'+ink+'" stroke-width="8"/><circle cx="150" cy="280" r="45" fill="'+b+'"/><circle cx="450" cy="260" r="65" fill="'+a+'"/><path d="M150 225V155H450V185" fill="none" stroke="'+ink+'" stroke-width="5"/>';break;
      case 'scarcity-wedge':s='<path d="M90 450L490 150V450Z" fill="'+b+'"/><path d="M90 150L490 450M90 450L490 150" stroke="'+a+'" stroke-width="10"/><path d="M90 485H520M90 110V485" fill="none" stroke="'+ink+'" stroke-width="4"/><circle cx="290" cy="300" r="25" fill="'+ink+'"/>';break;
      case 'stock-transition':s='<path d="M95 410H185V290H275V220H365V160H465" fill="none" stroke="'+ink+'" stroke-width="15"/><path d="M95 450C240 450 290 355 495 355" fill="none" stroke="'+a+'" stroke-width="12"/><path d="M465 130L505 160L465 190" fill="none" stroke="'+b+'" stroke-width="12"/>';break;
      default:throw Error('Unknown Workbook composition: '+m.composition);
    }
    return s;
  }
  function model(info){
    var saved=archive[info.key+':'+info.date];if(saved)return Object.assign({},saved);

    /* Each Workbook question gets one vote per concept, so a long first stem cannot dominate. */
    var sources=info.key==='cp'?(info.questions||[]).map(function(q){return text([q.field,q.stem,(q.concepts||[]).join(' '),q.explanation].join(' '))}):[text(info.framing||info.title)];
    var ranked=themes.map(function(t,i){var score=sources.reduce(function(n,s){var hits=s.match(t.words)||[];return n+(info.key==='cp'?Math.min(1,hits.length):hits.length)},0);return {theme:t,score:score,order:i}}).sort(function(a,b){return b.score-a.score||a.order-b.order});
    var chosen=ranked[0].score?ranked[0].theme:themes[4];
    var framing=sources.join(' '),seed=hash(info.key+'|'+info.date+'|'+String(info.no).padStart(3,'0')+'|'+framing.replace(/\W/g,''));
    if(info.key==='fb')return Object.assign({key:info.key,date:info.date,no:String(info.no).padStart(3,'0'),identity:identities.fb,theme:chosen.id,framing:framing},fbArtwork.issueModel(info,archive));
    if(info.key==='cp')return workbookModel(info,chosen,seed,framing);
    var subject=concept(framing,info.key),previous=info.previous;
    if(previous&&!previous.subject)previous=model(previous);
    var composition=previous&&previous.subject===subject.id&&previous.composition==='section'?'plan':'section';
    return {version:2,key:info.key,date:info.date,no:String(info.no).padStart(3,'0'),identity:identities[info.key],theme:chosen.id,subject:subject.id,composition:composition,phrase:subject.phrase,seed:seed,framing:framing};
  }
  function artwork(m,p){
    var ink=p[1],accent=p[2],support=p[3],shift=m.seed%29-14;
    var grid=m.key==='cp'?'<path d="M60 60H540M60 120H540M60 180H540M60 240H540M60 300H540M60 360H540M60 420H540M60 480H540M60 60V500M120 60V500M180 60V500M240 60V500M300 60V500M360 60V500M420 60V500M480 60V500M540 60V500" fill="none" stroke="'+ink+'" opacity=".12"/>':'';
    var contours=m.key==='sp'?'<g fill="none" stroke="'+ink+'" opacity=".16"><path d="M-20 460Q150 290 300 440T620 410M-20 480Q150 310 300 460T620 430M-20 500Q150 330 300 480T620 450M-20 520Q150 350 300 500T620 470"/></g>':'';
    if(m.version===3&&m.key==='fb')return fbArtwork.issuePlate(m,p);
    if(m.version===4&&m.key==='cp')return grid+workbookArtwork(m,p);
    if(m.version===2)return grid+contours+specificArtwork(m,p);
    var art;
    if(m.theme==='institutions'){
      /* One threshold: economic choices passing through an institutional boundary. */
      art='<path d="M110 494V128H490V494H420V204H180V494Z" fill="'+ink+'"/><path d="M218 276H'+(388+shift)+'V408H218Z" fill="'+accent+'"/><path d="M180 350H420" stroke="'+p[0]+'" stroke-width="12"/><path d="M300 234V450" stroke="'+p[0]+'" stroke-width="6"/><path d="M62 494H538" stroke="'+ink+'" stroke-width="3"/>';
    }else if(m.theme==='complements'){
      /* An arch works only when its complementary pieces hold together. */
      art='<path d="M85 484V340A215 215 0 0 1 515 340V484H445V340A145 145 0 0 0 155 340V484Z" fill="'+ink+'"/><path d="M266 126L334 126L321 195H279Z" fill="'+accent+'"/><g stroke="'+p[0]+'" stroke-width="4"><path d="M180 162L213 224M108 248L170 280M155 340H85M420 162L387 224M492 248L430 280M445 340H515"/></g><path d="M60 484H540" stroke="'+support+'" stroke-width="6"/><path d="M170 455Q300 '+(380+shift)+' 430 455" fill="none" stroke="'+accent+'" stroke-width="2"/>';
    }else if(m.theme==='identification'){
      art='<path d="M92 104V480H522" fill="none" stroke="'+ink+'" stroke-width="3"/><path d="M110 432L210 367L310 301L'+(485+shift)+' 164" fill="none" stroke="'+accent+'" stroke-width="12" stroke-linecap="round"/><path d="M110 432L210 367L310 301L'+(485+shift)+' 283" fill="none" stroke="'+ink+'" stroke-width="5" stroke-dasharray="10 8"/><path d="M310 126V480" stroke="'+ink+'" opacity=".35" stroke-width="2"/><path d="M'+(485+shift)+' 164V283" stroke="'+support+'" stroke-width="6"/><circle cx="310" cy="301" r="10" fill="'+ink+'"/>';
    }else if(m.theme==='allocation'){
      art='<path d="M92 104V480H522" fill="none" stroke="'+ink+'" stroke-width="3"/><path d="M115 158L500 425M115 425L500 158" stroke="'+accent+'" stroke-width="9"/><path d="M160 300H460" stroke="'+ink+'" stroke-width="5"/><circle cx="307" cy="291" r="'+(37+m.seed%12)+'" fill="'+support+'" stroke="'+ink+'" stroke-width="3"/>';
    }else{
      art='<path d="M92 104V480H522" fill="none" stroke="'+ink+'" stroke-width="3"/><path d="M110 440C210 438 250 144 350 144S438 436 510 420" fill="none" stroke="'+accent+'" stroke-width="12"/><path d="M92 300H522" stroke="'+support+'" stroke-width="3" stroke-dasharray="7 6"/><circle cx="350" cy="144" r="'+(10+m.seed%9)+'" fill="'+ink+'"/>';
    }
    return grid+contours+art;
  }
  function specificArtwork(m,p){
    var ink=p[1],a=p[2],b=p[3],paper=p[0],art='';
    if(m.subject==='compute-power'){
      // A compute block fed by a power trunk, bounded by an oversight frame.
      art='<path d="M70 462H530M112 462V360L166 323L219 360V462" fill="none" stroke="'+ink+'" stroke-width="12"/><path d="M166 323V166M120 223H212M132 193H200" stroke="'+ink+'" stroke-width="7"/><path d="M218 377H280V300H340" fill="none" stroke="'+a+'" stroke-width="14"/><rect x="340" y="194" width="156" height="248" fill="'+ink+'"/><path d="M364 228H472M364 268H472M364 308H472M364 348H472M364 388H472" stroke="'+paper+'" stroke-width="10"/><path d="M300 154V110H532V490H300V448" fill="none" stroke="'+a+'" stroke-width="8"/><circle cx="166" cy="166" r="27" fill="'+b+'"/>';
    }else if(m.subject==='timber'){
      art='<path d="M74 478H532" stroke="'+ink+'" stroke-width="4"/><path d="M174 466V185M374 466V133" stroke="'+ink+'" stroke-width="14"/><path d="M88 347L174 183L260 347ZM270 334L374 133L478 334Z" fill="'+a+'"/><path d="M94 470C80 524 478 524 508 424" fill="none" stroke="'+b+'" stroke-width="10"/><path d="M480 429L511 414L517 450" fill="none" stroke="'+ink+'" stroke-width="5"/>';
    }else if(m.subject==='water'){
      art='<path d="M58 200Q250 120 330 294T548 440L548 480Q330 520 278 320T58 256Z" fill="'+a+'"/><g fill="'+ink+'"><circle cx="140" cy="150" r="30"/><circle cx="460" cy="300" r="30"/><circle cx="152" cy="414" r="30"/></g><path d="M140 190Q134 300 152 370M180 153Q344 100 440 258" fill="none" stroke="'+ink+'" stroke-width="6" stroke-dasharray="13 8"/><path d="M419 256L448 270L450 237" fill="none" stroke="'+ink+'" stroke-width="6"/>';
    }else if(m.subject==='networks'){
      art='<path d="M95 434L210 170L430 196L504 442L95 434L430 196M210 170L504 442" fill="none" stroke="'+ink+'" stroke-width="12"/><g fill="'+a+'"><circle cx="95" cy="434" r="36"/><circle cx="210" cy="170" r="36"/><circle cx="430" cy="196" r="36"/><circle cx="504" cy="442" r="36"/></g><path d="M248 264L310 228L369 274L309 325Z" fill="'+b+'"/>';
    }else if(m.subject==='housing'){
      art='<path d="M104 316L300 124L496 316H446V480H154V316Z" fill="'+ink+'"/><rect x="220" y="306" width="160" height="174" fill="'+a+'"/><path d="M66 426Q300 300 534 426M66 456Q300 330 534 456" fill="none" stroke="'+b+'" stroke-width="9"/><path d="M300 148V270" stroke="'+paper+'" stroke-width="5"/>';
    }else if(m.subject==='evidence'){
      art='<path d="M300 110V228M300 228L146 338M300 228L454 338" fill="none" stroke="'+ink+'" stroke-width="12"/><circle cx="300" cy="148" r="48" fill="'+b+'"/><rect x="80" y="338" width="134" height="134" fill="'+a+'"/><circle cx="454" cy="405" r="67" fill="'+ink+'"/><path d="M214 404H387" stroke="'+ink+'" stroke-width="4" stroke-dasharray="10 8"/>';
    }else if(m.subject==='prices'){
      art='<path d="M80 466H522M140 466V304H218V466M260 466V206H338V466M380 466V126H458V466" fill="'+a+'" stroke="'+ink+'" stroke-width="4"/><path d="M95 240Q274 86 493 83M459 65L500 83L479 114" fill="none" stroke="'+ink+'" stroke-width="9"/>';
    }else{
      art='<path d="M96 122H430V458H96Z" fill="'+ink+'"/><path d="M177 203H510V342H177Z" fill="'+a+'"/><path d="M300 90V506" stroke="'+b+'" stroke-width="13"/><path d="M347 123V457" stroke="'+paper+'" stroke-width="5"/>';
    }
    // Repeated subjects move between a horizontal section and a rotated survey plan;
    // the publication pipeline pins this decision, so archives never depend on later edits.
    return m.composition==='plan'?'<g transform="translate(600 0) rotate(90) scale(.9) translate(18 -35)">'+art+'</g>':art;
  }
  function svg(m){
    if(m.frozen)return m.frozen;

    var p=palettes[m.key],family={fb:'Instrument Serif,Georgia,serif',sp:'Ectros,Georgia,serif',cp:'STIX Two Text,Georgia,serif'}[m.key];
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" role="img" aria-label="'+esc(m.identity+', '+(m.key==='cp'?'set':'issue')+' '+m.no+': '+m.phrase)+'"><title>'+esc(m.identity+' · '+m.no+' · '+m.phrase)+'</title><desc>Conceptual issue illustration derived from the current edition’s framing; not a measured result.</desc><rect width="600" height="800" fill="'+p[0]+'"/><g>'+artwork(m,p)+'</g><path d="M42 570H558" stroke="'+p[1]+'" stroke-width="2"/><g fill="'+p[1]+'"><text x="42" y="634" font-family="'+family+'" font-size="'+(m.key==='sp'?43:48)+'">'+esc(m.identity)+'</text><text x="42" y="683" font-family="IBM Plex Sans Condensed, sans-serif" font-size="19" letter-spacing="2">'+(m.key==='cp'?'SET':'ISSUE')+' '+m.no+' / '+esc(m.date)+'</text><text x="42" y="740" font-family="'+family+'" font-size="26">'+esc(m.phrase)+'</text></g></svg>';
  }
  function update(info){var m=model(info),host=root.document.querySelector('[data-issue-mark="'+m.key+'"]');if(!host)return m;host.innerHTML=svg(m);host.dataset.edition=m.date;host.dataset.theme=m.theme;host.dataset.signature=String(m.seed);host.removeAttribute('aria-hidden');var link=host.closest('a');if(link)link.setAttribute('aria-label',m.identity+', '+(m.key==='cp'?'set':'issue')+' '+m.no+': '+m.phrase);return m}
  var api={model:model,svg:svg,update:update,concept:concept,workbookSignature:workbookSignature};if(typeof module==='object'&&module.exports)module.exports=api;else root.PeriodicalsIssueMarks=api;
})(typeof window==='object'?window:{});
