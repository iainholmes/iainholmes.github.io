// Only a dedicated domain/product-restricted TomTom BROWSER key belongs in apiKey.
// Stay on the no-payment Freemium plan. Never configure an unrestricted/private key.
// Account setup and restrictions: /rupert/_tools/LIVE-TRAFFIC.md.
export const trafficConfig = Object.freeze({
  provider: 'tomtom',
  apiKey: '',
  // Retained for the inactive Mapbox adapter; do not configure it for this release.
  publicToken: '',
  allowedOrigins: ['https://iainholmes.github.io'],
});
