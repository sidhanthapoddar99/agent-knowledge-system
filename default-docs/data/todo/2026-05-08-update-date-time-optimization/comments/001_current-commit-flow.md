---
author: claude
date: 2026-05-07
---

## What happens when you `git commit` (current behaviour, full-rebuild path)

```
1. you type git commit
   ↓
2. git writes the commit object + bumps .git/refs/heads/main
   to point at the new SHA
   ↓
3. chokidar (file watcher inside the dev server) sees that
   .git/refs/heads/main file just changed
   ↓
4. our listener runs:
       cache.delete(tracker)        ← drop the issue-dates cache
       invalidateIssuesCache()      ← drop the issues content cache
   that's it. no git is run yet. ~1 ms work.
   ↓
5. you (or the SSR pipeline) loads /todo at some point
   ↓
6. the loader asks getIssueDate(tracker, "2026-04-10-issues-layout")
       cache is empty → ensureFresh() runs the full walk:

       git log --no-merges --name-only \
               --pretty=format:'§%aI' \
               -- default-docs/data/todo
   ↓
7. git emits, for every commit that touched any path under
   default-docs/data/todo, the timestamp + the file paths it changed
   ↓
8. we walk that output once and remember the most recent
   commit per issue folder. cache is populated. answer returned.
```

## Scope — what counts as "touching" an issue

```
default-docs/data/todo/
│
├── settings.json                      ❌ tracker-root file, IGNORED
├── views.json                         ❌ tracker-root file, IGNORED
│
├── 2026-04-10-issues-layout/          ┐
│   ├── settings.json                  │
│   ├── issue.md                       │  ✅ ALL files in here count
│   ├── subtasks/05_foo.md             │     toward this issue's
│   ├── notes/02_design.md             │     "updated" timestamp
│   ├── notes/design/phase-1/x.md      │     (any depth, any file type)
│   ├── agent-log/001_xyz.md           │
│   └── comments/003_bar.md            ┘
│
└── 2026-05-08-something-else/         ┐  ✅ same rule, isolated
    └── ...                            ┘     to this issue's slug
```

So:
- **Inside an issue folder** → that commit counts toward that issue's `updated`
- **Tracker root** → ignored (doesn't have a `YYYY-MM-DD-slug` pattern, slug-extractor returns null)
- **Anywhere else in the repo** (e.g. `astro-doc-code/src/...`) → never reaches us, git's pathspec `-- default-docs/data/todo` filters before output

## What does NOT trigger anything

- **Editing files without committing.** No git ref changes → chokidar silent → no invalidation. The cache keeps showing the previous commit's timestamp until you actually commit.
- **Commits to branches you're not on.** chokidar only watches `.git/HEAD` and `.git/refs/heads/<active-branch>`. A commit on another branch (via `git fetch`, etc.) doesn't fire.
- **Switching to a branch and back.** The watcher fires twice (HEAD changes both times); cache rebuilds twice. Always correct, just two rebuilds.

## Per-commit, per-issue: who gets touched

If your commit changes 3 files across 2 issues:

```
commit abc1234  Tue 14:32:11
├── default-docs/data/todo/2026-04-10-issues-layout/issue.md
├── default-docs/data/todo/2026-04-10-issues-layout/subtasks/05.md
└── default-docs/data/todo/2026-05-08-foo/notes/01.md
```

After the rebuild:
- `2026-04-10-issues-layout` → `updated = 2026-XX-XXT14:32:11+TZ` (commit `abc1234`)
- `2026-05-08-foo` → `updated = 2026-XX-XXT14:32:11+TZ` (same commit)
- All other issues → unchanged (their previous commit's timestamps)

## Cost

For this repo today:
- 12 tracker-touching commits → walk takes ~11 ms cold. Imperceptible.

For the asked scaling target (500 issues, 1 000 commits, 230 touching):
- ~500 ms per rebuild on the request path. Starts to feel laggy.

The cost is paid by **whichever request happens to be the first reader after a commit**. That's the source of perceived lag and the reason this issue exists. The next comment shows what changes once subtask 03 (incremental refresh) lands.
