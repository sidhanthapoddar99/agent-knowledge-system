---
title: "Migration shape — phases, ordering, effort estimate"
sidebar_label: "03 · Migration"
---

# Migration shape — how this gets done

Astro → Go + Vite is not a small refactor. This note captures the shape of the work as discussed, so the future subtask split has a starting frame.

## Headline number

**~14–18 engineer-weeks for one focused engineer**, or 8–10 weeks split across two if work parallelises cleanly. Plus a 2–4 week stabilisation tail (real users on the binary, bug bash).

This is the same ballpark as a full Next.js migration's *upper* bound. Go + Vite is more work but the result is structurally cleaner and the ongoing maintenance burden drops.

## Phases

### Phase 1 — Go runtime core (4–5 weeks)

- HTTP server (axum-of-Go = `chi` or stdlib `net/http`)
- Config loader (`site.yaml`, `navbar.yaml`, `footer.yaml`, alias resolution, two-phase `paths.ts` equivalent)
- Markdown pipeline (`goldmark` + `chroma` for syntax highlighting + custom extensions for our tags)
- Layout selector (`@<type>/<style>` resolution, built-in + user override)
- Theme loader (theme.yaml inheritance, CSS file resolution)
- File watcher (`fsnotify`, hot-reload via SSE to browser)
- Issue tracker loader (folder-per-item walk, settings.json, frontmatter, agent-log/comments parsing)
- Git-derived `updated` cache (the thing that started this whole thread)

**Exit criteria:** Go binary serves `default-docs/data/user-guide/` correctly, with theme switching, hot-reload, and issue tracker working. No Vite yet — pure Go-rendered HTML.

### Phase 2 — Vite frontend + island integration (3–4 weeks)

- Set up Vite project under `frontend/`
- Pick island framework (Svelte / Preact / Vanilla TS — see `04_support.md`)
- Port the interactive surfaces:
  - Issues filter bar + table sort + pagination
  - Sidebar persistence (localStorage)
  - Outline scroll-spy
  - Dark/light theme toggle
  - Dev toolbar (system metrics, cache inspector, layout selector — these are dev-only, optional)
- `vite build` → `dist/` → embedded into Go binary via `//go:embed`
- Go's HTML templates reference hashed JS/CSS bundles from the embedded FS

**Exit criteria:** every interactive feature that today exists in Astro works in the Go-served pages.

### Phase 3 — Live editor (3–5 weeks)

This is the riskiest phase because the editor is dense.

Two sub-options:

- **3a — Port to Go**: y-go for Yjs server-side, CodeMirror stays as a JS island, presence/SSE/auto-save handled in Go. Keeps the single-binary story.
- **3b — Defer to `2026-04-26-editor-as-standalone-product`**: ship the v1 binary without the editor; treat the editor as its own Tauri+Rust product (already its own issue). Docs framework just renders content.

Decision deferred — option 3a is cleaner if y-go is mature enough; otherwise 3b.

**Exit criteria:** either the editor works inside the Go binary, or the editor is explicitly out of scope for v1 with a clean handoff to its own issue.

### Phase 4 — Distribution + plugin upgrade (2–3 weeks)

- Cross-compile matrix (darwin-arm64, linux-amd64, linux-arm64, windows-amd64)
- `goreleaser` setup for GitHub releases + checksums + Homebrew tap
- Install script (`curl … | sh` + PowerShell variant for Windows)
- Docker base image + skill-generated Dockerfile (lifted from `2026-04-26-framework-as-cli-tool`)
- Plugin upgrade — the 11 bash wrappers become subcommands of the binary; SKILL.md + reference files updated. See `notes/claude-plugin-upgrade/`.

**Exit criteria:** `curl … | sh` produces a working `doc-engine` on a fresh machine; running it in `default-docs/` boots the site.

### Phase 5 — Stabilisation (2–4 weeks)

Real users running the binary on real projects. Bug bash. Performance tuning if needed. Documentation pass.

## Risk surface

| Risk | Mitigation |
|---|---|
| **Markdown rendering mismatches** between unified/remark/rehype (today) and goldmark (Go) | Snapshot tests on a fixture corpus; render side-by-side during phase 1; document any deliberate divergences |
| **Theme CSS regressions** from no-Vite-bundling | The contract is variable-based; if the variable contract is honoured, regressions should be near-zero. Snapshot screenshots help. |
| **y-go maturity** for editor backend | Either prove y-go fits in a 1-week spike during phase 3, or fall back to plan 3b (editor stays JS, served by Go HTTP) |
| **CodeMirror integration** breaks when its bundle is served from `embed.FS` instead of Vite dev | This is just static asset serving — should be a non-issue, but worth a phase 2 spike |
| **Issue tracker frontmatter parsing** has subtle YAML quirks | The current `_lib.mjs` plugin code is the spec; port it carefully; cross-validate with `docs-list --json` output |

## Ordering rationale

Phase 1 first because every other phase depends on Go-rendered HTML existing. Phase 2 second because that's where end-user value lands (interactivity). Phase 3 last among the "must ships" because it's the biggest unknown. Phase 4+5 are launch + tail.

## What does *not* change

- The user's `default-docs/` folder shape (see `02_architecture.md`).
- The tracker schema (vocabulary, settings.json shape, agent-log/comments format).
- The skill-and-reference set in `documentation-guide` plugin (file paths, just subcommand renaming — see `notes/claude-plugin-upgrade/`).
- The two-mode operation (consumer-mode where framework is sub-folder; dogfood-mode where framework IS the project) — this gets simpler in Go because there's no `astro-doc-code/` anymore. Single binary is the framework.

## What we'd cut from v1

- Anything that today is dev-toolbar-only and not load-bearing for content authoring (system metrics, cache inspector — these are debugging UI; rebuild later if needed).
- Editor, if going with plan 3b.
- Plugin runtime / extensibility (deferred to `2025-06-25-plugin-system`).
- Multi-tenancy / shared-cache machine semantics.

## What's not negotiable

- Theme contract (`required_variables` in `theme.yaml`) — port verbatim.
- Two-phase path init + `@root` alias semantics — port verbatim.
- Tracker derived-`updated` correctness — the eager-incremental design from `2026-05-08-update-date-time-optimization` should land in Go from day one.
