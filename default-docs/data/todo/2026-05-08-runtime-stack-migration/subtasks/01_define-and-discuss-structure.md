---
title: "Define & discuss the structure / layout / theme / shell separation"
state: open
---

First design task of the migration's **architecture update**: formalize the
structure / layout / theme / overall-layout (shell) separation **before** any Go
runtime code is written. This is design + decision work, not implementation — the
current Astro code is intentionally left as-is (we migrate, not refactor).

**Read first:** `notes/architecture-update/01_the-structure.md` — the captured
model, the smell that motivated it, and the four-axis table. This subtask pins that
model down into concrete interfaces and decisions.

## Scope

- [ ] Lock the four-axis model (**structure / layout / theme / shell**) and the
      terminology rename.
- [ ] Specify the **structure registry** interface (`matchUrl`, `enumerate`,
      `load → normalized model`, `parser`, `dataShape`) that replaces the two
      centralized URL switches (`route-match` + `static-paths`).
- [ ] Specify the **layout ↔ structure compatibility** config — the YAML/JSON a
      layout ships declaring which structure it inherits + the data-shape mapping;
      define load-time validation.
- [ ] Draw the **common vs structure-specific** boundary (`structure/common/` vs
      `structure/<type>/`): what markdown-internal processing is shared, what each
      structure owns.
- [ ] Decide **theme** as an independent axis — per-structure-resolvable, globally
      swappable, decoupled from layout.
- [ ] Define the **overall-layout / shell** contract — navbar/footer placement
      modes (sidebar vs top-bar, auto-hide), `section` + `page-content`.
- [ ] **Migration compatibility:** how existing `default-docs/` folder conventions
      map onto structures so current content keeps working.

## Output

A design doc (or a set of notes under `architecture-update/`) with the interfaces +
a phased plan. **No runtime code** in this subtask — it feeds the Go build that
comes later.

Related: the per-structure-pipeline approach is already validated in the current
code — see the issues-only `issue-body-links` postprocessor and the
`2026-05-07-sidebar-state-persistence` link bug that exposed the centralized-URL
smell.
