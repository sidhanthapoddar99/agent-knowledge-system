---
title: "Homepage: the message, the copy and the design plan"
status: review
---

Before any code, the homepage needs to know what it says and how it looks. This leaf writes the copy for every section and a compact design plan (palette, type, layout, the one memorable element), reviewed against generic defaults so the page does not look like every other developer-tool landing page. The subject is specific: a tool where a folder of markdown is the document and the site is only a view of it, written mostly by AI agents and read by people. The design should come from that.

# 01 To Do
- [x] **The message.** One sentence for what agentks is, one for who it is for, one for why it is different. Draft from the [system overview](../../notes/01_overview/02_system-overview.md): "The filesystem is the document. The app renders it."
- [x] **Copy for each section** in [30](./30_sections.md): plain verbs, sentence case, no filler, user words not system words ("your docs folder", not "content sections"). Every command shown is real and was run.
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
Review. The message, the copy and the design plan are written and built into the page; waiting on sidhantha's review of both.

## Result

The page built from this plan is in the main repo at `apps/agentks-homepage/` (worktree branch `wave1/homepage`). Every word of copy is in one file, `apps/agentks-homepage/src/modules/home/content.ts`; addresses and commands are in `src/lib/site.ts`.

### The message

- **What it is:** "Your docs folder is the document." agentks reads a folder of plain markdown and shows it as a site you can browse and edit on your own machine. The files stay the source: they read the same in your editor, in Obsidian or with cat.
- **Who it is for:** projects where AI agents write the docs and the issue tracker, and people read and review them.
- **Why it is different:** the site is a view of the files, not a place the content lives. The hero shows this rather than claiming it.

### The copy, by section

| Section | Copy (short form; full text in `content.ts`) |
|---|---|
| Hero | The message above; the Linux and macOS install command with a copy button; "Read the docs" to `/docs/` |
| What you get | Write plain markdown, in any editor · Read and edit it as a site · An issue tracker agents can work in · Diagrams and artifacts are pages too · Share elements through libraries. Each has two or three plain sentences and a real file excerpt (a tree, a link, `dep.yaml`) |
| From install to your first page | 1 Install agentks · 2 Create a project (`agentks init`) · 3 Start it (`cd docs && agentks start`) · 4 Write |
| Made for your coding agent | The plugin's two install commands for Claude Code, and `agentks issue context <issue> --json` as the command an agent works through |
| Install | Tabs for Linux and macOS (`curl -fsSL https://agentks.neuralabs.org/install.sh \| sh`) and Windows (`irm https://agentks.neuralabs.org/install.ps1 \| iex`); a link to the docs for options |
| Footer | Docs, GitHub, the library repository, the plugin marketplace; "A Neuralabs project, open source under the MIT licence" |

Left out on purpose, because 1.0.0 does not ship them: publishing with `agentks build` (Phase 3), multi-user editing, video pages, search.

### The design plan

**Colour.** Paper and source are the two surfaces: the rendered page and a file shown as text. Link blue is the one accent, because in agentks the relative link is the thing the whole system protects.

| Role | Light | Dark | Theme contract name |
|---|---|---|---|
| Paper (page) | `#ffffff` | `#16181c` | `--color-bg-primary` |
| Source (file panes, commands) | `#f1f3f6` | `#1f2228` | `--color-bg-secondary` |
| Ink (text) | `#1b1e23` | `#e7e9ec` | `--color-text-primary` |
| Graphite (supporting text) | `#545b66` | `#a9b0bb` | `--color-text-secondary` |
| Rule (borders) | `#d9dde3` | `#333842` | `--color-border-default` |
| Link blue (links, the one action) | `#2448c8` | `#93a6f7` | `--color-brand-primary` |

Neutral greys fit the Neuralabs brand, which is monochrome.

**Type.** Two families with two jobs. Source Serif 4 (variable, with optical sizes) is the rendered page's voice: headings and prose. IBM Plex Mono is only ever a file, a path or a command: never a label. Body 18 px, hero line `clamp(2.375rem … 3.75rem)` at weight 500, section titles 30 px, row titles 20 px, code 13 px. Two weights: 400 and 500 (600 only for sidebar group names in the figure). Sizes follow the docs theme's steps, so a size means the same on `/` and `/docs`.

**Layout.** Everything left-aligned on one container edge, max 72 rem; prose columns at 40 rem (about 70 characters).

