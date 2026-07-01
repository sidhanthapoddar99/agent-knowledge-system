---
color: var(--color-success)
---

# Agent Memory

**Scope:** AI-mutable working state for this issue — durable facts worth not rediscovering.
Free-form, always-on, agent-managed, issue-scoped.

## Shape — index + topic files (skills-style progressive disclosure)

```
agent-memory/
├── memory.md            ← the INDEX / entry point — always read first, pinned first in the sidebar
├── gotchas.md           ← topic file: one coherent topic each
├── decisions.md
└── 01_context/          ← folders allowed (same 2-level walk) when a topic outgrows a file
    └── 01_env.md
```

- **`memory.md` is the entry point.** A small, cheap-to-read index: one line per topic —
  `- [Gotchas](gotchas.md) — <one-line hook>` — so an agent loads the index, then reads
  *only* the topic files relevant to the task. Same pattern as a skill (`SKILL.md` →
  `references/`): navigation at the root, depth on demand. Content never lives in the
  index — it's a map, not a store.
- **Topic files** hold the facts, one coherent topic each. `NN_` prefixes are **optional
  and usually pointless** here — memory is a *map*, not a sequence; name by topic
  (`gotchas.md`), not by order.
- **Why this shape:** reading everything every session wastes context; a monolith makes
  edits archaeological. Index + topics keeps recall cheap (index scan → targeted read) and
  edits surgical (rewrite one topic file in place).

## Decided

- **Fully agent-autonomous.** The agent decides what to write, rewrite, or delete —
  without asking — unless the user directs otherwise. **Mutable in place, not
  append-only**: wrong memories get corrected or removed, not amended.
- **Always-on.** Maintained continuously during *any* work on the issue, not only inside a
  named agent-log activity. (Agent-log records *what happened*; agent-memory holds *what's
  still true*.)
- **What belongs:** gotchas, environment quirks, "this approach is dead because…",
  decisions the agent must not re-litigate, pointers into the codebase that were expensive
  to find. **What doesn't:** anything the repo, git history, issue body, or notes already
  record — memory complements those, it never mirrors them (mirrors rot).
- **Issue-scoped.** Complements global agent memory; never replaces it. When an issue
  closes, its memory stays as part of the record — useful if the work reopens.
- **UI: `memory.md` pins first** in the sidebar (it's the section's entry point, like
  `issue.md` is the issue's); everything else follows the normal ordering chain.
