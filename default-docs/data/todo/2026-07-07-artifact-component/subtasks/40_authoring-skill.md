---
title: "Author the converged artifact-authoring skill (SKILL.md + references + scripts)"
status: review
---

## Goal

Create a new in-repo skill that teaches an agent to **build artifacts well** —
distinctive, accessible, dual-theme HTML pages published as files in this repo.
The skill converges four captured design skills (`artifact-design`, `dataviz`,
`design-sync`, `frontend-design`, currently at repo-root `tmp_skills/`) into one
self-contained skill, **written in** — adapted and rewritten for our publish
mechanism, never pasted verbatim (the sources are Anthropic-authored and this
repo is public). On top of the converged design craft, it adds **our layer**:
where artifacts live in this framework (docs sections and tracker
`brainstorm/`/`notes/` folders), the metadata-sidecar contract, and flows for
authoring whole **brand systems / design systems** as a docs section full of
artifacts + commentary.

This is the largest subtask. The section-by-section convergence plan — which
source feeds which section, which overlaps to merge, what to drop, what to keep
verbatim-ish — is the authoring-skill-design brainstorm at
[`../brainstorm/02_discuss_authoring-skill-design.md`](../brainstorm/02_discuss_authoring-skill-design.md).
The provenance of the four sources and the upstream-fold-in protocol are in
[`../notes/01_skill-sources-and-provenance.md`](../notes/01_skill-sources-and-provenance.md)
(kept true by [`70_upstream-provenance.md`](./70_upstream-provenance.md)). The
skill's own reserved-URL and sidecar knowledge must match the code from
[`10_component.md`](./10_component.md), [`20_route.md`](./20_route.md), and
[`30_reserved-url-guard.md`](./30_reserved-url-guard.md); the sibling-skill
integration is [`50_skills-integration.md`](./50_skills-integration.md).

## Where it lives

A new skill folder under `plugins/documentation-guide/skills/<name>/` (peer of
the existing `documentation-guide/` and `doc-issues/` skills) — suggested name
`artifact-authoring`. Structure mirrors the existing skills:
`SKILL.md` + `references/` + `scripts/`. Per the plugin parity rule (MEMORY.md),
the identical tree must also be mirrored into the installed cache at
`/home/sid/.claude/plugins/cache/sids-plugin-marketplace/documentation-guide/<version>/skills/<name>/`
and the plugin manifest / marketplace version bumped — coordinate that bump with
`50`. The four `tmp_skills/` sources are **input**, not shipped content; their
permanent home is decided in `70`.

## What each source contributes (adaptation stance)

- **artifact-design** — the spine: treatment calibration (utilitarian vs
  editorial), honor-what's-there precedence, fundamentals, the anti-generic
  cliché list, both-themes token discipline, typography, process, editorial
  pass. Keep ~85% as craft; **strip** its claude.ai specifics (font-as-data-URI
  CSP workaround, the viewer `data-theme`-stamping contract) and rewrite for our
  publish target.
- **dataviz** — the chart chapter, essentially re-parameterizable as-is: the
  7-step form→color→validate procedure, non-negotiables, and the anti-pattern
  catalog become a reference file; its `palette.md` is the **swappable instance**
  we replace with values derived from *this* framework's theme contract.
- **design-sync** — strip the entire claude.ai/design upload pipeline (the
  `DesignSync` tool, `window.<Global>` bundle, `_ds_sync.json`, storybook compare
  harness, subagent fan-out). Keep only the **doctrine**: what a design system
  *is* as a consumable contract, the write-conventions-for-a-guessing-agent rule,
  the validate-names-against-built-artifacts rule, and the absolute
  Styled/Complete/Plausible grading rubric.
- **frontend-design** — mostly subsumed by artifact-design. Salvage only its
  *tone menu* (brutalist, art-deco, editorial-magazine…), "vary across
  generations / never converge on one face," and the background/texture idea
  list — folded into the **editorial branch only**, gated by artifact-design's
  restraint governor. **Drop** its uncalibrated "BOLD / UNFORGETTABLE" framing.

