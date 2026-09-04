---
title: agent-ks-artifacts — re-audit
---

# agent-ks-artifacts

**Verdict:** needs fixes — all fourteen first-round findings closed and no regression of substance, but the skill still tells the agent to reference a font by relative `url()`, which never resolves from the `/artifacts/` route.

**Measured:** SKILL.md 556 body words (cap 600), description 626 chars · references: publishing.md 139 lines, dataviz-color.md 118, palette.md 117, design-fundamentals.md 110, dataviz.md 107, design-systems.md 90, PROVENANCE.md 27 (cap 150) · scripts: validate_palette.js 277 lines.

Verified clean this round: every relative link **and every anchor** resolves (61 markdown files, `agent-ks-dev check skill-links` passes; anchors checked by script); no site-absolute `](/…)` link; no history words; the 61 inline token names are exactly `theme.yaml → required_variables` (66) minus the five primitive `--font-size-*` names — I counted both lists; every hex in palette.md matches `agent-ks-dev theme tokens --json` on the live theme; every number in palette.md reproduces on the bundled validator (light worst adjacent 24.2, sub-3:1 slots 2.58 / 1.99 / 2.47 / 2.94, dark worst adjacent 10.3, ramp floors 2.30 / 1.94 / 2.21 / 1.81, status contrasts 3.02 / 2.69 / 4.43 / 3.38 light and 7.87 / 9.35 / 4.76 / 7.38 dark); every validator flag named (`--mode`, `--surface`, `--pairs all`, `--ordinal`, the exported `contrast()`) exists in the script; `allow_artifact_pages`, the reserved `artifacts` base URL, `.meta.jsonc` preference, `embed_height` handling, the `min-height:100vh` neutralisation, `Esc`-closes-expand and the hidden outline rail all check out against the engine source.

## Closure

| First-round # | State | Note |
|---|---|---|
| 1 | closed | `publishing.md:10` now reads "`brainstorm/` or `notes/` folder, and no other", states the reason, and links `05_brainstorm-notes-memory.md`, which carries "prefix: optional" at line 71. Matches `issue-sections.ts` (`allowArtifacts: true` on those two only). |
| 2 | closed | The cascade reason is now correct and I confirmed it: `injectSiteTheme()` replaces the opening `<head>` tag, and `color.css` declares light on `:root` (0,1,0) and dark on `[data-theme="dark"]` (0,1,0) — an artifact's later `:root` wins in both modes. |
| 3 | closed | The mode split is exact against `pages/artifacts/[...path].ts` (`DARK_MODE_INIT` injected for `site` only; `self` served byte-untouched) and `scripts/artifacts.ts` (`applyTheme` stamps the embed in both modes). |
| 4 | closed | All six framework paths now carry `@root/`; a repo-wide grep of the skill finds no bare `astro-doc-code/` or `default-docs/`. `./start dev --detach` with `./start stop` beside it (decision C). |
| 5 | closed | "minus the primitive `--font-size-*` scale, which no layout or artifact consumes" — and the arithmetic holds exactly: 66 contract names − 5 primitives = the 61 listed. |
| 6 | closed | The "change both in one edit" clause is gone; the pointer to the source file stays. |
| 7 | closed | The `tmp_skills/` parenthetical is gone and every landmark now resolves: the three named SKILL.md sections exist, `dataviz.md` / `dataviz-color.md` / `publishing.md` are the real filenames, and `2026-07-07-artifact-component/notes/01_skill-sources-and-provenance.md` plus its `70_upstream-provenance` subtask are both on disk. |
| 8 | closed | The PROVENANCE link moved out of the opening paragraph into a Triage row with its condition. |
| 9 | closed | `check section` is now gate step 1, and I confirmed `check.mjs` validates `.html` as a first-class page for the `NN_` prefix and the shared collision pool. The argument form is wrong — see N3. |
| 10 | closed | `node <skill>/scripts/validate_palette.js`, with the resolution rule and the reason spelled out. |
| 11 | closed | The proposed description shipped verbatim (decision F). Objects are attached to every verb. |
| 12 | closed | "Work in this order: pick the home, plan, build, run the gate." sits above the Triage table. |
| 13 | closed | The `<path>` clause matches the user guide (`08_artifact-pages.md:51-54`) and the route's `getStaticPaths`. |
| 14 | closed | `agent-ks-docs/references/docs-layout.md` no longer claims the framework injects nothing; the row now hands `artifact.theme` to this skill and links `publishing.md#theme-modes`. |

No regression found in any changed passage. Word and line caps hold. The plugin version moved to 0.11.0, so the installed cache (highest 0.10.1) no longer mirrors the source — expected until release, and `theme.yaml` did not change, so the CLAUDE.md inline-contract coupling is not in play.

## New findings

