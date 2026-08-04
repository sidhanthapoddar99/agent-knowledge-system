## Goal

The set of *view modes* the editor supports — how a document is rendered for editing or reading.

- **Source** — raw markdown with syntax highlight (the default; no subtask, just CM6 baseline).
- **Live Preview** — Obsidian-style: markdown markers hidden, decorations show formatted text, cursor-on-line reveals raw syntax.
- **Preview** — render-only HTML output (no editing surface).
- **True WYSIWYG** — future, ProseMirror-based; see [notes/01_wysiwyg-design.md](./notes/01_wysiwyg-design.md).
- **View-only / edit-mode lock** — orthogonal toggle that disables editing in any mode.

> *Split* is intentionally not a view mode — it's a layout that pairs Source + Preview side-by-side. It lives under [editor-navigation-and-layout](../2026-04-10-editor-navigation-and-layout/issue.md).
