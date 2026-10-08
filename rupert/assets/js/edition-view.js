// Enhance only the Full Edition's Drive fact. Home remains device-local; reuse the Atlas OSRM router.
import { validPoint, drivingRoute } from './core/routing.js';
import { isReleased } from './core/editions.js';
import { renderEdition } from './core/render.js';

const article = document.querySelector('.edition[data-edition]');
if (article) {
  const base = document.body.dataset.base || '';
  const drive = article.querySelector('.edition-drive');
  const fallback = drive?.innerHTML;
  let controller, currentKey = '', completedAt = 0, busy = false;
  const get = async path => { const r = await fetch(base + path, { cache: 'no-cache' }); if (!r.ok) throw Error('Data unavailable.'); return r.json(); };
  const readHome = () => { try { const point = JSON.parse(localStorage.getItem('rupert-location-v1'))?.point; return validPoint(point) ? point : null; } catch { return null; } };
  const restore = () => { if (drive) drive.innerHTML = fallback; };
  async function refreshDrive() {
    if (!drive) return;
    const home = readHome(), key = home ? JSON.stringify(home) : '';
    if (!home) { controller?.abort(); currentKey = ''; completedAt = 0; restore(); return; }
    if (key === currentKey && (controller || Date.now() - completedAt < 300000)) return;
    controller?.abort(); const request = new AbortController(); controller = request; currentKey = key;
    restore();
    const timer = setTimeout(() => request.abort(), 15000);
    try {
      const places = await get('data/places.json');
      const destination = places.places.find(p => p.id === drive.dataset.place)?.access;
      const result = await drivingRoute(home, destination, { signal: request.signal });
      if (controller !== request || key !== JSON.stringify(readHome())) return;
      const label = document.createElement('span'); label.className = 'fact-note';
      label.textContent = `from saved Home · ${result.miles} mi · OSRM estimate, traffic not included`;
      drive.replaceChildren(document.createTextNode(`${result.minutes} min`), label);
    } catch {
      if (controller === request) { restore(); const note = document.createElement('span'); note.className = 'fact-note'; note.textContent = 'Home routing unavailable · showing reference estimate'; drive.append(note); }
    } finally { clearTimeout(timer); if (controller === request) { controller = null; completedAt = Date.now(); } }
  }
  // A forecast correction with the same edition ID must update a resumed page as well as a reload.
  let revision;
  async function refreshConditions() {
    if (busy) return; busy = true;
    try {
      const manifest = await get('data/editions/index.json');
      const record = manifest.editions.find(e => e.id === article.dataset.edition && isReleased(e));
      if (!record || revision === manifest.revision) return;
      const [ed, places, photos] = await Promise.all([get(record.path), get('data/places.json'), get('data/photos.json')]);
      const template = document.createElement('template'); template.innerHTML = renderEdition(ed, { base, places, photos, now: new Date() });
      const updated = template.content.querySelector('.ed-conditions');
      if (updated) article.querySelector('.ed-conditions')?.replaceWith(updated);
      revision = manifest.revision;
    } catch { /* Keep the dated snapshot, never invent a current forecast. */ }
    finally { busy = false; }
  }
  const refresh = () => { refreshDrive(); refreshConditions(); };
  refresh();
  window.addEventListener('storage', e => { if (e.key === 'rupert-location-v1' || e.key === null) refreshDrive(); });
  window.addEventListener('pageshow', refresh);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
  setInterval(() => { if (!document.hidden) refreshConditions(); }, 60000);
}
