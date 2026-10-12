/* Read-only, same-origin publication adapters. Never execute source-site scripts. */
(function(root){
  'use strict';
  const dayAt = now => { const p=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now).map(v=>[v.type,v.value]));return `${p.year}-${p.month}-${p.day}`; };
  const label = date => new Intl.DateTimeFormat('en-GB',{timeZone:'UTC',day:'2-digit',month:'short',year:'numeric'}).format(new Date(date+'T12:00:00Z'));
  const plain = s => String(s||'').replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").trim();
  function jsonBlock(html,id){const m=html.match(new RegExp('<script type="application/json" id="'+id+'">([\\s\\S]*?)</script>'));if(!m)throw Error('Missing canonical data');return JSON.parse(m[1]);}
  function archiveFrom(text){const start=text.indexOf('var archive=');const end=text.lastIndexOf(';if(');if(start<0||end<start)throw Error('Missing artwork registry');return JSON.parse(text.slice(start+12,end));}
  function safeCover(svg){const tags=new Set(['svg','g','path','text','tspan','rect','ellipse','circle','line','polygon','polyline','defs','linearGradient','radialGradient','stop','title','desc','style','pattern','clipPath']);return typeof svg==='string' && [...svg.matchAll(/<\/?([A-Za-z][\w:-]*)\b/g)].every(m=>tags.has(m[1])) && /^<svg\b/.test(svg) && !/<(?:script|foreignObject|image|a)\b|\bon\w+\s*=|\b(?:href|src)\s*=|<!|@import|url\((?!#)/i.test(svg);}
  const specs={
    'field-brief':{key:'fb',path:'/daily-watchlist-5/',data:'briefing-data'},
    workbook:{key:'cp',path:'/daily-econ-challenge/',data:'challenge-data'},
    loblolly:{key:'sp',path:'/weekly-economics-environment/'}
  };
  function periodical(id,html,archive,now=new Date()){
    const spec=specs[id];if(!spec)throw Error('Unknown publication');
    let editions;
    if(spec.data)editions=jsonBlock(html,spec.data).editions;
    else editions=[...html.matchAll(/<section class="edition"[^>]*data-edition="([^"]+)"[^>]*data-title="([^"]+)"/g)].map(m=>({date:m[1],title:plain(m[2])}));
    const candidates=editions.filter(e=>/^\d{4}-\d{2}-\d{2}$/.test(e.date)&&e.date<=dayAt(now)&&(!e.status||e.status==='published')&&(!e.published_at||(+new Date(e.published_at)<=+now))&&archive[spec.key+':'+e.date]);
    const e=candidates.sort((a,b)=>a.date.localeCompare(b.date)).at(-1);if(!e)throw Error('No verified release');
    const art=archive[spec.key+':'+e.date];
    if(art.date!==e.date||art.key!==spec.key||!/^\d+$/.test(String(art.no))||!safeCover(art.frozen))throw Error('Incomplete published artwork');
    if(id==='field-brief'&&(!e.issueTitle||e.stories?.length!==5))throw Error('Incomplete briefing');
    if(id==='workbook'&&(!e.questions?.length||Number(e.no)!==Number(art.no)))throw Error('Incomplete set');
    const title=id==='field-brief'?e.issueTitle:id==='workbook'?(e.title||art.phrase):e.title;
    if(!title)throw Error('Missing publication title');
    return {id,date:e.date,dateLabel:label(e.date),number:String(art.no).padStart(3,'0'),title:plain(title),
      detail:id==='field-brief'?`${e.stories.length} developments · ${e.readTime||''}`:id==='workbook'?`${e.questions.length} questions · ${new Set(e.questions.map(q=>q.field)).size} fields · ${e.minutes||''} min`:art.phrase||'',
      artwork:art.frozen,url:'https://iainholmes.github.io'+spec.path+'#'+(id==='loblolly'?'edition-':'')+e.date};
  }
  function weekendAt(now){const date=dayAt(now);const d=new Date(date+'T12:00:00Z');const weekday=d.getUTCDay();d.setUTCDate(d.getUTCDate()+(weekday===0?-1:6-weekday));return d.toISOString().slice(0,10);}
  function released(e,now){return ['published','withdrawn'].includes(e.status)&&Number.isFinite(+new Date(e.published_at))&&+new Date(e.published_at)<=+now;}
  function atlasIndex(manifest,now=new Date()){
    if(!Array.isArray(manifest.editions))throw Error('Missing release manifest');
    const weekend=weekendAt(now);
    return ['tuesday','thursday'].map(slot=>{
      const entry=manifest.editions.filter(e=>e.slot===slot&&released(e,now)).sort((a,b)=>+new Date(a.published_at)-+new Date(b.published_at)).at(-1)||null;
      return {slot,entry,pending:!manifest.editions.some(e=>e.slot===slot&&e.weekend?.start===weekend&&released(e,now)),weekend};
    });
  }
  function atlasRelease(selection,edition,photos,now=new Date()){
    const e=selection.entry;
    if(!e)return {slot:selection.slot,state:'pending',pending:true};
    if(e.status==='withdrawn')return {slot:selection.slot,state:'withdrawn',pending:selection.pending,date:dayAt(new Date(e.published_at))};
    if(!released(e,now)||e.status!=='published'||edition?.id!==e.id||edition.status!==e.status||edition.published_at!==e.published_at||edition.slot!==e.slot)throw Error('Release mismatch');
    const p=edition.flagship;
    const photoId=p?.artwork?.image_id||p?.photo?.id;
    const image=photos.photos?.find(v=>v.id===photoId);
    if(!p?.title||p.place_id!==e.place_id||photoId!==e.photo_id||!image||!/^[-\w]+$/.test(image.file))throw Error('Incomplete recommendation');
    const width=image.widths?.includes(800)?800:image.widths?.[0];if(!Number.isFinite(width))throw Error('Missing editorial plate');
    return {slot:selection.slot,state:'published',pending:selection.pending,id:e.id,date:dayAt(new Date(e.published_at)),dateLabel:label(dayAt(new Date(e.published_at))),title:p.title,
      destination:p.snapshot?.access?.name||p.title,artwork:`/rupert/photos/${image.file}-${width}.jpg`,alt:p.artwork?.alt||p.photo?.alt||image.alt||p.title,
      url:`https://iainholmes.github.io/rupert/edition/${e.id}/`};
  }
  async function snapshot(read,now=new Date()){
    const artwork=await read('/personal-updates/issue-mark-archive.js').then(archiveFrom).catch(()=>null);
    const publications={};
    await Promise.all(Object.entries(specs).map(async([id,spec])=>{try{if(!artwork)return;publications[id]=periodical(id,await read(spec.path+'index.html'),artwork,now);}catch{}}));
    let atlas=[];
    try{
      const manifest=JSON.parse(await read('/rupert/data/editions/index.json'));
      const selections=atlasIndex(manifest,now);
      const photos=JSON.parse(await read('/rupert/data/photos.json'));
      atlas=await Promise.all(selections.map(async selection=>{
        if(!selection.entry||selection.entry.status==='withdrawn')return atlasRelease(selection,null,photos,now);
        const e=selection.entry;if(!/^[-\w]+$/.test(e.id)||e.path!==`data/editions/${e.id}.json`)throw Error('Unsafe edition path');
        return atlasRelease(selection,JSON.parse(await read('/rupert/'+e.path)),photos,now);
      }));
    }catch{}
    return {publications:Object.fromEntries(Object.keys(specs).filter(id=>publications[id]).map(id=>[id,publications[id]])),atlas};
  }
  function artworkInto(node,svg){
    const parsed=new DOMParser().parseFromString(svg,'image/svg+xml');if(parsed.querySelector('parsererror')||!safeCover(svg))return false;
    node.replaceChildren(document.importNode(parsed.documentElement,true));return true;
  }
  function paint(data,fresh){
    document.querySelectorAll('[data-release-state]').forEach(node=>{node.textContent='Last Verified';});
    document.querySelectorAll('[data-atlas-state]').forEach(node=>{if(node.textContent.includes('Published'))node.textContent='Last Verified';});
    for(const [id,e]of Object.entries(data.publications||{})){
      const panel=document.querySelector(`[data-publication="${id}"]`);if(!panel)continue;
      if(!artworkInto(panel.querySelector('[data-release-art]'),e.artwork))continue;
      panel.querySelector('[data-release-link]').href=e.url;
      const date=panel.querySelector('[data-release-date]');date.dateTime=e.date;date.textContent=e.dateLabel;
      panel.querySelector('[data-release-number]').textContent=e.number;
      panel.querySelector('[data-release-title]').textContent=e.title;
      panel.querySelector('[data-release-detail]').textContent=e.detail;
      panel.querySelector('[data-release-state]').textContent=fresh?'Published':'Last Verified';
    }
    for(const e of data.atlas||[]){
      const card=document.querySelector(`[data-atlas-slot="${e.slot}"]`);if(!card)continue;
      card.querySelector('[data-atlas-state]').textContent=e.state==='published'?(fresh?(e.pending?'Last Published · Current Release Pending':'Published'):'Last Verified'):e.state==='withdrawn'?'Withdrawn':'Pending Publication';
      const a=card.querySelector('a'),img=card.querySelector('img');
      a.href=e.url||'https://iainholmes.github.io/rupert/';
      card.querySelector('[data-atlas-title]').textContent=e.title||'No Released Recommendation';
      card.querySelector('[data-atlas-date]').textContent=e.dateLabel||'';
      if(e.state==='published'){img.src=e.artwork;img.alt=e.alt;img.hidden=false;img.title=e.destination;}else{img.removeAttribute('src');img.hidden=true;}
    }
  }
  function start(){
    let latest=0,running=false;
    async function refresh(){
      if(running||Date.now()-latest<300000)return;running=true;
      const read=async path=>{const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),6000);try{const response=await fetch(path,{cache:'no-store',signal:controller.signal});if(!response.ok)throw Error('Source unavailable');return await response.text();}finally{clearTimeout(timer);}};
      try{const data=await snapshot(read);paint(data,true);latest=Date.now();}catch{}finally{running=false;}
    }
    root.DeskPublications.refresh=refresh;
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
    window.addEventListener('pageshow',refresh);refresh();
  }
  const api={periodical,archiveFrom,safeCover,atlasIndex,atlasRelease,snapshot,start};
  if(typeof module==='object'&&module.exports)module.exports=api;else root.DeskPublications=api;
})(typeof window==='object'?window:globalThis);
