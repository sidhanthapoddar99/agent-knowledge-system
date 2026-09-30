---
title: "Repositories and the main repository's layout"
---

agentks lives in three repositories under the **NeuraLabsHQ** GitHub organisation. `NeuraLabsHQ/agent-knowledge-system` is the main repository. It holds the Rust engine and CLI, the shared UI package, the local client, the static renderer, the homepage, agentks's own docs (and later the tracker) and the AI plugins. `NeuraLabsHQ/agent-knowledge-system-library` holds the default library, the project templates and `library.json`, the catalog `agentks library` reads. `NeuraLabsHQ/neuralabs-plugin-marketplace` is the Claude Code marketplace for all of Neuralabs; it only points at plugins that live elsewhere. The main repository starts from scratch, set up with the project-setup guide, and only what is needed moves across from this repository. The tracker moves into the main repository's `docs/` once the Rust engine and the client render it correctly.

# 03 References

- [Architecture](../01_overview/03_architecture.md) — the components each folder below holds.
- [Distribution and install](./04_distribution-and-install.md) — what the main repository releases.
- [Development workflow and testing](./05_development-workflow-and-testing.md) — how the repository is worked on (state 1).
- [Docs rewrite and launch](./07_docs-rewrite-and-launch.md) — when each repository comes into use and when this one is archived.
- [Library system](../04_ecosystem/01_library-system.md) — what the library repository and `library.json` hold.
- [AI plugins and skills](../04_ecosystem/02_ai-plugins-and-skills.md) — the two plugins in `plugins/`.
- [Brainstorm: the repositories and three states](../../brainstorm/02_future-stages/12_repositories-and-three-states.md) — the discussion behind this note.
- Today's repository layout: [AGENTS.md](../../../../../../AGENTS.md), section "Repository Layout".

# 04 Decisions

- Decided (sidhantha, 2026-09-30): the project moves to the NeuraLabsHQ GitHub organisation.
- Decided (sidhantha, 2026-09-30): three repositories — `NeuraLabsHQ/agent-knowledge-system` (engine, client, homepage, docs, plugins), `NeuraLabsHQ/agent-knowledge-system-library` (the default library, templates, `library.json`) and `NeuraLabsHQ/neuralabs-plugin-marketplace` (the Neuralabs marketplace). Libraries get their own repository to keep the main one simple.
- Decided (sidhantha, 2026-09-30): the main repository's layout in section 02, set up with the project-setup guide. The apps folder is `apps/`.
- Decided (sidhantha, 2026-09-30): the layouts and components live in `apps/packages/agentks-ui`, shared by `apps/agentks-client` and `apps/agentks-ssg`.
- Decided (sidhantha, 2026-09-30): the homepage is open source and lives in the main repository.
- Decided (sidhantha, 2026-09-30): development builds go to `data/builds/`, ignored by git.
- Decided (sidhantha, 2026-09-30): the new repository starts from scratch; only what is needed moves across.
- Decided (sidhantha, 2026-09-30): the official repositories' addresses are built into the binary. Migration scripts and the library catalog are downloaded from them.
- Decided (sidhantha, 2026-09-30): the tracker does not move yet. It moves into `docs/` once the Rust engine and the client work.
- Decided (sidhantha, 2026-09-30): the three repositories are private in the NeuraLabsHQ organisation until launch, each in its own folder of the Neuralabs workspace. They were created on 2026-09-30.
- Decided (sidhantha, 2026-09-30): the marketplace moves from the personal account to `NeuraLabsHQ/neuralabs-plugin-marketplace`. The personal marketplace stays for personal plugins.
- Decided (claude, 2026-09-30): no JavaScript workspace; each TypeScript app owns its `package.json` and `bun.lock` ([190/20 app scaffold](../../subtasks/190_homepage/20_app-scaffold.md)).
- Decided (claude, 2026-09-30): the engine folder holds `crates/` with short folder names ([030/10 crate boundaries](../../subtasks/030_rust-engine/10_workspace-and-crate-boundaries.md)), `schema/` for the `/api` schema and fixtures ([030/80 page data](../../subtasks/030_rust-engine/80_page-data-interface.md)) and `themes/`, theme data outside any crate ([030/85 theme compiler](../../subtasks/030_rust-engine/85_theme-css-compiler.md)).
- Proposed (claude, 2026-09-30), not yet agreed: the tracker move in section 05 (active issues only, same folder names); the per-folder ownership table in section 03; `ctl` as the repository's one entrypoint and `docs/Dockerfile` for the website, both following the project-setup guide; `templates/` as the templates' folder in the library repository.

