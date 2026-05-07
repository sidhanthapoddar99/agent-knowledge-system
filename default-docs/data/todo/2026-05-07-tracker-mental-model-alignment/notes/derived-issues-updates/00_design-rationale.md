---
title: "Derived issue update dates: design rationale"
sidebar_label: "Design rationale"
---

# Derived issue update dates — design rationale

## Goal

Stop maintaining `updated:` by hand in each issue's `settings.json`. Derive it from git instead.

The manual field rots — every issue in this very tracker has its `updated` field stuck at its creation date even after multiple subtasks have shipped. Honest signal beats a stale promise: walk git, take the most recent commit date that touched anything in the issue's folder, expose that as the issue's `updated`. Done.

## Why git-only (no mtime fallback)

Considered a hybrid (git for clean files, `mtime` for dirty ones). Rejected. The added complexity — per-render `git status` calls, dirty-file detection, dual-source confusion — buys very little: the only case it serves is "show today's date for an in-progress local edit before commit", which is fine to skip. The author can see their working changes from `git status` directly; the published date should reflect the version of record.

## Scope (issues only)

Just the issues content type. Docs and blog stay on manual frontmatter — content there changes infrequently enough that a forgotten `updated:` is acceptable, and historical posts (e.g. backdated drafts) need explicit author control. Issues are different: they're high-frequency, multi-file, and the manual field is a constant lie.

## Cache shape

In-memory, per-tracker:

```
{
  "default-docs/data/todo": {
    syncedAt: "<commit SHA when last refreshed>",
    issues: {
      "2026-04-10-issues-layout": "2026-05-04T18:21:36+05:30",
      "2026-05-07-sidebar-state-persistence": "2026-05-07T11:02:14+05:30",
      // ...
    }
  }
}
```

Per-issue value = `max()` of commit dates touching any file under the issue's folder. Stored as ISO 8601 (author date, `%aI`).

## Cache invalidation

On every render (or watcher trigger), compare `syncedAt` against current `HEAD`:

| State | Action |
|---|---|
| `syncedAt == HEAD` | No-op |
| `syncedAt` is ancestor of `HEAD` | Incremental: `git log <syncedAt>..HEAD --name-only --pretty=format:'§%aI' -- <tracker-path>`, patch affected entries |
| Else (rebase, branch switch, checkout backward) | Full rebuild |

One-line discriminator: `git merge-base --is-ancestor <syncedAt> HEAD` → 0 means incremental, anything else means rebuild.

Watcher: `.git/HEAD` (and `.git/refs/heads/<active-branch>` for HEAD-not-detached cases). On change, run the discriminator + appropriate path.

## Performance

For a tracker with 1000 issues × ~200 files each (= 200k files total) and ~100 of 1000 repo commits touching the tracker:

- Pathspec-scoped `git log --name-only -- <tracker-path>`: **< 2 s cold**, **~50 ms incremental**.
- Memory: ~100 KB for the per-issue map; ~30 MB if we ever expand to per-file.
- No per-render `git status`. No filesystem watcher beyond `.git/HEAD`.

## Issue payload changes

Every issue's loader output gains both dates side-by-side:

```ts
{
  id: "2026-04-10-issues-layout",
  created: "2026-04-10",                       // parsed from folder slug
  updated: "2026-05-04T18:21:36+05:30",        // from cache
  // ...everything else
}
```

Layouts (`IssuesTable`, `IssuesCards`, `DetailLayout`) consume `updated` directly. The `settings.json → updated` field is removed from the schema.

## Fallbacks

- **Never-committed issue** (folder exists in working tree but no commit yet touches it): `updated = created`. Honest — there's no recorded edit.
- **Not a git checkout** (`.git/` absent): every issue's `updated = created`. Framework still works; the date column just doesn't move. Acceptable for `git archive` exports and similar.

## Out of scope

- Per-file dates (e.g. "subtask 14 last edited 3 days ago" inside a detail view). The cache shape leaves room to add this later — it's the same git walk, just preserved at finer granularity. Not built now.
- Doc and blog dates. Stay manual.
- "Last edited by" (committer name) — interesting future signal, not this issue's concern.
- A persistent `.cache/` file. In-memory is enough; cold start is sub-2-second.

## Workstream breakdown

See sibling notes in this folder (`01_build-cache-loader.md` through `06_document-in-dev-docs.md`) for per-step implementation detail. The handoff anchor — the actual subtask the work attaches to — is [`../../subtasks/03_drop-updated-and-add-derived-cache.md`](../../subtasks/03_drop-updated-and-add-derived-cache.md).
