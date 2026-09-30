---
title: "The ~/.agentks home and the build cache"
---

Machine-wide state moves to **`~/.agentks/`**: global settings, other config, a build cache kept per project, the libraries projects depend on, and downloaded models. The engine either renders content on the fly or caches it per project folder. **Nothing is cleaned up automatically.** Cleanup is a command the user starts. It scans the folders the user names for every agentks project on the machine, and removes only what none of them needs.

# 03 References

- [Why and the prior audit](./02_why-and-prior-audit.md) — the audit found a warm restart re-derives everything in 7.8 ms, so the cache must stay simple.
- [Video and narration audio](./14_video-and-narration-audio.md) — generated audio lives in this cache.
- [Libraries, dep.yaml and dep.lock](../02_future-stages/09_libraries-and-dependencies.md) — what fills `libraries/`.

# 04 Decisions

- Decided (sidhantha, 2026-09-29): the layout of `~/.agentks/` below.
- Decided (sidhantha, 2026-09-29): the hybrid — an index of the whole site built at start-up, pages rendered on request and cached where it pays.
- Decided (sidhantha, 2026-09-30): no automatic cleanup of the build cache or the libraries. Cleanup is started by the user, from the CLI or by asking an AI, and never runs on a schedule.
- Decided (sidhantha, 2026-09-30): the cleanup is given a root folder where the user's projects live. It scans for every agentks project under it, and removes the libraries none of them needs. It may take two or three minutes; thoroughness matters more than speed.

# 05 Notes & Analysis

## 01 Layout

```
~/.agentks/
  settings.json          global settings
  other-config.json      other machine-wide config
  build-cache.json       metadata about the build cache: each entry's project path, last use, size
  build-cache/
    <hash of the config path>/
      ...                one project's cached output
  libraries/
    github.com/<owner>/<repo>/<commit>/   one repository at one commit, shared by every project
  models/
    <model>-<version>/   downloaded models, such as the narration voice
```

`libraries/` is keyed by repository and commit, so projects pinned to the same commit share one copy and different pins sit side by side ([libraries](../02_future-stages/09_libraries-and-dependencies.md)).

## 02 Cleanup (claude, proposed)

`agentks cache clean <root>...`, for example `agentks cache clean ~/projects`.

1. **Find the projects.** Walk each root for `config/dep.yaml`. Every project must have that file, so it is a reliable marker. Skip `.git`, `node_modules` and similar folders.
2. **Collect what is needed.** Every commit named in a found project's `dep.lock`, and the docs for the installed agentks version. Proposed: also read `dep.lock` from each project's other local git branches, so switching branch does not trigger a download.
3. **Report before deleting.** List the projects found, what would be removed and how much space it frees. Deleting needs `--yes` or a confirmation.
4. **Remove.** Library commits no found project needs, and build caches whose recorded project folder no longer exists.

**It is safe by construction.** A library removed by mistake, for example from a project outside the scanned roots, is fetched again from its lock on the next start. A build cache is rebuilt. The only cost is time and network. `agentks cache status` shows the sizes without changing anything.

**An AI runs it only when asked.** It deletes files outside the project, so the skills tell agents to show the report and wait for the user's yes.

## 03 Proposed additions (claude, not yet agreed)

- **A page's cache key includes the hashes of the files it embeds**, not only its own bytes, or edits to an embedded file go stale ([2026-08-07-content-embed-cache-dependencies](../../../2026-08-07-content-embed-cache-dependencies/issue.md)).
- **Put the engine version in the cache key**, not only the config path hash. Two engine versions render different output, and with mise pinning ([versioning](./12_versioning-and-forced-migrations.md)) both can run on one machine.
- A moved project gets a new hash and a cold cache. That is fine; the next cleanup removes the old entry, because its recorded folder no longer exists.
- The prior audit's advice holds: cache what is expensive (git-derived dates, narration audio, highlighted code), and re-derive the rest.

## 04 Render on the fly or cache

The user named both options: "live translation" of the data, or a cache per folder. **Decided:** the hybrid. Rust builds an index of the whole site at start-up, renders a page's data when the frontend asks for it, and caches it by content hash. The frontend caches the same data in the browser, versioned by the same hashes ([the architecture note](./17_local-spa-over-websocket.md)). The index's data structure is still [open question 07](./16_open-questions.md): claude proposes an ordered map keyed by path, with Merkle-style content hashes rolled up through folders.
