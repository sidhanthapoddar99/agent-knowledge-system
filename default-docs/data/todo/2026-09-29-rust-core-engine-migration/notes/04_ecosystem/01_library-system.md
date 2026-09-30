---
title: "Library system: dep.yaml, dep.lock, manifests and the catalog"
---

A **library** is a folder of reusable files, such as icons, frames, charts, animation presets, slide templates, HTML widgets and scripts, that a project uses without copying them in. Every project declares its libraries in `config/dep.yaml`. The file is required even when it is empty. An entry points at a git repository (GitHub or any git URL), optionally a subfolder inside it and a version, or at a local folder relative to `dep.yaml`. agentks pins every git entry to an exact commit in `config/dep.lock` and fetches that commit once per machine into `~/.agentks/libraries/`. Each library describes itself in a `manifest.json`: a name, one x.y.z version for the whole library, the engine versions it supports, and its **elements** (the individual files it offers, each with a description and tags). agentks does not define kinds of library, but every library keeps its elements in the same fixed structure, `components/<category>/`, with fifteen categories, and libraries never depend on each other. Elements are used only by video artifacts (in typed fields) and artifact pages (through `/_lib/<alias>/<element>`). Markdown never names them. The default library and `library.json`, the catalog of libraries and templates agentks offers, live in `NeuraLabsHQ/agent-knowledge-system-library`. The feature ships in Phase 2.

# 03 References

- [Libraries, dep.yaml and dep.lock](../../brainstorm/02_future-stages/09_libraries-and-dependencies.md): the discussion this note settles.
- [The ~/.agentks home and build cache](../../brainstorm/01_initial-discussion/07_agentks-home-and-build-cache.md): the cache layout and the manual cleanup.
- [Open question 13](../../brainstorm/01_initial-discussion/16_open-questions.md): why markdown carries no library syntax.
- [The repositories and three states](../../brainstorm/02_future-stages/12_repositories-and-three-states.md): the library repository and `library.json`.
- [Versioning and forced migrations](../../brainstorm/01_initial-discussion/12_versioning-and-forced-migrations.md): library migrations beside docs migrations.
- Sibling notes: [project config](../02_engine/02_project-config.md) (where `dep.yaml` sits among the config files), [machine home and build cache](../02_engine/06_machine-home-and-build-cache.md) (the `libraries/` folder), [Rust CLI](../02_engine/05_rust-cli.md) (the command surface), [publishing](../05_delivery/02_publishing-ssg.md) (how a build installs from the lock), [versioning and migrations](../05_delivery/03_versioning-and-migrations.md), [templates and init](./04_templates-and-init.md), [video artifacts](./05_video-pages.md), [extensions](./03_extensions.md).
- Today's artifact route, [the artifacts route folder](../../../../../../agent-ks-engine/src/pages/artifacts): the HTML trust boundary that `/_lib/` must respect.
- [2026-07-07-artifact-component](../../../2026-07-07-artifact-component/issue.md): today's artifact pages.
- [Libraries in the video issue](../../../2026-09-29-narrated-video-pages/notes/01_initial_discussion/07_libraries-and-reusable-elements.md): what videos draw from libraries.
- [Library components](../../../2026-09-29-narrated-video-pages/brainstorm/01_video-artifact-engine/08_library-components.md): the fifteen categories, the `category` field, each category's contract, the SVG allowlist and the day-one set. It settles [comment 003](../../comments/003_2026-09-30_library-components-layout.md).

# 04 Decisions

