# Design systems and brand guidelines

Artifacts are how a project's **design system / brand guideline** gets authored and
maintained by an agent: a set of artifact pages (swatches, a type specimen, a
component gallery) plus commentary that states the explicit values. This file
carries the doctrine for *what a design system is*, *where it lives*, *how to write
its conventions so an agent can act on them*, and *the rubric that gates it as done*.
(The upstream doctrine here is design-sync's, stripped of its claude.ai upload
pipeline — none of that machinery is needed; the value is the doctrine.)

> **Theme mode: a design-system artifact is always `theme: "self"`** (SKILL §1
> mode-choice doctrine). Its subject *is* a look, so it owns its theme inside the
> HTML — even when the system it presents resembles the docs engine's own theme.
> Reading `theme.yaml` / `color.css` here is to *start from* the contract's values,
> never to inherit them by injection (which is the `site` mode, for data artifacts).

## What a design system is — a consumable contract

Treat a design system as something an agent (or a builder) *consumes*, not a mood
board. A complete one is an enumerable contract with these parts:

- **Tokens** — the color, type, spacing, radius, shadow, and motion values, named.
- **Fonts** — the actual faces, with how they're delivered.
- **A component / pattern inventory** — the real parts (button, card, table, badge,
  form field…) with their variants and states.
- **A usage contract** — how each part is composed, with examples.
- **A conventions document** — the prose that teaches the system's idiom (below).
- **Where-truth-lives pointers** — the source files a reader should open before
  styling. For this framework that is `astro-doc-code/src/styles/theme.yaml` (the
  contract), `color.css`, and `font.css`.

A Home-B section (below) is "complete" when it contains all of these; the rubric at
the end is the gate before it is called done.

## The two homes — and when each applies

The same artifact primitive serves two very different contexts. The decision rule:
**in flux → Home A; settled and referenced by others → Home B.** A system graduates
from A to B when the deliberation closes.

### Home A — inside an issue's `brainstorm/` (or `notes/`)

The system is *in flux*: a brand exploration, competing palette directions, a
component look being argued out. Artifacts here are **thinking-artifacts** — drafts
beside the deliberation that produced them, versioned with the issue. Because
`brainstorm/` deliberates real alternatives (per the doc-issues skill), a
design-system brainstorm ships **multiple** artifact options with commentary and a
recommendation, not one polished result:

- Keep each option a self-contained artifact.
- Declare each option's `palette` / `purpose` in its sidecar, so the trade-off
  discussion can cite *declared values* rather than re-reading each HTML.
- Promote the chosen direction outward (to Home B) only once it's settled.

### Home B — a published docs section of artifacts + commentary

The system is *settled and canonical*: the project's brand guideline, referenced by
builders. It is its own `NN_` docs section holding artifact pages (the swatches, the
type specimen, the component gallery) **interleaved with markdown commentary
documents that state the explicit values** — the token table, the usage rules, the
do/don't. The commentary is the reborn "conventions document": an agent consuming
the system reads the *commentary's* declared values and **never has to parse an
artifact's HTML**. (Pick a base URL outside the reserved set — not `artifacts` — see
`publishing.md`.)

## Writing conventions an agent can act on

The conventions document (a markdown commentary page in Home B, or the deliberation
prose in Home A) is written for a specific reader: an agent that will build *with*
this system, many times, and **cannot follow guidance that isn't there**. It won't
run your build or read your source unless you point at it; it gets the prose and the
artifacts. So:

- **Hold every sentence to a single standard: *can the reader do something with
  it, with zero guesswork?*** A line like "follow the design system's conventions"
  flunks — cut it and spell the convention out. When you name the token, the agent
  uses that token; when the vocabulary goes unnamed, the agent makes one up.
- **Teach *this* system's idiom with its real vocabulary.** A token system gets the
  `var(--*)` pattern with the real names (this framework's `--color-*`,
  `--ui-text-*`, `--content-*`, `--spacing-*`); a utility-class system gets a compact
  family table with real class names; a prop/theme system gets prop-based styling
  documented through the specific props that express the design language. Don't
  graft on an idiom that isn't native to the system.
- **Name where the truth lives.** Point at the real source files the agent should
  read before styling (`theme.yaml`, `color.css`, `font.css`, and any per-component
  page) — an agent working from the actual files will always outperform one working
  from a paraphrase.
- **Include one idiomatic build snippet.** A short, real example that composes the
  system correctly — adapt one you've already rendered, so it's code you know works.
- **Validate every named thing against what actually ships.** A conventions file
  that lists tokens, classes, or components with no real counterpart does *more
  damage than no file at all* — the reader takes it at face value, builds with
  vocabulary that resolves to nothing, and the output goes out unstyled with no
  error raised. Before shipping: every token you enumerate must exist in
  `theme.yaml` / the CSS; every component you name must exist as an artifact or
  documented part. Verifies in neither → fix the name or cut it.

## The verify rubric — Styled / Complete / Plausible

An absolute, three-word gate for any artifact, and the bar a design-system section
must clear before it is called done. **Render it and look at it** — the palette
validator checks color math, not layout; open or screenshot the output before
grading.

- **Styled.** The theme tokens visibly resolve. An unresolved `var()` freezing its
  fallback — a frozen color, a dead dark mode, a silently fallen-back font — is the
  exact failure this catches. Check the *computed* values, not the vibe.
- **Complete.** Nothing collapsed or overflowing; no horizontal body scroll; focus
  states visible; `prefers-reduced-motion` honored; every chart passes its dataviz
  checks; every declared state (empty / loading / error) is actually shown.
- **Plausible.** Real content throughout — never `foo` / `test` / lorem. Curate real
  values before inventing. For a system: the canonical example, a variant sweep, and
  the static states.

Run the render check in **both themes** and **both viewports** (the embed column
~700–900px and the full page) — see `SKILL.md` §3 for the full pre-publish sequence.
For a Home-B section, the rubric applies to every artifact page *and* to the section
as a whole (does the commentary declare every value; do the pointers resolve; is the
inventory complete). Playwright MCP tools can automate the screenshots if wanted; a
purpose-built ~50-line Playwright snippet against the `/artifacts` route beats any
heavier harness — do not reach for a component-library sync pipeline, which targets a
different contract entirely.
