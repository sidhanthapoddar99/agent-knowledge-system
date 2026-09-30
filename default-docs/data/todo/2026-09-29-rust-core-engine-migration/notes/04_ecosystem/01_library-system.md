---
title: "Library system: dep.yaml, dep.lock, manifests and the catalog"
---

A **library** is a folder of reusable files, such as icons, frames, HTML artifacts, scene templates and scripts, that a project uses without copying them in. Every project declares its libraries in `config/dep.yaml`. The file is required even when it is empty. An entry points at a git repository (GitHub or any git URL), optionally a subfolder inside it and a version, or at a local folder relative to `dep.yaml`. agentks pins every git entry to an exact commit in `config/dep.lock` and fetches that commit once per machine into `~/.agentks/libraries/`. Each library describes itself in a `manifest.json`: a name, one x.y.z version for the whole library, the engine versions it supports, and its **elements** (the individual files it offers, each with a description and tags). agentks does not define kinds of library or element, and libraries never depend on each other. Elements are used only by video pages (inside cues) and artifact pages (through `/_lib/<alias>/<element>`). Markdown never names them. The default library and `library.json`, the catalog of libraries and templates agentks offers, live in `neuralabshq/agent-knowledge-system-library`. The feature ships in Phase 2.

# 03 References

- [Libraries, dep.yaml and dep.lock](../../brainstorm/02_future-stages/09_libraries-and-dependencies.md): the discussion this note settles.
- [The ~/.agentks home and build cache](../../brainstorm/01_initial-discussion/07_agentks-home-and-build-cache.md): the cache layout and the manual cleanup.
- [Open question 13](../../brainstorm/01_initial-discussion/16_open-questions.md): why markdown carries no library syntax.
- [The repositories and three states](../../brainstorm/02_future-stages/12_repositories-and-three-states.md): the library repository and `library.json`.
- [Versioning and forced migrations](../../brainstorm/01_initial-discussion/12_versioning-and-forced-migrations.md): library migrations beside docs migrations.
- Sibling notes: [project config](../02_engine/02_project-config.md) (where `dep.yaml` sits among the config files), [machine home and build cache](../02_engine/06_machine-home-and-build-cache.md) (the `libraries/` folder), [Rust CLI](../02_engine/05_rust-cli.md) (the command surface), [publishing](../05_delivery/02_publishing-ssg.md) (how a build installs from the lock), [versioning and migrations](../05_delivery/03_versioning-and-migrations.md), [templates and init](./04_templates-and-init.md), [video pages](./05_video-pages.md), [extensions](./03_extensions.md).
- Today's artifact route, [the artifacts route folder](../../../../../../agent-ks-engine/src/pages/artifacts): the HTML trust boundary that `/_lib/` must respect.
- [2026-07-07-artifact-component](../../../2026-07-07-artifact-component/issue.md): today's artifact pages.
- [Libraries in the video issue](../../../2026-09-29-narrated-video-pages/notes/01_initial_discussion/07_libraries-and-reusable-elements.md): what videos draw from libraries.

# 04 Decisions

