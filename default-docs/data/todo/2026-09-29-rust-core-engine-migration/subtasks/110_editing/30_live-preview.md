---
title: "Live preview: carry over and improve today's CodeMirror 6 engine"
status: in-progress
---

Live preview shows markdown only where the cursor is and keeps everything else rendered, Obsidian-style. Today's CodeMirror 6 live preview already does this with decorations that hide syntax markers away from the cursor; it was finished in [2026-04-10-view-modes](../../../2026-04-10-view-modes/issue.md) subtask 01. This leaf carries it into the client's editor, improves it — viewport-limited decorations, the performance fixes already identified, the unfinished table polish — and switches rich blocks to Rust rendering so the preview equals the real page.

# 01 To Do
- [x] **Carry over** [the live-preview folder](../../../../../../agent-ks-engine/src/dev-tools/editor/live-preview) (decorations, widgets, theme) and [formatting commands](../../../../../../agent-ks-engine/src/dev-tools/editor/core/formatting-commands.ts) into `apps/agentks-client/src/editor/live-preview/`. Rework its theme to read the site's theme variables so edited text looks like the page.
- [ ] **Two layers** ([editor engines](../../notes/03_frontend/03_editor-engines.md) section 05):
    - [x] Inline decorations in the browser: headings, emphasis, inline code, links, task boxes, rules, frontmatter properties. Styling of the source, not a second renderer.
    - [ ] Block widgets from Rust: tables, callouts, diagram fences, `[[...]]` embeds, highlighted code, images. The client sends the block's markdown in a `render { path, markdown }` request and shows the returned HTML with the same islands as the reading view; it caches block HTML by the block's hash and re-asks only when the block's text changes.
- [x] **Drop the browser renderer** ([the renderer folder](../../../../../../agent-ks-engine/src/dev-tools/editor/renderer), a copy of `marked` and Shiki).
- [ ] **Performance fixes** (absorbed from editor-advanced subtask 07 and its [performance note](../../../2026-04-10-editor-advanced/notes/02_editor-performance.md)):
    - [ ] Build decorations only for `view.visibleRanges` (a `ViewPlugin`), and rebuild only ranges whose cursor status changed.
    - [ ] Push decorations in document order and skip the sort.
    - [x] Compute the selection's line numbers once per rebuild.
    - [x] Replace the tree-ready polling with `ensureSyntaxTree` and tree-update events.
    - [x] Parse frontmatter from `state.sliceDoc(0, 2048)`, not the whole document.
- [ ] **Polish** (the open item of view-modes 01): table rendering and editing edge cases — cursor entering and leaving a table, wide tables, pipes inside code.
- [x] **Formatting help** (absorbed editor-core subtask 02's open item): bold, italic, strike, link, code, list, quote, table, rule and the heading picker work in live preview as well as raw; keyboard shortcuts Ctrl+B, Ctrl+I, Ctrl+K, Ctrl+E.
- [ ] **Tests**: decoration snapshots on fixture markdown (every construct, cursor inside and outside); a 5,000-line file keeps keystroke-to-paint under 16 ms; `render` requests are sent only on block text change.

## Guardrails
- Improve, do not rebuild: keep the decoration builder's approach.
- Anything whose output could differ from the real page comes from Rust.
- No WYSIWYG mode and no preview panel.

## Done when
- Every markdown construct in the fixture set displays in live preview the way the reading view shows it, with syntax revealed only on the cursor's lines.
- Arrow-key movement on a 5,000-line file stays smooth (no long task over 50 ms in a trace).
- A diagram fence edited in live preview shows Rust's render of it within 100 ms of typing stopping.

# 02 Status and Result
In progress. Both layers are built and tested against the client's mock engine; islands inside Rust's blocks, two declined performance items, the table edge cases that depend on Rust's output, and the Done-when checks against the real engine are left.

## Result
Built in the wave-3 editor worktree (`/home/sid/projects/06_02_NeuraLabs/.agentks-worktrees/editor`, branch `wave3/editor`, not committed), under `apps/agentks-client/src/editor/`:

- `live-preview/inline.ts`: the decoration builder carried over as a `ViewPlugin` over `view.visibleRanges`. It styles headings, emphasis, strike, inline code, links, quotes, bullets, task boxes (a checkbox that toggles `[ ]` and `[x]`), rules and the frontmatter lines, and hides the markers away from the cursor's lines.
- `live-preview/blocks.ts` and `rust-blocks.ts`: a state field that replaces tables, callouts, fenced and indented code, HTML blocks, lone images and lone `[[...]]` embeds with Rust's HTML from `render { path, markdown }`, inside `markdown-content`, so the theme styles them as on the page. Block HTML is cached by the block's text (at most 300 blocks); a request goes out only when a block's text changes. A block shows its own source until the answer comes, and a failed render is marked. The cursor entering a block shows its markdown; ArrowUp and ArrowDown step into a drawn block instead of jumping over it. A focused diagram fence shows Rust's render under its source 80 ms after typing stops. The frontmatter is a properties block.
- `live-preview/theme.ts` and `engine/theme.ts`: every size and colour from the site's theme variables (the `--content-*` heading sizes, the theme's colours), set through `EditorView.theme`, so edited text looks like the page in light and dark.
- `engine/formatting.ts` and the toolbar's format bar: bold, italic, strike, code, link, bullet, numbered and task lists, quote, table, rule and the heading picker, in both modes; Mod-B, Mod-I, Mod-K, Mod-E and Mod-Shift-X.
- No browser renderer: no `marked`, no Shiki, no `language-data`.
- Performance: the selection's lines are computed once per rebuild (`live-preview/focus.ts`); the syntax tree comes from `ensureSyntaxTree` with a 20 ms budget and tree-change updates, with no polling; the frontmatter reader stops after 500 lines. One rebuild of 60 visible lines in a 5,000-line file takes about 2 ms in the test (20 rebuilds in 37 ms).
- Tests: `tests/editor/live-preview.test.ts` (6): markers hide with the cursor away and show with it inside; frontmatter read and skipped; which blocks Rust draws (tables, callouts, code, diagram fences, HTML, lone images, embeds; an image inside text and a plain quote stay in the browser); one `render` per block text; the 5,000-line rebuild under 16 ms.
- Gate: `./ctl gate` in the worktree, exit 0 (31 s).
- Screenshots, light and dark: `/tmp/aks-shots/out/{light,dark}-02-editing.png`, `-04-table-source.png` and `-05-diagram-source.png`.
- Left:
  - Islands (diagrams, embeds) inside Rust's drawn blocks. The client's islands unmount is page-wide today, so a widget cannot unmount only its own.
  - The two performance items declined in Decisions, unless you want them anyway.
  - Wide tables and pipes inside code: both come from Rust's table output (the table wrapper that scrolls, comrak's escaping), so they can be checked only against the engine.
  - The Tests item's keystroke-to-paint number and the three Done-when checks need a browser trace against the engine's `render`; the test above times the decoration build, not the paint.

