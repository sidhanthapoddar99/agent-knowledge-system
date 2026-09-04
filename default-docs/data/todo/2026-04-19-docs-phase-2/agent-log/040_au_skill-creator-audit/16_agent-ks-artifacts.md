---
title: agent-ks-artifacts — Opus review
---

# agent-ks-artifacts

**Verdict:** needs fixes — the shape is right and the numbers are exact, but one location rule sends the agent to a folder the engine never reads, and three theme-mechanism claims are false.

**Measured:** SKILL.md 533 words body, 596 with frontmatter (house limit 600) · references: publishing.md 138 lines, dataviz-color.md 118, palette.md 117, design-fundamentals.md 110, dataviz.md 107, design-systems.md 90, PROVENANCE.md 27 (house limit 150) · scripts: validate_palette.js 277 lines.

Verified clean: every relative link resolves (`agent-ks check skill-links` passes, 60 files); no site-absolute `](/…)` link anywhere; no history words; the 61 token names in SKILL.md all exist in `theme.yaml`; every hex, contrast ratio and ΔE in palette.md reproduces exactly when I run the bundled validator (light worst adjacent 24.2, the four sub-3:1 slots 2.58 / 1.99 / 2.47 / 2.94, dark worst adjacent 10.3, ramp floors 2.30 / 1.94 / 2.21 / 1.81, all four status contrasts); every validator flag the references name exists in the script; repo source and installed cache 0.10.1 are byte-identical.

## Findings

