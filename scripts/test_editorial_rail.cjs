'use strict';
const fs=require('fs'),cp=require('child_process'),assert=require('node:assert/strict'),{compose,nodes}=require('../weekly-economics-environment/editorial-folio.cjs');
const p='weekly-economics-environment/index.html',source=fs.readFileSync(p,'utf8'),baseline=cp.execFileSync('git',['show','2926414b6233f738795180b40a1475444b609467:'+p],{encoding:'utf8',maxBuffer:4e6});let count=0;
function eq(a,b,label){assert.deepEqual(a,b,label);count++}
const rails=/<aside class="editorial-rail"[\s\S]*?<\/aside>/g;
eq(source.replace(rails,'').replace('reading-folio.css?v=20261102-editorial-rail','reading-folio.css?v=20261101-synthesis-flow'),baseline,'all original content, scripts, anchors, artwork and opening/closing markup unchanged');
eq(compose(source),source,'repeated publication is byte-idempotent');
const main=source.match(/<main[^>]*id="edition"[^>]*>([\s\S]*?)<\/main>/)[1],ns=nodes(main);
for(const ed of ns.filter(n=>n.classes.includes('edition'))){const s=main.slice(ed.start,ed.end);eq((s.match(rails)||[]).length,1,'one rail per edition');const body=nodes(s).find(n=>n.classes.includes('edition-body'));eq(body.children.slice(0,3).map(n=>n.classes[0]),['contents-boundary','editorial-rail','reading-column'],'actual three-track DOM order');const label=s.match(/<div class="eyebrow edition-label">([\s\S]*?)<\/div>/)[1];assert(s.match(rails)[0].includes(label));count++;}
// Future additions refresh metadata from their actual label and article inventory.
const changed=source.replace('Volume I <span class="sep">/</span>','Volume II <span class="sep">/</span>');const next=compose(changed);assert(next.match(rails)[0].includes('Volume II'));count++;eq(compose(next),next,'future preparation remains idempotent');
const css=fs.readFileSync('weekly-economics-environment/reading-folio.css','utf8');assert(css.includes('@media(min-width:1440px)'));count++;assert(css.includes('body.glance .editorial-rail{display:none}'));count++;
console.log(count+' editorial rail preservation, structure and future-publication checks passed.');
