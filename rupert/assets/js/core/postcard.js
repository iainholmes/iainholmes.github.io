const engravedDog=new Image();
engravedDog.src=new URL('../../img/travel-labrador-engraved.png',import.meta.url).href;
await engravedDog.decode().catch(()=>{});
await document.fonts.load('18px "Latin Modern Roman"');
// Local composition only: no lookup, upload, credentials or remote image service.
export function automaticPostcard(plan) {
  if(!engravedDog.naturalWidth)throw Error('Postcard artwork could not load. Reload this page and try again.');
  const canvas=document.createElement('canvas');canvas.width=1000;canvas.height=650;
  const c=canvas.getContext('2d'), blue='#1D2A3A',cream='#F3EFE5',copper='#C98B4B',chocolate='#574E45',forest='#34483B';
  const destination=plan.legs.at(-1).to.label, origin=plan.legs[0].from.label;
  const mode=plan.legs.at(-1).mode;
  const scene=/river|lake|coast|ferry|beach|bay|harbor|orleans/i.test(destination)||mode==='ferry'?'water':/mountain|ridge|peak|blue ridge|asheville|rocky/i.test(destination)?'mountain':/city|downtown|square|historic|district/i.test(destination)?'town':'woodland';
  const hash=[...destination.toLowerCase()].reduce((n,ch)=>(Math.imul(n,31)+ch.charCodeAt(0))>>>0,173);
  const yearMonth=(plan.dates?.start||'').slice(0,7);
  const selectedStops=plan.journey?.stops?.length??Math.max(0,plan.legs.length-1);
  c.fillStyle=cream;c.fillRect(0,0,1000,650);c.fillStyle=blue;c.fillRect(24,24,952,602);
  c.fillStyle=cream;c.globalAlpha=.15;
  let grain=2026;for(let i=0;i<2200;i++){grain=(grain*1664525+1013904223)>>>0;const x=24+(grain%952);grain=(grain*1664525+1013904223)>>>0;const y=24+(grain%602);c.fillRect(x,y,1,1);}c.globalAlpha=1;
  c.strokeStyle=scene==='water'?cream:forest;c.lineWidth=3;
  const landscapes={
    water:'M520 415Q650 370 775 420T1000 410 M550 460Q700 430 820 465T1000 450',
    mountain:'M530 470L675 290L740 365L835 245L990 470 M660 470L740 340L795 412',
    town:'M525 460V355H565V325H605V460 M628 460V290H682V460 M704 460V346H772V460 M791 460V310H852V460 M865 460V370H943V460',
    woodland:'M525 470L565 345L605 470 M605 470L665 290L725 470 M727 470L775 352L825 470 M825 470L888 310L950 470'
  };
  const terrain=new Path2D(landscapes[scene]);c.stroke(terrain);
  c.strokeStyle=copper;c.lineWidth=5;c.setLineDash([12,15]);c.beginPath();c.moveTo(545,520);c.bezierCurveTo(650,465,770,575,905,505);c.stroke();c.setLineDash([]);
  c.fillStyle=copper;c.beginPath();c.arc(818+(hash%108),155+(hash%34),36+(hash%12),0,Math.PI*2);c.fill();
  // Reuse the approved engraved element; the itinerary stays entirely in this browser.
  c.drawImage(engravedDog,80,75,365,455);
  c.strokeStyle=cream;c.lineWidth=2;
  for(let y=430;y<510;y+=14){c.beginPath();c.moveTo(500,y);c.bezierCurveTo(620,y-12,720,y+10,930,y-3);c.stroke();}
  c.fillStyle=cream;c.font='28px "Latin Modern Roman", Georgia, serif';
  const fit=(text,max)=>{while(c.measureText(text).width>max&&text.length>1)text=text.slice(0,-2)+'…';return text;};
  c.fillText(fit(destination,850),65,570);c.font='18px "Latin Modern Roman", Georgia, serif';
  const details=[origin+' → '+destination,yearMonth||'',selectedStops?selectedStops+' planned stops':''].filter(Boolean).join(' · ');
  c.fillText(fit(details,850),65,600);
  return {image:canvas.toDataURL('image/png'),caption:destination.slice(0,160),automatic:true};
}
