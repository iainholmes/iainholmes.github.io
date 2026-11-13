# Loblolly & Logit typography

Ectros Regular is publication identity only: the masthead, issue folio and closing wordmark use `--editorial-title`. Self-hosted asset: `fonts/Ectros-Regular.ttf`.

Latin Modern Roman Dunhill Regular supplies edition `.hero h1`, content-selection `.overview-item h3` and full article `.entry h2` titles. Edition titles use normal editorial Title Case. These structural classes inherit the correct face in every edition. Keep a single canonical article title in editorial Title Case in the overview and article heading; generated Field Notes, Commonplace and hub representations read those headings. Primary article titles are upright, with synthetic emphasis disabled. The self-hosted Dunhill Oblique face is available only for selective secondary editorial treatment. Self-hosted title assets: `fonts/LMRomanDunhill-Regular.otf` and `fonts/LMRomanDunhill-Oblique.otf`. Keep these structural classes for new editions. Do not place Menor in body text, controls, metadata, Field Register, Heron notes or general section headings. The cumulative notebook uses Menor for its concept headlines and Ectros for its publication wordmark.

Body retains Source Serif 4. Generic apparatus, metadata and controls use Instrument Sans; editorial/display faces remain publication-specific. Verify computed families, loaded fonts and wrapping at desktop, 393px, 320px and landscape widths after adding new content. Do not rely on a locally installed font: CSS sources are URLs only.

# Notebook maintenance

`notebook/index.html` is publication-wide, with stable concept fragment IDs. Update the existing canonical entry when revisiting a concept; append direct reading links to the matching edition group in the appearance register and change “Last revisited” to that edition’s date. Add a new entry only for a distinct idea. Edition `.knowledge` sections are compact previews linking to those stable entries. Link 2–4 recurring concepts in the prose of `.synthesis`, retaining its editorial argument.

# Heron editorial maintenance

Review all five readings for L&L’s occasional methodological companion. Select up to two interventions where a definition, identification question, counterfactual, economic intuition or evidence caveat needs a distinct, source-reviewed clarification. Silence is valid. Write a compact note for the passage, with at most one sketch or existing-figure annotation. The renderer prefers `visual` over a legacy `diagram`. Link to the relevant notebook entry where one exists. Each supported layout uses the static perch and in-flow note within the targeted reading.

# Reading anchors and mobile notes

Article IDs remain stable semantic anchors. The toolbar’s measured height and safe-area top inset supply `--ll-anchor-top`, including 16px of breathing room. The root scroll padding owns this offset; articles have no additional scroll margin. Delegated article links use the same route for initial, repeated and history navigation. Keep future article IDs unique.

Below 1180px, the single-column article grid removes the legacy relative top offset from ordinary research notes. Hidden Heron perches consume no flex gap; visible static labels retain a 44px target. Article padding and the 34px prose-to-note gap remain intact. Desktop margins are unchanged.

Heron types use: A Question, A Definition, In Plain Terms, On Method, A Caution, A Sketch.


## Notebook companion-volume markup

The notebook is authored directly in `notebook/index.html`; preparation validates it read-only and never regenerates it. Preserve the accepted Concept Index. Each new concept uses the existing `.concept-heading` (sequential `.concept-number` and permanent `h2` ID), `.concept-body` (unchanged `.canonical` definition, then `.concept-analysis` containing labelled `.application` and `.caution` sections), `.seen` register, and `.concept-nav` return link to `#concept-index`. Reuse the adjacent entry's semantic structure with unique heading IDs. Append the corresponding index link in the same order. Numbering is the actual section sequence, not a second index scheme.

Each historical appearance is one chronological `<li class="appearance" data-edition="YYYY-MM-DD">` inside `.appearance-register`. Its `.appearance-edition` contains a plain `.edition-folio` paragraph (`No. 00X · <time datetime="YYYY-MM-DD">D Month YYYY</time>`) and a plain `.edition-title` paragraph matching the canonical edition's `data-title`. Only `.appearance-readings` contains links: one `<li data-kind="reading"><a href="../#PERMANENT-READING-ID">Existing editorial reference label</a></li>` per relevant reading. Preserve every prior label, destination and edition association. Multiple readings share their edition group. A genuinely relevant synthesis reference uses `data-kind="synthesis"` and an explicit `<span class="reference-kind">Synthesis</span>` before its direct link; never label it as a research article. Do not restore whole-edition links or create appearances to fill the layout.

The `.revisited` paragraph reads `Last revisited · <time datetime="YYYY-MM-DD">D Month YYYY</time>` and follows the newest supported reading or synthesis reference. No hand-maintained appearance counts are displayed. Additional groups, longer labels and new concepts inherit the existing responsive styles without layout variants or JavaScript. Run the read-only validator and notebook tests before publication; wrong edition metadata, ungrouped references, missing targets, duplicate appearances and mislabelled synthesis fail before preparation writes artifacts.
