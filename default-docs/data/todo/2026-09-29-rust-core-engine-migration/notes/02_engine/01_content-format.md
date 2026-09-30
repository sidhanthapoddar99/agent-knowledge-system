---
title: "Content format: what the engine reads on disk"
---

The content format is the contract between a project's files and the Rust engine. **The files are the document; the engine renders them.** A project is a folder with a `config/` folder and one or more content sections. Each section has a type: docs, blog, issues (the tracker) or a built-in custom page. Inside docs sections and tracker notes, three more page kinds sit beside markdown: diagram pages, artifact pages and video artifacts (a `.video.yaml` file, or a folder whose `settings.json` says `"kind": "video"`). Files are ordered by `NN_` prefixes and described by `settings.json` and frontmatter. A page refers to other files in exactly two ways, both relative to the page's own file: a link, `[text](./path.md)`, and an embed, `[[./path]]`. Nothing else is special syntax, so a folder of agentks content opens cleanly in Obsidian, an editor or `grep`. Everything a browser needs beyond the files, such as URLs, slugs, heading IDs, order, status categories and resolved hrefs, the engine derives. The format carries today's 0.x format into 1.0.0 with only the changes listed in section 09.

# 03 References

- [Open question 13, `[[...]]`](../../brainstorm/01_initial-discussion/16_open-questions.md) — the decision behind the two reference forms.
- [The architecture note](../../brainstorm/01_initial-discussion/17_local-spa-over-websocket.md) — why Rust outputs root-absolute hrefs.
- [Libraries](../../brainstorm/02_future-stages/09_libraries-and-dependencies.md) — why library elements never appear in markdown.
- [Project config](./02_project-config.md) — how sections are declared.
- [The Rust engine](./03_rust-engine.md) — the pipeline that turns this format into page data.
- [Library system](../04_ecosystem/01_library-system.md) and [video artifacts](../04_ecosystem/05_video-pages.md) — the two page kinds that may name library elements.
- [Versioning and migrations](../05_delivery/03_versioning-and-migrations.md) — how 0.x content reaches this format.
- Today's rules, which this note carries over:
  - [the ordering-prefix grammar](../../../../../../agent-ks-engine/src/parsers/core/order-prefix.ts);
  - [the embed preprocessor](../../../../../../agent-ks-engine/src/parsers/preprocessors/asset-embed.ts);
  - [heading IDs](../../../../../../agent-ks-engine/src/parsers/postprocessors/heading-ids.ts);
  - [internal links](../../../../../../agent-ks-engine/src/parsers/postprocessors/internal-links.ts), whose header explains the relative-href defect;
  - [diagram pages](../../../../../../agent-ks-engine/src/loaders/diagram-pages.ts), [artifact pages](../../../../../../agent-ks-engine/src/loaders/artifact-pages.ts) and [the slug-collision pass](../../../../../../agent-ks-engine/src/loaders/first-class-page.ts);
  - [the issue status vocabulary](../../../../../../agent-ks-engine/src/loaders/issue-status.ts).
- The user guide pages on [writing content](../../../../user-guide/15_writing-content/01_overview.md), [docs frontmatter](../../../../user-guide/17_docs/04_frontmatter.md), [folder settings](../../../../user-guide/17_docs/03_folder-settings.md) and [issues](../../../../user-guide/19_issues/01_overview.md).
- [2026-08-04-absolute-link-resolution](../../../2026-08-04-absolute-link-resolution/issue.md) and [2026-08-07-content-embed-cache-dependencies](../../../2026-08-07-content-embed-cache-dependencies/issue.md).

# 04 Decisions

