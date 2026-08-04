---
title: "Opened 2026-08-04 — both interim fixes reverted, the class moves here"
---

Opened on Sid's instruction after two attempts at the trailing-slash problem were
tried and reverted in two days. The deciding constraint: **the engine has to work
in `./start dev`**, because that is where this project is actually used, and both
attempts traded dev correctness for production correctness.

Reverted in the tree, not deleted from the record:

- the `DEPTH_SHIFT` constant and the `../` shift, out of `internal-links.ts`
- `trailingSlash: 'always'`, out of `astro.config.mjs` — which also turned out to
  404 the entire `/artifacts/<file>.html` route, whose URLs cannot take a slash

Absorbed from elsewhere:

- [the issue-link-resolution issue](../../2026-06-09-issue-link-resolution/issue.md)
  closed; its render-time-absolute decision is this issue's premise, and its
  Comprehensive-panel subtask moved here
- `070`, `180` and `190` of the
  [link-integrity group](../../2026-08-02-refactor-efficiency-and-planning/subtasks/100_link-integrity/00_overview.md)
  closed there, their live work continuing here
- `160`, on `base_url` versus folder name, moved here outright

**No fix is in the tree.** The renderer emits the author's relative shape, which
is correct for dev and wrong for a static host — a deliberate choice of which
column to be right in, recorded in
[the trailing-slash matrix](../notes/10_the-trailing-slash-matrix.html).
