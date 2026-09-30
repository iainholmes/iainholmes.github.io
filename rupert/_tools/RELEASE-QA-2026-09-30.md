# Rupert Atlas release — 30 September 2026

Reviewed in Chrome with desktop (1366 × 900 and 1920 × 1200), tablet (768 × 1024), and phone (390 × 844) viewport emulation. This release was not tested on physical iPhone hardware.

- Actual rendered fonts verified with browser CSS font inspection: VELENOR-Regular for the Atlas heading; LMRoman10-Regular for the banner context, kicker and directory names.
- Desktop map and directory measured 927.03 / 309.02 px wide, both 648 px tall at 1366 × 900. At 1920 × 1200 map height caps at 860 px. Phone document width equals viewport width (390 px); Atlas title 56 px, Travel/Field Log 54 px. Tablet Travel title 68 px.
- Map selection, directory and dossier synchronized; supporting map labels use the self-hosted reading font. Background tile labels remain provider-owned.
- Travel automatic postcard appears on Save without uploading artwork or requesting a route. Engraved Labrador asset reviewed against user-supplied print references. Temporary QA plans opened, individually deleted, and Clear All tested with only QA data. Existing backup and routing cases pass automated tests. Rendered backup import could not be exercised because the Chrome extension file-upload permission is disabled.
- Field Log temporary memory created, edited, exported and removed. The empty state restored. Backup round trips and invalid imports pass automated tests.
- Archive retains both the withdrawn Cox Mountain edition and Riverwalk revision. Search and Clear filters checked. Full Edition reading layout, new artwork and fetch activation checked.
- Town of Hillsborough Riverwalk, Gold Park, fenced dog park, storm closure guidance and October 4 event notice reviewed. NWS Hillsborough forecast reviewed at its actual September 30 update. Sources, access and forecast timestamps are recorded in the edition. Refresh notices and weather before walking.
- Build, 36 tests, 9 corrective assertions, 12 replacement assertions and public/privacy audit pass. Existing approximate-pin and legacy-training warnings remain.
- JPEGs are metadata-free. The transparent Travel PNG permits only pixel chunks; itinerary composition stays in the browser. No private originals or itinerary data enter publication.
- Future replacement tooling selects from an editor-supplied queue and official evidence; the static site does not crawl notices or generate unattended recommendations.