- Decided (sidhantha, 2026-09-29): libraries are downloaded and cached, never packaged with the binary, to keep it small.
- Decided (sidhantha, 2026-09-29): libraries are shared engine machinery, not a video-only feature.
- Decided (sidhantha, 2026-09-30): `config/dep.yaml` declares a project's libraries and must exist even when empty. `config/dep.lock` records what was resolved.
- Decided (sidhantha, 2026-09-30): a library comes from a git repository or a local folder. Any git URL is accepted, not only GitHub. A git entry may choose a tag, a commit, a branch or the latest release, and a subfolder.
- Decided (sidhantha, 2026-09-30): version ranges are allowed. Every version uses the x.y.z format.
- Decided (sidhantha, 2026-09-30): the lock pins every git library to an exact commit. The commit is the hash; no separate content hash is stored.
- Decided (sidhantha, 2026-09-30): local paths are relative to `dep.yaml`. A project's own artifacts can be a local library.
- Decided (sidhantha, 2026-09-30): agentks does not define kinds of library. Each library has a `manifest.json` at its root that describes it and its elements, with a required version.
- Decided (sidhantha, 2026-09-30): every library has a fixed structure, a `components/` folder with one folder per category ([comment 003](../../comments/003_2026-09-30_library-components-layout.md)).
- Decided (claude, 2026-10-01): the fifteen categories are icons, illustrations, images, backgrounds, frames, annotations, widgets, charts, layouts, slides, animations, transitions, styles, scripts and fonts, and the manifest gains a required `category` that matches the folder, because the video design needs a contract per category and a folder an agent can list ([library components](../../../2026-09-29-narrated-video-pages/brainstorm/01_video-artifact-engine/08_library-components.md)).
- Decided (sidhantha, 2026-09-30): one library has one version series. Elements are not versioned on their own.
- Decided (sidhantha, 2026-09-30): every library states the engine versions it is built for. The engine does not depend on libraries, apart from knowing the default library's catalog.
- Decided (sidhantha, 2026-09-30): libraries cannot depend on other libraries. The list in `dep.yaml` is flat.
- Decided (sidhantha, 2026-09-30): library migrations are done by the library's owner, who publishes a new version. Users never migrate a library.
- Decided (sidhantha, 2026-09-30): the cache is global and shared by every project on the machine. Nothing cleans it automatically; cleanup is a command the user starts.
- Decided (sidhantha, 2026-09-30): starting agentks installs missing libraries automatically. `agentks install` pre-installs them.
- Decided (sidhantha, 2026-09-30): no separate artifact releases. A library is a repository, and its tags are its releases.
- Decided (sidhantha, 2026-09-30): the CLI and the skills read the installed libraries' manifests to help agents reuse elements.
- Decided (sidhantha, 2026-09-30): library elements are used only in video artifacts and artifact pages. Markdown gets no library syntax.
- Decided (sidhantha, 2026-09-30): the default library has its own repository, `NeuraLabsHQ/agent-knowledge-system-library`, with the templates and `library.json`. The official repositories are built into the binary.
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
- Decided (claude, 2026-09-30): the HTML element contract in section 13: three messages (`agentks:element:data`, `agentks:element:theme`, `agentks:element:ready`), URL inputs resolved against the element's own address, and a screen frame's `src` as the one resource an element loads (section 14). [120/75 frames and widgets](../../subtasks/120_libraries/75_elements-frames-and-widgets.md) holds the reasons.

# 05 Notes & Analysis

## 01 Terms

| Term | Meaning |
|---|---|
| **Library** | A folder with a `manifest.json` at its root (a local library may skip it). It lives in a git repository, optionally in a subfolder, or in a local folder |
| **Element** | One file a library offers, named in its manifest and kept in one category folder: an SVG, an image, an `.html` widget, a JSON component such as a preset or a slide template, a script. The video design calls them components |
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
| `library.json` | the root of `NeuraLabsHQ/agent-knowledge-system-library` | the agentks team | in that repository; its address is built into the binary |
| cached libraries | `~/.agentks/libraries/<host>/<repository path>/<commit>/` | agentks | never; the machine's cache |

## 03 dep.yaml

