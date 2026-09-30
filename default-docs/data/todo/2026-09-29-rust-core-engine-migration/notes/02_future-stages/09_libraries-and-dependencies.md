---
title: "Phase 2: libraries, dep.yaml and dep.lock"
---

A project lists the **libraries** it uses in `config/dep.yaml`. Every project has this file, even when it is empty. A library is a folder with a manifest. It lives either in a **GitHub repository**, optionally in a subfolder and at a chosen tag, commit, branch or the latest release, or in a **local folder** given relative to `dep.yaml`. agentks resolves every GitHub library to an exact commit and writes it to `config/dep.lock`. It installs that commit into one cache shared by the whole machine, under `~/.agentks/libraries/`.

**agentks does not decide what a library holds.** It has no notion of icon sets, frames or templates. Each library's manifest describes the library and its elements. The CLI and the skills read manifests to find what is available, so an agent can reuse a good element instead of building one from scratch. There is no release pipeline to build: a GitHub repository and its tags are the release.

# 03 References

- [The ~/.agentks home and build cache](../01_initial_discussion/07_agentks-home-and-build-cache.md) — the cache layout, and the manual cleanup that scans for projects.
- [The config folder and .env](../01_initial_discussion/06_config-folder-and-env.md) — `dep.yaml` and `dep.lock` join the required config files.
- [The agentks docs command](./08_agentks-docs-command.md) — the docs are fetched through the same machinery.
- [GitHub issues layout](./06_github-issues-layout.md) — the machine-level GitHub sign-in that private libraries reuse.
- [Libraries in the video issue](../../../2026-09-29-narrated-video-pages/notes/01_initial_discussion/07_libraries-and-reusable-elements.md) — the video side: widgets, scene templates, custom video logic.
- [2026-07-07-artifact-component](../../../2026-07-07-artifact-component/issue.md) — today's artifact pages. An `.html` element from a library runs the same way.

# 04 Decisions

- Decided (sidhantha, 2026-09-29): libraries are downloaded and cached, never packaged with the binary, to keep it small.
- Decided (sidhantha, 2026-09-29): libraries are shared engine machinery, usable by docs pages, issues and videos, not a video-only feature.
- Decided (sidhantha, 2026-09-30): `config/dep.yaml` declares the libraries a project uses. It must exist even when empty. `config/dep.lock` records what was resolved.
- Decided (sidhantha, 2026-09-30): a library comes from a GitHub repository or a local folder. For GitHub, the user can choose a tag, a commit hash, a branch or the latest, and a subfolder inside the repository.
- Decided (sidhantha, 2026-09-30): the lock pins every GitHub library to an exact commit hash.
- Decided (sidhantha, 2026-09-30): local paths are relative to `dep.yaml`. A project's own artifacts are a local library, for example its `artifacts/` folder.
- Decided (sidhantha, 2026-09-30): agentks does not define kinds of library or element. Each library carries a manifest (YAML or JSON) that describes the library and its elements. The version is required in it. The CLI and the skills work from manifests.
- Decided (sidhantha, 2026-09-30): the cache is global and shared by every project on the machine, so size is not a concern.
- Decided (sidhantha, 2026-09-30): starting agentks checks which libraries the project needs and installs missing ones automatically. `agentks install` pre-installs them.
- Decided (sidhantha, 2026-09-30): no separate artifact releases. A library is a repository.
- Decided (sidhantha, 2026-09-30): the CLI and the skills use the installed libraries to help agents build better docs.
- Decided (sidhantha, 2026-09-30): the voice model is not a library. It is a separate download.
- Decided (sidhantha, 2026-09-30), on claude's proposal: the lock also records a content hash; starting agentks never moves a pin; the cache is keyed by repository and commit, not by name; pages name an element as `alias:element`; the manifest sits at the library's root; adding a library prints its source; the docs are fetched through the same machinery.
- Decided (claude, 2026-09-30): the manifest file is named `agentks-library.yaml`. A distinct name cannot collide with a repository's other manifests, and a scan can find libraries by it. The user can rename it.
- Decided (claude, 2026-09-30): leaving out `tag`, `commit` and `branch` means the latest release. A GitHub entry without a selector is the common case, so the short form should mean the safe default.

