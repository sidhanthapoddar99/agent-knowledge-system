---
title: "The package boundary — engine vs consumer, and the dev-tools question"
---

# The package boundary — what ships vs what the consumer owns

The load-bearing decision under the npm-package branch: draw the line between **engine** (ships
in the package) and **consumer-owned** (lives in each docs project). Every other subtask
depended on this call, so it's worth capturing what the deliberation settled — much of it
survives the pivot, just reframed as "binary + embedded `dist/` vs the user's `default-docs/`."

## The clean split (uncontested)

| Side | Contents |
|---|---|
| **Engine** | `src/loaders/`, `src/parsers/`, `src/layouts/` (all variants), `src/styles/` (default theme + `theme.yaml` contract), `src/custom-tags/`, `src/pages/` routing, the Astro integration entry point |
| **Consumer** | `dynamic_data/` (content + config + assets + themes), `.env`, a 5-line `astro.config.mjs`, a one-dep `package.json`, a minimal `tsconfig.json` extending the engine's |

The insight that made this concrete arrived *before* any packaging: comment
`001_framework-extraction-step1` physically moved framework code into `astro-doc-code/` and
left the repo root as the consumer's view. That split — `frameworkRoot` (where `src/` lives)
vs `projectRoot` (where content lives) — is the package boundary drawn on disk. It shipped,
went green, and is foundational **regardless of distribution shape**. The Go runtime inherits
the exact same seam: embedded `dist/` = engine, on-disk `default-docs/` = consumer.

## The grey areas — where the thinking actually happened

The boundary's easy 80% wasn't the interesting part. These were:

| Question | Leaning | Reasoning |
|---|---|---|
| `src/dev-tools/` (live editor, Yjs, cache-inspector, system-metrics) | **Engine** | Dev-only — never in `astro build` output, so the only cost is `node_modules` weight, not bundle weight. Consumer benefit outweighs it. |
| The framework's own `user-guide/` docs | **Engine repo only**, shipped as an *example consumer* — not injected into every consumer's `dynamic_data/` | It's a reference site, not shared content. |
| Default theme (`src/styles/`) | **Engine**; consumers consume via the contract, can override | The `theme.yaml → required_variables` contract is the API. |
| `package.json` `scripts:` | **Both** — engine ships defaults, consumer can override | The integration must not dictate how the consumer runs Astro. |
| Agent-skill helper scripts | **Already separate** — owned by the plugin, different distribution | Never was in scope. |

## The dev-tools split — a decision worth its own subtask

`src/dev-tools/` is the heaviest, most "framework-y" part (CodeMirror 6 + Yjs CRDT + websockets
+ gray-matter). Does it ship in the main package, or split out? Three options were weighed:

- **A — all-in-one.** One install, no version-skew, matches current DX. Cost is only
  `node_modules` weight (dev-tools are dev-only). *Recommended.*
- **B — sibling `documentation-template-dev` package.** Leaner engine, but a two-package
  coordination tax: versions must track, integration must gracefully no-op when the dev package
  is absent. More docs surface.
- **C — plugin-style two integrations under one package.** Clean opt-in
  (`integrations: [docTemplate(), docTemplateDevTools()]`) but more API surface than the simple
  single-integration story.

**Verdict: A**, with a `disableDevTools` integration flag as the escape hatch — operational
simplicity wins for a framework with 30 consumers, and the Yjs/WebSocket weight (~few MB) is
noise next to Astro's own dep tree. Revisit only if dev-tools grow much heavier (graph view,
AI panel). One open flag noted: the Yjs sync picks a WebSocket port at dev-server startup;
running 3 framework instances at once risks a collision — document it, add a port option only
if it bites.

**Why this survived the pivot:** the same question ("does the editor ship *with* the runtime or
as its own process?") is live in the Go world too — and it cross-references
`2026-04-26-editor-as-standalone-product` (Tauri + Rust editor as a separate binary). The
answer shifted (the Go issue leans toward the editor as a standalone process), but the
*question* transferred whole.
