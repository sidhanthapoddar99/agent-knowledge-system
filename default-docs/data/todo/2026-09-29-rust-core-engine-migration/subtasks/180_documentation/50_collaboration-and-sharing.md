---
title: "Docs: editing, the dev toolbar, sharing and multi-user editing"
status: review
---

In 1.0 a page is edited where it is read. The dev toolbar's Edit option turns the page into an editor with two modes, raw and live preview. The owner can share a running project with others through access keys, with no sign-in, and several people can edit one page at once and see each other's presence. This leaf documents all of it for users.

# 01 To Do
- [x] **`50_editing-and-sharing/01_overview.md`** — reading is the default; editing is opt-in from the dev toolbar; the AI is the main author and people make small edits to existing files.
- [x] **The dev toolbar** — what each tool does, which ones ship in 1.0 ([110/10](../110_editing/10_dev-toolbar.md)), that the toolbar is never part of a published site.
- [ ] **Editing a page** — Edit, raw and live preview, saving, what happens when the file changed on disk meanwhile (the conflict message), undo, editing an embedded diagram.
- [x] **Editing diagrams** — each supported format and how its editor opens in place.
- [x] **Sharing a project** — `agentks share` to create a key (read or edit role, a label), sending the link, revoking a key, `agentks start --share` for network access, why TLS needs a tunnel or proxy beyond a trusted network.
- [x] **Editing together** — presence (names, cursors, selections), how changes merge, how edits are attributed in git (the key's label), what happens when the AI edits the same file on disk.
- [x] **Security notes for owners** — who can reach the server, what a read key can and cannot do, what to do when a key leaks.

## Guardrails
- Group rules in [180/00 overview](./00_overview.md).
- Describe exactly the commands and flags the 1.0 binary has (check `agentks help share`); the share command's surface is still open in the notes.

## Done when
- The section exists under `docs/data/user-guide/50_editing-and-sharing/` and renders.
- Two people following only these pages can share a project on one network, edit one page together and see each other's presence.

# 02 Status and Result
Review. Seven pages written in `user-guide-2/50_editing-and-sharing/` from the notes, the 110 and 060 subtasks and the CLI and server worktrees; `agent-ks check section` and `check link-form` report 0 errors. Undo is left out (unsettled), so that To Do item stays open.

## Result
Pages written (about 5,080 words), each checked against the settled design and, where it exists, the code:

- [50/01 Editing and sharing](../../../../user-guide-2/50_editing-and-sharing/01_overview.md): the local app, reading as the default, Edit, the two modes, autosave, existing files only, and how sharing works with keys and share mode.
- [50/05 The dev toolbar](../../../../user-guide-2/50_editing-and-sharing/05_dev-toolbar.md): the bar's behaviour; Edit, Problems, Cache, System and Theme preview; `agentks cache status · reset · clean`; never in a published site; not extensible; read keys cannot use the dev tools.
- [50/10 Editing a page](../../../../user-guide-2/50_editing-and-sharing/10_editing-a-page.md): turning Edit on and off, live preview and raw, writing helpers (formatting, slash commands, image paste into `assets/`, spell check), autosave and the save status, the four outside-change cases (merge, both kept, overlap notice, moved or deleted), the editable-page table, and what editing does not do.
- [50/15 Editing diagrams](../../../../user-guide-2/50_editing-and-sharing/15_editing-diagrams.md): diagram pages and embedded diagrams or fences; the editor per format (Mermaid, Graphviz, Excalidraw, draw.io); saving in the file's own format.
- [50/20 Sharing a project](../../../../user-guide-2/50_editing-and-sharing/20_sharing-a-project.md): keys (`aks_` prefix, roles, labels, hash-only storage), `agentks share create`, `agentks start --share` with the owner link, the visitor's first visit and cookie swap, `--bind`, `--public-url`, `--port`, tunnels for HTTPS, `share list · revoke`, stopping share mode.
- [50/25 Editing together](../../../../user-guide-2/50_editing-and-sharing/25_editing-together.md): presence, live merging, disk changes, diagrams together per format, tracker changes from the issue page, `agentks share log` and `Edited-by:` trailers from `agentks git commit`.
- [50/30 Security for owners](../../../../user-guide-2/50_editing-and-sharing/30_security-for-owners.md): who can reach the server with and without `--share`, the read and edit key table, what no key can do, where key hashes and the edit journal live, safe habits, and the three steps when a key leaks.

Left out because the notes and code do not settle them: undo, editor keyboard shortcuts, whether artifact pages are editable, tldraw, key expiry, and where the cursor lands when Edit turns on. Re-check every page against the build when 110 and 060 reach review; the toolbar, editor and share mode are not built yet.

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
- Decided (claude, 2026-10-01): the pages document the share surface the CLI worktree registers (`share create · list · revoke · log`, `start --share --bind --public-url`), because the code is more precise than the notes, which still list the surface as open.
- Decided (claude, 2026-10-01): details the design leaves proposed or open are left out rather than guessed: undo, keyboard shortcuts, artifact editability, tldraw, key expiry, the cursor position on Edit. Each is added when its subtask settles it.
- Decided (claude, 2026-10-01): the section is split into seven pages (overview, toolbar, page editing, diagrams, sharing, editing together, owner security), so each stays under about 900 words and the security page can be linked on its own.
- Decided (claude, 2026-10-01): the editing-together page says only that `agentks git commit` adds `Edited-by:` lines naming the editors, by display name and key label. The exact line text and the crediting rules come out, because they are only in [060/90](../060_collaboration/90_git-attribution.md)'s To Do list.

# 05 Notes & Analysis

## Watch out
- Sharing opens a local server to other people. The page must state plainly what an edit key allows (writing any existing content file in the project) so owners do not hand one out casually.
