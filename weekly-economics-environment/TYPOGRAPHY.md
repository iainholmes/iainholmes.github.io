# Loblolly & Logit typography

Ectros Regular is publication identity only: the masthead and closing wordmark use `--editorial-title`. Self-hosted asset: `fonts/Ectros-Regular.ttf`.

Latin Modern Roman Dunhill Regular supplies edition `.hero h1`, content-selection `.overview-item h3` and full article `.entry h2` titles. Edition titles use normal editorial Title Case. These structural classes inherit the correct face in every edition. Keep a single canonical article title in editorial Title Case in the overview and article heading; generated Field Notes, Commonplace and hub representations read those headings. Primary article titles are upright, with synthetic emphasis disabled. The self-hosted Dunhill Oblique face is available only for selective secondary editorial treatment. Self-hosted title assets: `fonts/LMRomanDunhill-Regular.otf` and `fonts/LMRomanDunhill-Oblique.otf`. Keep these structural classes for new editions. Do not place Menor in body text, controls, metadata, Field Register, Heron notes or general section headings. The cumulative notebook uses Menor for its concept headlines and Ectros for its publication wordmark.

Body retains Source Serif 4. Generic apparatus, metadata and controls use Fahkwang; editorial/display faces remain publication-specific. Verify computed families, loaded fonts and wrapping at desktop, 393px, 320px and landscape widths after adding new content. Do not rely on a locally installed font: CSS sources are URLs only.

# Notebook maintenance

`notebook/index.html` is publication-wide, with stable concept fragment IDs. Update the existing canonical entry when revisiting a concept; add edition/article backlinks to “Seen in” and change “Last revisited” to that edition’s date. Add a new entry only for a distinct idea. Edition `.knowledge` sections are compact previews linking to those stable entries. Link 2–4 recurring concepts in the prose of `.synthesis`, retaining its editorial argument.

# Heron editorial maintenance

L&L’s occasional methodological margin editor usually has 2–3 interventions per issue, maximum 4. Write 50–100 words that clarify a definition, identification, counterfactual, economic intuition or evidence caveat. Offer at most one compact sketch or existing-figure annotation; the renderer prefers `visual` over a legacy `diagram`. Use the notebook entry as the deeper link. The lifecycle is unseen → arrive → perched → optional note → depart → label-only. Only the large desktop margin permits a 1.4-second flight. Mobile and reduced motion use a static perch. Labels survive departure; reopening does not repeat a flight. New triggers wait for departure, and scrolling never interrupts flight.

# Reading anchors and mobile notes

Article IDs remain stable semantic anchors. The toolbar’s measured height and safe-area top inset supply `--ll-anchor-top`, including 16px of breathing room. The root scroll padding owns this offset; articles have no additional scroll margin. Delegated article links use the same route for initial, repeated and history navigation. Keep future article IDs unique.

Below 1180px, the single-column article grid removes the legacy relative top offset from ordinary research notes. Hidden Heron perches consume no flex gap; visible static labels retain a 44px target. Article padding and the 34px prose-to-note gap remain intact. Desktop margins are unchanged.

Heron types use: A Question, A Definition, In Plain Terms, On Method, A Caution, A Sketch.
