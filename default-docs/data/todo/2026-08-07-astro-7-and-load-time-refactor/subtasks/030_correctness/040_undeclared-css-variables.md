---
title: "44 CSS variables used but never declared"
status: review
---

# Overview

The theme contract declares **53 required variables**. The stylesheets reference **44 more
that nothing declares.**

The clearest case is `--color-text-tertiary`, used at `markdown.css:856` and `:888` with
frozen `#888` / `#999` fallbacks. The variable never resolves, so the fallback is the value
— which means task-checkbox borders **already ignore dark mode**.

This is exactly the failure the project's own theming rule exists to prevent: *"inventing
names with inline fallbacks is how bugs creep in — the var never resolves, the fallback
freezes the value, dark/light mode stops working."* The rule is written down and it is
being broken.

Also undeclared: `--sidebar-width`, `--navbar-height`, `--outline-width` and the whole
z-index scale. A theme using `override_mode: replace` would lose all of them.

# References

- [the theming and CSS surface audit](../../../2026-05-08-runtime-stack-migration/agent-log/010_au_migration-feasibility-rescope/02_working/013_surface_theming-and-css.md) — the 53-against-44 count and the named examples
- [the theme parity analysis](../../../2026-05-08-runtime-stack-migration/agent-log/010_au_migration-feasibility-rescope/02_working/023_question_theme-css-parity.md) — why a too-narrow contract cannot protect a replace-mode theme
- the project `CLAUDE.md` theming section — the rule being broken, and the coupling to the artifacts skill

# Todo list

- [x] Enumerate all 44 — produce the actual list, do not work from the examples
- [x] Sort each into: promote to the contract / rename onto an existing token / delete
- [x] Fix `--color-text-tertiary` first — it is a live dark-mode defect
- [x] Add the promoted names to `theme.yaml` `required_variables` (12 of them — but see below, they are not from the 44)
- [x] **Mirror any contract change into the artifacts skill's inline variable list**, both the repo source and the installed cache
- [x] Add a check that fails when a stylesheet references an undeclared variable

# Outcomes and Next Steps

Done. Commit `36c0497`. **The count was right and the conclusion drawn from it was
not** — which is the useful part of this write-up.

## The 44 reproduced exactly, then sorted

| Group | n | Disposition |
|---|---|---|
| `--dt-*` dev-toolbar tokens | 20 | **Keep.** Declared in `dev-tools/_shared/styles.ts` — the original scan only looked for declarations in `.astro`/`.css`, so it missed a `.ts` file. Dev-only surface; never in a built site |
| `--ev-*` editor tokens | 12 | **Keep.** Declared in `dev-tools/editor/styles/editor.css`. Dev-only |
| `--badge-color`, `--chip-color`, `--sidebar-*`, `--task-indent` | 8 | **Keep.** Component-local *parameters*, set through inline `style=` or `setProperty` and declared beside their use. That is what a CSS custom property is for; they are not theme tokens |
| `--shiki-dark`, `--shiki-dark-bg`, `--mx-r` | 3 | **Keep.** Set at run time by Shiki and by the vendored draw.io viewer. Not ours to declare |
| `--color-`, `--status-` | 2 | **Not variables.** Regex artefacts from `` var(`--status-${status}`) `` template concatenation |
| `--group-accent` | 1 | **Deleted** — see below |
| `--color-text-tertiary` | 1 | **Renamed** — see below |

**So 42 of the 44 were fine, and the headline number was measuring the scan's
blind spots more than the code's.** Both real ones are now fixed.

## `--color-text-tertiary` — the live defect, and it was not a fourth tier

Used at `markdown.css:856` and `:888` with frozen `#888` / `#999` fallbacks, so
task-checkbox borders ignored dark mode entirely.

The subtask asked the right question — *is this genuinely a fourth text tier, or is
it `--color-text-muted` under another name?* The theme declares exactly three text
tiers, and `--color-text-muted` is `#737373` in **both** schemes, which is what
`#888`/`#999` were approximating. **Renamed, not promoted.**

Two more hardcoded values sat in the same three rules and went with it: a `#555`
checkbox fill (now `--color-text-muted`, with the tick as `--color-bg-primary` so it
stays legible when the fill darkens) and an `rgba(128,128,128,0.5)` strikethrough
(now a `color-mix` off the same token).

## `--group-accent` — read six times, set nowhere

Six reads in `IssuesCards.astro`, each with a fallback that is itself a contract
token. Nothing anywhere sets it — the sibling `--chip-color` *is* set, in
`scripts/index/client.ts`, which is what made the absence conclusive rather than
assumed. Someone planned per-group accent colours and never wired them.

