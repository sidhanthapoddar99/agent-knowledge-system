---
title: "The dev toolbar"
---

The dev toolbar is a **bar, like Astro's dev toolbar**, that the local client shows over every page. It arrives in **Phase 2**; Phase 1 ships without it. It holds the **Edit** option, which turns editing on for the page in view ([editor engines](./03_editor-engines.md)), and the developer tools rebuilt from today's Astro toolbar apps. Which of those tools come back is still [open question 04](../01_overview/05_open-questions-and-risks.md); this note records claude's recommendation. The toolbar exists **only in the client app**. The static renderer never imports it, so a published page contains none of its code, rather than containing it hidden. It talks to Rust over the same `/api` WebSocket as everything else; today's separate dev HTTP routes go away.

# 03 References

- [The dev toolkit](../../brainstorm/02_future-stages/03_dev-toolkit.md) and [editing mode](../../brainstorm/02_future-stages/02_editing-mode.md) — the discussion and decisions.
- [Editor engines](./03_editor-engines.md) — what Edit turns on.
- [The client application](./02_client-application.md) — the app the toolbar lives in, and its WebSocket client.
- [The sync engine and server](../02_engine/04_sync-engine-and-server.md) — the server side of the tool messages.
- [The Rust CLI](../02_engine/05_rust-cli.md) — `agentks cache status` and `clean`, the command-line side of cache clearing.
- [2025-06-25-dev-toolbar-enhancements](../../../2025-06-25-dev-toolbar-enhancements/issue.md) — paused; its tools re-plan onto this note.
- Today's toolbar, in [the dev-tools folder](../../../../../../agent-ks-engine/src/dev-tools): [the integration that registers the apps](../../../../../../agent-ks-engine/src/dev-tools/integration.ts), [the layout selector](../../../../../../agent-ks-engine/src/dev-tools/layout-selector/index.ts), [the error logger](../../../../../../agent-ks-engine/src/dev-tools/error-logger/index.ts), [the cache inspector](../../../../../../agent-ks-engine/src/dev-tools/cache-inspector/index.ts), [the browser cache](../../../../../../agent-ks-engine/src/dev-tools/browser-cache/index.ts), [system metrics](../../../../../../agent-ks-engine/src/dev-tools/system-metrics/index.ts), and [the shared styles](../../../../../../agent-ks-engine/src/dev-tools/_shared/styles.ts).

# 04 Decisions

- Decided (claude, under sidhantha's delegation, 2026-09-30): the tools in section 03 are the ones that come back (question 04).

- Decided (sidhantha, 2026-09-29): the dev toolkit, its toolbar, cache clearing and the other dev tools are Phase 2. Phase 1 is rendering only.
- Decided (sidhantha, 2026-09-29): the toolkit holds the switch for editing mode.
- Decided (sidhantha, 2026-09-30): the toolkit is a bar, like Astro's dev toolbar. Its Edit option makes an editable page's content editable in place; raw and live preview are the two editing modes.

# 05 Notes & Analysis

## 01 What it looks like

- A slim bar at the bottom of the screen, over the page, with one button per tool and the Edit option first.
- One tool panel open at a time, above the bar. Escape closes it.
- The bar can be collapsed to a small handle, so it never covers content a reader needs. Its state (collapsed or open, the last tool) is kept in local storage with the other UI state.
- It follows the theme variables and the UX standards like any layout, with its own class prefix so page CSS and toolbar CSS never mix ([theming and layouts](./04_theming-and-layouts.md)).
- On a phone it becomes a single button that opens the tool list.

## 02 The Edit option

| Page | Edit shows as |
|---|---|
| Editable (Rust marks it so in the manifest) | A button. On: the page becomes editable, with a raw / live preview switch and a save status (saved, saving, failed) beside it |
| Not editable (a generated index, an artifact, a library element) | Disabled, with a tooltip saying why |

Turning Edit on loads the editor code on demand, so a page that is only read never pays for it. The full behaviour is in [editor engines](./03_editor-engines.md).

## 03 The tools

Today's Astro toolbar has six apps, about 1,800 lines, all tied to Astro's toolbar host. None moves across as code; each is rebuilt or dropped.

| Today's app | Job today | Recommendation |
|---|---|---|
| editor | The separate live editor page | **Replaced** by the Edit option |
| error-logger | Content errors and warnings for the page | **Rebuild as "Problems".** Rust runs the same checks as the CLI (frontmatter, links, prefixes, config) and pushes the results; the tool lists them by file and line. It is the most useful tool for a human reviewing an AI's work |
| layout-selector | Switch layout style, theme and light or dark mode live | **Rebuild, smaller.** A theme and display-mode preview for this browser only. Switching layouts per section for real is a config change the AI makes |
| cache-inspector | Show the server's in-memory caches | **Rebuild as "Cache"**, over Rust's index and build cache: sizes, entries per kind, and a clear button for this project's build cache |
| browser-cache | Show and clear the browser's stored state | **Fold into "Cache"**: the IndexedDB page cache and the local-storage UI state, each clearable |
| system-metrics | CPU and memory of the dev server | **Keep, small.** The Rust server's memory and CPU, with the page's own memory where the browser exposes it. It matters while the new engine's footprint is being proven |

**Cache clearing** has two sides and both stay:

- The toolbar clears **this project's** build cache and **this browser's** cache.
- `agentks cache status` and `agentks cache clean <root>` manage the **machine's** caches and libraries across projects, after a report ([the Rust CLI](../02_engine/05_rust-cli.md)). The toolbar never deletes anything outside the project.

## 04 How the tools get their data

Every tool uses the `/api` WebSocket. There is no second channel and no dev HTTP API: today's `/api/dev/*` and `/__editor/*` routes go away.

| Tool | Messages (working names) |
|---|---|
| Problems | Pull `dev.problems` for the current page or the whole project; push when the list changes |
| Cache | Pull `dev.cache.stats`; `dev.cache.clear` for this project's build cache |
| System | Pull `dev.metrics` while the panel is open, about every two seconds; nothing while it is closed |
| Theme preview | No server call. It swaps the theme stylesheet URL and the `data-theme` attribute in this browser |

The message format belongs to [the sync engine and server](../02_engine/04_sync-engine-and-server.md). The server answers `dev.*` messages only on the local server, which listens on localhost.

## 05 Never in a published site

- The toolbar code lives in the client app's `devtoolbar/` folder, not in `agentks-ui`. The static renderer imports only `agentks-ui`, so the toolbar cannot reach a published page by accident. It is left out at build time, not hidden with CSS.
- In the local tool (states 1 and 2) the toolbar is always available, because both are development environments ([the client](./02_client-application.md)).
- Content marked dev-only follows the same line: Rust leaves it out of the static build, and the local client shows it with a badge ([2025-06-25-dev-only-content](../../../2025-06-25-dev-only-content/issue.md)).

## 06 Not extensible

Users cannot add toolbar tools. The later extensions stage may add site scripts, but not toolbar tools, unless that stage decides otherwise ([extensions](../04_ecosystem/03_extensions.md)).

## 07 Open


Tracked in [open questions and risks](../01_overview/05_open-questions-and-risks.md).
