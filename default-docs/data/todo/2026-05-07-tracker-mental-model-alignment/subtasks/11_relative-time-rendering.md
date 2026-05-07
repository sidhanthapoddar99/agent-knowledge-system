---
title: "Relative-time rendering for the `updated` column"
state: closed
done: true
---

The `updated` value coming out of `getIssueDate()` is a full ISO 8601 timestamp with timezone (e.g. `2026-05-07T22:00:57+05:30`). Today's layouts strip the time portion via `formatDate(issue.updated)` ("May 7 2026") or `issue.updated.slice(0, 10)` ("2026-05-07"). Replace that with relative-time formatting, with a fall-through to full date+time for older entries.

## Format

| Age (now − updated) | Display |
|---|---|
| < 1 minute | `n sec ago` |
| < 1 hour | `n min ago` |
| < 1 day | `n hours ago` |
| < 7 days | `n days ago` |
| ≥ 7 days | `MMM D, YYYY HH:mm` (full date + time) |

Singulars handled gracefully — `1 hour ago`, `1 day ago` (no "1 hours ago"). Sub-second / negative deltas (clock skew) clamp to `0 sec ago`.

## Implementation

- [x] **Add a shared helper** `formatRelativeTime(iso: string): { rel: string, full: string }` in `astro-doc-code/src/layouts/issues/default/server/helpers.ts`. Returns `{ rel: "3 hours ago", full: "May 7, 2026 22:00" }` so the call site can put the full timestamp in a `title=` attribute for tooltip.
- [x] **Update `IssuesTable.astro`** — replace `{formatDate(issue.updated)}` at line ~140 with `<time datetime={issue.updated} title={full}>{rel}</time>`. Keep the `data-updated={issue.updated}` data-attribute (the client uses it for sort).
- [x] **Update `IssueCard.astro`** — replace `issue.updated.slice(0, 10)` at line ~29.
- [x] **Update `MetaPanel.astro`** — replace `formatDate(issue.updated)` at line ~55 (Updated cell). Keep `formatDate(issue.created)` since `created` is a date-only slug.
- [x] **Use semantic `<time>` element** in all three sites with `datetime={iso}` and `title={full}` so screen readers and hover tooltips both work.
- [x] **Server-side render only** for now. Relative-time goes stale if the user keeps the page open for hours, but that's polish — the page reloads on navigation. A client-side updater can be added later if needed.
- [x] **Test**: render `/todo` and a detail page; confirm relative-time shows for fresh issues; confirm `> 7 days` falls through to date+time. Build passes.

## Why server-side only (for now)

Three reasons:

1. Astro is SSR-first; markup is final at render time. Computing relative-time on the server is simpler.
2. Pages are short-lived in practice — navigation triggers re-render, which gives fresh values.
3. A client-side updater that keeps the relative-time live (e.g. ticking every 30 s) is a small follow-up. Adding it later doesn't require any change to the server-side helper — just a `<script>` that reads `time[datetime]` and recomputes.

## Files likely touched

- `astro-doc-code/src/layouts/issues/default/server/helpers.ts` — add helper.
- `astro-doc-code/src/layouts/issues/default/parts/index/IssuesTable.astro` — table view.
- `astro-doc-code/src/layouts/issues/default/parts/shared/IssueCard.astro` — card view.
- `astro-doc-code/src/layouts/issues/default/parts/shared/MetaPanel.astro` — detail meta.

## Out of scope

- Created-date relative formatting. `created` is a date-only slug (no time); leaving as-is.
- Client-side live ticking. Follow-up if needed.
- Locale-aware pluralisation / i18n. Plain English strings for now.

**Landed.** `formatRelativeTime(iso)` helper added to `astro-doc-code/src/layouts/issues/default/server/helpers.ts` returning `{ rel, full }`. Wired into `IssuesTable.astro` (line 140), `IssueCard.astro` (line 30), `MetaPanel.astro` (line 57). All three sites now render `<time datetime={iso} title={full}>{rel}</time>`. Singulars handled (`1 hour ago`, `1 day ago`); negative-delta clock-skew clamps to `0 sec ago`; ≥7 days falls through to `MMM D, YYYY HH:mm`. Build passes (387 pages); validator clean.
