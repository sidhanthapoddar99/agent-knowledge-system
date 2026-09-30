---
title: "Documentation — overview and outline"
status: open
---

agentks 1.0.0 gets new documentation, written from scratch for the new version. Today's docs describe Astro internals, the discarded editor, custom layouts and the framework checkout, none of which exist after the migration, so they are not ported. This group writes the new docs in the main repository's `docs/` folder, which is itself an ordinary agentks project. It is launch step 4. It takes over the remaining work of [2026-04-19-docs-phase-2](../../../2026-04-19-docs-phase-2/issue.md). Until every page here is written and renders correctly with the new engine, this repository's docs stay the reference.

# 01 To Do

| Leaf | Covers | Status |
|---|---|---|
| [180/10 Getting started](./10_getting-started.md) | Install, first project, the project folder, using agentks with AI | open |
| [180/20 Content and config](./20_content-and-config.md) | Writing pages, links and embeds, diagrams, artifacts, blog, custom pages, `config/` | open |
| [180/25 Issue tracker](./25_issue-tracker.md) | The tracker: anatomy, lifecycle, workflows, AI use | open |
| [180/30 Themes and layouts](./30_themes-and-layouts.md) | The layout set, themes, CSS, the theme contract | open |
| [180/40 Libraries and templates](./40_libraries-and-templates.md) | Using libraries, the catalog, templates, building a library | open |
| [180/50 Collaboration and sharing](./50_collaboration-and-sharing.md) | The dev toolbar, editing, access keys, multi-user editing | open |
| [180/60 Publishing](./60_publishing.md) | `agentks build`, the Dockerfile, static hosts | open |
| [180/70 Developer docs: engine architecture](./70_dev-docs-engine-architecture.md) | How agentks is built: crates, caching, protocol, UI package, static renderer | open |
| [180/80 CLI reference](./80_cli-reference.md) | Every command, generated from the binary | open |
| [180/90 Migration guide 0.x to 1](./90_migration-guide-0x-to-1.md) | Moving from `agent-ks` 0.x to `agentks` 1.0 | open |
| [180/95 Skills update](./95_skills-update.md) | The AI skills and the docs say the same thing | open |

**The outline.** The docs keep today's audience split (from [AGENTS.md](../../../../../../AGENTS.md)): the user guide teaches how to use agentks; the developer docs explain how it is built.

```
docs/data/
  user-guide/
    05_getting-started/        ← leaf 10
    10_writing-content/        ← leaf 20
    15_docs/ 20_blog/ 25_custom-pages/   ← leaf 20
    30_issue-tracker/          ← leaf 25
    35_configuration/          ← leaf 20
    40_libraries/              ← leaf 40
    45_themes-and-layouts/     ← leaf 30
    50_editing-and-sharing/    ← leaf 50
    55_publishing/             ← leaf 60
    60_upgrading/              ← leaf 90
    65_cli-reference/          ← leaf 80
  dev-docs/                    ← leaf 70
```

**Order of work.** 00 fixes the outline first, with a stub page per section so every leaf writes into a known place. 10, 20 and 25 can start as soon as Phase 1 renders content. 30 waits for the layout set. 40 and 50 wait for Phase 2. 60 waits for Phase 3. 80 is generated last, from the release candidate. 90 and 95 finish right before the switch-over.

## Guardrails
- **Current system only.** The docs describe 1.0.0 as it is. No history, no "before 1.0 this was …", no removed features. The one page allowed to name old formats is the migration guide (leaf 90).
- **The docs are an ordinary agentks project.** No special case in the engine for them. If the docs need a feature, users need it too; file it as a leaf in the right group.
- **Every page renders with the new engine** and passes `agentks check section` and `agentks check link-form`, with relative links only.
- **A page for a feature newer than 1.0.0 states the version it arrived in** ("since 1.2").
- **Don't edit or delete this repository's docs** as part of this group. They stay in use until the switch-over ([200/20](../200_launch/20_switch-over.md)).
- The user guide never explains internals; the developer docs never teach usage. A page on the wrong side is misfiled.

