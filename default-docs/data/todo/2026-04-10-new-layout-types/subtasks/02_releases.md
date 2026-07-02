---
title: "Releases layout type"
status: open
---

A backward-looking changelog — what shipped, when, and what was in it.

## Tasks

- [ ] Folder-per-release data model: `YYYY-MM-DD-vX.Y.Z/` with `settings.json` + `release.md`
- [ ] `settings.json` fields: version, date, summary, tags, included issue ids
- [ ] Loader (`src/loaders/releases.ts`) — mtime-cached
- [ ] Layout entry: `@releases/default`
- [ ] Index page — newest-first, version + date + summary, filter by tag
- [ ] Detail page — full changelog body, list of included issues with deep links
- [ ] Auto-link issue ids to `/todo/<id>` (or whatever the issues base_url is)
- [ ] RSS / Atom feed for releases
- [ ] Register in `src/pages/[...slug].astro` and `src/loaders/alias.ts`
