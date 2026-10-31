# Crowd and foot traffic

Every flagship, local trail, away mission, and wildcard requires `snapshot.crowd`.
Use `Low`, `Moderate`, `Busy`, or `Very Busy` for `typical_level` and
`perceived_crowding`; use null when not assessed. Never infer Low from missing data.

- `typical_level`: typical overall people presence.
- `attendance`: qualitative presence or observed headcount, with timing/context.
- `perceived_crowding`: how crowded the available space feels, independent of attendance.
- `low_crowd_window`: best time to avoid crowds.
- `peak_period`: busiest period.
- `weekend_vs_weekday`: differences by day type.
- `foot_traffic`: pedestrian intensity and any bottlenecks along the route.
- `dog_density`: dog presence where relevant; use “Not applicable” when irrelevant.

All fields are required; null explicitly records unassessed information. The existing
editions have no verified crowd assessment and retain null values. Record the basis
and observation timing in descriptive fields and cite supporting sources in the
edition when available. Avoid unsupported precise headcounts or time windows.
Like route facts, crowd metadata stays frozen at publication; factual updates belong
in the edition's corrections record. Newly migrated null fields do not alter any
previously published facts.

The build copies the main recommendation’s crowd record into the edition manifest. The shared
`core/crowds.js` policy supports recommendation selection and archive filtering:
Quiet only accepts perceived Low; Low–moderate accepts Low or Moderate; Any accepts
all, including unknown. Typical presence alone cannot qualify an outing as quiet.
Archive filtering applies only to the main recommendation, never to contingencies.
Draft/future publication rules continue to apply before crowd filtering.

Full Edition presents typical and perceived crowding with compact four-level scales. Known timing and dog-density fields appear below. When every field is unknown, one concise statement replaces the empty scales. With partial information, only recorded metrics and facts appear; unknown is never rendered as quiet. This Week and Archive show no crowd summaries. Without JavaScript or if manifest loading fails, the full
static archive remains readable and its interactive filter stays hidden.

Validate with `npm run build`, `npm run check`, and `npm test` inside `rupert/`.

## Prospective evidence handling

During normal source review, carry useful, credible qualitative crowd guidance into the existing descriptive fields when available. Cite the source in the edition and include its location, relevant period and limitations in the field text. A land manager’s seasonal capacity warning is qualitative guidance, not a measured trail count or a reason to assign a crowd rating. Park-wide annual visitation is not trail-level foot traffic; do not convert it into counts, quiet windows, dog density or weekday/weekend predictions. Online review totals and anecdotes are not measurements. If no applicable evidence is available, retain nulls. This is optional enrichment of ordinary research, not an additional mandatory publication gate. Historical snapshots stay unchanged.
