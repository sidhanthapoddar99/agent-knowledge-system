## Goal

Replace the Astro runtime with a **Go HTTP server that embeds a Vite-built frontend bundle**, distributed as a single cross-compiled binary. End-state: `doc-engine serve` (or whatever the rebrand lands on) starts a production-grade server in any folder containing a `default-docs/` tree — no Node, no `node_modules/`, no Vite at runtime.

This issue is the **discussion + design capture**. Implementation subtasks land once the team commits to the migration — the one exception is the **architecture-update** design work (see `subtasks/01`), which is pure design and can proceed now.

## Why

Direct trigger: SSR module isolation in Vite 6 silently splits module-level state between plugin and SSR contexts, leaving the cache stuck on stale data after watcher events. Couldn't fix it cleanly inside Astro. See `notes/discussion/05_issue.md`.

Broader motivation: zero runtime dependencies for end users, ~25 MB binary instead of ~250 MB `node_modules/`, sub-100 ms cold start, predictable production behaviour, and a clean substrate for future features (CRDT collab, search index, plugin runtime). See `notes/architecture/`.

## Notes

- **`notes/architecture-update/`** — the **structure / layout / theme / shell** separation model (added 2026-06-09). Decouples the overloaded `type` into four orthogonal axes; structures self-register their URL + parsing rules so a per-structure change never touches a central switch. The design work to formalize it is `subtasks/01`. **This is the conceptual backbone the Go rewrite should be built on.**
- **`notes/discussion/`** — Q&A from the conversation that produced this design.
  - Framework comparison (Astro / Next.js / Go+Vite / 100 % Rust)
  - Architecture survival (site.yaml, themes, layouts, custom pages)
  - Migration shape and effort estimate
  - Support model (what users install, dev vs author UX, Windows)
  - The triggering issue (Vite SSR module isolation)
- **`notes/architecture/`** — proposed Go + Vite design.
  - Runtime/build/render-time split
  - What Go owns
  - What Vite produces and how it gets embedded
  - Single-binary distribution mechanics
  - How runtime config (site.yaml, themes, layouts, custom pages) stays user-editable
  - Performance comparison — current prod/dev vs Go+Vite prod/dev
- **`notes/claude-plugin-upgrade/`** — how `documentation-guide` plugin evolves once the binary ships.
  - The 11 bash wrappers collapse into binary subcommands
  - Skill + reference updates
  - Slash commands stay; plugin gets thinner
- **`notes/deployment-methods/`** — lifted-and-condensed from `2026-04-26-framework-as-cli-tool`.
  - Three usage methods (CLI / from-source / Docker)
  - Docker topologies
  - Distribution channels (curl-installer, Homebrew, GitHub releases, container registry)

## Related

- **`2026-04-26-framework-as-cli-tool`** — proposed the CLI binary as a packaging layer over Astro+Bun. This issue extends that direction: the binary doesn't just *spawn* the framework, it **is** the framework.
- **`2026-04-26-editor-as-standalone-product`** — Tauri + Rust core for the editor. Compatible: Go runtime serves docs/blog/issues; Rust editor binary handles live-editing as its own process.
- **`2026-05-08-update-date-time-optimization`** — the cache that started the SSR-isolation thread. The Go architecture eliminates the bug class entirely (single process, single module instance, no Vite SSR graph).
- **`2025-06-25-plugin-system`** — once the runtime is Go, the plugin contract changes. Worth re-reading after migration is committed.
