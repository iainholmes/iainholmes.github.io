import { validPoint } from './routing.js';

// No provider request occurs until the reader follows a link. Waze's supported deep
// link accepts only a destination; label its device-location origin explicitly.
export function navigationLinks(from, to) {
  if (!validPoint(from) || !validPoint(to)) return [];
  const origin = `${from.lat},${from.lng}`, destination = `${to.lat},${to.lng}`;
  const link = (label, base, params) => ({ label, href: base + '?' + new URLSearchParams(params) });
  return [
    link('Apple Maps', 'https://maps.apple.com/', { saddr: origin, daddr: destination, dirflg: 'd' }),
    link('Google Maps', 'https://www.google.com/maps/dir/', { api: '1', origin, destination, travelmode: 'driving', dir_action: 'navigate' }),
    link('Waze · current location', 'https://waze.com/ul', { ll: destination, navigate: 'yes' }),
  ];
}
