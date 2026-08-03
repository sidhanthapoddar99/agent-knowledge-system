---
title: 07 · Agent Memory
description: AI-mutable working state for the issue — a pinned memory.md index plus two lifecycle buckets, knowledge and history
sidebar_position: 7
---

# Agent Memory

The `agent-memory/` folder is the AI's **issue-scoped working state**: what is worth
remembering across this issue, and the durable facts worth not rediscovering — gotchas,
dead ends, environment quirks, pointers that were expensive to find.

Where `agent-log/` records *what happened*, agent-memory holds *what is still true*.

## What it holds — and what it does not

| Holds | Does not hold |
|---|---|
| What is **true and binding** for this issue | **Decisions.** Those are the issue's [Notes](/user-guide/issues/sub-docs/notes) |
| **How we got here** — what was tried, what landed, what was parked | **The plan.** Order is [Plans](/user-guide/issues/sub-docs/plans) |
| Gotchas, environment quirks, dead approaches, expensive-to-find pointers | Anything the repo, git history, `issue.md` or notes already record |
| An **index** that routes | Any content inside that index |

## Shape — an index plus two lifecycle buckets

```
agent-memory/
├── memory.md          INDEX ONLY — routes, stores nothing. Pinned first.
├── knowledge/         WHAT IS TRUE      · corrected in place
│   ├── key-facts.md
│   └── gotchas.md
└── history/           HOW WE GOT HERE   · write-once, never goes stale
    └── <subject>.md
```

**The organising idea is lifecycle, not subject.** Each bucket has exactly one staleness
rule, and that rule is what tells a cold reader whether to trust the file:

| Bucket | Answers | Lifecycle | Goes stale? |
|---|---|---|---|
| `memory.md` | where is everything | rewritten as the map changes | it's a map — if it's wrong, it's broken |
| `knowledge/` | what is true and binding here | corrected in place, never amended | only if not corrected |
| `history/` | how we got here | written once, then left | **no** — a record of what happened can't expire |

**Precedence when they disagree: `knowledge/` > `history/`**, and the loser gets
corrected rather than left to contradict.

### There is no live bucket, and nothing replaces it

What is left, in what order, and who is blocked is the **plan's** job
([Plans](/user-guide/issues/sub-docs/plans)) — one click away in the sidebar, where plans list in plain
ascending prefix order and the active one is marked in bold rather than moved.

The temptation is to let `memory.md` grow a "current state" section to fill the gap.
Don't: that section competes with the plan for the same job and loses silently, because
nothing tells a reader which of the two is current. **The index stays a map.**

### Not every issue needs all of it

Grow into the shape; don't scaffold it empty.

| Tier | Shape | When |
|---|---|---|
| 0 | `memory.md` alone | a small issue — a handful of facts |
| 1 | `memory.md` + topic files flat at the root | **most issues stop here** |
| 2 | + `knowledge/` and `history/` | the flat topic files outgrow the root, and "what's true now" starts fighting "how we got here" |

## `memory.md` — the index

A small, cheap-to-read map: one line per topic file
(`- [Gotchas](knowledge/gotchas.md) — <one-line hook>`). An agent loads the index, then
reads *only* what the task needs — the same pattern as a skill (`SKILL.md` →
`references/`).

- **Content never lives in the index.** It is a map, not a store.
- **When a section is superseded, delete it** — don't annotate it as stale. If it is
  worth keeping, it belongs in `history/`.
- **Any bucket beyond the standard two must declare its lifecycle on its index line.** A
  folder whose staleness rule nobody knows is the thing this shape exists to prevent.

## `knowledge/` — what's true

The classic agent-memory content: gotchas, environment quirks, "this approach is dead
because…", expensive-to-find pointers. One coherent topic per file, **named by topic** —
`NN_` prefixes are pointless here, since this is a map, not a sequence.

Until they outgrow the root, these files sit at the root of `agent-memory/` next to
`memory.md`; promote them into `knowledge/` when there are enough that the folder
listing stops being readable.

## `history/` — how we got here

The chronology: what was tried, what landed, what was parked and why. **Write-once** — a
record of what happened doesn't expire, which is exactly what makes it safe to leave
alone.

## The rules

- **Fully agent-autonomous.** The agent decides what to write, rewrite or delete —
  without asking — unless the user directs otherwise.
- **Mutable in place, not append-only.** Wrong memories get corrected or removed, never
  amended with a note saying they were wrong. This is the lifecycle difference that
  makes agent-memory a sibling of, not part of, `agent-log/`.
- **Always-on.** Maintained during *any* work on the issue, not only inside a named
  agent log.
- **What doesn't belong:** anything the repo, git history, issue body, notes or plans
  already record — memory complements those, it never mirrors them (mirrors rot).
- **Issue-scoped.** Complements global agent memory, never replaces it. When an issue
  closes, its memory stays as part of the record — useful if the work reopens.

## Scaffolding

None, and deliberately so. When you discover something the next agent would waste time
rediscovering, write it into the right bucket and add or refresh its index line. Update
stale entries in place.

`agent-ks check issues` lints the shape.

## Rendering

Sidebar section after Agent log (database icon); **`memory.md` pins first**, everything
else follows the normal ordering. Each file gets its own URL:
`/<tracker>/<issue>/agent-memory/<path>`.

## See also

- [Plans](/user-guide/issues/sub-docs/plans) — what's left, in what order, and who's blocked
- [Agent Log](/user-guide/issues/sub-docs/agent-log) — what happened (vs what's still true)
- [Subtasks](/user-guide/issues/sub-docs/subtasks) — the source of truth for detail
- [Notes](/user-guide/issues/sub-docs/notes) — the decisions; same free-form feel, different owner and durability
- [Using with AI](/user-guide/issues/using-with-ai) — agent discipline
