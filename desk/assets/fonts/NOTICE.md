# Desk font provenance

## Latin Modern Roman Dunhill

The two served OpenType files are the authentic **Latin Modern Roman Dunhill 10 Regular** and **10 Oblique** faces, internal PostScript names `LMRomanDunh10-Regular` and `LMRomanDunh10-Oblique`, version 1.106, weight 400. No font outlines, names, metrics or weights were modified. No synthetic bold or italic is used.

Copyright 2003, 2008 B. Jackowski and J. M. Nowacki, on behalf of TeX users groups. Original design derives from Donald E. Knuth's Computer Modern. Both are distributed under the **GUST Font License**, incorporating LPPL 1.3c or later.

Exact local sources in the existing repository:

- `weekly-economics-environment/fonts/LMRomanDunhill-Regular.otf` → `lmromandunh10-regular.otf`
- `weekly-economics-environment/fonts/LMRomanDunhill-Oblique.otf` → `lmromandunh10-oblique.otf`

This directory contains only the two unmodified font binaries needed by Desk, not the whole Latin Modern package. The distribution selection is documented here; the fonts themselves are unchanged. For the complete original work, documentation, sources and other faces, obtain the Latin Modern distribution from:

- https://www.gust.org.pl/projects/e-foundry/latin-modern/
- https://ctan.org/pkg/lm
- https://mirrors.ctan.org/fonts/lm.zip

`GUST-FONT-LICENSE.txt`, `LPPL-1.3c.txt`, `Latin-Modern-README.txt` and `Latin-Modern-MANIFEST.txt` accompany the fonts. The license came from https://www.gust.org.pl/projects/e-foundry/licenses/GUST-FONT-LICENSE.txt; LPPL from https://www.latex-project.org/lppl/lppl-1-3c.txt. The README and complete package manifest came from the CTAN mirror at https://mirrors.mit.edu/CTAN/fonts/lm/ (manifest: `doc/fonts/lm/MANIFEST-Latin-Modern.TXT`). Line endings and trailing whitespace in these text documents were normalized, with their content preserved. The upstream README describes the full package, not Desk's subset. Desk does not imply upstream authors provide support for this site.

## Archivo italic wordmark

`archivo-italic.woff` comes from the Archivo project's genuine italic variable font, via Google Fonts:

https://github.com/google/fonts/blob/main/ofl/archivo/Archivo-Italic%5Bwdth%2Cwght%5D.ttf

Copyright 2020 The Archivo Project Authors (https://github.com/Omnibus-Type/Archivo). SIL Open Font License 1.1, included as `OFL-Archivo.txt`. The width axis is fixed at its normal value (100), the 100–900 weight axis is retained, and the font is losslessly packaged as WOFF. The existing Archivo family and weight 650 are retained for the lowercase italic `desk.` wordmark. The icon uses outlines from this same face; it does not depend on device font availability. Asset hashes are in `SOURCE-REVISIONS.json`.

## Canonical artwork

The cover SVGs remain byte-for-byte copies of their archived sources. Their own font-family attributes remain intact. Ectros, STIX Two Text and Instrument Serif continue to serve the cover lettering; interface text surrounding those covers uses Dunhill. Previously committed source fonts and their licenses remain available, though unused interface faces are no longer declared or requested by the stylesheet.
