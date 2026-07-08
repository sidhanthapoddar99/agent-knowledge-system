---
title: "Authoring-skill design — converging four captured skills into one artifact skill"
---

# Authoring-skill design (workstream 4)

Design deliberation (sidhantha + agent, 2026-07-07) for `40_authoring-skill`:
the new in-repo skill that teaches an agent to *build* artifacts well. It
converges the four captured design skills at repo-root `tmp_skills/`
(`artifact-design/`, `dataviz/`, `design-sync/`, `frontend-design/`). The source
inventory is captured in the sibling
[`../notes/01_skill-sources-and-provenance.md`](../notes/01_skill-sources-and-provenance.md),
and the section-by-section convergence map is worked out below (§3 for the table
of contents, §4 for the merge decisions).

This entry deliberates the design decisions the subtask does *not* pre-settle:
the skill's name and placement, its triage relationship to the two existing
skills, its table of contents and the section-by-section sourcing, the
adaptation layer that rewrites claude.ai publish mechanics for *this* framework,
the metadata-sidecar contract, the brand/design-system creation flows, which
scripts get bundled, the self-containment stance, and the licensing posture that
governs how the sources are reused.

Two upstream decisions are already **settled** and only referenced here, not
re-argued: (1) the dedicated `/artifacts/<path>` URL is the primary full-view
mechanism, in-place expand is secondary — see `agent-memory/memory.md` and the
sibling component/route brainstorm (`01_` in this folder); (2) all four sources
get *written into* the new skill (adapted, not referenced), including
frontend-design.

---

## 1. Skill name and placement in the plugin

The plugin ships two skills today — `agent-ks-docs` (all non-tracker
content) and `agent-ks-issues` (the tracker) — each a folder under
`plugins/documentation-guide/skills/<name>/` with a `SKILL.md`, a `references/`
directory, and (for `agent-ks-docs`) a `scripts/` directory. The new skill
is a **third peer** in that same folder, mirroring the shape:
`plugins/documentation-guide/skills/<name>/{SKILL.md, references/, scripts/}`.

**Name — the real constraint is a collision.** One of our own sources,
`artifact-design`, is a **Claude Code built-in skill** that is present in every
session regardless of this plugin (it triggered in *this* very session). It is
about claude.ai Artifacts — the `Artifact` tool, CSP, the gallery. Our skill is
about a *different* thing that we also call "artifacts": HTML content files in
this repo served at `/artifacts`. If we name ours `artifact-design` too, the two
descriptions fight for the same triggers and an agent can load the wrong manual
(claude.ai publish mechanics instead of ours). So the name must be distinct
*and* the description must scope tightly to this framework.

Candidates weighed:

- **`agent-ks-artifacts`** — verb-noun, says the job ("author artifacts"),
  clearly distinct from the built-in `artifact-design`. Reads well next to
  `agent-ks-issues` / `agent-ks-docs`.
- **`doc-artifacts`** — matches the `doc-` prefix of `agent-ks-issues`, signalling
  "a documentation-domain sub-skill." But `doc-` in `agent-ks-issues` connotes the
  *tracker*, and artifacts are not tracker-only (they live in docs sections too),
  so the prefix mildly misleads.
- **`artifacts`** — shortest, but a bare noun triggers loosely and collides
  hardest with the built-in's vocabulary.

**Recommendation: `agent-ks-artifacts`.** It names the craft, avoids the
built-in collision, and its description can open with an unambiguous scope line —
"for building self-contained HTML artifacts as content files in a
documentation-template project (the `/artifacts` content type), NOT claude.ai
Artifacts." That scope sentence is what keeps the built-in and our skill from
mis-triggering against each other.

**Parity rule.** Per the repo's plugin repo/cache parity convention, the skill
must be authored in the repo-local source
(`plugins/documentation-guide/skills/agent-ks-artifacts/`) **and** mirrored into
the installed plugin cache that `agent-ks` actually runs from. Both edits ship
together — see the `50_skills-integration` workstream, which owns the same parity
obligation for the edits to the two existing skills.

---

## 2. Triage — who triggers whom

