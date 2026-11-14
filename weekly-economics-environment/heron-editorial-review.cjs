'use strict';

const {companionContext,decisions}=require('./editorial-architecture.cjs');

// These eight published editions predate the decision-record requirement.
const legacyDates=new Set([
 '2026-09-25','2026-10-02','2026-10-09','2026-10-16',
 '2026-10-23','2026-10-30','2026-11-06','2026-11-13'
]);
const hasText=value=>typeof value==='string'&&value.trim().length>0;

function validate({journal,reviews=decisions.heronReviews||{},index}){
 const {companion,readingsByDate}=companionContext(journal);
 let previousDate;
 for(const [date,articles] of readingsByDate){
  const config=companion[date];
  const notes=config?.appearances||[];
  const fail=message=>{throw Error('L&L Heron review '+date+': '+message)};
  if(!legacyDates.has(date)){
   if(!config)fail('add an explicit companion-data decision for this edition');
   if(config.enabled!==Boolean(notes.length))fail('enabled must match whether any notes were selected');
   const review=reviews[date];
   if(review?.completed!==true||!hasText(review.reviewer)||!/^\d{4}-\d{2}-\d{2}$/.test(review.reviewedOn||'')){
    fail('complete the dated editorial decision in editorial-decisions.json under heronReviews');
   }
   const ids=articles.map(([,id])=>id);
   const assessments=review.readings;
   if(ids.length!==5||new Set(ids).size!==5||!assessments||Object.keys(assessments).length!==5||!ids.every(id=>Object.hasOwn(assessments,id))){
    fail('assess all five permanent reading IDs in this edition');
   }
   const notesByTarget=new Map(notes.map(note=>[note.target,note]));
   if(notesByTarget.size!==notes.length)fail('select notes for distinct readings');
   for(const id of ids){
    const assessment=assessments[id],note=notesByTarget.get(id);
    if(![assessment?.method,assessment?.existingCoverage,assessment?.decision].every(hasText)){
     fail('record the methodological question or limitation, existing coverage, and editorial decision for '+id);
    }
    if(assessment.noteId!==note?.id)fail('the review noteId must match the authored selection for '+id);
   }
   if(notes.length){
    if(review.silenceReason!==undefined||review.continuity!==undefined)fail('remove silence justification from an edition with selected notes');
   }else{
    if(!hasText(review.silenceReason))fail('explain why no qualifying note was selected after reviewing all five readings');
    if(previousDate&&!companion[previousDate]?.appearances.length){
     const continuity=review.continuity;
     if(continuity?.previousDate!==previousDate||continuity.reassessedAllReadings!==true||!hasText(continuity.reason)||continuity.reason.trim()===review.silenceReason.trim()){
      fail('acknowledge the prior silent edition '+previousDate+' and explain why a second look at all five candidates still supports silence');
     }
    }
   }
  }
  if(index){
   const indexed=index.editions.find(edition=>edition.date===date);
   if(!indexed)fail('the Reading Index is missing this edition');
   for(const [,id] of articles){
    const expected=notes.filter(note=>note.target===id).map(note=>'heron-'+note.id);
    const actual=indexed.readings.find(reading=>reading.id===id)?.features.filter(feature=>feature.id==='heron').map(feature=>feature.anchor);
    if(!actual||expected.length!==actual.length||expected.some((anchor,i)=>anchor!==actual[i])){
     fail('regenerate the Heron Index entries for '+id+' from companion-data');
    }
   }
  }
  previousDate=date;
 }
}

module.exports={validate};
