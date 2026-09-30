---
title: "The switch-over: everything moves to 1.0 at once"
status: open
---

Users should never be caught between two half-finished systems. Until every piece of 1.0 is ready, they keep using `agent-ks` 0.x with this repository's docs and skills. Then, in one coordinated release, everything switches: the new docs are live, the new plugins are in the Neuralabs marketplace, the installer and updater point at the new repository, and the final 0.x release tells existing users how to move. This leaf is the checklist and the day's runbook.

# 01 To Do
- [ ] **Readiness checklist** — every line true before starting:
    - [ ] 1.0.0 is released from `NeuraLabsHQ/agent-knowledge-system` and its end-to-end suite is green ([170/30](../170_testing/30_end-to-end.md)).
    - [ ] The new docs are complete and render with the new engine ([180](../180_documentation/00_overview.md)).
    - [ ] Both agentks plugins are published through `NeuraLabsHQ/neuralabs-plugin-marketplace`, and their skills match 1.0 ([130](../130_ai-plugins/00_overview.md), [180/95](../180_documentation/95_skills-update.md)).
    - [ ] agentks.neuralabs.org is live, `/docs` works, the install redirects work, and monitoring is on ([195](../195_hosting/00_overview.md)).
    - [ ] The migration guide is published and tested ([180/90](../180_documentation/90_migration-guide-0x-to-1.md)).
    - [ ] The final 0.x release is prepared, with its updater notice ([160/30](../160_distribution/30_final-0x-updater-notice.md)).
- [ ] **Runbook, in order:**
    1. Confirm the checklist with sidhantha.
    2. sidhantha tags and publishes the final 0.x release of `agent-ks` in the old repository (its updater now prints the notice instead of installing).
    3. Remove the `agent-ks` plugin entry from the personal marketplace (`sidhanthapoddar99/sids-plugin-marketplace`) or point it at the new marketplace — sidhantha, since the repository is theirs.
    4. Commit the deprecation notice in the old repository ([30](./30_old-repo-deprecation-notice.md)) — sidhantha commits.
    5. Announce: a short post on the new site's blog or the homepage, and a pinned notice in the old repository.
    6. Watch installs and issues for a week; fix migration problems in 1.0.x releases.
- [ ] **Record the day** in this leaf's Result: what was done, when, anything that went wrong.

## Guardrails
- No step starts until every checklist line is true. A missing piece delays the whole switch.
- Tagging and publishing releases, and anything in the old repository or the personal marketplace, are sidhantha's actions. Claude prepares them.
- This repository stops building once 1.0.0 is final; no new 0.x features.

## Done when
- Every runbook step is done, and a user running the final 0.x `agent-ks update` sees the notice pointing to the install command and the migration guide.
- A fresh install from https://agentks.neuralabs.org/install.sh gives 1.0, and `agentks docs` opens the live docs.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Repositories:** all four — the old one (`sidhanthapoddar99/agent-knowledge-system`) and the three NeuraLabsHQ ones.
- **Read first:** [Docs rewrite and launch](../../notes/05_delivery/07_docs-rewrite-and-launch.md), section 04 (the switch-over list this leaf implements); [distribution and install](../../notes/05_delivery/04_distribution-and-install.md), section 05.
- **Depends on:** everything in the readiness checklist.
- **Unblocks:** [200/30 deprecation notice](./30_old-repo-deprecation-notice.md), [200/40 archive](./40_archive-old-repo.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): the skills for the new version are ready before the switch; then everything switches at once ([docs rewrite and launch](../../notes/05_delivery/07_docs-rewrite-and-launch.md)).
- Decided (sidhantha, 2026-09-30): this repository stops building once the new release is final. Existing users get an option to update.
- Decided (claude, 2026-09-30): the final 0.x updater prints a notice rather than installing the new binary, because a silent jump would rename the command and break every project at once ([distribution and install](../../notes/05_delivery/04_distribution-and-install.md)).

# 05 Notes & Analysis

## Watch out
- Publishers pinned to 0.x until Phase 3 need the 0.x releases and docs to stay reachable. The archive keeps them; do not delete releases or tags.