It rendered correctly (the fallback always won), so this is tidying, not a fix:
each use now names the token it was falling back to. If per-group accents are
wanted later, the variable comes back **with** the code that sets it.

## The gap that actually mattered was the opposite one

Not *used but undeclared* — **declared and used but not required**. 12 variables
that shipped layouts read, that the built-in theme declares, and that
`required_variables` did not name. A `merge` theme inherits them and never notices.
A theme with `override_mode: replace` drops the parent and loses all 12, silently,
because validation only checks the list:

```
  --sidebar-width  --navbar-height  --outline-width           ← the docs grid collapses
  --max-width-primary  --max-width-secondary
  --spacing-2xl  --spacing-3xl  --border-radius-full  --shadow-xl
  --display-sm  --display-md                                  ← the home hero
  --font-weight-normal
```

All 12 promoted. `required_variables` **53 → 65**.

**A rule now sits above the list, because a list without one regrows:** a variable
belongs on the contract **if and only if a shipped layout reads it.** The corollary
is the part people get wrong — *do not complete a scale for tidiness*.
`--font-weight-normal` is required and `--font-weight-bold` is not, because layouts
read the first and write the second as a literal `700`.

## The check, and the fact that it can fail

`scripts/check-theme-contract.mjs`, development-stage (it reads framework source,
which a consumer does not have):

| Gate | Fails when |
|---|---|
| **A** | any `var(--x)` in the engine names something nothing declares |
| **B** | a shipped layout reads a variable the contract does not require — **and the reverse**, so the contract cannot carry names nothing uses either |
| **C** | circular `extends` goes undetected ([the sibling subtask](./030_theme-loader-bugs.md)) |

Each gate was **deliberately broken and confirmed to fail on its own**, then the
tree restored — a harness that has never failed is not evidence:

```
  BASELINE                                        exit=0  A=✅ B=✅ C=✅
  layout reads an undeclared token                exit=1  A=❌ B=✅ C=✅
  drop --sidebar-width from the contract          exit=1  A=✅ B=❌ C=✅
  cripple the cycle detector                      exit=1  A=✅ B=✅ C=❌
  RESTORED                                        exit=0  A=✅ B=✅ C=✅
```

No cross-talk: each break trips exactly one gate.

## Documentation, including a staleness nobody had noticed

The user guide said **46** variables. `theme.yaml` said **53** *before* this work —
already stale by the seven `--status-*` tokens. Now 65, with the status tokens
documented, the layout dimensions documented, and the membership rule written down.

Mirrored per the `CLAUDE.md` coupling: repo source **and** the installed
`0.8.5` plugin cache, verified byte-identical, and verified in sync beforehand so
the copy did not overwrite a divergence.

## Next steps

- The z-index scale is declared and consumed **only inside the theme's own
  `element.css`** — so it is correctly *not* on the contract, but it also means
  layouts write raw `z-index` numbers. Not a defect; worth a look if stacking bugs
  ever appear.
- Gate B is worth running in CI. Nothing about its failure is visible by eye.

# Details

## Not every one of the 44 should be promoted

A bigger contract is a bigger burden on every theme author. Sort them:

- **Promote** — layout-structural values a replace-mode theme genuinely must supply:
  `--sidebar-width`, `--navbar-height`, `--outline-width`, the z-index scale.
- **Rename** — where an existing token already means the same thing.
  `--color-text-tertiary` is the test case: is it genuinely a fourth text tier, or is it
  `--color-text-muted` under another name? Answer that before adding it.
- **Delete** — one-off names with a hardcoded fallback that nobody sets. Fold them into the
  nearest existing token rather than growing the contract.

## The coupling that is easy to miss

`CLAUDE.md` states that any change to `theme.yaml → required_variables` must update the
`agent-ks-artifacts` skill's inline copy of the vocabulary, in **both** the repo source and
the installed plugin cache, byte-identically. If this subtask promotes anything, that
mirror is part of the work, not a follow-up.

## The check is the durable half

The fixes are one-time; the check is what stops it recurring. A CSS scan for `var(--…)`
names, diffed against `required_variables` plus the theme-internal primitives, failing on
anything unaccounted for. Without it the count drifts straight back up.

## Done when

- [ ] The full list of 44 is written into **Outcomes** with a disposition for each
- [ ] `--color-text-tertiary` resolves, and task-checkbox borders respond to dark mode
- [ ] `theme.yaml` and the stylesheets agree
- [ ] Any contract change is mirrored into the artifacts skill, both copies
- [ ] A check exists that fails on an undeclared variable
