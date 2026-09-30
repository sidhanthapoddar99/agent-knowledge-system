---
title: "The machine home: ~/.agentks and the build cache"
---

Everything agentks keeps outside a project lives in **one folder per machine, `~/.agentks/`**. It holds global settings, a **build cache per project** (git-derived dates, rendered pages, compiled CSS, generated audio), the **library cache** shared by every project (`libraries/<host>/<repository path>/<commit>/`), downloaded models such as the narration voice, and the records of running servers. Everything in it can be rebuilt or fetched again, so losing it costs only time and network. **Nothing is cleaned automatically.** Cleanup is a command the user starts, `agentks cache clean <root>`: it scans the given folders for every agentks project (every project has `config/dep.yaml`), keeps what their locks need, shows a report and removes the rest only after a yes.

# 03 References

- [The ~/.agentks home and the build cache](../../brainstorm/01_initial-discussion/07_agentks-home-and-build-cache.md) — the decisions and the cleanup design.
- [Libraries](../../brainstorm/02_future-stages/09_libraries-and-dependencies.md) — what fills `libraries/`.
- [Video and narration audio](../../brainstorm/01_initial-discussion/14_video-and-narration-audio.md) — generated audio in the build cache, the voice model in `models/`.
- [GitHub issues layout](../../brainstorm/02_future-stages/06_github-issues-layout.md) — the later machine-level sign-in.
- [The Rust engine](./03_rust-engine.md) — what the engine caches and why. [Rust CLI](./05_rust-cli.md) — the `cache` commands. [Sync engine and server](./04_sync-engine-and-server.md) — the running-server records.
- [Library system](../04_ecosystem/01_library-system.md) and [video pages](../04_ecosystem/05_video-pages.md).
- The prior audit's [B-tree cache study](../../../2026-05-08-runtime-stack-migration/agent-log/010_au_migration-feasibility-rescope/02_working/022_question_btree-cache.md) and [backend-side cache isolation](../../../2026-05-08-runtime-stack-migration/brainstorm/05_idea_backend-side-cache-isolation.md).
- [2026-05-08-update-date-time-optimization](../../../2026-05-08-update-date-time-optimization/issue.md) and [2026-08-07-content-embed-cache-dependencies](../../../2026-08-07-content-embed-cache-dependencies/issue.md).
- Today's update state, which moves here: [the updater](../../../../../../agent-ks-cli/src/update.rs).

# 04 Decisions

- Decided (sidhantha, 2026-09-29): machine-wide state lives in `~/.agentks/`, with global settings, other config, a build cache per project, the libraries and downloaded models.
- Decided (sidhantha, 2026-09-29): the hybrid: the index is built at start-up, pages are rendered on request and cached where it pays.
- Decided (sidhantha, 2026-09-29): generated narration audio may live in the build cache and be embedded in a build, but is never committed to git.
- Decided (sidhantha, 2026-09-30): the library cache is global, keyed by repository and commit, and shared by every project. Its size is not a concern.
- Decided (sidhantha, 2026-09-30): no automatic cleanup of the build cache or the libraries. Cleanup is started by the user, from the CLI or by asking an AI, never on a schedule.
- Decided (sidhantha, 2026-09-30): cleanup is given a root folder, scans for every agentks project under it, and removes what none of them needs. Thoroughness matters more than speed.
- Decided (sidhantha, 2026-09-30): the voice model is a separate download into `models/`, not a library.
- Proposed (claude, 2026-09-29): the engine version is part of the build cache key.
- Proposed (claude, 2026-09-30): the `run/`, `update.json` and `credentials.json` entries, and the `AGENTKS_HOME` override.

# 05 Notes & Analysis

## 01 Layout

```
~/.agentks/
  settings.json                    global settings
  other-config.json                other machine-wide config
  update.json                      the updater's state: last check, available version, last error
  build-cache.json                 one record per build cache entry (section 03)
  build-cache/
    <project key>/
      <engine version>/
        git-dates/<branch>.json    the issue `updated` dates for one branch
        pages/<render hash>.json   rendered page data
        css/<hash>.css             the compiled theme CSS
        highlight/<hash>.json      highlighted code blocks
        audio/<hash>.<ext>         narration audio (video pages)
  libraries/
    <host>/<repository path>/<commit>/     one repository at one commit,
                                           e.g. github.com/acme/design-kit/51aa0c3f.../
  migrations/
    <version>/                     migration scripts downloaded from the main repository at that tag
  models/
    <model>-<version>/             downloaded models, such as the narration voice
  run/
    <project key>.json             a running server: project path, port, process id, start time
    <project key>.log              that server's log, for `agentks logs`
  credentials.json                 later stage: the GitHub sign-in, when no OS keychain exists
```

