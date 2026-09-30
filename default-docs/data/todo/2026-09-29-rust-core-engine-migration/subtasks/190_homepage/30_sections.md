---
title: "Homepage: the sections of the page"
status: open
---

The page itself, built from the copy and design plan in [10](./10_content-and-design.md) on the scaffold from [20](./20_app-scaffold.md). One page, a few sections, each doing one job, ending in two actions: install agentks, or read the docs.

# 01 To Do
- [ ] **Header** — the agentks logo and name, links to Docs (`/docs`), GitHub (`https://github.com/NeuraLabsHQ/agent-knowledge-system`), and the theme toggle. On mobile, a compact menu.
- [ ] **Hero** — the one-sentence message, the one memorable element from the design plan (the folder-to-page view is the proposal), and the two actions: the install command with a copy button, and "Read the docs".
- [ ] **What it does** — three to five capabilities, each shown with a real example rather than an icon grid: write in plain markdown in any editor; read and edit it as a site; a tracker built for AI agents; libraries of reusable elements; publish as a static site. Use structure that fits the content; a numbered layout only for a real sequence.
- [ ] **How it works** — the real sequence (install, `agentks init`, `agentks start`, edit, `agentks build`), which *is* a sequence, so numbering fits here.
- [ ] **Works with your AI** — the agentks plugin from the Neuralabs marketplace, the CLI as the agent's tool; one real command and its output.
- [ ] **Install** — the Linux/macOS and Windows commands in tabs, each with a copy button; a link to the install page in the docs for options.
- [ ] **Footer** — Docs, GitHub, the library repository, the marketplace, "A Neuralabs project" linking to neuralabs.org, the licence.
- [ ] **Responsive** down to 360 px wide; visible keyboard focus; `prefers-reduced-motion` respected; colour contrast AA in both themes.
- [ ] **Critique pass** — screenshots in light and dark, desktop and mobile; remove one decoration that does not serve the message; record the before and after in Result.

## Guardrails
- Follow the design plan approved in [10](./10_content-and-design.md). A change to it goes back to 10 first.
- Colours, fonts and spacing only through the shared CSS variables ([40](./40_shared-look-with-docs.md)).
- Every command on the page is copied from a real run of the released binary.

## Done when
- The exported page has every section above and passes [190/60 homepage checks](./60_homepage-checks.md).
- The install command copied from the page installs agentks in a clean container (once hosting redirects exist; before that, the GitHub release URL).
- sidhantha has reviewed the page.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Repository:** `NeuraLabsHQ/agent-knowledge-system`, folder `apps/agentks-homepage/`.
- **Read first:** [190/10 content and design](./10_content-and-design.md) (its Result), [distribution and install](../../notes/05_delivery/04_distribution-and-install.md) (the install commands), [templates and init](../../notes/04_ecosystem/04_templates-and-init.md).
- **Depends on:** [190/10 content and design](./10_content-and-design.md), [190/20 app scaffold](./20_app-scaffold.md), [190/40 shared look](./40_shared-look-with-docs.md).
- **Unblocks:** [190/60 homepage checks](./60_homepage-checks.md), [195/20 build and deploy pipeline](../195_hosting/20_build-and-deploy-pipeline.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): the install URLs on agentks.neuralabs.org redirect to the GitHub release ([deployment and hosting](../../notes/05_delivery/06_deployment-and-hosting.md)).

# 05 Notes & Analysis

## Watch out
- The copy button must copy exactly the command shown, with no hidden characters; test by pasting into a shell.
