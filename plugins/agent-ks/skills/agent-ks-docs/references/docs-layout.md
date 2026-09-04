# Docs layout

How to add, order and configure pages in a docs section such as `user-guide/` or `dev-docs/`. The user guide section is `@root/default-docs/data/user-guide/17_docs/`. The section's route in `site.yaml` belongs to [the config skill](../../agent-ks-config/references/03_site-config.md#pages-routing).

## Folder structure

A docs section is a folder under `data/<section>/`. Every folder and file carries a numeric `NN_` prefix.

```
user-guide/
├── settings.json               required: section label
├── 05_getting-started/
│   ├── settings.json           label, collapsible, collapsed
│   ├── 01_overview.md
│   └── 03_aliases.md
└── 10_configuration/
    ├── settings.json
    └── 03_site/
        └── settings.json
```

| Prefix rule | Detail |
|---|---|
| Width is 2 to 5 digits, then `_` | The validator rejects 1 digit and 6 or more. The tracker also accepts `-` as the separator |
| Order is by numeric value | `05_`, `010_` and `110_` sort as 5, 10, 110. Widths coexist, so one folder can widen alone |
| `NN_` is the convention | Use it almost always |
| `NNN_` needs a special reason | A folder with many entries, or grouping by the leading digit: `110_`, `120_` in group 1; `210_` in group 2 |
| `NNNN_` and `NNNNN_` are very rare | Only when the user demands it |

### Gap numbering

Do not number siblings 01, 02, 03. Leave room, so a new page slots between two neighbours without a renumber. A renumber changes URLs and needs `agent-ks move` for every link.

| Step | Prefixes | Slots in 01 to 99 | Use when |
|---|---|---|---|
| 5, the default | `05_`, `10_`, `15_` | about 19 | a handful of siblings; the top-level section folders use it |
| 3 | `03_`, `06_`, `09_` | about 33 | many siblings |
| 2 | `02_`, `04_`, `06_` | about 49 | a long flat list |

A new page between `05_` and `10_` takes `06_` and needs no move. When two neighbours have no gap left, re-prefix with `agent-ks move`, never with `mv`. A page can also override its order with frontmatter `sidebar_position`. The prefix is the signal a reader sees, so prefer gap-spaced prefixes.

## Folder settings

Every docs folder holds a `settings.json`. It may be `settings.jsonc`, with comments and trailing commas. `.jsonc` wins when both exist.

```json
{ "label": "Getting Started", "collapsible": false, "collapsed": false }
```

| Field | Type | Default | Meaning |
|---|---|---|---|
| `label` | string | folder name | Sidebar label |
| `collapsible` | boolean | `true` | `false` makes a permanently open group with no toggle. `isCollapsible` is an accepted alias |
| `collapsed` | boolean | `false` | `true` starts the group collapsed. Applies only when `collapsible` is `true` |
| `allow_diagram_pages` | boolean | `true` | Section root only. `false` stops diagram files rendering as pages |
| `allow_artifact_pages` | boolean | `true` | Section root only. `false` stops `.html` files rendering as pages |

Folder order comes from the prefix only. Set both collapse fields explicitly in each folder, to these house defaults:

| Depth in the section | `collapsible` | `collapsed` | Effect |
|---|---|---|---|
| Level 1, the major headings | `false` | `false` | Always open. The map of the section stays readable |
| Level 2 and deeper | `true` | `true` | Starts collapsed. The reader expands what they need |

Deviate when a section is shallow or a group must stay open. This is a default, not a rule.

## Page frontmatter and routing

| Field | Required | Meaning |
|---|---|---|
| `title` | yes | Page title |
| `description` | no | Meta tag summary |
| `sidebar_label` | no | Sidebar text; defaults to `title` |
| `sidebar_position` | no | Overrides the prefix order |
| `draft` | no | `true` hides the page from the production build |

The URL is the section base plus the nested path without prefixes. `data/user-guide/05_getting-started/02_installation.md` serves at `/user-guide/getting-started/installation`.

