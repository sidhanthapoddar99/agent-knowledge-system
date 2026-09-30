---
title: "Foundation: repositories, toolchain and the content contract"
status: in-progress
outcome: "The three repositories build green, and the content contract has golden fixtures"
notes: "Everything else builds on these. Repositories created 2026-09-30"
who: "claude"
subtasks:
  - "[010/10 Create the three NeuraLabsHQ repositories: first commit, README, licence, settings](../../subtasks/010_project-setup/10_create-neuralabshq-repos.md)"
  - "[010/20 Main repository skeleton — the project-setup tree for agentks](../../subtasks/010_project-setup/20_main-repo-skeleton.md)"
  - "[010/30 Toolchain pins — latest Rust and Vite, one version everywhere](../../subtasks/010_project-setup/30_toolchain-pins.md)"
  - "[010/40 ctl and the gate — one entrypoint, green means proved](../../subtasks/010_project-setup/40_ctl-and-gate.md)"
  - "[010/50 CI workflows — the gate on every push, parity on engine changes](../../subtasks/010_project-setup/50_ci-workflows.md)"
  - "[010/60 AGENTS.md contracts — one brief per repository](../../subtasks/010_project-setup/60_agents-md-contracts.md)"
  - "[010/70 Library repository skeleton — library.json, the default manifest, templates/](../../subtasks/010_project-setup/70_library-repo-skeleton.md)"
  - "[010/80 Marketplace repository skeleton — the Neuralabs Claude Code marketplace](../../subtasks/010_project-setup/80_marketplace-repo-skeleton.md)"
  - "[010/90 Contributor setup guide — clone to green gate in one page](../../subtasks/010_project-setup/90_contributor-setup-guide.md)"
  - "[020/10 Golden fixtures — capture today's output so the new engine can be proved equal](../../subtasks/020_content-contract/10_golden-fixtures.md)"
  - "[020/20 The config folder — discovery, site.yaml, navbar, footer, .env, aliases, validation](../../subtasks/020_content-contract/20_config-folder.md)"
  - "[020/30 Links and URLs — one resolver, root-absolute hrefs, and the hosting path prefix](../../subtasks/020_content-contract/30_links-and-urls.md)"
  - "[020/40 Embeds and dependencies — path inlining, and an embedded file is part of the page](../../subtasks/020_content-contract/40_embeds-and-dependencies.md)"
  - "[020/50 Ordering, settings and frontmatter — the NN_ grammar, settings.json, page kinds, slugs](../../subtasks/020_content-contract/50_ordering-settings-frontmatter.md)"
  - "[020/60 Engine version gate — content outside the supported range never starts](../../subtasks/020_content-contract/60_engine-version-gate.md)"
  - "[030/10 Workspace and crate boundaries — 14 crates, dependencies point one way](../../subtasks/030_rust-engine/10_workspace-and-crate-boundaries.md)"
  - "[030/20 Error model — typed errors, one error record, fatal versus content errors](../../subtasks/030_rust-engine/20_error-model.md)"
  - "[080/10 Choose the UI framework (open question 12)](../../subtasks/080_ui-and-client/10_ui-framework-decision.md)"
  - "[170/10 Rust tests — the shared harness, unit and integration layers](../../subtasks/170_testing/10_rust-tests.md)"
---

The new repositories exist and build; the engine and client work has a fixed contract to build against.

# 01 To Do
- [ ] **Set up the three repositories** with `ctl`, the gate, CI and `AGENTS.md` (group 010).
- [ ] **Freeze the content contract** as golden fixtures from this repository's output, before any engine code (group 020).
- [ ] **Decide the UI framework** (080/10). Everything in 080, 090, 100 and 150 waits for it.
- [ ] **Lay out the crate workspace and the error model** (030/10, 030/20).

# 02 Status and Result
Foundation work has started: the three repositories were created and initialised on 2026-09-30.

# 03 References
- [The plan overview](./overview.md)
- The design: [notes index](../../notes/01_overview/01_index.md)

# 04 Decisions
- See [the plan overview](./overview.md#04-decisions).

# 05 Notes & Analysis
## 01 Scope
The `subtasks:` list above is the whole scope of this stage. Each subtask is written for a cold start: read its references first.
