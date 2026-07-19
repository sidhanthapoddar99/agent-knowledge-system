---
title: 07 · Agent Memory
description: AI-mutable working state for the issue — a pinned memory.md index plus topic files, edited in place
sidebar_position: 7
---

# Agent Memory

The `agent-memory/` folder is the AI's **issue-scoped working state** — durable facts worth not rediscovering: gotchas, dead ends, decisions not to re-litigate, pointers that were expensive to find. Where `agent-log/` records *what happened*, agent-memory holds *what's still true*.

## Shape — index + topic files (skills-style progressive disclosure)

```
agent-memory/
├── memory.md            ← the INDEX / entry point — always read first, pinned first in the sidebar
├── gotchas.md           ← topic file: one coherent topic each
├── decisions.md
└── 01_context/          ← folders allowed (nested up to 5 levels) when a topic outgrows a file
    └── 01_env.md
```

- **`memory.md` is the entry point** — a small, cheap-to-read index: one line per topic (`- [Gotchas](gotchas.md) — <one-line hook>`). An agent loads the index, then reads *only* the topic files relevant to the task — same pattern as a skill (`SKILL.md` → `references/`). Content never lives in the index; it's a map, not a store.
- **Topic files** hold the facts, one coherent topic each. `NN_` prefixes are optional and usually pointless here — memory is a map, not a sequence; name by topic (`gotchas.md`), not by order.
- **Why this shape:** reading everything every session wastes context; a monolith makes edits archaeological. Index + topics keeps recall cheap and edits surgical.

## The rules

- **Fully agent-autonomous.** The agent decides what to write, rewrite, or delete — without asking — unless the user directs otherwise.
- **Mutable in place, not append-only.** Wrong memories get corrected or removed, not amended. (This is the lifecycle difference that makes it a sibling of, not part of, `agent-log/`.)
- **Always-on.** Maintained during *any* work on the issue, not only inside a named agent-log activity.
- **What belongs:** gotchas, environment quirks, "this approach is dead because…", decisions the agent must not re-litigate, expensive-to-find code pointers.
- **What doesn't:** anything the repo, git history, issue body, or notes already record — memory complements those, it never mirrors them (mirrors rot).
- **Issue-scoped.** Complements global agent memory, never replaces it. When an issue closes, its memory stays as part of the record — useful if the work reopens.

## Rendering

Sidebar section after Agent log (database icon); **`memory.md` pins first**, everything else follows the normal ordering. Each file gets its own URL: `/<tracker>/<issue>/agent-memory/<name>`.

## See also

- [Agent Log](./agent-log) — what happened (vs what's still true)
- [Notes](./notes) — human-curated output; same free-form feel, different owner and durability
- [Using with AI](../using-with-ai) — agent discipline