- **The project key** is a hash of the project's canonical config folder path. A moved project gets a new key and a cold cache; the next cleanup removes the old one because its folder no longer exists.
- **The engine version is a level of its own** under the project key (claude, proposed). Two engine versions render different output, and with mise pinning both can run on one machine. They never read each other's entries.
- **On Windows** the home is `%USERPROFILE%\.agentks\`.
- **`AGENTKS_HOME`** overrides the location, for CI, containers and tests (claude, proposed).

## 02 What the build cache holds, and what it doesn't

**Cache what is expensive; re-derive the rest.** The prior audit found a warm re-derivation of the whole corpus takes 7.8 ms, so the index itself is rebuilt on every start.

| Cached | Why |
|---|---|
| Git-derived `updated` dates, per branch | Walking git history is the slow part. The incremental walk resumes from the last seen commit |
| Rendered page data, by render hash | Rendering is cheap but not free across thousands of pages |
| Compiled theme CSS | Merged once per theme input |
| Highlighted code | The costliest step of rendering |
| Narration audio | Seconds to minutes per page to generate |

| Not cached | Why |
|---|---|
| The site index | Fast to rebuild, and a stale index is the worst kind of wrong |
| Anything keyed by modification time | WSL reports unreliable times; keys are content hashes |

**A page's render hash covers everything it inlines**: its own bytes, the hashes of every embedded file, and the config that shapes it. Otherwise an edit to an embedded file leaves the page stale on disk and in the browser.

## 03 build-cache.json

```json
{
  "entries": [
    {
      "key": "8c1f...",
      "project": "/home/sid/projects/acme/docs/config",
      "engine": "1.2.0",
      "last_used": "2026-10-04T09:12:00Z",
      "bytes": 48213004
    }
  ]
}
```

`agentks start` updates `last_used` and `bytes` for its own entry. The file lets `cache status` and `cache clean` answer without walking every cache folder.

## 04 The library cache

- **One folder per repository and commit.** Projects pinned to the same commit share it; different pins sit side by side. A repository holding several libraries in subfolders is cached once per commit, and each `dep.yaml` entry reads its own `path`.
- **Fetched through git.** A shallow fetch of one commit, through a Rust git library. Git checks every object against the commit, so no separate content hash is stored.
- **Written atomically.** The fetch lands in a temporary folder beside the target and is renamed into place, so an interrupted install never leaves a half-written commit that looks complete. A lock file per commit stops two processes fetching the same commit at once.
- **Read-only.** The cached files are made read-only. A library's user never edits or migrates it; the owner publishes a new version ([library system](../04_ecosystem/01_library-system.md)).
- **Local libraries are not cached.** They are read in place from the project.
- **Publishing builds** fetch again from the lock, the way `npm ci` does. A Docker build can mount a cache for `libraries/` to avoid refetching ([publishing (SSG)](../05_delivery/02_publishing-ssg.md)).

## 05 Cleanup: `agentks cache clean <root>...`

For example, `agentks cache clean ~/projects`.

1. **Find the projects.** Walk each root for `config/dep.yaml`. Skip `.git`, `node_modules` and similar folders. This may take two or three minutes on a large disk; that is accepted.
2. **Collect what is needed.** Every commit in each found project's `dep.lock`. Proposed (claude): also read `dep.lock` from each project's other local git branches, so switching branch never triggers a download.
3. **Report.** The projects found, what would be removed, and the space it frees.
4. **Remove, after `--yes` or a confirmation.** Library commits no found project needs, and build cache entries whose recorded project folder no longer exists.

**It is safe by construction.** A library removed by mistake, for example one used by a project outside the scanned roots, is fetched again from its lock on that project's next start. A removed build cache is rebuilt. The cost is time and network, never content.

**An AI runs it only when asked.** It deletes files outside the project, so the skills tell agents to show the report and wait for the user's yes.

`agentks cache status` shows sizes and changes nothing. `agentks cache reset` removes only the current project's build cache.

## 06 Concurrency

Several servers and CLI commands may use the home at once.

- Every write is atomic: write a temporary file, then rename it.
- A cache entry is immutable once written, because its name is its content's hash. Two writers of the same entry write the same bytes.
- `build-cache.json` and `run/` records are updated under a short file lock.
- A `run/` record whose process no longer exists is stale; `agentks ps` removes it.

## 07 Credentials, later stage

- The GitHub sign-in for the GitHub issues layout and for private libraries uses GitHub's device flow, the way the `gh` CLI does.
- The token goes to the OS keychain where one exists. Otherwise `credentials.json`, readable by the user only (mode 600).
- A token never reaches the browser or a built site.

## 08 Open

- Whether other branches' locks are read during cleanup (section 05, step 2).
- The keys of `settings.json` and `other-config.json`, defined as features need them.
