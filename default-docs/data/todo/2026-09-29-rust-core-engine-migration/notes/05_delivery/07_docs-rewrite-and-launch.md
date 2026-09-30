---
title: "The docs rewrite and the launch"
---

The launch runs in **six steps**, in this order: build the Rust engine, the client and the default library, and test them end to end; get the Neuralabs plugin marketplace running; build the homepage; rewrite the docs completely; host the website at agentks.neuralabs.org; archive this repository. The engine comes first and the website last. Until the new docs are fully migrated and usable, **this repository's docs and skills stay in use**. The skills for the new version are written before the switch. Then **everything switches at once**: new docs, new skills, new installer. Nobody is ever caught between two half-finished systems. The tracker moves into the new repository earlier, during step 1, once the new engine and client render it correctly. This repository stops building once the new release is final, and is transferred to NeuraLabsHQ and archived at the end, so its old links keep redirecting.

# 03 References

- [The launch order comment](../../comments/002_2026-09-30_launch-order.md) — the six steps as the user set them.
- [Repositories and layout](./01_repositories-and-layout.md) — the repositories each step builds, and the tracker move.
- [Publishing](./02_publishing-ssg.md) — Phase 3, which step 5 needs.
- [Deployment and hosting](./06_deployment-and-hosting.md) — step 5 in detail.
- [Distribution and install](./04_distribution-and-install.md) — the installer and moving users over.
- [Versioning and migrations](./03_versioning-and-migrations.md) — 1.0.0 and `agentks migrate`.
- [AI plugins and skills](../04_ecosystem/02_ai-plugins-and-skills.md) — the two plugins step 2 publishes.
- [System overview](../01_overview/02_system-overview.md) — the phases this order sits on.
- [Brainstorm: launch order and hosting](../../brainstorm/02_future-stages/10_launch-order-and-hosting.md) and [phasing](../../brainstorm/01_initial-discussion/15_phasing.md).
- [2026-04-19-docs-phase-2](../../../2026-04-19-docs-phase-2/issue.md) — today's docs work, which step 4 replaces.
- Today's docs: the [user guide](../../../../user-guide) and the [developer docs](../../../../dev-docs).

# 04 Decisions

- Decided (sidhantha, 2026-09-30): the order of work is the six steps in section 01.
- Decided (sidhantha, 2026-09-30): the docs are rewritten completely. Until they are fully migrated and usable, this repository's docs are used.
- Decided (sidhantha, 2026-09-30): the skills for the new version are ready before the switch. Then everything switches at once.
- Decided (sidhantha, 2026-09-30): the tracker moves into `docs/` of the new repository once the Rust engine and the client work.
- Decided (sidhantha, 2026-09-30): the first Rust release is 1.0.0, after Phases 1 and 2.
- Decided (sidhantha, 2026-09-30): this repository stops building once the new release is final, and is archived after it. Existing users get an option to update.
- Decided (sidhantha, 2026-09-30): the marketplace moves to `NeuraLabsHQ/neuralabs-plugin-marketplace`, with two agentks plugins: one for using agentks, one for building and hosting libraries.
- Decided (sidhantha, 2026-09-30): no subtasks yet; the notes are kept consistent first.
- Proposed (claude, 2026-09-30), not yet agreed: the switch-over checklist in section 04, the docs structure in section 03, and the retirement steps in section 05.

# 05 Notes & Analysis

## 01 The six steps

| Step | Work | Needs | Done when |
|---|---|---|---|
| 1 | Build the Rust engine, the client and the default library, and test them end to end | — | Phases 1 and 2 pass their checks ([development workflow](./05_development-workflow-and-testing.md)); the default library is tagged; 1.0.0 can be released |
| 2 | Get the Neuralabs plugin marketplace running, with the two agentks plugins | Step 1, so the skills describe the real tool | Both plugins install from `NeuraLabsHQ/neuralabs-plugin-marketplace` and their skills match 1.0.0 |
| 3 | The agentks homepage | — | `apps/agentks-homepage` exports a complete static site |
| 4 | The docs migration: a complete rewrite | Step 1 | Every page in the new `docs/` is written for the new version and renders correctly with the new engine |
| 5 | Hosting: agentks.neuralabs.org, `/` and `/docs` | Steps 3 and 4, and Phase 3's `agentks build` | The site is live; `agentks docs` ships |
| 6 | The official archival of this repository | Step 5, so users have somewhere to go | This repository is archived in place |