## Tasks

*(Grouped by skill artifact. Each SKILL.md section is one deliverable; the
brainstorm's §§3–4 are the authority for source→section mapping — §3's table of
contents and §4's merge decisions.)*

### Scaffold + frontmatter

- [x] **Scaffold the skill folder** `plugins/documentation-guide/skills/artifact-authoring/`
      with `SKILL.md`, `references/`, `scripts/`. Write YAML frontmatter
      (`name`, `description`, `license`) with a `description` tuned for
      triggering on artifact-building intent (building/designing an HTML artifact,
      dashboard, report page, design system, brand guideline) — distinct from the
      `documentation-guide` skill (which triages docs writing) and `doc-issues`
      (tracker). Done when the skill loads and its description reads as
      action-triggering, not a summary.

### SKILL.md body — one task per section

- [x] **§0 Triage / calibrate the treatment.** Port artifact-design's "read the
      request first" (utilitarian vs editorial) nearly verbatim — the best single
      idea across the four sources. Fold frontend-design's Purpose/Tone/
      Differentiation questions in as the *editorial-branch* prompts. Recalibrate
      altitude for a docs repo: the utilitarian branch dominates (embedded
      explainers, dashboards); editorial = standalone showcase artifacts.

- [x] **§1 Honor the host design system first.** This is *stronger* here than on
      claude.ai because the framework has a real, mandatory theme contract. Write
      a **conventions section per design-sync's rules**: enumerate the actual
      token vocabulary (real `--color-*`, `--spacing-*`, the two-tier
      `--ui-text-*` / `--content-*` / `--display-*` model from CLAUDE.md Theming),
      name where the truth lives (`astro-doc-code/src/styles/theme.yaml`,
      `color.css`, `font.css`), give one idiomatic snippet, and apply the
      validate-every-named-token rule (every token the skill names must exist in
      the shipped theme). State the precedence chain (user's words > host system >
      your choices) and its resolution: **palette/type tokens come from the theme;
      composition, layout concept, and structure are where distinctiveness
      lives** — unless the artifact deliberately commits to its own visual world
      (poster, game), the single-theme escape hatch generalized.

- [x] **§2 Fundamentals for every artifact.** Port wholesale from artifact-design
      (subject-grounding, hue-biased neutrals, layout-does-the-spacing with
      flex/grid + `gap`, `overflow-x: auto` for wide content, `tabular-nums`,
      build-cleanly / focus states / `prefers-reduced-motion`, CSS-specificity
      hygiene, copy-as-design-material, structure-is-information). No platform
      coupling here — minimal rewrite.

- [x] **§3 Anti-generic rules (merge).** Base = artifact-design's cliché list
      (warm-cream + serif + terracotta; near-black + acid-green; purple-blue
      gradient hero; Inter/Space Grotesk "safe" defaults; emoji section markers;
      everything centered; `rounded-lg`; accent rails) **plus** its "user's words
      always win" override. From frontend-design salvage only the tone menu,
      "vary across generations," and the texture/background idea list — into the
      editorial branch, gated by restraint. Drop the duplicate "match complexity
      to the vision" paragraph (keep artifact-design's).

- [x] **§4 Both-themes discipline (keep doctrine, rewrite the signal).** Keep
      token-level theming, "dark is *selected* not inverted," single-theme as a
      deliberate commitment. Rewrite the *mechanism* for our target: the artifact
      keeps the identical robust pattern (tokens on `:root`, `@media
      (prefers-color-scheme: dark)` default, `:root[data-theme="dark"]` /
      `[data-theme="light"]` overrides that win both ways), and **the framework's
      embed layer stamps `data-theme` into the iframe document** mirroring the
      site toggle (the `10` client renderer). State clearly which theme variables
      are (or are not) injected into the iframe so authors know whether to consume
      or merely derive from them.

- [x] **§5 Typography.** Port artifact-design's pairing guidance (65ch measure,
      type scale, `text-wrap: balance`, letter-spaced uppercase labels,
      display+body pairing). **Rewrite the font-delivery sentence**: replace
      "inline the face as a `@font-face` data URI (CSP workaround)" with "ship
      `.woff2` under the repo assets (served at `/assets/`) and reference it
      relatively." Keep the underlying warning — a missing/silently-fallen-back
      font looks "fine" at a glance; check the computed font, not the vibe
      (design-sync's `[FONT_MISSING]` lesson as prose).

- [x] **§6 When it's a UI / dashboard → route into dataviz.** Keep
      artifact-design's "when it's a UI, not a document" paragraph as the
      *router* (summary before detail, state encoded in form, semantic color ≠
      accent) and **delete its chart specifics** to avoid drift — the chart detail
      lives in the dataviz reference (next group).

- [x] **§7 Process — plan before code.** Port artifact-design's pre-code plan
      (4–6 named hex, 2+ type roles, one-sentence layout concept) plus the
      editorial review-for-genericness step.

- [x] **§8 Verify before publishing.** This is design-sync's unique
      contribution, stripped of harness. Rewrite the verify *target*: run
      `./start dev`, load the `/artifacts/<path>` full-page URL **and** an
      embedding docs page, check **both themes** and **both viewports** (embed
      width ~700–900px and full page). Apply the absolute rubric adapted:
      **Styled** (theme tokens visibly resolved — an unresolved `var()` freezing a
      fallback is the exact failure to catch), **Complete** (nothing collapsed /
      overflowing, no horizontal body scroll, focus visible, reduced-motion
      honored), **Plausible** (real content, never `foo`/`test`). Note the
      optional Playwright MCP tools for screenshots.

- [x] **§9 Realistic content rule.** One short shared rule from artifact-design
      ("real content, never lorem") + design-sync ("curate before inventing;
      never `foo`/`test`; canonical example + variant sweep + static states").

### references/ (the deep material — keep out of SKILL.md to keep it lean)

- [x] **`references/dataviz.md`** (or a small folder) — port the dataviz
      procedure, non-negotiables, and anti-pattern catalog. Rewrite `palette.md`
      as **our** instance: derive surfaces from `--color-bg-*`, ink from
      `--color-text-*`, and status from `--color-success/warning/error/info`;
      keep the categorical/sequential/diverging slots as the only novel values
      and **validate them against the theme surfaces** with the bundled validator.
      Make the theme contract authoritative for surfaces/ink (single source of
      truth) so it never double-declares with the docs theme.

- [x] **`references/design-system.md`** — the design-sync doctrine as prose: the
      anatomy of a design system as a consumable contract (tokens + fonts +
      component/pattern inventory + conventions doc + where-truth-lives
      pointers), the conventions-authoring rules, and the Styled/Complete/
      Plausible rubric with render-check habit.

- [x] **`references/publishing.md`** — **our layer**, greenfield. Where artifacts
      live (an `NN_.html` in a docs section, or in a tracker `brainstorm/`/
      `notes/` folder); the `NN_` prefix rule and whether artifacts are exempt
      like assets (state the rule the `10` loader actually implements); the
      **metadata sidecar contract** (same-name `.meta.json`/`.meta.jsonc`: title,
      description, sidebar fields, and the explicit declared values — palette,
      purpose, key data — so AI never parses the HTML); the reserved-`/artifacts`
      base-URL limitation; and "update = edit the file + rebuild; history lives in
      git." Include the self-containment stance: all CSS/JS inline or repo-local,
      images as repo assets or data URIs, **no external scripts ever** (XSS /
      offline-archive rationale); CDN fonts are a documented, discouraged opt-out.
      Design for the **embed width** first, test at both sizes.

- [x] **`references/brand-and-design-systems.md`** — the flows the user
      explicitly wants: authoring a design system *inside an issue's `brainstorm/`
      folder*, and publishing one as a *dedicated docs section* full of artifacts
      plus commentary documents that carry explicit values (so an agent reads the
      commentary, not the HTML). Tie each artifact to a sidecar's declared values.

### scripts/

- [x] **Bundle `scripts/validate_palette.js`** from `dataviz/scripts/` — the
      dependency-free ES-module palette validator (CLI **and** in-page
      `data-palette` modes, runs under bun/node). Document both invocations in the
      dataviz reference. **Drop the `.py` twin** (redundant under bun) but note in
      the provenance record that it exists upstream. Do **not** bundle any of the
      design-sync build pipeline (esbuild/ts-morph/Playwright sync machinery) —
      wrong contract, wrong input, heavy deps (see the brainstorm
      [`../brainstorm/02_discuss_authoring-skill-design.md`](../brainstorm/02_discuss_authoring-skill-design.md)
      §9).

- [x] **Provenance stub.** Add a short provenance pointer in the skill (header
      comment or a `references/PROVENANCE.md`) linking to
      [`../notes/01_skill-sources-and-provenance.md`](../notes/01_skill-sources-and-provenance.md);
      the full map + fold-in protocol is owned by `70`.

### Verification

- [x] **Trigger + self-test verification.** Confirm the skill triggers on a
      cold "build me a dashboard artifact / design system for this project"
      prompt (and does **not** steal docs-writing or tracker prompts from the
      sibling skills). Run the palette validator under bun (`node`/`bun
      scripts/validate_palette.js "#..,#.." --mode dark`) and confirm exit codes.
      Run `docs-guide check skill-links` (the `check-skill-links.mjs` validator)
      against the new skill so every relative reference resolves. Spot-check that
      every theme token the skill names actually exists in
      `astro-doc-code/src/styles/theme.yaml` (the design-sync
      validate-names-against-reality rule applied to our own skill). Confirm the
      installed-cache mirror is byte-identical to the repo-local source.

## Landed (2026-07-07) — status review

Skill authored at `plugins/documentation-guide/skills/artifact-authoring/`
(`SKILL.md` + 4 references + a `dataviz/` sub-folder of 8 files + a bundled
`scripts/validate_palette.js` + `references/PROVENANCE.md`), mirrored byte-identical
into the installed cache at `…/documentation-guide/0.5.4/skills/artifact-authoring/`.
Plugin `plugin.json` description and `README.md` now enumerate **3 skills**.

**Two placement reconciliations** (the brainstorm §3 TOC is the authority for
source→section mapping, so where the task's file list and §3 differed, §3 won):

1. The task's `references/design-fundamentals.md` split of `SKILL.md` §§2/3/5/6/7/9
   was applied — those sections live in `references/design-fundamentals.md`, not
   inline; `SKILL.md` keeps only the load-bearing inline core (§0 calibrate, §1 honor
   theme, the both-themes + self-containment non-negotiables, the verify gate), per §3.
2. The task listed `references/design-system.md` **and**
   `references/brand-and-design-systems.md` separately; §3 consolidates both into one
   `references/design-systems.md` (doctrine + the two homes + the rubric). Shipped as one.

**Open cross-subtask dependencies the skill documents but does not decide** (flagged
for review / coordination):

- **Theme-CSS-into-iframe** (brainstorm §5 / `20_route`): whether `--color-*` resolve
  inside the artifact iframe. `publishing.md` teaches the always-safe self-defined
  pattern and marks the adopts-site variable set as "finalized by the route layer —
  verify before relying." Update the one availability sentence once `20_route` lands.
- **Version bump**: `plugin.json` stays at `0.5.4`; the skill was mirrored into the
  active `0.5.4` cache to preserve repo/cache parity. The semver bump is left to
  coordinate with `50_skills-integration` (both land as one release), per this
  subtask's note.
- The sidecar `artifact:` reserved-key list (brainstorm Thread B, left open for this
  skill) is finalized in `publishing.md` → *The metadata sidecar contract*
  (`purpose` · `type` · `theme` · `palette` · `data` · `interactions` · `sources` ·
  `embed_height`, block open for extras). `10_component` owns the filename mechanics.
