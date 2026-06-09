---
title: "Structure / Layout / Theme / Shell — the separation model"
---

# The structure / layout / theme / shell separation

> Captured 2026-06-09 from a design discussion. **Forward-looking** — this is the
> model to implement during the Go + Vite migration, **not** a refactor of the
> current Astro code. The current code does not draw these distinctions cleanly;
> we fix it when we rewrite, not before. See the first subtask for the design work
> this note seeds.

## Why this note exists — the smell

Concrete trigger: a one-line behavioural change scoped to **issues** (canonicalize
`/<tracker>/<issue>/issue` → `/<tracker>/<issue>`, plus re-root relative links in
`issue.md`) forced edits to **shared, centralized** files —
`pages/lib/route-match.ts` (SSR URL resolution) **and** `pages/lib/static-paths.ts`
(build-time URL enumeration) — both of which `switch (type)` and are kept in sync
by hand.

The asymmetry that exposes the smell:

- The **processing-pipeline** change felt clean — *because the parser is already
  per-type*. A structure-specific postprocessor (`issue-body-links`) dropped into
  the issues pipeline only, touching nothing else.
- The **URL** change felt wrong — *because URL rules are centralized, not owned by
  the structure*. One structure's behaviour lives in two shared switches.

Root cause: a single `type` (`docs | blog | issues | custom`) is **overloaded** to
mean folder-convention **+** parser **+** URL-scheme **+** which-layout; `theme` is
**global**; and navbar/footer are filed under `layouts/`. Four concerns, one word.
(Related smell that surfaced this: `2026-05-07-sidebar-state-persistence` link
resolution.)

## The model — four orthogonal axes

| # | Axis | Controls | Bound to |
|---|---|---|---|
| 1 | **Structure** | data-structure rules · parsing rules · URL rules + slugs · **owns the processing pipeline** | nothing — fully independent |
| 2 | **Layout** | what & how each page renders the content for a slug (the *content itself* is defined by the structure); selects the theme to display; extendable via an **external-layout** option | **a structure** — declares which it inherits |
| 3 | **Theme** | a module for standardization + brand consistency; applied **globally**, swappable | nothing |
| 4 | **Overall layout (shell)** | how navbar/footer/page are arranged — sidebar vs top-bar, auto-hide, etc. The shell is basically `[ section ][ page-content ]` | nothing — wraps every page |

**The compatibility rule (the crux):** a **layout declares the structure it
inherits** via a config (YAML/JSON it ships with). That declaration is the
contract — a layout may only render a structure whose **data shape** it
understands. This is what keeps "use a different look for this content" sane:

- A **theme** swap is *always* free (pure skin).
- A **layout** swap is valid *only* against a compatible structure (it must
  understand that structure's data shape).

### Worked example — roadmap

- *"Structure as docs + a roadmap **theme**"* → pure skin swap. Always fine.
- *"Roadmap needs milestones / dates / status fields docs don't have"* → that's a
  **new structure** (new data shape) with its own layout(s).

Splitting the request along these axes tells you which roadmap you actually mean.

## Everything is structurized: common + structure-specific

Each structure = a **common part** (shared markdown internals — callouts, code
highlighting, heading IDs, link rewriting — all structure-agnostic) **+** a
**structure-specific part** (folder rules, data validation, URL/slug rules, the
per-structure processing pipeline).

```
structure/
  common/**                  # shared: markdown pipeline, data-model primitives, cache
  docs/**
  blogs/**
  issues/
    processing-pipeline.go   # (or .ts) — per-structure pipeline
    validate-data.go         # folder / data-shape rules
    urls.go                  # url + slug rules — SELF-REGISTERED, not a central switch
    shape.go                 # the data-model contract layouts bind to
  roadmap/**                 # adding a structure = adding a folder; no central edits
```

**Self-registration replaces the centralized switch.** The router iterates
registered structures and delegates `matchUrl` / `enumerate` / `load`. Adding a
structure = drop in a module. The `/issue` redirect would have lived entirely in
`issues/urls`, in one place, instead of two synced files.

## What to resolve during the Go migration

(The open design work — see the first subtask.)

1. **Structure registry interface** — `matchUrl`, `enumerate(paths)`,
   `load → normalized model`, `parser`, `dataShape`. Replaces both URL switches.
2. **Layout ↔ structure compatibility config** — the YAML/JSON a layout ships
   declaring the structure(s) it inherits + how it maps the data shape; validated
   at load.
3. **Common vs structure-specific boundary** — pin down exactly what lives in
   `structure/common/` (shared markdown pipeline + model primitives + cache) vs
   each `structure/<type>/`.
4. **Theme as its own axis** — per-structure-resolvable, globally swappable;
   decoupled from layout.
5. **Overall layout (shell)** — lift navbar/footer out of "layout"; define the
   shell contract (`section` + `page-content`, nav placement / auto-hide modes).
6. **Migration compatibility** — existing `default-docs/` content keeps working;
   structures map onto the current folder conventions.
7. **Links resolve to absolute at render time — never browser-relative.** A
   structure's URL rules own the file-path → URL mapping; the renderer emits
   **root-absolute** links (`/tracker/<id>`), not `../`-relative ones. Relative
   links break whenever the same content is shown at a different URL depth than it
   was authored for (e.g. a sub-doc body embedded in the issues Comprehensive panel
   — see [2026-06-09-issue-link-resolution/subtasks/03](../../../2026-06-09-issue-link-resolution/subtasks/03_comprehensive-panel-subdoc-links.md)`). 
   
   Absolute links are
   position-independent, so this whole bug class disappears by construction.

## Terminology rename (carry into plugin + docs)

| Today | New | Why |
|---|---|---|
| "layout type" (`docs`/`blog`/`issues`) | **Structure** | it's data + parsing + URL, not looks |
| "layout style" (`default`/`compact`) | **Layout** | a view bound to a structure's shape |
| global `theme:` | **Theme** (per-structure-resolvable) | the freely-swappable skin |
| navbar/footer under `layouts/` | **Shell** / overall layout | the common wrapper, not a content layout |

## Cross-refs

- `../architecture/` — the Go-runtime / Vite design these axes slot into.
- `../claude-plugin-upgrade/` — plugin + skill terminology must follow this rename.
- `2026-05-07-sidebar-state-persistence` — the link-resolution bug that surfaced the
  centralized-URL smell.