| # | Severity | Where | What | Why it matters | Fix |
|---|---|---|---|---|---|
| N1 | blocker | `references/publishing.md:76,83` | Images are "repo assets (served at `/assets/`)" but a font is "referenced relatively"; nothing says what a relative URL is relative to. | The `/artifacts` route serves `.html` and nothing else (`isArtifact()` in `pages/artifacts/[...path].ts`), so a colocated `./assets/font.woff2` from an artifact 404s, and a path relative to the file *on disk* has a different depth from the same path relative to its `/artifacts/…` URL. The skill's own next sentence says a missing font "falls back in silence", so the agent ships a broken artifact with no error. | State the URL forms: a data URI works everywhere; a colocated file is `/content-assets/<path-from-the-content-root>`; a framework asset is `/assets/<path>`. Add that a path relative to the file on disk does not resolve from the `/artifacts/` URL. (`check link-form` scans `.md`/`.mdx` only, so a leading `/` inside an artifact is not flagged.) |
| N2 | major | cross-skill: `agent-ks-issues/references/05_brainstorm-notes-memory.md:65` | "A self-contained `.html` artifact in `notes/` or `brainstorm/` … The site theme applies inside it." | True in `site` mode only. The default is `self`, and a `self` artifact is served byte-untouched — the same false claim this skill's first round already fixed in `docs-layout.md`. An agent that reads it skips defining its own light and dark theme. | Not this skill's file — pass to the issues skill: "the parent stamps `data-theme` on the embed in both modes; whether the site theme's *CSS* applies is `artifact.theme`", and link `agent-ks-artifacts/references/publishing.md#theme-modes`. |
| N3 | minor | `references/publishing.md:133` | `agent-ks check section <section>` — the verb takes a folder path, not a section name. | `agent-ks-dev check section user-guide` exits 1 with "Not found: user-guide"; it needs `./default-docs/data/user-guide`. Every sibling skill writes it as a path (`<folder>`, `<data_root>/<name>`). A regression introduced by the fix for finding 9. | Write `agent-ks check section <path-to-the-section-folder>`, e.g. `agent-ks check section ./data/user-guide`. |
| N4 | minor | `references/publishing.md:32,134` | "The primary viewport is the content column, about 700–900px wide", repeated in gate step 2. | An artifact page hides the outline rail, so the column is `.docs-content` alone: `min(1336px, viewport − 280px sidebar − 16px) − 96px` padding. That is ≈888px at a 1280px window, ≈1048px at 1440px and ≈1240px at the cap. The agent composes and tests at a width the site almost never uses. | Give the real range: "about 850–1250px, narrowest on a 1280px window". Test at both ends. |
| N5 | minor | `references/publishing.md:14` | The `"allow_artifact_pages": false` opt-out is stated as a fact and never as a step. | `check.mjs` does not read that key, so gate step 1 passes on an artifact written into an opted-out section, and the page simply never appears. The failure is silent until step 2. | Add to "pick the home": read the section root `settings.json` first; `allow_artifact_pages: false` means pick another home. |
| N6 | minor | `references/publishing.md:12` | "Add a sidecar only when that is not enough" — said about the title, read as "a sidecar is optional". | No sidecar means `artifact.theme` is absent, which `normalizeArtifactThemeMode()` reads as `self`, so a dashboard written for `site` mode gets no injection and its neutral fallbacks freeze — exactly the failure gate step 3 hunts for. | Say it once here: the sidecar is optional for the title, and required for a `site` artifact, because no sidecar means `self`. |
| N7 | minor | `SKILL.md:58,63,65` | Three Never rows — CDN, `innerHTML` on series names, untrusted third-party HTML — share one reason that SKILL.md never states. | The reason (an artifact runs unsandboxed on the site origin) is only in `publishing.md:77` and `dataviz.md:96`. An agent reading SKILL.md alone cannot extend the rule to a new case: an inline third-party icon set, a `<link>` to a web font in a `self` artifact. Decision H. | One line under the table: "An artifact runs unsandboxed on the site origin, so anything it loads or writes as markup runs with the site's privileges." |
| N8 | minor | `SKILL.md:13-17` | The spine says step 1 is "pick the home", but the Triage table's first row is `design-fundamentals.md`; the home lives in row 2. | The first reviewer's dry run read design-fundamentals first for exactly this reason, and the added spine does not move the row that caused it. | Make `publishing.md` row 1 of the table so the reading order matches the spine. |

## The dry run, second time

Prompt: "build a coverage dashboard page for the user guide, packages down the left with a sparkline each."

1. Better: the spine answered "where does the file go" before I opened anything, so I read publishing.md first instead of design-fundamentals — the one file the first run wasted.
2. Better: `<path>` no longer needed a guess, `@root/…` resolved without assuming this repo, and PROVENANCE.md stayed shut because its Triage row states its condition.
3. Better: gate step 1 gave me a deterministic check before rendering, and step 2 told me to detach so the server did not hold the terminal.
4. Better: the mode split told me a `site` full page inherits `localStorage.theme` and a `self` one does not — the earlier text would have had me key the full page on `data-theme`.
5. Still wrong: `agent-ks check section user-guide` failed; I needed the folder path (N3).
6. Still wrong: I composed for a 700–900px column that measures ~1050px in a 1440px window (N4).
7. Still missing: nothing told me to read the section's `settings.json` before writing the file (N5).
8. Still missing: had the dashboard carried a logo, no line in the skill gives a URL form that resolves from `/artifacts/` (N1).
9. Unchanged: the Triage still routes an ordinary dashboard to five of six references, ~6,900 words. That is the shape of the skill, not a defect I can name a fix for.
10. Held again: publishing answered location, sidecar, sizing and theme; the dataviz procedure ran end to end; the validator reproduced every number in palette.md exactly, so the chart palette needed no thought at all.
