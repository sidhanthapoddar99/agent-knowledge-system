---
title: "Code per-agent-log settings.json (framework)"
status: done
---

# Overview

Give every agent log — and every child agent log — an optional
`settings.json` carrying its status, and render that status in the issue UI.

**This is a new read path, not a new field.** `agent-log` folders currently read
no folder-level settings at all; only subtask *groups* do, and only for `title`.

**Done when** an agent log with a status renders it, an agent log without one
renders grey, a child's status is independent of its parent's, and the validator
accepts the absent case.

# References

- **Full spec, with the grep results it rests on**:
  [Framework spec: per-agent-log settings.json](../../notes/40_agent-log-settings-framework-spec.md)
- Structure it serves:
  [The agent-log structure](../../notes/20_agent-log-structure.md)
- Test bed: `default-docs/data/todo/2026-07-01-demo-issue-anatomy-showcase`

# Todo list

- [x] A new `readAgentLogGroups` walk reads an optional `settings.json` per agent
      log **and per child agent log** — see *What shipped differently*: it lands
      on a new `agentLogGroups` array, not on `IssueAgentLog`
- [x] **`working` and `debrief` are RESERVED folder names** inside an agent log —
      never treated as child agent logs. Anything else matching
      `NNN_<kind>_<name>/` is a child. **Superseded 2026-08-03** — this is what
      shipped, and the rule it implements no longer exists; see the replacement
      item below
- [x] The status is **optional** — absent stays representable (`null`), never
      defaulted at read time
- [x] Colour source: **reuse `statusColors`** — settled by construction once
      iteration files moved to the canonical 7. Same value set, one palette
- [x] Grey as an explicit token (`AGENT_LOG_STATUS_UNSET`) for the absent case,
      visually distinct from `open`
- [x] Render on the agent log in `DetailSidebar.astro` and `SubdocTree.astro` —
      the kind symbol itself carries the tint, so no new row furniture
- [ ] **`guide.ts`** — owned by [`050`](./050_docs-update-plans-section.md), not
      here. One file, one owner
- [x] **Status vocabulary settled (Sid, 2026-08-02)** — the canonical 7
      everywhere. `status` = did the agent finish; the finding goes in
      `# Outcome`. No second vocabulary to build
- [x] `agent-ks check issues`: accepts a missing `settings.json`, errors on a
      status outside the five-value subset **and** on one outside the seven
- [x] **`check issues` ERRORS on depth overflow** (shipped with
      [`010`](./010_code-the-plans-section.md)'s validator rewrite) — the loader
      only `console.warn`s and skips, which is a file vanishing from the site
      with no signal
- [x] *(no work needed — `readAgentLogs` already reads `agent` / `status` /
      `date` / `color` frontmatter)*
- [x] Demo fixture gains agent logs **with and without** `settings.json`, plus a
      child whose status differs from its parent's
- [x] `./start build` clean

**Superseded 2026-08-03 — the reserved-name half of this subtask was replaced,
and the replacement is owned elsewhere.** A folder inside an agent log is now a
**child agent log when its numeric prefix is `≥ 100`**, and one of the run's own
slots below that; the slots are `01_summary.md`, `02_working/` and
`03_debrief/`. Same answer for every folder that exists today — what changes is
that the discriminator is arithmetic the filesystem carries rather than a name
list only the code knows, and the sidebar's *pin summary first* rule goes with
it. Spec: [the numbering spec](../../notes/80_agent-log-numbering-spec.md).
Execution, including the loader constant, the validator and the migration:
[number the agent log's own slots](../100_agent-log-slot-numbering.md). **No
open work is carried here** — the status read path this subtask shipped is
unaffected.

# Outcomes and Next Steps

> [!NOTE]
> **One thing this subtask shipped was replaced on 2026-08-03, and it is not a
> defect in what is below.** The loader told a slot from a child agent log by a
> **reserved-name set**; that is now a **prefix comparison**
> ([the numbering spec](../../notes/80_agent-log-numbering-spec.md)), carried out
> by [number the agent log's own slots](../100_agent-log-slot-numbering.md).
> Everything else here — the status read path, the colours, the four verified
> fixtures, the proved-able-to-fail validator — is untouched by it.

**Shipped.** Every agent-log folder may declare a status; it tints the kind
symbol already on that row, read from the same `statusColors` map as every other
status surface.

**All four cases verified from the built HTML**, because the absent case is the
one that regresses silently and an argument is not a fixture:

| Fixture | Renders |
|---|---|
| `300_lp_status-shown` (`in-progress`) | `#61afef` · "loop · in-progress" |
| `010_wf_child-independent` (`done`, nested inside it) | `#7ec699` · "workflow · done" |
| `310_au_status-absent` (no `settings.json`) | `var(--color-text-muted)` · "audit · no status set" |
| `020_au_edge-cases` (a legacy folder) | the same defined grey, no throw |

The child renders `done` while its parent renders `in-progress` — status is read
per folder and never derived from children, which is exactly what a "helpful"
derivation would have broken.

**The subset error was proved able to fail**, both ways: `review` gives the
not-meaningful-for-a-run error, `nonsense` gives the invalid-status error, and
restoring returns exit 0.

**Run record:**
[`020_wf_ship-the-split/working/020_agent-log-settings.md`](../../agent-log/020_wf_ship-the-split/02_working/020_agent-log-settings.md).

## What shipped differently from the spec, and why

**The status lives on a new `agentLogGroups` array, not on `IssueAgentLog`.**
The spec said *"`IssueAgentLog` gains an optional status field"*, written when
it looked like `IssueAgentLog` described a folder. It describes a **file**. A
folder's status copied onto each of its files is N copies of one fact, and they
can disagree. `agentLogGroups: AgentLogGroupMeta[]` mirrors the existing
`subtaskGroups` — the framework's established pattern for what a folder knows
about itself.

**Two things were deleted rather than left working.** Applying the
superseded-wording rule to code:

- `IssueAgentLog.iteration` and the `#N` badge it drove. The `NNN_` filename
  owns the number now. Historic files that still carry `iteration:` frontmatter
  render their filename prefix like every other entry — the number is still on
  screen and the record is untouched, but there is no longer a second badge
  scheme keeping a retired field alive forever.
- The four `.issue-sidebar__num.is-*` CSS rules that tinted that badge, replaced
  by the folder-level tint.

# Details

## Why this is its own subtask

It shares no code with the plans section beyond both touching `issues.ts`, and it
ships independently. Folding it into
[Code the plans section](./010_code-the-plans-section.md) would gate a small,
well-specified change behind a large undecided one.

## The two traps

**The absent case is what regresses silently.** An agent log with no
`settings.json` must render grey and must not throw, and it is the case nobody
writes a fixture for. The demo fixture carries both, deliberately.

**Do not compute a parent's status from its children.** Decided 2026-08-02:
status is set independently per folder. Derivation looks helpful and would make
a parent disagree with its own file.

## Not in scope

Iteration-file status. That lives in **frontmatter**, per file, and needs no
loader change beyond what already reads markdown frontmatter. `settings.json` is
per folder; frontmatter is per file; neither duplicates the other.
