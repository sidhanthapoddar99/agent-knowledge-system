---
title: "Disk and live document merge — an AI edit on disk joins the open editor"
status: open
---

The AI is the main editor, so a file often changes on disk while a person has it open in the page. Today's editor resets the whole document when that happens, and unsaved typing can be lost. This leaf makes an outside change merge into the live document as an ordinary edit: the person sees the AI's change appear where it happened, their own unsaved typing stays, and nobody's work is overwritten. It is needed from Phase 2, with a single user.

# 01 To Do
- [ ] **Hook into the watcher.** When a batch contains a file that has a live document ([060/10](./10_yrs-document-per-file.md)), and the change is not the server's own echo ([050/35](../050_server/35_file-writes-and-echo-suppression.md)), call `merge_from_disk(doc, new_text, new_hash)`.
- [ ] **Three-way merge.** `base` = the text last read from or written to disk; `ours` = the document's current text; `theirs` = the new disk text.
    - [ ] `ours == base` (no unsaved typing): apply `diff(ours → theirs)` to the `Y.Text` as insert and delete operations, in one transaction tagged with origin `disk`.
    - [ ] Otherwise run a line-based diff3 (for example with the `similar` crate). Non-overlapping changes merge cleanly; apply `diff(ours → merged)` as above.
    - [ ] Overlapping changes: keep the person's text in the document, apply the rest of the disk change, mark the document `conflict` and push a notice to its editors with the disk version, so they can choose "take the disk version" or keep theirs. The next write-back then uses the new disk hash as its base.
    - [ ] Set `base = theirs` after the merge.
- [ ] **No write-back for disk-origin changes.** A transaction with origin `disk` does not mark the document dirty; if nothing else changed, no save follows.
- [ ] **Deleted or moved file.** Close the document, tell its editors ("the file was moved to …" when the index knows the new path, or "deleted"), and keep their unsaved text in the client for copying. Never recreate the file.
- [ ] **Non-text formats.** Diagram documents ([060/80](./80_diagram-collaboration.md)) merge by their own rules: element-wise for Excalidraw and tldraw, whole-file replace with a conflict notice for draw.io.
- [ ] **Tests** below.

## Guardrails
- Never lose typed text: when unsure, keep the person's version and tell them.
- Never write the merged result to disk just because a merge happened; only real typing triggers autosave.
- The merge runs on the blocking pool; a large file must not stall the socket.

## Done when
- Tests: with no unsaved typing, an outside edit appears in the document and no save follows; with unsaved typing in paragraph 1 and an outside edit in paragraph 5, both survive and the next autosave writes both; overlapping edits raise the conflict notice and keep the person's text; deleting the open file closes the document with a notice.
- An end-to-end run: the AI (a script) appends a section while a person types elsewhere; the file on disk ends with both, and no conflict is shown.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References

**Where:** main repository, `apps/agentks-engine/`, the sync module.

**Read first:**
- [Editor engines, section 06](../../notes/03_frontend/03_editor-engines.md) — "outside edits merge instead of clashing".
- [Sync engine and server, section 05](../../notes/02_engine/04_sync-engine-and-server.md) — echo suppression, no lost writes.
- Today's reset-on-outside-change behaviour, to replace: [editor-store.ts](../../../../../../agent-ks-engine/src/dev-tools/server/editor-store.ts).

**Depends on:** [060/10](./10_yrs-document-per-file.md), [050/30](../050_server/30_watcher-and-push.md), [050/35](../050_server/35_file-writes-and-echo-suppression.md).
**Unblocks:** [110/40](../110_editing/40_save-path-and-sync.md) (the client shows the conflict notice), [060/95](./95_collaboration-tests.md).

# 04 Decisions
- Decided (claude, 2026-09-30): outside changes are merged three-way into the live document; on overlap the person's text is kept and a conflict notice shows the disk version.
- Decided (claude, 2026-09-30): merges from disk never trigger a write-back.

# 05 Notes & Analysis

## Watch out
- A diff computed on lines then applied as character offsets must use UTF-16 or UTF-8 offsets consistently with `yrs` (`yrs` uses UTF-8 offsets by default in Rust; the JavaScript side counts UTF-16). Test with emoji and non-Latin text.
