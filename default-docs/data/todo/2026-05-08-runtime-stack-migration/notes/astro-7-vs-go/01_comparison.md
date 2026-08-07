---
title: "Astro 7 against the Go runtime — a comparison"
---

# Astro 7 against the Go runtime

This note compares two options. Option A is an upgrade to Astro 7. Option B is the Go
runtime this issue proposes. The note uses Simplified Technical English.

The comparison uses eleven items. The maintainer chose these items. They are not a
general list of framework qualities. They are the things that matter for this project.

## How to read this note

Each row gives one item. Each row says what Astro 7 does. Each row says what Go does.
The last column names the better option.

Some numbers are measurements. Some numbers are estimates. Each cell says which.
The measurements come from [the migration audit](../../agent-log/010_au_migration-feasibility-rescope/01_summary.md).

**One warning about the measurements.** The audit measured the Astro **development**
server. It did not measure Astro in **production server** mode. Nobody has measured that
mode. Three rows below depend on it. Those rows say so.

## The versions

| Item | Value |
|---|---|
| Astro today | 5.17.1 |
| Astro 7 | 7.2.0, released 2026-08-06 |
| Astro 7 needs | Vite 8, Node 22.12 or later |
| Node here | 24.16.0 — this is high enough |
| Go runtime | No code exists yet |

## The comparison

