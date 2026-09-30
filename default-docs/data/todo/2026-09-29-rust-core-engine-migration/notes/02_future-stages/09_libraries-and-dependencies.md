---
title: "Phase 2: libraries, dep.yaml and dep.lock"
---

A project lists the **libraries** it uses in `config/dep.yaml`. Every project has this file, even when it is empty. A library is a folder with a manifest. It lives either in a **git repository** (GitHub or any git URL), optionally in a subfolder and at a chosen tag, commit, branch or the latest release, or in a **local folder** given relative to `dep.yaml`. agentks resolves every git library to an exact commit and writes it to `config/dep.lock`. It installs that commit into one cache shared by the whole machine, under `~/.agentks/libraries/`.

**agentks does not decide what a library holds.** It has no notion of icon sets, frames or templates. Each library's `manifest.json` describes the library and its elements, its sub-components. One library has one version series: a change to any element is a new version of the whole library. The CLI and the skills read manifests to find what is available, so an agent can reuse a good element instead of building one from scratch. There is no release pipeline to build: a git repository and its tags are the release.

# 03 References

- [The ~/.agentks home and build cache](../01_initial_discussion/07_agentks-home-and-build-cache.md) — the cache layout, and the manual cleanup that scans for projects.
- [The config folder and .env](../01_initial_discussion/06_config-folder-and-env.md) — `dep.yaml` and `dep.lock` join the required config files.
- [The repositories and three states](./12_repositories-and-three-states.md) — `neuralabshq/agent-knowledge-system-library` holds the default library, the templates and `library.json`.
- [Phase 3: publishing](./07_phase-3-publishing.md) — how `agentks build` installs libraries from the lock.
- [Later stage: extensions](./11_extensions.md) — libraries that add commands or site scripts, later.
- [Open question 13](../01_initial_discussion/16_open-questions.md) — the markdown syntax decision that keeps library names out of markdown.
- [GitHub issues layout](./06_github-issues-layout.md) — the machine-level GitHub sign-in that private libraries reuse.
- [Libraries in the video issue](../../../2026-09-29-narrated-video-pages/notes/01_initial_discussion/07_libraries-and-reusable-elements.md) — the video side: widgets, scene templates, custom video logic.
- [2026-07-07-artifact-component](../../../2026-07-07-artifact-component/issue.md) — today's artifact pages. An `.html` element from a library runs the same way.

# 04 Decisions

