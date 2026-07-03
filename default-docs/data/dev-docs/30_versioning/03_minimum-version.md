---
title: Minimum Version
description: The compatibility floor — breaking vs good-to-have changes, and when the floor moves
sidebar_position: 3
---

# Minimum Version — the compatibility floor

`MIN_CONTENT_VERSION` (in `src/loaders/engine-version.ts`) is the enforcement
arm of the whole contract, and it has exactly one meaning:

> **The oldest content version that still works, unmigrated, on this engine.**

Not "the newest migration available". Not "the engine version". The oldest one
that still *works*.

## Two classes of format change

Every engine release that changes the content format ships a migration script
(see [Migrations](./migrations)). Whether the floor moves depends on the class
of change:

| Class | Old content on the new engine | Floor |
|---|---|---|
| **Good-to-have** | Still loads and renders correctly; the migration just modernizes it | **Stays put** |
| **Breaking** | Fails, hard-errors, or silently misrenders without the migration | **Raised to the new version** |

- A **good-to-have** migration leaves older trees running. They migrate
  opportunistically — or get swept up automatically the next time a breaking
  change forces a chain run, because the chain executes *every* script in the
  range, including the optional ones that accumulated.
- A **breaking** change moves the floor so every older tree trips the gate and
  is walked through the migration before it can run again.

## Why the distinction matters

Get it wrong in either direction and the mechanism degrades:

- **Raising the floor for non-breaking changes** forces pointless migrations on
  every consumer at every update — the gate becomes noise, and users learn to
  resent (and eventually circumvent) it.
- **Forgetting to raise it for a breaking change** lets old content load
  unmigrated — silently wrong, with no error pointing anywhere. This is the
  exact failure the gate exists to prevent, reintroduced by omission.

## Release checklist (maintainers)

For any release touching the content format:

1. Bump `ENGINE_VERSION` (minor).
2. Ship `migration/<new-version>_<statement>.py` — the change does not exist
   until its script does.
3. Decide the class honestly: does *unmigrated* old content still render
   correctly on the new engine? If yes → floor stays. If no → raise
   `MIN_CONTENT_VERSION` to the new version.
4. Document: the script's docstring is the runbook; keep this section, the
   user-guide versioning page, and CLAUDE.md's contract paragraph accurate.

Releases that don't touch the content format at all: bump `ENGINE_VERSION`
(patch, or minor), floor untouched, no script — consumers feel nothing.
