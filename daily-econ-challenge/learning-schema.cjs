/* Publisher-only checks. Authored learning material is frozen with its question. */
'use strict';
const assert=require('node:assert/strict');
const allowed=new Set(['p','b','strong','i','em','sub','sup','span','div','br','table','caption','thead','tbody','tr','th','td','pre','code','ul','ol','li']);
const voids=new Set(['br']);
const classes=new Set(['eq','data','console']);
function material(html,label){
  assert.equal(typeof html,'string',label+' must be authored HTML');
  assert(html.replace(/<[^>]*>/g,' ').trim().split(/\s+/).length>=20,label+' needs substantive question-specific content');
  assert(!/<\/?(?:script|style|iframe|object|embed|svg)|<!--|\son\w+\s*=|javascript:|data:/i.test(html),label+' contains active or hidden content');
  const stack=[];
  for(const match of html.matchAll(/<(\/?)([a-z][\w-]*)([^>]*)>/gi)){
    const closing=match[1],tag=match[2].toLowerCase(),attrs=match[3];assert(allowed.has(tag),label+' has unsupported element '+tag);
    if(closing){assert(!attrs.trim(),label+' has malformed closing HTML');assert.equal(stack.pop(),tag,label+' has mismatched HTML');continue}
    assert(!/\b(?:hidden|aria-hidden|style|id)\s*=?/i.test(attrs),label+' must not hide content or introduce global styling/IDs');
    const rest=attrs.replace(/\s+(?:class|scope|colspan|rowspan)="[^"]*"/g,'').replace(/\s*\/?\s*$/,'');assert(!rest,label+' has unsupported attributes');
    const assigned=attrs.match(/\bclass="([^"]*)"/);if(assigned)assert(assigned[1].split(/\s+/).every(c=>classes.has(c)),label+' has an unsupported styling class');
    if(!voids.has(tag))stack.push(tag);
  }
  assert.equal(stack.length,0,label+' has unclosed HTML');
  assert(!/[<>]/.test(html.replace(/<[^>]*>/g,'')),label+' must escape literal angle brackets');
}
function validate(data){
  assert(Array.isArray(data.editions)&&data.editions.length,'Workbook editions are required');
  const dates=new Set(),assistance=new Set();let count=0;
  data.editions.forEach((edition,index)=>{
    assert.equal(edition.no,index+1,'Workbook numbers must remain sequential');assert(/^\d{4}-\d{2}-\d{2}$/.test(edition.date));assert(!dates.has(edition.date),'duplicate Workbook date');dates.add(edition.date);
    assert.equal(edition.questions.length,8,'Workbook sets contain eight questions');const ids=new Set();
    for(const q of edition.questions){
      const label=edition.date+'/'+q.id;assert(/^q\d+$/.test(q.id)&&!ids.has(q.id),label+' needs a permanent unique question ID');ids.add(q.id);
      assert(['single','multi','tf'].includes(q.kind),label+' has an invalid kind');assert(Array.isArray(q.options)&&q.options.length>=2);assert(Array.isArray(q.correct)&&q.correct.length&&new Set(q.correct).size===q.correct.length);
      assert(q.correct.every(i=>Number.isInteger(i)&&i>=0&&i<q.options.length));if(q.kind!=='multi')assert.equal(q.correct.length,1);
      assert(q.stem&&q.field&&q.refs&&Array.isArray(q.concepts)&&q.concepts.length,label+' is missing publication content');
      material(q.assistance,label+' Assistance');material(q.explanation,label+' Explanation');assert(!assistance.has(q.assistance),label+' reuses generic Assistance');assistance.add(q.assistance);
      assert(!/\b(?:correct answer|answer is|option [A-H]|\([A-H]\) (?:is|are) correct)\b/i.test(q.assistance),label+' Assistance must not identify an answer choice');
      count++;
    }
  });return {sets:data.editions.length,questions:count};
}
module.exports={validate,material};
if(require.main===module){const fs=require('node:fs'),path=require('node:path'),file=process.argv[2]||path.join(__dirname,'index.html'),source=fs.readFileSync(file,'utf8'),data=file.endsWith('.json')?JSON.parse(source):JSON.parse(source.match(/id="challenge-data">([\s\S]*?)<\/script>/)[1]);console.log('Workbook learning content validated:',validate(data));}
