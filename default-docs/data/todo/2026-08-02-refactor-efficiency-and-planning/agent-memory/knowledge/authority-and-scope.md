---
title: "Authority — who does what"
---

# Authority

Set by Sid across 2026-08-02. **Check here before assuming permission**; several
of these reverse the project default.

## Commits

| | |
|---|---|
| **Allowed** | Cut a branch and commit on it |
| **Not allowed** | Micro commits. Group the work |
| **Never** | Merging up, or committing to `main` |

Six commits from earlier in the day sit unpushed on `main` — they predate the
branch instruction and are Sid's to place.

## Held until Sid says go — not part of any long-running loop

**The version bump and the migration script are mine to write, but only on his
word.** They are not autonomous work and must not be swept into a loop:

- [`050`](../../subtasks/050_version-bump.md) — **released 2026-08-03 on his
  word**: engine `0.2.0`, floor `0.2.0`, plugin `0.7.0`, `site.yaml` declaration
  `0.2.0`. He chose `0.2.0` over the drafted `0.1.3` / `0.1.4`
- [`100`](../../subtasks/040_execution/100_migration-script.md) — the script that
  rewrites 78 files onto the canonical seven statuses

**The hold is spent, not lifted.** It covered this release; the next bump is held
the same way.

## Releases — standing rule

The engine, plugin, and Rust CLI have independent versions, namespaced tags,
release-note directories, and payloads. The current policy is
[`RELEASING.md`](../../../../../../RELEASING.md); the engine note shape is in
[`agent-ks-engine/release-notes/README.md`](../../../../../../agent-ks-engine/release-notes/README.md).

**Writing the note is mine; tagging and publishing are not.** The tag lands on
`main` after the merge, and pushing it is Sid's call.

## Sid's alone

- `done` and `dropped` on any subtask. My ceiling is `review`
- `~/.claude/CLAUDE.md` — his personal global file. Propose the diff, never edit
- Anything he has said he will do himself

## The NeuraSutra repos

**Out of scope for this session** and enforced by tooling — writes into
`neurasutra-docs` are rejected outright. Reading is fine.

Everything owed to that project is queued in
[`060`](../../subtasks/060_sidequest-neurasutra.md) and runs last, after the
upstream rules ship. Do not open a worktree to get around the guard: the work is
sequenced last for a reason, not blocked by accident.
