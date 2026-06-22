# Folder & file layout

The on-disk skeleton every tracker and issue follows. (Numbering rules for subtasks live in [23_subtasks.md](23_subtasks.md); for notes/agent-log in [22_notes.md](22_notes.md) / [24_agent-logs.md](24_agent-logs.md).)

Every tracker has the same skeleton:

```
<tracker-base>/                                  ← e.g. data/todo/
├── settings.json                                ← TRACKER VOCABULARY (status, priority, component, labels)
└── <YYYY-MM-DD-slug>/                           ← one folder per issue
    ├── settings.json                            ← issue metadata
    ├── issue.md                                 ← main body (the goal / context)
    ├── comments/                                ← chronological discussion (flat)
    │   └── NNN_<date>_<author>.md
    ├── subtasks/                                ← atomic units of work (up to 2 subfolder levels)
    │   ├── NNN_<slug>.md                        ← root-level leaf
    │   └── NNN_<group>/                         ← optional grouping folder (label only, no body file)
    │       ├── settings.json                    ← optional — { "title": "..." } overrides slug-derived label
    │       ├── NNN_<slug>.md                    ← level-1 leaf
    │       └── NNN_<subgroup>/
    │           └── NNN_<slug>.md                ← level-2 leaf (deepest accepted)
    ├── notes/                                   ← supporting design docs (up to 2 subfolder levels)
    │   ├── <slug>.md                            ← root-level note
    │   └── <group>/
    │       ├── <slug>.md                        ← level-1 note
    │       └── <subgroup>/
    │           └── <slug>.md                    ← level-2 note (deepest the loader accepts)
    └── agent-log/                               ← AI iteration audit trail (up to 2 subfolder levels)
        ├── <slug>.md                            ← root-level entry (NNN_ prefix optional)
        └── <group>/
            ├── <slug>.md
            └── <subgroup>/
                └── <slug>.md
```

**Folder naming regex:** `^\d{4}-\d{2}-\d{2}-[a-z0-9-]+$` (date + kebab-case slug).

**Stray root-level `.md` inside an issue folder is a warning.** Surface it to the user — don't silently include or ignore. The only expected root files are `issue.md` and `settings.json`.

## Subfolder rules (`subtasks/`, `notes/`, `agent-log/`)

- Up to **2 levels of nesting** (`<group>/<subgroup>/<file>.md`). Anything deeper is logged as a warning by the loader and silently skipped — never relied on. If you reach for a third level, that's the signal to split the issue, not to nest deeper.
- **Files and folders can mix at every level** that allows folders. So `notes/intro.md` can sit beside `notes/design/`, and `notes/design/overview.md` can sit beside `notes/design/phase-1/`. Only the deepest level (level 2) is files-only.
- **`comments/` stays flat** — no subfolders.

## URL shapes

| Content | URL |
|---|---|
| Issue | `/<tracker>/<issue>` |
| Subtask | `/<tracker>/<issue>/subtasks/[<group>/[<subgroup>/]]<slug>` |
| Note | `/<tracker>/<issue>/notes/[<group>/[<subgroup>/]]<slug>` |

The ordering prefix (`NN_`/`NNN_`) is **stripped from the URL slug** — same as docs (see `references/layouts/docs-layout.md`). `subtasks/020_implementation/010_backend.md` → `…/subtasks/implementation/backend`.