# 05 Notes & Analysis

## 01 The three repositories

| Repository | Holds | Released how | Why separate |
|---|---|---|---|
| `NeuraLabsHQ/agent-knowledge-system` | Engine, CLI, shared UI package, client, static renderer, homepage, docs, AI plugins | The installer, on GitHub Releases ([distribution](./04_distribution-and-install.md)). The homepage and docs are deployed, not released ([hosting](./06_deployment-and-hosting.md)) | The main product. Engine and UI change together, so they share one history and one version |
| `NeuraLabsHQ/agent-knowledge-system-library` | The default library (`manifest.json` and its elements), the templates, `library.json` | Its own x.y.z tags. A tag is the release; there is no release pipeline | A library has its own version series and its own owners' migrations. Keeping it out of the main repository keeps the main one simple |
| `NeuraLabsHQ/neuralabs-plugin-marketplace` | The Neuralabs Claude Code marketplace file | Nothing to release; it points at plugin folders | Serves all of Neuralabs, not only agentks |

The binary knows two of these addresses: the main repository (for releases and migration scripts) and the library repository (for `library.json` and templates). It never needs the marketplace; the AI agent's own plugin tooling reads that.

## 02 The main repository's layout

```
agent-knowledge-system/            NeuraLabsHQ/agent-knowledge-system
  ctl                              the one entrypoint (project-setup guide): dev, gate, …
  .mise.toml                       puts data/builds/ first on PATH inside the repo
  data/
    builds/                        development builds of the binary (ignored by git)
  apps/
    packages/
      agentks-ui/                  shared layouts and components: data in, markup out
      agentks-video/               the video player: framework-free TypeScript, no dependencies
    agentks-engine/                the Rust engine and CLI, one binary
      crates/                      the Cargo workspace's 15 crates, one folder each, by layer
      schema/                      api.schema.json and the hand-written page fixtures
      themes/                      the built-in theme (embedded by the render crate) and example themes
      migrations/
        docs/                      migrations users run on their own content
        library/                   migrations library owners run on their library
      release-notes/               one note per installer release
    agentks-client/                the Vite single-page app for the local tool (state 2)
    agentks-ssg/                   the static renderer run by agentks build (state 3)
    agentks-homepage/              the Next.js homepage, exported as static files
    agentks-voice/                 the voice helper: Kokoro through ONNX Runtime; its own crate, outside the engine's workspace
  docs/                            agentks's own docs: an ordinary agentks project
    config/                        site.yaml, navbar.yaml, footer.yaml, dep.yaml, dep.lock
    data/                          the docs sections; later the tracker
    Dockerfile                     builds the website: homepage at /, docs at /docs
  plugins/
    agentks/                       the usage plugin (agent-ks today)
    agentks-library/               the library-development plugin (working name)
  .github/workflows/               installer release, gate, website build
  AGENTS.md, README.md, RELEASING.md
```

There is no JavaScript workspace. Each TypeScript app owns its `package.json` and `bun.lock`, because the project-setup guide rules out a JS workspace and `ctl check` fails one. Shared code goes in `apps/packages/`. An app that uses it names the package as a path alias in its Vite and TypeScript config, because Bun cannot install a package with `link:` ([shared UI package](../03_frontend/01_shared-ui-package.md) section 07).

