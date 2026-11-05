/* Publication gate. Story numbers are permanent identities; order is editorial placement. */
'use strict';
const historicalThrough='2026-11-05';
const correctedOrder=['01','02','03','05','04'];
function validate(ed){
 const stories=ed.stories||[],numbers=stories.map(s=>s.number),expected=ed.date==='2026-11-05'?correctedOrder:['01','02','03','04','05'];
 if(JSON.stringify(numbers)!==JSON.stringify(expected))throw Error('Field Brief '+ed.date+': invalid permanent story identities/order; preserve published IDs (the approved No. 040 correction alone displays 05 before 04).');
 if(ed.date<=historicalThrough&&ed.date!=='2026-11-05')return;
 const features=stories.filter(s=>s.editorial?.feature==='north-carolina');
 const local=features[0],position=local?stories.indexOf(local)+1:null;
 if(features.length===1&&position===5&&(local.editorial.geographies||[]).some(g=>g.toLowerCase()==='north carolina'))return;
 const exception=ed.editorialSelection?.orderException;
 if(exception&&['reason','approvedBy','approvedAt','reviewUrl'].every(k=>typeof exception[k]==='string'&&exception[k].trim())&&/^\d{4}-\d{2}-\d{2}$/.test(exception.approvedAt)&&Number.isFinite(Date.parse(exception.approvedAt))&&new Date(exception.approvedAt).toISOString().slice(0,10)===exception.approvedAt&&/^https:\/\//.test(exception.reviewUrl)&&features.length<=1)return;
 throw Error('Field Brief '+ed.date+': dedicated North Carolina feature '+(features.length===1?'is in position '+position:'must be designated exactly once')+'; place editorial.feature="north-carolina" in position 05 with explicit North Carolina geography, or record a reviewed editorialSelection.orderException (reason, approvedBy, approvedAt, reviewUrl).');
}
module.exports={validate,historicalThrough};