- Decided (sidhantha, 2026-09-29): libraries are downloaded and cached, never packaged with the binary, to keep it small.
- Decided (sidhantha, 2026-09-29): libraries are shared engine machinery, not a video-only feature.
- Decided (sidhantha, 2026-09-30): `config/dep.yaml` declares the libraries a project uses. It must exist even when empty. `config/dep.lock` records what was resolved.
- Decided (sidhantha, 2026-09-30): a library comes from a GitHub repository or a local folder. For GitHub, the user can choose a tag, a commit hash, a branch or the latest, and a subfolder inside the repository.
- Decided (sidhantha, 2026-09-30): the lock pins every git library to an exact commit hash. The commit is the hash: no separate content hash is stored.
- Decided (sidhantha, 2026-09-30): the engine does not depend on libraries, apart from knowing the default library's catalog. Libraries depend on the engine: every library states the engine versions it is built for.
- Decided (sidhantha, 2026-09-30): there are two kinds of migration. Docs migrations are run by users on their own content. Library migrations are done by the library's owner, who publishes a new version; users of a library never migrate it themselves.
- Decided (sidhantha, 2026-09-30): local paths are relative to `dep.yaml`. A project's own artifacts are a local library, for example its `artifacts/` folder.
- Decided (sidhantha, 2026-09-30): agentks does not define kinds of library or element. Each library carries a manifest that describes the library and its elements. The version is required in it. The CLI and the skills work from manifests.
- Decided (sidhantha, 2026-09-30): the cache is global and shared by every project on the machine, so size is not a concern.
- Decided (sidhantha, 2026-09-30): starting agentks checks which libraries the project needs and installs missing ones automatically. `agentks install` pre-installs them.
- Decided (sidhantha, 2026-09-30): no separate artifact releases. A library is a repository.
- Decided (sidhantha, 2026-09-30): the CLI and the skills use the installed libraries to help agents build better docs.
- Decided (sidhantha, 2026-09-30): the voice model is not a library. It is a separate download.
- Decided (sidhantha, 2026-09-30), on claude's proposal: starting agentks never moves a pin; the cache is keyed by repository and commit, not by name; video and artifact pages name an element as `alias:element`; the manifest sits at the library's root; adding a library prints its source.
- Decided (sidhantha, 2026-09-30): library elements are used only in **video pages and artifact pages**. Markdown gets no library syntax: no `icons:server` in a markdown page. Markdown stays portable to Obsidian and other note apps, with only `[[file]]` embeds and `[text](path)` links, both relative to the file ([open question 13](../01_initial_discussion/16_open-questions.md)).
- Decided (sidhantha, 2026-09-30): the default library has its own repository, `neuralabshq/agent-knowledge-system-library`, to keep the main repository simple. The templates live there too.
- Decided (sidhantha, 2026-09-30): `library.json`, at the root of the library repository, lists the libraries and templates agentks offers for quick install, like a marketplace file. It never moves. The official repositories are built into the binary.
- Decided (sidhantha, 2026-09-30): `agentks library` works as an interactive TUI (a menu in the terminal) and as plain commands. The TUI and `library.json` are a convenience: any third-party library can still be added through `dep.yaml`.
- Decided (sidhantha, 2026-09-30): a library's manifest is `manifest.json`, at the library's root.
- Decided (sidhantha, 2026-09-30): a library's elements are not versioned on their own. Icons, artifacts, video elements and scripts in one library share the library's version series; changing any of them is a new version of the library.
- Decided (sidhantha, 2026-09-30): `agentks init --template <template id or url> <path>` creates a project from a template. The template defaults to `agentks-default` and the path to `docs`; the path can be `.`, `..` or any folder.
- Decided (sidhantha, 2026-09-30): any git URL is accepted, not only GitHub.
- Decided (sidhantha, 2026-09-30): version ranges are allowed. Every version uses the x.y.z format (major, minor, patch).
- Decided (sidhantha, 2026-09-30): libraries cannot depend on other libraries. The list in `dep.yaml` is flat, to keep it simple.
- Decided (claude, 2026-09-30): leaving out `tag`, `commit` and `branch` means the latest release. An entry without a selector is the common case, so the short form should mean the safe default.

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
  shapes:
    git: https://gitlab.com/acme/shapes.git
    tag: ^2.1                        # a range: the newest 2.x.y from 2.1.0 up
  team:
    path: ../artifacts               # a local folder, relative to this file
```

| Field | Meaning |
|---|---|
| the key | The **alias**. Pages refer to elements through it, so two libraries never clash |
| `github` | `owner/repo`. Shorthand for a GitHub repository |
| `git` | Any git URL, for GitLab, a self-hosted server or anything else. An entry has `github` or `git`, not both |
| `path` | Where the library's manifest sits: inside the repository for a git entry, relative to `dep.yaml` for a local one |
| `tag` · `commit` · `branch` | At most one. `tag` takes an exact version (`1.4.0`) or a range (`^1.4`, `~1.4.2`, `>=1.2.0 <2.0.0`), resolved to the newest matching tag. None of them means the **latest release**: the newest version tag. A repository with no x.y.z tags is an error asking for a branch or a commit; agentks does not guess |

**Why the file is required.** It gives agents one fixed place to look. It also marks a folder as an agentks project, which is what the [manual cleanup](../01_initial_discussion/07_agentks-home-and-build-cache.md) scans for. A missing file is an error naming the fix. The forced migration creates an empty one in existing projects.

## 03 dep.lock (claude, proposed)

```yaml
# config/dep.lock: written by agentks, committed, never edited by hand
icons:
  github: agentks/library-icons
  requested: latest
  commit: 9d02e11c...
  version: 2.1.0            # from the library's manifest
kit:
  github: acme/design-kit
  path: libraries/frames
  requested: tag v1.4.0
  commit: 51aa0c3f...
  version: 1.4.0