- Decided (sidhantha, 2026-09-29): libraries are downloaded and cached, never packaged with the binary, to keep it small.
- Decided (sidhantha, 2026-09-29): libraries are shared engine machinery, not a video-only feature.
- Decided (sidhantha, 2026-09-30): `config/dep.yaml` declares a project's libraries and must exist even when empty. `config/dep.lock` records what was resolved.
- Decided (sidhantha, 2026-09-30): a library comes from a git repository or a local folder. Any git URL is accepted, not only GitHub. A git entry may choose a tag, a commit, a branch or the latest release, and a subfolder.
- Decided (sidhantha, 2026-09-30): version ranges are allowed. Every version uses the x.y.z format.
- Decided (sidhantha, 2026-09-30): the lock pins every git library to an exact commit. The commit is the hash; no separate content hash is stored.
- Decided (sidhantha, 2026-09-30): local paths are relative to `dep.yaml`. A project's own artifacts can be a local library.
- Decided (sidhantha, 2026-09-30): agentks does not define kinds of library or element. Each library has a `manifest.json` at its root that describes it and its elements, with a required version.
- Decided (sidhantha, 2026-09-30): one library has one version series. Elements are not versioned on their own.
- Decided (sidhantha, 2026-09-30): every library states the engine versions it is built for. The engine does not depend on libraries, apart from knowing the default library's catalog.
- Decided (sidhantha, 2026-09-30): libraries cannot depend on other libraries. The list in `dep.yaml` is flat.
- Decided (sidhantha, 2026-09-30): library migrations are done by the library's owner, who publishes a new version. Users never migrate a library.
- Decided (sidhantha, 2026-09-30): the cache is global and shared by every project on the machine. Nothing cleans it automatically; cleanup is a command the user starts.
- Decided (sidhantha, 2026-09-30): starting agentks installs missing libraries automatically. `agentks install` pre-installs them.
- Decided (sidhantha, 2026-09-30): no separate artifact releases. A library is a repository, and its tags are its releases.
- Decided (sidhantha, 2026-09-30): the CLI and the skills read the installed libraries' manifests to help agents reuse elements.
- Decided (sidhantha, 2026-09-30): library elements are used only in video pages and artifact pages. Markdown gets no library syntax.
- Decided (sidhantha, 2026-09-30): the default library has its own repository, `neuralabshq/agent-knowledge-system-library`, with the templates and `library.json`. The official repositories are built into the binary.
- Decided (sidhantha, 2026-09-30): `library.json` lists the libraries and templates agentks offers for quick install. It never moves.
- Decided (sidhantha, 2026-09-30): `agentks library` works as a TUI and as plain commands. The TUI and the catalog are a convenience; any library can still be added through `dep.yaml`.
- Decided (sidhantha, 2026-09-30): the voice model is not a library.
- Decided (sidhantha, 2026-09-30), on claude's proposal: starting agentks never moves a pin; the cache is keyed by repository and commit, not by name; video and artifact pages name an element as `alias:element`; adding a library prints its source.
- Decided (claude, 2026-09-30): an entry with no `tag`, `commit` or `branch` means the latest release, because the short form should mean the safe default.
- Decided (claude, 2026-09-30): the lock nests its entries under `libraries:`, mirroring `dep.yaml`, so the two files read the same way.
- Decided (claude, 2026-09-30): `agentks install --update` re-resolves ranges as well as branches and latest entries. A range is a request to follow new matching versions, and it only moves when the user asks.
- Decided (claude, 2026-09-30): when the newest tag matching a selector needs a different engine, resolution fails and names both versions. It does not search older tags for a compatible one, so what gets installed is never a surprise.
- Decided (claude, 2026-09-30): elements are self-contained single files, like artifacts today. The exception is a folder child of a manifest-less local library, which is served as a folder with `index.html` as its entry.
- Decided (claude, 2026-09-30): library HTML is sandboxed, unlike the project's own artifacts. It is third-party code, so it gets no access to the site's origin.

# 05 Notes & Analysis

## 01 Terms

| Term | Meaning |
|---|---|
| **Library** | A folder with a `manifest.json` at its root (a local library may skip it). It lives in a git repository, optionally in a subfolder, or in a local folder |
| **Element** | One file a library offers, named in its manifest: an SVG, an image, an `.html` artifact, a script, a scene template |
| **Alias** | The key of an entry in `dep.yaml`. Pages name an element as `alias:element`, so two libraries can never clash |
| **Selector** | What version a git entry asks for: `tag` (exact or a range), `commit`, `branch`, or none, which means the latest release |
| **Pin** | The exact commit the lock records for a git entry |
| **Catalog** | `library.json` in the library repository: the libraries and templates agentks offers for quick install |
| **Cache** | `~/.agentks/libraries/`: one read-only copy of each repository at each pinned commit, shared by every project |

## 02 Where each piece lives

| File | Where | Written by | Committed |
|---|---|---|---|
| `dep.yaml` | the project's `config/` | the user, or `agentks library add` | yes, required even when empty |
| `dep.lock` | the project's `config/` | agentks only | yes |
| `manifest.json` | the root of each library (the `path` folder) | the library's owner | in the library's repository |
| `library.json` | the root of `neuralabshq/agent-knowledge-system-library` | the agentks team | in that repository; its address is built into the binary |
| cached libraries | `~/.agentks/libraries/<host>/<repository path>/<commit>/` | agentks | never; the machine's cache |

## 03 dep.yaml