```yaml
# config/dep.yaml: required. An empty project writes `libraries: {}`.
libraries:
  icons:                             # the alias: pages write icons:server
    github: NeuraLabsHQ/agent-knowledge-system-library
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
| the key | yes | The **alias**. Lower-case letters, digits and hyphens, starting with a letter. `self` is reserved |
| `github` | one of `github` or `git`, for a git entry | `owner/repo` on GitHub. Shorthand for `https://github.com/owner/repo.git` |
| `git` | | Any git URL (HTTPS or SSH): GitLab, a self-hosted server, anything |
| `path` | for a local entry; optional for a git entry | For a git entry, the library's folder inside the repository (default: the root). For a local entry, the folder relative to `dep.yaml` |
| `tag` | at most one of `tag`, `commit`, `branch` | An exact version (`1.4.0`) or a range (`^1.4`, `~1.4.2`, `>=1.2.0 <2.0.0`) |
| `commit` | | A full commit hash |
| `branch` | | A branch name. Followed only when the user updates |

**Validation.** `agentks` refuses a `dep.yaml` that is missing, is not valid YAML, has no `libraries:` key, has an alias outside the allowed characters, uses the reserved alias `self`, has both `github` and `git`, has a local entry with a selector, has more than one selector, or has a key it does not know (at the top or inside an entry). Each error names the file, the alias and the fix. A local `path` may leave the project folder, but it must resolve to a folder inside the git repository that holds the project. One that escapes the repository (for example `../../other-project`) is an error, because the library would then be missing on every other machine. The engine keeps the path as written in `dep.yaml`.

**Why the file is required.** It gives agents one fixed place to look. It also marks a folder as an agentks project, which is what `agentks cache clean` scans for. The forced migration to 1.0.0 creates an empty one in existing projects.

## 04 Versions and selectors

