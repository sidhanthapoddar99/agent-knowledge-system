---
title: "Names, order and frontmatter"
description: "How a file's name sets its order and URL with an NN_ prefix, how to number with gaps, and the frontmatter every page starts with."
---

# Names, order and frontmatter

agentks builds the sidebar from the folder tree. There is no menu file to maintain. A file's name does two jobs: a numeric prefix sets its place among its siblings, and the rest of the name becomes its URL. Frontmatter at the top of the page gives it a title. This page explains both, for every content type.

## The ordering prefix

An ordering prefix is 2 to 5 digits followed by `_`, at the start of a file or folder name:

```
05_getting-started/
010_setup.md
12345_appendix.md
```

| Rule | Detail |
|---|---|
| Width | 2 to 5 digits. `1_intro.md` has no prefix: one digit is not enough. Six digits is not a prefix either |
| Order | Siblings sort by the number's value, not its text. `05_` (5) comes before `010_` (10), which comes before `110_` (110) |
| Files and folders together | A folder and a page in the same folder sort by their numbers alike |
| Ties | Two entries with the same number sort by name. Avoid it: in a docs section it is an error |
| URL | The prefix is dropped. `05_getting-started/10_install.md` becomes `…/getting-started/install` |
| Written once | The number lives in the name only. You never repeat it in frontmatter |

### Number with gaps

Do not number siblings 01, 02, 03. Leave room, so a new page can go between two others without renaming anything. A rename changes a URL and has to go through `agentks move`.

| Step | Prefixes | Use it when |
|---|---|---|
| 5, the default | `05_`, `10_`, `15_` | A folder with a handful of entries |
| 3 | `03_`, `06_`, `09_` | Many entries |
| 2 | `02_`, `04_`, `06_` | A long flat list |

A new page between `05_` and `10_` takes `07_`. When two neighbours have no gap left, renumber with `agentks move`, never with `mv`, so every link follows.

Two digits is the normal width. Use three digits only for a folder with many entries, or to group entries by their first digit (`110_`, `120_` in group 1, `210_` in group 2). Four and five digits are for rare cases.

### Which content types need it

| Content type | Name | Required? |
|---|---|---|
| Docs | `NN_name.md`, `NN_folder/` | Yes, on every file and folder, except `assets/` and a few special files |
| Blog | `YYYY-MM-DD-name.md` | A date replaces the prefix |
| Issue tracker | `NN_name.md` inside an issue | Optional in most folders: add it when order matters |
| Custom page | One YAML file named in `site.yaml` | No |

The [docs section](../15_docs/01_overview.md), the [blog section](../20_blog/01_overview.md) and the [issue tracker](../30_issue-tracker/01_overview.md) give the details for each.

## Frontmatter

Frontmatter is a block of YAML between two `---` lines at the very top of a markdown file:

```markdown
---
title: "Install the CLI"
description: "Download and run the installer."
---

# Install the CLI
```

| Rule | Detail |
|---|---|
| Where | The first line of the file must be `---`. Frontmatter anywhere else is ordinary text |
| `title` | Required on every docs page and blog post. It names the page in the sidebar and in links to it |
| Quotes | Quote a value that holds a colon or starts with a special character: `title: "Setup: the short way"` |
| Broken YAML | A content error with its line. The page still renders, without its frontmatter |
| An unknown key | A warning that lists the keys the page may use. It catches typos such as `titel` |

Each content type has its own fields, listed in its own section: the [docs section](../15_docs/01_overview.md) and the [blog section](../20_blog/01_overview.md). The issue tracker uses its own settings files; see the [issue tracker](../30_issue-tracker/01_overview.md).

A diagram or an HTML file cannot hold frontmatter, so it takes a sidecar file instead: `NN_name.meta.json` beside it. [Diagram pages](./45_diagram-pages.md) and [artifact pages](./50_artifact-pages.md) explain it.

## Labels in the sidebar

| Entry | Its label |
|---|---|
| A page | `sidebar_label` from its frontmatter, else its `title` |
| A folder | `label` from its `settings.json` |
| A diagram or artifact page | `sidebar_label` or `title` from its sidecar, else a title made from the file name |

A title made from a file name drops the prefix and the extension, turns `-` and `_` into spaces and capitalises each word: `20_system-architecture.mmd` becomes "System Architecture".

## Check your names

```bash
agentks check section data/guide   # prefixes, prefix clashes, folder settings, titles, frontmatter
agentks check blog                  # post names and frontmatter
```

Both print errors and warnings. Warnings alone do not fail the command.
