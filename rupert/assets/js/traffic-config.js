// Only a dedicated, URL-restricted Mapbox PUBLIC token belongs here. Never use a secret token.
// Account setup and restrictions: /rupert/_tools/LIVE-TRAFFIC.md.
export const trafficConfig = Object.freeze({
  provider: 'mapbox',
  publicToken: '',
  allowedOrigins: ['https://iainholmes.github.io'],
});
