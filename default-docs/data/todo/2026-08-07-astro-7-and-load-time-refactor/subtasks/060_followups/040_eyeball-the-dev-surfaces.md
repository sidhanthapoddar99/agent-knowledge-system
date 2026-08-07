---
title: "Look at the dev surfaces on a real screen"
status: open
---

# Overview

Everything in this issue was verified by request and by build. **Nothing was
verified by looking at it.** Three surfaces were changed or are exposed by the
upgrade, and each needs a person at a screen — no measurement settles them.

Done when each item below is confirmed working or filed as a defect.

# References

- [stage 40](../../plans/01_implementation/40_the-upgrade.md) — what was verified
  by request, and what was explicitly not
- [theme CSS delivery](../010_load-time/020_theme-css-delivery.md) — the change
  behind items 1 and 2

# Todo list

- [ ] **Does a cold cache flash?** Open a page with the cache cleared and dark mode
      on. The stylesheet is now a `<link>`, not inline
- [ ] **The editor overlay is still themed.** It used to copy CSS text out of an
      inline `<style>`; that element is a `<link>` now
- [ ] **All six toolbar apps open and work** — layout selector, error logger,
      system metrics, cache inspector, browser cache, editor
- [ ] **Live theme and layout switching still work** from the toolbar
- [ ] Dark mode on task-checkbox borders — a known defect from the audit, and a
      chance to confirm it is still there before
      [stage 50](../../plans/01_implementation/50_correctness-sweep.md) fixes it

# Outcomes and Next Steps

> [!IMPORTANT]
> **PLACEHOLDER** — filled at completion / hand-off.

# Details

## Why these cannot be signed off from here

A stylesheet in `<head>` blocks the first paint, so **structurally** there is
nothing to flash. That is an argument, not an observation, and the failure mode it
would miss is exactly the one worth catching: a moment of unstyled text on a slow
first load.

The same applies to the toolbar. Its server side is proven — every route answers,
the middleware and sockets register, and dev theme switching returns different CSS
with a different content hash. **None of that shows an app opening.**

## What was already checked, so you do not redo it

| Checked by request | Result |
|---|---|
| `/api/dev/themes`, `/api/dev/layouts`, `/api/dev/errors` | 200 |
| `/editor` | 200, renders |
| yjs socket, editor middleware, presence cleanup | all register at boot |
| Theme switch via the dev cookie | serves different CSS, different hash |

## One specific thing to watch

The editor overlay now injects `<link rel="stylesheet" href="/theme.css?…">`
instead of a copied `<style>` block. The URL comes from `data-theme-css` on
`<html>`, with two fallbacks. If the overlay renders unstyled, that chain is where
to look — and it will be obvious rather than subtle.
