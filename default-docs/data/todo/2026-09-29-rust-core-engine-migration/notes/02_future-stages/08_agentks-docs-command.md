---
title: "Phase 2: the agentks docs command"
---

`agentks docs` **opens the agentks documentation in the browser**, served by the same local server that shows a project. The docs are **not bundled** in the binary. agentks downloads them once, caches them under `~/.agentks/`, and checks for a newer copy from time to time when the command runs. It uses the same machinery as project libraries: a GitHub source, a pinned commit, a content hash and the shared cache.

Today the docs are there because every install clones the framework, and the user guide sits in `default-docs/`. The skills link straight into it. After the migration, one binary serves every project and there is no framework checkout on the machine, so the docs need a new home. This command is that home.

# 03 References

- [The ~/.agentks home and build cache](../01_initial_discussion/07_agentks-home-and-build-cache.md) — where the cached docs live.
- [Single install](../01_initial_discussion/05_single-install-tool-engine-frontend.md) — why there is no framework checkout any more.
- [Libraries, dep.yaml and dep.lock](./09_libraries-and-dependencies.md) — the fetching, pinning and cache the docs reuse.
- [CLI rename and commands](../01_initial_discussion/08_cli-rename-and-commands.md)

# 04 Decisions

- Decided (sidhantha, 2026-09-29): add an `agentks docs` command that starts a server showing the agentks documentation.
- Decided (sidhantha, 2026-09-29): the docs are not bundled with the binary. agentks downloads them and caches them, the way it downloads libraries.
- Decided (sidhantha, 2026-09-29): agentks checks for docs updates from time to time when the command runs.
- Decided (claude, 2026-09-29): placed in Phase 2, so it ships with 1.0.0. Phase 1 is rendering only, and 1.0.0 is the first release without a framework checkout, so the docs must be reachable by then. Recorded here; the user can move it.

# 05 Notes & Analysis

## 01 What the user described

- `agentks docs` runs a server that opens the agentks documentation.
- Before, the docs could be linked directly, so anyone wanting to learn agentks could open them.
- Don't bundle the docs. Download and cache them, like artifacts and libraries.
- Check for updates from time to time when running it.

## 02 How it could work (claude, proposed)

- **The docs are an agentks project.** The user guide is already markdown with `settings.json` files and a config. agentks fetches that source folder, not a built website, and runs the normal engine on it, read-only. No second renderer and no second build.
- **Fetched like a library.** The source is this project's GitHub repository, with `path` pointing at the docs folder and the tag of the installed binary's release. The same code fetches it, pins the commit, checks the content hash and stores it in `~/.agentks/libraries/`. The pin is recorded in `~/.agentks/`, never in a project's `dep.yaml`.
- **Matched to the installed version.** The docs describe one release. Updating the binary makes the next `agentks docs` fetch the docs at the new release tag.
- **Update checks with a cooldown.** Docs fixes can ship between binary releases. Proposed: they land on a branch per release line, for example `docs/1.0`. When the command runs, agentks checks that branch for a newer commit at most once per cooldown (the CLI's own update check uses five hours). If the check fails, it serves the cached copy and says it could not check. It never blocks on the network when a copy is cached.
- **Cleanup** is the manual `agentks cache clean`, which keeps the docs of the installed version ([the home note](../01_initial_discussion/07_agentks-home-and-build-cache.md)).

## 03 For agents (claude, proposed)

- `agentks docs --path` downloads the docs if needed and prints the folder. An agent then reads the markdown directly, without a browser.
- The skills currently link into the framework's `default-docs/data/user-guide/`. After the migration they point at this folder instead, found through `--path`.
- `agentks docs <page>` could open one page directly, such as `agentks docs issues`.

## 04 Open points

- **Docs fixes between releases.** Whether a per-release-line branch is the right carrier, or docs simply wait for the next binary release.
- **Which sections.** The user guide for certain. The dev docs are for maintainers of agentks itself, so they may stay out of the download.
- **First run offline.** With no cached copy and no network, the command must fail with a clear message naming what it tried to fetch.
