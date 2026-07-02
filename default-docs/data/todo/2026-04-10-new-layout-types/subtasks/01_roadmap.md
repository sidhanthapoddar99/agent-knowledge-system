---
title: "Roadmap layout type"
status: open
---

A forward-looking, public-facing view of planned and in-flight work.

## Tasks

- [ ] Decide data source — read from existing `issues` data (filtered by milestone) or a separate `roadmap/` folder
- [ ] Layout entry: `@roadmap/default`
- [ ] Loader (`src/loaders/roadmap.ts`) — surface only non-cancelled, non-archived items
- [ ] Index page — group by milestone, then by status; lane / timeline rendering
- [ ] Per-item detail page (or link back to the source issue if reading from `issues`)
- [ ] Filter by component / label
- [ ] Hide internal-only items (respect `draft: true`)
- [ ] Register in `src/pages/[...slug].astro` and `src/loaders/alias.ts`
