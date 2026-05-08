# Subtask 2-level grouping — test fixture

A small fixture issue exercising the optional 2-level grouping under `subtasks/`. Keep this around so loader / routing / UI / CLI all keep parsing the deepest path.

Layout under test:

```
subtasks/
├── 01_setup.md                          ← root-level leaf
├── 02_implementation/                   ← level-1 group (with settings.json title override)
│   ├── 01_backend.md
│   └── 02_polish/                       ← level-2 group (slug-derived label)
│       ├── 01_styles.md
│       └── 02_a11y.md
└── 03_docs.md                           ← root-level leaf, sorts after the group
```

This fixture is referenced from `2026-04-10-issues-layout/subtasks/22_subtask-subgrouping-2-level-tree.md`.