```yaml
# config/dep.yaml: required. An empty project writes `libraries: {}`.
libraries:
  icons:                             # the alias: pages write icons:server
    github: neuralabshq/agent-knowledge-system-library
                                     # no selector: the latest x.y.z tag
  kit:
    github: acme/design-kit
    path: libraries/frames           # the library's folder inside the repository
    tag: 1.4.0                       # an exact version
  shapes:
    git: https://gitlab.com/acme/shapes.git
    tag: ^2.1                        # a range: the newest 2.x.y from 2.1.0
  charts:
    github: acme/charts
    commit: 3f9c2a1e7b4d...          # an exact commit, full 40-character hash
  nightly:
    github: acme/widgets
    branch: main                     # follows a branch, moved only on update
  team:
    path: ../artifacts               # a local folder, relative to this file
```

| Field | Required | Meaning |
|---|---|---|
| the key | yes | The **alias**. Lower-case letters, digits and hyphens, starting with a letter |
| `github` | one of `github` or `git`, for a git entry | `owner/repo` on GitHub. Shorthand for `https://github.com/owner/repo.git` |
| `git` | | Any git URL (HTTPS or SSH): GitLab, a self-hosted server, anything |
| `path` | for a local entry; optional for a git entry | For a git entry, the library's folder inside the repository (default: the root). For a local entry, the folder relative to `dep.yaml` |
| `tag` | at most one of `tag`, `commit`, `branch` | An exact version (`1.4.0`) or a range (`^1.4`, `~1.4.2`, `>=1.2.0 <2.0.0`) |
| `commit` | | A full commit hash |
| `branch` | | A branch name. Followed only when the user updates |

**Validation.** `agentks` refuses a `dep.yaml` that is missing, is not valid YAML, has no `libraries:` key, has an alias outside the allowed characters, has both `github` and `git`, has a local entry with a selector, or has more than one selector. Each error names the file, the alias and the fix. A local `path` must resolve to a folder inside the project's repository. One that escapes it (for example `../../other-project`) is an error, because the library would then be missing on every other machine.

**Why the file is required.** It gives agents one fixed place to look. It also marks a folder as an agentks project, which is what `agentks cache clean` scans for. The forced migration to 1.0.0 creates an empty one in existing projects.

## 04 Versions and selectors

