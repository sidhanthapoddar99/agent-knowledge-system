---
title: "Resolved historical bugs"
state: closed
---

Bugs from the old `data/docs/todo/02_backlog/01_bugs.md` tracker, already fixed.

## Outline not appearing

- **Description:** TOC / outline wasn't rendering.
- **Resolution:** Headings now extracted during parsing and cached.
- **Fixed:** 2026-02-01

## Sidebar wrong URLs after delete

- **Description:** Sidebar pointed to `/docs` instead of the configured `base_url`.
- **Resolution:** Always pass `baseUrl` to layout props.
- **Fixed:** 2026-02-02
