---
title: "Docs: editing, the dev toolbar, sharing and multi-user editing"
status: open
---

In 1.0 a page is edited where it is read. The dev toolbar's Edit option turns the page into an editor with two modes, raw and live preview. The owner can share a running project with others through access keys, with no sign-in, and several people can edit one page at once and see each other's presence. This leaf documents all of it for users.

# 01 To Do
- [ ] **`50_editing-and-sharing/01_overview.md`** — reading is the default; editing is opt-in from the dev toolbar; the AI is the main author and people make small edits to existing files.
- [ ] **The dev toolbar** — what each tool does, which ones ship in 1.0 ([110/10](../110_editing/10_dev-toolbar.md)), that the toolbar is never part of a published site.
- [ ] **Editing a page** — Edit, raw and live preview, saving, what happens when the file changed on disk meanwhile (the conflict message), undo, editing an embedded diagram.
- [ ] **Editing diagrams** — each supported format and how its editor opens in place.
- [ ] **Sharing a project** — `agentks share` to create a key (read or edit role, a label), sending the link, revoking a key, `agentks start --share` for network access, why TLS needs a tunnel or proxy beyond a trusted network.
- [ ] **Editing together** — presence (names, cursors, selections), how changes merge, how edits are attributed in git (the key's label), what happens when the AI edits the same file on disk.
- [ ] **Security notes for owners** — who can reach the server, what a read key can and cannot do, what to do when a key leaks.

## Guardrails
- Group rules in [180/00 overview](./00_overview.md).
- Describe exactly the commands and flags the 1.0 binary has (check `agentks help share`); the share command's surface is still open in the notes.

## Done when
- The section exists under `docs/data/user-guide/50_editing-and-sharing/` and renders.
- Two people following only these pages can share a project on one network, edit one page together and see each other's presence.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Repository:** `NeuraLabsHQ/agent-knowledge-system`, folder `docs/data/user-guide/50_editing-and-sharing/`.
- **Read first:**
  - [Editor engines](../../notes/03_frontend/03_editor-engines.md) and [the dev toolbar](../../notes/03_frontend/05_dev-toolbar.md).
  - [Sync engine and server](../../notes/02_engine/04_sync-engine-and-server.md), sections 05 to 07 — saving, multi-user editing, access keys, security.
  - [Editing mode](../../brainstorm/02_future-stages/02_editing-mode.md).
- **Depends on:** the [110/00 editing](../110_editing/00_overview.md) and [060/00 collaboration](../060_collaboration/00_overview.md) groups.
- **Unblocks:** [200/20 switch-over](../200_launch/20_switch-over.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): editing is in place, with two modes only, raw and live preview; humans edit existing files only ([editor engines](../../notes/03_frontend/03_editor-engines.md)).
- Decided (sidhantha, 2026-09-30): multi-user access has no sign-in; the owner grants it with an access key ([sync engine and server](../../notes/02_engine/04_sync-engine-and-server.md)).

# 05 Notes & Analysis

## Watch out
- Sharing opens a local server to other people. The page must state plainly what an edit key allows (writing any existing content file in the project) so owners do not hand one out casually.