```
agent-knowledge-system-library/    NeuraLabsHQ/agent-knowledge-system-library
  library.json                     the catalog: libraries and templates agentks offers
  manifest.json                    the default library's manifest
  components/<category>/           the default library's elements, one folder per category: icons, frames, charts, animations, slides, …
  templates/
    agentks-default/               the template agentks init uses by default
```

## 03 Who owns each folder

| Folder | Owns | Must not hold |
|---|---|---|
| `apps/agentks-engine` | Config loading, the site index, the markdown pipeline, the tracker, every derived value, the WebSocket server, the CLI, `agentks build`'s data step, the migration scripts, the built-in theme, the `/api` schema | Layout markup. Any UI code |
| `apps/packages/agentks-ui` | Every layout and component, pure: data in, markup out | WebSocket code, `window` or other browser-only objects while rendering, any rule |
| `apps/packages/agentks-video` | The video player: plays compiled video data with the Web Animations API | Loading or checking a video's YAML, any rule, any dependency |
| `apps/agentks-voice` | The voice helper, released as its own archive | Anything the engine's workspace needs to compile |
| `apps/agentks-client` | Wiring `agentks-ui` to live data over the WebSocket; routing; the browser cache; PWA shell | Layouts of its own. A copy of any component |
| `apps/agentks-ssg` | Rendering `agentks-ui` to HTML once per page; islands; diagram-to-SVG | Layouts of its own. Any rule |
| `apps/agentks-homepage` | The marketing homepage | agentks docs content |
| `docs/` | The docs as content, their config and the website's Dockerfile | Code |
| `plugins/` | The two AI plugins, versioned in their own manifests | Engine code |
| `data/builds/` | Local build output | Anything committed |

The migration scripts sit with the engine because the engine owns the content format ([versioning and migrations](./03_versioning-and-migrations.md)).

## 04 What moves across from this repository

| From here | To | How |
|---|---|---|
| The Rust CLI in [agent-ks-cli/](../../../../../../agent-ks-cli/README.md) | `apps/agentks-engine` | Its code becomes the start of the Rust core. The duplicated engine rules merge into it |
| The migration scripts in [agent-ks-engine/migration/](../../../../../../agent-ks-engine/migration/README.md) | `apps/agentks-engine/migrations/docs/` | Kept and extended so `agentks migrate` covers every 0.x format |
| The skills in `plugins/agent-ks/` | `plugins/agentks/` | Rewritten for the new version before the switch-over |
| Layout designs and CSS in `agent-ks-engine/src/layouts/` and `src/styles/` | `apps/packages/agentks-ui` | Rebuilt as components; the design carries over, the Astro code does not |
| The route-parity and link checks in [scripts/checks/](../../../../../../scripts/checks/check-route-parity.mjs) | The new repository's gate | Reworked for the new engine ([development workflow](./05_development-workflow-and-testing.md)) |
| Nothing else | — | The new repository starts from scratch |

## 05 Moving the tracker (claude, proposed)

- **When.** Once the Rust engine and the client render this tracker correctly. Moving it earlier would put it in a repository whose tools cannot show it.
- **What.** The active issues, copied into `docs/data/todo/` with the same folder names, so links between issues still resolve. Closed issues stay in this repository, which becomes read-only history when it is archived.
- **After.** The copies are the only live tracker. A comment in each moved issue here points at its new home, so nobody edits the old copy.

## 06 The binary's built-in addresses

| Address | Used for |
|---|---|
| Main repository's GitHub Releases | `agentks update` and the installer ([distribution](./04_distribution-and-install.md)) |
| Main repository at the binary's own tag, `apps/agentks-engine/migrations/` | `agentks migrate` ([versioning](./03_versioning-and-migrations.md)) |
| Library repository, `library.json` | `agentks library`, `agentks init --template <id>` ([library system](../04_ecosystem/01_library-system.md)) |
| `https://agentks.neuralabs.org/docs` | `agentks docs` ([hosting](./06_deployment-and-hosting.md)) |

Every released binary reads these, so none of them may move. A repository rename is safe only because GitHub redirects renamed repositories; a moved file inside a repository breaks every released binary.

## 07 Open

- The library-development plugin's final name.
