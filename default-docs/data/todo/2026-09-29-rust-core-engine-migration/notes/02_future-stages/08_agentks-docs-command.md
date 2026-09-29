---
title: "Phase 2: the agentks docs command"
---

`agentks docs` **opens the agentks documentation in the browser**, served by the same local server that shows a project. The docs are **not bundled** in the binary. agentks downloads them once, caches them under `~/.agentks/`, and checks for a newer copy from time to time when the command runs. This is the same pattern as the video preset libraries, and it should share their download code.

Today the docs are there because every install clones the framework, and the user guide sits in `default-docs/`. The skills link straight into it. After the migration, one binary serves every project and there is no framework checkout on the machine, so the docs need a new home. This command is that home.

# 03 References

- [The ~/.agentks home and build cache](../01_initial_discussion/07_agentks-home-and-build-cache.md) — where the cached docs live.
- [Single install](../01_initial_discussion/05_single-install-tool-engine-frontend.md) — why there is no framework checkout any more.
- [The artifact library](./09_artifact-library.md) — the preset libraries this shares a downloader with.
- [CLI rename and commands](../01_initial_discussion/08_cli-rename-and-commands.md)

# 04 Decisions

- Decided (sidhantha, 2026-09-29): add an `agentks docs` command that starts a server showing the agentks documentation.
- Decided (sidhantha, 2026-09-29): the docs are not bundled with the binary. agentks downloads them and caches them, the way it downloads artifact and preset libraries.
- Decided (sidhantha, 2026-09-29): agentks checks for docs updates from time to time when the command runs.
- Decided (claude, 2026-09-29): placed in Phase 2, so it ships with 1.0.0. Phase 1 is rendering only, and 1.0.0 is the first release without a framework checkout, so the docs must be reachable by then. Recorded here; the user can move it.

# 05 Notes & Analysis

## 01 What the user described

- `agentks docs` runs a server that opens the agentks documentation.
- Before, the docs could be linked directly, so anyone wanting to learn agentks could open them.
- Don't bundle the docs. Download and cache them, like artifacts and libraries.
- Check for updates from time to time when running it.

## 02 How it could work (claude, proposed)

- **The docs are an agentks project.** The user guide is already markdown with `settings.json` files and a config. The download is that source folder as one archive, not a built website. `agentks docs` runs the normal engine on it, read-only. No second renderer and no second build.
- **Matched to the installed version.** The docs describe one release, so agentks fetches the docs for its own version. Updating the binary makes the next `agentks docs` fetch the matching docs.
- **Cached per version**, under `~/.agentks/docs/<version>/`. Old versions are removed by the same 15-day cleanup as the build cache.
- **Update checks with a cooldown.** Docs fixes can ship between binary releases. When the command runs, agentks checks for a newer docs build for its version at most once per cooldown (the CLI's own update check uses five hours). If the check fails, it serves the cached copy and says it could not check. It never blocks on the network when a copy is cached.
- **Verified on download.** A checksum is published with each archive, and agentks refuses one that does not match — the same rule as the preset libraries.
- **One downloader.** The docs, the preset libraries and the voice model all fetch a pinned, checksummed file into `~/.agentks/`. They should share one piece of code, so the three cannot drift apart.

## 03 For agents (claude, proposed)

- `agentks docs --path` downloads the docs if needed and prints the folder. An agent then reads the markdown directly, without a browser.
- The skills currently link into the framework's `default-docs/data/user-guide/`. After the migration they point at this folder instead, found through `--path`.
- `agentks docs <page>` could open one page directly, such as `agentks docs issues`.

## 04 Open points

- **Hosting.** The same question as the video issue's preset libraries: GitHub Releases of this repository, or another static host. Settle both together.
- **Which sections.** The user guide for certain. The dev docs are for maintainers of agentks itself, so they may stay out of the download.
- **First run offline.** With no cached copy and no network, the command must fail with a clear message naming what it tried to fetch.