**Where the phases fall.** Phases 1 and 2 are step 1, and 1.0.0 ships at its end. Phase 3 must be finished before step 5, because the docs at `/docs` are built by `agentks build`. Steps 3 and 4 can run beside Phase 3.

## 02 The tracker move, inside step 1

The active tracker depends on today's agentks, so it stays here until the Rust engine and the client render it correctly. Then its active issues are copied into the new repository's `docs/`, keeping their folder names, and the copies become the only live tracker ([repositories and layout](./01_repositories-and-layout.md)). Closed issues stay in this repository as history.

## 03 The docs rewrite (step 4)

Why a rewrite and not a port: today's docs describe Astro internals, the discarded editor, custom layouts and the framework checkout, none of which exist in the new version. Porting them would carry that history into a product that should describe only the current system.

**Structure (claude, proposed).** Keep today's audience split: a user guide teaches how to use agentks, and developer docs explain how it is built.

| Section | Covers |
|---|---|
| Getting started | Install, `agentks init`, `agentks start`, the project folder |
| Writing content | Pages, `NN_` ordering, frontmatter, links and `[[…]]` embeds, diagrams, artifacts, images |
| Blog, issues, custom pages | Each content type |
| Configuration | `config/`, `site.yaml`, `.env` overrides, `dep.yaml` and `dep.lock` |
| Libraries | Using libraries, the catalog, `agentks library`; building a library (with the library-development plugin) |
| Themes | CSS, the theme contract, `agentks theme css` |
| Editing | The dev toolbar, raw and live preview |
| Publishing | `agentks build`, the Dockerfile, static hosts and CDNs |
| Upgrading | Versions, `agentks migrate`, pinning with mise, moving from agent-ks |
| CLI reference | Every command |
| Developer docs | Architecture, the engine, the WebSocket messages, the shared UI package, the static renderer, migrations, releasing |

**Rules for the rewrite.**

- The docs describe the current system only. No history, no "before 1.0 this was…". History lives in git and the tracker; the upgrade page is the one place that talks about old formats.
- The docs are an ordinary agentks project. Every feature they need must work for users too.
- Each page for a feature newer than 1.0.0 states the version it arrived in.
- The docs link into the skills' topics and the skills link to hosted pages, so the two stay one set.

**Carried from today's docs work.** [2026-04-19-docs-phase-2](../../../2026-04-19-docs-phase-2/issue.md) pauses its Astro-internals parts; its still-valid parts feed the rewrite.

## 04 The switch-over

This repository's docs and skills stay the reference until everything below is true. Then the switch happens in one release:

1. The new docs are complete and render correctly with the new engine (step 4).
2. The two plugins are rewritten for the new version and published through the Neuralabs marketplace (step 2).
3. The website is live, with the install scripts redirecting to the new repository (step 5).
4. The installer and the CLI's updater point at the new repository.
5. This repository publishes its final 0.x release, whose updater prints a notice naming the new install command.

Until then, users keep using `agent-ks` 0.x with today's docs and skills, and publishers keep publishing with it.

## 05 Retiring this repository (step 6)

| Action | Why |
|---|---|
| Stop building once 1.0.0 is final | No work splits across two engines |
| Final 0.x release with the notice above | Installed CLIs keep checking this repository; without the notice they never learn about the new one |
| Archive in place, with a banner pointing to NeuraLabsHQ | `NeuraLabsHQ/agent-knowledge-system` is a new repository, so this one cannot be transferred there. An archived repository stays readable and its releases stay downloadable, so old install commands, links and mise pins keep working |
| Keep the 0.x releases and docs | Publishers pinned to 0.x until Phase 3 still need them |
| A migration guide in the new docs | Install `agentks`, run `agentks migrate` in each project, remove the old framework folder |

The personal marketplace stays for personal plugins; the agentks plugins leave it.

## 06 Open

- The exact nginx layout and host, at step 5 ([deployment and hosting](./06_deployment-and-hosting.md)).
- Both in [open questions and risks](../01_overview/05_open-questions-and-risks.md).
