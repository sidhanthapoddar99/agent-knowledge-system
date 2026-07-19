---
description: Scaffold a new top-level docs section under data/ (creates folder + settings.json + starter page, optionally registers in site.yaml).
allowed-tools: Read, Write, Edit, Bash
argument-hint: [section-name]
---

You are running the `/agent-ks-add-section` slash command from the `agent-ks` plugin.

# Goal

Add a new **top-level docs section** to an agent-knowledge-system project. A "section" is a sidebar-driven folder under `data/` that maps to a route via an entry in `config/site.yaml`'s `pages:` block.

Concrete output for a section named `handbook`:

```
data/handbook/
├── settings.json           ← { "label": "Handbook", "sidebar": { ... } }
└── 01_overview.md          ← starter page with frontmatter
```

Plus optionally an entry appended to `config/site.yaml`:

```yaml
pages:
  ...
  handbook:
    base_url: "/handbook"
    type: docs
    layout: "@docs/default"
    data: "@data/handbook"
```

**Naming convention:** the top-level section folder uses **plain kebab-case — no `NN_` prefix**. The numeric prefix only applies to files inside the section (`01_overview.md`, `05_setup.md`) and to subsection folders if the section grows them. Confirm this if the user asks.

# Workflow

## Step 1 — Resolve the project root

Find the docs project root by looking for `config/site.yaml` (or fall back to `default-docs/config/site.yaml` for the legacy layout) walking up from the current working directory. If neither is found:

> No agent-knowledge-system project detected here (no `config/site.yaml` found walking up). Run `/agent-ks-init` first to scaffold a project.

Stop.

If found, the **project root** is the parent of `config/`. The **data root** is `<project_root>/data/` (or `<project_root>/default-docs/data/` for legacy).

State the resolved paths back to the user before doing anything else:

```
Project root: <project_root>
Data root:    <data_root>
Config:       <project_root>/config/site.yaml
```

## Step 2 — Get the section name

If `$ARGUMENTS` is non-empty, use it as the section name. Otherwise ask:

> Section name (kebab-case, e.g. `user-guide`, `dev-docs`, `handbook`)?

Validate:
- Must match `^[a-z][a-z0-9-]*$` (lowercase, kebab-case)
- Must not collide with an existing folder under `data_root`. Run `ls <data_root>` and check.
- If the user provided something close-but-wrong (uppercase, spaces, underscores), normalise to kebab-case and confirm — don't silently transform.

If invalid, explain and re-ask.

## Step 3 — Compute the section title

Convert the kebab-case name to Title Case for the sidebar label:
- `user-guide` → `User Guide`
- `dev-docs` → `Dev Docs`
- `handbook` → `Handbook`

Confirm with the user:

> Sidebar label: `<Title>` — accept or override?

## Step 4 — Ask: register in site.yaml?

Ask:

> Add this section to `config/site.yaml` `pages:` so it routes at `/<name>`?
>
> 1. **Yes** (recommended) — appends the entry; section is reachable in the dev server immediately
> 2. **No** — only scaffold the folder; you'll wire routing manually

Default: yes.

## Step 5 — Confirm full plan

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

(Skip the site.yaml block if the user said no in Step 4.)

Wait for confirmation. If yes, write all files using the templates below.

## Step 6 — Templates

### `<data_root>/<name>/settings.json`

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

### `<data_root>/<name>/01_overview.md`

```markdown
---
title: <Title>
description: Overview of <Title>.
---

# <Title>

Welcome to the <Title> section. Edit `data/<name>/01_overview.md` to replace this content.

## Adding pages

Create files in this folder with the `NN_` prefix to control sidebar order:

- `02_<slug>.md` — second page
- `05_<slug>.md` — leave gaps so future inserts don't require renumbering
- `10_<subfolder>/` — subsection folder (also needs its own `settings.json`)

Every markdown file needs `title:` in frontmatter. Every folder needs `settings.json`.
```

### `config/site.yaml` append (if user said yes in Step 4)

Read the current file. Find the `pages:` block. Append the new entry with proper indentation matching the existing entries — typically 2-space indent for the section name, 4-space indent for its fields. **Do not** overwrite or reformat the rest of the file.

```yaml
  <name>:
    base_url: "/<name>"
    type: docs
    layout: "@docs/default"
    data: "@data/<name>"
```

## Step 7 — Validate and report

After writing:

1. Run `agent-ks check section <data_root>/<name>` — should exit `0` clean.
2. If site.yaml was edited, run `agent-ks check config <project_root>/config` — should exit `0` clean.

If either fails, show the user what's wrong and offer to fix.

Otherwise, end with:

```
Created section <name> at <data_root>/<name>/.

Next steps:
  - Edit data/<name>/01_overview.md to write the section's intro.
  - Add more pages: 02_*.md, 05_*.md, etc. (NN_ prefix controls sidebar order)
  - Restart the dev server to pick up the new route at /<name>.
  - Optionally add a navbar link in config/navbar.yaml.
```

---

# Tone & guardrails

- Validate the section name *before* asking other questions — bail early on collisions.
- Never overwrite an existing `settings.json` or `site.yaml` block. If you'd be writing over something, stop and ask.
- The top-level section folder does NOT get an `NN_` prefix — explain this to the user if they ask why their section isn't `05_handbook` or similar. The prefix is for files inside (and subsection folders), not for the section itself.
