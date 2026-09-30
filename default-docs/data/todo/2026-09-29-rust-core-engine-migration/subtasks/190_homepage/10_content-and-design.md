---
title: "Homepage: the message, the copy and the design plan"
status: review
---

Before any code, the homepage needs to know what it says and how it looks. This leaf writes the copy for every section and a compact design plan (palette, type, layout, the one memorable element), reviewed against generic defaults so the page does not look like every other developer-tool landing page. The subject is specific: a tool where a folder of markdown is the document and the site is only a view of it, written mostly by AI agents and read by people. The design should come from that.

# 01 To Do
- [x] **The message.** One sentence for what agentks is, one for who it is for, one for why it is different. Draft from the [system overview](../../notes/01_overview/02_system-overview.md): "The filesystem is the document. The app renders it."
- [x] **Copy for each section** in [30](./30_sections.md): plain verbs, sentence case, no filler, user words not system words ("your docs folder", not "content sections"). The commands shown come from the design notes; none is copied from a real run yet, because no 1.0.0 binary exists.
- [ ] **Re-copy every command from a real run** of the released 1.0.0 binary before launch: the install commands, `agentks init`, `agentks start`, the plugin commands and `agentks issue context`. Add a real output sample to the agent section then.
- [x] **The design plan**, written into this leaf's Result:
    - [x] Colour: 4–6 named hex values, derived from or compatible with the docs theme tokens ([40](./40_shared-look-with-docs.md)), in light and dark.
    - [x] Type: one or two families with distinct roles, a type scale, weights. Chosen for this product, not a default.
    - [x] Layout: an ASCII wireframe for desktop and mobile; alignment rules.
    - [x] The one memorable element. A proposal to test: the hero shows a real project folder (tree and markdown source) and the page agentks renders from it, side by side, so "the filesystem is the document" is seen rather than claimed. One orchestrated reveal on load, reduced motion respected.
    - [x] Principles: what makes this page this product's.
- [x] **Review the plan against the defaults** listed in the frontend-design skill (cream and terracotta, near-black with an acid accent, broadsheet rules, the SaaS card grid, all-caps eyebrows, monospace data labels, arrows on links, numbered markers on non-sequences). Change any part that is a default rather than a choice, and say what changed and why.
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
Review. The page was rebuilt around agents on 2026-10-01 and merged into the main repo's `main` at `a9c94b9`; waiting on sidhantha's review. Before launch, every command on the page is re-copied from a real 1.0.0 run.

## Result

The page is at `apps/agentks-homepage/` in the main repo. Every word of copy is in `src/modules/home/content.ts`; addresses and commands are in `src/lib/site.ts`. Screenshots of every section, in both modes, on mobile and with reduced motion, are in the main checkout's `data/homepage-3/`.

### The message

- **What it is:** "Your agents work here. You make the calls." The lede names the full product, "agentks, the Agent Knowledge System", and says what agents do there: open issues, ask, plan, build, log their runs and keep memory.
- **Who it is for:** people who work with AI coding agents and want the agents' work in files they own.
- **Why it is different:** the agents work in a structure, and only the person closes work. The hero shows this rather than claiming it.

### The sections

| Section | What it shows |
|---|---|
| Hero | A workspace story: one issue, "Add search to the docs", from the request to the approval. claude opens it and asks a question, and the status turns Input needed; you answer; claude plans; codex takes subtask 20, builds it and logs the run; claude saves memory; codex hands over for review; you mark it done. The issue folder fills with the files each step writes |
| A place for every kind of work | Seven chapters: track, discuss, remember, docs, artifacts, video (labelled "In preview") and library. Each has a small animated example of a real agentks file. On desktop a sticky stage swaps the example as you scroll; on mobile each example sits inline |
| One structure for every issue | The five numbered parts, `brainstorm/` → `notes/` → `plans/` → `subtasks/` → `agent-log/`, with `issue.md`, `agent-memory/` and `comments/` beside them |
| Agents | The plugin commands, then the CLI lines an agent works through |
| Built on files you own | Three principles |
| Install | Tabs for Linux and macOS, and Windows |
| Header and footer | Features, Structure, Agents, then "by NeuraLabs"; the footer carries the full name |

### The design

**Colour.** The values are unchanged. Signal blue now also means "an agent at work", as well as links and the one action. Statuses use the app's mapping: in progress is info; input needed and review are warning; done is success.

