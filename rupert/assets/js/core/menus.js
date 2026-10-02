// Only menu-like disclosures opt in. Long-form history and advanced editors are untouched.
export function setupMenus(host=document) {
  let keyboard=false;
  document.addEventListener('keydown',e=>{if(e.key==='Tab'||e.key.startsWith('Arrow'))keyboard=true;});
  document.addEventListener('pointerdown',()=>{keyboard=false;},true);
  const fine=matchMedia('(hover:hover) and (pointer:fine)');
  for(const menu of host.querySelectorAll('.frame-menu,.frame-regions,.location-settings,.reg-details,[data-menu]')) {
    if(menu.dataset.menuReady)continue;menu.dataset.menuReady='true';let timer;
    const close=()=>{clearTimeout(timer);menu.open=false;};
    const focused=()=>keyboard&&menu.contains(document.activeElement);
    menu.addEventListener('pointerenter',()=>clearTimeout(timer));
    menu.addEventListener('pointerleave',e=>{
      if(!fine.matches||e.pointerType==='touch'||menu.contains(e.relatedTarget))return;
      clearTimeout(timer);timer=setTimeout(()=>{if(!focused()&&!menu.matches(':hover'))close();},180);
    });
    menu.addEventListener('focusin',()=>clearTimeout(timer));
    menu.addEventListener('focusout',()=>{clearTimeout(timer);timer=setTimeout(()=>{if(!menu.contains(document.activeElement)&&!menu.matches(':hover'))close();},180);});
    menu.addEventListener('keydown',e=>{if(e.key!=='Escape')return;e.preventDefault();e.stopPropagation();close();menu.querySelector(':scope > summary')?.focus();});
    if(menu.matches('.reg-details')) {
      const popup=menu.querySelector('.reg-dossier'),summary=menu.querySelector(':scope > summary');
      const position=()=>{if(!menu.open||!popup||!fine.matches||innerWidth<1024)return;
        const rect=summary.getBoundingClientRect(),width=Math.min(360,innerWidth-40);popup.style.width=width+'px';popup.style.left=Math.max(20,Math.min(rect.right-width,innerWidth-width-20))+'px';
        const height=Math.min(popup.scrollHeight,innerHeight-100);popup.style.maxHeight=height+'px';popup.style.top=(rect.bottom+height+12<innerHeight?rect.bottom+8:Math.max(12,rect.top-height-8))+'px';
      };
      menu.addEventListener('toggle',position);window.addEventListener('resize',position);document.querySelector('.directory-list')?.addEventListener('scroll',()=>{if(menu.open&&!focused())close();else position();});
    }
  }
}
