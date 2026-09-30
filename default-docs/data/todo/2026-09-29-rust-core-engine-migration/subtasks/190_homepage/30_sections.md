---
title: "Homepage: the sections of the page"
status: review
---

The page itself, built from the copy and design plan in [10](./10_content-and-design.md) on the scaffold from [20](./20_app-scaffold.md). One page, a few sections, each doing one job, ending in two actions: install agentks, or read the docs.

# 01 To Do
- [x] **Header** — the agentks logo and name, links to Docs (`/docs`), GitHub (`https://github.com/NeuraLabsHQ/agent-knowledge-system`), and the theme toggle. On mobile, a compact menu.
- [x] **Hero** — the one-sentence message, the one memorable element from the design plan (the folder-to-page view is the proposal), and the two actions: the install command with a copy button, and "Read the docs".
- [x] **What it does** — three to five capabilities, each shown with a real example rather than an icon grid: write in plain markdown in any editor; read and edit it as a site; a tracker built for AI agents; libraries of reusable elements; publish as a static site. Use structure that fits the content; a numbered layout only for a real sequence.
- [x] **How it works** — the real sequence (install, `agentks init`, `agentks start`, edit, `agentks build`), which *is* a sequence, so numbering fits here.
- [x] **Works with your AI** — the agentks plugin from the Neuralabs marketplace, the CLI as the agent's tool; one real command and its output.
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
Review. Every section is built and passed a screenshot critique. Left for later work: re-copying the commands from a real 1.0.0 run, the 190/60 checks, and sidhantha's review.

## Result

In the main repo, worktree branch `wave1/homepage`, `apps/agentks-homepage/src/`:

| Section | File |
|---|---|
| Header: logo, Docs, GitHub, theme toggle | `layout/site/header.tsx` |
| Hero: message, install command with copy button, Read the docs, the folder-to-page figure | `modules/home/components/hero.tsx`, `folder-to-page.tsx` |
| What you get: five rows, words beside a real file excerpt | `modules/home/components/capabilities.tsx` |
| From install to your first page: four numbered steps | `modules/home/components/steps.tsx` |
| Made for your coding agent: plugin commands, one CLI command | `modules/home/components/agents.tsx` |
| Install: Linux and macOS / Windows tabs (arrow keys work), copy buttons | `modules/home/components/install.tsx` |
| Footer: Docs, GitHub, library, marketplace, Neuralabs, MIT licence | `layout/site/footer.tsx` |
| 404 page, exported as `out/404.html` | `app/not-found.tsx` |

- Copy: `modules/home/content.ts`. Addresses and commands: `lib/site.ts`, shared by the hero, the steps and the install tabs.
- Quality floor: responsive to 360 px, a skip link, visible focus rings, `prefers-reduced-motion` shows the figure's end state, tabs follow the WAI-ARIA pattern. Contrast was chosen for AA (graphite `#545b66` on white is about 6.6:1); 190/60 measures it.
- Tests: `lib/site.test.ts`, 7 tests in about 15 ms. They check that every shown command is one line of printable ASCII (so the copy button copies exactly what is shown), that links are https or root paths, and that the app owns no `docs`, `install.sh`, `install.ps1` or `llms.txt` route.

### Critique pass (Playwright screenshots, 1440 px light and dark, 360 and 375 px)

| Before | After |
|---|---|
| At 375 px the page was 582 px wide: grid tracks sized to long commands | Every grid track is `minmax(0, 1fr)`; long commands scroll inside their box. 360 px renders at 360 px |
| The hero install command was cut off at 34 rem | The command box takes its own width |
| The four steps sat in four narrow columns and cut off the curl command | A vertical numbered list: number, words, command |
| The agent section's two columns cut off the plugin commands | Prose above, commands below at 44 rem |
| The hero window had a drop shadow | Removed: the border already separates it. This was the one decoration cut |

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