- Decided (sidhantha, 2026-09-30): a page has two reference forms, both relative to the file: `[text](path)` links and `[[path]]` embeds. No wiki links by name, no `[[[...]]]`, no library names in markdown. The Rust engine translates every relative path. No migration is needed for this.
- Decided (sidhantha, 2026-09-30): library elements are named only in video artifacts and artifact pages, as `alias:element`.
- Decided (sidhantha, 2026-09-29): routes, heading IDs, links and text match today's engine exactly. Small visual changes are allowed only as improvements.
- Decided (sidhantha, 2026-09-29): the files on disk keep relative links; Rust resolves each one and outputs a root-absolute href.
- Decided (sidhantha, 2026-09-29): first-class diagram and artifact pages, with their `.meta.json` sidecars, keep appearing in sidebars and routes as today.
- Decided (sidhantha, 2026-09-29): video stays rendered in the browser from source. No MP4 files.
- Decided (claude, 2026-10-01): `allow_artifact_pages`, which today's artifact loader reads, is dropped in 1.0.0, because no content uses it and one opt-out per kind is not worth a setting nobody sets ([020/50](../../subtasks/020_content-contract/50_ordering-settings-frontmatter.md)). The folder-settings reader ignores unknown keys, so nothing reports a leftover `allow_artifact_pages: false` yet; the 1.0.0 docs migration must report it, because that project's artifacts become pages.
- Proposed (claude, 2026-09-30): an unresolvable reference (missing link target, missing embed, unknown library element) is reported as a content error on the page and in `agentks check`. The engine never guesses a target.

# 05 Notes & Analysis

## 01 A project on disk

```
<project>/                 the project root: the parent of config/
  config/                  required; see the project config note
    site.yaml  navbar.yaml  footer.yaml  dep.yaml  dep.lock  .env.example  (.env)
    themes/<name>/         optional CSS overrides
  <section folders>/       wherever site.yaml's pages point, usually under data/
  assets/                  optional project-wide files the config names (logo, favicon)
  Dockerfile               optional, for publishing
```

The folder names under the root are the user's choice. `site.yaml` names each section and its folder ([project config](./02_project-config.md)).

## 02 Section types

| Type | Folder shape | Pages | Derived by the engine |
|---|---|---|---|
| `docs` | A tree of `NN_` folders and files | Markdown, diagram, artifact and video pages | Sidebar tree, order, URL per page, outline, previous and next, breadcrumbs |
| `blog` | Flat files `YYYY-MM-DD-<slug>.md`, no nesting | Markdown posts | Date from the file name, newest-first index, tag and author lists |
| `issues` | One folder per issue, `YYYY-MM-DD-<slug>/`, plus a root `settings.json` or `settings.jsonc` | `issue.md`, `settings.json`, and the anatomy sections (`brainstorm/`, `notes/`, `plans/`, `subtasks/`, `agent-log/`, `agent-memory/`, `comments/`) | Status category, `created` from the slug, `updated` from git, subtask counts, filter option lists, the review queue |
| `custom` | One YAML data file | A built-in page layout (home, info, countdown) fed by the YAML | Nothing beyond the page itself |

The tracker's anatomy and vocabulary rules are the `agent-ks-issues` skill's and the [issues user guide](../../../../user-guide/19_issues/01_overview.md)'s; the engine implements them unchanged. The eight statuses and four categories stay fixed in engine code. The rest of the vocabulary (priority, component, labels) stays in the tracker's root settings file.

## 03 Page kinds inside a section

| Kind | File | Becomes a page when | Rendered by |
|---|---|---|---|
| Markdown | `NN_name.md` | always, in docs; by position in blog and tracker | Rust renders the body to HTML |
| Video | `NN_name.video.yaml`, or a folder `NN_name/` whose `settings.json` says `"kind": "video"` | it carries an `NN_` prefix, in a docs section or a tracker `notes/` or `brainstorm/`; a video folder is one page, never a sidebar group | Rust compiles it to video data; the browser player plays it ([video artifacts](../04_ecosystem/05_video-pages.md)) |
| Diagram | `NN_name.mmd` · `.mermaid` · `.dot` · `.gv` · `.excalidraw` · `.drawio` | it carries an `NN_` prefix and is not under `assets/`; the section root's `settings.json` may set `allow_diagram_pages: false` | Rust sends the source; the browser draws it |
| Artifact | `NN_name.html` | it carries an `NN_` prefix, in a docs section or a tracker `notes/` or `brainstorm/` | Served as-is at `/artifacts/<path>`, shown in an iframe |

**In the tracker the prefix is not needed**, as today: a diagram in `notes/`, `brainstorm/`, `agent-memory/` or `agent-log/`, and an `.html` artifact in `notes/` or `brainstorm/`, is a sub-document with or without an `NN_` prefix.

A diagram or artifact page may have a sidecar, `<same name>.meta.json` or `.meta.jsonc`, holding the title and display options that a non-markdown file cannot carry. The artifact sidecar's `artifact.theme` field decides whether the site theme's CSS applies inside the artifact.

