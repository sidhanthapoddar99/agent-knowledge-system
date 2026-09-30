---
title: "Docs: libraries and templates"
status: review
---

Libraries are new in 1.0: git repositories of reusable elements (icons, frames, widgets, video cue kits) that a project names in `config/dep.yaml` and pins in `config/dep.lock`. Templates are the starting projects `agentks init` copies. This leaf documents both, for two readers: people who use libraries, and people who build and host them. There is no page for this in today's docs.

# 01 To Do
- [x] **`40_libraries/01_overview.md`** — what a library is, what it is for, where its elements can be used (video pages inside cues, artifact pages through `/_lib/<alias>/<element>`), and that library HTML runs sandboxed.
- [x] **Using a library** — `dep.yaml` sources (`github:`, `git:`, a local `path` relative to `dep.yaml`); selectors (`tag` exact or a range such as `^1.4`, `commit`, `branch`, none meaning the latest x.y.z tag); `agentks install` and `--update`; what `dep.lock` pins; the machine cache; offline use.
- [x] **The catalog and the TUI** — `agentks library` (browse, search, add), the plain subcommands, `library.json` in the library repository.
- [ ] **Using elements** — referencing an element from a video cue and from an artifact; the element's description and tags from `manifest.json`; `agentks library find` for agents.
- [x] **Templates** — `agentks init --template <id or url> <path>`, the default template, what a template contains.
- [x] **Building a library** — `manifest.json` (name, x.y.z version, description, the required engine range, elements with file, description and tags); one version series per library; tagging a release; library migrations run by the owner (`agentks migrate --library`); the library-development plugin.
- [x] **Hosting a library** — any git host; private libraries through git credentials; adding it to a catalog.
- [x] **Cleaning up** — `agentks cache clean <root>` and what it keeps.

## Guardrails
- Group rules in [180/00 overview](./00_overview.md).
- Every example uses a real library at a real tag, starting with the default library, and every command was run.

## Done when
- The section exists under `docs/data/user-guide/40_libraries/` and renders.
- A reader can add the default library to a new project and use one element on an artifact page following only these pages (tested by a fresh agent).
- A reader can create a one-element library in a local git repository and use it through a `path` source.

# 02 Status and Result
**Still open on purpose, do not close yet:** the "Using elements" To Do item waits for the revised video format ([100/40](../100_layouts/40_video-pages.md)), and the guardrail that every command was run waits for the library commands in the binary ([120/40](../120_libraries/40_library-commands-and-tui.md)).

Review. Ten pages are written in `user-guide-2/40_libraries/` and pass `agent-ks check section` and `agent-ks check link-form`; the video half of "using elements" waits for the revised video format.

## Result
- [Libraries](../../../../user-guide-2/40_libraries/01_overview.md): what a library, an element, an alias, a pin, the catalog and the machine cache are; the dep.yaml → dep.lock → cache → page flow as a diagram; where elements may be used; the default library; trust.
- [Declaring libraries in dep.yaml](../../../../user-guide-2/40_libraries/05_dep-yaml.md): the required file, every field, selectors and version tags, ranges and pre-releases, local libraries and their repository limit, and every refusal.
- [Installing, updating and removing](../../../../user-guide-2/40_libraries/10_installing-and-updating.md): `library add` and its flags, what `dep.lock` records and who writes it, the sync, `install --update`, the engine-range failure, `library remove` and `list`, private repositories, offline use, a pointer to cache cleanup, and the error table.
- [Finding elements](../../../../user-guide-2/40_libraries/15_finding-elements.md): `library find`, `show`, `list` and `search`, the terminal browser, the `library.json` format, and tips for agents.
- [Using elements in artifacts](../../../../user-guide-2/40_libraries/20_using-elements.md): the `/_lib/<alias>/<element>` address, what each category offers an artifact, theme-coloured icons, widgets, `alias:element` in video artifacts, never in markdown, and `check libraries`.
- [HTML elements](../../../../user-guide-2/40_libraries/25_html-elements.md): the sandbox, query-parameter inputs, full URLs, the three messages, theme mode, device views, and the rules for writing an HTML element.
- [Templates and agentks init](../../../../user-guide-2/40_libraries/30_templates.md): every `init` flag, the seven steps, what a template holds, copy-once, and making your own template.
- [Building a library](../../../../user-guide-2/40_libraries/35_building-a-library.md), [Testing a library](../../../../user-guide-2/40_libraries/37_testing-a-library.md) and [Releasing a library](../../../../user-guide-2/40_libraries/40_releasing-a-library.md): the authoring guide of [120/90](../120_libraries/90_library-authoring-guide.md) — the `components/<category>/` layout and the fifteen categories, `manifest.json` field by field, element rules, manifest-less local libraries, a test project with a `path:` entry, what `check libraries` checks, version tags, the engine range, hosting, private libraries, the catalog, `agentks migrate --library`, and the library authors' AI plugin.
- **Left:** the video half of "using elements". The pages say a video names an element as `alias:element` and that the data categories are for videos, but give no field names, no `agentks video schema` and no JSON size caps, because the video format is being revised.
- **Not run:** no command on these pages was run. The CLI worktree's binary answers "not implemented yet: config discovery", and the default library has no version tag yet, so the examples use `^1.0` and `1.0.0` for its planned first tag.
- **Found:** `agentks-library` on `wave2/library` rejects the manifest key `category` (its element keys are `file`, `description` and `tags`), and it lists a manifest-less local library's direct children instead of `components/<category>/`. The real default library's `manifest.json` carries `category` on every element, so it would not load. The pages follow the notes' 2026-10-01 decision; the crate needs the change.

