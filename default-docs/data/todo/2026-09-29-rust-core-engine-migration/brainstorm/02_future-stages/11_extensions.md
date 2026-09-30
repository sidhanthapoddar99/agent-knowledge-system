---
title: "Later stage: extensions (agentksx and site scripts)"
---

A later idea: libraries could one day **add functionality to agentks itself**, not only files. An extension could add commands, run as `agentksx <extension> <command>`, where the x means extended scope. It could also add JavaScript or TypeScript to the docs site, the way a project already overrides CSS. The base static build stays the same; the extension's scripts are added on top. This is not part of 1.0.

# 03 References

- [Libraries, dep.yaml and dep.lock](./09_libraries-and-dependencies.md) — how an extension would be declared and fetched.
- [CSS and theming](../01_initial-discussion/10_css-and-theming.md) — today's only way to change the site's look.
- [The architecture note](../01_initial-discussion/17_local-spa-over-websocket.md) — why rules stay in Rust.
- [2025-06-25-plugin-system](../../../2025-06-25-plugin-system/issue.md) — the earlier plugin API idea, set aside by the migration.

# 04 Decisions

- Decided (sidhantha, 2026-09-30): extensions are a possible later stage. They could run commands through `agentksx <extension> <command>` and add JavaScript or TypeScript to the site, while the base static build stays the same.
- Decided (claude, 2026-09-30): they are called **extensions**, because **plugin** already means an AI-agent plugin. The user can rename them.

# 05 Notes & Analysis

## 01 What the user described

- Libraries could later add functionality to agentks: `agentksx <plugin-name> <commands>` executes something the extension provides.
- JavaScript or TypeScript that is packaged with, or added to, the docs site for extra functionality. agentks already allows CSS changes; JavaScript injection could work the same way.
- The base static build remains the same.

## 02 What must hold if it is built (claude, proposed)

- **Rules stay in Rust.** An extension never changes what the engine derives: URLs, links, statuses, ordering. It can add commands and add behaviour in the browser. This keeps the migration's central decision intact, and it is why the earlier plugin API with build and render hooks was set aside.
- **Explicit opt-in.** `agentksx` runs code with the user's own permissions, like `npx`. An extension runs only if the project lists it in `dep.yaml` and marks it as an extension, so a library holding icons can never start running commands.
- **Site scripts are visible.** Injected scripts run on every page and are not sandboxed like artifacts. The site shows which extensions added scripts, and the static export lists them in its build output.

## 03 Scripts at build time and in the browser (from the 2026-09-30 discussion)

The user raised a further idea: library scripts that run on both sides, with a small JavaScript or TypeScript sidecar next to Rust that runs commands on the data. They never change the data. They compute something from it, such as complex search or analytics, and make the docs interactive.

With a static published site this needs no server (claude):

- **At build time**, in the same JavaScript runtime `agentks build` already uses: precompute a search index or analytics over the page data, written out as static files.
- **In the browser**, as an island on the page, reading those files.
- **Locally**, in state 2, the same scripts can run beside the engine as the sidecar the user described.

Nothing runs per request, so hosting stays plain static files.

## 04 Open points

- Whether extensions are a kind of library or a separate thing.
- The contract for `agentksx` commands: arguments, output, `--json`.
- Whether site scripts need a sandbox or a permission list.
