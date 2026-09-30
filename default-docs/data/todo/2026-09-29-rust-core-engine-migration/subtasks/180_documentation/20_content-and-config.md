---
title: "Docs: writing content, content types and configuration"
status: review
---

The core of the user guide: how to write pages, how links and embeds work, the content types (docs, blog, custom pages, artifacts, diagrams, video pages), and every file in `config/`. It replaces today's writing-content, docs, blogs, custom-pages and configuration sections, rewritten for the 1.0 content contract: relative links and `[[path]]` embeds, the `config/` folder with no `.env`, and no custom layouts.

# 01 To Do
- [x] **`10_writing-content/`**
    - [x] Overview: the filesystem is the document; a folder of markdown works in any editor, Obsidian, `grep` and agentks alike.
    - [x] Markdown basics: the dialect (GFM, alerts/callouts, tables, task lists, code blocks with titles), what the engine adds (heading IDs, the outline).
    - [x] Links: `[text](./relative/path.md)` only; why a leading `/` is wrong; how agentks turns a relative file link into the right URL; `agentks move` keeps links right.
    - [x] Embeds: `[[./path]]` for markdown, diagrams and data files; that an embedded file's change updates the page.
    - [x] Assets: `assets/` beside the page; images; `agentks` image optimisation if it ships.
    - [x] Naming and the sidebar: `NN_` prefixes (2 to 5 digits), `settings.json` per folder, `title` frontmatter, drafts.
    - [x] Diagram pages (`.mmd`, `.dot`, `.excalidraw`, `.drawio`) and artifact pages (`.html` with a `.meta.json` sidecar).
- [x] **`15_docs/`, `20_blog/`, `25_custom-pages/`** — one section per content type: folder shape, frontmatter fields, what the engine derives (dates from blog file names, the index), examples.
- [ ] **Video pages** — a short page on narrated video pages, linking to the video docs owned by [2026-09-29-narrated-video-pages](../../../2026-09-29-narrated-video-pages/issue.md) once they exist; library elements inside cues.
- [ ] **`35_configuration/`**
    - [ ] Overview of `config/`: how agentks finds a project (the nearest `config/` with a `dep.yaml`, or `--config-dir`).
    - [ ] `site.yaml`: every field, including `engine_version`, sections, theme, server port, and what each setting changes.
    - [ ] `navbar.yaml`, `footer.yaml`.
    - [ ] `dep.yaml` and `dep.lock` in brief, linking to [180/40 libraries](./40_libraries-and-templates.md).
    - [ ] Versioning in brief: `engine_version`, the version gate, linking to [90](./90_migration-guide-0x-to-1.md) for upgrades.
- [ ] **Generate the field tables** from the engine's settings schema ([030/30](../030_rust-engine/30_config-loader-and-settings-schema.md)) if it can emit one, so the tables cannot drift. Otherwise check each field against the schema by hand and note it in Result.

## Guardrails
- Group rules in [180/00 overview](./00_overview.md).
- No `.env`, `CONFIG_DIR`, aliases in `paths:` (unless the engine keeps them — check [02_project-config](../../notes/02_engine/02_project-config.md)), custom layouts or Astro terms.

## Done when
- The sections exist under `docs/data/user-guide/` and render with the new engine.
- Every `site.yaml` field the engine accepts appears on the configuration page, and no page names a field the engine rejects.

# 02 Status and Result
Review. The writing-content, docs, blog and custom-pages sections are written (21 pages); the configuration pages in `35_configuration/` are written by another agent, and the video page waits for `28_videos/`.

## Result
Written in `user-guide-2/`, from the notes and the content, index, render, config, cli, server and ui-client worktrees. Each folder passes `agent-ks check section` with 0 errors and 0 warnings, `agent-ks check link-form` reports nothing in them, and all 21 pages render in today's viewer.