The outline rail lists `##` and `###` headings. Use `#` only for the page title, and prefer the frontmatter `title` over an `<h1>` in the body.

Every link between pages follows [writing.md, Linking](./writing.md#linking). A relative link works across sections. A link into another section resolves in the browser only while that section's `base_url` matches its folder name. That is a framework question; write the link the same way.

## Diagram pages

A prefixed `.mmd`, `.mermaid`, `.dot`, `.gv`, `.excalidraw` or `.drawio` file is a first-class page. It has the same sidebar and slug rules as markdown: `20_architecture.mmd` serves at `/…/architecture`.

| Rule | Detail |
|---|---|
| The title comes from the filename | Prefix stripped, title-cased. Prefer a good filename over a sidecar |
| A sidecar `NN_name.meta.json` adds metadata | Fields `title`, `description`, `sidebar_label`, `sidebar_position`, `draft`. All optional. `.jsonc` accepted |
| A slug collision is a build error | `15_x.md` and `16_x.mmd` both map to `/x`. Rename one |
| No prefix means skipped, with a warning | Files under `assets/` are never scanned. Embed-only diagrams live there |
| Embed or page | A figure inside prose embeds from `assets/`. A diagram that is the content is a prefixed page |
| The viewer | The outline hides. A click opens the pan and zoom viewer. Excalidraw and draw.io pages link to the raw file |

Dark mode per format: [writing.md, Rich content](./writing.md#rich-content).

## Artifact pages

A prefixed `.html` file is a first-class page: a self-contained report, dashboard, chart or design-system showcase. `20_dashboard.html` serves at `/…/dashboard`. The body renders in an iframe that fills the column. The sidebar stays; the outline hides.

| Rule | Detail |
|---|---|
| The title comes from the filename | As for diagram pages. A sidecar `NN_name.meta.json` adds metadata and makes the artifact legible to an agent |
| Sidecar fields | The diagram fields, plus `embed_height`: `"full"` (the default), a CSS length, or an aspect like `"16/9"` |
| The `artifact:` block | An opaque block of declared values (`purpose`, `type`, `theme`, `palette`, `data`). The framework passes it through untouched |
| The framework injects nothing into the `.html` | The artifact stays an independently openable document |
| Full-page route | Every artifact also opens at `/artifacts/<path-from-content-root>`, with its own `<head>`. The embed offers *Open full page* and *Expand*; `Esc` closes |
| `artifacts` is a reserved section base URL | See [03_site-config.md, Pages](../../agent-ks-config/references/03_site-config.md#pages-routing) |
| Collision, no prefix, `assets/`, opt-out | The diagram-page rules apply. Opt out with `allow_artifact_pages: false` |
| Trust | An artifact runs unsandboxed as first-party content. Never paste untrusted third-party HTML |

```jsonc
// 20_dashboard.meta.json, sibling of 20_dashboard.html
{ "title": "Q3 Dashboard", "embed_height": "full", "artifact": { "type": "dashboard", "theme": "site" } }
```

Building the HTML is the job of the [artifacts skill](../../agent-ks-artifacts/SKILL.md). This file says only where the file lives.

## Validate and move

| Command | Checks | Run |
|---|---|---|
| `agent-ks check section <folder>` | An `NN_` prefix on every folder and `.md` file, except `assets/` and `README.md`. A `settings.json` in every folder. A frontmatter `title`. Prefix collisions by numeric value, so `02_` and `002_` clash. A stray non-page file warns | after a restructure, before a batch commit |
| `agent-ks move <from> <to>` | Link-aware move of a file or a folder. Rewrites inbound links, outbound links inside the moved files, and link text that mirrors the path. Skips external, site-absolute and anchor-only links | every rename or move; `--dry-run` first |

Exit code `0` is clean, `1` found errors. Flags: [cli-toolkit.md](../../agent-ks-cli/references/cli-toolkit.md).

A plain `mv` leaves every relative link pointing at the old place. Nothing warns, and the build passes. `<to>` must not exist; the tool creates missing parent folders. Inside a git tree `move` uses `git mv`, so history follows the file.
