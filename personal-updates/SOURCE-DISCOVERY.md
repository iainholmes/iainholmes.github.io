# Prospective source discovery — Field Brief and Loblolly & Logit

Part of the [publication contract](PUBLISHING.md#prospective-source-discovery--field-brief-and-loblolly--logit), applied before selecting new editions. Use the strongest available source mix for the story, rather than optimizing for outlet diversity itself. Preserve consequence, relevance, freshness, evidentiary quality, primary-source availability and factual confidence. This guide changes publisher research instructions, not the applications, schedules or existing editions. The Workbook is outside this sourcing change.

## Field Brief: broaden the candidate pool

During daily candidate discovery, deliberately survey relevant journalism and primary evidence beyond Reuters before settling on the final five. Reuters remains an important trusted source and may still supply most of an issue when its coverage is strongest. Do not infer that a Reuters-heavy final selection means discovery failed, or displace a consequential story to obtain a different outlet name.

- Consider Reuters, Associated Press, The New York Times, The Wall Street Journal, The Economist, BBC, NPR, Financial Times, legitimately accessible Bloomberg, Axios and strong regional/local reporting such as WRAL and WUNC. This is an extensible starting universe, not an exhaustive whitelist or a requirement to visit every outlet daily. Use subject-specific searches and relevant accessible alternatives; do not rely solely on Reuters being easy to retrieve.
- Seek the underlying document where available: federal/state/local agency releases, regulatory filings, court opinions, legislation and rulemaking, international organizations, central banks, company filings/disclosures, research institutions, original reports, datasets and technical documentation. Distinguish an interested party's official account from independent corroboration.
- Pair reporting and primary documentation when each adds evidence or context: NYT + EPA, WSJ + SEC/company filing, Reuters + central-bank release, AP + court decision, or Economist analysis + its underlying report/dataset. One sufficient authoritative source is acceptable; two news articles repeating the same release are not independent corroboration simply because their outlet names differ.
- Apply the existing seven-edition editorial-memory review to the broader candidate pool. Story importance and supported material developments remain decisive. No outlet allocations, minimum primary-source counts or source-diversity scores are introduced.

## Access and claim support

**A headline, search result, metadata record, excerpt or snippet can identify a lead; it cannot by itself support substantive published news claims.** Inspect enough legitimate source material to understand the central claim, evidence, qualifications, attribution and uncertainty. Do not reconstruct an article from snippets, bypass a paywall/access control or assume a consumer subscription will be available to an unattended publisher.

When a promising news article is inaccessible, seek its primary documentation, independently accessible high-quality reporting or another authoritative corroborating source. Publish only claims supported by the material actually examined, with accurate attribution. If verification remains insufficient, replace the candidate with another consequential, verifiable story. Do not cite the inaccessible article as though it was read. These rules apply equally to inaccessible Reuters or local reporting.

Use a specific stable document/article URL when practical, with an accurate source label: institution/outlet, document/article title and relevant date. A generic organizational homepage cannot stand in for an unread report. If a specific source has moved, seek a legitimate official archive or document identifier; do not invent an address. Record a material access limitation rather than implying document verification. No historical source link, including Issue 026's, is altered by this prospective rule.

## L&L: a recurring scholarly-discovery lane

Each Friday, begin candidate research with a short scan of recent relevant scholarship alongside the existing NBER, AEA, CEPR, RFF, university, institutional and regulatory lanes. Explicitly consider JEEM; scan the other watchlist journals for relevant work. Inspect titles/metadata first and read promising candidates deeply enough to assess them before selecting the five most intellectually useful readings. This is a recurring discovery responsibility, not a quota for journal articles or a requirement to read every paper.

Start from the previous edition's research cutoff with an overlapping lookback where useful (for example, the preceding month) to catch delayed indexing and online-first work. Expand by topic when appropriate. Check earlier editions to avoid treating a working paper and its journal version as unrelated new findings. Metadata deposit/index dates, online publication dates and later issue/print dates differ; verify the actual chronology and explain the current relevance of an older paper. Do not call a future-dated issue assignment newly published without checking its online availability.

The initial watchlist is extensible. ISSNs below were verified against Crossref journal records; recheck title/identifier matches if a service returns a different venue.

| Journal | Discovery identifier | Editorial fit to consider |
| --- | --- | --- |
| Journal of Environmental Economics and Management (JEEM) | `0095-0696` | Explicit priority: environmental/resource economics, fisheries, agriculture, pollution, regulation, nonmarket valuation, behavior, climate, energy, welfare and applied policy evaluation. |
| Journal of the Association of Environmental and Resource Economists (JAERE) | `2333-5955` | Environmental/resource mechanisms, empirical designs and welfare analysis. |
| Review of Environmental Economics and Policy (REEP) | `1750-6816` | Research syntheses, reviews and policy interpretation; label these genres accurately. |
| Energy Economics | `0140-9883` | Energy markets, transitions, demand, policy and models. |
| Resource and Energy Economics | `0928-7655` | Resource allocation, energy, regulation and economic mechanisms. |
| Land Economics | `0023-7639` | Land use, property, natural resources, agriculture and valuation. |

Also consider strong fits from broader economics, policy, energy, agricultural, environmental, behavioral, public-finance and applied-econometrics journals. Do not favor a journal name over relevance, identification or evidence quality. A working paper or regulatory decision may be more useful than any newly published journal article; an edition with no journal article can be the correct result of a genuine scan.

## Metadata discovery without a permanent service

Use the existing Work research/search and HTTP tools. No crawler, package dependency, paid API, stored API key, browser-side request or separate scheduled task is needed. Metadata services help find and identify research; their records, abstracts, summaries and citation counts do not establish its substantive conclusions or peer-review/causal validity.

| Channel | Practical use | Fallback and limits |
| --- | --- | --- |
| Crossref | Resolve a journal by ISSN with `https://api.crossref.org/journals/{ISSN}`; inspect `/journals/{ISSN}/works` with bounded `rows`, date filters and sorting. Resolve a candidate with `/works/{DOI}`; check title, authors, journal, work type and online/print dates against the publisher record. | Public metadata access needs no signup under the current documentation. Missing or late metadata and incomplete date fields are possible. An empty date-filtered result is not proof that no relevant scholarship exists: inspect broader metadata, another index or the journal's legitimate current-contents page. Honor rate limits. |
| OpenAlex | Match the journal through `/sources?filter=issn:{ISSN}`; use the returned source ID in a works filter. Search topics/titles or resolve `/works/https://doi.org/{DOI}`; inspect `locations` for legitimate alternate versions. | Verify matches, manuscript versions and actual accessible text. Access rules/budgets can change: use permitted basic queries or already-authorized access only. If a key, budget or channel is unavailable, use Crossref, publisher metadata or repository/author searches. Do not require account setup for a release. |
| Semantic Scholar | Optional supplementary title/DOI search, citation trails and open-access-location leads through its Academic Graph API or ordinary research interface. | Public endpoints may throttle or require authorization. A failed/limited query is not a publication blocker; use another channel. Machine summaries and metadata are not substitutes for reading the evidence. |

For an occasional Crossref query, choose a bounded recent date window using the documented `from-pub-date`/`until-pub-date` filters, or online-date equivalents when populated. Do not confuse metadata updates with new research. Avoid exhaustive harvesting; this guide does not require cursor storage, a sync job or continuous indexing. Search publisher pages only as ordinary legitimate research/fallback access, not a new scraping system.

Example request shapes (replace the dates and identifiers; `FROM`/`TO` are actual `YYYY-MM-DD` research bounds, and `SOURCE_ID` comes from the verified OpenAlex journal lookup):

```text
https://api.crossref.org/journals/0095-0696/works?filter=from-pub-date:FROM,until-pub-date:TO&rows=10&sort=published&order=desc
https://api.openalex.org/works?filter=primary_location.source.id:SOURCE_ID,from_publication_date:FROM,to_publication_date:TO&per_page=10&sort=publication_date:desc
```

Provider references: [Crossref REST API](https://www.crossref.org/documentation/retrieve-metadata/rest-api/), [Crossref query/access guidance](https://www.crossref.org/documentation/retrieve-metadata/rest-api/tips-for-using-the-crossref-rest-api/), [Crossref access](https://www.crossref.org/documentation/retrieve-metadata/rest-api/access-and-authentication/), [OpenAlex API access](https://help.openalex.org/api/authentication/), [OpenAlex works/locations](https://help.openalex.org/data/works/) and [Semantic Scholar API](https://www.semanticscholar.org/product/api).

## Reading versions and weighing evidence

For a promising academic candidate:

1. Establish the canonical version-of-record/DOI identity where one exists; confirm journal, authors, title, dates and actual publication type. A `journal-article` metadata type alone does not establish that the piece is peer reviewed rather than commentary. Check publisher status and any relevant correction/retraction notice.
2. Read the accessible publisher abstract to assess fit. Then seek sufficient legitimate full text: publisher text, an author manuscript, institutional repository, NBER/SSRN/other legitimate working-paper or preprint version. Supporting appendices, replication files, institutional summaries and academic discussion can clarify evidence and limitations; they do not automatically replace the paper.
3. Match an alternate version using authors, title, dates, DOI/repository relations and the text itself. Read the sections/appendices necessary for the actual claims about data, estimands, identification, model structure, uncertainty and limitations. Open-access labels or a PDF URL are leads until the document is opened and verified.
4. Where a working paper corresponds to a journal article, cite the journal/DOI as canonical where appropriate and also identify/link the version actually read. Note meaningful version differences that affect interpretation. Do not transfer a working-paper estimate or design to an unread final article. If differences cannot be resolved, restrict attribution to the inspected version or defer the candidate.
5. Keep publication status separate from evidence status: peer-reviewed article, working paper, institutional synthesis, review or commentary; regulatory proposal versus final regulation; observational association, causal estimate, simulation/model or policy analysis. Peer review does not establish identification or policy correctness. Preserve “What the evidence does—and does not—say” and the [scholarly-clarity standard](PUBLISHING.md#shared-scholarly-clarity-review--all-three-publications).

An abstract alone cannot support detailed methodological analysis. Narrow a claim only when the inspected material genuinely supports it; if access is insufficient for L&L's required analytical depth, retain the lead for later and select a better-supported reading. Do not fill a prestigious-journal slot or imply full-paper inspection that did not occur.

## Existing publisher QA: record judgment, not quotas

Include a short sourcing note in the existing QA/release report, naming channels actually inspected, selected evidence, material access/version limits and the reason for the final mix. For L&L, include the JEEM/watchlist scan and relevant candidate dispositions, even when none was selected. Do not claim checks that were not performed. No new published metadata field, review registry or separate approval stage is required.

| Publication | Confirm before approving the new edition |
| --- | --- |
| Field Brief | Discovery was not confined to Reuters; primary evidence was sought where available; claims are grounded in legitimately inspectable material; inaccessible articles were not reconstructed from snippets; importance/evidence outranked outlet variety; labels and links identify the specific underlying article/document when practical. |
| L&L | Recent relevant academic work and the watchlist, including JEEM, were deliberately considered; DOI/version metadata and publication status were checked; access was sufficient for the methodological interpretation; legitimate alternate versions were sought when needed; limitations/causal status are accurate; prestige alone did not determine selection. |

If an outlet is inaccessible, use verified primary documentation or accessible reporting. If Crossref fails, use OpenAlex, verified publisher/DOI pages or repository records. If OpenAlex fails, use Crossref and author/institutional searches. If Semantic Scholar throttles, omit that optional channel. Respect access restrictions and `Retry-After`; use bounded attempts rather than waiting indefinitely or repeatedly hammering a failed service. If no worthwhile recent journal article exists, proceed with the strongest other readings and record the scan. Service failure must not become an avoidable missed release, but essential factual verification remains mandatory; replace an unverifiable candidate rather than relaxing it.

Existing checks enforce structural contracts, not source quality or full-text inspection: `check_field_brief.cjs` checks nonempty source labels/HTTPS addresses and edition completeness; `review_field_brief.cjs` supports recurrence/diversity judgment; the L&L notebook validator checks references/anchors/review records. They do not validate the truth of remote claims, infer peer review, verify outlet breadth or certify paper access. These new requirements are publisher instructions within existing editorial/source review, not automated approval.

## Scenario review (prospective examples; no editions rewritten)

| Case | Expected publisher decision | Safeguard checked |
| --- | --- | --- |
| FB1: Reuters has the strongest accessible breaking coverage | Retain it; pair primary evidence if useful, and allow a Reuters-heavy issue after broader discovery. | No outlet quota or artificial reduction. |
| FB2: NYT provides only a headline/snippet | Use it as a lead; seek the primary record or accessible reporting. Omit unsupported claims and do not cite an unread article as examined evidence. | Discovery is not substantiation; no snippet reconstruction. |
| FB3: WSJ leads to a corporate development with an SEC/company filing | Read the specific filing, distinguish the company's account from verified facts, and add accessible independent reporting when useful. | Access fallback and natural attribution; no subscription dependency. |
| FB4: Two outlets repeat an agency event whose release suffices | Cite the inspected agency document; do not add a redundant second source just to reach a count. | Evidence sufficiency, not mandatory pairing. |
| FB5: Outlet variety would displace a more consequential story | Keep the more consequential well-supported story. | Importance and confidence outrank diversity. |
| LL1: A relevant new JEEM paper has accessible full text | Verify journal/DOI/version, read the needed methods/results/limitations and assess its usefulness against other candidates. | First-class journal discovery without automatic inclusion. |
| LL2: JEEM article is paywalled; a working-paper version is accessible | Verify the correspondence; read and link that version alongside the canonical journal reference. Disclose meaningful differences; defer if they cannot support the intended interpretation. | Version identity and honest access claims. |
| LL3: Only an abstract is available; methods cannot be assessed | Keep a discovery lead, not a detailed methodological reading. Seek alternatives; select another candidate if sufficient evidence remains unavailable. | Depth is limited by inspected evidence. |
| LL4: An NBER paper is more useful than the week's journal articles | Select the NBER paper and label it as a working paper. | Relevance outranks peer-review quotas. |
| LL5: A prestigious article has weak identification | State the design's limitations and distinguish association from causation; reject it if it is not useful enough. | Prestige cannot establish causal validity. |
| LL6: No worthwhile new journal article is found | Record the actual scan and select the best five available readings from the wider research/policy universe. | No forced novelty or journal slot. |

Fallback review: Crossref unavailable → use another legitimate metadata/publisher channel; OpenAlex unavailable or requiring unavailable authorization → use Crossref/repository discovery; all named consumer outlets paywalled → use accessible reporting/primary records. The outcome remains a supported edition, not fabricated access or an automatic service-dependent failure. These are editorial scenario exercises, not machine proof that future publishers will comply.
