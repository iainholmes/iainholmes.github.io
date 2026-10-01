# Loblolly & Logit typography

Ectros Regular is publication identity only: the masthead and closing wordmark use `--editorial-title`. Self-hosted asset: `fonts/Ectros-Regular.ttf`.

Menor Regular is the dedicated secondary headline face, exposed as `--headline` in `refinement.css`. Edition `.hero h1`, content-selection `.overview-item h3`, and full article `.entry h2` automatically inherit it in every edition. Self-hosted asset: `fonts/Menor-Regular.otf`, supplied through Font Book. Keep these structural classes for new editions. Do not place Menor in body text, controls, metadata, Field Register, Heron notes or general section headings. The cumulative notebook uses Menor for its concept headlines and Ectros for its publication wordmark.

Body and apparatus retain Source Serif 4 and IBM Plex Sans Condensed. Verify computed families, loaded fonts and wrapping at desktop, 393px, 320px and landscape widths after adding new content. Do not rely on a locally installed font: CSS sources are URLs only.

# Notebook maintenance

`notebook/index.html` is publication-wide, with stable concept fragment IDs. Update the existing canonical entry when revisiting a concept; add edition/article backlinks to “Seen in” and change “Last revisited” to that edition’s date. Add a new entry only for a distinct idea. Edition `.knowledge` sections are compact previews linking to those stable entries. Link 2–4 recurring concepts in the prose of `.synthesis`, retaining its editorial argument.

# Heron editorial maintenance

L&L’s occasional methodological margin editor usually has 2–3 interventions per issue, maximum 4. Write 50–100 words that clarify a definition, identification, counterfactual, economic intuition or evidence caveat. Offer at most one compact sketch or existing-figure annotation; the renderer prefers `visual` over a legacy `diagram`. Use the notebook entry as the deeper link. The lifecycle is unseen → arrive → perched → optional note → depart → label-only. Only the large desktop margin permits a 1.4-second flight. Mobile and reduced motion use a static perch. Labels survive departure; reopening does not repeat a flight. New triggers wait for departure, and scrolling never interrupts flight.