| # | Severity | Where | What | Why it matters | Fix |
|---|---|---|---|---|---|
| 1 | blocker | `references/publishing.md:10` | Names an issue's **subtask folder** as a home for an artifact. | The engine sets `allowArtifacts: false` for the `subtasks` section (`astro-doc-code/src/loaders/issue-sections.ts:96`), so an `.html` file there is never read and never renders; the user guide (`15_writing-content/08_artifact-pages.md:215`) and `agent-ks-issues/references/03_writing.md:45` both say `notes/` and `brainstorm/` only. | Cut "or subtask folder"; write "an issue's `notes/` or `brainstorm/` folder only", and add that no `NN_` prefix is required there. |
| 2 | major | `references/publishing.md:49` | "Do not redefine `--color-*`. **The injected CSS wins.**" | The route injects at the *start* of `<head>` (`pages/artifacts/[...path].ts:119-130`) and the theme declares light on `:root`, dark on `[data-theme="dark"]` (`styles/color.css:9,53`) — an artifact's own later `:root` rule has equal specificity and wins in **both** modes. The stated reason tells the agent a redefinition is a harmless no-op when it is exactly the silent dead-dark-mode failure the rule exists to prevent. | Replace the reason: "Your own `:root` rule is later in the head and wins, so a redefinition silently freezes the artifact against the site toggle." |
| 3 | major | `references/publishing.md:43` | "Both modes get `data-theme` stamped. The full page reads `localStorage.theme`, then `prefers-color-scheme`." | True for `site` only. In `self` mode the route serves the bytes untouched (`[...path].ts:179-181`), so no init script runs: the full page gets no `data-theme` and never reads `localStorage`. Only the *embed* is stamped in both modes, by the parent (`scripts/artifacts.ts:57-66`). An agent that keys a self artifact on `data-theme` alone ships a full page stuck in one mode. | Split per mode: "The embed is stamped in both modes. A `site` full page reads `localStorage.theme` then the OS preference; a `self` full page gets nothing injected, so its own `prefers-color-scheme` block is the only full-page fallback." |
| 4 | major | `SKILL.md:48`, `references/palette.md:9`, `references/design-systems.md:5,18,78`, `references/publishing.md:127,133` | Framework files are addressed as `astro-doc-code/src/styles/theme.yaml`, `default-docs/data/…` and `./start dev` — repo-root-relative, dogfood-mode only. | The skill ships to consumers, where the framework is a subfolder, so every one of those paths misses and the agent hunts or guesses. Sibling skills already solved this: `agent-ks-config/references/05_themes.md:11-12` writes `@root/default-docs/…` and `agent-ks-issues/SKILL.md:10` writes `<framework>/`. | Prefix with `@root/` (or `<framework>/`) throughout, and prefer `agent-ks theme tokens --json` wherever the need is values rather than the file. |
| 5 | minor | `SKILL.md:48` | "This list mirrors `…theme.yaml` → `required_variables`" — it does not: 61 names here against 66 there. | The five primitive sizes (`--font-size-base`, `-sm`, `-lg`, `-xl`, `-2xl`) are on the contract and deliberately left out here. A maintainer diffing the two reads a mismatch as drift and re-adds them, undoing the intent. | "Mirrors `required_variables` minus the primitive `--font-size-*` scale, which no layout or artifact consumes." |
| 6 | minor | `SKILL.md:48` | "change both in one edit, source and installed cache" is a maintainer instruction. | The agent building an artifact never edits `theme.yaml`; the coupling rule already lives in the repo `CLAUDE.md`. It spends trigger-time words on an action this reader cannot take. | Cut the clause; keep the pointer to the source file. |
| 7 | minor | `references/PROVENANCE.md:9,13,14` | Names three things that do not exist: the repo-root `tmp_skills/` snapshot (deleted), `SKILL.md §0` / `§1` (the current SKILL.md has no numbered sections), and `dataviz/` as a folder (it is `references/dataviz.md`). | The file's stated job is the upstream-fold-in map. A map whose landmarks resolve to nothing leaves the next syncer guessing which file each upstream change lands in. | Restate the "What it fed into" column against the current filenames, and drop the `tmp_skills/` parenthetical (the tracker note it points at is the durable record and does exist). |
| 8 | minor | `SKILL.md:9` | The PROVENANCE link sits in the opening sentence with no "when to open it". | Every trigger pays for it; no artifact task needs it. Progressive disclosure asks each reference link to say when to read it, and this is the only link in the skill that does not. | Move it into the Triage table: "An upstream sync or a licensing question → PROVENANCE.md". |
| 9 | minor | `references/publishing.md:129-138` | The verify gate is browser-only; it never runs `agent-ks check section`. | That verb validates `.html` artifact pages for the `NN_` prefix and the shared slug-collision pool (`agent-ks-cli/scripts/docs/check.mjs:14,118-127`) — deterministic work the gate leaves to the eye. | Add step 0: "Run `agent-ks check section <section>`. It checks the prefix and the slug collision; the rest of this gate is what only a render shows." |
| 10 | minor | `references/dataviz-color.md:44` | The validator is invoked as `node ../scripts/validate_palette.js`, "relative to this file". | The agent's cwd is the project root, not `references/`, so the command as written fails on first use. | Write it from the skill root (`node <skill>/scripts/validate_palette.js …`) and say to resolve `<skill>` against this skill's own folder. |
| 11 | minor | `SKILL.md:3` | "Trigger on build, design or generate" — three bare verbs, no object. | `./start build`, "design the schema", "generate the migration" all match textually, and the phrase does nothing to hold the line against agent-ks-docs' diagram pages, which are also "generated" and also not markdown. Pushy is right; object-free is noise. | Attach the objects — see "Proposed description". |
| 12 | minor | `SKILL.md` (whole) | No ordered spine: Triage, treatment, theme mode, tokens, Never — but never "first do this, then this". | The task is multi-step across five files. The order (home → plan → build → gate) is recoverable from the Triage row order and the last Never row, but the agent assembles it, and I read design-fundamentals before I knew where the file goes. | Four words per step, above the Triage table: "Pick the home, plan, build, run the gate." |
| 13 | minor | `references/publishing.md:133` | "Open the artifact full page at `/artifacts/<path>`" without saying what `<path>` keeps. | The route path keeps the `NN_` prefixes and the `.html` extension — it is not the clean docs slug (user guide `08_artifact-pages.md:51-54`). An agent that uses the slug gets a 404 and doubts the build. | Add the clause: "the file's path under its content root, prefixes and `.html` kept." |
| 14 | minor | cross-skill: `agent-ks-docs/references/docs-layout.md:107` | "The framework injects nothing into the `.html`" — false in `site` mode, and it contradicts this skill's publishing.md. | One home per fact. Two skills state the same mechanism and one of them is wrong; whichever the agent reads second, it now distrusts both. | Not this skill's file — pass to the docs-skill fix round: docs-layout should say "placement only; theme injection belongs to agent-ks-artifacts" and link. |

