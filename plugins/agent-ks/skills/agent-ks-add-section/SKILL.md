---
name: agent-ks-add-section
description: Add a new top-level docs section under data/ in an agent-knowledge-system project. Creates the folder, its settings.json and a starter page. Registers the section in site.yaml when the user agrees. Invoke it with the section name as the argument, or with no argument to be asked.
argument-hint: [section-name]
allowed-tools: Read, Write, Edit, Bash
---

# agent-ks-add-section

A section is a folder under `data/` with its own sidebar. An entry in the `pages:` block of `config/site.yaml` maps it to a route. For a section named `handbook` the result is:

```
data/handbook/
├── settings.json           { "label": "Handbook", "sidebar": { ... } }
└── 01_overview.md          starter page with frontmatter
```

```yaml
pages:
  ...
  handbook:
    base_url: "/handbook"
    type: docs
    layout: "@docs/default"
    data: "@data/handbook"
```

The section folder is plain kebab-case, with no `NN_` prefix. The prefix orders the files and subfolders inside the section. Explain this when the user asks.

## 1 Resolve the project root

Walk up from the current directory until you find `config/site.yaml`. Accept `default-docs/config/site.yaml` as the framework-dev layout. If you find neither, stop with:

> No agent-knowledge-system project detected here (no `config/site.yaml` found walking up). Run `/agent-ks-init` first.

The project root is the parent of `config/`. The data root is `<project_root>/data/`, or `<project_root>/default-docs/data/` in the framework-dev layout. State the paths before anything else:

```
Project root: <project_root>
Data root:    <data_root>
Config:       <project_root>/config/site.yaml
```

## 2 Get the section name

Use `$ARGUMENTS` when it is not empty. Otherwise ask:

> Section name (kebab-case, e.g. `user-guide`, `dev-docs`, `handbook`)?

Validate the name before you ask anything else. Stop early on a collision.

| Check | Rule |
|---|---|
| Form | matches `^[a-z][a-z0-9-]*$` |
| Collision | no folder of that name under the data root. Run `ls <data_root>` |
| Near miss (uppercase, spaces, underscores) | normalise to kebab-case and confirm. Never transform in silence |

If the name is invalid, explain why and ask again.

## 3 Compute the label

Convert the name to Title Case: `user-guide` gives `User Guide`, `dev-docs` gives `Dev Docs`. Confirm:

> Sidebar label: `<Title>`. Accept or override?

## 4 Ask about site.yaml

> Add this section to the `pages:` block of `config/site.yaml`, so it routes at `/<name>`?
>
> 1. Yes (recommended): the section is reachable in the dev server at once.
> 2. No: only scaffold the folder. You wire the route yourself.

Default: yes.

## 5 Confirm the plan

Show:

```
Will create:
  <data_root>/<name>/settings.json     { "label": "<Title>", "sidebar": { ... } }
  <data_root>/<name>/01_overview.md    (frontmatter + starter content)

Will append to <project_root>/config/site.yaml under pages::
  <name>:
    base_url: "/<name>"
    type: docs
    layout: "@docs/default"
    data: "@data/<name>"

Proceed?
```

Omit the `site.yaml` block when the user said no. Wait for confirmation, then write from the templates below.

## 6 Templates

Never overwrite an existing `settings.json` or an existing `site.yaml` block. If you would, stop and ask.

### settings.json

```json
{
  "label": "<Title>",
  "sidebar": {
    "collapsed": false,
    "collapsible": true,
    "sort": "position"
  }
}
```

### 01_overview.md

```markdown
---
title: <Title>
description: Overview of <Title>.
---

# <Title>

Welcome to the <Title> section. Edit `data/<name>/01_overview.md` to replace this content.

## Adding pages

Create files in this folder with the `NN_` prefix to control the sidebar order:

- `02_<slug>.md`: the second page
- `05_<slug>.md`: leave gaps, so later inserts need no renumbering
- `10_<subfolder>/`: a subsection folder; it needs its own `settings.json`

Every markdown file needs `title:` in its frontmatter. Every folder needs a `settings.json`.
```

### The site.yaml entry

Read the file. Find the `pages:` block. Append the entry with the indentation of the existing entries: two spaces for the name, four for its fields. Do not overwrite or reformat the rest of the file.

```yaml
  <name>:
    base_url: "/<name>"
    type: docs
    layout: "@docs/default"
    data: "@data/<name>"
```

## 7 Validate and report

| Run | Must |
|---|---|
| `agent-ks check section <data_root>/<name>` | exit `0` |
| `agent-ks check config <project_root>/config`, only when you edited `site.yaml` | exit `0` |

If either fails, show the user the finding and offer to fix it. Otherwise end with:

```
Created section <name> at <data_root>/<name>/.

Next steps:
  - Edit data/<name>/01_overview.md to write the section's intro.
  - Add more pages: 02_*.md, 05_*.md, and so on. The NN_ prefix controls the sidebar order.
  - Restart the dev server to pick up the new route at /<name>.
  - Optionally add a navbar link in config/navbar.yaml.
```
