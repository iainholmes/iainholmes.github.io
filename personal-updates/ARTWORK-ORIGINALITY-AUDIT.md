# Workbook and L&L artwork audit — reconciled 24 October 2026

Informational audit reconciled against production master `edf28fa85a93c3462683aa8a00a86ee09bcd8c39` (27 Field Brief issues, 13 Workbook sets, five L&L editions). The interrupted implementation began at `baea324`, before L&L Issue 005. Its saved stash was recovered and applied on the October 23 publication commit. Historical artifacts remain authoritative, including all duplicates. No artwork is replaced by this maintenance change.

## Workbook history

All 13 frozen marks were compared by effective structural identity, central geometry without grid/folio/caption, and normalized color-independent silhouettes including rotations/reflections.

| Sets / dates | Effective structural identity | Finding |
| --- | --- | --- |
| 002 September 29; 003 September 30 | `workbook:legacy:identification` | Identical central illustration after removing surrounding metadata. |
| 004 October 1; 005 October 2; 006 October 5; 007 October 7 | `workbook:legacy:evidence` | One assignment diagram. 004/006 are exact section copies; 005/007 are exact plan copies. Section versus plan is a group rotation/scale, not a different structure. |
| 008 October 8; 013 October 23 | `workbook:quantile-bands` | Exact central illustration; same subject, composition, signature and phrase. Both are immutable. |

These are all duplicate effective-signature groups in the audited Workbook archive. The other five marks (001, 009, 010, 011, 012) have distinct effective structures. No additional pair reached the new archive-wide 0.90 or recent 0.86 silhouette threshold. The quantile-bands reuse occurred because the generator excluded only the last three compositions, allowing Set 008 to become eligible again for Set 013.

Set 008 had one explicitly authorized historical correction on October 8: its assignment diagram was replaced with the question-supported quantile-bands plate. That corrected pin is now immutable. The maintenance change does not reverse it or correct Set 013.

## L&L covers

All five covers (September 25; October 2, 9, 16, 23) have different effective identities and central geometry. No pair reached either similarity threshold. Legacy models do not all store explicit signatures: their subject/theme supplies the effective identity. `section`/`plan` would not create different identities for a repeated subject. Issue 003's burden transect, Issue 004's stratified gauge, and Issue 005's `loblolly:financing-transect` are frozen authored covers. Issue 005 is included in full-history comparisons, including a regression rejecting a renamed copy of its central geometry.

Before this change, the generic prospective fallback selected a subject and alternated section/rotated-plan, without archive-wide originality validation. New candidates now use named synthesis-supported scenes, full-history structural and visual checks, and explicit exhaustion. This does not change the frozen covers.

## L&L Field Studies

All five stored Field Studies have distinct effective identities and central geometry: original landscape (001), boundaries (002), incidence channels (003), estuary fan (004), and risk/shelter in the valley family (005). A valley family name alone is not a duplicate: 002 and 005 have different central subjects. A renamed copy of 005 and future reuse of its shelter subject are rejected; an authored risk-pooling scene can pass. No pair reached either similarity threshold. No archive-wide exact or transform-only duplicate was found. This finding is separate from the known former within-edition cover/Field Study collision.

Field Study 003 alone had an authorized replacement on October 9: the terrain-shock composition, which echoed its issue cover, became incidence channels. Its caption and Plate I numbering, its issue cover, and Field Studies 001–002 were preserved. The accepted replacement and Field Studies 004–005 remain untouched. Issue 005’s five readings, synthesis, captions, metadata, companion configuration and notebook review are unchanged. Preparation refuses to regenerate a missing historical cover or Field Study through October 23.

Before this change, generated Field Studies chiefly considered the previous study and corresponding cover; valley/watershed backgrounds and mirroring could leave the same central subject. New candidates compare with **all** earlier studies and their same-edition cover. Valley/watershed labels alone neither establish nor disprove originality: legacy identities use actual central geometry. Recurring concepts require genuinely different economic geometry, not a new background.

## Interpretation and limits

`art-originality.js` reuses Field Brief's unchanged vector feature engine, with publication-specific extraction of central subjects. Effective identities, exact normalized geometry, substantial long-primitive reuse and transform-insensitive silhouette comparisons complement each other. The checks deliberately ignore captions, dates, colors and publication furniture.

The vector approximation is not a complete perceptual or economic-semantic judgment. Publishers must still inspect normal-size/thumbnail renders with closest historical matches and verify that the actual content supports the picture. Exhaustion is an actionable publication blocker, never permission to lower originality standards. The new finite vocabulary can require an authored relevant scene as the archive grows.