| Role | Light | Dark | Theme contract name |
|---|---|---|---|
| Paper (page) | `#ffffff` | `#16181c` | `--color-bg-primary` |
| Source (file panes, commands) | `#f1f3f6` | `#1f2228` | `--color-bg-secondary` |
| Ink (text) | `#1b1e23` | `#e7e9ec` | `--color-text-primary` |
| Graphite (supporting text) | `#545b66` | `#a9b0bb` | `--color-text-secondary` |
| Rule (borders) | `#d9dde3` | `#333842` | `--color-border-default` |
| Link blue (links, the one action) | `#2448c8` | `#93a6f7` | `--color-brand-primary` |

**Type.** Geist for prose and headings, Geist Mono for files, paths and commands, self-hosted from `@fontsource` packages, on NeuraLabs's monochrome base.

**Mark.** A rounded square with a plan cut out of it: three lines, and an agent's dot on the step it is working on.

**Motion.** CSS keyframes and transitions plus three small hooks (`src/lib/motion.ts`), with no animation library. Figures play only on screen and pause in background tabs. Reduced motion and no JavaScript show them finished.

### Waiting on

- sidhantha's review of the rebuilt page. Record the answers in Decisions.
- The video chapter's CSS illustration is replaced by the agentks-video player, behind a play button.

## Agent log
none

# 03 References
- **Repository:** `NeuraLabsHQ/agent-knowledge-system`, `apps/agentks-homepage/` (the copy is in `src/modules/home/content.ts`).
- **Read first:**
  - [System overview](../../notes/01_overview/02_system-overview.md) and [architecture](../../notes/01_overview/03_architecture.md) — the product in its own words.
  - [AGENTS.md](../../../../../../AGENTS.md), "The filesystem is the document. The app renders it." — the load-bearing principle, the best source for the message.
  - [Library system](../../notes/04_ecosystem/01_library-system.md) and [AI plugins and skills](../../notes/04_ecosystem/02_ai-plugins-and-skills.md) — two features the page should show.
  - The org homepage for brand context: `/home/sid/projects/06_02_NeuraLabs/neuralabs-homepage` (its `neuralabs.md` and `src/components/`).
- **Depends on:** nothing. Can start at once.
- **Unblocks:** [190/30 sections](./30_sections.md), [190/40 shared look](./40_shared-look-with-docs.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): the homepage is at agentks.neuralabs.org/, part of the Neuralabs brand family ([deployment and hosting](../../notes/05_delivery/06_deployment-and-hosting.md)).
- Decided (sidhantha, 2026-10-01): the homepage presents agentks as the place where AI agents work and coordinate with you (issues, plans, discussion, memory, docs, artifacts, videos), not as a docs folder.
- Decided (sidhantha, 2026-10-01): agentks is a NeuraLabs sub-product and looks like one: Geist and Geist Mono on NeuraLabs's monochrome base, with a mark built like the NeuraLabs mark. The header says "agentks" and "by NeuraLabs". The full name, Agent Knowledge System, is in the hero lede and the footer.
- Decided (sidhantha, 2026-10-01): the page shows video explanations and artifacts, such as design systems and variations to choose from. Video is labelled "In preview" until the video build ships.
- Decided (claude, 2026-10-01): the hero is one issue worked from request to approval, because it shows agents working and the person deciding without adjectives. In every figure only you mark work done, matching the closing rule.
- Decided (claude, 2026-10-01): the mark is a rounded square with a plan cut out of it: three lines, and an agent's dot on the step it is working on.
- Decided (claude, 2026-10-01): signal blue keeps its values (`#2448c8` light, `#93a6f7` dark) and means "an agent at work", as well as links and the one action. Statuses use the app's mapping: in progress is info; input needed and review are warning; done is success.
- Decided (claude, 2026-10-01): motion is CSS plus three small hooks, with no library. Figures play only on screen. Reduced motion and no JavaScript show them finished.
- Decided (claude, 2026-09-30, narrowed 2026-10-01): the page claims only what 1.0.0 ships. Publishing (`agentks build`) and search are left out, because 1.0.0 ships Phases 1 and 2 only. Add a publishing row when Phase 3 ships, which is before the site goes live.
- Decided (claude, 2026-10-01): "share it with a teammate over an access key" stays, because dev-docs-2/30_collaboration/01_overview.md says multi-user sync ships in 1.0.0.
- Decided (claude, 2026-10-01): the video chapter is a CSS illustration until the agentks-video player replaces it after the merge, behind a play button.
- Decided (claude, 2026-09-30): the agent section shows commands without output, because no 1.0.0 binary exists to run them and an invented output would be a claim.

# 05 Notes & Analysis

## Watch out
- The audience is technical and skeptical of marketing. Showing the real tool (a real folder, a real command) persuades more than adjectives.
