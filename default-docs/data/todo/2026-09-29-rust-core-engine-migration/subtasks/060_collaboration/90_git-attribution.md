---
title: "Git attribution — who edited what, carried into commits"
status: open
---

With several people editing one project through access keys, a commit should say who changed what. agentks never commits on its own; the owner (or the owner's AI) commits. So this leaf keeps a journal of who edited which file through the server, and makes the guarded `agentks git commit` (and the skills) add trailers naming those people. There is no identity beyond an access key, so a person is named by their key's label and the display name they typed.

# 01 To Do
- [ ] **The edit journal** `~/.agentks/share/<project key>.edits.jsonl`, one line per write-back or tracker operation: `{ "time", "path", "key_id", "label", "name", "op" }`. The owner's own edits are recorded as `owner`. Append-only, owner-readable only.
- [ ] **What counts:** successful writes from [050/35](../050_server/35_file-writes-and-echo-suppression.md), live-document write-backs ([060/10](./10_yrs-document-per-file.md)) — attributed to every connection that changed the document since the last write-back — and tracker operations ([060/70](./70_tracker-live-edits.md)).
- [ ] **`agentks share log [--since REF] [--json]`**: who edited which files since a git ref (default: since the last commit touching each file).
- [ ] **Trailers in `agentks git commit`:** for the paths being committed, collect the people who edited them since their last commit and add one trailer each: `Edited-by: Asha (agentks key design-team)`. No invented e-mail addresses.
- [ ] **Skill guidance:** the agentks skills tell an AI committing shared work to run `agentks share log` and include the same trailers ([130/10](../130_ai-plugins/10_agentks-plugin-port.md)).
- [ ] **Prune** journal lines older than the newest commit of their file when `share log` runs, so the journal stays small.

## Guardrails
- agentks never commits, pushes or amends on its own.
- The journal lives in the machine home, never in the project.

## Done when
- Tests: two keys edit two files; `share log --json` lists both correctly; `agentks git commit <path>` adds exactly the trailers for the people who edited that path.
- The journal file has mode 600 and never contains key secrets or file contents.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References

**Where:** main repository, `apps/agentks-engine/` — journal in the server crate; `share log` and the commit trailers in the CLI crate.

**Read first:**
- [Sync engine and server, section 06](../../notes/02_engine/04_sync-engine-and-server.md) — "edits are attributed in git to the key's label".
- [Rust CLI, section 05](../../notes/02_engine/05_rust-cli.md) — the guarded `git commit`.
- Today's guarded commit: [extras.rs](../../../../../../agent-ks-cli/src/extras.rs).

**Depends on:** [060/40](./40_access-keys.md), [060/10](./10_yrs-document-per-file.md), [070/20](../070_cli/20_content-commands-port.md).
**Unblocks:** [130/10](../130_ai-plugins/10_agentks-plugin-port.md) (skill text), [060/95](./95_collaboration-tests.md).

# 04 Decisions
- Decided (claude, 2026-09-30): attribution is a journal in the machine home plus `Edited-by:` trailers added by `agentks git commit`; no automatic commits and no invented e-mail addresses.

# 05 Notes & Analysis

## Watch out
- A live document edited by two people between write-backs attributes that write-back to both. That is coarse but honest; per-character authorship is not worth the cost.
