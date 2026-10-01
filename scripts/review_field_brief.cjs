/* Publisher selection review: node scripts/review_field_brief.cjs candidates.json
   Input: {date, candidates:[story objects], selected:[zero-based indexes], exception?:{reason,evidenceUrl}}
   Output is inspectable editorialSelection evidence for the NEW issue. It does not select or publish news. */
const fs=require('node:fs'),path=require('node:path'),memory=require('../personal-updates/editorial-memory.js');
if(!process.argv[2])throw Error('Provide the candidate-review JSON path.');
const input=JSON.parse(fs.readFileSync(process.argv[2],'utf8')),html=fs.readFileSync(path.resolve(__dirname,'../daily-watchlist-5/index.html'),'utf8');
const editions=JSON.parse(html.match(/id="briefing-data">([\s\S]*?)<\/script>/)[1]).editions;
if(!/^\d{4}-\d{2}-\d{2}$/.test(input.date)||!Array.isArray(input.candidates))throw Error('Review requires date and candidates.');
const assessments=input.candidates.map((c,index)=>({index,title:c.title,...memory.assess(c,editions,input.date)}));
const selected=(input.selected||[]).map(i=>{if(!input.candidates[i])throw Error('Unknown selected candidate index');return input.candidates[i];});
console.log(JSON.stringify({historyDates:memory.history(editions,input.date).map(e=>e.date),assessments,selected:input.selected||[],diversity:memory.review(selected,input.exception)},null,2));
