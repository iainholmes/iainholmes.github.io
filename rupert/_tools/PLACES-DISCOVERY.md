# The Atlas Travel — reliable activity discovery

## Current state (November 1, 2026)

The Rupert Atlas Travel page searches real OpenStreetMap POIs through public
Overpass instances. Those servers have returned HTTP 502, timeouts and temporary
rate limits during actual route planning; this must NOT be reported as "zero
activities". The user has repeatedly received no suggestions across long routes.

This release (updated after the November 1 editorial and NPS POI follow-up):
- Prioritizes **National Park Service public points of interest** (official
  mapped trailheads, overlooks, public visitor sites) near searched areas.
  These points are source-attributed, but are NOT verified entrance locations,
  open-now guarantees, or dog-permitted trails; consult park-specific rules.
- Suppresses branded chain-food recommendations and restaurants without mapped
  outdoor/dog-access evidence. User deliberately rejected the generic Google
  Maps search exit; it has been removed from Travel entirely.
- Separately pursues public OpenStreetMap leads for independent treats,
  cafés, markets and nearby local walks. Provider failures remain possible.
- Stops an automatic route failure from preventing the user's explicit town
  search, while still respecting genuine 429/406 service limits.
- Lets town searches continue when the dialog closes; keeps results in Build
  the Journey, and provides an opt-in external search/known-place fallback.
- Leaves published Directory data untouched. Every new suggestion is a lead,
  not a proven pet-friendly place.
- Adds code for the current TomTom Orbis Places Discover API but does NOT
  enable it with the existing TomTom Routing/Copyrights traffic browser key.

## Enabling TomTom Places responsibly

TomTom Places Search API Discover is a separate product from live traffic.
The traffic browser key is domain- and product-restricted and must not be
reused or have its restrictions silently expanded.

1. Confirm the owner's MyTomTom subscription is still the no-payment
   Freemium / Start building plan. The TomTom pricing page currently advertises
   a free monthly Discover allowance; check limits/terms in the actual account
   before proceeding. Do not enroll in paid plans, credits or billing.
2. Create a **different, dedicated browser key** permitted only for the TomTom
   Places Search API Discover product, restricted to the bare
   `iainholmes.github.io` domain. Do not add an unrestricted key or a private
   server credential to this static repository.
3. Verify the Search product's end-user terms, credits/copyright attribution
   and any required Copyright API response before showing live POI results.
   The draft adapter currently marks all pet access unverified. Confirm its
   limited display fields and privacy disclosure comply with the actual
   authorized product's usage terms.
4. Update `rupert/assets/js/places-config.js` with the new key and set
   `enabled:true` only after steps 1–3. Test one live query from the
   production origin before release. Never copy `traffic-config.js`'s key.
5. Check several towns (e.g. Boone, Asheville) and long-route representative
   areas. Test error codes 403/429, empty results, selected-place insertion,
   outbound credit links, the non-mutation of Atlas Directory records and
   request quota before treating this as production accepted.

The adapter is at `rupert/assets/js/core/tomtom-places.js`, using the current
Orbis v3 `POST /maps/orbis/places/discover` endpoint, with headers carrying
the dedicated key. It uses small topical batches (park, ice cream, café),
query-location constraints, and returns the same read-only activity shape as
the OpenStreetMap discovery function.

## Fallback and limits

With TomTom access disabled, public Overpass can remain unavailable.
No generic Google Maps search link is offered. When public discovery
returns no activity leads, the traveler can still add a named place through
Nominatim geographic confirmation and the existing **Review Trip Change**
flow. The NPS source and community POIs are different provenance tiers.
No place is invented or automatically labeled dog-friendly.

A successful code/mock test is not a verified public API result. Production
acceptance of reliable discovery REQUIRES live testing of the separately
authorized Search product.
