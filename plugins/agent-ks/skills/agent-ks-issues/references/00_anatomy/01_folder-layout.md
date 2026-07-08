# Folder & file layout

The on-disk skeleton every tracker and issue follows. (Numbering rules for subtasks live in [23_subtasks.md](../20_sections/23_subtasks.md); for notes/agent-log in [22_notes.md](../20_sections/22_notes.md) / [24_agent-logs.md](../20_sections/24_agent-logs.md).)

Every tracker has the same skeleton:

```
<tracker-base>/                                  ← e.g. data/todo/
├── settings.json(c)                             ← TRACKER VOCABULARY (status, priority, component, labels)
└── <YYYY-MM-DD-slug>/                           ← one folder per issue
    ├── settings.json                            ← issue metadata (+ optional agentLogKinds)
    ├── issue.md                                 ← main body (the goal / context)
    ├── glossary.md                              ← optional — this issue's colour legend / terms
    ├── comments/                                ← flat evolution log — NO subfolders
    │   └── NNN_<slug>.md                        ← NNN = the comment id (CLI-numbered)
    ├── brainstorm/                              ← active deliberation (up to 2 subfolder levels)
    │   ├── NN_<kind>_<slug>.md                  ← kind = full word (research/explore/idea/discuss), optional
    │   └── NN_<slug>/                           ← folder = one multi-file brainstorm thread
    │       └── 01_explore_options.md
    ├── notes/                                   ← finalized output + references (up to 2 levels)
    │   ├── <slug>.md                            ← prefix optional — curated reading order when used
    │   └── <group>/
    │       └── <slug>.md
    ├── subtasks/                                ← the plan (up to 2 subfolder levels)
    │   ├── NN_<slug>.md                         ← root-level leaf
    │   └── NN_<group>/                          ← grouping folder (label only, no body file)
    │       ├── settings.json                    ← optional — { "title": "..." } display title
    │       ├── NN_<slug>.md                     ← level-1 leaf
    │       └── NN_<subgroup>/
    │           └── NN_<slug>.md                 ← level-2 leaf (deepest accepted)
    ├── agent-log/                               ← execution record — activity folders
    │   └── NNN_<code>_<name>/                   ← kind code: lp/au/rf/it/wf (+ custom)
    │       ├── 00_goal.md                       ← pinned meta (01_summary, 02_task_list …)
    │       └── 101_<milestone>.md               ← MNN_ milestones, M ≥ 1
    └── agent-memory/                            ← AI working state (mutable, issue-scoped)
        ├── memory.md                            ← the index — read first, pinned first
        └── <topic>.md
```

**Folder naming regex:** `^\d{4}-\d{2}-\d{2}-[a-z0-9-]+$` (date + kebab-case slug).

**Stray root-level `.md` inside an issue folder is a warning.** Surface it to the user — don't silently include or ignore. The only expected root files are `issue.md`, `settings.json`, and the optional `glossary.md`.

## Subfolder rules (all content sections except `comments/`)

- Up to **2 levels of nesting** (`<group>/<subgroup>/<file>.md`). Anything deeper is logged as a warning by the loader and silently skipped — never relied on. If you reach for a third level, that's the signal to split the issue, not to nest deeper.
- **Files and folders can mix at every level** that allows folders. So `notes/intro.md` can sit beside `notes/design/`, and `notes/design/overview.md` can sit beside `notes/design/phase-1/`. Only the deepest level (level 2) is files-only.
- **`comments/` stays flat** — no subfolders, ever.
- **Sidebar counts:** subtask group folders show **done/total**; other sections show
  the plain descendant count. Ordering is ascending everywhere.

## URL shapes

| Content | URL |
|---|---|
| Issue | `/<tracker>/<issue>` |
| Subtask | `/<tracker>/<issue>/subtasks/[<group>/[<subgroup>/]]<slug>` |
| Note | `/<tracker>/<issue>/notes/[<group>/[<subgroup>/]]<slug>` |

The ordering prefix (`NN_`/`NNN_`) is **stripped from the URL slug** — same as docs (see the `agent-ks-docs` skill's `references/layouts/docs-layout.md`). `subtasks/020_implementation/010_backend.md` → `…/subtasks/implementation/backend`.
