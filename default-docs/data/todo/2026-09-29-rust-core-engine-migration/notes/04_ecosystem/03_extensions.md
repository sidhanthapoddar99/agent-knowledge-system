---
title: "Extensions: agentksx commands and site scripts (later stage)"
---

An **extension** would add functionality to agentks itself, not just files. It could add commands that run as `agentksx <extension> <command>` (the x marks extended scope), and it could add JavaScript or TypeScript to the site, the way a project already adds CSS. Those scripts could run at build time, in the browser, or beside the local engine, to compute things such as search indexes or analytics from the page data. **Extensions are a possible later stage, not part of 1.0.** This note fixes the boundaries so that nothing built earlier gets in their way. An extension never changes what the engine derives. It is opted into explicitly in `dep.yaml`. The base static build stays the same, with the extension's scripts added on top.

# 03 References

- [Later stage: extensions](../../brainstorm/02_future-stages/11_extensions.md): the discussion.
- [The architecture: a local SPA over WebSocket](../../brainstorm/01_initial-discussion/17_local-spa-over-websocket.md): why rules stay in Rust.
- [Phase 3: publishing](../../brainstorm/02_future-stages/07_phase-3-publishing.md): the JavaScript runtime `agentks build` already needs, and islands.
- [CSS and theming](../../brainstorm/01_initial-discussion/10_css-and-theming.md): today's way to change the site.
- [2025-06-25-plugin-system](../../../2025-06-25-plugin-system/issue.md): the earlier plugin API with build and render hooks, set aside by the migration.
- Sibling notes: [library system](./01_library-system.md) (how an extension would be declared and fetched), [AI plugins and skills](./02_ai-plugins-and-skills.md) (why these are not called plugins), [shared UI package](../03_frontend/01_shared-ui-package.md) (islands), [publishing](../05_delivery/02_publishing-ssg.md), [Rust CLI](../02_engine/05_rust-cli.md).

# 04 Decisions

- Decided (sidhantha, 2026-09-30): extensions are a possible later stage. They could run commands through `agentksx <extension> <command>` and add JavaScript or TypeScript to the site, while the base static build stays the same.
- Decided (sidhantha, 2026-09-30): the word **plugin** means an AI-agent plugin, so this feature is not called a plugin.
- Decided (claude, 2026-09-30): the feature is called **extensions**. The user can rename it.
- Decided (sidhantha, 2026-09-29): rules stay in Rust. The frontend and anything added to it receive results, never rules.
- Decided (claude, 2026-09-30): an extension may add commands and browser behaviour, but never changes what the engine derives. This keeps the migration's central decision intact, and it is why the earlier plugin API with build and render hooks was set aside.
- Decided (claude, 2026-09-30): an extension runs only if the project lists it in `dep.yaml` and marks it as an extension, so a library of icons can never start running commands.
- Decided (claude, 2026-09-30): extension scripts only read page data and compute from it. They never write content.

# 05 Notes & Analysis

## 01 What an extension could do

| Surface | What it adds | Runs where |
|---|---|---|
| **Commands** | `agentksx <extension> <command> [args]`: for example a report over the tracker, an export, a link audit a team wants | On the user's machine, with the user's permissions, like `npx` |
| **Build-time scripts** | Files computed from the page data during `agentks build`: a search index, analytics, a sitemap variant | In the JavaScript runtime `agentks build` already needs (Bun or Node) |
| **Browser scripts** | Islands on the published page, or scripts on every page, that read those files and make the docs interactive | In the reader's browser |
| **Local sidecar** | The same scripts beside the local engine (state 2), computing from the data the engine already has | A JavaScript process next to the Rust engine, on localhost |

Nothing runs per request on a published site, so hosting stays plain static files.

## 02 Boundaries

- **Rules stay in Rust.** URLs, links, ordering, statuses, sidebars, outlines and validation are computed only by the engine. An extension receives the same page data the shared UI components receive. It can add to what is shown; it cannot change what is derived.
- **Read-only.** An extension computes from content. It never edits files. Content changes go through the user, an agent, or `agentks` commands.
- **The base build is unchanged.** Removing an extension from `dep.yaml` gives exactly the site agentks builds without it.
- **One data interface.** Build-time scripts, browser scripts and the sidecar read the page data through the same interface the shared UI package uses ([shared UI package](../03_frontend/01_shared-ui-package.md)). There is no second data format for extensions.

## 03 Declaring an extension (claude, proposed)

An extension is fetched like a library: a git repository, pinned in `dep.lock`, cached under `~/.agentks/libraries/`. What makes it an extension is an explicit opt-in in `dep.yaml`:

```yaml
libraries:
  search:
    github: acme/agentks-search
    tag: ^1.0
    extension: true      # without this, its commands and scripts never run
```

Its `manifest.json` would name the commands and scripts it provides beside its elements. Whether extensions really are libraries with a flag, or a separate kind of dependency, is still open (section 06).

## 04 Trust

- **Commands run with the user's permissions**, like `npx`. That is acceptable only because the user listed the extension in `dep.yaml` and marked it.
- **Site scripts are not sandboxed** the way library HTML is, because they must read the page. So they must be visible: the local site shows which extensions added scripts, and `agentks build` lists them in its output.
- **Pinned by commit**, like every library, so an update never slips in a new script unseen.

## 05 What stays out

- Build and render hooks that change how pages are parsed, linked or laid out. Custom layouts are dropped, and branding is CSS.
- A second implementation of any engine rule in JavaScript.
- Anything that needs a server on the published site.

## 06 Open

Tracked in [open questions and risks](../01_overview/05_open-questions-and-risks.md):

- Whether extensions are a kind of library (the `extension: true` flag above) or a separate thing.
- The contract for `agentksx` commands: how arguments and the project path are passed, output, `--json`, exit codes.
- Whether site scripts need a sandbox or a permission list.
- How the local sidecar is started and stopped alongside `agentks start`.
