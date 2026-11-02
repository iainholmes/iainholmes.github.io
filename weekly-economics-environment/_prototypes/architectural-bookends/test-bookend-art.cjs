'use strict';
/* Run with: node weekly-economics-environment/_prototypes/architectural-bookends/test-bookend-art.cjs */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const art=require('./bookend-art.js');
const concepts=[
 ['Coal Demand Shocks Travel Beyond the Mine','coal-network'],
 ['Clean Equipment and Rooftop Solar Work Together','household-complements'],
 ['EPA Proposes a Different Methane Ledger','methane-ledger'],
 ['More New Solar Is Arriving With Batteries','solar-storage'],
 ['A New Emissions Model Changes the Baseline','model-baseline']
];
let checks=0;
for(const [title,expected] of concepts){
 assert.equal(art.resolve({title}).id,expected,'reading-specific motif '+title);checks++;
 const opening=art.render({title},'top'),closing=art.render({title},'bottom');
 assert(opening.includes('data-bookend-concept="'+expected+'"'));checks++;
 assert(closing.includes('data-bookend-concept="'+expected+'"'));checks++;
 assert(opening.includes('role="img"')&&opening.includes('<title>'));checks++;
 assert.equal(opening,art.render({title},'top'),'deterministic SVG');checks++;
 assert.notEqual(opening,closing,'paired chapter positions have distinct metadata');checks++;
}
const fallback=art.resolve({title:'The Geography of Unexpected Economics'});
assert.equal(fallback.id,'typographic','uncertain title does not invent an unrelated scientific icon');checks++;
const untrusted=art.render({title:'<img src=x onerror=alert(1)> & Test'},'top');
assert(!untrusted.includes('<img')&&untrusted.includes('&lt;img'),'unsafe headline characters escaped');checks++;
assert(!/Math\.random|fetch\(|XMLHttpRequest|https?:\/\//.test(fs.readFileSync(path.join(__dirname,'bookend-art.js'),'utf8')),'illustrations require neither randomness nor network');checks++;
const preview=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
assert.equal((preview.match(/<article class="entry"/g)||[]).length,5,'five real reading articles in prototype');checks++;
assert(preview.includes('window.LLBookendArt.render(model,\'top\')')&&preview.includes('window.LLBookendArt.render(model,\'bottom\')'),'opening and closing marks generated from article content');checks++;
assert(preview.includes('aria-expanded')&&preview.includes('data-mode'),'interaction layout probe and theme switch exist');checks++;
console.log(checks+' architectural bookend source-grounding, originality, safety and preview checks passed.');
