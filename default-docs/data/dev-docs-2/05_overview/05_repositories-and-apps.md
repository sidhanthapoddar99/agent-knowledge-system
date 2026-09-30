---
title: "Repositories and apps"
description: "The three agentks repositories, the main repository's folders, and what each app owns and must not hold."
---

agentks lives in three repositories in the NeuraLabsHQ GitHub organisation. This page says what each one holds, how the main repository is laid out, and which folder owns which job. Use it to find where a change belongs before you open any code.

## The three repositories

| Repository | Holds | How it is released |
|---|---|---|
| `NeuraLabsHQ/agent-knowledge-system` | The engine and CLI, the shared UI package, the client, the static renderer, the homepage, agentks's own docs and the AI plugins | The installer, on GitHub Releases. The homepage and the docs are deployed, not released |
| `NeuraLabsHQ/agent-knowledge-system-library` | The default library and the catalog `library.json` | Its own x.y.z git tags. A tag is the release |
| `NeuraLabsHQ/neuralabs-plugin-marketplace` | The Neuralabs marketplace file for Claude Code plugins | Nothing to release. It points at plugin folders |

The engine and the UI change together, so they share one repository, one history and one version. The library has its own version series and its own owners, so it has its own repository. The marketplace serves all of Neuralabs, not only agentks.

The binary knows the addresses of the first two repositories. They are compiled in (`OFFICIAL_REPOSITORY` and `LIBRARY_REPOSITORY` in `agentks-core`), and no flag or environment variable changes them.

| Address | Used for |
|---|---|
| The main repository's GitHub Releases | `agentks update` and the installer |
| The main repository at the binary's own tag, folder `apps/agentks-engine/migrations/` | `agentks migrate` |
| The library repository's `library.json` | `agentks library` and `agentks init --template <id>` |

Every released binary reads these addresses, so they must never move. A file moved inside one of these repositories breaks every binary already installed.

## The main repository

```
agent-knowledge-system/
  ctl                         the one entrypoint for build, test and the gate
  data/builds/                development builds of the binary (ignored by git)
  apps/
    agentks-engine/           the Rust engine and CLI: one Cargo workspace, one binary
      crates/                 the 14 crates, one folder each, by layer
      schema/                 api.schema.json and the sample payloads (fixtures)
      themes/                 the built-in theme, embedded by the render crate
      migrations/             content migration scripts: docs/ and library/
    packages/
      agentks-ui/             every layout and component: data in, markup out
      agentks-video/          the video player: framework-free TypeScript
    agentks-client/           the single-page app of the local tool
    agentks-ssg/              the static renderer that agentks build runs
    agentks-homepage/         the homepage, a Next.js static export
    agentks-voice/            the voice helper, a separate Rust program
  docs/                       agentks's own docs: an ordinary agentks project
  plugins/                    the AI plugins
  AGENTS.md                   the brief every agent reads first
```

There is no JavaScript workspace. Each TypeScript app owns its own `package.json` and `bun.lock`. Code that two apps share goes in `apps/packages/`, and an app never imports from another app.

## Who owns each folder

| Folder | Owns | Must not hold |
|---|---|---|
| `apps/agentks-engine` | Config loading, the site index, the markdown pipeline, the tracker, every derived value, the server, the CLI, the data step of `agentks build`, the built-in theme, the `/api` schema, the migration scripts | Layout markup, or any UI code |
| `apps/packages/agentks-ui` | Every layout and component, as pure functions of their data | WebSocket code, browser-only objects such as `window` while rendering, any rule |
| `apps/packages/agentks-video` | Playing compiled video data in the browser | Any rule, any dependency |
| `apps/agentks-client` | Connecting `agentks-ui` to live data over the WebSocket: routing, the browser cache | Layouts of its own, or a copy of any component |
| `apps/agentks-ssg` | Rendering `agentks-ui` to HTML once per page, with islands | Layouts of its own, or any rule |
| `apps/agentks-voice` | Turning narration text into audio clips | Anything the engine workspace needs to compile |
| `apps/agentks-homepage` | The homepage at agentks.neuralabs.org | agentks docs content |
| `docs/` | The docs as content, their config and the website's Dockerfile | Code |
| `plugins/` | The AI plugins, each versioned in its own manifest | Engine code |
| `data/builds/` | Local build output | Anything committed |

An island is a small piece of JavaScript that a static page ships for one interactive part, such as the theme toggle or the issue filters. The rest of a published page is plain HTML.

The migration scripts live with the engine because the engine owns the content format. The engine never compiles them in. `agentks migrate` downloads them at run time.

## The library repository

```
agent-knowledge-system-library/
  library.json            the catalog: the libraries and templates agentks offers
  manifest.json           the default library's manifest
  components/<category>/  the default library's elements, one folder per category
```

A library is a git repository, or a local folder, with a `manifest.json` that lists its elements. A project names the libraries it uses in `config/dep.yaml`, and agentks pins each to a commit in `config/dep.lock`. The [libraries section](../35_libraries/01_overview.md) explains how the engine resolves, fetches and serves them.

## The AI plugins

The main repository ships two plugins in `plugins/`: the `agentks` usage plugin, whose skills teach an agent to write docs, run the tracker and use the CLI, and a plugin for developing libraries. They are markdown skills, not code. They never hold a rule the engine enforces. The engine and the CLI are the source of truth, and a skill that disagrees with them is the one that changes.

## Related

- [Components and contracts](./10_components.md): how these apps fit together at run time.
- [Engine](../10_engine/01_overview.md): the crates inside `apps/agentks-engine`.
- [Contributing](../55_contributing/01_overview.md): `ctl`, the gate and the development workflow.
