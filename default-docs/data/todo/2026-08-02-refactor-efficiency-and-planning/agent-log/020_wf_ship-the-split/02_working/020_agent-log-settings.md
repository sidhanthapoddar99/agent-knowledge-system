---
title: "Agent-log settings"
status: done
agent: claude
---

# Goal

Subtask 015 — per-agent-log `settings.json`: a new folder-level read path, the
status rendered on the kind symbol, and the absent case kept representable.

# Inputs

- `notes/40_agent-log-settings-framework-spec.md`
- `subtasks/040_execution/015_code-agent-log-settings.md`

# Expected Outcome

The change, and what it touched.

# Outcome

Shipped. Detail in
[the subtask](../../../subtasks/040_execution/015_code-agent-log-settings.md).

**All four cases verified from the built HTML, not assumed** — the absent case
is the one that regresses silently, so it is a fixture rather than an argument:

| Fixture folder | Renders |
|---|---|
| `300_lp_status-shown` (`in-progress`) | `color: #61afef` · "loop · in-progress" |
| `010_wf_child-independent` (`done`, inside the above) | `color: #7ec699` · "workflow · done" |
| `310_au_status-absent` (no settings.json) | `var(--color-text-muted)` · "audit · no status set" |
| `020_au_edge-cases` (legacy folder) | same defined grey, no throw |

The child renders `done` while its parent renders `in-progress`: status is read
per folder and never derived from children, which is what the spec asked for and
what a "helpful" derivation would have broken.

**The subset error was proved able to fire**, both ways: `review` → the
not-meaningful-for-a-run error, `nonsense` → the invalid-status error, restore →
exit 0.

**One decision taken inside the round.** The spec said *"`IssueAgentLog` gains an
optional status field"*, but `IssueAgentLog` is per FILE and the status belongs
to a FOLDER. Added `agentLogGroups: AgentLogGroupMeta[]` instead, mirroring the
existing `subtaskGroups` — the framework's established pattern for what a folder
knows about itself. Putting a folder's status on each of its files would have
meant N copies of one fact.

**Two things were deleted rather than kept working**, per the superseded-wording
rule applied to code:

- `IssueAgentLog.iteration` and its `#N` badge. The `NNN_` filename owns the
  number. Historic files still carrying `iteration:` frontmatter now render
  their filename prefix like every other entry — the number is still on screen,
  and nothing in the record changed.
- The four `.issue-sidebar__num.is-*` rules that tinted that badge. The status
  tint moved to the folder's kind symbol.

`guide.ts` is listed in this subtask's todo but is owned by
[`050`](../../../subtasks/040_execution/050_docs-update-plans-section.md) — one
file, one owner.
