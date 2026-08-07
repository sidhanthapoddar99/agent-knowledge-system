---
title: "Look at the dev surfaces on a real screen"
status: done
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

- [x] **Does a cold cache flash?** No flash reported.
- [x] **The editor overlay is still themed.** Reported working.
- [x] **All six toolbar apps open and work.** Reported working.
- [x] **Live theme and layout switching still work.** Reported working.
- [x] Dark mode on task-checkbox borders — reported working after the stage 50 fix.
- [x] ❗ **Diagrams do not render** — the one failure, and it was not on this list.

# Outcomes and Next Steps

**Done by Sid, at a screen, which is the only way this one could be done.**
Everything on the list passed. **One thing not on the list failed**, and it was the
thing worth finding.

## What passed

All five items above, reported working: no cold-cache flash, the editor overlay
stays themed through the `<style>` → `<link>` change, all six toolbar apps open,
live theme and layout switching still work, and the task-checkbox borders read
correctly in dark mode after
[stage 50](../../plans/01_implementation/50_correctness-sweep.md).

## What failed, and why the list could not have caught it

**Mermaid, graphviz and excalidraw silently stopped rendering — in dev only.**
Sid's report came with the right question attached: *is this prod or dev?* It is
dev, and that distinction is what made it diagnosable in one pass rather than
several.

It is now
[060/060 diagrams stop rendering in dev](./060_dev-diagram-dep-cache.md): the container
never gains `.diagram-rendered` because Vite answers **504** on its pre-bundled dep
URLs, and `./start clean dev` clears it.

**This is the argument for the subtask.** Every checked box here was a change *this
issue made*, so the list could only ever contain things we already suspected. The
defect was in a surface nothing in the issue touched, it produces no error on the
page, and it survives a build — so no build gate, no route probe and no byte count
would have reached it. **It needed a person opening pages and noticing something
missing.**

**Next:** nothing here. The diagram defect is tracked at
[060](./060_dev-diagram-dep-cache.md), and its prevention at
[060/020](./020_start-wrapper-against-astro-7.md).

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
