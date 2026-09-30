---
title: "Writing content"
description: "The writing rules every agentks content type shares: plain markdown, relative links and embeds, colocated assets, names, diagrams and HTML artifacts."
---

# Writing content

In agentks you write plain files: markdown pages, a few small JSON and YAML files, and the images and diagrams that sit beside them. agentks reads those files and shows them as a site. This section teaches the rules that every content type shares. The pages for each content type, such as docs sections or blog posts, add only what is special to that type.

## The files are the document

A folder of agentks content reads well anywhere. You can open it in an editor, in Obsidian, with `cat` or with `grep`, and an AI agent can walk it like any other folder. The local app that `agentks start` serves, and a site published with `agentks build`, are two ways to read the same files.

Three rules follow from that:

- **Links are file paths.** A link names the file it points to, relative to the page that holds it. agentks works out the URL.
- **A page's files sit beside it.** Images, data files and diagram sources go in an `assets/` folder next to the page, so they move with it.
- **Metadata says only what a file cannot.** Frontmatter gives a page its title. A `settings.json` gives a folder its sidebar label. A numeric name prefix gives the order. Nothing else tells agentks how to draw a page.

Much agentks content is written by AI agents and reviewed by people. So the `agentks` command-line tool checks the same rules the site uses, and an agent can fix a problem before a person ever sees it.

## Content types

Each content section of a project has a type. The project's `config/site.yaml` names every section, its type and its folder. The [configuration section](../35_configuration/01_overview.md) explains that file.

| Type | What you write | Where it is explained |
|---|---|---|
| Docs | A tree of numbered folders and pages, with a sidebar | [Docs](../15_docs/01_overview.md) |
| Blog | A flat folder of posts named by date | [Blog](../20_blog/01_overview.md) |
| Issue tracker | One folder per issue, with its notes, subtasks and logs | [Issue tracker](../30_issue-tracker/01_overview.md) |
| Custom page | One YAML file, drawn by a built-in page layout | [Custom pages](../25_custom-pages/01_overview.md) |

## Page kinds

Most pages are markdown. Two more kinds of file become pages when you give them a numeric prefix.

| Kind | File | What the reader sees |
|---|---|---|
| Markdown | `10_install.md` | The rendered page, with an outline of its headings |
| Diagram | `20_flow.mmd`, `.dot`, `.excalidraw`, `.drawio` | The diagram, full width, with pan and zoom |
| Artifact | `30_dashboard.html` | A self-contained HTML page, shown in a frame |

Diagram and artifact pages live in docs sections, and in some folders of an issue. Narrated video artifacts are a page kind of their own, and they have their own section of this guide.

## Two ways to point at another file

A page refers to another file in exactly two ways. Both are relative to the page's own file.

```markdown
See [the install page](../05_setup/10_install.md) for the steps.

\[[./assets/greet.py]]
```

The first line is a **link**: the reader clicks it. The second is an **embed**: agentks pastes the other file's text into the page before it renders. There is no other special syntax. There are no wiki links by name, and library elements never appear in markdown.

## A first page

A docs page is a markdown file with a `title`:

```markdown
---
title: "Install the CLI"
---

# Install the CLI

Download the installer, then run it.
```

Save it as `data/guide/05_setup/10_install.md`, beside a `settings.json` for its folder. Then look at it and check it:

```bash
agentks start --open                  # serve the project and open the local app
agentks check section data/guide      # names, folder settings, frontmatter
agentks check link-form               # every link is relative and its target exists
```

The local app picks up a saved file on its own, so you can keep it open while you write.

## In this section

| Page | What it covers |
|---|---|
| [Markdown](./05_markdown.md) | The markdown dialect, callouts, code blocks, collapsible parts |
| [Headings and the outline](./10_headings-and-outline.md) | The page title, heading IDs, anchor links, the outline |
| [Links](./15_links.md) | Relative links, how they become URLs, and keeping them right |
| [Embeds](./20_embeds.md) | Pasting another file's text into a page with `[[./path]]` |
| [Assets and images](./25_assets-and-images.md) | The `assets/` folder beside a page, and shrinking images |
| [Names, order and frontmatter](./30_names-and-frontmatter.md) | `NN_` prefixes, ordering, frontmatter basics |
| [Drafts](./35_drafts.md) | Keeping a page out of the published site |
| [Diagrams in a page](./40_diagrams.md) | Mermaid, Graphviz, Excalidraw and draw.io inside a page |
| [Diagram pages](./45_diagram-pages.md) | A diagram file that is a page of its own |
| [Artifact pages](./50_artifact-pages.md) | Self-contained HTML reports, dashboards and designs |