- **A version tag** is a git tag named `x.y.z` or `vx.y.z`. Other tags are ignored when agentks looks for versions. Two tags that name the same version (`1.4.0` and `v1.4.0`) on different commits are an error.
- **An exact `tag`** (`1.4.0` or `v1.4.0`) resolves to that tag's commit.
- **A range** follows semantic-versioning rules (the Rust `semver` crate's syntax): `^1.4` means `>=1.4.0 <2.0.0`, `~1.4.2` means `>=1.4.2 <1.5.0`, and comparators combine. It resolves to the newest matching version tag.
- **Pre-release versions** (`2.0.0-beta.1`) match only an exact `tag`. A range and "latest" skip them.
- **No selector** means the newest version tag that is not a pre-release. A repository with no version tags is an error asking for a `branch` or a `commit`; agentks does not guess.
- **A `commit`** is used as given. **A `branch`** resolves to the branch's current head.

## 05 dep.lock

```yaml
# config/dep.lock: written by agentks, committed, never edited by hand
libraries:
  icons:
    github: neuralabshq/agent-knowledge-system-library
    requested: latest
    commit: 9d02e11c5a7f...
    version: 2.1.0            # read from the library's manifest.json
  kit:
    github: acme/design-kit
    path: libraries/frames
    requested: tag 1.4.0
    commit: 51aa0c3f9e20...
    version: 1.4.0
  nightly:
    github: acme/widgets
    requested: branch main
    commit: 0be41d77aa13...
    version: 0.9.2
```

- **Every git entry has a pin**, whatever was requested. `requested` records the selector as it was written (`latest`, `tag ^2.1`, `commit …`, `branch main`), so agentks can tell when `dep.yaml` changed.
- **The commit is the integrity check.** agentks fetches through git, and git checks every object it receives against the commit. No content hash is stored.
- **Local entries are not in the lock.** They live in the project's own git history.
- **The lock is only ever written by agentks**, and only by `start`, `install`, `library add` and `library remove`. It is written in a fixed order (aliases sorted), so a change shows as a small diff.

## 06 manifest.json

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

| Field | Required | Meaning |
|---|---|---|
| `name` | yes | The library's name, for people and the catalog. Pages never use it; they use the alias |
| `version` | yes | x.y.z. One version for the whole library: changing any element is a new version. A version tag that disagrees with it gives a warning |
| `description` | yes | One sentence on what the library is for |
| `engine` | yes | The agentks versions the library works with, as a range. Outside it, agentks refuses the library |
| `elements` | yes | A map from element name to its entry. It may be empty |
| `elements.<name>.file` | yes | The file, relative to the manifest. It must stay inside the library folder |
| `elements.<name>.description` | yes | What the element is and when to use it. This is what makes it findable |
| `elements.<name>.tags` | no | Free words the library chooses. agentks never interprets them; the CLI only searches them |

**Element names** use lower-case letters, digits and hyphens. They are flat: no slashes. A name is unique within its library.

**The one thing the engine owns is how to show a file**, and that follows from the file's type: an SVG or image is shown as an image, an `.html` file runs as an artifact in a sandboxed frame, and a script follows the contract of the page that uses it (the video widget contract, for example). What an element is *for* is the manifest's business.

**Elements are self-contained**, like artifacts today: an `.html` element inlines its CSS, scripts and images. It cannot rely on sibling files, because it is served by name, not by path.

`agentks check libraries` checks every library the project uses: a missing or malformed manifest, a missing required field, a `file` that does not exist or escapes the library, a repeated element name, and an `engine` range that excludes the running version.

## 07 Local libraries

A local entry (`path:` only) points at a folder in the project, for example the team's own artifacts.

- **With a manifest**, it works exactly like a git library, except that nothing is pinned or cached: agentks reads the folder in place and watches it like content.
- **Without a manifest**, each direct child of the folder is one element, named after it without its extension: `artifacts/checkout-flow.html` becomes `team:checkout-flow`. A child folder is an element too; its entry is its `index.html`, and its other files are served beside it. Two children with the same name after dropping the extension (`logo.svg` and `logo.png`) are an error.
- A manifest-less library has no descriptions, so `library find` can match only names. Adding a manifest is how a team makes its elements findable.

## 08 The catalog: library.json

The catalog sits at the root of `neuralabshq/agent-knowledge-system-library`. Its address is built into the binary, so it must never move. It lists what `agentks library` offers for quick install, and the templates `agentks init` can use ([templates and init](./04_templates-and-init.md)).

```json
{
  "libraries": {
    "agentks-default": {
      "description": "The default library: icons, frames, scene templates",
      "git": "https://github.com/neuralabshq/agent-knowledge-system-library.git",
      "path": ".",
      "latest": "1.0.0",
      "tags": ["icons", "frames", "video"]
    }
  },
  "templates": {
    "agentks-default": {
      "description": "A docs site with a guide, a blog and an issue tracker",
      "git": "https://github.com/neuralabshq/agent-knowledge-system-library.git",
      "path": "templates/agentks-default"
    }
  }
}
```

- An entry gives a name (the map key), a description, the git source and path, and for libraries the latest version and tags. The `latest` field is for display only; installation always resolves tags from git.
- **The catalog is read, never trusted for content.** Adding a catalog library writes an ordinary `dep.yaml` entry. From then on the entry resolves like any other, and the catalog plays no part.
- A library outside the catalog works the same way, through `dep.yaml`. The catalog only makes approved libraries easy to find.

## 09 The cache

```
~/.agentks/libraries/
  github.com/acme/design-kit/51aa0c3f9e20.../        the whole repository at one commit
  github.com/neuralabshq/agent-knowledge-system-library/9d02e11c5a7f.../
  gitlab.com/acme/shapes/77c1d0e4b9a2.../
```

- **Keyed by host, repository path and commit**, never by alias or name. Projects pinned to the same commit share one copy; different pins sit side by side.
- **One copy per repository and commit.** A repository holding several libraries in subfolders is fetched once; each entry reads its own `path` inside it.
- **Read-only.** agentks writes a commit's folder once, into a temporary folder that is renamed into place when complete, so a half-finished fetch never looks installed. Nothing edits a cached library afterwards.
- **Fetching** takes that one commit, shallow, through a Rust git library (gitoxide is the candidate). No `git` binary is needed. GitHub's download archives are not used, because they are not checked against the commit.
- **Cleanup** is manual: `agentks cache clean <root>...` ([machine home and build cache](../02_engine/06_machine-home-and-build-cache.md)).

## 10 Commands

Every command takes `--json`. The TUI is the one exception, because an agent cannot drive a TUI; each of its actions has a plain command.

| Command | What it does |
|---|---|
| `agentks start` | Before serving, runs the sync in section 11: installs every locked commit missing from the cache and resolves entries that are new or changed in `dep.yaml`. **Never moves an existing pin** |
| `agentks install` | The same sync, without starting a server. For a fresh clone, CI, or before going offline |
| `agentks install --update [alias...]` | Re-resolves `branch`, range and latest entries (all, or the named ones) to their newest match, and prints old → new for each |
| `agentks library` | With no arguments, opens the TUI: the catalog, what this project uses, what is already cached, install with one key |
| `agentks library add <source>` | Adds an entry and installs it. `<source>` is a catalog name, `owner/repo` or a git URL. Flags: `--as <alias>`, `--path`, `--tag`, `--commit`, `--branch`. Prints the source and the manifest summary |
| `agentks library add --local <folder>` | Adds a local entry, with the path written relative to `dep.yaml` |
| `agentks library remove <alias>` | Removes the entry and its lock record. The cached files stay until a cleanup |
| `agentks library list` | The project's libraries: alias, source, pin, version, element count |
| `agentks library show <alias>` | One library's manifest: every element with its description and tags |
| `agentks library find <words>` | Elements whose name, description or tags match, across the project's libraries |
| `agentks library search <words>` | Libraries in the catalog whose name, description or tags match |
| `agentks check libraries` | The manifest checks in section 06, plus every `alias:element` a page names |
| `agentks cache status` · `agentks cache clean <root>...` | Cache sizes; manual cleanup after a report ([machine home and build cache](../02_engine/06_machine-home-and-build-cache.md)) |

## 11 How a sync resolves

`start`, `install` and `library add` run the same sync, in the Rust engine, shared with the CLI:

1. **Read `dep.yaml`** and validate it (section 03). Stop on any error.
2. **Read `dep.lock`**, or treat it as empty if it does not exist yet.
3. **Compare entry by entry.** An alias in both files with the same source, `path` and `requested` selector keeps its pin. An alias that is new, or whose source, path or selector changed, is marked for resolution. An alias in the lock but no longer in `dep.yaml` is dropped from the lock.
4. **Resolve the marked entries**, and with `--update` also the branch, range and latest entries: list the repository's tags and branches, apply the selector (section 04), and get a commit.
5. **Fetch every pinned commit** that is not in the cache yet.
6. **Read each library's manifest** at its pin. Check that it is valid and that its `engine` range includes the running version.
7. **Write the lock** if anything changed, and report each change (added, removed, moved from → to).

A sync that fails in steps 4 to 6 leaves the old lock untouched. Pages never render against a half-updated set of libraries.

## 12 Errors

Every error names the page or the `dep.yaml` entry, what is wrong, and the command that fixes it. Nothing renders with a blank in place of a missing element.

| Situation | What happens |
|---|---|
| `config/dep.yaml` missing | Hard error naming the file. `agentks migrate` creates it for 0.x projects |
| Invalid `dep.yaml` | Hard error naming the alias and the rule broken |
| A locked commit is not cached and the machine is offline | Error naming the library and `agentks install` |
| No tag matches the selector, or no version tags exist | Error naming the alias and the tags found; suggests a `branch` or a `commit` |
| The resolved version's `engine` range excludes this agentks | Error naming the library, its range and this version. Suggests `agentks install --update`, a narrower selector, or pinning the older engine with mise |
| A manifest is missing or invalid | Error naming the library and the field |
| A page names an unknown alias or element | Error naming the page, the line and the name. The check reads only files, so `agentks check libraries` finds it too |
| A private repository without access | Error naming the repository and how to sign in (section 14) |

## 13 Where elements are used

**Only in video pages and artifact pages.** A markdown page never names a library element. Its body stays plain, portable markdown: `[text](./path.md)` links and `[[./path]]` embeds, both relative to the file ([content format](../02_engine/01_content-format.md)). Content written in agentks then opens cleanly in Obsidian or any other note app.

- **A video page** names elements inside its cues, for example `<!-- panel: icons:server -->`. Cues are HTML comments or a fenced block, so other apps hide them or show them as code ([video pages](./05_video-pages.md)).
- **An artifact** is HTML, not markdown. The engine serves each element at a reserved route, `/_lib/<alias>/<element>`, and the artifact loads it like any file, for example `<img src="/_lib/icons/server">`.

**Serving `/_lib/`.** The local server resolves the alias through the lock (or the local folder), finds the element's file through the manifest, and sets the content type from the file's extension. `_lib` is reserved in the router, like `artifacts`, so no section may use it. `agentks build` copies every element a page or artifact uses into the static output at the same path, so a published site needs no library at run time ([publishing](../05_delivery/02_publishing-ssg.md)).

## 14 Trust

A library can hold HTML and scripts that run in the local viewer and on a published site, so:

- **No library arrives unseen.** agentks installs only what `dep.yaml` lists. `agentks library add` prints the repository and the manifest summary before installing. `agentks start` never adds an entry on its own.
- **Content is verified by git** against the pinned commit on every fetch.
- **Library HTML is sandboxed.** Today's artifacts are the project's own, first-party code, so they run unsandboxed on the site's origin ([the artifacts route folder](../../../../../../agent-ks-engine/src/pages/artifacts)). A library is third-party code, so `/_lib/` serves `.html` and `.svg` elements with a `Content-Security-Policy: sandbox allow-scripts` header. The browser then gives them their own opaque origin, even when opened directly, and they cannot read the page around them or the site's storage.
- **A library script loaded by the project's own artifact** runs with that artifact's rights. The artifact's author chose to load it, and the review happens when the library is added to `dep.yaml`. The artifacts skill says so.
- **Private repositories.** GitHub uses the machine-level GitHub sign-in from the later GitHub issues layout ([the GitHub issues layout](../../brainstorm/02_future-stages/06_github-issues-layout.md)). Until then, and for other hosts, agentks uses the machine's git credentials (SSH keys and the credential helper).

## 15 Engine compatibility and library migrations

Only breaking engine releases change formats, so a library's `engine` range normally spans one major version.

- **The user upgrades the engine past a pinned library's range.** agentks stops, and names the library, its range and the engine version. It suggests `agentks install --update` to move to a library version built for the new engine, or pinning the older engine with mise.
- **`agentks migrate` checks every pinned library's range** while it migrates the docs, so the user hears about every mismatch at once, not one per start.
- **The owner migrates the library.** The engine's migrations folder has a `library/` part next to `docs/`. For a breaking engine release, the library's owner runs those scripts on the library, then tags a new version with the new `engine` range ([versioning and migrations](../05_delivery/03_versioning-and-migrations.md)). Libraries sit read-only in the users' caches, so users never edit or migrate them.

## 16 The default library

`neuralabshq/agent-knowledge-system-library` holds the default library (its `manifest.json` at the root), the templates, and `library.json`. It has its own version series, tagged in its repository, and is built and tested end to end with the engine and the client in step 1 of the launch. What it holds is decided by its manifest, not by the engine: icons, frames, scene templates and scripts are expected first. The engine knows only the catalog's address. It does not depend on any element being present, so a project that removes the default library still works.

## 17 What is not a library

| Thing | Where it comes from |
|---|---|
| The narration voice model | A separate download into `~/.agentks/models/` ([video pages](./05_video-pages.md)) |
| The agentks docs | Hosted at agentks.neuralabs.org/docs; `agentks docs` opens them |
| The build cache and generated audio | Produced by agentks, never downloaded |
| AI plugins and their skills | Installed through the agent's own marketplace ([AI plugins and skills](./02_ai-plugins-and-skills.md)) |
| Templates | Copied once by `agentks init`, never listed in `dep.yaml` ([templates and init](./04_templates-and-init.md)) |
| Migration scripts | Fetched by `agentks migrate` from the main repository ([versioning and migrations](../05_delivery/03_versioning-and-migrations.md)) |

## 18 Open

These are tracked in [open questions and risks](../01_overview/05_open-questions-and-risks.md):

- Whether a company can add its own catalog besides the built-in one.
- How `/_lib/` URLs inside an artifact get the hosting path prefix on a published site served under a prefix, such as agentks.neuralabs.org/docs. The static build must rewrite them or give artifacts a base URL.
- Whether an extension is a kind of library ([extensions](./03_extensions.md)).
