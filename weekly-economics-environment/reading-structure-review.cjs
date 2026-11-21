'use strict';
// Execute the actual authored arrangements with semantic role markers. Names,
// palettes and fractional column widths deliberately do not confer diversity.
function audit(factory=require('./reading-arrangements.cjs')){
 const row=(k,a,b)=>`ROW(${a}|${b})`,field=(k,s)=>`FIELD(${s})`,inset=(k,s)=>`INSET(${s})`,flo=(k,a,b)=>`FLOAT(${a}|${b})`,gap=s=>`BREAK(${s})`,join=(...s)=>`JOIN(${s.join('|')})`;
 const arrangements=factory({row,field,inset,flo,gap,join});
 return Object.entries(arrangements).map(([id,fn])=>({id,sequence:fn({E:'INTERPRETATION',O:'DESIGN',Q:'LIMITS',N:'NOTEBOOK',A:'FIGURE',M:()=> 'MODEL',L:()=> 'INCIDENCE',T:()=> 'HORIZONS',D:()=> 'DECISION',X:()=> 'DIAGNOSTIC',G:()=> 'MECHANISM'})})).map(r=>({...r,family:/^ROW\(INTERPRETATION\|DESIGN\)FIELD\(.+\)ROW\((LIMITS\|NOTEBOOK|NOTEBOOK\|LIMITS)\)$/.test(r.sequence)?'two-cells / middle-feature-group / two-cells':r.sequence}));
}
function validate({journal,factory}){
 const rows=audit(factory);
 for(const date of [...journal.matchAll(/data-edition="(\d{4}-\d{2}-\d{2})"/g)].map(m=>m[1]).filter((d,i,a)=>a.indexOf(d)===i&&d>='2026-11-20')){
  const readings=rows.filter(r=>r.id.startsWith(date)),counts={};for(const r of readings)counts[r.family]=(counts[r.family]||0)+1;const count=Math.max(0,...Object.values(counts));
  if(count>=3)throw Error('L&L structural diversity '+date+': '+count+' readings repeat the two-cell / feature-group / two-cell macro-template; review actual sequences, not layout names');
 }
 return rows;
}
module.exports={audit,validate};
