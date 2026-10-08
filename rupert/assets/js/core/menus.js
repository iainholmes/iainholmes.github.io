// Only menu-like disclosures opt in. Long-form history and advanced editors are untouched.
export function setupMenus(host=document) {
  let keyboard=false;
  document.addEventListener('keydown',e=>{if(e.key==='Tab'||e.key.startsWith('Arrow'))keyboard=true;});
  document.addEventListener('pointerdown',()=>{keyboard=false;},true);
  const fine=matchMedia('(hover:hover) and (pointer:fine)');
  // Home & routes is a form, not a hover menu: native autofill leaves the document.
  for(const menu of host.querySelectorAll('.frame-menu,.frame-regions,.reg-details,[data-menu]')) {
    if(menu.dataset.menuReady)continue;menu.dataset.menuReady='true';let timer;
    const close=()=>{clearTimeout(timer);menu.open=false;};
    const focused=()=>keyboard&&menu.contains(document.activeElement);
    menu.addEventListener('pointerenter',()=>clearTimeout(timer));
    menu.addEventListener('pointerleave',e=>{
      if(!fine.matches||e.pointerType==='touch'||menu.contains(e.relatedTarget))return;
      clearTimeout(timer);timer=setTimeout(()=>{if(!focused()&&!menu.matches(':hover'))close();},180);
    });
    menu.addEventListener('focusin',()=>clearTimeout(timer));
    menu.addEventListener('focusout',()=>{if(menu.matches('.reg-details')&&(!fine.matches||innerWidth<1024))return;clearTimeout(timer);timer=setTimeout(()=>{if(!menu.contains(document.activeElement)&&!menu.matches(':hover'))close();},180);});
    menu.addEventListener('keydown',e=>{if(e.key!=='Escape')return;e.preventDefault();e.stopPropagation();close();menu.querySelector(':scope > summary')?.focus();});
    if(menu.matches('.reg-details')) {
      const popup=menu.querySelector('.reg-dossier'),summary=menu.querySelector(':scope > summary'),list=menu.closest('.directory-list');
      const position=()=>{if(!popup)return;if(!fine.matches||innerWidth<1024){for(const p of ['width','left','top','max-height'])popup.style.removeProperty(p);return;}if(!menu.open)return;
        const rect=summary.getBoundingClientRect(),width=Math.min(360,innerWidth-40);popup.style.width=width+'px';popup.style.left=Math.max(20,Math.min(rect.right-width,innerWidth-width-20))+'px';
        popup.style.maxHeight=Math.max(0,innerHeight-24)+'px';
        const height=popup.getBoundingClientRect().height,top=rect.bottom+height+20<=innerHeight?rect.bottom+8:rect.top-height-8;
        popup.style.top=Math.max(12,Math.min(top,innerHeight-height-12))+'px';
      };
      const release=()=>{window.removeEventListener('resize',resize);window.removeEventListener('scroll',resize);list?.removeEventListener('scroll',scroll);};
      const resize=()=>{if(!menu.isConnected){release();return;}position();};
      const scroll=()=>{if(!menu.isConnected){release();return;}if(menu.open&&!focused())close();else position();};
      menu.addEventListener('toggle',position);window.addEventListener('resize',resize);window.addEventListener('scroll',resize);list?.addEventListener('scroll',scroll);
      if(menu.open)position();
    }
  }
}
