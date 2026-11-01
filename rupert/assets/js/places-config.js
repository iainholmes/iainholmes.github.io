// A separate, product-restricted **Search** browser key is required to enable
// TomTom POI suggestions. NEVER reuse the existing Routing/Copyrights-only
// traffic key or add an unrestricted/private token. Stay on the no-payment
// free tier and confirm Search API entitlement and attribution before enabling.
export const placesConfig=Object.freeze({
  provider:'tomtom-search',
  apiKey:'',
  allowedOrigins:['https://iainholmes.github.io'],
});
