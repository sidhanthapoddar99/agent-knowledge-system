---
title: "The git-ref watcher does not fire on a commit"
status: review
---

# Overview

The dev server watches `.git/HEAD` and the active branch ref so that an issue's
derived `updated` date refreshes when you commit. **It registered the paths and
then stayed silent through a real commit.**

If that is right, `updated` dates go stale in dev until you restart the server.

**Not confirmed as an Astro 7 regression.** The same watcher could not be made to
fire on Astro 5 either, so there is no control. Getting one is the first job here.

Done when: the watcher demonstrably fires on a commit, or is demonstrated broken
and fixed, and the finding is written down either way.

# References

- [stage 40 of the implementation plan](../../plans/01_implementation/40_the-upgrade.md)
  — where this was found, and where it currently blocks another question
- [stage 30](../../plans/01_implementation/30_de-risk-the-upgrade.md) — the cache
  work that removed the reason the `moduleGraph` reach-in exists
- `astro-doc-code/src/dev-tools/server/git-ref-watcher.ts` — the watcher, and the
  two reasons it exists separately from Vite's
- `astro-doc-code/src/dev-tools/integration.ts` — where it is wired, and the
  `moduleGraph` reach-in inside its handler
- `astro-doc-code/src/loaders/issue-dates.ts` — what the invalidation clears

# Todo list

- [x] **Reproduce with a control** — the control turned out to be unnecessary and
      the question wrong. It was never a regression. See below.
- [x] **Find out whether the watcher sees paths outside the project root** — the
      second guess in this list was right, and it is not about the project root.
      **Vite ignores `**/.git/**` unconditionally.**
- [x] **Fix it** — in the watcher, not by dropping lazy invalidation. A separate
      watcher that Vite's ignore list cannot reach.
- [ ] ➡️ **Settle the `moduleGraph` question** — now unblocked, deliberately not
      done here. See Next Steps.

# Outcomes and Next Steps

**Fixed.** A commit now invalidates the derived `updated` cache in a running dev
server, with no restart.

## The cause — one line in Vite, and it was never an Astro 7 regression

`vite/dist/node` builds its chokidar options like this, before any user config is
merged:

```js
function resolveChokidarOptions(options, resolvedOutDirs, emptyOutDir, cacheDir) {
  const { ignored: ignoredList, ...otherOptions } = options ?? {};
  const ignored = [
    "**/.git/**",          // ← here
    "**/node_modules/**",
    ...
```

So `server.watcher.add('<repo>/.git/HEAD')` registers the path and the matcher
then discards every event for it. **That is the exact symptom recorded here:
armed, logged, silent** — the boot lines printed because *we* printed them, not
because the watcher accepted anything.

It also explains the part that looked strangest. The subtask says a `touch` did
not fire it *on either version*, and treats the missing Astro 5 control as the
first job. **No control was needed.** This list has shipped in Vite for years, so
Astro 5 was equally broken; the upgrade changed nothing here. The reproduction was
correct and the diagnosis "possible Astro 7 regression" was wrong.

## The fix — a watcher of our own, on directories

`astro-doc-code/src/dev-tools/server/git-ref-watcher.ts`. Two decisions in it, both
non-obvious enough to be written into the file:

**It does not use Vite's watcher at all.** The alternative was to un-ignore `.git`
through `server.watch.ignored`, which would make Vite walk thousands of object
files to gain two, and would break again the day Vite reshuffles that list. An
independent `fs.watch` costs two descriptors and cannot be silently overruled.

**It watches directories, not the ref files.** This is the part that would have
made a naive fix fail its own test. Git never writes a ref in place: it writes
`<ref>.lock` and renames it over the target, so the inode is replaced. `fs.watch`
on a file path follows the inode, so a file-level watch survives exactly zero
commits. Watching the containing directory sees the rename.

It watches `<repo>/.git` (for `HEAD`, branch switches, `packed-refs`) and the
directory holding the active branch ref — derived rather than assumed to be
`.git/refs/heads`, because a branch called `feature/x` nests. After each event it
re-resolves the set, so a branch switch re-points the watch without a restart.
Events are coalesced over 60 ms, since a single commit touches the lock, the ref
and sometimes `HEAD` within milliseconds.

## Verified end to end, on the same protocol that reproduced it

```
  BEFORE FIX  touch .git/HEAD + branch ref   → "git ref changed" lines: 0
  AFTER FIX   real commit lands              → "git ref changed" fires
              served updated  2026-08-08T00:44:56  →  <commit time>
              git updated     matches, no restart
```

Both watch directories register at boot:

```
  [git-refs] watching …/agent-knowledge-system/.git
  [git-refs] watching …/agent-knowledge-system/.git/refs/heads
```

## Next steps

- ➡️ **The `moduleGraph` reach-in is now observable and can be settled.** That was
  the whole reason this blocked it: 25 lines you cannot watch run are not safe to
  delete. They now run on every commit and log when they fire. **Left in place
  deliberately** — deleting it belongs with
  [the updated-date issue](../../../2026-05-08-update-date-time-optimization/issue.md),
  which owns that decision and can now test it. Removing it in the same change
  that made it testable would have thrown away the test.
- The lazy-invalidation trade in `issue-dates.ts` stands unchanged. The warning in
  this subtask was right and the fix respected it: the hot path is still a
  `Map.get()`, not a `git rev-parse` per read.

# Details

## Reproduced end to end — this is a live user-visible bug, not just a silent log

Confirmed on Astro 7.2.0 against a running dev server, 2026-08-07:

```
  before the commit    server: 2026-08-02T23:51:24   git: 2026-08-02T23:51:24   agree
  commit lands         git:    2026-08-07T14:39:31
  after the commit     server: 2026-08-02T23:51:24   STALE, 4 days behind
  after a restart      server: 2026-08-07T14:39:31   correct
```

**This is exactly the symptom
[the updated-date issue](../../../2026-05-08-update-date-time-optimization/issue.md)
was opened for**, and its note describes the same behaviour on 2026-05-08. The
`moduleGraph` workaround added then does not prevent it, because the handler
containing that workaround never runs.

The log showed no `git ref changed`, no `SSR module invalidated`, and no
`no SSR modules in graph yet`. None of the three messages the handler can print
appeared.

The paths **are** registered — the boot log shows them:

```
[HMR] Watching git ref: …/.git/HEAD
[HMR] Watching git ref: …/.git/refs/heads/go-astro7-migration
```

So the watcher is armed and does not fire. A `touch` on the ref file did not
trigger it either, on either version.

## Why this blocks the `moduleGraph` question

`integration.ts` reaches into `server.moduleGraph` to force the loader modules to
re-instantiate. [Stage 30](../../plans/01_implementation/30_de-risk-the-upgrade.md)
removed the reason that exists — the caches are shared now, so clearing from the
plugin context reaches the request path.

**But the reach-in only ever runs inside this handler.** While the handler never
fires, its behaviour is unobservable, and deleting 25 lines of code you cannot
watch run is not a safe cleanup. Settle the watcher first.

## Do not "fix" this by removing lazy invalidation without measuring

The current design trades a `git rev-parse` per read for a watcher-driven cache
clear, and that trade is documented in `issue-dates.ts` as deliberate. If the
watcher turns out to be unfixable, re-check the cost of the simple approach before
adopting it — the loader's hot path is the reason the watcher exists at all.
