# Periodicals — unattended publication reliability and recovery contract
Last reviewed: 6 November 2026.

## Incident and confirmed results

- The existing ChatGPT Automations tasks were **enabled**, with the expected Field Brief (daily 8 a.m. ET), Workbook (Fridays 8 a.m.) and Loblolly & Logit (Fridays 3 p.m.) schedules. All three Nov 6 scheduled invocations returned `no_update` after ~one second and no effective authoring/publishing run.
- Field Brief 041 and Workbook 015 were subsequently recovered through full GitHub preparation, artifact and validation checks, published, and independently verified on public GitHub Pages. These dates must never be duplicated.
- L&L No. 007 remains a true missed authoring run. Existing L&L source-evidence, Notebook, Field Register, arrangement, artwork and preparation tests passed against current historical `master`; that is **not** evidence a new edition was researched.
- No precise proprietary platform error reason can be established from the available ChatGPT automation metadata; `no_update` does not justify blaming GitHub or changing editorial requirements.
- Independent GitHub watchdog merged in PR #74 and corrected in PR #78 (latest `scripts/periodicals-publication-watchdog.cjs`) has a genuine GitHub Action schedule and independent live Pages parity checks. Its end-to-end test opened missing-publication Issue #75. It auto-revisits unresolved dated issues even when the homepage has moved to newer dates. **It detects failures; it does not write research.**

## Durable state machine

`DUE → AUTHORING_STARTED → SOURCES_REVIEWED → COMPOSED → PREPUBLICATION_VALIDATED → COMMITTED → PAGES_VERIFIED → BACKUP_SYNCED`

1. Schedule and start detection must have **independent run identifiers** and date-scoped, non-reusable publication keys. Running a scheduler is **not** publication success. Record actual start/failure.
2. New L&L research must use the current `personal-updates/PUBLISHING.md`, `SOURCE-DISCOVERY.md` and the enforced `weekly-economics-environment/source-evidence.cjs`. Every new component needs a legitimate inspection of the actual source version, precise locators, claim classification, preserved numerical units/denominators, explicit limitations and content fingerprint. A completed citation or plausible generated assessment is not substantive verification.
3. Compose each of five research readings with authored editorial decisions, semantically distinct Special Features, actual mathematical/graphic justification, and all accepted reading-specific responsive arrangements/tints. Maintain the cumulative Notebook, 3–5 sourced Field Register entries and 2–3 Field Notes, dated original Field Study and cross-publication-distinct issue mark. **No source, methodological, academic or formatting shortcut is permitted to meet the clock.**
4. Run canonical preparation, original-artwork validation, source-evidence, Notebook, Field Register, layout, scholarly clarity, preservation and cross-publication tests against an isolated branch based on current `master`. Any failure blocks merge; never re-tag new components as historical or silently mutate previous pins.
5. Merge only once the complete issue passes all gates, check published GitHub Pages and hub bytes against the canonical branch, then mark publication succeeded and synchronize the persistent archive. A branch, green CI badge, or cover alone is insufficient.
6. Missed run: automatically open one dated GitHub incident, preserve incomplete drafts separately, retry according to an idempotent policy without overwriting other periodicals' concurrent hub/artwork changes. Close the incident only after verified live parity. Prevent simultaneous authoring of the same edition via concurrency locks, but do not let one blocked publisher prevent independent other titles.
7. Preserve every pre-existing published issue, artwork model, annotation, source record, keepable identity, and schedule. Never resolve a credit outage by publishing unreviewed text.

## The actual execution dependency

An independent GitHub-hosted autonomous *author* requires an AI execution service that can research papers, inspect real source documents and generate/verify code. GitHub Actions alone is **not** that service. The November 6 private capability test showed no configured `OPENAI_API_KEY`, `AZURE_OPENAI_API_KEY`, `FOUNDRY_API_KEY`, or `COPILOT_PAT` repository secret. The temporary secret-presence probe was removed immediately; no value was retrieved or exposed.

An implementation can use the official [OpenAI Codex GitHub Action](https://github.com/openai/codex-action) in a separate least-privilege authoring job, with `OPENAI_API_KEY` stored only in GitHub repository **Settings → Secrets and variables → Actions**. On a personal repository the GitHub Copilot agent alternative likewise requires suitable provider credentials. Do not present a ChatGPT subscription or depleted Work credits as available API execution capacity; API billing and budgets must be verified separately.

The necessary secure pattern is:

- Provider/auth and source network access configured once; *never* print or inject provider secrets into shell or job-level environment.
- Agent researches and drafts in a credential-isolated **contents:read** checkout, with no GitHub write credentials; source citations and document hashes are reviewed against originals, not generated unchecked.
- Transfer only a bounded candidate diff to a fresh CI job; reject modified publishing gates, workflows, archived records, unsafe files and unsupported source claims. Run all canonical tests and independent substantive source-review checks.
- Only a separately authorized release job with isolated GitHub write credentials can create/merge the dated release. Verify live Pages parity and log any failure; do not conflate source build with deploy.
- **GitHub caveat:** changes pushed with the default `GITHUB_TOKEN` do **not** trigger new GitHub Actions or branch-based Pages builds. A real unattended publisher must use an approved GitHub App installation token/PAT for downstream triggers *or* explicitly deploy through an Actions-controlled Pages workflow with the repository configured for that mode. Neither should be assumed already operational.
- The watchdog already in production operates separately and should remain enabled even after a future AI publisher is proven.

### One-time setup and acceptance for any independent author

1. Select/provision a capable provider account and secure repository credential, with an appropriate spend limit and verified access to current full-text scholarly sources. Configure the necessary GitHub release/Pages authentication. Never paste secrets into source, chat, Issues, PRs or workflow logs.
2. Install an isolated, least-privilege research/author/review/publish workflow that embodies the existing contracts; avoid duplicate scheduling with the ChatGPT publisher during the transition.
3. Run a **nonpublishing canary** for an existing historical edition: compare generated candidates, research evidence and artwork to established reference, verify failed/corrupt-source blocking and duplicate-date protection.
4. Run a complete supervised new-issue test, verify actual Pages and archived content, then observe genuine unattended successive releases. Only after demonstrated stability replace/disable the legacy authoring schedule; retain independent watchdog.
5. No all-green assertion is justified before these milestones. A missing external execution credential is a real setup dependency, not an editorial failure that can be worked around by merely increasing retries.

## Edition 007 recovery

The source-specific preliminary research dossier is isolated in draft [PR #77](https://github.com/iainholmes/iainholmes.github.io/pull/77). It is NOT an issue: five provisional papers and clearly listed incomplete source reviews, without fabricated `verified` component attestations. Full editorial completion remains outstanding. Once a legitimate runnable authoring environment is available, it can resume from the dossier without altering source-verification requirements or duplicating a later issue.

## Operational links

- Independent watchdog: `.github/workflows/periodicals-publication-watchdog.yml`; tests `scripts/test_periodicals_publication_watchdog.cjs`
- Missing L&L incident: https://github.com/iainholmes/iainholmes.github.io/issues/75
- L&L editorial dossier: https://github.com/iainholmes/iainholmes.github.io/pull/77
- Primary source-of-truth contract: `personal-updates/PUBLISHING.md`
