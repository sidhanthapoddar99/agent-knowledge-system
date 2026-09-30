---
title: "Design notes — index"
---

These notes are the settled design of the engine migration, organised by architectural component. They say what agentks will be and how each part works, so a builder can build against them. The discussion that led here, with its options and reversals, is in [brainstorm/](../../brainstorm/01_initial-discussion/01_index.md) and is not repeated. Anything not yet decided sits in [open questions and risks](./05_open-questions-and-risks.md), and each component note links there.

# 03 References

- [issue.md](../../issue.md) — the goal, the scope decisions and the done-criteria.
- The discussion record: [initial discussion](../../brainstorm/01_initial-discussion/01_index.md) and [future stages](../../brainstorm/02_future-stages/01_index.md).
- [Comment 002, the launch order](../../comments/002_2026-09-30_launch-order.md).

# 04 Decisions

- Decided (sidhantha, 2026-09-30): `notes/` holds the design, divided by architectural component. The discussion stays in `brainstorm/`.

# 05 Notes & Analysis

## 01 Start here

1. [01/02 System overview](./02_system-overview.md) — what agentks is, the principle behind it, the three states and the phases.
2. [01/03 Architecture](./03_architecture.md) — the components, what each owns, and the contracts between them.
3. [01/04 Flows](./04_flows.md) — install, start, edit, library, upgrade, publish, step by step.
4. Then the component you are building, from the sections below.
5. [01/05 Open questions and risks](./05_open-questions-and-risks.md) — before you start, check what is still open.

## 02 Overview

| Note | Answers |
|---|---|
| [01/02 System overview](./02_system-overview.md) | What is agentks, what are its goals and non-goals, what are the three states and the phases, what are the Phase 1 safeguards and the later stages? |
| [01/03 Architecture](./03_architecture.md) | Which components exist, what does each own, which contracts join them, how do the processes run? |
| [01/04 Flows](./04_flows.md) | What happens, component by component, from each user action to its result? |
| [01/05 Open questions and risks](./05_open-questions-and-risks.md) | What is undecided, what is only proposed, and what could go wrong? |

## 03 Engine

The Rust side: one binary holding the core, the server and the CLI.

| Note | Answers |
|---|---|
| [02/01 Content format](../02_engine/01_content-format.md) | What is a valid page on disk: markdown, frontmatter, links and embeds, `NN_` prefixes, `settings.json`, first-class diagram and artifact pages? |
| [02/02 Project config](../02_engine/02_project-config.md) | What must `config/` hold, what does each file mean, and what may `.env` override? |
| [02/03 Rust engine](../02_engine/03_rust-engine.md) | How is the core structured: loaders, the site index, the markdown pipeline, the tracker, derived page data, theme CSS? |
| [02/04 Sync engine and server](../02_engine/04_sync-engine-and-server.md) | How does the server serve the client, what travels over the `/api` WebSocket, how are changes watched and pushed, and how will multi-user sync work? |
| [02/05 Rust CLI](../02_engine/05_rust-cli.md) | Which commands exist, what does each do, and how do they share the core? |
| [02/06 Machine home and build cache](../02_engine/06_machine-home-and-build-cache.md) | What lives in `~/.agentks/`, how is the build cache keyed, and how does manual cleanup work? |

## 04 Frontend

The JavaScript side: one shared UI package and the client app.

| Note | Answers |
|---|---|
| [03/01 Shared UI package](../03_frontend/01_shared-ui-package.md) | What is `agentks-ui`, what makes a component pure, and how does the one data interface work? |
| [03/02 Client application](../03_frontend/02_client-application.md) | How does the single-page app route, fetch, cache and display pages; how is it mobile- and PWA-friendly? |
| [03/03 Editor engines](../03_frontend/03_editor-engines.md) | How does in-place editing work in raw and live preview, and how will diagram editing work? |
| [03/04 Theming and layouts](../03_frontend/04_theming-and-layouts.md) | Which built-in layouts exist, how does CSS branding work, and what is the theme contract? |
| [03/05 Dev toolbar](../03_frontend/05_dev-toolbar.md) | What is on the bar, how does Edit switch on, and which dev tools return? |

## 05 Ecosystem

What sits around the binary.

| Note | Answers |
|---|---|
| [04/01 Library system](../04_ecosystem/01_library-system.md) | How do `dep.yaml`, `dep.lock`, `manifest.json` and `library.json` work, and where may elements be used? |
| [04/02 AI plugins and skills](../04_ecosystem/02_ai-plugins-and-skills.md) | Which AI plugins exist, what do their skills teach, and how will agent hooks and retrieval fit? |
| [04/03 Extensions](../04_ecosystem/03_extensions.md) | What could `agentksx` commands and site scripts add later, and what must they never change? |
| [04/04 Templates and init](../04_ecosystem/04_templates-and-init.md) | How does `agentks init --template` create a project? |
| [04/05 Video pages](../04_ecosystem/05_video-pages.md) | What does the engine give narrated video pages: audio, the voice model, libraries? |

## 06 Delivery

How agentks is built, released, published and launched.

| Note | Answers |
|---|---|
| [05/01 Repositories and layout](../05_delivery/01_repositories-and-layout.md) | Which repositories exist and how is the main one laid out? |
| [05/02 Publishing (SSG)](../05_delivery/02_publishing-ssg.md) | How does `agentks build` turn a project into a static site with islands? |
| [05/03 Versioning and migrations](../05_delivery/03_versioning-and-migrations.md) | How do the version gate, forced migrations, docs and library migrations, and 1.0.0 work? |
| [05/04 Distribution and install](../05_delivery/04_distribution-and-install.md) | What is released, how is it installed and updated, and how does mise pin a version? |
| [05/05 Development workflow and testing](../05_delivery/05_development-workflow-and-testing.md) | How does the team develop agentks (state 1), and how is the new engine proven correct? |
| [05/06 Deployment and hosting](../05_delivery/06_deployment-and-hosting.md) | How are agentks.neuralabs.org and a user's own site hosted: nginx, the Dockerfile, CDNs? |
| [05/07 Docs rewrite and launch](../05_delivery/07_docs-rewrite-and-launch.md) | What are the six launch steps, how are the docs rewritten, and how does this repository retire? |

## 07 How to keep these notes true

- A note states the design as it will be. It does not narrate how the decision was reached; that stays in `brainstorm/`.
- When the user decides an open question, the answer goes into the owning note's `04 Decisions` and body, and its row leaves [open questions and risks](./05_open-questions-and-risks.md).
- A claude proposal is marked as proposed until the user confirms it.
- Every reference to a file in this project is a relative link.
