---
title: "Dual caching — shared deps cache + per-project content cache"
---

# Dual caching strategy for CLI mode

When the framework starts behaving like a tool (one install, many docs projects pointing at it via `.env`), the current "everything inside `agent-ks-engine/`" cache layout breaks: the second project clobbers the first's `.astro/` cache, and `node_modules/.vite/` is rebuilt per project even though the deps haven't changed.

The fix is to split caches by **whose data they're a function of**.

## The split

| Cache | A function of… | Sharing scope | Suggested location |
|---|---|---|---|
| **`node_modules/.vite/`** (Vite dep pre-bundle) | framework version + lockfile | **shared across all projects on this machine** for a given framework version | `~/.cache/docs-template/deps/<framework-version>/` |
| **`.astro/`** (Astro content layer cache, type-gen) | the user's content | per-project | `<project>/.docs/cache/.astro/` |
| **`dist/`** (production build output) | the user's content + framework version | per-project, ephemeral | `<project>/.docs/cache/dist/` |
| **`bun install` deps** (`node_modules/` itself) | framework version | shared, same as Vite cache | `~/.cache/docs-template/deps/<framework-version>/node_modules/` |

The principle: anything that depends only on the **framework version** can be shared across every docs project on the machine. Anything that depends on the **user's content** must stay per-project.

## Why this matters

- **Disk**: `node_modules/.vite/` + `node_modules/` together are ~150–250 MB. Multiplied by N projects = wasted space. One shared copy = N× saved.
- **Cold-start time on a new project**: today, a fresh project pays the full `bun install` (10–30s) + Vite pre-bundle (2–4s) before it can serve. With shared deps, both are zero on a new project — the deps cache is already warm from any prior project.
- **Framework upgrades**: bump framework version → new dep cache slot under `~/.cache/docs-template/deps/<new-version>/` → all projects pick it up next time they run. Old cache slot can be GC'd via `docs cache clean --older-than 30d`.
- **Multi-project parallelism**: run `docs dev` on Project A and Project B at the same time, no collision because content caches are separate and the deps cache is read-only after warm-up.

## Subtleties

- **Symlink vs copy** for the per-project `node_modules/`: Astro/Vite need a `node_modules/` *resolvable from the project root* (Vite resolves modules relative to the cwd it's launched in). Cleanest is a per-project `node_modules/` that's a symlink (or junction on Windows) into the shared cache dir. Bun supports this natively (`bun install --linker isolated` style). Vite is fine with symlinks — has been for years.
- **Lockfile per framework version**: the shared deps cache is keyed by exact framework version (the framework itself ships a `bun.lock`). Different versions = different cache slots, no contention.
- **CONFIG_DIR's role unchanged**: `.env` still says `CONFIG_DIR=../config`; the cache split is internal to the framework's runtime — users don't see it.
- **`docs cache` commands**: the CLI should expose `docs cache info` (size + breakdown), `docs cache clean` (current project), `docs cache clean --all` (all projects' content caches), `docs cache clean --deps` (shared deps slots, all framework versions). Standard hygiene.
- **`.gitignore`**: `<project>/.docs/` should be ignored by default (the init scaffold's `.gitignore` should add it).

## What this DOESN'T solve

Doesn't fix:
- Astro/Vite startup time itself (still 1–3s of "cold" bring-up even with warm cache). Separate concern — addressable later by a daemonized dev server (one Bun process between `docs <cmd>` invocations).
- Disk I/O on cold reads (covered by the OS page cache for free; explicit `tmpfs` only matters on slow disks / containers — see `notes/01_docker-deployment-design.md`-style discussion if that becomes relevant).

## Where this fits

This is plumbing that sits underneath:
- **Subtask `03_method-1-cli-tool`** — the CLI binary needs to manage both cache locations (resolve framework version → deps slot, derive project content cache from `.env` location).
- **Subtask `04_method-3-docker`** — the Docker image can ship the deps cache pre-warmed in the layer, content cache stays in the bind-mounted volume.
- **Subtask `02_manual-from-source`** — even manual users benefit if the framework reads the same env-overrideable cache paths.

Filed as a note (not a subtask) because it's design info that informs multiple subtasks rather than a discrete unit of work. When `03_method-1-cli-tool` is implemented, its checklist should include "wire dual cache resolution per this note."

## Out of scope (for now)

- **Pre-built / single-binary distribution.** Was discussed; deferred — not worth the closed-world tradeoff (no custom layouts) at this stage. The shared deps cache gives most of the same speedup (dependency install becomes free) without the loss of flexibility.
- **In-RAM cache** (`tmpfs`-backed `.astro/`). The OS page cache already does this implicitly when RAM is available. Add an opt-in `--tmpfs` flag later if profiling shows disk I/O is actually the bottleneck.
