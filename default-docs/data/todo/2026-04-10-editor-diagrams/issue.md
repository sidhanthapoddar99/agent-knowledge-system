## Goal

Diagrams are a native part of the site — not just assets embedded in markdown.
Formats: **Mermaid**, **Graphviz/DOT**, **Excalidraw**. Display view first;
editing comes later.

Three workstreams (= subtask groups):

1. **`10_embeds/`** — every format renders as an embed, both inline (code
   fence) and by reference (`[[./assets/x.mmd]]` inside a fence, or a
   src-based tag). Mermaid/graphviz embeds already work through the
   `.diagram` div + lazy client renderer pipeline; excalidraw is the coding
   lift (reference-based, expandable, never inline JSON). Group carries its
   own skills + documentation subtasks.
2. **`20_first-class/`** — `.mmd` / `.dot` / `.excalidraw` files following the
   `XX_` prefix convention render as first-class pages (same sidebar, same
   routing as markdown), enabled by default with per-section opt-out. Sidecar
   metadata for what frontmatter would carry; slug collisions error
   explicitly; `assets/` gets an explicit scanner exclusion. Group carries its
   own skills + documentation subtasks.
3. **`30_editor/`** — editing surfaces (live preview, excalidraw canvas).
   Deferred until display ships.

Decisions and code audit: `brainstorm/01_discuss_display-first-architecture.md`.
