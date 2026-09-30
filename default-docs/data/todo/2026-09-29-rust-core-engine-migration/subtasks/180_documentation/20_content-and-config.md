---
title: "Docs: writing content, content types and configuration"
status: open
---

The core of the user guide: how to write pages, how links and embeds work, the content types (docs, blog, custom pages, artifacts, diagrams, video pages), and every file in `config/`. It replaces today's writing-content, docs, blogs, custom-pages and configuration sections, rewritten for the 1.0 content contract: relative links and `[[path]]` embeds, the `config/` folder with no `.env`, and no custom layouts.

# 01 To Do
- [ ] **`10_writing-content/`**
    - [ ] Overview: the filesystem is the document; a folder of markdown works in any editor, Obsidian, `grep` and agentks alike.
    - [ ] Markdown basics: the dialect (GFM, alerts/callouts, tables, task lists, code blocks with titles), what the engine adds (heading IDs, the outline).
    - [ ] Links: `[text](./relative/path.md)` only; why a leading `/` is wrong; how agentks turns a relative file link into the right URL; `agentks move` keeps links right.
    - [ ] Embeds: `[[./path]]` for markdown, diagrams and data files; that an embedded file's change updates the page.
    - [ ] Assets: `assets/` beside the page; images; `agentks` image optimisation if it ships.
    - [ ] Naming and the sidebar: `NN_` prefixes (2 to 5 digits), `settings.json` per folder, `title` frontmatter, drafts.
    - [ ] Diagram pages (`.mmd`, `.dot`, `.excalidraw`, `.drawio`) and artifact pages (`.html` with a `.meta.json` sidecar).
- [ ] **`15_docs/`, `20_blog/`, `25_custom-pages/`** — one section per content type: folder shape, frontmatter fields, what the engine derives (dates from blog file names, the index), examples.
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
Open. Not started.

## Result
None yet.

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

# 05 Notes & Analysis

## Watch out
- The link page is the one readers most often get wrong. Show a wrong example (`/user-guide/x`) next to the right one and say why: a leading `/` is a URL, not a path, and it is false when the file is read outside the site.
