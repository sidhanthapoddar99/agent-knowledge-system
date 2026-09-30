---
title: "Authoring helpers: what survives of editor-advanced"
status: open
---

[2026-04-10-editor-advanced](../../../2026-04-10-editor-advanced/issue.md) collected power-user editor features: slash commands, wiki links, embedding, spell check, drag-and-drop upload, multi-doc views and performance work. The new editing model is deliberately small: the AI is the main editor, and humans make small edits to existing files. This leaf sorts that backlog against the new model, builds the few helpers that fit, and leaves the old issue ready to be superseded.

# 01 To Do
- [ ] **Slash commands** (absorbed 01): `/callout`, `/table`, `/code`, `/image`, `/link` as a CodeMirror autocomplete that inserts markdown. Build it: it inserts markdown only and adds no new surface.
- [ ] **Image paste and drop** (absorbed 05): pasting or dropping an image saves it into the page's colocated `assets/` folder (created if missing, name from the file or a timestamp), optimised as the CLI does, and inserts a relative link `![](./assets/<name>)`. Rust performs the write through a dedicated `upload` message with the same checks as saves; the only new file editing may create is an asset beside the page.
- [ ] **Spell check** (absorbed 04): turn on the browser's native spell check in the editor (`spellcheck="true"` on the content element); no library, no custom dictionary in this leaf.
- [ ] **Dropped**, with a line each in `05`: wiki links (rejected — `[[...]]` stays an embed), embedding (already the `[[path]]` embed, rendered by Rust), multi-doc views (no tabs or splits), asset manager and code-file editing from editor-core (no file management, markdown and diagrams only), doc switcher and TOC view (the page's own sidebar and outline do this).
- [ ] **Tests**: slash command inserts the expected markdown; a pasted image lands in `assets/` with a relative link and renders in the reading view.

## Guardrails
- Nothing here adds navigation, file management or a new mode.
- The upload path writes only into the page's own `assets/` folder, never elsewhere.

## Done when
- The three kept helpers work in live preview and raw, and each dropped item has its reason recorded below, so the old issue can be superseded pointing here.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Where:** main repository `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`, `apps/agentks-client/src/editor/helpers/`; the engine's `upload` handler.
- **Absorbed:** [2026-04-10-editor-advanced](../../../2026-04-10-editor-advanced/issue.md) — [01 slash commands](../../../2026-04-10-editor-advanced/subtasks/01_slash-commands.md), [02 wiki links](../../../2026-04-10-editor-advanced/subtasks/02_wiki-links.md), [03 embedding](../../../2026-04-10-editor-advanced/subtasks/03_embedding.md), [04 spell check](../../../2026-04-10-editor-advanced/subtasks/04_spell-check.md), [05 drag-drop upload](../../../2026-04-10-editor-advanced/subtasks/05_drag-drop-upload.md); from [2026-04-10-editor-core](../../../2026-04-10-editor-core/issue.md): [08 asset manager](../../../2026-04-10-editor-core/subtasks/08_asset-manager.md), [09 doc switcher](../../../2026-04-10-editor-core/subtasks/09_editor-menu-doc-switcher.md), [11 TOC view](../../../2026-04-10-editor-core/subtasks/11_toc-view.md), [14 code-file editing](../../../2026-04-10-editor-core/subtasks/14_code-file-editing.md). Performance (07) is in [30](./30_live-preview.md) and [40](./40_save-path-and-sync.md); client-side rendering (editor-core 03) contradicts the single-renderer decision and is dropped.
- **Read first:** [editor engines](../../notes/03_frontend/03_editor-engines.md) (section 09), [the wiki-link decision](../../../2026-04-19-knowledge-graph-and-wiki-links/issue.md) (question 13, Option B), [images in docs](../../../../user-guide/15_writing-content/03_asset-embedding.md).
- **Depends on:** [30](./30_live-preview.md), [40](./40_save-path-and-sync.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): the AI is the main editor; humans edit existing files only, with no advanced editing options.
- Decided (sidhantha, 2026-09-30): `[[...]]` stays an embed; links are relative `[text](path)` (open question 13, Option B).
- Decided (claude, 2026-09-30, under sidhantha's delegation): slash commands, image paste or drop into the page's `assets/`, and native spell check are kept, because each only inserts markdown or a colocated asset and adds no surface; everything else in the backlog is dropped as listed.

# 05 Notes & Analysis
## 01 Why each dropped item goes

| Item | Why |
|---|---|
| Wiki links | Rejected by the Option B decision; content stays portable |
| Embedding | Already exists as `[[path]]`, rendered by Rust |
| Multi-doc views, doc switcher, TOC view | No tabs, splits or second navigation; the page's sidebar and outline already serve |
| Asset manager | No file management in the editor |
| Code-file editing | Humans edit markdown and diagrams only |
| Client-side rendering | Contradicts the single-renderer decision |

## Watch out
- An image upload is the one case where editing creates a file. Keep it narrow: images only, into the page's own `assets/`, size-limited (for example 10 MB).
