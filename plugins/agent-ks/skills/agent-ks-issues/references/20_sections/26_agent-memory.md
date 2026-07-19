# Agent-memory — `agent-memory/` — always on

AI-mutable working state for **this** issue — durable facts worth not rediscovering.
Free-form, agent-managed, issue-scoped. **Maintain it continuously during any work on
the issue**, not only inside a named agent-log activity: the log records *what
happened*; memory holds *what's still true*.

## Shape — index + topic files (skills-style progressive disclosure)

```
agent-memory/
├── memory.md            ← the INDEX / entry point — always read first, pinned first
├── gotchas.md           ← topic file: one coherent topic each
├── decisions.md
└── 01_context/          ← folders allowed (same nested walk, up to 5 levels) when a topic outgrows a file
    └── 01_env.md
```

- **`memory.md` is the entry point** — a small, cheap-to-read index, one line per
  topic: `- [Gotchas](gotchas.md) — <one-line hook>`. Load the index, then read only
  the topic files relevant to the task. Content never lives in the index — it's a map,
  not a store.
- **Topic files** hold the facts, one coherent topic each. Numeric prefixes are
  optional and usually pointless — memory is a map, not a sequence; name by topic.

## Rules

- **Fully agent-autonomous.** Decide what to write, rewrite, or delete without asking
  (unless the user directs otherwise). **Mutable in place, not append-only** — wrong
  memories get corrected or removed, not amended.
- **What belongs:** gotchas, environment quirks, "this approach is dead because…",
  decisions not to re-litigate, expensive-to-find codebase pointers.
- **What doesn't:** anything the repo, git history, issue body, or notes already
  record — memory complements those, never mirrors them (mirrors rot).
- **Issue-scoped.** Complements your global memory, never replaces it. When an issue
  closes, its memory stays — useful if the work reopens.
- **vs `notes/`:** same free-form feel, different owner and durability — notes are
  human-curated product; memory is the AI's scratchpad.

## Recipe

When you discover something the next agent would waste time rediscovering: create
`agent-memory/` (if absent) with a `memory.md` index, write the fact into the right
topic file, and add/refresh its index line. Update stale entries in place.
