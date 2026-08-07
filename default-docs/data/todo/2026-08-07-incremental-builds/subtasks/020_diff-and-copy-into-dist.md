---
title: "Diff and copy — write only the files that changed"
status: open
---

# Overview

Build to a scratch directory, compare each output against what `dist/` already
holds, and copy across only what differs. Delete what disappeared.

**This ends the disk-churn complaint outright: 17 file writes instead of 1,290.**
It does not make the build faster — every page is still rendered. Read that as the
whole point rather than a shortfall: it is a small, contained change that solves one
of the two stated problems completely.

Done when a no-op rebuild writes zero files into `dist/`, and a one-line content
edit writes only the pages that actually changed.

# References

- [make the build deterministic](./010_make-the-build-deterministic.md) — **hard
  prerequisite.** Without it, ~17 pages report as changed on every build forever
- [the partial-rebuild brainstorm](../../2026-08-07-astro-7-and-load-time-refactor/brainstorm/01_partial-rebuilds.md)
- `astro-doc-code/astro.config.mjs` — `outDir`, and where a scratch target would go

# Todo list

- [ ] Build to a scratch directory instead of straight into `dist/`
- [ ] Hash every output file, compare against `dist/`, copy only what differs
- [ ] **Delete files that no longer exist** — the failure mode nobody tests
- [ ] Keep it out of the framework: a post-build step, not a change to the renderer
- [ ] Decide where it lives — see Details
- [ ] Prove it both ways: a no-op rebuild writes 0 files; a one-line edit writes
      only the affected pages

# Outcomes and Next Steps

> [!IMPORTANT]
> **PLACEHOLDER** — filled at completion / hand-off.

# Details

## Why a scratch directory is needed at all

Astro cleans `dist/` at the start of a build. So "write only what changed" cannot be
done in place — the old output is gone before there is anything to compare against.
Build elsewhere, then sync.

## The three cases, and only two are obvious

| Case | Action |
|---|---|
| File exists in both, same hash | **Do nothing** — this is the 98.7% |
| File exists in both, different hash | Copy over |
| File in `dist/` only | **Delete it** |

**The third case is where this breaks.** A renamed or deleted page leaves a stale
file serving forever, and nothing complains — the site just keeps answering a URL
that should be gone. Any test that only checks "changed files were copied" passes
while this is broken.

## Where it belongs

This is **development-stage tooling** by the project's own test in `CLAUDE.md`: it
needs a build to exist, which a consumer never has. So it belongs in repo-root
`scripts/`, not in the plugin — and it should be wired into `./start build` rather
than into the framework.

## What this does and does not buy

| | |
|---|---|
| Disk writes per no-op rebuild | 1,290 → **0** |
| Disk writes after a one-line edit | 1,290 → **~17** |
| Build wall time | **unchanged at ~7 s** |
| Deploy upload size, for anything rsync-like | much smaller |

The last row is worth noting: a deploy that syncs by timestamp or hash currently
sees 1,290 changed files every time. After this it sees the real number.