| # | Item | Astro 7 | Go runtime | Better |
|---|---|---|---|---|
| 1 | **RAM** | The development server uses 874 MB after 24 minutes (measured on Astro 5). Astro 7 does not change the memory design. Vite 8 uses a Rust bundler, so development memory can fall. We did not measure this. Production server mode is unknown. | A Go server holds the whole content set in 13.9 MB (measured). A full server needs 20 MB to 40 MB (estimate). | **Go** |
| 2 | **Live reload and partial builds** | Astro gives hot reload only in development mode. Astro has no partial build. `astro build` always builds every page. This takes 14.76 s for 1,229 pages (measured). Astro 7 makes the full build faster. It does not make it partial. | You write the file watcher. The server sends changes over SSE. There is no build step at all. The server renders a changed file on the next request in 0.54 ms (measured). Your folder-hash idea fits this design. | **Go** |
| 3 | **Size** | `node_modules` is 419 MB (measured). You share one Bun install, so you pay this one time. | The binary is 21 MB (measured with a real `go build`). The embedded web assets add 6.1 MB compressed. | **Not a factor** — you share the install |
| 4 | **Page load time** | A static page needs no server work. The browser must still load 64,938 bytes of theme CSS on **every** page. This is 46.2% of the whole site (measured). The browser also loads 22 KB to 42 KB of JavaScript. | The server answers in 0.54 ms (measured, warm). The browser load is **the same**, because the CSS and the JavaScript are yours, not the framework's. | **Equal in the browser. Go on the server.** Fix the CSS first — it helps both options |
| 5 | **Application start time** | The development server starts in 1.81 s to 1.91 s (measured). A static site needs no start. A production Node server takes 0.3 s to 1 s (estimate — not measured). | The server starts in 7.8 ms when the disk cache is warm. It starts in 142 ms when the cache is cold (both measured). | **Go** |
| 6 | **Multi-user editing** | Yjs is the reference CRDT library. It is JavaScript. It is mature. The server owns the shared document today and it works. | Go cannot run Yjs. Two Go ports exist. Both are young — `reearth/ygo` has 34 stars and started in 2025. **You can instead run a small Node process for sync only.** Size is not a problem, so this cost is low. | **Astro 7** — unless you use the Node helper process. Then the two are **equal** |
| 7 | **Smoothness and control** | Your code runs inside the Astro request cycle and the Vite module graph. Vite can split your cache state between two contexts. This caused the bug that started this issue. Astro 6.3.4 and later contain an upstream fix. We did not verify that fix for our case. | One process. One module graph. You own the router, the cache and the storage format. Go finds shared-state faults with the `-race` tool. | **Go** |
| 8 | **Customization — external HTML layouts** | A user layout is a real component. Vite compiles it. It can read framework data, call `loadFile` and `loadIssues`, and run server code. Vite bundles its JavaScript for free. | A user layout is a template file. The server reads it at start. No build step is needed, so it is easier to install. But the template **cannot run server code**. It can only use data the engine gives it. Its JavaScript is not bundled. | **Astro 7** — Go is easier to install but less powerful |
| 9 | **Content rendering quality** | Shiki uses the same grammar files as VS Code. It writes light and dark colours in one page. Dark mode needs no re-render. This is the best quality available. | Chroma uses hand-written rules. They are less exact. Chroma cannot write two colour themes in one page. You must write a custom output formatter of 150 to 250 lines. Chroma is **not** always faster — one page takes 22.0 ms against Shiki's 13.4 ms (measured). | **Astro 7** — quality falls if you move to Go |
| 10 | **Production-like feel** | Development mode and production mode use **two different code paths**. The config line is `output: isDev ? 'server' : 'static'`. The two paths already disagree. A missing page returns a full styled page in development. The built site has no 404 page at all (both measured). | One binary. `serve` and `build` call the same handler. Development equals production by design. | **Go** |
| 11 | **Caching** | The cache lives in module state and uses file times. The dependency tracking does not work — the code stores the data and never reads it (measured, zero call sites). | You own the cache. Keep it in memory and key it on a content hash. A full rebuild of all content takes 7.8 ms, so you do not need to save the cache to disk. | **Go** |
| 12 | **Flexibility — how easily you add UI options** | You have 10 layout styles today across 6 slots. To **add a style**, you drop a folder into the external layouts directory. It overrides a built-in style of the same name. You edit no framework file. To **add a new content type**, you must edit three central files. `import.meta.glob` needs literal strings, so the registry holds 9 hard-coded glob pairs. Astro 7 keeps this limit. | To **add a style**, you drop a template folder. The server scans the directory when it starts. There is no build step and no literal-string limit. To **add a new content type**, the planned design lets a structure register itself. You edit no central file. **But you must build that registry first. It is not free.** | **Split — see below** |
| 13 | **Start time and first page, after you fix the code** | The server is ready in 378 ms (measured, 3 runs). The first request to `/todo` takes **3,207 ms** (measured). This is not the boot. It is the index loader, which renders all 861 tracker files to build a table that shows only titles and statuses. Astro 7 does **not** change this — Rolldown bundles JavaScript, and this path reads files and renders markdown. **The fix is in your code.** | The server boots in 142 ms cold and 7.8 ms warm (measured). The same index fix gives a 12.4 ms structural walk (measured). | **See the measurement below — the gap almost disappears** |

## Item 13 is the surprise: the fix matters, the language does not

The comparison people expect here is wrong. We benchmarked the frontmatter-only index
walk — the work the fix substitutes for body rendering — in both languages.

| Step, over 1,038 markdown files | JavaScript (Bun) | Go |
|---|---|---|
| Directory walk | 2.4 ms | 3.1 ms |
| 4 KB head read plus frontmatter parse | 12.6 ms | 9.0 ms |
| **Index total** | **~15 ms** | **12.4 ms** |

**There is no meaningful gap.** Bun reads files quickly. The 3,207 ms does not come from
file input or from frontmatter parsing. It comes from `marked` and `shiki`, which render
861 document bodies that the index never shows.

The four options, end to end:

| Option | Boot | First `/todo` | Total |
|---|---|---|---|
| Today, Astro 5 | 378 ms | 3,207 ms | ~3.6 s |
| Astro 7, no code fix | ~378 ms | ~3,200 ms | **~3.6 s — no change** |
| Astro 7 plus the fix | 378 ms | ~100–200 ms (estimate) | **~0.5 s** |
| Go plus Vite 8 plus the fix | 142 ms | ~35 ms | **~0.16 s** |

Every cell is measured except the third row's first-request figure. That one is assembled
from measured parts. Nobody has run a patched loader yet.

