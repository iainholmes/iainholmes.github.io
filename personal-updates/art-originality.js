/* Prospective Workbook/L&L checks. Frozen history is evidence, never a repair target.
   Reuse the unchanged Field Brief vector feature engine, not its generator or thresholds. */
(function(root){
'use strict';
const vectors=typeof module==='object'&&module.exports?require('../daily-watchlist-5/artwork.js'):root.FieldBriefArtwork;
function central(value){
 let s=String(typeof value==='string'?value:value.frozen||value.html||value.geometry||'');
 const subject=s.match(/<g data-art-subject>([\s\S]*?)<\/g><path d="M18 /);
 if(subject)return subject[1];
 if(/viewBox="0 0 600 800"/.test(s))s=vectors.centralArtwork(s);
 else s=s.replace(/<svg\b[^>]*>|<\/svg>|<figcaption>[\s\S]*$/g,'').replace(/<rect\b[^>]*width="600"[^>]*height="390"[^>]*\/?\s*>/g,'');
 s=s.replace(/<(title|desc|text|defs|metadata)\b[^>]*>[\s\S]*?<\/\1>/g,'');
 // Grid, survey contours, plate corners, sun and the two legacy terrain backdrops
 // are publication furniture; a new background never makes the same subject original.
 s=s.replace(/<g\b[^>]*opacity="\.(?:12|15|16|17|18)"[^>]*>[\s\S]*?<\/g>/g,'')
 .replace(/<path\b[^>]*opacity="\.12"[^>]*\/?\s*>/g,'')
 .replace(/<circle\b[^>]*cx="484"[^>]*cy="79"[^>]*\/?\s*>/g,'')
 .replace(/<path\b[^>]*d="(?:M18 40V18H40[^"\n]*|M0 208Q140 92[^"\n]*|M0 307Q240 190[^"\n]*|M0 170L240 312[^"\n]*|M0 258L240 350[^"\n]*)"[^>]*\/?\s*>/g,'');
 return s;
}
function signature(m,layer){
 if(layer==='workbook')return m.signature||'workbook:legacy:'+(m.subject||m.theme);
 if(layer==='cover')return m.signature||'loblolly:legacy:'+(m.subject||m.theme);
 // A landscape family is not a structural identity. Legacy valley/watershed
 // plates are identified by their actual central geometry, ignoring transforms.
 return m.signature||'field-study:'+( /^(valley|watershed)$/.test(m.composition)?'legacy:'+features(m).geometry:m.composition);
}
const cache=new Map();
function features(m){const s=central(m);if(!cache.has(s))cache.set(s,vectors.issueFeatures({geometry:s}));return cache.get(s);}
function compare(a,b){
 const x=features(a),y=features(b),similarity=vectors.visualSimilarity(x,y);
 if(x.geometry===y.geometry)return {reason:'identical central geometry',similarity};
 // Ignore color and group transforms; substantial long primitive reuse also catches
 // an old subject inside a different landscape, caption, or newly added frame.
 // Compound paths can be short (e.g. the Workbook quantile bands' rank markers).
 // Exclude simple axes, while retaining those meaningful multi-segment primitives.
 const paths=s=>new Set(features(s).geometry.split('|').filter(p=>p.length>30));
 const p=paths(a),q=paths(b),shared=[...p].filter(k=>q.has(k)).length;
 if(Math.min(p.size,q.size)>=2&&shared/Math.min(p.size,q.size)>=.8)return {reason:'substantial repeated geometry',similarity};
 // Geometric plates are sparse: retain a conservative archive-wide threshold,
 // with extra separation for the three most recent plates of comparable complexity.
 return {similarity,comparable:Math.min(x.shapes,y.shapes)/Math.max(x.shapes,y.shapes)>=.7};
}
function review(candidate,history,layer){
 const prior=Object.entries(history||{}).map(([id,m])=>({id,m,date:m.date||id.slice(-10)})).filter(x=>x.date<candidate.date).sort((a,b)=>b.date.localeCompare(a.date));
 let closest=null;
 for(let i=0;i<prior.length;i++){
  const {id,m}=prior[i],r=compare(candidate,m);let reason=r.reason;
  if(signature(candidate,layer)===signature(m,layer))reason='reused structural signature';
  if(!reason&&r.similarity>=.9)reason='materially similar silhouette';
  if(!reason&&i<3&&r.similarity>=.86&&r.comparable)reason='insufficient recent visual separation';
  if(!closest||r.similarity>closest.similarity)closest={id,similarity:r.similarity};
  if(reason)return {ok:false,id,reason,similarity:r.similarity,compared:prior.length};
 }
 return {ok:true,compared:prior.length,closest};
}
function validate(candidate,history,layer){const r=review(candidate,history,layer);if(!r.ok)throw Error(layer+' artwork originality: '+candidate.date+' repeats '+r.id+' ('+r.reason+'). Author a genuinely different content-supported composition; do not recycle, relabel or transform it.');return r;}
const api={central,features,signature,compare,review,validate};
if(typeof module==='object'&&module.exports)module.exports=api;else root.PeriodicalsArtOriginality=api;
})(typeof window==='object'?window:{});
