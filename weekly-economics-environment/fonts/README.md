# Loblolly & Logit title font

Ectros-Regular.ttf is the user-provided Ectros asset installed in Font Book’s My Fonts collection, copied from ~/Library/Fonts/Ectros-PVeR2.ttf on 30 September 2026. Internal family/full name: Ectros; style: Regular; PostScript name: Ectros-Regular. The original TrueType file is preserved.

The page self-hosts and preloads this asset as font/ttf, with format("truetype"), weight 400 and normal style. The --editorial-title token now belongs to .mh-title h1 and .closing-wordmark; edition titles use the separate Menor --headline token, while article headlines use Latin Modern Roman Dunhill Regular, including future issues that reuse the edition markup. The asset lacks U+2019 (curly apostrophe); that character uses the fallback family if it appears in publication identity. The supplied font has one regular face; existing title emphasis rules are preserved.

Body text, navigation, metadata, folios, controls, captions, and heron notes retain their original font families. No other publication uses this asset. The previous Multima Strong preload and declaration are replaced for this publication.

Menor Regular: `Menor-Regular.otf`, copied from the user-supplied Font Book font Menor-LV6XG.otf. Used exclusively for secondary publication headlines through `--headline`; see ../TYPOGRAPHY.md. The site loads this file by URL rather than a system-local font.

Latin Modern Roman Dunhill Regular and Oblique are copied from the user’s installed `lmromandunh10-regular.otf` and `lmromandunh10-oblique.otf`. CSS self-hosts both faces as `LM Roman Dunhill`; primary overview/article headings request weight 400 and normal style. The browser’s actual rendered font is `LMRomanDunh10-Regular`. Menor remains on edition titles and notebook concepts.