# 05 Notes & Analysis

## 01 What the user described

- `config/dep.yaml` and `config/dep.lock`. `dep.yaml` lists the libraries: GitHub repositories or relative folders. It must be present, even blank.
- A GitHub entry names the repository and optionally a version to pin: a tag, a commit hash, a branch, or the latest. It can also name the subfolder the library lives in.
- The lock points to a specific git hash.
- The CLI tools and skills take the downloaded libraries and their options into account, and help navigate them to build the best docs.
- No split between artifacts, icons or frames. A library is its name and its version, cached. Its manifest says what it is and what its elements are, and it must carry a version.
- The cache is global. Starting agentks installs what is needed; `agentks install` pre-installs.
- Custom artifacts: `dep.yaml` can point at a local folder such as `docs/artifacts/`, and the artifacts inside it are used.
- Artifact releases are not needed now.

## 02 dep.yaml

```yaml
# config/dep.yaml: required, even if it only holds `libraries: {}`
libraries:
  icons:                             # the alias pages use: icons:server
    github: agentks/library-icons    # latest release
  kit:
    github: acme/design-kit
    path: libraries/frames           # a subfolder of the repository
    tag: v1.4.0
  charts:
    github: acme/charts
    commit: 3f9c2a1e7b...            # an exact commit
  nightly:
    github: acme/widgets
    branch: main                     # follows a branch
  team:
    path: ../artifacts               # a local folder, relative to this file
```

| Field | Meaning |
|---|---|
| the key | The **alias**. Pages refer to elements through it, so two libraries never clash |
| `github` | `owner/repo`. Makes the entry a GitHub library |
| `path` | Where the library's manifest sits: inside the repository for a GitHub entry, relative to `dep.yaml` for a local one |
| `tag` · `commit` · `branch` | At most one. None of them means the **latest release**: the newest version tag. A repository with no version tags is an error asking for a branch or a commit; agentks does not guess |

**Why the file is required.** It gives agents one fixed place to look. It also marks a folder as an agentks project, which is what the [manual cleanup](../01_initial_discussion/07_agentks-home-and-build-cache.md) scans for. A missing file is an error naming the fix. The forced migration creates an empty one in existing projects.

## 03 dep.lock (claude, proposed)

```yaml
# config/dep.lock: written by agentks, committed, never edited by hand
icons:
  github: agentks/library-icons
  requested: latest
  commit: 9d02e11c...
  version: 2.1.0            # from the library's manifest
  sha256: 8b41...           # hash of the installed files
kit:
  github: acme/design-kit
  path: libraries/frames
  requested: tag v1.4.0
  commit: 51aa0c3f...
  version: 1.4.0
  sha256: c07a...
```

- **Every GitHub entry is pinned to a commit**, whatever was requested. A branch or "latest" is followed only when the user asks for an update, so two machines on the same project see the same pages.
- **A content hash sits beside the commit.** It catches a download that was altered or corrupted. The hash covers the extracted files, not the archive, because GitHub does not promise byte-identical archives.
- **Local libraries are not locked.** They live in the project's own git history.
- When `dep.yaml` and the lock disagree (an entry added, removed or changed), agentks resolves only those entries, rewrites the lock and reports the change.

## 04 Installing and updating (claude, proposed)

| Command | What it does |
|---|---|
| `agentks start` | Before serving, installs every locked commit missing from the cache. **Never moves a pin.** Resolves new `dep.yaml` entries and reports them |
| `agentks install` | The same, without starting a server. For a fresh clone, CI, or before going offline |
| `agentks install --update [alias]` | Moves `branch` and latest entries to their newest commit and prints old → new |
| `agentks library add <owner/repo>` | Adds an entry (`--path`, `--tag`, `--commit`, `--branch`, `--as <alias>`), installs it, prints its source and manifest summary |
| `agentks library remove <alias>` | Removes the entry and its lock record. The cached files stay until a cleanup |

- **Fetching** uses GitHub's archive of the commit over HTTPS, so no `git` binary is needed.
- **Offline with a missing library** is an error naming the library and `agentks install`. A page never renders with blanks.
- **A repository with several libraries** in subfolders is cached once per commit. Each entry reads its own `path`.

