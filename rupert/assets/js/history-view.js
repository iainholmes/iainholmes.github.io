// Browser-only indicators. Never put personal state into generated HTML, URLs or network requests.
import { readLocalHistory, LOG_KEY, LOG_CHANGED } from './core/field-log.js';
import { personalHistory, editionHistory } from './core/experience-history.js';
const base = document.body.dataset.base || '';
let catalog, pending;
export async function historyCatalog({ refresh = false } = {}) {
  if (pending) return pending;
  if (catalog && !refresh) return catalog;
  const get = async path => { const r = await fetch(base + path, { cache: 'no-cache' }); if (!r.ok) throw Error('Atlas history catalog unavailable.'); return r.json(); };
  pending = Promise.all([get('data/places.json'),get('data/editions/index.json')]).then(([places,manifest]) => (catalog = { places, manifest })).catch(error => { if(catalog)return catalog; throw error; }).finally(() => { pending = null; });
  return pending;
}
export async function refreshArchiveHistory() {
  if (!document.querySelector('.archive')) return;
  try {
    const data = await historyCatalog({refresh:true}), local = readLocalHistory(), history = personalHistory(local.entries, data);
    for (const card of document.querySelectorAll('.archive-card[data-edition]')) {
      const edition = data.manifest.editions.find(e => e.id === card.dataset.edition);
      const note = card.querySelector('.personal-history');
      if (!edition || !local.available) { note?.remove(); delete card.dataset.history; continue; }
      const state = editionHistory(edition, history);
      card.dataset.history = state.state;
      if (state.state === 'uncompleted') { note?.remove(); continue; }
      const label = note || document.createElement('p'); label.className = 'personal-history'; label.textContent = state.label;
      if (!note) card.querySelector('h3').parentElement.append(label);
    }
  } catch { /* No invented completion state when public catalog/storage is unavailable. */ }
}
const resume = () => { if (document.querySelector('.archive')) historyCatalog({refresh:true}).then(refreshArchiveHistory).catch(()=>refreshArchiveHistory()); };
window.addEventListener(LOG_CHANGED,refreshArchiveHistory);
window.addEventListener('storage',e=>{if(e.key===LOG_KEY||e.key===null)refreshArchiveHistory();});
window.addEventListener('pageshow',resume);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)resume();});
