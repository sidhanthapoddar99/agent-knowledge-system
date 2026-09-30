---
title: "Launch — overview"
status: open
---

The launch moves agentks from `sidhanthapoddar99/agent-knowledge-system` (0.x, Astro) to `NeuraLabsHQ/agent-knowledge-system` (1.0, Rust), in six steps set by sidhantha. This group holds the launch's own work items: moving the tracker, the all-at-once switch-over, the deprecation notice on the old repository, its archival, and closing the issues this migration took over. The building work of each step lives in the other groups; this overview maps the steps to them.

# 01 To Do

**The six steps** (from [the launch order comment](../../comments/002_2026-09-30_launch-order.md)):

| Step | Work | Where it is done | Needs |
|---|---|---|---|
| 1 | Build the Rust engine, the client and the default library, and test them end to end | Groups 010 to 170; tracker move in [10](./10_tracker-move.md) | — |
| 2 | Get the Neuralabs plugin marketplace running | [010/80 marketplace repo skeleton](../010_project-setup/80_marketplace-repo-skeleton.md), [130/00 AI plugins](../130_ai-plugins/00_overview.md) | Step 1 |
| 3 | The agentks homepage | [190/00 homepage](../190_homepage/00_overview.md) | — |
| 4 | The docs: a complete rewrite | [180/00 documentation](../180_documentation/00_overview.md) | Step 1 |
| 5 | Hosting at agentks.neuralabs.org | [195/00 hosting](../195_hosting/00_overview.md); Phase 3 in [150/00 publishing](../150_publishing/00_overview.md) | Steps 3 and 4, Phase 3 |
| 6 | The official archival of the old repository | [200/20 switch-over](./20_switch-over.md), [200/30 deprecation notice](./30_old-repo-deprecation-notice.md), [200/40 archive](./40_archive-old-repo.md) | Step 5 |

**This group's leaves:**

| Leaf | When | Status |
|---|---|---|
| [200/10 Tracker move](./10_tracker-move.md) | Inside step 1, once the new engine renders the tracker correctly | open |
| [200/20 Switch-over](./20_switch-over.md) | After step 5 | open |
| [200/30 Old repository deprecation notice](./30_old-repo-deprecation-notice.md) | With the switch-over | open |
| [200/40 Archive the old repository](./40_archive-old-repo.md) | Step 6, last | open |
| [200/50 Close absorbed issues](./50_close-absorbed-issues.md) | Right before the tracker move, then once more at the end | open |

## Guardrails
- **Nothing switches until everything is ready.** Until the switch-over, this repository's docs, skills and `agent-ks` 0.x stay the reference, and users are not asked to move.
- **Claude never commits in the old repository** (`sidhanthapoddar99/agent-knowledge-system`). Claude edits files there; sidhantha commits and pushes. In the three NeuraLabsHQ repositories Claude has full autonomy ([permissions and repositories](../../agent-memory/permissions-and-repositories.md)).
- **Tagging, publishing a release, archiving, DNS** — each is named in its leaf with who does it.

## Done when
- All six steps are complete, and every leaf in this group is in `review` or closed.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Repositories:** the old one at `/home/sid/projects/02_OpenSource/04_knowledge_management/agent-knowledge-system` (`sidhanthapoddar99/agent-knowledge-system`); the new ones under `/home/sid/projects/06_02_NeuraLabs/`.
- **Read first:**
  - [Docs rewrite and launch](../../notes/05_delivery/07_docs-rewrite-and-launch.md) — the six steps, the switch-over checklist, retiring this repository.
  - [Repositories and layout](../../notes/05_delivery/01_repositories-and-layout.md), section 05 — the tracker move.
  - [Distribution and install](../../notes/05_delivery/04_distribution-and-install.md), section 05 — moving users over.
  - [Launch order comment](../../comments/002_2026-09-30_launch-order.md).
- **Depends on:** every other group.

# 04 Decisions
- Decided (sidhantha, 2026-09-30): the six-step launch order ([comment 002](../../comments/002_2026-09-30_launch-order.md)).
- Decided (sidhantha, 2026-09-30): this repository's docs and skills stay in use until the new docs are complete; then everything switches at once.
- Decided (sidhantha, 2026-09-30): the tracker moves once the new engine and client work.
- Decided (sidhantha, 2026-09-30): the new repositories were created fresh in NeuraLabsHQ; Claude owns them until the migration completes, and does not commit in this repository ([permissions and repositories](../../agent-memory/permissions-and-repositories.md)).

# 05 Notes & Analysis

## 01 The old repository is archived in place, not transferred

The notes planned to transfer this repository to neuralabshq and archive it there, so GitHub would redirect old links. That is no longer possible: `NeuraLabsHQ/agent-knowledge-system` was created fresh on 2026-09-30, so a transfer would collide with its name. The old repository therefore stays at `sidhanthapoddar99/agent-knowledge-system`, gets a deprecation notice ([30](./30_old-repo-deprecation-notice.md)) and is archived there ([40](./40_archive-old-repo.md)). Old install URLs and mise pins keep working, because an archived repository keeps its releases downloadable.