**The conclusion. Speed is not a reason to move to Go.** The code fix removes about 90% of
the wait, and it costs days. Go then saves a further 0.35 s, and both results are fast
enough. Astro 7 changes nothing on this item.

**Go still wins items 1, 2, 10 and 11** — memory, live reload with partial builds,
production-like feel, and cache control. The fix does not touch those. They are the real
case for Go.

## Flexibility needs two answers, not one

Item 12 does not have one winner. The answer depends on what you extend.

| What you want to do | Astro 7 | Go | Better |
|---|---|---|---|
| Switch between UI options that already exist | Easy | Easy | Equal |
| Add a new layout style | Drop a folder. No framework edit | Drop a folder. No build step either | **Go**, slightly |
| Add a new content type | Edit 3 central files | The structure registers itself — **if you build the registry** | **Go by design** |
| Build a **complex** layout | Components, typed properties, shared parts, free JavaScript bundle | Template includes only. Weaker than components. No free bundle | **Astro 7** |
| Switch the layout live while you work | The developer toolbar does this today | You must build a new user interface for it | **Astro 7** today |

**The short rule. Simple customization gets easier with Go. Complex customization gets
harder.**

The reason is one Vite rule: `import.meta.glob` accepts only literal strings. This forces
the 9 hard-coded glob pairs you have today. A Go server scans directories when it starts,
so the rule does not apply. This is a real gain, and it is the same smell the
[structure and layout separation note](../architecture-update/01_the-structure.md) already
describes.

## The result

| Winner | Items |
|---|---|
| **Go** | RAM · live reload and partial builds · start time · smoothness and control · production-like feel · caching — **6 items** |
| **Astro 7** | multi-user editing · external layouts · rendering quality — **3 items** |
| **Equal or not a factor** | size · page load in the browser · start time **after the code fix** — **3 items** |
| **Split** | flexibility — Go for simple work, Astro 7 for complex work — **1 item** |

Go wins six of the thirteen items. These six are the items the maintainer named as problems.

**But read item 13 before you use item 5.** Raw boot favours Go by 48 times. After you fix
the index loader, the practical wait is 0.5 s against 0.16 s. Both are fast. Speed stops
being a reason to move.

## What you pay for Go

You must accept four costs. Each cost is real. None is fatal.

1. **Syntax colours get worse.** Chroma is less exact than Shiki. You must also write a
   custom formatter to keep dark mode working without a re-render.
2. **External layouts get weaker.** A user template cannot run server code. It gets no
   free JavaScript bundle. Simple layouts are easier. Complex layouts are not possible.
3. **You must decide the CRDT question.** Use a Node helper process for editing and keep
   Yjs. Do not bet shared editing on a young Go library.
4. **The best flexibility gain is conditional.** A structure that registers itself removes
   the central switch. But that registry is design work you must finish first. If you skip
   it, you rebuild the same central switch in Go and gain nothing.

## What you should do before you decide

**Measure Astro in production server mode.** This takes about two days.

Install `@astrojs/node`. Set `output: 'server'`. Then measure the RAM, the start time and
the first-byte time. Three rows in the table above depend on this number and nobody has it.

The audit measured `astro dev` and called it "Astro". For a person who wants a production
server, that was the wrong comparison.

**Also fix the theme CSS first.** Do not inline 64,938 bytes into every page. Link it
instead. This helps both options and it is not migration work.

## Cross-references

- [the migration audit](../../agent-log/010_au_migration-feasibility-rescope/01_summary.md)
  — the measurements this note uses
- [the Go and Vite architecture](../architecture/01_overview.md) — the proposed design
- [the performance comparison](../architecture/06_performance-comparison.md) — **its
  numbers are wrong**; see the audit
- [the Astro 6 research](../../brainstorm/03_research_astro-6-upgrade/01_overview.md) —
  the earlier upgrade study. It was rejected because this issue was the adopted plan. The
  audit says do not schedule this issue, so that reason no longer holds.