**Slug collisions are errors.** A `.md`, a diagram and an `.html` that would claim the same URL are resolved against one shared pool, as today: the first keeps the URL and shows the collision error, the rest are dropped and reported.

## 04 Ordering prefixes

- A file or folder name may start with a numeric prefix of **2 to 5 digits** and `_`: `05_`, `010_`, `12345_`.
- Siblings sort by the prefix's **numeric value**, so widths can coexist and gaps leave room to insert.
- The prefix is stripped from the URL segment and never repeated in frontmatter.
- In docs sections the prefix is required on every file and folder. `assets/` folders take none and never appear in the sidebar.
- In the tracker, subtask, agent-log and group folders also accept a legacy `-` separator. The 1.0.0 migration may rewrite these to `_`; until it does, the loose rule stays (see section 09).
- The maximum folder depth is one shared constant, today 5. It caps tracker section nesting and limits how deep the docs sidebar draws.

This grammar has exactly one implementation, in the Rust core. The CLI, the loaders and the validators all call it.

## 05 settings.json and frontmatter

**Folder settings.** Every docs folder except the section root needs a `settings.json`:

| Field | Required | Meaning |
|---|---|---|
| `label` | yes, unless `kind` is set | The folder's name in the sidebar |
| `isCollapsible` | no, default `true` | Whether the sidebar can fold it. The older name `collapsible` is read too |
| `collapsed` | no, default `false` | Its initial state |
| `allow_diagram_pages` | no, default `true` | Section root only: turns diagram pages off |
| `kind` | no | `video` makes the folder one video page: the engine does not descend into it, and `label`, `isCollapsible` and `collapsed` are refused (the title is the video's header title). Any other value is an error |

Settings files may be JSON or JSONC (`settings.jsonc` is preferred when both exist). The tracker's own settings files (the root vocabulary, each issue's metadata, plan and log settings) keep their current schemas.

**Frontmatter** is YAML between `---` lines at the top of a markdown file.

