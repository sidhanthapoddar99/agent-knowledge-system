---
title: "The final 0.x release: tell agent-ks users where agentks went"
status: open
---

Every installed `agent-ks` keeps checking this repository for updates. If nothing changes here, those users never learn about `agentks`; if the updater jumped silently to the new binary, it would rename the command and break every project at once. This leaf prepares the last 0.x release of `agent-ks`, whose updater prints a notice naming the new install command and the migration guide instead of installing anything new. It lives in **this** repository: Claude prepares the change; sidhantha commits, tags and publishes it at the switch-over.

# 01 To Do
- [ ] **Updater change** in [update.rs](../../../../../../agent-ks-cli/src/update.rs):
    - [ ] After this release, `agent-ks update` and the silent check stop installing; they print once per day: "agent-ks has moved to agentks (NeuraLabsHQ/agent-knowledge-system). Install: `curl -fsSL https://agentks.neuralabs.org/install.sh | sh`. Then run `agentks migrate` in each project. Guide: <migration guide URL>."
    - [ ] `agent-ks update --check --json` reports `{ "moved_to": "agentks", "install": "…", "guide": "…" }`.
    - [ ] Everything else in 0.x keeps working, so publishers pinned to 0.x are not broken.
- [ ] **Viewer notice.** `agent-ks start` prints the same notice once per day on start (not an error).
- [ ] **Release note** for the final CLI version and, if the engine changes, the engine version, per [RELEASING.md](../../../../../../RELEASING.md).
- [ ] **Prepare, don't publish.** Leave the change uncommitted or on a branch as sidhantha prefers, with the exact tag commands written in the result for sidhantha to run.
- [ ] **Timing.** Publish only after launch step 5 (the install URL and the guide exist) and before archiving this repository ([200/00 launch](../200_launch/00_overview.md)).

## Guardrails
- Claude never commits, tags or pushes in this repository ([permissions](../../agent-memory/permissions-and-repositories.md)).
- No silent jump to the new binary.
- The notice must not break scripts: stdout stays unchanged for commands that print data; the notice goes to stderr.

## Done when
- A locally built 0.x CLI with the change prints the notice on `update`, `update --check --json` and `start`, and still runs every content command normally.
- sidhantha has the exact release steps in this leaf's result.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
**Where:** this repository, `agent-ks-cli/` (edit only; sidhantha commits).

**Read first**
- [Distribution](../../notes/05_delivery/04_distribution-and-install.md), section 05.
- [Docs rewrite and launch](../../notes/05_delivery/07_docs-rewrite-and-launch.md) — the switch-over sequence.
- Today's [update.rs](../../../../../../agent-ks-cli/src/update.rs), [viewer.rs](../../../../../../agent-ks-cli/src/viewer.rs), [RELEASING.md](../../../../../../RELEASING.md).

**Depends on:** [160/20 update channel](./20_update-channel.md), [195/00 hosting](../195_hosting/00_overview.md) (the install URL), [180/90 migration guide](../180_documentation/90_migration-guide-0x-to-1.md).
**Unblocks:** [200/00 launch](../200_launch/00_overview.md) (archiving this repository).

# 04 Decisions
- Proposed (claude, 2026-09-30): the final 0.x release prints a notice rather than installing the new binary, because a silent jump would rename the command and break every project at once ([distribution](../../notes/05_delivery/04_distribution-and-install.md)). Confirm with sidhantha before publishing.

# 05 Notes & Analysis
## Watch out
- Users who disabled automatic updates never see the updater notice; the `start` notice and the README banner in [200/00 launch](../200_launch/00_overview.md) cover them.
