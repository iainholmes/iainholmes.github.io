/* Selection aid for publishers. No client-side news selection or fixed beat quotas. */
(function(root){
'use strict';
const dimensions=['entities','disputes','technologies','industries','geographies','mechanisms','questions'];
const rules={
 entities:[['google',/google|gemini/i],['openai',/openai|gpt-/i],['anthropic',/anthropic/i],['duke-energy',/duke/i],['epa',/\bepa\b/i],['supreme-court',/supreme court/i]],
 disputes:[['ai-safety',/ai.*safety|safety.*ai|frontier.*scrutiny/i],['executive-authority',/executive authority|statutory authority|judge.*blocks|court.*authority/i],['climate-liability',/climate.*liability|climate.*suits/i]],
 technologies:[['frontier-models',/frontier|gemini|gpt-/i],['data-centers',/data.center|compute/i],['cybersecurity',/cyber/i],['telecom',/telecom|communications/i]],
 industries:[['ai',/\bai\b|artificial intelligence|frontier/i],['electricity',/power|electric|grid|turbine/i],['health',/health|hospital|insurance.*enrollment/i],['transport',/vehicle|ferr|transit|road/i]],
 geographies:[['triangle',/raleigh|triangle|wake county/i],['north-carolina',/north carolina|\bn\.c\.|raleigh|wake county/i],['texas',/texas/i],['california',/california/i]],
 mechanisms:[['oversight',/oversight|scrutiny|probe|safety.*rules|safety.*pact/i],['judicial-review',/judge|court|legal|litigation/i],['infrastructure-capacity',/infrastructure|capacity|interconnection|data.center.*demand/i],['monetary-policy',/fed|interest rate|inflation|treasury/i]],
 questions:[['scaling-ai',/scal.*ai|frontier|compute|data.center/i],['policy-durability',/credibility|durability|authority|legal constraints/i],['cost-incidence',/who.*pays|who.*bears|cost allocation/i]]
};
function plain(s){return String(s||'').replace(/<[^>]*>/g,' ').toLowerCase()}
function profile(story){
 const s=plain([story.title,story.category,story.summary,story.why,story.implications].join(' ')), supplied=story.editorial||{},p={};
 dimensions.forEach(d=>p[d]=[...new Set([...(supplied[d]||[]),...rules[d].filter(r=>r[1].test(s)).map(r=>r[0])])]);
 p.domain=supplied.domain||(/\bai\b|technology|cyber|chip|telecom|biotech/.test(s)?'technology':/climate|energy|water|agricultur|conservation|environment/.test(s)?'environment':/fed|inflation|fiscal|labor|housing|trade/.test(s)?'economy':'public-policy');return p;
}
function history(editions,before){return editions.filter(e=>!before||e.date<before).slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,7)}
function assess(candidate,editions,before){
 const current=profile(candidate),recent=history(editions,before),matches=[];
 recent.forEach((e,age)=>(e.stories||[]).forEach(story=>{const p=profile(story),shared={};dimensions.forEach(d=>{const hits=current[d].filter(x=>p[d].includes(x));if(hits.length)shared[d]=hits;});if(Object.keys(shared).length)matches.push({date:e.date,title:story.title,shared,weight:(7-age)/7});}));
 // Count each dimension once per prior edition; one AI-heavy issue must not multiply penalties fivefold.
 const penalty=recent.reduce((sum,e,age)=>sum+dimensions.reduce((n,d)=>n+(matches.some(m=>m.date===e.date&&m.shared[d])?1:0),0)*(7-age)/7,0);
 const development=candidate.editorial&&candidate.editorial.materialDevelopment;
 const override=!!(development&&development.evidenceUrl&&development.reason&&development.previousStatus&&development.newStatus&&development.previousStatus!==development.newStatus);
 return {profile:current,historyDates:recent.map(e=>e.date),matches,rawPenalty:penalty,penalty:override?0:penalty,override,development:override?development:null};
}
function review(stories,exception){
 const counts={};stories.forEach(s=>{const d=profile(s).domain;counts[d]=(counts[d]||0)+1});
 const warnings=[];if(stories.length!==5)warnings.push('An issue must contain exactly five stories.');if(Object.keys(counts).length<3)warnings.push('Normally span at least three materially different domains.');if(Object.values(counts).some(n=>n>2))warnings.push('Normally use at most two stories in one major subject area.');
 return {counts,warnings,exception:exception&&exception.reason&&exception.evidenceUrl?exception:null,needsEditorialDecision:warnings.length>0};
}
const api={profile,history,assess,review,dimensions};if(typeof module==='object'&&module.exports)module.exports=api;else root.PeriodicalsEditorialMemory=api;
})(typeof window==='object'?window:{});
