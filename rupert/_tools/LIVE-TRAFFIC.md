# Atlas zero-cost traffic — 3 October 2026

TomTom is the first viable no-payment candidate. Orbis v3 integration is prepared and tested with synthetic responses. Activation and a real production-origin request await an owner-created restricted browser key. Production contains no key and stays on OSRM. The existing Mapbox adapter/UI/logo remain available but inactive; do not configure Mapbox or add billing.

## Verified plan and security

[Current pricing](https://docs.tomtom.com/pricing) advertises no credit card, an indefinite free plan and **20,000 Routing requests/month**, including Orbis. Its pricing FAQ says free allowances are shared across the account's keys per API; exhaustion blocks requests until the next cycle. [Platform FAQ](https://docs.tomtom.com/platform/documentation/status-and-support/faqs) specifies HTTP 429. Prepaid credits require an explicit purchase; recurring payment is a prepaid-plan option. Stay on **Freemium / Start building**, without payment details, credits, paid upgrades or recurring payments. An abused key can exhaust free access but does not silently generate an overage bill on this unpaid plan. Atlas handles 429 without automatic retries and returns to OSRM.

Traffic Incident Details has 2,500 free requests/month and Flow Segment Data 20,000; neither is used. Each refresh makes **one Routing request and one Copyrights request required by the terms**. Copyrights is a Map Display non-tile endpoint. Check its free entitlement in MyTomTom before activation; do not upgrade if a required entitlement is unavailable. No provider tiles, SDK, separate Traffic API, server or paid proxy is introduced.

[Browser-key guidance](https://docs.tomtom.com/maps-sdk-js/guides/security/where-your-api-key-runs) explicitly permits inspectable browser keys with domain/product restrictions, a dedicated application key and usage monitoring. [Key management](https://docs.tomtom.com/platform/documentation/api-best-practices/api-key-management-best-practices) documents CORS whitelisting/product selection. Its whitelist screenshot explicitly requires a **bare domain**, with no scheme, port or path: **iainholmes.github.io**. No wildcard or `/rupert/` path is appropriate. Atlas separately checks the exact application origin `https://iainholmes.github.io`. These restrictions limit browser reuse, not non-browser abuse; monitor per-key analytics and rotate/revoke if needed. Custom QPS controls may require an enterprise contract. The no-payment account's blocked allowance, rather than fake secrecy, protects against overage charges.

## Terms and attribution

[Portal terms](https://docs.tomtom.com/legal/terms-and-conditions), including their client-rendered text, were reviewed. Fees apply if applicable to the selected subscription; the platform FAQ permits commercial applications on free access. Atlas is public **pre-trip route planning** under the registered Freemium subscription, not an internal-testing-only evaluation grant. It does not implement the excluded turn-by-turn Navigation Functionality: no device GPS, tracking, driving instructions or location-based rerouting. This is the basis for considering the personal consumer web application a permitted solution. The owner must accept the applicable free subscription terms during registration.

§12 requires end-user acceptance: explicit traffic opt-in now states agreement and links the [required end-user terms](https://www.tomtom.com/en-gb/legal/third-party-product-terms/). §17.3 requires Copyright API attribution for REST output. Atlas retrieves the full plain-text notice, escapes it, and displays it in **Home & Driving Routes → TomTom data credits**, alongside linked TomTom/OpenStreetMap credits next to the route. Attribution failure falls back to OSRM. Provider responses are not exported, persisted or HTTP-cached; the five-minute displayed route is not a result cache. The overlay does not modify the OpenStreetMap database.

## Current API and field mapping

[Orbis Routing v3 Calculate Route](https://docs.tomtom.com/routing-api/documentation/tomtom-orbis-maps/v3/calculate-route) uses POST `https://api.tomtom.com/maps/orbis/routing/routes/calculate`, version 3 and `TomTom-Api-Key` headers. The body contains only origin/destination GeoJSON points, car/fast routing and `traffic: live`; current-departure defaults apply. `Attributes` requests only `routes.summary,routes.legs.path,routes.sections.traffic`. [Copyrights v2](https://docs.tomtom.com/map-display-api/documentation/tomtom-orbis-maps/v2/copyrights/copyrights) is a coordinate-free GET. Keys are headers, never URL parameters; requests omit cookies, HTTP caching and full-page referrers.

| TomTom field | Atlas treatment |
|---|---|
| `summary.travelDurationInSeconds` | Genuine live/historical traffic-aware ETA |
| `summary.lengthInMeters` | Driving distance |
| `summary.trafficDelayDurationInSeconds` | Returned delay **vs free flow**, never “vs typical” |
| `legs[0].path` | Selected route geometry |
| `startPathIndex` / `endPathIndex` | Inclusive coordinate boundaries; line segments from start through end−1 |
| `delayMagnitude: minor` | Mild, warm amber |
| `delayMagnitude: moderate` | Moderate, orange |
| `delayMagnitude: major` | Heavy, muted red |
| `iconCategory: roadClosed` | Closure, dark red/dashed |
| Unknown/undefined/missing magnitude; unannotated gaps | Neutral unknown/dashed; absence does not establish clear traffic |
| `iconCategory`, `delayDurationInSeconds`, `eventId` | Factual route-local incidents/delay, deduplicated markers |

This API does not distinguish a separate severe category or report observed free-flow coverage of every road. Neither is invented. The existing full palette remains for Mapbox. No inferred speed ratios, typical duration, OSRM delay comparison or regional incident search is used. Invalid geometry/indexes reject the result; overlapping annotations preserve the more severe reported condition.

## Privacy and freshness

Traffic opt-in sends TomTom only Home/destination coordinates. TomTom also receives the client's IP, normal browser networking headers, site origin/referrer and dedicated application key. Copyrights sends no coordinates. No typed Home address, saved trips, cookies, analytics or persistent telemetry is added. Home stays locally saved; the control explains coordinate disclosure before opt-in.

The existing five-minute freshness policy is preserved: enable, endpoint change, explicit Refresh or returning to Atlas with stale traffic requests fresh data. No periodic polling. Expiry removes dark traffic treatment; failure/429 unchecks traffic, restores the light OSRM route and says **Live traffic temporarily unavailable · showing baseline estimate**. Reload/PWA starts OFF. Baseline wording remains **OSRM Estimate · Traffic Not Included**.

A quiet **Open Live Navigation** chooser beneath the map works independently of embedded traffic. [Apple Map Links](https://developer.apple.com/library/archive/featuredarticles/iPhoneURLScheme_Reference/MapLinks/MapLinks.html) and [Google Maps URLs](https://developers.google.com/maps/documentation/urls/get-started) receive Home/destination coordinates only after a click. [Waze Deep Links](https://developers.google.com/waze/deeplinks) accept a destination, not Home; its choice explicitly says **Waze · current location**. No API key or tracking parameter is required. External providers control their own live guidance.

## Exact owner setup

1. Register/sign in at [MyTomTom](https://my.tomtom.com/) on **Freemium / Start building**. No card is required. Do not add payment details, buy credits, top up or enable recurring payments.
2. Create a dedicated **Rupert Atlas traffic** key. Enable only **Routing API** (Orbis v3) and **Map Display API** (Copyrights v2). Disable unrelated products, including separate Traffic Flow/Incidents and Search. If narrower endpoint controls are offered, allow only Calculate Route and Copyrights. Confirm both free entitlements; a paid-only requirement blocks activation.
3. Enable domain whitelisting and enter exactly **`iainholmes.github.io`**. No scheme, path, port, wildcard or localhost. Save. Enable usage notifications if available and monitor per-key analytics.
4. Use GitHub's editor for [traffic-config.js](https://github.com/iainholmes/iainholmes.github.io/edit/master/rupert/assets/js/traffic-config.js). Put only this restricted **browser** key in `apiKey`. Leave `provider: 'tomtom'`, the production origin and empty Mapbox `publicToken` unchanged. The browser key is intentionally inspectable. Never enter an unrestricted/private credential or paste it into chat.
5. Tell Codex the restricted key is configured, without sending the key. The remaining release step is to rebuild the canonical import/cache versions (`npm --prefix rupert run build`), run test/check, deploy, and make a genuine production-origin request. A config-only edit without rebuilding can retain an older cached import graph.
6. Activation verification must observe Routing 200 and Copyrights 200 from the production origin, correct restricted-origin CORS, genuine ETA, reported section/unknown data and free-flow delay. Fixtures cannot prove account entitlements/CORS or real traffic availability. Do not publicly log credentials or private Home coordinates.

TomTom satisfied the first-candidate investigation; HERE/agency fallback was not needed. No account or billing changes were made.

## Validation of this preparation

- 466 source/adapter regression assertions; canonical build and validation passed. Existing advisory warnings about two approximate access pins and a training mission are unchanged.
- 316 TomTom browser assertions across 375×812, 390×844, 393×852, 402×874, 430×932, 844×390, 852×393, 1024×768 and 1440×1000, including standalone simulation. Tests cover segment colors, unknown gaps, route incidents, ETA/free-flow delay, endpoint changes, expiry/foreground/explicit refresh, provider failure/429, late aborted responses, reload, privacy and coordinate-only navigation.
- 103 browser assertions preserve the Mapbox adapter at portrait, landscape and desktop sizes. Existing Atlas browser suites passed 1,080 + 635 assertions, including natural veil lifecycle, published-tile navigation, This Week/footer, withdrawal/history, automatic baseline routing and saved Travel behavior. After correcting the navigation chooser’s desktop sticky-container placement, the representative 530-assertion Atlas suite passed again.
- Real MapLibre/OpenFreeMap rendering was used for traffic tests; TomTom/Mapbox/OSRM route responses were explicitly synthetic. Tests wait for rendered route features before snapshots. Portrait/landscape/desktop screenshots reviewed; map controls and route/place cards remain legible/non-overlapping.
- Existing CSS is byte-preserved with only navigation/credits rules appended. All 11 generated HTML pages differ only by canonical import graph/cache versions. Changes are under `/rupert/`; frozen sources and Periodicals are untouched. Both production credentials are empty; fixture keys are confined to unpublished test tools.
- A genuine TomTom production-origin request remains pending the owner's restricted key; no physical-device traffic observation is claimed.
