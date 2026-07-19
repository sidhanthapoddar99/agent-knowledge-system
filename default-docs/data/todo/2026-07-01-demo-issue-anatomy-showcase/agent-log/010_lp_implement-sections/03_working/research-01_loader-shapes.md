---
agent: claude-opus-4-8
date: 2026-07-01
---
# Research — how the three freeform readers differ

Raw notes gathered while deciding whether brainstorm / agent-memory could reuse the notes
reader. This is a **`03_working` slot in folder form** — promoted from a single file
because it holds more than one byproduct.

- All three sections do a folder-then-file walk; only subtasks attach group-label metadata.
- Notes + brainstorm + agent-memory carry no per-file state → a single `readFreeformDocs`
  covers them.
- agent-log needs `iteration` / `status` parsing → stays its own reader.

**Feeds →** the curated decision in `notes/01_decided-architecture.md` (raw here, conclusion there).