The plugin already models a clean division: `agent-ks-docs` triages
non-tracker content and *hands off* the whole tracker domain to `agent-ks-issues`
(self-contained). The new skill slots in as a third self-contained specialist,
and the two existing skills gain a thin pointer to it — exactly how
`agent-ks-docs` points at `agent-ks-issues` today.

Proposed handoff wiring (the `50_skills-integration` workstream implements it):

- **`agent-ks-docs`** — its triage table gains a row: *"authoring or
  embedding an HTML artifact in a docs section → load `agent-ks-artifacts`."* Its
  `references/settings-layout.md` gains the reserved-`artifacts`-base-URL
  limitation (a section config that would collide with the route). The
  build/design *craft* is not duplicated here — only the pointer and the config
  constraint.
- **`agent-ks-issues`** — gains a pointer: *"building an artifact inside a
  `brainstorm/`, `notes/`, or subtask context (a design-system draft, a data
  dashboard for a decision) → load `agent-ks-artifacts`."* This parallels how
  `agent-ks-issues` already tells the reader to load `agent-ks-docs`'s
  `images.md` for screenshots inside an issue.
- **`agent-ks-artifacts`** — **self-contained**, owns the whole manual: where
  artifacts live (docs sections *and* tracker folders), the sidecar contract,
  the embed/route model, and the full design/dataviz/design-system craft. It is
  the analogue of `agent-ks-issues`: a sibling skill loads it and steps back.

**The built-in `artifact-design` question.** Should our skill reference the
built-in (it *is* present in-session) or fully absorb it? Settled by the user:
**absorb** — the source content is rewritten *into* our skill so the guidance is
present at build/deploy even when the built-in's target (claude.ai) is
irrelevant. We do not tell the agent "also read the built-in artifact-design" —
that would re-introduce claude.ai publish mechanics we deliberately strip. The
built-in stays for its own domain (the `Artifact` tool); ours owns the repo
domain. The scope sentence (§1) is the fence between them.

**Recommendation:** three-skill triage as above; `agent-ks-artifacts`
self-contained; both existing skills carry a one-line pointer + the reserved-URL
note, nothing more.

---

## 3. Shape — `SKILL.md` + `references/` split (the table of contents)

The house pattern is a **lean triage router** in `SKILL.md` that points at
self-contained references (`agent-ks-docs` is the exemplar). But
`agent-ks-issues` shows the other valid shape: a fuller inline manual for the
*thinking*, with references for the deep procedures. Artifact authoring wants a
hybrid: the **calibration governor and the verify gate are load-bearing enough
to live inline** (they change what every artifact becomes and must not be
skippable behind a reference read), while the deep craft (anti-generic rules,
typography, the whole dataviz procedure, design-system flows) belongs in
references pulled only when relevant.

**Proposed `SKILL.md` (lean core, always read):**

| `SKILL.md` section | Role |
|---|---|
| Scope + what an artifact is *here* | The fence vs the built-in; the `/artifacts` content type, embed-in-page + full-page route, the sidecar in one paragraph. Orientation only. |
| Triage table → references | Which reference to read for the task at hand. |
| §0 Calibrate the treatment | The single best idea across all four sources — utilitarian vs editorial. Kept inline because it governs everything downstream. |
| §1 Honor the host theme first | The precedence chain (user words > host theme contract > your choices) and a compact pointer to the real token vocabulary. Inline because it is *our* mandatory contract. |
| Both-themes + self-containment rules (compact) | The non-negotiables an agent must not miss: consume theme tokens, no invented var names, no external scripts, self-contained. Full mechanics in the publishing reference. |
| Verify before publishing (the gate) | The pre-commit checklist. Inline because it is a gate, not optional reading. |

**Proposed `references/` (pulled on demand):**

