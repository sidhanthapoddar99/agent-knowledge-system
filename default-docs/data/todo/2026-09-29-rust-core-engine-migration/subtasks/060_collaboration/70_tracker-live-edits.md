---
title: "Tracker live edits — status, labels and comments, changed from the page, live for everyone"
status: open
---

In a shared tracker, a person should be able to change an issue's status or labels, or add a comment, straight from the issue page, and everyone on the site should see it at once. These are structured changes to `settings.json` files, frontmatter and the `comments/` folder, so they must not go through free-text editing. This leaf adds a small set of tracker operations to `/api` that call **the same writers the CLI uses** (`issue set-state`, `issue add-comment`), then lets the watcher push the result to every open page.

# 01 To Do
- [ ] **Operations** (JSON requests through [050/20](../050_server/20_websocket-api.md)), each validated by the core against the tracker's vocabulary:
      | Op | Params | Writes |
      |---|---|---|
      | `tracker.set-status` | `issue`, optional `subtask` or `stage` path, `status` | The issue's `settings.json`, or the subtask's frontmatter |
      | `tracker.set-labels` | `issue`, `labels[]` | The issue's `settings.json` |
      | `tracker.set-priority` | `issue`, `priority` | The issue's `settings.json` |
      | `tracker.add-comment` | `issue`, `body` | A new `comments/NNN_<date>_<slug>.md`, numbered by the core |
- [ ] **One implementation.** Move the CLI's writers (today in `scaffold.rs`) into the core during [070/20](../070_cli/20_content-commands-port.md), preserving JSONC comments and formatting as they do today, and call them from both the CLI and these operations.
- [ ] **Authorship.** A comment's `author` is the session's display name plus the key label (`Asha (key: design-team)`); the owner on localhost uses the machine setting name. Record every operation for [060/90](./90_git-attribution.md).
- [ ] **Roles:** `edit` and `owner` only.
- [ ] **Live update.** Write through the atomic path with echo recording; the watcher then pushes `changed` for the issue page and the issues index, so every open tab refreshes (filters and counts included) without extra code.
- [ ] **Conflicts.** Each op carries the hash of the file it changes; a changed file returns `conflict` and the UI refreshes and asks again.
- [ ] **The UI controls** (status and label pickers, the comment box) belong to the issues layout ([100/25](../100_layouts/25_issues-layouts.md)); this leaf provides the operations and a typed client helper.

## Guardrails
- The comment op is the one place a human action creates a file; it creates only comment files, only through the core's scaffolder. No other file creation over the socket.
- Values come from the tracker's vocabulary; an unknown status or label is refused, never added.
- The tracker's closing rule is about AI agents; people using the page may set any status their role allows.

## Done when
- Tests: each op writes the same bytes as the equivalent `agentks issue …` command on a fixture tracker (byte-identical, JSONC comments kept); an unknown status is refused; a `read` session is refused; a stale hash returns `conflict`.
- End to end: two browsers on the issues index; one changes a status; the other's table and filter counts update within a second.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References

**Where:** main repository — writers in `agentks-content` under `apps/agentks-engine/`, operations in the server crate, the client helper in `apps/agentks-client/src/data/`.

**Read first:**
- [Rust CLI, section 05](../../notes/02_engine/05_rust-cli.md) — the tracker writers carried over.
- [Content format](../../notes/02_engine/01_content-format.md) — the tracker files and vocabulary.
- Today's writers: [scaffold.rs](../../../../../../agent-ks-cli/src/scaffold.rs) (`set_state`, comments), [issues.rs](../../../../../../agent-ks-cli/src/issues.rs).
- The tracker rules in the [agent-ks-issues skill](../../../../../../plugins/agent-ks/skills/agent-ks-issues/SKILL.md).

**Depends on:** [070/20](../070_cli/20_content-commands-port.md), [050/35](../050_server/35_file-writes-and-echo-suppression.md), [060/40](./40_access-keys.md).
**Unblocks:** [100/25 issues layouts](../100_layouts/25_issues-layouts.md) (the controls), [060/95](./95_collaboration-tests.md).

# 04 Decisions
- Decided (claude, 2026-09-30): tracker changes from the page go through dedicated operations that call the CLI's writers in the core, not through free-text editing of `settings.json`.
- Decided (claude, 2026-09-30): adding a comment is the one human action that creates a file, limited to the comment scaffolder.

# 05 Notes & Analysis

## Watch out
- The editing note says `settings.json` is not editable in place. That stays true: these operations change specific fields through validated writers; the file is never opened as text.