## Trigger test

| Prompt | Should fire | Fires |
|---|---|---|
| "put together a one-page coverage dashboard for the user guide — packages down the left, % covered, a little sparkline" | yes | yes |
| "i want four clickable options for the mobile nav in the issue's brainstorm so the team can actually try each and pick one" | yes | yes |
| "make a brand guideline page with our colours, type scale and the button states" | yes | yes |
| "add an excalidraw diagram to the routing page showing the loader pipeline" | no (agent-ks-docs) | unsure — "generate" with no object gives it a foothold, and "Markdown docs: agent-ks-docs" does not cover a diagram page |
| "`./start build` is failing after my theme change, can you look" | no | unsure — "Trigger on build" matches literally |

## Proposed description

Build a self-contained HTML artifact in an agent-knowledge-system project: a report page, a dashboard, a chart or data visualization, a design-system or brand-guideline page, or a variation set of design options to choose between. It ships as one `.html` page in a docs section, or in an issue's `notes/` or `brainstorm/`. Trigger whenever the user asks to build, design, generate, visualize, mock up or prototype a page, dashboard, chart, UI or set of options — even when they do not say "artifact". Not claude.ai Artifacts. Markdown pages and diagram pages: agent-ks-docs. Tracker structure: agent-ks-issues.

## The dry run

Prompt: "build a coverage dashboard page for the user guide, packages down the left with a sparkline each."

1. SKILL.md read; Triage sent me to four of six references (design-fundamentals, publishing, dataviz, dataviz-color) plus palette — ~6,900 words, near the whole skill, for the most ordinary artifact there is.
2. I read design-fundamentals first because it is row one, then found publishing answers "where does the file go" — the question I actually had first. Order cost me one file.
3. Lost: whether to run any `agent-ks` verb before or after. The skill names only `theme tokens`; `check section` never appears.
4. Guessed: the full-page URL. The gate says `/artifacts/<path>`; only the user guide says the prefixes and `.html` survive.
5. Guessed: `astro-doc-code/src/styles/theme.yaml` resolved here because this is the framework repo. In a consumer project it would not.
6. Did not need: PROVENANCE.md, opened because SKILL.md's first paragraph links it with no condition.
7. Missing: a check that the section allows artifacts before writing the file — the skill states the opt-out as a fact, never as a step.
8. Everything else held. publishing.md answered location, sidecar, sizing and theme cleanly, and the dataviz procedure ran end to end; the validator reproduced palette.md's numbers exactly, so the chart palette needed no thought at all. That is the skill working.

## Cut and add

**Cut**

- `SKILL.md:48`, the "change both in one edit, source and installed cache" clause — maintainer instruction in a consumer skill (finding 6).
- `SKILL.md:9`, the PROVENANCE link out of the opening paragraph; it belongs in the Triage table (finding 8).
- `references/PROVENANCE.md:13-14`, the stale "What it fed into this skill" landmarks — rewrite against current filenames or drop the column (finding 7).
- `references/publishing.md:10`, "or subtask folder" (finding 1).

**Add**

- The four-step spine above the Triage table (finding 12).
- `agent-ks check section` as step 0 of the verify gate (finding 9).
- One clause on what `<path>` means in the `/artifacts/` URL (finding 13).
- The mode split on `data-theme` and `localStorage` (finding 3), and the corrected cascade reason (finding 2).
- Worth considering, not yet a finding: a small script for the gate's "sidecar honesty" step — every hex and token the `artifact:` block declares appears in the HTML. It is deterministic, it runs on every artifact, and it is the one gate step an agent can pass by assertion rather than by checking.
