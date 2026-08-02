---
title: "Agent-log numbering — the run's own slots get prefixes"
---

# The change, in one block

```
agent-log/
└── 010_lp_implement-sections/     ← an ACTIVITY (a run). 0NN_<code>_<name>/
    ├── settings.json              ← optional, unchanged
    ├── 01_summary.md              ← was  summary.md
    ├── 02_working/                ← was  working/
    ├── 03_debrief/                ← was  debrief/
    └── 100_wf_codec-migration/    ← a CHILD activity. Prefix ≥ 100
        ├── 01_summary.md
        ├── 02_working/
        └── 03_debrief/
```

**Sid, 2026-08-03:**

> *"agent log — summary → 01 summary, working → 02 working, debrief → 03
> debrief. subsequent nested agent logs NXX where N>=1 thats it."*

# Why it is worth doing

**The three slots already had a fixed order and no way to say so.** `summary`,
`working`, `debrief` is the order they are meant to be read in, and the sidebar
was enforcing it with a hand-written pin-summary-first rule plus a reserved-name
set. The prefix states the order in the one place every other section already
states it: the filename.

**It makes the read-time discriminator STRUCTURAL rather than a name list.**
Before, a folder inside an activity was a reserved slot if its name was in
`{working, debrief}` and a child activity otherwise. That is a rule the code
carries and the filesystem does not. After, it is arithmetic:

| Prefix on a folder inside an activity | What it is |
|---|---|
| `< 100` (`02_`, `03_`) | one of the run's own slots |
| `≥ 100` (`100_`, `210_`) | a **child activity** |

Nothing can be ambiguous, and a fourth slot can be added later without teaching
any code a fourth name. This is the same preference applied everywhere in this
issue: **prefer making an invariant structural over documenting it.**

**It removes a naming collision that could not be expressed.** Under the old
rule a child activity literally could not be called `working` — a restriction
that existed, was never written down, and now does not exist.

# The rules, exactly

1. **`01_summary.md`** — the run's conclusive record. Required. It is the file
   `agent-logs:` references in a plan stage point at, and the file the sidebar
   shows first.
2. **`02_working/`** — one file per round, plus a file per agent that produced
   something substantial.
3. **`03_debrief/`** — what leaves the run.
4. **A child activity is any folder whose numeric prefix is `≥ 100`**, named
   `NXX_<code>_<name>/` exactly like a top-level activity. Nesting is capped by
   the loader's existing depth limit; nothing about that changes.
5. **Activities themselves keep `0NN_<code>_<name>/`** — `010`, `020`, `030`.
   Unchanged.
6. **Milestone files inside `02_working/` keep `NNN_`** — first two digits the
   round, last the file within it. Unchanged.

**The two bands do not overlap by accident.** Slots are `01`–`03` with room to
`99`; children start at `100`. A tracker that grows a fourth slot uses `04_`.

# What has to change

| Surface | What |
|---|---|
| **Framework code** | `loaders/issues.ts` (reserved-folder set → prefix rule, pinned summary), `SubdocTree.astro`, `DetailSidebar.astro` |
| **CLI** | `new-agent-log.mjs` (scaffold), `check.mjs` (validate), `new-iteration.mjs`, `_manifest.mjs`, `_links.mjs` |
| **In-app guide** | `guide.ts` — the Agent log section |
| **Skill** | `agent-ks-issues` SKILL.md + `references/20_sections/24_agent-logs.md`, and anywhere else naming the three |
| **User guide** | `19_issues/`, `15_writing-content/10_naming-and-sidebar/05_issues.html` |
| **On disk** | 5 `summary.md`, 5 `working/`, 4 `debrief/` — renamed with `agent-ks move`, which is link-aware. **114 inbound links** mention `summary.md` |
| **Migration** | A script, so a consumer tracker can be converted rather than hand-edited |

# The one real hazard

**The renames must be done by ONE actor, sequentially.** `agent-ks move` rewrites
links across the whole content root on every invocation; two moves running
concurrently can each rewrite a file the other is mid-way through. Prose edits
are safely parallel — renames are not.

# What this does NOT change

- Activity folder names (`0NN_<code>_<name>/`) and their kind codes.
- Milestone numbering inside `02_working/`.
- `settings.json` inside an activity, and the status it carries.
- The depth cap, and the warning when it is exceeded.
