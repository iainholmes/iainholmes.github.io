// One-use, same-tab frontispiece handoff. Navigation never writes a dismissal.
export const VEIL_ARRIVAL_KEY = 'rupert-frontispiece-arrival';

export function saveVeilArrival(veil, destination, manifest, photos) {
  const snapshot = node => node.nodeType === 3 ? node.textContent : {
    tag: node.localName,
    attrs: [...node.attributes].map(a => [a.name,
      ['href','src'].includes(a.name) ? new URL(a.value,location.href).href :
      a.name === 'srcset' ? a.value.split(',').map(s => { const [url,size]=s.trim().split(/\s+/);return `${new URL(url,location.href).href} ${size}`; }).join(', ') : a.value
    ]),
    children: [...node.childNodes].filter(n => n.nodeType === 1 || n.nodeType === 3).map(snapshot)
  };
  try {
    sessionStorage.setItem(VEIL_ARRIVAL_KEY, JSON.stringify({
      target: destination.pathname + destination.search,
      expires: Date.now() + 15000,
      tree: snapshot(veil), manifest, photos
    }));
  } catch { /* Navigation still works when session storage is unavailable. */ }
}

// Inlined by the canonical builder immediately after <body>, before first paint.
// Rebuild a restricted DOM tree rather than interpreting stored HTML.
export function veilArrivalBoot() {
  let veil;
  try {
    const key = 'rupert-frontispiece-arrival', raw = sessionStorage.getItem(key);
    sessionStorage.removeItem(key);
    if (!raw || raw.length > 250000) return;
    const arrival = JSON.parse(raw);
    if (arrival.target !== location.pathname + location.search || !Number.isFinite(arrival.expires) || arrival.expires < Date.now() || arrival.expires > Date.now() + 15000) return;
    const tags = new Set(['div','span','small','strong','sup','section','h2','a','img','time','footer','p','dl','dt','dd','svg','path','circle','line']);
    const attrs = new Set(['class','tabindex','role','aria-modal','aria-label','aria-hidden','href','src','srcset','sizes','alt','loading','decoding','fetchpriority','width','height','style','viewBox','fill','stroke','stroke-width','stroke-linecap','stroke-linejoin','d','cx','cy','r','x1','x2','y1','y2','datetime']);
    const make = (tree, depth = 0, svg = false) => {
      if (depth > 12) throw Error('Invalid frontispiece');
      if (typeof tree === 'string') return document.createTextNode(tree);
      if (!tags.has(tree.tag) || !Array.isArray(tree.children) || !Array.isArray(tree.attrs)) throw Error('Invalid frontispiece');
      svg ||= tree.tag === 'svg';
      const node = svg ? document.createElementNS('http://www.w3.org/2000/svg', tree.tag) : document.createElement(tree.tag);
      for (const [name, value] of tree.attrs) {
        if (!attrs.has(name)) continue;
        if (['href','src'].includes(name) && new URL(value, location.href).origin !== location.origin) continue;
        // Only the image-position custom properties are needed from artwork markup.
        if (name === 'style' && !/^(?:--pos-(?:32|45|21):\s*[\d.% ]+;)+$/.test(value)) continue;
        if (name === 'srcset' && value.split(',').some(s => new URL(s.trim().split(/\s+/)[0], location.href).origin !== location.origin)) continue;
        node.setAttribute(name, value);
      }
      node.append(...tree.children.map(child => make(child, depth + 1, svg)));
      return node;
    };
    veil = make(arrival.tree);
    if (veil.className !== 'atlas-veil') return;
    document.body.append(veil);
    document.documentElement.classList.add('veil-active');
    window.__atlasVeilArrival = { veil, manifest: arrival.manifest, photos: arrival.photos };
  } catch {
    veil?.remove();
    document.documentElement.classList.remove('veil-active');
  }
}