- **A version tag** is a git tag named `x.y.z` or `vx.y.z`. Other tags are ignored when agentks looks for versions, and so is a tag with build metadata (`1.4.0+build.7`). Two tags that name the same version (`1.4.0` and `v1.4.0`) on different commits are an error.
- **An exact `tag`** (`1.4.0` or `v1.4.0`) resolves to that tag's commit.
- **A range** follows semantic-versioning rules (the Rust `semver` crate's syntax): `^1.4` means `>=1.4.0 <2.0.0`, `~1.4.2` means `>=1.4.2 <1.5.0`, and comparators combine, separated by a comma or a space (`>=1.2.0 <2.0.0`). It resolves to the newest matching version tag.
- **Pre-release versions** (`2.0.0-beta.1`) match only an exact `tag`. A range and "latest" skip them.
- **No selector** means the newest version tag that is not a pre-release. A repository with no version tags is an error asking for a `branch` or a `commit`; agentks does not guess.
- **A `commit`** is used as given. **A `branch`** resolves to the branch's current head.

## 05 dep.lock

```yaml
# config/dep.lock: written by agentks, committed, never edited by hand
libraries:
  icons:
    github: NeuraLabsHQ/agent-knowledge-system-library
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
      "category": "frames",
      "file": "components/frames/phone-frame.svg",
      "description": "A phone with a screen slot. In a video, place an image or code on its screen",
      "tags": ["frame", "mobile"]
    },
    "server": {
      "category": "icons",
      "file": "components/icons/server.svg",
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
| `elements.<name>.category` | yes | One of the fifteen categories. It must match the folder the file sits in |
| `elements.<name>.file` | yes | The file, relative to the manifest, under `components/<category>/`. It must stay inside the library folder |
| `elements.<name>.description` | yes | What the element is and when to use it. This is what makes it findable |
| `elements.<name>.tags` | no | Free words the library chooses. agentks never interprets them; the CLI only searches them |

**Element names** use lower-case letters, digits and hyphens. They are flat: no slashes. A name is unique within its library.

**The engine owns two things: how to show a file, and each category's contract.** How to show a file follows from its type: an SVG or image is shown as an image, an `.html` widget runs in a sandboxed frame, and a JSON component is read by the video compiler. Each category's contract (view box, size cap, allowed content, the JSON Schema of a data category) is checked in one place, in Rust. What an element is *for* is the manifest's business.

**Elements are self-contained**, like artifacts today: an `.html` element inlines its CSS, scripts and images. It cannot rely on sibling files, because it is served by name, not by path.

`agentks check libraries` checks every library the project uses: a missing or malformed manifest, a missing required field, a `file` that does not exist or escapes the library, a repeated element name, an `engine` range that excludes the running version, a `category` that does not match the file's folder, and a component that breaks its category's contract.

### Components and their categories

Every library, git or local, keeps its elements in `components/<category>/`, one folder per category. The default library's repository keeps its other folders (`templates/`, `scripts/` for its own tooling, `preview/`, `LICENSES/`) beside `components/`; those are not elements.

| Category | Holds | Type |
|---|---|---|
| `icons` · `illustrations` · `backgrounds` · `frames` · `annotations` | Glyphs, artwork, slide backgrounds, anything with a screen slot (device chrome and containers), marks drawn around an item | SVG |
| `images` | Photos, screenshots, textures | WebP, AVIF, PNG, JPEG |
| `widgets` | Interactive HTML for artifacts | HTML |
| `charts` · `layouts` · `slides` · `animations` · `transitions` · `styles` | Chart templates, named grid areas, slide templates, motion presets, slide transitions, type and colour roles | JSON |
| `scripts` | Code components, later | JavaScript module |
| `fonts` | Typefaces for styles | WOFF2 |

- **Names stay unique within a library**, so `/_lib/<alias>/<element>` does not change. Where two categories want the same word, one takes a suffix: the frame is `phone-frame`, the icon is `phone`.
- **JSON components are read by the video compiler and never served** over `/_lib/`. Only images and widgets are served.
- **The contracts live once, in Rust.** `agentks check libraries` applies them, and `agentks video schema --component <category>` prints a data category's schema. A library's own CI calls `agentks check libraries` instead of copying the rules.
- The full contract of each category is in [library components](../../../2026-09-29-narrated-video-pages/brainstorm/01_video-artifact-engine/08_library-components.md#06-the-contract-of-each-category).

## 07 Local libraries

A local entry (`path:` only) points at a folder in the project, for example the team's own artifacts.

- **With a manifest**, it works exactly like a git library, except that nothing is pinned or cached: agentks reads the folder in place and watches it like content.
- **Without a manifest**, the folder follows the same `components/<category>/` structure. Each file is one element: its category is its folder and its name is its file name without the extension, so `components/widgets/checkout-flow.html` becomes `team:checkout-flow`. A child folder inside a category folder is an element too; its entry is its `index.html`, and its other files are served beside it. A child whose name breaks the element-name rule, and a folder with no `index.html`, are skipped with a warning. Two elements with the same name after dropping the extension (`logo.svg` and `logo.png`) are an error.
- A manifest-less library has no descriptions, so `library find` can match only names. Adding a manifest is how a team makes its elements findable.
- A folder video's own `components/` follows the same structure. It is read as a manifest-less library under the reserved alias `self`, used only by that video, and its SVG passes the same allowlist ([the format](../../../2026-09-29-narrated-video-pages/brainstorm/01_video-artifact-engine/03_artifact-format.md#the-videos-own-components)).

## 08 The catalog: library.json

The catalog sits at the root of `NeuraLabsHQ/agent-knowledge-system-library`. Its address is built into the binary, so it must never move. It lists what `agentks library` offers for quick install, and the templates `agentks init` can use ([templates and init](./04_templates-and-init.md)).

```json
{
  "libraries": {
    "agentks-default": {
      "description": "The default library: icons for technical docs, device and window frames, and small data widgets",
      "git": "https://github.com/NeuraLabsHQ/agent-knowledge-system-library.git",
      "path": ".",
      "latest": "1.0.0",
      "tags": ["icons", "frames", "widgets"]
    }
  },
  "templates": {
    "agentks-default": {
      "description": "A docs site with a guide, a blog and an issue tracker",
      "git": "https://github.com/NeuraLabsHQ/agent-knowledge-system-library.git",
      "path": "templates/agentks-default"
    }
  }
}
```

- An entry gives a name (the map key), a description, the git source and path, and for libraries the latest version and tags. The `latest` field is for display only; installation always resolves tags from git.
- **agentks reads the catalog from the repository's `main` branch.** It ignores keys it does not know, so a newer catalog stays readable by older binaries.
- **The catalog is read, never trusted for content.** Adding a catalog library writes an ordinary `dep.yaml` entry. From then on the entry resolves like any other, and the catalog plays no part.
- A library outside the catalog works the same way, through `dep.yaml`. The catalog only makes approved libraries easy to find.

## 09 The cache

```
~/.agentks/libraries/
  github.com/acme/design-kit/51aa0c3f9e20.../        the whole repository at one commit
  github.com/NeuraLabsHQ/agent-knowledge-system-library/9d02e11c5a7f.../
  gitlab.com/acme/shapes/77c1d0e4b9a2.../
```

- **Keyed by host, repository path and commit**, never by alias or name. Projects pinned to the same commit share one copy; different pins sit side by side.
- **One copy per repository and commit.** A repository holding several libraries in subfolders is fetched once; each entry reads its own `path` inside it.
- **Read-only.** agentks writes a commit's folder once, into a temporary folder that is renamed into place when complete, so a half-finished fetch never looks installed. Nothing edits a cached library afterwards.
- **Fetching** takes that one commit, shallow, by running the `git` program (`agentks-git`), so the machine needs git installed. GitHub's download archives are not used, because they are not checked against the commit.
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
| `agentks library show <alias> [--category <c>]` | One library's manifest: every element with its description and tags, optionally in one category. For `slides` it prints each template's slots |
| `agentks library find <words> [--category <c>]` | Elements whose name, description or tags match, across the project's libraries, optionally in one category |
| `agentks library search <words>` | Libraries in the catalog whose name, description or tags match |
| `agentks check libraries` | The manifest and category checks in section 06, plus every `alias:element` a page names |
| `agentks cache status` · `agentks cache clean <root>...` | Cache sizes; manual cleanup after a report ([machine home and build cache](../02_engine/06_machine-home-and-build-cache.md)) |

## 11 How a sync resolves

`start`, `install` and `library add` run the same sync, in the Rust engine, shared with the CLI:

1. **Read `dep.yaml`** and validate it (section 03). Stop on any error.
2. **Read `dep.lock`**, or treat it as empty if it does not exist yet.
3. **Compare entry by entry.** An alias in both files with the same source, `path` and `requested` selector keeps its pin. An alias that is new, or whose source, path or selector changed, is marked for resolution. An alias in the lock but no longer in `dep.yaml` is dropped from the lock.
4. **Resolve the marked entries**, and with `--update` also the branch, range and latest entries: list the repository's tags and branches, apply the selector (section 04), and get a commit.
5. **Fetch every pinned commit** that is not in the cache yet.
6. **Read each library's manifest** at its pin. Check that it is valid and that its `engine` range includes the running version.
7. **Write the lock** if anything changed, and report each change (added, removed, moved from → to). A project with no git libraries and no lock gets no `dep.lock`, so `git status` stays clean.

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

**Only in video artifacts and artifact pages.** A markdown page never names a library element. Its body stays plain, portable markdown: `[text](./path.md)` links and `[[./path]]` embeds, both relative to the file ([content format](../02_engine/01_content-format.md)). Content written in agentks then opens cleanly in Obsidian or any other note app.

- **A video artifact** names elements in typed fields of its YAML files (one `.video.yaml` file, or a video folder's files), for example `frame: ks:phone-frame` or `icon: ks:server`. The field gives the category, so no path is needed ([video artifacts](./05_video-pages.md)).
- **An artifact** is HTML, not markdown. The engine serves each element at a reserved route, `/_lib/<alias>/<element>`, and the artifact loads it like any file, for example `<img src="/_lib/icons/server">`. An SVG icon loaded through `<img>` cannot see the page's text colour, so it draws black. For a theme-coloured icon, the artifact uses a CSS mask or inserts the SVG inline. The default library's README shows both.

**Serving `/_lib/`.** The local server resolves the alias through the lock (or the local folder), finds the element's file through the manifest, and sets the content type from the file's extension. `_lib` is reserved in the router, like `artifacts`, so no section may use it. `agentks build` copies every element a page or artifact uses into the static output at the same path, so a published site needs no library at run time ([publishing](../05_delivery/02_publishing-ssg.md)).

**The HTML element contract.** An `.html` element, such as a frame or a widget, runs sandboxed in its own opaque origin (section 14). The page that embeds it, the parent, talks to it only through its address and through messages. The default library follows this contract, and the [library authoring guide](../../subtasks/120_libraries/90_library-authoring-guide.md) teaches it to other library authors.

- **Inputs** come from query parameters, for example `/_lib/default/phone-frame?theme=dark&src=…`. A comment at the top of each element lists its inputs.
- **A URL input resolves against the element's own address**, not against the parent's. So the parent passes full URLs, for example `new URL("./assets/app.png", location.href)`.
- **Messages** go through `postMessage` with target `"*"`, because the element's origin is opaque. The element checks each message's shape and ignores anything else.

| Message | From → to | What it does |
|---|---|---|
| `{ type: "agentks:element:data", data }` | parent → element | Sends input data, for example the rows of a table |
| `{ type: "agentks:element:theme", mode, tokens }` | parent → element | Switches to `light` or `dark`. `tokens` can map theme variable names to the site's values |
| `{ type: "agentks:element:ready" }` | element → parent | Says the element is listening, so the parent can send |

- **Theme.** `?theme=light|dark` sets the mode, else the reader's system setting. Styles use only the site's theme variable names. The built-in values copy today's default theme, because a sandboxed element cannot read the parent's CSS.
- **Screen frames** (phone, tablet, laptop and browser) show `src` as an image by default. With `kind=page`, they show it as a page in a nested iframe sandboxed with `allow-scripts`. They accept only `http(s)` URLs, plus `data:image` URLs for an image.
- **Bad input** shows a visible error in the element, never a blank or stale frame.
- **Size.** The element fills its iframe. Nothing has a fixed outer size.

## 14 Trust

A library can hold HTML and scripts that run in the local viewer and on a published site, so:

- **No library arrives unseen.** agentks installs only what `dep.yaml` lists. `agentks library add` prints the repository and the manifest summary before installing. `agentks start` never adds an entry on its own.
- **Content is verified by git** against the pinned commit on every fetch.
- **Library SVG inlined by the video compiler is the one exception to the sandbox.** The compiler inlines the SVG a video uses only after an allowlist: it parses each SVG and writes back only allowed elements and attributes, refuses `<style>`, animation elements, links and any outside reference, and prefixes every id per use. After that the SVG is drawing data: it cannot run or load anything ([SVG safety](../../../2026-09-29-narrated-video-pages/brainstorm/01_video-artifact-engine/08_library-components.md#svg-safety-an-allowlist)). `/_lib/` still serves SVG with the sandbox header.
- **Library HTML is sandboxed.** Today's artifacts are the project's own, first-party code, so they run unsandboxed on the site's origin ([the artifacts route folder](../../../../../../agent-ks-engine/src/pages/artifacts)). A library is third-party code, so `/_lib/` serves `.html` and `.svg` elements with a `Content-Security-Policy: sandbox allow-scripts` header. The browser then gives them their own opaque origin, even when opened directly, and they cannot read the page around them or the site's storage.
- **An HTML element loads nothing on its own.** It inlines its CSS and scripts, makes no network request and uses no storage. The one exception is a screen frame's `src`: the frame loads the URL the parent passes, as an image, or with `kind=page` as a page in a nested iframe sandboxed with `allow-scripts`. It loads only that URL, and only because the parent asked for it. The default library's check rejects an element that loads anything else.
- **A library script loaded by the project's own artifact** runs with that artifact's rights. The artifact's author chose to load it, and the review happens when the library is added to `dep.yaml`. The artifacts skill says so.
- **Private repositories.** GitHub uses the machine-level GitHub sign-in from the later GitHub issues layout ([the GitHub issues layout](../../brainstorm/02_future-stages/06_github-issues-layout.md)). Until then, and for other hosts, agentks uses the machine's git credentials (SSH keys and the credential helper).

## 15 Engine compatibility and library migrations

Only breaking engine releases change formats, so a library's `engine` range normally spans one major version.

- **The user upgrades the engine past a pinned library's range.** agentks stops, and names the library, its range and the engine version. It suggests `agentks install --update` to move to a library version built for the new engine, or pinning the older engine with mise.
- **`agentks migrate` checks every pinned library's range** while it migrates the docs, so the user hears about every mismatch at once, not one per start.
- **The owner migrates the library.** The engine's migrations folder has a `library/` part next to `docs/`. For a breaking engine release, the library's owner runs those scripts on the library, then tags a new version with the new `engine` range ([versioning and migrations](../05_delivery/03_versioning-and-migrations.md)). Libraries sit read-only in the users' caches, so users never edit or migrate them.

## 16 The default library

`NeuraLabsHQ/agent-knowledge-system-library` holds the default library (its `manifest.json` at the root), the templates, and `library.json`. It has its own version series, tagged `vX.Y.Z` in its repository, and is built and tested end to end with the engine and the client in step 1 of the launch. What it holds is decided by its manifest, not by the engine. Its elements follow [the day-one set](../../../2026-09-29-narrated-video-pages/brainstorm/01_video-artifact-engine/08_library-components.md#08-the-day-one-set): the full Lucide icon set (ISC licence) beside 74 curated icons for technical docs, which win any name clash; frames as SVG with a screen slot, with the six device frames also offered as `-view` widgets; three small data widgets; and about 115 video components (styles, layouts, slide templates, presets, transitions, backgrounds, annotations, charts, illustrations). There is no `github` icon, because GitHub's logo terms forbid changing the mark ([120/70 icons](../../subtasks/120_libraries/70_elements-icons.md)). The video components belong to [120/80 the video component set](../../subtasks/120_libraries/80_elements-video-cue-kit.md). The shared CSS and JavaScript of its HTML elements are written once in `scripts/shared/`. Each element carries a marked copy, `scripts/check.py --sync-shared` rewrites the copies, and the check fails when a copy drifts. The engine knows only the catalog's address. It does not depend on any element being present, so a project that removes the default library still works.

## 17 What is not a library

| Thing | Where it comes from |
|---|---|
| The voice helper and its model | Separate downloads into `~/.agentks/tools/` and `~/.agentks/models/`, by `agentks voice install` ([video artifacts](./05_video-pages.md)) |
| The agentks docs | Hosted at agentks.neuralabs.org/docs; `agentks docs` opens them |
| The build cache and the audio store | Produced by agentks, never downloaded |
| AI plugins and their skills | Installed through the agent's own marketplace ([AI plugins and skills](./02_ai-plugins-and-skills.md)) |
| Templates | Copied once by `agentks init`, never listed in `dep.yaml` ([templates and init](./04_templates-and-init.md)) |
| Migration scripts | Fetched by `agentks migrate` from the main repository ([versioning and migrations](../05_delivery/03_versioning-and-migrations.md)) |

## 18 Open

These are tracked in [open questions and risks](../01_overview/05_open-questions-and-risks.md):

- Whether a company can add its own catalog besides the built-in one.
- How `/_lib/` URLs inside an artifact get the hosting path prefix on a published site served under a prefix, such as agentks.neuralabs.org/docs. The static build must rewrite them or give artifacts a base URL.
- Whether an extension is a kind of library ([extensions](./03_extensions.md)).
