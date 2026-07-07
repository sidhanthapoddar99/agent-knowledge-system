---
title: "Dev-docs UX-standards page + tooltip.ts script page + CLAUDE.md pointer"
status: review
---

Capture the design rules behind these QoL patterns as a durable **UX standards** page in dev-docs — written as rules with the shipped features as examples, not a changelog of nice changes — and make `CLAUDE.md` point to it (the same pattern versioning uses with `30_versioning/`).

- [x] **UX standards page.** Best fit: `default-docs/data/dev-docs/05_architecture/05_layout-internals/` (after `07_sidebar-state-cache.md`) or a new issues-layout home under `10_layouts/` — pick during writing. Rules to codify: tooltips only when text is cropped (`data-tip` / `data-tip-always` contract); markdown is the default type and stays unmarked — icons mark only the exception; hierarchy from weight/color, never size; status meaning only through theme status variables (`--color-info` = in-progress, etc.); counts/dots as passive status (done/total, review dot).
- [x] **`tooltip.ts` script page.** `15_scripts/` documents each browser script but `tooltip.ts` is missing entirely — add `NN_tooltip.md` (mechanism: singleton `.ui-tooltip`, overflow detection, `data-tip-always`, cursor anchoring) and a row in `15_scripts/05_overview.md`'s script table.
- [x] **CLAUDE.md pointer.** One short paragraph/line in `CLAUDE.md` referencing the UX-standards page — pointer only, no inlined content.
- [x] **No legend duplication.** The status/type symbol *legend* lives in the Guide panel + user-guide (subtask `40_guide-legend.md`); this page explains *why*, not *what each icon is*.
