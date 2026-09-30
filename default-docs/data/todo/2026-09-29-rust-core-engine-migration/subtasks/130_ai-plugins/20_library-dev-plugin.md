---
title: "The library-development plugin (agentks-library)"
status: review
---

People who build or host libraries and templates need different guidance from people writing docs. This leaf writes the second, smaller plugin, `agentks-library` (working name), so an agent can create a library, write its `manifest.json`, test it through a local `path:` entry, tag x.y.z versions, set the engine range, add an official library to `library.json`, and run library migrations after a breaking engine release.

# 01 To Do
- [x] **Plugin folder** `plugins/agentks-library/` with both manifests (Claude Code and Codex), `README.md`, `LICENSE`, version `1.0.0`.
- [x] **One skill, `agentks-library`**, with references:
    - [x] `SKILL.md` — when to use it (building or maintaining a library or a template), the library's shape, the workflow in order, what it never does (edit a user's cache, release without a tag), and what it asks before (pushing a tag, a catalog pull request).
    - [x] `references/manifest.md` — `manifest.json` with the required `category`, names, descriptions and tags that `library find` surfaces, and a `library.json` catalog entry.
    - [x] `references/elements.md` — the file type of each category, theme-aware SVG (`currentColor`, and why `<img>` draws black), the HTML element contract with its three messages, the sandbox and what it blocks.
    - [x] `references/test-and-release.md` — a test project with a `path:` entry, `agentks check libraries`, `library show` and `library find`, viewing elements through `/_lib/`; one version per library, tags, the `engine` range, pre-releases, when a change is breaking; `agentks migrate --library <folder>` after a breaking engine release.
    - [x] `references/templates.md` — what a template holds, how it is tested in its own folder, how it is published, the catalog entry.
- [ ] **Evaluate** by having an agent build a small two-element library from nothing using only the plugin, then fix the gaps. Waits for the binary's library commands (120/40).

## Guardrails
- The final name is open; keep `agentks-library` until sidhantha renames it ([open questions](../../notes/01_overview/05_open-questions-and-risks.md)).
- Keep it small. Anything a docs author needs belongs in the usage plugin.
- The binary is the reference; no copied schemas.

## Done when
- The plugin folder exists with the skill and references.
- The evaluation run produces a library that passes `agentks check libraries` and is found by `agentks library find`.

# 02 Status and Result
Review. The plugin and its skill are written, and a trim pass brought `SKILL.md` to 500 words. The evaluation run waits for the binary: the CLI registers `library`, `check libraries` and `migrate --library`, but they are not wired to the library crate yet (120/40, 140/40).

## Result
- **Where:** branch `wave3/plugins`, worktree `/home/sid/projects/06_02_NeuraLabs/.agentks-worktrees/plugins`, folder `plugins/agentks-library/`: `.claude-plugin/plugin.json`, `.codex-plugin/plugin.json` (version 1.0.0), `README.md`, `LICENSE` (MIT), and `skills/agentks-library/` with `SKILL.md` and four references: `manifest.md`, `elements.md`, `test-and-release.md`, `templates.md`. The first pass is merged into main; the trim pass is not committed yet.
- **Size** (`wc -w`, before → after the trim pass): `SKILL.md` 598 → 500, frontmatter included; `manifest.md` 520, `elements.md` 700, `test-and-release.md` 629 and `templates.md` 295, unchanged; README 133. The skill is 2,742 → 2,644 words, and every reference is under 800. The trim cut the shape tree to its pattern, merged the task table into the workflow steps, and shortened the Never reasons. No rule was removed.
- **Checked:** both manifests parse as JSON, and the SKILL.md frontmatter parses as YAML. Every command and flag is in the clap tree (`apps/agentks-engine/crates/cli/src/args/`), except as listed below. `./ctl check`, which runs the skill-link check, is green after the trim pass.
- **Gaps in the binary** (the skill avoids them): no command prints the `manifest.json` schema, so `manifest.md` shows one commented example; `library find` and `library show` have no `--category` flag, and their rows carry no category or file path, so an agent reads a widget's input comment through the running server; `init --template` names only a catalog id or a git URL, so a template is tried after its tag is pushed; `migrate` has no `--to`; `agentks video schema --component <category>` is not registered.
- **Drift found:** the library crate's `manifest.rs` (branch `wave2/library`) knows only `file`, `description` and `tags` per element and rejects unknown keys, so the default library's manifest, which carries the required `category`, would fail it.

## Agent log
none

# 03 References
**Where:** the main repository, `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`, `plugins/agentks-library/`.

**Read first**
- [AI plugins and skills](../../notes/04_ecosystem/02_ai-plugins-and-skills.md), section 02.
- [Library system](../../notes/04_ecosystem/01_library-system.md) and [templates and init](../../notes/04_ecosystem/04_templates-and-init.md).
- The guide for humans: [120/90 library authoring guide](../120_libraries/90_library-authoring-guide.md).

**Depends on:** [120/30](../120_libraries/30_manifest-and-catalog.md), [120/40](../120_libraries/40_library-commands-and-tui.md), [120/90](../120_libraries/90_library-authoring-guide.md), [140/40 library migrations](../140_versioning-and-migrations/40_library-migrations.md).
**Unblocks:** [130/30 marketplace listing](./30_marketplace-listing.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): two agentks plugins, one for using agentks and a smaller developer-oriented one for building and hosting libraries ([AI plugins and skills](../../notes/04_ecosystem/02_ai-plugins-and-skills.md)).
- Decided (claude, 2026-09-30): the working name is `agentks-library`; the user can rename it.
- Decided (claude, 2026-10-01): testing, versioning and migrations share one reference, `test-and-release.md`, because they are one sequence (test, then tag; migrate, then test, then tag) and three small files would repeat the same steps.
- Decided (claude, 2026-10-01): templates are a reference of the same skill, not a second skill, because template authors use the same tags, catalog and checks.
- Decided (claude, 2026-10-01): `manifest.md` shows one commented `manifest.json` example, because no command prints the schema. `agentks check libraries` stays the judge. Replace the example with a pointer when a schema command exists.
- Decided (claude, 2026-10-01): the skill describes `category` as a required manifest field, following the library system note's 2026-10-01 decision, although the library crate does not accept it yet.
- Decided (claude, 2026-10-01): a library keeps all fifteen category folders, each with a `README.md` copied from the default library, so every library has the same shape. It is also the safe choice while `agentks check libraries` does not say whether empty folders are required.
- Decided (claude, 2026-10-01): the test project lives inside the library's repository (`test/site/`), because agentks refuses a local `path:` that leaves the project's repository.
- Decided (claude, 2026-10-01): the skill asks the user before pushing a tag or opening a pull request on the catalog, because a pushed tag is a release that reaches other people's projects.
- Decided (claude, 2026-10-01): the plugin manifests use the repository URL as the homepage, because the docs site is not live.
- Decided (claude, 2026-10-01): `elements.md` keeps "every element is one self-contained file" for now, because the video folder form (a `settings.json`, a `controller.json` and one folder per scene) is still being designed in the video issue. Change it when that contract lands.

# 05 Notes & Analysis
## Watch out
- An earlier delivery note used `agentks-library-dev`; it was aligned to `agentks-library` on 2026-09-30.
- `elements.md` says every element is one self-contained file. If the video issue settles on a folder form for library video components, `elements.md` and the shape in `SKILL.md` need a folder-element exception.
