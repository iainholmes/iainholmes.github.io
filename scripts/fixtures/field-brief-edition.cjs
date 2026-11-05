/* Private future-publication fixtures never inherit a historical correction's identities.
   The cloned final story is the fixture's explicitly designated NC feature. */
'use strict';
function future(edition,date){
 const ed=structuredClone(edition);ed.date=date;
 ed.stories.forEach((s,i)=>{s.number=String(i+1).padStart(2,'0');if(s.editorial)delete s.editorial.feature;});
 const local=ed.stories.at(-1);local.editorial={...local.editorial,feature:'north-carolina',geographies:[...new Set([...(local.editorial?.geographies||[]),'North Carolina'])]};
 return ed;
}
module.exports={future};