| Reference file | Contents | Fed by |
|---|---|---|
| `references/design-fundamentals.md` | Subject-grounding, neutrals, layout-does-the-spacing, build-cleanly/CSS-specificity, copywriting, structure-is-information; the **merged** anti-generic rules; typography. | artifact-design (fundamentals + cliché list) + frontend-design (tone menu, texture ideas) |
| `references/publishing.md` | The adaptation layer — where the `.html` lives (docs sections, tracker folders), the sidecar contract, the `/artifacts` route + embed, both-themes *mechanism*, self-containment policy, font delivery, iframe/embed-width guidance. | our layer (§§5–7 below) |
| `references/dataviz/` (sub-folder) | The dataviz procedure carried nearly wholesale — `SKILL`-equivalent entry + `choosing-a-form.md`, `color-formula.md`, `marks-and-anatomy.md`, `interaction.md`, `components.md`, `anti-patterns.md`, `palette.md`. `palette.md` re-pointed at our theme. | dataviz (all 7 references) |
| `references/design-systems.md` | The brand/design-system creation flows (the two homes, §8), design-sync's design-system *taxonomy* and conventions-authoring doctrine, and the absolute Styled/Complete/Plausible verify rubric. | design-sync (stripped of pipeline) + our layer |
| `scripts/validate_palette.js` | The bundled palette validator (see §9). | dataviz |

**Deliberation — flatten dataviz or keep its sub-folder?** dataviz was *built*
to be re-parameterized (its `palette.md` literally says "swap this file's values
for your brand's"), and its six other references are self-contained and
cross-link each other by relative path. Flattening them into one file would
break those internal links and bloat a single reference past readability.
**Recommendation: keep dataviz as a `references/dataviz/` sub-folder**, carrying
its files near-verbatim (rewritten per the licensing stance, §10), changing only
`palette.md` to derive its instance from our theme contract. The dataviz
`SKILL.md`'s 7-step procedure + 8 non-negotiables become the sub-folder's entry
file.

---

## 4. Section-by-section sourcing (the convergence map applied)

The convergence map is applied here; this section records the two decisions
inside it that are genuine merges, not straight lifts.

**The artifact-design ↔ frontend-design overlap (the one real merge).** Both
cover "avoid generic AI design," at very different temperatures. artifact-design
is the newer, better-calibrated rewrite: it keeps the anti-generic core *and*
adds the "most requests are utilitarian — don't over-design" governor that
frontend-design lacks. frontend-design is hotter ("be BOLD/UNFORGETTABLE") and
uncalibrated — which is exactly the failure mode artifact-design's treatment
tiering was written to fix, and utilitarian docs artifacts are our common case.

- **Base = artifact-design.** Its cliché list is the more specific and current
  one (warm-cream + serif + terracotta; near-black + acid green; purple-blue
  gradient hero; Inter/Space Grotesk as "safe"; emoji section markers;
  everything centered; `rounded-lg`; accent rails on cards), and it carries the
  "the user's explicit direction always wins even if it *is* one of these"
  override.
- **Salvage from frontend-design only what artifact-design lacks:** the *tone
  menu* (brutalist, art-deco, editorial-magazine, retro-futuristic… as a
  direction-picking aid), "vary the aesthetic across generations / never
  converge on one face," and the background/texture idea list (gradient meshes,
  noise, grain, layered transparency). These land in the **editorial branch
  only**, gated behind artifact-design's restraint governor.
