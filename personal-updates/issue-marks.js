/* Issue marks derive their theme from canonical issue framing, never a page thumbnail. */
(function(root){
  'use strict';
  var identities={fb:'Field Brief',sp:'Loblolly & Logit',cp:'The Workbook'};
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
  function model(info){
    /* Each Workbook question gets one vote per concept, so a long first stem cannot dominate. */
    var sources=info.key==='cp'?(info.questions||[]).map(function(q){return text([q.field,q.stem,(q.concepts||[]).join(' '),q.explanation].join(' '))}):[text(info.framing||info.title)];
    var ranked=themes.map(function(t,i){var score=sources.reduce(function(n,s){var hits=s.match(t.words)||[];return n+(info.key==='cp'?Math.min(1,hits.length):hits.length)},0);return {theme:t,score:score,order:i}}).sort(function(a,b){return b.score-a.score||a.order-b.order});
    var chosen=ranked[0].score?ranked[0].theme:themes[4];
    var framing=sources.join(' '),seed=hash(info.key+'|'+info.date+'|'+String(info.no).padStart(3,'0')+'|'+framing.replace(/\W/g,''));
    return {key:info.key,date:info.date,no:String(info.no).padStart(3,'0'),identity:identities[info.key],theme:chosen.id,phrase:chosen.phrase,seed:seed,framing:framing};
  }
  function artwork(m,p){
    var ink=p[1],accent=p[2],support=p[3],shift=m.seed%29-14;
    var grid=m.key==='cp'?'<path d="M60 60H540M60 120H540M60 180H540M60 240H540M60 300H540M60 360H540M60 420H540M60 480H540M60 60V500M120 60V500M180 60V500M240 60V500M300 60V500M360 60V500M420 60V500M480 60V500M540 60V500" fill="none" stroke="'+ink+'" opacity=".12"/>':'';
    var contours=m.key==='sp'?'<g fill="none" stroke="'+ink+'" opacity=".16"><path d="M-20 460Q150 290 300 440T620 410M-20 480Q150 310 300 460T620 430M-20 500Q150 330 300 480T620 450M-20 520Q150 350 300 500T620 470"/></g>':'';
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
  function svg(m){
    var p=palettes[m.key],family={fb:'Instrument Serif,Georgia,serif',sp:'Ectros,Georgia,serif',cp:'STIX Two Text,Georgia,serif'}[m.key];
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" role="img" aria-label="'+esc(m.identity+', '+(m.key==='cp'?'set':'issue')+' '+m.no+': '+m.phrase)+'"><title>'+esc(m.identity+' · '+m.no+' · '+m.phrase)+'</title><desc>Conceptual issue illustration derived from the current edition’s framing; not a measured result.</desc><rect width="600" height="800" fill="'+p[0]+'"/><g>'+artwork(m,p)+'</g><path d="M42 570H558" stroke="'+p[1]+'" stroke-width="2"/><g fill="'+p[1]+'"><text x="42" y="634" font-family="'+family+'" font-size="'+(m.key==='sp'?43:48)+'">'+esc(m.identity)+'</text><text x="42" y="683" font-family="IBM Plex Sans Condensed, sans-serif" font-size="19" letter-spacing="2">'+(m.key==='cp'?'SET':'ISSUE')+' '+m.no+' / '+esc(m.date)+'</text><text x="42" y="740" font-family="'+family+'" font-size="26">'+esc(m.phrase)+'</text></g></svg>';
  }
  function update(info){var m=model(info),host=root.document.querySelector('[data-issue-mark="'+m.key+'"]');if(!host)return m;host.innerHTML=svg(m);host.dataset.edition=m.date;host.dataset.theme=m.theme;host.dataset.signature=String(m.seed);host.removeAttribute('aria-hidden');var link=host.closest('a');if(link)link.setAttribute('aria-label',m.identity+', '+(m.key==='cp'?'set':'issue')+' '+m.no+': '+m.phrase);return m}
  var api={model:model,svg:svg,update:update};if(typeof module==='object'&&module.exports)module.exports=api;else root.PeriodicalsIssueMarks=api;
})(typeof window==='object'?window:{});
