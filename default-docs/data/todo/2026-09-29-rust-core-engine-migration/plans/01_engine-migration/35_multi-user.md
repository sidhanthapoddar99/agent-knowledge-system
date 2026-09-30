---
title: "Multi-user sync and access keys"
status: open
outcome: "Two people edit one file or diagram together over an access key"
notes: "Needs [Phase 2](./30_phase-2-editing-and-libraries.md)'s per-file yrs documents"
who: "claude"
subtasks:
  - "[060/20 Sync protocol — joining a document and syncing it over /api](../../subtasks/060_collaboration/20_sync-protocol.md)"
  - "[060/30 Presence — who is here, and where their cursor is](../../subtasks/060_collaboration/30_presence.md)"
  - "[060/40 Access keys — `agentks share`: keys, roles, sessions and revocation](../../subtasks/060_collaboration/40_access-keys.md)"
  - "[060/50 Network exposure and TLS — `agentks start --share`](../../subtasks/060_collaboration/50_network-exposure-and-tls.md)"
  - "[060/60 Disk and live document merge — an AI edit on disk joins the open editor](../../subtasks/060_collaboration/60_disk-and-live-doc-merge.md)"
  - "[060/70 Tracker live edits — status, labels and comments, changed from the page, live for everyone](../../subtasks/060_collaboration/70_tracker-live-edits.md)"
  - "[060/80 Diagram collaboration — several people editing one diagram](../../subtasks/060_collaboration/80_diagram-collaboration.md)"
  - "[060/90 Git attribution — who edited what, carried into commits](../../subtasks/060_collaboration/90_git-attribution.md)"
  - "[060/95 Collaboration tests — convergence, reconnect, conflicts, access and load](../../subtasks/060_collaboration/95_collaboration-tests.md)"
  - "[070/90 Share commands — `agentks share` and `start --share`](../../subtasks/070_cli/90_share-commands.md)"
---

Presence, live sync, access keys and `--share`, tracker live edits and git attribution.

# 01 To Do
- [ ] **Sync and presence** on the same `/api` socket (060/20, 060/30).
- [ ] **Access keys** and network exposure (060/40, 060/50, 070/90).
- [ ] **Merging disk edits, tracker live edits, diagrams, attribution** (060/60 to 060/90).
- [ ] **Tests** with two clients (060/95).

# 02 Status and Result
Not started.

# 03 References
- [The plan overview](./overview.md)
- The design: [notes index](../../notes/01_overview/01_index.md)

# 04 Decisions
- See [the plan overview](./overview.md#04-decisions).

# 05 Notes & Analysis
## 01 Scope
The `subtasks:` list above is the whole scope of this stage. Each subtask is written for a cold start: read its references first.