## Agent log
none

# 03 References
- **Repository:** `NeuraLabsHQ/agent-knowledge-system`, folder `docs/data/user-guide/40_libraries/`.
- **Read first:**
  - [Library system](../../notes/04_ecosystem/01_library-system.md) — the full contract: `dep.yaml`, `dep.lock`, `manifest.json`, `library.json`, resolution, errors.
  - [Templates and init](../../notes/04_ecosystem/04_templates-and-init.md).
  - [AI plugins and skills](../../notes/04_ecosystem/02_ai-plugins-and-skills.md) — the library-development plugin.
  - [Libraries and dependencies](../../brainstorm/02_future-stages/09_libraries-and-dependencies.md).
- **Depends on:** the [120/00 libraries](../120_libraries/00_overview.md) group, especially [120/90 library authoring guide](../120_libraries/90_library-authoring-guide.md) (which this section publishes or links), [140/40 library migrations](../140_versioning-and-migrations/40_library-migrations.md).
- **Unblocks:** [200/20 switch-over](../200_launch/20_switch-over.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): `dep.yaml` is required even when empty; sources are git URLs or local paths; `dep.lock` pins commits ([library system](../../notes/04_ecosystem/01_library-system.md)).
- Decided (sidhantha, 2026-09-30): elements are used only in video pages and artifact pages; there are no element kinds and no dependencies between libraries.
- Decided (claude, 2026-10-01): the library authoring guide that [120/90](../120_libraries/90_library-authoring-guide.md) asks for lives in this section, as the building, testing and releasing pages plus the author half of the HTML elements page. The library repository's `AGENTS.md` keeps only its short in-repo version. The watch-out below asks for one copy of each fact, and 120/90 already places the guide in the new docs.
- Decided (claude, 2026-10-01): cache cleanup is documented once, in the getting-started machine-home page that [180/10](./10_getting-started.md) wrote. The installing page keeps a short pointer, because two full copies would drift.
- Decided (claude, 2026-10-01): the examples give the default library the alias `default`, as the library repository's README does, so a reader sees the same `/_lib/default/…` addresses in both places.
- Decided (claude, 2026-10-01): the pages leave out `--category` on `library find` and `library show`, because the CLI's argument definitions do not have it yet, and leave out video field names and `agentks video schema`, because the video format is being revised.
- Decided (claude, 2026-10-01): the pages document the manifest's required `category` and the `components/<category>/` layout of manifest-less local libraries as the notes settle them, although the `wave2/library` code predates that decision. The notes' decision is the later one, and the real default library already follows it.
- Decided (claude, 2026-10-01): `--template` takes a catalog id or a git URL, as the CLI help says. The notes' decisions name only those two, so `owner/repo` and a local folder come out of the templates page.

# 05 Notes & Analysis

## Watch out
- [120/90](../120_libraries/90_library-authoring-guide.md) may produce an authoring guide inside the library repository. Keep one copy of each fact: either this section links to it, or it moves here. Decide when both exist and record it.