```

- **Every git entry is pinned to a commit**, whatever was requested. A range is resolved once, at install or update, and the lock keeps the tag it chose. A branch or "latest" is followed only when the user asks for an update, so two machines on the same project see the same pages.
- **The commit is the hash.** agentks always fetches through git, which checks every object it receives against the commit, so no separate content hash is stored.
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
| `agentks library` | With no arguments, opens the TUI: the catalog, what the project uses, what is already cached, and install with one key (section 09) |

- **Fetching.** Every entry, GitHub or any other git URL, fetches that one commit, shallow, through a Rust git library. No `git` binary is needed, and git itself verifies the content against the commit. (GitHub's download archives are not checked against the commit, so they are not used.)
- **Offline with a missing library** is an error naming the library and `agentks install`. A page never renders with blanks.
- **A repository with several libraries** in subfolders is cached once per commit. Each entry reads its own `path`.

## 05 The library manifest (claude, proposed)

agentks defines the **format** of a manifest, not the categories inside it. A library describes itself:

```json
{
  "name": "acme-design-kit",
  "version": "1.4.0",
  "description": "Device frames and product icons for Acme's docs",
  "engine": ">=1.0.0 <2.0.0",
  "elements": {
    "phone-frame": {
      "file": "frames/phone.html",
      "description": "A phone frame that holds one artifact",
      "tags": ["frame", "mobile"]
    },
    "server": {
      "file": "icons/server.svg",
      "description": "A rack server",
      "tags": ["icon", "infrastructure"]
    }
  }
}
```

This is `manifest.json`, at the library's root. `version` is required and x.y.z; `engine` is the range of agentks versions it works with.

| Field | Required | Meaning |
|---|---|---|
| `name`, `version`, `description` | yes | What the library is. `version` is x.y.z and covers every element: there are no per-element versions. A tag and the manifest's version that disagree give a warning |
| `elements` | yes | Each element's `file` and `description` |
| `tags` | no | Free words the library chooses. agentks never interprets them; the CLI only searches them |
| `engine` | yes | The agentks versions the library is built for, for example `>=1.0.0 <2.0.0`. Outside that range, agentks refuses the library with a clear error |

**The one thing the engine owns is how to show a file**, and that follows from its type: an SVG or image is shown as an image, an `.html` file runs as an artifact in a sandboxed iframe, and a script follows the widget contract. What an element is *for* is the manifest's business.

**A local folder may skip the manifest** (proposed). Then each direct child, a file or a folder, is one element named after it: `artifacts/checkout-flow/` becomes `team:checkout-flow`. That keeps the user's `docs/artifacts/<name>` case to one line in `dep.yaml`. Adding a manifest gives the elements descriptions, which is what makes them findable.

`agentks check libraries` checks the manifests: a missing version, a missing file, a repeated element name, an engine range that excludes this version.

## 06 Where elements are used

**Only in video pages and artifact pages.** A markdown page never names a library element. Its body stays plain, portable markdown: `[text](./path.md)` links and `[[./path]]` embeds, both relative to the file, which the Rust engine translates. Content written in agentks then opens cleanly in Obsidian or any other note app, and moves in and out of agentks without a converter. Server icons, flows and similar logic in markdown would tie the content to agentks.

How the two page kinds name an element (claude, proposed):

- **A video** names elements inside its cues, for example `<!-- panel: icons:server -->`. Cues are HTML comments or a fenced block, so other apps hide them or show them as code; the narration text stays readable. The cue syntax itself is the video issue's open question.
- **An artifact** is HTML, not markdown. The engine serves each element at a reserved route, `/_lib/<alias>/<element>`, and the artifact's HTML loads it like any file.

Both use `alias:element`. The alias says which library, so no search order is needed. **An unknown alias or element is an error** naming the page and the name. The check reads only files, so the CLI runs it too.

## 07 How the CLI and skills use libraries (claude, proposed)

This is what makes libraries help agents, not just store files.

| Command | Returns |
|---|---|
| `agentks library list` | The project's libraries: alias, source, pinned commit, version, element count |
| `agentks library show <alias>` | One library's manifest: every element with its description and tags |
| `agentks library find <words>` | Elements whose name, description or tags match, across the project's libraries |

All three take `--json`. The artifacts skill and the video skill tell the agent to run `library find` before it builds an icon, a frame or an artifact from scratch. Reusing an element costs a few tokens; generating one costs thousands, and it looks different each time.

## 08 Trust (claude, proposed)

A library can hold HTML and scripts that run in the local viewer, so:

- Every install fetches through git, which verifies the content against the pinned commit.
- `.html` and script elements run in a sandboxed iframe, like artifacts today, so they cannot reach the page around them.
- `agentks library add` prints the repository and the manifest summary. `agentks start` never adds a library that is not in `dep.yaml`, so no library arrives unseen.
- Private GitHub repositories use the machine-level GitHub sign-in from the [GitHub issues layout](./06_github-issues-layout.md). Other hosts use the machine's git credentials.

## 09 The catalog (`library.json`) and the TUI

The **catalog** is `library.json`, at the root of `neuralabshq/agent-knowledge-system-library`. Like a marketplace file, it lists the libraries agentks offers for quick install, starting with the default library, and the templates. Each library it lists keeps its own `manifest.json`. agentks knows this one catalog, whose address is built into the binary, so the file must never move.

Claude, proposed: each entry gives a name, a description, the git source and path, the latest version and tags.

- `agentks library` with no arguments opens the TUI. It shows what the catalog offers, what this project already uses, and what is already in the machine's cache. Installing is one key, so setting up several projects is quick.
- Every TUI action has a plain command with `--json`, such as `agentks library search <words>` over the catalog and `agentks library add <name>` for a catalog entry. An agent cannot drive a TUI, so the plain commands are the agent's way in.
- A library outside the catalog still works: `dep.yaml` accepts any git URL. The catalog only makes approved ones easy to find.

## 10 Templates and agentks init

`agentks init --template <template id or url> <path>` creates a project: the `config/` folder with `site.yaml`, an empty `dep.yaml`, starter pages, and the basic Dockerfile for publishing ([Phase 3](./07_phase-3-publishing.md)). Templates live in the library repository and are listed in `library.json`. The template defaults to `agentks-default` and the path to `docs`. The path may be `.`, `..` or any folder name.

Claude, proposed:

- A template is fetched like a library: a template id is looked up in the catalog; a URL is a git source, optionally with a subfolder and a version.
- `init` refuses a folder that already holds a `config/`, so it never overwrites a project.
- A template is copied into the project once. It is not a dependency and is not listed in `dep.yaml`.

## 11 What is not a library

- **The voice model.** A large binary file, not a repository. It is a separate download into `~/.agentks/models/`.
- **The docs.** They are hosted at agentks.neuralabs.org/docs, not downloaded ([the docs command](./08_agentks-docs-command.md)).
- **The build cache and generated audio.** agentks produces them; it does not download them.
- **AI plugins.** Claude Code and Codex plugins with skills are installed through their own marketplaces, not through `dep.yaml` ([launch](./10_launch-order-and-hosting.md)).

## 12 When the engine and a library disagree (claude, proposed)

Only breaking engine releases change formats, so a library's `engine` range normally spans one major version.

- **A user upgrades the engine past a pinned library's range.** agentks stops and names the library, its range and the engine version. It suggests `agentks install --update` to move to a library version built for the new engine, or pinning the older engine with mise.
- **`agentks migrate` checks every pinned library's range** while migrating the docs, so the user hears about all mismatches at once, not one per start.
- **The owner migrates the library.** The engine's migrations folder has a `library/` part next to `docs/`: the scripts a library owner runs on their library for a breaking engine release ([versioning](../01_initial_discussion/12_versioning-and-forced-migrations.md)). The owner then publishes a new version with the new `engine` range. Libraries sit read-only in the users' cache, so users never edit them.

## 13 Publishing builds

`agentks build` installs exactly the commits in `dep.lock`, like `npm ci`, and never resolves `dep.yaml` afresh ([Phase 3](./07_phase-3-publishing.md)).

## 14 Open points

- **Adding other catalogs** besides the built-in one, for a company that runs its own.
