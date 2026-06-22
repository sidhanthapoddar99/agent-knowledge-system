---
iteration: 1
agent: claude-opus-4-8
status: success
date: 2026-06-23
---

Goal: Subtask 01 — decide the command naming model (the gate for per-type commands). Approach: weighed flat docs-* (A) vs docs <group> <verb> subcommands (B) against the growing ~20-command set and the discoverability goal. Result: DECIDED **B + flat aliases** — subcommands primary, every docs-* kept as a zero-breakage alias; recorded with rationale + implementation note in notes/03 and agent-memory. Manifest will key on canonical subcommand path with a separate alias→canonical map. Next: subtask 14 (harness), then 02/03 foundation.
