---
title: "Editing a page"
---

Choose **Edit** in the dev toolbar, and the page you are reading becomes an editor in the same place. Type, stop, and agentks writes the file about a second later. This page covers the two editing modes, saving, and what happens when the file changes on disk while you edit.

## Turn editing on and off

1. Open the page in the local app.
2. Choose **Edit** in the dev toolbar.
3. The page body becomes editable. The navbar, sidebar and outline stay. While you edit, the outline follows the heading you are working in.
4. Choose **Edit** again to stop. agentks saves anything still pending, and the page shows its rendered form again.

The editor loads the first time you choose Edit, so a page you only read never downloads it.

## Two modes: live preview and raw

A switch beside Edit chooses the mode. The local app remembers your choice in this browser.

| Mode | What you see |
|---|---|
| **Live preview** | The page stays rendered. A block shows its markdown only while your cursor is in it; leave the block and it renders again. Tables, callouts, diagrams, embeds and code blocks stay visual until you click into them. Frontmatter shows as a properties block at the top |
| **Raw** | The whole file as markdown with syntax colouring, frontmatter included as text |

Live preview draws each block exactly as the finished page does, so what you see while editing is what readers see after the save.

There is no third mode. Read-only is simply editing switched off.

## Writing helpers

- **Formatting commands** for bold, italic, headings, lists, links, quotes and tables insert markdown. The file only ever holds markdown.
- **Slash commands.** Type `/` to insert a block such as a callout, a table, a code block, an image or a link. Each one inserts plain markdown.
- **Pasting an image.** Paste or drop an image into the editor. agentks saves it into the `assets/` folder beside the page (creating the folder if needed), optimises it, and inserts a relative link such as `![](./assets/screenshot.png)`. This is the only new file that editing ever creates.
- **Spell check** is your browser's own spell check.

## Saving

- There is no save button. agentks saves about a second after you stop typing, when you turn Edit off, and when you close the tab.
- The save status beside Edit reads **saved**, **saving** or **failed**.
- A save never leaves half a file on disk, even if the machine stops in the middle of a write.
- After a save, every open tab showing the page updates, and so does the rendered view.

## When the file changes on disk while you edit

An AI agent often edits the file you have open. So can `git pull`, `git checkout`, or another editor. agentks merges that change into your editor instead of throwing either version away.

| What happened | What you see |
|---|---|
| The file changed on disk, and you have no unsaved typing | The change appears in your editor where it happened. agentks does not save anything on your behalf |
| The file changed in one place, and you typed in another | Both changes stay. Your next save writes both |
| The file changed on the same lines you are typing on | Your text stays in the editor. A notice shows the version on disk, so you can take it or keep yours |
| The file was moved or deleted | The editor closes with a notice. If agentks knows where the file went, the notice says so. Your unsaved text stays in the browser so you can copy it. agentks never recreates the file |

## What you can edit

agentks decides which pages are editable. Edit is disabled everywhere else, with a tooltip that says why.

| Page | Editable in place | Why |
|---|---|---|
| A markdown page in a docs section or the blog | Yes | The main case |
| A markdown file in the issue tracker: `issue.md`, a note, a subtask, a comment, an agent log | Yes | The same editor |
| A diagram page: a `.mmd`, `.dot`, `.excalidraw` or `.drawio` file | Yes, in its diagram editor | See [Editing diagrams](./15_editing-diagrams.md) |
| A diagram inside a page | Yes: turn Edit on, then click the diagram | See [Editing diagrams](./15_editing-diagrams.md) |
| The blog index, the issues index | No | agentks builds these pages; there is no file behind them |
| Config files, `settings.json`, `.meta.json` sidecars | No | They are structured metadata. Your agent and the CLI change them |
| A library element | No | It is read-only in the machine's library cache |

An issue's status, labels and priority live in its `settings.json`, so you cannot type them in. The issue page has its own controls for them ([Editing together](./25_editing-together.md#tracker-changes-from-the-page)).

## What editing does not do

- **No new files, renames, moves or deletes.** Ask your AI agent, or use the CLI. `agentks move` moves a file or folder and rewrites every link to it. Run it with `--dry-run` first to see every change it would make:

  ```bash
  agentks move data/guide/10_old.md data/guide/20_new.md --dry-run
  ```

- **No file tree, tabs, split views or second sidebar.** To edit another page, go to it with the page's own sidebar and choose Edit there.
- **No code files.** Editing covers markdown pages and diagrams.
