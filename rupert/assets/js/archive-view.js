import { matchesOption } from './core/options.js';
export function setupArchive() {
  const archive=document.querySelector('.archive'),form=archive?.querySelector('.archive-filters'); if(!form)return;
  form.hidden=false;
  const run=()=>{const filters=Object.fromEntries(new FormData(form));const active=Object.entries(filters).some(([k,v])=>v.trim()&&!(k==='crowd'&&v==='any'));let count=0;
    archive.querySelectorAll('.archive-week').forEach(week=>{let shown=false;week.querySelectorAll('.archive-card').forEach(card=>{const match=card.dataset.option?matchesOption(JSON.parse(card.dataset.option),filters):!active;card.hidden=!match;shown ||= match;if(match&&card.dataset.option)count++;});week.hidden=!shown;});
    archive.querySelector('.archive-count').textContent=`${count} ${count===1?'edition':'editions'}${active?' match':''}`;archive.querySelector('.archive-empty').hidden=count!==0;
  };form.addEventListener('submit',e=>e.preventDefault());form.addEventListener('input',run);form.addEventListener('reset',()=>setTimeout(run,0));run();
}
