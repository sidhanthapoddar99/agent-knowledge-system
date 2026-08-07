---
title: "The git-ref watcher does not fire on a commit"
status: open
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
- `astro-doc-code/src/dev-tools/integration.ts` — the watcher, and the reach-in
  inside its handler
- `astro-doc-code/src/loaders/issue-dates.ts` — what the invalidation clears

# Todo list

- [ ] Reproduce with a control: run the same test on Astro 5 and Astro 7, and
      compare. Without the control this is an observation, not a regression
- [ ] Find out whether Vite 8 still watches paths outside the project root.
      `.git/` sits above `astro-doc-code/`, and watchers commonly ignore it
- [ ] If broken, fix it — and decide whether the fix belongs in the watcher or in
      dropping lazy invalidation for a cheap freshness check on read
- [ ] **Then** settle the `moduleGraph` question below

# Outcomes and Next Steps

> [!IMPORTANT]
> **PLACEHOLDER** — filled at completion / hand-off.

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
