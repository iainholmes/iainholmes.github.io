'use strict';
const readingExhibits=require('./reading-exhibits.cjs');
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
function article(s){
 if(s.includes('data-reading-folio="1"'))return s;
 const ns=nodes(s),a=ns[0],find=c=>ns.find(n=>has(n,c)),head=find('entry-head'),number=find('entry-number'),grid=find('article-grid'),prose=find('prose'),lead=find('finding'),note=find('research-note');
 if(![head,number,grid,prose,lead,note].every(Boolean))throw Error('Incomplete reading folio: '+a.id);
 if(a.children.length!==2||!a.children.includes(head)||!a.children.includes(grid)||note.tag!=='aside')throw Error('Unsupported reading structure: '+a.id+'; preserve new material explicitly before composing');
 const title=head.children.find(n=>n.tag==='div');
 if(!title||head.children.length!==2||lead.parent!==prose)throw Error('Unsupported reading opening: '+a.id);
 const body=prose.children.filter(n=>n!==lead);let analysis='';
 for(let i=0;i<body.length;){const n=body[i];if(n.tag==='h3'){let end=i+1;while(end<body.length&&body[end].tag==='p')end++;analysis+='<section class="analysis-block">'+s.slice(n.start,body[end-1].end)+'</section>';i=end;}else{analysis+=raw(s,n);i++;}}
 const noteHead=note.children.filter(n=>has(n,'eyebrow')||n.tag==='h3'),noteBody=note.children.filter(n=>!noteHead.includes(n));
 const newNote=s.slice(note.start,note.open)+'<header class="research-heading">'+noteHead.map(n=>raw(s,n)).join('')+'</header><div class="research-agenda">'+noteBody.map(n=>raw(s,n)).join('')+'</div></aside>';
 const titleOpen=s.slice(title.start,title.open).replace(/class="([^"]*)"/,(_,c)=>'class="'+c+' reading-title"');
 return s.slice(0,a.open-1)+' data-reading-folio="1">'+
  s.slice(head.start,head.open)+'<div class="reading-folio">'+raw(s,number)+'</div>'+(title.classes[0]?titleOpen:titleOpen.slice(0,-1)+' class="reading-title">')+inside(s,title)+'</div></header>'+
  '<div class="reading-deck">'+raw(s,lead)+'</div>'+s.slice(grid.start,grid.open)+s.slice(prose.start,prose.open)+analysis+'</div>'+newNote+'</div></article>';
}
/* A reading is a sequential analysis followed by an aligned evidence register.
 * Original author-supplied HTML nodes are sliced exactly, not re-authored. */
function readingLayout(s){
 if(s.includes('data-reading-exhibit="1"'))return s;
 // Upgrade the reviewed v2 sequential layout in-place without reflowing the
 // already preserved article, evidence register, notebook or source anchors.
 if(s.includes('data-reading-layout="2"')){
  const tree=nodes(s),article=tree.find(n=>n.tag==='article'),finding=tree.find(n=>has(n,'finding'));
  if(!article||!finding)throw Error('Cannot upgrade reading exhibit');
  const next=readingExhibits.render(article.id,{finding:inside(s,finding)});
  const old=/<div class="economic-hinge"[\s\S]*?<\/small><\/div>/;
  if(!old.test(s))throw Error('Expected legacy Economic Hinge for '+article.id);
  return s.replace(old,next).replace(/(<article class="entry"[^>]*)(>)/,(_,attrs,close)=>attrs+' data-reading-exhibit="1"'+close);
 }
 const ns=nodes(s),a=ns.find(n=>n.tag==='article'),grid=ns.find(n=>has(n,'article-grid')),prose=ns.find(n=>has(n,'prose')),note=ns.find(n=>has(n,'research-note'));
 if(!a||!grid||!prose||!note||grid.children.length!==2||!grid.children.includes(prose)||!grid.children.includes(note))throw Error('Unexpected reading grid: '+(a?.id||'?'));
 const limit=prose.children.find(n=>has(n,'limitation')),sources=prose.children.find(n=>has(n,'sources'));
 if(!limit||!sources||prose.children.indexOf(limit)>prose.children.indexOf(sources))throw Error('Missing limitation / sources: '+a.id);
 const narrative=prose.children.filter(n=>n!==limit&&n!==sources).map(n=>raw(s,n)).join('');
 const title=ns.find(n=>n.tag==='h2') ,finding=ns.find(n=>has(n,'finding')),analyses=ns.filter(n=>has(n,'analysis-block')),interpretation=analyses[1],limitP=limit.children.find(n=>n.tag==='p');
 const material={title:title?inside(s,title):'',finding:finding?inside(s,finding):'',interpretation:interpretation?inside(s,interpretation):'',limitations:limitP?inside(s,limitP):''};
 const exhibit=readingExhibits.render(a.id,material);
 const newGrid='<div class="article-grid"><div class="prose analysis-flow">'+narrative+'</div>'+exhibit+
   '<div class="evidence-pair">'+raw(s,limit)+raw(s,note)+'</div>'+
   '<div class="reading-sources">'+raw(s,sources)+'</div></div>';
 const result=s.slice(0,grid.start)+newGrid+s.slice(grid.end);
 return result.replace(/(<article class="entry"[^>]*)(>)/,(_,attrs,close)=>attrs+' data-reading-layout="2" data-reading-exhibit="1"'+close);
}
function closing(s,type){
 if(s.includes('data-editorial-folio="1"'))return s;
 const ns=nodes(s),section=ns[0],children=section.children,eyebrow=children.find(n=>has(n,'eyebrow')),h=children.find(n=>n.tag==='h2');
 if(!eyebrow)throw Error('Missing closing heading');let content='';
 if(type==='synthesis'){
  if(!h)throw Error('Missing synthesis title');
  content='<header class="closing-heading">'+raw(s,eyebrow)+raw(s,h)+'</header><div class="synthesis-argument">'+children.filter(n=>n!==eyebrow&&n!==h&&!has(n,'closing')).map(n=>raw(s,n)).join('')+'</div>'+children.filter(n=>has(n,'closing')).map(n=>'<footer class="synthesis-conclusion">'+raw(s,n)+'</footer>').join('');
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
 s=s.replace(/<article class="entry"[\s\S]*?<\/article>/g,m=>readingLayout(article(m)));
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
 return source.replace(main[0],main[1]+result+main[3]);
}
// Scholarship comparison deliberately ignores presentation wrappers, while
// retaining exact paragraph/heading/figure bytes and every original link/ID.
function readingRecord(s){
 // Compare the entire authored scholarship with the original historical record.
 // The newly-authored interpretive lens is a separate, clearly attributed layer.
 const clean=s.replace(/<section class="reading-exhibit"[\s\S]*?<\/section>/g,'').replace(/<div class="economic-hinge"[\s\S]*?<\/small><\/div>/g,'');
 const ns=nodes(clean), blocks=ns.filter(n=>['h2','h3','p','figure'].includes(n.tag)).map(n=>raw(clean,n));
 const meta=ns.filter(n=>has(n,'eyebrow')||has(n,'status')||has(n,'concepts')).map(n=>raw(clean,n)).sort(); // invariant to reflow of existing apparatus
 return {
  text:blocks.map(x=>x.replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim()).join(' | '),
  blocks,
  meta,
  links:ns.filter(n=>n.tag==='a').map(n=>raw(clean,n)),
  ids:ns.filter(n=>n.id).map(n=>[n.tag,n.id]),
  folio:ns.filter(n=>has(n,'entry-number')).map(n=>raw(clean,n))
 };
}

module.exports={compose,nodes,article,closing,readingLayout,readingRecord};