- **Drop** frontend-design's "BOLD/UNFORGETTABLE" framing and its duplicate
  "match complexity to the vision" paragraph (artifact-design's is kept).

**design-sync's unique contribution (once machinery is stripped).** None of the
other three teaches what "honor the existing design system" *operationally*
means. design-sync does, in prose worth extracting: (1) the **anatomy of a
design system** as a consumable contract — tokens + fonts + a component/pattern
inventory + an API/usage contract + a conventions document + where-truth-lives
pointers; (2) the **conventions-authoring doctrine** — write for a reader who
"cannot follow guidance that isn't there," every sentence passing "could the
agent act on this without guessing?", teach *this* system's idiom with its real
vocabulary, name where the truth lives, include one idiomatic snippet, and
**validate every named class/token against the built artifacts before shipping**
("a conventions file that names things which don't exist is worse than none");
(3) the **absolute verify rubric** — Styled / Complete / Plausible. All three are
prose; none of design-sync's scripts are needed to carry them.

Everything else in the map is a straight lift and is adopted as written.

---

## 5. The adaptation layer — publish mechanism rewritten for THIS framework

Every claude.ai-specific publish mechanic in the sources is replaced. The
loader/route/sidebar *mechanics* are owned by the sibling component/route
brainstorm (`01_` in this folder) and the `10_component`/`20_route` subtasks;
this skill's `publishing.md` reference teaches the **authoring** side of the same
model. The rewrites:

- **File placement (rewrite entirely).** No `Artifact` tool, no gallery card, no
  favicon emoji, no redeploy-same-URL semantics, no 409/`force`, no wrapped
  `<!doctype>` skeleton. Replace with: an artifact is an `NN_`-prefixed `.html`
  file in a docs section (it *is* a first-class page, so it takes a numeric
  prefix like any page — unlike embed-only assets in `assets/`, which stay
  unprefixed and unscanned), or an `.html` file inside a tracker `brainstorm/` /
  `notes/` / subtask context. "Update = edit the file + rebuild"; history is git,
  not a version picker.
- **Complete document, not a fragment.** claude.ai artifacts are `<body>`
  fragments wrapped by the host. An iframe-served repo file is the **opposite**:
  the author owns a *complete* `<!doctype html>` document including `<head>`. The
  skill must state this inversion explicitly — it is the single most likely
  carryover mistake from the source material.
- **Both-themes mechanism (keep doctrine, re-specify the signal).** The doctrine
  is unchanged — tokens on `:root`, `@media (prefers-color-scheme: dark)` as the
  default signal, `:root[data-theme="dark"]` / `[data-theme="light"]` overrides
  that win both ways; dark is *designed*, not auto-inverted; single-theme is a
  deliberate commitment. What changes is *who stamps `data-theme`*: the
  framework's embed/route layer mirrors the site's dark-mode state into the
  iframe document (the exact mechanism is the `20_route` subtask's decision).
  **Recommendation:** keep the artifact-side pattern byte-for-byte identical to
  the source's — it is robust and framework-agnostic — so only the "who stamps
  it" sentence is rewritten.
- **Theme-contract availability (open, flag it).** Two sub-options the route
  work decides: (a) the route injects the site's theme CSS into the iframe, so
  the artifact can consume `--color-*` / `--ui-text-*` / `--content-*` directly;
  or (b) it does not, and the artifact defines its own tokens, *derived from* the
  theme's values. The skill's conventions section must state which is true and,
  if (a), enumerate exactly which variables resolve inside the iframe.
  **Recommendation:** lean toward (a) for artifacts that adopt the site's look
  (dashboards, explainers) and treat (b) as the "self-world" escape hatch
  (posters, games). The skill teaches both and says which the framework provides.
- **Iframe/embed context (extend).** "Never scroll the body horizontally"
  carries over, plus: design for the *embed width* (a doc content column, ~700–
  900px) as the primary viewport, not a full browser window; test at both the
  embedded size and the `/artifacts` full-page view. The recently shipped
  lightbox/pan-zoom work in this repo is the reference for how embedded media is
  framed.

---

## 6. Self-contained HTML — the CDN stance

There is no platform CSP here: an iframe served from the docs site *can*
technically reach a CDN. So self-containment is a policy choice, not a technical
given. Options:

- **(a) Hard self-contained, data-URI everything** (the claude.ai posture) —
  maximally portable but heavy diffs; forces fonts/images into base64.
- **(b) Self-contained *as policy*, with a repo-relative relaxation** — all
  CSS/JS inline or repo-relative; images as repo assets (the framework already
  serves `/assets/`) or data URIs; fonts as `.woff2` under repo assets,
  referenced relatively; **no external scripts, ever.**
- **(c) Allow CDN references** — smallest authoring effort, but a dead CDN font
  or script silently takes the artifact down, and an external script is an
  XSS/supply-chain surface *inside your own docs origin*.

**Recommendation: (b).** Rationale: docs sites get deployed to intranets,
offline mirrors, and long-lived archives; artifact-design's "silent font
fallback" warning bites doubly when nobody re-opens an old artifact. So the skill
mandates: everything inline or repo-relative, no external scripts under any
circumstances, fonts and images may reference *repo-local* files (the repo is the
bundle — this is the ergonomic win over claude.ai's data-URI requirement). A team
that consciously wants CDN fonts documents that as an opt-out; the enforcement
path, if ever needed, is a real CSP header on the `/artifacts` route — the skill
notes that option without requiring it. Font delivery specifically: ship the
`.woff2` under assets and reference it relatively; keep the underlying warning —
a missing font is invisible to a glance because the fallback renders "fine," so
check the *computed* font, not the vibe (design-sync's `[FONT_MISSING]` lesson as
prose).

---

## 7. The metadata sidecar contract (our layer)

claude.ai gave title/description/favicon for free; the repo needs its own
equivalent, and the vision asks for *more* than title/description — explicit
declared values (palette, purpose, key data) so an AI agent understands the
artifact **without parsing the HTML**. This mirrors the first-class diagram
sidecar precedent: an optional same-name `.meta.json` (`.jsonc` accepted) next to
the file, documented in `default-docs/data/user-guide/15_writing-content/06_diagram-pages.md`.

The **filename mechanics** (is it `NN_name.meta.json`? how the loader pairs it?)
are owned by the sibling component/route brainstorm and the `10_component`
subtask — this skill defers to whatever they settle. What this skill owns is the
**content contract**: what an artifact author writes into the sidecar so the
declared values are trustworthy.

Deliberation — how much structure? Two failure modes bracket the choice: too
loose (a free-text blob an agent still has to interpret) or too rigid (a schema
so strict authors skip it). Proposed middle: the diagram sidecar's page fields
(`title`, `description`, `sidebar_label`, `sidebar_position`, `draft`) **plus** an
optional `artifact` block of declared values:

- `purpose` — one sentence: what this artifact is for and who reads it.
- `palette` — the hex values actually used (so an agent can reason about /
  validate color without scraping `<style>`), ideally the same list you would
  feed the palette validator.
- `theme` — `adopts-site` | `self-world`, disambiguating §5's two modes.
- `data` — for dashboards/charts: the key figures or the source the artifact
  visualizes, in structured form.
- `type` — report | dashboard | dataviz | design-system | showcase, for listing.

**Recommendation:** ship the `artifact` block as **optional but strongly
encouraged**, and make the design-system flows (§8) treat it as **mandatory** —
that is precisely the context where "AI need not read the HTML" is the whole
point. Apply design-sync's validate-names rule: any token/hex the sidecar
*declares* must actually appear in the artifact, or the declaration is a lie
worse than silence. The verify gate (§3) checks this.

---

## 8. Brand-system / design-system creation flows

The vision names two distinct homes for a design system authored as artifacts.
The skill must teach *both* and, more usefully, teach **when each applies** —
this is our layer sitting on top of design-sync's taxonomy.

- **Home A — inside an issue's `brainstorm/` (or `notes/`) folder.** The design
  system is *in flux*: a brand exploration, competing palette directions, a
  component look being argued out. Artifacts here are thinking-artifacts —
  drafts that live beside the deliberation that produced them, versioned with the
  issue. Per `agent-ks-issues`, brainstorm content deliberates real alternatives, so a
  design-system brainstorm ships *multiple* artifact options with commentary and
  a recommendation, not one polished result. The skill instructs: keep each
  option a self-contained artifact, declare its palette/purpose in the sidecar so
  the trade-off discussion can cite declared values, and promote the chosen
  direction outward only once settled.
- **Home B — a published docs section full of artifacts + commentary
  documents.** The design system is *settled and canonical*: the project's brand
  guideline, referenced by builders. It is a docs section (its own `NN_` folder
  under `data/`) holding artifact pages (the swatches, the type specimen, the
  component gallery) **interleaved with markdown commentary documents that state
  the explicit values** — the token table, the usage rules, the do/don't — so an
  AI agent consuming the system reads the *commentary's* declared values and
  never has to parse an artifact's HTML. This is design-sync's "conventions
  document" reborn as a docs page, authored per its doctrine (name the real token
  vocabulary, name where the truth lives — `src/styles/theme.yaml`, `color.css`,
  `font.css` — one idiomatic snippet, validate every named token against what
  actually ships).

**The decision rule the skill states:** *in flux → Home A (issue brainstorm);
settled + referenced by others → Home B (published docs section).* A system
graduates from A to B when the deliberation closes. Both homes reuse the same
artifact primitive; only the surrounding context (deliberation vs canon)
differs. design-sync's design-system *anatomy* (tokens + fonts + inventory +
conventions doc + where-truth-lives pointers) is the checklist for what a Home-B
section must contain to be complete; its Styled/Complete/Plausible rubric (§3) is
the gate before it is called done.

---

## 9. Scripts — what's bundled and how an agent invokes it

The script triage is settled here.

- **Bundle `validate_palette.js` (primary).** It is a dependency-free ES module
  (~260 lines, all color math inlined) that runs under node or bun with no npm
  install. It ships at `plugins/documentation-guide/skills/agent-ks-artifacts/scripts/validate_palette.js`.
  Two invocation modes the skill documents:
  - *CLI:* `node validate_palette.js "#2a78d6,#1baf7a,…" --mode light` (add
    `--surface "#1a1a19"` for a non-default chart surface, `--pairs all` for
    scatter/maps, `--ordinal` for a sequential ramp). Exit 0 unless a hard FAIL;
    WARN bands (CVD ΔE 8–12, sub-3:1 contrast "relief") still exit 0 but obligate
    a secondary encoding.
  - *In-page:* load it as a `<script type="module">` in the artifact during
    authoring and set `data-palette` (plus optional `data-mode`/`data-surface`)
    on `<body>` — it auto-runs and logs a `console.table` report. This is a
    genuine fit here: an artifact can self-validate with **no toolchain at all**,
    just the browser it already renders in.
- **Note the `.py` twin exists, don't bundle it.** `validate_palette.py` is
  functionally identical (same thresholds, same Machado matrices, stdlib-only).
  Since the repo runs bun and the JS covers both CLI and in-page use, the Python
  file is redundant; the provenance note records that the twin exists upstream if
  a no-node consumer ever needs it.
- **Drop the entire design-sync build pipeline** (`package-build.mjs`,
  `package-validate.mjs`, `resync.mjs`, all of `lib/`, the storybook harness).
  It targets a different contract (React component-library repos → the
  claude.ai/design upload format), carries heavy deps (esbuild, ts-morph,
  Playwright + chromium), and its value here is *doctrinal, not executable* — the
  rubrics and conventions rules travel as prose (§4). If a mechanical render
  check is ever wanted, a fresh ~50-line Playwright snippet against the
  `/artifacts` route beats carrying ~5k lines of sync machinery.

---

## 10. Licensing / rewrite stance

All four sources are **Anthropic-authored**, and this repo is **public**. Two of
the constraints are hard:

- **Rewrite, never paste.** The converged skill re-expresses the sources' ideas
  in our own words, adapted to our publish target. This is both a licensing
  posture (we do not republish Anthropic's skill text verbatim in a public repo)
  and a correctness one (verbatim text carries claude.ai mechanics that are
  wrong here). The scripts are the deliberate exception: `validate_palette.js` is
  a functional tool bundled as-is (it is code, carried with its provenance), not
  prose reproduced.
- **frontend-design carries a license.** It is the one source captured *with*
  frontmatter (`license: Complete terms in LICENSE.txt`) from the official plugin
  marketplace / public `anthropics/skills` GitHub repo. Rewriting its ideas into
  our skill is fine; if any snippet were ever carried closer to verbatim, its
  license terms and attribution would need to travel with it. The provenance note
  ([`../notes/01_skill-sources-and-provenance.md`](../notes/01_skill-sources-and-provenance.md))
  records origin and license per source precisely so this stays auditable.

The rewrite stance and the provenance map are two sides of one requirement:
because we adapt rather than fork, we keep an explicit record of *what came from
where* so a future upstream update can still be diffed and folded in
(workstream `70_upstream-provenance`).

---

## Open threads carried forward

- **Theme-CSS-into-iframe (§5)** — whether the `/artifacts` route injects the
  site theme so artifacts consume `--color-*` etc. directly. Decided in the
  `20_route` subtask; the skill documents whichever way it lands.
- **Sidecar filename mechanics (§7)** — owned by the component/route brainstorm
  and `10_component`; the skill defers to it and teaches only the content
  contract.
- **Everything else here is a recommendation ready to become the `40_authoring-skill`
  work order** — name (`agent-ks-artifacts`), placement, triage wiring, the
  `SKILL.md` + `references/` TOC, the section sourcing, the CDN stance (self-
  contained with a repo-relative relaxation), the sidecar content contract, the
  two design-system homes, the bundled validator, and the rewrite posture.
