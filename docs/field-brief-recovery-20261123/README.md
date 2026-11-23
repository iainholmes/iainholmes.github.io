# Field Brief — November 21–23 historical correction

The user explicitly authorized two missing historical editions and one number correction: November 21 is 054, November 22 is 055, and the already-published November 23 edition becomes 056. The normal publisher's historical-gap guard remains unchanged. This is a single authorized correction, not permission for automatic backfilling or renumbering.

## Independently established baseline

At `cbb41682564c981efed3032bb2c226cdb392e3af`, canonical master and all five public production files matched byte for byte. Pages run [45181021859](https://github.com/iainholmes/iainholmes.github.io/actions/runs/45181021859) succeeded for that SHA. The archive contained 54 editions and 270 stories; November 21–22 were absent. The November 23 publication report explicitly said the weekend had not been backfilled. No open PR was present at the initial concurrency check. Recheck master and the dated archive immediately before integration.

## Correction and preservation

Two new dated objects are inserted chronologically before November 23. Date-based story IDs, hash routes, Keep/Commonplace identity and reading-location contracts do not change. Existing rendering derives folios and adjacent-edition links from chronological order; no alternate numeric routing scheme is introduced.

Monday's story and framing source bytes remain exact. Its seven-edition review metadata is recomputed against the repaired archive; the original review is retained in `correction.json`. Its frozen cover changes only three number labels from 054 to 056, plus the model's number and compared-cover count. All geometry, colors, caption, seed, composition and story plates remain exact. The complete original cover is retained in the correction record. All 53 earlier edition objects, all old story plates and every other frozen cover remain unchanged.

The new covers were reviewed against both preceding history and the already-frozen later cover. All three corrected dates pass normal originality and operational validation. The new story plates use ten authored subject-specific scenes with evidence rules tied to reported prose. No existing scene or pin is replaced. Normal preparation is byte-idempotent on two consecutive retries.

The hub remains on Monday as the newest edition, with 056, 56 editions and 280 stories. All unrelated publications, shared navigation/storage code, the publisher contract, preflight, preparation guard and watchdog schedule remain unchanged.

## Editorial and source review

Both recovered editions explicitly disclose recovery on November 23. Their dates identify the intended editions, not the actual release time. Saturday uses material available by Saturday morning; Sunday uses material available before Sunday morning. Later Sunday proof-validation claims and election calls were not imported into the earlier record.

Discovery included AP, Reuters leads, Axios, Nature, regional reporting and primary institutional releases. Selected claims were checked against AP's accessible WHIO/WRAL syndications, FDA, Capricor's SEC disclosure, the European Commission, NASA, NC DEQ, Alpöge's original announcement, and the official Shenzhen Outlook attachment. The APEC website returned 404 on direct retrieval; its official Chinese-government publication and attached document were inspected instead. The attachment is an Office document despite its opaque download address; its actual document text was read. An inaccessible WPXI route was not relied upon. No article was reconstructed from snippets or a paywall bypass.

| Edition / story | Selection and evidence judgment |
| --- | --- |
| 054 / 01 | Observed November 20 market close creates a material development after the prior AI-finance and IPO stories. Interpretations of causes are qualified. |
| 054 / 02 | FDA's rejection, inspection findings and revised-indication review are attributed to the agency; the issuer's SEC disclosure corroborates receipt. No treatment advice or claim of inevitable research failure. |
| 054 / 03 | Completed EU disbursement is distinguished from future promises and from reform or spending outcomes. |
| 054 / 04 | NASA's research selections are separate from earlier Voyager and SBA stories. Shared technology/infrastructure vocabulary produces a high heuristic penalty, but the institution, program, mechanism and question differ. Funding is not a demonstrated mission capability. |
| 054 / 05 | Dated local reservoir and drought measures; water-supply and water-quality pools are explicitly distinguished. No prediction of a universal run-out date. |
| 055 / 01 | Saturday's renewed political support is a proposal, not a law or effective rate ceiling. Possible lender responses are predictions. |
| 055 / 02 | Specific original proof artifact is a material development distinct from Anthropic's IPO. The author’s announcement is reported without certifying the proof or importing later checks. |
| 055 / 03 | Announcement of three prisons; costs, financing and management remain unspecified. Construction and lawful/humane operation are distinct. |
| 055 / 04 | Official adopted text establishes voluntary, nonbinding trade coordination. No invented tariff concession, treaty obligation or measured trade-cost effect. |
| 055 / 05 | Commission adoption remains subject to further review; March 2027 is the earliest possible effective date. The habitat amendment remains a draft. |

Seven-edition profiles and penalties were inspected before selection. Saturday reviews November 20–14; Sunday reviews November 21–15; Monday's corrected review covers November 22–16. Each new edition spans four domains, with at most two stories in any domain and a designated North Carolina feature fifth. The two material-development overrides state the actual prior/new status and link evidence. Broad geography and infrastructure matches are not treated as duplicate events. Monday's five subjects were reserved for its existing edition: no repeated weekend COP31 conclusion, cyber appointment, contractor order, measles finding or life-sciences award. Child-care and Duke-rate stories were also left in their original issues. No diversity or order exception was needed.

Scholarly clarity reviewed: attribution, evidence versus interpretation, quantities, dated measures, proposal/adoption status, uncertainty and the publication's concise analytical voice were checked. Automated passes establish consistency, not independent certification of factual claims.

## Validation

`node scripts/test_field_brief_weekend_recovery.cjs` passes 348 focused assertions, including exact preservation against the independently verified baseline, current seven-edition scores, new chronology, old geometry, normal retry behavior and hub synchronization. Operations, live-verification regressions, editorial order, relevance, issue marks, publishing, Periodicals navigation and watchdog checks pass.

Four broader historical/synthetic suites fail identically on untouched `cbb4168`: `test_field_brief_artwork` compares the entire growing archive to its 2026-10-03 snapshot; `test_art_append_growth` exhausts a synthetic scene vocabulary; `test_field_brief_cover_originality` exhausts a 2028 synthetic cover case; `test_field_brief_editorial_cover` exhausts its year-9997 synthetic case. No validator or historical baseline was weakened. Actual recovered covers pass the unchanged production gates.

Chrome inspection passes 201 checks at 1440×1000, 1024×768, 390×844 and 844×390. All three editions were checked in Day and Night, with Index labels/order, adjacent links, every story anchor on desktop/phone, all five illustrations, public hub metrics and horizontal overflow. Rendered screenshots and the three-cover/ten-plate contact sheet were visually inspected. These are browser simulations; physical-device acceptance is not claimed.

## Weekend publisher failure investigation

The independent GitHub watchdog found missing canonical editions and opened [incident 105](https://github.com/iainholmes/iainholmes.github.io/issues/105) and [incident 106](https://github.com/iainholmes/iainholmes.github.io/issues/106). Its scheduled runs [44945280436](https://github.com/iainholmes/iainholmes.github.io/actions/runs/44945280436) and [45066615839](https://github.com/iainholmes/iainholmes.github.io/actions/runs/45066615839) succeeded. Success here means the detector completed; its design opens deduplicated incidents rather than failing Actions or authoring news. The independent missing-edition safeguard therefore exists and detected both omissions; it is an alert, not an automatic editorial recovery system.

GitHub reports the weekend detector starts as November 21 20:15:09 UTC (3:15:09 p.m. EST) and November 22 20:28:24 UTC (3:28:24 p.m. EST). These are the actual recorded detector times, not assertions that the configured post-grace checks ran on time. The public commit query returned no canonical commits between November 21 00:00 EST and November 23 00:00 EST. Monday then published at `cbb4168` without recovering the gap.

The referenced November 21 chat report says the cloud publisher remained enabled and recorded `no_update` without a publication report. That is prior reported evidence; the underlying private cloud execution record is not available through this chat's tools. No equivalent Sunday executor log was accessible. The evidence does not establish whether provisioning, instruction execution, authoring, validation or another private stage caused either omission. It does not justify blaming GitHub, a platform outage, disabling behavior or a particular tool error. The next diagnostic step is access to the original publisher's November 21–22 execution/audit logs, including provisioning and termination records.

No cloud task, schedule, enabled state, execution setting or separate Publish Check was changed. The established daily 8:00 a.m. America/New_York schedule remains in the repository's public contract. Private cloud scheduler state could not be independently re-read. A manual recovery does not prove future unattended reliability.

## Library backup limitation

The original backup identity remains `libfile_66df38249ed88191b59e6a2263f5b030` at `/Daily Briefings/Daily Briefing Archive.html`. No duplicate or replacement identity was created. The current tool set has no supported operation to inspect and replace that standalone Library file with an expected-version guard. Its current version/content cannot be independently certified here, and synchronization must not be reported complete. After live verification, only that secondary in-place replacement remains to be performed when Library access is available; never regenerate the publication to retry a backup.

Repository integration, deployment SHA/times and independent public verification are recorded in the final recovery report, separately from this pre-release QA record.
