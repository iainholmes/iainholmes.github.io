'use strict';
const architecture=require('./editorial-architecture.cjs');
// Publication-time presentation only. Original text, links and figures are sliced
// from the author's markup, never serialized or rewritten. No browser dependency.
const voids=new Set('area base br col embed hr img input link meta param source track wbr'.split(' '));
function nodes(html){
 const root={children:[]},stack=[root],all=[];
 const tokens=/<!--[\s\S]*?-->|<(?:[^>"']|"[^"]*"|'[^']*')*>/g;
 for(const m of html.matchAll(tokens)){
  const text=m[0],tag=text.match(/^<\/?([\w-]+)/)?.[1]?.toLowerCase();if(!tag)continue;
  if(text.startsWith('</')){const n=stack.at(-1);if(n.tag!==tag)throw Error('Unbalanced editorial markup: '+tag);n.close=m.index;n.end=m.index+text.length;stack.pop();continue;}
  const n={tag,start:m.index,open:m.index+text.length,close:m.index+text.length,end:m.index+text.length,children:[],parent:stack.at(-1),attrs:text};
  n.classes=(text.match(/\bclass="([^"]*)"/)?.[1]||'').split(/\s+/);n.id=text.match(/\bid="([^"]+)"/)?.[1];n.parent.children.push(n);all.push(n);
  if(!voids.has(tag)&&!text.endsWith('/>'))stack.push(n);
 }
 if(stack.length!==1)throw Error('Unclosed editorial markup');return all;
}
const has=(n,c)=>n.classes.includes(c),raw=(s,n)=>s.slice(n.start,n.end),inside=(s,n)=>s.slice(n.open,n.close);
function closing(s,type){
 if(s.includes('data-editorial-folio="1"'))return s;
 const ns=nodes(s),section=ns[0],children=section.children,eyebrow=children.find(n=>has(n,'eyebrow')),h=children.find(n=>n.tag==='h2');
 if(!eyebrow)throw Error('Missing closing heading');let content='';
 if(type==='synthesis'){
  if(!h)throw Error('Missing synthesis title');
  content='<header class="closing-heading"><div class="eyebrow">Editor\'s synthesis</div>'+raw(s,h)+'</header><div class="synthesis-argument">'+children.filter(n=>n!==eyebrow&&n!==h&&!has(n,'closing')).map(n=>raw(s,n)).join('')+'</div>'+children.filter(n=>has(n,'closing')).map(n=>'<footer class="synthesis-conclusion">'+raw(s,n)+'</footer>').join('');
 }else if(type==='knowledge'){
  if(!h)throw Error('Missing methods title');const intro=children.find(n=>n.tag==='p'),last=children.at(-1),returnLink=last!==intro&&last.tag==='p'&&inside(s,last).includes('href="notebook/"')?last:null;
  content='<header class="closing-heading">'+raw(s,eyebrow)+raw(s,h)+(intro?raw(s,intro):'')+'</header><div class="method-directory">'+children.filter(n=>![eyebrow,h,intro,returnLink].includes(n)).map(n=>raw(s,n)).join('')+'</div>'+(returnLink?'<footer class="methods-return">'+raw(s,returnLink)+'</footer>':'');
 }else{
  const labels=['Editorial scope','Evidence &amp; interpretation','Publication record'];
  content='<header class="closing-heading"><h2>'+inside(s,eyebrow)+'</h2></header><div class="editorial-record">'+children.filter(n=>n!==eyebrow).map((n,i)=>'<section class="editorial-record-group">'+(i<labels.length?'<h3>'+labels[i]+'</h3>':'')+raw(s,n)+'</section>').join('')+'</div>';
 }
 return s.slice(0,section.open-1)+' data-editorial-folio="1">'+content+'</section>';
}
function edition(s){
 s=s.replace(/<article class="entry"[\s\S]*?<\/article>/g,m=>architecture.compose(m,{nodes}));
 s=s.replace(/(<section class="edition"[^>]*)(>)/,(m,a,b)=>a.replace(/ data-reading-architecture="[^"]*"/g,'')+' data-reading-architecture="7"'+b);
 // Only uncomposed sections are matched; composed colophons contain nested sections.
 for(const type of ['synthesis','knowledge','editorial-note'])s=s.replace(new RegExp('<section class="'+type+'"(?![^>]*data-editorial-folio)[^>]*>[\\s\\S]*?</section>','g'),m=>closing(m,type));
 const date=s.match(/data-edition="([^"]+)"/)?.[1];
 const note=s.match(/<section class="editorial-note"[^>]*>/)?.[0];
 if(note&&!/\bid=/.test(note))s=s.replace(note,note.slice(0,-1)+' id="'+date+'-editorial-note">');
 const noteId=s.match(/<section class="editorial-note"[^>]*\bid="([^"]+)"/)?.[1];
 s=s.replace(/<nav aria-label="Edition contents">([\s\S]*?)<\/nav>/,(all,links)=>{
  if(links.includes('class="chapter-readings"'))return all;
  const as=[...links.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)].map(m=>m[0]),readings=as.filter(a=>a.includes('<span>')),closingLinks=as.filter(a=>!a.includes('<span>'));
  if(noteId&&!closingLinks.some(a=>a.includes('#'+noteId+'"')))closingLinks.push('<a href="#'+noteId+'">Editorial &amp; source note</a>');
  return '<nav aria-label="Edition contents"><div class="chapter-readings" aria-label="Readings">'+readings.join('')+'</div><div class="chapter-closing" aria-label="Closing sections">'+closingLinks.join('')+'</div></nav>';
 });
 // Strip the retired metadata rail from existing editions; never create another
 // grid track in new issues. The single divider belongs to the stylesheet.
 s=s.replace(/<aside class="editorial-rail"[\s\S]*?<\/aside>/g,'');
 return s;
}
function compose(source){
 const main=source.match(/(<main\b[^>]*id="edition"[^>]*>)([\s\S]*?)(<\/main>)/);if(!main)throw Error('Missing journal edition region');
 const result=main[2].replace(/<section class="edition"[\s\S]*?(?=<section class="edition"|$)/g,edition);
 return architecture.finalize(source.replace(main[0],main[1]+result+main[3]),{nodes});
}
// Scholarship comparison deliberately ignores presentation wrappers, while
// retaining exact paragraph/heading/figure bytes and every original link/ID.
function readingRecord(s){
 const tree=nodes(s), retained=tree.filter(n=>has(n,'ll-retained-media')).map(n=>inside(s,n)).join('');
 const generated=tree.filter(n=>['reading-exhibit','economic-hinge','essay-graphic','reading-companion-feature','ll-feature','ll-feature-stream','ll-argument','ll-source-summary'].some(c=>has(n,c))).filter(n=>!tree.some(p=>p.start<n.start&&p.end>n.end&&['reading-exhibit','ll-feature-stream'].some(c=>has(p,c)))).sort((a,b)=>b.start-a.start);
 let clean=s;for(const n of generated)clean=clean.slice(0,n.start)+clean.slice(n.end);
 clean='<div>'+clean+retained+'</div>';
 const ns=nodes(clean),blocks=ns.filter(n=>['h2','h3','p','figure'].includes(n.tag)).map(n=>raw(clean,n)).sort();
 return {text:blocks.map(x=>x.replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim()).join(' | '),blocks,
 meta:ns.filter(n=>has(n,'eyebrow')||has(n,'status')||has(n,'concepts')).map(n=>raw(clean,n)).sort(),
 links:ns.filter(n=>n.tag==='a').map(n=>raw(clean,n)).sort(),
 ids:ns.filter(n=>n.id&&!n.id.includes('--')).map(n=>[n.tag,n.id]),
 folio:ns.filter(n=>has(n,'entry-number')).map(n=>raw(clean,n))};
}
module.exports={compose,nodes,closing,readingRecord};