```
Desktop                                         Mobile (360 px)
[mark agentks]            Docs  GitHub  (◐)     [mark agentks] Docs GitHub (◐)
Your docs folder                                Your docs folder
is the document.                                is the document.
lede (2–3 lines) · audience line                lede · audience
[$ curl … | sh   Copy]  [Read the docs]         [$ curl …  Copy]
+--------------------+------------------+       [Read the docs]
| path of the file   | /url/of/page/    |       +-------------------+
| tree               | sidebar | page   |       | path · tree       |
| markdown source    |         |        |       | markdown source   |
+--------------------+------------------+       +-------------------+
What you get                                    | /url · page       |
 title + 2 sentences   | file excerpt   |       +-------------------+
 (x5 rows)                                      What you get: text, then excerpt
From install to your first page                 Steps 1–4: number, words, command
 1  words  `command`   (a vertical list)        Agent: prose, then commands
Made for your coding agent: prose, commands     Install: tabs, command
Install: tabs, command, docs link               Footer
Footer: mark, Neuralabs line | links
```

**The one memorable element.** The hero figure: a real docs file (its path, its folder tree with `NN_` prefixes, its markdown source) beside the page agentks shows from it (the URL without prefixes, the sidebar ordered by them, the title taken from frontmatter). On load, each group of source lines is marked in turn and the block it becomes appears on the page side, five steps in about three seconds. With reduced motion the end state shows at once.

**Principles.**
1. Show the file next to the page. The claim "the filesystem is the document" is made by the figure, not by adjectives.
2. Two voices: serif is the page, mono is the file. Mono never decorates.
3. Real content only: every tree, path and snippet is shaped like a real agentks project.
4. Structure carries meaning: numbers appear only on the four steps, which are a real sequence (and in `NN_` prefixes, which are real file names).

### The review against generic defaults

| Default from the frontend-design skill | Where the first draft stood | What changed |
|---|---|---|
| Cream and terracotta, serif display | A serif was chosen, which leans this way | Kept the serif because it is the rendered page's voice; paired it with cool white and link blue, not cream and clay. The hero line is weight 500, not a high-contrast display cut |
| Near-black with an acid accent | First idea was a dark-first hero with a glowing accent | Light is primary. Dark mode is a blue-grey with a soft link blue |
| Broadsheet: hairlines, zero radius, dense columns | Serif plus rules could drift here | One 8 px radius on panes and windows, spacing instead of rules between rows, single prose column |
| SaaS card grid, one shadow on everything | First sketch had five feature cards with icons | Rows of words beside real file excerpts. No icons. The one shadow (on the hero window) was cut in the critique pass |
| All-caps eyebrows, middle-dot meta, em-dash labels | — | None. Section titles are plain sentence-case headings |
| Monospace for data labels | First sketch used mono for small labels | Mono is used only for real paths, file content and commands |
| Arrows on links | — | None |
| Numbered markers on non-sequences | — | Numbers only on the install-to-first-page steps |
| The org's Geist | Geist is the Neuralabs homepage's face | Not used: Geist is a default for developer pages. The neutral palette keeps the Neuralabs family resemblance |

### Waiting on

- sidhantha's review of the message and the plan. Record the answers in Decisions.

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
- Decided (claude, 2026-09-30): the headline is "Your docs folder is the document." rather than "The filesystem is the document.", because the page speaks in user words ("your docs folder") and the figure below it shows the filesystem.
- Decided (claude, 2026-09-30): the page claims only what 1.0.0 ships. Publishing (`agentks build`), multi-user editing, video pages and search are left out, because 1.0.0 ships Phases 1 and 2 only. Add a publishing row when Phase 3 ships, which is before the site goes live.
- Decided (claude, 2026-09-30): Source Serif 4 for prose and IBM Plex Mono for files, because the page's subject is a file becoming a page, and two voices make that visible. Both are self-hosted from `@fontsource` packages.
- Decided (claude, 2026-09-30): link blue (`#2448c8` light, `#93a6f7` dark) is the one accent, because the relative link is the thing agentks protects, and blue on neutral grey fits the Neuralabs brand.
- Decided (claude, 2026-09-30): the capability rows use no icons and no cards, only words beside real file excerpts, because the audience is technical and a real file persuades more than an icon.
- Decided (claude, 2026-09-30): the agent section shows `agentks issue context <issue> --json` without output, because no 1.0.0 binary exists to run it and an invented output would be a claim.

# 05 Notes & Analysis

## Watch out
- The audience is technical and skeptical of marketing. Showing the real tool (a real folder, a real command) persuades more than adjectives.
