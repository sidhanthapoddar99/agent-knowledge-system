---
title: "Theming and layouts"
---

agentks ships a **fixed set of built-in layouts**, one or more per content type, chosen by name in config. **Custom layouts are dropped**: a user brands a site with **CSS only**. The layouts are components in [the shared UI package](./01_shared-ui-package.md), fed by data Rust computes, and the same components draw the local client and the published site. New built-in layouts are added when there is real demand, not ahead of it. The **theme variable contract** in today's `theme.yaml` carries over unchanged in spirit: every layout reads only declared theme variables and semantic tokens, and a variable is on the contract if and only if a shipped layout reads it. Rust compiles each project's theme CSS (the built-in theme plus the user's overrides), caches it and serves it from one URL. Because CSS is now the only way to brand a site, the class names and `data-part` hooks that layouts expose become a **public contract**, printed by the CLI and changed only with a migration. Today's **UX standards** carry over to every layout.

# 03 References

- [Layouts: built-in only](../../brainstorm/01_initial-discussion/11_layouts.md) and [CSS and theming](../../brainstorm/01_initial-discussion/10_css-and-theming.md) — the discussion and decisions.
- [The GitHub issues layout](../../brainstorm/02_future-stages/06_github-issues-layout.md) — a later-stage layout.
- [The shared UI package](./01_shared-ui-package.md) — where layouts and their CSS live.
- [The Rust CLI](../02_engine/05_rust-cli.md) — `agentks theme css`, `theme tokens` and `theme eject`.
- [Project config](../02_engine/02_project-config.md) — `site.yaml`, where layouts and the theme are chosen.
- [Versioning and migrations](../05_delivery/03_versioning-and-migrations.md) — the migration of custom layouts and of renamed hooks.
- Today's theme contract: [theme.yaml](../../../../../../agent-ks-engine/src/styles/theme.yaml), the built-in theme's CSS in [the styles folder](../../../../../../agent-ks-engine/src/styles), [the theme CSS route](../../../../../../agent-ks-engine/src/pages/theme.css.ts), and [the contract check](../../../../../../scripts/checks/check-theme-contract.mjs).
- The built-in theme in the new engine: `apps/agentks-engine/themes/` in the main repository, with `default/` (the theme), `examples/` (today's two user themes, as compiler test inputs), `README.md` (the contract rules and what the compiler must do) and `check-contract.ts`.
- Today's layouts: [the layouts folder](../../../../../../agent-ks-engine/src/layouts), and [the file-type glyphs](../../../../../../agent-ks-engine/src/layouts/file-type-icons.ts).
- Today's rules, carried over: [UX standards](../../../../dev-docs/05_architecture/05_layout-internals/08_ux-standards.md) and [the layout types](../../../../dev-docs/05_architecture/05_layout-internals/02_layout-types.md).
- [2025-06-25-layouts-and-variations](../../../2025-06-25-layouts-and-variations/issue.md), [2026-04-10-new-layout-types](../../../2026-04-10-new-layout-types/issue.md) and [2025-06-25-sizing-and-responsive](../../../2025-06-25-sizing-and-responsive/issue.md) — paused issues that re-plan onto this note.

# 04 Decisions

- Decided (sidhantha, 2026-09-29): drop user-authored custom layouts and the logic behind them.
- Decided (sidhantha, 2026-09-29): branding is done with CSS.
- Decided (sidhantha, 2026-09-29): add more built-in layouts over time, possibly ten or more, but only on demand.
- Decided (sidhantha, 2026-09-29): layouts are standard components of the frontend, chosen by name in config and fed by data from Rust.
- Decided (sidhantha, 2026-09-29): Rust compiles and caches each project's theme CSS; the frontend fetches it. Common assets ship in the frontend build.
- Decided (sidhantha, 2026-09-29): the CLI lists the compiled CSS of the installed version, so a user's agent can see and override it. A skill teaches how, and points to the command.
- Decided (sidhantha, 2026-09-29): a GitHub issues layout, with machine-level GitHub sign-in, is a later stage.
- Decided (sidhantha, 2026-09-29): the new engine's output may differ from today's only in small visual improvements. Nothing drastic.
- Decided (sidhantha, 2026-09-30): the layouts live in the shared package `apps/packages/agentks-ui`, used by the local client and the static build.
- Decided (claude, 2026-09-30): the built-in theme's files live in `apps/agentks-engine/themes/default/`, outside any crate, and its `theme.yaml` carries a `layers` map that puts each file in a cascade layer ([100/10](../../subtasks/100_layouts/10_theme-contract-and-css.md)).

# 05 Notes & Analysis

## 01 The built-in layouts

| Content type | Layouts | Pages |
|---|---|---|
| `docs` | `default`, `compact` | One layout for every page of a docs section, with sidebar, outline and pagination |
| `blog` | `default` | An index page and a post page |
| `issues` | `default` | The index, an issue's detail page, and a sub-document page for its notes, subtasks, logs and comments |
| `custom` | `home`, `info`, `countdown` | Built-in pages drawn from YAML data. They are built-in layouts, not user code |
| navbar | `default`, `minimal` | On every page |
| footer | `default`, `minimal` | On every page |

The first-class page kinds keep their own views inside the sections they belong to: **diagram pages** (`.mmd`, `.dot`, `.excalidraw`, `.drawio`), **artifact pages** (`.html` with a `.meta.json` sidecar), and **video pages** ([video pages](../04_ecosystem/05_video-pages.md)).

**Choosing a layout** stays as today: each section in `site.yaml` names its layout, and the navbar and footer name theirs. The exact config keys belong to [project config](../02_engine/02_project-config.md). An unknown layout name is an error at start-up that lists the names available, never a silent fallback.

**Adding a built-in layout** (on demand) means three things in one change: a component in `agentks-ui`, the page data it needs from the Rust engine, and its entry in the docs. If it replaces a layout that projects name, a docs migration renames the reference.

## 02 What goes with custom layouts

- The `@ext-layouts` alias and the user layout folders (`<data>/layouts/<type>/<style>/`).
- User layouts that run server-side code, such as calling `loadFile` or `loadIssues`.
- Layout resolution by `import.meta.glob()` over folders. The client knows its layouts at build time.

**The migration:** a project that uses a custom layout is moved to the nearest built-in layout plus CSS, or the page becomes an artifact. The docs migration reports every custom layout it finds, because a human has to choose between the two ([versioning and migrations](../05_delivery/03_versioning-and-migrations.md)).

**For a truly one-off page** (claude, proposed): an HTML artifact may serve as a top-level page. This covers the last real need for custom layouts without bringing them back. It overlaps subtask `110` of [2026-07-07-artifact-component](../../../2026-07-07-artifact-component/issue.md).

## 03 How a layout is written

- **A layout is a component in `agentks-ui`**, under `layouts/<type>/<style>/`, beside the parts it is made of. It takes one typed page-data object and draws it ([the shared UI package](./01_shared-ui-package.md)).
- **It computes nothing.** Order, URLs, status categories, filter options, dates and sidebar trees arrive from Rust.
- **It stays small.** The rule carries over: split a file past about 400 lines into parts.
- **Its interactive parts are islands.** Each is registered by name and hydrated on its own element from a JSON props tag, never as a whole page ([the shared UI package](./01_shared-ui-package.md) section 07).
- **Its classes carry the layout's prefix**, so its CSS cannot reach another layout. This replaces Astro's scoped CSS, and the old gotcha with runtime-created elements goes away.

## 04 The theme contract, carried over

The rule for membership is today's, word for word in effect: **a variable is on the contract if and only if a shipped layout reads it.** A `replace`-mode theme drops its parent and keeps only what the contract names, so the contract must name exactly what the layouts use. Completing a scale for symmetry adds an obligation on every theme author for nothing.

| Group | Variables |
|---|---|
| Colours | `--color-bg-primary/secondary/tertiary`, `--color-text-primary/secondary/muted`, `--color-border-default/light`, `--color-brand-primary/secondary`, `--color-success/warning/error/info` |
| Issue status | One per status in the fixed eight: `--status-open`, `--status-blocked`, `--status-in-progress`, `--status-input-needed`, `--status-review`, `--status-done`, `--status-dropped`, `--status-superseded` |
| Fonts | `--font-family-base/mono`, the required primitive sizes, `--line-height-base`, `--font-weight-normal` |
| Semantic UI text | `--ui-text-micro`, `--ui-text-body`, `--ui-text-title` |
| Semantic content text | `--content-body`, `--content-h1` … `--content-h6`, `--content-code` |
| Display text | `--display-sm`, `--display-md` (the theme also defines `--display-lg`, not on the contract). Only the home, countdown and hero surfaces |
| Elements | `--spacing-xs` … `--spacing-3xl`, `--border-radius-sm/md/lg/full`, `--shadow-sm` … `--shadow-xl`, `--transition-fast/normal` |
| Layout sizes | `--sidebar-width`, `--navbar-height`, `--outline-width`, `--max-width-primary/secondary` |

The authoritative list is `apps/agentks-engine/themes/default/theme.yaml`; the table is a map of it.

**Rules for every component** (unchanged):

- Read the semantic tokens (`--ui-text-*`, `--content-*`, `--display-*`), never the primitive `--font-size-*` scale, and never raw `rem` or `px` sizes.
- No hex codes, no invented variable names, no inline fallbacks that freeze a value.
- Three chrome text tiers are the whole palette. Emphasis comes from weight, colour and position, not a fourth size.
- `em` is allowed where a size is meant to follow the surrounding text, such as inline code in a heading.

**The contract check carries over, in two parts.** `apps/agentks-engine/themes/check-contract.ts` checks the built-in theme's files: every listed file exists, the theme declares every required variable, every variable it reads is declared, and each file sits in exactly one layer. It runs on bun, in the gate's test rung (`ctl test`). Today's check also compares the contract with what the layouts read, in both directions. In the new repository that part reads the component CSS of `agentks-ui` (claude, proposed: it becomes a test of that package, run on every change).

**The artifacts skill keeps its inline copy** of the variable names, so artifacts written in `site` theme mode have the token names. Any change to the contract updates that copy in the same change.

## 05 Where theme CSS comes from

| Part | Lives in | Loaded how |
|---|---|---|
| The built-in theme: colours, fonts, elements, reset, markdown, breakpoints, and the base CSS of navbar, footer, docs and blog | `apps/agentks-engine/themes/default/`, outside any crate, versioned with the engine | Embedded in the binary by the render crate's theme compiler, and compiled by Rust into the project's theme CSS |
| Component CSS of the layouts and islands | `agentks-ui`, beside each component | Bundled into the client build, and into the static build's output |
| The user's theme | The project, by default under `config/themes/<name>/` (claude, proposed; today `theme_paths` in `site.yaml`) | Compiled by Rust with the built-in theme, through `extends` and `override_mode` |

**How Rust compiles it**, as `apps/agentks-engine/themes/README.md` sets out for the compiler ([030/85](../../subtasks/030_rust-engine/85_theme-css-compiler.md)):

1. Read the active theme named in `site.yaml`, and follow its `extends` chain to the built-in theme.
2. Read only the files each theme lists in `files`, in order. `@import` is not followed.
3. Merge by `override_mode`, which has three values. `merge` (the default) takes the parent's files, then the child's. `override` takes the parent's files except any whose name the child also lists, then the child's. `replace` takes the child's files only.
4. Check the result against the contract. A missing required variable is an error naming the variable and the theme.
5. Wrap each file in its cascade layer (below).
6. Cache the result per project, keyed by the hashes of its source files and the engine version.
7. Serve it from one URL that carries the content hash, as today's `/theme.css` does, so a browser fetches it once and a change is a new URL. The static build writes the same file into its output.

**The cascade order.** The stylesheet starts with `@layer reset, theme, elements, components, user;`. The built-in `theme.yaml` carries a `layers` map that puts each of its files in a layer: `reset` (reset.css), `theme` (color, font, element and breakpoints) and `elements` (markdown, navbar, footer, docs and blogs). Component CSS from `agentks-ui` goes in `components`, and every file of a user theme goes in `user`. So a user's rule wins over a built-in or component rule of the same strength without `!important`.

`!important` works the other way round across layers: an `!important` declaration in an earlier layer beats one in a later layer. The built-in CSS has seven of them, six in markdown.css and one in navbar.css, and each beats a user's `!important` on the same property. No example theme uses `!important`.

**Dark mode** stays a `data-theme` attribute on the root, with each theme declaring `supports_dark_mode`. Code highlighting uses CSS classes from Rust's highlighter, so light and dark code colours come from the theme too.

## 06 Hooks: the public CSS contract

With no custom layouts, the markup a user can style is an API.

- Each layout exposes **stable hooks**: documented class names or `data-part` attributes on the parts a user may restyle (the sidebar, a sidebar item, the outline, the issue table, a status badge, the navbar brand, and so on).
- **`agentks theme css`** prints the compiled CSS of the installed version with the list of hooks and variables. `agentks theme tokens` prints the variable values, as today. `agentks theme eject` copies the CSS into the project's theme folder as a starting point ([the Rust CLI](../02_engine/05_rust-cli.md)).
- **A hook is renamed or removed only with a migration**, like a renamed frontmatter field, so a user's branding never breaks silently ([versioning and migrations](../05_delivery/03_versioning-and-migrations.md)).
- **The skill that teaches CSS overrides** tells the agent to read `agentks theme css` first, so it never relies on a copy that may be out of date.

## 07 UX standards, carried over

Every layout follows today's [UX standards](../../../../dev-docs/05_architecture/05_layout-internals/08_ux-standards.md):

| Standard | In short |
|---|---|
| Tooltips only when they add information | Text rows carry `data-tip` and show it only when cropped; icons and symbols carry `data-tip-always`. One shared script decides |
| Mark the exception, not the default | Markdown rows get no type icon; diagram and artifact pages get a small trailing glyph from one shared list |
| Colour belongs to status | Status colour only through the theme's status variables; nothing else is coloured for meaning |
| Hierarchy from weight and position | Not from font size |
| Glanceable status | Passive marks, readable at a glance |
| Keep `data-tip` and `aria-label` in step | When client code swaps a state, both change together |

The tooltip script and the glyph list become shared parts of `agentks-ui`.

## 08 Responsive layouts

Every layout works on a phone and a desktop. The breakpoints and mobile layouts from [2025-06-25-sizing-and-responsive](../../../2025-06-25-sizing-and-responsive/issue.md) become acceptance checks for the layouts. Responsive images (`srcset`) are the Rust asset pipeline's job.

## 09 Later: the GitHub issues layout

A built-in layout that shows the issues of a linked GitHub repository. The project names the repository by URL in config; agentks signs in to GitHub once per machine and keeps the token under `~/.agentks/`.

- **The token never reaches a browser or a built site.** Locally, the Rust server calls GitHub and sends the results to the page. A published site gets a snapshot taken at build time, and only for a public repository or a private site.
- Whether it reuses the tracker's issue UI or stays a plain list, whether it is read-only, and whether several repositories are allowed, are that stage's questions ([the GitHub issues layout](../../brainstorm/02_future-stages/06_github-issues-layout.md)).

## 10 Open

- Whether the structure, layout, theme and shell model from the Go issue is adopted (open question 08).
- Where user themes live by default (section 05).

Both are tracked in [open questions and risks](../01_overview/05_open-questions-and-risks.md).
