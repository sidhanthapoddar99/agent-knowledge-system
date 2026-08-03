---
title: "A plan's files have no URLs of their own — any file under a plan should resolve to the plan"
status: open
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

- [ ] Redirect `plans/<plan>/<anything>` → `plans/<plan>`, in both
      `route-match.ts` and `static-paths.ts`
- [ ] **Open question — should a stage deep-link instead?** The plan page already
      renders every stage inline, so `plans/<plan>/20_fix-the-renderer` could
      redirect to `plans/<plan>#20-fix-the-renderer` and land on the right
      section rather than the top. Strictly better if the anchor ids are stable;
      needs checking against how the plan page builds its headings
- [ ] Check the same collapse for any **other** section that renders a folder as
      one page — the fix should be a rule about collapsed folders, not a
      special case for `plans/`
- [ ] Control-test: the link in
      [`110 the live check`](../../2026-08-02-refactor-efficiency-and-planning/subtasks/100_link-integrity/110_live-check.md)
      (row 8) is the exact repro and must go from 404 to the plan page

# References

- The identical bug, already fixed, for `issue.md`:
  [`01 redirect issue to detail root`](./01_redirect-issue-to-detail-root.md) —
  reuse its mechanism, including the `redirectTo` prop
- Where it was found: [`110 the live check`](../../2026-08-02-refactor-efficiency-and-planning/subtasks/100_link-integrity/110_live-check.md), row 8
- The sibling routing case: [`05 dual-slug URL resolution`](./05_dual-slug-url-resolution.md)
