---
title: "Plumb derived `updated` + `created` through `loaders/issues.ts`"
---

- [ ] Issue loader output gains two date fields side-by-side: `created` (parsed from the folder slug `YYYY-MM-DD-<slug>`) and `updated` (from `getIssueDate()` cache).
- [ ] When the cache returns null (no git history for the issue, or not a git repo), fall back to `updated = created`. Same shape, no `null` leaking to consumers.
- [ ] Stop reading `updated` from `settings.json` in this loader. The cache is now the only source.
- [ ] Update the issue type definition (`Issue` interface or wherever `loaders/issues.ts` exports its shape) so consumers see both fields explicitly typed.
- [ ] Test: an issue with `settings.json → updated: "2026-04-10"` but git activity through 2026-05-04 surfaces `updated = "2026-05-04T..."` (cache wins; settings.json field ignored).

## Files likely touched

- `astro-doc-code/src/loaders/issues.ts` — call `getIssueDate()`, parse slug for `created`, drop the `settings.json` read for `updated`.
- Wherever the `Issue` type / interface is declared (search for `interface Issue` under `src/`).
