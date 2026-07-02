---
title: "Agent-log: support 2-level folder hierarchy"
status: done
---

Currently `agent-log/` is a flat folder of numbered files. Long-running issues with many iterations + parallel agent runs (one branch experimenting, another debugging, another running benchmarks) outgrow flat fast. Add support for **one extra level of nesting** so iterations can be grouped.

## Folder shapes

Both shapes coexist; the loader handles either:

```
issue-foo/
├── agent-log/
│   ├── 001_initial-triage.md          # flat (today)
│   ├── 002_spike.md
│   └── 003_final-implementation.md

issue-bar/
├── agent-log/
│   ├── 001_overview.md                 # top-level summary file (optional)
│   ├── exploration/                    # subgroup
│   │   ├── 001_approach-a.md
│   │   ├── 002_approach-b.md
│   │   └── 003_decision.md
│   ├── implementation/                 # subgroup
│   │   ├── 001_first-pass.md
│   │   └── 002_polish.md
│   └── benchmarks/                     # subgroup
│       └── 001_initial-numbers.md
```

Each subgroup folder gets its own iteration counter (`001`, `002`, `...` reset per subgroup).

## Loader changes (`src/loaders/issues.ts`)

- [ ] When walking `agent-log/`, descend one level into folders
- [ ] Top-level files keep their existing shape (`name`, `sequence`, `iteration`, `agent`, `status`, `date`, `filePath`, `relativePath`, `html`)
- [ ] Subgroup files get an additional `group: string | null` field (the folder name; `null` for top-level files)
- [ ] **Hard cap depth at 1** — anything deeper than `agent-log/<group>/<file>.md` is a warning, ignored
- [ ] `relativePath` includes the group (e.g. `exploration/001_approach-a.md`) so URLs stay unique

## Routing (`src/pages/[...slug].astro`)

- [ ] Sub-doc routes for grouped agent-logs use the relative path:
  `/<base>/<issue-id>#agent-log/<group>/<filename>` (URL-encode the slash if needed, or use `--` as the separator)
- [ ] Existing flat URLs continue to work

## Sidebar (`DetailBody.astro`)

- [ ] In the "Agent log" section, render groups as nested collapsible sub-sections
- [ ] Top-level (ungrouped) files render at the top of the section, before any group sub-sections
- [ ] Group counts mirror the subtask counts pattern (`X/Y` or just total)
- [ ] Default state: groups collapsed, top-level files visible

## Helper scripts (extends [subtask 06](./06_documentation-and-skills.md))

- [ ] `agent-logs.mjs <issue-id> [--group exploration]` — filter to one subgroup
- [ ] `add-agent-log.mjs ... [--group <name>]` — write into a subgroup; auto-creates the folder
- [ ] When `--group` is omitted, write to `agent-log/` root (current behaviour)

## Why one level only, not unlimited

Two reasons:

1. **Cognitive cost** — past one level of nesting, the agent has to reason about path structure. Flat-with-groups is "what folder" — easy. Nested-deep is "what tree" — bug-prone.
2. **No real benefit** — long iteration histories want grouping (success vs. failure, exploration vs. implementation). They don't want hierarchy. If a subgroup itself outgrows flat, that's a sign to split the issue, not to nest deeper.

## Out of scope

- Cross-issue agent-logs / shared logs across multiple issues
- Auto-grouping by status (e.g. all `failed` → `failed/` folder) — agent picks the group name explicitly
- Renaming or moving agent-logs between groups — append-only by design