| Where | Required | Optional |
|---|---|---|
| Docs page | `title` | `description`, `sidebar_label`, `sidebar_position` (overrides the prefix in the order), `draft`, `tags` |
| Blog post | `title` | `description`, `date` (overrides the file name's), `author`, `tags`, `image`, `draft` |
| Tracker files | per file kind, as the issues skill defines | `color` on notes, brainstorm, memory and log files |

Unknown keys are reported by `agentks check` as drift. `draft: true` hides a page from the Phase 3 static build; the local tool shows it with a badge.

## 06 Markdown

- **Dialect:** CommonMark with the GitHub extensions (tables, task lists, strikethrough, autolinks, footnotes) and GitHub-style alerts (`> [!NOTE]`, `> [!WARNING]` and the rest). No MDX, no custom tags.
- **Code:** fenced blocks. Highlighting is done in Rust and emits CSS classes, so light and dark come from the theme.
- **Diagrams inline:** a fenced block tagged `mermaid` or `dot`, or an embed of a diagram file inside such a fence.
- **Raw HTML** in markdown is passed through. The engine escapes nothing the author wrote on purpose.

**Expected differences from 0.x.** Routes, heading IDs, links and text match, but a few outputs change on purpose. The parity checks allow exactly these:

- Footnotes now render.
- Raw HTML is passed through untouched. Today's engine rewrote some of it: `img` sources, link targets, table wrappers and the ids of raw headings. The Rust engine rewrites only what markdown produced.
- Embeds are relative to the file only. Today's blog resolver that found an embed by its bare file name is gone.
- Outline text is plain text with entities decoded.

## 07 References: links and embeds

| Form | Meaning | Engine output |
|---|---|---|
| `[text](./other.md)`, `[text](../folder/02_x.md#part)` | A link to another page, relative to this file | A root-absolute href to the target's URL, with the `#fragment` kept |
| `[text](./assets/data.csv)` | A link to a non-page file | The file's served URL, `/content-assets/<path>`, where `<path>` is relative to the project root |
| `[text](./NN_flow.mmd)` · `[text](./NN_report.html)` | A link to a diagram or artifact page | That page's URL |
| `[text](./NN_tour/)` | A link to a video folder | The video page's URL |
| `[text](./comments/001_x.md)` · `[text](./glossary.md)` · `[text](./plans/01_p/10_stage.md)` | A link to a file shown on another page | The issue page or the plan page; a plan stage at its title anchor |
| `![alt](./assets/shot.png)` | An image | `/content-assets/<path>` |
| `[[./path]]` | An embed: the file's text is inserted here, before markdown rendering | The inserted content, rendered with the page |
| `[[./NN_tour.video.yaml]]` or `[[./NN_tour/]]` (later) | An embed of a video | A player island with the compiled video as its props, not the file's text |
| `\[[./path]]` | A literal `[[./path]]` | Printed as written |
| `https://…`, `mailto:` and any other scheme | External | Unchanged; external links get the external-link treatment |

Rules for the engine:

- **Every internal reference is relative to the file that contains it**, never to the URL the page is served at. That is what keeps it true on disk, in Obsidian and under `agentks move`.
- **The engine resolves each relative link to the target file, then to that file's URL**, and writes the URL as a root-absolute href. A browser-relative href is the defect [2026-08-04](../../../2026-08-04-absolute-link-resolution/issue.md) documents, so the engine never emits one.
- **URL segments are percent-encoded**, so a file name with a space or a non-ASCII letter gives a valid href. `/content-assets/<path>` and `/artifacts/<path>` use the path relative to the project root.
- **Under a hosting path prefix** (a Phase 3 site served under `/docs`), the prefix is added to every href at build time. Content never contains it.
- **A link starting with `/`** is not a valid internal reference. The engine renders it unchanged and reports it as a link-form error, as `check link-form` does today.
- **A missing target** is a content error with the file and line. The link is rendered with a broken-link marker; it is never pointed at a guessed page.
- **Embeds** read the file relative to the page. Inside a fenced block, only `./` and `../` paths embed, and a path with a space or a comma is left alone, so documentation examples survive. Embedding is one level: embed syntax inside an embedded file is not expanded. A missing file is a content error. **The embedded file's hash is part of the page's hash** ([the Rust engine](./03_rust-engine.md)).
- **Library elements are not references.** Markdown never names one. Video files (in typed fields) and artifact HTML name them as `alias:element` ([library system](../04_ecosystem/01_library-system.md)).

## 08 What the engine derives

| Value | Rule |
|---|---|
| Page URL | Section `base_url` + the path with prefixes and the page extension stripped. `index`-style folders follow today's routing |
| Slug | The URL segment: the name with its prefix and extension removed |
| Heading ID | The heading text lowercased, tags and punctuation removed, spaces to `-`, repeated `-` collapsed; duplicates get `-1`, `-2`. Today's rule slugifies the HTML that `marked` escaped, so `&` gives `a-amp-b` and `'` gives `39`; the Rust engine keeps these quirks on purpose. A named entity other than the five `marked` escapes (for example `&copy;`) gives a different id, because comrak decodes it |
| Order | `sidebar_position`, else the prefix value, else 999; then the name. So an unprefixed entry sorts after prefixes up to 999 but before a larger one such as `12345_` |
| Outline | The page's headings with their IDs, from the rendered body |
| Sidebar label | `sidebar_label`, else `title`; folders use `settings.json` `label`; a video, its header's `title` |
| Issue `created` | The folder name's date |
| Issue `updated` | The last commit touching anything in the folder |
| Status category | From the fixed vocabulary in the core |

These must match today's engine exactly; the route-parity and rendered-content checks prove it ([development workflow and testing](../05_delivery/05_development-workflow-and-testing.md)).

## 09 Changes from 0.x

| Change | Why | Migration |
|---|---|---|
| Custom user layouts removed | Branding is CSS only | Existing custom layouts move to a built-in style plus CSS, or to an artifact |
| `config/dep.yaml` required | Libraries, and the project marker | The 1.0.0 migration creates an empty one |
| `.env` moves into `config/` and loses `CONFIG_DIR` | One project shape | The 1.0.0 migration moves it |
| Legacy `-` separators in tracker folders (claude, proposed) | One grammar | Rewritten to `_` by `agentks move`, if the user agrees |

The markdown itself, the reference forms, the prefixes and the tracker anatomy are unchanged.

## 10 Open

- Whether an artifact may serve as a top-level page in place of a custom layout ([open questions and risks](../01_overview/05_open-questions-and-risks.md)).
- Whether the legacy `-` separator is retired in 1.0.0.
