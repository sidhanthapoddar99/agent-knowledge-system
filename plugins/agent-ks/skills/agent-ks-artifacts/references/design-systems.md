# Design systems and brand guidelines

A design system is a set of artifact pages plus commentary pages that state the explicit values. The artifact pages are swatches, a type specimen and a component gallery. An agent authors it and maintains it. This file covers the parts of a design system, its two homes, its conventions document, and its verification.

A design-system artifact is always `theme: "self"`; the [mode rule](../SKILL.md#theme-mode) decides that by subject. Read `theme.yaml`, `color.css` and `font.css` to start from the contract's values, never to inherit them by injection.

## What a design system is

Treat a design system as a contract that an agent or a builder consumes, not a mood board. A complete one has six parts.

| Part | Content |
|---|---|
| Tokens | The named color, type, spacing, radius, shadow and motion values |
| Fonts | The faces, and how they are delivered |
| Inventory | The real components and patterns (button, card, table, badge, field) with their variants and states |
| Usage contract | How each part is composed, with examples |
| Conventions document | The prose that teaches the system's idiom; see below |
| Where-truth-lives pointers | The source files to open before styling: `astro-doc-code/src/styles/theme.yaml`, `color.css`, `font.css` |

A Home B section is complete when it holds all six. The verify gate decides when it is done.

## The two homes

The decision rule: in flux → Home A; settled and referenced by others → Home B. A system graduates from A to B when the deliberation closes.

### Home A: an issue's brainstorm or notes folder

The system is in flux: a brand exploration, competing palettes, a component look under debate. Artifacts here are thinking-artifacts beside the deliberation, versioned with the issue. A brainstorm weighs real alternatives (see [05_brainstorm-notes-memory.md](../../agent-ks-issues/references/05_brainstorm-notes-memory.md)), so a design-system brainstorm ships several options with commentary and a recommendation.

- Competing whole systems (palettes, brand directions, full visual worlds) get one self-contained artifact each.
- N variations of one element or screen get one artifact that holds all of them; see "Variation sets" below.
- Declare each option's `palette` and `purpose` in its sidecar, so the discussion cites declared values.
- Promote the chosen direction to Home B only when it is settled.

### Home B: a published docs section

The system is settled and canonical. It is its own `NN_` docs section. Artifact pages (swatches, specimen, gallery) interleave with markdown commentary pages that state the explicit values: the token table, the usage rules, the do and don't list. An agent that consumes the system reads the commentary's declared values and never parses an artifact's HTML. Pick a base URL outside the reserved set; see [publishing.md](publishing.md#where-an-artifact-lives).

## Variation sets

A variation set is one artifact that carries 4–10 labeled design options of one UI element or screen: a mobile nav five ways, a button placement four ways. Reviewers operate each option and pick one. Variations of one element always ship as one artifact. Separate files kill side-by-side comparison and duplicate the shared fixture N times. Home A's one-artifact-per-option rule covers competing whole systems, not this.

| Requirement | Rule |
|---|---|
| Labeled options with decision furniture | Every option gets a real name ("Bottom tab bar", never "Option 3"), a one-line identity, and its trade-offs: pros, cons, best for. |
| Layout by count | 2–3 options: all visible at once, stacked or side by side. 4–6: a switcher (tab strip or numbered rail) over one stage. 7–10: a switcher with the selection persisted in `localStorage`. |
| Operable, not mocked | Every behavior an option proposes works in the artifact: buttons press, drawers open, states toggle, transitions play. A static picture fails the pattern. |
| One shared, realistic fixture | All options render inside the same host frame: the same phone, app shell or page. The fixture looks like a real product: real screen names, real content, the host app's type and color. Greeked bars and placeholder boxes sink the comparison. Spend explicit effort here. |
| Built for the pick | Carry an at-a-glance comparison strip or table. Mark a recommendation when you have one. Optionally add a vote control with a rationale field, persisted locally, with a copy-out. The decision graduates to the issue's notes or comments once made. |

The treatment is decision tooling; see [SKILL.md](../SKILL.md#calibrate-the-treatment). The theme is `self`; reuse the contract's token names per the inline contract. The sidecar declares `"type": "variation-set"` with `options`, and `recommendation` and `decision` when they exist; the keys are in [publishing.md](publishing.md#the-sidecar).

The shape, not markup to copy:

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
| Zero guesswork | Hold every sentence to one test: the reader can act on it with no guess. "Follow the design system's conventions" fails; spell the convention out. Name the token, or the agent invents one. |
| Teach this system's idiom | A token system gets the `var(--*)` pattern with the real names: `--color-*`, `--ui-text-*`, `--content-*`, `--spacing-*`. A utility-class system gets a compact family table with real class names. A prop or theme system gets prop-based styling through its real props. Do not graft a foreign idiom. |
| Name where the truth lives | Point at the real source files to read before styling: `theme.yaml`, `color.css`, `font.css`, any per-component page. |
| One idiomatic snippet | Include one short, real example that composes the system correctly. Adapt one you have already rendered. |
| Validate every named thing | Every token you list exists in `theme.yaml` or the CSS. Every component you name exists as an artifact or a documented part. A name that resolves to nothing does more damage than no file: the reader builds with it and ships unstyled with no error. Fix the name or cut it. |

## Verify a section

Every artifact page passes the verify gate in [publishing.md](publishing.md#verify-before-you-publish). A Home B section also passes as a whole:

- The commentary declares every value.
- Every pointer resolves.
- The inventory is complete.

Playwright tools can take the screenshots. A purpose-built Playwright snippet of about 50 lines against the `/artifacts` route beats any heavier harness. Do not reach for a component-library sync pipeline; it targets a different contract.
