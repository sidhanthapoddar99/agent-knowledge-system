---
title: "Editing diagrams"
---

You edit a diagram where it appears, with an editor that suits its format: a canvas for Excalidraw and draw.io, and source with a live drawing for Mermaid and Graphviz. agentks saves every change back to the diagram's own file, in its own format. The file still opens in Excalidraw, diagrams.net or any text editor afterwards.

## Open a diagram for editing

A diagram can be a page of its own, or part of a markdown page.

| Where the diagram is | How to edit it |
|---|---|
| **A diagram page**: a file such as `20_architecture.mmd` or `30_flow.excalidraw` that shows as its own page in the sidebar | Choose **Edit** in the dev toolbar. The page's diagram editor opens |
| **Inside a markdown page**: a `mermaid` or `dot` fenced block, or a diagram file embedded in the page | Choose **Edit** for the page, then click the diagram. Its editor opens in place. Close it to go back to the text |

## The editor for each format

| Format | Files | Editor | Saved to |
|---|---|---|---|
| **Mermaid** | `.mmd`, `.mermaid`, or a `mermaid` fenced block | The source text beside a live drawing that updates as you type | The file, or the fenced block it came from |
| **Graphviz** | `.dot`, `.gv`, or a `dot` fenced block | The source text beside a live drawing | The file, or the fenced block it came from |
| **Excalidraw** | `.excalidraw` | The Excalidraw canvas | The `.excalidraw` file, as Excalidraw JSON |
| **draw.io** | `.drawio` | The diagrams.net editor, inside the page | The `.drawio` file, as draw.io XML |

A fenced block edits in place. For example, click this block while editing its page, change the source, and agentks writes the new text back into the same fence in the markdown file:

````markdown
```mermaid
flowchart LR
  Draft --> Review --> Published
```
````

## Saving

Diagrams save the same way as text ([Editing a page](./10_editing-a-page.md#saving)):

- There is no save button. agentks saves shortly after you stop changing the diagram.
- The save status beside Edit reads saved, saving or failed.
- A save never leaves half a file on disk.

The file keeps its own format. agentks adds nothing of its own inside a `.excalidraw` or `.drawio` file, so you can move it to another tool at any time.

## Things to know

- **Diagram editors load only when you open one.** The Excalidraw canvas in particular is large, so reading a page never downloads it.
- **You cannot create a diagram from the editor.** A new diagram is a new file, which is your AI agent's job. Ask it for a new `.mmd`, `.dot`, `.excalidraw` or `.drawio` file, or for a fenced block in a page.
- **Check both colour modes.** Use Theme preview in the dev toolbar to see your diagram in light and dark mode before you leave it.
- **Several people on one diagram.** When you share the project, people can edit a diagram together. How that works for each format is in [Editing together](./25_editing-together.md#diagrams-together).