## Done when
- Every section in the outline has its pages, written for 1.0.0, and renders with the new engine.
- `agentks check section docs/data/user-guide`, `agentks check section docs/data/dev-docs` and `agentks check link-form` report no errors.
- A reader who has never used agentks can install it, create a project, add a library, edit a page and publish, following only the user guide (tested once by a fresh agent with no other context).

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Repository:** `NeuraLabsHQ/agent-knowledge-system`, folder `docs/data/` (local `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`). Claude commits there freely.
- **Read first:**
  - [Docs rewrite and launch](../../notes/05_delivery/07_docs-rewrite-and-launch.md), section 03 — the proposed structure and the rules above.
  - [System overview](../../notes/01_overview/02_system-overview.md) — what agentks is, in the words the docs should use.
  - [2026-04-19-docs-phase-2](../../../2026-04-19-docs-phase-2/issue.md) and its [proposed file structure](../../../2026-04-19-docs-phase-2/notes/01_proposed-file-structure.md) — the earlier restructure thinking; the audience split and the "no internals in the user guide" rule carry over.
  - Today's docs as source material: the [user guide](../../../../user-guide) and the [developer docs](../../../../dev-docs).
- **Depends on:** the feature each page documents; [010/20 main repo skeleton](../010_project-setup/20_main-repo-skeleton.md) (the `docs/` project exists).
- **Unblocks:** [195/30 docs at /docs](../195_hosting/30_docs-at-slash-docs.md), [200/20 switch-over](../200_launch/20_switch-over.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): the docs are rewritten completely. Until they are fully migrated and usable, this repository's docs are used ([docs rewrite and launch](../../notes/05_delivery/07_docs-rewrite-and-launch.md)).
- Decided (sidhantha, 2026-09-30): only the latest docs are published ([deployment and hosting](../../notes/05_delivery/06_deployment-and-hosting.md)).
- Decided (sidhantha, 2026-09-30): `agentks docs` opens agentks.neuralabs.org/docs; the docs are not bundled in the binary.
- Decided (claude, 2026-09-30): writing the documentation is its own group of leaves, one per section, so each can be picked up as its feature lands. The outline above is the one from the notes, with the tracker split into its own section because today's tracker docs are the largest user-guide section.

# 05 Notes & Analysis

## 01 What was absorbed from 2026-04-19-docs-phase-2

| Its subtask | Status there | Where its remaining work goes |
|---|---|---|
| 01 Issues layout docs (dev-docs half not started) | in-progress | [180/25 issue tracker](./25_issue-tracker.md) (user half) and [180/70 developer docs](./70_dev-docs-engine-architecture.md) (the tracker's data interface) |
| 02 Theme system docs (dev-docs half not started) | in-progress | [180/30 themes and layouts](./30_themes-and-layouts.md) and [70](./70_dev-docs-engine-architecture.md) |
| 07 Issues styles selector accuracy | open | [30](./30_themes-and-layouts.md): document only hooks that exist, verified against the built DOM |
| 08 Using with AI, present tense | open | [180/10 getting started](./10_getting-started.md) and [25](./25_issue-tracker.md) |
| 019 Skills compaction, 029 skills v2 | review, in-progress | [180/95 skills update](./95_skills-update.md), with the plugin port in [130/10](../130_ai-plugins/10_agentks-plugin-port.md) |

The issue itself is superseded at launch by [200/50](../200_launch/50_close-absorbed-issues.md).

## 02 Page shape
- Title frontmatter; `NN_` prefixes; a `settings.json` per folder; relative links; images colocated in `assets/` beside the page.
- Each page opens with what the reader gets, then how. Examples are real commands that were run while writing.
- Use the `agent-ks-docs` skill (or its `agentks` successor) for page mechanics.

## Watch out
- Docs drift from code fast. Write a page only once its feature is in `review` or later, and re-check it against the release candidate in leaf 80's pass.
- Screenshots go stale fastest. Prefer text and diagrams; when a screenshot is needed, take it from the end-to-end suite's run so it can be regenerated.
