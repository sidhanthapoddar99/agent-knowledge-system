---
title: "Homepage: the sections of the page"
status: review
---

The page itself, built from the copy and design plan in [10](./10_content-and-design.md) on the scaffold from [20](./20_app-scaffold.md). One page, a few sections, each doing one job, ending in two actions: install agentks, or read the docs.

# 01 To Do
- [x] **Header** — the agentks logo and name, links to Docs (`/docs`), GitHub (`https://github.com/NeuraLabsHQ/agent-knowledge-system`), and the theme toggle. On mobile, the same two links and the toggle, with no menu: they fit at 360 px.
- [x] **Hero** — the one-sentence message, the one memorable element from the design plan (the folder-to-page view is the proposal), and the two actions: the install command with a copy button, and "Read the docs".
- [x] **What it does** — five capabilities, each shown with a real file excerpt rather than an icon grid: write plain markdown in any editor; read and edit it as a site; an issue tracker agents can work in; diagrams and artifacts are pages too; share elements through libraries. Use structure that fits the content; a numbered layout only for a real sequence.
- [ ] **Add a "publish as a static site" row** to "What you get" (`src/modules/home/content.ts`) when Phase 3 ships `agentks build`, before the site goes live.
- [x] **How it works** — the real sequence, numbered: install, `agentks init`, `agentks start`, write. `agentks build` is left out, because 1.0.0 does not ship it.
- [x] **Works with your AI** — the agentks plugin from the Neuralabs marketplace (the Claude Code commands), the CLI as the agent's tool; one command, shown without output until a 1.0.0 binary can produce one ([10](./10_content-and-design.md)).
- [x] **Install** — the Linux/macOS and Windows commands in tabs, each with a copy button; a link to the install page in the docs for options.
- [x] **Footer** — Docs, GitHub, the library repository, the marketplace, "A Neuralabs project" linking to neuralabs.org, the licence.
- [x] **Responsive** down to 360 px wide; visible keyboard focus; `prefers-reduced-motion` respected; colour contrast AA in both themes.
- [x] **Critique pass** — screenshots in light and dark, desktop and mobile; remove one decoration that does not serve the message; record the before and after in Result.

## Guardrails
- Follow the design plan approved in [10](./10_content-and-design.md). A change to it goes back to 10 first.
- Colours, fonts and spacing only through the shared CSS variables ([40](./40_shared-look-with-docs.md)).
- Every command on the page is copied from a real run of the released binary.

## Done when
- The exported page has every section above and passes [190/60 homepage checks](./60_homepage-checks.md).
- The install command copied from the page installs agentks in a clean container (once hosting redirects exist; before that, the GitHub release URL).
- sidhantha has reviewed the page.

# 02 Status and Result
Review. The sections were rebuilt on 2026-10-01 (merged at `a9c94b9`): the hero workspace story, seven chapters (track, discuss, remember, docs, artifacts, video in preview, library), the issue structure, agents, three principles and install. Each passed a screenshot critique in both modes, on mobile and with reduced motion (`data/homepage-3/` in the main checkout). Left for later work: re-copying the commands from a real 1.0.0 run, the publishing row once Phase 3 ships, the 190/60 checks, and sidhantha's review.

## Result

On the main repo's `main` branch (merged at `a9c94b9`), in `apps/agentks-homepage/src/`:

| Section | File |
|---|---|
| Header: the mark, Features, Structure, Agents, "by NeuraLabs", theme toggle | `layout/site/header.tsx` |
| Hero: the message, the lede with the full name, and the workspace story of one issue from request to approval | `modules/home/components/hero.tsx`, `workspace-story.tsx` |
| A place for every kind of work: seven chapters, each with an animated example of a real agentks file; a sticky stage on desktop, inline on mobile | `modules/home/components/chapters.tsx`, `chapter-story.tsx`, `demos.tsx` |
| One structure for every issue: the five numbered parts and the files beside them | `modules/home/components/structure.tsx` |
| Agents: the plugin commands, then the CLI lines | `modules/home/components/agents.tsx` |
| Built on files you own: three principles | `modules/home/components/principles.tsx` |
| Install: Linux and macOS / Windows tabs, copy buttons | `modules/home/components/install.tsx` |
| Footer: the full name, links, Neuralabs, MIT licence | `layout/site/footer.tsx` |
| 404 page, exported as `out/404.html` | `app/not-found.tsx` |

- Shared pieces: `marks.tsx` (the dot for who acted and the status mark, both passive), `play-on-view.tsx` (a figure waits until it comes into view, then plays), and `lib/motion.ts` (the three motion hooks). Figures play only on screen and pause in background tabs; reduced motion and no JavaScript show them finished.
- Copy: `modules/home/content.ts`. Addresses and commands: `lib/site.ts`.
- Quality floor: responsive to 360 px, a skip link, visible focus rings, tabs follow the WAI-ARIA pattern. 190/60 measures contrast.
- Tests: 36 homepage tests pass in the gate (`lib/site.test.ts`, `lib/seo.test.ts`, `lib/theme.test.ts`, `styles/theme.test.ts`). `styles/theme.test.ts` allows a local custom property, such as `--tone`, in a component's CSS only when it shadows no theme or `--home-` name.
- Screenshots: 21 in the main checkout's `data/homepage-3/`, in both modes, on mobile and with reduced motion. They were taken by hand with Playwright and the cached Chromium, not in the gate.

## Agent log
none

# 03 References
- **Repository:** `NeuraLabsHQ/agent-knowledge-system`, folder `apps/agentks-homepage/`.
- **Read first:** [190/10 content and design](./10_content-and-design.md) (its Result), [distribution and install](../../notes/05_delivery/04_distribution-and-install.md) (the install commands), [templates and init](../../notes/04_ecosystem/04_templates-and-init.md).
- **Depends on:** [190/10 content and design](./10_content-and-design.md), [190/20 app scaffold](./20_app-scaffold.md), [190/40 shared look](./40_shared-look-with-docs.md).
- **Unblocks:** [190/60 homepage checks](./60_homepage-checks.md), [195/20 build and deploy pipeline](../195_hosting/20_build-and-deploy-pipeline.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): the install URLs on agentks.neuralabs.org redirect to the GitHub release ([deployment and hosting](../../notes/05_delivery/06_deployment-and-hosting.md)).
- Decided (claude, 2026-09-30): no mobile menu. The header has two links and the theme toggle, which fit at 360 px, so a menu would hide links for no gain.
- Decided (claude, 2026-09-30): the install section shows the agentks.neuralabs.org install URLs, not the GitHub release URLs, because the page is served from that domain and goes live with the redirects.
- Decided (claude, 2026-09-30): the plugin section shows the Claude Code commands only (`/plugin marketplace add NeuraLabsHQ/neuralabs-plugin-marketplace`, `/plugin install agentks@neuralabs-plugin-marketplace`), because the notes give no Codex install command yet.

# 05 Notes & Analysis

## Watch out
- The copy button must copy exactly the command shown, with no hidden characters; test by pasting into a shell.
