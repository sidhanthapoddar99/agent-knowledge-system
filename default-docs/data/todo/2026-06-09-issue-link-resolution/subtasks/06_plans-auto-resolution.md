---
title: "Any file under a plan resolves to the plan — overview.md included"
status: done
---

**Decision (2026-08-03, Sid):** *"plans section auto resolution to the overview
file or any other file leads to the plan itself."*

# Overview

**A plan folder collapses into a single page, so every file inside it is a real
file with no route.** A link to `overview.md` — the file that *is* the plan's
body — is a 404.

Measured on the dev server, 2026-08-03:

```
404  /todo/2026-08-02-refactor-efficiency-and-planning/plans/01_fix-the-tools-then-the-links/overview
200  /todo/2026-08-02-refactor-efficiency-and-planning/plans/01_fix-the-tools-then-the-links
```

This is the same shape as the `issue.md` collapse already fixed on this issue by
subtask [`01`](./01_redirect-issue-to-detail-root.md): a file whose content is
rendered one segment shallower than the file sits on disk. The fix there was a
redirect, and the same answer applies here.

**Done when** any file path under a plan folder resolves to the plan's page,
rather than 404ing.

# Why the link is not the thing to fix

The author wrote `../../plans/01_fix-the-tools-then-the-links/overview.md`. That
is the **correct path to a real file**. Under the project's filesystem-first
principle the content is right and the router is wrong — asking authors to
instead link at the folder means asking them to know that plans collapse, which
is app knowledge leaking into the document.

It also matters for the stage files. A plan's stages (`10_…md`, `20_…md`) are
separate files a reader will legitimately want to link at, and none of them has a
URL either. Resolving them all to the plan page is at least correct, and better
than a 404 — though see the open question below.

# Todo list

- [x] `plans/<plan>/<anything>` → `plans/<plan>`, in both `route-match.ts` and
      `static-paths.ts`
- [x] **The open question was already answered in the code.** A stage *does*
      deep-link — `planStageAliasTarget` has redirected `plans/<plan>/<stage>`
      to `plans/<plan>#<anchor>` since this issue's earlier work. Nothing to
      decide; the gap was only the files that are **not** stages
- [x] Control-tested against row 8 of
      [`110 the live check`](../../2026-08-02-refactor-efficiency-and-planning/subtasks/100_link-integrity/110_live-check.md)
      — the exact repro
- [ ] The same collapse in any **other** section that renders a folder as one
      page. None exists today; worth revisiting when one is added, so the rule
      is about collapsed folders rather than a special case for `plans/`

# Outcomes and Next Steps

**Shipped 2026-08-03, and it was four lines.**

| URL | Before | After |
|---|---|---|
| `…/plans/01_fix-the-tools-then-the-links/overview` | **`404`** | `302` → the plan page |
| `…/plans/01_fix-the-tools-then-the-links/20_fix-the-renderer` | `302` → the stage anchor | unchanged |
| `…/plans/01_fix-the-tools-then-the-links` | `200` | unchanged |

Verified on the dev server and in `dist/` after a clean build (1,168 pages, 3
plan-overview alias pages emitted).

### Why it was so small — the mechanism already existed

`planStageAliasTarget` in `route-match.ts` already turned a stage file's path
into a redirect at the plan's anchor, with a comment explaining exactly the
reasoning this subtask re-derived: *"a stage is a FILE, and a relative markdown
link to a file resolves to its path-shaped URL… dropping the route outright
would turn every such link into a 404 that no gate reads."*

It returned `null` for anything that was not a stage, so `overview.md` — the
plan's own body, and the most obvious file to link at — fell through to a 404.
**The right principle was already written down and applied one case too
narrowly.** The fix is to fall back to the plan page when the plan exists and
the file is not a stage.

**Worth noting for the class:** this is the third time on this issue that a file
rendered one segment shallower than it sits on disk has produced a 404 —
`issue.md`, plan stages, and now `overview.md`. Each was fixed as its own case.
A rule about collapsed folders would have covered all three at once.

# References

- The identical bug, already fixed, for `issue.md`:
  [`01 redirect issue to detail root`](./01_redirect-issue-to-detail-root.md) —
  reuse its mechanism, including the `redirectTo` prop
- Where it was found: [`110 the live check`](../../2026-08-02-refactor-efficiency-and-planning/subtasks/100_link-integrity/110_live-check.md), row 8
- The sibling routing case: [`05 dual-slug URL resolution`](./05_dual-slug-url-resolution.md)
