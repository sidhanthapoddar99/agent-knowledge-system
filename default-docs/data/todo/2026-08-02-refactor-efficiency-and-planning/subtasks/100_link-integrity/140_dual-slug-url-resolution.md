---
title: "Dual-slug URL resolution — found here, fixed on 2026-06-09-issue-link-resolution"
status: done
---

# Overview

**Not work for this issue.** A link leaving the tracker into docs or blog keeps
the source spelling and 404s, because the target section's slug transform is
never applied. Found here, in [`110 the live check`](./110_live-check.md) rows 12
and 13:

| URL | Title served |
|---|---|
| `/user-guide/19_issues/01_overview` | **`Page Not Found`** |
| `/user-guide/issues/overview` | `Issues Overview` |
| `/blog/2024-01-15-hello-world` | **`Page Not Found`** |
| `/blog/hello-world` | `Hello World` |

**It lives on [`2026-06-09-issue-link-resolution` → `05 dual-slug URL
resolution`](../../../2026-06-09-issue-link-resolution/subtasks/05_dual-slug-url-resolution.md)**,
which is where URL resolution already lives — that issue owns `route-match.ts`
and `static-paths.ts`, and already shipped the identical redirect mechanism for
`/…/<issue>/issue`. Splitting routing across two issues would be the worse
outcome.

Sid's decision, 2026-08-03: *"blogs and docs also accepts both types of url
slugs and resolve it automatically."*

**Carried across with it:** a missing page answers HTTP `200` with a *Page Not
Found* body, so a status-code check reports dead links as healthy. That blocks
testing anything in this area.

# Outcomes and Next Steps

**Closed 2026-08-03 — and the work it points at shipped the same day.**
Both spellings now resolve, the source form 302s to the clean slug, and a
missing page answers 404 instead of 200. Track it on
[`05`](../../../2026-06-09-issue-link-resolution/subtasks/05_dual-slug-url-resolution.md).
This file exists so that someone reading the link-integrity group finds where the
defect went, rather than concluding it was forgotten.
