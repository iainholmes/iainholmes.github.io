/* Loblolly & Logit — REVIEW PROTOTYPE ONLY. No production side effects.
 * Source-grounded, deterministic vector imagery for paired reading bookends.
 * No image API, network, randomness or invented numerical data.
 * Editorial data-bookend-concept can override ambiguous automatic matching.
 */
(function(root,factory){
  'use strict';
  const api=factory();
  if(typeof module==='object' && module.exports)module.exports=api;
  if(root)root.LLBookendArt=api;
})(typeof window!=='undefined'?window:null,function(){
  'use strict';
  const escape=s=>String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  const defs={
    'coal-network':{
      label:'coal production and connected regional employment',
      // A central mine branches toward local sectors: schematic, not a statistical map.
      paths:'<path d="M8 34l14-20 13 20M17 34V24h11v10M8 34h28M36 34h19l10-11h18l9-9h18" /><path d="M36 34l29 9h23M65 23l16-13h29" /><circle cx="65" cy="23" r="3"/><circle cx="88" cy="43" r="3"/><circle cx="110" cy="14" r="3"/><path d="M17 21h11" class="copper"/>'
    },
    'household-complements':{
      label:'rooftop solar and complementary household equipment',
      paths:'<path d="M8 26l30-17 30 17M16 23v23h44V23" /><path d="M31 14l11 0 13 8-11 0zM25 29h18v10H25zM34 29v10M25 34h18" class="copper"/><rect x="72" y="24" width="29" height="22" rx="2"/><circle cx="86.5" cy="35" r="7"/><path d="M60 36h12M101 36h10" />'
    },
    'methane-ledger':{
      label:'methane regulation evaluated against a policy baseline',
      paths:'<rect x="10" y="8" width="88" height="39" rx="1"/><path d="M22 8v39M10 21h88M10 33h88M68 8v39"/><path d="M29 15h29M29 27h21M29 39h31" class="copper"/><path d="M77 27l5 4 9-10M77 39l5-5 9 5"/><path d="M102 13h10M102 29h10M102 45h10"/>'
    },
    'solar-storage':{
      label:'solar generation paired with battery storage',
      paths:'<circle cx="24" cy="17" r="7" class="copper"/><path d="M24 3v5M24 26v5M10 17h5M33 17h5M14 7l4 4M30 23l4 4M34 7l-4 4M18 23l-4 4"/><path d="M8 35h50l-6 13H14zM19 35l-2 13M32 35v13M45 35l2 13" /><rect x="73" y="17" width="34" height="29" rx="2"/><path d="M107 26h5v12h-5M80 25h7M80 33h7M80 41h7M93 25h7M93 33h7M93 41h7" class="copper"/>'
    },
    'model-baseline':{
      label:'vehicle emissions model revisions and alternative baselines',
      paths:'<rect x="10" y="9" width="85" height="38" rx="1"/><path d="M19 38h70M19 14v24M25 32l15-7 12 2 14-8 17 3"/><path d="M25 38l15-9 12 1 14-4 17-13" class="copper"/><circle cx="25" cy="38" r="2"/><circle cx="83" cy="13" r="2" class="copper"/><path d="M101 16h10M101 25h10M101 34h10"/>'
    }
  };
  function resolve(reading){
    const title=String(reading&&reading.title||'').toLowerCase();
    const explicit=String(reading&&reading.concept||'');
    if(explicit && Object.prototype.hasOwnProperty.call(defs,explicit))return {id:explicit,reason:'editorially assigned semantic concept'};
    // Require specific, headline-grounded combinations. Supporting prose does not
    // override an unrelated headline, preventing accidental topic collisions.
    if(/\bcoal\b/.test(title) && /\b(mine|demand|labor|employment)\b/.test(title))return {id:'coal-network',reason:'coal and a regional-economic mechanism in the headline'};
    if(/\bsolar\b/.test(title) && /\b(equipment|household|rooftop)\b/.test(title))return {id:'household-complements',reason:'solar and household equipment in the headline'};
    if(/\bmethane\b/.test(title) && /\b(ledger|rule|regulation)\b/.test(title))return {id:'methane-ledger',reason:'methane regulatory accounting in the headline'};
    if(/\bsolar\b/.test(title) && /\b(batteries|battery|storage)\b/.test(title))return {id:'solar-storage',reason:'paired solar and storage in the headline'};
    if(/\b(emissions|vehicle)\b/.test(title) && /\b(model|baseline)\b/.test(title))return {id:'model-baseline',reason:'emissions modeling and baselines in the headline'};
    return {id:'typographic',reason:'no unambiguous supported illustrative topic: title-derived type only'};
  }
  function render(reading,position='top'){
    const decision=resolve(reading);
    const title=String(reading&&reading.title||'Untitled reading');
    const id=decision.id;
    const glyph=defs[id];
    const initials=title.replace(/[^\p{L}\p{N} ]/gu,' ').trim().split(/\s+/).filter(w=>!/^(a|an|the|and|of|in|to|with|for|is)$/i.test(w)).slice(0,3).map(w=>w[0].toUpperCase()).join('');
    const graphic=glyph?glyph.paths:'<path d="M8 12h104M8 43h104"/><text x="60" y="35" text-anchor="middle" font-size="23" font-family="Georgia, serif">'+escape(initials||'R')+'</text>';
    const label=glyph?glyph.label:'title-derived editorial monogram for '+title;
    const aria='Bookend motif for '+title+': '+label;
    const svg='<svg xmlns="http://www.w3.org/2000/svg" class="bookend-symbol" viewBox="0 0 120 56" width="120" height="56" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="'+escape(aria)+'"><title>'+escape(aria)+'</title><g class="mark-line">'+graphic+'</g></svg>';
    const top=position==='top';
    return '<div class="bookend bookend--'+(top?'top':'bottom')+'" data-bookend-concept="'+escape(id)+'" data-bookend-reason="'+escape(decision.reason)+'"><span class="bookend-rule" aria-hidden="true"></span><span class="bookend-medallion">'+svg+'</span><span class="bookend-rule" aria-hidden="true"></span></div>';
  }
  return Object.freeze({resolve,render,concepts:Object.freeze(Object.keys(defs))});
});
