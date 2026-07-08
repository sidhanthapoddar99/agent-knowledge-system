---
title: "Repo size, history compaction & clone strategy — measured analysis"
---

# Repo size, history compaction & clone strategy

Measured 2026-07-08, on the `rebrand/agent-ks` branch, to settle two questions
before the repo move ([60](../subtasks/60_new-repo.md)): should history be
compacted, and what does a consumer install actually cost?

## What the repo weighs

| Piece | Size | Ships to consumers? |
|---|---|---|
| Git history, packed | **~6 MB** (471 commits; the 22 MB local `.git` is un-gc'd loose objects) | yes, on clone |
| Tracked working tree | ~10 MB (`default-docs/` 7 MB, `src/` 1.8 MB, `plugins/` 1 MB) | yes |
| `astro-doc-code/dist/` | 115 MB | no — gitignored build output |
| `node_modules/` | 419 MB (apparent; see hardlink finding below) | no — installed locally |

A fresh full clone is **~16 MB**. The largest blobs in history are lockfile
versions and a few ~150–200 KB tracker screenshots — no hidden fat (no
committed `dist/`, no binaries).

## Decision: no history compaction (squash/orphan rejected)

Beyond losing blame and migration archaeology, squashing has a hard functional
cost specific to this project: **the issue tracker derives every issue's
`updated` field from git commit history**. One squash commit collapses every
issue's `updated` to the squash date and breaks tracker ordering
(`priority desc, updated desc`). History here is load-bearing data, and the
prize would be ~6 MB. Instead: `git gc --aggressive --prune=now` before the
push to the new repo, full history preserved.

## Decision: attack clone cost, not history — shallow clone for consumers

Consumers installing the framework in many projects don't need history at all.
The install path (the `/agent-ks-init` printed clone command, README + user-guide
quick-starts — [90](../subtasks/90_install-script-links.md)) moves to:

```
git clone --depth 1 <new-repo-url>
```

~10 MB instead of 16, and it stays constant as history grows. `--depth 1` over
`--filter=blob:none` because consumers don't run our tracker, so lazy history
buys them nothing. Framework-dev clones (this repo) stay full-history — the
tracker needs it.

Interaction to keep in mind: `./start`'s update check does a fetch +
fast-forward pull — that works fine on a shallow clone (`git pull` deepens as
needed), but the [100](../subtasks/100_start-migration-flow.md) origin-rewrite
flow should not assume history depth.

## Finding: node_modules is already deduplicated across clones (bun hardlinks)

The "419 MB × N clones" worry is an illusion of per-directory `du`. Bun's
default install backend is **hardlink from its global cache**
(`~/.bun/install/cache`): a sampled file in this repo's `node_modules` has
`links=11` — the same disk blocks are shared by the cache and every clone's
node_modules on this machine. N clones cost ~one copy plus directory/inode
overhead (directories can't hardlink; a few MB each).

Consequences:

- **No global-environment mechanism is needed** — no shared-env symlinks, no
  "delete your local node_modules" prompt in `start`. Per-project
  `node_modules` keeps full Astro/Vite compatibility and the dedup already
  happens at the filesystem level.
- Caveats where dedup silently degrades to copies: project on a **different
  filesystem/mount** than `~/.bun` (hardlinks can't cross devices), and the
  **npm fallback** path in `start` (npm has no hardlink backend). Both
  acceptable; not worth machinery.
- The global cache itself (~4 GB here) accumulates every version ever
  installed — `bun pm cache rm` is the user-side lever, nothing for us to do.
