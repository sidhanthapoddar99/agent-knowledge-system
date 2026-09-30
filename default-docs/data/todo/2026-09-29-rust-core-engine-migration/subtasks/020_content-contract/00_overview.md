---
title: "Content contract — the on-disk format, implemented once in Rust"
status: open
---

The content contract is what a project's files mean: the config folder, the section types, ordering prefixes, `settings.json`, frontmatter, links and embeds, and the version gate. Today these rules live in three places (the Astro engine, the Rust CLI, the browser), and they have drifted. This group writes each rule once, in the Rust core, with tests taken from today's real output. The engine ([030](../030_rust-engine/00_overview.md)) calls these rules; this group owns what they say.

# 01 To Do
- [ ] **Work in this order:**
    1. [020/10 golden fixtures](./10_golden-fixtures.md) first: every other leaf is tested against them.
    2. [020/20 config folder](./20_config-folder.md), [020/50 ordering, settings, frontmatter](./50_ordering-settings-frontmatter.md) and [020/60 engine version gate](./60_engine-version-gate.md), in any order.
    3. [020/30 links and URLs](./30_links-and-urls.md), once the site index exists ([030/40](../030_rust-engine/40_site-index.md)): it needs the file-to-URL map.
    4. [020/40 embeds and dependencies](./40_embeds-and-dependencies.md), with or after 30.

| Leaf | Delivers | Absorbs | Status |
|---|---|---|---|
| [10](./10_golden-fixtures.md) | The spec fixtures and the captured 0.x corpus output every test compares against | — | open |
| [20](./20_config-folder.md) | Loading and validating `config/`: discovery, `site.yaml`, navbar, footer, `.env`, aliases | [2025-06-25-configuration-enhancements](../../../2025-06-25-configuration-enhancements/issue.md) (validation, migration tool, per-page overrides) | open |
| [30](./30_links-and-urls.md) | The one resolver: relative on disk → root-absolute href; the hosting path prefix | [2026-08-04-absolute-link-resolution](../../../2026-08-04-absolute-link-resolution/issue.md), all three groups | open |
| [40](./40_embeds-and-dependencies.md) | `[[path]]` embeds, and embedded files as cache dependencies | [2026-08-07-content-embed-cache-dependencies](../../../2026-08-07-content-embed-cache-dependencies/issue.md) | open |
| [50](./50_ordering-settings-frontmatter.md) | The `NN_` grammar, `settings.json`, frontmatter schemas, page kinds, slug collisions | — | open |
| [60](./60_engine-version-gate.md) | `engine_version`, the supported range, the refusal message | — | open |

## Guardrails
These hold for every leaf in the group.
- **The files are the document.** Nothing here asks an author to change correct content to suit the engine. A link that is right on disk and wrong on the site is an engine defect.
- **Match today's output exactly**: routes, heading IDs, link targets, text. Only small visual improvements may differ (sidhantha, 2026-09-29).
- **One implementation per rule**, in the Rust core, called by the server, the CLI's `check` commands and `agentks build`. No rule is copied into TypeScript.
- **When unsure, return an error** with file, line, type, message and a suggestion. Never guess a target, an alias or a version.

## Done when
- Every leaf's done-when holds.
- `cargo test -p agentks-content -p agentks-config -p agentks-index` passes, including the corpus comparison from [10](./10_golden-fixtures.md).

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Where:** `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`, crates `agentks-config`, `agentks-content`, `agentks-index` under `apps/agentks-engine/crates/` ([030/10](../030_rust-engine/10_workspace-and-crate-boundaries.md)).
- **Read first, for every leaf:** [02/01 Content format](../../notes/02_engine/01_content-format.md), [02/02 Project config](../../notes/02_engine/02_project-config.md), [02/03 The Rust engine](../../notes/02_engine/03_rust-engine.md) sections 03 to 08, and today's [AGENTS.md](../../../../../../AGENTS.md) "The filesystem is the document".
- **Depends on:** [010/00 project setup](../010_project-setup/00_overview.md) (the repository), [030/10](../030_rust-engine/10_workspace-and-crate-boundaries.md) (the crates exist).

# 04 Decisions
- Decided (sidhantha, 2026-09-29): routes, heading IDs, links and text match today's engine exactly.
- Decided (sidhantha, 2026-09-29): files keep relative links; Rust resolves each and outputs a root-absolute href.
- Decided (sidhantha, 2026-09-30): two reference forms only, `[text](path)` and `[[path]]`, both relative to the file.

# 05 Notes & Analysis
## Watch out
- Today's CLI already implements parts of this in Rust ([content.rs](../../../../../../agent-ks-cli/src/content.rs), [links.rs](../../../../../../agent-ks-cli/src/links.rs), [issues.rs](../../../../../../agent-ks-cli/src/issues.rs), [checks.rs](../../../../../../agent-ks-cli/src/checks.rs)). Port and test that code rather than rewrite it, but check it against the Astro engine's behaviour, which is what users see.
