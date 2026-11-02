# Loblolly & Logit — Reading Architecture & Economic Hinge

**Status:** Review-only design branch. Neither production merge nor deployment is authorized yet. Preserve the published edition's original scholarship, accepted identity, Heron, Commonplace/Keep, Field Notes, and publisher schedule.

## Proposed reading structure

1. **Chapter opening:** existing reading number, eyebrow, article title and evidence status; a quiet horizontal rule resolves the heading.
2. **Lead finding:** full-width but controlled typographic measure; bottom separator with a short copper signature, without surrounding the paragraph with a card.
3. **Continuous argument:** research design / why it matters / economic interpretation and any original figures appear sequentially in one principal reading column. No permanent side-by-side prose and Research Notebook.
4. **The Economic Hinge:** **new**, article-specific editorial diagram in three stages: Initiating change → Transmission → Economic margin. It uses written, source-grounded interpretations for each of 30 archived readings and is clearly marked as an *interpretive pathway, not an identified causal diagram*. Evidence-type status is displayed next to the heading. The horizontal arrangement collapses to a vertical register on smaller screens.
5. **Evidence register:** original *What the evidence does—and does not—say* on the left; original *Research Notebook* on the right, with both top edges aligned. The research note is not edited. Heron's existing creation of a `.margin` wrapper places it in the RN column when present.
6. **Sources:** original citations and links follow as a distinct full-width section.

This is **not** a new permanent third sidebar and does not wrap every article in a heavy card. The outer right rule is continuous for the five-readings area, while mirrored copper tassels at both the top and bottom reinforce that page boundary. The right tassels are deliberately larger than the left.

## Two other layout directions worth comparing visually

- **Offset sequential:** same content structure, but the economic interpretation is inset by one modest editorial measure so the main column has more visual movement. Easier to overdesign; not implemented.
- **Reading/exchange:** analysis remains single-column, while the Evidence Register expands into a more conversational typographic pair with the limitations and Research Notebook using contrasting heading sizes. Could benefit from extra breathing room at narrower laptop widths; not implemented.

**Recommendation:** Evaluate the implemented continuous-argument format first. It gives the scholarship its own readable line length, opens the full width for the new Economic Hinge, and reserves side-by-side composition only for two elements that actually belong in a dialogue: the limitations and research agenda.

## Mechanism content integrity

`weekly-economics-environment/economic-hinge.cjs` provides authored, non-numerical three-stage outlines keyed by reading ID, plus status qualifiers. The material is interpretive and based on the issue's own authored claims. It is **not a statistical graph, causal estimate, or substitute for source citations**. Recheck wording during editorial acceptance. Do not insert a single generic icon or a recycled general summary across the 30 readings.

Future issue creation uses an explicit fallback that repeats abbreviated, exact authored source excerpts when editorial mapping is missing. The fallback is labeled for review; it never generates unstated quantitative claims, calls an external service, delays publication, or blocks the journal. Maintain per-issue authored mappings as part of normal editorial preparation.

## Preservation and technical safeguards

- Original authored paragraphs, section headings, figures, citations, article identifiers, issue metadata, and Research Notebook prose preserved. Structural reflow is handled during publication through `editorial-folio.cjs`, with a persistent `data-reading-layout="2"` marker for retry stability.
- Historical review shows 30-for-30 equality of scholarly records after excluding the separately attributable new Economic Hinge text.
- The accepted left tapered spine remains but gains a mirrored copper footer; the right continuous border gets visually larger matching copper terminals. No change to header/site identity or calendar.
- CSS uses existing day/night variables; the Evidence Register stacks below 900px; the new mechanism diagram stacks at mobile widths; print omits the floating perimeter.
- Heron uses `grid.querySelector('.research-note')`, `note.before(col); col.append(note)`; the nested `.evidence-pair > .margin` receives the same grid location as the original Research Notebook. Its control behavior and script are unchanged. Real browser validation remains necessary.
- Keep controls are unchanged, and the decorative border is `pointer-events:none`.

## Test evidence

In isolated JavaScript execution, existing `test_editorial_folio.cjs` assertions passed (159) and revised `test_editorial_rail.cjs` assertions passed (102). The new `test_economic_hinge.cjs` suite passed 400 checks. The tests were executed with source read from connected GitHub and mocked read-only filesystem / Git history sources; they were **not executed through the repository's actual Node command**, and no browser screenshots or device testing are claimed.

Before release, run the real Node test suites, production build, and visual checks at desktop 1704 / 1512 / 1440 / 1280 / 1180, tablet 820, phone 393; in light/night and Glance/print. Test five current readings, a future edition, all figure and funding illustrations, RN presence, the actual Heron when expanded and dismissed, and Keep controls. Inspect both the upper and lower orange tassels across the *entire* five-reading scroll. Verify right-edge clipping and dynamic column widths, including narrow laptop states.

## Approval gate

Do not merge this PR solely on source-level success. Review the full-page layout and read the new Economic Hinge copy—especially evidence qualifiers and prospective policy claims—before accepting it as published editorial content.
