---
title: "The dev toolbar"
---

The dev toolbar gives you the **Edit** switch and four tools for checking your project while you work: **Problems**, **Cache**, **System** and **Theme preview**. It sits at the bottom of every page in the local app, the site that `agentks start` serves.

## Where it is and how it behaves

- It is a slim bar at the bottom of the screen, over the page. Each tool has one button, and Edit comes first.
- A tool opens its panel above the bar. Only one panel is open at a time. Press Escape to close it.
- When the bar is in the way, collapse it to a small handle. The local app remembers, in this browser, whether the bar was collapsed and which tool you used last.
- On a phone, the bar becomes a single button that opens the list of tools.

## The tools

| Tool | What it shows | What you can do with it |
|---|---|---|
| **Edit** | Whether the page can be edited. Beside it, when editing is on: a switch between live preview and raw, and the save status (saved, saving, failed) | Turn editing on and off for this page. See [Editing a page](./10_editing-a-page.md) |
| **Problems** | Content errors and warnings, listed by file and line: frontmatter, links, `NN_` prefixes, config. Choose this page or the whole project | Review an AI agent's work. The list updates by itself as files change |
| **Cache** | This project's build cache on the server, with entry counts and sizes by kind. This browser's stored pages and settings | Clear this project's build cache. Clear this browser's stored data |
| **System** | The server's memory and CPU use, and this page's memory where the browser reports it | Watch it. It refreshes about every two seconds while the panel is open, and asks nothing while it is closed |
| **Theme preview** | Another theme, or light or dark mode, applied to this browser only | Try a look without changing a file |

### Problems runs the same checks as the CLI

The Problems tool and `agentks check` run the same checks. A problem in the panel is the problem `agentks check` reports, with the same file and line. So you can review in the browser and fix from the terminal, or ask your agent to fix what the panel lists.

### Cache stays inside this project

The Cache tool clears only two things: this project's build cache, and this browser's stored data. It never deletes anything outside the project.

To see or clean caches across every project on the machine, use the CLI:

```bash
agentks cache status            # sizes of the build cache and the library cache
agentks cache reset             # remove this project's build cache
agentks cache clean ~/projects  # scan a folder for projects, report, then remove what none of them needs
```

`agentks cache clean` shows a report first and asks before it removes anything. Add `--yes` to skip the question.

### Theme preview changes nothing on disk

Theme preview swaps the look in this browser only. Other tabs, other people and the published site are not affected. To change the theme for everyone, set `theme` in `config/site.yaml` ([themes and layouts](../45_themes-and-layouts/01_overview.md)).

## When Edit is greyed out

Edit is disabled on a page that has no editable file behind it, such as the blog index or the issues index. Hover over it to see the reason. The full list of what can be edited is in [Editing a page](./10_editing-a-page.md#what-you-can-edit).

## What the toolbar is not

- **It is not part of a published site.** `agentks build` leaves the toolbar's code out entirely, so a published page contains none of it.
- **It is not extensible.** You cannot add your own tools.
- **It is not for every visitor.** When you share the project, a visitor with a `read` key cannot use Problems, Cache or System. Those tools answer only the owner and people with an `edit` key ([Security for owners](./30_security-for-owners.md)).