- [Writing content](../../../../user-guide-2/10_writing-content/01_overview.md): the files-are-the-document rules, content types and page kinds; [markdown](../../../../user-guide-2/10_writing-content/05_markdown.md) (the comrak dialect, callouts, code, `<details>`, raw HTML); [headings and the outline](../../../../user-guide-2/10_writing-content/10_headings-and-outline.md) (the exact heading-ID rule with its `&` and non-ASCII quirks); [links](../../../../user-guide-2/10_writing-content/15_links.md) (right and wrong side by side, path to URL, folder links, errors, `agentks move`); [embeds](../../../../user-guide-2/10_writing-content/20_embeds.md) (three live examples backed by files in its `assets/`); [assets and images](../../../../user-guide-2/10_writing-content/25_assets-and-images.md) (colocation, `/content-assets/`, `agentks img`); [names, order and frontmatter](../../../../user-guide-2/10_writing-content/30_names-and-frontmatter.md); [drafts](../../../../user-guide-2/10_writing-content/35_drafts.md); [diagrams in a page](../../../../user-guide-2/10_writing-content/40_diagrams.md); [diagram pages](../../../../user-guide-2/10_writing-content/45_diagram-pages.md); [artifact pages](../../../../user-guide-2/10_writing-content/50_artifact-pages.md) (sidecar fields from the code, `site` and `self` theme modes, `/artifacts/` full-page URL, trust).
- [Docs sections](../../../../user-guide-2/15_docs/01_overview.md): [structure and URLs](../../../../user-guide-2/15_docs/05_structure-and-urls.md) (prefix exemptions, `index.md`, section root to first page, reserved prefixes, collisions); [folder settings](../../../../user-guide-2/15_docs/10_folder-settings.md); [frontmatter](../../../../user-guide-2/15_docs/15_frontmatter.md); [what a docs page shows](../../../../user-guide-2/15_docs/20_what-a-page-shows.md) (sidebar, outline, previous and next, breadcrumbs, `@docs/default` and `@docs/compact`); [check, search and move](../../../../user-guide-2/15_docs/25_check-search-and-move.md).
- [Blog](../../../../user-guide-2/20_blog/01_overview.md) (flat folder, URLs, the index with tag and author counts, commands) and [writing a post](../../../../user-guide-2/20_blog/05_writing-a-post.md) (the kebab-slug name rule, every field, dates, per-post assets, drafts).
- [Custom pages](../../../../user-guide-2/25_custom-pages/01_overview.md) (YAML file plus `pages:` entry, no user layouts, when to use an artifact instead) and [the built-in layouts](../../../../user-guide-2/25_custom-pages/05_built-in-layouts.md) (the `home`, `info` and `countdown` fields carried over from 0.x).
- Not done here: `35_configuration/` belongs to another agent in this docs run; the video-pages item waits for `28_videos/`; the field-table generation item belongs with the configuration pages. Code-block titles are left out of the markdown page, because the engine has no title syntax for fences.
- Details left out because neither the notes nor the code settle them: the custom-page YAML schema and its required fields ([100/45](../100_layouts/45_custom-pages.md) is open), how a blog `image` path is written, blog pagination, whether `sidebar_position` reaches the index's sort (the content crate reads it, the index does not yet), `allow_artifact_pages` (absent from the Rust settings), draw.io stencils and diagram export options.

## Agent log
none

# 03 References
- **Repository:** `NeuraLabsHQ/agent-knowledge-system`, folder `docs/data/user-guide/`.
- **Read first:**
  - [Content format](../../notes/02_engine/01_content-format.md) — the full content contract: sections, types, prefixes, links, embeds.
  - [Project config](../../notes/02_engine/02_project-config.md) — every config file and field.
  - [Video pages](../../notes/04_ecosystem/05_video-pages.md).
  - [Open question 13, the embed syntax](../../brainstorm/01_initial-discussion/16_open-questions.md) — decided: `[[path]]` stays an embed.
  - Today's pages as source material: [writing content](../../../../user-guide/15_writing-content), [docs](../../../../user-guide/17_docs), [blogs](../../../../user-guide/18_blogs), [custom pages](../../../../user-guide/20_custom-pages), [configuration](../../../../user-guide/10_configuration).
- **Depends on:** [020/00 content contract](../020_content-contract/00_overview.md) (every leaf), [030/30 config loader and settings schema](../030_rust-engine/30_config-loader-and-settings-schema.md).
- **Unblocks:** [200/20 switch-over](../200_launch/20_switch-over.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): links are `[text](path)` and embeds are `[[path]]`, both relative, with no wiki links, so content stays portable to Obsidian ([content format](../../notes/02_engine/01_content-format.md)).
- Decided (sidhantha, 2026-09-29): user-authored custom layouts are dropped ([project config](../../notes/02_engine/02_project-config.md)).
- Decided (claude, 2026-10-01): the shared writing rules (prefix grammar, links, embeds, assets, drafts, diagram and artifact pages) live once in `10_writing-content/`, and `15_docs/`, `20_blog/` and `25_custom-pages/` hold only what is special to their type, because one copy of a rule cannot drift from another.
- Decided (claude, 2026-10-01): docs pages tell the writer to open the body with a `#` heading that repeats the title, because the 1.0 docs layout draws no title of its own ([100/15](../100_layouts/15_docs-layouts.md) decision of 2026-10-01).
- Decided (claude, 2026-10-01): the custom-page pages give the 0.x YAML keys of `home`, `info` and `countdown` as the fields, but no required-field rules, defaults or rendering details, because the content-format note carries 0.x formats unchanged while [100/45](../100_layouts/45_custom-pages.md) has not settled the new schema.
- Decided (claude, 2026-10-01): the live embed demo's snippet is `assets/support-note.txt`, not `.md`, because today's docs loader wrongly treats a `.md` under `assets/` as a page and failed the whole `user-guide-2` section. The page still teaches that nothing under `assets/` is a page, which is the 1.0 rule.
- Decided (claude, 2026-10-01): folder settings files use `isCollapsible`, the name the 1.0 code and the content-format note read first; both engines also read `collapsible`.
- Decided (claude, 2026-10-01): `sidebar_position` is documented as accepted but not changing the order, because the index sorts siblings by prefix and name only (`apps/agentks-engine/crates/index/src/walk/places.rs`), and the content crate's `order_key` that honours it has no caller outside its tests.

# 05 Notes & Analysis

## Watch out
- The link page is the one readers most often get wrong. Show a wrong example (`/user-guide/x`) next to the right one and say why: a leading `/` is a URL, not a path, and it is false when the file is read outside the site.
