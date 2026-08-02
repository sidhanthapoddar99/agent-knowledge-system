---
title: "Code per-agent-log settings.json (framework)"
status: open
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

- [ ] `readAgentLogs` reads an optional `settings.json` per agent log **and per
      child agent log** — copy the subtask-group reader at `issues.ts:874`
- [ ] **`working` and `debrief` are RESERVED folder names** inside an agent log —
      never treated as child agent logs. Anything else matching
      `NNN_<kind>_<name>/` is a child
- [ ] `IssueAgentLog` gains an **optional** status — absent must stay
      representable, never defaulted at read time
- [x] Colour source: **reuse `statusColors`** — settled by construction once
      iteration files moved to the canonical 7. Same value set, one palette
- [ ] Grey as an explicit token for the absent case, visually distinct from
      `open`
- [ ] Render on the agent log in `DetailSidebar.astro` and `SubdocTree.astro`,
      alongside the kind icon
- [ ] **`guide.ts`** — the bundled anatomy legend: retire the six-slot list and
      the whole milestone block, move the `#N` badge tinting onto the agent log,
      replace the milestone frontmatter table with the iteration-file one
      ([what changes, line by line](../../notes/40_agent-log-settings-framework-spec.md))
- [x] **Status vocabulary settled (Sid, 2026-08-02)** — the canonical 7
      everywhere. `status` = did the agent finish; the finding goes in
      `# Outcome`. No second vocabulary to build
- [ ] `agent-ks check issues`: accept a missing `settings.json`, reject a status
      outside the five-value subset
- [ ] **`check issues` ERRORS on depth overflow.** `MAX_SUBFOLDER_DEPTH = 5` is
      enforced by the loader as a `console.warn` + skip — a file that vanishes
      from the site with no validator signal. Fail loudly instead
      ([the limits section](../../notes/20_agent-log-structure.md))
- [ ] *(no work needed — `readAgentLogs` already reads `agent` / `status` /
      `date` / `color` frontmatter; only `iteration:` becomes dead)*
- [ ] Demo fixture gains agent logs **with and without** `settings.json`
- [ ] `./start build` clean

# Outcomes and Next Steps

> [!IMPORTANT]
> **PLACEHOLDER** — filled at completion / hand-off.

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