## 05 The library manifest (claude, proposed)

agentks defines the **format** of a manifest, not the categories inside it. A library describes itself:

```yaml
# agentks-library.yaml, at the library's root
name: acme-design-kit
version: 1.4.0                     # required
description: Device frames and product icons for Acme's docs
engine: ">=1.0.0 <2.0.0"           # the agentks versions it works with
elements:
  phone-frame:
    file: frames/phone.html
    description: A phone frame that holds one artifact
    tags: [frame, mobile]
  server:
    file: icons/server.svg
    description: A rack server
    tags: [icon, infrastructure]
```

| Field | Required | Meaning |
|---|---|---|
| `name`, `version`, `description` | yes | What the library is. A GitHub tag and the manifest's version that disagree give a warning |
| `elements` | yes | Each element's `file` and `description` |
| `tags` | no | Free words the library chooses. agentks never interprets them; the CLI only searches them |
| `engine` | no | The agentks versions it supports. Outside that range, agentks refuses the library with a clear error |

**The one thing the engine owns is how to show a file**, and that follows from its type: an SVG or image is shown as an image, an `.html` file runs as an artifact in a sandboxed iframe, and a script follows the widget contract. What an element is *for* is the manifest's business.

**A local folder may skip the manifest** (proposed). Then each direct child, a file or a folder, is one element named after it: `artifacts/checkout-flow/` becomes `team:checkout-flow`. That keeps the user's `docs/artifacts/<name>` case to one line in `dep.yaml`. Adding a manifest gives the elements descriptions, which is what makes them findable.

`agentks check libraries` checks the manifests: a missing version, a missing file, a repeated element name, an engine range that excludes this version.

## 06 Using elements in pages (claude, proposed)

A page names an element by alias and element, for example `icons:server` or `team:checkout-flow`. The alias says which library, so no search order is needed. **An unknown alias or element is an error** naming the page and the name. The check reads only files, so the CLI runs it too. The embed syntax itself is not settled; it overlaps the `[[...]]` clash in [open question 13](../01_initial_discussion/16_open-questions.md).

## 07 How the CLI and skills use libraries (claude, proposed)

This is what makes libraries help agents, not just store files.

| Command | Returns |
|---|---|
| `agentks library list` | The project's libraries: alias, source, pinned commit, version, element count |
| `agentks library show <alias>` | One library's manifest: every element with its description and tags |
| `agentks library find <words>` | Elements whose name, description or tags match, across the project's libraries |

All three take `--json`. The docs and artifacts skills tell the agent to run `library find` before it builds an icon, a frame or an artifact from scratch. Reusing an element costs a few tokens; generating one costs thousands, and it looks different each time.

## 08 Trust (claude, proposed)

A library can hold HTML and scripts that run in the local viewer, so:

- The lock's hash is checked on every install.
- `.html` and script elements run in a sandboxed iframe, like artifacts today, so they cannot reach the page around them.
- `agentks library add` prints the repository and the manifest summary. `agentks start` never adds a library that is not in `dep.yaml`, so no library arrives unseen.
- Private repositories use the machine-level GitHub sign-in from the [GitHub issues layout](./06_github-issues-layout.md).

## 09 What is not a library

- **The voice model.** A large binary file, not a repository. It is a separate download into `~/.agentks/models/`.
- **The docs.** `agentks docs` fetches the docs repository through this same machinery, pinned to the installed binary's version. It is internal and never appears in a project's `dep.yaml` ([the docs command](./08_agentks-docs-command.md)).
- **The build cache and generated audio.** agentks produces them; it does not download them.

## 10 Open points

- **GitHub only, or any git URL.** Claude suggests GitHub first, and a generic `git:` URL later if someone needs GitLab or a self-hosted server.
- **Version ranges.** Whether `tag` accepts a range such as `^1.4` and resolves to the newest match.
- **Libraries depending on libraries.** Claude suggests not allowing it: a flat list is simpler, and a library that needs another says so in its description.
- **The embed syntax**, shared with [open question 13](../01_initial_discussion/16_open-questions.md).
