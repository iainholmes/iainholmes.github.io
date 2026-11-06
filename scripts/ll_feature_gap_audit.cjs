'use strict';
// Deliberately independent of layout classes, authored join groups and dividers.
// A corridor with a positive gap and an unobstructed shared projection is a
// missing native join, even when an editorial cell blocks part of that corridor.
function missingJoins(features,standards){
 const out=[];
 const subtract=(runs,lo,hi)=>runs.flatMap(([a,b])=>hi<=a||lo>=b?[[a,b]]:[[a,Math.max(a,lo)],[Math.min(b,hi),b]].filter(([x,y])=>y-x>1));
 for(let i=0;i<features.length;i++)for(let j=i+1;j<features.length;j++){
  const f=features[i],g=features[j];if(f.reading!==g.reading)continue;
  const a=f.rect,b=g.rect;
  for(const axis of ['horizontal','vertical']){
   const vertical=axis==='vertical',first=vertical?'x':'y',last=vertical?'right':'bottom',cross=vertical?'y':'x',end=vertical?'bottom':'right';
   const [one,two]=a[first]<b[first]?[a,b]:[b,a],gap=two[first]-one[last],start=Math.max(a[cross],b[cross]),stop=Math.min(a[end],b[end]);
   if(gap<=1||stop-start<=16)continue;
   let clear=[[start,stop]];
   for(const n of [...standards,...features.filter((_,k)=>k!==i&&k!==j)]){
    if(n.reading!==f.reading)continue;const r=n.rect;
    if(r[first]<two[first]-1&&r[last]>one[last]+1)clear=subtract(clear,r[cross],r[end]);
   }
   for(const [start,end]of clear)if(end-start>16)out.push({from:f.id,to:g.id,axis,gap,start,end});
  }
 }
 return out;
}
module.exports={missingJoins};
