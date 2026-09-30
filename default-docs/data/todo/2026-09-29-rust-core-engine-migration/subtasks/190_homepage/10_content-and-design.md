---
title: "Homepage: the message, the copy and the design plan"
status: open
---

Before any code, the homepage needs to know what it says and how it looks. This leaf writes the copy for every section and a compact design plan (palette, type, layout, the one memorable element), reviewed against generic defaults so the page does not look like every other developer-tool landing page. The subject is specific: a tool where a folder of markdown is the document and the site is only a view of it, written mostly by AI agents and read by people. The design should come from that.

# 01 To Do
- [ ] **The message.** One sentence for what agentks is, one for who it is for, one for why it is different. Draft from the [system overview](../../notes/01_overview/02_system-overview.md): "The filesystem is the document. The app renders it."
- [ ] **Copy for each section** in [30](./30_sections.md): plain verbs, sentence case, no filler, user words not system words ("your docs folder", not "content sections"). Every command shown is real and was run.
- [ ] **The design plan**, written into this leaf's Result:
    - [ ] Colour: 4–6 named hex values, derived from or compatible with the docs theme tokens ([40](./40_shared-look-with-docs.md)), in light and dark.
    - [ ] Type: one or two families with distinct roles, a type scale, weights. Chosen for this product, not a default.
    - [ ] Layout: an ASCII wireframe for desktop and mobile; alignment rules.
    - [ ] The one memorable element. A proposal to test: the hero shows a real project folder (tree and markdown source) and the page agentks renders from it, side by side, so "the filesystem is the document" is seen rather than claimed. One orchestrated reveal on load, reduced motion respected.
    - [ ] Principles: what makes this page this product's.
- [ ] **Review the plan against the defaults** listed in the frontend-design skill (cream and terracotta, near-black with an acid accent, broadsheet rules, the SaaS card grid, all-caps eyebrows, monospace data labels, arrows on links, numbered markers on non-sequences). Change any part that is a default rather than a choice, and say what changed and why.
- [ ] **Get sidhantha's review** of the message and the plan before building [30](./30_sections.md). Record the answers as decisions.

## Guardrails
- No claim about a feature that the release does not have.
- No invented testimonials, user counts or benchmarks. Real numbers only, with their source (for example the measured binary size from [170/40](../170_testing/40_performance-budget.md)).
- Load the frontend-design skill before writing the plan.

## Done when
- The copy for every section and the design plan are in this leaf's Result.
- The plan's review against defaults is written down, with what changed.
- sidhantha has approved or amended both; the answers are in Decisions.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Repository:** `NeuraLabsHQ/agent-knowledge-system`, `apps/agentks-homepage/` (the copy may live in `apps/agentks-homepage/content/` once the scaffold exists).
- **Read first:**
  - [System overview](../../notes/01_overview/02_system-overview.md) and [architecture](../../notes/01_overview/03_architecture.md) — the product in its own words.
  - [AGENTS.md](../../../../../../AGENTS.md), "The filesystem is the document. The app renders it." — the load-bearing principle, the best source for the message.
  - [Library system](../../notes/04_ecosystem/01_library-system.md) and [AI plugins and skills](../../notes/04_ecosystem/02_ai-plugins-and-skills.md) — two features the page should show.
  - The org homepage for brand context: `/home/sid/projects/06_02_NeuraLabs/neuralabs-homepage` (its `neuralabs.md` and `src/components/`).
- **Depends on:** nothing. Can start at once.
- **Unblocks:** [190/30 sections](./30_sections.md), [190/40 shared look](./40_shared-look-with-docs.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): the homepage is at agentks.neuralabs.org/, part of the Neuralabs brand family ([deployment and hosting](../../notes/05_delivery/06_deployment-and-hosting.md)).

# 05 Notes & Analysis

## Watch out
- The audience is technical and skeptical of marketing. Showing the real tool (a real folder, a real command) persuades more than adjectives.