## Agent log
none

# 03 References
- **Where:** main repository `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`, `apps/agentks-client/src/editor/live-preview/`; the engine's `render` handler.
- **Read first:** [editor engines](../../notes/03_frontend/03_editor-engines.md) (sections 03, 05), [the live preview subtask](../../../2026-04-10-view-modes/subtasks/01_live-preview.md) (what exists), [the editor performance note](../../../2026-04-10-editor-advanced/notes/02_editor-performance.md), [editor typography](../../../2026-04-10-editor-advanced/notes/03_editor-typography.md).
- **Today's code:** [live preview entry](../../../../../../agent-ks-engine/src/dev-tools/editor/live-preview/index.ts), [the decoration builder](../../../../../../agent-ks-engine/src/dev-tools/editor/live-preview/build-decorations.ts), [widgets](../../../../../../agent-ks-engine/src/dev-tools/editor/live-preview/widgets.ts).
- **Absorbed:** view-modes subtask 01's open polish item; [editor-advanced 07 performance improvements](../../../2026-04-10-editor-advanced/subtasks/07_performance-improvements.md) (the client-side items; the server-side ones move to [40](./40_save-path-and-sync.md)); [editor-core 02 formatting toolbar](../../../2026-04-10-editor-core/subtasks/02_formatting-toolbar.md).
- **Depends on:** [20](./20_edit-in-place.md), [050/20 WebSocket API](../050_server/20_websocket-api.md) (`render`).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): the live preview already built is the base, improved rather than rebuilt.
- Decided (sidhantha, 2026-09-29): no WASM build; the live preview asks Rust to render over the WebSocket.
- Proposed (claude, 2026-09-30): block widgets come from Rust, inline decorations stay in the browser ([editor engines](../../notes/03_frontend/03_editor-engines.md) section 05).
- Decided (claude, 2026-10-01): Rust draws tables, callouts, fenced and indented code, HTML blocks, lone images and lone `[[...]]` embeds; the browser keeps everything inline, plain quotes and lists, because only blocks whose output could differ from the page need Rust, and inline styling must answer on every keystroke.
- Decided (claude, 2026-10-01): block HTML is cached by the block's text, not a hash of it, because the text is already in hand and a map keyed by it gives the same rule (a request only when the text changes) with no hashing step.
- Decided (claude, 2026-10-01): the inline layer rebuilds the whole visible span on a text, viewport, selection or tree change, not only the ranges whose cursor status changed, because the span is screen-sized: a rebuild takes about 2 ms on a 5,000-line file, and tracking changed ranges adds state that can go stale.
- Decided (claude, 2026-10-01): the inline layer keeps `Decoration.set(…, true)`, which sorts, because nested marks, hidden markers and line decorations start at the same positions in orders that are easy to get wrong by hand, and sorting a screen's worth costs little.
- Decided (claude, 2026-10-01): the frontmatter reader walks lines and stops after 500, not `sliceDoc(0, 2048)`, because a long frontmatter block would be cut in the middle and read as broken; the cost stays bounded.
- Decided (claude, 2026-10-01): a task item becomes a checkbox that replaces only `- [ ] `, so the item's own inline formatting keeps working.
- Decided (claude, 2026-10-01): no `@codemirror/language-data`, because Rust highlights fenced code; `@codemirror/lang-markdown` stays for its list continuation on Enter, although its HTML, CSS and JavaScript grammars are about a quarter of the 192 kB gzipped editor chunk.
- Decided (claude, 2026-10-01): a drawn block's root never has a vertical margin (spacing is padding), and ArrowUp and ArrowDown step into a drawn block, because CodeMirror's height map cannot see margins, and without both the arrow keys skip lines.
- Decided (claude, 2026-10-01): the editor is styled in TypeScript through `EditorView.theme` with the theme's variables, because CodeMirror injects its base styles outside any cascade layer, where they would beat a layered stylesheet.
- Decided (claude, 2026-10-01): the client's mock engine has a small stand-in renderer that marks blocks with `data-src-lines`, so the client could be built before the render crate answers `render`; it lives in `dev/` and never ships.

# 05 Notes & Analysis
## Watch out
- The `render` request needs the file path so relative links and embeds resolve as they would on the page.
- Code-file editing (editor-core 14) is out of scope: humans edit markdown pages and diagrams only.
