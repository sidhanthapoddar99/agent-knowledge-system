---
title: "Closed 2026-08-04 — all eleven subtasks were already done"
---

Closed on Sid's instruction. Nothing was outstanding: **all eleven subtasks were
already `done`** and had been for some time — the issue status was simply lagging
behind its own contents.

The rename shipped end to end: the CLI is `agent-ks`, the skills are
`agent-ks-docs` / `agent-ks-issues` / `agent-ks-artifacts`, the plugin is
`agent-ks`, the new repo is live, the marketplace points at it, the old repo is
archived, and `./start` carries the self-migration flow.

**Recorded because it is the more useful half:** an issue whose every subtask is
closed does not close itself, and nothing surfaced the gap. The tracker derives
`updated` from git and promotes review debt, but it has no signal for *"this
issue is finished and nobody said so"* — which is worth remembering the next time
an issue list looks longer than the work actually outstanding.
