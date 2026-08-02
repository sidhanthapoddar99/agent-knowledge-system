# Agent-memory — `agent-memory/` — memory

AI-mutable working state for **this** issue: what is worth remembering across it, and
durable facts worth not rediscovering. Agent-managed, issue-scoped. **Maintain it
continuously during any work on the issue**, not only inside a named agent log — the log
records *what happened*; memory holds *what is still true*.

| Holds | Does not hold |
|---|---|
| What is **true and binding** for this issue | **Decisions.** Those are the issue's `notes/` |
| **How we got here** — what was tried, what landed, what was parked | **The plan.** Order is `plans/` |
| Gotchas, environment quirks, dead approaches, expensive-to-find pointers | Anything the repo, git history, `issue.md` or `notes/` already records |
| An **index** that routes | Any content inside that index |

## Shape — an index plus two lifecycle buckets

```
agent-memory/
├── memory.md          INDEX ONLY — routes, stores nothing. Pinned first.
├── knowledge/         WHAT IS TRUE      · corrected in place
│   └── <topic>.md       gotchas · environment · key facts
└── history/           HOW WE GOT HERE   · write-once, never goes stale
    └── <subject>.md
```

**Bucketed by LIFECYCLE, not by subject** — each folder has exactly one staleness rule,
and that rule is what tells a cold reader whether to trust the file.

| Bucket | Answers | Goes stale? |
|---|---|---|
| `memory.md` | where is everything | it's a map — if it's wrong, it's broken |
| `knowledge/` | what is true and binding here | only if not corrected |
| `history/` | how we got here | **no** — what happened can't expire |

**Precedence when they disagree: `knowledge/` > `history/`**, and the loser gets
corrected rather than left to contradict.

**There is no live bucket, and nothing replaces it.** What is left and in what order is
the plan's ([28_plans.md](28_plans.md)), which is one click away in the sidebar. The
temptation is to let `memory.md` grow a "current state" section to fill the gap — that
section competes with the plan for the same job and loses silently. The index stays a
map.

### Grow into it — don't scaffold it empty

| Tier | Shape | When |
|---|---|---|
| 0 | `memory.md` alone | small issue, a handful of facts |
| 1 | + topic files flat at the root | **most issues stop here** |
| 2 | + `knowledge/` and `history/` | the flat files outgrow the root, and "true now" starts fighting "how we got here" |

## `memory.md` — the index

One line per topic file: `- [Gotchas](knowledge/gotchas.md) — <one-line hook>`. Load the
index, then read only what the task needs — same pattern as a skill (`SKILL.md` →
`references/`).

- **Content never lives in the index.** Map, not store.
- **A superseded section gets DELETED, not annotated as stale.** If it is worth keeping,
  it belongs in `history/`.
- **Any bucket beyond the standard two declares its lifecycle on its index line.** A
  folder whose staleness rule nobody knows is what this shape prevents.

## `knowledge/` and `history/`

- **`knowledge/`** — gotchas, environment quirks, "this approach is dead because…",
  expensive-to-find pointers. One topic per file, **named by topic**; `NN_` prefixes are
  pointless here (map, not sequence). Files sit at the root of `agent-memory/` until the
  listing stops being readable, then move into `knowledge/`.
- **`history/`** — the chronology: what was tried, what landed, what was parked and why.
  **Write-once.**

## Rules

- **Fully agent-autonomous.** Decide what to write, rewrite or delete without asking
  (unless the user directs otherwise). **Mutable in place, not append-only** — wrong
  memories get corrected or removed, never amended with a note saying they were wrong.
- **What doesn't belong:** anything the repo, git history, issue body, notes or plans
  already record. Memory complements those, never mirrors them — mirrors rot.
- **Issue-scoped.** Complements your global memory, never replaces it. When an issue
  closes its memory stays, useful if the work reopens.
- **vs `notes/`:** same free-form feel, different owner and durability. Notes are curated
  product and hold the decisions; memory is your working state.

## Recipe

When you discover something the next agent would waste time rediscovering, write it into
the right bucket and add or refresh its index line. Update stale entries in place.

`agent-ks check issues` lints the shape.
