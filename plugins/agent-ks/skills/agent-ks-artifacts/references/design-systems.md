# Design systems and brand guidelines

A design system is a set of artifact pages plus commentary pages that state the explicit values. The artifact pages are swatches, a type specimen and a component gallery. An agent authors it and maintains it. This file covers the parts of a design system, its two homes, its conventions document, and its verification.

A design-system artifact is always `theme: "self"`. The [mode rule](../SKILL.md#theme-mode) decides that by subject. Read the contract's values with `agent-ks theme tokens --json`, and the declaring files under `@root/astro-doc-code/src/styles/`. Start from those values. Never rely on the route to inject them.

## What a design system is

Treat a design system as a contract that an agent or a builder uses, not a mood board. A complete one has six parts.

| Part | Content |
|---|---|
| Tokens | The named color, type, spacing, radius, shadow and motion values |
| Fonts | The faces, and how they are delivered |
| Inventory | The real components and patterns (button, card, table, badge, field) with their variants and states |
| Usage contract | How each part is composed, with examples |
| Conventions document | The prose that teaches the system's idiom, the way it is meant to be used. See below |
| Where-truth-lives pointers | The source files to open before styling: `@root/astro-doc-code/src/styles/theme.yaml`, `color.css`, `font.css` |

A published design-system section (Home B, below) is complete when it holds all six. The verify gate decides when it is done.

## The two homes

A system that is still changing goes to Home A. A settled system that other pages reference goes to Home B. A system moves from A to B when the discussion closes.

### Home A: an issue's brainstorm or notes folder

The system is still changing: a brand exploration, competing palettes, a component look under debate. An artifact here is a thinking aid. It sits beside the discussion and is versioned with the issue. A brainstorm weighs real alternatives (see [05_brainstorm-notes-memory.md](../../agent-ks-issues/references/05_brainstorm-notes-memory.md)), so a design-system brainstorm ships several options with commentary and a recommendation.

- Competing whole systems (palettes, brand directions, full visual worlds) get one self-contained artifact each.
- N variations of one element or screen get one artifact that holds all of them. See "Variation sets" below.
- Declare each option's `palette` and `purpose` in its sidecar, so the discussion cites declared values.
- Promote the chosen direction to Home B only when it is settled.

### Home B: a published docs section

The system is settled and is the one source. It is its own `NN_` docs section. Artifact pages (swatches, specimen, gallery) alternate with markdown commentary pages. The commentary states the explicit values: the token table, the usage rules, the do and don't list. An agent that uses the system reads the commentary's declared values and never parses an artifact's HTML. Pick a base URL outside the reserved set. See [publishing.md](publishing.md#where-an-artifact-lives).

## Variation sets

A variation set is one artifact that carries 4–10 labeled design options of one UI element or screen. Examples: a mobile nav five ways, a button placement four ways. Reviewers try each option and pick one. Variations of one element always ship as one artifact. Separate files make side-by-side comparison impossible, and they duplicate the shared fixture N times. The fixture is the host frame every option renders in. Home A's one-artifact-per-option rule covers competing whole systems, not this.

| Requirement | Rule |
|---|---|
| Labeled options, with what a decision needs | Every option gets a real name ("Bottom tab bar", never "Option 3"), a one-line identity, and its trade-offs: pros, cons, best for. |
| Layout by count | 2–3 options: all visible at once, stacked or side by side. 4–6: a switcher (tab strip or numbered rail) over one stage. 7–10: a switcher with the selection persisted in `localStorage`. |
| Operable, not mocked | Every behavior an option proposes works in the artifact: buttons press, drawers open, states toggle, transitions play. A static picture is not enough. |
| One shared, realistic fixture | All options render inside the same host frame: the same phone, app shell or page. The fixture looks like a real product: real screen names, real content, the host app's type and color. Grey bars in place of text and placeholder boxes ruin the comparison. Spend real effort here. |
| Built for the decision | Include a comparison strip or table the reader can take in at a glance. Mark a recommendation when you have one. Optionally add a vote control with a rationale field, persisted locally, with a copy-out. Once the decision is made, write it into the issue's notes or comments. |

The treatment is decision tooling. See [SKILL.md](../SKILL.md#calibrate-the-treatment). The theme is `self`. Reuse the contract's token names per the inline contract. The sidecar declares `"type": "variation-set"` with `options`, and `recommendation` and `decision` when they exist. The keys are in [publishing.md](publishing.md#the-sidecar).

This is the shape. It is not markup to copy:

```html
<body>
  <header><!-- what is decided, in one line, plus the option count --></header>
  <nav class="switcher"><!-- one tab per option, real names --></nav>
  <main class="stage">
    <!-- ONE shared fixture. Switching swaps only the element under decision.
         Its interactions run: tap, drag, toggle, navigate. -->
  </main>
  <section class="verdict">
    <!-- per-option pros, cons, best for · comparison table ·
         recommendation · vote + rationale (localStorage) + copy summary -->
  </section>
</body>
```

## Conventions an agent can act on

The conventions document is a commentary page in Home B, or the deliberation prose in Home A. Its reader is an agent that builds with the system many times and cannot follow guidance that is absent. It gets the prose and the artifacts, not your build or your source.

| Rule | Do |
|---|---|
| Zero guesswork | Hold every sentence to one test: the reader can act on it with no guess. "Follow the design system's conventions" fails. Spell the convention out. Name the token, or the agent invents one. |
| Teach this system's idiom | A token system gets the `var(--*)` pattern with the real names: `--color-*`, `--ui-text-*`, `--content-*`, `--spacing-*`. A utility-class system gets a compact family table with real class names. A prop or theme system gets prop-based styling through its real props. Do not mix in another system's idiom. |
| Name where the truth lives | Point at the real source files of the system you are documenting: its token file, its color and font files, any per-component page. Give each one a path the reader can open. |
| One idiomatic snippet | Include one short, real example that composes the system correctly. Adapt one you have already rendered. |
| Validate every named thing | Every token you list exists in `theme.yaml` or the CSS. Every component you name exists as an artifact or a documented part. A name that resolves to nothing does more damage than no file. The reader builds with it and ships unstyled with no error. Fix the name or cut it. |

## Verify a section

Every artifact page passes the verify gate in [publishing.md](publishing.md#verify-before-you-publish). A Home B section also passes as a whole:

- The commentary declares every value.
- Every pointer resolves.
- The inventory is complete.

Playwright tools can take the screenshots. A purpose-built Playwright snippet of about 50 lines against the `/artifacts` route beats any heavier harness. Do not use a component-library sync pipeline. It targets a different contract.
